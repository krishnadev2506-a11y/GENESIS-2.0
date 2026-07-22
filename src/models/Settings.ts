import mongoose, { Schema, Document, Model } from 'mongoose';

// ----- Sub-document interfaces -----

export interface ITeamSizePricing {
  standardPrice: number;
  earlyBirdDiscountPercent: number;
}

export interface IPricing {
  team4: ITeamSizePricing;
  team5: ITeamSizePricing;
  team6: ITeamSizePricing;
}

export interface IThemeRelease {
  title: string;
  tagline: string;
  description: string;
  releaseDate: Date | null;
  published: boolean;
}

export interface IPrizePool {
  foundation: string;
  professional: string;
}

// ----- Main Settings interface -----

export interface ISettings extends Document {
  // Existing fields
  qrCodeImageUrl: string;
  qrCodeImagePublicId: string;
  rulebookUrl: string;
  rulebookPublicId: string;
  eventDate: Date;
  eventEndDate: Date;
  registrationOpen: boolean;
  registrationReceivedEmailTemplate: string;
  registrationConfirmedEmailTemplate: string;

  // Pricing (replaces old entryFee / extraMemberFee / baseTeamSize / maxTeamSize)
  earlyBirdEnabled: boolean;
  pricing: IPricing;

  // Food
  foodEnabled: boolean;

  // Theme Release (one per route)
  themeFoundation: IThemeRelease;
  themeProfessional: IThemeRelease;

  // Prize Pool
  prizePool: IPrizePool;
}

interface ISettingsModel extends Model<ISettings> {
  getSettings(): Promise<ISettings>;
}

// ----- Sub-schemas -----

const TeamSizePricingSchema = new Schema<ITeamSizePricing>(
  {
    standardPrice: { type: Number, required: true },
    earlyBirdDiscountPercent: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const ThemeReleaseSchema = new Schema<IThemeRelease>(
  {
    title: { type: String, default: '' },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    releaseDate: { type: Date, default: null },
    published: { type: Boolean, default: false },
  },
  { _id: false }
);

const PrizePoolSchema = new Schema<IPrizePool>(
  {
    foundation: { type: String, default: 'Will be released soon..' },
    professional: { type: String, default: 'Will be released soon..' },
  },
  { _id: false }
);

// ----- Main schema -----

const SettingsSchema = new Schema<ISettings>(
  {
    // Existing
    qrCodeImageUrl: { type: String, default: '' },
    qrCodeImagePublicId: { type: String, default: '' },
    rulebookUrl: { type: String, default: '' },
    rulebookPublicId: { type: String, default: '' },
    eventDate: { type: Date, default: new Date('2026-07-10T00:00:00Z') },
    eventEndDate: { type: Date, default: new Date('2026-07-11T23:59:59Z') },
    registrationOpen: { type: Boolean, default: true },
    registrationReceivedEmailTemplate: { 
      type: String, 
      default: 'Dear {{teamName}},\n\nYour registration for GENESIS has been received successfully! Our team is currently reviewing your payment details. You will receive another email with your dashboard login credentials once your payment is verified.\n\nThank you,\nGENESIS Team' 
    },
    registrationConfirmedEmailTemplate: { 
      type: String, 
      default: 'Dear {{teamName}},\n\nYour payment has been successfully verified! You are officially registered for GENESIS.\n\nYou can now log in to the dashboard to manage your team.\n\nUsername: {{username}}\nPassword: {{password}}\n\nPlease keep these credentials safe.\n\nSee you at the event!\nGENESIS Team' 
    },

    // Pricing
    earlyBirdEnabled: { type: Boolean, default: false },
    pricing: {
      type: {
        team4: { type: TeamSizePricingSchema, default: () => ({ standardPrice: 600, earlyBirdDiscountPercent: 20 }) },
        team5: { type: TeamSizePricingSchema, default: () => ({ standardPrice: 725, earlyBirdDiscountPercent: 20 }) },
        team6: { type: TeamSizePricingSchema, default: () => ({ standardPrice: 850, earlyBirdDiscountPercent: 20 }) },
      },
      default: () => ({
        team4: { standardPrice: 600, earlyBirdDiscountPercent: 20 },
        team5: { standardPrice: 725, earlyBirdDiscountPercent: 20 },
        team6: { standardPrice: 850, earlyBirdDiscountPercent: 20 },
      }),
    },

    // Food
    foodEnabled: { type: Boolean, default: true },

    // Theme Release
    themeFoundation: {
      type: ThemeReleaseSchema,
      default: () => ({
        title: 'Genesis – Foundation Track',
        tagline: 'Code. Break. Rebuild.',
        description: '',
        releaseDate: null,
        published: false,
      }),
    },
    themeProfessional: {
      type: ThemeReleaseSchema,
      default: () => ({
        title: 'Genesis 2.0 – Professional Engineering Track',
        tagline: 'Build. Deploy. Defend.',
        description: '',
        releaseDate: null,
        published: false,
      }),
    },
    prizePool: {
      type: PrizePoolSchema,
      default: () => ({
        foundation: 'Will be released soon..',
        professional: 'Will be released soon..',
      }),
    },
  },
  { timestamps: true }
);

SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = (mongoose.models.Settings as ISettingsModel) || mongoose.model<ISettings, ISettingsModel>('Settings', SettingsSchema);

export default Settings;
