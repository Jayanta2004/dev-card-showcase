// cognitive-load-sleep-analyzer.js

let entries = JSON.parse(localStorage.getItem('cognitiveLoadSleepEntries')) || [];
let sleepGoal = parseFloat(localStorage.getItem('sleepGoal')) || 8.0;
let chartInstance = null;
let riskHistoryChart = null;
let currentChartType = 'line';

// Burnout risk history
let riskHistory = JSON.parse(localStorage.getItem('burnoutRiskHistory')) || [];

// Notification settings
let notificationSettings = JSON.parse(localStorage.getItem('notificationSettings')) || {
    reminderEnabled: false,
    reminderTime: '20:00',
    burnoutAlertsEnabled: false,
    cognitiveLoadThreshold: 8,
    sleepQualityThreshold: 4,
    sleepHoursThreshold: 6,
    patternAlertsEnabled: false,
    consecutiveDaysThreshold: 3,
    highLoadThreshold: 7
};

let notificationInterval = null;
let lastNotificationDate = null;

// Filter state
let filters = {
    dateFrom: null,
    dateTo: null,
    loadMin: 1,
    loadMax: 10,
    qualityMin: 1,
    qualityMax: 10,
    sleepHoursMin: 0,
    sleepHoursMax: 24,
    workHoursMin: 0,
    workHoursMax: 24,
    searchText: ''
};

let filtersVisible = false;

document.addEventListener('DOMContentLoaded', function() {
    const sleepGoalInput = document.getElementById('sleepGoal');
    if (sleepGoalInput) {
        sleepGoalInput.value = sleepGoal;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('logDate');
    if (dateInput) {
        dateInput.value = today;
    }

    updateLoadValue();
    updateQualityValue();
    updateStats(); 
    updateChart();
    updateEntriesList();
    updateSleepDebtCalculator();
    renderHeatMap();
    renderCorrelationMatrix();
    calculateBurnoutRisk(); // New function
    renderRiskHistoryChart(); // New function
    
    initializeCharacterCounters();
    initializeFilters();
    initializeFilterEventListeners();
    initializeNotifications();
});

// Initialize notifications
function initializeNotifications() {
    loadNotificationSettings();
    checkNotificationPermission();
    setupNotificationChecker();
    
    // Check for burnout risk when page loads
    setTimeout(() => {
        checkBurnoutRisk();
    }, 1000);
}

// Load saved notification settings
function loadNotificationSettings() {
    const reminderEnabled = document.getElementById('reminderEnabled');
    const reminderTime = document.getElementById('reminderTime');
    const burnoutAlertsEnabled = document.getElementById('burnoutAlertsEnabled');
    const cognitiveLoadThreshold = document.getElementById('cognitiveLoadThreshold');
    const sleepQualityThreshold = document.getElementById('sleepQualityThreshold');
    const sleepHoursThreshold = document.getElementById('sleepHoursThreshold');
    const patternAlertsEnabled = document.getElementById('patternAlertsEnabled');
    const consecutiveDaysThreshold = document.getElementById('consecutiveDaysThreshold');
    const highLoadThreshold = document.getElementById('highLoadThreshold');

    if (reminderEnabled) reminderEnabled.checked = notificationSettings.reminderEnabled;
    if (reminderTime) reminderTime.value = notificationSettings.reminderTime;
    if (burnoutAlertsEnabled) burnoutAlertsEnabled.checked = notificationSettings.burnoutAlertsEnabled;
    if (cognitiveLoadThreshold) cognitiveLoadThreshold.value = notificationSettings.cognitiveLoadThreshold;
    if (sleepQualityThreshold) sleepQualityThreshold.value = notificationSettings.sleepQualityThreshold;
    if (sleepHoursThreshold) sleepHoursThreshold.value = notificationSettings.sleepHoursThreshold;
    if (patternAlertsEnabled) patternAlertsEnabled.checked = notificationSettings.patternAlertsEnabled;
    if (consecutiveDaysThreshold) consecutiveDaysThreshold.value = notificationSettings.consecutiveDaysThreshold;
    if (highLoadThreshold) highLoadThreshold.value = notificationSettings.highLoadThreshold;
}

// Save notification settings
function saveNotificationSettings() {
    notificationSettings = {
        reminderEnabled: document.getElementById('reminderEnabled')?.checked || false,
        reminderTime: document.getElementById('reminderTime')?.value || '20:00',
        burnoutAlertsEnabled: document.getElementById('burnoutAlertsEnabled')?.checked || false,
        cognitiveLoadThreshold: parseInt(document.getElementById('cognitiveLoadThreshold')?.value) || 8,
        sleepQualityThreshold: parseInt(document.getElementById('sleepQualityThreshold')?.value) || 4,
        sleepHoursThreshold: parseFloat(document.getElementById('sleepHoursThreshold')?.value) || 6,
        patternAlertsEnabled: document.getElementById('patternAlertsEnabled')?.checked || false,
        consecutiveDaysThreshold: parseInt(document.getElementById('consecutiveDaysThreshold')?.value) || 3,
        highLoadThreshold: parseInt(document.getElementById('highLoadThreshold')?.value) || 7
    };
    
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    
    // Show success toast
    showNotificationToast('Settings Saved', 'Notification preferences have been updated.', 'success');
    
    // Reset notification checker
    setupNotificationChecker();
}

// Check notification permission
function checkNotificationPermission() {
    const banner = document.getElementById('notificationPermissionBanner');
    if (!banner) return;
    
    if (!("Notification" in window)) {
        banner.style.display = 'flex';
        banner.querySelector('p').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Your browser does not support desktop notifications';
        return;
    }
    
    if (Notification.permission === 'granted') {
        banner.style.display = 'none';
    } else if (Notification.permission === 'denied') {
        banner.style.display = 'flex';
        banner.querySelector('p').innerHTML = '<i class="fas fa-exclamation-circle"></i> Notifications are blocked. Please enable them in your browser settings.';
        const button = banner.querySelector('button');
        if (button) button.style.display = 'none';
    } else {
        banner.style.display = 'flex';
    }
}

// Request notification permission
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert('Your browser does not support desktop notifications');
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            document.getElementById('notificationPermissionBanner').style.display = 'none';
            showNotificationToast('Notifications Enabled', 'You will now receive logging reminders and burnout alerts!', 'success');
            
            // Send a test notification
            setTimeout(() => {
                sendBrowserNotification(
                    '🎉 Notifications Enabled!',
                    'You\'ll receive daily reminders and alerts when burnout risk is detected.',
                    'success'
                );
            }, 1000);
        }
    });
}

// Send browser notification
function sendBrowserNotification(title, body, type = 'info') {
    if (!("Notification" in window) || Notification.permission !== 'granted') {
        return false;
    }
    
    const options = {
        body: body,
        icon: '../../Hall of Fame (1).png',
        badge: '../../Hall of Fame (1).png',
        vibrate: [200, 100, 200],
        tag: 'cognitive-load-analyzer',
        renotify: true,
        silent: false
    };
    
    try {
        const notification = new Notification(title, options);
        
        notification.onclick = function() {
            window.focus();
            this.close();
        };
        
        setTimeout(notification.close.bind(notification), 10000);
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

// Show in-app notification toast
function showNotificationToast(title, message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.notification-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    
    // Set icon based on type
    let icon = 'fa-info-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'danger') icon = 'fa-exclamation-circle';
    if (type === 'success') icon = 'fa-check-circle';
    
    toast.innerHTML = `
        <div class="notification-toast-header">
            <i class="fas ${icon}"></i>
            <span class="notification-toast-title">${title}</span>
            <button class="notification-toast-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p class="notification-toast-message">${message}</p>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Setup notification checker interval
function setupNotificationChecker() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }
    
    // Check every minute
    notificationInterval = setInterval(() => {
        checkReminderTime();
    }, 60000);
    
    // Also check immediately
    checkReminderTime();
}

// Check if it's time for a reminder
function checkReminderTime() {
    if (!notificationSettings.reminderEnabled) return;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Check if today's reminder hasn't been sent yet
    const today = now.toDateString();
    
    if (currentTime === notificationSettings.reminderTime && lastNotificationDate !== today) {
        // Check if user has already logged today
        const todayStr = now.toISOString().split('T')[0];
        const hasLoggedToday = entries.some(entry => entry.date === todayStr);
        
        if (!hasLoggedToday) {
            sendBrowserNotification(
                '📝 Daily Logging Reminder',
                'Don\'t forget to log your work and sleep data for today!',
                'info'
            );
            showNotificationToast(
                'Daily Reminder',
                'Don\'t forget to log your work and sleep data for today!',
                'info'
            );
            lastNotificationDate = today;
        }
    }
}

// Check for burnout risk
function checkBurnoutRisk() {
    if (!notificationSettings.burnoutAlertsEnabled && !notificationSettings.patternAlertsEnabled) return;
    
    const recentEntries = entries.slice(-7); // Last 7 entries
    
    if (recentEntries.length < 2) return;
    
    // Check individual entries for risk factors
    recentEntries.forEach(entry => {
        const risks = [];
        
        if (notificationSettings.burnoutAlertsEnabled) {
            if (entry.cognitiveLoad >= notificationSettings.cognitiveLoadThreshold) {
                risks.push('high cognitive load');
            }
            if (entry.sleepQuality <= notificationSettings.sleepQualityThreshold) {
                risks.push('poor sleep quality');
            }
            if (entry.sleepHours <= notificationSettings.sleepHoursThreshold) {
                risks.push('insufficient sleep');
            }
        }
        
        if (risks.length >= 2) {
            const date = new Date(entry.date).toLocaleDateString();
            showBurnoutAlert(entry, risks, date);
        }
    });
    
    // Check for patterns
    if (notificationSettings.patternAlertsEnabled) {
        checkPatterns(recentEntries);
    }
}

// Check for concerning patterns
function checkPatterns(entries) {
    // Check for consecutive days of high cognitive load
    let highLoadDays = 0;
    let highLoadStart = null;
    let highestStreak = 0;
    
    entries.forEach((entry, index) => {
        if (entry.cognitiveLoad >= notificationSettings.highLoadThreshold) {
            highLoadDays++;
            if (highLoadDays === 1) {
                highLoadStart = entry.date;
            }
            if (highLoadDays > highestStreak) {
                highestStreak = highLoadDays;
            }
        } else {
            highLoadDays = 0;
            highLoadStart = null;
        }
    });
    
    if (highestStreak >= notificationSettings.consecutiveDaysThreshold) {
        showPatternAlert(highestStreak, highLoadStart);
    }
    
    // Check for declining sleep quality trend
    if (entries.length >= 5) {
        const recentSleepQuality = entries.slice(-3).map(e => e.sleepQuality);
        const previousSleepQuality = entries.slice(-5, -3).map(e => e.sleepQuality);
        
        const avgRecent = recentSleepQuality.reduce((a, b) => a + b, 0) / recentSleepQuality.length;
        const avgPrevious = previousSleepQuality.reduce((a, b) => a + b, 0) / previousSleepQuality.length;
        
        if (avgRecent < avgPrevious - 2 && avgRecent <= 5) {
            sendBrowserNotification(
                '📉 Sleep Quality Declining',
                'Your sleep quality has been decreasing. This might affect your cognitive performance.',
                'warning'
            );
            showNotificationToast(
                'Sleep Quality Alert',
                'Your sleep quality has been decreasing. Consider adjusting your bedtime routine.',
                'warning'
            );
        }
    }
}

// Show burnout alert
function showBurnoutAlert(entry, risks, date) {
    const riskText = risks.join(' and ');
    const title = '⚠️ Burnout Risk Detected';
    const message = `On ${date}, you had ${riskText}. Consider taking a break or adjusting your schedule.`;
    
    sendBrowserNotification(title, message, 'danger');
    showNotificationToast('Burnout Risk Alert', message, 'danger');
}

// Show pattern alert
function showPatternAlert(days, startDate) {
    const start = new Date(startDate).toLocaleDateString();
    const title = '⚠️ High Workload Pattern';
    const message = `You've had high cognitive load for ${days} consecutive days (starting ${start}). Take time to rest.`;
    
    sendBrowserNotification(title, message, 'warning');
    showNotificationToast('Workload Pattern Alert', message, 'warning');
}

// Test notification function
function testNotification(type) {
    if (!("Notification" in window)) {
        alert('Your browser does not support notifications');
        return;
    }
    
    if (Notification.permission !== 'granted') {
        requestNotificationPermission();
        return;
    }
    
    switch(type) {
        case 'reminder':
            sendBrowserNotification(
                '📝 Test Reminder',
                'This is a test of your daily logging reminder. You would normally receive this at your set time.',
                'info'
            );
            showNotificationToast('Test Reminder', 'Daily reminder notification test successful!', 'success');
            break;
            
        case 'burnout':
            sendBrowserNotification(
                '⚠️ Test Burnout Alert',
                'This is a test of the burnout risk alert. You would receive this when risk factors are detected.',
                'warning'
            );
            showNotificationToast('Test Burnout Alert', 'Burnout alert test successful!', 'warning');
            break;
            
        case 'pattern':
            sendBrowserNotification(
                '📊 Test Pattern Alert',
                'This is a test of the pattern detection alert. You would receive this when concerning patterns are detected.',
                'warning'
            );
            showNotificationToast('Test Pattern Alert', 'Pattern detection test successful!', 'warning');
            break;
    }
}

function updateLoadValue() {
    const value = document.getElementById('cognitiveLoad').value;
    const display = document.getElementById('currentLoadValue');
    if (display) display.textContent = value;
}

function updateQualityValue() {
    const value = document.getElementById('sleepQuality').value;
    const display = document.getElementById('currentQualityValue');
    if (display) display.textContent = value;
}

function calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : parseFloat((numerator / denominator).toFixed(2));
}

function updateStats() {
    // Calculate stats for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = entries.filter(entry => new Date(entry.date) >= sevenDaysAgo);

    const correlationEl = document.getElementById('correlation');
    const avgWorkHoursEl = document.getElementById('avgWorkHours');
    const avgSleepQualityEl = document.getElementById('avgSleepQuality');

    if (recentEntries.length < 2) {
        if (correlationEl) correlationEl.textContent = 'N/A';
        if (avgWorkHoursEl) avgWorkHoursEl.textContent = '0.0h';
        if (avgSleepQualityEl) avgSleepQualityEl.textContent = '0.0';
    } else {
        // Calculate correlation between cognitive load and sleep quality
        const workLoads = recentEntries.map(entry => entry.cognitiveLoad);
        const sleepQualities = recentEntries.map(entry => entry.sleepQuality);
        const correlation = calculateCorrelation(workLoads, sleepQualities);

        // Calculate averages
        const avgWorkHours = (recentEntries.reduce((sum, entry) => sum + entry.workHours, 0) / recentEntries.length).toFixed(1);
        const avgSleepQuality = (recentEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / recentEntries.length).toFixed(1);

        if (correlationEl) correlationEl.textContent = correlation;
        if (avgWorkHoursEl) avgWorkHoursEl.textContent = `${avgWorkHours}h`;
        if (avgSleepQualityEl) avgSleepQualityEl.textContent = avgSleepQuality;
    }
    
    // Update weekly summary
    updateWeeklySummary();
}

function updateWeeklySummary() {
    // Get entries from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = entries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
    
    // Get summary elements
    const bestSleepDayEl = document.getElementById('bestSleepDay');
    const bestSleepDetailsEl = document.getElementById('bestSleepDetails');
    const bestSleepDateEl = document.getElementById('bestSleepDate');
    
    const highestLoadDayEl = document.getElementById('highestLoadDay');
    const highestLoadDetailsEl = document.getElementById('highestLoadDetails');
    const highestLoadDateEl = document.getElementById('highestLoadDate');
    
    const mostProductiveDayEl = document.getElementById('mostProductiveDay');
    const mostProductiveDetailsEl = document.getElementById('mostProductiveDetails');
    const mostProductiveDateEl = document.getElementById('mostProductiveDate');
    
    if (recentEntries.length === 0) {
        // No data in last 7 days
        if (bestSleepDayEl) {
            bestSleepDayEl.textContent = 'No Data';
            if (bestSleepDetailsEl) bestSleepDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            if (bestSleepDateEl) bestSleepDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        
        if (highestLoadDayEl) {
            highestLoadDayEl.textContent = 'No Data';
            if (highestLoadDetailsEl) highestLoadDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            if (highestLoadDateEl) highestLoadDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        
        if (mostProductiveDayEl) {
            mostProductiveDayEl.textContent = 'No Data';
            if (mostProductiveDetailsEl) mostProductiveDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            if (mostProductiveDateEl) mostProductiveDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        return;
    }
    
    // 1. Best Sleep Day (highest sleep quality)
    const bestSleepEntry = recentEntries.reduce((best, current) => {
        return (current.sleepQuality > best.sleepQuality) ? current : best;
    }, recentEntries[0]);
    
    const bestSleepDate = new Date(bestSleepEntry.date);
    if (bestSleepDayEl) bestSleepDayEl.textContent = bestSleepDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (bestSleepDetailsEl) {
        bestSleepDetailsEl.innerHTML = `
            <i class="fas fa-star"></i>
            <span>Quality: ${bestSleepEntry.sleepQuality}/10 (${bestSleepEntry.sleepHours}h)</span>
        `;
    }
    if (bestSleepDateEl) {
        bestSleepDateEl.innerHTML = `
            <i class="far fa-calendar-alt"></i>
            <span>${bestSleepDate.toLocaleDateString()}</span>
        `;
    }
    
    // 2. Highest Cognitive Load Day
    const highestLoadEntry = recentEntries.reduce((highest, current) => {
        return (current.cognitiveLoad > highest.cognitiveLoad) ? current : highest;
    }, recentEntries[0]);
    
    const highestLoadDate = new Date(highestLoadEntry.date);
    if (highestLoadDayEl) highestLoadDayEl.textContent = highestLoadDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (highestLoadDetailsEl) {
        highestLoadDetailsEl.innerHTML = `
            <i class="fas fa-tachometer-alt"></i>
            <span>Load: ${highestLoadEntry.cognitiveLoad}/10 (${highestLoadEntry.workHours}h)</span>
        `;
    }
    if (highestLoadDateEl) {
        highestLoadDateEl.innerHTML = `
            <i class="far fa-calendar-alt"></i>
            <span>${highestLoadDate.toLocaleDateString()}</span>
        `;
    }
    
    const productiveEntries = recentEntries.map(entry => ({
        ...entry,
        productivityScore: (entry.workHours * (entry.sleepQuality / 10)) // Work hours weighted by sleep quality
    }));
    
    const mostProductiveEntry = productiveEntries.reduce((best, current) => {
        return (current.productivityScore > best.productivityScore) ? current : best;
    }, productiveEntries[0]);
    
    const productiveDate = new Date(mostProductiveEntry.date);
    if (mostProductiveDayEl) mostProductiveDayEl.textContent = productiveDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (mostProductiveDetailsEl) {
        mostProductiveDetailsEl.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>Work: ${mostProductiveEntry.workHours}h (Quality: ${mostProductiveEntry.sleepQuality}/10)</span>
        `;
    }
    if (mostProductiveDateEl) {
        mostProductiveDateEl.innerHTML = `
            <i class="far fa-calendar-alt"></i>
            <span>${productiveDate.toLocaleDateString()}</span>
        `;
    }
    
    addInsightBadges(recentEntries);
}

function addInsightBadges(recentEntries) {
    const summaryCards = document.querySelectorAll('.summary-card');
    
    summaryCards.forEach(card => {
        const existingBadge = card.querySelector('.insight-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    });
    
    if (recentEntries.length < 3) return;
    
    const avgSleepQuality = recentEntries.reduce((sum, e) => sum + e.sleepQuality, 0) / recentEntries.length;
    const avgCognitiveLoad = recentEntries.reduce((sum, e) => sum + e.cognitiveLoad, 0) / recentEntries.length;
    const avgWorkHours = recentEntries.reduce((sum, e) => sum + e.workHours, 0) / recentEntries.length;
    
    if (avgSleepQuality < 5 && summaryCards[0]) {
        const bestSleepCard = summaryCards[0];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sleep quality needs improvement';
        bestSleepCard.appendChild(badge);
    }
   
    if (avgCognitiveLoad > 7 && summaryCards[1]) {
        const highestLoadCard = summaryCards[1];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-exclamation-circle"></i> High cognitive load this week';
        highestLoadCard.appendChild(badge);
    }
    
    if (avgWorkHours > 8 && avgSleepQuality < 6 && summaryCards[2]) {
        const productiveCard = summaryCards[2];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-lightbulb"></i> Consider work-life balance';
        productiveCard.appendChild(badge);
    }
}

// Change chart type
function changeChartType(type) {
    currentChartType = type;
    
    // Update active button
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="changeChartType('${type}')"]`).classList.add('active');
    
    // Update chart
    updateChart();
}

// Enhanced chart function with multiple chart types
function updateChart() {
    const ctx = document.getElementById('correlationChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Prepare data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const chartEntries = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (chartEntries.length === 0) {
        // Show empty chart with message
        chartInstance = new Chart(context, {
            type: 'line',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'No entries yet',
                    data: [0],
                    borderColor: '#6c757d',
                    backgroundColor: 'rgba(108, 117, 125, 0.1)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Log some entries to see the chart'
                    }
                }
            }
        });
        return;
    }

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    let chartConfig = {
        labels: labels,
        datasets: []
    };

    switch(currentChartType) {
        case 'line':
            chartConfig.datasets = [
                {
                    label: 'Cognitive Load',
                    data: chartEntries.map(entry => entry.cognitiveLoad),
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Sleep Quality',
                    data: chartEntries.map(entry => entry.sleepQuality),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Work Hours',
                    data: chartEntries.map(entry => entry.workHours),
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    pointRadius: 3,
                    fill: false
                }
            ];
            break;

        case 'scatter':
            // Create scatter plot data for cognitive load vs sleep quality
            const scatterData = chartEntries.map(entry => ({
                x: entry.cognitiveLoad,
                y: entry.sleepQuality,
                r: entry.workHours * 2 // Size based on work hours
            }));
            
            chartConfig.datasets = [{
                label: 'Cognitive Load vs Sleep Quality',
                data: scatterData,
                backgroundColor: 'rgba(79, 209, 255, 0.6)',
                borderColor: '#4fd1ff',
                borderWidth: 1,
                pointRadius: scatterData.map(d => Math.max(5, Math.min(15, d.r))),
                pointHoverRadius: scatterData.map(d => Math.max(7, Math.min(20, d.r + 2)))
            }];
            break;

        case 'stacked':
            // Create stacked area chart for productivity categories
            const stackedData = chartEntries.map(entry => {
                // Categorize productivity based on load and sleep
                let productive = 0, moderate = 0, unproductive = 0;
                
                if (entry.cognitiveLoad >= 7 && entry.sleepQuality >= 7) {
                    productive = entry.workHours;
                } else if (entry.cognitiveLoad >= 5 && entry.sleepQuality >= 5) {
                    moderate = entry.workHours;
                } else {
                    unproductive = entry.workHours;
                }
                
                return { productive, moderate, unproductive };
            });
            
            chartConfig.datasets = [
                {
                    label: 'Highly Productive',
                    data: stackedData.map(d => d.productive),
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    borderWidth: 1,
                    fill: true
                },
                {
                    label: 'Moderately Productive',
                    data: stackedData.map(d => d.moderate),
                    backgroundColor: '#ffc107',
                    borderColor: '#ffc107',
                    borderWidth: 1,
                    fill: true
                },
                {
                    label: 'Low Productivity',
                    data: stackedData.map(d => d.unproductive),
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    borderWidth: 1,
                    fill: true
                }
            ];
            break;
    }

    const chartOptions = {
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
                        if (currentChartType === 'scatter') {
                            const entry = chartEntries[context.dataIndex];
                            return [
                                `Cognitive Load: ${entry.cognitiveLoad}`,
                                `Sleep Quality: ${entry.sleepQuality}`,
                                `Work Hours: ${entry.workHours}h`,
                                `Date: ${new Date(entry.date).toLocaleDateString()}`
                            ];
                        } else if (currentChartType === 'stacked') {
                            return `${context.dataset.label}: ${context.raw.toFixed(1)}h`;
                        } else {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    };

    if (currentChartType === 'scatter') {
        chartOptions.scales = {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Cognitive Load'
                },
                min: 1,
                max: 10,
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Sleep Quality'
                },
                min: 1,
                max: 10,
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            }
        };
    } else if (currentChartType === 'stacked') {
        chartOptions.scales = {
            x: {
                stacked: true,
                grid: {
                    display: false
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Hours'
                },
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            }
        };
    } else {
        chartOptions.scales = {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Load/Quality (1-10)'
                },
                min: 1,
                max: 10,
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Work Hours'
                },
                min: 0,
                max: 24,
                grid: {
                    drawOnChartArea: false,
                },
            }
        };
    }

    chartInstance = new Chart(context, {
        type: currentChartType === 'scatter' ? 'bubble' : (currentChartType === 'stacked' ? 'line' : 'line'),
        data: chartConfig,
        options: chartOptions
    });
}

// Render heat map calendar
function renderHeatMap() {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;
    
    if (entries.length === 0) {
        container.innerHTML = '<div class="no-data-message"><i class="fas fa-calendar-alt"></i><p>No data available for heat map</p></div>';
        return;
    }
    
    // Get last 90 days of data
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const recentEntries = entries.filter(entry => new Date(entry.date) >= ninetyDaysAgo);
    
    // Create a map of date to productivity score
    const productivityMap = {};
    recentEntries.forEach(entry => {
        // Calculate productivity score based on cognitive load and sleep quality
        const productivityScore = (entry.sleepQuality / 10) * (10 / entry.cognitiveLoad) * entry.workHours;
        productivityMap[entry.date] = Math.min(4, Math.floor(productivityScore)); // Scale to 0-4
    });
    
    // Generate calendar data
    const calendarHTML = generateHeatMapCalendar(productivityMap, ninetyDaysAgo);
    container.innerHTML = calendarHTML;
}

// Generate heat map calendar HTML
function generateHeatMapCalendar(productivityMap, startDate) {
    const months = [];
    const currentDate = new Date(startDate);
    const endDate = new Date();
    
    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Find first day of month (0 = Sunday)
        const firstDay = new Date(year, month, 1).getDay();
        
        let monthHTML = `
            <div class="heatmap-month-label">${monthName} ${year}</div>
            <div class="heatmap-day-label">Sun</div>
            <div class="heatmap-day-label">Mon</div>
            <div class="heatmap-day-label">Tue</div>
            <div class="heatmap-day-label">Wed</div>
            <div class="heatmap-day-label">Thu</div>
            <div class="heatmap-day-label">Fri</div>
            <div class="heatmap-day-label">Sat</div>
        `;
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            monthHTML += '<div class="heatmap-cell"></div>';
        }
        
        // Add cells for each day
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const value = productivityMap[dateStr] !== undefined ? productivityMap[dateStr] : 0;
            const hasData = productivityMap[dateStr] !== undefined;
            
            const tooltip = hasData ? 
                `${new Date(dateStr).toLocaleDateString()}: Productivity Level ${value + 1}/5` : 
                `${new Date(dateStr).toLocaleDateString()}: No data`;
            
            monthHTML += `
                <div class="heatmap-cell" data-value="${value}" title="${tooltip}">
                    ${day}
                    <span class="heatmap-tooltip">${tooltip}</span>
                </div>
            `;
        }
        
        months.push(`<div class="heatmap-calendar">${monthHTML}</div>`);
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1);
    }
    
    return months.join('');
}

// Render correlation matrix
function renderCorrelationMatrix() {
    const container = document.getElementById('correlationMatrix');
    if (!container) return;
    
    if (entries.length < 3) {
        container.innerHTML = '<div class="no-data-message"><i class="fas fa-chart-line"></i><p>Need at least 3 entries to calculate correlations</p></div>';
        return;
    }
    
    const workHours = entries.map(e => e.workHours);
    const cognitiveLoad = entries.map(e => e.cognitiveLoad);
    const sleepHours = entries.map(e => e.sleepHours);
    const sleepQuality = entries.map(e => e.sleepQuality);
    
    // Calculate all correlations
    const correlations = {
        workLoad: calculateCorrelation(workHours, cognitiveLoad),
        workSleepHours: calculateCorrelation(workHours, sleepHours),
        workSleepQuality: calculateCorrelation(workHours, sleepQuality),
        loadSleepHours: calculateCorrelation(cognitiveLoad, sleepHours),
        loadSleepQuality: calculateCorrelation(cognitiveLoad, sleepQuality),
        sleepHoursQuality: calculateCorrelation(sleepHours, sleepQuality)
    };
    
    // Get correlation class
    function getCorrelationClass(value) {
        if (value > 0.7) return 'positive-high';
        if (value > 0.4) return 'positive-moderate';
        if (value > 0.1) return 'positive-low';
        if (value < -0.7) return 'negative-high';
        if (value < -0.4) return 'negative-moderate';
        if (value < -0.1) return 'negative-low';
        return 'neutral';
    }
    
    // Generate insights
    let insights = [];
    if (correlations.loadSleepQuality < -0.5) {
        insights.push('Strong negative correlation: Higher cognitive load significantly reduces sleep quality');
    }
    if (correlations.workSleepHours < -0.3) {
        insights.push('Working more hours tends to reduce sleep duration');
    }
    if (correlations.sleepHoursQuality > 0.6) {
        insights.push('Sleep duration strongly correlates with sleep quality');
    }
    if (correlations.workLoad > 0.7) {
        insights.push('Work hours strongly correlate with cognitive load - longer days mean more mental effort');
    }
    
    const matrixHTML = `
        <div class="matrix-grid">
            <div class="matrix-header"></div>
            <div class="matrix-header">Work Hours</div>
            <div class="matrix-header">Cognitive Load</div>
            <div class="matrix-header">Sleep Hours</div>
            <div class="matrix-header">Sleep Quality</div>
            
            <div class="matrix-label">Work Hours</div>
            <div class="matrix-cell positive-high">1.00</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.workLoad)}">${correlations.workLoad.toFixed(2)}</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.workSleepHours)}">${correlations.workSleepHours.toFixed(2)}</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.workSleepQuality)}">${correlations.workSleepQuality.toFixed(2)}</div>
            
            <div class="matrix-label">Cognitive Load</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.workLoad)}">${correlations.workLoad.toFixed(2)}</div>
            <div class="matrix-cell positive-high">1.00</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.loadSleepHours)}">${correlations.loadSleepHours.toFixed(2)}</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.loadSleepQuality)}">${correlations.loadSleepQuality.toFixed(2)}</div>
            
            <div class="matrix-label">Sleep Hours</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.workSleepHours)}">${correlations.workSleepHours.toFixed(2)}</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.loadSleepHours)}">${correlations.loadSleepHours.toFixed(2)}</div>
            <div class="matrix-cell positive-high">1.00</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.sleepHoursQuality)}">${correlations.sleepHoursQuality.toFixed(2)}</div>
            
            <div class="matrix-label">Sleep Quality</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.workSleepQuality)}">${correlations.workSleepQuality.toFixed(2)}</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.loadSleepQuality)}">${correlations.loadSleepQuality.toFixed(2)}</div>
            <div class="matrix-cell ${getCorrelationClass(correlations.sleepHoursQuality)}">${correlations.sleepHoursQuality.toFixed(2)}</div>
            <div class="matrix-cell positive-high">1.00</div>
        </div>
        
        <div class="matrix-insight">
            <h4><i class="fas fa-lightbulb"></i> Correlation Insights</h4>
            ${insights.length > 0 ? insights.map(i => `<p>• ${i}</p>`).join('') : '<p>No strong correlations detected yet. Continue logging to see patterns.</p>'}
        </div>
    `;
    
    container.innerHTML = matrixHTML;
}

// Toggle filters visibility
function toggleFilters() {
    const filterSection = document.getElementById('filterSection');
    const toggleBtn = document.querySelector('.toggle-filters-btn');
    
    if (!filterSection || !toggleBtn) return;
    
    filtersVisible = !filtersVisible;
    filterSection.style.display = filtersVisible ? 'block' : 'none';
    toggleBtn.innerHTML = filtersVisible ? 
        '<i class="fas fa-sliders-h"></i> Hide Filters' : 
        '<i class="fas fa-sliders-h"></i> Show Filters';
}

// Toggle filter panel content
function toggleFilterPanel() {
    const filterContent = document.getElementById('filterContent');
    const chevron = document.getElementById('filterChevron');
    
    if (!filterContent || !chevron) return;
    
    filterContent.classList.toggle('collapsed');
    chevron.classList.toggle('fa-chevron-up');
    chevron.classList.toggle('fa-chevron-down');
}

// Sync functions for range inputs
function syncLoadMin() {
    const slider = document.getElementById('filterLoadMinSlider');
    const input = document.getElementById('filterLoadMin');
    const maxSlider = document.getElementById('filterLoadMaxSlider');
    
    if (!slider || !input || !maxSlider) return;
    
    let value = parseInt(slider.value);
    let max = parseInt(maxSlider.value);
    
    if (value > max) {
        value = max;
        slider.value = max;
    }
    
    input.value = value;
}

function syncLoadMax() {
    const slider = document.getElementById('filterLoadMaxSlider');
    const input = document.getElementById('filterLoadMax');
    const minSlider = document.getElementById('filterLoadMinSlider');
    
    if (!slider || !input || !minSlider) return;
    
    let value = parseInt(slider.value);
    let min = parseInt(minSlider.value);
    
    if (value < min) {
        value = min;
        slider.value = min;
    }
    
    input.value = value;
}

function syncQualityMin() {
    const slider = document.getElementById('filterQualityMinSlider');
    const input = document.getElementById('filterQualityMin');
    const maxSlider = document.getElementById('filterQualityMaxSlider');
    
    if (!slider || !input || !maxSlider) return;
    
    let value = parseInt(slider.value);
    let max = parseInt(maxSlider.value);
    
    if (value > max) {
        value = max;
        slider.value = max;
    }
    
    input.value = value;
}

function syncQualityMax() {
    const slider = document.getElementById('filterQualityMaxSlider');
    const input = document.getElementById('filterQualityMax');
    const minSlider = document.getElementById('filterQualityMinSlider');
    
    if (!slider || !input || !minSlider) return;
    
    let value = parseInt(slider.value);
    let min = parseInt(minSlider.value);
    
    if (value < min) {
        value = min;
        slider.value = min;
    }
    
    input.value = value;
}

function syncSleepHoursMin() {
    const slider = document.getElementById('filterSleepHoursMinSlider');
    const input = document.getElementById('filterSleepHoursMin');
    const maxSlider = document.getElementById('filterSleepHoursMaxSlider');
    
    if (!slider || !input || !maxSlider) return;
    
    let value = parseFloat(slider.value);
    let max = parseFloat(maxSlider.value);
    
    if (value > max) {
        value = max;
        slider.value = max;
    }
    
    input.value = value;
}

function syncSleepHoursMax() {
    const slider = document.getElementById('filterSleepHoursMaxSlider');
    const input = document.getElementById('filterSleepHoursMax');
    const minSlider = document.getElementById('filterSleepHoursMinSlider');
    
    if (!slider || !input || !minSlider) return;
    
    let value = parseFloat(slider.value);
    let min = parseFloat(minSlider.value);
    
    if (value < min) {
        value = min;
        slider.value = min;
    }
    
    input.value = value;
}

function syncWorkHoursMin() {
    const slider = document.getElementById('filterWorkHoursMinSlider');
    const input = document.getElementById('filterWorkHoursMin');
    const maxSlider = document.getElementById('filterWorkHoursMaxSlider');
    
    if (!slider || !input || !maxSlider) return;
    
    let value = parseFloat(slider.value);
    let max = parseFloat(maxSlider.value);
    
    if (value > max) {
        value = max;
        slider.value = max;
    }
    
    input.value = value;
}

function syncWorkHoursMax() {
    const slider = document.getElementById('filterWorkHoursMaxSlider');
    const input = document.getElementById('filterWorkHoursMax');
    const minSlider = document.getElementById('filterWorkHoursMinSlider');
    
    if (!slider || !input || !minSlider) return;
    
    let value = parseFloat(slider.value);
    let min = parseFloat(minSlider.value);
    
    if (value < min) {
        value = min;
        slider.value = min;
    }
    
    input.value = value;
}

function initializeFilters() {
    // Set default values for filter inputs
    const loadMinInput = document.getElementById('filterLoadMin');
    const loadMaxInput = document.getElementById('filterLoadMax');
    const loadMinSlider = document.getElementById('filterLoadMinSlider');
    const loadMaxSlider = document.getElementById('filterLoadMaxSlider');
    
    if (loadMinInput) loadMinInput.value = 1;
    if (loadMaxInput) loadMaxInput.value = 10;
    if (loadMinSlider) loadMinSlider.value = 1;
    if (loadMaxSlider) loadMaxSlider.value = 10;
    
    const qualityMinInput = document.getElementById('filterQualityMin');
    const qualityMaxInput = document.getElementById('filterQualityMax');
    const qualityMinSlider = document.getElementById('filterQualityMinSlider');
    const qualityMaxSlider = document.getElementById('filterQualityMaxSlider');
    
    if (qualityMinInput) qualityMinInput.value = 1;
    if (qualityMaxInput) qualityMaxInput.value = 10;
    if (qualityMinSlider) qualityMinSlider.value = 1;
    if (qualityMaxSlider) qualityMaxSlider.value = 10;
    
    const sleepHoursMinInput = document.getElementById('filterSleepHoursMin');
    const sleepHoursMaxInput = document.getElementById('filterSleepHoursMax');
    const sleepHoursMinSlider = document.getElementById('filterSleepHoursMinSlider');
    const sleepHoursMaxSlider = document.getElementById('filterSleepHoursMaxSlider');
    
    if (sleepHoursMinInput) sleepHoursMinInput.value = 0;
    if (sleepHoursMaxInput) sleepHoursMaxInput.value = 24;
    if (sleepHoursMinSlider) sleepHoursMinSlider.value = 0;
    if (sleepHoursMaxSlider) sleepHoursMaxSlider.value = 24;
    
    const workHoursMinInput = document.getElementById('filterWorkHoursMin');
    const workHoursMaxInput = document.getElementById('filterWorkHoursMax');
    const workHoursMinSlider = document.getElementById('filterWorkHoursMinSlider');
    const workHoursMaxSlider = document.getElementById('filterWorkHoursMaxSlider');
    
    if (workHoursMinInput) workHoursMinInput.value = 0;
    if (workHoursMaxInput) workHoursMaxInput.value = 24;
    if (workHoursMinSlider) workHoursMinSlider.value = 0;
    if (workHoursMaxSlider) workHoursMaxSlider.value = 24;
    
    // Hide filter section initially
    const filterSection = document.getElementById('filterSection');
    if (filterSection) {
        filterSection.style.display = 'none';
    }
    
    // Hide active filter indicator
    const indicator = document.getElementById('activeFilterIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

function initializeFilterEventListeners() {
    // Load min input
    const filterLoadMin = document.getElementById('filterLoadMin');
    if (filterLoadMin) {
        filterLoadMin.addEventListener('input', function() {
            let value = parseInt(this.value) || 1;
            value = Math.max(1, Math.min(10, value));
            const max = parseInt(document.getElementById('filterLoadMax').value);
            
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            const slider = document.getElementById('filterLoadMinSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Load max input
    const filterLoadMax = document.getElementById('filterLoadMax');
    if (filterLoadMax) {
        filterLoadMax.addEventListener('input', function() {
            let value = parseInt(this.value) || 10;
            value = Math.max(1, Math.min(10, value));
            const min = parseInt(document.getElementById('filterLoadMin').value);
            
            if (value < min) {
                value = min;
                this.value = min;
            }
            
            const slider = document.getElementById('filterLoadMaxSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Quality min input
    const filterQualityMin = document.getElementById('filterQualityMin');
    if (filterQualityMin) {
        filterQualityMin.addEventListener('input', function() {
            let value = parseInt(this.value) || 1;
            value = Math.max(1, Math.min(10, value));
            const max = parseInt(document.getElementById('filterQualityMax').value);
            
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            const slider = document.getElementById('filterQualityMinSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Quality max input
    const filterQualityMax = document.getElementById('filterQualityMax');
    if (filterQualityMax) {
        filterQualityMax.addEventListener('input', function() {
            let value = parseInt(this.value) || 10;
            value = Math.max(1, Math.min(10, value));
            const min = parseInt(document.getElementById('filterQualityMin').value);
            
            if (value < min) {
                value = min;
                this.value = min;
            }
            
            const slider = document.getElementById('filterQualityMaxSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Sleep hours min input
    const filterSleepHoursMin = document.getElementById('filterSleepHoursMin');
    if (filterSleepHoursMin) {
        filterSleepHoursMin.addEventListener('input', function() {
            let value = parseFloat(this.value) || 0;
            value = Math.max(0, Math.min(24, value));
            const max = parseFloat(document.getElementById('filterSleepHoursMax').value);
            
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            const slider = document.getElementById('filterSleepHoursMinSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Sleep hours max input
    const filterSleepHoursMax = document.getElementById('filterSleepHoursMax');
    if (filterSleepHoursMax) {
        filterSleepHoursMax.addEventListener('input', function() {
            let value = parseFloat(this.value) || 24;
            value = Math.max(0, Math.min(24, value));
            const min = parseFloat(document.getElementById('filterSleepHoursMin').value);
            
            if (value < min) {
                value = min;
                this.value = min;
            }
            
            const slider = document.getElementById('filterSleepHoursMaxSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Work hours min input
    const filterWorkHoursMin = document.getElementById('filterWorkHoursMin');
    if (filterWorkHoursMin) {
        filterWorkHoursMin.addEventListener('input', function() {
            let value = parseFloat(this.value) || 0;
            value = Math.max(0, Math.min(24, value));
            const max = parseFloat(document.getElementById('filterWorkHoursMax').value);
            
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            const slider = document.getElementById('filterWorkHoursMinSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Work hours max input
    const filterWorkHoursMax = document.getElementById('filterWorkHoursMax');
    if (filterWorkHoursMax) {
        filterWorkHoursMax.addEventListener('input', function() {
            let value = parseFloat(this.value) || 24;
            value = Math.max(0, Math.min(24, value));
            const min = parseFloat(document.getElementById('filterWorkHoursMin').value);
            
            if (value < min) {
                value = min;
                this.value = min;
            }
            
            const slider = document.getElementById('filterWorkHoursMaxSlider');
            if (slider) slider.value = value;
        });
    }
}

// Apply filters
function applyFilters() {
    // Get filter values
    const dateFromInput = document.getElementById('filterDateFrom');
    const dateToInput = document.getElementById('filterDateTo');
    const loadMinInput = document.getElementById('filterLoadMin');
    const loadMaxInput = document.getElementById('filterLoadMax');
    const qualityMinInput = document.getElementById('filterQualityMin');
    const qualityMaxInput = document.getElementById('filterQualityMax');
    const sleepHoursMinInput = document.getElementById('filterSleepHoursMin');
    const sleepHoursMaxInput = document.getElementById('filterSleepHoursMax');
    const workHoursMinInput = document.getElementById('filterWorkHoursMin');
    const workHoursMaxInput = document.getElementById('filterWorkHoursMax');
    const searchInput = document.getElementById('filterSearch');
    
    filters.dateFrom = dateFromInput ? dateFromInput.value || null : null;
    filters.dateTo = dateToInput ? dateToInput.value || null : null;
    filters.loadMin = loadMinInput ? parseInt(loadMinInput.value) || 1 : 1;
    filters.loadMax = loadMaxInput ? parseInt(loadMaxInput.value) || 10 : 10;
    filters.qualityMin = qualityMinInput ? parseInt(qualityMinInput.value) || 1 : 1;
    filters.qualityMax = qualityMaxInput ? parseInt(qualityMaxInput.value) || 10 : 10;
    filters.sleepHoursMin = sleepHoursMinInput ? parseFloat(sleepHoursMinInput.value) || 0 : 0;
    filters.sleepHoursMax = sleepHoursMaxInput ? parseFloat(sleepHoursMaxInput.value) || 24 : 24;
    filters.workHoursMin = workHoursMinInput ? parseFloat(workHoursMinInput.value) || 0 : 0;
    filters.workHoursMax = workHoursMaxInput ? parseFloat(workHoursMaxInput.value) || 24 : 24;
    filters.searchText = searchInput ? searchInput.value.toLowerCase() : '';
    
    // Update active filters display
    updateActiveFiltersDisplay();
    
    // Update entries list with filters
    updateFilteredEntriesList();
}

// Reset all filters
function resetFilters() {
    // Reset date inputs
    const dateFromInput = document.getElementById('filterDateFrom');
    const dateToInput = document.getElementById('filterDateTo');
    if (dateFromInput) dateFromInput.value = '';
    if (dateToInput) dateToInput.value = '';
    
    // Reset load range
    const loadMinInput = document.getElementById('filterLoadMin');
    const loadMaxInput = document.getElementById('filterLoadMax');
    const loadMinSlider = document.getElementById('filterLoadMinSlider');
    const loadMaxSlider = document.getElementById('filterLoadMaxSlider');
    
    if (loadMinInput) loadMinInput.value = 1;
    if (loadMaxInput) loadMaxInput.value = 10;
    if (loadMinSlider) loadMinSlider.value = 1;
    if (loadMaxSlider) loadMaxSlider.value = 10;
    
    // Reset quality range
    const qualityMinInput = document.getElementById('filterQualityMin');
    const qualityMaxInput = document.getElementById('filterQualityMax');
    const qualityMinSlider = document.getElementById('filterQualityMinSlider');
    const qualityMaxSlider = document.getElementById('filterQualityMaxSlider');
    
    if (qualityMinInput) qualityMinInput.value = 1;
    if (qualityMaxInput) qualityMaxInput.value = 10;
    if (qualityMinSlider) qualityMinSlider.value = 1;
    if (qualityMaxSlider) qualityMaxSlider.value = 10;
    
    // Reset sleep hours range
    const sleepHoursMinInput = document.getElementById('filterSleepHoursMin');
    const sleepHoursMaxInput = document.getElementById('filterSleepHoursMax');
    const sleepHoursMinSlider = document.getElementById('filterSleepHoursMinSlider');
    const sleepHoursMaxSlider = document.getElementById('filterSleepHoursMaxSlider');
    
    if (sleepHoursMinInput) sleepHoursMinInput.value = 0;
    if (sleepHoursMaxInput) sleepHoursMaxInput.value = 24;
    if (sleepHoursMinSlider) sleepHoursMinSlider.value = 0;
    if (sleepHoursMaxSlider) sleepHoursMaxSlider.value = 24;
    
    // Reset work hours range
    const workHoursMinInput = document.getElementById('filterWorkHoursMin');
    const workHoursMaxInput = document.getElementById('filterWorkHoursMax');
    const workHoursMinSlider = document.getElementById('filterWorkHoursMinSlider');
    const workHoursMaxSlider = document.getElementById('filterWorkHoursMaxSlider');
    
    if (workHoursMinInput) workHoursMinInput.value = 0;
    if (workHoursMaxInput) workHoursMaxInput.value = 24;
    if (workHoursMinSlider) workHoursMinSlider.value = 0;
    if (workHoursMaxSlider) workHoursMaxSlider.value = 24;
    
    // Reset search
    const searchInput = document.getElementById('filterSearch');
    if (searchInput) searchInput.value = '';
    
    // Reset filter object
    filters = {
        dateFrom: null,
        dateTo: null,
        loadMin: 1,
        loadMax: 10,
        qualityMin: 1,
        qualityMax: 10,
        sleepHoursMin: 0,
        sleepHoursMax: 24,
        workHoursMin: 0,
        workHoursMax: 24,
        searchText: ''
    };
    
    const indicator = document.getElementById('activeFilterIndicator');
    if (indicator) indicator.style.display = 'none';
    
    const activeFiltersDiv = document.getElementById('activeFilters');
    if (activeFiltersDiv) activeFiltersDiv.innerHTML = '';
    
    updateFilteredEntriesList();
}

// Update active filters display
function updateActiveFiltersDisplay() {
    const activeFiltersDiv = document.getElementById('activeFilters');
    const indicator = document.getElementById('activeFilterIndicator');
    
    if (!activeFiltersDiv || !indicator) return;
    
    let activeFiltersHtml = '<i class="fas fa-filter"></i> Active Filters: ';
    let hasActiveFilters = false;
    
    if (filters.dateFrom) {
        activeFiltersHtml += `<span class="filter-badge">Date from: ${new Date(filters.dateFrom).toLocaleDateString()} <i class="fas fa-times" onclick="removeFilter('dateFrom')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.dateTo) {
        activeFiltersHtml += `<span class="filter-badge">Date to: ${new Date(filters.dateTo).toLocaleDateString()} <i class="fas fa-times" onclick="removeFilter('dateTo')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.loadMin > 1 || filters.loadMax < 10) {
        activeFiltersHtml += `<span class="filter-badge">Load: ${filters.loadMin}-${filters.loadMax} <i class="fas fa-times" onclick="removeFilter('load')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.qualityMin > 1 || filters.qualityMax < 10) {
        activeFiltersHtml += `<span class="filter-badge">Quality: ${filters.qualityMin}-${filters.qualityMax} <i class="fas fa-times" onclick="removeFilter('quality')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.sleepHoursMin > 0 || filters.sleepHoursMax < 24) {
        activeFiltersHtml += `<span class="filter-badge">Sleep Hours: ${filters.sleepHoursMin}-${filters.sleepHoursMax} <i class="fas fa-times" onclick="removeFilter('sleepHours')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.workHoursMin > 0 || filters.workHoursMax < 24) {
        activeFiltersHtml += `<span class="filter-badge">Work Hours: ${filters.workHoursMin}-${filters.workHoursMax} <i class="fas fa-times" onclick="removeFilter('workHours')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.searchText) {
        activeFiltersHtml += `<span class="filter-badge">Search: "${filters.searchText}" <i class="fas fa-times" onclick="removeFilter('search')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (hasActiveFilters) {
        activeFiltersDiv.innerHTML = activeFiltersHtml;
        indicator.style.display = 'inline-flex';
    } else {
        activeFiltersDiv.innerHTML = '<i class="fas fa-info-circle"></i> No active filters';
        indicator.style.display = 'none';
    }
}

// Remove specific filter
function removeFilter(filterType) {
    switch(filterType) {
        case 'dateFrom':
            const dateFromInput = document.getElementById('filterDateFrom');
            if (dateFromInput) dateFromInput.value = '';
            filters.dateFrom = null;
            break;
        case 'dateTo':
            const dateToInput = document.getElementById('filterDateTo');
            if (dateToInput) dateToInput.value = '';
            filters.dateTo = null;
            break;
        case 'load':
            const loadMinInput = document.getElementById('filterLoadMin');
            const loadMaxInput = document.getElementById('filterLoadMax');
            const loadMinSlider = document.getElementById('filterLoadMinSlider');
            const loadMaxSlider = document.getElementById('filterLoadMaxSlider');
            
            if (loadMinInput) loadMinInput.value = 1;
            if (loadMaxInput) loadMaxInput.value = 10;
            if (loadMinSlider) loadMinSlider.value = 1;
            if (loadMaxSlider) loadMaxSlider.value = 10;
            
            filters.loadMin = 1;
            filters.loadMax = 10;
            break;
        case 'quality':
            const qualityMinInput = document.getElementById('filterQualityMin');
            const qualityMaxInput = document.getElementById('filterQualityMax');
            const qualityMinSlider = document.getElementById('filterQualityMinSlider');
            const qualityMaxSlider = document.getElementById('filterQualityMaxSlider');
            
            if (qualityMinInput) qualityMinInput.value = 1;
            if (qualityMaxInput) qualityMaxInput.value = 10;
            if (qualityMinSlider) qualityMinSlider.value = 1;
            if (qualityMaxSlider) qualityMaxSlider.value = 10;
            
            filters.qualityMin = 1;
            filters.qualityMax = 10;
            break;
        case 'sleepHours':
            const sleepHoursMinInput = document.getElementById('filterSleepHoursMin');
            const sleepHoursMaxInput = document.getElementById('filterSleepHoursMax');
            const sleepHoursMinSlider = document.getElementById('filterSleepHoursMinSlider');
            const sleepHoursMaxSlider = document.getElementById('filterSleepHoursMaxSlider');
            
            if (sleepHoursMinInput) sleepHoursMinInput.value = 0;
            if (sleepHoursMaxInput) sleepHoursMaxInput.value = 24;
            if (sleepHoursMinSlider) sleepHoursMinSlider.value = 0;
            if (sleepHoursMaxSlider) sleepHoursMaxSlider.value = 24;
            
            filters.sleepHoursMin = 0;
            filters.sleepHoursMax = 24;
            break;
        case 'workHours':
            const workHoursMinInput = document.getElementById('filterWorkHoursMin');
            const workHoursMaxInput = document.getElementById('filterWorkHoursMax');
            const workHoursMinSlider = document.getElementById('filterWorkHoursMinSlider');
            const workHoursMaxSlider = document.getElementById('filterWorkHoursMaxSlider');
            
            if (workHoursMinInput) workHoursMinInput.value = 0;
            if (workHoursMaxInput) workHoursMaxInput.value = 24;
            if (workHoursMinSlider) workHoursMinSlider.value = 0;
            if (workHoursMaxSlider) workHoursMaxSlider.value = 24;
            
            filters.workHoursMin = 0;
            filters.workHoursMax = 24;
            break;
        case 'search':
            const searchInput = document.getElementById('filterSearch');
            if (searchInput) searchInput.value = '';
            filters.searchText = '';
            break;
    }
    
    applyFilters();
}

// Filter entries based on current filters
function filterEntries(entriesToFilter = entries) {
    return entriesToFilter.filter(entry => {
        // Date range filter
        if (filters.dateFrom && new Date(entry.date) < new Date(filters.dateFrom)) {
            return false;
        }
        if (filters.dateTo) {
            const entryDate = new Date(entry.date);
            const filterDateTo = new Date(filters.dateTo);
            filterDateTo.setHours(23, 59, 59, 999); // Include the entire end date
            if (entryDate > filterDateTo) {
                return false;
            }
        }
        
        // Cognitive load range
        if (entry.cognitiveLoad < filters.loadMin || entry.cognitiveLoad > filters.loadMax) {
            return false;
        }
        
        // Sleep quality range
        if (entry.sleepQuality < filters.qualityMin || entry.sleepQuality > filters.qualityMax) {
            return false;
        }
        
        // Sleep hours range
        if (entry.sleepHours < filters.sleepHoursMin || entry.sleepHours > filters.sleepHoursMax) {
            return false;
        }
        
        // Work hours range
        if (entry.workHours < filters.workHoursMin || entry.workHours > filters.workHoursMax) {
            return false;
        }
        
        // Text search in notes
        if (filters.searchText) {
            const workNotesMatch = entry.workNotes && entry.workNotes.toLowerCase().includes(filters.searchText);
            const sleepNotesMatch = entry.sleepNotes && entry.sleepNotes.toLowerCase().includes(filters.searchText);
            if (!workNotesMatch && !sleepNotesMatch) {
                return false;
            }
        }
        
        return true;
    });
}

// Update entries list with filters
function updateFilteredEntriesList() {
    const entriesList = document.getElementById('entriesList');
    if (!entriesList) return;
    
    const filteredEntries = filterEntries();
    const filteredCount = filteredEntries.length;
    const totalCount = entries.length;
    
    if (filteredEntries.length === 0) {
        entriesList.innerHTML = `
            <div class="no-filter-results">
                <i class="fas fa-filter"></i>
                <p>No entries match your filters</p>
                <button onclick="resetFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    // Show last 7 filtered entries
    const recentFilteredEntries = filteredEntries.slice(-7).reverse();
    
    entriesList.innerHTML = '';
    
    // Add filter summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'filter-stats';
    summaryDiv.innerHTML = `
        <i class="fas fa-list"></i> Showing ${filteredCount} of ${totalCount} entries
        ${filteredCount !== totalCount ? '(filtered)' : ''}
    `;
    entriesList.appendChild(summaryDiv);
    
    recentFilteredEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        
        // Add highlight class if entry matches search
        if (filters.searchText && (
            (entry.workNotes && entry.workNotes.toLowerCase().includes(filters.searchText)) ||
            (entry.sleepNotes && entry.sleepNotes.toLowerCase().includes(filters.searchText))
        )) {
            entryDiv.classList.add('filtered-match');
        }
        
        const workLoadClass = entry.cognitiveLoad >= 8 ? 'work-high' :
                            entry.cognitiveLoad >= 5 ? 'work-medium' : 'work-low';
        const sleepQualityClass = entry.sleepQuality >= 8 ? 'sleep-high' :
                                entry.sleepQuality >= 5 ? 'sleep-medium' : 'sleep-low';
        
        // Highlight search text in notes
        let workNotesHtml = entry.workNotes || '';
        let sleepNotesHtml = entry.sleepNotes || '';
        
        if (filters.searchText) {
            const regex = new RegExp(`(${filters.searchText})`, 'gi');
            workNotesHtml = workNotesHtml.replace(regex, '<mark>$1</mark>');
            sleepNotesHtml = sleepNotesHtml.replace(regex, '<mark>$1</mark>');
        }
        
        entryDiv.innerHTML = `
            <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>
            
            <div class="work-data">
                <h4>Work</h4>
                <div class="work-metric">
                    <span class="metric-label">Hours:</span>
                    <span class="metric-value">${entry.workHours}h</span>
                </div>
                <div class="work-metric">
                    <span class="metric-label">Load:</span>
                    <span class="metric-value ${workLoadClass}">${entry.cognitiveLoad}/10</span>
                </div>
            </div>
            
            <div class="sleep-data">
                <h4>Sleep</h4>
                <div class="sleep-metric">
                    <span class="metric-label">Hours:</span>
                    <span class="metric-value">${entry.sleepHours}h</span>
                </div>
                <div class="sleep-metric">
                    <span class="metric-label">Quality:</span>
                    <span class="metric-value ${sleepQualityClass}">${entry.sleepQuality}/10</span>
                </div>
            </div>
            
            ${(entry.workNotes || entry.sleepNotes) ? `
            <div class="entry-notes">
                ${entry.workNotes ? `<div><strong>Work Notes:</strong> ${workNotesHtml}</div>` : ''}
                ${entry.sleepNotes ? `<div><strong>Sleep Notes:</strong> ${sleepNotesHtml}</div>` : ''}
            </div>
            ` : ''}
            
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;
        
        entriesList.appendChild(entryDiv);
    });
}

// Override the original updateEntriesList to use filtered version
function updateEntriesList() {
    updateFilteredEntriesList();
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('cognitiveLoadSleepEntries', JSON.stringify(entries));
        updateStats(); 
        updateChart();
        updateEntriesList();
        updateSleepDebtCalculator();
        renderHeatMap();
        renderCorrelationMatrix();
        calculateBurnoutRisk(); // Update burnout risk
        renderRiskHistoryChart(); // Update risk history
    }
}

// Character counter functionality
function initializeCharacterCounters() {
    const workNotes = document.getElementById('workNotes');
    const sleepNotes = document.getElementById('sleepNotes');
    const workCounter = document.getElementById('workNotesCounter');
    const sleepCounter = document.getElementById('sleepNotesCounter');
    const workCountSpan = document.getElementById('workNotesCount');
    const sleepCountSpan = document.getElementById('sleepNotesCount');
    
    const MAX_CHARS = 500;
    
    function updateCounter(textarea, counterElement, countSpan) {
        if (!textarea || !counterElement || !countSpan) return;
        
        const currentLength = textarea.value.length;
        const remaining = MAX_CHARS - currentLength;
        
        // Update count display
        countSpan.textContent = currentLength;
        counterElement.innerHTML = `<i class="fas fa-keyboard"></i> ${currentLength}/${MAX_CHARS} characters`;
        
        // Remove existing classes
        counterElement.classList.remove('warning', 'danger');
        
        // Add appropriate class based on remaining characters
        if (currentLength >= MAX_CHARS) {
            counterElement.classList.add('danger');
            counterElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${currentLength}/${MAX_CHARS} characters (maximum reached)`;
        } else if (currentLength >= MAX_CHARS * 0.8) {
            counterElement.classList.add('warning');
            counterElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${currentLength}/${MAX_CHARS} characters (${remaining} left)`;
        } else if (currentLength > 0) {
            counterElement.innerHTML = `<i class="fas fa-check-circle"></i> ${currentLength}/${MAX_CHARS} characters (${remaining} left)`;
        }
        
        // Add title attribute for tooltip
        counterElement.title = `${remaining} characters remaining`;
    }
    
    if (workNotes && workCounter && workCountSpan) {
        // Add input event listener
        workNotes.addEventListener('input', function() {
            updateCounter(this, workCounter, workCountSpan);
        });
        
        // Add paste event to handle large pastes
        workNotes.addEventListener('paste', function(e) {
            setTimeout(() => {
                updateCounter(this, workCounter, workCountSpan);
            }, 0);
        });
        
        // Add cut event
        workNotes.addEventListener('cut', function() {
            setTimeout(() => {
                updateCounter(this, workCounter, workCountSpan);
            }, 0);
        });
        
        // Initialize counter
        updateCounter(workNotes, workCounter, workCountSpan);
    }
    
    if (sleepNotes && sleepCounter && sleepCountSpan) {
        // Add input event listener
        sleepNotes.addEventListener('input', function() {
            updateCounter(this, sleepCounter, sleepCountSpan);
        });
        
        // Add paste event to handle large pastes
        sleepNotes.addEventListener('paste', function(e) {
            setTimeout(() => {
                updateCounter(this, sleepCounter, sleepCountSpan);
            }, 0);
        });
        
        // Add cut event
        sleepNotes.addEventListener('cut', function() {
            setTimeout(() => {
                updateCounter(this, sleepCounter, sleepCountSpan);
            }, 0);
        });
        
        // Initialize counter
        updateCounter(sleepNotes, sleepCounter, sleepCountSpan);
    }
}

// Enhanced logEntry function with character count validation
function logEntry() {
    const date = document.getElementById('logDate').value;
    const workHours = parseFloat(document.getElementById('workHours').value);
    const cognitiveLoad = parseInt(document.getElementById('cognitiveLoad').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
    const workNotes = document.getElementById('workNotes').value.trim();
    const sleepNotes = document.getElementById('sleepNotes').value.trim();
    
    const MAX_CHARS = 500;
    
    // Validate character limits
    if (workNotes.length > MAX_CHARS) {
        showNotificationToast(
            'Character Limit Exceeded', 
            `Work notes cannot exceed ${MAX_CHARS} characters. Current: ${workNotes.length}`, 
            'danger'
        );
        document.getElementById('workNotes').focus();
        return;
    }
    
    if (sleepNotes.length > MAX_CHARS) {
        showNotificationToast(
            'Character Limit Exceeded', 
            `Sleep notes cannot exceed ${MAX_CHARS} characters. Current: ${sleepNotes.length}`, 
            'danger'
        );
        document.getElementById('sleepNotes').focus();
        return;
    }

    if (!date) {
        showNotificationToast('Missing Information', 'Please select a date.', 'warning');
        return;
    }

    if (isNaN(workHours) || workHours < 0 || workHours > 24) {
        showNotificationToast('Invalid Input', 'Please enter valid work hours (0-24).', 'warning');
        return;
    }

    if (isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
        showNotificationToast('Invalid Input', 'Please enter valid sleep hours (0-24).', 'warning');
        return;
    }

    const existingEntry = entries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        entries = entries.filter(entry => entry.date !== date);
    }

    const entry = {
        id: Date.now(),
        date,
        workHours,
        cognitiveLoad,
        sleepHours,
        sleepQuality,
        workNotes,
        sleepNotes
    };

    entries.push(entry);

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (entries.length > 100) {
        entries = entries.slice(-100);
    }

    localStorage.setItem('cognitiveLoadSleepEntries', JSON.stringify(entries));

    // Show success notification
    showNotificationToast('Success', 'Entry logged successfully!', 'success');
    
    resetForm();

    updateStats(); 
    updateChart();
    updateEntriesList();
    updateSleepDebtCalculator();
    renderHeatMap();
    renderCorrelationMatrix();
    calculateBurnoutRisk();
    renderRiskHistoryChart();
    
    setTimeout(() => {
        checkBurnoutRisk();
    }, 500);
}

// Enhanced resetForm function to reset character counters
function resetForm() {
    const dateInput = document.getElementById('logDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    const workHoursInput = document.getElementById('workHours');
    if (workHoursInput) workHoursInput.value = '';
    
    const cognitiveLoadInput = document.getElementById('cognitiveLoad');
    if (cognitiveLoadInput) cognitiveLoadInput.value = 5;
    
    const sleepHoursInput = document.getElementById('sleepHours');
    if (sleepHoursInput) sleepHoursInput.value = '';
    
    const sleepQualityInput = document.getElementById('sleepQuality');
    if (sleepQualityInput) sleepQualityInput.value = 7;
    
    const workNotes = document.getElementById('workNotes');
    const sleepNotes = document.getElementById('sleepNotes');
    if (workNotes) workNotes.value = '';
    if (sleepNotes) sleepNotes.value = '';
    
    updateLoadValue();
    updateQualityValue();
    
    // Reset character counters
    const workCounter = document.getElementById('workNotesCounter');
    const sleepCounter = document.getElementById('sleepNotesCounter');
    const workCountSpan = document.getElementById('workNotesCount');
    const sleepCountSpan = document.getElementById('sleepNotesCount');
    
    if (workCounter && workCountSpan) {
        workCountSpan.textContent = '0';
        workCounter.innerHTML = '<i class="fas fa-keyboard"></i> 0/500 characters';
        workCounter.classList.remove('warning', 'danger');
    }
    
    if (sleepCounter && sleepCountSpan) {
        sleepCountSpan.textContent = '0';
        sleepCounter.innerHTML = '<i class="fas fa-keyboard"></i> 0/500 characters';
        sleepCounter.classList.remove('warning', 'danger');
    }
    
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            resetBtn.style.backgroundColor = '#6c757d';
        }, 200);
    }
}

function updateSleepGoal() {
    const goalInput = document.getElementById('sleepGoal');
    if (!goalInput) return;
    
    const newGoal = parseFloat(goalInput.value);
    
    if (isNaN(newGoal) || newGoal < 4 || newGoal > 12) {
        alert('Please enter a valid sleep goal between 4 and 12 hours.');
        goalInput.value = sleepGoal;
        return;
    }
    
    sleepGoal = newGoal;
    localStorage.setItem('sleepGoal', sleepGoal);
    
    goalInput.style.borderColor = '#28a745';
    setTimeout(() => {
        goalInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }, 500);
    
    updateSleepDebtCalculator();
    calculateBurnoutRisk(); // Recalculate burnout risk when sleep goal changes
}

function calculateSleepDebt() {
    if (entries.length === 0) {
        return {
            totalDebt: 0,
            weeklyDebt: 0,
            avgSleep: 0,
            dailyDebts: []
        };
    }
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let totalDebt = 0;
    const dailyDebts = [];
    
    sortedEntries.forEach(entry => {
        const debt = entry.sleepHours - sleepGoal;
        totalDebt += debt;
        dailyDebts.push({
            date: entry.date,
            debt: debt,
            sleepHours: entry.sleepHours
        });
    });
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = sortedEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
    
    const weeklyDebt = recentEntries.reduce((sum, entry) => sum + (entry.sleepHours - sleepGoal), 0);
    
    const avgSleep = entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length;
    
    return {
        totalDebt: totalDebt,
        weeklyDebt: weeklyDebt,
        avgSleep: avgSleep,
        dailyDebts: dailyDebts.slice(-14) 
    };
}

function updateSleepDebtCalculator() {
    const debtData = calculateSleepDebt();
    
    const totalDebtEl = document.getElementById('totalSleepDebt');
    const avgSleepEl = document.getElementById('avgSleepHours');
    const avgVsGoalEl = document.getElementById('avgVsGoal');
    const weeklyDebtEl = document.getElementById('weeklySleepDebt');
    
    if (totalDebtEl) {
        const totalDebtFormatted = debtData.totalDebt.toFixed(1);
        totalDebtEl.textContent = `${totalDebtFormatted}h`;
        totalDebtEl.style.color = debtData.totalDebt < 0 ? '#dc3545' : '#28a745';
    }
    
    if (avgSleepEl) {
        avgSleepEl.textContent = `${debtData.avgSleep.toFixed(1)}h`;
    }
    
    if (avgVsGoalEl) {
        const diff = (debtData.avgSleep - sleepGoal).toFixed(1);
        avgVsGoalEl.textContent = `vs ${sleepGoal.toFixed(1)}h goal (${diff > 0 ? '+' : ''}${diff}h)`;
        avgVsGoalEl.style.color = diff < 0 ? '#dc3545' : '#28a745';
    }
    
    if (weeklyDebtEl) {
        weeklyDebtEl.textContent = `${debtData.weeklyDebt.toFixed(1)}h`;
        weeklyDebtEl.style.color = debtData.weeklyDebt < 0 ? '#dc3545' : '#28a745';
    }
    
    updateDebtAlertLevel(debtData);
    
    updateDebtHistory(debtData.dailyDebts);
}

function updateDebtAlertLevel(debtData) {
    const alertLevelEl = document.getElementById('debtAlertLevel');
    const progressFillEl = document.getElementById('debtProgressFill');
    const warningMessageEl = document.getElementById('debtWarningMessage');
    
    if (!alertLevelEl || !progressFillEl || !warningMessageEl) return;
    
    const totalDebt = debtData.totalDebt;
    const maxDebtThreshold = 14; 
    const debtPercentage = Math.min(Math.abs(Math.min(totalDebt, 0)) / maxDebtThreshold * 100, 100);
    
    progressFillEl.style.width = `${debtPercentage}%`;
    
    let alertLevel = 'Healthy';
    let alertClass = '';
    let message = '';
    
    if (totalDebt < -10) {
        alertLevel = 'Severe';
        alertClass = 'danger';
        message = '⚠️ Critical: You have accumulated severe sleep debt. Consider taking time to rest and recover.';
    } else if (totalDebt < -5) {
        alertLevel = 'High';
        alertClass = 'danger';
        message = '⚠️ Warning: Your sleep debt is building up. Try to get extra rest when possible.';
    } else if (totalDebt < -2) {
        alertLevel = 'Moderate';
        alertClass = 'warning';
        message = '⚡ Moderate sleep debt detected. Aim for a few early nights to catch up.';
    } else if (totalDebt < 0) {
        alertLevel = 'Low';
        alertClass = 'warning';
        message = '💤 Mild sleep debt. Pay attention to your sleep schedule.';
    } else {
        alertLevel = 'Healthy';
        alertClass = '';
        message = '✅ Great job! You\'re meeting or exceeding your sleep goal.';
    }
    
    alertLevelEl.textContent = alertLevel;
    alertLevelEl.className = alertClass;
    
    warningMessageEl.textContent = message;
    warningMessageEl.className = `debt-warning-message ${alertClass}`;
    
    if (totalDebt < -10) {
        progressFillEl.style.background = 'linear-gradient(90deg, #dc3545, #ff6b6b)';
    } else if (totalDebt < -5) {
        progressFillEl.style.background = 'linear-gradient(90deg, #ffc107, #dc3545)';
    } else if (totalDebt < 0) {
        progressFillEl.style.background = 'linear-gradient(90deg, #28a745, #ffc107)';
    } else {
        progressFillEl.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
    }
}

function updateDebtHistory(dailyDebts) {
    const debtHistoryEl = document.getElementById('debtHistory');
    if (!debtHistoryEl) return;
    
    if (dailyDebts.length === 0) {
        debtHistoryEl.innerHTML = '<div class="debt-history-item">No sleep data available</div>';
        return;
    }
    
    const recentDebts = dailyDebts.slice(-7).reverse();
    
    debtHistoryEl.innerHTML = recentDebts.map(day => {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const debtValue = day.debt.toFixed(1);
        const debtClass = day.debt < 0 ? 'debt-history-deficit' : 'debt-history-surplus';
        const debtSymbol = day.debt < 0 ? '' : '+';
        
        return `
            <div class="debt-history-item">
                <span class="debt-history-date">${formattedDate}</span>
                <span class="debt-history-value ${debtClass}">
                    ${debtSymbol}${debtValue}h (${day.sleepHours.toFixed(1)}h)
                </span>
            </div>
        `;
    }).join('');
}

// ============== NEW BURNOUT RISK FUNCTIONS ==============

// Calculate burnout risk score
function calculateBurnoutRisk() {
    if (entries.length < 3) {
        displayNoDataBurnoutRisk();
        return;
    }
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recentEntries = sortedEntries.slice(-14); // Last 14 days for analysis
    
    // Calculate risk factors
    const consecutiveHighLoadScore = calculateConsecutiveHighLoadRisk(recentEntries);
    const sleepDebtScore = calculateSleepDebtRisk();
    const sleepDeclineScore = calculateSleepDeclineRisk(recentEntries);
    
    // Weighted total score (0-100)
    const totalRiskScore = Math.min(100, Math.round(
        (consecutiveHighLoadScore * 0.4) + 
        (sleepDebtScore * 0.35) + 
        (sleepDeclineScore * 0.25)
    ));
    
    // Update UI
    updateBurnoutRiskUI(totalRiskScore, {
        consecutive: consecutiveHighLoadScore,
        sleepDebt: sleepDebtScore,
        sleepDecline: sleepDeclineScore
    });
    
    // Save to history
    saveRiskToHistory(totalRiskScore);
    
    return totalRiskScore;
}

// Calculate risk from consecutive high-load days
function calculateConsecutiveHighLoadRisk(entries) {
    if (entries.length === 0) return 0;
    
    let maxConsecutive = 0;
    let currentStreak = 0;
    
    entries.forEach(entry => {
        if (entry.cognitiveLoad >= 7) { // High load threshold
            currentStreak++;
            maxConsecutive = Math.max(maxConsecutive, currentStreak);
        } else {
            currentStreak = 0;
        }
    });
    
    // Convert to risk score (0-100)
    if (maxConsecutive === 0) return 0;
    if (maxConsecutive === 1) return 20;
    if (maxConsecutive === 2) return 40;
    if (maxConsecutive === 3) return 60;
    if (maxConsecutive === 4) return 80;
    return 100; // 5+ consecutive days
}

// Calculate risk from sleep debt
function calculateSleepDebtRisk() {
    const debtData = calculateSleepDebt();
    const totalDebt = debtData.totalDebt;
    
    // Convert to risk score (0-100)
    if (totalDebt >= 0) return 0; // No debt or surplus
    if (totalDebt > -5) return 25; // Mild debt
    if (totalDebt > -10) return 50; // Moderate debt
    if (totalDebt > -15) return 75; // High debt
    return 100; // Severe debt (>15 hours deficit)
}

// Calculate risk from declining sleep quality
function calculateSleepDeclineRisk(entries) {
    if (entries.length < 7) return 0;
    
    // Split into recent and older
    const recentWeek = entries.slice(-7);
    const previousWeek = entries.slice(-14, -7);
    
    if (previousWeek.length === 0) return 0;
    
    const avgRecent = recentWeek.reduce((sum, e) => sum + e.sleepQuality, 0) / recentWeek.length;
    const avgPrevious = previousWeek.reduce((sum, e) => sum + e.sleepQuality, 0) / previousWeek.length;
    
    const declinePercent = ((avgPrevious - avgRecent) / avgPrevious) * 100;
    
    // Convert to risk score (0-100)
    if (declinePercent <= 0) return 0; // No decline or improvement
    if (declinePercent < 10) return 25; // Mild decline
    if (declinePercent < 20) return 50; // Moderate decline
    if (declinePercent < 30) return 75; // High decline
    return 100; // Severe decline (>30%)
}

// Update burnout risk UI
function updateBurnoutRiskUI(totalScore, factors) {
    // Update risk score
    const riskScoreEl = document.getElementById('burnoutRiskScore');
    const riskFillEl = document.getElementById('burnoutRiskFill');
    const riskStatusEl = document.getElementById('burnoutRiskStatus');
    
    if (riskScoreEl) riskScoreEl.textContent = totalScore;
    if (riskFillEl) riskFillEl.style.width = `${totalScore}%`;
    
    // Update risk status and color
    let status = 'Low Risk';
    let statusClass = 'low-risk';
    
    if (totalScore >= 70) {
        status = 'High Risk';
        statusClass = 'high-risk';
    } else if (totalScore >= 40) {
        status = 'Moderate Risk';
        statusClass = 'moderate-risk';
    }
    
    if (riskStatusEl) {
        riskStatusEl.textContent = status;
        riskStatusEl.className = `risk-status ${statusClass}`;
    }
    
    // Update factor cards
    updateFactorCard('consecutive', factors.consecutive);
    updateFactorCard('sleepDebt', factors.sleepDebt);
    updateFactorCard('sleepDecline', factors.sleepDecline);
    
    // Update recommendations
    updateRiskRecommendations(totalScore, factors);
}

// Update individual factor card
function updateFactorCard(factorType, score) {
    const card = document.getElementById(`factor${capitalizeFirstLetter(factorType)}`);
    if (!card) return;
    
    const valueEl = document.getElementById(`${factorType}Value`);
    const progressEl = document.getElementById(`${factorType}Progress`);
    
    // Update value display
    if (valueEl) {
        if (factorType === 'consecutive') {
            valueEl.textContent = getConsecutiveDaysText(score);
        } else if (factorType === 'sleepDebt') {
            valueEl.textContent = getSleepDebtRiskText(score);
        } else if (factorType === 'sleepDecline') {
            valueEl.textContent = `${score}% decline`;
        }
    }
    
    // Update progress bar
    if (progressEl) {
        progressEl.style.width = `${score}%`;
    }
    
    // Update card styling based on risk level
    card.classList.remove('warning', 'danger');
    if (score >= 70) {
        card.classList.add('danger');
    } else if (score >= 40) {
        card.classList.add('warning');
    }
}

// Helper: Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper: Get text for consecutive days based on score
function getConsecutiveDaysText(score) {
    if (score === 0) return '0 days';
    if (score <= 20) return '1 day';
    if (score <= 40) return '2 days';
    if (score <= 60) return '3 days';
    if (score <= 80) return '4 days';
    return '5+ days';
}

// Helper: Get text for sleep debt risk based on score
function getSleepDebtRiskText(score) {
    if (score === 0) return 'No debt';
    if (score <= 25) return 'Mild debt';
    if (score <= 50) return 'Moderate debt';
    if (score <= 75) return 'High debt';
    return 'Severe debt';
}

// Update risk recommendations
function updateRiskRecommendations(totalScore, factors) {
    const recommendationsEl = document.getElementById('riskRecommendations');
    if (!recommendationsEl) return;
    
    let icon = 'fa-smile';
    let title = 'Low Risk';
    let message = 'You\'re doing great! Maintain your current habits.';
    let riskClass = 'low-risk';
    
    if (totalScore >= 70) {
        icon = 'fa-exclamation-triangle';
        title = 'High Risk';
        riskClass = 'high-risk';
        message = generateHighRiskMessage(factors);
    } else if (totalScore >= 40) {
        icon = 'fa-exclamation-circle';
        title = 'Moderate Risk';
        riskClass = 'moderate-risk';
        message = generateModerateRiskMessage(factors);
    }
    
    recommendationsEl.innerHTML = `
        <div class="recommendation-card ${riskClass}">
            <i class="fas ${icon}"></i>
            <div class="recommendation-text">
                <strong>${title}:</strong> ${message}
            </div>
        </div>
    `;
}

// Generate high risk message based on factors
function generateHighRiskMessage(factors) {
    const messages = [];
    
    if (factors.consecutive >= 80) {
        messages.push('You\'ve had multiple consecutive days of high cognitive load.');
    }
    if (factors.sleepDebt >= 75) {
        messages.push('Severe sleep debt is accumulating.');
    }
    if (factors.sleepDecline >= 75) {
        messages.push('Your sleep quality is declining rapidly.');
    }
    
    if (messages.length === 0) {
        return 'Critical burnout risk detected. Take immediate action to rest and recover.';
    }
    
    return messages.join(' ') + ' Consider taking a day off and prioritizing sleep.';
}

// Generate moderate risk message based on factors
function generateModerateRiskMessage(factors) {
    const messages = [];
    
    if (factors.consecutive >= 50) {
        messages.push('watch your consecutive high-load days');
    }
    if (factors.sleepDebt >= 50) {
        messages.push('pay attention to your sleep debt');
    }
    if (factors.sleepDecline >= 50) {
        messages.push('monitor your declining sleep quality');
    }
    
    if (messages.length === 0) {
        return 'Early warning signs detected. Make small adjustments to prevent burnout.';
    }
    
    return `Moderate risk detected - ${messages.join(', ')}.`;
}

// Save risk score to history
function saveRiskToHistory(score) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have an entry for today
    const existingIndex = riskHistory.findIndex(item => item.date === today);
    
    if (existingIndex !== -1) {
        riskHistory[existingIndex].score = score;
    } else {
        riskHistory.push({
            date: today,
            score: score
        });
    }
    
    // Keep only last 30 days
    if (riskHistory.length > 30) {
        riskHistory = riskHistory.slice(-30);
    }
    
    localStorage.setItem('burnoutRiskHistory', JSON.stringify(riskHistory));
}

// Render risk history chart
function renderRiskHistoryChart() {
    const ctx = document.getElementById('riskHistoryChart');
    if (!ctx) return;
    
    if (riskHistoryChart) {
        riskHistoryChart.destroy();
    }
    
    if (riskHistory.length === 0) {
        ctx.style.display = 'none';
        return;
    }
    
    ctx.style.display = 'block';
    
    const sortedHistory = [...riskHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedHistory.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const scores = sortedHistory.map(item => item.score);
    
    // Determine colors based on scores
    const backgroundColors = scores.map(score => {
        if (score >= 70) return 'rgba(220, 53, 69, 0.2)';
        if (score >= 40) return 'rgba(255, 193, 7, 0.2)';
        return 'rgba(40, 167, 69, 0.2)';
    });
    
    const borderColors = scores.map(score => {
        if (score >= 70) return '#dc3545';
        if (score >= 40) return '#ffc107';
        return '#28a745';
    });
    
    riskHistoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Burnout Risk Score',
                data: scores,
                backgroundColor: backgroundColors,
                borderColor: borderColors[borderColors.length - 1] || '#4fd1ff',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: borderColors,
                pointBorderColor: 'white',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Risk Score: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Display no data state for burnout risk
function displayNoDataBurnoutRisk() {
    const riskScoreEl = document.getElementById('burnoutRiskScore');
    const riskFillEl = document.getElementById('burnoutRiskFill');
    const riskStatusEl = document.getElementById('burnoutRiskStatus');
    
    if (riskScoreEl) riskScoreEl.textContent = '0';
    if (riskFillEl) riskFillEl.style.width = '0%';
    if (riskStatusEl) {
        riskStatusEl.textContent = 'Insufficient Data';
        riskStatusEl.className = 'risk-status low-risk';
    }
    
    // Update factor cards
    updateFactorCard('consecutive', 0);
    updateFactorCard('sleepDebt', 0);
    updateFactorCard('sleepDecline', 0);
    
    // Update recommendations
    const recommendationsEl = document.getElementById('riskRecommendations');
    if (recommendationsEl) {
        recommendationsEl.innerHTML = `
            <div class="recommendation-card low-risk">
                <i class="fas fa-info-circle"></i>
                <div class="recommendation-text">
                    Log at least 3 days of data to see your burnout risk analysis.
                </div>
            </div>
        `;
    }
}

// Export functions to window
window.updateLoadValue = updateLoadValue;
window.updateQualityValue = updateQualityValue;
window.logEntry = logEntry;
window.deleteEntry = deleteEntry;
window.resetForm = resetForm;
window.updateSleepGoal = updateSleepGoal;
window.toggleFilters = toggleFilters;
window.toggleFilterPanel = toggleFilterPanel;
window.syncLoadMin = syncLoadMin;
window.syncLoadMax = syncLoadMax;
window.syncQualityMin = syncQualityMin;
window.syncQualityMax = syncQualityMax;
window.syncSleepHoursMin = syncSleepHoursMin;
window.syncSleepHoursMax = syncSleepHoursMax;
window.syncWorkHoursMin = syncWorkHoursMin;
window.syncWorkHoursMax = syncWorkHoursMax;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.removeFilter = removeFilter;
window.saveNotificationSettings = saveNotificationSettings;
window.requestNotificationPermission = requestNotificationPermission;
window.testNotification = testNotification;
window.checkBurnoutRisk = checkBurnoutRisk;
window.changeChartType = changeChartType;
window.initializeCharacterCounters = initializeCharacterCounters;