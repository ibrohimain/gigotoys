
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCM05Mvb_7i5ZYzdxsyeZA9Ms19jXNBH7E",
  authDomain: "gigotoys-40ffc.firebaseapp.com",
  projectId: "gigotoys-40ffc",
  storageBucket: "gigotoys-40ffc.firebasestorage.app",
  messagingSenderId: "987895377484",
  appId: "1:987895377484:web:8f535ea741de99dc48cee9",
  measurementId: "G-QFV2Q2G9PR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
