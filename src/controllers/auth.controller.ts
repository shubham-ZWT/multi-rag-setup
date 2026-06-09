import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res
      .status(400)
      .json({ error: 'Email, password, and full name are required' });
  }
  const result = await AuthService.register(email, password, fullName);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await AuthService.login(email, password);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    if (error.requiresVerification) {
      return res.status(403).json({
        error: error.message,
        requiresVerification: true,
        userId: error.userId,
      });
    }
    throw error;
  }
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ error: 'User ID and OTP are required' });
  }

  const result = await AuthService.verifyOtp(userId, otp);
  res.status(200).json({ success: true, ...result });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const result = await AuthService.resendOtp(userId);
  res.status(200).json(result);
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const result = await AuthService.forgotPassword(email);
    res.status(200).json({ success: true, ...result });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { resetToken }: { resetToken?: string } = req.params;
    const { newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Reset token and new password are required' });
    }
    const result = await AuthService.resetPassword(newPassword, resetToken);
    res.status(200).json({ success: true, ...result });
  },
);
