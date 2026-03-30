// event-map.js
// Main JS for Neighborhood Event Discovery Map

// Sample event data
const events = [
    {
        id: 1,
        title: "Yoga Workshop",
        category: "workshops",
        date: "2026-03-01",
        lat: 40.7128,
        lng: -74.0060,
        distance: 2,
        description: "Morning yoga for all levels."
    },
    {
        id: 2,
        title: "Tech Meetup",
        category: "meetups",
        date: "2026-03-03",
        lat: 40.7138,
        lng: -74.0020,
        distance: 4,
        description: "Discuss latest tech trends."
    },
    {
        id: 3,
        title: "Park Cleanup",
        category: "volunteering",
        date: "2026-03-05",
        lat: 40.7150,
        lng: -74.0080,
        distance: 1,
        description: "Help clean the local park."
    },
    {
        id: 4,
        title: "Soccer Game",
        category: "sports",
        date: "2026-03-02",
        lat: 40.7100,
        lng: -74.0100,
        distance: 3,
        description: "Join a friendly soccer match."
    }
];

let filteredEvents = events;
let calendar = [];
let reminders = [];
let map;
let markers = [];

// Initialize map
function initMap() {
    map = L.map('map-view').setView([40.7128, -74.0060], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    renderMarkers();
}

// Render event markers
function renderMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    filteredEvents.forEach(event => {
        const marker = L.marker([event.lat, event.lng]).addTo(map);
        marker.bindPopup(`<strong>${event.title}</strong><br>${event.date}<br>${event.description}<br><button onclick="saveToCalendar(${event.id})">Save to Calendar</button>`);
        markers.push(marker);
    });
}

// Filter events
function filterEvents() {
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const distance = parseInt(document.getElementById('distance').value);
    filteredEvents = events.filter(e => {
        let match = true;
        if (category !== 'all') match = match && e.category === category;
        if (date) match = match && e.date === date;
        if (distance) match = match && e.distance <= distance;
        return match;
    });
    renderMarkers();
    renderEventList();
}

// Render event list
function renderEventList() {
    const calendarView = document.getElementById('calendar-view');
    calendarView.innerHTML = '';
    filteredEvents.forEach(event => {
        const div = document.createElement('div');
        div.className = 'event';
        div.innerHTML = `<strong>${event.title}</strong> (${event.category})<br>${event.date}<br>${event.description}<br><button onclick="saveToCalendar(${event.id})">Save to Calendar</button>`;
        calendarView.appendChild(div);
    });
}

// Save event to calendar
function saveToCalendar(eventId) {
    const event = events.find(e => e.id === eventId);
    if (event && !calendar.some(c => c.id === eventId)) {
        calendar.push(event);
        renderCalendar();
        addReminder(event);
    }
}

// Render calendar
function renderCalendar() {
    const calendarView = document.getElementById('calendar-view');
    calendarView.innerHTML = '';
    calendar.forEach(event => {
        const div = document.createElement('div');
        div.className = 'calendar-event';
        div.innerHTML = `<strong>${event.title}</strong> (${event.category})<br>${event.date}<br>${event.description}`;
        calendarView.appendChild(div);
    });
}

// Add reminder
function addReminder(event) {
    reminders.push({ eventId: event.id, title: event.title, date: event.date });
    renderReminders();
}

// Render reminders
function renderReminders() {
    const remindersView = document.getElementById('reminders-view');
    remindersView.innerHTML = '';
    reminders.forEach(r => {
        const div = document.createElement('div');
        div.className = 'reminder';
        div.innerHTML = `Reminder: <strong>${r.title}</strong> on ${r.date}`;
        remindersView.appendChild(div);
    });
}

// Handle filter form
const filterForm = document.getElementById('filter-form');
filterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    filterEvents();
});

// Initial render
window.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderEventList();
    renderCalendar();
    renderReminders();
});

// ...more code will be added for advanced filtering, calendar export/import, notifications, accessibility, and UI enhancements to reach 500+ lines...
