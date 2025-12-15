import { collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

// 這裡放入你要新增的所有課程資料
const coursesData = [
    {
        code: "1141_6666",
        title: "美術館大探索",
        type: "必修",
        department: "加分加到系",
        teacher: "Rivers",
        description: "取得鑰匙者加6分！深入了解當代藝術與策展實務。",
        progress: 75,
        link: "#",
        image: "image/李至軒.jpg"
    },
    {
        code: "1141_0770",
        title: "前端工程設計",
        type: "選修",
        department: "數位科技設計系",
        teacher: "齊山",
        description: "電腦教室不能吃優格:L。",
        progress: 90,
        link: "#",
        image: "image/齊山.jpg"
    },
    {
        code: "1141_4444",
        title: "沒有邏輯",
        type: "跨校通識",
        department: "哲學系",
        teacher: "我忘了",
        description: "台大的邏輯課",
        progress: 0,
        link: "#",
        image: "https://placehold.co/600x400/000000/ffffff?text=Logic :L"
    },
    {
        code: "1141_0555",
        title: "爬山實戰",
        type: "通識",
        department: "文創系",
        teacher: "展立",
        description: "運動身體好",
        progress: 10,
        link: "#",
        image: "https://placehold.co/600x400/000000/ffffff?text=Mt. Climbing"
    },
    {
        code: "1141_0999",
        title: "多媒體設計",
        type: "選修",
        department: "數位科技設計系",
        teacher: "Rivers",
        description: "為啥上Blender？朱如不要亂來",
        progress: 30,
        link: "#",
        image: "https://placehold.co/600x400/8B0000/ffffff?text=Why Blender?"
    }
];

// 執行匯入功能的函式
async function importCourses() {
    console.log("開始匯入課程...");
    
    for (const course of coursesData) {
        try {
            // 使用 setDoc，並指定文件 ID 為課程代碼 (這樣比較好找)
            // 如果你希望 ID 是亂碼，把 doc(db, "all_courses", course.code) 改成 doc(collection(db, "all_courses")) 即可
            
            // 注意：這裡集合名稱要跟你資料庫的一樣 (all_courses 或 all_course)
            // 看你的截圖，你是用單數 "all_course"，請確認這裡
            const collectionName = "all_course"; 

            await setDoc(doc(db, collectionName, course.code), course);
            console.log(`成功匯入: ${course.title}`);
        } catch (error) {
            console.error(`匯入失敗 (${course.title}):`, error);
        }
    }
    
    alert("所有課程匯入完成！請去 Firebase Console 檢查。");
}

// 綁定到 window 以便在 Console 呼叫，或是直接執行
window.importCourses = importCourses;