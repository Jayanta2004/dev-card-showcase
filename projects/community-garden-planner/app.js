// Community Garden Planner App
// Data Models
let plots = JSON.parse(localStorage.getItem('gardenPlots') || '[]');
let members = JSON.parse(localStorage.getItem('gardenMembers') || '[]');
let harvests = JSON.parse(localStorage.getItem('gardenHarvests') || '[]');
let schedule = JSON.parse(localStorage.getItem('gardenSchedule') || '[]');

if (plots.length === 0) {
  plots = [
    { id: 1, name: 'Plot A', owner: '', plant: '', notes: '' },
    { id: 2, name: 'Plot B', owner: '', plant: '', notes: '' },
    { id: 3, name: 'Plot C', owner: '', plant: '', notes: '' },
    { id: 4, name: 'Plot D', owner: '', plant: '', notes: '' }
  ];
}
if (members.length === 0) {
  members = [
    { name: 'Alice', contact: 'alice@email.com' },
    { name: 'Bob', contact: 'bob@email.com' }
  ];
}

function saveAll() {
  localStorage.setItem('gardenPlots', JSON.stringify(plots));
  localStorage.setItem('gardenMembers', JSON.stringify(members));
  localStorage.setItem('gardenHarvests', JSON.stringify(harvests));
  localStorage.setItem('gardenSchedule', JSON.stringify(schedule));
}

function renderPlots() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Garden Plots</h2>
    <div class="plot-grid">
      ${plots.map((plot, idx) => `
        <div class="plot-card">
          <div><strong>${plot.name}</strong></div>
          <div class="plot-owner">Owner: ${plot.owner || '<em>Unassigned</em>'}</div>
          <div class="plot-plant">Plant: ${plot.plant || '<em>None</em>'}</div>
          <div>Notes: ${plot.notes || ''}</div>
          <button class="action" onclick="editPlot(${idx})">Edit</button>
        </div>
      `).join('')}
    </div>
    <button class="action" onclick="addPlot()">Add New Plot</button>
  `;
}

function addPlot() {
  const name = prompt('Enter plot name:');
  if (!name) return;
  plots.push({ id: Date.now(), name, owner: '', plant: '', notes: '' });
  saveAll();
  renderPlots();
}

function editPlot(idx) {
  const plot = plots[idx];
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Edit ${plot.name}</h2>
    <form id="plot-form">
      <label>Owner
        <select id="plot-owner">
          <option value="">Unassigned</option>
          ${members.map(m => `<option value="${m.name}" ${plot.owner === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>
      </label>
      <label>Plant
        <input type="text" id="plot-plant" value="${plot.plant}">
      </label>
      <label>Notes
        <textarea id="plot-notes" rows="2">${plot.notes}</textarea>
      </label>
      <button class="action" type="submit">Save</button>
      <button class="action" type="button" onclick="renderPlots()">Cancel</button>
    </form>
  `;
  document.getElementById('plot-form').onsubmit = function(e) {
    e.preventDefault();
    plot.owner = document.getElementById('plot-owner').value;
    plot.plant = document.getElementById('plot-plant').value;
    plot.notes = document.getElementById('plot-notes').value;
    saveAll();
    renderPlots();
  };
}

function renderSchedule() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Plant Schedule</h2>
    <div id="calendar"></div>
    <button class="action" onclick="addScheduleEvent()">Add Planting Event</button>
  `;
  setTimeout(initCalendar, 0);
}

function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 500,
    events: schedule.map(ev => ({
      title: ev.title,
      start: ev.date,
      description: ev.description
    })),
    eventClick: function(info) {
      alert(info.event.title + '\n' + info.event.extendedProps.description);
    }
  });
  calendar.render();
}

function addScheduleEvent() {
  const title = prompt('Event title (e.g. Plant Tomatoes):');
  if (!title) return;
  const date = prompt('Event date (YYYY-MM-DD):');
  if (!date) return;
  const description = prompt('Description:');
  schedule.push({ title, date, description });
  saveAll();
  renderSchedule();
}

function renderHarvest() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Harvest Log</h2>
    <form id="harvest-form">
      <label>Plot
        <select id="harvest-plot">
          ${plots.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
        </select>
      </label>
      <label>Plant
        <input type="text" id="harvest-plant">
      </label>
      <label>Date
        <input type="date" id="harvest-date" value="${new Date().toISOString().slice(0,10)}">
      </label>
      <label>Amount (e.g. 2kg, 5 tomatoes)
        <input type="text" id="harvest-amount">
      </label>
      <label>Notes
        <textarea id="harvest-notes" rows="2"></textarea>
      </label>
      <button class="action" type="submit">Log Harvest</button>
    </form>
    <ul class="harvest-list">
      ${harvests.length ? harvests.slice().reverse().map(h => `
        <li>
          <span><strong>${h.plant}</strong> from <em>${h.plot}</em></span>
          <span class="date">${h.date}</span>
          <span>Amount: ${h.amount}</span>
          <span>${h.notes ? h.notes : ''}</span>
        </li>
      `).join('') : '<li>No harvests logged yet.</li>'}
    </ul>
  `;
  document.getElementById('harvest-form').onsubmit = function(e) {
    e.preventDefault();
    const plot = document.getElementById('harvest-plot').value;
    const plant = document.getElementById('harvest-plant').value;
    const date = document.getElementById('harvest-date').value;
    const amount = document.getElementById('harvest-amount').value;
    const notes = document.getElementById('harvest-notes').value;
    if (!plot || !plant || !date || !amount) {
      alert('Please fill all required fields.');
      return;
    }
    harvests.push({ plot, plant, date, amount, notes });
    saveAll();
    renderHarvest();
  };
}

function renderMembers() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Garden Members</h2>
    <form id="member-form">
      <label>Name
        <input type="text" id="member-name" required>
      </label>
      <label>Contact
        <input type="text" id="member-contact" required>
      </label>
      <button class="action" type="submit">Add Member</button>
    </form>
    <ul class="member-list">
      ${members.length ? members.map(m => `
        <li>
          <span><strong>${m.name}</strong></span>
          <span>${m.contact}</span>
        </li>
      `).join('') : '<li>No members yet.</li>'}
    </ul>
  `;
  document.getElementById('member-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('member-name').value;
    const contact = document.getElementById('member-contact').value;
    if (!name || !contact) {
      alert('Please fill all fields.');
      return;
    }
    members.push({ name, contact });
    saveAll();
    renderMembers();
  };
}

document.getElementById('nav-plots').onclick = renderPlots;
document.getElementById('nav-schedule').onclick = renderSchedule;
document.getElementById('nav-harvest').onclick = renderHarvest;
document.getElementById('nav-members').onclick = renderMembers;

// Initial load
renderPlots();
