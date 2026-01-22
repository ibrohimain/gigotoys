import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLcK9KLfL_TIFwT_o7_eE4Gu-8DLnxWRQ",
  authDomain: "gigotoys-5468e.firebaseapp.com",
  projectId: "gigotoys-5468e",
  storageBucket: "gigotoys-5468e.firebasestorage.app",
  messagingSenderId: "600078721224",
  appId: "1:600078721224:web:210d3278974edf4f54c5fd",
  measurementId: "G-QELMWWJD5Q"
};

// Fix: Use named import for initializeApp to comply with Firebase modular SDK
export const app = initializeApp(firebaseConfig);
// Analytics is set to null as the 'getAnalytics' export was not found in the current environment
export const analytics = null;
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);