import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  qrCodeImageUrl: string;
  qrCodeImagePublicId: string;
  eventDate: Date;
  eventEndDate: Date;
  registrationOpen: boolean;
  entryFee: number;
  extraMemberFee: number;
  baseTeamSize: number;
  maxTeamSize: number;
  registrationReceivedEmailTemplate: string;
  registrationConfirmedEmailTemplate: string;
}

interface ISettingsModel extends Model<ISettings> {
  getSettings(): Promise<ISettings>;
}

const SettingsSchema = new Schema<ISettings>(
  {
    qrCodeImageUrl: { type: String, default: '' },
    qrCodeImagePublicId: { type: String, default: '' },
    eventDate: { type: Date, default: new Date('2026-07-10T00:00:00Z') },
    eventEndDate: { type: Date, default: new Date('2026-07-11T23:59:59Z') },
    registrationOpen: { type: Boolean, default: true },
    entryFee: { type: Number, default: 600 },
    extraMemberFee: { type: Number, default: 125 },
    baseTeamSize: { type: Number, default: 4 },
    maxTeamSize: { type: Number, default: 6 },
    registrationReceivedEmailTemplate: { 
      type: String, 
      default: 'Dear {{teamName}},\n\nYour registration for GENESIS 2.0 has been received successfully! Our team is currently reviewing your payment details. You will receive another email with your dashboard login credentials once your payment is verified.\n\nThank you,\nGENESIS 2.0 Team' 
    },
    registrationConfirmedEmailTemplate: { 
      type: String, 
      default: 'Dear {{teamName}},\n\nYour payment has been successfully verified! You are officially registered for GENESIS 2.0.\n\nYou can now log in to the dashboard to manage your team.\n\nUsername: {{username}}\nPassword: {{password}}\n\nPlease keep these credentials safe.\n\nSee you at the event!\nGENESIS 2.0 Team' 
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
