// Fever Pattern Analyzer JavaScript

class FeverPatternAnalyzer {
    constructor() {
        this.readings = [];
        this.currentView = '24h';

        this.init();
        this.loadData();
        this.updateUI();
        this.renderCharts();
    }

    init() {
        // Get DOM elements
        this.temperatureForm = document.getElementById('temperature-form');
        this.temperature = document.getElementById('temperature');
        this.measurementMethod = document.getElementById('measurement-method');
        this.notes = document.getElementById('notes');
        this.readingsList = document.getElementById('readings-list');
        this.alertsContainer = document.getElementById('alerts-container');

        // Status elements
        this.latestTemp = document.getElementById('latest-temp');
        this.tempTime = document.getElementById('temp-time');
        this.dailyAvg = document.getElementById('daily-avg');
        this.avgTrend = document.getElementById('avg-trend');
        this.feverStatus = document.getElementById('fever-status');
        this.feverDuration = document.getElementById('fever-duration');
        this.patternStatus = document.getElementById('pattern-status');
        this.patternConfidence = document.getElementById('pattern-confidence');

        // Chart controls
        this.view24h = document.getElementById('view-24h');
        this.view7d = document.getElementById('view-7d');
        this.view30d = document.getElementById('view-30d');

        // Bind events
        this.temperatureForm.addEventListener('submit', (e) => this.logReading(e));
        this.view24h.addEventListener('click', () => this.changeView('24h'));
        this.view7d.addEventListener('click', () => this.changeView('7d'));
        this.view30d.addEventListener('click', () => this.changeView('30d'));

        // Initialize symptom checkboxes
        this.symptomCheckboxes = document.querySelectorAll('.symptom-checkbox input');
    }

    logReading(e) {
        e.preventDefault();

        const temp = parseFloat(this.temperature.value);
        const method = this.measurementMethod.value;
        const symptoms = Array.from(this.symptomCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const notes = this.notes.value.trim();

        if (!temp || temp < 35 || temp > 45) {
            this.showAlert('Please enter a valid temperature between 35°C and 45°C', 'warning');
            return;
        }

        // Adjust temperature based on measurement method
        const adjustedTemp = this.adjustTemperature(temp, method);

        const reading = {
            id: Date.now(),
            temperature: adjustedTemp,
            originalTemp: temp,
            method: method,
            symptoms: symptoms,
            notes: notes,
            timestamp: new Date(),
            date: new Date().toISOString()
        };

        this.readings.push(reading);
        this.saveData();
        this.updateUI();
        this.renderCharts();

        // Reset form
        this.temperatureForm.reset();

        // Show success feedback
        this.showAlert('Temperature reading logged successfully!', 'info');

        // Check for concerning patterns
        this.checkAlerts(reading);
    }

    adjustTemperature(temp, method) {
        // Adjust temperatures to oral equivalent for consistency
        const adjustments = {
            'oral': 0,
            'axillary': 0.5, // Axillary is typically 0.5°C lower
            'rectal': -0.5,  // Rectal is typically 0.5°C higher
            'tympanic': 0,   // Tympanic is similar to oral
            'temporal': 0    // Temporal is similar to oral
        };

        return temp + (adjustments[method] || 0);
    }

    updateUI() {
        const sortedReadings = this.readings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Update status cards
        this.updateStatusCards(sortedReadings);

        // Update readings list
        this.renderReadingsList(sortedReadings.slice(0, 10));

        // Update alerts
        this.updateAlerts();
    }

    updateStatusCards(readings) {
        if (readings.length === 0) {
            this.resetStatusCards();
            return;
        }

        const latest = readings[0];
        const last24h = this.getLast24hReadings();
        const feverInfo = this.analyzeFever(readings);
        const patternInfo = this.analyzePattern(readings);

        // Latest temperature
        this.latestTemp.textContent = `${latest.temperature.toFixed(1)}°C`;
        this.latestTemp.className = this.getTemperatureClass(latest.temperature);
        this.tempTime.textContent = this.formatTime(latest.timestamp);

        // Daily average
        if (last24h.length > 0) {
            const avg = last24h.reduce((sum, r) => sum + r.temperature, 0) / last24h.length;
            this.dailyAvg.textContent = `${avg.toFixed(1)}°C`;

            // Calculate trend
            if (last24h.length >= 2) {
                const recent = last24h.slice(0, Math.min(3, last24h.length));
                const older = last24h.slice(Math.min(3, last24h.length));

                if (recent.length > 0 && older.length > 0) {
                    const recentAvg = recent.reduce((sum, r) => sum + r.temperature, 0) / recent.length;
                    const olderAvg = older.reduce((sum, r) => sum + r.temperature, 0) / older.length;

                    if (recentAvg < olderAvg - 0.3) {
                        this.avgTrend.textContent = '↘️ Improving';
                        this.avgTrend.style.color = '#4caf50';
                    } else if (recentAvg > olderAvg + 0.3) {
                        this.avgTrend.textContent = '↗️ Worsening';
                        this.avgTrend.style.color = '#f44336';
                    } else {
                        this.avgTrend.textContent = '→ Stable';
                        this.avgTrend.style.color = '#ff9800';
                    }
                }
            }
        }

        // Fever status
        this.feverStatus.textContent = feverInfo.status;
        this.feverStatus.className = `fever-${feverInfo.level}`;
        this.feverDuration.textContent = feverInfo.duration;

        // Pattern status
        this.patternStatus.textContent = patternInfo.status;
        this.patternStatus.className = `pattern-${patternInfo.trend}`;
        this.patternConfidence.textContent = `${patternInfo.confidence}% confidence`;
    }

    resetStatusCards() {
        this.latestTemp.textContent = '--°C';
        this.tempTime.textContent = '--';
        this.dailyAvg.textContent = '--°C';
        this.avgTrend.textContent = '--';
        this.feverStatus.textContent = 'No Data';
        this.feverDuration.textContent = '--';
        this.patternStatus.textContent = 'No Data';
        this.patternConfidence.textContent = '--';
    }

    analyzeFever(readings) {
        if (readings.length === 0) return { status: 'No Data', level: 'normal', duration: '--' };

        const latest = readings[0];
        let status, level;

        if (latest.temperature < 37.0) {
            status = 'Normal';
            level = 'normal';
        } else if (latest.temperature < 38.0) {
            status = 'Low-grade Fever';
            level = 'low-grade';
        } else if (latest.temperature < 39.5) {
            status = 'Moderate Fever';
            level = 'moderate';
        } else if (latest.temperature < 41.0) {
            status = 'High Fever';
            level = 'high';
        } else {
            status = 'Critical Fever';
            level = 'high';
        }

        // Calculate fever duration
        const feverReadings = readings.filter(r => r.temperature >= 37.5);
        let duration = '--';

        if (feverReadings.length > 0) {
            const firstFever = new Date(feverReadings[feverReadings.length - 1].timestamp);
            const now = new Date();
            const hours = Math.floor((now - firstFever) / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);

            if (days > 0) {
                duration = `${days}d ${hours % 24}h`;
            } else {
                duration = `${hours}h`;
            }
        }

        return { status, level, duration };
    }

    analyzePattern(readings) {
        if (readings.length < 3) {
            return { status: 'Insufficient Data', trend: 'stable', confidence: 0 };
        }

        // Analyze trend over last 6 readings
        const recent = readings.slice(0, Math.min(6, readings.length));
        const temperatures = recent.map(r => r.temperature);

        // Calculate linear trend
        const n = temperatures.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = temperatures.reduce((sum, t) => sum + t, 0);
        const sumXY = temperatures.reduce((sum, t, i) => sum + t * i, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

        let status, trend, confidence;

        if (Math.abs(slope) < 0.01) {
            status = 'Stable';
            trend = 'stable';
            confidence = 80;
        } else if (slope < -0.02) {
            status = 'Improving';
            trend = 'improving';
            confidence = Math.min(95, Math.abs(slope) * 2000);
        } else {
            status = 'Worsening';
            trend = 'worsening';
            confidence = Math.min(95, Math.abs(slope) * 2000);
        }

        return { status, trend, confidence: Math.round(confidence) };
    }

    getLast24hReadings() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return this.readings.filter(r => new Date(r.timestamp) >= twentyFourHoursAgo);
    }

    renderReadingsList(readings) {
        if (readings.length === 0) {
            this.readingsList.innerHTML = '<p class="no-readings">No temperature readings logged yet. Start by logging your first temperature above!</p>';
            return;
        }

        this.readingsList.innerHTML = readings.map(reading => `
            <div class="reading-item">
                <div class="reading-main">
                    <div class="reading-temp ${this.getTemperatureClass(reading.temperature)}">
                        ${reading.temperature.toFixed(1)}°C
                    </div>
                    <div class="reading-details">
                        <div class="reading-time">${this.formatDateTime(reading.timestamp)}</div>
                        <div class="reading-method">${this.formatMethod(reading.method)} ${reading.originalTemp !== reading.temperature ? `(original: ${reading.originalTemp}°C)` : ''}</div>
                        ${reading.symptoms.length > 0 ? `<div class="reading-symptoms">Symptoms: ${reading.symptoms.join(', ')}</div>` : ''}
                        ${reading.notes ? `<div class="reading-notes">"${reading.notes}"</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        this.renderTemperatureChart();
        this.renderPatternChart();
    }

    renderTemperatureChart() {
        const canvas = document.getElementById('temperature-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.readings.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        let data;
        switch (this.currentView) {
            case '24h':
                data = this.get24hData();
                break;
            case '7d':
                data = this.get7dData();
                break;
            case '30d':
                data = this.get30dData();
                break;
        }

        this.drawTemperatureChart(ctx, data, canvas.width, canvas.height);
    }

    get24hData() {
        const now = new Date();
        const data = [];

        for (let i = 23; i >= 0; i--) {
            const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
            const hourReadings = this.readings.filter(r => {
                const readingHour = new Date(r.timestamp);
                return readingHour.getHours() === hour.getHours() &&
                       readingHour.toDateString() === hour.toDateString();
            });

            data.push({
                time: hour,
                avgTemp: hourReadings.length > 0 ?
                    hourReadings.reduce((sum, r) => sum + r.temperature, 0) / hourReadings.length : null,
                readings: hourReadings.length
            });
        }

        return data;
    }

    get7dData() {
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayReadings = this.readings.filter(r =>
                new Date(r.timestamp).toDateString() === date.toDateString()
            );

            data.push({
                time: date,
                avgTemp: dayReadings.length > 0 ?
                    dayReadings.reduce((sum, r) => sum + r.temperature, 0) / dayReadings.length : null,
                readings: dayReadings.length
            });
        }

        return data;
    }

    get30dData() {
        const data = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayReadings = this.readings.filter(r =>
                new Date(r.timestamp).toDateString() === date.toDateString()
            );

            data.push({
                time: date,
                avgTemp: dayReadings.length > 0 ?
                    dayReadings.reduce((sum, r) => sum + r.temperature, 0) / dayReadings.length : null,
                readings: dayReadings.length
            });
        }

        return data;
    }

    drawTemperatureChart(ctx, data, width, height) {
        const padding = 60;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Find min/max temperatures
        const validTemps = data.filter(d => d.avgTemp !== null).map(d => d.avgTemp);
        if (validTemps.length === 0) return;

        const minTemp = Math.min(...validTemps) - 0.5;
        const maxTemp = Math.max(...validTemps) + 0.5;

        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        // Horizontal grid lines (temperature)
        for (let t = Math.ceil(minTemp); t <= Math.floor(maxTemp); t++) {
            const y = padding + (maxTemp - t) / (maxTemp - minTemp) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${t}°C`, padding - 10, y + 4);
        }

        // Fever threshold line
        const feverY = padding + (maxTemp - 37.5) / (maxTemp - minTemp) * chartHeight;
        ctx.strokeStyle = '#f44336';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, feverY);
        ctx.lineTo(width - padding, feverY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw data points and line
        const points = data.map((d, i) => {
            if (d.avgTemp === null) return null;

            const x = padding + (i / (data.length - 1)) * chartWidth;
            const y = padding + (maxTemp - d.avgTemp) / (maxTemp - minTemp) * chartHeight;

            return { x, y, temp: d.avgTemp, readings: d.readings };
        }).filter(p => p !== null);

        // Draw line
        if (points.length > 1) {
            ctx.strokeStyle = '#ff5722';
            ctx.lineWidth = 3;
            ctx.beginPath();

            points.forEach((point, i) => {
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });

            ctx.stroke();
        }

        // Draw points
        points.forEach(point => {
            ctx.fillStyle = point.temp >= 37.5 ? '#f44336' : '#4caf50';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Show reading count if > 1
            if (point.readings > 1) {
                ctx.fillStyle = '#666';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(point.readings.toString(), point.x, point.y - 10);
            }
        });

        // Draw time labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        for (let i = 0; i < data.length; i += Math.max(1, Math.floor(data.length / 6))) {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const timeLabel = this.formatTimeLabel(data[i].time, this.currentView);
            ctx.fillText(timeLabel, x, height - 20);
        }
    }

    renderPatternChart() {
        const canvas = document.getElementById('pattern-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.readings.length < 3) {
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Need at least 3 readings for pattern analysis', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Analyze patterns over time
        const patterns = this.analyzeDetailedPatterns();
        this.drawPatternChart(ctx, patterns, canvas.width, canvas.height);
    }

    analyzeDetailedPatterns() {
        const patterns = [];
        const sorted = this.readings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        for (let i = 2; i < sorted.length; i++) {
            const window = sorted.slice(i - 2, i + 1);
            const temps = window.map(r => r.temperature);

            // Simple pattern detection
            let pattern = 'stable';
            const diff1 = temps[1] - temps[0];
            const diff2 = temps[2] - temps[1];

            if (diff1 < -0.2 && diff2 < -0.2) {
                pattern = 'improving';
            } else if (diff1 > 0.2 && diff2 > 0.2) {
                pattern = 'worsening';
            }

            patterns.push({
                time: window[2].timestamp,
                pattern: pattern,
                temperature: temps[2]
            });
        }

        return patterns;
    }

    drawPatternChart(ctx, patterns, width, height) {
        const padding = 40;
        const barWidth = (width - padding * 2) / patterns.length * 0.8;
        const maxHeight = height - padding * 2;

        patterns.forEach((pattern, i) => {
            const x = padding + i * (width - padding * 2) / patterns.length;
            const barHeight = pattern.temperature >= 37.5 ? maxHeight * 0.7 : maxHeight * 0.3;

            // Bar color based on pattern
            let color;
            switch (pattern.pattern) {
                case 'improving': color = '#4caf50'; break;
                case 'worsening': color = '#f44336'; break;
                default: color = '#ff9800'; break;
            }

            ctx.fillStyle = color;
            ctx.fillRect(x, height - padding - barHeight, barWidth, barHeight);

            // Temperature label
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(pattern.temperature.toFixed(1) + '°', x + barWidth / 2, height - padding - barHeight - 5);
        });
    }

    changeView(view) {
        this.currentView = view;

        // Update button states
        [this.view24h, this.view7d, this.view30d].forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view-${view}`).classList.add('active');

        this.renderCharts();
    }

    checkAlerts(latestReading) {
        const alerts = [];

        // High fever alert
        if (latestReading.temperature >= 39.5) {
            alerts.push({
                type: 'danger',
                title: 'High Fever Alert',
                message: `Your temperature is ${latestReading.temperature.toFixed(1)}°C. Consider consulting a healthcare provider.`
            });
        }

        // Persistent fever
        const last24h = this.getLast24hReadings();
        const feverReadings = last24h.filter(r => r.temperature >= 37.5);
        if (feverReadings.length >= 3) {
            alerts.push({
                type: 'warning',
                title: 'Persistent Fever',
                message: 'You have had elevated temperature for the last 24 hours. Monitor closely and consider medical advice.'
            });
        }

        // Worsening pattern
        const pattern = this.analyzePattern(this.readings);
        if (pattern.trend === 'worsening' && pattern.confidence > 70) {
            alerts.push({
                type: 'warning',
                title: 'Worsening Pattern Detected',
                message: 'Your temperature pattern shows signs of worsening. Stay hydrated and monitor symptoms closely.'
            });
        }

        // Display alerts
        alerts.forEach(alert => this.showAlert(alert.message, alert.type, alert.title));
    }

    updateAlerts() {
        // Clear existing alerts except the info one
        const existingAlerts = this.alertsContainer.querySelectorAll('.alert:not(.info)');
        existingAlerts.forEach(alert => alert.remove());

        // Add current alerts
        this.checkAlerts(this.readings[0] || null);
    }

    showAlert(message, type = 'info', title = '') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;

        const icon = type === 'danger' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️';
        const defaultTitle = type === 'danger' ? 'Alert' : type === 'warning' ? 'Warning' : 'Information';

        alertDiv.innerHTML = `
            <div class="alert-icon">${icon}</div>
            <div class="alert-content">
                <h4>${title || defaultTitle}</h4>
                <p>${message}</p>
            </div>
        `;

        // Insert after the info alert
        const infoAlert = this.alertsContainer.querySelector('.info');
        if (infoAlert) {
            infoAlert.after(alertDiv);
        } else {
            this.alertsContainer.appendChild(alertDiv);
        }

        // Auto-remove after 10 seconds for non-danger alerts
        if (type !== 'danger') {
            setTimeout(() => {
                alertDiv.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => alertDiv.remove(), 500);
            }, 10000);
        }
    }

    // Helper methods
    getTemperatureClass(temp) {
        if (temp < 37.0) return 'temp-normal';
        if (temp < 38.0) return 'temp-low-grade';
        if (temp < 39.5) return 'temp-moderate';
        return 'temp-high';
    }

    formatMethod(method) {
        const methods = {
            'oral': 'Oral',
            'axillary': 'Axillary',
            'rectal': 'Rectal',
            'tympanic': 'Tympanic',
            'temporal': 'Temporal'
        };
        return methods[method] || method;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatTimeLabel(time, view) {
        switch (view) {
            case '24h':
                return time.getHours() + ':00';
            case '7d':
                return time.toLocaleDateString('en', { weekday: 'short' });
            case '30d':
                return time.getDate().toString();
            default:
                return '';
        }
    }

    saveData() {
        localStorage.setItem('feverReadings', JSON.stringify(this.readings));
    }

    loadData() {
        const savedReadings = localStorage.getItem('feverReadings');
        if (savedReadings) {
            this.readings = JSON.parse(savedReadings).map(r => ({
                ...r,
                timestamp: new Date(r.timestamp)
            }));
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FeverPatternAnalyzer();
});