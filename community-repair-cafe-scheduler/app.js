// Community Repair Café Scheduler
// Author: EWOC Contributors
// Description: Connects people needing repairs with local volunteers and schedules repair events.

const repairForm = document.getElementById('repairForm');
const volunteerForm = document.getElementById('volunteerForm');
const confirmation = document.getElementById('confirmation');
const eventsDiv = document.getElementById('events');
const requestsDiv = document.getElementById('requests');
const volunteersDiv = document.getElementById('volunteers');

const STORAGE_KEY = 'repairCafeData';

function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { requests: [], volunteers: [], events: [] };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function matchEvents() {
    const data = getData();
    const events = [];
    const usedVolunteers = new Set();
    data.requests.forEach(req => {
        const match = data.volunteers.find(vol =>
            !usedVolunteers.has(vol.volName) &&
            vol.skills.split(',').map(s => s.trim().toLowerCase()).some(skill => req.issue.toLowerCase().includes(skill)) &&
            vol.availDate === req.date
        );
        if (match) {
            events.push({
                item: req.item,
                issue: req.issue,
                date: req.date,
                volunteer: match.volName,
                skills: match.skills
            });
            usedVolunteers.add(match.volName);
        }
    });
    data.events = events;
    saveData(data);
}

function renderEvents() {
    const data = getData();
    if (!data.events.length) {
        eventsDiv.innerHTML = '<em>No scheduled events yet.</em>';
        return;
    }
    eventsDiv.innerHTML = data.events.map(e =>
        `<div class="event-card">
            <b>${escapeHtml(e.item)}</b> (${escapeHtml(e.issue)})<br>
            Date: ${e.date}<br>
            Volunteer: <b>${escapeHtml(e.volunteer)}</b> (${escapeHtml(e.skills)})
        </div>`
    ).join('');
}

function renderRequests() {
    const data = getData();
    if (!data.requests.length) {
        requestsDiv.innerHTML = '<em>No repair requests yet.</em>';
        return;
    }
    requestsDiv.innerHTML = data.requests.slice().reverse().map(r =>
        `<div class="request-card">
            <b>${escapeHtml(r.item)}</b> (${escapeHtml(r.issue)})<br>
            Date: ${r.date}
        </div>`
    ).join('');
}

function renderVolunteers() {
    const data = getData();
    if (!data.volunteers.length) {
        volunteersDiv.innerHTML = '<em>No volunteers yet.</em>';
        return;
    }
    volunteersDiv.innerHTML = data.volunteers.slice().reverse().map(v =>
        `<div class="volunteer-card">
            <b>${escapeHtml(v.volName)}</b><br>
            Skills: ${escapeHtml(v.skills)}<br>
            Available: ${v.availDate}
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

repairForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const item = repairForm.item.value.trim();
    const issue = repairForm.issue.value.trim();
    const date = repairForm.date.value;
    if (!item || !issue || !date) return;
    const data = getData();
    data.requests.push({ item, issue, date });
    saveData(data);
    confirmation.textContent = 'Repair request submitted!';
    confirmation.classList.remove('hidden');
    repairForm.reset();
    matchEvents();
    renderEvents();
    renderRequests();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

volunteerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const volName = volunteerForm.volName.value.trim();
    const skills = volunteerForm.skills.value.trim();
    const availDate = volunteerForm.availDate.value;
    if (!volName || !skills || !availDate) return;
    const data = getData();
    data.volunteers.push({ volName, skills, availDate });
    saveData(data);
    confirmation.textContent = 'Volunteer registered!';
    confirmation.classList.remove('hidden');
    volunteerForm.reset();
    matchEvents();
    renderEvents();
    renderVolunteers();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
matchEvents();
renderEvents();
renderRequests();
renderVolunteers();
