// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD9qfFmGF5BuPyHhmlDW85Y4PAS5ls3JYk",
  authDomain: "ga-for-acer-31516.firebaseapp.com",
  projectId: "ga-for-acer-31516",
  storageBucket: "ga-for-acer-31516.firebasestorage.app",
  messagingSenderId: "838665602095",
  appId: "1:838665602095:web:7efef3dbc9c70ece9ef2da"
};

const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
export const db = getDatabase(app);