// 使用 'DOMContentLoaded' 事件確保在操作 DOM 前，頁面已完全載入
document.addEventListener('DOMContentLoaded', () => {

    // ===== 功能 1: 滾動至頂部按鈕 (Back to Top Button) =====
  
    const backToTopBtn = document.getElementById('back-to-top-btn');

    if (backToTopBtn) {
        // 使用 addEventListener 而非覆寫 window.onscroll，避免覆蓋其他 listener
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ===== 功能 2: 深色/淺色模式切換 (Dark/Light Mode) =====
    const themeSwitch = document.getElementById('theme-switch');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');

    // 函數：應用主題
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeSwitch) themeSwitch.checked = true;
            if (themeIconMoon) themeIconMoon.classList.add('theme-icon-active');
            if (themeIconSun) themeIconSun.classList.remove('theme-icon-active');
        } else {
            document.body.classList.remove('dark-mode');
            if (themeSwitch) themeSwitch.checked = false;
            if (themeIconSun) themeIconSun.classList.add('theme-icon-active');
            if (themeIconMoon) themeIconMoon.classList.remove('theme-icon-active');
        }
    };

    // 檢查 localStorage 中是否已存在主題偏好
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);

    // 如果切換器存在，再綁定事件
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            let theme = themeSwitch.checked ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            applyTheme(theme);
        });
    }

});