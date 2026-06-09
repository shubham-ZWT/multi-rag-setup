import crypto from 'crypto';

export const MAX_OTP_ATTEMPTS = 5;
export const OTP_EXPIRY_MINUTES = parseInt(
  process.env.OTP_EXPIRY_MINUTES || '5',
  10,
);
export const RESEND_COOLDOWN_SECONDS = parseInt(
  process.env.RESEND_COOLDOWN_SECONDS || '60',
  10,
);

export const generateOtp = (): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[crypto.randomInt(10)];
  }
  return otp;
};

export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};
