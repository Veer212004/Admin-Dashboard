import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  socketId: string;
  startedAt: Date;
  endedAt?: Date;
  ip?: string;
  device?: string;
  meta?: Record<string, any>;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    socketId: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    ip: String,
    device: String,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, startedAt: -1 });
sessionSchema.index({ startedAt: -1 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
