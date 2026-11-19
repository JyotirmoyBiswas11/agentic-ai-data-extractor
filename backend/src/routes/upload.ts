import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { requireAppCheck } from '../middleware/appCheck.js';
import { requireAuth } from '../middleware/authJwt.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { parseCSV } from '../services/csvParser.js';
import { runAnalysisAgent } from '../services/geminiAgent.js';
import {
  createAnalysis,
  updateAnalysisStatus,
  updateAnalysisResult,
} from '../services/firestoreService.js';
import { nanoid } from '../utils/nanoid.js';

const router = Router();

/** Accept CSV files in-memory, max 10 MB, single field named "file". */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    const allowedMime = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const isCSV =
      allowedMime.includes(file.mimetype) || file.originalname.endsWith('.csv');
    if (!isCSV) {
      cb(new Error('Only CSV files are accepted.'));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /api/upload
 *
 * Receives a CSV file as multipart/form-data, parses it in memory,
 * runs the Gemini AI analysis pipeline, and persists results to Firestore.
 * No Firebase Storage is used — file bytes live only in RAM during processing.
 *
 * Flow:
 *   1. Validate Auth JWT + (no-op) App Check
 *   2. Receive multipart file via multer (memoryStorage)
 *   3. Respond 202 immediately
 *   4. Parse CSV → create Firestore doc → run Gemini → save results
 */
router.post(
  '/',
  uploadRateLimiter,
  requireAppCheck,
  requireAuth,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Send a CSV as form-data field "file".' });
      return;
    }

    const fileName = req.file.originalname;
    const analysisId = `analysis_${nanoid(10)}`;
    const uid = req.user!.uid;

    // Respond immediately — Gemini processing is async
    res.status(202).json({
      analysisId,
      status: 'pending',
      message: 'Analysis started. Poll Firestore for status updates.',
    });

    // ─── Async pipeline (fire-and-forget, errors written to Firestore) ───────
    const buffer = Buffer.from(req.file.buffer);

    void (async () => {
      try {
        const csv = await parseCSV(buffer);

        await createAnalysis(uid, analysisId, {
          fileName,
          rowCount: csv.rowCount,
          columnCount: csv.headers.length,
        });

        await updateAnalysisStatus(uid, analysisId, 'processing');

        const result = await runAnalysisAgent(csv, fileName);

        await updateAnalysisResult(uid, analysisId, result, csv.rowCount, csv.headers.length);

        console.log(`[Upload] ✔ Analysis complete: ${analysisId}`);
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
