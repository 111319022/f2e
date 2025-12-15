// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

//  Config
const firebaseConfig = {
  apiKey: "AIzaSyBqf5Cc0dYIkJ7Ffv_11fx4NlhruB_1Kqc",
  authDomain: "ntue-noodle.firebaseapp.com",
  projectId: "ntue-noodle",
  storageBucket: "ntue-noodle.firebasestorage.app",
  messagingSenderId: "419573631580",
  appId: "1:419573631580:web:04f3e027ebb2e47ff6f499",
  measurementId: "G-NJ6NJLNK8L"
};

// 初始化一次
const app = initializeApp(firebaseConfig);

// 把準備好的 auth 和 db 匯出給別人用
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);