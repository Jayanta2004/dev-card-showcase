// --- Accessibility: Keyboard Navigation ---
// Focus search input on load
document.addEventListener('DOMContentLoaded', () => {
  cityInput.focus();
});

// Allow tab/arrow navigation for unit toggle
const unitButtons = [celsiusBtn, fahrenheitBtn];
unitButtons.forEach((btn, idx) => {
  btn.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + unitButtons.length) % unitButtons.length;
      unitButtons[next].focus();
    }
  });
});

// Allow Enter/Space to activate search and geo buttons
[searchBtn, geoBtn].forEach(btn => {
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});

// Allow theme toggle with Enter/Space
themeToggle.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    themeToggle.click();
  }
});
// Weather Dashboard JavaScript
// Uses OpenWeatherMap API (https://openweathermap.org/api) for weather and air quality

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // <-- Replace with your API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const AQI_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const themeToggle = document.getElementById('theme-toggle');
const celsiusBtn = document.getElementById('celsius');
const fahrenheitBtn = document.getElementById('fahrenheit');

let currentUnit = 'metric'; // 'metric' for °C, 'imperial' for °F

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}

// --- UI: Offline/Online Status ---
const offlineBanner = document.createElement('div');
offlineBanner.id = 'offline-banner';
offlineBanner.textContent = 'You are offline. Showing cached data.';
offlineBanner.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100vw;background:#ff9800;color:#fff;text-align:center;padding:0.5rem;z-index:1000;font-weight:bold;';
document.body.appendChild(offlineBanner);

function showOfflineBanner(show) {
  offlineBanner.style.display = show ? 'block' : 'none';
}

window.addEventListener('online', () => showOfflineBanner(false));
window.addEventListener('offline', () => showOfflineBanner(true));

function setTheme(dark) {
    document.body.classList.toggle('dark', dark);
    themeToggle.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('weather-theme', dark ? 'dark' : 'light');
}

function loadTheme() {
    const theme = localStorage.getItem('weather-theme');
    setTheme(theme === 'dark');
}

themeToggle.addEventListener('click', () => {
    setTheme(!document.body.classList.contains('dark'));
});

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'metric') {
        currentUnit = 'metric';
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        if (window.lastCoords) fetchWeatherByCoords(window.lastCoords);
        else if (window.lastCity) fetchWeather(window.lastCity);
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'imperial') {
        currentUnit = 'imperial';
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        if (window.lastCoords) fetchWeatherByCoords(window.lastCoords);
        else if (window.lastCity) fetchWeather(window.lastCity);
    }
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

cityInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchBtn.click();
});

geoBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            window.lastCoords = coords;
            window.lastCity = null;
            fetchWeatherByCoords(coords);
        }, err => {
            alert('Unable to get location.');
        });
    } else {
        alert('Geolocation not supported.');
    }
});

function cacheWeatherData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function getCachedWeatherData(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const { data, ts } = JSON.parse(item);
    // Accept cache if less than 1 hour old
    if (Date.now() - ts < 3600 * 1000) return data;
    return null;
  } catch {
    return null;
  }
}

async function fetchWeather(city) {
    window.lastCity = city;
    window.lastCoords = null;
    const cacheKey = `weather-${city}-${currentUnit}`;
    if (!navigator.onLine) {
      const cached = getCachedWeatherData(cacheKey);
      if (cached) {
        showOfflineBanner(true);
        updateCurrentWeather(cached.current);
        updateHourlyForecast(cached.hourly);
        updateDailyForecast(cached.daily);
        updateAirQuality(cached.aqi);
        return;
      } else {
        showOfflineBanner(true);
        alert('No cached data available for this city.');
        return;
      }
    }
    try {
        const res = await fetch(`${BASE_URL}weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`);
        if (!res.ok) throw new Error('City not found');
        const data = await res.json();
        const coords = { lat: data.coord.lat, lon: data.coord.lon };
        updateCurrentWeather(data);
        const [forecast, aqi] = await Promise.all([
          fetchForecast(coords, true),
          fetchAirQuality(coords, true)
        ]);
        cacheWeatherData(cacheKey, {
          current: data,
          hourly: forecast.hourly,
          daily: forecast.daily,
          aqi: aqi
        });
        showOfflineBanner(false);
    } catch (e) {
        alert('City not found.');
    }
}

async function fetchWeatherByCoords(coords) {
    const cacheKey = `weather-coords-${coords.lat},${coords.lon}-${currentUnit}`;
    if (!navigator.onLine) {
      const cached = getCachedWeatherData(cacheKey);
      if (cached) {
        showOfflineBanner(true);
        updateCurrentWeather(cached.current);
        updateHourlyForecast(cached.hourly);
        updateDailyForecast(cached.daily);
        updateAirQuality(cached.aqi);
        return;
      } else {
        showOfflineBanner(true);
        alert('No cached data available for this location.');
        return;
      }
    }
    try {
        const res = await fetch(`${BASE_URL}weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=${currentUnit}`);
        if (!res.ok) throw new Error('Location error');
        const data = await res.json();
        updateCurrentWeather(data);
        const [forecast, aqi] = await Promise.all([
          fetchForecast(coords, true),
          fetchAirQuality(coords, true)
        ]);
        cacheWeatherData(cacheKey, {
          current: data,
          hourly: forecast.hourly,
          daily: forecast.daily,
          aqi: aqi
        });
        showOfflineBanner(false);
    } catch (e) {
        alert('Could not fetch weather for your location.');
    }
}

function updateCurrentWeather(data) {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°`;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('weather-icon').alt = data.weather[0].description;
    document.getElementById('weather-desc').textContent = data.weather[0].description.replace(/\b\w/g, l => l.toUpperCase());
}

async function fetchForecast(coords, returnData = false) {
    // One Call 3.0 API (requires lat/lon)
    const res = await fetch(`${BASE_URL}onecall?lat=${coords.lat}&lon=${coords.lon}&exclude=minutely,alerts&appid=${API_KEY}&units=${currentUnit}`);
    if (!res.ok) return returnData ? { hourly: [], daily: [] } : undefined;
    const data = await res.json();
    updateHourlyForecast(data.hourly);
    updateDailyForecast(data.daily);
    if (returnData) return { hourly: data.hourly, daily: data.daily };
}

function updateHourlyForecast(hourly) {
    const hourlyList = document.getElementById('hourly-list');
    hourlyList.innerHTML = '';
    for (let i = 0; i < Math.min(12, hourly.length); i++) {
        const h = hourly[i];
        const date = new Date(h.dt * 1000);
        const hour = date.getHours().toString().padStart(2, '0');
        const card = document.createElement('div');
        card.className = 'hour-card';
        card.innerHTML = `
            <div>${hour}:00</div>
            <img src="https://openweathermap.org/img/wn/${h.weather[0].icon}.png" alt="">
            <div>${Math.round(h.temp)}°</div>
        `;
        hourlyList.appendChild(card);
    }
}

function updateDailyForecast(daily) {
    const dailyList = document.getElementById('daily-list');
    dailyList.innerHTML = '';
    for (let i = 1; i < Math.min(8, daily.length); i++) {
        const d = daily[i];
        const date = new Date(d.dt * 1000);
        const day = date.toLocaleDateString(undefined, { weekday: 'short' });
        const card = document.createElement('div');
        card.className = 'day-card';
        card.innerHTML = `
            <div>${day}</div>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png" alt="">
            <div>${Math.round(d.temp.day)}°</div>
        `;
        dailyList.appendChild(card);
    }
}

async function fetchAirQuality(coords, returnData = false) {
    const res = await fetch(`${AQI_URL}?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`);
    if (!res.ok) return returnData ? null : undefined;
    const data = await res.json();
    const aqi = data.list[0].main.aqi;
    const aqiText = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi-1] || '--';
    updateAirQuality(aqiText);
    if (returnData) return aqiText;
}

function updateAirQuality(aqiText) {
    document.getElementById('air-quality').textContent = `Air Quality: ${aqiText}`;
}

// Initial theme load
loadTheme();

// Show offline banner if offline on load
if (!navigator.onLine) showOfflineBanner(true);

// Optionally, load weather for a default city
document.addEventListener('DOMContentLoaded', () => {
    fetchWeather('New York');
});
