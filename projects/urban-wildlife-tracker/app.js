// Entry point for Urban Wildlife Tracker
// App logic for logging, map, and biodiversity

// --- Data Model ---
let sightings = JSON.parse(localStorage.getItem('sightings') || '[]');

// --- UI Elements ---
const sightingForm = document.getElementById('sighting-form');
const sightingsContent = document.getElementById('sightings-content');
const biodiversityContent = document.getElementById('biodiversity-content');
const mapDiv = document.getElementById('map');

// --- Utility Functions ---
function saveSightings() { localStorage.setItem('sightings', JSON.stringify(sightings)); }

function addSighting(species, location, datetime, observer) {
	sightings.push({ species, location, datetime, observer });
	saveSightings();
	updateSightings();
	updateBiodiversity();
	updateMap();
}

// --- UI Update Functions ---
function updateSightings() {
	if (sightings.length === 0) {
		sightingsContent.innerHTML = '<em>No sightings logged yet.</em>';
		return;
	}
	let html = '<ul>';
	sightings.slice().reverse().forEach(s => {
		html += `<li><b>${s.species}</b> at ${s.location} on ${new Date(s.datetime).toLocaleString()} (by ${s.observer})</li>`;
	});
	html += '</ul>';
	sightingsContent.innerHTML = html;
}

function updateBiodiversity() {
	if (sightings.length === 0) {
		biodiversityContent.innerHTML = '<em>No biodiversity data yet.</em>';
		return;
	}
	const speciesSet = new Set(sightings.map(s => s.species.toLowerCase()));
	biodiversityContent.innerHTML = `<b>Total Sightings:</b> ${sightings.length}<br><b>Unique Species:</b> ${speciesSet.size}`;
}

function updateMap() {
	// Placeholder: In production, use a real map API (e.g. Leaflet, Google Maps)
	if (!mapDiv) return;
	if (sightings.length === 0) {
		mapDiv.innerHTML = '<em>No sightings to display on map.</em>';
		return;
	}
	let html = '<div style="padding:12px;">';
	sightings.slice(-10).forEach(s => {
		html += `<div style="margin-bottom:6px;"><b>${s.species}</b> @ <span style="color:#2a7ae2">${s.location}</span></div>`;
	});
	html += '<small style="color:#888;">(Map visualization placeholder. Integrate real map API for geolocation.)</small></div>';
	mapDiv.innerHTML = html;
}

// --- Event Listeners ---
if (sightingForm) {
	sightingForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const species = document.getElementById('species').value.trim();
		const location = document.getElementById('location').value.trim();
		const datetime = document.getElementById('datetime').value;
		const observer = document.getElementById('observer').value.trim();
		if (!species || !location || !datetime || !observer) {
			alert('Please enter all sighting details.');
			return;
		}
		addSighting(species, location, datetime, observer);
		sightingForm.reset();
	});
}

// --- Initial Render ---
updateSightings();
updateBiodiversity();
updateMap();
