// isometric-strength-tracker.js

let holdEntries = JSON.parse(localStorage.getItem('isometricStrengthEntries')) || [];

function logHold() {
    const exerciseType = document.getElementById('exerciseType').value;
    const date = document.getElementById('holdDate').value;
    const minutes = parseInt(document.getElementById('holdMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('holdSeconds').value) || 0;
    const notes = document.getElementById('holdNotes').value.trim();

    if (!date) {
        alert('Please select a date.');
        return;
    }

    if (minutes === 0 && seconds === 0) {
        alert('Please enter a hold duration.');
        return;
    }

    const totalSeconds = minutes * 60 + seconds;

    // Check if entry already exists for this exercise and date
    const existingEntry = holdEntries.find(entry =>
        entry.exerciseType === exerciseType && entry.date === date
    );

    if (existingEntry) {
        if (!confirm(`An entry already exists for ${exerciseType} on this date. Do you want to update it?`)) {
            return;
        }
        // Remove existing entry
        holdEntries = holdEntries.filter(entry =>
            !(entry.exerciseType === exerciseType && entry.date === date)
        );
    }

    const entry = {
        id: Date.now(),
        exerciseType,
        date,
        duration: totalSeconds,
        notes
    };

    holdEntries.push(entry);

    // Sort by date
    holdEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 200 entries
    if (holdEntries.length > 200) {
        holdEntries = holdEntries.slice(-200);
    }

    localStorage.setItem('isometricStrengthEntries', JSON.stringify(holdEntries));

    // Clear form
    document.getElementById('holdDate').value = '';
    document.getElementById('holdMinutes').value = '';
    document.getElementById('holdSeconds').value = '';
    document.getElementById('holdNotes').value = '';

    updateStats();
    updateChart();
    updateHoldsList();
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateStats() {
    // Best plank time
    const plankHolds = holdEntries.filter(entry => entry.exerciseType === 'plank');
    const bestPlank = plankHolds.length > 0 ? Math.max(...plankHolds.map(entry => entry.duration)) : 0;
    document.getElementById('bestPlank').textContent = formatDuration(bestPlank);

    // Weekly improvement (compare this week's average to last week's average for planks)
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

    const thisWeekPlanks = plankHolds.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= thisWeekStart;
    });

    const lastWeekPlanks = plankHolds.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= lastWeekStart && entryDate <= lastWeekEnd;
    });

    const thisWeekAvg = thisWeekPlanks.length > 0
        ? thisWeekPlanks.reduce((sum, entry) => sum + entry.duration, 0) / thisWeekPlanks.length
        : 0;

    const lastWeekAvg = lastWeekPlanks.length > 0
        ? lastWeekPlanks.reduce((sum, entry) => sum + entry.duration, 0) / lastWeekPlanks.length
        : 0;

    let improvement = 0;
    if (lastWeekAvg > 0) {
        improvement = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;
    }

    const improvementElement = document.getElementById('weeklyImprovement');
    improvementElement.textContent = `${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`;
    improvementElement.className = improvement >= 0 ? 'improvement-positive' : 'improvement-negative';

    // Total holds
    document.getElementById('totalHolds').textContent = holdEntries.length;
}

function updateChart() {
    const ctx = document.getElementById('strengthChart').getContext('2d');

    // Group by exercise type
    const exerciseData = {};
    holdEntries.forEach(entry => {
        if (!exerciseData[entry.exerciseType]) {
            exerciseData[entry.exerciseType] = [];
        }
        exerciseData[entry.exerciseType].push(entry);
    });

    const datasets = [];
    const colors = {
        plank: '#4fd1ff',
        'wall-sit': '#28a745',
        'dead-hang': '#ffc107',
        'l-sit': '#dc3545',
        'front-lever': '#6f42c1',
        'back-lever': '#e83e8c',
        'human-flag': '#fd7e14',
        other: '#6c757d'
    };

    Object.keys(exerciseData).forEach(exercise => {
        const data = exerciseData[exercise];
        const chartData = data.map(entry => ({
            x: new Date(entry.date),
            y: entry.duration / 60 // Convert to minutes for better scale
        }));

        datasets.push({
            label: exercise.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: chartData,
            borderColor: colors[exercise] || '#6c757d',
            backgroundColor: 'rgba(0,0,0,0)',
            tension: 0.4,
            pointRadius: 4
        });
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Hold Duration (minutes)'
                    },
                    min: 0
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatDuration(context.parsed.y * 60)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateHoldsList() {
    const holdsList = document.getElementById('holdsList');
    holdsList.innerHTML = '';

    // Show last 15 entries, sorted by date descending
    const recentEntries = holdEntries.slice(-15).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = `hold-entry exercise-${entry.exerciseType}`;

        entryDiv.innerHTML = `
            <div>
                <div class="exercise">${entry.exerciseType.replace('-', ' ')}</div>
                <div class="duration">${formatDuration(entry.duration)}</div>
                <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
                ${entry.notes ? `<div class="notes">${entry.notes}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        holdsList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this hold entry?')) {
        holdEntries = holdEntries.filter(entry => entry.id !== id);
        localStorage.setItem('isometricStrengthEntries', JSON.stringify(holdEntries));
        updateStats();
        updateChart();
        updateHoldsList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('holdDate').value = today;

    updateStats();
    updateChart();
    updateHoldsList();
});