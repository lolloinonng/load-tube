import type { ErrorCode } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;

  constructor(message: string, statusCode: number, code: ErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

export const Errors = {
  invalidUrl: () =>
    new AppError('Invalid YouTube URL', 400, 'INVALID_URL'),
  privateVideo: () =>
    new AppError('This video is private', 403, 'PRIVATE_VIDEO'),
  ageRestricted: () =>
    new AppError('This video is age-restricted', 403, 'AGE_RESTRICTED'),
  unavailable: () =>
    new AppError('This video is unavailable', 404, 'UNAVAILABLE'),
  liveStream: () =>
    new AppError('Live streams are not supported', 400, 'LIVE_STREAM'),
  networkTimeout: () =>
    new AppError('Request timed out', 408, 'NETWORK_TIMEOUT'),
  conversionFailure: () =>
    new AppError('Failed to convert media', 500, 'CONVERSION_FAILURE'),
  rateLimited: () =>
    new AppError('Too many requests', 429, 'RATE_LIMITED'),
  internal: () =>
    new AppError('Internal server error', 500, 'INTERNAL_ERROR'),
};
