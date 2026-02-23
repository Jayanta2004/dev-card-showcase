// reflective-thinking-frequency-monitor.js

let reflections = JSON.parse(localStorage.getItem('reflectiveThinkingSessions')) || [];
let reflectionChart = null;

function logReflection() {
    const date = document.getElementById('reflectionDate').value;
    const duration = parseInt(document.getElementById('reflectionDuration').value);
    const type = document.getElementById('reflectionType').value;
    const depth = parseInt(document.getElementById('reflectionDepth').value);
    const quality = parseInt(document.getElementById('reflectionQuality').value);
    const trigger = document.getElementById('reflectionTrigger').value;
    const topic = document.getElementById('reflectionTopic').value.trim();
    const insights = document.getElementById('keyInsights').value.trim();
    const actions = document.getElementById('actionItems').value.trim();
    const notes = document.getElementById('reflectionNotes').value.trim();

    if (!date || !duration || !type || !depth || !quality || !topic || !insights) {
        alert('Please fill in all required fields.');
        return;
    }

    const reflection = {
        id: Date.now(),
        date,
        duration,
        type,
        depth,
        quality,
        trigger,
        topic,
        insights,
        actions,
        notes,
        createdAt: new Date().toISOString()
    };

    reflections.push(reflection);

    // Sort by date
    reflections.sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem('reflectiveThinkingSessions', JSON.stringify(reflections));

    // Clear form
    document.getElementById('reflectionDate').value = '';
    document.getElementById('reflectionDuration').value = '';
    document.getElementById('reflectionType').value = '';
    document.getElementById('reflectionDepth').value = '';
    document.getElementById('reflectionQuality').value = '';
    document.getElementById('reflectionTrigger').value = '';
    document.getElementById('reflectionTopic').value = '';
    document.getElementById('keyInsights').value = '';
    document.getElementById('actionItems').value = '';
    document.getElementById('reflectionNotes').value = '';

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateReflectionList();
}

function calculateReflectionStats() {
    if (reflections.length === 0) {
        return {
            total: 0,
            avgDaily: 0,
            avgDepth: 0,
            avgQuality: 0,
            lastReflection: null
        };
    }

    const total = reflections.length;
    const depths = reflections.map(r => r.depth);
    const qualities = reflections.map(r => r.quality);

    const avgDepth = depths.reduce((sum, d) => sum + d, 0) / depths.length;
    const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;

    // Calculate average daily reflections (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReflections = reflections.filter(r => new Date(r.date) >= thirtyDaysAgo);
    const avgDaily = recentReflections.length / 30;

    const lastReflection = new Date(reflections[0].date);

    return {
        total,
        avgDaily: parseFloat(avgDaily.toFixed(2)),
        avgDepth: parseFloat(avgDepth.toFixed(1)),
        avgQuality: parseFloat(avgQuality.toFixed(1)),
        lastReflection
    };
}

function updateStats() {
    const stats = calculateReflectionStats();

    document.getElementById('totalReflections').textContent = stats.total;
    document.getElementById('avgDailyReflections').textContent = stats.avgDaily;
    document.getElementById('avgDepthScore').textContent = stats.avgDepth;
    document.getElementById('avgQualityScore').textContent = stats.avgQuality;
}

function updateAlert() {
    const alertDiv = document.getElementById('reflectionAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    const stats = calculateReflectionStats();

    if (stats.total === 0) {
        alertDiv.classList.add('hidden');
        return;
    }

    const now = new Date();
    const hoursSinceLast = (now - stats.lastReflection) / (1000 * 60 * 60);

    if (hoursSinceLast > 48) {
        alertTitle.textContent = 'Time for Reflection';
        alertMessage.textContent = `It's been ${Math.floor(hoursSinceLast / 24)} days since your last reflection. Regular reflection strengthens self-awareness and decision-making.`;
        alertDiv.classList.remove('hidden');
    } else if (stats.avgDaily < 0.5) {
        alertTitle.textContent = 'Build Reflection Habit';
        alertMessage.textContent = `You're averaging ${stats.avgDaily} reflections per day. Try to reflect at least once daily to develop this valuable skill.`;
        alertDiv.classList.remove('hidden');
    } else {
        alertDiv.classList.add('hidden');
    }
}

function updateChart() {
    const ctx = document.getElementById('reflectionChart').getContext('2d');
    const chartView = document.getElementById('chartView').value;
    const timeRange = parseInt(document.getElementById('timeRange').value);

    if (reflectionChart) {
        reflectionChart.destroy();
    }

    let labels = [];
    let data = [];
    let backgroundColor = 'rgba(54, 162, 235, 0.5)';
    let borderColor = 'rgba(54, 162, 235, 1)';

    // Filter by time range
    let filteredReflections = reflections;
    if (timeRange !== 'all') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeRange);
        filteredReflections = reflections.filter(r => new Date(r.date) >= cutoffDate);
    }

    if (chartView === 'daily') {
        // Group by date
        const dailyCounts = {};
        filteredReflections.forEach(reflection => {
            const date = new Date(reflection.date).toDateString();
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        const sortedDates = Object.keys(dailyCounts).sort((a, b) => new Date(a) - new Date(b));
        labels = sortedDates.map(date => new Date(date).toLocaleDateString());
        data = sortedDates.map(date => dailyCounts[date]);
    } else if (chartView === 'weekly') {
        // Group by week
        const weeklyCounts = {};
        filteredReflections.forEach(reflection => {
            const date = new Date(reflection.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];

            weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
        });

        const sortedWeeks = Object.keys(weeklyCounts).sort();
        labels = sortedWeeks.map(week => {
            const date = new Date(week);
            return `Week of ${date.toLocaleDateString()}`;
        });
        data = sortedWeeks.map(week => weeklyCounts[week]);
    } else if (chartView === 'type') {
        const typeCounts = {};
        filteredReflections.forEach(reflection => {
            typeCounts[reflection.type] = (typeCounts[reflection.type] || 0) + 1;
        });

        labels = Object.keys(typeCounts).map(type => type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()));
        data = Object.values(typeCounts);
    } else if (chartView === 'depth') {
        // Depth over time
        const sortedReflections = filteredReflections.sort((a, b) => new Date(a.date) - new Date(b.date));
        labels = sortedReflections.map(r => new Date(r.date).toLocaleDateString());
        data = sortedReflections.map(r => r.depth);
        backgroundColor = 'rgba(255, 99, 132, 0.5)';
        borderColor = 'rgba(255, 99, 132, 1)';
    }

    reflectionChart = new Chart(ctx, {
        type: chartView === 'depth' ? 'line' : 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: chartView === 'depth' ? 'Reflection Depth' : 'Number of Reflections',
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: chartView === 'depth' ? 'Depth Score' : 'Count'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (reflections.length === 0) {
        insightsDiv.innerHTML = '<p>Log several reflections to receive personalized insights about your reflective thinking patterns and recommendations for improvement.</p>';
        return;
    }

    const insights = [];
    const stats = calculateReflectionStats();

    // Frequency insights
    if (stats.avgDaily >= 1) {
        insights.push(`<div class="insight-item"><i class="fas fa-check-circle"></i> <strong>Excellent Frequency:</strong> You're reflecting ${stats.avgDaily} times per day on average. This consistent practice will significantly enhance your self-awareness.</div>`);
    } else if (stats.avgDaily >= 0.5) {
        insights.push(`<div class="insight-item"><i class="fas fa-info-circle"></i> <strong>Good Progress:</strong> You're reflecting ${stats.avgDaily} times per day. Try to increase to daily reflections for maximum benefit.</div>`);
    } else {
        insights.push(`<div class="insight-item"><i class="fas fa-exclamation-triangle"></i> <strong>Build the Habit:</strong> You're reflecting ${stats.avgDaily} times per day. Consider setting a daily reminder to make reflection a regular practice.</div>`);
    }

    // Depth insights
    if (stats.avgDepth >= 8) {
        insights.push(`<div class="insight-item"><i class="fas fa-star"></i> <strong>Deep Reflection:</strong> Your average depth score of ${stats.avgDepth} indicates profound, insightful reflections. Continue developing this strength.</div>`);
    } else if (stats.avgDepth >= 6) {
        insights.push(`<div class="insight-item"><i class="fas fa-thumbs-up"></i> <strong>Solid Depth:</strong> Your reflections are moderately deep. Try to probe a bit deeper into underlying patterns and causes.</div>`);
    } else {
        insights.push(`<div class="insight-item"><i class="fas fa-lightbulb"></i> <strong>Deepen Your Practice:</strong> Your average depth score of ${stats.avgDepth} suggests surface-level reflections. Ask "why" questions to reach deeper insights.</div>`);
    }

    // Quality insights
    if (stats.avgQuality >= 8) {
        insights.push(`<div class="insight-item"><i class="fas fa-award"></i> <strong>High-Quality Insights:</strong> Your reflections are generating valuable insights. This will lead to meaningful personal growth.</div>`);
    } else if (stats.avgQuality < 6) {
        insights.push(`<div class="insight-item"><i class="fas fa-search"></i> <strong>Focus on Quality:</strong> Consider spending more time processing your reflections to generate clearer, more actionable insights.</div>`);
    }

    // Type diversity
    const typeCounts = {};
    reflections.forEach(r => {
        typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    });

    const dominantType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);
    if (Object.keys(typeCounts).length < 3) {
        insights.push(`<div class="insight-item"><i class="fas fa-balance-scale"></i> <strong>Diversify Topics:</strong> Most of your reflections are about ${dominantType.replace('-', ' ')}. Try reflecting on different aspects of your life for balanced self-awareness.</div>`);
    }

    // Action items
    const reflectionsWithActions = reflections.filter(r => r.actions.trim()).length;
    if (reflectionsWithActions / reflections.length < 0.3) {
        insights.push(`<div class="insight-item"><i class="fas fa-tasks"></i> <strong>Action-Oriented:</strong> Only ${Math.round((reflectionsWithActions / reflections.length) * 100)}% of your reflections include action items. Try to identify concrete next steps from your insights.</div>`);
    }

    if (insights.length === 0) {
        insights.push('<div class="insight-item"><i class="fas fa-thumbs-up"></i> <strong>Great Progress:</strong> Your reflection practice is developing well. Keep up the good work!</div>');
    }

    insightsDiv.innerHTML = insights.join('');
}

function updateReflectionList() {
    const reflectionListDiv = document.getElementById('reflectionList');
    const filterType = document.getElementById('filterType').value;
    const sortBy = document.getElementById('sortBy').value;

    let filteredReflections = reflections;

    if (filterType !== 'all') {
        filteredReflections = reflections.filter(r => r.type === filterType);
    }

    // Sort reflections
    filteredReflections.sort((a, b) => {
        switch(sortBy) {
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'depth':
                return b.depth - a.depth;
            case 'quality':
                return b.quality - a.quality;
            case 'type':
                return a.type.localeCompare(b.type);
            default:
                return 0;
        }
    });

    if (filteredReflections.length === 0) {
        reflectionListDiv.innerHTML = '<p class="no-reflections">No reflections found matching the current filters.</p>';
        return;
    }

    reflectionListDiv.innerHTML = filteredReflections.map(reflection => `
        <div class="reflection-item">
            <div class="reflection-header">
                <div>
                    <h4 class="reflection-title">${reflection.topic}</h4>
                    <p class="reflection-meta">${new Date(reflection.date).toLocaleString()} • ${reflection.duration} min</p>
                </div>
                <span class="reflection-type">${reflection.type.replace('-', ' ')}</span>
            </div>
            <div class="reflection-scores">
                <div class="score-item">
                    <div class="score-label">Depth</div>
                    <div class="score-value">${reflection.depth}/10</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Quality</div>
                    <div class="score-value">${reflection.quality}/10</div>
                </div>
            </div>
            <div class="reflection-content">
                <div class="reflection-insights">
                    <strong>Key Insights:</strong> ${reflection.insights}
                </div>
                ${reflection.actions ? `<div class="reflection-actions"><strong>Actions:</strong> ${reflection.actions}</div>` : ''}
                ${reflection.notes ? `<div class="reflection-notes"><strong>Notes:</strong> ${reflection.notes}</div>` : ''}
                ${reflection.trigger ? `<div class="reflection-trigger"><strong>Triggered by:</strong> ${reflection.trigger.replace('-', ' ')}</div>` : ''}
            </div>
            <div class="reflection-actions">
                <button class="btn-secondary" onclick="editReflection(${reflection.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-danger" onclick="deleteReflection(${reflection.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function deleteReflection(reflectionId) {
    if (confirm('Are you sure you want to delete this reflection?')) {
        reflections = reflections.filter(r => r.id !== reflectionId);
        localStorage.setItem('reflectiveThinkingSessions', JSON.stringify(reflections));
        updateStats();
        updateAlert();
        updateChart();
        updateInsights();
        updateReflectionList();
    }
}

function editReflection(reflectionId) {
    // For simplicity, we'll just prompt for basic edits
    const reflection = reflections.find(r => r.id === reflectionId);
    if (!reflection) return;

    const newTopic = prompt('Edit reflection topic:', reflection.topic);
    if (newTopic && newTopic.trim()) {
        reflection.topic = newTopic.trim();
        localStorage.setItem('reflectiveThinkingSessions', JSON.stringify(reflections));
        updateReflectionList();
    }
}

// Event listeners
document.getElementById('reflectionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logReflection();
});

document.getElementById('chartView').addEventListener('change', updateChart);
document.getElementById('timeRange').addEventListener('change', updateChart);
document.getElementById('filterType').addEventListener('change', updateReflectionList);
document.getElementById('sortBy').addEventListener('change', updateReflectionList);

// Set default datetime to now
document.getElementById('reflectionDate').valueAsDate = new Date();

// Initialize
updateStats();
updateAlert();
updateChart();
updateInsights();
updateReflectionList();