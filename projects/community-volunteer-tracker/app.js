// Community Volunteer Tracker
// Event organization, volunteer hour tracking, recognition

const eventForm = document.getElementById('event-form');
const eventNameEl = document.getElementById('event-name');
const eventDateEl = document.getElementById('event-date');
const eventLocationEl = document.getElementById('event-location');
const eventListEl = document.getElementById('event-list');
const eventSelectEl = document.getElementById('event-select');

const volunteerForm = document.getElementById('volunteer-form');
const volunteerNameEl = document.getElementById('volunteer-name');
const hoursEl = document.getElementById('hours');
const volunteerListEl = document.getElementById('volunteer-list');

const recognitionListEl = document.getElementById('recognition-list');

let events = [];
let volunteers = [];

// Event organization
// ...existing code...
eventForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = eventNameEl.value.trim();
    const date = eventDateEl.value;
    const location = eventLocationEl.value.trim();
    if (name && date && location) {
        events.push({ name, date, location });
        renderEvents();
        eventNameEl.value = '';
        eventDateEl.value = '';
        eventLocationEl.value = '';
    }
});

function renderEvents() {
    eventListEl.innerHTML = '';
    eventSelectEl.innerHTML = '';
    events.forEach((event, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${event.name}</strong> - ${event.date} @ ${event.location}`;
        eventListEl.appendChild(li);
        const option = document.createElement('option');
        option.value = event.name;
        option.textContent = event.name;
        eventSelectEl.appendChild(option);
    });
}

// Volunteer hour tracking
volunteerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = volunteerNameEl.value.trim();
    const event = eventSelectEl.value;
    const hours = parseInt(hoursEl.value);
    if (name && event && hours > 0) {
        volunteers.push({ name, event, hours });
        renderVolunteers();
        volunteerNameEl.value = '';
        hoursEl.value = '';
    }
});

function renderVolunteers() {
    volunteerListEl.innerHTML = '';
    volunteers.forEach((v, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${v.name}</strong> volunteered for <strong>${v.event}</strong> (${v.hours} hours)`;
        volunteerListEl.appendChild(li);
    });
    renderRecognition();
}

// Contribution recognition
function renderRecognition() {
    recognitionListEl.innerHTML = '';
    // Calculate total hours per volunteer
    const totals = {};
    volunteers.forEach(v => {
        totals[v.name] = (totals[v.name] || 0) + v.hours;
    });
    Object.keys(totals).forEach(name => {
        let badge = '';
        if (totals[name] >= 100) badge = '<span class="badge">Gold</span>';
        else if (totals[name] >= 50) badge = '<span class="badge">Silver</span>';
        else if (totals[name] >= 20) badge = '<span class="badge">Bronze</span>';
        recognitionListEl.innerHTML += `<div><strong>${name}</strong>: ${totals[name]} hours ${badge}</div>`;
    });
}

renderEvents();
renderVolunteers();
