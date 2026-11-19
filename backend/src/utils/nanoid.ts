import { randomBytes } from 'node:crypto';

/**
 * Generates a URL-safe random string of the given character length.
 * Uses Node's built-in crypto.randomBytes — no external dependency required.
 */
export function nanoid(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('');
}
