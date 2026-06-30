import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScheduleItem extends Document {
  day: 1 | 2;
  time: string;
  eventName: string;
  speaker: string | null;
  order: number;
}

const ScheduleItemSchema = new Schema<IScheduleItem>(
  {
    day: { type: Number, enum: [1, 2], required: true },
    time: { type: String, required: true },
    eventName: { type: String, required: true },
    speaker: { type: String, default: null },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

const ScheduleItem: Model<IScheduleItem> = mongoose.models.ScheduleItem || mongoose.model<IScheduleItem>('ScheduleItem', ScheduleItemSchema);

export default ScheduleItem;
