// Jump Height Analyzer JavaScript

let jumpSessions = JSON.parse(localStorage.getItem('jumpSessions')) || [];

// Effort level descriptions
const EFFORT_LEVELS = {
    1: 'Minimal',
    2: 'Very Low',
    3: 'Low',
    4: 'Below Average',
    5: 'Average',
    6: 'Above Average',
    7: 'Good',
    8: 'Strong',
    9: 'Very Strong',
    10: 'Maximum'
};

// Performance standards based on jump height
const PERFORMANCE_STANDARDS = [
    {
        level: 'Beginner',
        range: '0-15 inches',
        min: 0,
        max: 15,
        description: 'Starting out or returning to training'
    },
    {
        level: 'Novice',
        range: '16-20 inches',
        min: 16,
        max: 20,
        description: 'Basic athletic ability'
    },
    {
        level: 'Intermediate',
        range: '21-25 inches',
        min: 21,
        max: 25,
        description: 'Good athletic performance'
    },
    {
        level: 'Advanced',
        range: '26-30 inches',
        min: 26,
        max: 30,
        description: 'High-level athletic ability'
    },
    {
        level: 'Elite',
        range: '31-35 inches',
        min: 31,
        max: 35,
        description: 'Professional or Olympic level'
    },
    {
        level: 'Exceptional',
        range: '36+ inches',
        min: 36,
        max: 100,
        description: 'World-class performance'
    }
];

// Training tips
const TRAINING_TIPS = [
    {
        title: 'Warm Up Properly',
        text: 'Always perform dynamic stretches and light cardio before jumping to prevent injury.'
    },
    {
        title: 'Focus on Technique',
        text: 'Use proper form: quick countermovement, explosive extension, and soft landing.'
    },
    {
        title: 'Progressive Overload',
        text: 'Gradually increase training intensity and volume to build power over time.'
    },
    {
        title: 'Recovery Matters',
        text: 'Allow adequate rest between intense jump sessions for muscle recovery.'
    },
    {
        title: 'Track Progress',
        text: 'Regular testing helps identify what training methods work best for you.'
    },
    {
        title: 'Nutrition & Sleep',
        text: 'Fuel your body with quality protein and ensure 7-9 hours of sleep nightly.'
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
    document.getElementById('jumpDate').value = today;

    // Event listeners
    document.getElementById('jumpForm').addEventListener('submit', logJump);
    document.getElementById('effort').addEventListener('input', updateEffortDisplay);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));

    // Initialize effort display
    updateEffortDisplay();
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

function updateEffortDisplay() {
    const effort = document.getElementById('effort').value;
    document.getElementById('effortValue').textContent = effort;
    document.getElementById('effortText').textContent = EFFORT_LEVELS[effort];
}

function logJump(e) {
    e.preventDefault();

    const session = {
        id: Date.now(),
        date: document.getElementById('jumpDate').value,
        height: parseFloat(document.getElementById('jumpHeight').value),
        type: document.getElementById('jumpType').value,
        effort: parseInt(document.getElementById('effort').value),
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    jumpSessions.push(session);
    localStorage.setItem('jumpSessions', JSON.stringify(jumpSessions));

    // Reset form
    document.getElementById('jumpForm').reset();
    document.getElementById('jumpDate').value = new Date().toISOString().split('T')[0];
    updateEffortDisplay();

    updateDisplay();

    // Show success message
    alert('Jump logged successfully!');
}

function updateDisplay() {
    updateMetrics();
    updateHistory();
    updateChart();
    updateInsights();
    updateStandards();
}

function updateMetrics() {
    const totalJumps = jumpSessions.length;
    document.getElementById('totalJumps').textContent = totalJumps;

    if (totalJumps > 0) {
        const bestJump = Math.max(...jumpSessions.map(s => s.height));
        const avgJump = (jumpSessions.reduce((sum, s) => sum + s.height, 0) / totalJumps).toFixed(1);

        document.getElementById('bestJump').textContent = `${bestJump}"`;
        document.getElementById('avgJump').textContent = `${avgJump}"`;

        // Calculate improvement (last 5 vs first 5)
        if (totalJumps >= 10) {
            const firstFive = jumpSessions.slice(0, 5);
            const lastFive = jumpSessions.slice(-5);
            const firstAvg = firstFive.reduce((sum, s) => sum + s.height, 0) / 5;
            const lastAvg = lastFive.reduce((sum, s) => sum + s.height, 0) / 5;
            const improvement = (lastAvg - firstAvg).toFixed(1);
            document.getElementById('improvement').textContent = `${improvement > 0 ? '+' : ''}${improvement}"`;
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
    let filteredSessions = jumpSessions;

    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = jumpSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredSessions = jumpSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Sort by date descending
    filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('jumpHistory');
    historyList.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No jumps found for this period.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(session.date).toLocaleDateString();
        const effortText = EFFORT_LEVELS[session.effort];

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-height">${session.height}"</span>
                </div>
                <div class="history-details">
                    <span>Type: ${session.type}</span> |
                    <span>Effort: <strong class="history-effort">${session.effort}/10 (${effortText})</strong></span>
                    ${session.notes ? `<br><em>${session.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteJump(${session.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteJump(id) {
    if (confirm('Are you sure you want to delete this jump?')) {
        jumpSessions = jumpSessions.filter(s => s.id !== id);
        localStorage.setItem('jumpSessions', JSON.stringify(jumpSessions));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (jumpSessions.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more jumps to see trends', width / 2, height / 2);
        return;
    }

    // Simple line chart for jump height over time
    const sessions = jumpSessions.slice(-20); // Last 20 sessions
    const maxHeight = Math.max(...sessions.map(s => s.height));
    const minDate = new Date(Math.min(...sessions.map(s => new Date(s.date))));
    const maxDate = new Date(Math.max(...sessions.map(s => new Date(s.date))));

    ctx.strokeStyle = 'var(--primary-color)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    sessions.forEach((session, index) => {
        const x = (index / (sessions.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (session.height / maxHeight) * (height - 40);

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
    ctx.fillText('Recent Jumps', width / 2, height - 5);
}

function updateInsights() {
    // Power level estimation (rough calculation)
    const powerElement = document.getElementById('powerLevel');
    if (jumpSessions.length > 0) {
        const avgHeight = jumpSessions.reduce((sum, s) => sum + s.height, 0) / jumpSessions.length;
        const bestHeight = Math.max(...jumpSessions.map(s => s.height));

        let powerLevel = 'Beginner';
        if (bestHeight >= 30) powerLevel = 'Elite';
        else if (bestHeight >= 25) powerLevel = 'Advanced';
        else if (bestHeight >= 20) powerLevel = 'Intermediate';
        else if (bestHeight >= 15) powerLevel = 'Novice';

        powerElement.innerHTML = `<p>Your best jump of ${bestHeight}" places you in the <strong>${powerLevel}</strong> category.</p>`;
    }

    // Progress trend
    const trendElement = document.getElementById('progressTrend');
    if (jumpSessions.length >= 5) {
        const recent = jumpSessions.slice(-5);
        const earlier = jumpSessions.slice(-10, -5);

        if (earlier.length > 0) {
            const recentAvg = recent.reduce((sum, s) => sum + s.height, 0) / recent.length;
            const earlierAvg = earlier.reduce((sum, s) => sum + s.height, 0) / earlier.length;
            const change = recentAvg - earlierAvg;

            const direction = change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable';
            trendElement.innerHTML = `<p>Your recent performance is <strong>${direction}</strong> (${change > 0 ? '+' : ''}${change.toFixed(1)}" change).</p>`;
        }
    }

    // Training focus
    const focusElement = document.getElementById('trainingFocus');
    if (jumpSessions.length > 0) {
        const avgEffort = jumpSessions.reduce((sum, s) => sum + s.effort, 0) / jumpSessions.length;
        const avgHeight = jumpSessions.reduce((sum, s) => sum + s.height, 0) / jumpSessions.length;

        let focus = 'Focus on building basic strength and technique.';
        if (avgHeight > 25) focus = 'Incorporate plyometric training and power exercises.';
        else if (avgHeight > 20) focus = 'Work on explosive movements and speed training.';
        else if (avgEffort > 7) focus = 'Your effort is good - focus on technique refinement.';

        focusElement.innerHTML = `<p>${focus}</p>`;
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

    if (jumpSessions.length === 0) return;

    const bestJump = Math.max(...jumpSessions.map(s => s.height));

    PERFORMANCE_STANDARDS.forEach(standard => {
        const item = document.createElement('div');
        item.className = `standard-item ${bestJump >= standard.min && bestJump <= standard.max ? 'current' : ''}`;

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