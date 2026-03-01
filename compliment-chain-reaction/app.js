
// Gratitude Relay Advanced App
// Data model: relay chain, users, notes, badges, stories, unlocks
class GratitudeNote {
  constructor(sender, recipient, message, date) {
    this.sender = sender;
    this.recipient = recipient;
    this.message = message;
    this.date = date || new Date();
    this.unlocked = false;
    this.id = Date.now() + Math.random();
  }
}
class RelayChain {
  constructor() {
    this.notes = [];
    this.users = [];
    this.badges = [];
    this.stories = [];
    this.load();
  }
  addUser(username) {
    if (!this.users.includes(username)) {
      this.users.push(username);
      this.save();
    }
  }
  sendNote(sender, recipient, message) {
    // Only allow if recipient is unlocked or first note
    if (this.notes.length === 0 || this.notes.some(n => n.recipient === sender && n.unlocked)) {
      const note = new GratitudeNote(sender, recipient, message);
      this.notes.push(note);
      // Unlock recipient for next note
      this.notes.forEach(n => { if (n.recipient === recipient) n.unlocked = true; });
      this.addUser(sender);
      this.addUser(recipient);
      this.save();
      return true;
    }
    return false;
  }
  getRelayGraph() {
    // Build graph: {user: [recipients]}
    const graph = {};
    this.notes.forEach(link => {
      if (!graph[link.sender]) graph[link.sender] = [];
      graph[link.sender].push(link.recipient);
    });
    return graph;
  }
  getHistory() {
    return this.notes.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  getBadges() {
    // Example: badge for relay length > 5
    const relayLength = this.notes.length;
    const badges = [];
    if (relayLength >= 5) badges.push('Relay Novice');
    if (relayLength >= 10) badges.push('Relay Champion');
    if (relayLength >= 20) badges.push('Relay Legend');
    return badges;
  }
  getImpactStories() {
    // For demo, pick random notes as stories
    return this.notes.slice(-3).map(note => ({
      user: note.recipient,
      message: note.message,
      timestamp: note.date,
    }));
  }
  save() {
    localStorage.setItem('relayNotes', JSON.stringify({notes: this.notes, users: this.users, badges: this.badges, stories: this.stories}));
  }
  load() {
    const data = localStorage.getItem('relayNotes');
    if (data) {
      const obj = JSON.parse(data);
      this.notes = obj.notes ? obj.notes.map(m => Object.assign(new GratitudeNote(m.sender, m.recipient, m.message, m.date), m)) : [];
      this.users = obj.users || [];
      this.badges = obj.badges || [];
      this.stories = obj.stories || [];
    }
  }
}
const relay = new RelayChain();

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
  relay.addUser(username);
  renderApp();
}
function getCurrentUser() {
  return sessionStorage.getItem('currentUser');
}

function renderSendNoteSection() {
  const user = getCurrentUser();
  const app = document.getElementById('app');
  app.innerHTML += `
    <div class="form-section">
      <h2>Send a Gratitude Note</h2>
      <input id="toUser" placeholder="Recipient's name" />
      <textarea id="noteMessage" placeholder="Your message"></textarea>
      <button onclick="onSendNote()">Send Note</button>
    </div>
  `;
}
function onSendNote() {
  const to = document.getElementById('toUser').value.trim();
  const message = document.getElementById('noteMessage').value.trim();
  const from = getCurrentUser();
  if (!to || !message) return alert('Fill all fields');
  const success = relay.sendNote(from, to, message);
  if (!success) {
    alert('You can only send a note if you have received one!');
    return;
  }
  renderApp();
}

function renderRelayGraph() {
  const graph = relay.getRelayGraph();
  const app = document.getElementById('app');
  if (!Object.keys(graph).length) {
    app.innerHTML += '<div class="relay-graph"><em>No relay started yet.</em></div>';
    return;
  }
  let html = '<div class="relay-graph"><ul>';
  function renderNode(user) {
    html += `<li><strong>${user}</strong>`;
    if (graph[user]) {
      html += '<ul>';
      graph[user].forEach(child => renderNode(child));
      html += '</ul>';
    }
    html += '</li>';
  }
  // Find root(s)
  const allRecipients = Object.values(graph).flat();
  const roots = Object.keys(graph).filter(u => !allRecipients.includes(u));
  roots.forEach(root => renderNode(root));
  html += '</ul></div>';
  app.innerHTML += html;
}

function renderRelayHistory() {
  const history = relay.getHistory();
  const app = document.getElementById('app');
  app.innerHTML += `<h2>Relay History</h2><ul class="history-list">${history.length ? history.map(note => `<li><strong>${note.sender}</strong> → <strong>${note.recipient}</strong>: ${note.message}<br><small>${new Date(note.date).toLocaleString()}</small></li>`).join('') : '<li>No notes yet.</li>'}</ul>`;
}

function renderBadges() {
  const badges = relay.getBadges();
  const app = document.getElementById('app');
  if (badges.length) {
    app.innerHTML += `<div class="badges">${badges.map(b => `<span class="badge">${b}</span>`).join('')}</div>`;
  }
}

function renderImpactStories() {
  const stories = relay.getImpactStories();
  const app = document.getElementById('app');
  if (stories.length) {
    app.innerHTML += `<h2>Stories of Impact</h2>`;
    stories.forEach(story => {
      app.innerHTML += `<div class="impact-story"><strong>${story.user}</strong>: ${story.message}<br><small>${new Date(story.timestamp).toLocaleString()}</small></div>`;
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
  renderSendNoteSection();
  renderRelayGraph();
  renderRelayHistory();
  renderBadges();
  renderImpactStories();
}

window.onload = renderApp;
