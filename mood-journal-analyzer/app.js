// Mood Journal Analyzer
const moodForm = document.getElementById('mood-form');
const moodDate = document.getElementById('mood-date');
const moodSelect = document.getElementById('mood-select');
const moodNote = document.getElementById('mood-note');
const moodList = document.getElementById('mood-list');
const moodChartCanvas = document.getElementById('mood-chart');

let moods = JSON.parse(localStorage.getItem('moodJournal') || '[]');

function renderMoodList() {
    moodList.innerHTML = '';
    moods.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="date">${entry.date}</span> <span>${entry.emoji} ${entry.mood}</span>`;
        if (entry.note) {
            const note = document.createElement('span');
            note.className = 'note';
            note.textContent = entry.note;
            li.appendChild(note);
        }
        moodList.appendChild(li);
    });
}

function getMoodEmoji(mood) {
    switch(mood) {
        case 'Happy': return '😊';
        case 'Sad': return '😢';
        case 'Angry': return '😠';
        case 'Calm': return '😌';
        case 'Anxious': return '😰';
        case 'Excited': return '🤩';
        case 'Tired': return '😴';
        default: return '';
    }
}

function renderMoodChart() {
    const moodCounts = {};
    moods.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    const labels = Object.keys(moodCounts);
    const data = Object.values(moodCounts);
    if (window.moodChart) window.moodChart.destroy();
    window.moodChart = new Chart(moodChartCanvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Mood Frequency',
                data,
                backgroundColor: [
                    '#81c784', '#64b5f6', '#e57373', '#ffd54f', '#ba68c8', '#4dd0e1', '#ffb74d'
                ],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, precision: 0 }
            }
        }
    });
}

moodForm.addEventListener('submit', e => {
    e.preventDefault();
    const date = moodDate.value;
    const mood = moodSelect.value;
    const note = moodNote.value.trim();
    if (date && mood) {
        const emoji = getMoodEmoji(mood);
        moods.push({ date, mood, emoji, note });
        localStorage.setItem('moodJournal', JSON.stringify(moods));
        renderMoodList();
        renderMoodChart();
        moodNote.value = '';
    }
});

renderMoodList();
renderMoodChart();
