import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('member-list');
    const tabs = document.querySelectorAll('#member-tabs .nav-link');
    
    if (!listContainer) return;

    // 1. 抓取資料 (依照角色排序，這樣老師通常會排在一起)
    const q = query(collection(db, "users-1141_0178"), orderBy("role"));

    // 用來儲存所有成員資料 (為了篩選功能用)
    let allMembers = [];
    let currentFilter = 'all';

    // 監聽資料庫
    onSnapshot(q, (querySnapshot) => {
        allMembers = []; // 清空快取

        querySnapshot.forEach((doc) => {
            allMembers.push({ id: doc.id, ...doc.data() });
        });

        // 收到資料後，執行一次渲染
        renderMembers();
    });

    // 2. 渲染列表函式
    function renderMembers() {
        listContainer.innerHTML = '';

        // 根據目前的 Filter 篩選資料
        const filteredData = allMembers.filter(member => {
            if (currentFilter === 'all') return true;
            return member.role === currentFilter;
        });

        if (filteredData.length === 0) {
            listContainer.innerHTML = `<li class="list-group-item text-center text-muted py-4">沒有找到相關成員</li>`;
            return;
        }

        filteredData.forEach(member => {
            // 判斷角色樣式
            let badgeHtml = '';
            if (member.role === 'teacher') {
                badgeHtml = '<span class="badge bg-primary">教師</span>';
            } else {
                // 如果是學生，判斷是不是線上
                if (member.status === 'online') {
                    badgeHtml = '<span class="badge bg-success">線上</span>';
                } else {
                    badgeHtml = '<span class="badge bg-light text-secondary border">離線</span>';
                }
            }

            // 自動生成頭像 (使用 UI Avatars API)
            // 格式: https://ui-avatars.com/api/?name=名字&background=顏色
            const avatarColor = member.role === 'teacher' ? '0d6efd' : 'random';
            const avatarUrl = `https://ui-avatars.com/api/?name=${member.name}&background=${avatarColor}&color=fff&size=128`;

            // 建立 HTML
            const li = document.createElement('li');
            li.className = "list-group-item d-flex align-items-center p-3 hover-bg";
            li.innerHTML = `
                <img src="${avatarUrl}" class="rounded-circle me-3 border" width="45" height="45" alt="${member.name}">
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold text-dark">
                        ${member.name} 
                        ${member.id === '你自己設定的文件ID' ? '<span class="text-muted small">(您)</span>' : ''}
                    </h6>
                    <small class="text-muted" style="font-size: 0.85rem;">${member.email}</small>
                </div>
                <div>${badgeHtml}</div>
            `;
            
            listContainer.appendChild(li);
        });
    }

    // 3. 處理篩選標籤點擊事件
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // UI 狀態切換 (Active class)
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            // 更新篩選條件並重新渲染
            currentFilter = e.target.getAttribute('data-filter');
            renderMembers();
        });
    });
});