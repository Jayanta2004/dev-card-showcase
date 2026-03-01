// AI-Powered Micro-Journaling Popup Script
// ...existing code...
class JournalEntry {
  constructor(text, emotion, date) {
    this.text = text;
    this.emotion = emotion;
    this.date = date || new Date();
  }
}

class MicroJournal {
  constructor() {
    this.entries = [];
    this.load();
  }
  addEntry(entry) {
    this.entries.push(entry);
    this.save();
  }
  getEntries() {
    return this.entries.slice().reverse();
  }
  getTrend() {
    // ...existing code...
    const trend = {};
    for (let e of this.entries) {
      const d = new Date(e.date).toLocaleDateString();
      if (!trend[d]) trend[d] = [];
      trend[d].push(e.emotion);
    }
    // Aggregate emotions per day
    const result = [];
    for (let d in trend) {
      const emotions = trend[d];
      const counts = {};
      emotions.forEach(em => { counts[em] = (counts[em] || 0) + 1; });
      const mainEmotion = Object.keys(counts).reduce((a,b) => counts[a] > counts[b] ? a : b);
      result.push({ date: d, emotion: mainEmotion, count: counts[mainEmotion] });
    }
    return result;
  }
  save() {
    localStorage.setItem('journalEntries', JSON.stringify(this.entries));
  }
  load() {
    const data = localStorage.getItem('journalEntries');
    if (data) this.entries = JSON.parse(data).map(e => new JournalEntry(e.text, e.emotion, e.date));
  }
}

const journal = new MicroJournal();

function renderPromptSection() {
  const div = document.getElementById('prompt-section');
  div.innerHTML = `
    <h2>Daily Reflection</h2>
    <form id="entry-form">
      <textarea id="entry-text" rows="2" placeholder="How are you feeling today?" required></textarea>
      <label>Emotion:</label>
      <select id="entry-emotion">
        <option value="happy">Happy</option>
        <option value="calm">Calm</option>
        <option value="nostalgic">Nostalgic</option>
        <option value="energized">Energized</option>
        <option value="relaxed">Relaxed</option>
        <option value="sad">Sad</option>
        <option value="excited">Excited</option>
      </select>
      <button type="submit">Add Entry</button>
    </form>
  `;
  document.getElementById('entry-form').onsubmit = function(e) {
    e.preventDefault();
    const text = document.getElementById('entry-text').value;
    const emotion = document.getElementById('entry-emotion').value;
    journal.addEntry(new JournalEntry(text, emotion));
    renderEntrySection();
    renderTrendSection();
    renderFeedSection();
    this.reset();
  };
}

function renderEntrySection() {
  const div = document.getElementById('entry-section');
  const entries = journal.getEntries();
  div.innerHTML = entries.length ? `<div class="journal-card">${entries[0].text}<br><small>${entries[0].emotion}, ${new Date(entries[0].date).toLocaleDateString()}</small></div>` : '<p>No entries yet.</p>';
}

function renderTrendSection() {
  const div = document.getElementById('trend-section');
  const trend = journal.getTrend();
  if (trend.length === 0) {
    div.innerHTML = '<p>No trend data yet.</p>';
    return;
  }
  div.innerHTML = `<h2>Emotional Trend</h2>` + trend.map(t => `<div class="trend-bar" style="background:${getEmotionColor(t.emotion)};width:${t.count*30}px">${t.date}: ${t.emotion}</div>`).join('');
}

function getEmotionColor(emotion) {
  switch(emotion) {
    case 'happy': return '#ffd600';
    case 'calm': return '#80cbc4';
    case 'nostalgic': return '#b39ddb';
    case 'energized': return '#ff8a65';
    case 'relaxed': return '#aed581';
    case 'sad': return '#90caf9';
    case 'excited': return '#f06292';
    default: return '#e0e0e0';
  }
}

function renderFeedSection() {
  const div = document.getElementById('feed-section');
  const entries = journal.getEntries();
  div.innerHTML = entries.length ? entries.map(e => `<div class="journal-card">${e.text}<br><small>${e.emotion}, ${new Date(e.date).toLocaleDateString()}</small></div>`).join('') : '<p>No entries yet.</p>';
}

renderPromptSection();
renderEntrySection();
renderTrendSection();
renderFeedSection();
