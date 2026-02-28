const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();

// ያንተ የFirebase ቁልፍ (100% ትክክለኛ)
const firebaseConfig = {
    apiKey: "AIzaSyDmsc0Vpm6cjLeMl9I0W0mjvqS_CYq5oRw",
    authDomain: "globalnovels-73cbb.firebaseapp.com",
    projectId: "globalnovels-73cbb",
    storageBucket: "globalnovels-73cbb.firebasestorage.app",
    messagingSenderId: "473895619878",
    appId: "1:473895619878:web:f1180664018ea99ee245e7"
};

// Firebase ማስጀመር
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const languages = [
    { id: 'am', name: 'Amharic', native: '(የአማርኛ ልብወለዶች)', flag: 'https://flagcdn.com/w160/et.png' },
    { id: 'en', name: 'English', native: 'English Novels', flag: 'https://flagcdn.com/w160/gb.png' },
    { id: 'id', name: 'Indonesian', native: '(Bahasa Indonesia)', flag: 'https://flagcdn.com/w160/id.png' },
    { id: 'ko', name: 'Korean', native: '(한국 소설)', flag: 'https://flagcdn.com/w160/kr.png' },
    { id: 'ja', name: 'Japanese', native: '(日本の小説)', flag: 'https://flagcdn.com/w160/jp.png' },
    { id: 'ar', name: 'Arabic', native: '(روايات عربية)', flag: 'https://flagcdn.com/w160/sa.png' },
    { id: 'hi', name: 'Hindi', native: '(हिंदी उपन्यास)', flag: 'https://flagcdn.com/w160/in.png' },
    { id: 'zh', name: 'Chinese', native: '(中文小说)', flag: 'https://flagcdn.com/w160/cn.png' },
    { id: 'fr', name: 'French', native: '(Romans français)', flag: 'https://flagcdn.com/w160/fr.png' },
    { id: 'it', name: 'Italian', native: '(Romanzi italioni)', flag: 'https://flagcdn.com/w160/it.png' },
    { id: 'es', name: 'Spanish', native: '(Novelas en español)', flag: 'https://flagcdn.com/w160/es.png' },
    { id: 'de', name: 'German', native: '(Deutsche Romane)', flag: 'https://flagcdn.com/w160/de.png' },
    { id: 'pt', name: 'Portuguese', native: '(Romances portugueses)', flag: 'https://flagcdn.com/w160/pt.png' },
    { id: 'ru', name: 'Russian', native: '(Русские романы)', flag: 'https://flagcdn.com/w160/ru.png' }
];

function renderLanguages() {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '';
    languages.forEach(lang => {
        const langDiv = document.createElement('div');
        langDiv.className = 'lang-item';
        langDiv.innerHTML = `<img src="${lang.flag}" class="lang-flag"><h3>${lang.name} Novels</h3><p>${lang.native}</p>`;
        langDiv.onclick = () => loadNovels(lang.id);
        listContainer.appendChild(langDiv);
    });
}

async function loadNovels(langId) {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '<div style="padding:50px;">በመፈለግ ላይ...</div>';

    try {
        // መዝገቡ Novels (ካፒታል N) መሆኑን አረጋግጫለሁ
        const snapshot = await db.collection("Novels").get();

        if (snapshot.empty) {
            listContainer.innerHTML = `<button onclick="renderLanguages()">⬅️ ተመለስ</button><p>ዳታቤዙ ባዶ ነው (መዝገቡ አልተገኘም)!</p>`;
            return;
        }

        let foundBooks = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // ካፒታል 'Language' ወይም ትንሽ 'language' ቢሆንም እንዲያነብ አድርጌዋለሁ
            const dbLang = (data.Language || data.language || "").toString().trim().toLowerCase();
            if (dbLang === langId.toLowerCase()) {
                foundBooks.push(data);
            }
        });

        if (foundBooks.length === 0) {
            listContainer.innerHTML = `
                <button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ተመለስ</button>
                <p>ለዚህ ቋንቋ (${langId}) መጽሐፍ አልተገኘም!</p>
            `;
            return;
        }

        listContainer.innerHTML = `<button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ተመለስ</button>`;
        foundBooks.forEach(data => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-card';
            // በዳታቤዝህ ያሉት ስሞች (Title, Author, Cover) በትክክል ተገጥመዋል
            const title = data.Title || data.title || "ርዕስ የለም";
            const author = data.Author || data.author || "ደራሲ የለም";
            const cover = data.Cover || data.cover || "https://via.placeholder.com/150";

            bookDiv.innerHTML = `
                <img src="${cover}" style="width:100%; height:200px; object-fit:cover; border-radius:10px;">
                <h3 style="margin:10px 0;">${title}</h3>
                <p>ደራሲ፡ ${author}</p>
                <button class="read-btn" style="background:#0055ff; color:white; border:none; padding:10px; width:100%; border-radius:10px; margin-top:10px;">አንብብ</button>
            `;
            bookDiv.onclick = () => openReader(data);
            listContainer.appendChild(bookDiv);
        });
    } catch (e) {
        alert("የFirebase ስህተት፡ " + e.message);
    }
}

function openReader(book) {
    const listContainer = document.getElementById('language-list');
    const content = book.Content || book.content || "ይዘት የለውም";
    const title = book.Title || book.title || "ርዕስ የለም";
    listContainer.innerHTML = `
        <div style="text-align:left; padding:15px;">
            <button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ዝርዝር</button>
            <h1 style="color:#0055ff;">${title}</h1>
            <hr>
            <div style="white-space: pre-wrap; margin-top:20px; line-height:1.8; font-size:18px;">${content}</div>
        </div>
    `;
    window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
