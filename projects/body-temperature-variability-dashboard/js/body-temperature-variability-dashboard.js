class BodyTemperatureVariabilityDashboard {
    constructor() {
        this.readings = this.loadReadings();
        this.charts = {};
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

        this.showSuccessMessage('Temperature reading logged successfully!');
    }

    getReadingData() {
        return {
            id: Date.now(),
            date: document.getElementById('log-date').value,
            time: document.getElementById('log-time').value,
            temperature: parseFloat(document.getElementById('temperature').value),
            method: document.getElementById('measurement-method').value,
            context: document.getElementById('measurement-context').value,
            symptoms: document.getElementById('symptoms').value,
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
            container.innerHTML = '<p class="no-data">No readings logged today. Start tracking your temperature throughout the day.</p>';
            return;
        }

        // Sort by time
        todayReadings.sort((a, b) => a.time.localeCompare(b.time));

        container.innerHTML = todayReadings.map(reading => this.createReadingHTML(reading)).join('');
    }

    createReadingHTML(reading) {
        const tempClass = this.getTemperatureClass(reading.temperature);

        return `
            <div class="reading-item" data-id="${reading.id}">
                <div class="reading-time">${reading.time}</div>
                <div class="reading-temp ${tempClass}">${reading.temperature}°F</div>
                <div class="reading-method">${this.formatMethod(reading.method)}</div>
                <div class="reading-context">${this.formatContext(reading.context)}</div>
                <div class="reading-actions">
                    <button class="delete-btn" onclick="dashboard.deleteReading(${reading.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }

    deleteReading(readingId) {
        this.readings = this.readings.filter(reading => reading.id !== readingId);
        this.saveReadings();
        this.updateTodayReadings();
        this.updateAnalysis();
        this.updateTrends();
        this.updateHistory();
        this.updateInsights();
        this.showSuccessMessage('Reading deleted successfully!');
    }

    updateAnalysis() {
        const today = new Date().toISOString().split('T')[0];
        const todayReadings = this.readings.filter(reading => reading.date === today);

        if (todayReadings.length === 0) {
            document.getElementById('daily-range').textContent = '0.0°F';
            document.getElementById('daily-average').textContent = '0.0°F';
            document.getElementById('readings-count').textContent = '0';
            document.getElementById('basal-temp').textContent = '--';
            this.updateDailyChart([]);
            return;
        }

        const temperatures = todayReadings.map(r => r.temperature);
        const minTemp = Math.min(...temperatures);
        const maxTemp = Math.max(...temperatures);
        const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
        const range = maxTemp - minTemp;

        // Find basal temperature (waking reading)
        const basalReading = todayReadings.find(r => r.context === 'waking');
        const basalTemp = basalReading ? basalReading.temperature : null;

        document.getElementById('daily-range').textContent = `${range.toFixed(1)}°F`;
        document.getElementById('daily-average').textContent = `${avgTemp.toFixed(1)}°F`;
        document.getElementById('readings-count').textContent = todayReadings.length;
        document.getElementById('basal-temp').textContent = basalTemp ? `${basalTemp.toFixed(1)}°F` : '--';

        this.updateDailyChart(todayReadings);
    }

    updateDailyChart(readings) {
        const ctx = document.getElementById('temperature-chart').getContext('2d');

        if (this.charts.daily) {
            this.charts.daily.destroy();
        }

        if (readings.length === 0) return;

        // Sort by time
        readings.sort((a, b) => a.time.localeCompare(b.time));

        const labels = readings.map(reading => reading.time);
        const temperatures = readings.map(reading => reading.temperature);

        this.charts.daily = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°F)',
                    data: temperatures,
                    borderColor: 'rgba(255, 111, 0, 1)',
                    backgroundColor: 'rgba(255, 111, 0, 0.1)',
                    tension: 0.4,
                    pointBackgroundColor: readings.map(r => this.getTemperatureColor(r.temperature)),
                    pointBorderColor: readings.map(r => this.getTemperatureColor(r.temperature))
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Today\'s Temperature Readings',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Temperature (°F)'
                        },
                        suggestedMin: 95,
                        suggestedMax: 105
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

        // Get readings within the period
        const periodReadings = this.readings.filter(reading => {
            const readingDate = new Date(reading.date);
            return readingDate >= startDate && readingDate <= endDate;
        });

        if (periodReadings.length === 0) {
            this.clearTrendsChart();
            return;
        }

        // Group by date and calculate daily stats
        const dailyStats = {};
        periodReadings.forEach(reading => {
            if (!dailyStats[reading.date]) {
                dailyStats[reading.date] = {
                    readings: [],
                    min: Infinity,
                    max: -Infinity,
                    sum: 0,
                    count: 0,
                    basal: null
                };
            }

            const temp = reading.temperature;
            dailyStats[reading.date].readings.push(reading);
            dailyStats[reading.date].min = Math.min(dailyStats[reading.date].min, temp);
            dailyStats[reading.date].max = Math.max(dailyStats[reading.date].max, temp);
            dailyStats[reading.date].sum += temp;
            dailyStats[reading.date].count++;

            if (reading.context === 'waking' && !dailyStats[reading.date].basal) {
                dailyStats[reading.date].basal = temp;
            }
        });

        // Prepare data for chart
        const dates = Object.keys(dailyStats).sort();
        const avgTemps = dates.map(date => dailyStats[date].sum / dailyStats[date].count);
        const basalTemps = dates.map(date => dailyStats[date].basal).filter(temp => temp !== null);
        const basalLabels = dates.filter(date => dailyStats[date].basal !== null);

        this.updateTrendsChart(dates, avgTemps, basalLabels, basalTemps);
    }

    updateTrendsChart(dates, avgTemps, basalLabels, basalTemps) {
        const ctx = document.getElementById('trends-chart').getContext('2d');

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        const datasets = [{
            label: 'Daily Average (°F)',
            data: avgTemps,
            borderColor: 'rgba(255, 111, 0, 1)',
            backgroundColor: 'rgba(255, 111, 0, 0.1)',
            tension: 0.4,
            fill: false
        }];

        if (basalTemps.length > 0) {
            datasets.push({
                label: 'Basal Temperature (°F)',
                data: basalTemps,
                borderColor: 'rgba(33, 150, 243, 1)',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: false,
                pointStyle: 'triangle',
                pointRadius: 6
            });
        }

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => this.formatDate(date)),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Temperature Trends',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Temperature (°F)'
                        },
                        suggestedMin: 95,
                        suggestedMax: 105
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

    clearTrendsChart() {
        const ctx = document.getElementById('trends-chart').getContext('2d');

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        // Show empty chart
        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'No data available for selected period',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        });
    }

    updateHistory() {
        const container = document.getElementById('history-list');

        if (this.readings.length === 0) {
            container.innerHTML = '<p class="no-data">No temperature readings yet. Start logging to see your history.</p>';
            return;
        }

        // Group by date and take last 7 days
        const dateGroups = {};
        this.readings.forEach(reading => {
            if (!dateGroups[reading.date]) {
                dateGroups[reading.date] = [];
            }
            dateGroups[reading.date].push(reading);
        });

        const dates = Object.keys(dateGroups).sort().reverse().slice(0, 7);

        container.innerHTML = dates.map(date => this.createHistoryItemHTML(date, dateGroups[date])).join('');
    }

    createHistoryItemHTML(date, readings) {
        const temperatures = readings.map(r => r.temperature);
        const minTemp = Math.min(...temperatures);
        const maxTemp = Math.max(...temperatures);
        const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
        const range = maxTemp - minTemp;

        const basalReading = readings.find(r => r.context === 'waking');

        const readingsText = readings
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(r => `${r.time}: ${r.temperature}°F (${this.formatContext(r.context)})`)
            .join(', ');

        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-date">${this.formatDate(date)}</div>
                </div>
                <div class="history-stats">
                    <div class="stat-item"><span>Readings:</span> <span>${readings.length}</span></div>
                    <div class="stat-item"><span>Average:</span> <span>${avgTemp.toFixed(1)}°F</span></div>
                    <div class="stat-item"><span>Range:</span> <span>${range.toFixed(1)}°F</span></div>
                    <div class="stat-item"><span>Basal:</span> <span>${basalReading ? basalReading.temperature.toFixed(1) + '°F' : '--'}</span></div>
                </div>
                <div class="history-readings">${readingsText}</div>
            </div>
        `;
    }

    updateInsights() {
        const insightsContainer = document.getElementById('insights-content');

        if (this.readings.length < 7) {
            return; // Keep default insights
        }

        const insights = this.generateInsights();
        if (insights.length > 0) {
            const insightsHTML = insights.map(insight => `
                <div class="insight-card">
                    <h3>${insight.title}</h3>
                    <p>${insight.description}</p>
                </div>
            `).join('');

            insightsContainer.innerHTML += insightsHTML;
        }
    }

    generateInsights() {
        const insights = [];

        // Analyze recent trends
        const recentReadings = this.getRecentReadings(14); // Last 14 days
        if (recentReadings.length >= 7) {
            const trend = this.analyzeTemperatureTrend(recentReadings);
            if (trend) {
                insights.push(trend);
            }
        }

        // Check for hormonal patterns
        const hormonalPattern = this.analyzeHormonalPatterns();
        if (hormonalPattern) {
            insights.push(hormonalPattern);
        }

        // Variability analysis
        const variability = this.analyzeVariability();
        if (variability) {
            insights.push(variability);
        }

        return insights;
    }

    getRecentReadings(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.readings.filter(reading => new Date(reading.date) >= cutoffDate);
    }

    analyzeTemperatureTrend(readings) {
        // Group by date and get daily averages
        const dailyAverages = {};
        readings.forEach(reading => {
            if (!dailyAverages[reading.date]) {
                dailyAverages[reading.date] = { sum: 0, count: 0 };
            }
            dailyAverages[reading.date].sum += reading.temperature;
            dailyAverages[reading.date].count++;
        });

        const dates = Object.keys(dailyAverages).sort();
        const averages = dates.map(date => dailyAverages[date].sum / dailyAverages[date].count);

        if (averages.length < 3) return null;

        // Calculate trend
        const firstHalf = averages.slice(0, Math.floor(averages.length / 2));
        const secondHalf = averages.slice(Math.floor(averages.length / 2));

        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

        const change = secondAvg - firstAvg;

        if (Math.abs(change) >= 0.3) {
            if (change > 0) {
                return {
                    title: '🌡️ Rising Temperature Trend',
                    description: `Your average temperature has increased by ${change.toFixed(1)}°F over the past two weeks. This could indicate hormonal changes or other physiological shifts.`
                };
            } else {
                return {
                    title: '🌡️ Declining Temperature Trend',
                    description: `Your average temperature has decreased by ${Math.abs(change).toFixed(1)}°F over the past two weeks. Monitor for any associated symptoms or lifestyle factors.`
                };
            }
        }

        return null;
    }

    analyzeHormonalPatterns() {
        // Look for basal temperature patterns that might indicate ovulation
        const basalReadings = this.readings.filter(r => r.context === 'waking');

        if (basalReadings.length < 10) return null;

        // Sort by date
        basalReadings.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Look for sustained temperature increase (ovulation sign)
        for (let i = 6; i < basalReadings.length; i++) {
            const recent = basalReadings.slice(i - 6, i + 1);
            const before = recent.slice(0, 3);
            const after = recent.slice(3);

            const beforeAvg = before.reduce((sum, r) => sum + r.temperature, 0) / before.length;
            const afterAvg = after.reduce((sum, r) => sum + r.temperature, 0) / after.length;

            if (afterAvg - beforeAvg >= 0.4) {
                return {
                    title: '🌸 Possible Ovulation Detected',
                    description: 'Your basal temperature shows a sustained increase that may indicate ovulation. This pattern is consistent with progesterone production after ovulation.'
                };
            }
        }

        return null;
    }

    analyzeVariability() {
        const today = new Date().toISOString().split('T')[0];
        const todayReadings = this.readings.filter(r => r.date === today);

        if (todayReadings.length < 3) return null;

        const temperatures = todayReadings.map(r => r.temperature);
        const range = Math.max(...temperatures) - Math.min(...temperatures);

        if (range > 3) {
            return {
                title: '📈 High Daily Variability',
                description: `Today's temperature range of ${range.toFixed(1)}°F is higher than normal. This could be due to hormonal fluctuations, stress, illness, or environmental factors.`
            };
        } else if (range < 0.5) {
            return {
                title: '📉 Low Daily Variability',
                description: `Today's temperature range of ${range.toFixed(1)}°F is unusually stable. While consistency can be good, very low variability might indicate measurement issues or health concerns.`
            };
        }

        return null;
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatMethod(method) {
        return method.charAt(0).toUpperCase() + method.slice(1);
    }

    formatContext(context) {
        const contexts = {
            'waking': 'Basal',
            'morning': 'Morning',
            'afternoon': 'Afternoon',
            'evening': 'Evening',
            'before-bed': 'Bedtime'
        };
        return contexts[context] || context;
    }

    getTemperatureClass(temp) {
        if (temp < 97) return 'temp-low';
        if (temp > 99) return 'temp-high';
        return 'temp-normal';
    }

    getTemperatureColor(temp) {
        if (temp < 97) return 'rgba(66, 165, 245, 1)'; // Blue for low
        if (temp > 99) return 'rgba(244, 67, 54, 1)'; // Red for high
        return 'rgba(76, 175, 80, 1)'; // Green for normal
    }

    // Data persistence methods
    loadReadings() {
        const stored = localStorage.getItem('body-temperature-readings');
        return stored ? JSON.parse(stored) : [];
    }

    saveReadings() {
        localStorage.setItem('body-temperature-readings', JSON.stringify(this.readings));
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            messageEl.style.backgroundColor = 'var(--temp-primary)';
        } else {
            messageEl.style.backgroundColor = 'var(--error-color)';
        }

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new BodyTemperatureVariabilityDashboard();
});

// Add CSS animations for messages
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