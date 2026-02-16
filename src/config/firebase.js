import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getEnv = (key) => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env)
      return import.meta.env[key] || "";
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process.env)
      return process.env[key] || "";
  } catch (e) {}
  return "";
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
};

if (typeof __firebase_config !== "undefined") {
  try {
    Object.assign(firebaseConfig, JSON.parse(__firebase_config));
  } catch (e) {
    console.warn("Config parse error");
  }
}

let app, auth, db;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
}

export { app, auth, db };