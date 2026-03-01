// --- DOM Elements ---
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const weatherState = document.getElementById('weatherState');
const errorMsg = document.getElementById('errorMsg');

const temperatureEl = document.getElementById('temperature');
const conditionTextEl = document.getElementById('conditionText');
const weatherIconEl = document.getElementById('weatherIcon');
const windSpeedEl = document.getElementById('windSpeed');
const windDirEl = document.getElementById('windDir');

const root = document.documentElement;

// --- WMO Weather Code Mapping ---
const weatherCodes = {
    0: { text: "Clear Sky", icon: "☀️", theme: "sunny" },
    1: { text: "Mainly Clear", icon: "🌤️", theme: "sunny" },
    2: { text: "Partly Cloudy", icon: "⛅", theme: "cloudy" },
    3: { text: "Overcast", icon: "☁️", theme: "cloudy" },
    45: { text: "Fog", icon: "🌫️", theme: "cloudy" },
    48: { text: "Depositing Rime Fog", icon: "🌫️", theme: "cloudy" },
    51: { text: "Light Drizzle", icon: "🌧️", theme: "rainy" },
    53: { text: "Moderate Drizzle", icon: "🌧️", theme: "rainy" },
    55: { text: "Dense Drizzle", icon: "🌧️", theme: "rainy" },
    61: { text: "Slight Rain", icon: "☔", theme: "rainy" },
    63: { text: "Moderate Rain", icon: "☔", theme: "rainy" },
    65: { text: "Heavy Rain", icon: "☔", theme: "rainy" },
    71: { text: "Slight Snow", icon: "❄️", theme: "snowy" },
    73: { text: "Moderate Snow", icon: "❄️", theme: "snowy" },
    75: { text: "Heavy Snow", icon: "❄️", theme: "snowy" },
    95: { text: "Thunderstorm", icon: "⛈️", theme: "stormy" }
};

// --- Neumorphic Color Palettes ---
const themes = {
    sunny: {
        bg: '#f6e8b2',
        light: '#ffffcd',
        dark: '#d1c597',
        text: '#5c4e1a'
    },
    cloudy: {
        bg: '#e0e5ec',
        light: '#ffffff',
        dark: '#a3b1c6',
        text: '#4a5568'
    },
    rainy: {
        bg: '#b8c6db',
        light: '#d4e4fc',
        dark: '#9ca8ba',
        text: '#2a4365'
    },
    snowy: {
        bg: '#eef2f3',
        light: '#ffffff',
        dark: '#caced1',
        text: '#2d3748'
    },
    stormy: {
        bg: '#4b5563',
        light: '#5b6778',
        dark: '#3b434e',
        text: '#f3f4f6'
    }
};

// --- Application Logic ---
function initApp() {
    switchState(loadingState);

    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        (err) => showError("Location access denied or unavailable. Please enable it to use Atmos-Cast.")
    );
}

async function fetchWeather(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Failed to fetch data from Open-Meteo.");
        
        const data = await response.json();
        updateUI(data.current_weather);
        
    } catch (err) {
        showError(err.message);
    }
}

function updateUI(weather) {
    // 1. Update text/values
    temperatureEl.innerText = Math.round(weather.temperature);
    windSpeedEl.innerText = `${weather.windspeed} km/h`;
    windDirEl.innerText = `${weather.winddirection}°`;

    // 2. Map WMO code to condition and icon
    const codeData = weatherCodes[weather.weathercode] || { text: "Unknown", icon: "🌡️", theme: "cloudy" };
    conditionTextEl.innerText = codeData.text;
    weatherIconEl.innerText = codeData.icon;

    // 3. Apply Dynamic Theme
    applyTheme(codeData.theme);

    // 4. Show Dashboard
    switchState(weatherState);
}

function applyTheme(themeName) {
    const palette = themes[themeName] || themes.cloudy;
    
    // Smoothly shift the CSS custom properties
    root.style.setProperty('--bg-color', palette.bg);
    root.style.setProperty('--shadow-light', palette.light);
    root.style.setProperty('--shadow-dark', palette.dark);
    root.style.setProperty('--text-main', palette.text);
    
    // Adjust muted text based on background darkness
    if (themeName === 'stormy') {
        root.style.setProperty('--text-muted', '#9ca3af');
    } else {
        root.style.setProperty('--text-muted', '#718096');
    }
}

// --- Utils ---
function switchState(targetState) {
    [loadingState, errorState, weatherState].forEach(s => s.classList.add('hidden', 'active'));
    targetState.classList.remove('hidden');
    targetState.classList.add('active');
}

function showError(msg) {
    errorMsg.innerText = msg;
    switchState(errorState);
}

// Boot up
initApp();