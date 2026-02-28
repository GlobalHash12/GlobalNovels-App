const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();

const firebaseConfig = {
    apiKey: "AIzaSyDmsc0Vpm6cjLeMl9I0W0mjvqS_CYq5oRw",
    authDomain: "globalnovels-73cbb.firebaseapp.com",
    projectId: "globalnovels-73cbb",
    storageBucket: "globalnovels-73cbb.firebasestorage.app",
    messagingSenderId: "473895619878",
    appId: "1:473895619878:web:f1180664018ea99ee245e7"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();

const languages = [
    { id: 'am', name: 'Amharic', native: '(የአማርኛ ልብወለዶች)', flag: 'https://flagcdn.com/w160/et.png' },
    { id: 'en', name: 'English', native: 'English Novels', flag: 'https://flagcdn.com/w160/gb.png' },
    { id: 'id', name: 'Indonesian', native: '(Novel Bahasa Indonesia)', flag: 'https://flagcdn.com/w160/id.png' },
    { id: 'ko', name: 'Korean', native: '(한국 소설)', flag: 'https://flagcdn.com/w160/kr.png' },
    { id: 'ja', name: 'Japanese', native: '(日本の小説)', flag: 'https://flagcdn.com/w160/jp.png' },
    { id: 'ar', name: 'Arabic', native: '(روايات عربية)', flag: 'https://flagcdn.com/w160/sa.png' },
    { id: 'hi', name: 'Hindi', native: '(हिंदी उपन्यास)', flag: 'https://flagcdn.com/w160/in.png' },
    { id: 'zh', name: 'Chinese', native: '(中文小说)', flag: 'https://flagcdn.com/w160/cn.png' },
    { id: 'fr', name: 'French', native: '(Romans français)', flag: 'https://flagcdn.com/w160/fr.png' },
    { id: 'it', name: 'Italian', native: '(Romanzi italiani)', flag: 'https://flagcdn.com/w160/it.png' },
    { id: 'es', name: 'Spanish', native: '(Novelas en español)', flag: 'https://flagcdn.com/w160/es.png' },
    { id: 'de', name: 'German', native: '(Deutsche Romane)', flag: 'https://flagcdn.com/w160/de.png' },
    { id: 'pt', name: 'Portuguese', native: '(Romances portugueses)', flag: 'https://flagcdn.com/w160/pt.png' },
    { id: 'ru', name: 'Russian', native: '(Русские романы)', flag: 'https://flagcdn.com/w160/ru.png' }
];

function renderLanguages() {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '';
    languages.forEach(lang => {
        const div = document.createElement('div');
        div.className = 'lang-item';
        div.innerHTML = `<img src="${lang.flag}" class="lang-flag"><h3>${lang.name}</h3><p>${lang.native}</p>`;
        div.onclick = () => loadNovels(lang.id);
        listContainer.appendChild(div);
    });
}

async function loadNovels(langId) {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '<div>በመፈለግ ላይ...</div>';
    try {
        // "Novels" መዝገብን መፈለግ
        const snapshot = await db.collection("Novels").get();
        let foundBooks = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            // ካፒታል 'Language' ወይም ትንሽ 'language' ቢሆንም ፈልጎ ያገኘዋል
            let dbLang = data.Language || data.language || "";
            dbLang = dbLang.toString().replace(/['"]+/g, '').trim().toLowerCase();
            
            if (dbLang === langId) { foundBooks.push(data); }
        });

        if (foundBooks.length === 0) {
            listContainer.innerHTML = `<button onclick="renderLanguages()">⬅️ ተመለስ</button><p>ለዚህ ቋንቋ (${langId}) መጽሐፍ አልተገኘም!</p>`;
            return;
        }

        listContainer.innerHTML = `<button onclick="renderLanguages()">⬅️ ተመለስ</button>`;
        foundBooks.forEach(data => {
            const div = document.createElement('div');
            div.className = 'book-card';
            const title = (data.Title || data.title || "ርዕስ የለም").toString().replace(/['"]+/g, '');
            const author = (data.Author || data.author || "ደራሲ የለም").toString().replace(/['"]+/g, '');
            const cover = (data.Cover || data.cover || "").toString().replace(/['"]+/g, '');

            div.innerHTML = `
                <img src="${cover}" style="width:100%; height:180px; object-fit:cover; border-radius:10px;">
                <h3>${title}</h3><p>በ ${author}</p>
                <button class="read-btn">አንብብ</button>
            `;
            div.onclick = () => openReader(data);
            listContainer.appendChild(div);
        });
    } catch (e) { alert("ስህተት፡ " + e.message); }
}

function openReader(book) {
    const listContainer = document.getElementById('language-list');
    const content = (book.Content || book.content || "").toString().replace(/['"]+/g, '');
    const title = (book.Title || book.title || "").toString().replace(/['"]+/g, '');
    listContainer.innerHTML = `
        <div class="reader-view">
            <button onclick="renderLanguages()">⬅️ ዝርዝር</button>
            <h2 style="color:#0055ff;">${title}</h2><hr>
            <div style="white-space: pre-wrap; margin-top:20px;">${content}</div>
        </div>
    `;
    window.scrollTo(0,0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
