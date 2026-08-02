import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate extends Document {
  teamId: mongoose.Types.ObjectId;
  memberIndex: number;
  memberName: string;
  eventId: string;
  fileUrl?: string;
  status: 'pending' | 'ready' | 'dispatched';
  dispatchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    memberIndex: { type: Number, required: true },
    memberName: { type: String, required: true },
    eventId: { type: String, required: true },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'ready', 'dispatched'],
      default: 'pending',
    },
    dispatchedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound unique index — prevents duplicate certs per member per event on re-runs
CertificateSchema.index({ teamId: 1, memberIndex: 1, eventId: 1 }, { unique: true });
CertificateSchema.index({ eventId: 1 });
CertificateSchema.index({ teamId: 1, status: 1 });

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default Certificate;
