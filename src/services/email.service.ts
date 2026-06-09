import nodemailer from 'nodemailer';
import { OTP_EXPIRY_MINUTES } from '../utils/otp';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  sendOtpEmail = async (
    to: string,
    otp: string,
    fullName?: string,
  ): Promise<void> => {
    const name = fullName || 'User';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Botify</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #1f2937; margin-bottom: 10px;">Hello, ${name}!</h2>
            <p style="color: #6b7280; margin-bottom: 25px;">Your verification code is:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p style="color: #9ca3af; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Botify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Botify" <noreply@botify.com>',
        to,
        subject: 'Your verification code',
        html,
        text: `Hello ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this code, please ignore this email.`,
      });
      console.log(`OTP email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send OTP email to ${to}:`, error);
      throw error;
    }
  };
}

export default new EmailService();
