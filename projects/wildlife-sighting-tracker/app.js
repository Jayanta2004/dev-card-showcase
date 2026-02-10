// Wildlife Sighting Tracker App
// Core data and helpers
const speciesList = [
  { name: "Red Fox", scientific: "Vulpes vulpes", info: "A small, dog-like mammal with a bushy tail and reddish fur. Common in urban and rural areas." },
  { name: "Bald Eagle", scientific: "Haliaeetus leucocephalus", info: "Large bird of prey with a white head and tail, native to North America." },
  { name: "White-tailed Deer", scientific: "Odocoileus virginianus", info: "Medium-sized deer native to North America, recognized by the white underside of its tail." },
  { name: "Eastern Grey Squirrel", scientific: "Sciurus carolinensis", info: "Common tree squirrel with grey fur, found in forests and urban parks." },
  { name: "Monarch Butterfly", scientific: "Danaus plexippus", info: "Famous for its orange and black wings and long migrations across North America." },
  { name: "Great Blue Heron", scientific: "Ardea herodias", info: "Tall wading bird with blue-grey plumage, found near water bodies." },
  { name: "American Black Bear", scientific: "Ursus americanus", info: "Large omnivorous mammal, usually black but can be brown or cinnamon." },
  { name: "Northern Cardinal", scientific: "Cardinalis cardinalis", info: "Bright red songbird, common in gardens and woodlands." },
  { name: "Painted Turtle", scientific: "Chrysemys picta", info: "Freshwater turtle with colorful markings on its shell and skin." },
  { name: "Coyote", scientific: "Canis latrans", info: "Medium-sized canid, highly adaptable, found in many habitats." }
];

let sightings = JSON.parse(localStorage.getItem('wildlifeSightings') || '[]');

function renderLogSighting() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Log a Wildlife Sighting</h2>
    <form id="sighting-form">
      <label>Species
        <select id="species-select" required>
          <option value="">Select species</option>
          ${speciesList.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
        </select>
      </label>
      <label>Date
        <input type="date" id="sighting-date" required value="${new Date().toISOString().slice(0,10)}">
      </label>
      <label>Location (click on map or enter manually)
        <input type="text" id="sighting-location" placeholder="e.g. Central Park, NY" required>
      </label>
      <label>Latitude
        <input type="number" id="sighting-lat" step="any" placeholder="e.g. 40.785091">
      </label>
      <label>Longitude
        <input type="number" id="sighting-lng" step="any" placeholder="e.g. -73.968285">
      </label>
      <label>Notes
        <textarea id="sighting-notes" rows="2" placeholder="Behavior, group size, weather, etc."></textarea>
      </label>
      <button class="action" type="submit">Log Sighting</button>
    </form>
    <div id="log-map" style="height:300px;margin-top:1rem;"></div>
  `;
  setTimeout(initLogMap, 0);
  document.getElementById('sighting-form').onsubmit = handleLogSighting;
}

function initLogMap() {
  const map = L.map('log-map').setView([40, -100], 3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  map.on('click', function(e) {
    document.getElementById('sighting-lat').value = e.latlng.lat.toFixed(6);
    document.getElementById('sighting-lng').value = e.latlng.lng.toFixed(6);
  });
}

function handleLogSighting(e) {
  e.preventDefault();
  const species = document.getElementById('species-select').value;
  const date = document.getElementById('sighting-date').value;
  const location = document.getElementById('sighting-location').value;
  const lat = parseFloat(document.getElementById('sighting-lat').value);
  const lng = parseFloat(document.getElementById('sighting-lng').value);
  const notes = document.getElementById('sighting-notes').value;
  if (!species || !date || !location || isNaN(lat) || isNaN(lng)) {
    alert('Please fill all required fields and select a location on the map.');
    return;
  }
  const sighting = { species, date, location, lat, lng, notes };
  sightings.push(sighting);
  localStorage.setItem('wildlifeSightings', JSON.stringify(sightings));
  alert('Sighting logged!');
  renderLogSighting();
}

function renderMap() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Sightings Map</h2>
    <div id="map"></div>
  `;
  setTimeout(initMap, 0);
}

function initMap() {
  const map = L.map('map').setView([40, -100], 3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  sightings.forEach(s => {
    const marker = L.marker([s.lat, s.lng]).addTo(map);
    marker.bindPopup(`<strong>${s.species}</strong><br>${s.location}<br>${s.date}<br>${s.notes ? s.notes : ''}`);
  });
}

function renderSpeciesInfo() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Species Information</h2>
    <input id="species-search" type="text" placeholder="Search species...">
    <div id="species-list"></div>
  `;
  document.getElementById('species-search').addEventListener('input', handleSpeciesSearch);
  handleSpeciesSearch();
}

function handleSpeciesSearch() {
  const query = document.getElementById('species-search').value.toLowerCase();
  const filtered = speciesList.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.scientific.toLowerCase().includes(query)
  );
  renderSpeciesList(filtered);
}

function renderSpeciesList(list) {
  const container = document.getElementById('species-list');
  if (!list.length) {
    container.innerHTML = '<p>No species found.</p>';
    return;
  }
  container.innerHTML = list.map(s => `
    <div class="card">
      <div><strong>${s.name}</strong> <em>(${s.scientific})</em></div>
      <div>${s.info}</div>
    </div>
  `).join('');
}

function renderFeed() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Recent Sightings</h2>
    <ul class="sighting-list">
      ${sightings.length ? sightings.slice().reverse().map(s => `
        <li>
          <span><strong>${s.species}</strong> <em>(${s.location})</em></span>
          <span class="date">${s.date}</span>
          <span>${s.notes ? s.notes : ''}</span>
          <span>Lat: ${s.lat}, Lng: ${s.lng}</span>
        </li>
      `).join('') : '<li>No sightings logged yet.</li>'}
    </ul>
  `;
}

document.getElementById('nav-log').onclick = renderLogSighting;
document.getElementById('nav-map').onclick = renderMap;
document.getElementById('nav-species').onclick = renderSpeciesInfo;
document.getElementById('nav-feed').onclick = renderFeed;

// Initial load
renderFeed();
