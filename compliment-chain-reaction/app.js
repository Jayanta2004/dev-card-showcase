// Compliment Chain Reaction App
// ...existing code...
class Compliment {
  constructor(sender, recipient, message, date) {
    this.sender = sender;
    this.recipient = recipient;
    this.message = message;
    this.date = date || new Date();
    this.unlocked = false;
  }
}
class Chain {
  constructor() {
    this.compliments = [];
    this.load();
  }
  sendCompliment(sender, recipient, message) {
    // Only allow if recipient is unlocked or first compliment
    if (this.compliments.length === 0 || this.compliments.some(c => c.recipient === sender && c.unlocked)) {
      this.compliments.push(new Compliment(sender, recipient, message));
      // Unlock recipient for next compliment
      this.compliments.forEach(c => { if (c.recipient === recipient) c.unlocked = true; });
      this.save();
      return true;
    }
    return false;
  }
  getChain() {
    return this.compliments.slice();
  }
  getFeed() {
    return this.compliments.slice().reverse();
  }
  save() {
    localStorage.setItem('chainCompliments', JSON.stringify(this.compliments));
  }
  load() {
    const data = localStorage.getItem('chainCompliments');
    if (data) this.compliments = JSON.parse(data).map(m => Object.assign(new Compliment(m.sender, m.recipient, m.message, m.date), m));
  }
}
const chain = new Chain();
function renderSendSection() {
  const div = document.getElementById('send-section');
  div.innerHTML = `
    <h2>Send a Compliment</h2>
    <form id="send-form">
      <input type="text" id="sender" placeholder="Your name" required>
      <input type="text" id="recipient" placeholder="Recipient name" required>
      <textarea id="compliment-message" rows="2" placeholder="Write something kind..." required></textarea>
      <button type="submit">Send Compliment</button>
    </form>
  `;
  document.getElementById('send-form').onsubmit = function(e) {
    e.preventDefault();
    const sender = document.getElementById('sender').value;
    const recipient = document.getElementById('recipient').value;
    const message = document.getElementById('compliment-message').value;
    const success = chain.sendCompliment(sender, recipient, message);
    if (!success) {
      alert('You can only send a compliment if you have received one!');
      return;
    }
    renderChainSection();
    renderFeedSection();
    this.reset();
  };
}
function renderChainSection() {
  const div = document.getElementById('chain-section');
  const compliments = chain.getChain();
  if (compliments.length === 0) {
    div.innerHTML = '<p>No compliments yet.</p>';
    return;
  }
  div.innerHTML = `<h2>Compliment Chain</h2>` + compliments.map(c => `<div class="chain-card"><strong>${c.sender}</strong> → <strong>${c.recipient}</strong><br>${c.message}<br><small>${new Date(c.date).toLocaleDateString()}</small></div>`).join('');
}
function renderFeedSection() {
  const div = document.getElementById('feed-section');
  const compliments = chain.getFeed();
  div.innerHTML = compliments.length ? compliments.map(c => `<div class="feed-card"><strong>${c.sender}</strong> → <strong>${c.recipient}</strong><br>${c.message}<br><small>${new Date(c.date).toLocaleDateString()}</small></div>`).join('') : '<p>No compliments yet.</p>';
}
renderSendSection();
renderChainSection();
renderFeedSection();
