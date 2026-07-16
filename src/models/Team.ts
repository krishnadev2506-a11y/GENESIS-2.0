import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeamMember {
  name: string;
  role: string;
  email: string;
  phone?: string;
  college?: string;
  semester?: string;
  foodPreference?: 'veg' | 'non-veg';
  isLeader: boolean;
}

export interface ITeam extends Document {
  teamName: string;
  college?: string;
  semester?: string;
  contactNumber?: string;
  email: string;
  foodPreference?: 'veg' | 'non-veg';
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
}

const TeamMemberSchema = new Schema<ITeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  college: { type: String },
  semester: { type: String },
  foodPreference: { type: String, enum: ['veg', 'non-veg'] },
  isLeader: { type: Boolean, default: false },
});

const TeamSchema = new Schema<ITeam>(
  {
    teamName: { type: String, required: true, unique: true },
    college: { type: String },
    semester: { type: String },
    contactNumber: { type: String },
    email: { type: String, required: true },
    foodPreference: { type: String, enum: ['veg', 'non-veg'] },
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
  },
  { timestamps: true }
);

// BUG FIX: Indexes MUST be defined on the schema BEFORE calling mongoose.model().
// Previously they were defined after model creation inside an if-block that was
// never entered after the first module load, so indexes were never registered.
TeamSchema.index({ 'credentials.username': 1 });
TeamSchema.index({ email: 1 });
TeamSchema.index({ paymentStatus: 1 });
TeamSchema.index({ createdAt: -1 });
TeamSchema.index({ teamName: 1 }); // Fast duplicate check
TeamSchema.index({ 'members.email': 1 }); // Fast cross-team duplicate member check

// Compound Text Index for fast admin search
TeamSchema.index(
  {
    teamName: 'text',
    email: 'text',
    college: 'text',
    contactNumber: 'text',
    'members.name': 'text',
    'members.email': 'text',
    'members.phone': 'text',
  },
  {
    name: 'team_search_text_idx',
    weights: {
      teamName: 10,
      email: 5,
      college: 3,
    },
  }
);

const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

export default Team;
