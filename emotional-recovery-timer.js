// emotional-recovery-timer.js

let recoveryEvents = JSON.parse(localStorage.getItem('emotionalRecoveryEvents')) || [];

function logEvent() {
    const description = document.getElementById('eventDescription').value.trim();
    const stressLevel = parseInt(document.getElementById('stressLevel').value);
    const startTime = new Date(document.getElementById('startTime').value);
    const recoveryTime = new Date(document.getElementById('recoveryTime').value);

    if (!description || isNaN(stressLevel) || stressLevel < 1 || stressLevel > 10 || isNaN(startTime.getTime()) || isNaN(recoveryTime.getTime())) {
        alert('Please fill in all fields with valid data.');
        return;
    }

    if (recoveryTime <= startTime) {
        alert('Recovery time must be after the event start time.');
        return;
    }

    const recoveryDuration = Math.round((recoveryTime - startTime) / (1000 * 60)); // minutes

    const event = {
        id: Date.now(),
        description,
        stressLevel,
        startTime: startTime.toISOString(),
        recoveryTime: recoveryTime.toISOString(),
        recoveryDuration
    };

    recoveryEvents.push(event);

    // Keep only last 50 events
    if (recoveryEvents.length > 50) {
        recoveryEvents = recoveryEvents.slice(-50);
    }

    localStorage.setItem('emotionalRecoveryEvents', JSON.stringify(recoveryEvents));

    // Clear form
    document.getElementById('eventDescription').value = '';
    document.getElementById('stressLevel').value = 5;
    document.getElementById('startTime').value = '';
    document.getElementById('recoveryTime').value = '';

    updateStats();
    updateChart();
    updateEventsList();
}

function updateStats() {
    if (recoveryEvents.length === 0) {
        document.getElementById('avgRecovery').textContent = '0 min';
        document.getElementById('fastestRecovery').textContent = '0 min';
        document.getElementById('totalEvents').textContent = '0';
        return;
    }

    const durations = recoveryEvents.map(e => e.recoveryDuration);
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const fastest = Math.min(...durations);

    document.getElementById('avgRecovery').textContent = `${avg} min`;
    document.getElementById('fastestRecovery').textContent = `${fastest} min`;
    document.getElementById('totalEvents').textContent = recoveryEvents.length;
}

function updateChart() {
    const ctx = document.getElementById('recoveryChart').getContext('2d');

    // Sort events by date
    const sortedEvents = recoveryEvents.slice().sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const labels = sortedEvents.map(e => new Date(e.startTime).toLocaleDateString());
    const data = sortedEvents.map(e => e.recoveryDuration);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Recovery Time (minutes)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Emotional Recovery Time Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Recovery Time (minutes)'
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

function updateEventsList() {
    const list = document.getElementById('eventsList');
    list.innerHTML = '';

    // Show last 10 events
    const recentEvents = recoveryEvents.slice(-10).reverse();

    recentEvents.forEach(event => {
        const item = document.createElement('div');
        item.className = 'event-item';

        const startDate = new Date(event.startTime).toLocaleString();
        const recoveryDate = new Date(event.recoveryTime).toLocaleString();

        item.innerHTML = `
            <h4>${event.description}</h4>
            <p><strong>Stress Level:</strong> ${event.stressLevel}/10</p>
            <p><strong>Event Time:</strong> ${startDate}</p>
            <p><strong>Recovery Time:</strong> ${recoveryDate}</p>
            <p class="recovery-time"><strong>Recovery Duration:</strong> ${event.recoveryDuration} minutes</p>
        `;

        list.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateEventsList();
});