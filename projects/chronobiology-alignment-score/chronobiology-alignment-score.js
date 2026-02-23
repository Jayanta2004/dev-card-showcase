// Chronobiology Alignment Score Calculator

class ChronobiologyTracker {
    constructor() {
        this.scores = JSON.parse(localStorage.getItem('chronoScores')) || [];
        this.currentScore = 0;
        this.chart = null;
        this.init();
    }

    init() {
        this.loadSavedData();
        this.updateStats();
        this.createChart();
        this.updateHistory();
    }

    calculateAlignmentScore() {
        const inputs = this.getInputs();
        if (!this.validateInputs(inputs)) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.currentScore = this.computeScore(inputs);
        this.saveScore(this.currentScore);
        this.updateDisplay();
        this.updateStats();
        this.updateChart();
        this.updateHistory();
        this.generateRecommendations(inputs);
        this.showNotification('Alignment score calculated successfully!', 'success');
    }

    getInputs() {
        return {
            bedtime: document.getElementById('bedtime').value,
            waketime: document.getElementById('waketime').value,
            breakfastTime: document.getElementById('breakfastTime').value,
            lunchTime: document.getElementById('lunchTime').value,
            dinnerTime: document.getElementById('dinnerTime').value,
            exerciseTime: document.getElementById('exerciseTime').value,
            workStart: document.getElementById('workStart').value,
            workEnd: document.getElementById('workEnd').value,
            lightExposure: parseInt(document.getElementById('lightExposure').value) || 0,
            screenTime: parseFloat(document.getElementById('screenTime').value) || 0
        };
    }

    validateInputs(inputs) {
        const required = ['bedtime', 'waketime', 'breakfastTime', 'lunchTime', 'dinnerTime'];
        return required.every(field => inputs[field]);
    }

    computeScore(inputs) {
        let score = 100; // Start with perfect score

        // Sleep timing (most important - 40% weight)
        const sleepScore = this.calculateSleepScore(inputs.bedtime, inputs.waketime);
        score -= (100 - sleepScore) * 0.4;

        // Meal timing (25% weight)
        const mealScore = this.calculateMealScore(inputs);
        score -= (100 - mealScore) * 0.25;

        // Exercise timing (15% weight)
        const exerciseScore = this.calculateExerciseScore(inputs.exerciseTime);
        score -= (100 - exerciseScore) * 0.15;

        // Work timing (10% weight)
        const workScore = this.calculateWorkScore(inputs.workStart, inputs.workEnd);
        score -= (100 - workScore) * 0.1;

        // Light exposure (5% weight)
        const lightScore = Math.min(inputs.lightExposure / 30 * 100, 100);
        score -= (100 - lightScore) * 0.05;

        // Screen time penalty (5% weight)
        const screenPenalty = Math.min(inputs.screenTime / 2 * 20, 20);
        score -= screenPenalty * 0.05;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    calculateSleepScore(bedtime, waketime) {
        const bedHour = this.timeToHours(bedtime);
        const wakeHour = this.timeToHours(waketime);

        // Optimal: 10 PM - 6 AM (8 hours)
        const optimalBed = 22; // 10 PM
        const optimalWake = 6;  // 6 AM

        let bedPenalty = Math.abs(bedHour - optimalBed) * 5;
        let wakePenalty = Math.abs(wakeHour - optimalWake) * 5;

        // Calculate sleep duration
        let duration = wakeHour - bedHour;
        if (duration < 0) duration += 24;

        // Optimal duration: 7-9 hours
        let durationPenalty = 0;
        if (duration < 7) durationPenalty = (7 - duration) * 10;
        else if (duration > 9) durationPenalty = (duration - 9) * 5;

        const totalPenalty = bedPenalty + wakePenalty + durationPenalty;
        return Math.max(0, 100 - totalPenalty);
    }

    calculateMealScore(inputs) {
        const breakfast = this.timeToHours(inputs.breakfastTime);
        const lunch = this.timeToHours(inputs.lunchTime);
        const dinner = this.timeToHours(inputs.dinnerTime);

        // Optimal: Breakfast 7-9 AM, Lunch 12-2 PM, Dinner 6-8 PM
        const breakfastPenalty = Math.abs(breakfast - 8) * 5;
        const lunchPenalty = Math.abs(lunch - 13) * 5;
        const dinnerPenalty = Math.abs(dinner - 19) * 5;

        const totalPenalty = breakfastPenalty + lunchPenalty + dinnerPenalty;
        return Math.max(0, 100 - totalPenalty);
    }

    calculateExerciseScore(exerciseTime) {
        if (!exerciseTime) return 50; // Neutral if no exercise

        const exerciseHour = this.timeToHours(exerciseTime);
        // Optimal: Morning (6-10 AM) or Evening (5-7 PM)
        const morningOptimal = Math.abs(exerciseHour - 8);
        const eveningOptimal = Math.abs(exerciseHour - 18);

        const bestFit = Math.min(morningOptimal, eveningOptimal);
        return Math.max(0, 100 - bestFit * 10);
    }

    calculateWorkScore(workStart, workEnd) {
        if (!workStart || !workEnd) return 50; // Neutral if no work

        const startHour = this.timeToHours(workStart);
        const endHour = this.timeToHours(workEnd);

        // Optimal: Start 8-10 AM, End 4-6 PM
        const startPenalty = Math.abs(startHour - 9) * 5;
        const endPenalty = Math.abs(endHour - 17) * 5;

        return Math.max(0, 100 - startPenalty - endPenalty);
    }

    timeToHours(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + minutes / 60;
    }

    saveScore(score) {
        const today = new Date().toISOString().split('T')[0];
        const existingIndex = this.scores.findIndex(s => s.date === today);

        if (existingIndex >= 0) {
            this.scores[existingIndex].score = score;
        } else {
            this.scores.push({ date: today, score: score });
        }

        // Keep only last 30 days
        this.scores = this.scores.slice(-30);
        localStorage.setItem('chronoScores', JSON.stringify(this.scores));
    }

    updateDisplay() {
        const scoreElement = document.getElementById('currentScore');
        const circleElement = document.getElementById('scoreCircle');
        const descriptionElement = document.getElementById('scoreDescription');

        scoreElement.textContent = this.currentScore;

        // Add animation class
        circleElement.classList.add('updated');
        setTimeout(() => circleElement.classList.remove('updated'), 500);

        // Update description
        let description = '';
        if (this.currentScore >= 90) {
            description = 'Excellent alignment! Your schedule is optimally synchronized with your natural rhythms.';
        } else if (this.currentScore >= 75) {
            description = 'Good alignment. Minor adjustments could further optimize your chronobiology.';
        } else if (this.currentScore >= 60) {
            description = 'Moderate alignment. Consider adjusting your schedule for better synchronization.';
        } else if (this.currentScore >= 40) {
            description = 'Poor alignment. Significant schedule changes recommended for better health.';
        } else {
            description = 'Critical misalignment. Major schedule restructuring needed for optimal health.';
        }
        descriptionElement.textContent = description;
    }

    updateStats() {
        const scores = this.scores.map(s => s.score);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const daysTracked = this.scores.length;

        // Calculate improvement (last 7 days vs previous 7 days)
        let improvement = 0;
        if (scores.length >= 14) {
            const recent = scores.slice(-7);
            const previous = scores.slice(-14, -7);
            const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
            const previousAvg = previous.reduce((a, b) => a + b) / previous.length;
            improvement = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
        }

        document.getElementById('avgScore').textContent = avgScore;
        document.getElementById('bestScore').textContent = bestScore;
        document.getElementById('daysTracked').textContent = daysTracked;
        document.getElementById('improvement').textContent = improvement > 0 ? `+${improvement}%` : `${improvement}%`;
    }

    createChart() {
        const ctx = document.getElementById('alignmentChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Alignment Score',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return `Score: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 7
                        }
                    }
                }
            }
        });
        this.updateChart();
    }

    updateChart() {
        const sortedScores = this.scores.sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sortedScores.map(s => {
            const date = new Date(s.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = sortedScores.map(s => s.score);

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    updateHistory() {
        const historyElement = document.getElementById('scoreHistory');
        const recentScores = this.scores.slice(-5).reverse();

        if (recentScores.length === 0) {
            historyElement.innerHTML = '<p>No scores recorded yet.</p>';
            return;
        }

        historyElement.innerHTML = recentScores.map(score => `
            <div class="history-item">
                <div class="history-date">${new Date(score.date).toLocaleDateString()}</div>
                <div class="history-score">${score.score}%</div>
            </div>
        `).join('');
    }

    generateRecommendations(inputs) {
        const recommendations = [];
        const score = this.currentScore;

        // Sleep recommendations
        const bedHour = this.timeToHours(inputs.bedtime);
        const wakeHour = this.timeToHours(inputs.waketime);

        if (bedHour > 23 || bedHour < 21) {
            recommendations.push({
                text: 'Consider going to bed between 9-11 PM for optimal circadian alignment.',
                priority: bedHour > 24 || bedHour < 20 ? 'high' : 'medium'
            });
        }

        if (wakeHour > 8 || wakeHour < 5) {
            recommendations.push({
                text: 'Try waking up between 5-8 AM to align with natural light cycles.',
                priority: wakeHour > 9 || wakeHour < 4 ? 'high' : 'medium'
            });
        }

        // Meal timing
        const breakfastHour = this.timeToHours(inputs.breakfastTime);
        if (breakfastHour > 10 || breakfastHour < 7) {
            recommendations.push({
                text: 'Eat breakfast between 7-10 AM to support morning cortisol rhythm.',
                priority: 'medium'
            });
        }

        // Exercise timing
        if (inputs.exerciseTime) {
            const exerciseHour = this.timeToHours(inputs.exerciseTime);
            if (exerciseHour > 12 && exerciseHour < 17) {
                recommendations.push({
                    text: 'Consider moving exercise to morning or evening for better hormonal response.',
                    priority: 'low'
                });
            }
        }

        // Light exposure
        if (inputs.lightExposure < 20) {
            recommendations.push({
                text: 'Get at least 20-30 minutes of morning sunlight exposure.',
                priority: 'high'
            });
        }

        // Screen time
        if (inputs.screenTime > 2) {
            recommendations.push({
                text: 'Reduce evening screen time to protect melatonin production.',
                priority: inputs.screenTime > 3 ? 'high' : 'medium'
            });
        }

        // General recommendations based on score
        if (score < 60) {
            recommendations.push({
                text: 'Consider consulting a chronobiologist or sleep specialist for personalized advice.',
                priority: 'high'
            });
        }

        this.displayRecommendations(recommendations);
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationsList');

        if (recommendations.length === 0) {
            container.innerHTML = '<p>Your schedule shows good chronobiological alignment! Keep up the great work.</p>';
            return;
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item ${rec.priority}-priority">
                <strong>${rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority:</strong> ${rec.text}
            </div>
        `).join('');
    }

    loadSavedData() {
        // Load today's data if exists
        const today = new Date().toISOString().split('T')[0];
        const todayScore = this.scores.find(s => s.date === today);

        if (todayScore) {
            this.currentScore = todayScore.score;
            this.updateDisplay();
        }
    }

    showNotification(message, type) {
        // Simple notification - could be enhanced with a proper notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.backgroundColor = '#27ae60';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#e74c3c';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize the tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chronoTracker = new ChronobiologyTracker();
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