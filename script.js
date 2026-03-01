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
    am: { loading: "በመፈለግ ላይ...", read: "ምዕራፎች", back: "ተመለስ", ads: "ማስታወቂያ (በ5 ሰከንድ ይነበባል...)", empty: "መጽሐፍ አልተገኘም!" },
    en: { loading: "Loading...", read: "Chapters", back: "Back", ads: "Ad (Reading in 5s...)", empty: "No books found!" }
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

async function loadNovels(langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `<div style="padding:50px;">${t.loading}</div>`;
    
    try {
        const snapshot = await db.collection("Novels").get();
        let books = {}; 

        snapshot.forEach(doc => {
            const data = doc.data();
            const dbLang = clean(data.Language || data.language);
            if (dbLang.toLowerCase() === langId.toLowerCase()) {
                const title = clean(data.Title || data.title);
                if (!books[title]) books[title] = data; 
            }
        });

        if (Object.keys(books).length === 0) {
            listContainer.innerHTML = `<button onclick="renderLanguages()">⬅️ ${t.back}</button><p>${t.empty}</p>`;
            return;
        }

        listContainer.innerHTML = `<button onclick="renderLanguages()" style="margin-bottom:20px;">⬅️ ${t.back}</button>`;
        for (let title in books) {
            const data = books[title];
            const div = document.createElement('div');
            div.className = 'book-card';
            div.innerHTML = `
                <img src="${clean(data.Cover || data.cover)}">
                <div class="book-info"><h3>${title}</h3><p>በ ${clean(data.Author || data.author)}</p></div>
                <button class="read-btn">${t.read}</button>`;
            div.onclick = () => showChapters(title, langId);
            listContainer.appendChild(div);
        }
    } catch (e) { alert(e.message); }
}

async function showChapters(bookTitle, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `<h3>${bookTitle}</h3><p>የምዕራፎች ዝርዝር</p><hr>`;

    try {
        const snapshot = await db.collection("Novels").get();
        let chapters = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (clean(data.Title || data.title) === bookTitle) {
                chapters.push(data);
            }
        });

        chapters.sort((a, b) => (parseInt(a.Chapter || a.chapter) || 0) - (parseInt(b.Chapter || b.chapter) || 0));

        chapters.forEach(ch => {
            const btn = document.createElement('button');
            btn.className = 'chapter-btn';
            btn.innerHTML = `<span>ምዕራፍ ${ch.Chapter || ch.chapter}</span> <span>📖</span>`;
            btn.onclick = () => showAdBeforeChapter(ch, langId);
            listContainer.appendChild(btn);
        });
    } catch (e) { alert(e.message); }
}

function showAdBeforeChapter(chapter, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `
        <div style="padding:80px 20px; text-align:center;">
            <p>${t.ads}</p>
            <div style="background:#f0f5ff; height:250px; margin:20px 0; display:flex; align-items:center; justify-content:center; border-radius:20px; border:2px dashed #0055ff;">
                <p style="color:#0055ff;">ማስታወቂያ እዚህ ይገባል</p>
            </div>
        </div>`;
    setTimeout(() => { openReader(chapter, langId); }, 5000);
}

function openReader(book, langId) {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = `
        <div class="reader-view">
            <button onclick="showChapters('${clean(book.Title || book.title)}', '${langId}')">⬅️ ተመለስ</button>
            <h2 style="color:#0055ff;">${clean(book.Title || book.title)} - ምዕራፍ ${book.Chapter || book.chapter}</h2><hr>
            <div style="white-space: pre-wrap; margin-top:20px;">${clean(book.Content || book.content)}</div>
        </div>`;
    window.scrollTo(0,0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
