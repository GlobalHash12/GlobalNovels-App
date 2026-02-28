// 1. የቴሌግራም ሚኒ አፕን ማስጀመር
const tg = window.Telegram.WebApp;
tg.ready(); // አፑ ዝግጁ መሆኑን ለቴሌግራም መንገር
tg.expand(); // አፑን ሙሉ ስክሪን ማድረግ

// 2. የ14ቱ ቋንቋዎች መረጃ (Data)
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

// 3. ቋንቋዎቹን በስክሪኑ ላይ የመደርደር ስራ
function renderLanguages() {
    const listContainer = document.getElementById('language-list');
    listContainer.innerHTML = ''; // ያለውን ባዶ ማድረግ

    languages.forEach(lang => {
        // ለእያንዳንዱ ቋንቋ አንድ Div መፍጠር
        const langDiv = document.createElement('div');
        langDiv.className = 'lang-item';
        
        langDiv.innerHTML = `
            <img src="${lang.flag}" alt="${lang.name}" class="lang-flag">
            <h3>${lang.name} Novels</h3>
            <p>${lang.native}</p>
        `;

        // ቋንቋው ሲነካ (Click ሲደረግ)
        langDiv.onclick = () => {
            selectLanguage(lang);
        };

        listContainer.appendChild(langDiv);
    });
}

// 4. ቋንቋ ሲመረጥ የሚሰራ ተግባር
function selectLanguage(lang) {
    // ለሙከራ ያህል የቴሌግራም መልእክት ማሳያ
    tg.showPopup({
        title: 'ቋንቋ ተመርጧል',
        message: `${lang.name} Novels በቅርቡ ይከፈታሉ!`,
        buttons: [{type: 'ok'}]
    });
    
    // ለወደፊቱ እዚህ ጋር ወደ መጽሐፍት ዝርዝር የምንወስድበትን ኮድ እንጨምራለን
}

// አፑ ሲከፈት መደርደሩን ይጀምር
document.addEventListener('DOMContentLoaded', renderLanguages);
