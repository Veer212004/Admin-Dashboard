import nodemailer, { Transporter } from 'nodemailer';
import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isInitialized = false;
  private sendgridConfigured = false;

  constructor() {
    console.log('[EmailService] EmailService instance created');
    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    
    if (sendgridApiKey) {
      console.log('[EmailService] Initializing SendGrid...');
      try {
        sgMail.setApiKey(sendgridApiKey);
        this.sendgridConfigured = true;
        console.log('[EmailService] ✓ SendGrid initialized successfully');
      } catch (error) {
        console.error('[EmailService] ✗ SendGrid initialization failed:', error);
        this.sendgridConfigured = false;
      }
    } else {
      console.log('[EmailService] SendGrid not configured. Will use SMTP fallback.');
    }
  }

  private initializeTransporter() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    
    if (!smtpHost || !smtpUser) {
      console.warn('[EmailService] ⚠️ SMTP not configured. Email functionality disabled.');
      return;
    }
    
    console.log('[EmailService] Initializing SMTP...');
    console.log('[EmailService] SMTP_HOST:', smtpHost);
    console.log('[EmailService] SMTP_USER:', smtpUser);
    
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const isGmail = smtpHost.includes('gmail');
    
    // Use port 587 with STARTTLS (standard) or 465 with SSL
    const useSSL = smtpPort === 465;
    
    console.log('[EmailService] Configuring SMTP - Port:', smtpPort, 'SSL:', useSSL);
    
    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: useSSL, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: process.env.SMTP_PASS,
        },
        // Gmail-specific settings
        ...(isGmail && {
          service: 'gmail',
        }),
        // Optimize timeouts for faster failure detection
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
        // TLS settings for port 587
        tls: { 
          rejectUnauthorized: false, // Allow self-signed certs for testing
          minVersion: 'TLSv1.2',
        },
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production',
      });

      // Test connection immediately
      this.transporter.verify()
        .then(() => {
          console.log('[EmailService] ✓ SMTP connection verified successfully');
        })
        .catch((err) => {
          console.error('[EmailService] ✗ SMTP verification failed:', err?.message);
          console.error('[EmailService] Note: This is expected on Render (SMTP ports blocked)');
          // Don't null the transporter - let individual sends fail gracefully
        });
    } catch (error) {
      console.error('[EmailService] ✗ SMTP initialization error:', error);
      this.transporter = null;
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    // Try SendGrid first (works on all platforms including Render)
    if (this.sendgridConfigured) {
      try {
        console.log(`[EmailService] Sending email via SendGrid to ${options.to}...`);
        const msg = {
          to: options.to,
          from: process.env.EMAIL_FROM || 'noreply@meandashboard.local',
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject,
        };
        
        const result = await sgMail.send(msg);
        console.log(`[EmailService] ✓ Email sent successfully via SendGrid`);
        return;
      } catch (error: any) {
        console.error('[EmailService] ✗ SendGrid send failed:', error?.message);
        console.error('[EmailService] Falling back to SMTP...');
        // Fall through to SMTP fallback
      }
    }

    // Fallback to SMTP (for localhost development)
    this.initializeTransporter();
    
    if (!this.transporter) {
      console.warn('[EmailService] ⚠️ Email disabled: No email provider configured. Skipping send.');
      return;
    }

    try {
      console.log(`[EmailService] Attempting to send email via SMTP to ${options.to}...`);
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@meandashboard.local',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log(`[EmailService] ✓ Email sent successfully via SMTP:`, result.messageId);
    } catch (error: any) {
      console.error('[EmailService] ✗ Email send failed:', error?.message);
      if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNECTION') {
        console.error('[EmailService] Connection timeout - SMTP likely blocked by hosting platform');
      }
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Get frontend URL - always prefer production URL when available
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    // If multiple URLs (comma-separated), always use the first non-localhost URL for emails
    if (frontendUrl.includes(',')) {
      const urls = frontendUrl.split(',').map(url => url.trim());
      // Always prefer production URL (non-localhost) for email links
      frontendUrl = urls.find(url => !url.includes('localhost')) || urls[0];
    }
    
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    console.log('[EmailService] Verification URL:', verificationUrl);
    console.log('[EmailService] Environment:', process.env.NODE_ENV);
    console.log('[EmailService] Selected frontend URL:', frontendUrl);
    
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

  async sendRoleChangeEmail(email: string, newRole: string): Promise<void> {
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

  async sendBroadcastMessage(email: string, title: string, message: string): Promise<void> {
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

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Get frontend URL - always prefer production URL when available
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    // If multiple URLs (comma-separated), always use the first non-localhost URL for emails
    if (frontendUrl.includes(',')) {
      const urls = frontendUrl.split(',').map(url => url.trim());
      // Always prefer production URL (non-localhost) for email links
      frontendUrl = urls.find(url => !url.includes('localhost')) || urls[0];
    }
    
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

export const emailService = new EmailService();
