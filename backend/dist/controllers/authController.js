"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.getCurrentUser = exports.logout = exports.refresh = exports.login = exports.verifyEmail = exports.resendVerification = exports.register = void 0;
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const ActivityLog_1 = require("../models/ActivityLog");
const Notification_1 = require("../models/Notification");
const token_1 = require("../utils/token");
const EmailService_1 = require("../services/EmailService");
const socket_1 = require("../utils/socket");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const user = new User_1.User({
            name,
            email,
            password,
            verified: false,
        });
        await user.save();
        const verificationToken = (0, token_1.generateVerificationToken)(email);
        const emailEnabled = Boolean(process.env.SMTP_HOST);
        // Send verification email asynchronously so SMTP problems do not block registration
        EmailService_1.emailService.sendVerificationEmail(email, verificationToken).catch((error) => {
            console.error('❌ Verification email failed (non-blocking):', error instanceof Error ? error.message : error);
            console.error('Full error:', error);
        });
        await ActivityLog_1.ActivityLog.create({
            actor: user._id,
            action: 'REGISTER',
            target: user._id.toString(),
        });
        await Notification_1.Notification.create({
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
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.verified) {
            res.status(400).json({ message: 'Email already verified' });
            return;
        }
        const verificationToken = (0, token_1.generateVerificationToken)(email);
        const emailEnabled = Boolean(process.env.SMTP_HOST);
        // Send verification email asynchronously so SMTP problems do not block response
        EmailService_1.emailService.sendVerificationEmail(email, verificationToken).catch((error) => {
            console.warn('Resend verification email failed (non-blocking):', error instanceof Error ? error.message : error);
        });
        res.json({
            message: emailEnabled
                ? 'Verification email resent. Please check your inbox.'
                : 'Verification token provided. Use it to verify your email.',
            verificationToken: emailEnabled ? undefined : verificationToken,
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.resendVerification = resendVerification;
const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.body;
        const payload = (0, token_1.verifyVerificationToken)(token);
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
        const user = await User_1.User.findOneAndUpdate({ email: userEmail }, { verified: true }, { new: true });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await ActivityLog_1.ActivityLog.create({
            actor: user._id,
            action: 'EMAIL_VERIFIED',
            target: user._id.toString(),
        });
        await Notification_1.Notification.create({
            title: 'Email Verified',
            message: 'Your email has been verified successfully.',
            user: user._id,
        });
        socket_1.socketManager.emitUserUpdated(user._id.toString(), { verified: true });
        res.json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyEmail = verifyEmail;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        if (user.role === 'user' && !user.verified) {
            res.status(403).json({ message: 'Verify email' });
            return;
        }
        const accessToken = (0, token_1.generateAccessToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, token_1.generateRefreshToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        await (0, token_1.saveRefreshToken)(user._id.toString(), refreshToken);
        user.lastLoginAt = new Date();
        await user.save();
        await ActivityLog_1.ActivityLog.create({
            actor: user._id,
            action: 'LOGIN',
            target: user._id.toString(),
        });
        socket_1.socketManager.emitPresenceUpdate(user._id.toString(), true);
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const isValid = await (0, token_1.isRefreshTokenValid)(refreshToken);
        if (!isValid) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        const { verifyRefreshToken } = await Promise.resolve().then(() => __importStar(require('../utils/token')));
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        const user = await User_1.User.findById(payload.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const newAccessToken = (0, token_1.generateAccessToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const newRefreshToken = (0, token_1.generateRefreshToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        await (0, token_1.saveRefreshToken)(user._id.toString(), newRefreshToken);
        await (0, token_1.revokeRefreshToken)(refreshToken);
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await (0, token_1.revokeRefreshToken)(refreshToken);
        }
        if (req.userId) {
            await ActivityLog_1.ActivityLog.create({
                actor: req.userId,
                action: 'LOGOUT',
                target: req.userId,
            });
            socket_1.socketManager.emitPresenceUpdate(req.userId, false);
            await Session_1.Session.updateMany({ user: req.userId, endedAt: null }, { endedAt: new Date() });
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.logout = logout;
const getCurrentUser = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.userId);
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
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCurrentUser = getCurrentUser;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const resetToken = (0, token_1.generateVerificationToken)();
        // Fire-and-forget password reset email to avoid blocking in case SMTP is unreachable
        EmailService_1.emailService.sendPasswordResetEmail(email, resetToken).catch((error) => {
            console.warn('Password reset email failed (non-blocking):', error instanceof Error ? error.message : error);
        });
        await ActivityLog_1.ActivityLog.create({
            actor: user._id,
            action: 'FORGOT_PASSWORD',
            target: user._id.toString(),
        });
        res.json({ message: 'Password reset email sent' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=authController.js.map