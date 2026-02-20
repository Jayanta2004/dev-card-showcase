// Local Community Event Map - app.js
// Core logic for event CRUD, map, RSVP, and UI interactions

let map;
let markers = [];
let events = [];
let editingEventIdx = null;

const addEventBtn = document.getElementById('add-event-btn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const eventForm = document.getElementById('event-form');
const eventList = document.getElementById('event-list');
const eventTitleInput = document.getElementById('event-title');
const eventDateInput = document.getElementById('event-date');
const eventTimeInput = document.getElementById('event-time');
const eventLocationInput = document.getElementById('event-location');
const eventDescriptionInput = document.getElementById('event-description');

function saveEvents() {
  localStorage.setItem('communityEvents', JSON.stringify(events));
}

function loadEvents() {
  const data = localStorage.getItem('communityEvents');
  if (data) {
    events = JSON.parse(data);
  } else {
    events = [];
  }
}

function renderEventList() {
  eventList.innerHTML = '';
  if (events.length === 0) {
    eventList.innerHTML = '<li>No events yet. Add one!</li>';
    return;
  }
  events.slice().reverse().forEach((event, idx) => {
    const li = document.createElement('li');
    li.className = 'event-item';
    li.innerHTML = `
      <div class="event-header">
        <span class="event-title">${event.title}</span>
        <span class="event-date">${formatDate(event.date)} ${event.time}</span>
      </div>
      <div class="event-location">${event.location}</div>
      <div class="event-description">${event.description}</div>
      <div class="event-actions">
        <button class="rsvp-btn" data-idx="${events.length - 1 - idx}">${event.rsvped ? 'Cancel RSVP' : 'RSVP'}</button>
        <button class="edit-btn" data-idx="${events.length - 1 - idx}">Edit</button>
        <button class="delete-btn" data-idx="${events.length - 1 - idx}">Delete</button>
      </div>
    `;
    eventList.appendChild(li);
  });
  document.querySelectorAll('.rsvp-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      toggleRSVP(idx);
    });
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      openEditEvent(idx);
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      deleteEvent(idx);
    });
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function openAddEvent() {
  editingEventIdx = null;
  eventForm.reset();
  modal.classList.remove('hidden');
}

function openEditEvent(idx) {
  editingEventIdx = idx;
  const event = events[idx];
  eventTitleInput.value = event.title;
  eventDateInput.value = event.date;
  eventTimeInput.value = event.time;
  eventLocationInput.value = event.location;
  eventDescriptionInput.value = event.description;
  modal.classList.remove('hidden');
}

function closeModalFunc() {
  modal.classList.add('hidden');
}

function deleteEvent(idx) {
  if (confirm('Delete this event?')) {
    events.splice(idx, 1);
    saveEvents();
    renderEventList();
    renderMapMarkers();
  }
}

eventForm.addEventListener('submit', async e => {
  e.preventDefault();
  const title = eventTitleInput.value.trim();
  const date = eventDateInput.value;
  const time = eventTimeInput.value;
  const location = eventLocationInput.value.trim();
  const description = eventDescriptionInput.value.trim();
  if (title && date && time && location && description) {
    let latlng = await geocodeLocation(location);
    if (!latlng) {
      alert('Could not find location on map. Please enter a valid address or description.');
      return;
    }
    if (editingEventIdx !== null) {
      // Edit
      events[editingEventIdx] = { ...events[editingEventIdx], title, date, time, location, description, latlng };
    } else {
      // Add
      events.push({ title, date, time, location, description, latlng, rsvped: false });
    }
    saveEvents();
    renderEventList();
    renderMapMarkers();
    closeModalFunc();
  }
});

addEventBtn.addEventListener('click', openAddEvent);
closeModal.addEventListener('click', closeModalFunc);
window.addEventListener('click', e => {
  if (e.target === modal) closeModalFunc();
});

function toggleRSVP(idx) {
  events[idx].rsvped = !events[idx].rsvped;
  saveEvents();
  renderEventList();
}

function renderMapMarkers() {
  if (!map) return;
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  events.forEach((event, idx) => {
    if (event.latlng) {
      const marker = L.marker(event.latlng).addTo(map);
      marker.bindPopup(`<b>${event.title}</b><br>${formatDate(event.date)} ${event.time}<br>${event.location}`);
      markers.push(marker);
    }
  });
}

async function geocodeLocation(location) {
  // Use Nominatim API for geocoding
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    return null;
  }
  return null;
}

function initMap() {
  map = L.map('map').setView([20.5937, 78.9629], 4); // Center on India by default
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  renderMapMarkers();
}

// Initial load
loadEvents();
renderEventList();
setTimeout(initMap, 100); // Wait for DOM
