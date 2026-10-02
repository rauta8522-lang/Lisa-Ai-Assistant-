// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const env = (typeof import.meta !== "undefined" && (import.meta as any).env) ? (import.meta as any).env : (process.env || {});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "dummy-storage-bucket",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "dummy-sender-id",
  appId: env.VITE_FIREBASE_APP_ID || "dummy-app-id",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "dummy-measurement-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// add these lines
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
