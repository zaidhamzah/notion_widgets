// Default State defined by AGENT.MD standards + Widget Specs
const DEFAULT_STATE = {
    bgImage: 'https://images.unsplash.com/photo-1506744626753-3398dd67cf26?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3', // Fallback landscape
    bgColor: '#51a1c9',
    font: 'inter',
    language: 'en',

    // Pomodoro specific
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    autoBreak: false,
    autoPomodoro: false
};

let currentState = { ...DEFAULT_STATE };
let isEmbedded = false;

// Timer State
let currentMode = 'work'; // work, short, long
let timeLeft = 0; // in seconds
let isRunning = false;
let timerInterval = null;
let pomodoroCount = 0;

// DOMElements
const els = {
    // Settings UI
    trigger: document.getElementById('settings-trigger'),
    panel: document.getElementById('settings-panel'),
    backdrop: document.getElementById('settings-backdrop'),
    closeBtn: document.getElementById('close-settings'),

    // Universal Inputs
    bgImageInput: document.getElementById('bg-image-input'),
    bgColorInput: document.getElementById('bg-color-input'),
    bgColorPicker: document.getElementById('bg-color-picker-input'),
    font: document.getElementById('font-select'),
    language: document.getElementById('language-select'),

    // Pomodoro Inputs
    workTime: document.getElementById('work-time-input'),
    shortBreak: document.getElementById('short-break-input'),
    longBreak: document.getElementById('long-break-input'),
    autoBreak: document.getElementById('auto-break-toggle'),
    autoPomodoro: document.getElementById('auto-pomodoro-toggle'),

    // Embed Generator
    embedUrl: document.getElementById('embed-url'),
    copyBtn: document.getElementById('copy-btn'),
    embedWarning: document.getElementById('embed-warning'),

    // Clock UI
    timerDisplay: document.getElementById('timer-display'),

    // App Controls
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    modeBtns: document.querySelectorAll('.mode-btn'),

    alarmSound: document.getElementById('alarm-sound')
};

// --- SETTINGS INIT ---

const i18n = {
    en: {
        title: 'Customize',
        bgImage: 'Background Image URL',
        bgColor: 'Background Color (Fallback)',
        fontStyle: 'Font Style',
        fontInter: 'Inter (Modern)',
        fontOswald: 'Oswald (Industrial)',
        fontSpace: 'Space Mono (Tech)',
        language: 'Language',
        langEn: 'English',
        langId: 'Indonesian',
        timerSettings: 'Timer Settings',
        workTime: 'Work Time (Mins)',
        shortBreak: 'Short Break (Mins)',
        longBreak: 'Long Break (Mins)',
        autoBreak: 'Auto-start Breaks',
        autoPomodoro: 'Auto-start Work',
        embedWarning: '⚠️ Settings changed! You must click Copy below and "Replace" the embed link in Notion to save.',
        embedLabel: 'Notion Embed URL',
        copyBtn: 'Copy',
        copiedBtn: 'Copied!',
        helpText: 'Copy link & paste into Notion as an Embed.',
        credits: 'Created by '
    },
    id: {
        title: 'Kustomisasi',
        bgImage: 'URL Gambar Latar',
        bgColor: 'Warna Latar (Cadangan)',
        fontStyle: 'Gaya Huruf',
        fontInter: 'Inter (Modern)',
        fontOswald: 'Oswald (Industrial)',
        fontSpace: 'Space Mono (Tech)',
        language: 'Bahasa',
        langEn: 'Inggris',
        langId: 'Indonesia',
        timerSettings: 'Pengaturan Waktu',
        workTime: 'Waktu Kerja (Menit)',
        shortBreak: 'Istirahat Pendek (Menit)',
        longBreak: 'Istirahat Panjang (Menit)',
        autoBreak: 'Otomatis Mulai Istirahat',
        autoPomodoro: 'Otomatis Mulai Kerja',
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

    // Sections
    const sections = els.panel.querySelectorAll('.settings-section');
    if (sections.length > 1) {
        sections[1].textContent = lang.timerSettings;
    }

    // Labels
    const labels = els.panel.querySelectorAll('.setting-group label:not(.toggle)');
    labels.forEach(lbl => {
        const forAttr = lbl.getAttribute('for');
        if (forAttr === 'bg-image-input') lbl.textContent = lang.bgImage;
        else if (forAttr === 'bg-color-input') lbl.textContent = lang.bgColor;
        else if (forAttr === 'font-select') lbl.textContent = lang.fontStyle;
        else if (forAttr === 'language-select') lbl.textContent = lang.language;
        else if (forAttr === 'work-time-input') lbl.textContent = lang.workTime;
        else if (forAttr === 'short-break-input') lbl.textContent = lang.shortBreak;
        else if (forAttr === 'long-break-input') lbl.textContent = lang.longBreak;
    });

    // Toggle Labels
    const toggleLabels = els.panel.querySelectorAll('.label-text');
    if (toggleLabels.length >= 2) {
        toggleLabels[0].textContent = lang.autoBreak;
        toggleLabels[1].textContent = lang.autoPomodoro;
    }

    // Options
    const setOptionLabel = (selectId, value, text) => {
        const opt = document.querySelector(`#${selectId} option[value="${value}"]`);
        if (opt) opt.textContent = text;
    };

    setOptionLabel('font-select', 'inter', lang.fontInter);
    setOptionLabel('font-select', 'oswald', lang.fontOswald);
    setOptionLabel('font-select', 'spacemono', lang.fontSpace);
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
    if (creditP) creditP.innerHTML = `${lang.credits} <strong>zaidhamzah</strong>`;

    // Quick update for buttons
    let startText = 'Start';
    let pauseText = 'Pause';
    let workText = 'Pomodoro';
    let shortText = 'Short break';
    let longText = 'Long break';

    if (currentState.language === 'id') {
        startText = 'Mulai';
        pauseText = 'Jeda';
        workText = 'Pomodoro';
        shortText = 'Istirahat p.';
        longText = 'Istirahat pjg';
    }

    els.startBtn.textContent = isRunning ? pauseText : startText;
    els.modeBtns[0].textContent = workText;
    els.modeBtns[1].textContent = shortText;
    els.modeBtns[2].textContent = longText;
}

function objectKeys(obj) {
    return Object.keys(obj);
}

function initSettings() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('embed') === 'true' || window.self !== window.top) {
        isEmbedded = true;
    }

    objectKeys(DEFAULT_STATE).forEach(key => {
        let val = params.get(key);
        if (val !== null) {
            if (key === 'bgColor' && val && val !== 'transparent') val = '#' + val.replace('#', '');
            if (key === 'bgImage') val = decodeURIComponent(val); // Decode URL properly
            if (['workTime', 'shortBreak', 'longBreak'].includes(key)) val = parseInt(val) || DEFAULT_STATE[key];
            if (['autoBreak', 'autoPomodoro'].includes(key)) val = val === 'true';
            currentState[key] = val;
        }
    });

    hydrateUI();
    applyState();
    generateEmbedUrl();

    // Initialize Timer
    setMode('work');
}

function hydrateUI() {
    els.bgImageInput.value = currentState.bgImage || '';

    const bg = currentState.bgColor.replace('#', '');
    els.bgColorInput.value = bg || '';
    if (bg && bg !== 'transparent') els.bgColorPicker.value = '#' + bg;

    els.font.value = currentState.font;
    if (els.language) els.language.value = currentState.language || 'en';

    els.workTime.value = currentState.workTime;
    els.shortBreak.value = currentState.shortBreak;
    els.longBreak.value = currentState.longBreak;
    els.autoBreak.checked = currentState.autoBreak;
    els.autoPomodoro.checked = currentState.autoPomodoro;
}

function applyState() {
    updateLanguageUI();
    const root = document.documentElement;

    if (currentState.bgImage) {
        root.style.setProperty('--bg-image', `url('${currentState.bgImage}')`);
    } else {
        root.style.setProperty('--bg-image', 'none');
    }

    if (currentState.bgColor === 'transparent' || !currentState.bgColor) {
        root.style.setProperty('--bg-color', 'transparent');
    } else {
        root.style.setProperty('--bg-color', currentState.bgColor);
    }

    document.body.className = document.body.className.replace(/font-\S+/g, '');
    document.body.classList.add(`font-${currentState.font}`);
}

function updateState(key, value) {
    currentState[key] = value;
    applyState();

    const url = new URL(window.location);
    if (key === 'bgImage') {
        url.searchParams.set(key, encodeURIComponent(value));
    } else {
        url.searchParams.set(key, typeof value === 'boolean' ? value : value.toString().replace('#', ''));
    }

    if (key === 'bgColor' && (!value || value === 'transparent')) {
        url.searchParams.set(key, value);
    }
    if (key === 'bgImage' && !value) {
        url.searchParams.delete(key);
    }
    window.history.replaceState({}, '', url);

    generateEmbedUrl();

    if (isEmbedded && els.embedWarning) {
        els.embedWarning.classList.remove('hidden');
    }
}

function generateEmbedUrl() {
    const url = new URL(window.location);
    url.searchParams.set('embed', 'true');
    els.embedUrl.value = url.toString();
}

// --- CLOCK ENGINE ---

const formatTimeStr = (num) => num < 10 ? `0${num}` : num.toString();

function updateClockDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;

    const mStr = formatTimeStr(m);
    const sStr = formatTimeStr(s);

    els.timerDisplay.textContent = `${mStr}:${sStr}`;
    document.title = `${mStr}:${sStr} - Pomodoro`;
}

// --- TIMER LOGIC ---

function setMode(mode) {
    currentMode = mode;
    pauseTimer();

    els.modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    let mins = currentState.workTime;
    if (mode === 'short') mins = currentState.shortBreak;
    else if (mode === 'long') mins = currentState.longBreak;

    timeLeft = mins * 60;
    updateClockDisplay();
}

function startTimer() {
    if (isRunning) return;
    if (timeLeft <= 0) return;

    isRunning = true;
    els.startBtn.textContent = currentState.language === 'id' ? 'Jeda' : 'Pause';

    timerInterval = setInterval(() => {
        timeLeft--;
        updateClockDisplay();

        if (timeLeft <= 0) handleTimerComplete();
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    els.startBtn.textContent = currentState.language === 'id' ? 'Mulai' : 'Start';
}

function toggleTimer() {
    if (isRunning) pauseTimer();
    else startTimer();
}

function handleTimerComplete() {
    pauseTimer();
    if (els.alarmSound) els.alarmSound.play().catch(e => console.log('Audio play failed', e));

    if (currentMode === 'work') {
        pomodoroCount++;
        const nextMode = (pomodoroCount % 4 === 0) ? 'long' : 'short';
        setMode(nextMode);
        if (currentState.autoBreak) startTimer();
    } else {
        setMode('work');
        if (currentState.autoPomodoro) startTimer();
    }
}

// --- EVENT LISTENERS ---

// Controls
els.startBtn.addEventListener('click', toggleTimer);
els.resetBtn.addEventListener('click', () => setMode(currentMode));

els.modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => setMode(e.target.dataset.mode));
});

// Settings UI 
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

// Settings Handlers
els.bgImageInput.addEventListener('input', (e) => updateState('bgImage', e.target.value));

els.bgColorInput.addEventListener('input', (e) => {
    let val = e.target.value;
    if (val.toLowerCase() === 'transparent') updateState('bgColor', 'transparent');
    else if (val.length === 6) { els.bgColorPicker.value = '#' + val; updateState('bgColor', '#' + val); }
    else if (val === '') updateState('bgColor', '');
});
els.bgColorPicker.addEventListener('input', (e) => {
    els.bgColorInput.value = e.target.value.replace('#', ''); updateState('bgColor', e.target.value);
});

els.font.addEventListener('change', (e) => updateState('font', e.target.value));

// Pomodoro Settings
els.workTime.addEventListener('change', (e) => {
    updateState('workTime', parseInt(e.target.value));
    if (currentMode === 'work') setMode('work');
});
els.shortBreak.addEventListener('change', (e) => {
    updateState('shortBreak', parseInt(e.target.value));
    if (currentMode === 'short') setMode('short');
});
els.longBreak.addEventListener('change', (e) => {
    updateState('longBreak', parseInt(e.target.value));
    if (currentMode === 'long') setMode('long');
});
els.autoBreak.addEventListener('change', (e) => updateState('autoBreak', e.target.checked));
els.autoPomodoro.addEventListener('change', (e) => updateState('autoPomodoro', e.target.checked));

if (els.language) els.language.addEventListener('change', (e) => {
    updateState('language', e.target.value);
});

els.copyBtn.addEventListener('click', () => {
    els.embedUrl.select();
    document.execCommand('copy');

    const originalText = els.copyBtn.textContent;
    els.copyBtn.textContent = currentState.language === 'id' ? 'Tersalin!' : 'Copied!';
    setTimeout(() => { els.copyBtn.textContent = originalText; }, 2000);
});

// Start
initSettings();
