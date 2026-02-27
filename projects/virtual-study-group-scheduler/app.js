// Virtual Study Group Scheduler App
// Author: Ayaanshaikh12243
// Description: Coordinate study sessions and manage virtual study groups

// --- State Management ---
const state = {
    groups: [], // {id, name, members: [string], color}
    sessions: [], // {id, groupId, topic, date, time, duration, notes}
    view: 'dashboard',
    selectedGroup: null,
    settings: {
        weekStart: 'Sunday',
        theme: 'default',
    },
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem('studyGroupState', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('studyGroupState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.groups = parsed.groups || [];
        state.sessions = parsed.sessions || [];
        state.view = parsed.view || 'dashboard';
        state.selectedGroup = parsed.selectedGroup || null;
        state.settings = parsed.settings || { weekStart: 'Sunday', theme: 'default' };
    }
}
function uuid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}
function getToday() {
    return new Date().toISOString().slice(0, 10);
}
function getMonthDays(year, month) {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}
function getWeekdayNames() {
    return state.settings.weekStart === 'Monday'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
function getGroupColor(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    return group ? group.color : '#3e8ed0';
}

// --- Navigation ---
function setView(view) {
    state.view = view;
    saveState();
    render();
}
document.getElementById('dashboardBtn').onclick = () => setView('dashboard');
document.getElementById('groupsBtn').onclick = () => setView('groups');
document.getElementById('sessionsBtn').onclick = () => setView('sessions');
document.getElementById('calendarBtn').onclick = () => setView('calendar');
document.getElementById('settingsBtn').onclick = () => setView('settings');

// --- Render Functions ---
function render() {
    const main = document.getElementById('mainContent');
    switch (state.view) {
        case 'dashboard':
            main.innerHTML = renderDashboard();
            break;
        case 'groups':
            main.innerHTML = renderGroups();
            break;
        case 'sessions':
            main.innerHTML = renderSessions();
            break;
        case 'calendar':
            main.innerHTML = renderCalendar();
            break;
        case 'settings':
            main.innerHTML = renderSettings();
            break;
    }
    attachEventListeners();
}

// --- Dashboard View ---
function renderDashboard() {
    return `<h2>Dashboard</h2>
        <div class="stats">
            <div class="stat">Total Groups: <strong>${state.groups.length}</strong></div>
            <div class="stat">Total Sessions: <strong>${state.sessions.length}</strong></div>
        </div>
        <div class="group-list">
            <h3>Groups</h3>
            ${state.groups.map(group => `<div class="group-item" data-id="${group.id}">
                <span style="color:${group.color};font-weight:bold;">${group.name}</span>
                <span>Members: ${group.members.length}</span>
            </div>`).join('')}
        </div>
        <div class="session-list">
            <h3>Upcoming Sessions</h3>
            ${state.sessions.filter(s => new Date(s.date) >= new Date(getToday())).slice(0, 5).map(session => {
                const group = state.groups.find(g => g.id === session.groupId);
                return `<div class="session-item">
                    <span style="color:${getGroupColor(session.groupId)};font-weight:bold;">${group ? group.name : 'Unknown Group'}</span>
                    <span>${session.topic} - ${session.date} ${session.time}</span>
                </div>`;
            }).join('')}
        </div>`;
}

// --- Groups View ---
function renderGroups() {
    let html = `<h2>Groups</h2>
        <form id="groupForm">
            <input type="text" id="groupName" placeholder="Group Name" required />
            <input type="color" id="groupColor" value="#3e8ed0" />
            <input type="text" id="groupMembers" placeholder="Members (comma separated)" />
            <button type="submit">Add Group</button>
        </form>
        <div class="group-list">
            ${state.groups.map(group => `
                <div class="group-item" data-id="${group.id}">
                    <span style="color:${group.color};font-weight:bold;">${group.name}</span>
                    <span>Members: ${group.members.length}</span>
                    <div class="actions">
                        <button class="edit-group">Edit</button>
                        <button class="delete-group">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>`;
    return html;
}

// --- Sessions View ---
function renderSessions() {
    let html = `<h2>Sessions</h2>
        <form id="sessionForm">
            <select id="sessionGroup">
                ${state.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
            </select>
            <input type="text" id="sessionTopic" placeholder="Topic" required />
            <input type="date" id="sessionDate" required />
            <input type="time" id="sessionTime" required />
            <input type="number" id="sessionDuration" placeholder="Duration (min)" min="1" required />
            <input type="text" id="sessionNotes" placeholder="Notes (optional)" />
            <button type="submit">Add Session</button>
        </form>
        <div class="session-list">
            ${state.sessions.map(session => {
                const group = state.groups.find(g => g.id === session.groupId);
                return `<div class="session-item" data-id="${session.id}">
                    <span style="color:${getGroupColor(session.groupId)};font-weight:bold;">${group ? group.name : 'Unknown Group'}</span>
                    <span>${session.topic} - ${session.date} ${session.time} (${session.duration} min)</span>
                    <div class="actions">
                        <button class="edit-session">Edit</button>
                        <button class="delete-session">Delete</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    return html;
}

// --- Calendar View ---
function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = getMonthDays(year, month);
    const weekDays = getWeekdayNames();
    let html = `<h2>Calendar</h2>`;
    html += `<div class="calendar">
        ${weekDays.map(d => `<div class="calendar-day" style="font-weight:bold;">${d}</div>`).join('')}
        ${days.map(day => {
            const dateStr = day.toISOString().slice(0, 10);
            const sessions = state.sessions.filter(s => s.date === dateStr);
            let cell = '';
            sessions.forEach(session => {
                const group = state.groups.find(g => g.id === session.groupId);
                cell += `<div class="session-dot" data-id="${session.id}" style="background:${getGroupColor(session.groupId)}" title="${session.topic}"></div>`;
            });
            return `<div class="calendar-day${dateStr === getToday() ? ' today' : ''}">
                <div class="date-label">${day.getDate()}</div>
                <div class="session-dots">${cell}</div>
            </div>`;
        }).join('')}
    </div>`;
    return html;
}

// --- Settings View ---
function renderSettings() {
    return `<h2>Settings</h2>
        <div class="settings">
            <label>Week Start:
                <select id="weekStart">
                    <option value="Sunday"${state.settings.weekStart==='Sunday'?' selected':''}>Sunday</option>
                    <option value="Monday"${state.settings.weekStart==='Monday'?' selected':''}>Monday</option>
                </select>
            </label>
            <br><br>
            <label>Theme:
                <select id="theme">
                    <option value="default"${state.settings.theme==='default'?' selected':''}>Default</option>
                    <option value="dark"${state.settings.theme==='dark'?' selected':''}>Dark</option>
                </select>
            </label>
        </div>`;
}

// --- Event Listeners ---
function attachEventListeners() {
    // Group Form
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('groupName').value.trim();
            const color = document.getElementById('groupColor').value;
            const members = document.getElementById('groupMembers').value.split(',').map(m => m.trim()).filter(Boolean);
            if (name) {
                state.groups.push({ id: uuid(), name, color, members });
                saveState();
                render();
            }
        };
        document.querySelectorAll('.edit-group').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.group-item').getAttribute('data-id');
                editGroup(id);
            };
        });
        document.querySelectorAll('.delete-group').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.group-item').getAttribute('data-id');
                state.groups = state.groups.filter(g => g.id !== id);
                // Remove sessions for this group
                state.sessions = state.sessions.filter(s => s.groupId !== id);
                saveState();
                render();
            };
        });
    }
    // Session Form
    const sessionForm = document.getElementById('sessionForm');
    if (sessionForm) {
        sessionForm.onsubmit = function(e) {
            e.preventDefault();
            const groupId = document.getElementById('sessionGroup').value;
            const topic = document.getElementById('sessionTopic').value.trim();
            const date = document.getElementById('sessionDate').value;
            const time = document.getElementById('sessionTime').value;
            const duration = document.getElementById('sessionDuration').value;
            const notes = document.getElementById('sessionNotes').value;
            if (topic && date && time && duration) {
                state.sessions.push({ id: uuid(), groupId, topic, date, time, duration, notes });
                saveState();
                render();
            }
        };
        document.querySelectorAll('.edit-session').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.session-item').getAttribute('data-id');
                editSession(id);
            };
        });
        document.querySelectorAll('.delete-session').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.session-item').getAttribute('data-id');
                state.sessions = state.sessions.filter(s => s.id !== id);
                saveState();
                render();
            };
        });
    }
    // Settings
    const weekStart = document.getElementById('weekStart');
    if (weekStart) {
        weekStart.onchange = function() {
            state.settings.weekStart = this.value;
            saveState();
            render();
        };
    }
    const theme = document.getElementById('theme');
    if (theme) {
        theme.onchange = function() {
            state.settings.theme = this.value;
            document.body.className = this.value;
            saveState();
        };
    }
}

// --- Edit Group Modal (Simple Prompt) ---
function editGroup(id) {
    const group = state.groups.find(g => g.id === id);
    if (!group) return;
    const name = prompt('Edit group name:', group.name);
    if (name !== null && name.trim() !== '') {
        group.name = name.trim();
        saveState();
        render();
    }
}
// --- Edit Session Modal (Simple Prompt) ---
function editSession(id) {
    const session = state.sessions.find(s => s.id === id);
    if (!session) return;
    const topic = prompt('Edit session topic:', session.topic);
    if (topic !== null && topic.trim() !== '') {
        session.topic = topic.trim();
        saveState();
        render();
    }
}
// --- Initialization ---
loadState();
render();
