// firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDiN-0t1mbM4VTsmfJDc8H4gryBaGFN9Vc",
  authDomain: "fastcart-13bda.firebaseapp.com",
  projectId: "fastcart-13bda",
  storageBucket: "fastcart-13bda.appspot.com",
  messagingSenderId: "482970771395",
  appId: "1:482970771395:web:938696edcc3fc2ae91e776"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Firestore
const db = getFirestore(app);

// Export everything you need
export {
  auth,
  provider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  db
};
