
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// User provided config
const firebaseConfig = {
  apiKey: "AIzaSyBLcK9KLfL_TIFwT_o7_eE4Gu-8DLnxWRQ",
  authDomain: "gigotoys-5468e.firebaseapp.com",
  projectId: "gigotoys-5468e",
  storageBucket: "gigotoys-5468e.firebasestorage.app",
  messagingSenderId: "600078721224",
  appId: "1:600078721224:web:210d3278974edf4f54c5fd",
  measurementId: "G-QELMWWJD5Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
