// State Management
const DEFAULT_STATE = {
    theme: 'light',
    color: '3b82f6', // Accent color
    textColor: '',
    textDimColor: '',
    cardColor: 'ffffff',
    bgColor: 'transparent',
    borderColor: 'e2e8f0',
    borderWidth: '0px',
    font: 'inter',
    size: 'md',
    radius: 'md',
    language: 'en',
    
    // Widget Specific
    location: 'New York',
    unit: 'celsius', // celsius | fahrenheit
    layout: 'horizontal' // horizontal | vertical
};

const state = { ...DEFAULT_STATE };
let weatherDataCache = null;

const i18n = {
    en: {
        title: 'Customize',
        location: 'Location',
        unit: 'Temperature Unit',
        layout: 'Widget Layout',
        layoutHoriz: 'Horizontal Row',
        layoutVert: 'Vertical Stack',
        unitC: 'Celsius (°C)',
        unitF: 'Fahrenheit (°F)',
        theme: 'Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        textColor: 'Accent Color',
        primaryTextColor: 'Primary Text Color',
        secondaryTextColor: 'Secondary Text Color',
        cardColor: 'Card Body Color',
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
        size: 'Scale / Size',
        sizeSm: 'Small',
        sizeMd: 'Medium',
        sizeLg: 'Large',
        radius: 'Card Radius',
        radiusNone: 'None',
        radiusSm: 'Small',
        radiusMd: 'Medium',
        radiusLg: 'Large',
        radiusMax: 'Maximum',
        language: 'Language',
        langEn: 'English',
        langId: 'Indonesian',
        embedWarning: '⚠️ Settings changed! You must click Copy below and "Replace" the embed link in Notion to save.',
        embedLabel: 'Notion Embed URL',
        copyBtn: 'Copy',
        copiedBtn: 'Copied!',
        helpText: 'Copy link & paste into Notion as an Embed.',
        credits: 'Created by ',
        wind: 'Wind',
        humidity: 'Humidity'
    },
    id: {
        title: 'Kustomisasi',
        location: 'Lokasi',
        unit: 'Unit Suhu',
        layout: 'Tata Letak Widget',
        layoutHoriz: 'Baris Horizontal',
        layoutVert: 'Tumpukan Vertikal',
        unitC: 'Celsius (°C)',
        unitF: 'Fahrenheit (°F)',
        theme: 'Tema',
        themeLight: 'Terang',
        themeDark: 'Gelap',
        textColor: 'Warna Aksen',
        primaryTextColor: 'Warna Teks Utama',
        secondaryTextColor: 'Warna Teks Sekunder',
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
        language: 'Bahasa',
        langEn: 'Inggris',
        langId: 'Indonesia',
        embedWarning: '⚠️ Pengaturan berubah! Anda harus mengeklik Salin di bawah dan "Ganti" tautan sematan di Notion untuk menyimpan.',
        embedLabel: 'Tautan Sematan Notion',
        copyBtn: 'Salin',
        copiedBtn: 'Tersalin!',
        helpText: 'Salin tautan & tempel ke Notion sebagai Sematan.',
        credits: 'Dibuat oleh ',
        wind: 'Angin',
        humidity: 'Kelembapan'
    }
};

function updateLanguageUI() {
    const lang = i18n[state.language] || i18n['en'];

    const headerTitle = document.querySelector('.settings-header h2');
    if (headerTitle) headerTitle.textContent = lang.title;

    const labels = document.querySelectorAll('.setting-group label:not(.toggle)');
    labels.forEach(lbl => {
        const forAttr = lbl.getAttribute('for');
        if (forAttr === 'location-input') lbl.textContent = lang.location;
        else if (forAttr === 'unit-select') lbl.textContent = lang.unit;
        else if (forAttr === 'layout-select') lbl.textContent = lang.layout;
        else if (forAttr === 'theme-select') lbl.textContent = lang.theme;
        else if (forAttr === 'color-input') lbl.textContent = lang.textColor;
        else if (forAttr === 'text-color-input') lbl.textContent = lang.primaryTextColor;
        else if (forAttr === 'text-dim-color-input') lbl.textContent = lang.secondaryTextColor;
        else if (forAttr === 'card-color-input') lbl.textContent = lang.cardColor;
        else if (forAttr === 'bg-color-input') lbl.textContent = lang.bgColor;
        else if (forAttr === 'border-color-input') lbl.textContent = lang.borderColor;
        else if (forAttr === 'border-width-select') lbl.textContent = lang.borderWidth;
        else if (forAttr === 'font-select') lbl.textContent = lang.fontStyle;
        else if (forAttr === 'size-select') lbl.textContent = lang.size;
        else if (forAttr === 'radius-select') lbl.textContent = lang.radius;
        else if (forAttr === 'language-select') lbl.textContent = lang.language;
    });

    const setOptionLabel = (selectId, value, text) => {
        const opt = document.querySelector(`#${selectId} option[value="${value}"]`);
        if (opt) opt.textContent = text;
    };

    setOptionLabel('unit-select', 'celsius', lang.unitC);
    setOptionLabel('unit-select', 'fahrenheit', lang.unitF);
    setOptionLabel('layout-select', 'horizontal', lang.layoutHoriz);
    setOptionLabel('layout-select', 'vertical', lang.layoutVert);
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
    setOptionLabel('language-select', 'en', lang.langEn);
    setOptionLabel('language-select', 'id', lang.langId);

    if (embedWarning) embedWarning.textContent = lang.embedWarning;
    const embedLabel = document.querySelector('label[for="embed-url"]');
    if (embedLabel) embedLabel.textContent = lang.embedLabel;
    if (copyBtn && !copyBtn.textContent.includes('!') && !copyBtn.textContent.includes('Tersalin')) copyBtn.textContent = lang.copyBtn;
    const helpText = document.querySelector('.help-text');
    if (helpText) helpText.textContent = lang.helpText;

    const creditP = document.querySelector('.sidebar-credits p');
    if (creditP) {
        creditP.innerHTML = `${lang.credits} <strong>zaidhamzah</strong>`;
    }
}

// SVG Icons that inherit color via currentColor
const ICONS = {
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M5 5l1.5 1.5"/><path d="M17.5 17.5L19 19"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M5 19l1.5-1.5"/><path d="M17.5 5.5L19 4"/></svg>',
    cloudSun: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M5 5l1.5 1.5"/><path d="M19 4l-1.5 1.5"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M12 20h.01"/><path d="M17 18h2a3 3 0 0 0 0-6 4 4 0 0 0-7.88-1A2.5 2.5 0 0 0 5 13.5v.5"/></svg>',
    cloud: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
    cloudRain: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>',
    cloudSnow: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></svg>',
    cloudLightning: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>',
    cloudFog: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H8"/></svg>'
};

// Weather Icons Map (WMO Weather interpretation codes)
const WEATHER_CODES = {
    0: { id: 'Cerah', en: 'Clear sky', icon: ICONS.sun },
    1: { id: 'Umumnya Cerah', en: 'Mainly clear', icon: ICONS.cloudSun },
    2: { id: 'Berawan Sebagian', en: 'Partly cloudy', icon: ICONS.cloudSun },
    3: { id: 'Mendung', en: 'Overcast', icon: ICONS.cloud },
    45: { id: 'Berkabut', en: 'Fog', icon: ICONS.cloudFog },
    48: { id: 'Kabut Es', en: 'Depositing rime fog', icon: ICONS.cloudFog },
    51: { id: 'Gerimis Ringan', en: 'Drizzle: Light', icon: ICONS.cloudRain },
    53: { id: 'Gerimis Sedang', en: 'Drizzle: Moderate', icon: ICONS.cloudRain },
    55: { id: 'Gerimis Lebat', en: 'Drizzle: Dense intensity', icon: ICONS.cloudRain },
    56: { id: 'Gerimis Beku Ringan', en: 'Freezing Drizzle: Light', icon: ICONS.cloudRain },
    57: { id: 'Gerimis Beku Lebat', en: 'Freezing Drizzle: Dense', icon: ICONS.cloudRain },
    61: { id: 'Hujan Ringan', en: 'Rain: Slight', icon: ICONS.cloudRain },
    63: { id: 'Hujan Sedang', en: 'Rain: Moderate', icon: ICONS.cloudRain },
    65: { id: 'Hujan Lebat', en: 'Rain: Heavy', icon: ICONS.cloudRain },
    66: { id: 'Hujan Beku Ringan', en: 'Freezing Rain: Light', icon: ICONS.cloudRain },
    67: { id: 'Hujan Beku Lebat', en: 'Freezing Rain: Heavy', icon: ICONS.cloudRain },
    71: { id: 'Salju Ringan', en: 'Snow fall: Slight', icon: ICONS.cloudSnow },
    73: { id: 'Salju Sedang', en: 'Snow fall: Moderate', icon: ICONS.cloudSnow },
    75: { id: 'Salju Lebat', en: 'Snow fall: Heavy', icon: ICONS.cloudSnow },
    77: { id: 'Hujan Salju', en: 'Snow grains', icon: ICONS.cloudSnow },
    80: { id: 'Hujan Sore', en: 'Rain showers: Slight', icon: ICONS.cloudRain },
    81: { id: 'Hujan Sore Sedang', en: 'Rain showers: Moderate', icon: ICONS.cloudRain },
    82: { id: 'Hujan Sore Lebat', en: 'Rain showers: Violent', icon: ICONS.cloudLightning },
    85: { id: 'Hujan Salju Ringan', en: 'Snow showers slight', icon: ICONS.cloudSnow },
    86: { id: 'Hujan Salju Lebat', en: 'Snow showers heavy', icon: ICONS.cloudSnow },
    95: { id: 'Badai Petir', en: 'Thunderstorm: Slight or moderate', icon: ICONS.cloudLightning },
    96: { id: 'Badai Petir Hujan Es Ringan', en: 'Thunderstorm with slight hail', icon: ICONS.cloudLightning },
    99: { id: 'Badai Petir Hujan Es Lebat', en: 'Thunderstorm with heavy hail', icon: ICONS.cloudLightning }
};

// DOM Elements
const body = document.body;
const root = document.querySelector(':root');
const weatherWrapper = document.getElementById('weather-wrapper');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const weatherContent = document.getElementById('weather-content');

// Settings Elements
const settingsTrigger = document.getElementById('settings-trigger');
const settingsPanel = document.getElementById('settings-panel');
const settingsBackdrop = document.getElementById('settings-backdrop');
const closeSettingsBtn = document.getElementById('close-settings');
const embedUrlInput = document.getElementById('embed-url');
const copyBtn = document.getElementById('copy-btn');
const embedWarning = document.getElementById('embed-warning');

// Setup function
function init() {
    parseURLToState();
    applyStateToUI();
    hydrateSettingsUI();
    attachEventListeners();
    fetchWeatherData();
}

function parseURLToState() {
    const params = new URLSearchParams(window.location.search);
    for (const key in DEFAULT_STATE) {
        if (params.has(key)) {
            let val = params.get(key);
            // Decode URI safely
            state[key] = decodeURIComponent(val);
        }
    }
}

// Applies state configuration immediately to CSS and layout
function applyStateToUI() {
    updateLanguageUI();
    
    // Theme
    if (state.theme === 'dark') {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }

    // Colors
    root.style.setProperty('--accent-color', formatColor(state.color));
    
    if (state.textColor) {
        root.style.setProperty('--text-primary', formatColor(state.textColor));
        root.style.setProperty('--card-text', formatColor(state.textColor));
    } else {
        root.style.removeProperty('--text-primary');
        root.style.removeProperty('--card-text');
    }
    
    if (state.textDimColor) {
        root.style.setProperty('--text-secondary', formatColor(state.textDimColor));
    } else {
        root.style.removeProperty('--text-secondary');
    }

    root.style.setProperty('--card-bg', formatColor(state.cardColor));
    root.style.setProperty('--bg-color', formatColor(state.bgColor));
    root.style.setProperty('--card-border', formatColor(state.borderColor));
    root.style.setProperty('--border-width', state.borderWidth);

    // Font Style
    body.className = body.className.replace(/\bfont-\S+/g, ''); // clear old
    body.classList.add(`font-${state.font}`);

    // Size Scale
    body.className = body.className.replace(/\bsize-\S+/g, '');
    body.classList.add(`size-${state.size}`);

    // Card Radius
    body.className = body.className.replace(/\bradius-\S+/g, '');
    body.classList.add(`radius-${state.radius}`);
    
    // Layout
    weatherWrapper.className = 'weather-wrapper';
    weatherWrapper.classList.add(`layout-${state.layout}`);
    
    // Check if embedded
    let isEmbedded = false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('embed') === 'true' || window.self !== window.top) {
        isEmbedded = true;
    }

    // Refresh UI if language changed, using cached data to avoid re-fetch if possible
    if (weatherDataCache) {
        updateWeatherUI(weatherDataCache);
    }
}

function formatColor(val) {
    if (val === 'transparent') return val;
    return val.startsWith('#') ? val : `#${val}`;
}

async function fetchWeatherData() {
    showLoading();
    
    try {
        // 1. Geocode location to lat/lon
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(state.location)}&count=1&language=${state.language}&format=json`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`Location "${state.location}" not found.`);
        }
        
        const { latitude, longitude, name, admin1, country } = geoData.results[0];
        const displayLocation = admin1 ? `${name}, ${admin1}` : `${name}, ${country}`;
        
        // 2. Fetch Weather
        const tempUnit = state.unit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
        const windUnit = state.unit === 'fahrenheit' ? '&windspeed_unit=mph' : '';
        
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto${tempUnit}${windUnit}`);
        const weatherData = await weatherResponse.json();
        
        weatherDataCache = {
            locationName: displayLocation,
            current: weatherData.current_weather,
            daily: weatherData.daily,
            humidity: weatherData.hourly.relativehumidity_2m[new Date().getHours()]
        };
        
        updateWeatherUI(weatherDataCache);
        showContent();
        
    } catch (error) {
        console.error("Weather Fetch Error:", error);
        showError(error.message);
    }
}

function showLoading() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    weatherContent.classList.add('hidden');
}

function showError(msg) {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    errorMessage.textContent = msg;
}

function showContent() {
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    weatherContent.classList.remove('hidden');
}

function updateWeatherUI(data) {
    // Current
    document.getElementById('display-location').textContent = data.locationName;
    
    // Use Intl for Date
    const today = new Date();
    const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('display-date').textContent = today.toLocaleDateString(state.language === 'id' ? 'id-ID' : 'en-US', dateOptions);
    
    document.getElementById('current-temp').textContent = Math.round(data.current.temperature);
    document.getElementById('current-unit').textContent = state.unit === 'fahrenheit' ? '°F' : '°C';
    document.getElementById('current-wind').textContent = `${data.current.windspeed} ${state.unit === 'fahrenheit' ? 'mph' : 'km/h'}`;
    document.getElementById('current-humidity').textContent = `${data.humidity}%`;
    
    const wCode = data.current.weathercode;
    const wInfo = WEATHER_CODES[wCode] || WEATHER_CODES[0];
    document.getElementById('current-icon').innerHTML = wInfo.icon;
    document.getElementById('current-desc').textContent = state.language === 'id' ? wInfo.id : wInfo.en;
    
    const lang = i18n[state.language] || i18n['en'];
    const detailLabels = document.querySelectorAll('.detail-label');
    if (detailLabels.length >= 2) {
        detailLabels[0].textContent = lang.wind;
        detailLabels[1].textContent = lang.humidity;
    }
    
    // Forecast (next 6 days after today)
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';
    
    // Open-Meteo returns 7 days starting today. We'll show days 1-6 (tomorrow + 5 days)
    for (let i = 1; i < 7; i++) {
        if (!data.daily.time[i]) break;
        
        const dateStr = data.daily.time[i];
        const dateObj = new Date(dateStr);
        // Ensure proper timezone parsing issue workaround
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        
        const dayOptions = { weekday: 'short' };
        const dayName = dateObj.toLocaleDateString(state.language === 'id' ? 'id-ID' : 'en-US', dayOptions);
        
        const dCode = data.daily.weathercode[i];
        const dInfo = WEATHER_CODES[dCode] || WEATHER_CODES[0];
        
        const maxT = Math.round(data.daily.temperature_2m_max[i]);
        const minT = Math.round(data.daily.temperature_2m_min[i]);
        
        const cardHtml = `
            <div class="forecast-card card">
                <span class="fc-day">${dayName}</span>
                <span class="fc-icon" title="${state.language === 'id' ? dInfo.id : dInfo.en}">${dInfo.icon}</span>
                <div class="fc-temp-group">
                    <span class="fc-temp-max">${maxT}°</span>
                    <span class="fc-temp-min">${minT}°</span>
                </div>
            </div>
        `;
        forecastContainer.innerHTML += cardHtml;
    }
}

// --- Settings UI Hydration and DOM Events ---

function hydrateSettingsUI() {
    document.getElementById('location-input').value = state.location;
    document.getElementById('unit-select').value = state.unit;
    document.getElementById('layout-select').value = state.layout;
    
    document.getElementById('theme-select').value = state.theme;
    
    // Sync Colors (Picker & Text)
    syncColorInput('color', state.color);
    syncColorInput('text-color', state.textColor);
    syncColorInput('text-dim-color', state.textDimColor);
    syncColorInput('card-color', state.cardColor);
    syncColorInput('bg-color', state.bgColor);
    syncColorInput('border-color', state.borderColor);
    
    document.getElementById('border-width-select').value = state.borderWidth;
    document.getElementById('font-select').value = state.font;
    document.getElementById('size-select').value = state.size;
    document.getElementById('radius-select').value = state.radius;
    document.getElementById('language-select').value = state.language;
    
    updateEmbedUrl();
}

function syncColorInput(idPrefix, val) {
    const textInput = document.getElementById(`${idPrefix}-input`);
    const pickerInput = document.getElementById(`${idPrefix}-picker-input`);
    
    if (!textInput || !pickerInput) return;
    
    textInput.value = val.replace('#', ''); // Internal state stores without hash mostly, but just in case
    
    // Only update picker if it's a valid hex, not 'transparent'
    if (val !== 'transparent') {
        let hex = formatColor(val);
        // Pickers need valid 6-char hex
        if(/^#[0-9A-F]{6}$/i.test(hex)) {
            pickerInput.value = hex;
        }
    } else {
        pickerInput.value = '#ffffff'; // Fallback
    }
}

function attachEventListeners() {
    // Open / Close Settings
    settingsTrigger.addEventListener('click', () => {
        settingsPanel.classList.remove('hidden');
        settingsBackdrop.classList.remove('hidden');
        embedWarning.classList.add('hidden'); // hide warning when opening
    });

    const closeMenu = () => {
        settingsPanel.classList.add('hidden');
        settingsBackdrop.classList.add('hidden');
    };
    closeSettingsBtn.addEventListener('click', closeMenu);
    settingsBackdrop.addEventListener('click', closeMenu);

    // Track Location changes (Debounced fetch)
    let fetchTimeout;
    document.getElementById('location-input').addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length < 2) return;
        updateState('location', val);
        clearTimeout(fetchTimeout);
        fetchTimeout = setTimeout(() => {
            fetchWeatherData();
        }, 800);
    });

    document.getElementById('unit-select').addEventListener('change', (e) => {
        updateState('unit', e.target.value);
        fetchWeatherData();
    });

    document.getElementById('layout-select').addEventListener('change', (e) => updateState('layout', e.target.value));
    
    // Generic Dropdowns
    document.getElementById('theme-select').addEventListener('change', (e) => updateState('theme', e.target.value));
    document.getElementById('border-width-select').addEventListener('change', (e) => updateState('borderWidth', e.target.value));
    document.getElementById('font-select').addEventListener('change', (e) => updateState('font', e.target.value));
    document.getElementById('size-select').addEventListener('change', (e) => updateState('size', e.target.value));
    document.getElementById('radius-select').addEventListener('change', (e) => updateState('radius', e.target.value));
    document.getElementById('language-select').addEventListener('change', (e) => {
        updateState('language', e.target.value);
        fetchWeatherData();
    });

    // Color Pickers & Text Inputs
    setupColorBinds('color');
    setupColorBinds('text-color', 'textColor');
    setupColorBinds('text-dim-color', 'textDimColor');
    setupColorBinds('card-color', 'cardColor');
    setupColorBinds('bg-color', 'bgColor');
    setupColorBinds('border-color', 'borderColor');
    
    // Copy Button
    copyBtn.addEventListener('click', () => {
        embedUrlInput.select();
        document.execCommand('copy');
        
        const lang = i18n[state.language] || i18n['en'];
        const originalText = lang.copyBtn;
        copyBtn.textContent = lang.copiedBtn;
        copyBtn.style.backgroundColor = '#10b981';
        embedWarning.classList.add('hidden');
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = 'var(--ui-accent)';
        }, 2000);
    });
}

function setupColorBinds(idPrefix, stateKey = idPrefix) {
    const textInput = document.getElementById(`${idPrefix}-input`);
    const pickerInput = document.getElementById(`${idPrefix}-picker-input`);
    
    textInput.addEventListener('input', (e) => {
        let val = e.target.value;
        updateState(stateKey, val);
        // Only trigger picker sync if valid hex format to avoid interrupting typing
        if (/^[0-9A-Fa-f]{6}$/.test(val)) {
            pickerInput.value = `#${val}`;
        }
    });

    pickerInput.addEventListener('input', (e) => {
        let val = e.target.value.replace('#', '');
        textInput.value = val;
        updateState(stateKey, val);
    });
}

function updateState(key, value) {
    if (state[key] === value) return;
    
    state[key] = value;
    applyStateToUI();
    
    // Update URL Params silently
    const url = new URL(window.location);
    if (value && value !== DEFAULT_STATE[key] && value !== 'transparent') {
        url.searchParams.set(key, encodeURIComponent(value));
    } else if (value === 'transparent' && key === 'bgColor') {
       url.searchParams.set(key, 'transparent'); 
    } else {
        url.searchParams.delete(key);
    }
    
    window.history.replaceState({}, '', url);
    updateEmbedUrl();
    embedWarning.classList.remove('hidden');
}

function updateEmbedUrl() {
    embedUrlInput.value = window.location.href;
}

// Start
document.addEventListener('DOMContentLoaded', init);
