class CoreBodyTemperatureMonitor {
    constructor() {
        this.readings = this.loadReadings();
        this.charts = {};
        this.alerts = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDateTime();
        this.updateTodayReadings();
        this.updateAnalysis();
        this.updateTrends();
        this.updateHistory();
        this.updateInsights();
        this.checkAlerts();
    }

    setupEventListeners() {
        const temperatureForm = document.getElementById('temperature-form');
        temperatureForm.addEventListener('submit', (e) => this.handleTemperatureSubmit(e));

        const trendPeriodSelect = document.getElementById('trend-period');
        trendPeriodSelect.addEventListener('change', () => this.updateTrends());
    }

    setDefaultDateTime() {
        const now = new Date();
        const dateInput = document.getElementById('log-date');
        const timeInput = document.getElementById('log-time');

        dateInput.value = now.toISOString().split('T')[0];
        timeInput.value = now.toTimeString().slice(0, 5);
    }

    handleTemperatureSubmit(e) {
        e.preventDefault();

        const readingData = this.getReadingData();
        this.readings.push(readingData);
        this.saveReadings();

        this.resetForm();
        this.updateTodayReadings();
        this.updateAnalysis();
        this.updateTrends();
        this.updateHistory();
        this.updateInsights();
        this.checkAlerts();

        this.showSuccessMessage('Core temperature reading logged successfully!');
    }

    getReadingData() {
        return {
            id: Date.now(),
            date: document.getElementById('log-date').value,
            time: document.getElementById('log-time').value,
            temperature: parseFloat(document.getElementById('temperature').value),
            method: document.getElementById('measurement-method').value,
            activity: document.getElementById('activity-level').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };
    }

    resetForm() {
        document.getElementById('temperature-form').reset();
        this.setDefaultDateTime();
    }

    updateTodayReadings() {
        const today = new Date().toISOString().split('T')[0];
        const todayReadings = this.readings.filter(reading => reading.date === today);

        const container = document.getElementById('today-readings');

        if (todayReadings.length === 0) {
            container.innerHTML = '<p class="no-data">No readings logged today. Start monitoring your core temperature.</p>';
            return;
        }

        // Sort by time
        todayReadings.sort((a, b) => a.time.localeCompare(b.time));

        container.innerHTML = todayReadings.map(reading => this.createReadingHTML(reading)).join('');
        lucide.createIcons();
    }

    createReadingHTML(reading) {
        const tempClass = this.getTemperatureClass(reading.temperature);

        return `
            <div class="reading-item" data-id="${reading.id}">
                <div class="reading-time">${reading.time}</div>
                <div class="reading-temp ${tempClass}">${reading.temperature}°F</div>
                <div class="reading-method">${this.formatMethod(reading.method)}</div>
                <div class="reading-context">${this.formatActivity(reading.activity)}</div>
                <div class="reading-actions">
                    <button class="delete-btn" onclick="monitor.deleteReading(${reading.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getTemperatureClass(temp) {
        if (temp < 97.0) return 'low';
        if (temp >= 97.0 && temp <= 99.5) return 'normal';
        if (temp > 99.5 && temp <= 101.0) return 'elevated';
        return 'high';
    }

    formatMethod(method) {
        const methods = {
            'ingestible-sensor': 'Ingestible',
            'rectal-probe': 'Rectal',
            'esophageal-probe': 'Esophageal',
            'wearable-patch': 'Wearable',
            'manual-entry': 'Manual'
        };
        return methods[method] || method;
    }

    formatActivity(activity) {
        const activities = {
            'resting': 'Resting',
            'light': 'Light',
            'moderate': 'Moderate',
            'intense': 'Intense',
            'recovery': 'Recovery'
        };
        return activities[activity] || activity;
    }

    deleteReading(id) {
        this.readings = this.readings.filter(reading => reading.id !== id);
        this.saveReadings();
        this.updateTodayReadings();
        this.updateAnalysis();
        this.updateTrends();
        this.updateHistory();
        this.checkAlerts();
    }

    updateAnalysis() {
        const today = new Date().toISOString().split('T')[0];
        const todayReadings = this.readings.filter(reading => reading.date === today);

        // Daily Range
        if (todayReadings.length > 0) {
            const temps = todayReadings.map(r => r.temperature);
            const min = Math.min(...temps);
            const max = Math.max(...temps);
            const range = (max - min).toFixed(1);
            document.getElementById('daily-range').textContent = `${range}°F`;
        } else {
            document.getElementById('daily-range').textContent = '0.0°F';
        }

        // Daily Average
        if (todayReadings.length > 0) {
            const avg = todayReadings.reduce((sum, r) => sum + r.temperature, 0) / todayReadings.length;
            document.getElementById('daily-average').textContent = `${avg.toFixed(1)}°F`;
        } else {
            document.getElementById('daily-average').textContent = '0.0°F';
        }

        // Readings Count
        document.getElementById('readings-count').textContent = todayReadings.length;

        // Basal Temperature (earliest morning reading)
        const basalReadings = todayReadings.filter(r => r.activity === 'resting');
        if (basalReadings.length > 0) {
            const basalTemp = basalReadings[0].temperature; // Assuming first resting reading is basal
            document.getElementById('basal-temp').textContent = `${basalTemp.toFixed(1)}°F`;
        } else {
            document.getElementById('basal-temp').textContent = '--';
        }

        this.updateDailyChart(todayReadings);
    }

    updateDailyChart(readings) {
        const ctx = document.getElementById('temperature-chart');
        if (this.charts.daily) {
            this.charts.daily.destroy();
        }

        if (readings.length === 0) {
            ctx.style.display = 'none';
            return;
        }

        ctx.style.display = 'block';

        // Sort readings by time
        readings.sort((a, b) => a.time.localeCompare(b.time));

        const data = {
            labels: readings.map(r => r.time),
            datasets: [{
                label: 'Core Temperature (°F)',
                data: readings.map(r => r.temperature),
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };

        this.charts.daily = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 95,
                        max: 105,
                        title: {
                            display: true,
                            text: 'Temperature (°F)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                }
            }
        });
    }

    updateTrends() {
        const period = parseInt(document.getElementById('trend-period').value);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        const periodReadings = this.readings.filter(reading => {
            const readingDate = new Date(reading.date);
            return readingDate >= startDate && readingDate <= endDate;
        });

        this.updateTrendsChart(periodReadings, period);
    }

    updateTrendsChart(readings, period) {
        const ctx = document.getElementById('trends-chart');
        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        if (readings.length === 0) {
            ctx.style.display = 'none';
            return;
        }

        ctx.style.display = 'block';

        // Group by date and calculate daily averages
        const dailyData = {};
        readings.forEach(reading => {
            if (!dailyData[reading.date]) {
                dailyData[reading.date] = [];
            }
            dailyData[reading.date].push(reading.temperature);
        });

        const dates = Object.keys(dailyData).sort();
        const averages = dates.map(date => {
            const temps = dailyData[date];
            return temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
        });

        const data = {
            labels: dates.map(date => new Date(date).toLocaleDateString()),
            datasets: [{
                label: 'Daily Average Core Temperature (°F)',
                data: averages,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 95,
                        max: 105,
                        title: {
                            display: true,
                            text: 'Temperature (°F)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    checkAlerts() {
        this.alerts = [];
        const today = new Date().toISOString().split('T')[0];
        const todayReadings = this.readings.filter(reading => reading.date === today);

        if (todayReadings.length === 0) {
            this.updateAlertsDisplay();
            return;
        }

        const latestReading = todayReadings[todayReadings.length - 1];
        const temp = latestReading.temperature;

        // Fever alert
        if (temp >= 100.4) {
            this.alerts.push({
                type: 'danger',
                message: `High temperature detected: ${temp}°F. This may indicate fever or infection. Consider consulting a healthcare provider.`,
                icon: 'alert-triangle'
            });
        }

        // Hypothermia alert
        if (temp <= 95.0) {
            this.alerts.push({
                type: 'danger',
                message: `Low temperature detected: ${temp}°F. This may indicate hypothermia or other health concerns.`,
                icon: 'alert-triangle'
            });
        }

        // Exercise overheating
        if (temp >= 102.0 && (latestReading.activity === 'moderate' || latestReading.activity === 'intense')) {
            this.alerts.push({
                type: 'warning',
                message: `Exercise-induced high temperature: ${temp}°F. Ensure proper hydration and consider cooling measures.`,
                icon: 'thermometer'
            });
        }

        // Recovery monitoring
        if (latestReading.activity === 'recovery' && temp > 99.5) {
            this.alerts.push({
                type: 'warning',
                message: `Elevated temperature during recovery: ${temp}°F. Monitor for signs of incomplete recovery.`,
                icon: 'activity'
            });
        }

        // Normal range confirmation
        if (temp >= 97.0 && temp <= 99.5 && this.alerts.length === 0) {
            this.alerts.push({
                type: 'success',
                message: `Temperature within normal range: ${temp}°F. Continue monitoring as needed.`,
                icon: 'check-circle'
            });
        }

        this.updateAlertsDisplay();
    }

    updateAlertsDisplay() {
        const container = document.getElementById('alerts-container');

        if (this.alerts.length === 0) {
            container.innerHTML = '<p class="no-alerts">No alerts at this time. Your temperature readings are within normal ranges.</p>';
            return;
        }

        container.innerHTML = this.alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <i data-lucide="${alert.icon}"></i>
                <span>${alert.message}</span>
            </div>
        `).join('');

        lucide.createIcons();
    }

    updateHistory() {
        const container = document.getElementById('history-list');

        if (this.readings.length === 0) {
            container.innerHTML = '<p class="no-data">No temperature readings yet. Start logging to see your history.</p>';
            return;
        }

        // Sort by date and time, most recent first
        const sortedReadings = [...this.readings].sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.time.localeCompare(a.time);
        });

        // Show last 50 readings
        const recentReadings = sortedReadings.slice(0, 50);

        container.innerHTML = recentReadings.map(reading => `
            <div class="history-item">
                <div class="history-date">${new Date(reading.date).toLocaleDateString()}</div>
                <div class="history-temp">${reading.temperature}°F</div>
                <div class="history-method">${this.formatMethod(reading.method)}</div>
                <div class="history-activity">${this.formatActivity(reading.activity)}</div>
                <div class="history-notes">${reading.notes || '--'}</div>
            </div>
        `).join('');
    }

    updateInsights() {
        // Dynamic insights based on data patterns
        const insightsContainer = document.getElementById('insights-content');

        // Calculate some basic statistics
        const recentReadings = this.readings.slice(-30); // Last 30 readings
        if (recentReadings.length >= 7) {
            const avgTemp = recentReadings.reduce((sum, r) => sum + r.temperature, 0) / recentReadings.length;
            const variability = this.calculateVariability(recentReadings);

            // Add dynamic insight
            const dynamicInsight = document.createElement('div');
            dynamicInsight.className = 'insight-card';
            dynamicInsight.innerHTML = `
                <h3>📊 Recent Trends</h3>
                <p>Your average core temperature over the last ${recentReadings.length} readings is ${avgTemp.toFixed(1)}°F with a variability of ${variability.toFixed(1)}°F. ${this.getTrendAnalysis(avgTemp, variability)}</p>
            `;

            // Replace the last insight card
            const cards = insightsContainer.querySelectorAll('.insight-card');
            if (cards.length > 0) {
                insightsContainer.replaceChild(dynamicInsight, cards[cards.length - 1]);
            }
        }
    }

    calculateVariability(readings) {
        if (readings.length < 2) return 0;
        const temps = readings.map(r => r.temperature);
        const mean = temps.reduce((sum, t) => sum + t, 0) / temps.length;
        const variance = temps.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / temps.length;
        return Math.sqrt(variance);
    }

    getTrendAnalysis(avgTemp, variability) {
        let analysis = '';

        if (avgTemp > 98.6) {
            analysis += 'Your average temperature is slightly elevated. ';
        } else if (avgTemp < 97.0) {
            analysis += 'Your average temperature is on the lower side. ';
        } else {
            analysis += 'Your average temperature is within normal range. ';
        }

        if (variability > 2.0) {
            analysis += 'High temperature variability detected - monitor for patterns.';
        } else if (variability < 0.5) {
            analysis += 'Stable temperature patterns observed.';
        } else {
            analysis += 'Moderate temperature fluctuations are normal.';
        }

        return analysis;
    }

    loadReadings() {
        const stored = localStorage.getItem('coreBodyTemperatureReadings');
        return stored ? JSON.parse(stored) : [];
    }

    saveReadings() {
        localStorage.setItem('coreBodyTemperatureReadings', JSON.stringify(this.readings));
    }

    showSuccessMessage(message) {
        // Simple success message - could be enhanced with a toast notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize the monitor when the page loads
let monitor;
document.addEventListener('DOMContentLoaded', () => {
    monitor = new CoreBodyTemperatureMonitor();
    loadNavbar();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

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