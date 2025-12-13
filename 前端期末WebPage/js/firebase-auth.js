// js/firebase-auth.js

// 1. 引入 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// 2. Firebase 設定 
const firebaseConfig = {
  apiKey: "AIzaSyA6odCZUzRQVwlMv4Pnu55qGKwEFv2fzeo",
  authDomain: "ntue-moodle-resedign.firebaseapp.com",
  projectId: "ntue-moodle-resedign",
  storageBucket: "ntue-moodle-resedign.firebasestorage.app",
  messagingSenderId: "853184852200",
  appId: "1:853184852200:web:1c1a78e7a20c1c3afa595d",
  measurementId: "G-G0M5D0JNZG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    
    // 取得當前頁面檔名 (例如 index.html, dashboard.html)
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/');

    // 監聽登入狀態改變
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // === [情境 A: 使用者已登入] ===
            console.log("使用者已登入:", user.displayName);

            // 如果使用者還在登入頁 (index.html)，把他踢去儀表板 (dashboard.html)
            if (isLoginPage) {
                window.location.href = 'dashboard.html';
                return; // 結束執行
            }

            // 更新 Navbar UI (原本的邏輯)
            updateNavbarUI(user);

        } else {
            // === [情境 B: 使用者未登入] ===
            console.log("使用者未登入");

            // 如果使用者在內頁 (不是登入頁)，把他踢回登入頁 (index.html)
            // 這樣可以保護你的 dashboard.html, course.html 不被未登入的人看到
            if (!isLoginPage) {
                window.location.href = 'index.html';
                return;
            }

            // 如果在登入頁，綁定登入按鈕事件
            const loginBtn = document.getElementById('google-login-btn');
            if (loginBtn) {
                loginBtn.onclick = () => {
                    signInWithPopup(auth, provider).then(() => {
                        // 登入成功後，onAuthStateChanged 會再次觸發，上面的邏輯會自動把他踢去 dashboard
                        console.log("登入成功，準備跳轉...");
                    }).catch((error) => console.error(error));
                };
            }
        }
    });
});

// 抽離 UI 更新邏輯，讓程式碼比較乾淨
function updateNavbarUI(user) {
    const userMenuBtn = document.getElementById('user-menu');
    if (!userMenuBtn) return;

    const loginText = userMenuBtn.querySelector('span');
    
    // 1. 換文字
    if (loginText) loginText.textContent = `${user.displayName}`;
    
    // 2. 換頭像
    if (user.photoURL) {
        const userImg = document.createElement('img');
        userImg.src = user.photoURL;
        userImg.classList.add('rounded-circle', 'me-2');
        userImg.width = 30;
        userImg.height = 30;
        
        const existingIcon = userMenuBtn.querySelector('i');
        const existingImg = userMenuBtn.querySelector('img');
        
        if (existingIcon) existingIcon.replaceWith(userImg);
        else if (existingImg) existingImg.src = user.photoURL;
    }

    // 3. 處理登出按鈕
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    if (dropdownItems.length > 0) {
        const logoutBtn = dropdownItems[dropdownItems.length - 1];
        logoutBtn.textContent = "登出";
        
        // 修正登出邏輯：複製節點以移除舊事件，並綁定新事件
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        newLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                // 登出後，onAuthStateChanged 會觸發「未登入」，下面的邏輯會自動把他踢回 index.html
                alert("已登出！");
            });
        });
    }
}