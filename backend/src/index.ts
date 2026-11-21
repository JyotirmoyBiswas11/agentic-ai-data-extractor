import 'dotenv/config';
import fs from 'fs';
import path from 'path';
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
  let rawCreds = process.env['FIREBASE_SERVICE_ACCOUNT'];

  // Check if a path is specified or service-account.json exists
  if (!rawCreds) {
    const candidatePaths = [
      process.env['FIREBASE_SERVICE_ACCOUNT_PATH'],
      process.env['GOOGLE_APPLICATION_CREDENTIALS'],
      path.resolve(process.cwd(), 'service-account.json'),
      path.resolve(process.cwd(), 'backend', 'service-account.json'),
    ];

    for (const candidate of candidatePaths) {
      if (candidate && fs.existsSync(candidate)) {
        try {
          rawCreds = fs.readFileSync(candidate, 'utf-8');
          console.log(`[Firebase] Loaded service account from ${candidate}`);
          break;
        } catch {
          // continue
        }
      }
    }
  }

  if (!rawCreds) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is required. ' +
      'Set it to the JSON content or path of your Firebase service account key.',
    );
  }

  // Handle potential wrapping quotes or path in FIREBASE_SERVICE_ACCOUNT
  const trimmed = rawCreds.trim();
  let jsonString = trimmed;
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    jsonString = trimmed.slice(1, -1);
  }

  if (fs.existsSync(jsonString)) {
    jsonString = fs.readFileSync(jsonString, 'utf-8');
  }

  let serviceAccount: ServiceAccount & { project_id?: string; private_key?: string };
  try {
    serviceAccount = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${err instanceof Error ? err.message : err}`);
  }

  // Ensure private key handles escaped newlines cleanly
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  const projectId = serviceAccount.project_id ?? process.env['FIREBASE_PROJECT_ID'] ?? 'my-projects-2562a';

  initializeApp({
    credential: cert(serviceAccount),
    projectId,
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] ?? `${projectId}.firebasestorage.app`,
    databaseURL: process.env['FIREBASE_DATABASE_URL'] ?? `https://${projectId}-default-rtdb.firebaseio.com`,
  });

  console.log(`[Firebase] Admin SDK initialised for project: "${projectId}"`);
}

initFirebase();

// ─── Express application ───────────────────────────────────────────────────

const app = express();

// Security headers
app.use(helmet());

// CORS — whitelist the frontend origins (both local development and production hosting)
const projectId = process.env['FIREBASE_PROJECT_ID'] ?? 'my-projects-2562a';
const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env['FRONTEND_ORIGIN'],
    `https://${projectId}.web.app`,
    `https://${projectId}.firebaseapp.com`,
  ].filter(Boolean),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (direct browser visits, curl, server-to-server, uptime probes)
      if (!origin) {
        callback(null, true);
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

// Root endpoint for status verification and browser visits
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    service: 'DataLens AI Backend',
    version: '1.0.0',
    message: 'API is running successfully.',
  });
});

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
