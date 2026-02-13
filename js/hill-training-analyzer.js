// Hill Training Analyzer JavaScript

class HillTrainingAnalyzer {
    constructor() {
        this.sessions = JSON.parse(localStorage.getItem('hillTrainingSessions')) || [];
        this.currentFilter = 'all';
        this.initializeEventListeners();
        this.renderDashboard();
        this.renderHistory();
        this.renderAnalysis();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('hillForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSession();
        });

        // Effort slider
        document.getElementById('effortLevel').addEventListener('input', (e) => {
            this.updateEffortDisplay(e.target.value);
        });

        // History filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear data
        document.getElementById('clearData').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all training data?')) {
                this.clearAllData();
            }
        });
    }

    updateEffortDisplay(value) {
        const effortValue = document.getElementById('effortValue');
        const effortText = document.getElementById('effortText');

        effortValue.textContent = value;

        const effortLevels = {
            1: 'Very Easy',
            2: 'Easy',
            3: 'Moderate',
            4: 'Hard',
            5: 'Very Hard',
            6: 'Maximum Effort'
        };

        effortText.textContent = effortLevels[value] || 'Unknown';
    }

    saveSession() {
        const formData = new FormData(document.getElementById('hillForm'));
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            incline: parseFloat(formData.get('incline')),
            distance: parseFloat(formData.get('distance')),
            duration: parseFloat(formData.get('duration')),
            pace: this.calculatePace(formData.get('distance'), formData.get('duration')),
            effortLevel: parseInt(formData.get('effortLevel')),
            notes: formData.get('notes') || ''
        };

        this.sessions.unshift(session);
        this.saveToStorage();
        this.renderDashboard();
        this.renderHistory();
        this.renderAnalysis();

        // Reset form
        document.getElementById('hillForm').reset();
        this.updateEffortDisplay(3); // Reset to moderate

        // Show success message
        this.showNotification('Training session saved successfully!');
    }

    calculatePace(distance, duration) {
        // Convert to minutes per km/mile
        const paceMinutes = duration / distance;
        return paceMinutes;
    }

    formatPace(pace) {
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    saveToStorage() {
        localStorage.setItem('hillTrainingSessions', JSON.stringify(this.sessions));
    }

    renderDashboard() {
        this.renderMetrics();
        this.renderChart();
    }

    renderMetrics() {
        const sessions = this.sessions;
        if (sessions.length === 0) return;

        // Calculate metrics
        const totalSessions = sessions.length;
        const avgIncline = sessions.reduce((sum, s) => sum + s.incline, 0) / totalSessions;
        const avgPace = sessions.reduce((sum, s) => sum + s.pace, 0) / totalSessions;
        const bestPace = Math.min(...sessions.map(s => s.pace));
        const totalDistance = sessions.reduce((sum, s) => sum + s.distance, 0);

        // Update metrics display
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('avgIncline').textContent = `${avgIncline.toFixed(1)}%`;
        document.getElementById('avgPace').textContent = this.formatPace(avgPace);
        document.getElementById('bestPace').textContent = this.formatPace(bestPace);
        document.getElementById('totalDistance').textContent = `${totalDistance.toFixed(1)} km`;
    }

    renderChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');

        // Prepare data for last 10 sessions
        const recentSessions = this.sessions.slice(0, 10).reverse();
        const labels = recentSessions.map(s => new Date(s.date).toLocaleDateString());
        const paces = recentSessions.map(s => s.pace);
        const inclines = recentSessions.map(s => s.incline);

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pace (min/km)',
                    data: paces,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                }, {
                    label: 'Incline (%)',
                    data: inclines,
                    borderColor: '#e94b3c',
                    backgroundColor: 'rgba(233, 75, 60, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Pace (min/km)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Incline (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        const filteredSessions = this.getFilteredSessions();

        historyList.innerHTML = '';

        if (filteredSessions.length === 0) {
            historyList.innerHTML = '<p class="no-data">No training sessions found.</p>';
            return;
        }

        filteredSessions.forEach(session => {
            const item = this.createHistoryItem(session);
            historyList.appendChild(item);
        });
    }

    getFilteredSessions() {
        if (this.currentFilter === 'all') return this.sessions;

        const now = new Date();
        const filterDate = new Date();

        switch (this.currentFilter) {
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                filterDate.setMonth(now.getMonth() - 3);
                break;
        }

        return this.sessions.filter(session =>
            new Date(session.date) >= filterDate
        );
    }

    createHistoryItem(session) {
        const item = document.createElement('div');
        item.className = 'history-item';

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${new Date(session.date).toLocaleDateString()}</span>
                    <span class="history-pace">${this.formatPace(session.pace)}</span>
                </div>
                <div class="history-details">
                    <span class="history-incline">${session.incline}% incline</span> •
                    ${session.distance} km •
                    ${session.duration} min •
                    Effort: ${session.effortLevel}/6
                </div>
                ${session.notes ? `<div class="history-notes">${session.notes}</div>` : ''}
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="analyzer.deleteSession(${session.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;

        return item;
    }

    deleteSession(id) {
        if (confirm('Are you sure you want to delete this session?')) {
            this.sessions = this.sessions.filter(s => s.id !== id);
            this.saveToStorage();
            this.renderDashboard();
            this.renderHistory();
            this.renderAnalysis();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderHistory();
    }

    renderAnalysis() {
        this.renderPerformanceAnalysis();
        this.renderTrainingTips();
        this.renderStandards();
    }

    renderPerformanceAnalysis() {
        const analysisGrid = document.getElementById('analysisGrid');
        const sessions = this.sessions;

        if (sessions.length < 2) {
            analysisGrid.innerHTML = '<p class="no-data">Need at least 2 sessions for analysis.</p>';
            return;
        }

        // Calculate improvements
        const recentSessions = sessions.slice(0, 5);
        const olderSessions = sessions.slice(5, 10);

        let paceImprovement = 0;
        if (olderSessions.length > 0) {
            const recentAvgPace = recentSessions.reduce((sum, s) => sum + s.pace, 0) / recentSessions.length;
            const olderAvgPace = olderSessions.reduce((sum, s) => sum + s.pace, 0) / olderSessions.length;
            paceImprovement = ((olderAvgPace - recentAvgPace) / olderAvgPace) * 100;
        }

        const avgIncline = sessions.reduce((sum, s) => sum + s.incline, 0) / sessions.length;
        const consistency = this.calculateConsistency(sessions);

        analysisGrid.innerHTML = `
            <div class="analysis-card">
                <h3>Performance Trend</h3>
                <div class="analysis-content">
                    ${paceImprovement > 0 ?
                        `Your pace has improved by ${paceImprovement.toFixed(1)}% in recent sessions.` :
                        'Keep training consistently to see pace improvements.'}
                </div>
            </div>
            <div class="analysis-card">
                <h3>Average Incline</h3>
                <div class="analysis-content">
                    You typically train at ${avgIncline.toFixed(1)}% incline.
                    ${avgIncline > 8 ? 'Great job tackling steep hills!' : 'Consider increasing incline for better hill training benefits.'}
                </div>
            </div>
            <div class="analysis-card">
                <h3>Consistency Score</h3>
                <div class="analysis-content">
                    Your training consistency is ${consistency.toFixed(0)}%.
                    ${consistency > 80 ? 'Excellent consistency!' : 'Try to maintain regular training sessions.'}
                </div>
            </div>
        `;
    }

    calculateConsistency(sessions) {
        if (sessions.length < 2) return 100;

        // Calculate average days between sessions
        const dates = sessions.map(s => new Date(s.date)).sort((a, b) => a - b);
        const intervals = [];

        for (let i = 1; i < dates.length; i++) {
            intervals.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
        }

        const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
        const consistency = Math.max(0, 100 - (avgInterval - 7) * 10); // Penalize gaps > 7 days

        return Math.min(100, consistency);
    }

    renderTrainingTips() {
        const tipsList = document.getElementById('tipsList');

        const tips = [
            {
                icon: 'trending-up',
                title: 'Progressive Overload',
                content: 'Gradually increase hill steepness or duration to build strength and endurance.'
            },
            {
                icon: 'target',
                title: 'Pace Control',
                content: 'Focus on maintaining consistent effort rather than pace. Hills naturally slow you down.'
            },
            {
                icon: 'activity',
                title: 'Recovery',
                content: 'Allow adequate recovery between hill sessions. Include easier runs to prevent injury.'
            },
            {
                icon: 'zap',
                title: 'Form Focus',
                content: 'Keep your posture upright, take shorter steps, and pump your arms for better power transfer.'
            }
        ];

        tipsList.innerHTML = tips.map(tip => `
            <div class="tip-item">
                <i data-lucide="${tip.icon}" class="tip-icon"></i>
                <div class="tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.content}</p>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons for new elements
        lucide.createIcons();
    }

    renderStandards() {
        const standardsGrid = document.getElementById('standardsGrid');
        const sessions = this.sessions;

        if (sessions.length === 0) return;

        const avgPace = sessions.reduce((sum, s) => sum + s.pace, 0) / sessions.length;

        const standards = [
            { level: 'Beginner', range: '8:00-12:00', description: 'Building basic hill strength' },
            { level: 'Intermediate', range: '6:00-8:00', description: 'Developing hill endurance' },
            { level: 'Advanced', range: '4:30-6:00', description: 'Strong hill performance' },
            { level: 'Elite', range: '<4:30', description: 'Exceptional hill running ability' }
        ];

        standardsGrid.innerHTML = standards.map(standard => {
            const isCurrent = this.isInRange(avgPace, standard.range);
            return `
                <div class="standard-item ${isCurrent ? 'current' : ''}">
                    <div class="standard-title">${standard.level}</div>
                    <div class="standard-range">${standard.range} min/km</div>
                    <div class="standard-description">${standard.description}</div>
                </div>
            `;
        }).join('');
    }

    isInRange(pace, range) {
        const paceMinutes = Math.floor(pace);
        const paceSeconds = (pace - paceMinutes) * 60;
        const totalSeconds = paceMinutes * 60 + paceSeconds;

        if (range.includes('<')) {
            const maxSeconds = this.parseTimeToSeconds(range.substring(1));
            return totalSeconds < maxSeconds;
        }

        const [min, max] = range.split('-').map(this.parseTimeToSeconds);
        return totalSeconds >= min && totalSeconds <= max;
    }

    parseTimeToSeconds(timeStr) {
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return minutes * 60 + seconds;
    }

    clearAllData() {
        this.sessions = [];
        this.saveToStorage();
        this.renderDashboard();
        this.renderHistory();
        this.renderAnalysis();
        this.showNotification('All data cleared successfully!');
    }

    showNotification(message) {
        // Simple notification - you could enhance this with a proper notification system
        alert(message);
    }
}

// Initialize the analyzer when the page loads
let analyzer;
document.addEventListener('DOMContentLoaded', () => {
    analyzer = new HillTrainingAnalyzer();
});