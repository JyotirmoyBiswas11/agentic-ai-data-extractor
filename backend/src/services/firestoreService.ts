import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AnalysisDocument, AnalysisResult, AnalysisStatus } from '../types/index.js';

let resolvedDbId: string | null = null;

function getDbInstance(dbId?: string): FirebaseFirestore.Firestore {
  const target = dbId ?? resolvedDbId ?? process.env['FIREBASE_DATABASE_ID'] ?? '(default)';
  if (target && target !== '(default)') {
    return getFirestore(target);
  }
  return getFirestore();
}

function getAnalysisRef(uid: string, analysisId: string, dbId?: string): FirebaseFirestore.DocumentReference {
  const db = getDbInstance(dbId);
  return db
    .collection('users')
    .doc(uid)
    .collection('analyses')
    .doc(analysisId);
}

/**
 * Executes a Firestore operation. If the targeted database returns 5 NOT_FOUND,
 * seamlessly retries with the alternative database identifier ('default' vs '(default)')
 * and remembers whichever works.
 */
async function withDbFallback<T>(
  uid: string,
  analysisId: string,
  operation: (ref: FirebaseFirestore.DocumentReference) => Promise<T>,
): Promise<T> {
  const primaryDbId = resolvedDbId ?? process.env['FIREBASE_DATABASE_ID'] ?? '(default)';
  const fallbackDbId = primaryDbId === '(default)' ? 'default' : '(default)';

  try {
    const ref = getAnalysisRef(uid, analysisId, primaryDbId);
    const result = await operation(ref);
    if (!resolvedDbId) {
      resolvedDbId = primaryDbId;
      console.log(`[Firestore] Connected to database: "${primaryDbId}"`);
    }
    return result;
  } catch (err: unknown) {
    const grpcErr = err as { code?: number; message?: string };
    if (grpcErr?.code === 5 || grpcErr?.message?.includes('NOT_FOUND')) {
      console.warn(
        `[Firestore] Database "${primaryDbId}" returned NOT_FOUND (5). Trying fallback database "${fallbackDbId}"...`,
      );
      try {
        const fallbackRef = getAnalysisRef(uid, analysisId, fallbackDbId);
        const result = await operation(fallbackRef);
        resolvedDbId = fallbackDbId;
        console.log(`[Firestore] Successfully connected to fallback database: "${fallbackDbId}"!`);
        return result;
      } catch (fallbackErr: unknown) {
        const fErr = fallbackErr as { message?: string };
        console.error(`[Firestore] Fallback "${fallbackDbId}" also failed:`, fErr?.message || fallbackErr);
        throw err;
      }
    }
    throw err;
  }
}

/**
 * Creates an initial analysis document with status 'pending'.
 */
export async function createAnalysis(
  uid: string,
  analysisId: string,
  data: Pick<AnalysisDocument, 'fileName' | 'rowCount' | 'columnCount'>,
): Promise<void> {
  await withDbFallback(uid, analysisId, async (ref) => {
    await ref.set({
      id: analysisId,
      uid,
      userId: uid,
      fileName: data.fileName,
      status: 'pending' as AnalysisStatus,
      rowCount: data.rowCount,
      columnCount: data.columnCount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
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
  await withDbFallback(uid, analysisId, async (ref) => {
    const update: Record<string, unknown> = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (errorMessage !== undefined) {
      update['errorMessage'] = errorMessage;
    }
    await ref.update(update);
  });
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
  await withDbFallback(uid, analysisId, async (ref) => {
    await ref.update({
      status: 'complete' as AnalysisStatus,
      result,
      rowCount,
      columnCount,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

/**
 * Fetches a single analysis document for the given user.
 */
export async function getAnalysis(
  uid: string,
  analysisId: string,
): Promise<AnalysisDocument | null> {
  return withDbFallback(uid, analysisId, async (ref) => {
    const snap = await ref.get();
    if (!snap.exists) return null;
    return snap.data() as AnalysisDocument;
  });
}
