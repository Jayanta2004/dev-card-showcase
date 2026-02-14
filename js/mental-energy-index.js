// Mental Energy Index JavaScript

let energyLogs = JSON.parse(localStorage.getItem('mentalEnergyLogs')) || [];

// Energy level descriptions
const ENERGY_LEVELS = {
    1: 'Exhausted',
    2: 'Very Low',
    3: 'Low',
    4: 'Below Average',
    5: 'Moderate',
    6: 'Above Average',
    7: 'Good',
    8: 'High',
    9: 'Very High',
    10: 'Peak'
};

// Productivity insights based on energy patterns
const PRODUCTIVITY_INSIGHTS = {
    peakDays: [
        'Your energy peaks suggest optimal work times',
        'Consider scheduling important tasks during high-energy periods',
        'Track what activities correlate with your peak energy days'
    ],
    recovery: [
        'Good recovery indicates healthy mental stamina',
        'Evening energy dropping suggests need for better rest',
        'Consistent energy levels show balanced lifestyle',
        'Large morning-evening gaps indicate fatigue accumulation'
    ],
    patterns: [
        'Weekly patterns help predict energy cycles',
        'Identify factors that boost or drain your energy',
        'Use patterns to optimize your schedule',
        'Track how different activities affect your energy'
    ],
    recommendations: [
        'Prioritize sleep for better morning energy',
        'Incorporate regular breaks during work sessions',
        'Exercise and nutrition significantly impact mental energy',
        'Limit multitasking to preserve cognitive resources'
    ]
};

// Energy tips based on current levels
const ENERGY_TIPS = {
    high: [
        { title: 'Capitalize on Peak Energy', text: 'Use this high-energy period for complex tasks requiring focus and creativity.' },
        { title: 'Maintain Momentum', text: 'Continue with challenging projects while your mental stamina is strong.' },
        { title: 'Plan for Later', text: 'Schedule demanding tasks during your identified peak energy times.' }
    ],
    moderate: [
        { title: 'Steady Progress', text: 'Good time for consistent work and routine tasks.' },
        { title: 'Break Complex Tasks', text: 'Divide challenging work into smaller, manageable segments.' },
        { title: 'Mindful Breaks', text: 'Take short breaks to maintain focus and prevent fatigue.' }
    ],
    low: [
        { title: 'Rest and Recovery', text: 'Consider taking a break or switching to low-energy tasks.' },
        { title: 'Simple Tasks Only', text: 'Focus on routine, low-complexity activities.' },
        { title: 'Recharge Strategies', text: 'Try short walks, hydration, or brief meditation to boost energy.' },
        { title: 'Avoid Overexertion', text: 'Postpone demanding work until energy levels improve.' }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeForm();
    initializeSliders();
    initializeHistoryControls();
    setDefaultDate();
    updateAllDisplays();
    lucide.createIcons();
});

// Initialize navbar
function initializeNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

// Initialize form
function initializeForm() {
    const form = document.getElementById('energyForm');
    form.addEventListener('submit', handleFormSubmit);
}

// Initialize sliders
function initializeSliders() {
    const morningSlider = document.getElementById('morningEnergy');
    const eveningSlider = document.getElementById('eveningEnergy');

    morningSlider.addEventListener('input', () => updateRatingDisplay('morning'));
    eveningSlider.addEventListener('input', () => updateRatingDisplay('evening'));

    // Initial display
    updateRatingDisplay('morning');
    updateRatingDisplay('evening');
}

// Initialize history controls
function initializeHistoryControls() {
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Update rating display
function updateRatingDisplay(type) {
    const slider = document.getElementById(`${type}Energy`);
    const valueElement = document.getElementById(`${type}Value`);
    const textElement = document.getElementById(`${type}Text`);

    const value = parseInt(slider.value);
    valueElement.textContent = value;
    textElement.textContent = ENERGY_LEVELS[value];
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
        id: Date.now(),
        date: document.getElementById('date').value,
        morningEnergy: parseInt(document.getElementById('morningEnergy').value),
        eveningEnergy: parseInt(document.getElementById('eveningEnergy').value),
        factors: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    // Check for duplicate date
    const existingEntry = energyLogs.find(log => log.date === formData.date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to replace it?')) {
            return;
        }
        // Remove existing entry
        energyLogs = energyLogs.filter(log => log.id !== existingEntry.id);
    }

    energyLogs.push(formData);
    saveLogs();
    updateAllDisplays();
    resetForm();

    // Show success message
    showNotification('Energy levels logged successfully!', 'success');
}

// Save logs to localStorage
function saveLogs() {
    localStorage.setItem('mentalEnergyLogs', JSON.stringify(energyLogs));
}

// Reset form
function resetForm() {
    document.getElementById('energyForm').reset();
    setDefaultDate();
    updateRatingDisplay('morning');
    updateRatingDisplay('evening');
}

// Update all displays
function updateAllDisplays() {
    updateDashboard();
    updateHistory('week');
    updateInsights();
    updateTips();
    updateChart();
}

// Update dashboard metrics
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = energyLogs.find(log => log.date === today);

    // Today's energy (average of morning and evening)
    if (todayEntry) {
        const avgEnergy = Math.round((todayEntry.morningEnergy + todayEntry.eveningEnergy) / 2);
        document.getElementById('currentEnergy').textContent = `${avgEnergy * 10}%`;
    } else {
        document.getElementById('currentEnergy').textContent = '--';
    }

    // 7-day average
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = energyLogs.filter(log => new Date(log.date) >= sevenDaysAgo);

    if (recentLogs.length > 0) {
        const avgEnergy = recentLogs.reduce((sum, log) => sum + (log.morningEnergy + log.eveningEnergy) / 2, 0) / recentLogs.length;
        document.getElementById('weekAverage').textContent = `${Math.round(avgEnergy * 10)}%`;
    } else {
        document.getElementById('weekAverage').textContent = '--';
    }

    // Trend calculation
    if (recentLogs.length >= 2) {
        const sortedLogs = recentLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
        const recent = sortedLogs.slice(-3); // Last 3 entries
        const older = sortedLogs.slice(-6, -3); // Previous 3 entries

        if (older.length > 0) {
            const recentAvg = recent.reduce((sum, log) => sum + (log.morningEnergy + log.eveningEnergy) / 2, 0) / recent.length;
            const olderAvg = older.reduce((sum, log) => sum + (log.morningEnergy + log.eveningEnergy) / 2, 0) / older.length;

            const trend = recentAvg - olderAvg;
            if (trend > 0.5) {
                document.getElementById('energyTrend').textContent = '↗️ Improving';
            } else if (trend < -0.5) {
                document.getElementById('energyTrend').textContent = '↘️ Declining';
            } else {
                document.getElementById('energyTrend').textContent = '➡️ Stable';
            }
        } else {
            document.getElementById('energyTrend').textContent = '--';
        }
    } else {
        document.getElementById('energyTrend').textContent = '--';
    }
}

// Filter and update history
function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

// Update history display
function updateHistory(period) {
    let filteredLogs = [...energyLogs];

    const now = new Date();
    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= monthAgo);
    }

    // Sort by date descending
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('energyHistory');
    historyList.innerHTML = filteredLogs.map(log => `
        <div class="history-item">
            <div class="history-date">${formatDate(log.date)}</div>
            <div class="history-details">
                <div class="history-energies">
                    <div class="history-morning">
                        <div class="history-label">AM</div>
                        <div class="history-value">${log.morningEnergy}</div>
                    </div>
                    <div class="history-evening">
                        <div class="history-label">PM</div>
                        <div class="history-value">${log.eveningEnergy}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update productivity insights
function updateInsights() {
    // Peak days analysis
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = energyLogs.filter(log => new Date(log.date) >= sevenDaysAgo);

    if (recentLogs.length > 0) {
        const avgEnergies = recentLogs.map(log => (log.morningEnergy + log.eveningEnergy) / 2);
        const peakThreshold = Math.max(...avgEnergies) * 0.8;
        const peakDays = recentLogs.filter(log => (log.morningEnergy + log.eveningEnergy) / 2 >= peakThreshold).length;

        document.getElementById('peakDays').innerHTML = `
            <p>You had ${peakDays} high-energy days this week.</p>
            <p>${PRODUCTIVITY_INSIGHTS.peakDays[Math.floor(Math.random() * PRODUCTIVITY_INSIGHTS.peakDays.length)]}</p>
        `;
    }

    // Recovery rate
    if (recentLogs.length > 0) {
        const recoveryRates = recentLogs.map(log => {
            const morning = log.morningEnergy;
            const evening = log.eveningEnergy;
            return evening >= morning ? 'good' : 'poor';
        });
        const goodRecovery = recoveryRates.filter(r => r === 'good').length;

        document.getElementById('recoveryRate').innerHTML = `
            <p>${goodRecovery}/${recentLogs.length} days showed good energy recovery.</p>
            <p>${PRODUCTIVITY_INSIGHTS.recovery[Math.floor(Math.random() * PRODUCTIVITY_INSIGHTS.recovery.length)]}</p>
        `;
    }

    // Weekly patterns
    document.getElementById('weeklyPatterns').innerHTML = `
        <p>Tracking your energy fluctuations over time.</p>
        <p>${PRODUCTIVITY_INSIGHTS.patterns[Math.floor(Math.random() * PRODUCTIVITY_INSIGHTS.patterns.length)]}</p>
    `;

    // Recommendations
    document.getElementById('recommendations').innerHTML = `
        <p>Personalized tips based on your energy patterns.</p>
        <p>${PRODUCTIVITY_INSIGHTS.recommendations[Math.floor(Math.random() * PRODUCTIVITY_INSIGHTS.recommendations.length)]}</p>
    `;
}

// Update energy tips
function updateTips() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = energyLogs.find(log => log.date === today);

    let tips;
    if (todayEntry) {
        const avgEnergy = (todayEntry.morningEnergy + todayEntry.eveningEnergy) / 2;
        if (avgEnergy >= 7) tips = ENERGY_TIPS.high;
        else if (avgEnergy >= 4) tips = ENERGY_TIPS.moderate;
        else tips = ENERGY_TIPS.low;
    } else {
        tips = ENERGY_TIPS.moderate; // Default tips
    }

    const tipsGrid = document.getElementById('energyTips');
    tipsGrid.innerHTML = tips.map(tip => `
        <div class="energy-tip ${getTipClass(tip)}">
            <div class="energy-tip-title">${tip.title}</div>
            <div class="energy-tip-text">${tip.text}</div>
        </div>
    `).join('');
}

// Get tip class based on content
function getTipClass(tip) {
    if (tip.title.includes('Peak') || tip.title.includes('Capitalize')) return 'high-energy';
    if (tip.title.includes('Rest') || tip.title.includes('Recovery')) return 'low-energy';
    return '';
}

// Update chart (simplified version)
function updateChart() {
    // This would require Chart.js or similar library
    // For now, just show a placeholder
    const chartCanvas = document.getElementById('energyChart');
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    // Simple line chart placeholder
    ctx.strokeStyle = '#805ad5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 200);
    ctx.lineTo(80, 150);
    ctx.lineTo(140, 180);
    ctx.lineTo(200, 120);
    ctx.lineTo(260, 160);
    ctx.stroke();

    // Add text
    ctx.fillStyle = '#1a202c';
    ctx.font = '12px Arial';
    ctx.fillText('Energy Trend (Last 5 Days)', 20, 20);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type) {
    // Simple notification - could be enhanced with a proper notification system
    alert(message);
}