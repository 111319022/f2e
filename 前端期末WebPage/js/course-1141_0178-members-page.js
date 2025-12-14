import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('member-list');
    const tabs = document.querySelectorAll('#member-tabs .nav-link');
    
    if (!listContainer) return;

    // 抓取資料
    const q = query(collection(db, "users-1141_0178"), orderBy("role"));

    let allMembers = [];
    let currentFilter = 'all';

    onSnapshot(q, (querySnapshot) => {
        allMembers = []; 
        querySnapshot.forEach((doc) => {
            allMembers.push({ id: doc.id, ...doc.data() });
        });
        renderMembers();
    });

    function renderMembers() {
        listContainer.innerHTML = '';

        const filteredData = allMembers.filter(member => {
            if (currentFilter === 'all') return true;
            return member.role === currentFilter;
        });

        if (filteredData.length === 0) {
            listContainer.innerHTML = `<li class="list-group-item text-center text-muted py-4">沒有找到相關成員</li>`;
            return;
        }

        const currentUser = auth.currentUser;
        const dataToRender = currentFilter === 'all'
            ? (() => {
                const teacher = filteredData.find(m => m.role === 'teacher');
                const me = filteredData.find(m => currentUser && m.email === currentUser.email);
                const rest = filteredData.filter(m => {
                    const isTeacher = teacher && m.email === teacher.email;
                    const isMe = me && m.email === me.email;
                    return !isTeacher && !isMe;
                });

                const restSorted = rest.slice().sort((a, b) => {
                    const sa = a.status === 'online' ? 0 : 1;
                    const sb = b.status === 'online' ? 0 : 1;
                    if (sa !== sb) return sa - sb;
                    const an = a.name || '';
                    const bn = b.name || '';
                    return an.localeCompare(bn);
                });

                const result = [];
                if (teacher) result.push(teacher);
                if (me && (!teacher || me.email !== teacher.email)) result.push(me);
                return result.concat(restSorted);
            })()
            : (() => {
                const me = filteredData.find(m => currentUser && m.email === currentUser.email);
                const rest = filteredData.filter(m => !(me && m.email === me.email));

                const restSorted = rest.slice().sort((a, b) => {
                    const sa = a.status === 'online' ? 0 : 1;
                    const sb = b.status === 'online' ? 0 : 1;
                    if (sa !== sb) return sa - sb;
                    const an = a.name || '';
                    const bn = b.name || '';
                    return an.localeCompare(bn);
                });

                const result = [];
                if (me) result.push(me);
                return result.concat(restSorted);
            })();

        dataToRender.forEach(member => {
            // 1. 判斷角色與狀態標籤
            let badgeHtml = '';
            if (member.role === 'teacher') {
                badgeHtml = '<span class="badge bg-primary">教師</span>';
            } else {
                if (member.status === 'online') {
                    badgeHtml = '<span class="badge bg-success">線上</span>';
                } else {
                    badgeHtml = '<span class="badge bg-light text-secondary border">離線</span>';
                }
            }

            // 2. 判斷是不是「我自己」
            let isMe = false;
            if (currentUser && member.email === currentUser.email) {
                isMe = true;
            }

            // 3. 決定頭像圖片邏輯 
            // 預設: 使用 UI Avatars 自動生成
            const avatarColor = member.role === 'teacher' ? '0d6efd' : 'random';
            let avatarUrl = `https://ui-avatars.com/api/?name=${member.name}&background=${avatarColor}&color=fff&size=128`;

            // 優先順序 A: 如果資料庫裡有 photoURL (大家都能看到)
            if (member.photoURL) {
                avatarUrl = member.photoURL;
            } 
            // 優先順序 B: 如果資料庫沒有，但這是我自己 (顯示我現在 Google 的頭像)
            else if (isMe && currentUser.photoURL) {
                avatarUrl = currentUser.photoURL;
            }

            // 4. 產生 HTML
            const li = document.createElement('li');
            li.className = "list-group-item d-flex align-items-center p-3";
            li.innerHTML = `
                <img src="${avatarUrl}" class="rounded-circle me-3 border" width="45" height="45" alt="${member.name}" style="object-fit: cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold text-dark">
                        ${member.name} 
                        ${isMe ? '<span class="text-muted small ms-1">(您)</span>' : ''}
                    </h6>
                    <small class="text-muted" style="font-size: 0.85rem;">${member.email}</small>
                </div>
                <div>${badgeHtml}</div>
            `;
            
            listContainer.appendChild(li);
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderMembers();
        });
    });
});