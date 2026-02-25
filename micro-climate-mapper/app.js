// Micro-Climate Mapper
// Author: EWOC Contributors
// Description: Crowdsource and visualize hyper-local weather and air quality data from users’ neighborhoods

const form = document.getElementById('dataForm');
const confirmation = document.getElementById('confirmation');
const mapDiv = document.getElementById('map');
const submissionsDiv = document.getElementById('submissions');

const STORAGE_KEY = 'microClimateData';

function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderMap() {
    const data = getData();
    if (!data.length) {
        mapDiv.innerHTML = '<em>No data points yet.</em>';
        return;
    }
    // Group by location
    const grouped = {};
    data.forEach(d => {
        if (!grouped[d.location]) grouped[d.location] = [];
        grouped[d.location].push(d);
    });
    mapDiv.innerHTML = Object.entries(grouped).map(([loc, arr]) => {
        const avgTemp = (arr.reduce((s, d) => s + d.temperature, 0) / arr.length).toFixed(1);
        const avgHum = (arr.reduce((s, d) => s + d.humidity, 0) / arr.length).toFixed(0);
        const avgAqi = (arr.reduce((s, d) => s + d.aqi, 0) / arr.length).toFixed(0);
        return `<div class="map-point">
            <b>${escapeHtml(loc)}</b><br>
            Temp: ${avgTemp}°C<br>
            Humidity: ${avgHum}%<br>
            AQI: ${avgAqi}
        </div>`;
    }).join('');
}

function renderSubmissions() {
    const data = getData();
    if (!data.length) {
        submissionsDiv.innerHTML = '<em>No submissions yet.</em>';
        return;
    }
    submissionsDiv.innerHTML = data.slice().reverse().map(d =>
        `<div class="submission-card">
            <b>${escapeHtml(d.location)}</b> | ${d.temperature}°C, ${d.humidity}%, AQI ${d.aqi}<br>
            <span style="color:#888;">${d.notes ? escapeHtml(d.notes) : ''}</span>
        </div>`
    ).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const location = form.location.value.trim();
    const temperature = parseFloat(form.temperature.value);
    const humidity = parseFloat(form.humidity.value);
    const aqi = parseInt(form.aqi.value);
    const notes = form.notes.value.trim();
    if (!location || isNaN(temperature) || isNaN(humidity) || isNaN(aqi)) return;
    const data = getData();
    data.push({ location, temperature, humidity, aqi, notes });
    saveData(data);
    confirmation.textContent = 'Data submitted!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderMap();
    renderSubmissions();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderMap();
renderSubmissions();
