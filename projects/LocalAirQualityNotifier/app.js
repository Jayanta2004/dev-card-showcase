// Local Air Quality Notifier
const fetchBtn = document.getElementById('fetch-btn');
const locationInput = document.getElementById('location');
const aqInfo = document.getElementById('aq-info');
const aqDetails = document.getElementById('aq-details');
const aqAlert = document.getElementById('aq-alert');
const tipsList = document.getElementById('tips-list');

// Example API: https://api.waqi.info/feed/{city}/?token=YOUR_API_TOKEN
// For demo, use a free API or mock data if no key is available
const AQI_THRESHOLDS = [50, 100, 150, 200, 300];
const AQI_LEVELS = [
    { level: 'Good', color: '#4caf50', tips: ['Enjoy outdoor activities.'] },
    { level: 'Moderate', color: '#ffeb3b', tips: ['Sensitive groups should limit outdoor exertion.'] },
    { level: 'Unhealthy for Sensitive Groups', color: '#ff9800', tips: ['People with respiratory issues should stay indoors.'] },
    { level: 'Unhealthy', color: '#f44336', tips: ['Limit outdoor activities. Use masks if needed.'] },
    { level: 'Very Unhealthy', color: '#8e24aa', tips: ['Avoid outdoor activities. Use air purifiers indoors.'] },
    { level: 'Hazardous', color: '#b71c1c', tips: ['Stay indoors. Keep windows closed.'] }
];

function getAQILevel(aqi) {
    for (let i = 0; i < AQI_THRESHOLDS.length; i++) {
        if (aqi <= AQI_THRESHOLDS[i]) return AQI_LEVELS[i];
    }
    return AQI_LEVELS[AQI_LEVELS.length - 1];
}

function renderAQInfo(aqi, city) {
    aqInfo.style.display = 'block';
    const level = getAQILevel(aqi);
    aqDetails.innerHTML = `Location: <b>${city}</b><br>AQI: <b style="color:${level.color}">${aqi}</b> (${level.level})`;
    aqAlert.textContent = aqi > 100 ? `Alert: Air quality is ${level.level}. Take precautions!` : '';
    renderTips(level.tips);
}

function renderTips(tips) {
    tipsList.innerHTML = '';
    tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
}

async function fetchAQI(city) {
    // Replace with your real API and token
    // For demo, use mock data
    // const token = 'YOUR_API_TOKEN';
    // const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${token}`;
    // const res = await fetch(url);
    // const data = await res.json();
    // if (data.status === 'ok') return { aqi: data.data.aqi, city: data.data.city.name };
    // else throw new Error('Location not found');
    // --- DEMO MOCK ---
    const mockCities = ['Delhi', 'London', 'New York', 'Beijing', 'Sydney'];
    const mockAQI = [320, 60, 110, 180, 40];
    const idx = mockCities.findIndex(c => c.toLowerCase() === city.toLowerCase());
    if (idx !== -1) return { aqi: mockAQI[idx], city: mockCities[idx] };
    // Random AQI for unknown city
    return { aqi: Math.floor(Math.random() * 350), city };
}

fetchBtn.addEventListener('click', async () => {
    const city = locationInput.value.trim();
    if (!city) return;
    aqInfo.style.display = 'none';
    aqAlert.textContent = '';
    aqDetails.textContent = 'Loading...';
    try {
        const { aqi, city: foundCity } = await fetchAQI(city);
        renderAQInfo(aqi, foundCity);
    } catch (e) {
        aqInfo.style.display = 'block';
        aqDetails.textContent = 'Could not fetch air quality data.';
        aqAlert.textContent = '';
        renderTips(['Check your internet connection.', 'Try a different city or ZIP code.']);
    }
});
