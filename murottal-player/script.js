const defaultConfig = {
    theme: 'light',
    color: '3b82f6',
    textColor: '',
    secondaryColor: '',
    cardColor: 'eaeff5',
    bgColor: 'transparent',
    bgImage: '',
    cardOpacity: '1',
    glass: 'false',
    borderColor: '000000',
    borderWidth: '0px',
    radius: 'lg',
    surah: '1',
    reciter: 'afs',
    autoplay: 'false'
};

const topReciters = [
    { id: 'afs', name: 'Mishary Rashid Alafasy', server: 'https://server8.mp3quran.net/afs/' },
    { id: 'basit', name: 'AbdulBaset AbdulSamad', server: 'https://server7.mp3quran.net/basit/' },
    { id: 's_gmd', name: 'Saad Al Ghamdi', server: 'https://server7.mp3quran.net/s_gmd/' },
    { id: 'maher', name: 'Maher Al Muaiqly', server: 'https://server12.mp3quran.net/maher/' },
    { id: 'sds', name: 'Abdulrahman Alsudaes', server: 'https://server11.mp3quran.net/sds/' },
    { id: 'yasser', name: 'Yasser Al Dosari', server: 'https://server11.mp3quran.net/yasser/' },
    { id: 'shur', name: 'Saud Al-Shuraim', server: 'https://server7.mp3quran.net/shur/' },
    { id: 'minsh', name: 'M. Siddiq Al-Minshawi', server: 'https://server10.mp3quran.net/minsh/' },
    { id: 'ajm', name: 'Ahmad Al-Ajmy', server: 'https://server10.mp3quran.net/ajm/' }
];

let currentConfig = { ...defaultConfig };
let surahList = [];

// Audio State
let isPlaying = false;
let currentDuration = 0;

// DOM Elements
const body = document.body;
const audioPlayer = document.getElementById('audio-player');
const btnPlayPause = document.getElementById('btn-play-pause');
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');

// Settings Elements
const panel = document.getElementById('settings-panel');
const backdrop = document.getElementById('settings-backdrop');
const warning = document.getElementById('embed-warning');

// Setup
document.addEventListener('DOMContentLoaded', async () => {
    parseUrlParams();
    applyConfig();
    hydrateSettingsUI();
    attachSettingsEventListeners();
    await fetchSurahs();
    setupAudioPlayer();
});

// --- URL & State Management ---

function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    for (const key in defaultConfig) {
        if (params.has(key)) {
            currentConfig[key] = params.get(key);
        }
    }
}

function updateUrlParams() {
    const params = new URLSearchParams();
    for (const key in currentConfig) {
        if (currentConfig[key] !== defaultConfig[key]) {
            params.set(key, currentConfig[key]);
        }
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
    
    // Update copy input
    const fullUrl = window.location.origin + newUrl;
    document.getElementById('embed-url').value = fullUrl;
    
    warning.classList.remove('hidden');
}

function applyConfig() {
    // Theme
    if (currentConfig.theme === 'dark') {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }

    // Colors
    const root = document.documentElement;
    root.style.setProperty('--accent-color', `#${currentConfig.color}`);
    root.style.setProperty('--card-border', `#${currentConfig.borderColor}`);
    
    if (currentConfig.textColor) {
        root.style.setProperty('--text-primary', `#${currentConfig.textColor}`);
    } else {
        root.style.removeProperty('--text-primary');
    }

    if (currentConfig.secondaryColor) {
        root.style.setProperty('--text-secondary', `#${currentConfig.secondaryColor}`);
    } else {
        root.style.removeProperty('--text-secondary');
    }
    
    if (currentConfig.bgColor === 'transparent') {
        root.style.setProperty('--bg-color', 'transparent');
    } else {
        root.style.setProperty('--bg-color', `#${currentConfig.bgColor}`);
    }

    function hexToRgb(hex) {
        if (!hex) return null;
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

    if (currentConfig.cardColor) {
        const rgb = hexToRgb(currentConfig.cardColor);
        if (rgb) {
            root.style.setProperty('--card-bg-rgb', rgb);
        }
    } else {
        root.style.setProperty('--card-bg-rgb', currentConfig.theme === 'dark' ? '31, 41, 55' : '234, 239, 245');
    }
    
    root.style.setProperty('--card-opacity', currentConfig.cardOpacity);

    if (currentConfig.bgImage && currentConfig.bgImage.trim() !== '') {
        body.style.backgroundImage = `url('${currentConfig.bgImage}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
    } else {
        body.style.backgroundImage = 'none';
    }

    const playerCard = document.querySelector('.player-card');
    if (currentConfig.glass === 'true') {
        playerCard.classList.add('glass');
    } else {
        playerCard.classList.remove('glass');
    }
    
    // Border Width
    root.style.setProperty('--border-width', currentConfig.borderWidth);

    // Radius
    const radiusMap = {
        'none': '0px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'full': '24px'
    };
    root.style.setProperty('--border-radius', radiusMap[currentConfig.radius] || radiusMap['lg']);

    // Changing surah dynamically if it changed
    loadSurah(parseInt(currentConfig.surah));
}

// --- Data Fetching ---
async function fetchSurahs() {
    try {
        const response = await fetch('https://api.quran.com/api/v4/chapters');
        const data = await response.json();
        surahList = data.chapters; // array of 114 surahs
        
        // Populate Dropdown
        const surahSelect = document.getElementById('surah-select');
        surahSelect.innerHTML = '';
        surahList.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.id;
            option.textContent = `${surah.id}. ${surah.name_simple} (${surah.name_arabic})`;
            surahSelect.appendChild(option);
        });
        
        // Populate Reciters Select
        const reciterSelect = document.getElementById('reciter-select');
        reciterSelect.innerHTML = '';
        topReciters.forEach(reciter => {
            const option = document.createElement('option');
            option.value = reciter.id;
            option.textContent = reciter.name;
            reciterSelect.appendChild(option);
        });
        
        // Select the configured surah and reciter
        surahSelect.value = currentConfig.surah;
        reciterSelect.value = currentConfig.reciter;
        updateTrackInfo();
        
    } catch (e) {
        console.error("Failed to fetch surahs", e);
        trackTitle.textContent = "Surah " + currentConfig.surah;
    }
}

// --- Audio Player Logic ---

function loadSurah(surahNumber) {
    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        surahNumber = 1;
        currentConfig.surah = '1';
    }
    
    // Ensure 3-digit format e.g. 001, 114
    const paddedNumber = String(surahNumber).padStart(3, '0');
    // Find Reciter Server
    const reciter = topReciters.find(r => r.id === currentConfig.reciter) || topReciters[0];
    const audioUrl = `${reciter.server}${paddedNumber}.mp3`;
    
    const wasPlaying = !audioPlayer.paused && isPlaying;
    
    if(audioPlayer.src !== audioUrl) {
        audioPlayer.src = audioUrl;
        audioPlayer.load();
        
        // Reset progress
        progressBar.value = 0;
        currentTimeEl.textContent = "00:00";
        totalTimeEl.textContent = "00:00";
        updateProgressColor();
        updateTrackInfo();

        if (wasPlaying || (currentConfig.autoplay === 'true' && !audioPlayer.src.includes('null'))) {
            // Need a tiny delay for load sometimes, but HTML5 handles it mostly
            const playPromise = audioPlayer.play();
            if(playPromise !== undefined) {
                playPromise.then(_ => {
                    isPlaying = true;
                    updatePlayPauseUI();
                }).catch(error => {
                    console.log("Autoplay prevented or load error.");
                    isPlaying = false;
                    updatePlayPauseUI();
                });
            }
        }
    }
}

function updateTrackInfo() {
    if (!surahList.length) return;
    const surah = surahList.find(s => s.id === parseInt(currentConfig.surah));
    if (surah) {
        trackTitle.textContent = surah.name_simple;
    } else {
        trackTitle.textContent = "Surah " + currentConfig.surah;
    }
    
    const reciter = topReciters.find(r => r.id === currentConfig.reciter) || topReciters[0];
    trackArtist.textContent = reciter.name;
}

function setupAudioPlayer() {
    
    // Play/Pause
    btnPlayPause.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseUI();
    });

    // Next
    btnNext.addEventListener('click', () => {
        let next = parseInt(currentConfig.surah) + 1;
        if(next > 114) next = 1;
        changeSurahSetting(next);
    });

    // Prev
    btnPrev.addEventListener('click', () => {
        let prev = parseInt(currentConfig.surah) - 1;
        if(prev < 1) prev = 114;
        audioPlayer.currentTime = 0; // if they click prev they might want to restart
        changeSurahSetting(prev);
    });

    // Metadata loaded
    audioPlayer.addEventListener('loadedmetadata', () => {
        currentDuration = audioPlayer.duration;
        totalTimeEl.textContent = formatTime(currentDuration);
        progressBar.max = currentDuration;
    });

    // Time update
    audioPlayer.addEventListener('timeupdate', () => {
        if(!isNaN(audioPlayer.currentTime)){
            progressBar.value = audioPlayer.currentTime;
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
            updateProgressColor();
        }
    });

    // Audio Ended
    audioPlayer.addEventListener('ended', () => {
        let next = parseInt(currentConfig.surah) + 1;
        if(next <= 114) {
            changeSurahSetting(next);
            // Autoplay next
            audioPlayer.play();
            isPlaying = true;
            updatePlayPauseUI();
        } else {
            isPlaying = false;
            updatePlayPauseUI();
        }
    });

    // Seeking slider
    progressBar.addEventListener('input', () => {
        audioPlayer.currentTime = progressBar.value;
        currentTimeEl.textContent = formatTime(progressBar.value);
        updateProgressColor();
    });
}

function changeSurahSetting(surahNum) {
    currentConfig.surah = surahNum.toString();
    document.getElementById('surah-select').value = currentConfig.surah;
    updateUrlParams();
    applyConfig();
}

function updatePlayPauseUI() {
    if (isPlaying) {
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
    } else {
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');
    }
}

function updateProgressColor() {
    // Fill the left side of the range slider with accent color
    const val = progressBar.value;
    const max = progressBar.max || 100;
    const percentage = (val / max) * 100;
    progressBar.style.background = `linear-gradient(to right, var(--accent-color) ${percentage}%, rgba(100,100,100,0.2) ${percentage}%)`;
}

function formatTime(seconds) {
    if(isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}


// --- Settings UI Logic ---

function hydrateSettingsUI() {
    document.getElementById('theme-select').value = currentConfig.theme;
    document.getElementById('surah-select').value = currentConfig.surah;
    document.getElementById('reciter-select').value = currentConfig.reciter;
    document.getElementById('autoplay-toggle').checked = currentConfig.autoplay === 'true';
    
    document.getElementById('bg-image-input').value = currentConfig.bgImage;
    document.getElementById('card-opacity-slider').value = currentConfig.cardOpacity;
    document.getElementById('card-opacity-val').textContent = currentConfig.cardOpacity;
    document.getElementById('glass-toggle').checked = currentConfig.glass === 'true';

    // Format colors for inputs
    const hydrateColor = (val, idPicker, idText) => {
        if (val === 'transparent') {
            document.getElementById(idText).value = 'transparent';
        } else {
            const hexPrefix = val.startsWith('#') ? val : `#${val}`;
            document.getElementById(idPicker).value = hexPrefix;
            document.getElementById(idText).value = val.replace('#', '');
        }
    };

    hydrateColor(currentConfig.color, 'color-picker-input', 'color-input');
    hydrateColor(currentConfig.textColor || '', 'text-color-picker-input', 'text-color-input');
    hydrateColor(currentConfig.secondaryColor || '', 'secondary-color-picker-input', 'secondary-color-input');
    hydrateColor(currentConfig.cardColor, 'card-color-picker-input', 'card-color-input');
    hydrateColor(currentConfig.bgColor, 'bg-color-picker-input', 'bg-color-input');
    hydrateColor(currentConfig.borderColor, 'border-color-picker-input', 'border-color-input');

    document.getElementById('border-width-select').value = currentConfig.borderWidth;
    document.getElementById('radius-select').value = currentConfig.radius;
    
    // Generate initial URL
    const fullUrl = window.location.origin + window.location.pathname + window.location.search;
    document.getElementById('embed-url').value = fullUrl;
}

function attachSettingsEventListeners() {
    // UI Open/close
    document.getElementById('settings-trigger').addEventListener('click', openSettings);
    document.getElementById('close-settings').addEventListener('click', closeSettings);
    backdrop.addEventListener('click', closeSettings);

    const updateAndApply = () => {
        updateUrlParams();
        applyConfig();
    };

    // Theme & Generic Selects
    document.getElementById('theme-select').addEventListener('change', (e) => {
        currentConfig.theme = e.target.value; updateAndApply();
    });
    
    document.getElementById('surah-select').addEventListener('change', (e) => {
        currentConfig.surah = e.target.value; updateAndApply();
    });
    
    document.getElementById('reciter-select').addEventListener('change', (e) => {
        currentConfig.reciter = e.target.value; updateAndApply();
    });

    document.getElementById('autoplay-toggle').addEventListener('change', (e) => {
        currentConfig.autoplay = e.target.checked ? 'true' : 'false'; updateAndApply();
    });

    document.getElementById('bg-image-input').addEventListener('change', (e) => {
        currentConfig.bgImage = e.target.value.trim(); updateAndApply();
    });

    document.getElementById('card-opacity-slider').addEventListener('input', (e) => {
        currentConfig.cardOpacity = e.target.value;
        document.getElementById('card-opacity-val').textContent = e.target.value;
        updateAndApply();
    });

    document.getElementById('glass-toggle').addEventListener('change', (e) => {
        currentConfig.glass = e.target.checked ? 'true' : 'false'; updateAndApply();
    });

    document.getElementById('border-width-select').addEventListener('change', (e) => {
        currentConfig.borderWidth = e.target.value; updateAndApply();
    });
    
    document.getElementById('radius-select').addEventListener('change', (e) => {
        currentConfig.radius = e.target.value; updateAndApply();
    });

    // Colors
    const setupColorInputs = (idPicker, idText, configKey) => {
        const picker = document.getElementById(idPicker);
        const text = document.getElementById(idText);

        picker.addEventListener('input', (e) => {
            const val = e.target.value.substring(1); // remove #
            text.value = val;
            currentConfig[configKey] = val;
            updateAndApply();
        });

        text.addEventListener('input', (e) => {
            let val = e.target.value.trim();
            if (val === 'transparent' && configKey === 'bgColor') {
                currentConfig[configKey] = val;
                updateAndApply();
                return;
            }
            if (val.length === 6 && /^[0-9A-Fa-f]{6}$/i.test(val)) {
                picker.value = '#' + val;
                currentConfig[configKey] = val;
                updateAndApply();
            }
        });
    };

    setupColorInputs('color-picker-input', 'color-input', 'color');
    setupColorInputs('text-color-picker-input', 'text-color-input', 'textColor');
    setupColorInputs('secondary-color-picker-input', 'secondary-color-input', 'secondaryColor');
    setupColorInputs('card-color-picker-input', 'card-color-input', 'cardColor');
    setupColorInputs('bg-color-picker-input', 'bg-color-input', 'bgColor');
    setupColorInputs('border-color-picker-input', 'border-color-input', 'borderColor');

    // Copy Button
    document.getElementById('copy-btn').addEventListener('click', () => {
        const urlInput = document.getElementById('embed-url');
        urlInput.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
        warning.classList.add('hidden');
    });
}

function openSettings() {
    panel.classList.remove('hidden');
    backdrop.classList.remove('hidden');
}

function closeSettings() {
    panel.classList.add('hidden');
    backdrop.classList.add('hidden');
}
