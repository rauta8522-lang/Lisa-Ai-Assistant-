// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import{ getAuth, GoogleAuthProvider } from"firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCXpq1ClZ7_KZWgJGsoNdzMjqywWIUjoc",
  authDomain: "lisa-ai-asssistant.firebaseapp.com",
  projectId: "lisa-ai-asssistant",
  storageBucket: "lisa-ai-asssistant.firebasestorage.app",
  messagingSenderId: "241411111929",
  appId: "1:241411111929:web:f37b4af21b1dada7481b28",
  measurementId: "G-WMG5GNQ8G7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// add these lines
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;