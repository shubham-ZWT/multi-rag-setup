import AppError from '../utils/appError';

export const BAD_REQUEST = () => new AppError('Bad Request', 400);
export const UNAUTHORIZED = () => new AppError('Unauthorized', 401);
export const TOKEN_MISSING = () => new AppError('Access token is missing', 401);
export const INVALID_TOKEN = () =>
  new AppError('Invalid or expired token', 401);
export const FORBIDDEN = () => new AppError('Forbidden', 403);
export const NOT_FOUND = () => new AppError('Not Found', 404);
export const INVALID_REFRESH_TOKEN = () =>
  new AppError('Invalid or expired refresh token', 401);
export const REFRESH_TOKEN_MISSING = () =>
  new AppError('Refresh token is required', 400);
