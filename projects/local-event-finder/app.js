// Local Event Finder App
// Author: Ayaanshaikh12243
// Description: Discover and bookmark local events, workshops, or meetups

// --- State Management ---
const state = {
    events: [], // {id, title, date, location, desc, image, bookmarked}
    bookmarks: [], // {id}
    view: 'dashboard',
    settings: {
        theme: 'default',
    },
    search: {
        location: '',
        date: '',
        keyword: '',
    },
    results: [],
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem('eventFinderState', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('eventFinderState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.events = parsed.events || [];
        state.bookmarks = parsed.bookmarks || [];
        state.view = parsed.view || 'dashboard';
        state.settings = parsed.settings || state.settings;
        state.search = parsed.search || { location: '', date: '', keyword: '' };
        state.results = parsed.results || [];
    } else {
        // Add sample event data if none exists
        state.events = [
            {
                id: uuid(),
                title: 'Tech Innovators Meetup',
                date: today(),
                location: 'Downtown Conference Center',
                desc: 'A networking event for tech enthusiasts and professionals.',
                image: 'https://images.unsplash.com/photo-1515168833906-d2a3b82b1a48?auto=format&fit=facearea&w=256&q=80',
                bookmarked: false
            },
            {
                id: uuid(),
                title: 'Art & Wine Night',
                date: '2026-02-25',
                location: 'City Art Gallery',
                desc: 'Enjoy an evening of painting and wine tasting with local artists.',
                image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&q=80',
                bookmarked: false
            },
            {
                id: uuid(),
                title: 'Startup Pitch Fest',
                date: '2026-03-01',
                location: 'Innovation Hub',
                desc: 'Watch startups pitch their ideas to investors and win prizes.',
                image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=256&q=80',
                bookmarked: false
            },
            {
                id: uuid(),
                title: 'Yoga in the Park',
                date: '2026-02-28',
                location: 'Central Park',
                desc: 'Join a free outdoor yoga session for all levels.',
                image: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=facearea&w=256&q=80',
                bookmarked: false
            },
            {
                id: uuid(),
                title: 'Local Food Festival',
                date: '2026-03-05',
                location: 'Riverside Market',
                desc: 'Taste dishes from local chefs and enjoy live music.',
                image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=256&q=80',
                bookmarked: false
            }
        ];
        state.bookmarks = [];
        state.results = state.events;
    }
}
function uuid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}
function today() {
    return new Date().toISOString().slice(0, 10);
}

// --- Navigation ---
function setView(view) {
    state.view = view;
    saveState();
    render();
}
document.getElementById('dashboardBtn').onclick = () => setView('dashboard');
document.getElementById('findBtn').onclick = () => setView('find');
document.getElementById('bookmarksBtn').onclick = () => setView('bookmarks');
document.getElementById('settingsBtn').onclick = () => setView('settings');

// --- Render Functions ---
function render() {
    const main = document.getElementById('mainContent');
    switch (state.view) {
        case 'dashboard':
            main.innerHTML = renderDashboard();
            break;
        case 'find':
            main.innerHTML = renderFind();
            break;
        case 'bookmarks':
            main.innerHTML = renderBookmarks();
            break;
        case 'settings':
            main.innerHTML = renderSettings();
            break;
    }
    attachEventListeners();
}
// --- Dashboard View ---
function renderDashboard() {
    return `<h2>Welcome to Local Event Finder</h2>
        <p>Discover and bookmark local events, workshops, or meetups in your area. Use the Find Events tab to search for something new!</p>
        <div class="event-list">
            ${state.events.slice(0, 3).map(event => renderEventCard(event)).join('')}
        </div>`;
}

// --- Find Events View ---
function renderFind() {
    return `<h2>Find Events</h2>
        <form id="findForm" class="find-form">
            <input type="text" id="searchLocation" placeholder="Location" value="${state.search.location}" />
            <input type="date" id="searchDate" value="${state.search.date}" />
            <input type="text" id="searchKeyword" placeholder="Keyword" value="${state.search.keyword}" />
            <button type="submit">Search</button>
        </form>
        <div class="event-list">
            ${state.results.map(event => renderEventCard(event)).join('')}
        </div>`;
}

// --- Bookmarks View ---
function renderBookmarks() {
    const bookmarkedEvents = state.events.filter(e => state.bookmarks.includes(e.id));
    return `<h2>Bookmarked Events</h2>
        <div class="bookmark-list">
            ${bookmarkedEvents.length ? bookmarkedEvents.map(event => renderBookmarkItem(event)).join('') : '<p>No bookmarks yet.</p>'}
        </div>`;
}

// --- Settings View ---
function renderSettings() {
    return `<h2>Settings</h2>
        <div class="settings">
            <label>Theme:
                <select id="theme">
                    <option value="default"${state.settings.theme==='default'?' selected':''}>Default</option>
                    <option value="dark"${state.settings.theme==='dark'?' selected':''}>Dark</option>
                </select>
            </label>
        </div>`;
}

// --- Render Event Card ---
function renderEventCard(event) {
    return `<div class="event-card" data-id="${event.id}">
        <img src="${event.image}" alt="${event.title}" />
        <div class="title">${event.title}</div>
        <div class="date">${event.date}</div>
        <div class="location">${event.location}</div>
        <div class="desc">${event.desc}</div>
        <div class="actions">
            <button class="bookmark-btn">${state.bookmarks.includes(event.id) ? 'Bookmarked' : 'Bookmark'}</button>
        </div>
    </div>`;
}

// --- Render Bookmark Item ---
function renderBookmarkItem(event) {
    return `<div class="bookmark-item" data-id="${event.id}">
        <img src="${event.image}" alt="${event.title}" />
        <div class="info">
            <div class="title">${event.title}</div>
            <div class="date">${event.date}</div>
            <div class="location">${event.location}</div>
            <div class="desc">${event.desc}</div>
        </div>
        <div class="actions">
            <button class="remove-bookmark-btn">Remove</button>
        </div>
    </div>`;
}

// --- Event Listeners ---
function attachEventListeners() {
    // Find Form
    const findForm = document.getElementById('findForm');
    if (findForm) {
        findForm.onsubmit = function(e) {
            e.preventDefault();
            const location = document.getElementById('searchLocation').value.trim().toLowerCase();
            const date = document.getElementById('searchDate').value;
            const keyword = document.getElementById('searchKeyword').value.trim().toLowerCase();
            state.search = { location, date, keyword };
            state.results = state.events.filter(event => {
                const matchLocation = !location || event.location.toLowerCase().includes(location);
                const matchDate = !date || event.date === date;
                const matchKeyword = !keyword || event.title.toLowerCase().includes(keyword) || event.desc.toLowerCase().includes(keyword);
                return matchLocation && matchDate && matchKeyword;
            });
            saveState();
            render();
        };
    }
    // Bookmark Buttons
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.onclick = function() {
            const id = this.closest('.event-card').getAttribute('data-id');
            if (!state.bookmarks.includes(id)) {
                state.bookmarks.push(id);
            } else {
                state.bookmarks = state.bookmarks.filter(bid => bid !== id);
            }
            saveState();
            render();
        };
    });
    // Remove Bookmark Buttons
    document.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
        btn.onclick = function() {
            const id = this.closest('.bookmark-item').getAttribute('data-id');
            state.bookmarks = state.bookmarks.filter(bid => bid !== id);
            saveState();
            render();
        };
    });
    // Settings
    const theme = document.getElementById('theme');
    if (theme) {
        theme.onchange = function() {
            state.settings.theme = this.value;
            document.body.className = this.value;
            saveState();
        };
    }
}

// --- Initialization ---
loadState();
render();
