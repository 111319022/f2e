// js/firebase-data.js
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('announcement-list');
    
    // 初始化 Bootstrap Modal (確保能用 JS 控制它)
    const modalElement = document.getElementById('announcementModal');
    // 如果頁面上沒有 modal (例如在儀表板頁)，就不執行後面的 modal 邏輯，避免報錯
    let announcementModal = null;
    if (modalElement && window.bootstrap) {
        announcementModal = new bootstrap.Modal(modalElement);
    }

    if (!listContainer) return;

    const q = query(collection(db, "announcements"), orderBy("date", "desc"));

    onSnapshot(q, (querySnapshot) => {
        listContainer.innerHTML = ''; 

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<div class="list-group-item">目前沒有公告</div>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // 處理標籤顏色
            let badgeHtml = '';
            let badgeColor = 'bg-secondary'; // 預設灰色
            
            if (data.tag) {
                if (data.tag === '重要') badgeColor = 'bg-danger';
                else if (data.tag === '置頂') badgeColor = 'bg-primary';
                
                badgeHtml = `<span class="badge ${badgeColor} rounded-pill ms-2">${data.tag}</span>`;
            }

            // --- 關鍵修改：使用 createElement 來建立元素，方便綁定點擊事件 ---
            
            // 1. 建立外層連結
            const a = document.createElement('a');
            a.href = "#"; // 防止頁面跳轉
            a.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
            
            // 2. 設定內部 HTML
            a.innerHTML = `
                <div>
                    <h6 class="mb-1 fw-bold text-truncate" style="max-width: 300px;">${data.title}</h6>
                    <small class="text-muted">由 ${data.author} 發表於 ${data.date}</small>
                </div>
                ${badgeHtml}
            `;

            // 3. 綁定點擊事件 (Click Event)
            a.addEventListener('click', (e) => {
                e.preventDefault(); // 阻止連結跳轉
                
                // 如果 Modal 存在，就填入資料並開啟
                if (announcementModal) {
                    // 填入標題
                    document.getElementById('modal-title').textContent = data.title;
                    // 填入作者與日期
                    document.getElementById('modal-author').textContent = data.author;
                    document.getElementById('modal-date').textContent = data.date;
                    
                    // 填入內容 (如果資料庫裡沒有 content 欄位，就顯示預設文字)
                    const content = data.content ? data.content : "目前此公告沒有詳細內容 ";
                    document.getElementById('modal-content').textContent = content;

                    // 填入標籤樣式
                    const tagEl = document.getElementById('modal-tag');
                    if (data.tag) {
                        tagEl.textContent = data.tag;
                        tagEl.className = `ms-auto badge ${badgeColor}`; // 套用對應顏色
                        tagEl.style.display = 'inline-block';
                    } else {
                        tagEl.style.display = 'none';
                    }

                    // 顯示 Modal
                    announcementModal.show();
                }
            });

            // 4. 將做好的元素放進列表
            listContainer.appendChild(a);
        });
    });
});
