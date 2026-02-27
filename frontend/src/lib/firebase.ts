import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

// NEXT_PUBLIC_ values are public by definition — they're shipped in the client bundle.
// Hardcoding as fallbacks ensures Firebase ALWAYS initializes, even if env vars
// aren't picked up by the dev server (e.g., before restart or on first deploy).
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyDeguekP6KMBooxGlnMO0JIXanj04DJNXs',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'paybill-8f186.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'paybill-8f186',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'paybill-8f186.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '492953906419',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:492953906419:web:981f232d5580cc2c091b86',
};

// Initialize once — safe to call multiple times (Next.js hot-reload guard)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
export default app;
