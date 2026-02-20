// Wildlife Sighting Tracker
const form = document.getElementById('sighting-form');
const sightingsList = document.getElementById('sightings-list');
const mapContainer = document.getElementById('map-container');

let sightings = JSON.parse(localStorage.getItem('wildlifeSightings') || '[]');

function renderSightings() {
    sightingsList.innerHTML = '';
    if (sightings.length === 0) {
        sightingsList.innerHTML = '<li>No sightings logged yet.</li>';
        mapContainer.textContent = '(Map will appear here)';
        return;
    }
    // Show last 10 sightings
    sightings.slice(-10).reverse().forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${s.species}</strong> <span style='color:#bdbdbd;'>@ ${s.location}</span><br><span style='font-size:0.95em;'>${s.datetime}</span>${s.notes ? `<br><em>${s.notes}</em>` : ''}`;
        sightingsList.appendChild(li);
    });
    renderMap();
}

function renderMap() {
    // Simple text-based map for demo
    let mapHtml = '<ul style="padding-left:1.2em;">';
    sightings.slice(-10).reverse().forEach((s, i) => {
        mapHtml += `<li><strong>${s.species}</strong> <span style='color:#bdbdbd;'>@ ${s.location}</span></li>`;
    });
    mapHtml += '</ul>';
    mapContainer.innerHTML = mapHtml;
}

form.onsubmit = function(e) {
    e.preventDefault();
    const species = document.getElementById('species').value.trim();
    const location = document.getElementById('location').value.trim();
    const datetime = document.getElementById('datetime').value;
    const notes = document.getElementById('notes').value.trim();
    if (!species || !location || !datetime) return;
    sightings.push({ species, location, datetime, notes });
    localStorage.setItem('wildlifeSightings', JSON.stringify(sightings));
    renderSightings();
    form.reset();
};

renderSightings();
