import { collection, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('grades-list');
    const totalScoreDisplay = document.getElementById('total-score-display');

    if (!listContainer) return;

    // 因為成績是個人隱私，一定要等確認「誰登入」之後才能抓資料
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // 使用者已登入，開始抓取「他的」成績
            // 查詢條件：集合名稱 + 篩選 uid == user.uid
            const q = query(
                collection(db, "grades-114_0178"), 
                where("uid", "==", user.uid),
                orderBy("order") // 依照順序排列
            );

            onSnapshot(q, (querySnapshot) => {
                renderGrades(querySnapshot);
            }, (error) => {
                console.error("讀取成績失敗:", error);
                listContainer.innerHTML = `<tr><td colspan="4" class="text-center text-danger">讀取失敗(瀏覽器config在搞)</td></tr>`;
            });

        } else {
            // 未登入
            listContainer.innerHTML = `<tr><td colspan="4" class="text-center text-muted">請先登入以查看成績</td></tr>`;
            if(totalScoreDisplay) totalScoreDisplay.textContent = "--";
        }
    });

    // 渲染與計算函式
    function renderGrades(snapshot) {
        listContainer.innerHTML = '';
        
        let totalWeightedScore = 0; // 加權總分
        let totalWeight = 0;        // 目前已評分的權重總和

        if (snapshot.empty) {
            listContainer.innerHTML = `<tr><td colspan="4" class="text-center text-muted">目前沒有成績資料</td></tr>`;
            if(totalScoreDisplay) totalScoreDisplay.textContent = "--";
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // 處理分數顯示
            let scoreBadge = '';
            let scoreValue = data.score;

            // 如果有分數 (不為 null 或 undefined)
            if (scoreValue !== null && scoreValue !== undefined && scoreValue !== "") {
                scoreValue = Number(scoreValue); // 轉成數字
                
                // 判斷顏色
                let badgeColor = 'bg-secondary';
                if (scoreValue >= 90) badgeColor = 'bg-success';
                else if (scoreValue >= 80) badgeColor = 'bg-primary';
                else if (scoreValue >= 60) badgeColor = 'bg-warning text-dark';
                else badgeColor = 'bg-danger';

                scoreBadge = `<span class="badge ${badgeColor} fs-6">${scoreValue}</span>`;

                // --- 計算加權平均 ---
                // 假設 weight 是 "20" 代表 20%
                const weightVal = Number(data.weight);
                if (!isNaN(weightVal)) {
                    totalWeightedScore += scoreValue * (weightVal / 100);
                    // 這裡簡化邏輯：我們只單純累加「已得分數 * 權重」
                    // 如果你要算「目前平均」，可以除以 totalWeight
                }

            } else {
                // 未評分
                scoreBadge = `<span class="badge bg-secondary fs-6">--</span>`;
            }

            // 建立表格列
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><i class="bi bi-file-earmark-text me-2 text-primary"></i>${data.item}</td>
                <td>${data.weight}%</td>
                <td>${scoreBadge}</td>
                <td class="text-muted small">${data.comment || '-'}</td>
            `;
            listContainer.appendChild(tr);
        });

        // 更新上方的總分大卡片
        // 這裡顯示的是「目前已獲得的加權總分」(例如 20%拿90分 = 18分)
        if (totalScoreDisplay) {
            // 取小數點後 1 位，如果是整數就不用小數點
            totalScoreDisplay.textContent = parseFloat(totalWeightedScore.toFixed(1));
        }
    }
});