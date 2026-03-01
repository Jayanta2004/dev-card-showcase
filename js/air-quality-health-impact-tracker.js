// Air Quality Health Impact Tracker JavaScript

let exposureSessions = JSON.parse(localStorage.getItem('airQualitySessions')) || [];

// AQI Categories based on EPA standards
const AQI_CATEGORIES = [
    {
        level: 'Good',
        range: '0-50',
        min: 0,
        max: 50,
        color: 'aqi-good',
        description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
        health: 'No health impacts expected for the general population.'
    },
    {
        level: 'Moderate',
        range: '51-100',
        min: 51,
        max: 100,
        color: 'aqi-moderate',
        description: 'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people.',
        health: 'Unusually sensitive individuals may experience respiratory symptoms.'
    },
    {
        level: 'Unhealthy for Sensitive Groups',
        range: '101-150',
        min: 101,
        max: 150,
        color: 'aqi-unhealthy-sensitive',
        description: 'Members of sensitive groups may experience health effects.',
        health: 'Increasing likelihood of respiratory symptoms in sensitive individuals.'
    },
    {
        level: 'Unhealthy',
        range: '151-200',
        min: 151,
        max: 200,
        color: 'aqi-unhealthy',
        description: 'Everyone may begin to experience health effects.',
        health: 'Greater chance of respiratory symptoms and reduced lung function.'
    },
    {
        level: 'Very Unhealthy',
        range: '201-300',
        min: 201,
        max: 300,
        color: 'aqi-very-unhealthy',
        description: 'Health alert: everyone may experience more serious health effects.',
        health: 'Significant increase in respiratory symptoms and lung function impairment.'
    },
    {
        level: 'Hazardous',
        range: '301-500',
        min: 301,
        max: 500,
        color: 'aqi-hazardous',
        description: 'Health warnings of emergency conditions.',
        health: 'Serious risk of respiratory problems. Everyone should avoid outdoor activities.'
    }
];

// Health tips for different AQI levels
const HEALTH_TIPS = [
    {
        title: 'Monitor Local AQI',
        text: 'Check air quality index daily from reliable sources like EPA or local environmental agencies.'
    },
    {
        title: 'Limit Outdoor Activities',
        text: 'On high AQI days, reduce time spent outdoors, especially during peak pollution hours.'
    },
    {
        title: 'Use Air Purifiers',
        text: 'Consider using HEPA air purifiers indoors, especially in bedrooms and living areas.'
    },
    {
        title: 'Wear Protective Masks',
        text: 'Use N95 or similar masks when outdoors on moderate to unhealthy air quality days.'
    },
    {
        title: 'Track Your Symptoms',
        text: 'Keep a log of respiratory symptoms to identify patterns and triggers.'
    },
    {
        title: 'Stay Hydrated',
        text: 'Drink plenty of water to help your respiratory system clear pollutants.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
    renderCategories();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    // Event listeners
    document.getElementById('exposureForm').addEventListener('submit', logExposure);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
}

function logExposure(e) {
    e.preventDefault();

    const logDate = document.getElementById('logDate').value;
    const aqiLevel = parseInt(document.getElementById('aqiLevel').value);
    const symptomSeverity = parseInt(document.getElementById('symptomSeverity').value);

    // Get selected symptoms
    const symptoms = [];
    const symptomCheckboxes = document.querySelectorAll('.symptom-checkbox input[type="checkbox"]');
    symptomCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            symptoms.push(checkbox.id);
        }
    });

    const notes = document.getElementById('notes').value.trim();

    if (!logDate || isNaN(aqiLevel)) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingIndex = exposureSessions.findIndex(s => s.date === logDate);
    if (existingIndex !== -1) {
        if (!confirm('An entry already exists for this date. Update it?')) {
            return;
        }
        exposureSessions.splice(existingIndex, 1);
    }

    const session = {
        id: Date.now(),
        date: logDate,
        aqiLevel: aqiLevel,
        symptoms: symptoms,
        symptomSeverity: symptomSeverity,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    exposureSessions.push(session);
    localStorage.setItem('airQualitySessions', JSON.stringify(exposureSessions));

    // Reset form
    document.getElementById('exposureForm').reset();
    document.getElementById('logDate').value = new Date().toISOString().split('T')[0];

    // Uncheck all symptom checkboxes
    symptomCheckboxes.forEach(checkbox => checkbox.checked = false);

    updateDisplay();
    showNotification('Air quality exposure logged successfully!', 'success');
}

function updateDisplay() {
    updateMetrics();
    updateChart();
    updateHistory();
    updateInsights();
}

function updateMetrics() {
    if (exposureSessions.length === 0) {
        document.getElementById('currentAQI').textContent = '0';
        document.getElementById('avgAQI').textContent = '--';
        document.getElementById('symptomDays').textContent = '0';
        document.getElementById('correlation').textContent = '--';
        return;
    }

    // Get today's AQI if exists
    const today = new Date().toISOString().split('T')[0];
    const todaySession = exposureSessions.find(s => s.date === today);
    const currentAQI = todaySession ? todaySession.aqiLevel : 0;

    // Calculate 7-day average AQI
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = exposureSessions.filter(s => new Date(s.date) >= sevenDaysAgo);
    const avgAQI = recentSessions.length > 0 ?
        Math.round(recentSessions.reduce((sum, s) => sum + s.aqiLevel, 0) / recentSessions.length) : 0;

    // Count days with symptoms
    const symptomDays = exposureSessions.filter(s => s.symptoms.length > 0).length;

    // Calculate correlation (simplified)
    const correlation = calculateCorrelation();

    document.getElementById('currentAQI').textContent = currentAQI;
    document.getElementById('avgAQI').textContent = avgAQI > 0 ? avgAQI : '--';
    document.getElementById('symptomDays').textContent = symptomDays;
    document.getElementById('correlation').textContent = correlation !== null ? correlation.toFixed(2) : '--';
}

function calculateCorrelation() {
    if (exposureSessions.length < 3) return null;

    const data = exposureSessions.map(s => ({
        aqi: s.aqiLevel,
        symptoms: s.symptoms.length > 0 ? 1 : 0
    }));

    // Simple correlation calculation
    const n = data.length;
    const sumAQI = data.reduce((sum, d) => sum + d.aqi, 0);
    const sumSymptoms = data.reduce((sum, d) => sum + d.symptoms, 0);
    const sumAQISymptoms = data.reduce((sum, d) => sum + (d.aqi * d.symptoms), 0);
    const sumAQISquared = data.reduce((sum, d) => sum + (d.aqi * d.aqi), 0);
    const sumSymptomsSquared = data.reduce((sum, d) => sum + (d.symptoms * d.symptoms), 0);

    const numerator = (n * sumAQISymptoms) - (sumAQI * sumSymptoms);
    const denominator = Math.sqrt(((n * sumAQISquared) - (sumAQI * sumAQI)) * ((n * sumSymptomsSquared) - (sumSymptoms * sumSymptoms)));

    return denominator === 0 ? 0 : numerator / denominator;
}

function updateChart() {
    const ctx = document.getElementById('aqiChart').getContext('2d');

    // Sort sessions by date
    const sortedSessions = [...exposureSessions].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedSessions.map(s => new Date(s.date).toLocaleDateString());
    const aqiData = sortedSessions.map(s => s.aqiLevel);
    const symptomData = sortedSessions.map(s => s.symptoms.length);

    if (window.aqiChart) {
        window.aqiChart.destroy();
    }

    window.aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'AQI Level',
                data: aqiData,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Symptoms Count',
                data: symptomData,
                borderColor: 'rgba(245, 158, 11, 1)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `AQI: ${context.parsed.y}`;
                            } else {
                                return `Symptoms: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'AQI Level'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Symptoms Count'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

function updateHistory(filter = 'all') {
    const historyContainer = document.getElementById('healthHistory');
    let filteredSessions = [...exposureSessions];

    const now = new Date();
    if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = exposureSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredSessions = exposureSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Sort by date descending
    filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyContainer.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No air quality logs found for this period.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const aqiCategory = getAQICategory(session.aqiLevel);
        const symptomNames = session.symptoms.map(s => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(', ');

        historyItem.innerHTML = `
            <div class="history-date">${new Date(session.date).toLocaleDateString()}</div>
            <div class="history-details">
                <div class="history-aqi ${aqiCategory ? aqiCategory.color : ''}">${session.aqiLevel}</div>
                <div class="history-symptoms">${symptomNames || 'No symptoms'}</div>
                <div class="history-severity">Severity: ${session.symptomSeverity}/10</div>
                ${session.notes ? `<div class="history-notes">${session.notes}</div>` : ''}
            </div>
        `;

        historyContainer.appendChild(historyItem);
    });
}

function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function getAQICategory(aqi) {
    return AQI_CATEGORIES.find(category => aqi >= category.min && aqi <= category.max);
}

function updateInsights() {
    updateAirQualityStatus();
    updateSymptomPatterns();
    updateHealthRecommendations();
}

function updateAirQualityStatus() {
    const statusContainer = document.getElementById('airQualityStatus');

    if (exposureSessions.length === 0) {
        statusContainer.innerHTML = '<p>Log your air quality exposure to see status assessment.</p>';
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const todaySession = exposureSessions.find(s => s.date === today);

    if (!todaySession) {
        statusContainer.innerHTML = '<p>No data for today. Log today\'s AQI to get status.</p>';
        return;
    }

    const category = getAQICategory(todaySession.aqiLevel);
    if (category) {
        statusContainer.innerHTML = `
            <p><strong class="${category.color}">${category.level}</strong></p>
            <p>${category.description}</p>
            <p><em>${category.health}</em></p>
        `;
    }
}

function updateSymptomPatterns() {
    const patternsContainer = document.getElementById('symptomPatterns');

    if (exposureSessions.length < 3) {
        patternsContainer.innerHTML = '<p>Log more entries to identify symptom patterns.</p>';
        return;
    }

    // Find most common symptoms
    const allSymptoms = exposureSessions.flatMap(s => s.symptoms);
    const symptomCounts = {};
    allSymptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });

    const topSymptoms = Object.entries(symptomCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([symptom]) => symptom.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));

    if (topSymptoms.length > 0) {
        patternsContainer.innerHTML = `<p>Your most common symptoms: ${topSymptoms.join(', ')}</p>`;
    } else {
        patternsContainer.innerHTML = '<p>No symptoms reported in recent logs.</p>';
    }
}

function updateHealthRecommendations() {
    const recommendationsContainer = document.getElementById('healthRecommendations');

    if (exposureSessions.length === 0) {
        recommendationsContainer.innerHTML = '<p>Complete air quality logs to get health recommendations.</p>';
        return;
    }

    const recentSessions = exposureSessions.slice(-7); // Last 7 days
    const avgAQI = recentSessions.reduce((sum, s) => sum + s.aqiLevel, 0) / recentSessions.length;
    const highAQIDays = recentSessions.filter(s => s.aqiLevel > 100).length;

    let recommendation = '';

    if (avgAQI > 150) {
        recommendation = 'High pollution levels detected. Consider staying indoors, using air purifiers, and wearing masks when outdoors.';
    } else if (avgAQI > 100) {
        recommendation = 'Moderate pollution levels. Limit outdoor activities, especially if you have respiratory conditions.';
    } else if (highAQIDays > 3) {
        recommendation = 'Several high pollution days recently. Monitor your symptoms closely and consider air quality improvement strategies.';
    } else {
        recommendation = 'Air quality generally good. Continue monitoring and maintain healthy respiratory habits.';
    }

    recommendationsContainer.innerHTML = `<p>${recommendation}</p>`;
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');

    HEALTH_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <h4>${tip.title}</h4>
            <p>${tip.text}</p>
        `;
        tipsContainer.appendChild(tipElement);
    });
}

function renderCategories() {
    const categoriesContainer = document.getElementById('categories');

    AQI_CATEGORIES.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <h3 class="${category.color}">${category.level}</h3>
            <div class="range">${category.range}</div>
            <p>${category.description}</p>
            <p><strong>Health Impact:</strong> ${category.health}</p>
        `;
        categoriesContainer.appendChild(categoryElement);
    });
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function showNotification(message, type = 'info') {
    // Simple notification - you could enhance this
    alert(message);
}