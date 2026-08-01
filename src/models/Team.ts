import mongoose, { Schema, Document, Model } from 'mongoose';

// ----- Station Scores -----

export interface IStationScores {
  debugArena: number;
  systemDesignSprint: number;
  codeReviewChallenge: number;
  aiEngineeringChallenge: number;
  deploymentSprint: number;
  mockTechnicalInterview: number; // Legacy field — kept for data compatibility
}

// ----- Team Member -----

export interface ITeamMember {
  name: string;
  role: string;
  email: string;
  phone?: string;
  college?: string;
  semester?: string;
  isLeader: boolean;
}

// ----- Team -----

export interface ITeam extends Document {
  teamName: string;
  route: 'foundation';
  college?: string;
  semester?: string;
  contactNumber?: string;
  email: string;
  members: ITeamMember[];
  paymentScreenshotUrl: string;
  paymentScreenshotPublicId: string;
  transactionId: string;
  paymentStatus: 'pending_verification' | 'verified' | 'rejected';
  registrationStatus: 'submitted' | 'confirmed';
  amountPaid: number;
  checkedIn: boolean;
  checkedInAt: Date | null;
  credentials: { username: string; passwordHash: string; temporaryPassword?: string } | null;
  stationScores: IStationScores;
  scoreboardPoints: number;
  mustResetPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ----- Sub-schemas -----

const StationScoresSchema = new Schema<IStationScores>(
  {
    debugArena: { type: Number, default: 0 },
    systemDesignSprint: { type: Number, default: 0 },
    codeReviewChallenge: { type: Number, default: 0 },
    aiEngineeringChallenge: { type: Number, default: 0 },
    deploymentSprint: { type: Number, default: 0 },
    mockTechnicalInterview: { type: Number, default: 0 },
  },
  { _id: false }
);

const TeamMemberSchema = new Schema<ITeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  college: { type: String },
  semester: { type: String },
  isLeader: { type: Boolean, default: false },
});

// ----- Main schema -----

const TeamSchema = new Schema<ITeam>(
  {
    teamName: { type: String, required: true, unique: true },
    route: { type: String, enum: ['foundation'], required: true, default: 'foundation' },
    college: { type: String },
    semester: { type: String },
    contactNumber: { type: String },
    email: { type: String, required: true },
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
    amountPaid: { type: Number, default: 0 },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    credentials: {
      username: { type: String },
      passwordHash: { type: String },
      temporaryPassword: { type: String },
    },
    stationScores: {
      type: StationScoresSchema,
      default: () => ({
        debugArena: 0,
        systemDesignSprint: 0,
        codeReviewChallenge: 0,
        aiEngineeringChallenge: 0,
        deploymentSprint: 0,
        mockTechnicalInterview: 0,
      }),
    },
    scoreboardPoints: { type: Number, default: 0 },
    mustResetPassword: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
TeamSchema.index({ 'credentials.username': 1 });
TeamSchema.index({ email: 1 });
TeamSchema.index({ paymentStatus: 1 });
TeamSchema.index({ createdAt: -1 });
TeamSchema.index({ 'members.email': 1 });
TeamSchema.index({ route: 1 });
TeamSchema.index({ route: 1, scoreboardPoints: -1 }); // Leaderboard queries per route

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
