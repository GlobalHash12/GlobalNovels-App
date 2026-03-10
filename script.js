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

const translations = {
    am: { loading: "በመፈለግ ላይ...", read: "ምዕራፎች", back: "ተመለስ", ads: "ማስታወቂያ...", empty: "መጽሐፍ የለም!" },
    sw: { loading: "Inatafuta...", read: "Sura", back: "Rudi", ads: "Tangazo...", empty: "Hakuna!" },
    ha: { loading: "Dubawa...", read: "Sura", back: "Koma", ads: "Talla...", empty: "Babu!" },
    en: { loading: "Loading...", read: "Chapters", back: "Back", ads: "Ad...", empty: "No books!" }
};

// 16ቱም ቋንቋዎች በቅደም ተከተል
const languages = [
    { id: 'am', name: 'Amharic', native: '(የአማርኛ ልብወለዶች)', flag: 'https://flagcdn.com/w320/et.png' },
    { id: 'sw', name: 'Swahili', native: '(Riwaya za Kiswahili)', flag: 'https://flagcdn.com/w320/tz.png' },
    { id: 'en', name: 'English', native: 'English Novels', flag: 'https://flagcdn.com/w320/gb.png' },
    { id: 'ha', name: 'Hausa', native: '(Littattafan Hausa)', flag: 'https://flagcdn.com/w320/ng.png' },
    { id: 'id', name: 'Indonesian', native: '(Novel Bahasa Indonesia)', flag: 'https://flagcdn.com/w320/id.png' },
    { id: 'ko', name: 'Korean', native: '(한국 소설)', flag: 'https://flagcdn.com/w320/kr.png' },
    { id: 'ja', name: 'Japanese', native: '(日本の小説)', flag: 'https://flagcdn.com/w320/jp.png' },
    { id: 'ar', name: 'Arabic', native: '(روايات عربية)', flag: 'https://flagcdn.com/w320/sa.png' },
    { id: 'hi', name: 'Hindi', native: '(हिंदी उपन्यास)', flag: 'https://flagcdn.com/w320/in.png' },
    { id: 'zh', name: 'Chinese', native: '(中文小说)', flag: 'https://flagcdn.com/w320/cn.png' },
    { id: 'fr', name: 'French', native: '(Romans français)', flag: 'https://flagcdn.com/w320/fr.png' },
    { id: 'it', name: 'Italian', native: '(Romanzi italiani)', flag: 'https://flagcdn.com/w320/it.png' },
    { id: 'es', name: 'Spanish', native: '(Novelas en español)', flag: 'https://flagcdn.com/w320/es.png' },
    { id: 'de', name: 'German', native: '(Deutsche Romane)', flag: 'https://flagcdn.com/w320/de.png' },
    { id: 'pt', name: 'Portuguese', native: '(Romances em português)', flag: 'https://flagcdn.com/w320/pt.png' },
    { id: 'ru', name: 'Russian', native: '(Русские романы)', flag: 'https://flagcdn.com/w320/ru.png' }
];

function renderLanguages() {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '<h2 style="color:#0055ff; text-align:center; margin-bottom:30px;">Global Novels</h2>';
    languages.forEach(lang => {
        const div = document.createElement('div');
        div.className = 'lang-item';
        div.innerHTML = `<img src="${lang.flag}" class="lang-flag"><h3>${lang.name} Novels</h3><p>${lang.native}</p>`;
        div.onclick = () => loadNovels(lang.id);
        listContainer.appendChild(div);
    });
}

function clean(val) { return val ? val.toString().replace(/['"]+/g, '').trim() : ""; }
function contactUs() { tg.openTelegramLink("https://t.me/GlobalHash12"); }

async function loadNovels(langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `<div style="padding:50px;">${t.loading}</div>`;
    try {
        const snapshot = await db.collection("Novels").get();
        let booksMap = {}; 
        snapshot.forEach(doc => {
            const data = doc.data();
            let dbLang = "";
            for (let key in data) if (key.toLowerCase().trim() === "language") dbLang = clean(data[key]);
            if (dbLang.toLowerCase() === langId.toLowerCase()) {
                let title = clean(data.Title || data.title);
                if (!booksMap[title]) booksMap[title] = data;
            }
        });
        if (Object.keys(booksMap).length === 0) {
            listContainer.innerHTML = `<button class="back-btn" onclick="renderLanguages()">⬅️ ${t.back}</button><p>${t.empty}</p>`;
            return;
        }
        listContainer.innerHTML = `<button class="back-btn" onclick="renderLanguages()">⬅️ ${t.back}</button>`;
        Object.keys(booksMap).forEach(title => {
            const data = booksMap[title];
            let author = clean(data.Author || data.author), cover = clean(data.Cover || data.cover);
            const div = document.createElement('div');
            div.className = 'book-card';
            div.innerHTML = `<img src="${cover || 'https://via.placeholder.com/150'}"><div class="book-info"><h3>${title}</h3><p>በ ${author}</p></div><button class="read-btn">${t.read}</button>`;
            div.onclick = () => showChapters(title, langId);
            listContainer.appendChild(div);
        });
    } catch (e) { alert(e.message); }
}

async function showChapters(bookTitle, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `<button class="back-btn" onclick="loadNovels('${langId}')">⬅️ ${t.back}</button><h3>${bookTitle}</h3><hr>`;
    const snapshot = await db.collection("Novels").get();
    let chapters = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (clean(data.Title || data.title) === bookTitle) chapters.push(data);
    });
    chapters.sort((a, b) => (parseInt(clean(a.Chapter || a.chapter)) || 0) - (parseInt(clean(b.Chapter || b.chapter)) || 0));
    chapters.forEach(ch => {
        const btn = document.createElement('button');
        btn.style = "width:100%; padding:15px; margin-bottom:10px; border:1px solid #eee; border-radius:12px; background:#fff; text-align:left; display:flex; justify-content:space-between;";
        btn.innerHTML = `<span>ምዕራፍ ${clean(ch.Chapter || ch.chapter)}</span> <span>📖</span>`;
        btn.onclick = () => showAdBeforeChapter(ch, langId);
        listContainer.appendChild(btn);
    });
}

function showAdBeforeChapter(chapter, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `<div style="padding:100px 20px; text-align:center;"><p>${t.ads}</p><div style="background:#f0f5ff; height:200px; margin:20px 0; border-radius:20px; border:2px dashed #0055ff; display:flex; align-items:center; justify-content:center; color:#0055ff; font-weight:bold;">የማስታወቂያ ቦታ</div></div>`;
    setTimeout(() => { openReader(chapter, langId); }, 5000);
}

function openReader(book, langId) {
    const listContainer = document.getElementById('language-list');
    let title = clean(book.Title || book.title), content = book.Content || book.content, chNum = clean(book.Chapter || book.chapter);
    listContainer.innerHTML = `<div class="reader-view"><button class="back-btn" onclick="showChapters('${title}', '${langId}')">⬅️ ተመለስ</button><h2 style="color:#0055ff;">${title} - ምዕ ${chNum}</h2><hr><div style="white-space: pre-wrap; margin-top:20px;">${content}</div></div>`;
    window.scrollTo(0,0);
}
document.addEventListener('DOMContentLoaded', renderLanguages);
