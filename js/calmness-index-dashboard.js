// Calmness Index Dashboard JavaScript

let calmnessEntries = JSON.parse(localStorage.getItem('calmnessEntries')) || [];

// Weight factors for calmness score calculation
const WEIGHTS = {
    stress: 0.3,    // 30% - inverted (lower stress = higher score)
    sleep: 0.35,    // 35% - direct correlation
    mood: 0.35      // 35% - direct correlation
};

// Status thresholds for calmness scores
const STATUS_THRESHOLDS = {
    excellent: 85,
    good: 70,
    fair: 55,
    poor: 40,
    critical: 0
};

// Mindfulness recommendations based on score ranges
const RECOMMENDATIONS = {
    excellent: [
        "Continue your current mindfulness practices",
        "Consider sharing your techniques with others",
        "Maintain your sleep schedule and stress management"
    ],
    good: [
        "Try incorporating short meditation sessions",
        "Practice deep breathing exercises daily",
        "Maintain your current healthy habits"
    ],
    fair: [
        "Increase mindfulness activities like yoga or walking",
        "Consider journaling to process stress",
        "Focus on improving sleep quality"
    ],
    poor: [
        "Seek professional help if stress persists",
        "Practice daily relaxation techniques",
        "Consider lifestyle changes for better sleep"
    ],
    critical: [
        "Consult a mental health professional",
        "Prioritize self-care and rest",
        "Consider stress management therapy"
    ]
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDashboard();
    renderChart('week');
    updateInsights();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    // Event listeners
    document.getElementById('calmnessForm').addEventListener('submit', logEntry);

    // Range input listeners
    document.getElementById('stressLevel').addEventListener('input', updateRangeDisplay);
    document.getElementById('sleepQuality').addEventListener('input', updateRangeDisplay);
    document.getElementById('moodLevel').addEventListener('input', updateRangeDisplay);

    // Chart control listeners
    document.getElementById('viewWeek').addEventListener('click', () => switchChartView('week'));
    document.getElementById('viewMonth').addEventListener('click', () => switchChartView('month'));
    document.getElementById('viewAll').addEventListener('click', () => switchChartView('all'));

    // Initialize range displays
    updateRangeDisplay();
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

function updateRangeDisplay() {
    document.getElementById('stressValue').textContent = document.getElementById('stressLevel').value;
    document.getElementById('sleepValue').textContent = document.getElementById('sleepQuality').value;
    document.getElementById('moodValue').textContent = document.getElementById('moodLevel').value;
}

function logEntry(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        date: document.getElementById('logDate').value,
        stressLevel: parseInt(document.getElementById('stressLevel').value),
        sleepQuality: parseInt(document.getElementById('sleepQuality').value),
        sleepHours: parseFloat(document.getElementById('sleepHours').value) || null,
        moodLevel: parseInt(document.getElementById('moodLevel').value),
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    // Calculate calmness score
    entry.calmnessScore = calculateCalmnessScore(entry);

    // Check for duplicate date
    const existingIndex = calmnessEntries.findIndex(e => e.date === entry.date);
    if (existingIndex >= 0) {
        if (confirm('An entry for this date already exists. Replace it?')) {
            calmnessEntries[existingIndex] = entry;
        } else {
            return;
        }
    } else {
        calmnessEntries.push(entry);
    }

    localStorage.setItem('calmnessEntries', JSON.stringify(calmnessEntries));

    // Reset form
    document.getElementById('calmnessForm').reset();
    document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
    updateRangeDisplay();

    updateDashboard();
    renderChart('week');
    updateInsights();

    // Show success message
    alert('Entry logged successfully!');
}

function calculateCalmnessScore(entry) {
    // Stress is inverted (lower stress = higher score)
    const stressScore = (11 - entry.stressLevel) * 10; // 1-10 becomes 100-0

    // Sleep and mood are direct correlations
    const sleepScore = entry.sleepQuality * 10; // 1-10 becomes 10-100
    const moodScore = entry.moodLevel * 10; // 1-10 becomes 10-100

    // Weighted average
    const weightedScore = (
        stressScore * WEIGHTS.stress +
        sleepScore * WEIGHTS.sleep +
        moodScore * WEIGHTS.mood
    );

    return Math.round(weightedScore);
}

function getStatusFromScore(score) {
    if (score >= STATUS_THRESHOLDS.excellent) return { text: 'Excellent', class: 'excellent' };
    if (score >= STATUS_THRESHOLDS.good) return { text: 'Good', class: 'good' };
    if (score >= STATUS_THRESHOLDS.fair) return { text: 'Fair', class: 'fair' };
    if (score >= STATUS_THRESHOLDS.poor) return { text: 'Poor', class: 'poor' };
    return { text: 'Critical', class: 'critical' };
}

function updateDashboard() {
    if (calmnessEntries.length === 0) return;

    // Sort entries by date
    calmnessEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get latest entry
    const latest = calmnessEntries[calmnessEntries.length - 1];

    // Update current score display
    document.getElementById('currentScore').textContent = latest.calmnessScore;

    const status = getStatusFromScore(latest.calmnessScore);
    document.getElementById('currentStatus').textContent = status.text;
    document.getElementById('currentStatus').className = `metric-value status-${status.class}`;

    // Update score circle color
    const scoreCircle = document.getElementById('currentScoreCircle');
    const percentage = (latest.calmnessScore / 100) * 360;
    scoreCircle.style.background = `conic-gradient(var(--calmness-primary) 0% ${percentage}deg, var(--calmness-bg) ${percentage}deg 360deg)`;

    // Update last updated
    const lastUpdated = new Date(latest.timestamp).toLocaleDateString();
    document.getElementById('lastUpdated').textContent = lastUpdated;

    // Update factor breakdown
    updateFactorBreakdown(latest);

    // Update recent entries
    updateRecentEntries();
}

function updateFactorBreakdown(latest) {
    // Calculate individual factor contributions
    const stressScore = (11 - latest.stressLevel) * 10;
    const sleepScore = latest.sleepQuality * 10;
    const moodScore = latest.moodLevel * 10;

    // Calculate percentage contributions to final score
    const totalWeightedScore = latest.calmnessScore;
    const stressContribution = (stressScore * WEIGHTS.stress / totalWeightedScore) * 100;
    const sleepContribution = (sleepScore * WEIGHTS.sleep / totalWeightedScore) * 100;
    const moodContribution = (moodScore * WEIGHTS.mood / totalWeightedScore) * 100;

    document.getElementById('stressImpact').textContent = `${Math.round(stressContribution)}%`;
    document.getElementById('sleepImpact').textContent = `${Math.round(sleepContribution)}%`;
    document.getElementById('moodImpact').textContent = `${Math.round(moodContribution)}%`;
}

function updateRecentEntries() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '';

    if (calmnessEntries.length === 0) {
        entriesList.innerHTML = '<p class="no-data">No entries yet. Start logging your daily metrics!</p>';
        return;
    }

    // Show last 7 entries
    const recentEntries = calmnessEntries.slice(-7).reverse();

    recentEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'entry-item';

        const date = new Date(entry.date).toLocaleDateString();
        const status = getStatusFromScore(entry.calmnessScore);

        item.innerHTML = `
            <div class="entry-info">
                <div class="entry-date">${date}</div>
                <div class="entry-metrics">
                    Stress: ${entry.stressLevel}/10 |
                    Sleep: ${entry.sleepQuality}/10 |
                    Mood: ${entry.moodLevel}/10
                    ${entry.sleepHours ? ` | Hours: ${entry.sleepHours}` : ''}
                </div>
            </div>
            <div class="entry-score status-${status.class}">${entry.calmnessScore}</div>
        `;

        entriesList.appendChild(item);
    });
}

function switchChartView(view) {
    // Update button states
    document.querySelectorAll('.chart-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');

    renderChart(view);
}

function renderChart(view) {
    const canvas = document.getElementById('calmnessChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (calmnessEntries.length < 2) {
        ctx.fillStyle = 'var(--calmness-text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more entries to see calmness trends', width / 2, height / 2);
        return;
    }

    // Filter entries based on view
    let filteredEntries = calmnessEntries;
    const now = new Date();

    if (view === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredEntries = calmnessEntries.filter(e => new Date(e.date) >= weekAgo);
    } else if (view === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredEntries = calmnessEntries.filter(e => new Date(e.date) >= monthAgo);
    }

    // Sort by date
    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredEntries.length < 2) {
        ctx.fillStyle = 'var(--calmness-text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Not enough data for this time period', width / 2, height / 2);
        return;
    }

    // Draw line chart
    const maxScore = 100;
    const padding = 40;

    ctx.strokeStyle = 'var(--calmness-primary)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    filteredEntries.forEach((entry, index) => {
        const x = padding + (index / (filteredEntries.length - 1)) * (width - 2 * padding);
        const y = height - padding - (entry.calmnessScore / maxScore) * (height - 2 * padding);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw data points
        ctx.fillStyle = 'var(--calmness-primary)';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Add white border to points
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = 'var(--calmness-primary)';
        ctx.lineWidth = 3;
    });

    ctx.stroke();

    // Add grid lines
    ctx.strokeStyle = 'var(--calmness-border)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * (height - 2 * padding);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    ctx.setLineDash([]);

    // Add labels
    ctx.fillStyle = 'var(--calmness-text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Calmness Score Trend', width / 2, height - 10);
}

function updateInsights() {
    // Weekly trend analysis
    const weeklyTrend = analyzeWeeklyTrend();
    document.getElementById('weeklyTrend').textContent = weeklyTrend;

    // Update recommendations based on current score
    if (calmnessEntries.length > 0) {
        const latest = calmnessEntries[calmnessEntries.length - 1];
        const status = getStatusFromScore(latest.calmnessScore);
        const recommendations = RECOMMENDATIONS[status.class];

        const recElement = document.getElementById('recommendations');
        recElement.innerHTML = `<ul>${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>`;
    }
}

function analyzeWeeklyTrend() {
    if (calmnessEntries.length < 7) {
        return "Log at least 7 entries to see weekly trends.";
    }

    const recent = calmnessEntries.slice(-7);
    const avgRecent = recent.reduce((sum, entry) => sum + entry.calmnessScore, 0) / recent.length;

    const previous = calmnessEntries.slice(-14, -7);
    if (previous.length < 7) {
        return `Your average calmness score over the last 7 days is ${Math.round(avgRecent)}.`;
    }

    const avgPrevious = previous.reduce((sum, entry) => sum + entry.calmnessScore, 0) / previous.length;
    const change = avgRecent - avgPrevious;

    if (Math.abs(change) < 5) {
        return `Your calmness has been stable over the past week (average: ${Math.round(avgRecent)}).`;
    } else if (change > 0) {
        return `Your calmness has improved by ${Math.round(change)} points over the past week (average: ${Math.round(avgRecent)}).`;
    } else {
        return `Your calmness has decreased by ${Math.round(Math.abs(change))} points over the past week (average: ${Math.round(avgRecent)}). Consider reviewing your stress management techniques.`;
    }
}

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
});