import mongoose, { Document } from 'mongoose';
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
export declare const BroadcastMessage: mongoose.Model<IBroadcastMessage, {}, {}, {}, mongoose.Document<unknown, {}, IBroadcastMessage, {}, {}> & IBroadcastMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=BroadcastMessage.d.ts.map