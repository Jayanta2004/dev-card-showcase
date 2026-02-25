// Micro-Climate Mapper App
// Stores weather data in localStorage and displays on map

let map;
let weatherData = [];

function loadData() {
    const data = localStorage.getItem('microClimateData');
    weatherData = data ? JSON.parse(data) : [];
}

function saveData() {
    localStorage.setItem('microClimateData', JSON.stringify(weatherData));
}

function addWeatherRecord(record) {
    weatherData.push(record);
    saveData();
    renderDataList();
    renderMapMarkers();
}

function renderDataList() {
    const list = document.getElementById('data-list');
    list.innerHTML = '';
    weatherData.forEach((rec, idx) => {
        const li = document.createElement('li');
        li.textContent = `Lat: ${rec.lat}, Lng: ${rec.lng}, Temp: ${rec.temp}°C, Humidity: ${rec.humidity}%, AQI: ${rec.aqi}, Time: ${rec.timestamp}`;
        list.appendChild(li);
    });
}

function renderMapMarkers() {
    if (!map) return;
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
    });
    weatherData.forEach(rec => {
        const color = rec.aqi < 50 ? 'green' : rec.aqi < 100 ? 'orange' : 'red';
        const marker = L.circleMarker([rec.lat, rec.lng], {
            radius: 10,
            color: color,
            fillColor: color,
            fillOpacity: 0.7
        }).addTo(map);
        marker.bindPopup(`Temp: ${rec.temp}°C<br>Humidity: ${rec.humidity}%<br>AQI: ${rec.aqi}<br>Time: ${rec.timestamp}`);
    });
}

function setupMap() {
    map = L.map('map').setView([20, 77], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    renderMapMarkers();
}

function setupForm() {
    const form = document.getElementById('weather-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const lat = parseFloat(document.getElementById('lat').value);
        const lng = parseFloat(document.getElementById('lng').value);
        const temp = parseFloat(document.getElementById('temp').value);
        const humidity = parseFloat(document.getElementById('humidity').value);
        const aqi = parseFloat(document.getElementById('aqi').value);
        const timestamp = new Date().toLocaleString();
        addWeatherRecord({ lat, lng, temp, humidity, aqi, timestamp });
        form.reset();
    });
}

window.onload = function() {
    loadData();
    setupMap();
    setupForm();
    renderDataList();
};
