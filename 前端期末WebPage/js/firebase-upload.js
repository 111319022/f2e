// js/firebase-upload.js

// 1. 引入 Storage 相關功能
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { storage, auth } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // UI 元素
    const dropZone = document.getElementById('file-upload-zone');
    const fileInput = document.getElementById('file-input');
    const fileListDisplay = document.getElementById('file-list-display');
    const submitBtn = document.getElementById('submit-btn');
    const uploadPrompt = document.getElementById('drop-prompt'); 
    const statusBadge = document.querySelector('.badge.bg-danger'); 
    const remainingTime = document.querySelector('.list-group-item .text-danger');

    let selectedFile = null; 

    // --- 拖曳視覺效果 (維持原樣) ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(evt => dropZone.addEventListener(evt, () => dropZone.classList.add('drag-over'), false));
    ['dragleave', 'drop'].forEach(evt => dropZone.addEventListener(evt, () => dropZone.classList.remove('drag-over'), false));

    // --- 檔案選擇 ---
    dropZone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files), false);
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files), false);

    function handleFiles(files) {
        if (files.length > 0) {
            selectedFile = files[0];
            showFileName(selectedFile.name);
        }
    }

    function showFileName(name) {
        if(uploadPrompt) uploadPrompt.classList.add('d-none');
        fileListDisplay.classList.remove('d-none');
        fileListDisplay.innerHTML = `
            <div class="file-item fade show">
                <i class="bi bi-file-earmark-text me-2 fs-4 text-primary"></i>
                <span class="file-name fw-bold">${name}</span>
                <button type="button" class="btn btn-sm btn-outline-danger ms-auto remove-file-btn">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;
        fileListDisplay.querySelector('.remove-file-btn').addEventListener('click', () => {
            selectedFile = null;
            fileListDisplay.classList.add('d-none');
            if(uploadPrompt) uploadPrompt.classList.remove('d-none');
            fileInput.value = '';
        });
    }

    // --- 按鈕點擊事件 ---
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (!auth.currentUser) {
                alert("請先登入才能繳交作業！");
                return;
            }
            if (!selectedFile) {
                alert("請先選擇要上傳的檔案！");
                return;
            }

            // 執行真實上傳
            uploadFileToFirebase(selectedFile);
        });
    }

    // 上傳至 Firebase Storage
    function uploadFileToFirebase(file) {
        // 1. 建立儲存路徑： assignments / 使用者UID / 檔名
        const storageRef = ref(storage, `assignments/${auth.currentUser.uid}/${file.name}`);

        // 2. 建立上傳任務
        const uploadTask = uploadBytesResumable(storageRef, file);

        // 3. 監聽上傳狀態
        uploadTask.on('state_changed',
            (snapshot) => {
                // (A) 進度監聽
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                submitBtn.disabled = true;
                // 按鈕顯示百分比
                submitBtn.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    上傳中... ${Math.round(progress)}%
                `;
            },
            (error) => {
                // (B) 錯誤處理
                console.error("上傳失敗:", error);
                alert("上傳失敗：" + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "確認繳交";
            },
            () => {
                // (C) 上傳完成
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('檔案已上傳，下載連結:', downloadURL);
                    
                    // UI 更新：變綠燈
                    alert(`✅ 繳交成功！\n檔案已安全儲存至雲端。`);
                    
                    submitBtn.className = "btn btn-success btn-lg";
                    submitBtn.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>繳交完成`;
                    
                    if (statusBadge) {
                        statusBadge.className = "badge bg-success";
                        statusBadge.textContent = "已繳交";
                    }
                    if (remainingTime) {
                        remainingTime.className = "text-success fw-bold";
                        remainingTime.textContent = "提早繳交：Safe!";
                    }
                });
            }
        );
    }
});
