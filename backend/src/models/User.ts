import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    authorizationState: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    roleChangeRequest: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
      },
      requestedRole: {
        type: String,
        enum: ['user', 'admin'],
      },
      requestedBy: String,
      requestedAt: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    profile: {
      avatarUrl: String,
      phone: String,
      meta: Schema.Types.Mixed,
    },
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      sidebarType: {
        type: String,
        enum: ['full', 'mini', 'hidden'],
        default: 'full',
      },
      layout: {
        type: String,
        enum: ['vertical', 'horizontal'],
        default: 'vertical',
      },
      container: {
        type: String,
        enum: ['full', 'boxed'],
        default: 'full',
      },
      cardStyle: {
        type: String,
        enum: ['shadow', 'border'],
        default: 'shadow',
      },
      direction: {
        type: String,
        enum: ['ltr', 'rtl'],
        default: 'ltr',
      },
      compactSpacing: {
        type: Boolean,
        default: false,
      },
      animations: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
