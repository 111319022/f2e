import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('my-courses-container');
    
    if (!container) return;

    // 指定要載入的三個課程 ID
    const courseIds = ['1141_0178', '1141_6666', '1141_0770'];
    
    try {
        container.innerHTML = ''; // 清空 Loading 動畫

        // 逐個讀取課程資料
        for (const courseId of courseIds) {
            const docRef = doc(db, "all_course", courseId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const course = { id: docSnap.id, ...docSnap.data() };
                renderCourseCard(course);
            } else {
                console.warn(`課程 ${courseId} 不存在`);
            }
        }

        // 如果沒有任何課程卡片被渲染
        if (container.children.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted fs-5">找不到課程資料</p>
                </div>`;
        }

    } catch (error) {
        console.error("載入課程失敗:", error);
        container.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-3"></i>
                <p class="mt-2">無法載入課程，請稍後再試。</p>
            </div>`;
    }

    // --- 渲染單一課程卡片 ---
    function renderCourseCard(course) {
        // 處理欄位預設值
        const title = course.title || "未命名課程";
        const code = course.code || course.id; // 使用 code 欄位或 ID
        const type = course.type || "選修";
        const dept = course.department || "未知系所";
        const teacher = course.teacher || "未知教師";
        const description = course.description || "暫無課程描述";
        const progress = course.progress || 0;
        const link = course.link || `course-${course.id}.html`; 
        
        // 圖片處理
        const imgSrc = course.image || `https://placehold.co/600x400/eeeeee/999999?text=${code}`;

        // 根據課程類型決定 Badge 顏色
        let badgeClass = 'bg-secondary';
        if (type === '必修') badgeClass = 'bg-primary';
        else if (type === '選修') badgeClass = 'bg-success';
        else if (type.includes('通識')) badgeClass = 'bg-warning text-dark';

        // 根據進度條顏色
        let progressClass = 'bg-primary';
        if (progress < 30) progressClass = 'bg-danger';
        else if (progress >= 80) progressClass = 'bg-success';

        // 產生 HTML
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 shadow-sm course-card">
                <a href="${link}" class="text-decoration-none text-dark">
                    <img src="${imgSrc}" class="card-img-top" alt="${title}" style="height: 240px; object-fit: cover;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge ${badgeClass}">${type}</span>
                            <small class="text-muted">${dept}</small>
                        </div>
                        <h5 class="card-title fw-bold text-truncate">${code}_${title}</h5>
                        <p class="card-text text-muted line-clamp-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${description}</p>
                        
                        <div class="mt-3">
                            <div class="d-flex justify-content-between text-muted small mb-1">
                                <span>授課教師：${teacher}</span>
                                <span>進度 ${progress}%</span>
                            </div>
                            <div class="progress" style="height: 5px;">
                                <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
        container.appendChild(col);
    }
});
