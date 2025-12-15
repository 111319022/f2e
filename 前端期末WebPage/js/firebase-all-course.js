import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('course-list-container');
    
    // 篩選器 DOM (目前先做基本的搜尋與篩選邏輯準備)
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const filterType = document.getElementById('filter-type');

    if (!container) return;

    // 1. 定義要抓取的集合名稱
    const collectionName = "all_course";
    
    // 暫存所有課程資料，以便前端篩選用
    let allCoursesData = [];

    // 2. 從 Firebase 抓取資料
    try {
        // 嘗試依照 code (課程代碼) 排序，如果沒有索引可能會報錯，那可以先拿掉 orderBy
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);

        container.innerHTML = ''; // 清空 Loading 動畫

        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted fs-5">目前還沒有任何課程資料</p>
                </div>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            // 把 ID 也存進去，方便之後超連結使用
            allCoursesData.push({ id: doc.id, ...doc.data() });
        });

        // 3. 初始渲染所有課程
        renderCourses(allCoursesData);

    } catch (error) {
        console.error("載入課程失敗:", error);
        container.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
                <i class="bi bi-exclamation-triangle-fill fs-3"></i>
                <p class="mt-2">無法載入課程，請稍後再試。</p>
            </div>`;
    }

    // --- 渲染函式 ---
    function renderCourses(courses) {
        container.innerHTML = '';

        if (courses.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-5">找不到符合條件的課程</div>`;
            return;
        }

        courses.forEach(course => {
            // 處理欄位預設值，避免資料庫缺欄位導致報錯
            const title = course.title || "未命名課程";
            const code = course.code || "UNKNOWN"; // 例如 1141_0178
            const type = course.type || "選修";     // 必修/選修/通識
            const dept = course.department || "未知系所";
            const teacher = course.teacher || "未知教師";
            const description = course.description || "暫無課程描述";
            const progress = course.progress || 0;
            // 如果資料庫有 link 欄位就用，沒有就預設連到首頁或 #
            const link = course.link || "#"; 
            
            // 圖片處理：如果有 url 就用，沒有就用假圖
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
        });
    }

    // --- 簡單的前端搜尋功能 ---
    function filterData() {
        const query = searchInput.value.toLowerCase();
        const typeVal = filterType.value;

        const filtered = allCoursesData.filter(course => {
            // 搜尋範圍：標題、代碼、老師名字
            const matchText = (course.title || '').toLowerCase().includes(query) ||
                              (course.code || '').toLowerCase().includes(query) ||
                              (course.teacher || '').toLowerCase().includes(query);
            
            // 篩選類型
            let matchType = typeVal === 'all';
            if (typeVal === '通識') {
                matchType = (course.type || '').includes('通識');
            } else if (typeVal !== 'all') {
                matchType = course.type === typeVal;
            }

            return matchText && matchType;
        });

        renderCourses(filtered);
    }

    if (searchBtn) searchBtn.addEventListener('click', filterData);
    if (searchInput) searchInput.addEventListener('input', filterData); // 打字即時搜尋
    if (filterType) filterType.addEventListener('change', filterData);
}); 