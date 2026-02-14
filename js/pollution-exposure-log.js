// Pollution Exposure Log JavaScript

let exposureLogs = JSON.parse(localStorage.getItem('pollutionExposureLogs')) || [];

// Risk calculation constants
const RISK_THRESHOLDS = {
    LOW: { max: 25, label: 'Low Risk', color: '#48bb78' },
    MODERATE: { max: 50, label: 'Moderate Risk', color: '#ed8936' },
    HIGH: { max: 75, label: 'High Risk', color: '#f56565' },
    VERY_HIGH: { max: 100, label: 'Very High Risk', color: '#e53e3e' }
};

const AQI_CATEGORIES = {
    GOOD: { max: 50, multiplier: 1 },
    MODERATE: { max: 100, multiplier: 1.5 },
    UNHEALTHY_SENSITIVE: { max: 150, multiplier: 2 },
    UNHEALTHY: { max: 200, multiplier: 2.5 },
    VERY_UNHEALTHY: { max: 300, multiplier: 3 },
    HAZARDOUS: { max: 500, multiplier: 4 }
};

const ACTIVITY_MULTIPLIERS = {
    walking: 1.2,
    cycling: 1.5,
    commuting: 1.8,
    'outdoor-work': 2.0,
    recreation: 1.3,
    other: 1.0
};

// Health recommendations based on risk level
const HEALTH_RECOMMENDATIONS = {
    LOW: [
        { title: 'Maintain Good Habits', text: 'Continue monitoring your exposure and maintain healthy lifestyle choices.' },
        { title: 'Stay Active Outdoors', text: 'Current air quality supports outdoor activities. Enjoy your time outside!' }
    ],
    MODERATE: [
        { title: 'Reduce Outdoor Time', text: 'Limit prolonged outdoor activities, especially during peak pollution hours.' },
        { title: 'Use Protective Measures', text: 'Consider wearing masks during high-exposure activities.' },
        { title: 'Monitor Symptoms', text: 'Pay attention to any respiratory discomfort and consult a doctor if needed.' }
    ],
    HIGH: [
        { title: 'Minimize Outdoor Exposure', text: 'Stay indoors as much as possible during poor air quality periods.' },
        { title: 'Use Air Purifiers', text: 'Ensure indoor air quality with HEPA filters and air purifiers.' },
        { title: 'Protect Vulnerable Groups', text: 'Take extra precautions for children, elderly, and those with respiratory conditions.' },
        { title: 'Medical Consultation', text: 'Consult healthcare providers about your exposure and any health concerns.' }
    ],
    VERY_HIGH: [
        { title: 'Emergency Precautions', text: 'Avoid all non-essential outdoor activities immediately.' },
        { title: 'Indoor Air Quality', text: 'Seal windows, use air conditioning with clean filters, and avoid indoor pollution sources.' },
        { title: 'Health Monitoring', text: 'Monitor for symptoms like shortness of breath, chest pain, or fatigue.' },
        { title: 'Seek Medical Help', text: 'Contact healthcare providers if you experience any health issues.' }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeForm();
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
    const form = document.getElementById('exposureForm');
    form.addEventListener('submit', handleFormSubmit);
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

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
        id: Date.now(),
        date: document.getElementById('date').value,
        aqi: parseInt(document.getElementById('aqi').value),
        duration: parseFloat(document.getElementById('duration').value),
        activity: document.getElementById('activity').value,
        location: document.getElementById('location').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    // Check for duplicate date
    const existingEntry = exposureLogs.find(log => log.date === formData.date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to replace it?')) {
            return;
        }
        // Remove existing entry
        exposureLogs = exposureLogs.filter(log => log.id !== existingEntry.id);
    }

    exposureLogs.push(formData);
    saveLogs();
    updateAllDisplays();
    resetForm();

    // Show success message
    showNotification('Exposure logged successfully!', 'success');
}

// Save logs to localStorage
function saveLogs() {
    localStorage.setItem('pollutionExposureLogs', JSON.stringify(exposureLogs));
}

// Reset form
function resetForm() {
    document.getElementById('exposureForm').reset();
    setDefaultDate();
}

// Update all displays
function updateAllDisplays() {
    updateRiskScore();
    updateRiskFactors();
    updateHistory('week');
    updateImpactStats();
    updateRecommendations();
    updateChart();
}

// Calculate health risk score
function calculateRiskScore() {
    if (exposureLogs.length === 0) return 0;

    // Get last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogs = exposureLogs.filter(log => new Date(log.date) >= sevenDaysAgo);

    if (recentLogs.length === 0) return 0;

    let totalRisk = 0;

    recentLogs.forEach(log => {
        // Base risk from AQI
        let aqiRisk = 0;
        if (log.aqi <= 50) aqiRisk = log.aqi * 0.1;
        else if (log.aqi <= 100) aqiRisk = 5 + (log.aqi - 50) * 0.2;
        else if (log.aqi <= 150) aqiRisk = 15 + (log.aqi - 100) * 0.3;
        else if (log.aqi <= 200) aqiRisk = 30 + (log.aqi - 150) * 0.4;
        else aqiRisk = 50 + (log.aqi - 200) * 0.5;

        // Activity multiplier
        const activityMultiplier = ACTIVITY_MULTIPLIERS[log.activity] || 1.0;

        // Duration factor
        const durationFactor = Math.min(log.duration / 8, 2); // Cap at 2 for 16+ hours

        totalRisk += aqiRisk * activityMultiplier * durationFactor;
    });

    // Average over the period
    const avgRisk = totalRisk / recentLogs.length;

    // Normalize to 0-100 scale
    return Math.min(Math.max(avgRisk, 0), 100);
}

// Update risk score display
function updateRiskScore() {
    const score = calculateRiskScore();
    const scoreElement = document.getElementById('currentRiskScore');
    const levelElement = document.getElementById('riskLevel');
    const descElement = document.getElementById('riskDescription');

    scoreElement.textContent = Math.round(score);

    let riskLevel, description;
    if (score <= 25) {
        riskLevel = 'Low Risk';
        description = 'Your recent exposure levels are within safe limits.';
    } else if (score <= 50) {
        riskLevel = 'Moderate Risk';
        description = 'Consider reducing outdoor activities during poor air quality.';
    } else if (score <= 75) {
        riskLevel = 'High Risk';
        description = 'Take precautions to minimize pollution exposure.';
    } else {
        riskLevel = 'Very High Risk';
        description = 'Immediate action recommended to reduce health risks.';
    }

    levelElement.textContent = riskLevel;
    descElement.textContent = description;
}

// Update risk factors
function updateRiskFactors() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogs = exposureLogs.filter(log => new Date(log.date) >= sevenDaysAgo);

    const factors = [];

    // Average AQI
    if (recentLogs.length > 0) {
        const avgAQI = recentLogs.reduce((sum, log) => sum + log.aqi, 0) / recentLogs.length;
        factors.push({ label: 'Average AQI', value: Math.round(avgAQI) });
    }

    // Total exposure hours
    const totalHours = recentLogs.reduce((sum, log) => sum + log.duration, 0);
    factors.push({ label: 'Total Hours Exposed', value: `${totalHours.toFixed(1)}h` });

    // High exposure days
    const highExposureDays = recentLogs.filter(log => log.aqi > 100).length;
    factors.push({ label: 'High Pollution Days', value: highExposureDays });

    // Most common activity
    const activityCount = {};
    recentLogs.forEach(log => {
        activityCount[log.activity] = (activityCount[log.activity] || 0) + 1;
    });
    const mostCommonActivity = Object.keys(activityCount).reduce((a, b) =>
        activityCount[a] > activityCount[b] ? a : b, '');
    if (mostCommonActivity) {
        factors.push({ label: 'Primary Activity', value: mostCommonActivity.replace('-', ' ') });
    }

    const factorsList = document.getElementById('riskFactors');
    factorsList.innerHTML = factors.map(factor =>
        `<div class="factor-item">
            <span class="factor-label">${factor.label}</span>
            <span class="factor-value">${factor.value}</span>
        </div>`
    ).join('');
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
    let filteredLogs = [...exposureLogs];

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

    const historyList = document.getElementById('exposureHistory');
    historyList.innerHTML = filteredLogs.map(log => `
        <div class="history-item">
            <div class="history-date">${formatDate(log.date)}</div>
            <div class="history-details">
                <div class="history-aqi">AQI: ${log.aqi}</div>
                <div class="history-duration">${log.duration}h</div>
                <div class="history-activity">${log.activity.replace('-', ' ')}</div>
            </div>
        </div>
    `).join('');
}

// Update impact stats
function updateImpactStats() {
    const totalDays = exposureLogs.length;
    const totalHours = exposureLogs.reduce((sum, log) => sum + log.duration, 0);
    const avgAQI = totalDays > 0 ?
        exposureLogs.reduce((sum, log) => sum + log.aqi, 0) / totalDays : 0;

    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('avgAQI').textContent = Math.round(avgAQI);
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
}

// Update health recommendations
function updateRecommendations() {
    const score = calculateRiskScore();
    let recommendations;

    if (score <= 25) recommendations = HEALTH_RECOMMENDATIONS.LOW;
    else if (score <= 50) recommendations = HEALTH_RECOMMENDATIONS.MODERATE;
    else if (score <= 75) recommendations = HEALTH_RECOMMENDATIONS.HIGH;
    else recommendations = HEALTH_RECOMMENDATIONS.VERY_HIGH;

    const recommendationsGrid = document.getElementById('recommendations');
    recommendationsGrid.innerHTML = recommendations.map(rec =>
        `<div class="recommendation-card ${score > 50 ? 'high-risk' : score > 25 ? 'medium-risk' : ''}">
            <div class="recommendation-title">${rec.title}</div>
            <div class="recommendation-text">${rec.text}</div>
        </div>`
    ).join('');
}

// Update chart (simplified version)
function updateChart() {
    // This would require Chart.js or similar library
    // For now, just show a placeholder
    const chartCanvas = document.getElementById('exposureChart');
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    // Simple bar chart placeholder
    ctx.fillStyle = '#4299e1';
    ctx.fillRect(10, 10, 50, 100);
    ctx.fillRect(70, 10, 50, 80);
    ctx.fillRect(130, 10, 50, 120);
    ctx.fillRect(190, 10, 50, 90);
    ctx.fillRect(250, 10, 50, 110);

    // Add text
    ctx.fillStyle = '#1a202c';
    ctx.font = '12px Arial';
    ctx.fillText('Exposure Trend (Last 5 Days)', 10, 140);
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