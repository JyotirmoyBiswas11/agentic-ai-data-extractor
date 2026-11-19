import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware: App Check verification.
 *
 * Currently bypassed — Firebase Auth JWT (requireAuth) handles security instead.
 * App Check caused 24-hour throttle issues in development with reCAPTCHA v3.
 *
 * To re-enable for production:
 *   1. Set ENFORCE_APP_CHECK=true in .env
 *   2. Uncomment the verification block below.
 */
export async function requireAppCheck(
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  // Passthrough — Auth JWT middleware provides the security boundary.
  next();
}
