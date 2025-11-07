import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyByFlOT1bIm6ecJK2kn27JrO0Hmkohi6nE",
  authDomain: "project-manager-1c297.firebaseapp.com",
  projectId: "project-manager-1c297",
  storageBucket: "project-manager-1c297.firebasestorage.app",
  messagingSenderId: "1029615377758",
  appId: "1:1029615377758:web:d2df717eadfd0bc18403cf",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
