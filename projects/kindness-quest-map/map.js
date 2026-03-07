// Kindness Quest Map App Logic
// Data model: locations, acts, users, badges, items, stories
// Visualization: SVG map, unlockable locations, interactivity

const STORAGE_KEY = 'kindnessQuestMapData';

function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: [], locations: [], badges: [], items: [], stories: [] };
  return JSON.parse(raw);
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Location node
class Location {
  constructor(name, x, y, story, badge, item) {
    this.id = Date.now() + Math.random();
    this.name = name;
    this.x = x;
    this.y = y;
    this.story = story;
    this.badge = badge;
    this.item = item;
    this.unlockedBy = [];
  }
}

// Map model
class KindnessMap {
  constructor() {
    this.locations = [];
    this.users = [];
    this.load();
    if (this.locations.length === 0) this.seedLocations();
  }
  addUser(username) {
    if (!this.users.includes(username)) {
      this.users.push(username);
      this.save();
    }
  }
  performKindness(username, locationId) {
    const loc = this.locations.find(l => l.id === locationId);
    if (loc && !loc.unlockedBy.includes(username)) {
      loc.unlockedBy.push(username);
      this.addUser(username);
      this.save();
      return true;
    }
    return false;
  }
  getUnlockedLocations(username) {
    return this.locations.filter(l => l.unlockedBy.includes(username));
  }
  getLockedLocations(username) {
    return this.locations.filter(l => !l.unlockedBy.includes(username));
  }
  getBadges(username) {
    return this.getUnlockedLocations(username).map(l => l.badge).filter(Boolean);
  }
  getItems(username) {
    return this.getUnlockedLocations(username).map(l => l.item).filter(Boolean);
  }
  getStories(username) {
    return this.getUnlockedLocations(username).map(l => l.story).filter(Boolean);
  }
  seedLocations() {
    this.locations = [
      new Location('Sunrise Hill', 120, 80, 'A story of hope begins here.', 'Hope Badge', 'Sunrise Token'),
      new Location('River of Giving', 320, 180, 'Generosity flows in this place.', 'Generosity Badge', 'River Stone'),
      new Location('Friendship Grove', 520, 120, 'Friendship grows under these trees.', 'Friendship Badge', 'Leaf of Unity'),
      new Location('Courage Peak', 220, 320, 'Acts of courage are celebrated here.', 'Courage Badge', 'Peak Crystal'),
      new Location('Harmony Lake', 420, 320, 'Harmony brings peace to all.', 'Harmony Badge', 'Lake Pearl'),
    ];
    this.save();
  }
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({locations: this.locations, users: this.users}));
  }
  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const obj = JSON.parse(data);
      this.locations = obj.locations || [];
      this.users = obj.users || [];
    }
  }
}

const map = new KindnessMap();

function renderLoginSection() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="form-section">
      <h2>Login</h2>
      <input id="username" placeholder="Enter your name" />
      <button onclick="onLogin()">Login</button>
    </div>
  `;
}
function onLogin() {
  const username = document.getElementById('username').value.trim();
  if (!username) return alert('Enter your name');
  sessionStorage.setItem('currentUser', username);
  map.addUser(username);
  renderApp();
}
function getCurrentUser() {
  return sessionStorage.getItem('currentUser');
}

function renderMapVisual() {
  const app = document.getElementById('app');
  app.innerHTML += `<div class="map-visual" id="mapVisual"></div>`;
  const username = getCurrentUser();
  const unlocked = map.getUnlockedLocations(username);
  const locked = map.getLockedLocations(username);
  const svgWidth = 600, svgHeight = 400;
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  // Draw locations
  map.locations.forEach(loc => {
    const isUnlocked = loc.unlockedBy.includes(username);
    svg += `<circle cx="${loc.x}" cy="${loc.y}" r="28" fill="${isUnlocked ? '#ffd200' : '#ccc'}" stroke="#333" stroke-width="2" cursor="pointer" onclick="showLocationModal(${loc.id})" />`;
    svg += `<text x="${loc.x}" y="${loc.y+5}" text-anchor="middle" font-size="13" fill="#333">${loc.name.split(' ')[0]}</text>`;
  });
  svg += `</svg>`;
  document.getElementById('mapVisual').innerHTML = svg;
}

function showLocationModal(locationId) {
  const loc = map.locations.find(l => l.id === locationId);
  const username = getCurrentUser();
  if (!loc) return;
  const isUnlocked = loc.unlockedBy.includes(username);
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-content">
    <h3>${loc.name}</h3>
    <p>${isUnlocked ? loc.story : 'Perform an act of kindness to unlock this location!'}</p>
    ${isUnlocked ? `<p><strong>Badge:</strong> ${loc.badge}</p><p><strong>Item:</strong> ${loc.item}</p>` : ''}
    <button onclick="document.body.removeChild(this.parentNode.parentNode)">Close</button>
    ${!isUnlocked ? `<button onclick="performKindness(${loc.id})">Perform Kindness</button>` : ''}
  </div>`;
  document.body.appendChild(modal);
}
function performKindness(locationId) {
  const username = getCurrentUser();
  if (!username) return;
  map.performKindness(username, locationId);
  document.body.removeChild(document.querySelector('.modal'));
  renderApp();
}

function renderBadges() {
  const username = getCurrentUser();
  const badges = map.getBadges(username);
  const app = document.getElementById('app');
  if (badges.length) {
    app.innerHTML += `<div class="badges">${badges.map(b => `<span class="badge">${b}</span>`).join('')}</div>`;
  }
}
function renderItems() {
  const username = getCurrentUser();
  const items = map.getItems(username);
  const app = document.getElementById('app');
  if (items.length) {
    app.innerHTML += `<div class="items">${items.map(i => `<span class="item">${i}</span>`).join('')}</div>`;
  }
}
function renderStories() {
  const username = getCurrentUser();
  const stories = map.getStories(username);
  const app = document.getElementById('app');
  if (stories.length) {
    app.innerHTML += `<h2>Unlocked Stories</h2>`;
    stories.forEach(story => {
      app.innerHTML += `<div class="story">${story}</div>`;
    });
  }
}

function renderApp() {
  const user = getCurrentUser();
  const app = document.getElementById('app');
  app.innerHTML = '';
  if (!user) {
    renderLoginSection();
    return;
  }
  renderMapVisual();
  renderBadges();
  renderItems();
  renderStories();
}

window.renderApp = renderApp;
window.showLocationModal = showLocationModal;
window.performKindness = performKindness;
window.onload = renderApp;
