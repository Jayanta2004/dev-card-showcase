// Digital Compliment Exchange App
// ...existing code...
class Compliment {
  constructor(message, date, sender = 'Anonymous') {
    this.message = message;
    this.date = date || new Date();
    this.sender = sender;
  }
}

class ComplimentExchange {
  constructor() {
    this.compliments = [];
    this.rewards = [];
    this.load();
  }
  sendCompliment(message) {
    const compliment = new Compliment(message);
    this.compliments.push(compliment);
    this.checkRewards();
    this.save();
  }
  receiveCompliment() {
    if (this.compliments.length === 0) return null;
    return this.compliments[Math.floor(Math.random() * this.compliments.length)];
  }
  getFeed() {
    return this.compliments.slice().reverse();
  }
  checkRewards() {
    const count = this.compliments.length;
    if (count === 5 && !this.rewards.includes('Kindness Starter')) {
      this.rewards.push('Kindness Starter');
    }
    if (count === 20 && !this.rewards.includes('Kindness Champion')) {
      this.rewards.push('Kindness Champion');
    }
    if (count === 50 && !this.rewards.includes('Kindness Legend')) {
      this.rewards.push('Kindness Legend');
    }
  }
  save() {
    localStorage.setItem('compliments', JSON.stringify(this.compliments));
    localStorage.setItem('rewards', JSON.stringify(this.rewards));
  }
  load() {
    const c = localStorage.getItem('compliments');
    if (c) this.compliments = JSON.parse(c).map(m => new Compliment(m.message, m.date, m.sender));
    const r = localStorage.getItem('rewards');
    if (r) this.rewards = JSON.parse(r);
  }
}

const exchange = new ComplimentExchange();

function renderSendSection() {
  const div = document.getElementById('send-section');
  div.innerHTML = `
    <h2>Send a Compliment</h2>
    <form id="send-form">
      <textarea id="compliment-message" rows="2" placeholder="Write something kind..." required></textarea>
      <button type="submit">Send</button>
    </form>
  `;
  document.getElementById('send-form').onsubmit = function(e) {
    e.preventDefault();
    const message = document.getElementById('compliment-message').value;
    exchange.sendCompliment(message);
    renderFeedSection();
    renderRewardSection();
    this.reset();
  };
}

function renderReceiveSection() {
  const div = document.getElementById('receive-section');
  const compliment = exchange.receiveCompliment();
  div.innerHTML = `<h2>Receive a Compliment</h2>${compliment ? `<div class="compliment-card">${compliment.message}<br><small>${compliment.sender}, ${new Date(compliment.date).toLocaleDateString()}</small></div>` : '<p>No compliments yet.</p>'}`;
}

function renderRewardSection() {
  const div = document.getElementById('reward-section');
  div.innerHTML = `<h2>Rewards</h2>${exchange.rewards.length ? exchange.rewards.map(r => `<span class="reward-badge">${r}</span>`).join('') : '<p>No rewards yet.</p>'}`;
}

function renderFeedSection() {
  const div = document.getElementById('feed-section');
  const feed = exchange.getFeed();
  div.innerHTML = feed.length ? feed.map(c => `<div class="compliment-card">${c.message}<br><small>${c.sender}, ${new Date(c.date).toLocaleDateString()}</small></div>`).join('') : '<p>No compliments yet.</p>';
}

renderSendSection();
renderReceiveSection();
renderRewardSection();
renderFeedSection();
