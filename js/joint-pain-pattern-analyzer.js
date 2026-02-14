// Joint Pain Pattern Analyzer JavaScript

let painEntries = JSON.parse(localStorage.getItem('jointPainEntries')) || [];

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

// Activity level descriptions
const ACTIVITY_LEVELS = {
    1: 'Sedentary',
    2: 'Light',
    3: 'Light-Moderate',
    4: 'Moderate',
    5: 'Moderate',
    6: 'Moderate-High',
    7: 'High',
    8: 'Very High',
    9: 'Intense',
    10: 'Maximum'
};

// Recommendations based on patterns
const RECOMMENDATIONS = [
    {
        title: 'Weather-Related Pain',
        text: 'Consider indoor activities during cold or humid weather if patterns show correlation.'
    },
    {
        title: 'Activity Modification',
        text: 'Reduce high-impact activities if pain increases with activity level.'
    },
    {
        title: 'Posture Awareness',
        text: 'Maintain proper posture during activities that trigger pain episodes.'
    },
    {
        title: 'Joint Protection',
        text: 'Use supportive devices or braces during activities that strain affected joints.'
    },
    {
        title: 'Regular Movement',
        text: 'Incorporate gentle joint mobility exercises to maintain range of motion.'
    },
    {
        title: 'Rest Periods',
        text: 'Allow adequate rest between activities to prevent overuse injuries.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderRecommendations();
});

function initializeApp() {
    // Set default datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('painDate').value = now.toISOString().slice(0, 16);

    // Event listeners
    document.getElementById('painForm').addEventListener('submit', logPainEntry);
    document.getElementById('painLevel').addEventListener('input', updatePainDisplay);
    document.getElementById('activityLevel').addEventListener('input', updateActivityDisplay);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));

    // Initialize displays
    updatePainDisplay();
    updateActivityDisplay();
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

function updateActivityDisplay() {
    const activity = document.getElementById('activityLevel').value;
    document.getElementById('activityValue').textContent = activity;
    document.getElementById('activityText').textContent = ACTIVITY_LEVELS[activity];
}

function logPainEntry(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        dateTime: document.getElementById('painDate').value,
        painLevel: parseInt(document.getElementById('painLevel').value),
        jointLocation: document.getElementById('jointLocation').value,
        activityLevel: parseInt(document.getElementById('activityLevel').value),
        weatherCondition: document.getElementById('weatherCondition').value,
        posture: document.getElementById('posture').value,
        duration: parseInt(document.getElementById('duration').value),
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    painEntries.push(entry);
    localStorage.setItem('jointPainEntries', JSON.stringify(painEntries));

    // Reset form
    document.getElementById('painForm').reset();
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('painDate').value = now.toISOString().slice(0, 16);
    updatePainDisplay();
    updateActivityDisplay();

    updateDisplay();

    // Show success message
    alert('Pain episode logged successfully!');
}

function updateDisplay() {
    updateMetrics();
    updateHistory();
    updateCharts();
    updateInsights();
}

function updateMetrics() {
    const totalEpisodes = painEntries.length;
    document.getElementById('totalEpisodes').textContent = totalEpisodes;

    if (totalEpisodes > 0) {
        const totalPain = painEntries.reduce((sum, e) => sum + e.painLevel, 0);
        const avgPain = (totalPain / totalEpisodes).toFixed(1);
        document.getElementById('avgPainLevel').textContent = avgPain;

        // Most affected joint
        const jointCounts = {};
        painEntries.forEach(entry => {
            jointCounts[entry.jointLocation] = (jointCounts[entry.jointLocation] || 0) + 1;
        });
        const mostAffected = Object.keys(jointCounts).reduce((a, b) =>
            jointCounts[a] > jointCounts[b] ? a : b, 'None');
        document.getElementById('mostAffectedJoint').textContent =
            mostAffected.charAt(0).toUpperCase() + mostAffected.slice(1);

        // Weather correlation
        const weatherCorrelation = calculateWeatherCorrelation();
        document.getElementById('weatherCorrelation').textContent = weatherCorrelation;
    }
}

function calculateWeatherCorrelation() {
    if (painEntries.length < 5) return 'Need more data';

    const weatherGroups = {};
    painEntries.forEach(entry => {
        if (!weatherGroups[entry.weatherCondition]) {
            weatherGroups[entry.weatherCondition] = [];
        }
        weatherGroups[entry.weatherCondition].push(entry.painLevel);
    });

    const correlations = Object.keys(weatherGroups).map(weather => {
        const pains = weatherGroups[weather];
        if (pains.length < 2) return null;
        const avgPain = pains.reduce((a, b) => a + b) / pains.length;
        return { weather, avgPain, count: pains.length };
    }).filter(Boolean);

    if (correlations.length < 2) return 'Insufficient data';

    const maxAvg = Math.max(...correlations.map(c => c.avgPain));
    const minAvg = Math.min(...correlations.map(c => c.avgPain));

    if (maxAvg - minAvg < 1) return 'Minimal';
    if (maxAvg - minAvg < 3) return 'Moderate';
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
        filteredEntries = painEntries.filter(e => new Date(e.dateTime) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredEntries = painEntries.filter(e => new Date(e.dateTime) >= monthAgo);
    }

    // Sort by date descending
    filteredEntries.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    const historyList = document.getElementById('painHistory');
    historyList.innerHTML = '';

    if (filteredEntries.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No entries found for this period.</p>';
        return;
    }

    filteredEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const dateTime = new Date(entry.dateTime).toLocaleString();
        const painText = PAIN_LEVELS[entry.painLevel];

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${dateTime}</span>
                    <span class="history-pain">Pain: ${entry.painLevel}/10</span>
                </div>
                <div class="history-details">
                    <span>Joint: ${entry.jointLocation.charAt(0).toUpperCase() + entry.jointLocation.slice(1)}</span> |
                    <span>Activity: ${entry.activityLevel}/10</span> |
                    <span>Duration: ${entry.duration} min</span>
                    ${entry.weatherCondition ? `<br>Weather: ${entry.weatherCondition.charAt(0).toUpperCase() + entry.weatherCondition.slice(1)}` : ''}
                    ${entry.posture ? ` | Posture: ${entry.posture.charAt(0).toUpperCase() + entry.posture.slice(1)}` : ''}
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
        localStorage.setItem('jointPainEntries', JSON.stringify(painEntries));
        updateDisplay();
    }
}

// Global chart variables
let painActivityChart = null;
let painWeatherChart = null;

function updateCharts() {
    updatePainActivityChart();
    updatePainWeatherChart();
}

function updatePainActivityChart() {
    const canvas = document.getElementById('painActivityChart');
    if (!canvas) return;

    // Destroy existing chart
    if (painActivityChart) {
        painActivityChart.destroy();
    }

    if (painEntries.length < 3) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more entries to see pain vs activity patterns', canvas.width / 2, canvas.height / 2);
        return;
    }

    const entries = painEntries.slice(-30); // Last 30 entries

    painActivityChart = new Chart(canvas, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Pain vs Activity',
                data: entries.map(entry => ({
                    x: entry.activityLevel,
                    y: entry.painLevel
                })),
                backgroundColor: 'rgba(74, 144, 226, 0.6)',
                borderColor: 'var(--primary-color)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Activity Level (1-10)'
                    },
                    min: 1,
                    max: 10
                },
                y: {
                    title: {
                        display: true,
                        text: 'Pain Level (1-10)'
                    },
                    min: 1,
                    max: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updatePainWeatherChart() {
    const canvas = document.getElementById('painWeatherChart');
    if (!canvas) return;

    // Destroy existing chart
    if (painWeatherChart) {
        painWeatherChart.destroy();
    }

    if (painEntries.length < 5) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more entries to see weather correlations', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Group by weather and calculate average pain
    const weatherData = {};
    painEntries.forEach(entry => {
        if (entry.weatherCondition) {
            if (!weatherData[entry.weatherCondition]) {
                weatherData[entry.weatherCondition] = [];
            }
            weatherData[entry.weatherCondition].push(entry.painLevel);
        }
    });

    const weatherTypes = Object.keys(weatherData);
    if (weatherTypes.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Add weather data to see correlations', canvas.width / 2, canvas.height / 2);
        return;
    }

    const chartData = weatherTypes.map(weather => {
        const pains = weatherData[weather];
        const avgPain = pains.reduce((a, b) => a + b) / pains.length;
        return {
            weather: weather.charAt(0).toUpperCase() + weather.slice(1),
            avgPain: avgPain,
            count: pains.length
        };
    });

    painWeatherChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: chartData.map(d => d.weather),
            datasets: [{
                label: 'Average Pain Level',
                data: chartData.map(d => d.avgPain.toFixed(1)),
                backgroundColor: 'rgba(255, 193, 7, 0.6)',
                borderColor: 'var(--accent-color)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Average Pain Level'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Weather Condition'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateInsights() {
    // Pattern Detection
    const patternElement = document.getElementById('patternDetection');
    if (painEntries.length >= 7) {
        const recentEntries = painEntries.slice(-7);
        const painIncrease = recentEntries.filter(e => e.painLevel >= 6).length;
        if (painIncrease >= 3) {
            patternElement.innerHTML = '<p>Detected pattern of frequent high pain episodes. Consider reviewing activity levels and weather conditions.</p>';
        } else {
            patternElement.innerHTML = '<p>No significant patterns detected yet. Continue logging to identify correlations.</p>';
        }
    } else {
        patternElement.innerHTML = '<p>Log more episodes to detect patterns in your joint pain.</p>';
    }

    // Activity Recommendations
    const activityElement = document.getElementById('activityRecommendations');
    if (painEntries.length >= 5) {
        const highActivityPain = painEntries.filter(e => e.activityLevel >= 7 && e.painLevel >= 6).length;
        if (highActivityPain >= 2) {
            activityElement.innerHTML = '<p>High activity levels correlate with increased pain. Consider modifying intense activities.</p>';
        } else {
            activityElement.innerHTML = '<p>Monitor activity levels to identify what works best for your joints.</p>';
        }
    } else {
        activityElement.innerHTML = '<p>Track activity levels with pain episodes to get personalized recommendations.</p>';
    }

    // Weather Awareness
    const weatherElement = document.getElementById('weatherAwareness');
    const weatherEntries = painEntries.filter(e => e.weatherCondition);
    if (weatherEntries.length >= 5) {
        const coldWeatherPain = weatherEntries.filter(e => ['cold', 'snowy'].includes(e.weatherCondition) && e.painLevel >= 6).length;
        if (coldWeatherPain >= 2) {
            weatherElement.innerHTML = '<p>Cold weather appears to increase pain levels. Consider warming strategies.</p>';
        } else {
            weatherElement.innerHTML = '<p>Continue tracking weather conditions to identify environmental triggers.</p>';
        }
    } else {
        weatherElement.innerHTML = '<p>Add weather information to your entries to identify environmental patterns.</p>';
    }
}

function renderRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = '';

    RECOMMENDATIONS.forEach(rec => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';
        recElement.innerHTML = `
            <div class="recommendation-icon">
                <i data-lucide="lightbulb"></i>
            </div>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.text}</p>
            </div>
        `;
        recommendationsContainer.appendChild(recElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}