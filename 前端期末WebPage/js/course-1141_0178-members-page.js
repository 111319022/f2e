// js/firebase-auth.js
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
// 1. 引入 Firestore 寫入相關功能
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js"; 

const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    
    // 處理登入頁面的按鈕
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        loginBtn.onclick = () => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    console.log("登入成功");
                    // 登入成功後，onAuthStateChanged 會自動觸發並處理跳轉與資料寫入
                })
                .catch((error) => {
                    console.error("錯誤:", error);
                    alert(`登入失敗：${error.message}`);
                });
        };
    }

    // 處理導覽列的登出按鈕 (Dropdown 裡的)
    // 我們使用事件委派，因為有時候 Navbar 是動態載入的
    document.body.addEventListener('click', (e) => {
        if (e.target.textContent.includes('登出')) {
            e.preventDefault();
            signOut(auth).then(() => {
                alert("已登出");
                window.location.href = "index.html"; // 登出後踢回首頁
            });
        }
    });

    // 監聽登入狀態改變 (核心邏輯)
    onAuthStateChanged(auth, async (user) => {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/');

        if (user) {
            // === 🔥 自動加入課程邏輯 (Auto-Join) ===
            try {
                // 定義使用者在該課程的資料路徑
                const userRef = doc(db, "users-1141_0178", user.uid);
                const userSnap = await getDoc(userRef);

                // 如果這個人還不在資料庫裡，就自動新增
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        name: user.displayName || "新同學",
                        email: user.email,
                        photoURL: user.photoURL, // 把 Google 大頭貼存進去
                        role: "student",         // 預設身份是學生
                        status: "online"         // 預設狀態是線上
                    });
                    console.log("新使用者已自動加入課程成員列表！");
                } else {
                    // 如果已經存在，可以順便更新一下狀態為 online (選做)
                    await setDoc(userRef, { status: "online" }, { merge: true });
                }
            } catch (err) {
                console.error("自動加入失敗:", err);
            }
            // ======================================

            updateNavbarUI(user);

            // 如果在登入頁，就跳轉到儀表板
            if (isLoginPage) {
                window.location.href = "dashboard.html";
            }
        } else {
            // 沒登入
            updateNavbarUI(null);
            
            // 如果不在登入頁，就踢回登入頁 (保護機制)
            if (!isLoginPage) {
                window.location.href = "index.html";
            }
        }
    });
});

function updateNavbarUI(user) {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        if (user) {
            // 有登入：顯示頭像與名字
            const photo = user.photoURL || 'image/default-avatar.png';
            userMenu.innerHTML = `
                <img src="${photo}" class="rounded-circle me-2" width="30" height="30" style="object-fit: cover;">
                <span>${user.displayName}</span>
            `;
        } else {
            // 沒登入：顯示載入中或訪客
            userMenu.innerHTML = `
                <i class="bi bi-person-circle fs-4 me-2"></i>
                <span>未登入</span>
            `;
        }
    }
}
