import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('course-announcement-list');
    const addButton = document.getElementById('add-announcement-btn');
    const addModalEl = document.getElementById('addAnnouncementModal');
    const addForm = document.getElementById('new-announcement-form');
    const titleInput = document.getElementById('ann-title-input');
    const tagInput = document.getElementById('ann-tag-input');
    const contentInput = document.getElementById('ann-content-input');
    const submitBtn = document.getElementById('ann-submit-btn');
    const helperText = document.getElementById('announce-form-helper');
    
    const detailModalEl = document.getElementById('announceDetailModal');
    let detailModal = null;
    if (detailModalEl && window.bootstrap) {
        detailModal = new bootstrap.Modal(detailModalEl);
    }

    let addModal = null;
    if (addModalEl && window.bootstrap) {
        addModal = new bootstrap.Modal(addModalEl);
    }

    const toggleSubmitState = (isSubmitting) => {
        if (!submitBtn) return;
        const spinner = submitBtn.querySelector('.spinner-border');
        const defaultText = submitBtn.querySelector('.default-text');
        submitBtn.disabled = isSubmitting;
        if (spinner) spinner.classList.toggle('d-none', !isSubmitting);
        if (defaultText) defaultText.classList.toggle('d-none', isSubmitting);
    };

    const resetForm = () => {
        if (addForm) addForm.reset();
        toggleSubmitState(false);
    };

    if (addButton) {
        addButton.addEventListener('click', () => {
            if (!auth.currentUser) {
                alert('請先登入才能新增公告');
                return;
            }

            resetForm();

            if (helperText) {
                const name = auth.currentUser.displayName || '匿名';
                helperText.textContent = `將以 ${name} 身份發布公告`;
            }

            if (addModal) addModal.show();
        });
    }

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!auth.currentUser) {
                alert('請先登入才能新增公告');
                return;
            }

            const title = titleInput?.value.trim() || '';
            const content = contentInput?.value.trim() || '';
            const tag = tagInput?.value || '';

            if (!title || !content) {
                alert('請填寫標題與內容');
                return;
            }

            toggleSubmitState(true);

            const dateStr = new Date().toLocaleString('zh-TW', {
                hour12: false,
                timeZone: 'Asia/Taipei'
            });

            try {
                await addDoc(collection(db, "course_announcement-1141_0178"), {
                    title,
                    content,
                    tag: tag || null,
                    author: auth.currentUser.displayName || '匿名',
                    date: dateStr,
                    createdAt: serverTimestamp(),
                });

                resetForm();
                if (addModal) addModal.hide();
            } catch (error) {
                console.error('新增公告失敗', error);
                alert('新增公告失敗：' + error.message);
            } finally {
                toggleSubmitState(false);
            }
        });
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
                <h5 class="mb-2 fw-bold text-primary">${data.title} ${badgeHtml}</h5>
                <small class="text-muted d-block mb-2"><i class="bi bi-clock me-1"></i>${data.date} · 由 ${data.author} 發布</small>
                <p class="mb-0 text-dark text-truncate" style="max-width: 95%;">${data.content || '點擊查看詳情...'}</p>
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