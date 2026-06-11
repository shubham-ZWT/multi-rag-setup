import { Router } from 'express';
import {
  login,
  register,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
} from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:resetToken', authLimiter, resetPassword);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);

export default router;
