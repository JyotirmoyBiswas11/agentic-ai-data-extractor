/**
 * App Check is not used in this application.
 * File kept as a stub so any stale import doesn't cause a build error.
 * The backend App Check middleware is a passthrough; security is provided
 * by Firebase Auth ID tokens (Authorization: Bearer <idToken>).
 */
export async function getLimitedAppCheckToken(): Promise<string> {
  return '';
}
