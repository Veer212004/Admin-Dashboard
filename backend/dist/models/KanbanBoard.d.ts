import mongoose, { Document } from 'mongoose';
export interface IKanbanBoard extends Document {
    title: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const KanbanBoard: mongoose.Model<IKanbanBoard, {}, {}, {}, mongoose.Document<unknown, {}, IKanbanBoard, {}, {}> & IKanbanBoard & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=KanbanBoard.d.ts.map