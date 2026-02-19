// emotional-volatility-index.js

let moodEntries = JSON.parse(localStorage.getItem('emotionalVolatilityEntries')) || [];

function updateMoodValue() {
    const value = document.getElementById('moodLevel').value;
    document.getElementById('currentMoodValue').textContent = value;
}

function logMood() {
    const date = document.getElementById('moodDate').value;
    const moodLevel = parseInt(document.getElementById('moodLevel').value);
    const notes = document.getElementById('moodNotes').value.trim();

    if (!date) {
        alert('Please select a date.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = moodEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        moodEntries = moodEntries.filter(entry => entry.date !== date);
    }

    const entry = {
        id: Date.now(),
        date,
        moodLevel,
        notes
    };

    moodEntries.push(entry);

    // Sort by date
    moodEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 100 entries
    if (moodEntries.length > 100) {
        moodEntries = moodEntries.slice(-100);
    }

    localStorage.setItem('emotionalVolatilityEntries', JSON.stringify(moodEntries));

    // Clear form
    document.getElementById('moodDate').value = '';
    document.getElementById('moodLevel').value = 5;
    document.getElementById('moodNotes').value = '';
    updateMoodValue();

    updateStats();
    updateChart();
    updateMoodList();
}

function calculateVolatility(moods) {
    if (moods.length < 2) return 0;

    const mean = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    const squaredDiffs = moods.map(mood => Math.pow(mood - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / moods.length;
    return Math.sqrt(variance).toFixed(2);
}

function updateStats() {
    const totalDays = moodEntries.length;

    // Calculate average mood for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEntries = moodEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
    const avgMood = recentEntries.length > 0
        ? (recentEntries.reduce((sum, entry) => sum + entry.moodLevel, 0) / recentEntries.length).toFixed(1)
        : '0.0';

    // Calculate volatility for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekEntries = moodEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
    const currentVolatility = calculateVolatility(weekEntries.map(entry => entry.moodLevel));

    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('avgMood').textContent = avgMood;
    document.getElementById('currentVolatility').textContent = currentVolatility;
}

function updateChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');

    // Prepare data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const chartEntries = moodEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });
    const moodData = chartEntries.map(entry => entry.moodLevel);

    // Calculate rolling volatility (7-day windows)
    const volatilityData = [];
    for (let i = 0; i < moodData.length; i++) {
        const start = Math.max(0, i - 6);
        const window = moodData.slice(start, i + 1);
        volatilityData.push(parseFloat(calculateVolatility(window)));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Level',
                data: moodData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Volatility (7-day)',
                data: volatilityData,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Mood Level (1-10)'
                    },
                    min: 1,
                    max: 10
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Volatility'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function updateMoodList() {
    const moodList = document.getElementById('moodList');
    moodList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = moodEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'mood-entry';

        const moodClass = entry.moodLevel >= 7 ? 'mood-high' :
                         entry.moodLevel >= 4 ? 'mood-medium' : 'mood-low';

        entryDiv.innerHTML = `
            <div>
                <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="mood ${moodClass}">Mood: ${entry.moodLevel}/10</div>
                ${entry.notes ? `<div class="notes">${entry.notes}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        moodList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this mood entry?')) {
        moodEntries = moodEntries.filter(entry => entry.id !== id);
        localStorage.setItem('emotionalVolatilityEntries', JSON.stringify(moodEntries));
        updateStats();
        updateChart();
        updateMoodList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('moodDate').value = today;

    updateMoodValue();
    updateStats();
    updateChart();
    updateMoodList();
});