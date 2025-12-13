// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 這裡貼上你真實的 Config
const firebaseConfig = {
  apiKey: "AIzaSyA6odCZUzRQVwlMv4Pnu55qGKwEFv2fzeo",
  authDomain: "ntue-moodle-resedign.firebaseapp.com",
  projectId: "ntue-moodle-resedign",
  storageBucket: "ntue-moodle-resedign.firebasestorage.app",
  messagingSenderId: "853184852200",
  appId: "1:853184852200:web:1c1a78e7a20c1c3afa595d",
  measurementId: "G-G0M5D0JNZG"
};

// 初始化一次就好
const app = initializeApp(firebaseConfig);

// 把準備好的 auth 和 db 匯出給別人用
export const auth = getAuth(app);
export const db = getFirestore(app);