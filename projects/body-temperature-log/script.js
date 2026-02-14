// Body Temperature Log JavaScript
class TemperatureLog {
    constructor() {
        this.readings = JSON.parse(localStorage.getItem('temperatureReadings')) || [];
        this.currentUnit = 'celsius'; // 'celsius' or 'fahrenheit'
        this.chart = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultTime();
        this.updateDisplay();
        this.createChart();
        this.checkAlerts();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('temperature-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logTemperature();
        });

        // Unit toggle
        document.getElementById('celsius-btn').addEventListener('click', () => {
            this.setUnit('celsius');
        });

        document.getElementById('fahrenheit-btn').addEventListener('click', () => {
            this.setUnit('fahrenheit');
        });

        // Chart period change
        document.getElementById('chart-period').addEventListener('change', () => {
            this.updateChart();
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Clear data button
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all temperature data? This action cannot be undone.')) {
                this.clearAllData();
            }
        });
    }

    setDefaultTime() {
        const now = new Date();
        const timeString = now.toISOString().slice(0, 16); // Format for datetime-local
        document.getElementById('measurement-time').value = timeString;
    }

    setUnit(unit) {
        this.currentUnit = unit;

        // Update button states
        document.getElementById('celsius-btn').classList.toggle('active', unit === 'celsius');
        document.getElementById('fahrenheit-btn').classList.toggle('active', unit === 'fahrenheit');

        // Update input placeholder and value
        const input = document.getElementById('temperature');
        const currentValue = parseFloat(input.value);

        if (!isNaN(currentValue)) {
            if (unit === 'celsius' && this.currentUnit !== 'celsius') {
                // Convert Fahrenheit to Celsius
                input.value = this.fahrenheitToCelsius(currentValue).toFixed(1);
            } else if (unit === 'fahrenheit' && this.currentUnit !== 'fahrenheit') {
                // Convert Celsius to Fahrenheit
                input.value = this.celsiusToFahrenheit(currentValue).toFixed(1);
            }
        }

        // Update display
        this.updateDisplay();
        this.updateChart();
    }

    logTemperature() {
        const formData = new FormData(document.getElementById('temperature-form'));
        let temperature = parseFloat(formData.get('temperature'));

        // Convert to Celsius for storage
        if (this.currentUnit === 'fahrenheit') {
            temperature = this.fahrenheitToCelsius(temperature);
        }

        // Validate temperature range
        if (temperature < 30 || temperature > 45) {
            this.showMessage('Please enter a valid temperature between 30°C and 45°C (86°F and 113°F)', 'error');
            return;
        }

        const reading = {
            id: Date.now(),
            temperature: temperature,
            timestamp: new Date(formData.get('measurement-time')),
            method: formData.get('measurement-method'),
            notes: formData.get('notes') || '',
            unit: 'celsius' // Always store in Celsius
        };

        this.readings.unshift(reading); // Add to beginning for chronological order
        this.saveData();
        this.updateDisplay();
        this.updateChart();
        this.checkAlerts();

        // Reset form
        document.getElementById('temperature-form').reset();
        this.setDefaultTime();

        this.showMessage('Temperature logged successfully!', 'success');
    }

    updateDisplay() {
        this.updateCurrentStatus();
        this.updateRecentReadings();
        this.updateStatistics();
    }

    updateCurrentStatus() {
        const statusDiv = document.getElementById('current-status');

        if (this.readings.length === 0) {
            statusDiv.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-thermometer-empty"></i>
                    <p>No temperature readings yet</p>
                    <small>Log your first temperature above</small>
                </div>
            `;
            return;
        }

        const latest = this.readings[0];
        const status = this.getTemperatureStatus(latest.temperature);
        const tempDisplay = this.currentUnit === 'celsius'
            ? `${latest.temperature.toFixed(1)}°C`
            : `${this.celsiusToFahrenheit(latest.temperature).toFixed(1)}°F`;

        const timeString = latest.timestamp.toLocaleString();

        statusDiv.innerHTML = `
            <div class="current-reading">
                <span class="temperature-value">${tempDisplay}</span>
                <span class="temperature-time">Measured: ${timeString}</span>
            </div>
            <div class="status-indicator status-${status.level}">
                <i class="fas ${status.icon}"></i>
                ${status.label}
            </div>
            ${latest.notes ? `<div class="reading-notes">${latest.notes}</div>` : ''}
        `;
    }

    updateRecentReadings() {
        const readingsList = document.getElementById('recent-readings');
        const recentReadings = this.readings.slice(0, 10); // Show last 10 readings

        if (recentReadings.length === 0) {
            readingsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-thermometer-empty"></i>
                    <p>No readings to display</p>
                </div>
            `;
            return;
        }

        readingsList.innerHTML = recentReadings.map(reading => {
            const tempDisplay = this.currentUnit === 'celsius'
                ? `${reading.temperature.toFixed(1)}°C`
                : `${this.celsiusToFahrenheit(reading.temperature).toFixed(1)}°F`;

            const status = this.getTemperatureStatus(reading.temperature);
            const timeString = reading.timestamp.toLocaleDateString() + ' ' + reading.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            return `
                <div class="reading-item">
                    <div>
                        <span class="reading-temp">${tempDisplay}</span>
                        <div class="reading-details">
                            <span class="reading-time">${timeString}</span>
                            <span class="reading-method">${this.formatMethod(reading.method)}</span>
                        </div>
                        ${reading.notes ? `<div class="reading-notes">${reading.notes}</div>` : ''}
                    </div>
                    <div class="status-indicator status-${status.level}" style="font-size: 0.8rem; padding: 4px 8px;">
                        ${status.label}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStatistics() {
        if (this.readings.length === 0) {
            document.getElementById('avg-temp').textContent = '0.0°C';
            document.getElementById('min-temp').textContent = '0.0°C';
            document.getElementById('max-temp').textContent = '0.0°C';
            document.getElementById('readings-count').textContent = '0';
            return;
        }

        const temperatures = this.readings.map(r => r.temperature);
        const avg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
        const min = Math.min(...temperatures);
        const max = Math.max(...temperatures);

        const formatTemp = (temp) => {
            return this.currentUnit === 'celsius'
                ? `${temp.toFixed(1)}°C`
                : `${this.celsiusToFahrenheit(temp).toFixed(1)}°F`;
        };

        document.getElementById('avg-temp').textContent = formatTemp(avg);
        document.getElementById('min-temp').textContent = formatTemp(min);
        document.getElementById('max-temp').textContent = formatTemp(max);
        document.getElementById('readings-count').textContent = this.readings.length;
    }

    createChart() {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: `Temperature (°${this.currentUnit === 'celsius' ? 'C' : 'F'})`,
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: `Temperature (°${this.currentUnit === 'celsius' ? 'C' : 'F'})`
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date & Time'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const temp = this.currentUnit === 'celsius'
                                    ? context.parsed.y.toFixed(1) + '°C'
                                    : this.celsiusToFahrenheit(context.parsed.y).toFixed(1) + '°F';
                                return `Temperature: ${temp}`;
                            }
                        }
                    }
                }
            }
        });

        this.updateChart();
    }

    updateChart() {
        if (!this.chart) return;

        const period = parseInt(document.getElementById('chart-period').value);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - period);

        const filteredReadings = this.readings
            .filter(reading => reading.timestamp >= cutoffDate)
            .sort((a, b) => a.timestamp - b.timestamp);

        const labels = filteredReadings.map(reading => {
            return reading.timestamp.toLocaleDateString() + ' ' +
                   reading.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        });

        const data = filteredReadings.map(reading => {
            return this.currentUnit === 'celsius'
                ? reading.temperature
                : this.celsiusToFahrenheit(reading.temperature);
        });

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.data.datasets[0].label = `Temperature (°${this.currentUnit === 'celsius' ? 'C' : 'F'})`;
        this.chart.options.scales.y.title.text = `Temperature (°${this.currentUnit === 'celsius' ? 'C' : 'F'})`;
        this.chart.update();
    }

    checkAlerts() {
        const alerts = [];
        const recentReadings = this.readings.slice(0, 5); // Check last 5 readings

        recentReadings.forEach(reading => {
            const status = this.getTemperatureStatus(reading.temperature);

            if (status.level === 'fever') {
                alerts.push({
                    type: 'fever',
                    title: 'Fever Detected',
                    message: `Temperature of ${reading.temperature.toFixed(1)}°C (${this.celsiusToFahrenheit(reading.temperature).toFixed(1)}°F) indicates fever.`,
                    time: reading.timestamp,
                    icon: 'fas fa-exclamation-triangle'
                });
            } else if (status.level === 'low') {
                alerts.push({
                    type: 'low',
                    title: 'Low Temperature',
                    message: `Temperature of ${reading.temperature.toFixed(1)}°C (${this.celsiusToFahrenheit(reading.temperature).toFixed(1)}°F) is below normal range.`,
                    time: reading.timestamp,
                    icon: 'fas fa-thermometer-quarter'
                });
            }
        });

        this.displayAlerts(alerts);
    }

    displayAlerts(alerts) {
        const alertsSection = document.getElementById('alerts-section');
        const alertsList = document.getElementById('alerts-list');

        if (alerts.length === 0) {
            alertsSection.classList.add('hidden');
            return;
        }

        alertsSection.classList.remove('hidden');
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.type}">
                <i class="${alert.icon}"></i>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${alert.time.toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }

    getTemperatureStatus(temperature) {
        // Adult normal ranges (may vary by age and individual factors)
        if (temperature >= 36.1 && temperature <= 37.2) {
            return { level: 'normal', label: 'Normal', icon: 'fas fa-check-circle' };
        } else if (temperature > 37.2 && temperature < 38.0) {
            return { level: 'elevated', label: 'Elevated', icon: 'fas fa-exclamation-circle' };
        } else if (temperature >= 38.0) {
            return { level: 'fever', label: 'Fever', icon: 'fas fa-exclamation-triangle' };
        } else {
            return { level: 'low', label: 'Low', icon: 'fas fa-thermometer-quarter' };
        }
    }

    exportData() {
        const data = {
            readings: this.readings,
            exportDate: new Date().toISOString(),
            unit: this.currentUnit,
            summary: {
                totalReadings: this.readings.length,
                averageTemp: this.readings.length > 0
                    ? this.readings.reduce((sum, r) => sum + r.temperature, 0) / this.readings.length
                    : 0,
                minTemp: this.readings.length > 0 ? Math.min(...this.readings.map(r => r.temperature)) : 0,
                maxTemp: this.readings.length > 0 ? Math.max(...this.readings.map(r => r.temperature)) : 0
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `temperature-log-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Data exported successfully!', 'success');
    }

    clearAllData() {
        this.readings = [];
        localStorage.removeItem('temperatureReadings');
        this.updateDisplay();
        this.updateChart();
        document.getElementById('alerts-section').classList.add('hidden');
        this.showMessage('All temperature data cleared.', 'success');
    }

    saveData() {
        localStorage.setItem('temperatureReadings', JSON.stringify(this.readings));
    }

    // Utility methods
    celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    }

    fahrenheitToCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    }

    formatMethod(method) {
        const methods = {
            oral: 'Oral',
            axillary: 'Axillary',
            rectal: 'Rectal',
            tympanic: 'Tympanic',
            temporal: 'Temporal',
            other: 'Other'
        };
        return methods[method] || method;
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `success-message ${type}`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Initialize the temperature log when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TemperatureLog();
});