// Sleep Quality Analyzer - Main JavaScript
class SleepQualityAnalyzer {
    constructor() {
        this.sleepData = this.loadSleepData();
        this.initializeElements();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
        this.setDefaultDate();
    }

    initializeElements() {
        // Form elements
        this.sleepForm = document.getElementById('sleepForm');
        this.sleepDate = document.getElementById('sleepDate');
        this.bedTime = document.getElementById('bedTime');
        this.wakeTime = document.getElementById('wakeTime');
        this.deepSleep = document.getElementById('deepSleep');
        this.lightSleep = document.getElementById('lightSleep');
        this.remSleep = document.getElementById('remSleep');
        this.awakeTime = document.getElementById('awakeTime');
        this.sleepQuality = document.getElementById('sleepQuality');
        this.qualityValue = document.getElementById('qualityValue');
        this.mood = document.getElementById('mood');
        this.notes = document.getElementById('notes');

        // Stats elements
        this.avgSleepTime = document.getElementById('avgSleepTime');
        this.avgQuality = document.getElementById('avgQuality');
        this.sleepStreak = document.getElementById('sleepStreak');
        this.deepSleepAvg = document.getElementById('deepSleepAvg');

        // Other elements
        this.historyContainer = document.getElementById('historyContainer');
        this.exportBtn = document.getElementById('exportBtn');
        this.tipsContainer = document.getElementById('tipsContainer');
    }

    setupEventListeners() {
        this.sleepForm.addEventListener('submit', (e) => this.handleSleepSubmit(e));
        this.sleepQuality.addEventListener('input', (e) => this.updateQualityValue(e));
        this.exportBtn.addEventListener('click', () => this.exportData());
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.sleepDate.value = today;
    }

    updateQualityValue(e) {
        this.qualityValue.textContent = e.target.value;
    }

    handleSleepSubmit(e) {
        e.preventDefault();

        const sleepSession = {
            id: Date.now(),
            date: this.sleepDate.value,
            bedTime: this.bedTime.value,
            wakeTime: this.wakeTime.value,
            deepSleep: parseInt(this.deepSleep.value) || 0,
            lightSleep: parseInt(this.lightSleep.value) || 0,
            remSleep: parseInt(this.remSleep.value) || 0,
            awakeTime: parseInt(this.awakeTime.value) || 0,
            quality: parseInt(this.sleepQuality.value),
            mood: parseInt(this.mood.value),
            notes: this.notes.value.trim(),
            timestamp: new Date().toISOString()
        };

        // Calculate total sleep time
        sleepSession.totalSleep = this.calculateTotalSleep(sleepSession);

        // Add to data
        this.sleepData.push(sleepSession);
        this.saveSleepData();

        // Reset form
        this.sleepForm.reset();
        this.setDefaultDate();
        this.qualityValue.textContent = '7';

        // Update UI
        this.updateDashboard();
        this.showSuccessMessage('Sleep session saved successfully!');
    }

    calculateTotalSleep(session) {
        return session.deepSleep + session.lightSleep + session.remSleep + session.awakeTime;
    }

    loadSleepData() {
        const data = localStorage.getItem('sleepQualityData');
        return data ? JSON.parse(data) : [];
    }

    saveSleepData() {
        localStorage.setItem('sleepQualityData', JSON.stringify(this.sleepData));
    }

    updateDashboard() {
        this.updateStatistics();
        this.updateCharts();
        this.updateHistory();
        this.updateTips();
    }

    updateStatistics() {
        if (this.sleepData.length === 0) {
            this.avgSleepTime.textContent = '--';
            this.avgQuality.textContent = '--';
            this.sleepStreak.textContent = '--';
            this.deepSleepAvg.textContent = '--';
            return;
        }

        // Calculate averages
        const totalSleep = this.sleepData.reduce((sum, session) => sum + session.totalSleep, 0);
        const avgSleep = Math.round(totalSleep / this.sleepData.length);

        const totalQuality = this.sleepData.reduce((sum, session) => sum + session.quality, 0);
        const avgQuality = (totalQuality / this.sleepData.length).toFixed(1);

        // Calculate sleep streak (consecutive days with sleep data)
        const streak = this.calculateSleepStreak();

        // Calculate average deep sleep percentage
        const totalDeepSleep = this.sleepData.reduce((sum, session) => sum + session.deepSleep, 0);
        const avgDeepSleepPercent = totalSleep > 0 ? Math.round((totalDeepSleep / totalSleep) * 100) : 0;

        // Update display
        this.avgSleepTime.textContent = `${Math.floor(avgSleep / 60)}h ${avgSleep % 60}m`;
        this.avgQuality.textContent = avgQuality;
        this.sleepStreak.textContent = `${streak} days`;
        this.deepSleepAvg.textContent = `${avgDeepSleepPercent}%`;
    }

    calculateSleepStreak() {
        if (this.sleepData.length === 0) return 0;

        // Sort data by date
        const sortedData = [...this.sleepData].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();

        for (const session of sortedData) {
            const sessionDate = new Date(session.date);
            const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

            if (daysDiff <= streak) {
                streak++;
                currentDate = sessionDate;
            } else {
                break;
            }
        }

        return streak;
    }

    initializeCharts() {
        this.qualityChart = new Chart(
            document.getElementById('qualityChart'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Sleep Quality',
                        data: [],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            ticks: {
                                color: '#cbd5e1'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#cbd5e1'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            }
        );

        this.stagesChart = new Chart(
            document.getElementById('stagesChart'),
            {
                type: 'doughnut',
                data: {
                    labels: ['Deep Sleep', 'Light Sleep', 'REM Sleep', 'Awake'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#4c63d2', '#6c5ce7', '#fd79a8', '#e17055'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            }
        );
    }

    updateCharts() {
        if (this.sleepData.length === 0) return;

        // Sort data by date for quality chart
        const sortedData = [...this.sleepData].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Quality chart data
        const qualityLabels = sortedData.map(session => this.formatDate(session.date));
        const qualityData = sortedData.map(session => session.quality);

        this.qualityChart.data.labels = qualityLabels;
        this.qualityChart.data.datasets[0].data = qualityData;
        this.qualityChart.update();

        // Stages chart data (latest session)
        const latestSession = sortedData[sortedData.length - 1];
        const stagesData = [
            latestSession.deepSleep,
            latestSession.lightSleep,
            latestSession.remSleep,
            latestSession.awakeTime
        ];

        this.stagesChart.data.datasets[0].data = stagesData;
        this.stagesChart.update();
    }

    updateHistory() {
        if (this.sleepData.length === 0) {
            this.historyContainer.innerHTML = '<p class="no-data">No sleep sessions recorded yet. Start logging your sleep!</p>';
            return;
        }

        // Sort by date (newest first) and take last 10
        const recentSessions = [...this.sleepData]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        const historyHTML = recentSessions.map(session => `
            <div class="history-item">
                <div class="history-date">${this.formatDate(session.date)}</div>
                <div class="history-details">
                    <div>Sleep: ${Math.floor(session.totalSleep / 60)}h ${session.totalSleep % 60}m</div>
                    <div>Quality: ${session.quality}/10</div>
                    <div>Deep Sleep: ${session.deepSleep}min</div>
                    <div>Mood: ${this.getMoodEmoji(session.mood)}</div>
                </div>
                ${session.notes ? `<div class="history-notes">${session.notes}</div>` : ''}
            </div>
        `).join('');

        this.historyContainer.innerHTML = historyHTML;
    }

    updateTips() {
        const tips = this.generateTips();
        const tipsHTML = tips.map(tip => `
            <div class="tip-item">
                <i class="${tip.icon}"></i>
                <div class="tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.description}</p>
                </div>
            </div>
        `).join('');

        this.tipsContainer.innerHTML = tipsHTML;
    }

    generateTips() {
        const tips = [
            {
                icon: 'fas fa-clock',
                title: 'Maintain Consistent Schedule',
                description: 'Go to bed and wake up at the same time every day, even on weekends.'
            },
            {
                icon: 'fas fa-temperature-low',
                title: 'Keep Room Cool',
                description: 'Maintain bedroom temperature between 60-67°F (15-19°C) for optimal sleep.'
            },
            {
                icon: 'fas fa-ban',
                title: 'Limit Screen Time',
                description: 'Avoid screens at least 1 hour before bedtime to reduce blue light exposure.'
            }
        ];

        if (this.sleepData.length > 0) {
            const avgQuality = this.sleepData.reduce((sum, s) => sum + s.quality, 0) / this.sleepData.length;
            const avgDeepSleep = this.sleepData.reduce((sum, s) => sum + s.deepSleep, 0) / this.sleepData.length;

            if (avgQuality < 6) {
                tips.push({
                    icon: 'fas fa-utensils',
                    title: 'Watch Your Diet',
                    description: 'Avoid heavy meals, caffeine, and alcohol close to bedtime.'
                });
            }

            if (avgDeepSleep < 90) {
                tips.push({
                    icon: 'fas fa-dumbbell',
                    title: 'Increase Physical Activity',
                    description: 'Regular exercise can improve deep sleep, but avoid intense workouts close to bedtime.'
                });
            }

            const recentSessions = this.sleepData.slice(-7);
            const avgMood = recentSessions.reduce((sum, s) => sum + s.mood, 0) / recentSessions.length;

            if (avgMood < 3) {
                tips.push({
                    icon: 'fas fa-brain',
                    title: 'Manage Stress',
                    description: 'Practice relaxation techniques like meditation or deep breathing before bed.'
                });
            }
        }

        return tips.slice(0, 6); // Limit to 6 tips
    }

    exportData() {
        if (this.sleepData.length === 0) {
            this.showErrorMessage('No data to export!');
            return;
        }

        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `sleep-data-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        this.showSuccessMessage('Data exported successfully!');
    }

    generateCSV() {
        const headers = ['Date', 'Bed Time', 'Wake Time', 'Total Sleep (min)', 'Deep Sleep (min)', 'Light Sleep (min)', 'REM Sleep (min)', 'Awake (min)', 'Quality (1-10)', 'Mood (1-5)', 'Notes'];
        const rows = this.sleepData.map(session => [
            session.date,
            session.bedTime,
            session.wakeTime,
            session.totalSleep,
            session.deepSleep,
            session.lightSleep,
            session.remSleep,
            session.awakeTime,
            session.quality,
            session.mood,
            `"${session.notes || ''}"`
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    getMoodEmoji(mood) {
        const emojis = {
            1: '😞',
            2: '😕',
            3: '😐',
            4: '🙂',
            5: '😊'
        };
        return emojis[mood] || '😐';
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
        `;

        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(messageEl), 300);
        }, 3000);
    }
}

// Add message animations to CSS dynamically
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SleepQualityAnalyzer();
});