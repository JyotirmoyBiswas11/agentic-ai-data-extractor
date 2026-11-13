import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AnalysisDocument, AnalysisResult, AnalysisStatus } from '../types/index.js';

/** Returns the Firestore instance pointing to the pmtool database. */
function getDb(): FirebaseFirestore.Firestore {
  const dbId = process.env['FIREBASE_DATABASE_ID'] ?? 'pmtool';
  return getFirestore(dbId);
}

/** Returns a typed DocumentReference for a user's analysis document. */
function analysisRef(uid: string, analysisId: string): FirebaseFirestore.DocumentReference {
  return getDb()
    .collection('users')
    .doc(uid)
    .collection('analyses')
    .doc(analysisId);
}

/**
 * Creates an initial analysis document with status 'pending'.
 */
export async function createAnalysis(
  uid: string,
  analysisId: string,
  data: Pick<AnalysisDocument, 'fileName' | 'storagePath' | 'rowCount' | 'columnCount'>,
): Promise<void> {
  await analysisRef(uid, analysisId).set({
    id: analysisId,
    uid,
    userId: uid, // duplicate for Firestore rules compatibility
    fileName: data.fileName,
    storagePath: data.storagePath,
    status: 'pending' as AnalysisStatus,
    rowCount: data.rowCount,
    columnCount: data.columnCount,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Updates the status (and optional error message) of an analysis document.
 */
export async function updateAnalysisStatus(
  uid: string,
  analysisId: string,
  status: AnalysisStatus,
  errorMessage?: string,
): Promise<void> {
  const update: Record<string, unknown> = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (errorMessage !== undefined) {
    update['errorMessage'] = errorMessage;
  }
  await analysisRef(uid, analysisId).update(update);
}

/**
 * Writes the completed analysis result and transitions status to 'complete'.
 */
export async function updateAnalysisResult(
  uid: string,
  analysisId: string,
  result: AnalysisResult,
  rowCount: number,
  columnCount: number,
): Promise<void> {
  await analysisRef(uid, analysisId).update({
    status: 'complete' as AnalysisStatus,
    result,
    rowCount,
    columnCount,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Fetches a single analysis document for the given user.
 * Returns null if the document does not exist.
 */
export async function getAnalysis(
  uid: string,
  analysisId: string,
): Promise<AnalysisDocument | null> {
  const snap = await analysisRef(uid, analysisId).get();
  if (!snap.exists) return null;
  return snap.data() as AnalysisDocument;
}
