// Default State defined by AGENT.MD standards + Widget Specs
const DEFAULT_STATE = {
    theme: 'light',
    color: '#ffffff', // Text
    cardColor: '#3b82f6', // Hex Card
    bgColor: 'transparent', // Empty means transparent
    borderColor: '#000000', // Border color
    borderWidth: '0px',
    font: 'oswald',
    size: 'md',
    radius: 'md',
    format: '12h',
    language: 'en',
    showSeconds: false
};

let currentState = { ...DEFAULT_STATE };

// DOMElements
const els = {
    // Settings UI
    trigger: document.getElementById('settings-trigger'),
    panel: document.getElementById('settings-panel'),
    backdrop: document.getElementById('settings-backdrop'),
    closeBtn: document.getElementById('close-settings'),

    // Inputs
    theme: document.getElementById('theme-select'),
    colorInput: document.getElementById('color-input'),
    colorPicker: document.getElementById('color-picker-input'),
    cardColorInput: document.getElementById('card-color-input'),
    cardColorPicker: document.getElementById('card-color-picker-input'),
    bgColorInput: document.getElementById('bg-color-input'),
    bgColorPicker: document.getElementById('bg-color-picker-input'),
    borderColorInput: document.getElementById('border-color-input'),
    borderColorPicker: document.getElementById('border-color-picker-input'),
    borderWidthSelect: document.getElementById('border-width-select'),
    font: document.getElementById('font-select'),
    size: document.getElementById('size-select'),
    radius: document.getElementById('radius-select'),
    format: document.getElementById('format-select'),
    language: document.getElementById('language-select'),
    showSeconds: document.getElementById('show-seconds-toggle'),

    // Embed Generator
    embedUrl: document.getElementById('embed-url'),
    copyBtn: document.getElementById('copy-btn'),
    embedWarning: document.getElementById('embed-warning'),

    // Clock UI
    clockContainer: document.getElementById('clock-container'),
    hours: document.getElementById('unit-hours'),
    minutes: document.getElementById('unit-minutes'),
    seconds: document.getElementById('unit-seconds'),
    amPm: document.getElementById('am-pm-indicator'),
    dayIndicator: document.getElementById('day-indicator'),
    secondsSeparators: document.querySelectorAll('.seconds-separator')
};

// --- SETTINGS MANAGER ---

const i18n = {
    en: {
        title: 'Customize',
        theme: 'Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        textColor: 'Text/Accent Color',
        cardColor: 'Card Color',
        bgColor: 'Background',
        borderColor: 'Border Color',
        borderWidth: 'Border Width',
        borderNone: 'None',
        borderSm: 'Small (1px)',
        borderMd: 'Medium (2px)',
        borderLg: 'Large (4px)',
        fontStyle: 'Font Style',
        fontInter: 'Inter (Modern)',
        fontOswald: 'Oswald (Industrial)',
        fontSpace: 'Space Mono (Tech)',
        size: 'Size',
        sizeSm: 'Small',
        sizeMd: 'Medium',
        sizeLg: 'Large',
        radius: 'Card Radius',
        radiusNone: 'None',
        radiusSm: 'Small',
        radiusMd: 'Medium',
        radiusLg: 'Large',
        radiusMax: 'Maximum',
        format: 'Time Format',
        format12: '12-hour (AM/PM)',
        format24: '24-hour',
        language: 'Language',
        langEn: 'English',
        langId: 'Indonesian',
        showSeconds: 'Show Seconds',
        embedWarning: '⚠️ Settings changed! You must click Copy below and "Replace" the embed link in Notion to save.',
        embedLabel: 'Notion Embed URL',
        copyBtn: 'Copy',
        copiedBtn: 'Copied!',
        helpText: 'Copy link & paste into Notion as an Embed.',
        credits: 'Created by '
    },
    id: {
        title: 'Kustomisasi',
        theme: 'Tema',
        themeLight: 'Terang',
        themeDark: 'Gelap',
        textColor: 'Warna Teks/Aksen',
        cardColor: 'Warna Kartu',
        bgColor: 'Latar Belakang',
        borderColor: 'Warna Border',
        borderWidth: 'Lebar Border',
        borderNone: 'Tidak Ada',
        borderSm: 'Kecil (1px)',
        borderMd: 'Sedang (2px)',
        borderLg: 'Besar (4px)',
        fontStyle: 'Gaya Huruf',
        fontInter: 'Inter (Modern)',
        fontOswald: 'Oswald (Industrial)',
        fontSpace: 'Space Mono (Tech)',
        size: 'Ukuran',
        sizeSm: 'Kecil',
        sizeMd: 'Sedang',
        sizeLg: 'Besar',
        radius: 'Radius Kartu',
        radiusNone: 'Tidak Ada',
        radiusSm: 'Kecil',
        radiusMd: 'Sedang',
        radiusLg: 'Besar',
        radiusMax: 'Maksimum',
        format: 'Format Waktu',
        format12: '12-jam (AM/PM)',
        format24: '24-jam',
        language: 'Bahasa',
        langEn: 'Inggris',
        langId: 'Indonesia',
        showSeconds: 'Tampilkan Detik',
        embedWarning: '⚠️ Pengaturan berubah! Anda harus mengeklik Salin di bawah dan "Ganti" tautan sematan di Notion untuk menyimpan.',
        embedLabel: 'Tautan Sematan Notion',
        copyBtn: 'Salin',
        copiedBtn: 'Tersalin!',
        helpText: 'Salin tautan & tempel ke Notion sebagai Sematan.',
        credits: 'Dibuat oleh '
    }
};

function updateLanguageUI() {
    const lang = i18n[currentState.language] || i18n['en'];

    // Header
    const headerTitle = els.panel.querySelector('.settings-header h2');
    if (headerTitle) headerTitle.textContent = lang.title;

    // Labels
    const labels = els.panel.querySelectorAll('.setting-group label:not(.toggle)');
    labels.forEach(lbl => {
        const forAttr = lbl.getAttribute('for');
        if (forAttr === 'theme-select') lbl.textContent = lang.theme;
        else if (forAttr === 'color-input') lbl.textContent = lang.textColor;
        else if (forAttr === 'card-color-input') lbl.textContent = lang.cardColor;
        else if (forAttr === 'bg-color-input') lbl.textContent = lang.bgColor;
        else if (forAttr === 'border-color-input') lbl.textContent = lang.borderColor;
        else if (forAttr === 'border-width-select') lbl.textContent = lang.borderWidth;
        else if (forAttr === 'font-select') lbl.textContent = lang.fontStyle;
        else if (forAttr === 'size-select') lbl.textContent = lang.size;
        else if (forAttr === 'radius-select') lbl.textContent = lang.radius;
        else if (forAttr === 'format-select') lbl.textContent = lang.format;
        else if (forAttr === 'language-select') lbl.textContent = lang.language;
    });

    // Toggle
    const toggleLabel = els.panel.querySelector('.label-text');
    if (toggleLabel) toggleLabel.textContent = lang.showSeconds;

    // Options
    const setOptionLabel = (selectId, value, text) => {
        const opt = document.querySelector(`#${selectId} option[value="${value}"]`);
        if (opt) opt.textContent = text;
    };

    setOptionLabel('theme-select', 'light', lang.themeLight);
    setOptionLabel('theme-select', 'dark', lang.themeDark);
    setOptionLabel('border-width-select', '0px', lang.borderNone);
    setOptionLabel('border-width-select', '1px', lang.borderSm);
    setOptionLabel('border-width-select', '2px', lang.borderMd);
    setOptionLabel('border-width-select', '4px', lang.borderLg);
    setOptionLabel('font-select', 'inter', lang.fontInter);
    setOptionLabel('font-select', 'oswald', lang.fontOswald);
    setOptionLabel('font-select', 'spacemono', lang.fontSpace);
    setOptionLabel('size-select', 'sm', lang.sizeSm);
    setOptionLabel('size-select', 'md', lang.sizeMd);
    setOptionLabel('size-select', 'lg', lang.sizeLg);
    setOptionLabel('radius-select', 'none', lang.radiusNone);
    setOptionLabel('radius-select', 'sm', lang.radiusSm);
    setOptionLabel('radius-select', 'md', lang.radiusMd);
    setOptionLabel('radius-select', 'lg', lang.radiusLg);
    setOptionLabel('radius-select', 'full', lang.radiusMax);
    setOptionLabel('format-select', '12h', lang.format12);
    setOptionLabel('format-select', '24h', lang.format24);
    setOptionLabel('language-select', 'en', lang.langEn);
    setOptionLabel('language-select', 'id', lang.langId);

    // Footer
    if (els.embedWarning) els.embedWarning.textContent = lang.embedWarning;
    const embedLabel = document.querySelector('label[for="embed-url"]');
    if (embedLabel) embedLabel.textContent = lang.embedLabel;
    if (els.copyBtn && !els.copyBtn.textContent.includes('!') && !els.copyBtn.textContent.includes('Tersalin')) els.copyBtn.textContent = lang.copyBtn;
    const helpText = document.querySelector('.help-text');
    if (helpText) helpText.textContent = lang.helpText;

    const creditP = document.querySelector('.sidebar-credits p');
    if (creditP) {
        creditP.innerHTML = `${lang.credits} <strong>zaidhamzah</strong>`;
    }
}

let isEmbedded = false;

function initSettings() {
    // 1. Parse URL Parameters
    const params = new URLSearchParams(window.location.search);

    // Check if embedded in Notion (hide settings button if so, optionally)
    // For now we keep it, but make it less obtrusive if we want.
    if (params.get('embed') === 'true' || window.self !== window.top) {
        isEmbedded = true;
    }

    objectKeys(DEFAULT_STATE).forEach(key => {
        let val = params.get(key);
        if (val !== null) {
            if (['color', 'cardColor', 'borderColor'].includes(key) && val) {
                val = '#' + val.replace('#', '');
            }
            if (key === 'bgColor' && val && val !== 'transparent') {
                val = '#' + val.replace('#', '');
            }
            if (key === 'showSeconds') val = val === 'true';
            currentState[key] = val;
        }
    });

    // 2. Hydrate UI
    hydrateUI();

    // 3. Apply State to CSS/DOM
    applyState();

    // 4. Generate URL
    generateEmbedUrl();
}

function objectKeys(obj) {
    return Object.keys(obj);
}

function hydrateUI() {
    els.theme.value = currentState.theme;

    const c = currentState.color.replace('#', '');
    els.colorInput.value = c;
    els.colorPicker.value = '#' + c;

    const cc = currentState.cardColor.replace('#', '');
    els.cardColorInput.value = cc;
    els.cardColorPicker.value = '#' + cc;

    const bg = currentState.bgColor.replace('#', '');
    els.bgColorInput.value = bg || '';
    if (bg && bg !== 'transparent') {
        els.bgColorPicker.value = '#' + bg;
    }

    const bc = currentState.borderColor.replace('#', '');
    els.borderColorInput.value = bc;
    els.borderColorPicker.value = '#' + bc;

    els.borderWidthSelect.value = currentState.borderWidth;

    els.font.value = currentState.font;
    els.size.value = currentState.size;
    els.radius.value = currentState.radius;
    els.format.value = currentState.format;
    if (els.language) els.language.value = currentState.language || 'en';
    els.showSeconds.checked = currentState.showSeconds;
}

function applyState() {
    updateLanguageUI();
    const root = document.documentElement;

    // Theme
    if (currentState.theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }

    // Colors
    root.style.setProperty('--accent-color', currentState.color);
    root.style.setProperty('--card-text', currentState.color); // Sync card text color with accent setting
    root.style.setProperty('--card-bg', currentState.cardColor);
    root.style.setProperty('--card-border', currentState.borderColor);
    root.style.setProperty('--border-width', currentState.borderWidth);

    if (currentState.bgColor === 'transparent' || !currentState.bgColor) {
        root.style.setProperty('--bg-color', 'transparent');
    } else {
        root.style.setProperty('--bg-color', currentState.bgColor);
    }

    // Classes for predefined styling
    document.body.className = document.body.className.replace(/font-\S+/g, '');
    document.body.classList.add(`font-${currentState.font}`);

    document.body.className = document.body.className.replace(/size-\S+/g, '');
    document.body.classList.add(`size-${currentState.size}`);

    document.body.className = document.body.className.replace(/radius-\S+/g, '');
    document.body.classList.add(`radius-${currentState.radius}`);

    // Clock display specific
    els.amPm.style.display = currentState.format === '12h' ? 'block' : 'none';
    els.seconds.style.display = currentState.showSeconds ? 'block' : 'none';
    els.secondsSeparators.forEach(s => s.style.display = currentState.showSeconds ? 'block' : 'none');
}

function updateState(key, value) {
    currentState[key] = value;
    applyState();

    // Update URL query string without reloading
    const url = new URL(window.location);
    url.searchParams.set(key, typeof value === 'boolean' ? value : value.replace('#', ''));
    if (key === 'bgColor' && (!value || value === 'transparent')) {
        url.searchParams.set(key, value);
    }
    window.history.replaceState({}, '', url);

    generateEmbedUrl();

    if (isEmbedded && els.embedWarning) {
        els.embedWarning.classList.remove('hidden');
    }
}

function generateEmbedUrl() {
    const url = new URL(window.location);
    url.searchParams.set('embed', 'true'); // add semantic flag
    els.embedUrl.value = url.toString();
}

// --- EVENT LISTENERS ---

els.trigger.addEventListener('click', () => {
    els.panel.classList.remove('hidden');
    els.backdrop.classList.remove('hidden');
});

const closeSettings = () => {
    els.panel.classList.add('hidden');
    els.backdrop.classList.add('hidden');
};

els.closeBtn.addEventListener('click', closeSettings);
els.backdrop.addEventListener('click', closeSettings);

els.theme.addEventListener('change', (e) => updateState('theme', e.target.value));

els.colorInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (val.length === 6) {
        els.colorPicker.value = '#' + val;
        updateState('color', '#' + val);
    }
});
els.colorPicker.addEventListener('input', (e) => {
    els.colorInput.value = e.target.value.replace('#', '');
    updateState('color', e.target.value);
});

els.cardColorInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (val.length === 6) {
        els.cardColorPicker.value = '#' + val;
        updateState('cardColor', '#' + val);
    }
});
els.cardColorPicker.addEventListener('input', (e) => {
    els.cardColorInput.value = e.target.value.replace('#', '');
    updateState('cardColor', e.target.value);
});

els.borderColorInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (val.length === 6) {
        els.borderColorPicker.value = '#' + val;
        updateState('borderColor', '#' + val);
    }
});
els.borderColorPicker.addEventListener('input', (e) => {
    els.borderColorInput.value = e.target.value.replace('#', '');
    updateState('borderColor', e.target.value);
});

els.borderWidthSelect.addEventListener('change', (e) => updateState('borderWidth', e.target.value));

els.bgColorInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (val.toLowerCase() === 'transparent') {
        updateState('bgColor', 'transparent');
    } else if (val.length === 6) {
        els.bgColorPicker.value = '#' + val;
        updateState('bgColor', '#' + val);
    } else if (val === '') {
        updateState('bgColor', '');
    }
});
els.bgColorPicker.addEventListener('input', (e) => {
    els.bgColorInput.value = e.target.value.replace('#', '');
    updateState('bgColor', e.target.value);
});

els.font.addEventListener('change', (e) => updateState('font', e.target.value));
els.size.addEventListener('change', (e) => updateState('size', e.target.value));
els.radius.addEventListener('change', (e) => updateState('radius', e.target.value));
els.format.addEventListener('change', (e) => updateState('format', e.target.value));
if (els.language) els.language.addEventListener('change', (e) => updateState('language', e.target.value));
els.showSeconds.addEventListener('change', (e) => updateState('showSeconds', e.target.checked));

els.copyBtn.addEventListener('click', () => {
    els.embedUrl.select();
    document.execCommand('copy');

    const lang = i18n[currentState.language] || i18n['en'];
    const originalText = lang.copyBtn;
    els.copyBtn.textContent = lang.copiedBtn;
    setTimeout(() => {
        els.copyBtn.textContent = originalText;
    }, 2000);
});

// --- CLOCK ENGINE ---

let timeValues = {
    hours: -1,
    minutes: -1,
    seconds: -1
};

const formatTimeStr = (num) => num < 10 ? `0${num}` : num.toString();

function flipUnit(element, newVal) {
    const top = element.querySelector('.card-top .digit');
    const bottom = element.querySelector('.card-bottom .digit');
    const flipperFront = element.querySelector('.card-flipper .digit');
    const flipperBack = element.querySelector('.card-flipper-back .digit');

    const oldVal = bottom.textContent;
    if (oldVal === newVal) return; // Only flip if changed
    if (oldVal === '00' && newVal === '00') {
        // Init
        top.textContent = newVal;
        bottom.textContent = newVal;
        flipperFront.textContent = newVal;
        flipperBack.textContent = newVal;
        return;
    }

    // Setup Animation
    top.textContent = newVal;
    flipperFront.textContent = oldVal;
    flipperBack.textContent = newVal;
    bottom.textContent = oldVal;

    element.classList.remove('flip-down');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('flip-down');

    // Clean up
    setTimeout(() => {
        element.classList.remove('flip-down');
        top.textContent = newVal;
        bottom.textContent = newVal;
        flipperFront.textContent = newVal;
        flipperBack.textContent = newVal;
    }, 600); // Wait for 0.6s animation duration
}

function updateClock() {
    const now = new Date();

    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    // Handling AM/PM
    const isAm = h < 12;
    if (currentState.format === '12h') {
        h = h % 12 || 12; // convert 0 to 12
        els.amPm.textContent = isAm ? 'AM' : 'PM';
    } else {
        els.amPm.textContent = '';
    }

    // Handling Day
    if (els.dayIndicator) {
        let days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        if (currentState.language === 'id') {
            days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
        }
        els.dayIndicator.textContent = days[now.getDay()];
    }

    const hStr = formatTimeStr(h);
    const mStr = formatTimeStr(m);
    const sStr = formatTimeStr(s);

    if (h !== timeValues.hours) {
        flipUnit(els.hours, hStr);
        timeValues.hours = h;
    }

    if (m !== timeValues.minutes) {
        flipUnit(els.minutes, mStr);
        timeValues.minutes = m;
    }

    if (s !== timeValues.seconds) {
        if (currentState.showSeconds) {
            flipUnit(els.seconds, sStr);
        } else {
            // Keep background state updated without animation
            const bottom = els.seconds.querySelector('.card-bottom .digit');
            bottom.textContent = sStr;
        }
        timeValues.seconds = s;
    }
}

// Initial Boot
initSettings();
updateClock(); // Initialize instantly

// Start Tick
setInterval(updateClock, 1000);
