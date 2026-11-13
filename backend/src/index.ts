import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import healthRouter from './routes/health.js';
import uploadRouter from './routes/upload.js';
import analysesRouter from './routes/analyses.js';

// ─── Firebase Admin initialisation ────────────────────────────────────────

function initFirebase(): void {
  const serviceAccountEnv = process.env['FIREBASE_SERVICE_ACCOUNT'];
  if (!serviceAccountEnv) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is required. ' +
      'Set it to the JSON content of your Firebase service account key.',
    );
  }

  let serviceAccount: ServiceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountEnv) as ServiceAccount;
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON.');
  }

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] ?? 'my-demo-projects-43be2.firebasestorage.app',
    databaseURL: process.env['FIREBASE_DATABASE_URL'] ?? 'https://my-demo-projects-43be2-default-rtdb.firebaseio.com',
  });

  console.log('[Firebase] Admin SDK initialised.');
}

initFirebase();

// ─── Express application ───────────────────────────────────────────────────

const app = express();

// Security headers
app.use(helmet());

// CORS — whitelist the frontend origins
const allowedOrigins = new Set([
  process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:5173',
  'https://my-demo-projects-43be2.web.app',
  'https://my-demo-projects-43be2.firebaseapp.com',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no Origin header) only in dev
      if (!origin) {
        if (process.env['NODE_ENV'] !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('CORS: Origin header required in production.'));
        }
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
      }
    },
    credentials: true,
  }),
);

// Body parser (1 MB limit — CSV data is not sent here, only small JSON payloads)
app.use(express.json({ limit: '1mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────

// Health check — no rate limiting, no auth
app.use('/health', healthRouter);

// API routes — global rate limiter applies
app.use('/api', globalRateLimiter);
app.use('/api/upload', uploadRouter);
app.use('/api/analyses', analysesRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global error handler ─────────────────────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('[Express] Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  },
);

// ─── Start server ──────────────────────────────────────────────────────────

const PORT = parseInt(process.env['PORT'] ?? '8080', 10);
app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT} (${process.env['NODE_ENV'] ?? 'development'})`);
});

export default app;
