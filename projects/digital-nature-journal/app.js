// Digital Nature Journal App
let entries = JSON.parse(localStorage.getItem('natureJournalEntries') || '[]');

function saveEntries() {
  localStorage.setItem('natureJournalEntries', JSON.stringify(entries));
}

function renderNewEntry() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">New Journal Entry</h2>
    <form id="entry-form">
      <label>Date
        <input type="date" id="entry-date" value="${new Date().toISOString().slice(0,10)}" required>
      </label>
      <label>Location
        <input type="text" id="entry-location" placeholder="e.g. Yosemite National Park" required>
      </label>
      <label>Weather
        <input type="text" id="entry-weather" placeholder="e.g. Sunny, 22°C" required>
      </label>
      <label>Photo
        <input type="file" id="entry-photo" accept="image/*">
      </label>
      <label>Reflection
        <textarea id="entry-reflection" rows="4" placeholder="Describe your experience..." required></textarea>
      </label>
      <button class="action" type="submit">Save Entry</button>
    </form>
  `;
  document.getElementById('entry-form').onsubmit = handleNewEntry;
}

function handleNewEntry(e) {
  e.preventDefault();
  const date = document.getElementById('entry-date').value;
  const location = document.getElementById('entry-location').value;
  const weather = document.getElementById('entry-weather').value;
  const reflection = document.getElementById('entry-reflection').value;
  const photoInput = document.getElementById('entry-photo');
  if (photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const photo = evt.target.result;
      saveEntry({ date, location, weather, reflection, photo });
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveEntry({ date, location, weather, reflection, photo: null });
  }
}

function saveEntry(entry) {
  entries.push(entry);
  saveEntries();
  renderFeed();
}

function renderFeed() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Journal Feed</h2>
    <div id="feed-list">
      ${entries.length ? entries.slice().reverse().map(e => `
        <div class="card">
          <div class="journal-meta">${e.date} | ${e.location} | ${e.weather}</div>
          ${e.photo ? `<img class="journal-photo" src="${e.photo}" alt="Journal Photo">` : ''}
          <div>${e.reflection}</div>
        </div>
      `).join('') : '<p>No entries yet. Start journaling your nature experiences!</p>'}
    </div>
  `;
}

function renderReflections() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Reflections</h2>
    <div>
      ${entries.length ? entries.map(e => `
        <div class="card">
          <div class="journal-meta">${e.date} | ${e.location}</div>
          <div>${e.reflection}</div>
        </div>
      `).join('') : '<p>No reflections yet.</p>'}
    </div>
  `;
}

document.getElementById('nav-new').onclick = renderNewEntry;
document.getElementById('nav-feed').onclick = renderFeed;
document.getElementById('nav-reflect').onclick = renderReflections;

// Initial load
renderFeed();
