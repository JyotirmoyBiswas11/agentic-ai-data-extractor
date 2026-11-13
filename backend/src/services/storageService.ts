import { getStorage } from 'firebase-admin/storage';

/**
 * Downloads a file from Firebase Cloud Storage and returns it as a Buffer.
 * @param storagePath - The full object path, e.g. "users/uid/uploads/file.csv"
 */
export async function downloadFileFromStorage(storagePath: string): Promise<Buffer> {
  const bucket = getStorage().bucket();
  const file = bucket.file(storagePath);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`File not found in Cloud Storage: ${storagePath}`);
  }

  const [contents] = await file.download();
  return contents;
}

/**
 * Deletes a file from Firebase Cloud Storage.
 * Silently succeeds if the file does not exist.
 * @param storagePath - The full object path to delete.
 */
export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  const bucket = getStorage().bucket();
  const file = bucket.file(storagePath);
  const [exists] = await file.exists();
  if (exists) {
    await file.delete();
  }
}
