import mongoose, { Document } from 'mongoose';
export interface IRefreshToken extends Document {
    user: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
}
export declare const RefreshToken: mongoose.Model<IRefreshToken, {}, {}, {}, mongoose.Document<unknown, {}, IRefreshToken, {}, {}> & IRefreshToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RefreshToken.d.ts.map