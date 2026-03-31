// Default State defined by AGENT.MD standards + Widget Specs
const DEFAULT_STATE = {
    theme: 'light',
    color: '#3b82f6', // Hex with #
    bgColor: '', // Empty means use default theme background
    font: 'inter',
    size: 'md',
    radius: 'md',
    format: '12h',
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
    bgColorInput: document.getElementById('bg-color-input'),
    bgColorPicker: document.getElementById('bg-color-picker-input'),
    font: document.getElementById('font-select'),
    size: document.getElementById('size-select'),
    radius: document.getElementById('radius-select'),
    format: document.getElementById('format-select'),
    showSeconds: document.getElementById('show-seconds-toggle'),
    
    // Embed Generator
    embedUrl: document.getElementById('embed-url'),
    copyBtn: document.getElementById('copy-btn'),
    
    // Clock UI
    clockContainer: document.getElementById('clock-container'),
    hours: document.getElementById('unit-hours'),
    minutes: document.getElementById('unit-minutes'),
    seconds: document.getElementById('unit-seconds'),
    amPm: document.getElementById('am-pm-indicator'),
    secondsSeparators: document.querySelectorAll('.seconds-separator')
};

// --- SETTINGS MANAGER ---

function initSettings() {
    // 1. Parse URL Parameters
    const params = new URLSearchParams(window.location.search);
    
    // Check if embedded in Notion (hide settings button if so, optionally)
    // For now we keep it, but make it less obtrusive if we want.
    if (params.get('embed') === 'true' || window.self !== window.top) {
        // Notion Embed environment
    }

    objectKeys(DEFAULT_STATE).forEach(key => {
        let val = params.get(key);
        if (val !== null) {
            if (key === 'color' && val) val = '#' + val.replace('#', '');
            if (key === 'bgColor' && val && val !== 'transparent') val = '#' + val.replace('#', '');
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

    const bg = currentState.bgColor.replace('#', '');
    els.bgColorInput.value = bg || '';
    if (bg && bg !== 'transparent') {
        els.bgColorPicker.value = '#' + bg;
    }

    els.font.value = currentState.font;
    els.size.value = currentState.size;
    els.radius.value = currentState.radius;
    els.format.value = currentState.format;
    els.showSeconds.checked = currentState.showSeconds;
}

function applyState() {
    const root = document.documentElement;
    
    // Theme
    if (currentState.theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    // Colors
    root.style.setProperty('--accent-color', currentState.color);
    
    if (currentState.bgColor === 'transparent') {
        root.style.setProperty('--widget-bg', 'transparent');
    } else if (currentState.bgColor) {
        root.style.setProperty('--widget-bg', currentState.bgColor);
    } else {
        root.style.removeProperty('--widget-bg'); // fallback to theme auto bg
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
els.showSeconds.addEventListener('change', (e) => updateState('showSeconds', e.target.checked));

els.copyBtn.addEventListener('click', () => {
    els.embedUrl.select();
    document.execCommand('copy');
    
    const originalText = els.copyBtn.textContent;
    els.copyBtn.textContent = 'Copied!';
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
        bottom.textContent = newVal;
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
