import type { Request, Response, NextFunction } from 'express';
import { getAppCheck } from 'firebase-admin/app-check';

/**
 * Middleware: verifies the Firebase App Check token from the X-Firebase-AppCheck header.
 *
 * Uses consume: true to enforce LIMITED-USE tokens — each token can only be verified once,
 * preventing replay attacks even if a token is intercepted.
 *
 * Returns 401 on missing, invalid, already-consumed, or expired tokens.
 */
export async function requireAppCheck(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const appCheckToken = req.headers['x-firebase-appcheck'];

  if (!appCheckToken || typeof appCheckToken !== 'string') {
    res.status(401).json({ error: 'Missing App Check token.' });
    return;
  }

  try {
    // consume: true = one-time use token (replay-safe)
    await getAppCheck().verifyToken(appCheckToken, { consume: true });
    next();
  } catch (err) {
    console.error('[AppCheck] Token verification failed:', err instanceof Error ? err.message : err);
    res.status(401).json({ error: 'Invalid or expired App Check token.' });
  }
}
