// Daily Mood Tracker & Visualizer
// Uses Chart.js for visualization

const form = document.getElementById('mood-form');
const dateInput = document.getElementById('date');
const moodInput = document.getElementById('mood');
const notesInput = document.getElementById('notes');
const entriesDiv = document.getElementById('entries');
const chartCanvas = document.getElementById('mood-chart');

let moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');

const moodColors = {
    happy: '#ffe066',
    sad: '#74b9ff',
    angry: '#ff7675',
    anxious: '#fdcb6e',
    excited: '#55efc4',
    neutral: '#b2bec3'
};

function saveEntries() {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
}

function renderEntries() {
    entriesDiv.innerHTML = '';
    moodEntries.slice().reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
            <span class="entry-date">${entry.date}</span>
            <span class="entry-mood">${getMoodEmoji(entry.mood)} ${capitalize(entry.mood)}</span>
            ${entry.notes ? `<span class="entry-notes">${entry.notes}</span>` : ''}
        `;
        entriesDiv.appendChild(div);
    });
}

function getMoodEmoji(mood) {
    switch(mood) {
        case 'happy': return '😊';
        case 'sad': return '😢';
        case 'angry': return '😠';
        case 'anxious': return '😰';
        case 'excited': return '🤩';
        case 'neutral': return '😐';
        default: return '';
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderChart() {
    if (window.moodChart) window.moodChart.destroy();
    const labels = moodEntries.map(e => e.date);
    const data = moodEntries.map(e => e.mood);
    const bgColors = moodEntries.map(e => moodColors[e.mood] || '#b2bec3');
    window.moodChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Mood',
                data: data.map(mood => 1),
                backgroundColor: bgColors,
                borderRadius: 8,
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const idx = context.dataIndex;
                            return getMoodEmoji(moodEntries[idx].mood) + ' ' + capitalize(moodEntries[idx].mood);
                        }
                    }
                }
            },
            scales: {
                y: { display: false },
                x: { ticks: { color: '#3a7bd5' } }
            }
        }
    });
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const entry = {
        date: dateInput.value,
        mood: moodInput.value,
        notes: notesInput.value.trim()
    };
    moodEntries.push(entry);
    saveEntries();
    renderEntries();
    renderChart();
    form.reset();
});

// Initialize
renderEntries();
renderChart();
