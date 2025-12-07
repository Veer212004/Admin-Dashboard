import mongoose, { Schema, Document } from 'mongoose';

export interface IBroadcastMessage extends Document {
  title: string;
  message: string;
  filter?: {
    role?: string;
    verified?: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  meta?: Record<string, any>;
}

const broadcastMessageSchema = new Schema<IBroadcastMessage>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    filter: {
      role: String,
      verified: Boolean,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

broadcastMessageSchema.index({ createdAt: -1 });
broadcastMessageSchema.index({ createdBy: 1 });

export const BroadcastMessage = mongoose.model<IBroadcastMessage>(
  'BroadcastMessage',
  broadcastMessageSchema
);
