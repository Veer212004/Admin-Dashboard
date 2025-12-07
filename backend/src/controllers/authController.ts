import { Request, Response } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { ActivityLog } from '../models/ActivityLog';
import { Notification } from '../models/Notification';
import { RefreshToken } from '../models/RefreshToken';
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  verifyVerificationToken,
  saveRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
} from '../utils/token';
import { emailService } from '../services/EmailService';
import { socketManager } from '../utils/socket';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = new User({
      name,
      email,
      password,
      verified: false,
    });

    await user.save();

    const verificationToken = generateVerificationToken(email);
    const emailEnabled = Boolean(process.env.SMTP_HOST);
    
    // Send verification email asynchronously so SMTP problems do not block registration
    emailService.sendVerificationEmail(email, verificationToken).catch((error) => {
      console.error('❌ Verification email failed (non-blocking):', error instanceof Error ? error.message : error);
      console.error('Full error:', error);
    });

    await ActivityLog.create({
      actor: user._id,
      action: 'REGISTER',
      target: user._id.toString(),
    });

    await Notification.create({
      title: 'Welcome',
      message: 'Your account has been created. Please verify your email.',
      user: user._id,
    });

    res.status(201).json({
      message: emailEnabled
        ? 'User registered successfully. Verification email sent.'
        : 'User registered. Email verification token provided for manual verification.',
      userId: user._id,
      verificationToken: emailEnabled ? undefined : verificationToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.verified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    const verificationToken = generateVerificationToken(email);
    const emailEnabled = Boolean(process.env.SMTP_HOST);

    // Send verification email asynchronously so SMTP problems do not block response
    emailService.sendVerificationEmail(email, verificationToken).catch((error) => {
      console.warn('Resend verification email failed (non-blocking):', error instanceof Error ? error.message : error);
    });

    res.json({
      message: emailEnabled
        ? 'Verification email resent. Please check your inbox.'
        : 'Verification token provided. Use it to verify your email.',
      verificationToken: emailEnabled ? undefined : verificationToken,
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, email } = req.body;

    const payload = verifyVerificationToken(token);
    if (!payload) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    // Email can come from token payload or request body
    const userEmail = payload.email || email;
    if (!userEmail) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOneAndUpdate({ email: userEmail }, { verified: true }, { new: true });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await ActivityLog.create({
      actor: user._id,
      action: 'EMAIL_VERIFIED',
      target: user._id.toString(),
    });

    await Notification.create({
      title: 'Email Verified',
      message: 'Your email has been verified successfully.',
      user: user._id,
    });

    socketManager.emitUserUpdated(user._id.toString(), { verified: true });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.role === 'user' && !user.verified) {
      res.status(403).json({ message: 'Verify email' });
      return;
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await saveRefreshToken(user._id.toString(), refreshToken);

    user.lastLoginAt = new Date();
    await user.save();

    await ActivityLog.create({
      actor: user._id,
      action: 'LOGIN',
      target: user._id.toString(),
    });

    socketManager.emitPresenceUpdate(user._id.toString(), true);

    res.json({
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const isValid = await isRefreshTokenValid(refreshToken);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const { verifyRefreshToken } = await import('../utils/token');
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await saveRefreshToken(user._id.toString(), newRefreshToken);
    await revokeRefreshToken(refreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    if (req.userId) {
      await ActivityLog.create({
        actor: req.userId,
        action: 'LOGOUT',
        target: req.userId,
      });

      socketManager.emitPresenceUpdate(req.userId, false);

      await Session.updateMany(
        { user: req.userId, endedAt: null },
        { endedAt: new Date() }
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      lastLoginAt: user.lastLoginAt,
      settings: user.settings,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const resetToken = generateVerificationToken();
    // Fire-and-forget password reset email to avoid blocking in case SMTP is unreachable
    emailService.sendPasswordResetEmail(email, resetToken).catch((error) => {
      console.warn('Password reset email failed (non-blocking):', error instanceof Error ? error.message : error);
    });

    await ActivityLog.create({
      actor: user._id,
      action: 'FORGOT_PASSWORD',
      target: user._id.toString(),
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
