import { Router } from 'express';
import {
  login,
  register,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

export default router;
