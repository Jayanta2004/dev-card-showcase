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

        // History filters
        document.getElementById('viewWeek').addEventListener('click', () => this.setFilter('week'));
        document.getElementById('viewMonth').addEventListener('click', () => this.setFilter('month'));
        document.getElementById('viewAll').addEventListener('click', () => this.setFilter('all'));
    }

    saveSession() {
        const session = {
            id: Date.now(),
            date: document.getElementById('sessionDate').value,
            incline: parseFloat(document.getElementById('inclinePercent').value),
            distance: parseFloat(document.getElementById('distance').value),
            duration: this.parseDuration(document.getElementById('duration').value),
            pace: parseFloat(document.getElementById('pace').value),
            effortLevel: parseInt(document.getElementById('effort').value),
            notes: document.getElementById('notes').value || ''
        };

        this.sessions.unshift(session);
        this.saveToStorage();
        this.renderDashboard();
        this.renderHistory();
        this.renderAnalysis();

        // Reset form
        document.getElementById('hillForm').reset();
        document.getElementById('sessionDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('effort').value = 7;
        document.getElementById('effortValue').textContent = '7';
        document.getElementById('effortText').textContent = 'Very Hard';

        // Show success message
        this.showNotification('Training session saved successfully!');
    }

    parseDuration(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes; // Convert to minutes
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
        const bestPace = Math.min(...sessions.map(s => s.pace));
        const avgPace = sessions.reduce((sum, s) => sum + s.pace, 0) / sessions.length;
        const totalDistance = sessions.reduce((sum, s) => sum + s.distance, 0);

        // Calculate improvement (compare recent vs older sessions)
        let improvement = '--';
        if (sessions.length >= 6) {
            const recent = sessions.slice(0, 3);
            const older = sessions.slice(3, 6);
            const recentAvg = recent.reduce((sum, s) => sum + s.pace, 0) / recent.length;
            const olderAvg = older.reduce((sum, s) => sum + s.pace, 0) / older.length;
            const improvementPercent = ((olderAvg - recentAvg) / olderAvg) * 100;
            improvement = `${improvementPercent > 0 ? '+' : ''}${improvementPercent.toFixed(1)}%`;
        }

        // Update metrics display
        document.getElementById('bestPace').textContent = this.formatPace(bestPace);
        document.getElementById('avgPace').textContent = this.formatPace(avgPace);
        document.getElementById('totalDistance').textContent = `${totalDistance.toFixed(1)}km`;
        document.getElementById('improvement').textContent = improvement;
    }

    renderChart() {
        const ctx = document.getElementById('paceChart').getContext('2d');

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
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    pointBackgroundColor: '#38a169',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }, {
                    label: 'Incline (%)',
                    data: inclines,
                    borderColor: '#e53e3e',
                    backgroundColor: 'rgba(229, 62, 62, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    pointBackgroundColor: '#e53e3e',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Hill Training Performance',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return `Session: ${context[0].label}`;
                            },
                            label: function(context) {
                                const datasetLabel = context.dataset.label;
                                const value = context.parsed.y;
                                if (datasetLabel.includes('Pace')) {
                                    return `${datasetLabel}: ${analyzer.formatPace(value)}`;
                                }
                                return `${datasetLabel}: ${value}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Pace (min/km)'
                        },
                        ticks: {
                            callback: function(value) {
                                return analyzer.formatPace(value);
                            }
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
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    renderHistory() {
        const historyList = document.getElementById('trainingHistory');
        const filteredSessions = this.getFilteredSessions();

        historyList.innerHTML = '';

        if (filteredSessions.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No training sessions found for this period.</p>';
            return;
        }

        filteredSessions.forEach(session => {
            const item = this.createHistoryItem(session);
            historyList.appendChild(item);
        });

        // Re-initialize Lucide icons
        lucide.createIcons();
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
        }

        return this.sessions.filter(session =>
            new Date(session.date) >= filterDate
        );
    }

    createHistoryItem(session) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const effortLevels = {
            1: 'Very Easy', 2: 'Easy', 3: 'Moderate', 4: 'Somewhat Hard',
            5: 'Hard', 6: 'Very Hard', 7: 'Very Hard', 8: 'Very Hard',
            9: 'Extremely Hard', 10: 'Maximum Effort'
        };

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${new Date(session.date).toLocaleDateString()}</span>
                    <span class="history-pace">${this.formatPace(session.pace)}</span>
                </div>
                <div class="history-details">
                    <span class="history-incline">${session.incline}% incline</span> •
                    ${session.distance} km •
                    ${Math.floor(session.duration / 60)}:${(session.duration % 60).toString().padStart(2, '0')} •
                    Effort: ${effortLevels[session.effortLevel] || 'Unknown'}
                </div>
                ${session.notes ? `<div class="history-notes">${session.notes}</div>` : ''}
            </div>
            <div class="history-actions">
                <button class="btn-small btn-danger" onclick="analyzer.deleteSession(${session.id})">
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
        document.querySelectorAll('.history-controls button').forEach(btn => {
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
        const inclinePerformance = document.getElementById('inclinePerformance');
        const progressTrend = document.getElementById('progressTrend');
        const trainingFocus = document.getElementById('trainingFocus');

        const sessions = this.sessions;

        if (sessions.length < 2) {
            inclinePerformance.innerHTML = '<p>Log more sessions to see incline performance analysis.</p>';
            progressTrend.innerHTML = '<p>Track your progress over multiple sessions.</p>';
            trainingFocus.innerHTML = '<p>Get personalized training recommendations.</p>';
            return;
        }

        // Incline performance analysis
        const inclineGroups = {};
        sessions.forEach(session => {
            const inclineRange = Math.floor(session.incline / 2) * 2; // Group by 2% ranges
            if (!inclineGroups[inclineRange]) {
                inclineGroups[inclineRange] = [];
            }
            inclineGroups[inclineRange].push(session);
        });

        const bestIncline = Object.keys(inclineGroups).reduce((best, range) => {
            const avgPace = inclineGroups[range].reduce((sum, s) => sum + s.pace, 0) / inclineGroups[range].length;
            const bestAvg = inclineGroups[best] ? inclineGroups[best].reduce((sum, s) => sum + s.pace, 0) / inclineGroups[best].length : Infinity;
            return avgPace < bestAvg ? range : best;
        }, Object.keys(inclineGroups)[0]);

        inclinePerformance.innerHTML = `<p>You perform best on ${bestIncline}-${parseInt(bestIncline) + 2}% inclines. Consider incorporating more sessions in this range.</p>`;

        // Progress trend
        if (sessions.length >= 4) {
            const recent = sessions.slice(0, Math.min(4, sessions.length));
            const older = sessions.slice(Math.min(4, sessions.length), Math.min(8, sessions.length));

            if (older.length > 0) {
                const recentAvg = recent.reduce((sum, s) => sum + s.pace, 0) / recent.length;
                const olderAvg = older.reduce((sum, s) => sum + s.pace, 0) / older.length;
                const change = ((olderAvg - recentAvg) / olderAvg) * 100;

                const direction = change > 1 ? 'improving' : change < -1 ? 'declining' : 'stable';
                progressTrend.innerHTML = `<p>Your hill running performance is <strong>${direction}</strong> (${change > 0 ? '+' : ''}${change.toFixed(1)}% pace improvement).</p>`;
            } else {
                progressTrend.innerHTML = `<p>Continue training to establish a performance trend.</p>`;
            }
        } else {
            progressTrend.innerHTML = `<p>Log ${4 - sessions.length} more sessions to see progress trends.</p>`;
        }

        // Training focus
        const avgIncline = sessions.reduce((sum, s) => sum + s.incline, 0) / sessions.length;
        const avgEffort = sessions.reduce((sum, s) => sum + s.effortLevel, 0) / sessions.length;

        let recommendation = '';
        if (avgIncline < 5) {
            recommendation = 'Try increasing your training incline to build more hill-specific strength.';
        } else if (avgEffort > 7) {
            recommendation = 'Consider incorporating easier recovery runs between intense hill sessions.';
        } else if (sessions.length < 3) {
            recommendation = 'Keep logging sessions to get personalized training recommendations.';
        } else {
            recommendation = 'Your training mix looks balanced. Continue with your current approach.';
        }

        trainingFocus.innerHTML = `<p>${recommendation}</p>`;
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
            },
            {
                icon: 'mountain',
                title: 'Hill Selection',
                content: 'Choose hills that match your training goals. Shorter steep hills build power, longer gradual hills build endurance.'
            },
            {
                icon: 'repeat',
                title: 'Repeat Workouts',
                content: 'Repeat the same hill routes to accurately measure improvement over time.'
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
            { level: 'Beginner', range: '10:00-15:00', description: 'Building basic hill strength and technique' },
            { level: 'Novice', range: '8:00-10:00', description: 'Developing hill endurance and comfort' },
            { level: 'Intermediate', range: '6:00-8:00', description: 'Good hill running performance' },
            { level: 'Advanced', range: '4:30-6:00', description: 'Strong hill running ability' },
            { level: 'Elite', range: '<4:30', description: 'Exceptional hill running performance' }
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
    // Set default date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    // Initialize effort display
    const effortSlider = document.getElementById('effort');
    if (effortSlider) {
        effortSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('effortValue').textContent = value;
            const effortLevels = {
                1: 'Very Easy', 2: 'Easy', 3: 'Moderate', 4: 'Somewhat Hard',
                5: 'Hard', 6: 'Very Hard', 7: 'Very Hard', 8: 'Very Hard',
                9: 'Extremely Hard', 10: 'Maximum Effort'
            };
            document.getElementById('effortText').textContent = effortLevels[value] || 'Unknown';
        });
    }

    analyzer = new HillTrainingAnalyzer();
});