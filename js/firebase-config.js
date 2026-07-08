import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZ-o4WdI2UTPLFILnteDpYM7C_vrPF_dI",
  authDomain: "refashion-8b31c.firebaseapp.com",
  projectId: "refashion-8b31c",
  storageBucket: "refashion-8b31c.firebasestorage.app",
  messagingSenderId: "242492379212",
  appId: "1:242492379212:web:910460dc9a253b053aa4e9",
  measurementId: "G-18SLTFBGTZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Expose to window for legacy scripts
window.firebaseAuth = auth;
window.firebaseGoogleProvider = googleProvider;
window.firebaseDb = db;
window.firebaseSignInWithEmailAndPassword = signInWithEmailAndPassword;
window.firebaseCreateUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseDoc = doc;
window.firebaseSetDoc = setDoc;
window.firebaseGetDoc = getDoc;
window.firebaseUpdateDoc = updateDoc;


