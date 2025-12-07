import mongoose, { Document } from 'mongoose';
export interface ISession extends Document {
    user: mongoose.Types.ObjectId;
    socketId: string;
    startedAt: Date;
    endedAt?: Date;
    ip?: string;
    device?: string;
    meta?: Record<string, any>;
}
export declare const Session: mongoose.Model<ISession, {}, {}, {}, mongoose.Document<unknown, {}, ISession, {}, {}> & ISession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Session.d.ts.map