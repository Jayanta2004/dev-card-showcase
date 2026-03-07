// Positivity Pen Pal App
// ...existing code...
class PenPal {
  constructor(id) {
    this.id = id;
    this.messages = [];
  }
  sendMessage(text) {
    this.messages.push({ text, date: new Date() });
  }
  getMessages() {
    return this.messages.slice().reverse();
  }
}
class PenPalSystem {
  constructor() {
    this.penPals = [];
    this.currentUser = null;
    this.load();
  }
  matchUser() {
    const id = 'User' + Math.floor(Math.random()*10000);
    this.currentUser = new PenPal(id);
    this.penPals.push(this.currentUser);
    this.save();
  }
  sendMessage(text) {
    if (this.currentUser) {
      this.currentUser.sendMessage(text);
      this.save();
    }
  }
  getFeed() {
    return this.currentUser ? this.currentUser.getMessages() : [];
  }
  save() {
    localStorage.setItem('penPals', JSON.stringify(this.penPals));
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }
  load() {
    const pals = localStorage.getItem('penPals');
    if (pals) this.penPals = JSON.parse(pals).map(m => Object.assign(new PenPal(m.id), m));
    const user = localStorage.getItem('currentUser');
    if (user) this.currentUser = Object.assign(new PenPal(JSON.parse(user).id), JSON.parse(user));
  }
}
const system = new PenPalSystem();
function renderMatchSection() {
  const div = document.getElementById('match-section');
  div.innerHTML = system.currentUser ? `<p>Matched as: ${system.currentUser.id}</p>` : `<button onclick="matchUser()">Match Me With a Pen Pal</button>`;
}
function matchUser() {
  system.matchUser();
  renderMatchSection();
  renderExchangeSection();
  renderFeedSection();
}
function renderExchangeSection() {
  const div = document.getElementById('exchange-section');
  if (!system.currentUser) {
    div.innerHTML = '<p>Match with a pen pal to start exchanging messages.</p>';
    return;
  }
  div.innerHTML = `
    <h2>Send a Positive Message</h2>
    <form id="send-form">
      <textarea id="message-text" rows="2" placeholder="Write something uplifting..." required></textarea>
      <button type="submit">Send</button>
    </form>
  `;
  document.getElementById('send-form').onsubmit = function(e) {
    e.preventDefault();
    const text = document.getElementById('message-text').value;
    system.sendMessage(text);
    renderFeedSection();
    this.reset();
  };
}
function renderFeedSection() {
  const div = document.getElementById('feed-section');
  const feed = system.getFeed();
  div.innerHTML = feed.length ? feed.map(m => `<div class="message-card">${m.text}<br><small>${new Date(m.date).toLocaleDateString()}</small></div>`).join('') : '<p>No messages yet.</p>';
}
renderMatchSection();
renderExchangeSection();
renderFeedSection();
