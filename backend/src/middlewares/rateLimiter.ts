import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const analyzeLimiter = rateLimit({
  windowMs: 60000,
  max: 20,
  message: {
    success: false,
    error: 'Too many analyze requests',
    code: 'RATE_LIMITED',
  },
});

export const downloadLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: {
    success: false,
    error: 'Too many download requests',
    code: 'RATE_LIMITED',
  },
});

export const contactLimiter = rateLimit({
  windowMs: 300000,
  max: 1,
  message: {
    success: false,
    error: 'You can only send one message every 5 minutes',
    code: 'RATE_LIMITED',
  },
});
