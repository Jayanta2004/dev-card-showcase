// Reactive Agility Monitor JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load navbar and footer
    loadComponent('navbar-placeholder', '../navbar.html');
    loadComponent('footer-placeholder', '../footer.html');

    // Initialize the application
    initializeApp();

    // Form submission handler
    document.getElementById('agility-form').addEventListener('submit', handleFormSubmit);

    // Filter handlers
    document.getElementById('filter-drill-type').addEventListener('change', filterHistory);
    document.getElementById('filter-date').addEventListener('change', filterHistory);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
});

function initializeApp() {
    loadData();
    updateStats();
    renderCharts();
    renderInsights();
    renderHistory();
}

function loadComponent(placeholderId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(placeholderId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        drillType: document.getElementById('drill-type').value,
        responseTime: parseFloat(document.getElementById('response-time').value),
        movementQuality: parseInt(document.getElementById('movement-quality').value),
        directionChanges: parseInt(document.getElementById('direction-changes').value),
        reactionStimulus: document.getElementById('reaction-stimulus').value,
        fatigueLevel: parseInt(document.getElementById('fatigue-level').value),
        notes: document.getElementById('notes').value
    };

    saveSession(formData);
    resetForm();
    updateStats();
    renderCharts();
    renderInsights();
    renderHistory();

    // Show success message
    showNotification('Agility session logged successfully!', 'success');
}

function saveSession(session) {
    const sessions = getSessions();
    sessions.push(session);
    localStorage.setItem('reactive-agility-sessions', JSON.stringify(sessions));
}

function getSessions() {
    const sessions = localStorage.getItem('reactive-agility-sessions');
    return sessions ? JSON.parse(sessions) : [];
}

function resetForm() {
    document.getElementById('agility-form').reset();
}

function updateStats() {
    const sessions = getSessions();

    if (sessions.length === 0) {
        document.getElementById('avg-response-time').textContent = '--';
        document.getElementById('best-response-time').textContent = '--';
        document.getElementById('avg-movement-quality').textContent = '--';
        document.getElementById('total-sessions').textContent = '--';
        return;
    }

    const avgResponseTime = sessions.reduce((sum, s) => sum + s.responseTime, 0) / sessions.length;
    const bestResponseTime = Math.min(...sessions.map(s => s.responseTime));
    const avgMovementQuality = sessions.reduce((sum, s) => sum + s.movementQuality, 0) / sessions.length;

    document.getElementById('avg-response-time').textContent = avgResponseTime.toFixed(2);
    document.getElementById('best-response-time').textContent = bestResponseTime.toFixed(2);
    document.getElementById('avg-movement-quality').textContent = avgMovementQuality.toFixed(1);
    document.getElementById('total-sessions').textContent = sessions.length;
}

function renderCharts() {
    const sessions = getSessions();

    if (sessions.length === 0) return;

    renderResponseTimeChart(sessions);
    renderQualityByDrillChart(sessions);
    renderFatigueCorrelationChart(sessions);
}

function renderResponseTimeChart(sessions) {
    const ctx = document.getElementById('response-time-chart').getContext('2d');

    // Sort sessions by date
    const sortedSessions = sessions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedSessions.map(s => new Date(s.timestamp).toLocaleDateString());
    const data = sortedSessions.map(s => s.responseTime);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Response Time (seconds)',
                data: data,
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: '#333333'
                    }
                },
                x: {
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: '#333333'
                    }
                }
            }
        }
    });
}

function renderQualityByDrillChart(sessions) {
    const ctx = document.getElementById('quality-by-drill-chart').getContext('2d');

    const drillTypes = {};
    sessions.forEach(session => {
        if (!drillTypes[session.drillType]) {
            drillTypes[session.drillType] = [];
        }
        drillTypes[session.drillType].push(session.movementQuality);
    });

    const labels = Object.keys(drillTypes).map(type => formatDrillType(type));
    const data = Object.values(drillTypes).map(qualities =>
        qualities.reduce((sum, q) => sum + q, 0) / qualities.length
    );

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Movement Quality',
                data: data,
                backgroundColor: 'rgba(123, 104, 238, 0.8)',
                borderColor: '#7b68ee',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: '#333333'
                    }
                },
                x: {
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: '#333333'
                    }
                }
            }
        }
    });
}

function renderFatigueCorrelationChart(sessions) {
    const ctx = document.getElementById('fatigue-correlation-chart').getContext('2d');

    const data = sessions.map(s => ({
        x: s.fatigueLevel,
        y: s.responseTime
    }));

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Fatigue vs Response Time',
                data: data,
                backgroundColor: 'rgba(255, 107, 107, 0.8)',
                borderColor: '#ff6b6b'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fatigue Level (1-10)',
                        color: '#cccccc'
                    },
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: '#333333'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Response Time (seconds)',
                        color: '#cccccc'
                    },
                    ticks: {
                        color: '#cccccc'
                    },
                    grid: {
                        color: '#333333'
                    }
                }
            }
        }
    });
}

function renderInsights() {
    const sessions = getSessions();
    const insightsContainer = document.getElementById('insights-container');

    if (sessions.length === 0) return;

    const insights = generateInsights(sessions);

    insightsContainer.innerHTML = insights.map(insight => `
        <div class="insight-card">
            <h3>${insight.icon} ${insight.title}</h3>
            <p>${insight.description}</p>
        </div>
    `).join('');
}

function generateInsights(sessions) {
    const insights = [];

    // Response time improvement
    const recentSessions = sessions.slice(-10);
    if (recentSessions.length >= 5) {
        const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
        const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));

        const firstAvg = firstHalf.reduce((sum, s) => sum + s.responseTime, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, s) => sum + s.responseTime, 0) / secondHalf.length;

        if (secondAvg < firstAvg) {
            const improvement = ((firstAvg - secondAvg) / firstAvg * 100).toFixed(1);
            insights.push({
                icon: '📈',
                title: 'Response Time Improvement',
                description: `Your average response time has improved by ${improvement}% in recent sessions. Keep up the great work!`
            });
        }
    }

    // Fatigue impact
    const fatigueCorrelation = sessions.reduce((sum, s) => sum + (s.fatigueLevel * s.responseTime), 0) / sessions.length;
    const avgFatigue = sessions.reduce((sum, s) => sum + s.fatigueLevel, 0) / sessions.length;
    const avgResponse = sessions.reduce((sum, s) => sum + s.responseTime, 0) / sessions.length;

    if (fatigueCorrelation > avgFatigue * avgResponse * 1.2) {
        insights.push({
            icon: '⚡',
            title: 'Fatigue Management',
            description: 'Higher fatigue levels are correlated with slower response times. Consider recovery strategies between intense sessions.'
        });
    }

    // Movement quality consistency
    const qualityVariance = sessions.reduce((sum, s) => sum + Math.pow(s.movementQuality - 5.5, 2), 0) / sessions.length;
    if (qualityVariance < 2) {
        insights.push({
            icon: '🎯',
            title: 'Consistent Performance',
            description: 'Your movement quality ratings show good consistency. Focus on maintaining this level while improving speed.'
        });
    }

    // Drill type preferences
    const drillCounts = {};
    sessions.forEach(s => drillCounts[s.drillType] = (drillCounts[s.drillType] || 0) + 1);
    const mostPracticed = Object.entries(drillCounts).sort((a, b) => b[1] - a[1])[0];

    if (mostPracticed) {
        insights.push({
            icon: '🔄',
            title: 'Practice Focus',
            description: `You've practiced ${formatDrillType(mostPracticed[0])} the most (${mostPracticed[1]} sessions). Consider diversifying your training.`
        });
    }

    // Direction changes analysis
    const avgDirectionChanges = sessions.reduce((sum, s) => sum + s.directionChanges, 0) / sessions.length;
    if (avgDirectionChanges > 5) {
        insights.push({
            icon: '🌀',
            title: 'Complex Movement Patterns',
            description: 'Your sessions involve many direction changes. This indicates advanced reactive agility training.'
        });
    }

    return insights.length > 0 ? insights : [{
        icon: '💡',
        title: 'Keep Tracking!',
        description: 'Continue logging your agility sessions to unlock more personalized insights about your performance.'
    }];
}

function renderHistory() {
    const sessions = getSessions();
    const historyList = document.getElementById('history-list');

    if (sessions.length === 0) {
        historyList.innerHTML = '<p>No sessions logged yet. Start by logging your first agility session!</p>';
        return;
    }

    // Sort by date (newest first)
    const sortedSessions = sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    historyList.innerHTML = sortedSessions.map(session => `
        <div class="history-item">
            <div class="history-item-header">
                <div class="history-item-title">${formatDrillType(session.drillType)}</div>
                <div class="history-item-date">${new Date(session.timestamp).toLocaleString()}</div>
            </div>
            <div class="history-item-details">
                <div class="history-item-detail">
                    <span>Response Time:</span>
                    <span>${session.responseTime}s</span>
                </div>
                <div class="history-item-detail">
                    <span>Movement Quality:</span>
                    <span>${session.movementQuality}/10</span>
                </div>
                <div class="history-item-detail">
                    <span>Direction Changes:</span>
                    <span>${session.directionChanges}</span>
                </div>
                <div class="history-item-detail">
                    <span>Fatigue Level:</span>
                    <span>${session.fatigueLevel}/10</span>
                </div>
            </div>
            ${session.notes ? `<div class="history-item-notes"><strong>Notes:</strong> ${session.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteSession(${session.id})">Delete</button>
        </div>
    `).join('');
}

function filterHistory() {
    const drillTypeFilter = document.getElementById('filter-drill-type').value;
    const dateFilter = document.getElementById('filter-date').value;

    const sessions = getSessions();
    let filteredSessions = sessions;

    if (drillTypeFilter) {
        filteredSessions = filteredSessions.filter(s => s.drillType === drillTypeFilter);
    }

    if (dateFilter) {
        filteredSessions = filteredSessions.filter(s => s.date === dateFilter);
    }

    // Temporarily replace sessions for rendering
    const originalSessions = [...sessions];
    localStorage.setItem('reactive-agility-sessions', JSON.stringify(filteredSessions));
    renderHistory();
    localStorage.setItem('reactive-agility-sessions', JSON.stringify(originalSessions));
}

function clearFilters() {
    document.getElementById('filter-drill-type').value = '';
    document.getElementById('filter-date').value = '';
    renderHistory();
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        const sessions = getSessions().filter(s => s.id !== id);
        localStorage.setItem('reactive-agility-sessions', JSON.stringify(sessions));
        updateStats();
        renderCharts();
        renderInsights();
        renderHistory();
        showNotification('Session deleted successfully!', 'success');
    }
}

function formatDrillType(type) {
    const formats = {
        'light-reaction': 'Light Reaction Drill',
        'audio-reaction': 'Audio Reaction Drill',
        'partner-reaction': 'Partner Reaction Drill',
        'multi-directional': 'Multi-Directional Sprint',
        'unexpected-change': 'Unexpected Change of Direction',
        'obstacle-reaction': 'Obstacle Reaction Drill'
    };
    return formats[type] || type;
}

function showNotification(message, type) {
    // Simple notification - could be enhanced with a proper notification system
    alert(message);
}

// Load data from localStorage on page load
function loadData() {
    // Data is loaded through getSessions() when needed
}