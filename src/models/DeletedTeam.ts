import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITeamMember } from './Team';

export interface IDeletedTeam extends Document {
  teamName: string;
  college: string;
  semester: string;
  contactNumber: string;
  email: string;
  foodPreference: 'veg' | 'non-veg';
  members: ITeamMember[];
  paymentScreenshotUrl: string;
  paymentScreenshotPublicId: string;
  transactionId: string;
  paymentStatus: 'pending_verification' | 'verified' | 'rejected';
  registrationStatus: 'submitted' | 'confirmed';
  checkedIn: boolean;
  checkedInAt: Date | null;
  credentials: { username: string; passwordHash: string; temporaryPassword?: string } | null;
  scoreboardPoints: number;
  mustResetPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  semester: { type: String, required: true },
  foodPreference: { type: String, enum: ['veg', 'non-veg'], required: true },
  isLeader: { type: Boolean, default: false },
});

const DeletedTeamSchema = new Schema<IDeletedTeam>(
  {
    teamName: { type: String, required: true },
    college: { type: String, required: true },
    semester: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    foodPreference: { type: String, enum: ['veg', 'non-veg'], required: true },
    members: [TeamMemberSchema],
    paymentScreenshotUrl: { type: String, required: true },
    paymentScreenshotPublicId: { type: String, required: true },
    transactionId: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending_verification', 'verified', 'rejected'],
      default: 'pending_verification',
    },
    registrationStatus: {
      type: String,
      enum: ['submitted', 'confirmed'],
      default: 'submitted',
    },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    credentials: {
      username: { type: String },
      passwordHash: { type: String },
      temporaryPassword: { type: String },
    },
    scoreboardPoints: { type: Number, default: 0 },
    mustResetPassword: { type: Boolean, default: true },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Keeps original timestamps if provided during creation
);

const DeletedTeam: Model<IDeletedTeam> = mongoose.models.DeletedTeam || mongoose.model<IDeletedTeam>('DeletedTeam', DeletedTeamSchema);

export default DeletedTeam;
