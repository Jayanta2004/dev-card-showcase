// Anonymous Advice Exchange App
// ...existing code...
class Advice {
  constructor(question, response, date, upvotes) {
    this.question = question;
    this.response = response;
    this.date = date || new Date();
    this.upvotes = upvotes || 0;
  }
}
class AdviceExchange {
  constructor() {
    this.advices = [];
    this.load();
  }
  askAdvice(question, response) {
    this.advices.push(new Advice(question, response));
    this.save();
  }
  upvoteAdvice(index) {
    if (this.advices[index]) {
      this.advices[index].upvotes++;
      this.save();
    }
  }
  getAdvices() {
    return this.advices.slice().sort((a,b) => b.upvotes - a.upvotes);
  }
  save() {
    localStorage.setItem('advices', JSON.stringify(this.advices));
  }
  load() {
    const data = localStorage.getItem('advices');
    if (data) this.advices = JSON.parse(data).map(m => new Advice(m.question, m.response, m.date, m.upvotes));
  }
}
const exchange = new AdviceExchange();
function renderAskSection() {
  const div = document.getElementById('ask-section');
  div.innerHTML = `
    <h2>Ask for Advice</h2>
    <form id="ask-form">
      <textarea id="advice-question" rows="2" placeholder="Describe your challenge..." required></textarea>
      <textarea id="advice-response" rows="2" placeholder="Share your advice..." required></textarea>
      <button type="submit">Submit Advice</button>
    </form>
  `;
  document.getElementById('ask-form').onsubmit = function(e) {
    e.preventDefault();
    const question = document.getElementById('advice-question').value;
    const response = document.getElementById('advice-response').value;
    exchange.askAdvice(question, response);
    renderAdviceSection();
    renderFeedSection();
    this.reset();
  };
}
function renderAdviceSection() {
  const div = document.getElementById('advice-section');
  const advices = exchange.getAdvices();
  div.innerHTML = `<h2>Top Advice</h2>` + (advices.length ? `<div class="advice-card">${advices[0].question}<br><strong>${advices[0].response}</strong><br><button class="upvote-btn" onclick="upvoteAdvice(0)">Upvote (${advices[0].upvotes})</button><br><small>${new Date(advices[0].date).toLocaleDateString()}</small></div>` : '<p>No advice yet.</p>');
}
function upvoteAdvice(index) {
  exchange.upvoteAdvice(index);
  renderAdviceSection();
  renderFeedSection();
}
function renderFeedSection() {
  const div = document.getElementById('feed-section');
  const advices = exchange.getAdvices();
  div.innerHTML = advices.length ? advices.map((a,i) => `<div class="advice-card">${a.question}<br><strong>${a.response}</strong><br><button class="upvote-btn" onclick="upvoteAdvice(${i})">Upvote (${a.upvotes})</button><br><small>${new Date(a.date).toLocaleDateString()}</small></div>`).join('') : '<p>No advice yet.</p>';
}
renderAskSection();
renderAdviceSection();
renderFeedSection();
window.upvoteAdvice = upvoteAdvice;
