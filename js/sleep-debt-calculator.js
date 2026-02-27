// Sleep Debt Calculator JavaScript

let sleepEntries = JSON.parse(localStorage.getItem('sleepEntries')) || [];

// Sleep quality descriptions
const SLEEP_QUALITIES = {
    1: 'Terrible',
    2: 'Poor',
    3: 'Below Average',
    4: 'Fair',
    5: 'Average',
    6: 'Above Average',
    7: 'Good',
    8: 'Very Good',
    9: 'Excellent',
    10: 'Perfect'
};

// Recommended sleep by age group (hours)
const RECOMMENDED_SLEEP = {
    '18-25': 7-9,
    '26-35': 7-9,
    '36-45': 7-9,
    '46-55': 7-8,
    '56-65': 7-8,
    '65+': 7-8
};

// Sleep tips
const SLEEP_TIPS = [
    {
        title: 'Consistent Schedule',
        text: 'Go to bed and wake up at the same time every day, even on weekends.'
    },
    {
        title: 'Cool, Dark Room',
        text: 'Keep your bedroom cool (60-67°F) and dark for optimal sleep.'
    },
    {
        title: 'Limit Screen Time',
        text: 'Avoid screens at least 1 hour before bed to reduce blue light exposure.'
    },
    {
        title: 'No Caffeine After 2 PM',
        text: 'Caffeine can stay in your system for 6-8 hours, affecting sleep quality.'
    },
    {
        title: 'Exercise Regularly',
        text: 'Regular physical activity can help you fall asleep faster and sleep more deeply.'
    },
    {
        title: 'Relaxation Routine',
        text: 'Develop a pre-bedtime routine like reading or meditation to signal sleep time.'
    }
];

// Sleep guidelines
const SLEEP_GUIDELINES = [
    {
        title: 'Adults Need 7-9 Hours',
        text: 'Most adults require 7-9 hours of sleep per night for optimal health and performance.'
    },
    {
        title: 'Sleep Debt Accumulates',
        text: 'Missing sleep creates a "debt" that must be repaid through extra sleep or naps.'
    },
    {
        title: 'Quality Matters',
        text: 'Sleep quality is as important as quantity - uninterrupted, deep sleep is crucial.'
    },
    {
        title: 'Recovery Takes Time',
        text: 'It takes multiple nights of good sleep to fully recover from sleep deprivation.'
    },
    {
        title: 'Track Your Patterns',
        text: 'Monitor your sleep to identify factors that improve or disrupt your rest.'
    },
    {
        title: 'Prioritize Sleep',
        text: 'Make sleep a priority - it affects every aspect of your physical and mental health.'
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
    document.getElementById('sleepDate').value = today;

    // Set default times
    const now = new Date();
    const bedTime = new Date(now.getTime() - 8 * 60 * 60 * 1000); // 8 hours ago
    const wakeTime = now;

    document.getElementById('bedTime').value = bedTime.toTimeString().slice(0, 5);
    document.getElementById('wakeTime').value = wakeTime.toTimeString().slice(0, 5);

    // Event listeners
    document.getElementById('sleepForm').addEventListener('submit', logSleep);
    document.getElementById('sleepQuality').addEventListener('input', updateQualityDisplay);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));

    // Initialize quality display
    updateQualityDisplay();
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

function updateQualityDisplay() {
    const quality = document.getElementById('sleepQuality').value;
    document.getElementById('qualityValue').textContent = quality;
    document.getElementById('qualityText').textContent = SLEEP_QUALITIES[quality];
}

function logSleep(e) {
    e.preventDefault();

    const bedTime = document.getElementById('bedTime').value;
    const wakeTime = document.getElementById('wakeTime').value;
    const date = document.getElementById('sleepDate').value;

    // Calculate duration
    const bedDateTime = new Date(`${date}T${bedTime}`);
    const wakeDateTime = new Date(`${date}T${wakeTime}`);

    // Handle next day wake up
    if (wakeDateTime < bedDateTime) {
        wakeDateTime.setDate(wakeDateTime.getDate() + 1);
    }

    const durationMs = wakeDateTime - bedDateTime;
    const durationHours = durationMs / (1000 * 60 * 60);

    const entry = {
        id: Date.now(),
        date: date,
        bedTime: bedTime,
        wakeTime: wakeTime,
        duration: durationHours,
        quality: parseInt(document.getElementById('sleepQuality').value),
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    sleepEntries.push(entry);
    localStorage.setItem('sleepEntries', JSON.stringify(sleepEntries));

    // Reset form
    document.getElementById('sleepForm').reset();
    document.getElementById('sleepDate').value = new Date().toISOString().split('T')[0];
    updateQualityDisplay();

    updateDisplay();

    // Show success message
    alert('Sleep entry logged successfully!');
}

function updateDisplay() {
    updateDebtMetrics();
    updateHistory();
    updateChart();
    updateRecoverySuggestions();
}

function updateDebtMetrics() {
    if (sleepEntries.length === 0) return;

    // Calculate sleep debt
    const recommendedHours = 8; // Default recommended
    let totalDebt = 0;

    sleepEntries.forEach(entry => {
        const deficit = recommendedHours - entry.duration;
        if (deficit > 0) {
            totalDebt += deficit;
        }
    });

    document.getElementById('currentDebt').textContent = `${totalDebt.toFixed(1)} hrs`;

    // Weekly average
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = sleepEntries.filter(e => new Date(e.date) >= weekAgo);
    if (weekEntries.length > 0) {
        const weekAvg = weekEntries.reduce((sum, e) => sum + e.duration, 0) / weekEntries.length;
        document.getElementById('weeklyAvg').textContent = `${weekAvg.toFixed(1)} hrs`;
    }

    // Sleep score (average quality)
    const avgQuality = sleepEntries.reduce((sum, e) => sum + e.quality, 0) / sleepEntries.length;
    document.getElementById('sleepScore').textContent = avgQuality.toFixed(1);

    // Good sleep streak (consecutive days with >= 7 hours)
    let streak = 0;
    const sortedEntries = [...sleepEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const entry of sortedEntries) {
        if (entry.duration >= 7) {
            streak++;
        } else {
            break;
        }
    }

    document.getElementById('streak').textContent = `${streak} days`;

    // Update debt status
    updateDebtStatus(totalDebt);
}

function updateDebtStatus(debt) {
    const statusElement = document.getElementById('debtStatus');

    if (debt < 2) {
        statusElement.className = 'debt-status healthy';
        statusElement.innerHTML = '<h3>🟢 Healthy Sleep Status</h3><p>Your sleep debt is minimal. Keep up the good work!</p>';
    } else if (debt < 6) {
        statusElement.className = 'debt-status warning';
        statusElement.innerHTML = '<h3>🟡 Moderate Sleep Debt</h3><p>You have some sleep debt. Focus on getting more rest this week.</p>';
    } else {
        statusElement.className = 'debt-status danger';
        statusElement.innerHTML = '<h3>🔴 High Sleep Debt</h3><p>You have significant sleep debt. Prioritize recovery sleep and consider consulting a healthcare professional.</p>';
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
    let filteredEntries = sleepEntries;

    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredEntries = sleepEntries.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredEntries = sleepEntries.filter(e => new Date(e.date) >= monthAgo);
    }

    // Sort by date descending
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('sleepHistory');
    historyList.innerHTML = '';

    if (filteredEntries.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No sleep entries found for this period.</p>';
        return;
    }

    filteredEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(entry.date).toLocaleDateString();
        const duration = entry.duration.toFixed(1);
        const qualityText = SLEEP_QUALITIES[entry.quality];

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-duration">${duration} hrs</span>
                </div>
                <div class="history-details">
                    <span>Bed: ${entry.bedTime} | Wake: ${entry.wakeTime}</span><br>
                    <span>Quality: <strong class="history-quality">${entry.quality}/10 (${qualityText})</strong></span>
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
    if (confirm('Are you sure you want to delete this sleep entry?')) {
        sleepEntries = sleepEntries.filter(e => e.id !== id);
        localStorage.setItem('sleepEntries', JSON.stringify(sleepEntries));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('debtChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (sleepEntries.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more sleep entries to see trends', width / 2, height / 2);
        return;
    }

    // Simple line chart for sleep duration over time
    const entries = sleepEntries.slice(-14); // Last 14 entries
    const maxDuration = Math.max(...entries.map(e => e.duration), 10);
    const minDate = new Date(Math.min(...entries.map(e => new Date(e.date))));
    const maxDate = new Date(Math.max(...entries.map(e => new Date(e.date))));

    ctx.strokeStyle = 'var(--primary-color)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    entries.forEach((entry, index) => {
        const x = (index / (entries.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (entry.duration / maxDuration) * (height - 40);

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
    ctx.fillText('Recent Sleep Duration (hours)', width / 2, height - 5);
}

function updateRecoverySuggestions() {
    const recommendedHours = 8;
    const currentDebt = calculateCurrentDebt();

    // Recovery plan
    const recoveryElement = document.getElementById('recoveryPlan');
    if (currentDebt > 0) {
        const recoveryNights = Math.ceil(currentDebt / 2); // 2 hours extra per night
        recoveryElement.innerHTML = `<p>You need approximately ${recoveryNights} nights of 10+ hours sleep to clear your debt.</p>`;
    } else {
        recoveryElement.innerHTML = '<p>Your sleep debt is clear! Maintain your current sleep schedule.</p>';
    }

    // Tonight's goal
    const tonightElement = document.getElementById('tonightGoal');
    const tonightGoal = currentDebt > 0 ? Math.min(recommendedHours + 2, 10) : recommendedHours;
    tonightElement.innerHTML = `<p>Aim for ${tonightGoal} hours of sleep tonight to start reducing debt.</p>`;

    // Weekly target
    const weeklyElement = document.getElementById('weeklyTarget');
    const weekEntries = sleepEntries.slice(-7);
    const weekAvg = weekEntries.length > 0 ? weekEntries.reduce((sum, e) => sum + e.duration, 0) / weekEntries.length : 0;
    const weeklyTarget = Math.max(recommendedHours, weekAvg + 0.5);
    weeklyElement.innerHTML = `<p>Maintain an average of ${weeklyTarget.toFixed(1)} hours per night this week.</p>`;
}

function calculateCurrentDebt() {
    if (sleepEntries.length === 0) return 0;

    const recommendedHours = 8;
    let totalDebt = 0;

    sleepEntries.forEach(entry => {
        const deficit = recommendedHours - entry.duration;
        if (deficit > 0) {
            totalDebt += deficit;
        }
    });

    return totalDebt;
}

function renderTips() {
    const tipsContainer = document.getElementById('sleepTips');
    tipsContainer.innerHTML = '';

    SLEEP_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <div class="tip-icon">
                <i data-lucide="moon"></i>
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

    SLEEP_GUIDELINES.forEach(guideline => {
        const guidelineElement = document.createElement('div');
        guidelineElement.className = 'guideline-item';
        guidelineElement.innerHTML = `
            <div class="guideline-icon">
                <i data-lucide="info"></i>
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