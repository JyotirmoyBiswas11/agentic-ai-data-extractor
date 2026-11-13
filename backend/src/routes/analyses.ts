import { Router, type Request, type Response } from 'express';
import { requireAppCheck } from '../middleware/appCheck.js';
import { requireAuth } from '../middleware/authJwt.js';
import { getAnalysis } from '../services/firestoreService.js';

const router = Router();

/**
 * GET /api/analyses/:analysisId
 *
 * Retrieves a specific analysis document for the authenticated user.
 * Both App Check and Auth are enforced — users can only fetch their own analyses.
 */
router.get(
  '/:analysisId',
  requireAppCheck,
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const rawId = req.params['analysisId'];
    const analysisId = Array.isArray(rawId) ? rawId[0] : rawId;
    const uid = req.user!.uid;

    if (!analysisId || typeof analysisId !== 'string') {
      res.status(400).json({ error: 'Analysis ID is required.' });
      return;
    }

    try {
      const analysis = await getAnalysis(uid, analysisId);
      if (!analysis) {
        res.status(404).json({ error: 'Analysis not found.' });
        return;
      }
      res.json(analysis);
    } catch (err) {
      console.error('[Analyses] Failed to fetch analysis:', err instanceof Error ? err.message : err);
      res.status(500).json({ error: 'Failed to fetch analysis.' });
    }
  },
);

export default router;
