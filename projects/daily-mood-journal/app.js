// Daily Mood Reflection Journal - app.js
// Core logic for mood entries, chart, and UI interactions

const addEntryBtn = document.getElementById('add-entry-btn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const entryForm = document.getElementById('entry-form');
const moodSelect = document.getElementById('mood-select');
const reflectionInput = document.getElementById('reflection');
const entriesList = document.getElementById('entries-list');
const moodChartCanvas = document.getElementById('mood-chart');

let entries = [];
let editingEntryIdx = null;
let moodChart = null;

function saveEntries() {
  localStorage.setItem('moodEntries', JSON.stringify(entries));
}

function loadEntries() {
  const data = localStorage.getItem('moodEntries');
  if (data) {
    entries = JSON.parse(data);
  } else {
    entries = [];
  }
}

function renderEntries() {
  entriesList.innerHTML = '';
  if (entries.length === 0) {
    entriesList.innerHTML = '<li>No entries yet. Add one!</li>';
    return;
  }
  entries.slice().reverse().forEach((entry, idx) => {
    const li = document.createElement('li');
    li.className = 'entry-item';
    li.innerHTML = `
      <div class="entry-header">
        <span class="entry-date">${formatDate(entry.date)}</span>
        <span class="entry-mood">${getMoodEmoji(entry.mood)} ${entry.mood}</span>
      </div>
      <div class="entry-reflection">${entry.reflection}</div>
      <div class="entry-actions">
        <button class="edit-btn" data-idx="${entries.length - 1 - idx}">Edit</button>
        <button class="delete-btn" data-idx="${entries.length - 1 - idx}">Delete</button>
      </div>
    `;
    entriesList.appendChild(li);
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      openEditEntry(idx);
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      deleteEntry(idx);
    });
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getMoodEmoji(mood) {
  switch (mood) {
    case 'Happy': return '😊';
    case 'Content': return '🙂';
    case 'Neutral': return '😐';
    case 'Sad': return '😢';
    case 'Angry': return '😠';
    case 'Anxious': return '😰';
    default: return '';
  }
}

function openAddEntry() {
  editingEntryIdx = null;
  entryForm.reset();
  moodSelect.value = '';
  modal.classList.remove('hidden');
}

function openEditEntry(idx) {
  editingEntryIdx = idx;
  const entry = entries[idx];
  moodSelect.value = entry.mood;
  reflectionInput.value = entry.reflection;
  modal.classList.remove('hidden');
}

function closeModalFunc() {
  modal.classList.add('hidden');
}

function deleteEntry(idx) {
  if (confirm('Delete this entry?')) {
    entries.splice(idx, 1);
    saveEntries();
    renderEntries();
    renderMoodChart();
  }
}

entryForm.addEventListener('submit', e => {
  e.preventDefault();
  const mood = moodSelect.value;
  const reflection = reflectionInput.value.trim();
  if (mood && reflection) {
    if (editingEntryIdx !== null) {
      // Edit
      entries[editingEntryIdx].mood = mood;
      entries[editingEntryIdx].reflection = reflection;
    } else {
      // Add
      entries.push({
        date: new Date().toISOString(),
        mood,
        reflection
      });
    }
    saveEntries();
    renderEntries();
    renderMoodChart();
    closeModalFunc();
  }
});

addEntryBtn.addEventListener('click', openAddEntry);
closeModal.addEventListener('click', closeModalFunc);
window.addEventListener('click', e => {
  if (e.target === modal) closeModalFunc();
});

function renderMoodChart() {
  if (!moodChartCanvas) return;
  const moodMap = { 'Happy': 5, 'Content': 4, 'Neutral': 3, 'Sad': 2, 'Angry': 1, 'Anxious': 1 };
  const labels = entries.map(e => formatDate(e.date));
  const data = entries.map(e => moodMap[e.mood] || 3);
  if (moodChart) moodChart.destroy();
  moodChart = new Chart(moodChartCanvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Mood Level',
        data,
        fill: false,
        borderColor: '#4caf50',
        backgroundColor: '#4caf50',
        tension: 0.2,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4caf50',
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              switch (value) {
                case 5: return '😊';
                case 4: return '🙂';
                case 3: return '😐';
                case 2: return '😢';
                case 1: return '😠/😰';
                default: return value;
              }
            }
          }
        }
      }
    }
  });
}

// Initial load
loadEntries();
renderEntries();
renderMoodChart();
