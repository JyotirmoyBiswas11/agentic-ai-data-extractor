import { Router } from 'express';

const router = Router();

/**
 * GET /health
 * Public endpoint — no middleware, no rate limiting.
 * Used by Cloud Run health probes and monitoring tools.
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'agentic-ai-backend',
    version: '1.0.0',
  });
});

export default router;
