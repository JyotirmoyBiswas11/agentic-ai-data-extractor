# Agentic AI Data Value Extractor (DataLens AI)

A production-grade, enterprise SaaS portal for uploading unstructured business records (such as CSV sales and analytics exports) and extracting structured decision intelligence via a multi-stage **Gemini 1.5 Flash AI Agent**.

---

## Architecture & Data Flow

```
[ User Browser / React 19 Frontend ]
      │
      │ 1. Upload CSV with resumable progress
      ▼
[ Firebase Cloud Storage ] ── (Path: users/{uid}/uploads/{analysisId}.csv)
      │
      │ 2. POST /api/upload (App Check Token + Bearer ID Token)
      ▼
[ Express.js Backend on GCP Cloud Run ]
      │
      │ 3. Download & parse CSV records
      │ 4. Run 4-Stage Gemini AI Agent Pipeline:
      │    - Stage 1: Column Schema & Type Classification
      │    - Stage 2: Anomaly & Data Cleanliness Auditing (0-100 Score)
      │    - Stage 3: Quantitative KPI Extraction (totals, growth, trends)
      │    - Stage 4: Dynamic Visualization & Aggregation Specs
      ▼
[ Firestore (Database: pmtool) ]
      │
      │ 5. Real-time Snapshot Listener
      ▼
[ React 19 Frontend (Recharts & Dashboard) ]
```

---

## Tech Stack & Color System

### Frontend (`frontend/`)
- **Framework**: React 19, TypeScript 5, Vite 6
- **Styling**: TailwindCSS v4 with CSS variables design system
- **Components**: Shadcn-style custom UI primitives
- **Typography**:
  - `Sora`: Headings, hero display, branding
  - `Inter`: UI, data tables, metrics, forms
- **Charts**: Recharts (Bar, Line, Area, Pie)
- **State & Routing**: Zustand (auth, analyses, UI theme persistence) & React Router v7
- **Security**: Firebase App Check (reCAPTCHA v3 site key `6LeSzZAqAAAAAOaGsXNfNwXvaOv15ZCcwc7jdeET`, no debug tokens)

#### Design Tokens
- **Light Theme**:
  - `--text: #0F172A`
  - `--background: #F8FAFC`
  - `--primary: #4F46E5`
  - `--secondary: #E2E8F0`
  - `--accent: #06B6D4`
- **Dark Theme**:
  - `--text: #E6EDF3`
  - `--background: #0B0F1A`
  - `--primary: #4F46E5`
  - `--secondary: #1E293B`
  - `--accent: #22D3EE`

### Backend (`backend/`)
- **Server**: Express.js with TypeScript in strict mode
- **Security & Middleware**:
  - Helmet for HTTP security headers
  - CORS with whitelist
  - Global & upload route rate limiters (`express-rate-limit`)
  - Firebase ID token authentication (Bearer JWT)
  - One-time limited-use App Check verification (`verifyToken(token, { consume: true })`)
  - Unprotected health check: `GET /health`
- **AI Engine**: `@google/generative-ai` (Gemini 1.5 Flash with structured JSON output)
- **Database**: Firebase Admin SDK targeting explicit database `pmtool`
- **Containerization**: Multi-stage `Dockerfile` for GCP Cloud Run deployment

### Firebase Functions (`firebase/functions/`)
- **Runtime**: Node.js 20, TypeScript
- **Blocking Identity Triggers**:
  - `beforeUserCreated`: Rejects disposable email domains and initializes Firestore profile document
  - `beforeUserSignedIn`: Verifies account status and records login activity

---

## Getting Started Locally

### 1. Backend Setup
```bash
cd backend
npm install
```

Copy the example environment file and configure your credentials:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
FIREBASE_SERVICE_ACCOUNT='{...service-account-json...}'
FIREBASE_PROJECT_ID=my-demo-projects-43be2
FIREBASE_DATABASE_ID=(default)
FIREBASE_STORAGE_BUCKET=my-demo-projects-43be2.firebasestorage.app
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8080
FRONTEND_ORIGIN=http://localhost:5173
```

Start the backend in development mode (no Docker):
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```
The dashboard will run at `http://localhost:5173`.

---

## Production Verification & Deployment

### Typecheck & Build Checks
```bash
# Backend Check
cd backend && npm run typecheck && npm run build

# Functions Check
cd firebase/functions && npm run build

# Frontend Check
cd frontend && pnpm typecheck && pnpm build
```

### Deployment Commands

#### Deploy Frontend Hosting
```bash
cd frontend
firebase deploy --only hosting
```

#### Deploy Firebase Blocking Functions
```bash
cd firebase
firebase deploy --only functions
```

#### Deploy Backend to GCP Cloud Run
```bash
cd backend
gcloud run deploy agentic-ai-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=my-demo-projects-43be2,FIREBASE_DATABASE_ID=(default),FIREBASE_STORAGE_BUCKET=my-demo-projects-43be2.firebasestorage.app \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest,FIREBASE_SERVICE_ACCOUNT=firebase-service-account:latest
```
