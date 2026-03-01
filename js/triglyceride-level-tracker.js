// Triglyceride Level Tracker JavaScript

let triglycerideSessions = JSON.parse(localStorage.getItem('triglycerideSessions')) || [];

// Triglyceride reference ranges (mg/dL)
const REFERENCE_RANGES = [
    {
        level: 'Normal',
        range: '< 150',
        min: 0,
        max: 149,
        description: 'Optimal cardiovascular health',
        color: '#38a169'
    },
    {
        level: 'Borderline High',
        range: '150-199',
        min: 150,
        max: 199,
        description: 'Moderate cardiovascular risk',
        color: '#d69e2e'
    },
    {
        level: 'High',
        range: '200-499',
        min: 200,
        max: 499,
        description: 'High cardiovascular risk',
        color: '#dd6b20'
    },
    {
        level: 'Very High',
        range: '≥ 500',
        min: 500,
        max: 2000,
        description: 'Very high cardiovascular risk',
        color: '#e53e3e'
    }
];

// Health tips
const HEALTH_TIPS = [
    {
        title: 'Dietary Changes',
        text: 'Reduce intake of refined sugars, saturated fats, and processed foods. Focus on whole foods, vegetables, and healthy fats.'
    },
    {
        title: 'Regular Exercise',
        text: 'Aim for at least 150 minutes of moderate aerobic activity per week to help lower triglyceride levels.'
    },
    {
        title: 'Weight Management',
        text: 'Maintaining a healthy weight can significantly improve triglyceride levels and cardiovascular health.'
    },
    {
        title: 'Limit Alcohol',
        text: 'Excessive alcohol consumption can raise triglyceride levels. Limit to moderate amounts if consumed.'
    },
    {
        title: 'Omega-3 Supplements',
        text: 'Consider omega-3 fatty acid supplements after consulting with your healthcare provider.'
    },
    {
        title: 'Regular Monitoring',
        text: 'Track your levels regularly and consult with healthcare professionals for personalized advice.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
    renderRanges();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('testDate').value = today;

    // Event listeners
    document.getElementById('triglycerideForm').addEventListener('submit', logTriglyceride);

    // History controls
    document.getElementById('viewRecent').addEventListener('click', () => filterHistory('recent'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));

    // Chart controls
    document.getElementById('timeRange').addEventListener('change', updateChart);
    document.getElementById('refreshChart').addEventListener('click', updateChart);
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Re-initialize Lucide icons for navbar
            lucide.createIcons();
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function logTriglyceride(e) {
    e.preventDefault();

    const session = {
        id: Date.now(),
        date: document.getElementById('testDate').value,
        level: parseFloat(document.getElementById('triglycerideLevel').value),
        testType: document.getElementById('testType').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    triglycerideSessions.push(session);
    localStorage.setItem('triglycerideSessions', JSON.stringify(triglycerideSessions));

    // Reset form
    document.getElementById('triglycerideForm').reset();
    document.getElementById('testDate').value = new Date().toISOString().split('T')[0];

    updateDisplay();

    // Show success message
    alert('Triglyceride level logged successfully!');
}

function updateDisplay() {
    updateMetrics();
    updateRiskIndicator();
    updateHistory();
    updateChart();
    updateInsights();
    updateRanges();
}

function updateMetrics() {
    const totalTests = triglycerideSessions.length;
    document.getElementById('totalTests').textContent = totalTests;

    if (totalTests > 0) {
        // Sort by date to get most recent
        const sortedSessions = [...triglycerideSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        const currentLevel = sortedSessions[0].level;
        const avgLevel = (triglycerideSessions.reduce((sum, s) => sum + s.level, 0) / totalTests).toFixed(0);

        document.getElementById('currentLevel').textContent = `${currentLevel} mg/dL`;
        document.getElementById('avgLevel').textContent = `${avgLevel} mg/dL`;

        // Calculate trend (last 3 vs previous 3)
        if (totalTests >= 6) {
            const recent = sortedSessions.slice(0, 3);
            const previous = sortedSessions.slice(3, 6);
            const recentAvg = recent.reduce((sum, s) => sum + s.level, 0) / 3;
            const previousAvg = previous.reduce((sum, s) => sum + s.level, 0) / 3;
            const change = recentAvg - previousAvg;

            const direction = change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable';
            const trendIcon = change > 10 ? '↗️' : change < -10 ? '↘️' : '➡️';
            document.getElementById('trend').textContent = `${trendIcon} ${direction}`;
        } else {
            document.getElementById('trend').textContent = '--';
        }
    }
}

function updateRiskIndicator() {
    const riskFill = document.getElementById('riskFill');
    const riskLabel = document.getElementById('riskLabel');

    if (triglycerideSessions.length === 0) {
        riskFill.style.width = '0%';
        riskFill.className = 'risk-fill';
        riskLabel.textContent = 'No data available';
        return;
    }

    // Get most recent level
    const sortedSessions = [...triglycerideSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const currentLevel = sortedSessions[0].level;

    // Find risk category
    const riskCategory = REFERENCE_RANGES.find(range =>
        currentLevel >= range.min && currentLevel <= range.max
    );

    if (riskCategory) {
        // Calculate position within range for visual indicator
        const rangeWidth = riskCategory.max - riskCategory.min;
        const position = rangeWidth > 0 ? (currentLevel - riskCategory.min) / rangeWidth : 0;
        const percentage = Math.min(position * 100, 100);

        riskFill.style.width = `${percentage}%`;
        riskFill.className = `risk-fill ${riskCategory.level.toLowerCase().replace(' ', '-')}`;
        riskLabel.textContent = `${riskCategory.level} (${currentLevel} mg/dL)`;
    }
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'recent') {
    let filteredSessions = triglycerideSessions;

    if (period === 'recent') {
        // Last 10 entries
        filteredSessions = [...triglycerideSessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    } else {
        // Sort by date descending
        filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const historyList = document.getElementById('labHistory');
    historyList.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No lab results found.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(session.date).toLocaleDateString();
        const riskCategory = REFERENCE_RANGES.find(range =>
            session.level >= range.min && session.level <= range.max
        );
        const statusClass = riskCategory ? riskCategory.level.toLowerCase().replace(' ', '-') : 'normal';

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-level">${session.level} mg/dL</span>
                </div>
                <div class="history-details">
                    <span>Test: ${session.testType}</span>
                    <span class="history-status ${statusClass}">${riskCategory ? riskCategory.level : 'Unknown'}</span>
                    ${session.notes ? `<br><em>${session.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteTriglyceride(${session.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteTriglyceride(id) {
    if (confirm('Are you sure you want to delete this lab result?')) {
        triglycerideSessions = triglycerideSessions.filter(s => s.id !== id);
        localStorage.setItem('triglycerideSessions', JSON.stringify(triglycerideSessions));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('triglycerideChart');
    if (!canvas) return;

    const timeRange = document.getElementById('timeRange').value;
    let filteredSessions = triglycerideSessions;

    // Filter by time range
    if (timeRange !== 'all') {
        const months = parseInt(timeRange);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);
        filteredSessions = triglycerideSessions.filter(s => new Date(s.date) >= cutoffDate);
    }

    // Sort by date
    filteredSessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredSessions.length < 2) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more results to see trends', canvas.width / 2, canvas.height / 2);
        return;
    }

    const labels = filteredSessions.map(s => new Date(s.date).toLocaleDateString());
    const data = filteredSessions.map(s => s.level);

    // Create gradient for the line
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(74, 144, 226, 0.3)');
    gradient.addColorStop(1, 'rgba(74, 144, 226, 0.05)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Triglyceride Level (mg/dL)',
                data: data,
                borderColor: 'var(--primary-color)',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'var(--primary-color)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            // Reference range lines
            {
                label: 'Normal (< 150)',
                data: Array(labels.length).fill(150),
                borderColor: '#38a169',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                tension: 0
            },
            {
                label: 'Borderline High (150-199)',
                data: Array(labels.length).fill(200),
                borderColor: '#d69e2e',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                tension: 0
            },
            {
                label: 'High (200-499)',
                data: Array(labels.length).fill(500),
                borderColor: '#dd6b20',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                tension: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Triglyceride Levels Over Time (${timeRange === 'all' ? 'All Time' : `Last ${timeRange} Months`})`
                },
                legend: {
                    display: true,
                    labels: {
                        filter: function(legendItem, chartData) {
                            // Hide reference range lines from legend
                            return legendItem.datasetIndex === 0;
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const level = context.parsed.y;
                            let range = '';
                            if (level < 150) range = 'Normal';
                            else if (level < 200) range = 'Borderline High';
                            else if (level < 500) range = 'High';
                            else range = 'Very High';
                            return `Risk Level: ${range}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Triglyceride Level (mg/dL)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            elements: {
                point: {
                    hoverBorderWidth: 3
                }
            }
        }
    });
}

function updateInsights() {
    // Risk Assessment
    const riskElement = document.getElementById('riskAssessment');
    if (triglycerideSessions.length > 0) {
        const sortedSessions = [...triglycerideSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        const currentLevel = sortedSessions[0].level;
        const riskCategory = REFERENCE_RANGES.find(range =>
            currentLevel >= range.min && currentLevel <= range.max
        );

        if (riskCategory) {
            riskElement.innerHTML = `<p>Your current level of ${currentLevel} mg/dL falls in the <strong>${riskCategory.level}</strong> range, indicating <strong>${riskCategory.description.toLowerCase()}</strong>.</p>`;
        }
    }

    // Progress Status
    const progressElement = document.getElementById('progressStatus');
    if (triglycerideSessions.length >= 3) {
        const sortedSessions = [...triglycerideSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = sortedSessions.slice(0, 3);
        const recentAvg = recent.reduce((sum, s) => sum + s.level, 0) / 3;
        const first = sortedSessions[sortedSessions.length - 1].level;
        const change = ((recentAvg - first) / first * 100).toFixed(1);

        const direction = change > 5 ? 'increased' : change < -5 ? 'decreased' : 'remained stable';
        const trend = change > 5 ? 'concerning' : change < -5 ? 'positive' : 'stable';
        progressElement.innerHTML = `<p>Your levels have ${direction} by ${Math.abs(change)}% since your first test, showing a <strong>${trend}</strong> trend.</p>`;
    }

    // Recommendations
    const recElement = document.getElementById('recommendations');
    if (triglycerideSessions.length > 0) {
        const sortedSessions = [...triglycerideSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        const currentLevel = sortedSessions[0].level;

        let recommendation = 'Continue monitoring your levels regularly and maintain a healthy lifestyle.';
        if (currentLevel >= 200) {
            recommendation = 'Consult with your healthcare provider about lifestyle changes or medication to manage high triglyceride levels.';
        } else if (currentLevel >= 150) {
            recommendation = 'Focus on dietary improvements and regular exercise to bring levels into the normal range.';
        }

        recElement.innerHTML = `<p>${recommendation}</p>`;
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');
    tipsContainer.innerHTML = '';

    HEALTH_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <div class="tip-icon">
                <i data-lucide="heart"></i>
            </div>
            <div class="tip-content">
                <h4>${tip.title}</h4>
                <p>${tip.text}</p>
            </div>
        `;
        tipsContainer.appendChild(tipElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}

function renderRanges() {
    const rangesContainer = document.getElementById('ranges');
    rangesContainer.innerHTML = '';

    if (triglycerideSessions.length === 0) return;

    const sortedSessions = [...triglycerideSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const currentLevel = sortedSessions[0].level;

    REFERENCE_RANGES.forEach(range => {
        const item = document.createElement('div');
        item.className = `range-item ${currentLevel >= range.min && currentLevel <= range.max ? 'current' : ''}`;

        item.innerHTML = `
            <div class="range-title">${range.level}</div>
            <div class="range-values">${range.range} mg/dL</div>
            <div class="range-description">${range.description}</div>
        `;

        rangesContainer.appendChild(item);
    });
}

function updateRanges() {
    renderRanges();
}