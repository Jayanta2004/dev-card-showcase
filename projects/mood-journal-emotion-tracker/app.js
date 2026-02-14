// Mood Journal & Emotion Tracker
let moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');

// Sample data for demo
if (!localStorage.getItem('moodEntries')) {
  moodEntries = [
    { date: '2026-02-10', mood: 'Happy', emotion: 'Excited', activity: 'Morning run', notes: 'Felt energetic after exercise.' },
    { date: '2026-02-11', mood: 'Sad', emotion: 'Disappointed', activity: 'Missed meeting', notes: 'Forgot to attend, felt down.' },
    { date: '2026-02-12', mood: 'Calm', emotion: 'Content', activity: 'Reading', notes: 'Relaxed with a book.' }
  ];
  localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
}

function saveEntries() {
  localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
}

function renderLog() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Log Today's Mood</h2>
    <form id="mood-form">
      <label>Date
        <input type="date" id="mood-date" value="${new Date().toISOString().slice(0,10)}" required>
      </label>
      <label>Mood
        <select id="mood-select">
          <option>Happy</option>
          <option>Sad</option>
          <option>Calm</option>
          <option>Angry</option>
          <option>Stressed</option>
          <option>Excited</option>
          <option>Content</option>
        </select>
      </label>
      <label>Emotion
        <input type="text" id="emotion-input" placeholder="e.g. Joyful, Anxious" required>
      </label>
      <label>Activity
        <input type="text" id="activity-input" placeholder="e.g. Reading, Exercise">
      </label>
      <label>Notes
        <textarea id="notes-input" rows="2"></textarea>
      </label>
      <button class="action" type="submit">Add Entry</button>
    </form>
  `;
  document.getElementById('mood-form').onsubmit = function(e) {
    e.preventDefault();
    const date = document.getElementById('mood-date').value;
    const mood = document.getElementById('mood-select').value;
    const emotion = document.getElementById('emotion-input').value;
    const activity = document.getElementById('activity-input').value;
    const notes = document.getElementById('notes-input').value;
    moodEntries.push({ date, mood, emotion, activity, notes });
    saveEntries();
    renderHistory();
  };
}

function renderHistory() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Mood History</h2>
    <ul class="mood-list">
      ${moodEntries.length ? moodEntries.slice().reverse().map(entry => `
        <li>
          <span><strong>${entry.date}</strong> - ${entry.mood} (${entry.emotion})</span>
          <span>Activity: ${entry.activity || 'N/A'}</span>
          <span>Notes: ${entry.notes || 'N/A'}</span>
        </li>
      `).join('') : '<li>No entries yet.</li>'}
    </ul>
    <button class="action" onclick="renderLog()">Log New Mood</button>
  `;
}

function renderVisualize() {
  const main = document.getElementById('main-content');
  if (!moodEntries.length) {
    main.innerHTML = `<h2 class="section-title">Mood & Emotion Visualization</h2><p>No data to visualize yet.</p>`;
    return;
  }
  // Mood frequency
  const moodCounts = {};
  moodEntries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });
  // Emotion frequency
  const emotionCounts = {};
  moodEntries.forEach(entry => {
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
  });
  main.innerHTML = `
    <h2 class="section-title">Mood & Emotion Visualization</h2>
    <div class="card">
      <canvas id="moodChart"></canvas>
    </div>
    <div class="card">
      <canvas id="emotionChart"></canvas>
    </div>
  `;
  setTimeout(() => {
    drawMoodChart(moodCounts);
    drawEmotionChart(emotionCounts);
  }, 0);
}

function drawMoodChart(moodCounts) {
  const ctx = document.getElementById('moodChart').getContext('2d');
  if (window.moodChartInstance) window.moodChartInstance.destroy();
  window.moodChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(moodCounts),
      datasets: [{
        label: 'Mood Frequency',
        data: Object.values(moodCounts),
        backgroundColor: ['#ffb347', '#ffcc33', '#a3d8f4', '#f7b2ad', '#b2f7b2', '#f7f7b2', '#b2b2f7']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Mood Frequency' }
      }
    }
  });
}

function drawEmotionChart(emotionCounts) {
  const ctx = document.getElementById('emotionChart').getContext('2d');
  if (window.emotionChartInstance) window.emotionChartInstance.destroy();
  window.emotionChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(emotionCounts),
      datasets: [{
        label: 'Emotion Frequency',
        data: Object.values(emotionCounts),
        backgroundColor: '#ffb347'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Emotion Frequency' }
      }
    }
  });
}

document.getElementById('nav-log').onclick = renderLog;
document.getElementById('nav-history').onclick = renderHistory;
document.getElementById('nav-visualize').onclick = renderVisualize;

// Initial load
renderLog();
