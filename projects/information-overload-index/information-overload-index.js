// information-overload-index.js

let infoLogs = JSON.parse(localStorage.getItem('informationOverloadLogs')) || [];

// Cognitive load weights for different information categories
const CATEGORY_WEIGHTS = {
    work: 1.2,           // High cognitive demand
    social: 0.8,         // Moderate cognitive demand
    news: 1.0,           // High cognitive demand
    learning: 1.3,       // Very high cognitive demand
    email: 0.7,          // Moderate cognitive demand
    entertainment: 0.4, // Low cognitive demand
    research: 1.4,       // Very high cognitive demand
    meetings: 1.1        // High cognitive demand
};

// Maximum recommended daily information time (minutes)
const MAX_DAILY_INFO_TIME = 480; // 8 hours

function logInformationConsumption() {
    const date = document.getElementById('logDate').value;

    if (!date) {
        alert('Please select a date.');
        return;
    }

    // Get categories data
    const categoryEntries = document.querySelectorAll('.category-entry');
    const categories = [];

    for (let entry of categoryEntries) {
        const category = entry.querySelector('.category-select').value;
        const timeSpent = parseInt(entry.querySelector('.time-input-field').value) || 0;
        const focusQuality = parseInt(entry.querySelector('.quality-slider').value);
        const mentalStress = parseInt(entry.querySelector('.stress-slider').value);

        if (category && timeSpent > 0) {
            categories.push({
                category,
                timeSpent,
                focusQuality,
                mentalStress
            });
        }
    }

    if (categories.length === 0) {
        alert('Please add at least one information source with time spent.');
        return;
    }

    // Get overall metrics
    const overallMood = parseInt(document.getElementById('overallMood').value);
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
    const notes = document.getElementById('infoNotes').value.trim();

    // Check if entry already exists for this date
    const existingEntry = infoLogs.find(log => log.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        infoLogs = infoLogs.filter(log => log.date !== date);
    }

    // Calculate overload metrics
    const metrics = calculateOverloadMetrics(categories, overallMood, sleepQuality);

    const logEntry = {
        id: Date.now(),
        date,
        categories,
        overallMood,
        sleepQuality,
        metrics,
        notes
    };

    infoLogs.push(logEntry);

    // Sort by date (most recent first)
    infoLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Keep only last 50 entries
    if (infoLogs.length > 50) {
        infoLogs = infoLogs.slice(0, 50);
    }

    localStorage.setItem('informationOverloadLogs', JSON.stringify(infoLogs));

    // Clear form
    document.getElementById('logDate').value = '';
    document.getElementById('overallMood').value = 7;
    document.getElementById('moodValue').textContent = '7';
    document.getElementById('sleepQuality').value = 7;
    document.getElementById('sleepValue').textContent = '7';
    document.getElementById('infoNotes').value = '';

    // Reset categories to one empty entry
    document.getElementById('categoriesList').innerHTML = `
        <div class="category-entry">
            <div class="category-header">
                <select class="category-select">
                    <option value="">Select Category</option>
                    <option value="work">Work Tasks</option>
                    <option value="social">Social Media</option>
                    <option value="news">News/Articles</option>
                    <option value="learning">Learning/Study</option>
                    <option value="email">Email/Communication</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="research">Research</option>
                    <option value="meetings">Meetings/Calls</option>
                </select>
                <button type="button" class="remove-category-btn" style="display: none;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="category-details">
                <div class="time-input">
                    <label>Time Spent (minutes)</label>
                    <input type="number" class="time-input-field" min="0" max="1440" placeholder="0">
                </div>
                <div class="quality-input">
                    <label>Focus Quality (1-10)</label>
                    <input type="range" class="quality-slider" min="1" max="10" value="7">
                    <span class="quality-value">7</span>
                </div>
                <div class="stress-input">
                    <label>Mental Stress (1-10)</label>
                    <input type="range" class="stress-slider" min="1" max="10" value="3">
                    <span class="stress-value">3</span>
                </div>
            </div>
        </div>
    `;

    updateStats();
    updateOverloadAlert();
    updateChart();
    updateInsights();
    updateInfoHistory();
}

function calculateOverloadMetrics(categories, overallMood, sleepQuality) {
    const totalTime = categories.reduce((sum, cat) => sum + cat.timeSpent, 0);
    const avgFocusQuality = categories.reduce((sum, cat) => sum + cat.focusQuality, 0) / categories.length;
    const avgMentalStress = categories.reduce((sum, cat) => sum + cat.mentalStress, 0) / categories.length;

    // Calculate weighted cognitive load
    let weightedLoad = 0;
    categories.forEach(cat => {
        const weight = CATEGORY_WEIGHTS[cat.category] || 1.0;
        const timeFactor = cat.timeSpent / 60; // Convert to hours
        const qualityFactor = (11 - cat.focusQuality) / 10; // Inverse relationship
        const stressFactor = cat.mentalStress / 10;

        weightedLoad += (timeFactor * weight * (1 + qualityFactor + stressFactor));
    });

    // Time overload factor
    const timeOverloadFactor = Math.max(0, (totalTime - MAX_DAILY_INFO_TIME) / MAX_DAILY_INFO_TIME);

    // Sleep and mood modifiers
    const sleepModifier = (11 - sleepQuality) / 10; // Poor sleep increases overload
    const moodModifier = (11 - overallMood) / 10; // Poor mood increases overload

    // Calculate overload index (0-100)
    let overloadIndex = (weightedLoad * 10) + (timeOverloadFactor * 20) + (sleepModifier * 15) + (moodModifier * 10);

    // Cap at 100 and ensure minimum 0
    overloadIndex = Math.max(0, Math.min(100, overloadIndex));

    // Determine overload level
    let overloadLevel = 'low';
    if (overloadIndex >= 70) overloadLevel = 'critical';
    else if (overloadIndex >= 50) overloadLevel = 'high';
    else if (overloadIndex >= 30) overloadLevel = 'moderate';

    // Calculate cognitive health status
    const cognitiveHealth = calculateCognitiveHealth(overloadIndex, avgFocusQuality, sleepQuality);

    return {
        totalTime,
        avgFocusQuality: parseFloat(avgFocusQuality.toFixed(1)),
        avgMentalStress: parseFloat(avgMentalStress.toFixed(1)),
        weightedLoad: parseFloat(weightedLoad.toFixed(2)),
        overloadIndex: parseFloat(overloadIndex.toFixed(1)),
        overloadLevel,
        cognitiveHealth,
        categoryCount: categories.length
    };
}

function calculateCognitiveHealth(overloadIndex, avgFocusQuality, sleepQuality) {
    // Cognitive health based on multiple factors
    const overloadFactor = overloadIndex / 100;
    const focusFactor = avgFocusQuality / 10;
    const sleepFactor = sleepQuality / 10;

    const healthScore = (focusFactor * 0.4) + (sleepFactor * 0.4) + ((1 - overloadFactor) * 0.2);

    if (healthScore >= 0.8) return { status: 'Excellent', class: 'good' };
    if (healthScore >= 0.6) return { status: 'Good', class: 'good' };
    if (healthScore >= 0.4) return { status: 'Fair', class: 'caution' };
    return { status: 'Poor', class: 'poor' };
}

function updateStats() {
    const totalLogs = infoLogs.length;

    if (totalLogs === 0) {
        document.getElementById('overloadScore').textContent = '0/100';
        document.getElementById('totalInfoTime').textContent = '0h';
        document.getElementById('cognitiveHealth').textContent = 'Unknown';
        document.getElementById('cognitiveHealth').className = 'stat-value';
        document.getElementById('daysTracked').textContent = '0';
        return;
    }

    // Current overload (latest entry)
    const latestEntry = infoLogs[0];
    const currentOverload = latestEntry.metrics.overloadIndex;
    const totalTimeHours = (latestEntry.metrics.totalTime / 60).toFixed(1);

    // Cognitive health
    const cognitiveHealth = latestEntry.metrics.cognitiveHealth;

    // Update display
    document.getElementById('overloadScore').textContent = `${currentOverload}/100`;
    document.getElementById('totalInfoTime').textContent = `${totalTimeHours}h`;
    document.getElementById('cognitiveHealth').textContent = cognitiveHealth.status;
    document.getElementById('cognitiveHealth').className = `stat-value cognitive-${cognitiveHealth.class}`;
    document.getElementById('daysTracked').textContent = totalLogs;
}

function updateOverloadAlert() {
    const alertDiv = document.getElementById('overloadAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    if (infoLogs.length === 0) {
        alertDiv.style.display = 'none';
        return;
    }

    const latestEntry = infoLogs[0];
    const recentEntries = infoLogs.slice(0, 3); // Last 3 days
    const avgRecentOverload = recentEntries.reduce((sum, entry) => sum + entry.metrics.overloadIndex, 0) / recentEntries.length;

    if (latestEntry.metrics.overloadLevel === 'critical' || avgRecentOverload >= 70) {
        alertDiv.style.display = 'flex';
        alertDiv.className = 'overload-alert critical';
        alertTitle.textContent = 'Critical Information Overload Detected';
        alertMessage.textContent = `Your information consumption (${latestEntry.metrics.totalTime} minutes) has reached critical levels. Your cognitive health is at risk. Immediately reduce information intake and focus on mental recovery activities.`;
    } else if (latestEntry.metrics.overloadLevel === 'high' || avgRecentOverload >= 50) {
        alertDiv.style.display = 'flex';
        alertDiv.className = 'overload-alert high';
        alertTitle.textContent = 'High Information Overload';
        alertMessage.textContent = `You're experiencing significant information overload. Consider implementing information boundaries, taking regular breaks, and prioritizing high-value information sources.`;
    } else if (latestEntry.metrics.overloadLevel === 'moderate' || avgRecentOverload >= 30) {
        alertDiv.style.display = 'flex';
        alertDiv.className = 'overload-alert moderate';
        alertTitle.textContent = 'Moderate Information Overload';
        alertMessage.textContent = `Your information intake is approaching unhealthy levels. Monitor your focus quality and consider reducing time spent on low-value information sources.`;
    } else {
        alertDiv.style.display = 'none';
    }
}

function updateChart() {
    const ctx = document.getElementById('overloadChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartLogs = infoLogs.slice(0, 20).reverse();

    const labels = chartLogs.map(log => {
        const date = new Date(log.date);
        return date.toLocaleDateString();
    });

    const overloadScores = chartLogs.map(log => log.metrics.overloadIndex);
    const totalTimes = chartLogs.map(log => log.metrics.totalTime / 60); // Convert to hours
    const focusQualities = chartLogs.map(log => log.metrics.avgFocusQuality);
    const stressLevels = chartLogs.map(log => log.metrics.avgMentalStress);

    // Reference lines
    const moderateOverload = new Array(overloadScores.length).fill(30);
    const highOverload = new Array(overloadScores.length).fill(50);
    const criticalOverload = new Array(overloadScores.length).fill(70);
    const maxRecommended = new Array(totalTimes.length).fill(MAX_DAILY_INFO_TIME / 60);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Information Overload Index',
                data: overloadScores,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Total Information Time (hours)',
                data: totalTimes,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Average Focus Quality',
                data: focusQualities,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Average Mental Stress',
                data: stressLevels,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Moderate Overload (30+)',
                data: moderateOverload,
                borderColor: '#ffc107',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'High Overload (50+)',
                data: highOverload,
                borderColor: '#fd7e14',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Critical Overload (70+)',
                data: criticalOverload,
                borderColor: '#dc3545',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Max Recommended Time',
                data: maxRecommended,
                borderColor: '#6f42c1',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Overload Index'
                    },
                    min: 0,
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Information Time (hours)'
                    },
                    min: 0,
                    max: 12,
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Quality/Stress (1-10)'
                    },
                    min: 1,
                    max: 10,
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (infoLogs.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 days of information consumption to receive personalized insights about your cognitive load patterns and optimization strategies.</p>';
        return;
    }

    // Analyze patterns
    const recentLogs = infoLogs.slice(0, 14); // Last 2 weeks
    const avgOverload = recentLogs.reduce((sum, log) => sum + log.metrics.overloadIndex, 0) / recentLogs.length;
    const avgDailyTime = recentLogs.reduce((sum, log) => sum + log.metrics.totalTime, 0) / recentLogs.length;
    const avgFocusQuality = recentLogs.reduce((sum, log) => sum + log.metrics.avgFocusQuality, 0) / recentLogs.length;

    // Find most time-consuming categories
    const categoryTimes = {};
    recentLogs.forEach(log => {
        log.categories.forEach(cat => {
            categoryTimes[cat.category] = (categoryTimes[cat.category] || 0) + cat.timeSpent;
        });
    });

    const topCategories = Object.entries(categoryTimes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

    // Analyze overload trends
    const overloadTrend = recentLogs.length >= 2 ?
        recentLogs[0].metrics.overloadIndex - recentLogs[recentLogs.length - 1].metrics.overloadIndex : 0;

    // Generate insights
    let insights = '<p>Based on your information consumption patterns:</p><ul>';

    if (avgOverload >= 70) {
        insights += '<li><strong>Critical overload levels detected.</strong> Your average overload index is extremely high. Immediate action is required to protect your cognitive health. Consider a complete information detox for several days.</li>';
    } else if (avgOverload >= 50) {
        insights += '<li><strong>High information overload.</strong> You\'re consistently exceeding healthy information consumption limits. Implement strict time boundaries and prioritize information quality over quantity.</li>';
    } else if (avgOverload >= 30) {
        insights += '<li><strong>Moderate overload present.</strong> Your information intake is approaching unhealthy levels. Focus on reducing time spent on low-value sources and improving focus quality.</li>';
    } else {
        insights += '<li><strong>Healthy information consumption.</strong> Your overload levels are within acceptable ranges. Continue maintaining good information boundaries and focus on high-quality sources.</li>';
    }

    if (avgDailyTime > MAX_DAILY_INFO_TIME) {
        insights += `<li><strong>Excessive daily information time.</strong> Your average daily consumption (${Math.round(avgDailyTime)} minutes) exceeds the recommended maximum of ${MAX_DAILY_INFO_TIME} minutes. Consider time-blocking strategies.</li>`;
    }

    if (avgFocusQuality < 6) {
        insights += '<li><strong>Low focus quality detected.</strong> Your attention span and comprehension are suffering. Practice mindfulness techniques and consider reducing multitasking.</li>';
    }

    if (overloadTrend > 10) {
        insights += '<li><strong>Overload increasing over time.</strong> Your information consumption burden is growing. Re-evaluate your information sources and consider implementing stricter boundaries.</li>';
    } else if (overloadTrend < -10) {
        insights += '<li><strong>Overload decreasing.</strong> Your recent changes are effectively reducing cognitive load. Continue with these positive information management strategies.</li>';
    }

    if (topCategories.length > 0) {
        const categoryNames = topCategories.map(cat => {
            const nameMap = {
                work: 'Work Tasks',
                social: 'Social Media',
                news: 'News/Articles',
                learning: 'Learning/Study',
                email: 'Email/Communication',
                entertainment: 'Entertainment',
                research: 'Research',
                meetings: 'Meetings/Calls'
            };
            return nameMap[cat] || cat;
        });
        insights += `<li><strong>Primary information sources:</strong> ${categoryNames.join(', ')}. Consider auditing these categories for quality and necessity.</li>`;
    }

    insights += '<li><strong>Information management strategies:</strong> Set specific time limits for each category, batch similar activities, practice the "one-tab" rule, and schedule regular "information fasting" periods.</li>';
    insights += '<li><strong>Cognitive recovery:</strong> Between high-information days, ensure adequate sleep (7-9 hours), physical activity, and mentally restorative activities like nature walks or meditation.</li>';
    insights += '<li><strong>Quality over quantity:</strong> Focus on deep work sessions with minimal distractions rather than constant low-quality information consumption.</li>';

    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateInfoHistory() {
    const historyDiv = document.getElementById('infoHistory');
    historyDiv.innerHTML = '';

    if (infoLogs.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No information consumption logged yet. Start by logging your daily information intake above.</p>';
        return;
    }

    // Show last 10 entries
    const recentLogs = infoLogs.slice(0, 10);

    recentLogs.forEach(log => {
        const logDiv = document.createElement('div');
        logDiv.className = 'info-entry';

        const categorySummaries = log.categories.map(cat => {
            const categoryName = {
                work: 'Work',
                social: 'Social',
                news: 'News',
                learning: 'Learning',
                email: 'Email',
                entertainment: 'Entertainment',
                research: 'Research',
                meetings: 'Meetings'
            }[cat.category] || cat.category;

            return `
                <div class="category-summary">
                    <div class="category-name">${categoryName}</div>
                    <div class="category-stats">
                        ${cat.timeSpent}min | Focus: ${cat.focusQuality}/10 | Stress: ${cat.mentalStress}/10
                    </div>
                </div>
            `;
        }).join('');

        logDiv.innerHTML = `
            <div class="info-header">
                <div class="info-date">${new Date(log.date).toLocaleDateString()}</div>
                <div class="overload-indicator overload-${log.metrics.overloadLevel}">
                    ${log.metrics.overloadLevel.charAt(0).toUpperCase() + log.metrics.overloadLevel.slice(1)} Overload (${log.metrics.overloadIndex})
                </div>
            </div>
            <div class="info-categories-summary">
                ${categorySummaries}
            </div>
            <div class="info-metrics">
                <div class="metric-item">
                    <div class="metric-label">Total Time</div>
                    <div class="metric-value">${log.metrics.totalTime}min</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Avg Focus</div>
                    <div class="metric-value">${log.metrics.avgFocusQuality}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Avg Stress</div>
                    <div class="metric-value">${log.metrics.avgMentalStress}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Mood</div>
                    <div class="metric-value">${log.overallMood}/10</div>
                </div>
            </div>
            ${log.notes ? `<div class="info-notes">${log.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteInfoLog(${log.id})">Delete Entry</button>
        `;

        historyDiv.appendChild(logDiv);
    });
}

function deleteInfoLog(id) {
    if (confirm('Are you sure you want to delete this information log?')) {
        infoLogs = infoLogs.filter(log => log.id !== id);
        localStorage.setItem('informationOverloadLogs', JSON.stringify(infoLogs));
        updateStats();
        updateOverloadAlert();
        updateChart();
        updateInsights();
        updateInfoHistory();
    }
}

function addCategory() {
    const categoriesList = document.getElementById('categoriesList');
    const categoryCount = categoriesList.children.length + 1;

    const categoryEntry = document.createElement('div');
    categoryEntry.className = 'category-entry';
    categoryEntry.innerHTML = `
        <div class="category-header">
            <select class="category-select">
                <option value="">Select Category</option>
                <option value="work">Work Tasks</option>
                <option value="social">Social Media</option>
                <option value="news">News/Articles</option>
                <option value="learning">Learning/Study</option>
                <option value="email">Email/Communication</option>
                <option value="entertainment">Entertainment</option>
                <option value="research">Research</option>
                <option value="meetings">Meetings/Calls</option>
            </select>
            <button type="button" class="remove-category-btn" onclick="removeCategory(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="category-details">
            <div class="time-input">
                <label>Time Spent (minutes)</label>
                <input type="number" class="time-input-field" min="0" max="1440" placeholder="0">
            </div>
            <div class="quality-input">
                <label>Focus Quality (1-10)</label>
                <input type="range" class="quality-slider" min="1" max="10" value="7">
                <span class="quality-value">7</span>
            </div>
            <div class="stress-input">
                <label>Mental Stress (1-10)</label>
                <input type="range" class="stress-slider" min="1" max="10" value="3">
                <span class="stress-value">3</span>
            </div>
        </div>
    `;

    categoriesList.appendChild(categoryEntry);

    // Show remove button for first category now that we have multiple categories
    if (categoryCount === 2) {
        categoriesList.children[0].querySelector('.remove-category-btn').style.display = 'block';
    }
}

function removeCategory(button) {
    const categoryEntry = button.parentElement.parentElement;
    const categoriesList = document.getElementById('categoriesList');

    categoryEntry.remove();

    // Renumber remaining categories
    const remainingCategories = categoriesList.children;
    for (let i = 0; i < remainingCategories.length; i++) {
        // Update any numbering if needed
    }

    // Hide remove button if only one category remains
    if (remainingCategories.length === 1) {
        remainingCategories[0].querySelector('.remove-category-btn').style.display = 'none';
    }
}

// Update slider values in real-time
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('quality-slider')) {
        e.target.nextElementSibling.textContent = e.target.value;
    } else if (e.target.classList.contains('stress-slider')) {
        e.target.nextElementSibling.textContent = e.target.value;
    } else if (e.target.id === 'overallMood') {
        document.getElementById('moodValue').textContent = e.target.value;
    } else if (e.target.id === 'sleepQuality') {
        document.getElementById('sleepValue').textContent = e.target.value;
    }
});

// Form submission
document.getElementById('infoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logInformationConsumption();
});

document.getElementById('addCategoryBtn').addEventListener('click', addCategory);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    updateStats();
    updateOverloadAlert();
    updateChart();
    updateInsights();
    updateInfoHistory();
});