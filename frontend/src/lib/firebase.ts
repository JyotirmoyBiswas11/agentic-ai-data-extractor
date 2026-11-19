import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// Firebase Auth — used for user sign-in / registration
export const auth = getAuth(app);

// Firestore — used to read analysis results in real-time
const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db =
  dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);

// NOTE: Firebase Storage is NOT used.
// Files are sent directly to the Express backend via multipart/form-data.
// This avoids CORS issues and Firebase Spark plan Storage restrictions.

// NOTE: App Check is NOT initialised.
// The backend's App Check middleware is a passthrough; security is provided
// by Firebase Auth ID tokens (Authorization: Bearer <idToken>).
