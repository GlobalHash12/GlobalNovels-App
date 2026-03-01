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
    am: { loading: "በመፈለግ ላይ...", read: "ምዕራፎች", back: "ተመለስ", ads: "ማስታወቂያ (በ5 ሰከንድ ይነበባል...)", empty: "መጽሐፍ አልተገኘም!", search: "ፈልግ..." },
    en: { loading: "Loading...", read: "Chapters", back: "Back", ads: "Ad (Reading in 5s...)", empty: "No books found!", search: "Search..." }
};

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
    { id: 'it', name: 'Italian', native: '(Romanzi italiani)', flag: 'https://flagcdn.com/w160/it.png' },
    { id: 'es', name: 'Spanish', native: '(Novelas en español)', flag: 'https://flagcdn.com/w160/es.png' },
    { id: 'de', name: 'German', native: '(Deutsche Romane)', flag: 'https://flagcdn.com/w160/de.png' },
    { id: 'pt', name: 'Portuguese', native: '(Romances portugueses)', flag: 'https://flagcdn.com/w160/pt.png' },
    { id: 'ru', name: 'Russian', native: '(Русские романы)', flag: 'https://flagcdn.com/w160/ru.png' }
];

function renderLanguages() {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '<h1 style="color:#0055ff; margin-bottom:30px;">Global Novels</h1>';
    languages.forEach(lang => {
        const div = document.createElement('div');
        div.className = 'lang-item';
        div.innerHTML = `<img src="${lang.flag}" class="lang-flag"><h3>${lang.name}</h3><p>${lang.native}</p>`;
        div.onclick = () => loadNovels(lang.id);
        listContainer.appendChild(div);
    });
}

function clean(val) { return val ? val.toString().replace(/['"]+/g, '').trim() : ""; }

// የኮንታክት ቁልፍ ሲነካ
function contactUs() {
    tg.openTelegramLink("https://t.me/GlobalHash12"); // ያንተን ዩዘርኔም እዚህ ቀይረው
}

// የሰርች ቁልፍ ሲነካ
function toggleSearch() {
    const s = prompt("የመጽሐፍ ስም ያስገቡ:");
    if (s) {
        alert("ፍለጋ በቅርቡ ተግባራዊ ይሆናል! ለአሁን አማርኛን ይጫኑ።");
    }
}

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
                let title = "";
                for (let key in data) if (key.toLowerCase().trim() === "title") title = clean(data[key]);
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
            let author = "", cover = "";
            for (let key in data) {
                let k = key.toLowerCase().trim();
                if (k === "author") author = clean(data[key]);
                if (k === "cover") cover = clean(data[key]);
            }
            const div = document.createElement('div');
            div.className = 'book-card';
            div.innerHTML = `
                <img src="${cover || 'https://via.placeholder.com/150'}">
                <div class="book-info"><h3>${title}</h3><p>በ ${author}</p></div>
                <button class="read-btn">${t.read}</button>`;
            div.onclick = () => showChapters(title, langId);
            listContainer.appendChild(div);
        });
    } catch (e) { alert("Error: " + e.message); }
}

async function showChapters(bookTitle, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    
    // እዚህ ጋር ነው 'ተመለስ' ቁልፍ የጨመርኩት
    listContainer.innerHTML = `
        <button class="back-btn" onclick="loadNovels('${langId}')">⬅️ ${t.back}</button>
        <h3 style="margin-top:10px;">${bookTitle}</h3>
        <p style="color:#666; font-size:14px;">የምዕራፎች ዝርዝር</p><hr>`;

    const snapshot = await db.collection("Novels").get();
    let chapters = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        let currentTitle = "";
        for (let key in data) if (key.toLowerCase().trim() === "title") currentTitle = clean(data[key]);
        if (currentTitle === bookTitle) chapters.push(data);
    });

    chapters.sort((a, b) => {
        let valA = 0, valB = 0;
        for(let k in a) if(k.toLowerCase().trim()==="chapter") valA = parseInt(clean(a[k]));
        for(let k in b) if(k.toLowerCase().trim()==="chapter") valB = parseInt(clean(b[k]));
        return valA - valB;
    });

    chapters.forEach(ch => {
        let chNum = 0;
        for(let k in ch) if(k.toLowerCase().trim()==="chapter") chNum = clean(ch[k]);
        const btn = document.createElement('button');
        btn.className = 'chapter-btn';
        btn.innerHTML = `<span>ምዕራፍ ${chNum}</span> <span>📖</span>`;
        btn.onclick = () => showAdBeforeChapter(ch, langId);
        listContainer.appendChild(btn);
    });
}

function showAdBeforeChapter(chapter, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `<div style="padding:100px 20px; text-align:center;"><p>${t.ads}</p><div style="background:#f0f5ff; height:200px; margin:20px 0; border-radius:20px; border:2px dashed #0055ff; display:flex; align-items:center; justify-content:center;">AD PLACEHOLDER</div></div>`;
    setTimeout(() => { openReader(chapter, langId); }, 5000);
}

function openReader(book, langId) {
    const listContainer = document.getElementById('language-list');
    let title = "", content = "", chNum = "";
    for (let key in book) {
        let k = key.toLowerCase().trim();
        if (k === "title") title = clean(book[key]);
        if (k === "content") content = book[key].toString().replace(/['"]+/g, '');
        if (k === "chapter") chNum = clean(book[key]);
    }
    listContainer.innerHTML = `
        <div class="reader-view">
            <button class="back-btn" onclick="showChapters('${title}', '${langId}')">⬅️ ተመለስ</button>
            <h2 style="color:#0055ff;">${title} - ምዕራፍ ${chNum}</h2><hr>
            <div style="white-space: pre-wrap; margin-top:20px; font-size:19px;">${content}</div>
        </div>`;
    window.scrollTo(0,0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
