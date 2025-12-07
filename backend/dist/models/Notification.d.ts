import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    title: string;
    message: string;
    user?: mongoose.Types.ObjectId;
    type?: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
    meta?: Record<string, any>;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map