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
    { id: 'ru', name: 'Russian', native: '(Русские романы)', flag: 'https://flagcdn.com/w160/ru.png' }
];

function renderLanguages() {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '<h1 style="color:#0055ff;">Global Novels</h1>';
    languages.forEach(lang => {
        const langDiv = document.createElement('div');
        langDiv.className = 'lang-item';
        langDiv.innerHTML = `<img src="${lang.flag}" class="lang-flag"><h3>${lang.name}</h3><p>${lang.native}</p>`;
        langDiv.onclick = () => loadNovels(lang.id);
        listContainer.appendChild(langDiv);
    });
}

async function loadNovels(langId) {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '<div style="padding:50px;">በመፈለግ ላይ...</div>';

    try {
        // ሁሉንም መዝገቦች (Novels እና novels) በጋራ እንፈትሽ
        let snapshot = await db.collection("Novels").get();
        if (snapshot.empty) {
            snapshot = await db.collection("novels").get();
        }

        if (snapshot.empty) {
            listContainer.innerHTML = `<button onclick="renderLanguages()">⬅️ ተመለስ</button><p>ስህተት፡ ዳታቤዙ ውስጥ 'Novels' የሚባል መዝገብ አልተገኘም!</p>`;
            return;
        }

        let foundBooks = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // በዳታቤዝህ ውስጥ ያለውን የቋንቋ መለያ በሁሉም መንገድ እንፈልገው
            const dbLang = (data.Language || data.language || data.LANGUAGE || "").toString().trim().toLowerCase();
            
            if (dbLang === langId.toLowerCase()) {
                foundBooks.push(data);
            }
        });

        if (foundBooks.length === 0) {
            listContainer.innerHTML = `
                <button onclick="renderLanguages()">⬅️ ተመለስ</button>
                <p>ለቋንቋው (${langId}) መጽሐፍ አልተገኘም።</p>
                <p style="font-size:12px; color:gray;">ፍንጭ፡ ዳታቤዝህ ውስጥ 'Language' የሚለው ቃል 'am' መሆኑን አረጋግጥ።</p>
            `;
            return;
        }

        listContainer.innerHTML = `<button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ተመለስ</button>`;
        foundBooks.forEach(data => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-card';
            // በዳታቤዝህ ያሉት ስሞች (Title, Author, Cover)
            const title = data.Title || data.title || "ርዕስ የለም";
            const author = data.Author || data.author || "ደራሲ የለም";
            const cover = data.Cover || data.cover || "https://via.placeholder.com/150";

            bookDiv.innerHTML = `
                <img src="${cover}" style="width:100%; height:200px; object-fit:cover; border-radius:10px;">
                <h3 style="margin:10px 0;">${title}</h3>
                <p>ደራሲ፡ ${author}</p>
                <button class="read-btn" style="margin-top:10px; background:#0055ff; color:white; border:none; padding:12px; width:100%; border-radius:15px;">አንብብ</button>
            `;
            bookDiv.onclick = () => openReader(data);
            listContainer.appendChild(bookDiv);
        });

    } catch (e) {
        alert("የዳታቤዝ ግንኙነት ተቋርጧል፡ " + e.message);
    }
}

function openReader(book) {
    const listContainer = document.getElementById('language-list');
    const content = book.Content || book.content || "ይዘት የለውም";
    const title = book.Title || book.title || "ርዕስ የለም";
    listContainer.innerHTML = `
        <div class="reader-view" style="text-align:left; padding:15px;">
            <button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ዝርዝር</button>
            <h1 style="color:#0055ff;">${title}</h1>
            <hr>
            <div style="white-space: pre-wrap; margin-top:20px; font-size:18px; line-height:1.9;">${content}</div>
        </div>
    `;
    window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
