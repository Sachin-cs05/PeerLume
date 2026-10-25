import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface EmailService {
  sendVerificationEmail(to: string, token: string, fullName: string): Promise<boolean>;
  sendPasswordResetEmail(to: string, token: string, fullName: string): Promise<boolean>;
}

class DevelopmentEmailService implements EmailService {
  async sendVerificationEmail(to: string, token: string, fullName: string): Promise<boolean> {
    const verifyUrl = `${env.APP_BASE_URL}/verify-email?token=${token}`;
    logger.info(`📧 [DEV EMAIL SINK - Verification]`);
    logger.info(`   To: ${fullName} <${to}>`);
    logger.info(`   Action: Email Verification`);
    logger.info(`   Link: ${verifyUrl}`);
    logger.info(`   Token expires in 24 hours`);
    return true;
  }

  async sendPasswordResetEmail(to: string, token: string, fullName: string): Promise<boolean> {
    const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${token}`;
    logger.info(`📧 [DEV EMAIL SINK - Password Reset]`);
    logger.info(`   To: ${fullName} <${to}>`);
    logger.info(`   Action: Password Reset`);
    logger.info(`   Link: ${resetUrl}`);
    logger.info(`   Token expires in 15 minutes`);
    return true;
  }
}

class SmtpEmailService implements EmailService {
  private transporter: Transporter;
  private fromAddress: string;

  constructor() {
    const port = Number(env.SMTP_PORT) || 587;
    const cleanPass = (env.SMTP_PASS || '').replace(/\s+/g, '');

    this.fromAddress = (env.EMAIL_FROM || `PeerLearn <${env.SMTP_USER}>`).replace(/^["']|["']$/g, '');

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: env.SMTP_USER,
        pass: cleanPass,
      },
    });

    logger.info(`📬 [EMAIL] SmtpEmailService initialized for host ${env.SMTP_HOST || 'smtp.gmail.com'}:${port} (user: ${env.SMTP_USER})`);
  }

  async sendVerificationEmail(to: string, token: string, fullName: string): Promise<boolean> {
    const verifyUrl = `${env.APP_BASE_URL}/verify-email?token=${token}`;
    const subject = 'Verify your email for PeerLearn';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); text-align: center; border-bottom: 1px solid #3730a3;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">PeerLearn</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #a5b4fc; letter-spacing: 0.5px;">Learn Together. Grow Together.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #ffffff;">Verify Your Email Address</h2>
              <p style="margin: 0 0 16px;">Hello <strong style="color: #ffffff;">${fullName || 'there'}</strong>,</p>
              <p style="margin: 0 0 24px;">Welcome to PeerLearn! To complete your registration and activate your student account, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}" target="_blank" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.45); transition: background-color 0.2s ease;">Verify Email Address</a>
              </div>

              <p style="margin: 24px 0 8px; font-size: 13px; color: #94a3b8;">If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="margin: 0 0 24px; font-size: 12px; word-break: break-all; color: #818cf8; background-color: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #1e293b;">
                <a href="${verifyUrl}" style="color: #818cf8; text-decoration: none;">${verifyUrl}</a>
              </p>

              <p style="margin: 0; font-size: 13px; color: #94a3b8;">⏳ <em>This verification link will expire in 24 hours.</em></p>
              <p style="margin: 12px 0 0; font-size: 13px; color: #64748b;">If you did not sign up for a PeerLearn account, you can safely ignore this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} PeerLearn. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `Hello ${fullName || 'there'},\n\nWelcome to PeerLearn! Please verify your email address by visiting this link:\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can ignore this email.`;

    try {
      logger.info(`📧 [EMAIL] Sending verification email to ${to}...`);
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      logger.info(`✅ [EMAIL] Verification email sent successfully to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (error) {
      logger.error(`❌ [EMAIL] Failed to send verification email to ${to}:`, error);
      // Fallback log for development convenience
      logger.info(`🔗 [DEV FALLBACK] Verification link: ${verifyUrl}`);
      return false;
    }
  }

  async sendPasswordResetEmail(to: string, token: string, fullName: string): Promise<boolean> {
    const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${token}`;
    const subject = 'Reset your password for PeerLearn';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); text-align: center; border-bottom: 1px solid #3730a3;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">PeerLearn</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #a5b4fc; letter-spacing: 0.5px;">Learn Together. Grow Together.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #ffffff;">Reset Your Password</h2>
              <p style="margin: 0 0 16px;">Hello <strong style="color: #ffffff;">${fullName || 'there'}</strong>,</p>
              <p style="margin: 0 0 24px;">We received a request to reset the password for your PeerLearn account. Click the button below to choose a new password:</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.45); transition: background-color 0.2s ease;">Reset Password</a>
              </div>

              <p style="margin: 24px 0 8px; font-size: 13px; color: #94a3b8;">If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="margin: 0 0 24px; font-size: 12px; word-break: break-all; color: #818cf8; background-color: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #1e293b;">
                <a href="${resetUrl}" style="color: #818cf8; text-decoration: none;">${resetUrl}</a>
              </p>

              <p style="margin: 0; font-size: 13px; color: #94a3b8;">⏳ <em>This password reset link will expire in 15 minutes.</em></p>
              <p style="margin: 12px 0 0; font-size: 13px; color: #64748b;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} PeerLearn. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `Hello ${fullName || 'there'},\n\nWe received a request to reset your PeerLearn password. Visit this link to set a new password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.`;

    try {
      logger.info(`📧 [EMAIL] Sending password reset email to ${to}...`);
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      logger.info(`✅ [EMAIL] Password reset email sent successfully to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (error) {
      logger.error(`❌ [EMAIL] Failed to send password reset email to ${to}:`, error);
      logger.info(`🔗 [DEV FALLBACK] Password reset link: ${resetUrl}`);
      return false;
    }
  }
}

// Select appropriate service based on config
function createEmailService(): EmailService {
  if (
    env.NODE_ENV !== 'test' &&
    env.EMAIL_PROVIDER === 'smtp' &&
    Boolean(env.SMTP_USER) &&
    Boolean(env.SMTP_PASS)
  ) {
    return new SmtpEmailService();
  }
  return new DevelopmentEmailService();
}

export const emailService: EmailService = createEmailService();
