import mongoose, { Schema, Document } from 'mongoose';
import { connectDB } from './db';

interface IRateLimitEntry extends Document {
  key: string;       // IP address or identifier
  count: number;
  resetAt: Date;     // TTL field — MongoDB will auto-delete the document after this time
}

const RateLimitSchema = new Schema<IRateLimitEntry>({
  key: { type: String, required: true, unique: true, index: true },
  count: { type: Number, required: true, default: 1 },
  resetAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
});

const RateLimitModel =
  mongoose.models.RateLimit ||
  mongoose.model<IRateLimitEntry>('RateLimit', RateLimitSchema);

interface RateLimitOptions {
  maxRequests: number;   // e.g. 5
  windowMs: number;      // e.g. 15 * 60 * 1000 (15 minutes in ms)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Persistent, DB-backed rate limiter using MongoDB TTL indexes.
 * Survives serverless cold starts, unlike in-memory Maps.
 */
export async function checkRateLimit(
  key: string,
  { maxRequests, windowMs }: RateLimitOptions
): Promise<RateLimitResult> {
  await connectDB();

  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    // Try to find and increment an existing entry
    const entry = await RateLimitModel.findOneAndUpdate(
      { key },
      {
        $inc: { count: 1 },
        $setOnInsert: { resetAt }, // Only set resetAt on first insert
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const count = entry.count;
    const allowed = count <= maxRequests;
    const remaining = Math.max(0, maxRequests - count);

    return { allowed, remaining, resetAt: entry.resetAt };
  } catch (error: any) {
    // If there's a duplicate key error due to a race condition, just re-fetch
    if (error.code === 11000) {
      const entry = await RateLimitModel.findOne({ key });
      if (entry) {
        const count = entry.count + 1;
        await RateLimitModel.updateOne({ key }, { $inc: { count: 1 } });
        return {
          allowed: count <= maxRequests,
          remaining: Math.max(0, maxRequests - count),
          resetAt: entry.resetAt,
        };
      }
    }
    // On DB error, fail open (allow the request) to avoid locking users out
    console.error('[RateLimit] DB error, failing open:', error);
    return { allowed: true, remaining: maxRequests, resetAt };
  }
}
