import mongoose, { Schema, Document } from 'mongoose';

export interface IKanbanCard extends Document {
  title: string;
  description: string;
  column: 'todo' | 'inprogress' | 'onhold' | 'completed';
  assignees: mongoose.Types.ObjectId[];
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  boardId: mongoose.Types.ObjectId;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const kanbanCardSchema = new Schema<IKanbanCard>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    column: {
      type: String,
      enum: ['todo', 'inprogress', 'onhold', 'completed'],
      default: 'todo',
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'KanbanBoard',
      required: true,
    },
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

kanbanCardSchema.index({ boardId: 1, column: 1 });
kanbanCardSchema.index({ assignees: 1 });

export const KanbanCard = mongoose.model<IKanbanCard>('KanbanCard', kanbanCardSchema);
