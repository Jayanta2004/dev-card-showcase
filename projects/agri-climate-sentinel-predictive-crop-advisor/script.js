// 🌾 AGRI-CLIMATE SENTINEL · Predictive Crop Advisor
// Interactive agricultural advisory system with predictive analytics

class AgriClimateSentinel {
    constructor() {
        this.canvas = document.getElementById('field-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.location = 'north';
        this.crop = 'wheat';
        this.fieldData = [];
        this.weatherForecast = [];
        this.alerts = [];
        this.recommendations = [];

        this.initializeEventListeners();
        this.generateInitialData();
        this.updateDisplay();
        this.startRealTimeUpdates();
    }

    initializeEventListeners() {
        document.getElementById('location').addEventListener('change', (e) => {
            this.location = e.target.value;
            this.updateDisplay();
        });

        document.getElementById('crop').addEventListener('change', (e) => {
            this.crop = e.target.value;
            this.updateDisplay();
        });

        document.getElementById('analyze-btn').addEventListener('click', () => {
            this.analyzeConditions();
        });
    }

    generateInitialData() {
        // Generate field health data (simulated satellite imagery analysis)
        this.fieldData = [];
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 15; j++) {
                const health = Math.random();
                this.fieldData.push({
                    x: i,
                    y: j,
                    health: health,
                    stress: this.calculateStress(health),
                    moisture: 0.3 + Math.random() * 0.7
                });
            }
        }

        // Generate weather forecast
        this.generateWeatherForecast();

        // Generate initial recommendations
        this.generateRecommendations();
    }

    calculateStress(health) {
        if (health > 0.7) return 'healthy';
        if (health > 0.4) return 'stressed';
        return 'critical';
    }

    generateWeatherForecast() {
        const conditions = ['☀️', '⛅', '🌧️', '⛈️', '🌤️'];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        this.weatherForecast = days.map((day, index) => ({
            day,
            temp: 15 + Math.floor(Math.random() * 20),
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            precipitation: Math.floor(Math.random() * 100)
        }));
    }

    generateRecommendations() {
        this.recommendations = [
            {
                title: 'Optimal Irrigation Schedule',
                description: 'Water every 3 days, 2 hours per session based on current soil moisture levels.'
            },
            {
                title: 'Pest Monitoring',
                description: 'Increase field patrols in northern quadrant where stress indicators are elevated.'
            },
            {
                title: 'Fertilizer Application',
                description: 'Apply nitrogen-based fertilizer in stressed areas to improve plant health.'
            },
            {
                title: 'Harvest Planning',
                description: 'Schedule harvest for healthy zones within the next 2 weeks.'
            }
        ];
    }

    updateDisplay() {
        this.drawFieldMap();
        this.updateMetrics();
        this.updateWeatherForecast();
        this.updateAlerts();
        this.updateRecommendations();
    }

    drawFieldMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const cellWidth = this.canvas.width / 20;
        const cellHeight = this.canvas.height / 15;

        this.fieldData.forEach(cell => {
            const x = cell.x * cellWidth;
            const y = cell.y * cellHeight;

            // Color based on health
            let color;
            switch (cell.stress) {
                case 'healthy':
                    color = `rgba(82, 183, 136, ${0.6 + cell.health * 0.4})`;
                    break;
                case 'stressed':
                    color = `rgba(244, 162, 97, ${0.6 + cell.health * 0.4})`;
                    break;
                case 'critical':
                    color = `rgba(214, 40, 40, ${0.6 + cell.health * 0.4})`;
                    break;
            }

            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);

            // Add subtle grid lines
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeRect(x, y, cellWidth, cellHeight);
        });
    }

    updateMetrics() {
        // Calculate average metrics
        const avgHealth = this.fieldData.reduce((sum, cell) => sum + cell.health, 0) / this.fieldData.length;
        const avgMoisture = this.fieldData.reduce((sum, cell) => sum + cell.moisture, 0) / this.fieldData.length;

        // Update soil moisture
        const moisturePercent = Math.round(avgMoisture * 100);
        document.getElementById('soil-moisture').textContent = `${moisturePercent}%`;
        document.getElementById('soil-bar').style.width = `${moisturePercent}%`;

        // Update stress index
        let stressLevel, stressColor;
        if (avgHealth > 0.7) {
            stressLevel = 'Low';
            stressColor = '#52b788';
        } else if (avgHealth > 0.4) {
            stressLevel = 'Medium';
            stressColor = '#f4a261';
        } else {
            stressLevel = 'High';
            stressColor = '#d62828';
        }
        document.getElementById('stress-index').textContent = stressLevel;
        document.getElementById('stress-indicator').style.background = stressColor;

        // Update temperature (simulated)
        const temp = 18 + Math.floor(Math.random() * 15);
        document.getElementById('temperature').textContent = `${temp}°C`;

        // Update weather icon based on forecast
        const todayCondition = this.weatherForecast[0]?.condition || '☀️';
        document.getElementById('weather-icon').textContent = todayCondition;
    }

    updateWeatherForecast() {
        const container = document.getElementById('forecast-container');
        container.innerHTML = '';

        this.weatherForecast.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="day">${day.day}</div>
                <div class="temp">${day.temp}°C</div>
                <div class="condition">${day.condition}</div>
                <div class="precipitation">${day.precipitation}% rain</div>
            `;
            container.appendChild(card);
        });
    }

    updateAlerts() {
        const container = document.getElementById('alerts-container');
        container.innerHTML = '';

        // Generate alerts based on current conditions
        this.alerts = [];

        const criticalCells = this.fieldData.filter(cell => cell.stress === 'critical').length;
        const stressedCells = this.fieldData.filter(cell => cell.stress === 'stressed').length;

        if (criticalCells > 50) {
            this.alerts.push({
                type: 'danger',
                icon: '🚨',
                message: `${criticalCells} critical stress zones detected. Immediate intervention required.`
            });
        }

        if (stressedCells > 100) {
            this.alerts.push({
                type: 'warning',
                icon: '⚠️',
                message: `${stressedCells} stressed areas identified. Monitor closely.`
            });
        }

        const avgMoisture = this.fieldData.reduce((sum, cell) => sum + cell.moisture, 0) / this.fieldData.length;
        if (avgMoisture < 0.4) {
            this.alerts.push({
                type: 'warning',
                icon: '💧',
                message: 'Low soil moisture detected. Consider irrigation.'
            });
        }

        // Always show system status
        this.alerts.push({
            type: 'info',
            icon: 'ℹ️',
            message: 'All sensors operational. Real-time monitoring active.'
        });

        this.alerts.forEach(alert => {
            const card = document.createElement('div');
            card.className = `alert-card ${alert.type}`;
            card.innerHTML = `
                <span class="alert-icon">${alert.icon}</span>
                <div class="alert-content">${alert.message}</div>
            `;
            container.appendChild(card);
        });
    }

    updateRecommendations() {
        const container = document.getElementById('recommendations-container');
        container.innerHTML = '';

        this.recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.innerHTML = `
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
            `;
            container.appendChild(card);
        });
    }

    analyzeConditions() {
        const btn = document.getElementById('analyze-btn');
        const originalText = btn.textContent;
        btn.textContent = '🔄 Analyzing...';
        btn.classList.add('loading');

        // Simulate analysis delay
        setTimeout(() => {
            // Update field data with new analysis
            this.fieldData.forEach(cell => {
                // Simulate slight changes based on weather and conditions
                cell.health = Math.max(0.1, Math.min(1, cell.health + (Math.random() - 0.5) * 0.2));
                cell.stress = this.calculateStress(cell.health);
                cell.moisture = Math.max(0.1, Math.min(1, cell.moisture + (Math.random() - 0.5) * 0.3));
            });

            this.updateDisplay();
            btn.textContent = originalText;
            btn.classList.remove('loading');
        }, 2000);
    }

    startRealTimeUpdates() {
        // Update metrics every 30 seconds
        setInterval(() => {
            this.updateMetrics();
            this.updateAlerts();
        }, 30000);

        // Simulate gradual changes in field conditions
        setInterval(() => {
            this.fieldData.forEach(cell => {
                // Very slight random changes
                cell.health = Math.max(0.1, Math.min(1, cell.health + (Math.random() - 0.5) * 0.05));
                cell.stress = this.calculateStress(cell.health);
            });
            this.drawFieldMap();
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AgriClimateSentinel();
});