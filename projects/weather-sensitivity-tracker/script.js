// Weather Sensitivity Tracker

class WeatherSensitivityTracker {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('weather-sensitivity-entries')) || [];
        this.currentWeather = null;

        // OpenWeatherMap API - you'll need to replace with your API key
        this.weatherAPIKey = 'YOUR_API_KEY_HERE'; // Replace with actual API key
        this.weatherAPIUrl = 'https://api.openweathermap.org/data/2.5/weather';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.getCurrentWeather();
        this.updateUI();
        this.renderCorrelationChart();
        this.displayRecentEntries();
        this.generateInsights();
    }

    setupEventListeners() {
        const form = document.getElementById('health-entry-form');
        const moodSlider = document.getElementById('mood');
        const energySlider = document.getElementById('energy');
        const correlationMetric = document.getElementById('correlation-metric');
        const timeRange = document.getElementById('time-range');
        const refreshWeatherBtn = document.getElementById('refresh-weather');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.logHealthEntry();
        });

        moodSlider.addEventListener('input', (e) => {
            document.getElementById('mood-value').textContent = e.target.value;
        });

        energySlider.addEventListener('input', (e) => {
            document.getElementById('energy-value').textContent = e.target.value;
        });

        correlationMetric.addEventListener('change', () => this.renderCorrelationChart());
        timeRange.addEventListener('change', () => this.renderCorrelationChart());
        refreshWeatherBtn.addEventListener('click', () => this.getCurrentWeather());
    }

    async getCurrentWeather() {
        try {
            // For demo purposes, using mock weather data
            // In production, replace with actual API call
            this.setMockWeatherData();

            // Uncomment below for real API integration:
            /*
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `${this.weatherAPIUrl}?lat=${latitude}&lon=${longitude}&appid=${this.weatherAPIKey}&units=metric`
                    );
                    const data = await response.json();
                    this.currentWeather = {
                        temp: Math.round(data.main.temp),
                        humidity: data.main.humidity,
                        pressure: data.main.pressure,
                        condition: data.weather[0].main,
                        description: data.weather[0].description
                    };
                    this.updateWeatherDisplay();
                });
            }
            */
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.setMockWeatherData();
        }
    }

    setMockWeatherData() {
        // Mock weather data for demonstration
        const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'];
        this.currentWeather = {
            temp: Math.round(Math.random() * 30 + 5), // 5-35°C
            humidity: Math.round(Math.random() * 60 + 40), // 40-100%
            pressure: Math.round(Math.random() * 100 + 1000), // 1000-1100 hPa
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            description: 'Mock weather data'
        };
        this.updateWeatherDisplay();
    }

    updateWeatherDisplay() {
        if (!this.currentWeather) return;

        document.getElementById('current-temp').textContent = `${this.currentWeather.temp}°C`;
        document.getElementById('current-humidity').textContent = `${this.currentWeather.humidity}%`;
        document.getElementById('current-pressure').textContent = `${this.currentWeather.pressure} hPa`;
        document.getElementById('current-condition').textContent = this.currentWeather.condition;
    }

    logHealthEntry() {
        const mood = parseInt(document.getElementById('mood').value);
        const energy = parseInt(document.getElementById('energy').value);
        const notes = document.getElementById('notes').value.trim();

        const symptoms = Array.from(document.querySelectorAll('.symptom-checkbox input:checked'))
            .map(cb => cb.value);

        if (!this.currentWeather) {
            alert('Please wait for weather data to load.');
            return;
        }

        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            date: new Date().toDateString(),
            mood,
            energy,
            symptoms,
            notes,
            weather: { ...this.currentWeather }
        };

        this.entries.unshift(entry);

        // Keep only last 100 entries
        if (this.entries.length > 100) {
            this.entries = this.entries.slice(0, 100);
        }

        this.saveData();
        this.updateUI();
        this.renderCorrelationChart();
        this.displayRecentEntries();
        this.generateInsights();

        // Reset form
        document.getElementById('health-entry-form').reset();
        document.getElementById('mood').value = 5;
        document.getElementById('energy').value = 5;
        document.getElementById('mood-value').textContent = '5';
        document.getElementById('energy-value').textContent = '5';

        this.showNotification('Health entry logged successfully!', 'success');
    }

    calculateStats() {
        const today = new Date().toDateString();
        const todayEntries = this.entries.filter(e => e.date === today);

        const avgMood = todayEntries.length > 0 ?
            Math.round(todayEntries.reduce((sum, e) => sum + e.mood, 0) / todayEntries.length * 10) / 10 : 0;

        // Calculate sensitivity score based on weather-symptom correlations
        const sensitivityScore = this.calculateSensitivityScore();

        // Find most affected symptom
        const symptomCounts = {};
        this.entries.forEach(entry => {
            entry.symptoms.forEach(symptom => {
                symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
            });
        });

        const mostAffected = Object.keys(symptomCounts).length > 0 ?
            Object.keys(symptomCounts).reduce((a, b) =>
                symptomCounts[a] > symptomCounts[b] ? a : b) : 'None';

        return {
            todayEntries: todayEntries.length,
            avgMood: avgMood || '--',
            sensitivityScore: sensitivityScore ? `${sensitivityScore}%` : '--',
            mostAffected: this.formatSymptomName(mostAffected)
        };
    }

    calculateSensitivityScore() {
        if (this.entries.length < 5) return null;

        let correlationSum = 0;
        let count = 0;

        // Calculate correlation between weather changes and symptom severity
        for (let i = 1; i < this.entries.length; i++) {
            const current = this.entries[i];
            const previous = this.entries[i - 1];

            const weatherChange = Math.abs(current.weather.temp - previous.weather.temp) +
                                Math.abs(current.weather.humidity - previous.weather.humidity) * 0.1;

            const symptomChange = current.symptoms.length - previous.symptoms.length;

            if (weatherChange > 0) {
                correlationSum += Math.abs(symptomChange) / weatherChange;
                count++;
            }
        }

        if (count === 0) return null;

        const avgCorrelation = correlationSum / count;
        return Math.min(Math.round(avgCorrelation * 20), 100); // Scale to percentage
    }

    formatSymptomName(symptom) {
        const names = {
            'headache': 'Headache',
            'fatigue': 'Fatigue',
            'joint-pain': 'Joint Pain',
            'nausea': 'Nausea',
            'anxiety': 'Anxiety',
            'insomnia': 'Insomnia',
            'migraine': 'Migraine',
            'depression': 'Depression'
        };
        return names[symptom] || symptom;
    }

    updateUI() {
        const stats = this.calculateStats();

        document.getElementById('today-entries').textContent = stats.todayEntries;
        document.getElementById('avg-mood').textContent = `${stats.avgMood}/10`;
        document.getElementById('sensitivity-score').textContent = stats.sensitivityScore;
        document.getElementById('most-affected').textContent = stats.mostAffected;
    }

    renderCorrelationChart() {
        const metric = document.getElementById('correlation-metric').value;
        const timeRange = parseInt(document.getElementById('time-range').value);

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeRange);

        const filteredEntries = this.entries.filter(entry =>
            new Date(entry.timestamp) >= cutoffDate
        ).reverse(); // Reverse to show chronological order

        if (filteredEntries.length === 0) {
            this.showNoDataChart();
            return;
        }

        const labels = filteredEntries.map(entry =>
            new Date(entry.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        );

        let data, label, color;

        switch (metric) {
            case 'mood':
                data = filteredEntries.map(e => e.mood);
                label = 'Mood Level';
                color = '#0984e3';
                break;
            case 'energy':
                data = filteredEntries.map(e => e.energy);
                label = 'Energy Level';
                color = '#27ae60';
                break;
            default:
                // For symptoms, count occurrences
                data = filteredEntries.map(e => e.symptoms.includes(metric) ? 1 : 0);
                label = `${this.formatSymptomName(metric)} Occurrence`;
                color = '#e74c3c';
        }

        // Add weather data as second dataset
        const weatherData = filteredEntries.map(e => e.weather.temp);
        const weatherLabel = 'Temperature (°C)';

        const ctx = document.getElementById('correlation-chart').getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    borderColor: color,
                    backgroundColor: color + '20',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: false
                }, {
                    label: weatherLabel,
                    data: weatherData,
                    borderColor: '#f39c12',
                    backgroundColor: '#f39c1220',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${label} vs Temperature (${timeRange} days)`
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: metric === 'mood' || metric === 'energy' ? 'Level (1-10)' : 'Occurrence'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
    }

    showNoDataChart() {
        const ctx = document.getElementById('correlation-chart').getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.font = '20px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No data available for selected time range', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

    generateInsights() {
        const insights = this.analyzePatterns();

        document.getElementById('weather-triggers').textContent = insights.weatherTriggers;
        document.getElementById('patterns-detected').textContent = insights.patterns;
        document.getElementById('recommendations').textContent = insights.recommendations;
    }

    analyzePatterns() {
        if (this.entries.length < 3) {
            return {
                weatherTriggers: 'Need more data to identify weather triggers.',
                patterns: 'Keep logging entries to detect patterns.',
                recommendations: 'Log at least 3-5 entries to see correlations.'
            };
        }

        // Analyze weather-symptom correlations
        const weatherImpacts = {};
        const symptomWeather = {};

        this.entries.forEach(entry => {
            const temp = entry.weather.temp;
            const tempRange = temp < 10 ? 'cold' : temp > 25 ? 'hot' : 'moderate';

            entry.symptoms.forEach(symptom => {
                if (!symptomWeather[symptom]) symptomWeather[symptom] = {};
                symptomWeather[symptom][tempRange] = (symptomWeather[symptom][tempRange] || 0) + 1;
            });

            if (!weatherImpacts[tempRange]) weatherImpacts[tempRange] = { symptoms: 0, entries: 0 };
            weatherImpacts[tempRange].symptoms += entry.symptoms.length;
            weatherImpacts[tempRange].entries++;
        });

        // Find strongest correlations
        let maxCorrelation = 0;
        let correlatedWeather = '';
        let correlatedSymptom = '';

        Object.keys(symptomWeather).forEach(symptom => {
            Object.keys(symptomWeather[symptom]).forEach(weather => {
                const count = symptomWeather[symptom][weather];
                if (count > maxCorrelation) {
                    maxCorrelation = count;
                    correlatedWeather = weather;
                    correlatedSymptom = symptom;
                }
            });
        });

        const weatherTriggers = maxCorrelation > 1 ?
            `${this.formatSymptomName(correlatedSymptom)} occurs most during ${correlatedWeather} weather.` :
            'No strong weather-symptom correlations detected yet.';

        const patterns = this.entries.length > 7 ?
            'Consistent daily logging detected. Good job maintaining your health journal!' :
            'Inconsistent logging pattern. Try to log daily for better insights.';

        const recommendations = correlatedWeather ?
            `Consider taking preventive measures during ${correlatedWeather} weather conditions.` :
            'Continue logging to identify your personal weather sensitivities.';

        return {
            weatherTriggers,
            patterns,
            recommendations
        };
    }

    displayRecentEntries() {
        const list = document.getElementById('entries-list');
        const recentEntries = this.entries.slice(0, 10);

        if (recentEntries.length === 0) {
            list.innerHTML = '<p>No entries logged yet. Start tracking your health!</p>';
            return;
        }

        list.innerHTML = recentEntries.map(entry => `
            <div class="entry-item">
                <div class="time">${new Date(entry.timestamp).toLocaleString()}</div>
                <div class="metrics">
                    <span class="metric">Mood: ${entry.mood}/10</span>
                    <span class="metric">Energy: ${entry.energy}/10</span>
                </div>
                <div class="symptoms">${entry.symptoms.length > 0 ? 'Symptoms: ' + entry.symptoms.map(s => this.formatSymptomName(s)).join(', ') : 'No symptoms reported'}</div>
                <div class="weather">Weather: ${entry.weather.temp}°C, ${entry.weather.condition}</div>
                ${entry.notes ? `<div class="notes">Notes: ${entry.notes}</div>` : ''}
            </div>
        `).join('');
    }

    saveData() {
        localStorage.setItem('weather-sensitivity-entries', JSON.stringify(this.entries));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherSensitivityTracker();
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