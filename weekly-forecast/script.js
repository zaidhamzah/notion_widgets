// --- State Management ---
const defaultState = {
  theme: 'light',
  color: '#3b82f6',
  cardColor: '#ffffff',
  bgColor: 'transparent',
  borderColor: '#e5e7eb',
  borderWidth: '1px',
  font: "'Inter', sans-serif",
  size: 'md',
  radius: '16px',
  language: 'en',
  locationName: 'London',
  lat: 51.5085,
  lon: -0.1257,
  units: 'celsius', // 'celsius' or 'fahrenheit'
  layout: 'vertical' // 'vertical' or 'horizontal'
};

let state = { ...defaultState };

// --- Weather Code Mapping (Open-Meteo to Lucide Icons) ---
const weatherMapping = {
  0: { icon: 'sun', desc: 'Clear sky' },
  1: { icon: 'sun-dim', desc: 'Mainly clear' },
  2: { icon: 'cloud-sun', desc: 'Partly cloudy' },
  3: { icon: 'cloud', desc: 'Overcast' },
  45: { icon: 'cloud-fog', desc: 'Fog' },
  48: { icon: 'cloud-fog', desc: 'Depositing rime fog' },
  51: { icon: 'cloud-drizzle', desc: 'Light drizzle' },
  53: { icon: 'cloud-drizzle', desc: 'Moderate drizzle' },
  55: { icon: 'cloud-drizzle', desc: 'Dense drizzle' },
  56: { icon: 'cloud-drizzle', desc: 'Light freezing drizzle' },
  57: { icon: 'cloud-drizzle', desc: 'Dense freezing drizzle' },
  61: { icon: 'cloud-rain', desc: 'Slight rain' },
  63: { icon: 'cloud-rain', desc: 'Moderate rain' },
  65: { icon: 'cloud-rain', desc: 'Heavy rain' },
  66: { icon: 'cloud-snow', desc: 'Light freezing rain' },
  67: { icon: 'cloud-snow', desc: 'Heavy freezing rain' },
  71: { icon: 'snowflake', desc: 'Slight snow' },
  73: { icon: 'snowflake', desc: 'Moderate snow' },
  75: { icon: 'snowflake', desc: 'Heavy snow' },
  77: { icon: 'snowflake', desc: 'Snow grains' },
  80: { icon: 'cloud-rain', desc: 'Slight rain showers' },
  81: { icon: 'cloud-rain', desc: 'Moderate rain showers' },
  82: { icon: 'cloud-rain', desc: 'Violent rain showers' },
  85: { icon: 'cloud-snow', desc: 'Slight snow showers' },
  86: { icon: 'cloud-snow', desc: 'Heavy snow showers' },
  95: { icon: 'cloud-lightning', desc: 'Thunderstorm' },
  96: { icon: 'cloud-lightning', desc: 'Thunderstorm with slight hail' },
  99: { icon: 'cloud-lightning', desc: 'Thunderstorm with heavy hail' }
};

function getWeatherInfo(code) {
  return weatherMapping[code] || { icon: 'cloud', desc: 'Unknown' };
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  parseURLParameters();
  initializeUI();
  applyStateToCSS();
  fetchWeatherData();
  updateEmbedURL();
  
  // Initialize Lucide icons
  lucide.createIcons();
});

function parseURLParameters() {
  const params = new URLSearchParams(window.location.search);
  
  if (params.has('theme')) state.theme = params.get('theme');
  if (params.has('color')) state.color = '#' + params.get('color'); // hex without hash
  if (params.has('cardColor')) state.cardColor = '#' + params.get('cardColor');
  if (params.has('bgColor')) state.bgColor = params.get('bgColor') === 'transparent' ? 'transparent' : '#' + params.get('bgColor');
  if (params.has('borderColor')) state.borderColor = '#' + params.get('borderColor');
  if (params.has('borderWidth')) state.borderWidth = params.get('borderWidth');
  if (params.has('font')) state.font = decodeURIComponent(params.get('font'));
  if (params.has('size')) state.size = params.get('size');
  if (params.has('radius')) state.radius = params.get('radius');
  if (params.has('language')) state.language = params.get('language');
  if (params.has('locationName')) state.locationName = decodeURIComponent(params.get('locationName'));
  if (params.has('lat')) state.lat = parseFloat(params.get('lat'));
  if (params.has('lon')) state.lon = parseFloat(params.get('lon'));
  if (params.has('units')) state.units = params.get('units');
  if (params.has('layout')) state.layout = params.get('layout');
}

function updateURLParameter(key, value) {
  const url = new URL(window.location);
  if (value !== undefined && value !== null && value !== '') {
    if ((key === 'color' || key === 'cardColor' || key === 'borderColor' || key === 'bgColor') && value.toString().startsWith('#')) {
      url.searchParams.set(key, value.substring(1)); // Remove hash for URL
    } else {
      url.searchParams.set(key, value);
    }
  } else {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, '', url);
  updateEmbedURL();
}

function updateEmbedURL() {
  const embedInput = document.getElementById('embed-url');
  embedInput.value = window.location.href;
}

function applyStateToCSS() {
  const root = document.documentElement;
  
  // Apply Theme
  document.body.className = '';
  if (state.theme === 'dark') {
    document.body.classList.add('dark');
  } else if (state.theme === 'glass') {
    document.body.classList.add('glass');
    // We could check if system preference is dark to add dark-glass
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       document.body.classList.add('dark-glass');
    }
  }

  // Apply Variables
  root.style.setProperty('--accent-color', state.color);
  root.style.setProperty('--card-bg', state.cardColor);
  root.style.setProperty('--bg-color', state.bgColor);
  root.style.setProperty('--card-border', state.borderColor);
  root.style.setProperty('--border-width', state.borderWidth);
  root.style.setProperty('--font-family', state.font);
  root.style.setProperty('--border-radius', state.radius);
  
  // Apply Size
  if (state.size === 'sm') root.style.zoom = '0.85';
  else if (state.size === 'lg') root.style.zoom = '1.15';
  else root.style.zoom = '1';

  // Apply Layout
  const widgetRoot = document.getElementById('widget-root');
  if (state.layout === 'horizontal') {
    widgetRoot.classList.add('layout-horizontal');
  } else {
    widgetRoot.classList.remove('layout-horizontal');
  }
}

// --- API Calls ---

async function geocodeLocation(name) {
  const statusEl = document.getElementById('location-status');
  statusEl.textContent = 'Searching...';
  
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      state.locationName = result.name;
      if (result.admin1) state.locationName += `, ${result.admin1}`;
      state.lat = result.latitude;
      state.lon = result.longitude;
      
      // Update state and refresh weather
      updateURLParameter('locationName', state.locationName);
      updateURLParameter('lat', state.lat);
      updateURLParameter('lon', state.lon);
      
      document.getElementById('location-input').value = state.locationName;
      document.getElementById('location-name').textContent = state.locationName;
      statusEl.textContent = 'Location found!';
      setTimeout(() => statusEl.textContent = '', 2000);
      
      fetchWeatherData();
    } else {
      statusEl.textContent = 'Location not found.';
    }
  } catch (err) {
    statusEl.textContent = 'Error searching location.';
    console.error(err);
  }
}

async function fetchWeatherData() {
  document.getElementById('location-name').textContent = state.locationName;
  
  const tempUnitUrl = state.units === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${state.lat}&longitude=${state.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto${tempUnitUrl}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    renderWeather(data);
  } catch (err) {
    console.error('Error fetching weather', err);
    document.getElementById('location-name').textContent = 'Error Loading Data';
  }
}

function renderWeather(data) {
  // Current Weather
  const current = data.current_weather;
  const todayMax = data.daily.temperature_2m_max[0];
  const todayMin = data.daily.temperature_2m_min[0];
  const weatherInfo = getWeatherInfo(current.weathercode);

  document.getElementById('today-temp').textContent = Math.round(current.temperature);
  document.getElementById('today-desc').textContent = weatherInfo.desc;
  document.getElementById('today-high').textContent = Math.round(todayMax);
  document.getElementById('today-low').textContent = Math.round(todayMin);
  
  document.querySelectorAll('.unit-label').forEach(el => {
    el.textContent = state.units === 'fahrenheit' ? 'F' : 'C';
  });

  const todayIconEl = document.getElementById('today-icon');
  todayIconEl.innerHTML = `<i data-lucide="${weatherInfo.icon}"></i>`;

  // For weather subtitle
  const subtitleEl = document.querySelector('.weather-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = state.language === 'id' ? 'CUACA' : 'WEATHER';
  }

  // 7-Day Forecast (including today or next 6 days)
  const forecastList = document.getElementById('forecast-list');
  forecastList.innerHTML = '';

  const daysOfWeek = state.language === 'id' 
    ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Start from index 1 (tomorrow) to index 6
  for (let i = 1; i <= 6; i++) {
    const dateStr = data.daily.time[i];
    const date = new Date(dateStr);
    const dayName = daysOfWeek[date.getDay()];
    
    const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
    const minTemp = Math.round(data.daily.temperature_2m_min[i]);
    const code = data.daily.weathercode[i];
    const info = getWeatherInfo(code);

    const item = document.createElement('div');
    item.className = 'forecast-item';
    item.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-icon" title="${info.desc}"><i data-lucide="${info.icon}"></i></div>
      <div class="day-temps">
        <span class="temp-high">${maxTemp}°</span>
        <span class="temp-low">${minTemp}°</span>
      </div>
    `;
    forecastList.appendChild(item);
  }

  // Re-initialize icons for new elements
  lucide.createIcons();
}

// --- UI Interaction ---
function initializeUI() {
  // Settings Panel Toggle
  const trigger = document.getElementById('settings-trigger');
  const panel = document.getElementById('settings-panel');
  const closeBtn = document.getElementById('close-settings');

  trigger.addEventListener('click', () => panel.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => panel.classList.add('hidden'));

  // Hydrate Controls
  document.getElementById('theme-select').value = state.theme;
  document.getElementById('color-input').value = state.color;
  document.getElementById('color-hex').textContent = state.color;
  
  const cardColorInput = document.getElementById('card-color-input');
  if(cardColorInput) {
    cardColorInput.value = state.cardColor;
    document.getElementById('card-color-hex').textContent = state.cardColor;
  }
  
  const bgColorInput = document.getElementById('bg-color-input');
  const bgColorPicker = document.getElementById('bg-color-picker');
  if(bgColorInput) {
    bgColorInput.value = state.bgColor;
    if(state.bgColor.startsWith('#')) bgColorPicker.value = state.bgColor;
  }

  const borderColorInput = document.getElementById('border-color-input');
  if(borderColorInput) {
    borderColorInput.value = state.borderColor;
    document.getElementById('border-color-hex').textContent = state.borderColor;
  }

  const borderWidthSelect = document.getElementById('border-width-select');
  if(borderWidthSelect) borderWidthSelect.value = state.borderWidth;

  const sizeSelect = document.getElementById('size-select');
  if(sizeSelect) sizeSelect.value = state.size;

  const languageSelect = document.getElementById('language-select');
  if(languageSelect) languageSelect.value = state.language;
  
  // Find closest font match
  const fontSelect = document.getElementById('font-select');
  Array.from(fontSelect.options).forEach(opt => {
    if (state.font.includes(opt.value.split(',')[0].replace(/'/g, ''))) {
      fontSelect.value = opt.value;
    }
  });

  document.getElementById('radius-select').value = state.radius;
  document.getElementById('location-input').value = state.locationName;
  document.getElementById('units-select').value = state.units;
  document.getElementById('layout-select').value = state.layout;

  // Listeners
  document.getElementById('theme-select').addEventListener('change', (e) => {
    state.theme = e.target.value;
    updateURLParameter('theme', state.theme);
    applyStateToCSS();
  });

  document.getElementById('color-input').addEventListener('input', (e) => {
    state.color = e.target.value;
    document.getElementById('color-hex').textContent = state.color;
    updateURLParameter('color', state.color);
    applyStateToCSS();
  });

  if (cardColorInput) {
    cardColorInput.addEventListener('input', (e) => {
      state.cardColor = e.target.value;
      document.getElementById('card-color-hex').textContent = state.cardColor;
      updateURLParameter('cardColor', state.cardColor);
      applyStateToCSS();
    });
  }

  if (bgColorPicker && bgColorInput) {
    bgColorPicker.addEventListener('input', (e) => {
      state.bgColor = e.target.value;
      bgColorInput.value = state.bgColor;
      updateURLParameter('bgColor', state.bgColor);
      applyStateToCSS();
    });
    bgColorInput.addEventListener('input', (e) => {
      state.bgColor = e.target.value;
      updateURLParameter('bgColor', state.bgColor);
      applyStateToCSS();
    });
  }

  if (borderColorInput) {
    borderColorInput.addEventListener('input', (e) => {
      state.borderColor = e.target.value;
      document.getElementById('border-color-hex').textContent = state.borderColor;
      updateURLParameter('borderColor', state.borderColor);
      applyStateToCSS();
    });
  }

  if (borderWidthSelect) {
    borderWidthSelect.addEventListener('change', (e) => {
      state.borderWidth = e.target.value;
      updateURLParameter('borderWidth', state.borderWidth);
      applyStateToCSS();
    });
  }

  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      state.size = e.target.value;
      updateURLParameter('size', state.size);
      applyStateToCSS();
    });
  }

  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      state.language = e.target.value;
      updateURLParameter('language', state.language);
      fetchWeatherData();
    });
  }

  document.getElementById('font-select').addEventListener('change', (e) => {
    state.font = e.target.value;
    updateURLParameter('font', state.font);
    applyStateToCSS();
  });

  document.getElementById('radius-select').addEventListener('change', (e) => {
    state.radius = e.target.value;
    updateURLParameter('radius', state.radius);
    applyStateToCSS();
  });

  document.getElementById('units-select').addEventListener('change', (e) => {
    state.units = e.target.value;
    updateURLParameter('units', state.units);
    fetchWeatherData(); // refetch with new units
  });

  document.getElementById('layout-select').addEventListener('change', (e) => {
    state.layout = e.target.value;
    updateURLParameter('layout', state.layout);
    applyStateToCSS();
  });

  // Location search
  const searchBtn = document.getElementById('search-btn');
  const locInput = document.getElementById('location-input');
  
  searchBtn.addEventListener('click', () => {
    if (locInput.value.trim()) geocodeLocation(locInput.value.trim());
  });

  locInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && locInput.value.trim()) {
      geocodeLocation(locInput.value.trim());
    }
  });

  // Copy URL
  document.getElementById('copy-btn').addEventListener('click', () => {
    const urlInput = document.getElementById('embed-url');
    urlInput.select();
    document.execCommand('copy');
    
    const btn = document.getElementById('copy-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
  });
}
