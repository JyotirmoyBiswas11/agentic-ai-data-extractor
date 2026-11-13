import type { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

/**
 * Middleware: verifies the Firebase ID Token sent as a Bearer token.
 * Populates req.user with the decoded token payload on success.
 * Returns 401 on missing, invalid, or expired tokens.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    return;
  }

  const idToken = authHeader.slice(7);

  try {
    // checkRevoked: true ensures revoked tokens are rejected
    const decoded = await getAuth().verifyIdToken(idToken, true);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AuthJWT] Token verification failed:', err instanceof Error ? err.message : err);
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}
