import { getToken, getLimitedUseToken } from 'firebase/app-check';
import { appCheck } from './firebase';

/**
 * Retrieves a one-time limited-use App Check token for backend requests.
 * Consumed by the backend with verifyToken(token, { consume: true }).
 */
export async function getLimitedAppCheckToken(): Promise<string> {
  try {
    if (typeof getLimitedUseToken === 'function') {
      const result = await getLimitedUseToken(appCheck);
      return result.token;
    }
  } catch (error) {
    console.warn('[AppCheck] getLimitedUseToken failed, falling back to force refresh:', error);
  }

  const result = await getToken(appCheck, true);
  return result.token;
}
