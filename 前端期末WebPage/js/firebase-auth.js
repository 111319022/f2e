// js/firebase-auth.js

// 1. 引入 Firebase
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ref, onValue, onDisconnect, set } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { auth, db, rtdb } from "./firebase-config.js"; // 共用 config 初始化的 auth
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

            ensureUserProfile(user).catch((err) => console.error("同步使用者資料失敗", err));

            // 如果使用者還在登入頁 (index.html)，把他踢去儀表板 (dashboard.html)
            if (isLoginPage) {
                window.location.href = 'dashboard.html';
                return; // 結束執行
            }

            // 更新 Navbar UI (原本的邏輯)
            updateNavbarUI(user);
            
            // 更新首頁歡迎訊息
            updateWelcomeMessage(user);

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
// 如果在登入頁，綁定登入按鈕事件
            const loginBtn = document.getElementById('google-login-btn');
            if (loginBtn) {
                loginBtn.onclick = () => {
                    console.log("嘗試登入中..."); // 讓你知道按鈕有反應
                    signInWithPopup(auth, provider)
                        .then((result) => {
                            console.log("登入成功，準備跳轉...");
                        })
                        .catch((error) => {
                            // 彈窗顯示錯誤
                            console.error("詳細錯誤:", error);
                            alert(`登入失敗！\n\n錯誤代碼: ${error.code}\n錯誤訊息: ${error.message}`);
                        });
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
        
        newLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // 登出前先將狀態設為離線
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, "users-1141_0178", user.uid);
                const userStatusDatabaseRef = ref(rtdb, `/status/${user.uid}`);
                
                try {
                    // 同時更新 Firestore 和 Realtime Database
                    await Promise.all([
                        updateDoc(userRef, { 
                            status: 'offline',
                            updatedAt: serverTimestamp()
                        }),
                        set(userStatusDatabaseRef, {
                            state: 'offline',
                            last_changed: new Date().getTime()
                        })
                    ]);
                } catch (error) {
                    console.error("更新離線狀態失敗:", error);
                }
            }
            
            // 執行登出
            signOut(auth).then(() => {
                alert("已登出！");
            });
        });
    }
}

// 更新首頁歡迎訊息
function updateWelcomeMessage(user) {
    const welcomeMsg = document.getElementById('welcome-message');
    if (welcomeMsg && user.displayName) {
        welcomeMsg.textContent = `歡迎回來, ${user.displayName}`;
    }
}

async function ensureUserProfile(user) {
    if (!user) return;

    const userRef = doc(db, "users-1141_0178", user.uid);
    const snap = await getDoc(userRef);

    const baseData = {
        name: user.displayName || '未命名使用者',
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: 'student', //先自動設為學生
        status: 'online', // 登入時設為線上
        updatedAt: serverTimestamp(),
    };

    if (!snap.exists()) {
        await setDoc(userRef, { ...baseData, createdAt: serverTimestamp() });
    } else {
        await updateDoc(userRef, baseData);
    }

    // 設定線上/離線狀態偵測
    setupPresenceSystem(user.uid);
}

// 新增：線上/離線狀態偵測系統
function setupPresenceSystem(userId) {
    // 使用 Realtime Database 來偵測連線狀態
    const userStatusDatabaseRef = ref(rtdb, `/status/${userId}`);
    
    // Firestore 的用戶文件參考
    const userStatusFirestoreRef = doc(db, "users-1141_0178", userId);

    // Realtime Database 的特殊參考，用來偵測連線狀態
    const isOfflineForDatabase = {
        state: 'offline',
        last_changed: new Date().getTime(),
    };

    const isOnlineForDatabase = {
        state: 'online',
        last_changed: new Date().getTime(),
    };

    const isOfflineForFirestore = {
        status: 'offline',
        updatedAt: serverTimestamp(),
    };

    const isOnlineForFirestore = {
        status: 'online',
        updatedAt: serverTimestamp(),
    };

    // 監聽 Firebase Realtime Database 的 .info/connected 節點
    // 這個特殊節點會在連線狀態改變時自動更新
    const connectedRef = ref(rtdb, '.info/connected');
    
    onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) {
            // 客戶端已斷線，不需要做任何事
            // onDisconnect 會自動觸發
            return;
        }

        // 客戶端已連線，設定斷線時要執行的操作
        onDisconnect(userStatusDatabaseRef)
            .set(isOfflineForDatabase)
            .then(() => {
                // 設定當前為線上狀態
                set(userStatusDatabaseRef, isOnlineForDatabase);
                
                // 同時更新 Firestore
                updateDoc(userStatusFirestoreRef, isOnlineForFirestore)
                    .catch(err => console.error("更新 Firestore 狀態失敗:", err));
            });
    });

    // 監聽 beforeunload 事件（用戶關閉分頁/瀏覽器）
    window.addEventListener('beforeunload', () => {
        // 嘗試同步更新為離線（可能不會成功，因為瀏覽器可能會立即關閉）
        set(userStatusDatabaseRef, isOfflineForDatabase);
        updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
    });
}