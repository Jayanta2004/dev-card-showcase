// Local Festival & Culture Explorer - Interactive Map App

let map;
let markers = [];

function getEvents() {
    return JSON.parse(localStorage.getItem('festivals') || '[]');
}
function saveEvent(event) {
    const events = getEvents();
    events.push(event);
    localStorage.setItem('festivals', JSON.stringify(events));
}

function renderEvents() {
    const events = getEvents();
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';
    events.slice().reverse().forEach((ev, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="event-title">${ev.name}</span> <span class="event-date">(${ev.date})</span><br>
            <span class="event-location">${ev.location}</span><br>
            <span class="event-description">${ev.description}</span>`;
        eventList.appendChild(li);
    });
}

function addMarker(lat, lng, popupContent) {
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(popupContent);
    markers.push(marker);
}

function renderMapMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    const events = getEvents();
    events.forEach(ev => {
        if (ev.lat && ev.lng) {
            addMarker(ev.lat, ev.lng, `<strong>${ev.name}</strong><br>${ev.location}<br>${ev.date}<br>${ev.description}`);
        }
    });
}

function geocodeLocation(location, callback) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                callback(data[0].lat, data[0].lon);
            } else {
                callback(null, null);
            }
        })
        .catch(() => callback(null, null));
}

document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    renderMapMarkers();
    renderEvents();

    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('eventName').value.trim();
        const location = document.getElementById('eventLocation').value.trim();
        const date = document.getElementById('eventDate').value;
        const description = document.getElementById('eventDescription').value.trim();
        if (!name || !location || !date || !description) return;
        geocodeLocation(location, (lat, lng) => {
            const event = { name, location, date, description, lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null };
            saveEvent(event);
            renderEvents();
            renderMapMarkers();
            document.getElementById('eventForm').reset();
            if (lat && lng) map.setView([lat, lng], 5);
        });
    });
});
