import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import crypto from 'crypto';
import AppError from '../utils/appError';

class AuthService {
  register = async (email: string, password: string, fullName: string) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: Role.USER,
      },
    });
    console.log('Registered user:', { email, fullName });
    return { message: 'User registered successfully' };
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
        resetPasswordExpires: new Date(Date.now() + 3600000), // Token valid for 1 hour
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
