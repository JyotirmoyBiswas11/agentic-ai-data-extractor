import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter — applied to all /api/* routes.
 * 100 requests per 15-minute window per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/**
 * Upload-specific rate limiter — stricter limit for the analysis trigger endpoint.
 * 10 requests per 15-minute window per IP.
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Upload limit reached. Please wait before triggering another analysis.' },
});
