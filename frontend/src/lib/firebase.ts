import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton pattern: prevents "Firebase App named '[DEFAULT]' already exists" during Vite Hot Module Reloading (HMR)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Auth — used for user sign-in / registration
export const auth = getAuth(app);

// Firestore — connect to the "default" database where the analyses are stored
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || 'default';
export const db = getFirestore(app, databaseId);
