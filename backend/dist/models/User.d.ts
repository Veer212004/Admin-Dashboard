import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    authorizationState?: 'active' | 'suspended';
    roleChangeRequest?: {
        status: 'pending' | 'approved' | 'rejected';
        requestedRole?: 'user' | 'admin';
        requestedBy?: string;
        requestedAt?: Date;
    };
    profile: {
        avatarUrl?: string;
        phone?: string;
        meta?: Record<string, any>;
    };
    settings: {
        theme?: 'light' | 'dark';
        sidebarType?: 'full' | 'mini' | 'hidden';
        layout?: 'vertical' | 'horizontal';
        container?: 'full' | 'boxed';
        cardStyle?: 'shadow' | 'border';
        direction?: 'ltr' | 'rtl';
        compactSpacing?: boolean;
        animations?: boolean;
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map