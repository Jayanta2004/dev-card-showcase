// stress-trigger-frequency-map.js

let stressEvents = JSON.parse(localStorage.getItem('stressTriggerEvents')) || [];

// Initialize stress level slider display
document.getElementById('stressLevel').addEventListener('input', function() {
    document.getElementById('stressValue').textContent = this.value;
});

function logStressEvent() {
    const stressLevel = parseInt(document.getElementById('stressLevel').value);
    const triggerTagsInput = document.getElementById('triggerTags').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const copingStrategy = document.getElementById('copingStrategy').value.trim();

    if (!triggerTagsInput || !description) {
        alert('Please fill in at least the trigger tags and event description.');
        return;
    }

    // Parse tags
    const tags = triggerTagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);

    const event = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        stressLevel: stressLevel,
        tags: tags,
        description: description,
        copingStrategy: copingStrategy || 'None specified'
    };

    stressEvents.push(event);
    saveEvents();

    // Clear form
    document.getElementById('stressLevel').value = 5;
    document.getElementById('stressValue').textContent = '5';
    document.getElementById('triggerTags').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('copingStrategy').value = '';

    updateStats();
    updateHeatmap();
    updateTrendsChart();
    updateInsights();
    displayHistory();
}

function saveEvents() {
    localStorage.setItem('stressTriggerEvents', JSON.stringify(stressEvents));
}

function updateStats() {
    if (stressEvents.length === 0) {
        document.getElementById('totalEvents').textContent = '0';
        document.getElementById('avgStressLevel').textContent = '0';
        document.getElementById('topTrigger').textContent = 'None';
        document.getElementById('todayEvents').textContent = '0';
        return;
    }

    // Total events
    document.getElementById('totalEvents').textContent = stressEvents.length;

    // Average stress level
    const avgStress = stressEvents.reduce((sum, event) => sum + event.stressLevel, 0) / stressEvents.length;
    document.getElementById('avgStressLevel').textContent = avgStress.toFixed(1);

    // Most common trigger
    const tagCounts = {};
    stressEvents.forEach(event => {
        event.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    let topTrigger = 'None';
    let maxCount = 0;
    for (const [tag, count] of Object.entries(tagCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topTrigger = tag;
        }
    }
    document.getElementById('topTrigger').textContent = topTrigger;

    // Today's events
    const today = new Date().toDateString();
    const todayEvents = stressEvents.filter(event =>
        new Date(event.timestamp).toDateString() === today
    ).length;
    document.getElementById('todayEvents').textContent = todayEvents;
}

function updateHeatmap() {
    const timeRange = parseInt(document.getElementById('timeRange').value);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange);

    // Filter events within time range
    const filteredEvents = stressEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= startDate && eventDate <= endDate;
    });

    // Count triggers by date
    const dateTriggerCounts = {};
    filteredEvents.forEach(event => {
        const date = new Date(event.timestamp).toDateString();
        if (!dateTriggerCounts[date]) {
            dateTriggerCounts[date] = {};
        }
        event.tags.forEach(tag => {
            dateTriggerCounts[date][tag] = (dateTriggerCounts[date][tag] || 0) + 1;
        });
    });

    // Get all unique tags
    const allTags = new Set();
    filteredEvents.forEach(event => {
        event.tags.forEach(tag => allTags.add(tag));
    });
    const tagArray = Array.from(allTags).sort();

    // Prepare data for heatmap
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const datasets = tagArray.map(tag => {
        const data = dates.map(date => {
            const dateStr = date.toDateString();
            return dateTriggerCounts[dateStr]?.[tag] || 0;
        });
        return {
            label: tag,
            data: data,
            backgroundColor: getHeatmapColor,
            borderWidth: 1
        };
    });

    const ctx = document.getElementById('triggerHeatmap').getContext('2d');
    if (window.triggerHeatmap) {
        window.triggerHeatmap.destroy();
    }

    window.triggerHeatmap = new Chart(ctx, {
        type: 'matrix',
        data: {
            datasets: [{
                label: 'Trigger Frequency',
                data: prepareHeatmapData(dates, tagArray, dateTriggerCounts),
                backgroundColor: (context) => {
                    const value = context.parsed.v;
                    return getHeatmapColor(value);
                },
                borderWidth: 1,
                borderColor: '#fff',
                width: ({chart}) => (chart.chartArea || {}).width / dates.length - 1,
                height: ({chart}) => (chart.chartArea || {}).height / tagArray.length - 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            const data = context[0].dataset.data[context[0].dataIndex];
                            return `${data.x} - ${data.y}`;
                        },
                        label: (context) => {
                            const data = context.dataset.data[context.dataIndex];
                            return `${data.v} occurrences`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: dates.map(d => d.toLocaleDateString()),
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    type: 'category',
                    labels: tagArray,
                    offset: true
                }
            }
        }
    });
}

function prepareHeatmapData(dates, tags, dateTriggerCounts) {
    const data = [];
    tags.forEach((tag, tagIndex) => {
        dates.forEach((date, dateIndex) => {
            const dateStr = date.toDateString();
            const value = dateTriggerCounts[dateStr]?.[tag] || 0;
            data.push({
                x: date.toLocaleDateString(),
                y: tag,
                v: value
            });
        });
    });
    return data;
}

function getHeatmapColor(value) {
    if (value === 0) return '#f5f5f5';
    if (value === 1) return '#fff3cd';
    if (value === 2) return '#ffeaa7';
    if (value <= 4) return '#fab1a0';
    return '#e17055';
}

function updateTrendsChart() {
    const sortedEvents = stressEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedEvents.map(event => new Date(event.timestamp));
    const stressData = sortedEvents.map(event => event.stressLevel);

    const ctx = document.getElementById('stressTrendsChart').getContext('2d');
    if (window.stressTrendsChart) {
        window.stressTrendsChart.destroy();
    }

    window.stressTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stress Level',
                data: stressData,
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 10
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `Stress Level: ${context.parsed.y}`
                    }
                }
            }
        }
    });
}

function updateInsights() {
    // Top triggers
    const tagCounts = {};
    stressEvents.forEach(event => {
        event.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    const sortedTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    const topTriggersList = document.getElementById('topTriggersList');
    if (sortedTags.length === 0) {
        topTriggersList.textContent = 'No data available';
    } else {
        topTriggersList.innerHTML = sortedTags
            .map(([tag, count]) => `<div>${tag}: ${count} times</div>`)
            .join('');
    }

    // Peak stress times
    const hourCounts = {};
    stressEvents.forEach(event => {
        const hour = new Date(event.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0];

    const peakTimesList = document.getElementById('peakTimesList');
    if (peakHour) {
        const [hour, count] = peakHour;
        const timeStr = `${hour}:00 - ${parseInt(hour) + 1}:00`;
        peakTimesList.textContent = `Most stressful time: ${timeStr} (${count} events)`;
    } else {
        peakTimesList.textContent = 'No data available';
    }

    // Coping insights
    const copingEvents = stressEvents.filter(event => event.copingStrategy && event.copingStrategy !== 'None specified');
    const copingInsights = document.getElementById('copingInsights');
    if (copingEvents.length === 0) {
        copingInsights.textContent = 'No coping strategies logged yet';
    } else {
        const avgStressWithCoping = copingEvents.reduce((sum, event) => sum + event.stressLevel, 0) / copingEvents.length;
        const allAvgStress = stressEvents.reduce((sum, event) => sum + event.stressLevel, 0) / stressEvents.length;
        copingInsights.textContent = `${copingEvents.length} coping strategies logged. Average stress level: ${avgStressWithCoping.toFixed(1)} (vs ${allAvgStress.toFixed(1)} overall)`;
    }
}

function displayHistory(filter = 'all') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredEvents = stressEvents;

    if (filter !== 'all') {
        const stressRanges = {
            high: [7, 10],
            medium: [4, 6],
            low: [1, 3]
        };
        const [min, max] = stressRanges[filter];
        filteredEvents = stressEvents.filter(event =>
            event.stressLevel >= min && event.stressLevel <= max
        );
    }

    // Sort by most recent first
    filteredEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyDiv = document.getElementById('eventHistory');
    historyDiv.innerHTML = '';

    if (filteredEvents.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666;">No events found</p>';
        return;
    }

    filteredEvents.forEach(event => {
        const entry = document.createElement('div');
        entry.className = 'event-entry';

        const date = new Date(event.timestamp).toLocaleDateString();
        const time = new Date(event.timestamp).toLocaleTimeString();
        const stressClass = event.stressLevel >= 7 ? 'high' : event.stressLevel >= 4 ? 'medium' : 'low';

        entry.innerHTML = `
            <h4>
                ${date} ${time}
                <span class="stress-badge ${stressClass}">Level ${event.stressLevel}</span>
                <button class="delete-btn" onclick="deleteEvent(${event.id})">×</button>
            </h4>
            <p><strong>Description:</strong> ${event.description}</p>
            <p><strong>Coping Strategy:</strong> ${event.copingStrategy}</p>
            <div class="tags">
                ${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this stress event?')) {
        stressEvents = stressEvents.filter(event => event.id !== id);
        saveEvents();
        updateStats();
        updateHeatmap();
        updateTrendsChart();
        updateInsights();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateHeatmap();
    updateTrendsChart();
    updateInsights();
    displayHistory();
});