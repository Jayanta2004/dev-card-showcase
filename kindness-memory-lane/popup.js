// Kindness Memory Lane Popup Script
// ...existing code...
class KindnessEvent {
  constructor(type, description, date) {
    this.type = type; // 'given' or 'received'
    this.description = description;
    this.date = date || new Date();
  }
}
class KindnessTimeline {
  constructor() {
    this.events = [];
    this.load();
  }
  addEvent(event) {
    this.events.push(event);
    this.save();
  }
  getEvents() {
    return this.events.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
  }
  save() {
    localStorage.setItem('kindnessEvents', JSON.stringify(this.events));
  }
  load() {
    const data = localStorage.getItem('kindnessEvents');
    if (data) this.events = JSON.parse(data).map(m => new KindnessEvent(m.type, m.description, m.date));
  }
}
const timeline = new KindnessTimeline();
function renderAddSection() {
  const div = document.getElementById('add-section');
  div.innerHTML = `
    <h2>Add Kindness Event</h2>
    <form id="add-form">
      <label>Type:</label>
      <select id="event-type">
        <option value="given">Given</option>
        <option value="received">Received</option>
      </select>
      <textarea id="event-desc" rows="2" placeholder="Describe the act of kindness..." required></textarea>
      <button type="submit">Add Event</button>
    </form>
  `;
  document.getElementById('add-form').onsubmit = function(e) {
    e.preventDefault();
    const type = document.getElementById('event-type').value;
    const desc = document.getElementById('event-desc').value;
    timeline.addEvent(new KindnessEvent(type, desc));
    renderTimelineSection();
    renderFeedSection();
    this.reset();
  };
}
function renderTimelineSection() {
  const div = document.getElementById('timeline-section');
  const events = timeline.getEvents();
  if (events.length === 0) {
    div.innerHTML = '<p>No kindness events yet.</p>';
    return;
  }
  div.innerHTML = `<div class="timeline">${events.map(e => `<div class="timeline-event"><strong>${e.type === 'given' ? 'Gave' : 'Received'}:</strong> ${e.description}<br><small>${new Date(e.date).toLocaleDateString()}</small></div>`).join('')}</div>`;
}
function renderFeedSection() {
  const div = document.getElementById('feed-section');
  const events = timeline.getEvents().slice().reverse();
  div.innerHTML = events.length ? events.map(e => `<div class="feed-card"><strong>${e.type === 'given' ? 'Gave' : 'Received'}:</strong> ${e.description}<br><small>${new Date(e.date).toLocaleDateString()}</small></div>`).join('') : '<p>No kindness events yet.</p>';
}
renderAddSection();
renderTimelineSection();
renderFeedSection();
