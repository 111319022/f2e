import { collection, query, orderBy, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('forum-list');
    const btnNewPost = document.getElementById('btn-new-post');
    const collectionName = "forum_posts-1141_0178";

    // 1. 讀取並顯示討論串
    if (listContainer) {
        // 依照日期倒序排列 (最新的在最上面)
        const q = query(collection(db, collectionName), orderBy("date", "desc"));

        onSnapshot(q, (querySnapshot) => {
            listContainer.innerHTML = '';

            if (querySnapshot.empty) {
                listContainer.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <i class="bi bi-chat-square-text fs-1"></i>
                        <p class="mt-2">目前沒有討論，快來搶頭香！</p>
                    </div>`;
                return;
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // 判斷是否已解決 (綠色勾勾)
                let statusBadge = '';
                if (data.is_solved) {
                    statusBadge = '<span class="badge bg-success rounded-pill ms-2"><i class="bi bi-check-lg me-1"></i>已解決</span>';
                }

                // 建立 HTML
                const a = document.createElement('a');
                a.href = "#"; // 如果未來要做內頁，可以改這裡
                a.className = "list-group-item list-group-item-action p-4";
                
                a.innerHTML = `
                    <div class="d-flex w-100 justify-content-between align-items-center mb-1">
                        <h5 class="mb-0 fw-bold text-primary text-truncate" style="max-width: 70%;">${data.title}</h5>
                        <small class="text-muted text-nowrap ms-2">${data.date}</small>
                    </div>
                    <p class="mb-2 text-secondary text-truncate">${data.content}</p>
                    <div class="d-flex align-items-center mt-2">
                        <small class="text-muted me-3">
                            <i class="bi bi-person-circle me-1"></i>${data.author}
                        </small>
                        <span class="badge bg-light text-dark border rounded-pill">
                            <i class="bi bi-chat-left-dots me-1"></i>${data.reply_count || 0} 則回覆
                        </span>
                        ${statusBadge}
                    </div>
                `;

                // 這裡可以綁定點擊事件 (例如開啟 Modal 查看詳情)，目前先不做動作
                a.addEventListener('click', (e) => e.preventDefault());

                listContainer.appendChild(a);
            });
        });
    }

    // 2. 發起新討論 (使用簡單的 prompt)
    if (btnNewPost) {
        btnNewPost.addEventListener('click', async () => {
            // 檢查是否登入
            const user = auth.currentUser;
            if (!user) {
                alert("請先登入才能發文！");
                return;
            }

            // 步驟 1: 輸入標題
            const title = prompt("【發起新討論】\n請輸入討論標題：");
            if (!title || title.trim() === "") return; // 取消或輸入空白

            // 步驟 2: 輸入內容
            const content = prompt(`標題：${title}\n\n請輸入討論內容：`);
            if (!content || content.trim() === "") return;

            // 步驟 3: 寫入 Firebase
            try {
                // 取得當前日期 (格式 YYYY-MM-DD)
                const today = new Date().toISOString().split('T')[0];

                await addDoc(collection(db, collectionName), {
                    title: title,
                    content: content,
                    author: user.displayName || "匿名學生", // 使用 Google 登入的名字
                    author_uid: user.uid,
                    date: today,
                    reply_count: 0,
                    is_solved: false
                });

                alert("發布成功！");
                // onSnapshot 會自動更新畫面，不需要手動重整

            } catch (error) {
                console.error("發文失敗:", error);
                alert("發文失敗，請檢查權限或網路。");
            }
        });
    }
});