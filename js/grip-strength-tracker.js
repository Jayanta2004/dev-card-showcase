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

        // Calculate improvement (last 5 vs first 5)
        if (totalTests >= 10) {
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
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (gripSessions.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more grip tests to see trends', width / 2, height / 2);
        return;
    }

    // Simple line chart for grip strength over time
    const sessions = gripSessions.slice(-20); // Last 20 sessions
    const maxStrength = Math.max(...sessions.map(s => s.strength));
    const minDate = new Date(Math.min(...sessions.map(s => new Date(s.date))));
    const maxDate = new Date(Math.max(...sessions.map(s => new Date(s.date))));

    ctx.strokeStyle = 'var(--primary-color)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    sessions.forEach((session, index) => {
        const x = (index / (sessions.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (session.strength / maxStrength) * (height - 40);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = 'var(--primary-color)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.stroke();

    // Add labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Recent Grip Tests', width / 2, height - 5);
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
    if (gripSessions.length >= 5) {
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