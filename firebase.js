import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJIUQwz7EvhVGxWMeXSo7l0amybsFADhU",
  authDomain: "nossa-lista-de-compras-6d467.firebaseapp.com",
  projectId: "nossa-lista-de-compras-6d467",
  storageBucket: "nossa-lista-de-compras-6d467.firebasestorage.app",
  messagingSenderId: "95514192200",
  appId: "1:95514192200:web:1aad72928b6e0d351beb7d",
  measurementId: "G-4R8E76G34K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth, db, signInAnonymously,
  collection, addDoc, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, writeBatch, getDocs
};
