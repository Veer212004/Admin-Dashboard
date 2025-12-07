import mongoose, { Schema, Document } from 'mongoose';

export interface IKanbanBoard extends Document {
  title: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const kanbanBoardSchema = new Schema<IKanbanBoard>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

kanbanBoardSchema.index({ owner: 1 });

export const KanbanBoard = mongoose.model<IKanbanBoard>('KanbanBoard', kanbanBoardSchema);
