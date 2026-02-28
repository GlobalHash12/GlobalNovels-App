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

// 1. የትርጉም መዝገብ (ለአፑ ቁልፎች)
const translations = {
    am: { loading: "በመፈለግ ላይ...", read: "አንብብ", back: "ተመለስ", empty: "መጽሐፍ አልተገኘም!" },
    en: { loading: "Searching...", read: "Read", back: "Back", empty: "No books found!" },
    id: { loading: "Mencari...", read: "Baca", back: "Kembali", empty: "Buku tidak ditemukan!" },
    ko: { loading: "검색 중...", read: "읽기", back: "뒤로", empty: "책ን 찾을 수 없습니다!" },
    ja: { loading: "検索中...", read: "読む", back: "戻る", empty: "本が見つかりません!" },
    ar: { loading: "جاري البحث...", read: "اقرأ", back: "عودة", empty: "لم يتم العثور على كتب!" },
    hi: { loading: "खोज रहे हैं...", read: "पढ़ें", back: "पीछे", empty: "कोई किताब नहीं मिली!" },
    zh: { loading: "正在搜索...", read: "阅读", back: "返回", empty: "未找到书籍!" },
    fr: { loading: "Recherche...", read: "Lire", back: "Retour", empty: "Aucun livre trouvé!" },
    it: { loading: "Ricerca...", read: "Leggi", back: "Indietro", empty: "Nessun libro trovato!" },
    es: { loading: "Buscando...", read: "Leer", back: "Volver", empty: "¡No se encontraron libros!" },
    de: { loading: "Suchen...", read: "Lesen", back: "Zurück", empty: "Keine Bücher gefunden!" },
    pt: { loading: "Procurando...", read: "Ler", back: "Voltar", empty: "Nenhum livro encontrado!" },
    ru: { loading: "Поиск...", read: "Читать", back: "Назад", empty: "Книг नहीं मिले!" }
};

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
    listContainer.innerHTML = '<h1 style="color:#0055ff;">Global Novels</h1>';
    languages.forEach(lang => {
        const div = document.createElement('div');
        div.className = 'lang-item';
        div.innerHTML = `<img src="${lang.flag}" class="lang-flag"><h3>${lang.name}</h3><p>${lang.native}</p>`;
        div.onclick = () => loadNovels(lang.id);
        listContainer.appendChild(div);
    });
}

// ማንኛውንም ምልክት (እንደ ") እና ክፍት ቦታ የሚያጠፋ
function clean(val) {
    if (!val) return "";
    return val.toString().replace(/['"]+/g, '').trim();
}

async function loadNovels(langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en']; // ትርጉሙን መምረጥ
    
    listContainer.innerHTML = `<div style="padding:50px;">${t.loading}</div>`;
    
    try {
        const snapshot = await db.collection("Novels").get();
        let foundBooks = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            let dbLang = "";
            for (let key in data) {
                if (key.toLowerCase().trim() === "language") dbLang = clean(data[key]);
            }
            if (dbLang.toLowerCase() === langId.toLowerCase()) foundBooks.push(data);
        });

        if (foundBooks.length === 0) {
            listContainer.innerHTML = `<button onclick="renderLanguages()">⬅️ ${t.back}</button><p>${t.empty}</p>`;
            return;
        }

        listContainer.innerHTML = `<button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ${t.back}</button>`;
        
        foundBooks.forEach(data => {
            const div = document.createElement('div');
            div.className = 'book-card';
            
            let title = "", author = "", cover = "";
            for (let key in data) {
                let k = key.toLowerCase().trim();
                if (k === "title") title = clean(data[key]);
                if (k === "author") author = clean(data[key]);
                if (k === "cover") cover = clean(data[key]);
            }

            div.innerHTML = `
                <img src="${cover || 'https://via.placeholder.com/150'}" style="width:100%; height:200px; object-fit:cover; border-radius:10px;">
                <h3 style="margin-top:10px;">${title}</h3>
                <p>ደራሲ፡ ${author}</p>
                <button class="read-btn">${t.read}</button>`;
            div.onclick = () => openReader(data, langId);
            listContainer.appendChild(div);
        });
    } catch (e) { alert("Error: " + e.message); }
}

function openReader(book, langId) {
    const listContainer = document.getElementById('language-list');
    const t = translations[langId] || translations['en'];
    
    let title = "", content = "";
    for (let key in book) {
        let k = key.toLowerCase().trim();
        if (k === "title") title = clean(book[key]);
        if (k === "content") content = book[key].toString().replace(/['"]+/g, '');
    }
    
    listContainer.innerHTML = `
        <div class="reader-view">
            <button onclick="loadNovels('${langId}')" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ${t.back}</button>
            <h2 style="color:#0055ff; border-bottom:1px solid #ddd; padding-bottom:10px;">${title}</h2>
            <div style="white-space: pre-wrap; margin-top:20px; font-size:18px; line-height:1.9;">${content}</div>
        </div>`;
    window.scrollTo(0,0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
