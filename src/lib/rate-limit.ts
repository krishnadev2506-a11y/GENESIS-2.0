export interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

const limiters = new Map<string, Map<string, { count: number; resetTime: number }>>();

export function rateLimit(options: RateLimiterOptions, identifier: string = 'global') {
  if (!limiters.has(identifier)) {
    limiters.set(identifier, new Map());
  }
  const store = limiters.get(identifier)!;

  return {
    check: (ip: string) => {
      const now = Date.now();
      const record = store.get(ip);

      if (!record) {
        store.set(ip, { count: 1, resetTime: now + options.windowMs });
        return { success: true, limit: options.max, remaining: options.max - 1, reset: now + options.windowMs };
      }

      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + options.windowMs;
        return { success: true, limit: options.max, remaining: options.max - 1, reset: record.resetTime };
      }

      if (record.count >= options.max) {
        return { success: false, limit: options.max, remaining: 0, reset: record.resetTime };
      }

      record.count++;
      return { success: true, limit: options.max, remaining: options.max - record.count, reset: record.resetTime };
    },
  };
}
