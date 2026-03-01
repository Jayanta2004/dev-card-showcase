// Scent Memory Logger App
// ...existing code...
class ScentMemory {
  constructor(scent, emotion, location, note, date) {
    this.scent = scent;
    this.emotion = emotion;
    this.location = location;
    this.note = note;
    this.date = date || new Date();
  }
}

class ScentMemoryMap {
  constructor() {
    this.memories = [];
    this.load();
  }
  addMemory(memory) {
    this.memories.push(memory);
    this.save();
  }
  removeMemory(index) {
    this.memories.splice(index, 1);
    this.save();
  }
  save() {
    localStorage.setItem('scentMemories', JSON.stringify(this.memories));
  }
  load() {
    const data = localStorage.getItem('scentMemories');
    if (data) this.memories = JSON.parse(data).map(m => new ScentMemory(m.scent, m.emotion, m.location, m.note, m.date));
  }
  getMemories() {
    return this.memories;
  }
  getMemoriesByEmotion(emotion) {
    return this.memories.filter(m => m.emotion === emotion);
  }
  getMemoriesByLocation(location) {
    return this.memories.filter(m => m.location === location);
  }
}

const scentMap = new ScentMemoryMap();

function renderAddSection() {
  const div = document.getElementById('add-section');
  div.innerHTML = `
    <h2>Add Scent Memory</h2>
    <form id="add-form">
      <label>Scent:</label>
      <input type="text" id="scent" required>
      <label>Emotion:</label>
      <select id="emotion">
        <option value="happy">Happy</option>
        <option value="calm">Calm</option>
        <option value="nostalgic">Nostalgic</option>
        <option value="energized">Energized</option>
        <option value="relaxed">Relaxed</option>
        <option value="sad">Sad</option>
        <option value="excited">Excited</option>
      </select>
      <label>Location:</label>
      <input type="text" id="location" required>
      <label>Note:</label>
      <textarea id="note" rows="2"></textarea>
      <button type="submit">Add Memory</button>
    </form>
  `;
  document.getElementById('add-form').onsubmit = function(e) {
    e.preventDefault();
    const scent = document.getElementById('scent').value;
    const emotion = document.getElementById('emotion').value;
    const location = document.getElementById('location').value;
    const note = document.getElementById('note').value;
    scentMap.addMemory(new ScentMemory(scent, emotion, location, note));
    renderMemorySection();
    renderEmotionSection();
    renderMapSection();
    renderListSection();
    this.reset();
  };
}

function renderMemorySection() {
  const div = document.getElementById('memory-section');
  const memories = scentMap.getMemories();
  if (memories.length === 0) {
    div.innerHTML = '<p>No scent memories yet.</p>';
    return;
  }
  div.innerHTML = memories.map((m, i) => `
    <div class="memory-card">
      <div><strong>Scent:</strong> ${m.scent}</div>
      <div class="memory-emotion">${m.emotion}</div>
      <div class="memory-location">${m.location}</div>
      <div><em>${m.note}</em></div>
      <div>${new Date(m.date).toLocaleDateString()}</div>
      <button onclick="removeMemory(${i})">Remove</button>
    </div>
  `).join('');
}

function removeMemory(index) {
  scentMap.removeMemory(index);
  renderMemorySection();
  renderEmotionSection();
  renderMapSection();
  renderListSection();
}

function renderEmotionSection() {
  const div = document.getElementById('emotion-section');
  const emotions = [...new Set(scentMap.getMemories().map(m => m.emotion))];
  div.innerHTML = `<h2>Emotions</h2><ul>${emotions.map(e => `<li>${e} (${scentMap.getMemoriesByEmotion(e).length})</li>`).join('')}</ul>`;
}

function renderMapSection() {
  const div = document.getElementById('map-section');
  const locations = [...new Set(scentMap.getMemories().map(m => m.location))];
  div.innerHTML = `<h2>Locations</h2><ul>${locations.map(l => `<li>${l} (${scentMap.getMemoriesByLocation(l).length})</li>`).join('')}</ul>`;
}

function renderListSection() {
  const div = document.getElementById('list-section');
  const memories = scentMap.getMemories();
  div.innerHTML = `<h2>All Memories</h2><ul>${memories.map(m => `<li>${m.scent} - ${m.emotion} - ${m.location}</li>`).join('')}</ul>`;
}

renderAddSection();
renderMemorySection();
renderEmotionSection();
renderMapSection();
renderListSection();
