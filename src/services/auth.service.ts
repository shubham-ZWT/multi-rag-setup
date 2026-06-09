import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import crypto from 'crypto';
import AppError from '../utils/appError';
import EmailService from './email.service';
import {
  generateOtp,
  hashOtp,
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRY_MINUTES,
  RESEND_COOLDOWN_SECONDS,
} from '../utils/otp';

class AuthService {
  register = async (email: string, password: string, fullName: string) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: Role.USER,
        isVerified: false,
      },
    });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        userId: user.id,
        otpHash,
        purpose: 'registration',
        expiresAt,
      },
    });

    try {
      await EmailService.sendOtpEmail(email, otp, fullName);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
    }

    console.log('Registered user:', { email, fullName });
    return {
      message:
        'Registration successful. Please check your email for the verification code.',
      userId: user.id,
    };
  };

  login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
      const error = new AppError(
        'Please verify your email before logging in',
        403,
      ) as any;
      error.requiresVerification = true;
      error.userId = user.id;
      throw error;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1h',
      },
    );
    console.log('Logging in user:', { email });
    return { message: 'User logged in successfully', token };
  };

  verifyOtp = async (userId: string, otp: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' },
      );
      return { message: 'Email already verified', token };
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        userId,
        purpose: 'registration',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError(
        'No verification code found. Please request a new one.',
        404,
      );
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.emailOtp.deleteMany({
        where: { userId, purpose: 'registration' },
      });
      throw new AppError(
        'Too many failed attempts. Please request a new verification code.',
        429,
      );
    }

    const submittedHash = hashOtp(otp);
    if (submittedHash !== otpRecord.otpHash) {
      await prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError('Invalid verification code', 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    await prisma.emailOtp.deleteMany({
      where: { userId, purpose: 'registration' },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' },
    );

    return { message: 'Email verified successfully', token };
  };

  resendOtp = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email is already verified', 400);
    }

    const recentOtps = await prisma.emailOtp.findMany({
      where: {
        userId,
        purpose: 'registration',
        createdAt: {
          gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
    });

    if (recentOtps.length > 0) {
      const retryAfter =
        RESEND_COOLDOWN_SECONDS -
        Math.floor((Date.now() - recentOtps[0].createdAt.getTime()) / 1000);
      const error = new AppError(
        'Please wait before requesting a new code',
        429,
      ) as any;
      error.retryAfter = retryAfter;
      throw error;
    }

    await prisma.emailOtp.deleteMany({
      where: { userId, purpose: 'registration' },
    });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        userId,
        otpHash,
        purpose: 'registration',
        expiresAt,
      },
    });

    try {
      await EmailService.sendOtpEmail(
        user.email,
        otp,
        user.fullName || undefined,
      );
    } catch (error) {
      console.error('Failed to send OTP email:', error);
    }

    return { message: 'Verification code sent to your email' };
  };

  forgotPassword = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000),
      },
    });
    console.log('Password reset requested for user:', { email });
    return {
      message: 'Password reset token generated successfully',
      resetToken,
    };
  };

  resetPassword = async (newPassword: string, resetToken: string) => {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    console.log('Password reset for user:', { email: user.email });
    return { message: 'Password reset successfully' };
  };
}

export default new AuthService();
