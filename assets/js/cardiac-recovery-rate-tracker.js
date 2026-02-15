// Cardiac Recovery Rate Tracker JavaScript

class CardiacRecoveryTracker {
    constructor() {
        this.data = this.loadData();
        this.currentChart = 'recovery';
        this.initializeEventListeners();
        this.renderHistory();
        this.updateStats();
    }

    loadData() {
        const saved = localStorage.getItem('cardiacRecoveryData');
        return saved ? JSON.parse(saved) : [];
    }

    saveData() {
        localStorage.setItem('cardiacRecoveryData', JSON.stringify(this.data));
    }

    initializeEventListeners() {
        const form = document.getElementById('recoveryForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Chart type buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchChart(e.target.dataset.chart));
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            exerciseType: formData.get('exerciseType'),
            peakHeartRate: parseInt(formData.get('peakHeartRate')),
            restingHeartRate: parseInt(formData.get('restingHeartRate')),
            recoveryTime: parseInt(formData.get('recoveryTime')),
            age: parseInt(formData.get('age')),
            fitnessLevel: formData.get('fitnessLevel'),
            notes: formData.get('notes') || ''
        };

        // Calculate recovery rate
        entry.recoveryRate = this.calculateRecoveryRate(entry);
        entry.rating = this.getRecoveryRating(entry.recoveryRate);

        this.data.unshift(entry);
        this.saveData();

        this.displayResults(entry);
        this.renderHistory();
        this.updateStats();
        this.renderChart();

        // Reset form
        e.target.reset();
    }

    calculateRecoveryRate(entry) {
        // Recovery rate calculation based on heart rate drop
        const hrDrop = entry.peakHeartRate - entry.restingHeartRate;
        const recoveryPercentage = (hrDrop / entry.peakHeartRate) * 100;

        // Adjust for recovery time (faster recovery is better)
        const timeAdjustment = Math.max(0, 100 - (entry.recoveryTime / 2));

        return Math.min(100, recoveryPercentage + timeAdjustment);
    }

    getRecoveryRating(rate) {
        if (rate >= 80) return { label: 'Excellent', color: 'excellent' };
        if (rate >= 60) return { label: 'Good', color: 'good' };
        if (rate >= 40) return { label: 'Fair', color: 'fair' };
        return { label: 'Poor', color: 'poor' };
    }

    displayResults(entry) {
        const display = document.getElementById('recoveryDisplay');
        if (!display) return;

        display.innerHTML = `
            <div class="recovery-result">
                <div class="recovery-score">
                    <div class="score-circle rating-${entry.rating.color}">
                        <span>${Math.round(entry.recoveryRate)}</span>
                        <div class="score-label">${entry.rating.label}</div>
                    </div>
                    <div class="score-details">
                        <div class="detail-item">
                            <span class="label">Heart Rate Drop</span>
                            <span>${entry.peakHeartRate - entry.restingHeartRate} bpm</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Recovery Time</span>
                            <span>${entry.recoveryTime} min</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Exercise Type</span>
                            <span>${entry.exerciseType}</span>
                        </div>
                    </div>
                </div>
                <div class="recovery-insights">
                    <h3>Recovery Insights</h3>
                    <p>${this.generateInsights(entry)}</p>
                </div>
            </div>
        `;

        // Update score circle with actual percentage
        const circle = display.querySelector('.score-circle');
        circle.style.background = `conic-gradient(#48bb78 0% ${entry.recoveryRate}%, #e2e8f0 ${entry.recoveryRate}% 100%)`;
    }

    generateInsights(entry) {
        const insights = [];

        if (entry.recoveryRate >= 80) {
            insights.push("Excellent recovery! Your cardiovascular system is responding very well to exercise.");
        } else if (entry.recoveryRate >= 60) {
            insights.push("Good recovery rate. Consider incorporating more recovery-focused activities.");
        } else if (entry.recoveryRate >= 40) {
            insights.push("Fair recovery. Focus on improving cardiovascular fitness and recovery techniques.");
        } else {
            insights.push("Recovery needs improvement. Consider consulting a healthcare professional.");
        }

        if (entry.recoveryTime > 5) {
            insights.push("Long recovery time suggests high exercise intensity. Ensure adequate rest between sessions.");
        }

        if (entry.fitnessLevel === 'beginner' && entry.recoveryRate < 50) {
            insights.push("As a beginner, focus on building base fitness gradually.");
        }

        return insights.join(' ');
    }

    renderHistory() {
        const tbody = document.querySelector('#historyTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.data.slice(0, 10).forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>${entry.exerciseType}</td>
                <td>${entry.peakHeartRate}</td>
                <td>${entry.restingHeartRate}</td>
                <td>${entry.recoveryTime} min</td>
                <td>${Math.round(entry.recoveryRate)}%</td>
                <td><span class="rating-${entry.rating.color}">${entry.rating.label}</span></td>
                <td>
                    <button onclick="tracker.deleteEntry(${entry.id})" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    deleteEntry(id) {
        this.data = this.data.filter(entry => entry.id !== id);
        this.saveData();
        this.renderHistory();
        this.updateStats();
        this.renderChart();
    }

    updateStats() {
        const stats = this.calculateStats();

        // Update stats display
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });
    }

    calculateStats() {
        if (this.data.length === 0) {
            return {
                avgRecoveryRate: '0%',
                bestRecoveryRate: '0%',
                totalSessions: '0',
                avgRecoveryTime: '0 min'
            };
        }

        const rates = this.data.map(d => d.recoveryRate);
        const times = this.data.map(d => d.recoveryTime);

        return {
            avgRecoveryRate: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) + '%',
            bestRecoveryRate: Math.round(Math.max(...rates)) + '%',
            totalSessions: this.data.length.toString(),
            avgRecoveryTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length) + ' min'
        };
    }

    switchChart(chartType) {
        this.currentChart = chartType;

        // Update button states
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.chart === chartType);
        });

        this.renderChart();
    }

    renderChart() {
        const ctx = document.getElementById('recoveryChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = this.data.slice(0, 10).reverse().map(entry =>
            new Date(entry.date).toLocaleDateString()
        );

        let data, label, color;

        if (this.currentChart === 'recovery') {
            data = this.data.slice(0, 10).reverse().map(entry => entry.recoveryRate);
            label = 'Recovery Rate (%)';
            color = '#4299e1';
        } else {
            data = this.data.slice(0, 10).reverse().map(entry => entry.recoveryTime);
            label = 'Recovery Time (min)';
            color = '#48bb78';
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: color,
                    backgroundColor: color + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: this.currentChart === 'recovery' ? 100 : Math.max(...data) * 1.2
                    }
                }
            }
        });
    }
}

// Initialize tracker when DOM is loaded
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new CardiacRecoveryTracker();
});