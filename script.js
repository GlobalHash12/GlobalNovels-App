// 1. ቴሌግራም ማስጀመር
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// 2. ያንተ የFirebase ቁልፍ (Config)
const firebaseConfig = {
    apiKey: "AIzaSyDmsc0Vpm6cjLeMl9I0W0mjvqS_CYq5oRw",
    authDomain: "globalnovels-73cbb.firebaseapp.com",
    projectId: "globalnovels-73cbb",
    storageBucket: "globalnovels-73cbb.firebasestorage.app",
    messagingSenderId: "473895619878",
    appId: "1:473895619878:web:f1180664018ea99ee245e7"
};

// Firebase መቆራኘት
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 14ቱ ቋንቋዎች
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
        const langDiv = document.createElement('div');
        langDiv.className = 'lang-item';
        langDiv.innerHTML = `
            <img src="${lang.flag}" class="lang-flag">
            <h3>${lang.name} Novels</h3>
            <p>${lang.native}</p>
        `;
        langDiv.onclick = () => loadNovels(lang.id);
        listContainer.appendChild(langDiv);
    });
}

// መጽሐፍትን ማምጣት (በጣም የጠነከረ ፍለጋ)
async function loadNovels(langId) {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = '<div style="padding:50px;">በመፈለግ ላይ...</div>';

    try {
        // 1. መጀመሪያ "Novels" ውስጥ ያለውን ነገር በሙሉ አምጣ (ለማረጋገጥ)
        const snapshot = await db.collection("Novels").get();

        if (snapshot.empty) {
            alert("ዳታቤዙ ውስጥ 'Novels' የሚባል መዝገብ ባዶ ነው!");
            renderLanguages();
            return;
        }

        // 2. አሁን በቋንቋው ብቻ ለይተን እናውጣ
        let foundBooks = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // ቋንቋውን ስናነጻጽር ክፍት ቦታ (Space) ካለ እንዲያጠፋው አድርጌዋለሁ
            if (data.Language && data.Language.trim().toLowerCase() === langId.toLowerCase()) {
                foundBooks.push(data);
            }
        });

        if (foundBooks.length === 0) {
            listContainer.innerHTML = `
                <button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ተመለስ</button>
                <p>ለዚህ ቋንቋ (${langId}) መጽሐፍ አልተገኘም። በዳታቤዝህ 'Language' የሚለው 'am' መሆኑን አረጋግጥ።</p>
            `;
            return;
        }

        // 3. መጽሐፍቱን አሳይ
        listContainer.innerHTML = `<button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ወደ ቋንቋ መምረጫ</button>`;
        foundBooks.forEach(data => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-card';
            bookDiv.innerHTML = `
                <img src="${data.Cover}" style="width:100%; height:200px; object-fit:cover; border-radius:10px; margin-bottom:10px;">
                <h3 style="margin:5px 0;">${data.Title}</h3>
                <p style="margin:5px 0; color:#666;">ደራሲ፡ ${data.Author}</p>
                <button class="read-btn" style="margin-top:10px;">አንብብ</button>
            `;
            bookDiv.onclick = () => openReader(data);
            listContainer.appendChild(bookDiv);
        });

    } catch (error) {
        alert("የFirebase ስህተት፡ " + error.message);
        renderLanguages();
    }
}

function openReader(book) {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = `
        <div class="reader-view">
            <button onclick="renderLanguages()" style="margin-bottom:20px; padding:10px; border-radius:10px;">⬅️ ዝርዝር</button>
            <h1 style="color:#0055ff; margin-bottom:5px;">${book.Title}</h1>
            <p style="color:#666; margin-bottom:20px;">በ ${book.Author}</p>
            <hr>
            <div style="white-space: pre-wrap; margin-top:20px;">
                ${book.Content}
            </div>
        </div>
    `;
    window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', renderLanguages);
