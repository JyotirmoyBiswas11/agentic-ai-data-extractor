import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAppCheck } from '../middleware/appCheck.js';
import { requireAuth } from '../middleware/authJwt.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { downloadFileFromStorage } from '../services/storageService.js';
import { parseCSV } from '../services/csvParser.js';
import { runAnalysisAgent } from '../services/geminiAgent.js';
import {
  createAnalysis,
  updateAnalysisStatus,
  updateAnalysisResult,
} from '../services/firestoreService.js';

const router = Router();

const uploadBodySchema = z.object({
  storagePath: z.string().min(1, 'storagePath is required'),
  analysisId: z.string().min(1, 'analysisId is required'),
  fileName: z.string().min(1, 'fileName is required'),
});

/**
 * POST /api/upload
 *
 * Triggers an AI analysis pipeline for a CSV file already uploaded to Cloud Storage.
 * Flow:
 *   1. Validate App Check token + user JWT
 *   2. Validate request body
 *   3. Verify storagePath ownership (must start with users/{uid}/)
 *   4. Respond 202 immediately (async processing)
 *   5. Download CSV → parse → create Firestore doc → run Gemini → save results
 */
router.post(
  '/',
  uploadRateLimiter,
  requireAppCheck,
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = uploadBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid request body.',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { storagePath, analysisId, fileName } = parseResult.data;
    // req.user is guaranteed non-null at this point because requireAuth ran first
    const uid = req.user!.uid;

    // Enforce path ownership — prevents users accessing other users' files
    if (!storagePath.startsWith(`users/${uid}/`)) {
      res.status(403).json({
        error: 'Forbidden: storage path does not belong to this user.',
      });
      return;
    }

    // Respond immediately — Gemini processing is async
    res.status(202).json({
      analysisId,
      status: 'pending',
      message: 'Analysis started. Poll Firestore for status updates.',
    });

    // ─── Async pipeline (fire-and-forget, errors written to Firestore) ───────
    void (async () => {
      try {
        const buffer = await downloadFileFromStorage(storagePath);
        const csv = await parseCSV(buffer);

        await createAnalysis(uid, analysisId, {
          fileName,
          storagePath,
          rowCount: csv.rowCount,
          columnCount: csv.headers.length,
        });

        await updateAnalysisStatus(uid, analysisId, 'processing');

        const result = await runAnalysisAgent(csv, fileName);

        await updateAnalysisResult(uid, analysisId, result, csv.rowCount, csv.headers.length);

        console.log(`[Upload] ✓ Analysis complete: ${analysisId}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        console.error(`[Upload] ✗ Analysis failed for ${analysisId}:`, message);
        await updateAnalysisStatus(uid, analysisId, 'error', message).catch((e: unknown) => {
          console.error('[Upload] Failed to persist error state:', e);
        });
      }
    })();
  },
);

export default router;
