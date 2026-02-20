// Indoor Air Quality Impact Tracker JavaScript
// This module tracks indoor air quality readings and correlates them with health symptoms

class IndoorAirQualityTracker {
    constructor() {
        // Initialize air quality data from localStorage
        this.airQualityData = this.loadData();
        // Chart instance for Chart.js
        this.chart = null;
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and rendering all components
     */
    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();
        this.updateSliders();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging air quality readings
        document.getElementById('environmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logReading();
        });

        // Slider updates for real-time display
        ['ventilation', 'humidity', 'temperature', 'airQuality'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateSliders();
            });
        });

        // Chart controls
        document.getElementById('correlationTimeRange').addEventListener('change', () => {
            this.renderChart();
        });

        document.getElementById('correlationType').addEventListener('change', () => {
            this.renderChart();
        });

        document.getElementById('refreshCorrelation').addEventListener('click', () => {
            this.renderChart();
        });

        // History view controls
        document.getElementById('viewRecent').addEventListener('click', () => {
            this.toggleHistoryView('recent');
        });

        document.getElementById('viewAll').addEventListener('click', () => {
            this.toggleHistoryView('all');
        });
    }

    /**
     * Update all slider displays based on current values
     */
    updateSliders() {
        this.updateSliderDisplay('ventilation', 'ventilationValue', 'ventilationText', this.getVentilationLabel);
        this.updateSliderDisplay('humidity', 'humidityValue', 'humidityText', this.getHumidityLabel);
        this.updateSliderDisplay('temperature', 'temperatureValue', 'temperatureText', this.getTemperatureLabel);
        this.updateSliderDisplay('airQuality', 'airQualityValue', 'airQualityText', this.getAirQualityLabel);
    }

    /**
     * Update a single slider display
     */
    updateSliderDisplay(sliderId, valueId, textId, labelFunction) {
        const value = document.getElementById(sliderId).value;
        document.getElementById(valueId).textContent = value;
        document.getElementById(textId).textContent = labelFunction(value);
    }

    /**
     * Get ventilation level label
     */
    getVentilationLabel(value) {
        const labels = {
            1: 'Poor', 2: 'Poor', 3: 'Limited', 4: 'Limited',
            5: 'Moderate', 6: 'Moderate', 7: 'Good', 8: 'Good',
            9: 'Excellent', 10: 'Excellent'
        };
        return labels[value] || 'Moderate';
    }

    /**
     * Get humidity level label
     */
    getHumidityLabel(value) {
        const labels = {
            1: 'Very Dry', 2: 'Dry', 3: 'Dry', 4: 'Comfortable',
            5: 'Comfortable', 6: 'Comfortable', 7: 'Humid', 8: 'Humid',
            9: 'Very Humid', 10: 'Very Humid'
        };
        return labels[value] || 'Comfortable';
    }

    /**
     * Get temperature comfort label
     */
    getTemperatureLabel(value) {
        const labels = {
            1: 'Very Cold', 2: 'Cold', 3: 'Cool', 4: 'Cool',
            5: 'Comfortable', 6: 'Comfortable', 7: 'Warm', 8: 'Warm',
            9: 'Hot', 10: 'Very Hot'
        };
        return labels[value] || 'Comfortable';
    }

    /**
     * Get air quality perception label
     */
    getAirQualityLabel(value) {
        const labels = {
            1: 'Very Poor', 2: 'Poor', 3: 'Poor', 4: 'Fair',
            5: 'Moderate', 6: 'Moderate', 7: 'Good', 8: 'Good',
            9: 'Excellent', 10: 'Excellent'
        };
        return labels[value] || 'Moderate';
    }

    /**
     * Log a new air quality reading from the form data
     */
    logReading() {
        // Collect form data
        const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked'))
            .map(checkbox => checkbox.value);

        const formData = {
            id: Date.now(),
            readingDate: document.getElementById('readingDate').value,
            roomType: document.getElementById('roomType').value,
            ventilation: parseInt(document.getElementById('ventilation').value),
            humidity: parseInt(document.getElementById('humidity').value),
            temperature: parseInt(document.getElementById('temperature').value),
            airQuality: parseInt(document.getElementById('airQuality').value),
            symptoms: symptoms,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };

        // Add to data array
        this.airQualityData.push(formData);
        this.saveData();

        // Reset form
        document.getElementById('environmentForm').reset();
        // Uncheck all symptom checkboxes
        document.querySelectorAll('input[name="symptoms"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSliders();

        // Update UI
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();

        // Show success message
        this.showNotification('Air quality reading logged successfully!', 'success');
    }

    /**
     * Load air quality data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('indoorAirQualityData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save air quality data to localStorage
     */
    saveData() {
        localStorage.setItem('indoorAirQualityData', JSON.stringify(this.airQualityData));
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        const data = this.airQualityData;

        if (data.length === 0) {
            // Reset all metrics
            document.getElementById('avgAirQuality').textContent = '--';
            document.getElementById('symptomFrequency').textContent = '--';
            document.getElementById('totalReadings').textContent = '0';
            document.getElementById('wellnessScore').textContent = '--';
            document.getElementById('qualityFill').style.width = '0%';
            document.getElementById('qualityLabel').textContent = 'No data available';
            return;
        }

        // Calculate metrics
        const avgAirQuality = data.reduce((sum, item) => sum + item.airQuality, 0) / data.length;
        const symptomDays = data.filter(item => item.symptoms.length > 0).length;
        const totalReadings = data.length;

        // Calculate wellness score (inverse of symptom frequency, adjusted by air quality)
        const symptomRatio = symptomDays / totalReadings;
        const wellnessScore = Math.max(0, Math.min(100, (avgAirQuality * 10) - (symptomRatio * 50)));

        // Update metrics display
        document.getElementById('avgAirQuality').textContent = avgAirQuality.toFixed(1);
        document.getElementById('symptomFrequency').textContent = `${symptomDays}/${totalReadings}`;
        document.getElementById('totalReadings').textContent = totalReadings;
        document.getElementById('wellnessScore').textContent = Math.round(wellnessScore);

        // Update quality indicator
        document.getElementById('qualityFill').style.width = `${wellnessScore}%`;
        document.getElementById('qualityLabel').textContent = this.getWellnessLabel(wellnessScore);
    }

    /**
     * Get wellness label based on score
     */
    getWellnessLabel(score) {
        if (score >= 80) return 'Excellent Air Quality';
        if (score >= 60) return 'Good Air Quality';
        if (score >= 40) return 'Moderate Air Quality';
        if (score >= 20) return 'Poor Air Quality';
        return 'Concerning Air Quality';
    }

    /**
     * Render the correlation chart
     */
    renderChart() {
        const ctx = document.getElementById('correlationChart').getContext('2d');
        const timeRange = document.getElementById('correlationTimeRange').value;
        const correlationType = document.getElementById('correlationType').value;

        // Filter data based on time range
        const filteredData = this.filterDataByTimeRange(timeRange);

        if (filteredData.length === 0) {
            if (this.chart) {
                this.chart.destroy();
            }
            return;
        }

        // Prepare chart data based on correlation type
        let chartData;
        switch (correlationType) {
            case 'ventilation':
                chartData = this.prepareCorrelationData(filteredData, 'ventilation', 'Ventilation Level');
                break;
            case 'humidity':
                chartData = this.prepareCorrelationData(filteredData, 'humidity', 'Humidity Level');
                break;
            case 'temperature':
                chartData = this.prepareCorrelationData(filteredData, 'temperature', 'Temperature Comfort');
                break;
            case 'air-quality':
                chartData = this.prepareCorrelationData(filteredData, 'airQuality', 'Air Quality');
                break;
        }

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Symptom Days',
                    data: chartData.symptomPoints,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    pointRadius: 6
                }, {
                    label: 'Symptom-Free Days',
                    data: chartData.noSymptomPoints,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = context.raw;
                                return `${context.dataset.label}: ${chartData.label} ${point.x}, Symptoms: ${point.symptoms}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: chartData.label
                        },
                        min: 1,
                        max: 10
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Symptoms'
                        },
                        min: 0
                    }
                }
            }
        });
    }

    /**
     * Prepare correlation data for scatter plot
     */
    prepareCorrelationData(data, factor, label) {
        const symptomPoints = [];
        const noSymptomPoints = [];

        data.forEach(item => {
            const point = {
                x: item[factor],
                y: item.symptoms.length,
                symptoms: item.symptoms.join(', ') || 'None'
            };

            if (item.symptoms.length > 0) {
                symptomPoints.push(point);
            } else {
                noSymptomPoints.push(point);
            }
        });

        return {
            symptomPoints,
            noSymptomPoints,
            label
        };
    }

    /**
     * Filter data based on selected time range
     */
    filterDataByTimeRange(range) {
        const now = new Date();
        const days = parseInt(range);

        if (range === 'all') {
            return this.airQualityData;
        }

        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

        return this.airQualityData.filter(item => {
            const readingDate = new Date(item.readingDate);
            return readingDate >= cutoffDate;
        });
    }

    /**
     * Render the reading history
     */
    renderHistory(view = 'recent') {
        const historyContainer = document.getElementById('readingHistory');
        let data = this.airQualityData;

        // Sort by date (most recent first)
        data.sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate));

        // Filter for recent view (last 10 readings)
        if (view === 'recent') {
            data = data.slice(0, 10);
        }

        // Clear existing content
        historyContainer.innerHTML = '';

        if (data.length === 0) {
            historyContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No readings logged yet.</p>';
            return;
        }

        // Render history items
        data.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const readingDate = new Date(item.readingDate).toLocaleString();
            const roomTypeLabel = this.getRoomTypeLabel(item.roomType);

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${roomTypeLabel}</div>
                    <div class="history-item-date">${readingDate}</div>
                </div>
                <div class="history-item-details">
                    <div>Ventilation: ${item.ventilation}/10</div>
                    <div>Humidity: ${item.humidity}/10</div>
                    <div>Temperature: ${item.temperature}/10</div>
                    <div>Air Quality: ${item.airQuality}/10</div>
                </div>
                ${item.symptoms.length > 0 ? `<div class="history-item-symptoms">
                    ${item.symptoms.map(symptom => `<span class="symptom-tag">${this.getSymptomLabel(symptom)}</span>`).join('')}
                </div>` : '<div class="history-item-symptoms">No symptoms reported</div>'}
                ${item.notes ? `<div class="history-item-notes">${item.notes}</div>` : ''}
            `;

            historyContainer.appendChild(historyItem);
        });
    }

    /**
     * Get human-readable room type label
     */
    getRoomTypeLabel(roomType) {
        const labels = {
            'office': 'Office',
            'bedroom': 'Bedroom',
            'living-room': 'Living Room',
            'kitchen': 'Kitchen',
            'bathroom': 'Bathroom',
            'other': 'Other'
        };
        return labels[roomType] || roomType;
    }

    /**
     * Get human-readable symptom label
     */
    getSymptomLabel(symptom) {
        const labels = {
            'headache': 'Headache',
            'fatigue': 'Fatigue',
            'dizziness': 'Dizziness',
            'dry-eyes': 'Dry Eyes',
            'sore-throat': 'Sore Throat',
            'cough': 'Cough',
            'nausea': 'Nausea',
            'irritability': 'Irritability'
        };
        return labels[symptom] || symptom;
    }

    /**
     * Toggle history view between recent and all
     */
    toggleHistoryView(view) {
        // Update button states
        document.getElementById('viewRecent').classList.toggle('active', view === 'recent');
        document.getElementById('viewAll').classList.toggle('active', view === 'all');

        // Render history
        this.renderHistory(view);
    }

    /**
     * Render health insights
     */
    renderInsights() {
        this.renderSymptomPatterns();
        this.renderRoomAnalysis();
        this.renderImprovementTips();
        this.renderTips();
    }

    /**
     * Render symptom patterns insight
     */
    renderSymptomPatterns() {
        const container = document.getElementById('symptomPatterns');
        const data = this.airQualityData;

        if (data.length < 3) {
            container.innerHTML = '<p>Log more readings to see symptom patterns.</p>';
            return;
        }

        // Analyze symptom patterns
        const symptomCounts = {};
        data.forEach(item => {
            item.symptoms.forEach(symptom => {
                symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
            });
        });

        const mostCommonSymptom = Object.keys(symptomCounts).reduce((a, b) =>
            symptomCounts[a] > symptomCounts[b] ? a : b, '');

        if (mostCommonSymptom) {
            const label = this.getSymptomLabel(mostCommonSymptom);
            container.innerHTML = `<p>${label} is your most commonly reported symptom (${symptomCounts[mostCommonSymptom]} times).</p>`;
        } else {
            container.innerHTML = '<p>No symptoms reported yet.</p>';
        }
    }

    /**
     * Render room analysis insight
     */
    renderRoomAnalysis() {
        const container = document.getElementById('roomAnalysis');
        const data = this.airQualityData;

        if (data.length < 5) {
            container.innerHTML = '<p>Log more readings to analyze room patterns.</p>';
            return;
        }

        // Group by room and calculate average air quality
        const roomStats = {};
        data.forEach(item => {
            if (!roomStats[item.roomType]) {
                roomStats[item.roomType] = { count: 0, totalQuality: 0, symptoms: 0 };
            }
            roomStats[item.roomType].count++;
            roomStats[item.roomType].totalQuality += item.airQuality;
            roomStats[item.roomType].symptoms += item.symptoms.length;
        });

        // Find room with most symptoms
        let worstRoom = null;
        let maxSymptomRatio = 0;

        Object.keys(roomStats).forEach(room => {
            const symptomRatio = roomStats[room].symptoms / roomStats[room].count;
            if (symptomRatio > maxSymptomRatio) {
                maxSymptomRatio = symptomRatio;
                worstRoom = room;
            }
        });

        if (worstRoom) {
            const label = this.getRoomTypeLabel(worstRoom);
            container.innerHTML = `<p>${label} shows the strongest correlation with symptoms (avg ${maxSymptomRatio.toFixed(1)} symptoms per reading).</p>`;
        } else {
            container.innerHTML = '<p>Room analysis not available yet.</p>';
        }
    }

    /**
     * Render improvement tips insight
     */
    renderImprovementTips() {
        const container = document.getElementById('improvementTips');
        const data = this.airQualityData;

        if (data.length < 5) {
            container.innerHTML = '<p>More data needed for improvement suggestions.</p>';
            return;
        }

        const avgVentilation = data.reduce((sum, item) => sum + item.ventilation, 0) / data.length;
        const avgHumidity = data.reduce((sum, item) => sum + item.humidity, 0) / data.length;
        let tip = '';

        if (avgVentilation < 5) {
            tip = 'Consider improving ventilation with open windows, fans, or air purifiers.';
        } else if (avgHumidity < 4 || avgHumidity > 7) {
            tip = 'Humidity levels seem off - consider using a humidifier or dehumidifier.';
        } else {
            tip = 'Your air quality readings are generally good! Keep monitoring for changes.';
        }

        container.innerHTML = `<p>${tip}</p>`;
    }

    /**
     * Render tips list
     */
    renderTips() {
        const container = document.getElementById('tips');
        const tips = [
            {
                title: 'Regular Ventilation',
                content: 'Open windows for 10-15 minutes daily to refresh indoor air.'
            },
            {
                title: 'Humidity Control',
                content: 'Maintain indoor humidity between 40-60% to prevent mold and discomfort.'
            },
            {
                title: 'Air Purifiers',
                content: 'Consider HEPA air purifiers for spaces with poor air quality.'
            },
            {
                title: 'Plant Benefits',
                content: 'Indoor plants can help improve air quality by filtering pollutants.'
            }
        ];

        container.innerHTML = tips.map(tip => `
            <div class="tip-item">
                <i data-lucide="lightbulb"></i>
                <div class="tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.content}</p>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Render air quality benchmarks
     */
    renderBenchmarks() {
        const container = document.getElementById('benchmarks');
        const data = this.airQualityData;

        if (data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Complete more readings to see benchmarks.</p>';
            return;
        }

        const avgAirQuality = data.reduce((sum, item) => sum + item.airQuality, 0) / data.length;
        const symptomFrequency = data.filter(item => item.symptoms.length > 0).length / data.length;

        const benchmarks = [
            {
                title: 'Air Quality Perception',
                description: 'Your average perceived air quality rating',
                range: this.getBenchmarkRange(avgAirQuality, 'air-quality'),
                icon: 'wind',
                level: this.getBenchmarkLevel(avgAirQuality, 'air-quality')
            },
            {
                title: 'Symptom Frequency',
                description: 'How often you experience air quality related symptoms',
                range: this.getBenchmarkRange(symptomFrequency, 'symptoms'),
                icon: 'activity',
                level: this.getBenchmarkLevel(symptomFrequency, 'symptoms')
            },
            {
                title: 'Monitoring Consistency',
                description: 'How regularly you track indoor air quality',
                range: this.getBenchmarkRange(data.length, 'consistency'),
                icon: 'calendar',
                level: this.getBenchmarkLevel(data.length, 'consistency')
            }
        ];

        container.innerHTML = benchmarks.map(benchmark => `
            <div class="benchmark-item">
                <div class="benchmark-header">
                    <div class="benchmark-icon ${benchmark.level}">
                        <i data-lucide="${benchmark.icon}"></i>
                    </div>
                    <div class="benchmark-title">${benchmark.title}</div>
                </div>
                <div class="benchmark-description">${benchmark.description}</div>
                <div class="benchmark-range">${benchmark.range}</div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Get benchmark range text
     */
    getBenchmarkRange(value, type) {
        switch (type) {
            case 'air-quality':
                if (value >= 8) return 'Excellent (8-10)';
                if (value >= 6) return 'Good (6-8)';
                if (value >= 4) return 'Fair (4-6)';
                return 'Poor (< 4)';
            case 'symptoms':
                if (value <= 0.2) return 'Low (< 20% of days)';
                if (value <= 0.5) return 'Moderate (20-50% of days)';
                if (value <= 0.8) return 'High (50-80% of days)';
                return 'Very High (> 80% of days)';
            case 'consistency':
                if (value >= 30) return 'Excellent (> 30 readings)';
                if (value >= 15) return 'Good (15-30 readings)';
                if (value >= 5) return 'Fair (5-15 readings)';
                return 'Needs More Data (< 5 readings)';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get benchmark level class
     */
    getBenchmarkLevel(value, type) {
        switch (type) {
            case 'air-quality':
                return value >= 7 ? 'excellent' : value >= 5 ? 'good' : 'needs-improvement';
            case 'symptoms':
                return value <= 0.3 ? 'excellent' : value <= 0.6 ? 'good' : 'concerning';
            case 'consistency':
                return value >= 20 ? 'excellent' : value >= 10 ? 'good' : 'needs-improvement';
            default:
                return 'needs-improvement';
        }
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Simple notification - you could enhance this with a proper notification system
        alert(message);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IndoorAirQualityTracker();
});