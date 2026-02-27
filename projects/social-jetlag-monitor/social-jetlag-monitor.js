// social-jetlag-monitor.js

let scheduleEntries = JSON.parse(localStorage.getItem('socialJetlagEntries')) || [];

function logSchedule() {
    const date = document.getElementById('logDate').value;
    const weekdayBedtime = document.getElementById('weekdayBedtime').value;
    const weekdayWakeTime = document.getElementById('weekdayWakeTime').value;
    const weekendBedtime = document.getElementById('weekendBedtime').value;
    const weekendWakeTime = document.getElementById('weekendWakeTime').value;
    const notes = document.getElementById('sleepNotes').value.trim();

    if (!date || !weekdayBedtime || !weekdayWakeTime || !weekendBedtime || !weekendWakeTime) {
        alert('Please fill in all time fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = scheduleEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        scheduleEntries = scheduleEntries.filter(entry => entry.date !== date);
    }

    // Calculate sleep durations and mid-sleep times
    const weekdaySleepDuration = calculateSleepDuration(weekdayBedtime, weekdayWakeTime);
    const weekendSleepDuration = calculateSleepDuration(weekendBedtime, weekendWakeTime);

    const weekdayMidSleep = calculateMidSleep(weekdayBedtime, weekdaySleepDuration);
    const weekendMidSleep = calculateMidSleep(weekendBedtime, weekendSleepDuration);

    // Calculate social jetlag (difference in hours)
    const socialJetlag = Math.abs(weekdayMidSleep - weekendMidSleep);

    const entry = {
        id: Date.now(),
        date,
        weekdayBedtime,
        weekdayWakeTime,
        weekdaySleepDuration,
        weekdayMidSleep,
        weekendBedtime,
        weekendWakeTime,
        weekendSleepDuration,
        weekendMidSleep,
        socialJetlag: parseFloat(socialJetlag.toFixed(2)),
        notes
    };

    scheduleEntries.push(entry);

    // Sort by date
    scheduleEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (scheduleEntries.length > 50) {
        scheduleEntries = scheduleEntries.slice(-50);
    }

    localStorage.setItem('socialJetlagEntries', JSON.stringify(scheduleEntries));

    // Clear form
    document.getElementById('logDate').value = '';
    document.getElementById('weekdayBedtime').value = '';
    document.getElementById('weekdayWakeTime').value = '';
    document.getElementById('weekendBedtime').value = '';
    document.getElementById('weekendWakeTime').value = '';
    document.getElementById('sleepNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateScheduleList();
}

function calculateSleepDuration(bedtime, wakeTime) {
    const bed = new Date(`2000-01-01T${bedtime}:00`);
    const wake = new Date(`2000-01-01T${wakeTime}:00`);

    // Handle next-day wake time
    if (wake <= bed) {
        wake.setDate(wake.getDate() + 1);
    }

    return (wake - bed) / (1000 * 60 * 60); // hours
}

function calculateMidSleep(bedtime, sleepDuration) {
    const bed = new Date(`2000-01-01T${bedtime}:00`);
    const midSleep = new Date(bed.getTime() + (sleepDuration * 60 * 60 * 1000) / 2);

    // Convert to decimal hours (0-24)
    return midSleep.getHours() + midSleep.getMinutes() / 60;
}

function getJetlagSeverity(jetlag) {
    if (jetlag < 1) return { severity: 'Minimal', class: 'jetlag-minimal' };
    if (jetlag < 2) return { severity: 'Moderate', class: 'jetlag-moderate' };
    return { severity: 'Severe', class: 'jetlag-severe' };
}

function updateStats() {
    const totalEntries = scheduleEntries.length;

    if (totalEntries === 0) {
        document.getElementById('currentJetlag').textContent = '0.0h';
        document.getElementById('jetlagSeverity').textContent = 'None';
        document.getElementById('jetlagSeverity').className = 'stat-value';
        document.getElementById('avgSleepDuration').textContent = '0.0h';
        return;
    }

    // Current jetlag (latest entry)
    const latestEntry = scheduleEntries[scheduleEntries.length - 1];
    const currentJetlag = latestEntry.socialJetlag;

    // Jetlag severity
    const severity = getJetlagSeverity(currentJetlag);
    const severityElement = document.getElementById('jetlagSeverity');
    severityElement.textContent = severity.severity;
    severityElement.className = `stat-value ${severity.class}`;

    // Average sleep duration
    const allSleepDurations = scheduleEntries.flatMap(entry => [
        entry.weekdaySleepDuration,
        entry.weekendSleepDuration
    ]);
    const avgSleepDuration = allSleepDurations.reduce((sum, duration) => sum + duration, 0) / allSleepDurations.length;

    document.getElementById('currentJetlag').textContent = `${currentJetlag}h`;
    document.getElementById('avgSleepDuration').textContent = `${avgSleepDuration.toFixed(1)}h`;
}

function updateChart() {
    const ctx = document.getElementById('jetlagChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = scheduleEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const jetlags = chartEntries.map(entry => entry.socialJetlag);
    const weekdaySleep = chartEntries.map(entry => entry.weekdaySleepDuration);
    const weekendSleep = chartEntries.map(entry => entry.weekendSleepDuration);

    // Severity threshold lines
    const minimalLine = new Array(jetlags.length).fill(1); // 1 hour
    const moderateLine = new Array(jetlags.length).fill(2); // 2 hours

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Social Jetlag (hours)',
                data: jetlags,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Weekday Sleep (hours)',
                data: weekdaySleep,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Weekend Sleep (hours)',
                data: weekendSleep,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Minimal Impact (<1h)',
                data: minimalLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Moderate Impact (<2h)',
                data: moderateLine,
                borderColor: '#ffc107',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
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
                        text: 'Social Jetlag (hours)'
                    },
                    min: 0,
                    max: 4
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Sleep Duration (hours)'
                    },
                    min: 0,
                    max: 12,
                    grid: {
                        drawOnChartArea: false,
                    }
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

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (scheduleEntries.length < 3) {
        insightsDiv.innerHTML = '<p>Log at least 3 sleep schedules to receive personalized insights about your social jetlag patterns and health impacts.</p>';
        return;
    }

    // Analyze patterns
    const avgJetlag = scheduleEntries.reduce((sum, entry) => sum + entry.socialJetlag, 0) / scheduleEntries.length;
    const maxJetlag = Math.max(...scheduleEntries.map(entry => entry.socialJetlag));
    const avgWeekdaySleep = scheduleEntries.reduce((sum, entry) => sum + entry.weekdaySleepDuration, 0) / scheduleEntries.length;
    const avgWeekendSleep = scheduleEntries.reduce((sum, entry) => sum + entry.weekendSleepDuration, 0) / scheduleEntries.length;

    let insights = '<p>Based on your sleep patterns:</p><ul>';

    if (avgJetlag > 2) {
        insights += '<li><strong>High social jetlag detected.</strong> This severe mismatch may significantly impact your health, increasing risks for metabolic disorders, cardiovascular disease, and impaired cognitive function.</li>';
    } else if (avgJetlag > 1) {
        insights += '<li><strong>Moderate social jetlag present.</strong> Consider gradually aligning your weekend schedule closer to weekdays to reduce health risks and improve sleep quality.</li>';
    } else {
        insights += '<li><strong>Minimal social jetlag.</strong> Your sleep schedule consistency is good for overall health. Continue maintaining regular sleep patterns.</li>';
    }

    if (avgWeekendSleep - avgWeekdaySleep > 2) {
        insights += '<li><strong>Weekend sleep extension.</strong> You\'re getting significantly more sleep on weekends. This "recovery sleep" suggests chronic weekday sleep deprivation.</li>';
    }

    if (avgWeekdaySleep < 7) {
        insights += '<li><strong>Weekday sleep deficit.</strong> Your weekday sleep duration is below the recommended 7-9 hours. Consider earlier bedtimes or wake-up times.</li>';
    }

    insights += '<li><strong>Health optimization tips:</strong> Maintain consistent sleep schedules, avoid caffeine/alcohol close to bedtime, and consider light exposure therapy to regulate your circadian rhythm.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateScheduleList() {
    const scheduleList = document.getElementById('scheduleList');
    scheduleList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = scheduleEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'schedule-entry';

        const severity = getJetlagSeverity(entry.socialJetlag);

        entryDiv.innerHTML = `
            <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="schedules">
                <div class="schedule">
                    <div class="label">Weekday</div>
                    <div class="times">${entry.weekdayBedtime} - ${entry.weekdayWakeTime}<br>(${entry.weekdaySleepDuration.toFixed(1)}h)</div>
                </div>
                <div class="schedule">
                    <div class="label">Weekend</div>
                    <div class="times">${entry.weekendBedtime} - ${entry.weekendWakeTime}<br>(${entry.weekendSleepDuration.toFixed(1)}h)</div>
                </div>
            </div>
            <div class="jetlag ${severity.class}">${entry.socialJetlag}h<br><small>jetlag</small></div>
            ${entry.notes ? `<div class="notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        scheduleList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this schedule entry?')) {
        scheduleEntries = scheduleEntries.filter(entry => entry.id !== id);
        localStorage.setItem('socialJetlagEntries', JSON.stringify(scheduleEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateScheduleList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    updateStats();
    updateChart();
    updateInsights();
    updateScheduleList();
});