import mongoose, { Document } from 'mongoose';
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
export declare const KanbanCard: mongoose.Model<IKanbanCard, {}, {}, {}, mongoose.Document<unknown, {}, IKanbanCard, {}, {}> & IKanbanCard & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=KanbanCard.d.ts.map