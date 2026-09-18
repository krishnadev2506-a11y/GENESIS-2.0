import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type ChallengePhase = 'feature' | 'situation';

export interface IChallengeDefinition extends Document {
  phase: ChallengePhase;
  title: string;
  problem: string;
  mission?: string;
  specialRequirement?: string;
  oneLineSolution: string;
  judgeCheck: string;
  difficulty: number;
  logicalId?: string;
  weight?: number;
  before?: string;
  solutionDirection?: string;
  after?: string;
  metric?: string;
  metricExplanation?: string;
  category?: string;
  catalogVersion?: string;
  keywords: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeDefinitionSchema = new Schema<IChallengeDefinition>(
  {
    phase: { type: String, enum: ['feature', 'situation'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    problem: { type: String, required: true, trim: true },
    mission: { type: String, trim: true },
    specialRequirement: { type: String, trim: true },
    oneLineSolution: { type: String, required: true, trim: true },
    judgeCheck: { type: String, required: true, trim: true },
    difficulty: { type: Number, required: true, min: 1, max: 10 },
    logicalId: { type: String, trim: true, index: true },
    weight: { type: Number, min: 1 },
    before: { type: String, trim: true },
    solutionDirection: { type: String, trim: true },
    after: { type: String, trim: true },
    metric: { type: String, trim: true },
    metricExplanation: { type: String, trim: true },
    category: { type: String, trim: true },
    catalogVersion: { type: String, trim: true },
    keywords: { type: [String], default: [] },
    enabled: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ChallengeDefinitionSchema.index({ phase: 1, title: 1 }, { unique: true });

const ChallengeDefinition: Model<IChallengeDefinition> =
  mongoose.models.ChallengeDefinition || mongoose.model<IChallengeDefinition>('ChallengeDefinition', ChallengeDefinitionSchema);

export default ChallengeDefinition;
