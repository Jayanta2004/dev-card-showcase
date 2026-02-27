// Gratitude Reflection Journal App
// Modular, well-commented code. Main SPA logic here.

const app = document.getElementById('app');

let entries = [];

function render() {
  app.innerHTML = '';
  renderHeader();
  renderEntryForm();
  renderFeedback();
  renderEntries();
  renderVisualization();
}

function renderHeader() {
  const h = document.createElement('h1');
  h.textContent = 'Gratitude Reflection Journal';
  app.appendChild(h);
}

function renderEntryForm() {
  const div = document.createElement('div');
  div.innerHTML = `
    <textarea id="entry-input" rows="3" placeholder="What are you grateful for today?"></textarea>
    <button id="add-entry-btn">Add Entry</button>
  `;
  app.appendChild(div);
  document.getElementById('add-entry-btn').onclick = addEntry;
}

function addEntry() {
  const input = document.getElementById('entry-input');
  const text = input.value.trim();
  if (!text) return;
  const sentiment = analyzeSentiment(text);
  entries.push({ text, date: new Date().toLocaleDateString(), sentiment });
  input.value = '';
  render();
}

function analyzeSentiment(text) {
  // Simple sentiment analysis (mock/demo)
  const positiveWords = ['happy', 'grateful', 'thankful', 'joy', 'love', 'excited', 'peace', 'good', 'great', 'wonderful'];
  const negativeWords = ['sad', 'angry', 'upset', 'bad', 'stress', 'tired', 'worried', 'anxious'];
  let score = 0;
  positiveWords.forEach(w => { if (text.toLowerCase().includes(w)) score++; });
  negativeWords.forEach(w => { if (text.toLowerCase().includes(w)) score--; });
  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
}

function renderFeedback() {
  const div = document.createElement('div');
  div.id = 'feedback';
  if (entries.length === 0) {
    div.textContent = 'Start your gratitude journey!';
  } else {
    const last = entries[entries.length - 1];
    if (last.sentiment === 'positive') div.textContent = 'Uplifting entry! Keep it up!';
    else if (last.sentiment === 'neutral') div.textContent = 'Reflecting is powerful. Try to focus on the good.';
    else div.textContent = 'It’s okay to have tough days. Gratitude helps!';
  }
  app.appendChild(div);
}

function renderEntries() {
  entries.slice().reverse().forEach(e => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `<b>${e.date}</b><br>${e.text}<br><i>Sentiment: ${e.sentiment}</i>`;
    app.appendChild(div);
  });
}

function renderVisualization() {
  const div = document.createElement('div');
  div.id = 'visualization';
  div.innerHTML = '<h3>Gratitude Trend</h3>' + renderTrendChart();
  app.appendChild(div);
}

function renderTrendChart() {
  // Simple visualization: count of positive/neutral/negative
  const counts = { positive: 0, neutral: 0, negative: 0 };
  entries.forEach(e => counts[e.sentiment]++);
  return `<div>😊 Positive: ${counts.positive} | 😐 Neutral: ${counts.neutral} | 😢 Negative: ${counts.negative}</div>`;
}

render();
