import type { DecodedIdToken } from 'firebase-admin/auth';

// Augment Express Request to carry the decoded Firebase ID token
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

export {};
