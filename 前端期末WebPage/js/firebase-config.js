// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

//  Config
const firebaseConfig = {
  apiKey: "AIzaSyD0sF-1wbBv4qOOIBv8mr0IRnsipA0g8LE",
  authDomain: "ntue-noodle-28d4a.firebaseapp.com",
  projectId: "ntue-noodle-28d4a",
  storageBucket: "ntue-noodle-28d4a.firebasestorage.app",
  messagingSenderId: "126354872442",
  appId: "1:126354872442:web:5ada63a322b96d2c4e43c3",
  measurementId: "G-M8QRLCTRNB"
};

// 初始化一次
const app = initializeApp(firebaseConfig);

// 把準備好的 auth 和 db 匯出給別人用
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);