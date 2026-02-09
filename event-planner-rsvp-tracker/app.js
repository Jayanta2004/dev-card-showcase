// Event Planner & RSVP Tracker
let events = JSON.parse(localStorage.getItem('events') || '[]');
let guests = JSON.parse(localStorage.getItem('guests') || '[]');
let rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');

function renderEvents() {
    const eventsDiv = document.getElementById('events');
    eventsDiv.innerHTML = '';
    events.forEach(e => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `<b>${e.title}</b><br><small>${e.date}</small><br><p>${e.desc}</p>`;
        eventsDiv.appendChild(card);
    });
    renderEventSelect();
    renderTimeline();
    renderCalendar();
}

document.getElementById('add-event-btn').onclick = function() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const desc = document.getElementById('event-desc').value.trim();
    if (!title || !date || !desc) {
        alert('Please fill all required fields.');
        return;
    }
    events.push({ title, date, desc });
    localStorage.setItem('events', JSON.stringify(events));
    renderEvents();
};

function renderEventSelect() {
    const select = document.getElementById('event-select');
    select.innerHTML = '';
    events.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.title;
        opt.textContent = e.title;
        select.appendChild(opt);
    });
}

document.getElementById('add-guest-btn').onclick = function() {
    const name = document.getElementById('guest-name').value.trim();
    const email = document.getElementById('guest-email').value.trim();
    const event = document.getElementById('event-select').value;
    if (!name || !email || !event) {
        alert('Please fill all required fields.');
        return;
    }
    guests.push({ name, email, event });
    localStorage.setItem('guests', JSON.stringify(guests));
    renderGuests();
    renderRSVPs();
};

function renderGuests() {
    const guestsDiv = document.getElementById('guests');
    guestsDiv.innerHTML = '';
    guests.forEach(g => {
        const card = document.createElement('div');
        card.className = 'guest-card';
        card.innerHTML = `<b>${g.name}</b><br><small>${g.email}</small><br><small>Event: ${g.event}</small>`;
        card.innerHTML += `<button onclick="toggleRSVP('${g.name}','${g.event}')">RSVP</button>`;
        guestsDiv.appendChild(card);
    });
}

function toggleRSVP(name, event) {
    const idx = rsvps.findIndex(r => r.name === name && r.event === event);
    if (idx === -1) {
        rsvps.push({ name, event, status: 'yes' });
    } else {
        rsvps[idx].status = rsvps[idx].status === 'yes' ? 'no' : 'yes';
    }
    localStorage.setItem('rsvps', JSON.stringify(rsvps));
    renderRSVPs();
}

function renderRSVPs() {
    const rsvpsDiv = document.getElementById('rsvps');
    rsvpsDiv.innerHTML = '';
    rsvps.forEach(r => {
        const card = document.createElement('div');
        card.className = 'rsvp-card';
        card.innerHTML = `<b>${r.name}</b><br><small>Event: ${r.event}</small><br><small>Status: ${r.status}</small>`;
        rsvpsDiv.appendChild(card);
    });
}

function renderTimeline() {
    const canvas = document.getElementById('timeline-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,800,200);
    events.forEach((e, idx) => {
        const x = 100 + idx*200;
        const y = 100;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, 2*Math.PI);
        ctx.fillStyle = '#4f8cff';
        ctx.fill();
        ctx.font = 'bold 16px Segoe UI';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(e.title, x, y+6);
        ctx.fillStyle = '#333';
        ctx.fillText(e.date, x, y+36);
        if (idx > 0) {
            ctx.beginPath();
            ctx.moveTo(100 + (idx-1)*200 + 24, y);
            ctx.lineTo(x - 24, y);
            ctx.strokeStyle = '#4f8cff';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    });
}

function renderReminders() {
    const remindersDiv = document.getElementById('reminders-list');
    remindersDiv.innerHTML = '';
    reminders.forEach(r => {
        remindersDiv.innerHTML += `<div class="reminder-card"><b>${r.event}</b><br><small>${r.date}</small></div>`;
    });
}

document.getElementById('add-reminder-btn').onclick = function() {
    const event = document.getElementById('reminder-event').value.trim();
    const date = document.getElementById('reminder-date').value;
    if (!event || !date) {
        alert('Please fill all required fields.');
        return;
    }
    reminders.push({ event, date });
    localStorage.setItem('reminders', JSON.stringify(reminders));
    renderReminders();
};

function renderCalendar() {
    const calDiv = document.getElementById('calendar-view');
    calDiv.innerHTML = '';
    events.forEach(e => {
        calDiv.innerHTML += `<div><b>${e.title}</b>: ${e.date}</div>`;
    });
}

document.getElementById('export-csv-btn').onclick = function() {
    let csv = 'Event,Date,Description\n';
    events.forEach(e => {
        csv += `${e.title},${e.date},"${e.desc.replace(/\n/g,' ')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'events.csv';
    link.click();
};

document.getElementById('export-json-btn').onclick = function() {
    const json = JSON.stringify({ events, guests, rsvps, reminders }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'events.json';
    link.click();
};

renderEvents();
renderGuests();
renderRSVPs();
renderReminders();