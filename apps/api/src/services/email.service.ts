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

export const emailService: EmailService = new DevelopmentEmailService();
