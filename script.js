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
    am: { loading: "በመፈለግ ላይ...", read: "ምዕራፎች", back: "ተመለስ", ads: "ማስታወቂያ (በ5 ሰከንድ ይነበባል...)" },
    en: { loading: "Loading...", read: "Chapters", back: "Back", ads: "Ad (Reading in 5s...)" }
};

const languages = [
    { id: 'am', name: 'Amharic', native: '(የአማርኛ ልብወለዶች)', flag: 'https://flagcdn.com/w160/et.png' },
    { id: 'en', name: 'English', native: 'English Novels', flag: 'https://flagcdn.com/w160/gb.png' },
    { id: 'ru', name: 'Russian', native: '(Русские романы)', flag: 'https://flagcdn.com/w160/ru.png' },
    { id: 'pt', name: 'Portuguese', native: '(Romances)', flag: 'https://flagcdn.com/w160/pt.png' }
    // ሌሎችንም ቋንቋዎች እዚህ መጨመር ትችላለህ
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

        listContainer.innerHTML = `<button onclick="renderLanguages()" style="margin-bottom:20px;">⬅️ ${t.back}</button>`;
        
        for (let title in books) {
            const data = books[title];
            const div = document.createElement('div');
            div.className = 'book-card';
            div.innerHTML = `
                <img src="${clean(data.Cover || data.cover)}">
                <div class="book-info">
                    <h3>${title}</h3>
                    <p>ደራሲ፡ ${clean(data.Author || data.author)}</p>
                </div>
                <button class="read-btn">${t.read}</button>`;
            div.onclick = () => showChapters(title, langId);
            listContainer.appendChild(div);
        }
    } catch (e) { alert(e.message); }
}

async function showChapters(bookTitle, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `<h3>${bookTitle}</h3><p style="color:#666;">የምዕራፎች ዝርዝር</p><hr style="border:0; border-top:1px solid #eee; margin:15px 0;">`;

    const snapshot = await db.collection("Novels").get();
    let chapters = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (clean(data.Title || data.title) === bookTitle) {
            chapters.push({ id: doc.id, ...data });
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

    const backBtn = document.createElement('button');
    backBtn.innerHTML = `⬅️ ${t.back}`;
    backBtn.onclick = () => loadNovels(langId);
    backBtn.style = "margin-top:20px; padding:10px; border:none; background:none; color:#0055ff; font-weight:bold;";
    listContainer.appendChild(backBtn);
}

function showAdBeforeChapter(chapter, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    
    listContainer.innerHTML = `
        <div style="padding:80px 20px; text-align:center;">
            <p style="color:#888;">${t.ads}</p>
            <div style="background:#f0f5ff; height:250px; margin:20px 0; display:flex; align-items:center; justify-content:center; border-radius:20px; border:2px dashed #0055ff;">
                <p style="color:#0055ff; font-weight:bold;">የማስታወቂያ ቦታ<br>(የራስህን ፎቶ እዚህ ማስገባት ትችላለህ)</p>
            </div>
        </div>`;
    
    setTimeout(() => { openReader(chapter, langId); }, 5000);
}

function openReader(book, langId) {
    const listContainer = document.getElementById('language-list');
    const title = clean(book.Title || book.title);
    const content = clean(book.Content || book.content);
    const chNum = book.Chapter || book.chapter;

    listContainer.innerHTML = `
        <div class="reader-view">
            <button onclick="showChapters('${title}', '${langId}')" style="margin-bottom:20px;">⬅️ ምዕራፎች</button>
            <h2 style="color:#0055ff; margin-bottom:5px;">${title}</h2>
            <p style="color:#666; margin:0;">ምዕራፍ ${chNum}</p>
            <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
            <div style="white-space: pre-wrap; margin-top:20px;">${content}</div>
        </div>`;
    window.scrollTo(0,0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
