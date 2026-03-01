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

// የትርጉም መዝገብ - 14ቱም ቋንቋዎች
const translations = {
    am: { loading: "በመፈለግ ላይ...", read: "ምዕራፎች", back: "ተመለስ", ads: "ማስታወቂያ...", empty: "መጽሐፍ የለም!" },
    en: { loading: "Loading...", read: "Chapters", back: "Back", ads: "Ad...", empty: "No books!" },
    id: { loading: "Memuat...", read: "Bab", back: "Kembali", ads: "Iklan...", empty: "Tidak ada!" },
    ko: { loading: "로딩 중...", read: "장", back: "뒤로", ads: "광고...", empty: "책 없음!" },
    ja: { loading: "読み込み中...", read: "章", back: "戻る", ads: "広告...", empty: "本なし!" },
    ar: { loading: "جاري التحميل...", read: "فصول", back: "رجوع", ads: "إعلان...", empty: "لا يوجد!" },
    hi: { loading: "लोड हो रहा है...", read: "अध्याय", back: "पीछे", ads: "विज्ञापन...", empty: "कोई किताब नहीं!" },
    zh: { loading: "加载中...", read: "章节", back: "返回", ads: "广告...", empty: "无书籍!" },
    fr: { loading: "Chargement...", read: "Chapitres", back: "Retour", ads: "Publicité...", empty: "Aucun!" },
    it: { loading: "Caricamento...", read: "Capitoli", back: "Indietro", ads: "Pubblicità...", empty: "Nessuno!" },
    es: { loading: "Cargando...", read: "Capítulos", back: "Volver", ads: "Anuncio...", empty: "¡No hay!" },
    de: { loading: "Laden...", read: "Kapitel", back: "Zurück", ads: "Anzeige...", empty: "Keine!" },
    pt: { loading: "Carregando...", read: "Capítulos", back: "Voltar", ads: "Anúncio...", empty: "Nenhum!" },
    ru: { loading: "Загрузка...", read: "Главы", back: "Назад", ads: "Реклама...", empty: "Книг нет!" }
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
    listContainer.innerHTML = '<h2 style="color:#0055ff; text-align:center; margin-bottom:20px;">Global Novels</h2>';
    languages.forEach(lang => {
        const div = document.createElement('div');
        div.className = 'lang-item';
        div.innerHTML = `<img src="${lang.flag}" class="lang-flag"><h3>${lang.name}</h3><p>${lang.native}</p>`;
        div.onclick = () => loadNovels(lang.id);
        listContainer.appendChild(div);
    });
}

function clean(val) { return val ? val.toString().replace(/['"]+/g, '').trim() : ""; }
function contactUs() { tg.openTelegramLink("https://t.me/GlobalHash12"); }
function toggleSearch() { alert("የፍለጋ ሲስተም በቅርቡ ይጀምራል!"); }

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
            div.innerHTML = `<img src="${cover || 'https://via.placeholder.com/150'}"><div class="book-info"><h3>${title}</h3><p>በ ${author}</p></div><button class="read-btn">${t.read}</button>`;
            div.onclick = () => showChapters(title, langId);
            listContainer.appendChild(div);
        });
    } catch (e) { alert(e.message); }
}

async function showChapters(bookTitle, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    listContainer.innerHTML = `<button class="back-btn" onclick="loadNovels('${langId}')">⬅️ ${t.back}</button><h3>${bookTitle}</h3><p style="color:#666;">የምዕራፎች ዝርዝር</p><hr>`;

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
    listContainer.innerHTML = `<div style="padding:100px 20px; text-align:center;"><p>${t.ads}</p><div style="background:#f0f5ff; height:200px; margin:20px 0; border-radius:20px; border:2px dashed #0055ff; display:flex; align-items:center; justify-content:center; color:#0055ff; font-weight:bold;">የማስታወቂያ ቦታ</div></div>`;
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
            <h2 style="color:#0055ff; margin-bottom:5px;">${title} - ምዕራፍ ${chNum}</h2><hr>
            <div style="white-space: pre-wrap; margin-top:20px;">${content}</div>
        </div>`;
    window.scrollTo(0,0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
