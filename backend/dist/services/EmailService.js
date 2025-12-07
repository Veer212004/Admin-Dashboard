"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = null;
        this.enabled = false;
        console.log('[EmailService] EmailService instance created');
    }
    initializeTransporter() {
        if (this.transporter)
            return; // Already initialized
        this.enabled = Boolean(process.env.SMTP_HOST);
        console.log('[EmailService] SMTP_HOST:', process.env.SMTP_HOST);
        console.log('[EmailService] SMTP_PORT:', process.env.SMTP_PORT);
        console.log('[EmailService] SMTP_USER:', process.env.SMTP_USER);
        console.log('[EmailService] Email enabled:', this.enabled);
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: parseInt(process.env.SMTP_PORT || '587') === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Prevent long hangs when SMTP is unreachable
            connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '10000'),
            greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || '5000'),
            // Some providers (dev/test) may use self-signed certs
            tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' },
        });
        // Verify transporter connectivity asynchronously and update enabled flag
        // This prevents silent failures later when sending emails.
        this.transporter.verify()
            .then(() => {
            console.log('[EmailService] SMTP transporter verified');
            this.enabled = true;
        })
            .catch((err) => {
            console.error('[EmailService] SMTP transporter verification failed:', err && err.message ? err.message : err);
            // disable sending if verification fails
            this.enabled = false;
        });
    }
    async sendEmail(options) {
        this.initializeTransporter();
        if (!this.enabled) {
            console.warn('Email disabled: SMTP_HOST not set. Skipping send.');
            return;
        }
        try {
            console.log(`[EmailService] Sending email to ${options.to}...`);
            const result = await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@meandashboard.local',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            console.log(`[EmailService] Email sent successfully:`, result);
        }
        catch (error) {
            console.error('[EmailService] Email send failed:', error);
            throw error;
        }
    }
    async sendVerificationEmail(email, token) {
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',')[0].trim();
        const verificationUrl = `${frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
        await this.sendEmail({
            to: email,
            subject: 'Verify Your Email Address - Admin Dashboard Platform',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; color: #ffffff; margin: 0; }
            .content { padding: 40px 30px; }
            .welcome { font-size: 24px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
            .message { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); }
            .button:hover { box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4); }
            .link-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 20px 0; word-break: break-all; font-size: 14px; color: #6b7280; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { font-size: 14px; color: #6b7280; margin: 5px 0; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning-text { font-size: 14px; color: #92400e; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">🎯 Admin Dashboard Platform</h1>
            </div>
            <div class="content">
              <h2 class="welcome">Welcome Aboard! 🎉</h2>
              <p class="message">Thank you for joining <strong>Admin Dashboard Platform</strong>. We're excited to have you on board!</p>
              <p class="message">To get started, please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">✓ Verify Email Address</a>
              </div>
              <p class="message">Or copy and paste this link into your browser:</p>
              <div class="link-box">${verificationUrl}</div>
              <div class="warning">
                <p class="warning-text">⏰ This verification link will expire in 24 hours for security purposes.</p>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text"><strong>Admin Dashboard Platform</strong></p>
              <p class="footer-text">Your trusted platform for managing users and analytics</p>
              <p class="footer-text" style="color: #9ca3af; font-size: 12px; margin-top: 15px;">If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `Welcome to Admin Dashboard Platform! Please verify your email: ${verificationUrl}`,
        });
    }
    async sendRoleChangeEmail(email, newRole) {
        await this.sendEmail({
            to: email,
            subject: 'Role Updated - Admin Dashboard Platform',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; color: #ffffff; margin: 0; }
            .content { padding: 40px 30px; }
            .title { font-size: 24px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
            .message { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 20px; }
            .role-badge { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px 20px; border-radius: 20px; font-weight: 600; font-size: 18px; margin: 20px 0; }
            .info-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-text { font-size: 14px; color: #1e40af; margin: 0; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { font-size: 14px; color: #6b7280; margin: 5px 0; }
            .alert { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .alert-text { font-size: 14px; color: #991b1b; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">🎯 Admin Dashboard Platform</h1>
            </div>
            <div class="content">
              <h2 class="title">Role Update Notification 🔐</h2>
              <p class="message">Your account privileges have been updated on <strong>Admin Dashboard Platform</strong>.</p>
              <p class="message">Your new role is:</p>
              <div style="text-align: center;">
                <span class="role-badge">✨ ${newRole.toUpperCase()}</span>
              </div>
              <div class="info-box">
                <p class="info-text">💡 Your new permissions are now active. Please log out and log back in to see the changes.</p>
              </div>
              <div class="alert">
                <p class="alert-text">⚠️ If you did not request this change, please contact your administrator immediately.</p>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text"><strong>Admin Dashboard Platform</strong></p>
              <p class="footer-text">Your trusted platform for managing users and analytics</p>
              <p class="footer-text" style="color: #9ca3af; font-size: 12px; margin-top: 15px;">This is an automated notification email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `Admin Dashboard Platform - Your role has been changed to: ${newRole}`,
        });
    }
    async sendBroadcastMessage(email, title, message) {
        await this.sendEmail({
            to: email,
            subject: `${title} - Admin Dashboard Platform`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; color: #ffffff; margin: 0; }
            .content { padding: 40px 30px; }
            .title { font-size: 24px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
            .message-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; padding: 25px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            .message-text { font-size: 16px; color: #0c4a6e; line-height: 1.8; margin: 0; white-space: pre-wrap; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { font-size: 14px; color: #6b7280; margin: 5px 0; }
            .broadcast-badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">🎯 Admin Dashboard Platform</h1>
            </div>
            <div class="content">
              <div class="broadcast-badge">📢 BROADCAST MESSAGE</div>
              <h2 class="title">${title}</h2>
              <div class="message-box">
                <p class="message-text">${message}</p>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text"><strong>Admin Dashboard Platform</strong></p>
              <p class="footer-text">Your trusted platform for managing users and analytics</p>
              <p class="footer-text" style="color: #9ca3af; font-size: 12px; margin-top: 15px;">This is a broadcast message from your administrator.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `Admin Dashboard Platform - ${title}\n\n${message}`,
        });
    }
    async sendPasswordResetEmail(email, token) {
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',')[0].trim();
        const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        await this.sendEmail({
            to: email,
            subject: 'Password Reset Request - Admin Dashboard Platform',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; color: #ffffff; margin: 0; }
            .content { padding: 40px 30px; }
            .title { font-size: 24px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
            .message { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 20px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3); }
            .button:hover { box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4); }
            .link-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 20px 0; word-break: break-all; font-size: 14px; color: #6b7280; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { font-size: 14px; color: #6b7280; margin: 5px 0; }
            .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning-text { font-size: 14px; color: #991b1b; margin: 0; }
            .security-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">🎯 Admin Dashboard Platform</h1>
            </div>
            <div class="content">
              <div class="security-icon">🔒</div>
              <h2 class="title">Password Reset Request</h2>
              <p class="message">We received a request to reset the password for your <strong>Admin Dashboard Platform</strong> account.</p>
              <p class="message">Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">🔑 Reset Password</a>
              </div>
              <p class="message">Or copy and paste this link into your browser:</p>
              <div class="link-box">${resetUrl}</div>
              <div class="warning">
                <p class="warning-text">⏰ This password reset link will expire in 1 hour for security purposes.</p>
                <p class="warning-text" style="margin-top: 10px;">⚠️ If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text"><strong>Admin Dashboard Platform</strong></p>
              <p class="footer-text">Your trusted platform for managing users and analytics</p>
              <p class="footer-text" style="color: #9ca3af; font-size: 12px; margin-top: 15px;">For security, never share this link with anyone.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `Admin Dashboard Platform - Reset your password: ${resetUrl} (expires in 1 hour)`,
        });
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=EmailService.js.map