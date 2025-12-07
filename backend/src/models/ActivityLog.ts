import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  actor: mongoose.Types.ObjectId;
  action: string;
  target: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
