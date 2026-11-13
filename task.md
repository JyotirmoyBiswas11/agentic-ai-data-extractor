# Implementation Task Tracker

## Phase 1 — Repo Root & Config
- [x] `.gitignore` + `README.md`

## Phase 2 — Firebase Config (`firebase/`)
- [x] `firebase.json` (functions + firestore + storage)
- [x] `.firebaserc`
- [x] `firestore.rules` (pmtool database, strict user isolation)
- [x] `firestore.indexes.json`
- [x] `storage.rules` (10MB limit, CSV MIME verification)
- [x] `firebase/functions/package.json` + `tsconfig.json`
- [x] `firebase/functions/src/index.ts` (blocking beforeUserCreated & beforeUserSignedIn)

## Phase 3 — Backend (`backend/`)
- [x] `package.json` + `tsconfig.json`
- [x] `src/types/index.ts` & `src/types/express.d.ts`
- [x] `src/middleware/rateLimiter.ts` (global & upload limits)
- [x] `src/middleware/authJwt.ts` (Bearer ID token verification)
- [x] `src/middleware/appCheck.ts` (one-time limited-use tokens with consume: true)
- [x] `src/services/csvParser.ts`
- [x] `src/services/storageService.ts`
- [x] `src/services/firestoreService.ts` (explicit pmtool database ID)
- [x] `src/services/geminiAgent.ts` (4-stage Gemini 1.5 Flash agent)
- [x] `src/routes/health.ts` (unprotected probe)
- [x] `src/routes/upload.ts` (async execution & status persistence)
- [x] `src/routes/analyses.ts`
- [x] `src/index.ts` (Express entrypoint with Helmet & CORS)
- [x] `Dockerfile` (multi-stage build for GCP Cloud Run)
- [x] `.env.example`

## Phase 4 — Frontend (`frontend/`)
- [x] `package.json` + `tsconfig.json` + `vite.config.ts`
- [x] `index.html` (Google Fonts: Sora & Inter)
- [x] `src/styles/globals.css` (TailwindCSS v4 theme tokens with Light & Dark palettes)
- [x] `src/types/index.ts` & `src/vite-env.d.ts`
- [x] `src/lib/firebase.ts` (pmtool database & ReCaptchaV3Provider App Check)
- [x] `src/lib/appcheck.ts` (limited-use token retrieval)
- [x] `src/lib/api.ts` (authorized API client)
- [x] `src/lib/utils.ts` (formatting & status styling helpers)
- [x] `src/stores/authStore.ts`
- [x] `src/stores/analysisStore.ts`
- [x] `src/stores/uiStore.ts` (theme & sidebar persistence)
- [x] `src/hooks/useAuth.ts`
- [x] `src/hooks/useAnalyses.ts` (Firestore real-time listeners)
- [x] `src/components/layout/Navbar.tsx`
- [x] `src/components/layout/Sidebar.tsx`
- [x] `src/components/layout/AppShell.tsx`
- [x] `src/components/auth/LoginForm.tsx`
- [x] `src/components/auth/RegisterForm.tsx`
- [x] `src/components/upload/FileUpload.tsx` (drag-and-drop, preview, uploadBytesResumable)
- [x] `src/components/analysis/KPICard.tsx` & `KPIGrid.tsx`
- [x] `src/components/analysis/ChartContainer.tsx` (dynamic Recharts rendering)
- [x] `src/components/analysis/DataQualityPanel.tsx`
- [x] `src/components/analysis/ColumnMetaTable.tsx`
- [x] `src/pages/AuthPage.tsx`
- [x] `src/pages/DashboardPage.tsx`
- [x] `src/pages/UploadPage.tsx`
- [x] `src/pages/AnalysesListPage.tsx`
- [x] `src/pages/AnalysisDetailPage.tsx`
- [x] `src/App.tsx` & `src/main.tsx`
- [x] `frontend/firebase.json` (hosting configuration with SPA rewrites)
- [x] `frontend/.firebaserc`

## Phase 5 — Verification
- [x] Backend TypeScript check (`npm run typecheck`) — Passed (0 errors)
- [x] Backend Build (`npm run build`) — Passed (0 errors)
- [x] Firebase Functions TypeScript build (`npm run build`) — Passed (0 errors)
- [x] Frontend TypeScript check (`pnpm typecheck`) — Passed (0 errors)
- [x] Frontend Build (`pnpm build`) — Passed (0 errors)
