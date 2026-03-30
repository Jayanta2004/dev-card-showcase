// chronotype-identifier.js

let sleepData = JSON.parse(localStorage.getItem('chronotypeSleepData')) || [];

function logSleepData() {
    const bedtime = document.getElementById('bedtime').value;
    const waketime = document.getElementById('waketime').value;

    if (!bedtime || !waketime) {
        alert('Please enter both bedtime and wake time.');
        return;
    }

    const bedtimeDate = new Date(`2000-01-01T${bedtime}`);
    const waketimeDate = new Date(`2000-01-01T${waketime}`);

    // Handle next day wake up
    if (waketimeDate < bedtimeDate) {
        waketimeDate.setDate(waketimeDate.getDate() + 1);
    }

    const sleepDuration = (waketimeDate - bedtimeDate) / (1000 * 60 * 60); // hours
    const midSleep = new Date(bedtimeDate.getTime() + (waketimeDate - bedtimeDate) / 2);

    const entry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        bedtime,
        waketime,
        sleepDuration: sleepDuration.toFixed(1),
        midSleep: midSleep.toTimeString().slice(0, 5)
    };

    sleepData.push(entry);

    // Keep only last 30 entries
    if (sleepData.length > 30) {
        sleepData = sleepData.slice(-30);
    }

    localStorage.setItem('chronotypeSleepData', JSON.stringify(sleepData));

    // Clear form
    document.getElementById('bedtime').value = '';
    document.getElementById('waketime').value = '';

    updateChronotype();
    updateChart();
    updateHistory();
}

function updateChronotype() {
    if (sleepData.length < 3) {
        document.getElementById('resultsSection').style.display = 'none';
        return;
    }

    // Calculate average mid-sleep time
    const midSleepTimes = sleepData.map(entry => {
        const [hours, minutes] = entry.midSleep.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
    });

    const avgMidSleep = midSleepTimes.reduce((a, b) => a + b, 0) / midSleepTimes.length;
    const avgHours = Math.floor(avgMidSleep / 60);
    const avgMinutes = Math.round(avgMidSleep % 60);
    const avgMidSleepTime = `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}`;

    // Determine chronotype
    let chronotype, description, icon, score;
    if (avgMidSleep < 120) { // Before 2:00 AM
        chronotype = 'Morning Lark';
        description = 'You are a morning person who naturally wakes up early and is most productive in the morning hours.';
        icon = '🌅';
        score = 'Early Bird';
    } else if (avgMidSleep < 180) { // 2:00-3:00 AM
        chronotype = 'Intermediate';
        description = 'You have a balanced sleep schedule and can adapt to different schedules fairly well.';
        icon = '🕐';
        score = 'Balanced';
    } else { // After 3:00 AM
        chronotype = 'Evening Owl';
        description = 'You are a night person who stays up late and is most productive in the evening hours.';
        icon = '🦉';
        score = 'Night Owl';
    }

    // Update display
    document.getElementById('chronotypeIcon').textContent = icon;
    document.getElementById('chronotypeTitle').textContent = chronotype;
    document.getElementById('chronotypeDescription').textContent = description;
    document.getElementById('midSleepTime').textContent = avgMidSleepTime;
    document.getElementById('chronotypeScore').textContent = score;
    document.getElementById('resultsSection').style.display = 'block';
}

function updateChart() {
    const ctx = document.getElementById('sleepChart').getContext('2d');

    const labels = sleepData.map(entry => entry.date);
    const midSleepMinutes = sleepData.map(entry => {
        const [hours, minutes] = entry.midSleep.split(':');
        return parseInt(hours) * 60 + parseInt(minutes);
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mid-Sleep Time (minutes past midnight)',
                data: midSleepMinutes,
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
                    text: 'Sleep Midpoint Trends'
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 24 * 60,
                    ticks: {
                        callback: function(value) {
                            const hours = Math.floor(value / 60);
                            const minutes = value % 60;
                            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
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
    const history = document.getElementById('sleepHistory');
    history.innerHTML = '';

    // Show last 10 entries
    const recentEntries = sleepData.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'sleep-entry';

        item.innerHTML = `
            <h4>${entry.date}</h4>
            <p><strong>Bedtime:</strong> ${entry.bedtime}</p>
            <p><strong>Wake Time:</strong> ${entry.waketime}</p>
            <p><strong>Sleep Duration:</strong> ${entry.sleepDuration} hours</p>
            <p class="mid-sleep"><strong>Mid-Sleep:</strong> ${entry.midSleep}</p>
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateChronotype();
    updateChart();
    updateHistory();
});