// foot-arch-stability-tracker.js

let exerciseLogs = JSON.parse(localStorage.getItem('footArchExerciseLogs')) || [];

function logExercise() {
    const exerciseType = document.getElementById('exerciseType').value;
    const sets = parseInt(document.getElementById('sets').value);
    const reps = parseInt(document.getElementById('reps').value);
    const painBefore = parseInt(document.getElementById('painBefore').value);
    const painAfter = parseInt(document.getElementById('painAfter').value);
    const notes = document.getElementById('notes').value.trim();

    if (isNaN(sets) || isNaN(reps) || isNaN(painBefore) || isNaN(painAfter) ||
        sets < 1 || reps < 1 || painBefore < 1 || painBefore > 10 || painAfter < 1 || painAfter > 10) {
        alert('Please enter valid values for all fields.');
        return;
    }

    const painReduction = ((painBefore - painAfter) / painBefore) * 100;

    const logEntry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        exerciseType,
        sets,
        reps,
        painBefore,
        painAfter,
        painReduction: painReduction.toFixed(1),
        notes
    };

    exerciseLogs.push(logEntry);

    // Keep only last 50 entries
    if (exerciseLogs.length > 50) {
        exerciseLogs = exerciseLogs.slice(-50);
    }

    localStorage.setItem('footArchExerciseLogs', JSON.stringify(exerciseLogs));

    // Clear form
    document.getElementById('sets').value = 3;
    document.getElementById('reps').value = 10;
    document.getElementById('painBefore').value = 5;
    document.getElementById('painAfter').value = 3;
    document.getElementById('notes').value = '';

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (exerciseLogs.length === 0) {
        document.getElementById('avgPainReduction').textContent = '0%';
        document.getElementById('totalSessions').textContent = '0';
        document.getElementById('currentPain').textContent = 'N/A';
        return;
    }

    const reductions = exerciseLogs.map(log => parseFloat(log.painReduction));
    const avgReduction = reductions.reduce((a, b) => a + b, 0) / reductions.length;
    const latestPain = exerciseLogs[exerciseLogs.length - 1].painAfter;

    document.getElementById('avgPainReduction').textContent = `${avgReduction.toFixed(1)}%`;
    document.getElementById('totalSessions').textContent = exerciseLogs.length;
    document.getElementById('currentPain').textContent = latestPain;
}

function updateChart() {
    const ctx = document.getElementById('painChart').getContext('2d');

    // Sort logs by date
    const sortedLogs = exerciseLogs.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedLogs.map(log => log.date);
    const painBefore = sortedLogs.map(log => log.painBefore);
    const painAfter = sortedLogs.map(log => log.painAfter);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pain Before Exercise',
                data: painBefore,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                fill: false,
                tension: 0.4
            }, {
                label: 'Pain After Exercise',
                data: painAfter,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Pain Level Trends Before and After Exercises'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Pain Level (1-10)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function updateHistory() {
    const history = document.getElementById('exerciseHistory');
    history.innerHTML = '';

    // Show last 10 entries
    const recentLogs = exerciseLogs.slice(-10).reverse();

    recentLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'exercise-entry';

        const reductionClass = parseFloat(log.painReduction) > 0 ? 'pain-reduction' : 'pain-increase';
        const reductionText = parseFloat(log.painReduction) > 0 ? `-${log.painReduction}%` : `+${Math.abs(log.painReduction)}%`;

        item.innerHTML = `
            <h4>${log.date} - ${log.exerciseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
            <p><strong>Sets/Reps:</strong> ${log.sets} × ${log.reps}</p>
            <p><strong>Pain Before:</strong> ${log.painBefore}/10 | <strong>After:</strong> ${log.painAfter}/10</p>
            <p><strong>Pain Reduction:</strong> <span class="${reductionClass}">${reductionText}</span></p>
            ${log.notes ? `<p><strong>Notes:</strong> ${log.notes}</p>` : ''}
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateHistory();
});