import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('course-announcement-list');
    
    const detailModalEl = document.getElementById('announceDetailModal');
    let detailModal = null;
    if (detailModalEl && window.bootstrap) {
        detailModal = new bootstrap.Modal(detailModalEl);
    }

    if (!listContainer) return;

    // 記得確認集合名稱是單數還是複數，這裡以你最後截圖的單數為準
    const q = query(collection(db, "course_announcement-1141_0178"), orderBy("date", "desc"));

    onSnapshot(q, (querySnapshot) => {
        listContainer.innerHTML = '';

        if (querySnapshot.empty) {
            listContainer.innerHTML = `
                <div class="alert alert-info d-flex align-items-center">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    目前沒有任何課程公告。
                </div>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            let badgeHtml = '';
            if (data.tag === '重要') badgeHtml = '<span class="badge bg-danger ms-2">重要</span>';
            else if (data.tag === '置頂') badgeHtml = '<span class="badge bg-primary ms-2">置頂</span>';

            const item = document.createElement('a');
            item.href = "#";
            // ✅ 修改：這裡移除了 'shadow-sm'，並加上 border 讓它看起來更像一般列表
            item.className = "list-group-item list-group-item-action p-4 mb-3 border rounded"; 
            
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between align-items-center mb-2">
                    <h5 class="mb-1 fw-bold text-primary">${data.title} ${badgeHtml}</h5>
                    <small class="text-muted"><i class="bi bi-clock me-1"></i>${data.date}</small>
                </div>
                <p class="mb-1 text-dark text-truncate" style="max-width: 90%;">${data.content || '點擊查看詳情...'}</p>
                <small class="text-muted">由 ${data.author} 發布</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (detailModal) {
                    document.getElementById('detail-title').textContent = data.title;
                    document.getElementById('detail-author').textContent = data.author;
                    document.getElementById('detail-date').textContent = data.date;
                    document.getElementById('detail-content').textContent = data.content || "無內容";
                    
                    const tagEl = document.getElementById('detail-tag');
                    if (data.tag) {
                        tagEl.textContent = data.tag;
                        tagEl.className = `ms-auto badge ${data.tag === '重要' ? 'bg-danger' : 'bg-primary'}`;
                        tagEl.style.display = 'inline-block';
                    } else {
                        tagEl.style.display = 'none';
                    }

                    detailModal.show();
                }
            });

            listContainer.appendChild(item);
        });
    });
});