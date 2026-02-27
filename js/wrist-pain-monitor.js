// Wrist Pain Monitor JavaScript

let painEntries = JSON.parse(localStorage.getItem('painEntries')) || [];

// Pain level descriptions
const PAIN_LEVELS = {
    1: 'Minimal',
    2: 'Mild',
    3: 'Slightly Uncomfortable',
    4: 'Uncomfortable',
    5: 'Moderate',
    6: 'Distressing',
    7: 'Intense',
    8: 'Severe',
    9: 'Very Severe',
    10: 'Worst Possible'
};

// Prevention tips
const PREVENTION_TIPS = [
    {
        title: 'Take Regular Breaks',
        text: 'Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.'
    },
    {
        title: 'Proper Posture',
        text: 'Keep your wrists in a neutral position and ensure your screen is at eye level.'
    },
    {
        title: 'Ergonomic Setup',
        text: 'Use an ergonomic keyboard and mouse, and ensure proper wrist support.'
    },
    {
        title: 'Stretching Exercises',
        text: 'Perform wrist stretches and exercises regularly to maintain flexibility.'
    },
    {
        title: 'Stay Hydrated',
        text: 'Proper hydration helps reduce inflammation and joint stiffness.'
    },
    {
        title: 'Monitor Usage',
        text: 'Be aware of your device usage patterns and take proactive breaks.'
    }
];

// Safety guidelines
const SAFETY_GUIDELINES = [
    {
        title: 'Persistent Pain',
        text: 'If pain persists for more than a few days despite rest, consult a healthcare professional.'
    },
    {
        title: 'Numbness or Tingling',
        text: 'Seek immediate medical attention if you experience numbness, tingling, or weakness.'
    },
    {
        title: 'Swelling or Redness',
        text: 'Medical evaluation is needed for any swelling, redness, or unusual symptoms.'
    },
    {
        title: 'Impact on Daily Activities',
        text: 'If wrist pain interferes with your daily activities, professional assessment is recommended.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
    renderGuidelines();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('painDate').value = today;

    // Event listeners
    document.getElementById('painForm').addEventListener('submit', logPainEntry);
    document.getElementById('painLevel').addEventListener('input', updatePainDisplay);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));

    // Initialize pain display
    updatePainDisplay();
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

function updatePainDisplay() {
    const pain = document.getElementById('painLevel').value;
    document.getElementById('painValue').textContent = pain;
    document.getElementById('painText').textContent = PAIN_LEVELS[pain];
}

function logPainEntry(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        date: document.getElementById('painDate').value,
        painLevel: parseInt(document.getElementById('painLevel').value),
        deviceUsage: parseFloat(document.getElementById('deviceUsage').value),
        activityType: document.getElementById('activityType').value,
        painLocation: document.getElementById('painLocation').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    painEntries.push(entry);
    localStorage.setItem('painEntries', JSON.stringify(painEntries));

    // Reset form
    document.getElementById('painForm').reset();
    document.getElementById('painDate').value = new Date().toISOString().split('T')[0];
    updatePainDisplay();

    updateDisplay();

    // Show success message
    alert('Pain entry logged successfully!');
}

function updateDisplay() {
    updateMetrics();
    updateHistory();
    updateChart();
    updatePrevention();
}

function updateMetrics() {
    const totalEntries = painEntries.length;
    document.getElementById('totalEntries').textContent = totalEntries;

    if (totalEntries > 0) {
        const totalPain = painEntries.reduce((sum, e) => sum + e.painLevel, 0);
        const avgPain = (totalPain / totalEntries).toFixed(1);
        document.getElementById('avgPainLevel').textContent = avgPain;

        const totalUsage = painEntries.reduce((sum, e) => sum + e.deviceUsage, 0);
        const avgUsage = (totalUsage / totalEntries).toFixed(1);
        document.getElementById('avgUsage').textContent = `${avgUsage} hrs`;

        // Calculate correlation between usage and pain
        const correlation = calculateCorrelation();
        document.getElementById('correlation').textContent = correlation;
    }
}

function calculateCorrelation() {
    if (painEntries.length < 2) return '--';

    const n = painEntries.length;
    const sumX = painEntries.reduce((sum, e) => sum + e.deviceUsage, 0);
    const sumY = painEntries.reduce((sum, e) => sum + e.painLevel, 0);
    const sumXY = painEntries.reduce((sum, e) => sum + e.deviceUsage * e.painLevel, 0);
    const sumX2 = painEntries.reduce((sum, e) => sum + e.deviceUsage * e.deviceUsage, 0);
    const sumY2 = painEntries.reduce((sum, e) => sum + e.painLevel * e.painLevel, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return '--';

    const correlation = numerator / denominator;
    const strength = Math.abs(correlation);

    if (strength < 0.3) return 'Weak';
    if (strength < 0.7) return 'Moderate';
    return 'Strong';
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'week') {
    const now = new Date();
    let filteredEntries = painEntries;

    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredEntries = painEntries.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredEntries = painEntries.filter(e => new Date(e.date) >= monthAgo);
    }

    // Sort by date descending
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('painHistory');
    historyList.innerHTML = '';

    if (filteredEntries.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No entries found for this period.</p>';
        return;
    }

    filteredEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(entry.date).toLocaleDateString();
        const painText = PAIN_LEVELS[entry.painLevel];

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-pain">Pain: ${entry.painLevel}/10</span>
                </div>
                <div class="history-details">
                    <span>Usage: ${entry.deviceUsage} hrs</span> |
                    <span>Activity: ${entry.activityType}</span> |
                    <span>Location: ${entry.painLocation || 'Not specified'}</span>
                    ${entry.notes ? `<br><em>${entry.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteEntry(${entry.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        painEntries = painEntries.filter(e => e.id !== id);
        localStorage.setItem('painEntries', JSON.stringify(painEntries));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('painChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (painEntries.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more entries to see correlations', width / 2, height / 2);
        return;
    }

    // Simple scatter plot for usage vs pain
    const entries = painEntries.slice(-20); // Last 20 entries
    const maxUsage = Math.max(...entries.map(e => e.deviceUsage));
    const maxPain = 10;

    ctx.fillStyle = 'var(--primary-color)';
    ctx.strokeStyle = 'var(--primary-color)';
    ctx.lineWidth = 1;

    entries.forEach(entry => {
        const x = (entry.deviceUsage / maxUsage) * (width - 40) + 20;
        const y = height - 20 - (entry.painLevel / maxPain) * (height - 40);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Add labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Device Usage (hrs)', width / 2, height - 5);
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Pain Level', 0, 0);
    ctx.restore();
}

function updatePrevention() {
    // Risk level assessment
    const recentEntries = painEntries.slice(-7); // Last 7 days
    const riskElement = document.getElementById('riskLevel');

    if (recentEntries.length >= 3) {
        const avgPain = recentEntries.reduce((sum, e) => sum + e.painLevel, 0) / recentEntries.length;
        const avgUsage = recentEntries.reduce((sum, e) => sum + e.deviceUsage, 0) / recentEntries.length;

        let riskLevel = 'Low';
        if (avgPain >= 7 || avgUsage >= 8) riskLevel = 'High';
        else if (avgPain >= 4 || avgUsage >= 6) riskLevel = 'Moderate';

        riskElement.innerHTML = `<p>Your current risk level is <strong>${riskLevel}</strong> based on recent usage and pain levels.</p>`;
    }

    // Break reminders
    const breakElement = document.getElementById('breakReminders');
    const todayEntries = painEntries.filter(e => e.date === new Date().toISOString().split('T')[0]);
    const todayUsage = todayEntries.reduce((sum, e) => sum + e.deviceUsage, 0);

    if (todayUsage >= 4) {
        breakElement.innerHTML = `<p>You've used devices for ${todayUsage} hours today. Consider taking a break soon.</p>`;
    } else {
        breakElement.innerHTML = `<p>Good job monitoring your usage. Keep up the awareness!</p>`;
    }

    // Ergonomic tips
    const ergonomicElement = document.getElementById('ergonomicTips');
    const highPainEntries = painEntries.filter(e => e.painLevel >= 6);
    if (highPainEntries.length > 0) {
        ergonomicElement.innerHTML = `<p>Consider adjusting your workspace setup to reduce strain on your wrists.</p>`;
    } else {
        ergonomicElement.innerHTML = `<p>Maintain proper wrist positioning during device use.</p>`;
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');
    tipsContainer.innerHTML = '';

    PREVENTION_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <div class="tip-icon">
                <i data-lucide="lightbulb"></i>
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

function renderGuidelines() {
    const guidelinesContainer = document.getElementById('guidelines');
    guidelinesContainer.innerHTML = '';

    SAFETY_GUIDELINES.forEach(guideline => {
        const guidelineElement = document.createElement('div');
        guidelineElement.className = 'guideline-item';
        guidelineElement.innerHTML = `
            <div class="guideline-icon">
                <i data-lucide="alert-triangle"></i>
            </div>
            <div class="guideline-content">
                <h4>${guideline.title}</h4>
                <p>${guideline.text}</p>
            </div>
        `;
        guidelinesContainer.appendChild(guidelineElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}