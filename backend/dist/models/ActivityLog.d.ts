import mongoose, { Document } from 'mongoose';
export interface IActivityLog extends Document {
    actor: mongoose.Types.ObjectId;
    action: string;
    target: string;
    meta?: Record<string, any>;
    createdAt: Date;
}
export declare const ActivityLog: mongoose.Model<IActivityLog, {}, {}, {}, mongoose.Document<unknown, {}, IActivityLog, {}, {}> & IActivityLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ActivityLog.d.ts.map