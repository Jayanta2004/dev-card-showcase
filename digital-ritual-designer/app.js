// Digital Ritual Designer App
// ...existing code...
class Ritual {
  constructor(name, description, frequency, time, creator = 'Me') {
    this.name = name;
    this.description = description;
    this.frequency = frequency;
    this.time = time;
    this.creator = creator;
    this.completed = false;
  }
}

class RitualDesigner {
  constructor() {
    this.rituals = [];
    this.communityRituals = [];
    this.load();
  }
  addRitual(ritual) {
    this.rituals.push(ritual);
    this.save();
  }
  completeRitual(index) {
    if (this.rituals[index]) {
      this.rituals[index].completed = true;
      this.save();
    }
  }
  addCommunityRitual(ritual) {
    this.communityRituals.push(ritual);
    this.save();
  }
  getRituals() {
    return this.rituals;
  }
  getCommunityRituals() {
    return this.communityRituals;
  }
  save() {
    localStorage.setItem('rituals', JSON.stringify(this.rituals));
    localStorage.setItem('communityRituals', JSON.stringify(this.communityRituals));
  }
  load() {
    const r = localStorage.getItem('rituals');
    if (r) this.rituals = JSON.parse(r).map(m => new Ritual(m.name, m.description, m.frequency, m.time, m.creator));
    const c = localStorage.getItem('communityRituals');
    if (c) this.communityRituals = JSON.parse(c).map(m => new Ritual(m.name, m.description, m.frequency, m.time, m.creator));
  }
}

const designer = new RitualDesigner();

function renderCreateSection() {
  const div = document.getElementById('create-section');
  div.innerHTML = `
    <h2>Create Ritual</h2>
    <form id="create-form">
      <input type="text" id="ritual-name" placeholder="Ritual name" required>
      <textarea id="ritual-desc" rows="2" placeholder="Description" required></textarea>
      <label>Frequency:</label>
      <select id="ritual-frequency">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <label>Time:</label>
      <input type="time" id="ritual-time" required>
      <button type="submit">Add Ritual</button>
    </form>
  `;
  document.getElementById('create-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('ritual-name').value;
    const desc = document.getElementById('ritual-desc').value;
    const freq = document.getElementById('ritual-frequency').value;
    const time = document.getElementById('ritual-time').value;
    designer.addRitual(new Ritual(name, desc, freq, time));
    renderMyRitualsSection();
    this.reset();
  };
}

function renderRitualsSection() {
  const div = document.getElementById('rituals-section');
  const rituals = designer.getRituals();
  div.innerHTML = `<h2>All Rituals</h2>` + (rituals.length ? rituals.map((r, i) => `<div class="ritual-card"><strong>${r.name}</strong><br>${r.description}<br>${r.frequency} at ${r.time}<br><button onclick="completeRitual(${i})">Mark as Done</button></div>`).join('') : '<p>No rituals yet.</p>');
}
function completeRitual(index) {
  designer.completeRitual(index);
  renderRitualsSection();
  renderMyRitualsSection();
}

function renderReminderSection() {
  const div = document.getElementById('reminder-section');
  div.innerHTML = `<h2>Reminders</h2><p>Reminders will be sent for daily/weekly rituals at the set time.</p>`;
}

function renderCommunitySection() {
  const div = document.getElementById('community-section');
  const rituals = designer.getCommunityRituals();
  div.innerHTML = `<h2>Community Rituals</h2>` + (rituals.length ? rituals.map(r => `<div class="community-card"><strong>${r.name}</strong><br>${r.description}<br>${r.frequency} at ${r.time}<br>By: ${r.creator}</div>`).join('') : '<p>No community rituals yet.</p>');
}

function renderMyRitualsSection() {
  const div = document.getElementById('my-rituals-section');
  const rituals = designer.getRituals().filter(r => r.creator === 'Me');
  div.innerHTML = rituals.length ? rituals.map(r => `<div class="ritual-card"><strong>${r.name}</strong><br>${r.description}<br>${r.frequency} at ${r.time}<br>${r.completed ? '<span style="color:green">Completed</span>' : ''}</div>`).join('') : '<p>No personal rituals yet.</p>';
}

renderCreateSection();
renderRitualsSection();
renderReminderSection();
renderCommunitySection();
renderMyRitualsSection();
