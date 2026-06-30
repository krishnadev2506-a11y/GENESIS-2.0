import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  scope: 'broadcast' | 'team' | 'participant';
  targetTeamId: mongoose.Types.ObjectId | null;
  targetParticipantEmail: string | null;
  subject: string;
  body: string;
  sentAt: Date;
  sentByAdminId: mongoose.Types.ObjectId;
  read: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    scope: { type: String, enum: ['broadcast', 'team', 'participant'], required: true },
    targetTeamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    targetParticipantEmail: { type: String, default: null },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    sentByAdminId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
