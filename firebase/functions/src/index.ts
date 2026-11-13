import { beforeUserCreated, beforeUserSignedIn } from 'firebase-functions/v2/identity';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Disposable email domains blocked from signing up
const BLOCKED_DOMAINS = new Set([
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'trashmail.com',
  'fakeinbox.com',
  'dispostable.com',
]);

/**
 * Blocking function: runs before a new user account is created.
 *
 * - Rejects disposable/temporary email addresses
 * - Creates a user profile document in Firestore (users/{uid})
 */
export const beforecreated = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user || !user.email) {
    throw new Error('An email address is required to create an account.');
  }

  const emailDomain = user.email.split('@')[1]?.toLowerCase();
  if (!emailDomain) {
    throw new Error('Invalid email address format.');
  }

  if (BLOCKED_DOMAINS.has(emailDomain)) {
    throw new Error(
      'Disposable email addresses are not permitted. Please use a valid business email.',
    );
  }

  // Create the user profile document in Firestore
  await db
    .collection('users')
    .doc(user.uid)
    .set(
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        plan: 'free',
      },
      { merge: true },
    );
});

/**
 * Blocking function: runs before a user signs in.
 *
 * - Rejects sign-in for disabled accounts (extra gate on top of Firebase's own check)
 * - Updates lastLoginAt in Firestore
 */
export const beforesignedin = beforeUserSignedIn(async (event) => {
  const user = event.data;
  if (!user || !user.uid) {
    return;
  }

  // Extra disabled-account check
  const userRecord = await admin.auth().getUser(user.uid);
  if (userRecord.disabled) {
    throw new Error(
      'Your account has been suspended. Please contact support@datalens.ai for assistance.',
    );
  }

  // Update last login timestamp (non-blocking — ignore if profile doesn't exist yet)
  await db
    .collection('users')
    .doc(user.uid)
    .update({ lastLoginAt: admin.firestore.FieldValue.serverTimestamp() })
    .catch(() => {
      // Profile may not exist yet in edge cases; not a fatal error
    });
});
