// Grip Strength Tracker JavaScript

let gripSessions = JSON.parse(localStorage.getItem('gripSessions')) || [];

// Performance standards based on grip strength (kg)
const PERFORMANCE_STANDARDS = [
    {
        level: 'Beginner',
        range: '0-20 kg',
        min: 0,
        max: 20,
        description: 'Starting out or returning to training'
    },
    {
        level: 'Novice',
        range: '21-30 kg',
        min: 21,
        max: 30,
        description: 'Basic strength development'
    },
    {
        level: 'Intermediate',
        range: '31-40 kg',
        min: 31,
        max: 40,
        description: 'Good functional strength'
    },
    {
        level: 'Advanced',
        range: '41-50 kg',
        min: 41,
        max: 50,
        description: 'Strong grip strength'
    },
    {
        level: 'Elite',
        range: '51-60 kg',
        min: 51,
        max: 60,
        description: 'Professional level strength'
    },
    {
        level: 'Exceptional',
        range: '61+ kg',
        min: 61,
        max: 200,
        description: 'World-class grip strength'
    }
];

// Training tips
const TRAINING_TIPS = [
    {
        title: 'Warm Up Properly',
        text: 'Always perform light cardio and wrist rotations before grip training to prevent injury.'
    },
    {
        title: 'Progressive Overload',
        text: 'Gradually increase resistance or repetitions to build grip strength over time.'
    },
    {
        title: 'Mix Training Methods',
        text: 'Combine dead hangs, farmer walks, and gripper tools for comprehensive development.'
    },
    {
        title: 'Recovery Matters',
        text: 'Allow adequate rest between intense grip sessions for tendon recovery.'
    },
    {
        title: 'Track Progress',
        text: 'Regular testing helps identify what training methods work best for you.'
    },
    {
        title: 'Nutrition & Recovery',
        text: 'Ensure adequate protein intake and consider collagen supplements for tendon health.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
    renderStandards();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('testDate').value = today;

    // Event listeners
    document.getElementById('strengthForm').addEventListener('submit', logGrip);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
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

function logGrip(e) {
    e.preventDefault();

    const session = {
        id: Date.now(),
        date: document.getElementById('testDate').value,
        strength: parseFloat(document.getElementById('gripStrength').value),
        hand: document.getElementById('hand').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    gripSessions.push(session);
    localStorage.setItem('gripSessions', JSON.stringify(gripSessions));

    // Reset form
    document.getElementById('strengthForm').reset();
    document.getElementById('testDate').value = new Date().toISOString().split('T')[0];

    updateDisplay();

    // Show success message
    alert('Grip strength logged successfully!');
}

function updateDisplay() {
    updateMetrics();
    updateHistory();
    updateChart();
    updateInsights();
    updateStandards();
}

function updateMetrics() {
    const totalTests = gripSessions.length;
    document.getElementById('totalTests').textContent = totalTests;

    if (totalTests > 0) {
        const bestGrip = Math.max(...gripSessions.map(s => s.strength));
        const avgGrip = (gripSessions.reduce((sum, s) => sum + s.strength, 0) / totalTests).toFixed(1);

        document.getElementById('bestGrip').textContent = `${bestGrip}kg`;
        document.getElementById('avgGrip').textContent = `${avgGrip}kg`;

        // Calculate improvement (compare last 4 weeks vs first 4 weeks of available data)
        const weeklyData = groupSessionsByWeek(gripSessions);
        if (weeklyData.length >= 8) {
            const firstFourWeeks = weeklyData.slice(0, 4);
            const lastFourWeeks = weeklyData.slice(-4);
            const firstAvg = firstFourWeeks.reduce((sum, w) => sum + w.avgStrength, 0) / 4;
            const lastAvg = lastFourWeeks.reduce((sum, w) => sum + w.avgStrength, 0) / 4;
            const improvement = (lastAvg - firstAvg).toFixed(1);
            document.getElementById('improvement').textContent = `${improvement > 0 ? '+' : ''}${improvement}kg`;
        } else if (totalTests >= 10) {
            // Fallback to session-based calculation
            const firstFive = gripSessions.slice(0, 5);
            const lastFive = gripSessions.slice(-5);
            const firstAvg = firstFive.reduce((sum, s) => sum + s.strength, 0) / 5;
            const lastAvg = lastFive.reduce((sum, s) => sum + s.strength, 0) / 5;
            const improvement = (lastAvg - firstAvg).toFixed(1);
            document.getElementById('improvement').textContent = `${improvement > 0 ? '+' : ''}${improvement}kg`;
        } else {
            document.getElementById('improvement').textContent = '--';
        }
    }
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'week') {
    const now = new Date();
    let filteredSessions = gripSessions;

    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = gripSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredSessions = gripSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Sort by date descending
    filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('strengthHistory');
    historyList.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No grip tests found for this period.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(session.date).toLocaleDateString();
        const handText = session.hand.charAt(0).toUpperCase() + session.hand.slice(1);

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-strength">${session.strength}kg</span>
                </div>
                <div class="history-details">
                    <span>Hand: <strong class="history-hand">${handText}</strong></span>
                    ${session.notes ? `<br><em>${session.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteGrip(${session.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteGrip(id) {
    if (confirm('Are you sure you want to delete this grip test?')) {
        gripSessions = gripSessions.filter(s => s.id !== id);
        localStorage.setItem('gripSessions', JSON.stringify(gripSessions));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('progressionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (gripSessions.length < 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more grip tests to see weekly progression', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Group sessions by week
    const weeklyData = groupSessionsByWeek(gripSessions);

    // Use Chart.js for better visualization
    if (window.progressionChart) {
        window.progressionChart.destroy();
    }

    window.progressionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weeklyData.map(week => week.label),
            datasets: [{
                label: 'Average Grip Strength (kg)',
                data: weeklyData.map(week => week.avgStrength),
                borderColor: '#38a169',
                backgroundColor: 'rgba(56, 161, 105, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#38a169',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Grip Strength Progression',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return `Week of ${context[0].label}`;
                        },
                        label: function(context) {
                            const week = weeklyData[context.dataIndex];
                            return [
                                `Average: ${context.parsed.y.toFixed(1)} kg`,
                                `Tests: ${week.count}`,
                                `Best: ${week.maxStrength.toFixed(1)} kg`,
                                `Range: ${week.minStrength.toFixed(1)} - ${week.maxStrength.toFixed(1)} kg`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Grip Strength (kg)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Week'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function groupSessionsByWeek(sessions) {
    // Sort sessions by date
    const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    const weeklyGroups = {};

    sortedSessions.forEach(session => {
        const date = new Date(session.date);
        // Get the Monday of the week containing this date
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        const weekKey = monday.toISOString().split('T')[0];

        if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = {
                sessions: [],
                monday: monday
            };
        }

        weeklyGroups[weekKey].sessions.push(session);
    });

    // Convert to array and calculate weekly stats
    return Object.values(weeklyGroups)
        .sort((a, b) => a.monday - b.monday)
        .slice(-12) // Show last 12 weeks
        .map(week => {
            const strengths = week.sessions.map(s => s.strength);
            const avgStrength = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
            const minStrength = Math.min(...strengths);
            const maxStrength = Math.max(...strengths);

            // Format week label
            const endOfWeek = new Date(week.monday);
            endOfWeek.setDate(week.monday.getDate() + 6);

            const label = `${week.monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

            return {
                label: label,
                avgStrength: Math.round(avgStrength * 10) / 10,
                minStrength: Math.round(minStrength * 10) / 10,
                maxStrength: Math.round(maxStrength * 10) / 10,
                count: strengths.length
            };
        });
}

function updateInsights() {
    // Strength level estimation
    const strengthElement = document.getElementById('strengthLevel');
    if (gripSessions.length > 0) {
        const avgStrength = gripSessions.reduce((sum, s) => sum + s.strength, 0) / gripSessions.length;
        const bestStrength = Math.max(...gripSessions.map(s => s.strength));

        let strengthLevel = 'Beginner';
        if (bestStrength >= 60) strengthLevel = 'Exceptional';
        else if (bestStrength >= 50) strengthLevel = 'Elite';
        else if (bestStrength >= 40) strengthLevel = 'Advanced';
        else if (bestStrength >= 30) strengthLevel = 'Intermediate';
        else if (bestStrength >= 20) strengthLevel = 'Novice';

        strengthElement.innerHTML = `<p>Your best grip of ${bestStrength}kg places you in the <strong>${strengthLevel}</strong> category.</p>`;
    }

    // Progress trend
    const trendElement = document.getElementById('progressTrend');
    const weeklyData = groupSessionsByWeek(gripSessions);
    if (weeklyData.length >= 4) {
        const recentWeeks = weeklyData.slice(-4);
        const earlierWeeks = weeklyData.slice(-8, -4);

        if (earlierWeeks.length > 0) {
            const recentAvg = recentWeeks.reduce((sum, w) => sum + w.avgStrength, 0) / recentWeeks.length;
            const earlierAvg = earlierWeeks.reduce((sum, w) => sum + w.avgStrength, 0) / earlierWeeks.length;
            const change = recentAvg - earlierAvg;

            const direction = change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable';
            const changeText = change > 0 ? '+' : '';
            trendElement.innerHTML = `<p>Your weekly average is <strong>${direction}</strong> (${changeText}${change.toFixed(1)}kg change over last 4 weeks).</p>`;
        } else {
            trendElement.innerHTML = `<p>Continue logging to track your progress trend.</p>`;
        }
    } else if (gripSessions.length >= 5) {
        // Fallback to session-based trend
        const recent = gripSessions.slice(-5);
        const earlier = gripSessions.slice(-10, -5);

        if (earlier.length > 0) {
            const recentAvg = recent.reduce((sum, s) => sum + s.strength, 0) / recent.length;
            const earlierAvg = earlier.reduce((sum, s) => sum + s.strength, 0) / earlier.length;
            const change = recentAvg - earlierAvg;

            const direction = change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable';
            trendElement.innerHTML = `<p>Your recent performance is <strong>${direction}</strong> (${change > 0 ? '+' : ''}${change.toFixed(1)}kg change).</p>`;
        }
    }

    // Hand balance
    const balanceElement = document.getElementById('handBalance');
    if (gripSessions.length > 0) {
        const leftGrips = gripSessions.filter(s => s.hand === 'left');
        const rightGrips = gripSessions.filter(s => s.hand === 'right');

        if (leftGrips.length > 0 && rightGrips.length > 0) {
            const leftAvg = leftGrips.reduce((sum, s) => sum + s.strength, 0) / leftGrips.length;
            const rightAvg = rightGrips.reduce((sum, s) => sum + s.strength, 0) / rightGrips.length;
            const difference = Math.abs(leftAvg - rightAvg);

            let balance = 'balanced';
            if (difference > 5) balance = 'imbalanced';

            balanceElement.innerHTML = `<p>Your grip strength is <strong>${balance}</strong> (Left: ${leftAvg.toFixed(1)}kg, Right: ${rightAvg.toFixed(1)}kg).</p>`;
        } else {
            balanceElement.innerHTML = `<p>Log tests for both hands to see balance comparison.</p>`;
        }
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');
    tipsContainer.innerHTML = '';

    TRAINING_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <div class="tip-icon">
                <i data-lucide="zap"></i>
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

function renderStandards() {
    const standardsContainer = document.getElementById('standards');
    standardsContainer.innerHTML = '';

    if (gripSessions.length === 0) return;

    const bestGrip = Math.max(...gripSessions.map(s => s.strength));

    PERFORMANCE_STANDARDS.forEach(standard => {
        const item = document.createElement('div');
        item.className = `standard-item ${bestGrip >= standard.min && bestGrip <= standard.max ? 'current' : ''}`;

        item.innerHTML = `
            <div class="standard-title">${standard.level}</div>
            <div class="standard-range">${standard.range}</div>
            <div class="standard-description">${standard.description}</div>
        `;

        standardsContainer.appendChild(item);
    });
}

function updateStandards() {
    renderStandards();
}