// js/firebase-data.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 使用跟 auth 一樣的 config
const firebaseConfig = {
    // ... 貼上你原本的 config ...
    apiKey: "你的API_KEY", 
    // ...
    projectId: "ntue-moodle-resedign", // 確保這個對
    // ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // 初始化 Firestore

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('announcement-list');
    
    // 如果這頁沒有公告區塊，就離開
    if (!listContainer) return;

    // 建立查詢：抓取 announcements 集合，並依照 date 倒序排列 (最新的在上面)
    // 注意：如果是第一次跑，Firebase Console 可能會叫你建立索引 (Index)，看 Console 錯誤訊息點連結即可
    const q = query(collection(db, "announcements"), orderBy("date", "desc"));

    // 使用 onSnapshot 監聽資料 (即時更新！)
    onSnapshot(q, (querySnapshot) => {
        listContainer.innerHTML = ''; // 清空原本的「載入中...」

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<div class="list-group-item">目前沒有公告</div>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // 判斷 Badge 顏色
            let badgeHtml = '';
            if (data.tag) {
                let badgeColor = 'bg-secondary';
                if (data.tag === '重要') badgeColor = 'bg-danger';
                else if (data.tag === '置頂') badgeColor = 'bg-primary';
                
                badgeHtml = `<span class="badge ${badgeColor} rounded-pill ms-2">${data.tag}</span>`;
            }

            // 生成 HTML
            const itemHtml = `
                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1 fw-bold">${data.title}</h6>
                        <small class="text-muted">由 ${data.author} 發表於 ${data.date}</small>
                    </div>
                    ${badgeHtml}
                </a>
            `;
            
            listContainer.innerHTML += itemHtml;
        });
    });
});