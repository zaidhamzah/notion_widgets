/**
 * Daily Quote Widget Script
 * Handles real-time customization, URL parameter parsing, and Notion Embed generation.
 * Follows the Universal Widget Settings Architecture.
 */

// 1. Default Configuration State
const defaultState = {
    // Standard Config
    theme: 'light',
    color: '#0f172a',
    secondaryColor: '',
    cardColor: '#ffffff',
    bgColor: 'transparent',
    bgImage: '',
    cardOpacity: '1',
    glass: 'false',
    borderColor: '#e2e8f0',
    borderWidth: '1px',
    font: 'inter',
    size: 'md',
    radius: 'md',
    
    // Widget Specific Config
    source: 'quran', // quran | hadith | both
    showArabic: 'true',
    language: 'en',
};

// Current State
let state = { ...defaultState };

// DOM Elements
const qRoot = document.getElementById('widget-root');
const quoteContainer = document.getElementById('quote-container');
const arabicText = document.getElementById('arabic-text');
const translationText = document.getElementById('translation-text');
const quoteSource = document.getElementById('quote-source');
const loader = document.getElementById('loader');
const quoteContent = document.getElementById('quote-content');

// 2. Parse URL Parameters
function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    let stateChanged = false;
    
    // Standard Settings
    if (params.has('theme')) { state.theme = params.get('theme'); stateChanged = true; }
    if (params.has('color')) { state.color = '#' + params.get('color'); stateChanged = true; }
    if (params.has('secondaryColor')) { state.secondaryColor = '#' + params.get('secondaryColor'); stateChanged = true; }
    if (params.has('cardColor')) { 
        let val = params.get('cardColor');
        state.cardColor = val === 'transparent' ? val : '#' + val; 
        stateChanged = true; 
    }
    if (params.has('bgColor')) { 
        let val = params.get('bgColor');
        state.bgColor = val === 'transparent' ? val : '#' + val; 
        stateChanged = true; 
    }
    if (params.has('bgImage')) { state.bgImage = params.get('bgImage'); stateChanged = true; }
    if (params.has('cardOpacity')) { state.cardOpacity = params.get('cardOpacity'); stateChanged = true; }
    if (params.has('glass')) { state.glass = params.get('glass'); stateChanged = true; }
    if (params.has('borderColor')) { state.borderColor = '#' + params.get('borderColor'); stateChanged = true; }
    if (params.has('borderWidth')) { state.borderWidth = params.get('borderWidth'); stateChanged = true; }
    if (params.has('font')) { state.font = params.get('font'); stateChanged = true; }
    if (params.has('size')) { state.size = params.get('size'); stateChanged = true; }
    if (params.has('radius')) { state.radius = params.get('radius'); stateChanged = true; }
    
    // Widget Specific
    if (params.has('source')) { state.source = params.get('source'); stateChanged = true; }
    if (params.has('showArabic')) { state.showArabic = params.get('showArabic'); stateChanged = true; }
    if (params.has('language')) { state.language = params.get('language'); stateChanged = true; }
    
    return stateChanged;
}

// 3. Apply State to UI and CSS Variables
function applyState() {
    const root = document.documentElement;
    
    // Theme
    if (state.theme === 'dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
    }
    
    function hexToRgb(hex) {
        if (!hex || hex === 'transparent') return null;
        let cleanHex = hex.replace('#', '');
        if (cleanHex.length === 3) {
            cleanHex = cleanHex.split('').map(c => c + c).join('');
        }
        if (cleanHex.length !== 6) return null;
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }

    // Colors
    root.style.setProperty('--card-bg', state.cardColor);
    
    if (state.cardColor && state.cardColor !== 'transparent') {
        const rgb = hexToRgb(state.cardColor);
        if (rgb) {
            root.style.setProperty('--card-bg-rgb', rgb);
        }
    } else {
        root.style.setProperty('--card-bg-rgb', state.theme === 'dark' ? '30, 41, 59' : '255, 255, 255');
    }
    
    root.style.setProperty('--card-opacity', state.cardOpacity);

    root.style.setProperty('--bg-color', state.bgColor);

    if (state.bgImage && state.bgImage.trim() !== '') {
        document.body.style.backgroundImage = `url('${state.bgImage}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    } else {
        document.body.style.backgroundImage = 'none';
    }

    root.style.setProperty('--card-text', state.color);
    root.style.setProperty('--accent-color', state.color); 
    if (state.secondaryColor) {
        root.style.setProperty('--text-secondary', state.secondaryColor);
    } else {
        root.style.removeProperty('--text-secondary');
    }
    root.style.setProperty('--card-border', state.borderColor);
    root.style.setProperty('--border-width', state.borderWidth);
    
    // Font
    document.body.classList.remove('font-inter', 'font-oswald', 'font-spacemono');
    document.body.classList.add(`font-${state.font}`);
    
    // Size & Radius
    quoteContainer.className = 'quote-container'; // reset
    quoteContainer.classList.add(`size-${state.size}`);
    quoteContainer.classList.add(`radius-${state.radius}`);
    
    if (state.glass === 'true') {
        quoteContainer.classList.add('glass');
    }
    
    // Widget Specific
    if (state.showArabic === 'true') {
        arabicText.style.display = 'block';
    } else {
        arabicText.style.display = 'none';
    }
    
    // Auto-fit text if the layout footprint changes
    if (typeof autoFitText === 'function') {
        autoFitText();
    }
}

// 4. Update Settings Panel Controls to Match State
function hydrateSettingsUI() {
    document.getElementById('theme-select').value = state.theme;
    
    document.getElementById('color-picker-input').value = state.color;
    document.getElementById('color-input').value = state.color.replace('#', '');
    
    if (state.secondaryColor) {
        document.getElementById('secondary-color-picker-input').value = state.secondaryColor;
        document.getElementById('secondary-color-input').value = state.secondaryColor.replace('#', '');
    } else {
        document.getElementById('secondary-color-picker-input').value = '#64748b'; // generic grey default visual
        document.getElementById('secondary-color-input').value = '';
    }

    if (state.cardColor !== 'transparent') {
        document.getElementById('card-color-picker-input').value = state.cardColor;
        document.getElementById('card-color-input').value = state.cardColor.replace('#', '');
    } else {
        document.getElementById('card-color-input').value = 'transparent';
    }

    if (state.bgColor !== 'transparent') {
        document.getElementById('bg-color-picker-input').value = state.bgColor;
        document.getElementById('bg-color-input').value = state.bgColor.replace('#', '');
    } else {
        document.getElementById('bg-color-input').value = 'transparent';
    }

    document.getElementById('bg-image-input').value = state.bgImage;
    document.getElementById('card-opacity-slider').value = state.cardOpacity;
    document.getElementById('card-opacity-val').textContent = state.cardOpacity;
    document.getElementById('glass-toggle').checked = state.glass === 'true';

    document.getElementById('border-color-picker-input').value = state.borderColor;
    document.getElementById('border-color-input').value = state.borderColor.replace('#', '');
    
    document.getElementById('border-width-select').value = state.borderWidth;
    document.getElementById('font-select').value = state.font;
    document.getElementById('size-select').value = state.size;
    document.getElementById('radius-select').value = state.radius;
    
    // Widget Specific
    document.getElementById('source-select').value = state.source;
    document.getElementById('show-arabic-toggle').checked = state.showArabic === 'true';
    if (document.getElementById('language-select')) {
        document.getElementById('language-select').value = state.language || 'en';
    }
}

// 5. Build Embed URL based on current state
function updateEmbedUrl() {
    const params = new URLSearchParams();
    
    if (state.theme !== defaultState.theme) params.set('theme', state.theme);
    if (state.color !== defaultState.color) params.set('color', state.color.replace('#', ''));
    if (state.secondaryColor !== defaultState.secondaryColor) params.set('secondaryColor', state.secondaryColor.replace('#', ''));
    if (state.cardColor !== defaultState.cardColor) params.set('cardColor', state.cardColor === 'transparent' ? 'transparent' : state.cardColor.replace('#', ''));
    if (state.bgColor !== defaultState.bgColor) params.set('bgColor', state.bgColor === 'transparent' ? 'transparent' : state.bgColor.replace('#', ''));
    if (state.bgImage !== defaultState.bgImage) params.set('bgImage', state.bgImage);
    if (state.cardOpacity !== defaultState.cardOpacity) params.set('cardOpacity', state.cardOpacity);
    if (state.glass !== defaultState.glass) params.set('glass', state.glass);
    if (state.borderColor !== defaultState.borderColor) params.set('borderColor', state.borderColor.replace('#', ''));
    if (state.borderWidth !== defaultState.borderWidth) params.set('borderWidth', state.borderWidth);
    if (state.font !== defaultState.font) params.set('font', state.font);
    if (state.size !== defaultState.size) params.set('size', state.size);
    if (state.radius !== defaultState.radius) params.set('radius', state.radius);
    
    if (state.source !== defaultState.source) params.set('source', state.source);
    if (state.showArabic !== defaultState.showArabic) params.set('showArabic', state.showArabic);
    if (state.language !== defaultState.language) params.set('language', state.language);
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);

    const fullUrl = window.location.origin + newUrl;
    const embedInput = document.getElementById('embed-url');
    embedInput.value = fullUrl;
    
    document.getElementById('embed-warning').classList.remove('hidden');
}

// Settings Event Listeners Binding
function attachEventListeners() {
    // Theme
    document.getElementById('theme-select').addEventListener('change', (e) => {
        state.theme = e.target.value;
        applyState(); updateEmbedUrl();
    });
    
    // Color
    document.getElementById('color-picker-input').addEventListener('input', (e) => {
        state.color = e.target.value;
        document.getElementById('color-input').value = state.color.replace('#', '');
        applyState(); updateEmbedUrl();
    });
    document.getElementById('color-input').addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^[0-9A-Fa-f]{6}$/.test(val)) {
            state.color = '#' + val;
            document.getElementById('color-picker-input').value = '#' + val;
            applyState(); updateEmbedUrl();
        }
    });
    
    // Secondary Color
    document.getElementById('secondary-color-picker-input').addEventListener('input', (e) => {
        state.secondaryColor = e.target.value;
        document.getElementById('secondary-color-input').value = state.secondaryColor.replace('#', '');
        applyState(); updateEmbedUrl();
    });
    document.getElementById('secondary-color-input').addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val === '') {
            state.secondaryColor = '';
            applyState(); updateEmbedUrl();
        } else if (/^[0-9A-Fa-f]{6}$/.test(val)) {
            state.secondaryColor = '#' + val;
            document.getElementById('secondary-color-picker-input').value = '#' + val;
            applyState(); updateEmbedUrl();
        }
    });

    // Card Color
    document.getElementById('card-color-picker-input').addEventListener('input', (e) => {
        state.cardColor = e.target.value;
        document.getElementById('card-color-input').value = state.cardColor.replace('#', '');
        applyState(); updateEmbedUrl();
    });
    document.getElementById('card-color-input').addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.toLowerCase() === 'transparent') {
            state.cardColor = 'transparent';
            applyState(); updateEmbedUrl();
        } else if (/^[0-9A-Fa-f]{6}$/.test(val)) {
            state.cardColor = '#' + val;
            document.getElementById('card-color-picker-input').value = '#' + val;
            applyState(); updateEmbedUrl();
        }
    });

    // Background Color
    document.getElementById('bg-color-picker-input').addEventListener('input', (e) => {
        state.bgColor = e.target.value;
        document.getElementById('bg-color-input').value = state.bgColor.replace('#', '');
        applyState(); updateEmbedUrl();
    });
    document.getElementById('bg-color-input').addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.toLowerCase() === 'transparent') {
            state.bgColor = 'transparent';
            applyState(); updateEmbedUrl();
        } else if (/^[0-9A-Fa-f]{6}$/.test(val)) {
            state.bgColor = '#' + val;
            document.getElementById('bg-color-picker-input').value = '#' + val;
            applyState(); updateEmbedUrl();
        }
    });

    // Background Image
    document.getElementById('bg-image-input').addEventListener('input', (e) => {
        state.bgImage = e.target.value.trim();
        applyState(); updateEmbedUrl();
    });

    // Option Opacity
    document.getElementById('card-opacity-slider').addEventListener('input', (e) => {
        state.cardOpacity = e.target.value;
        document.getElementById('card-opacity-val').textContent = e.target.value;
        applyState(); updateEmbedUrl();
    });

    // Glassmorphism
    document.getElementById('glass-toggle').addEventListener('change', (e) => {
        state.glass = e.target.checked ? 'true' : 'false';
        applyState(); updateEmbedUrl();
    });

    // Border Color
    document.getElementById('border-color-picker-input').addEventListener('input', (e) => {
        state.borderColor = e.target.value;
        document.getElementById('border-color-input').value = state.borderColor.replace('#', '');
        applyState(); updateEmbedUrl();
    });
    document.getElementById('border-color-input').addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^[0-9A-Fa-f]{6}$/.test(val)) {
            state.borderColor = '#' + val;
            document.getElementById('border-color-picker-input').value = '#' + val;
            applyState(); updateEmbedUrl();
        }
    });

    // Selects
    document.getElementById('border-width-select').addEventListener('change', (e) => {
        state.borderWidth = e.target.value;
        applyState(); updateEmbedUrl();
    });
    document.getElementById('font-select').addEventListener('change', (e) => {
        state.font = e.target.value;
        applyState(); updateEmbedUrl();
    });
    document.getElementById('size-select').addEventListener('change', (e) => {
        state.size = e.target.value;
        applyState(); updateEmbedUrl();
    });
    document.getElementById('radius-select').addEventListener('change', (e) => {
        state.radius = e.target.value;
        applyState(); updateEmbedUrl();
    });
    
    // specific toggles
    document.getElementById('source-select').addEventListener('change', (e) => {
        state.source = e.target.value;
        applyState(); updateEmbedUrl();
        fetchQuote(); // re-fetch when source changes
    });
    
    document.getElementById('language-select').addEventListener('change', (e) => {
        state.language = e.target.value;
        applyState(); updateEmbedUrl();
        fetchQuote(); // re-fetch when language changes
    });

    document.getElementById('show-arabic-toggle').addEventListener('change', (e) => {
        state.showArabic = e.target.checked ? 'true' : 'false';
        applyState(); updateEmbedUrl();
    });

    // Settings Sidebar Toggles
    const settingsTrigger = document.getElementById('settings-trigger');
    const closeSettings = document.getElementById('close-settings');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsBackdrop = document.getElementById('settings-backdrop');

    function openSettings() {
        settingsPanel.classList.remove('hidden');
        settingsBackdrop.classList.remove('hidden');
    }

    function closeSettingsPanel() {
        settingsPanel.classList.add('hidden');
        settingsBackdrop.classList.add('hidden');
    }

    settingsTrigger.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettingsPanel);
    settingsBackdrop.addEventListener('click', closeSettingsPanel);

    // Copy Button
    document.getElementById('copy-btn').addEventListener('click', () => {
        const urlInput = document.getElementById('embed-url');
        urlInput.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copy-btn');
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2000);
        
        document.getElementById('embed-warning').classList.add('hidden');
    });
}

// ==========================================
// WIDGET SPECIFIC LOGIC: DATA FETCHING
// ==========================================

const MAX_QURAN_AYAH = 6236;
const MAX_HADITH_BUKHARI = 7560; // Max Bukhari hadiths in the API

async function fetchQuote(retryCount = 0) {
    if (retryCount > 3) {
        // Fallback if API continually fails
        const fallbackText = state.language === 'id' ? "Sesungguhnya sesudah kesulitan itu ada kemudahan." : "Indeed, with hardship [will be] ease.";
        setQuoteData(
            "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
            fallbackText,
            "Quran", "94:6"
        );
        return;
    }

    quoteContent.style.display = 'none';
    loader.style.display = 'block';

    let currentSource = state.source;
    if (currentSource === 'both') {
        currentSource = Math.random() > 0.5 ? 'quran' : 'hadith';
    }

    try {
        if (currentSource === 'quran') {
            const randomAyahId = Math.floor(Math.random() * MAX_QURAN_AYAH) + 1;
            const quranLang = state.language === 'id' ? 'id.indonesian' : 'en.asad';
            
            // Promise.all to fetch both Arabic (uthmani text) and selected translation
            const [arRes, enRes] = await Promise.all([
                fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahId}/quran-uthmani`),
                fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahId}/${quranLang}`)
            ]);

            if (!arRes.ok || !enRes.ok) throw new Error("Quran Fetch Failed");

            const arData = await arRes.json();
            const enData = await enRes.json();

            setQuoteData(
                arData.data.text,
                enData.data.text,
                "Quran",
                `${enData.data.surah.englishName} ${enData.data.surah.number}:${enData.data.numberInSurah}`
            );

        } else {
            // Hadith (Bukhari)
            const randomHadithId = Math.floor(Math.random() * MAX_HADITH_BUKHARI) + 1;
            const hadithLang = state.language === 'id' ? 'ind-bukhari' : 'eng-bukhari';
            
            const [arRes, enRes] = await Promise.all([
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari/${randomHadithId}.min.json`),
                fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${hadithLang}/${randomHadithId}.min.json`)
            ]);
            
            if (!arRes.ok || !enRes.ok) {
                // If 404 (missing hadith ID), try again immediately
                return fetchQuote(retryCount + 1);
            }

            const arData = await arRes.json();
            const enData = await enRes.json();
            
            const arText = arData.hadiths[0].text;
            const enText = enData.hadiths[0].text.replace(/\n+/g, ' ').trim();
            const bookName = enData.metadata.name;
            const refBook = enData.hadiths[0].reference.book;
            const refHadith = enData.hadiths[0].reference.hadith;
            
            setQuoteData(
                arText,
                enText,
                bookName,
                `Book ${refBook}, Hadith ${refHadith}`
            );
        }
    } catch (err) {
        console.error(err);
        fetchQuote(retryCount + 1);
    }
}

function setQuoteData(arabic, english, sourceName, reference) {
    arabicText.innerText = arabic;
    translationText.innerText = `"${english}"`;
    quoteSource.innerHTML = `${sourceName} &mdash; <span>${reference}</span>`;
    
    loader.style.display = 'none';
    quoteContent.style.display = 'block';
    
    autoFitText();
}

function autoFitText() {
    if (quoteContent.style.display === 'none') return;
    
    // Reset scale to recalculate from base values
    quoteContainer.style.setProperty('--text-scale', '1');
    
    // Wait for the browser to apply the unscaled font sizes and compute layout
    setTimeout(() => {
        let textScale = 1.0;
        const availableHeight = window.innerHeight - 40; // Maintain margin/padding limits
        
        const checkFit = () => {
             const rect = quoteContainer.getBoundingClientRect();
             return rect.height <= availableHeight;
        };

        // Progressively scale down until everything fits vertically, down to a minimum of 0.3
        while (!checkFit() && textScale > 0.3) {
            textScale -= 0.05;
            quoteContainer.style.setProperty('--text-scale', textScale.toString());
        }
    }, 10);
}

// ------------------------------------------

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('resize', autoFitText);
    
    // Bind refresh button to fetch a new quote
    document.getElementById('refresh-trigger').addEventListener('click', () => {
        fetchQuote();
    });

    const stateChanged = parseUrlParams();
    applyState();
    hydrateSettingsUI();
    attachEventListeners();
    
    const urlInput = document.getElementById('embed-url');
    urlInput.value = window.location.href;

    // Fetch the data
    fetchQuote();
});
