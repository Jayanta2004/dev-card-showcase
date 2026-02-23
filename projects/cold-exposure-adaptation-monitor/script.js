// Cold Exposure Adaptation Monitor JavaScript

class ColdExposureMonitor {
    constructor() {
        this.sessions = [];
        this.currentDate = new Date().toDateString();

        this.init();
        this.loadData();
        this.updateUI();
        this.renderCharts();
    }

    init() {
        // Get DOM elements
        this.sessionForm = document.getElementById('session-form');
        this.exposureType = document.getElementById('exposure-type');
        this.duration = document.getElementById('duration');
        this.temperature = document.getElementById('temperature');
        this.comfortLevel = document.getElementById('comfort-level');
        this.comfortValue = document.getElementById('comfort-value');
        this.notes = document.getElementById('notes');
        this.sessionsList = document.getElementById('sessions-list');
        this.adaptationScore = document.getElementById('adaptation-score');
        this.scoreFill = document.getElementById('score-fill');
        this.adaptationLevel = document.getElementById('adaptation-level');
        this.totalSessions = document.getElementById('total-sessions');
        this.weeklySessions = document.getElementById('weekly-sessions');
        this.avgDuration = document.getElementById('avg-duration');
        this.durationTrend = document.getElementById('duration-trend');
        this.toleranceTemp = document.getElementById('tolerance-temp');
        this.tempImprovement = document.getElementById('temp-improvement');
        this.insightsList = document.getElementById('insights-list');

        // Bind events
        this.sessionForm.addEventListener('submit', (e) => this.logSession(e));
        this.comfortLevel.addEventListener('input', () => {
            this.comfortValue.textContent = this.comfortLevel.value;
        });

        // Initialize comfort value display
        this.comfortValue.textContent = this.comfortLevel.value;

        // Check for new day
        this.checkNewDay();
    }

    logSession(e) {
        e.preventDefault();

        const type = this.exposureType.value;
        const duration = parseFloat(this.duration.value);
        const temperature = this.temperature.value ? parseFloat(this.temperature.value) : null;
        const comfort = parseInt(this.comfortLevel.value);
        const sessionNotes = this.notes.value.trim();

        if (!type || !duration) return;

        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: type,
            duration: duration,
            temperature: temperature,
            comfort: comfort,
            notes: sessionNotes,
            timestamp: new Date()
        };

        this.sessions.push(session);
        this.saveData();
        this.updateUI();
        this.renderCharts();

        // Reset form
        this.sessionForm.reset();
        this.comfortValue.textContent = '5';

        // Show success feedback
        this.showNotification('Session logged successfully!');
    }

    updateUI() {
        const todaySessions = this.getTodaySessions();
        const weeklyData = this.getWeeklyData();
        const adaptationScore = this.calculateAdaptationScore();

        // Update main metrics
        this.adaptationScore.textContent = adaptationScore;
        this.scoreFill.style.width = `${Math.min(adaptationScore, 100)}%`;
        this.updateAdaptationLevel(adaptationScore);

        this.totalSessions.textContent = this.sessions.length;
        this.weeklySessions.textContent = `${this.getWeeklySessionCount()} this week`;

        // Update duration stats
        this.updateDurationStats(weeklyData);

        // Update temperature tolerance
        this.updateTemperatureTolerance();

        // Update sessions list
        this.renderSessionsList(todaySessions);

        // Update insights
        this.updateInsights(todaySessions, weeklyData, adaptationScore);
    }

    calculateAdaptationScore() {
        if (this.sessions.length === 0) return 0;

        // Base score from session count and frequency
        const totalSessions = this.sessions.length;
        const sessionScore = Math.min(totalSessions * 2, 30);

        // Duration score (longer sessions = higher adaptation)
        const avgDuration = this.sessions.reduce((sum, s) => sum + s.duration, 0) / this.sessions.length;
        const durationScore = Math.min(avgDuration * 1.5, 25);

        // Consistency score (regular practice)
        const weeklyAvg = this.getWeeklyAverageSessions();
        const consistencyScore = Math.min(weeklyAvg * 3, 20);

        // Temperature adaptation score
        const tempScore = this.calculateTemperatureScore();

        // Comfort improvement score
        const comfortScore = this.calculateComfortScore();

        return Math.min(Math.round(sessionScore + durationScore + consistencyScore + tempScore + comfortScore), 100);
    }

    calculateTemperatureScore() {
        const sessionsWithTemp = this.sessions.filter(s => s.temperature !== null);
        if (sessionsWithTemp.length === 0) return 0;

        // Lower temperatures = higher adaptation
        const avgTemp = sessionsWithTemp.reduce((sum, s) => sum + s.temperature, 0) / sessionsWithTemp.length;
        const tempRange = Math.abs(avgTemp - 20); // Difference from room temperature
        return Math.min(tempRange * 2, 15);
    }

    calculateComfortScore() {
        if (this.sessions.length < 3) return 0;

        // Recent sessions should show higher comfort levels
        const recentSessions = this.sessions.slice(-5);
        const avgComfort = recentSessions.reduce((sum, s) => sum + s.comfort, 0) / recentSessions.length;

        // Higher comfort with cold = better adaptation
        return Math.min(avgComfort * 2, 10);
    }

    updateAdaptationLevel(score) {
        const container = this.scoreFill.parentElement;
        container.className = 'score-bar';

        if (score < 25) {
            this.adaptationLevel.textContent = 'Beginner';
            this.adaptationLevel.className = 'adaptation-level adaptation-beginner';
            container.classList.add('adaptation-beginner');
        } else if (score < 50) {
            this.adaptationLevel.textContent = 'Intermediate';
            this.adaptationLevel.className = 'adaptation-level adaptation-intermediate';
            container.classList.add('adaptation-intermediate');
        } else if (score < 75) {
            this.adaptationLevel.textContent = 'Advanced';
            this.adaptationLevel.className = 'adaptation-level adaptation-advanced';
            container.classList.add('adaptation-advanced');
        } else {
            this.adaptationLevel.textContent = 'Elite';
            this.adaptationLevel.className = 'adaptation-level adaptation-elite';
            container.classList.add('adaptation-elite');
        }
    }

    getTodaySessions() {
        const today = new Date().toDateString();
        return this.sessions.filter(s => new Date(s.date).toDateString() === today);
    }

    getWeeklySessionCount() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return this.sessions.filter(s => new Date(s.date) >= weekAgo).length;
    }

    getWeeklyAverageSessions() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklySessions = this.sessions.filter(s => new Date(s.date) >= weekAgo).length;
        return weeklySessions;
    }

    getWeeklyData() {
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            const daySessions = this.sessions.filter(s =>
                new Date(s.date).toDateString() === dateStr
            );

            const totalDuration = daySessions.reduce((sum, s) => sum + s.duration, 0);

            weekData.push({
                date: dateStr,
                sessions: daySessions.length,
                duration: totalDuration,
                avgTemp: daySessions.length > 0 ?
                    daySessions.filter(s => s.temperature !== null).reduce((sum, s) => sum + (s.temperature || 0), 0) /
                    daySessions.filter(s => s.temperature !== null).length : null
            });
        }
        return weekData;
    }

    updateDurationStats(weeklyData) {
        const validData = weeklyData.filter(d => d.duration > 0);
        if (validData.length === 0) {
            this.avgDuration.textContent = '0 min';
            this.durationTrend.textContent = 'No data yet';
            return;
        }

        const avg = Math.round(validData.reduce((sum, d) => sum + d.duration, 0) / validData.length);
        this.avgDuration.textContent = `${avg} min`;

        // Calculate trend
        const recent = validData.slice(-3);
        const older = validData.slice(-6, -3);

        if (recent.length >= 2 && older.length >= 2) {
            const recentAvg = recent.reduce((sum, d) => sum + d.duration, 0) / recent.length;
            const olderAvg = older.reduce((sum, d) => sum + d.duration, 0) / older.length;

            if (recentAvg > olderAvg * 1.1) {
                this.durationTrend.textContent = '↗️ Increasing';
                this.durationTrend.style.color = '#4caf50';
            } else if (recentAvg < olderAvg * 0.9) {
                this.durationTrend.textContent = '↘️ Decreasing';
                this.durationTrend.style.color = '#f44336';
            } else {
                this.durationTrend.textContent = '→ Stable';
                this.durationTrend.style.color = '#ff9800';
            }
        } else {
            this.durationTrend.textContent = 'Building data...';
            this.durationTrend.style.color = '#666';
        }
    }

    updateTemperatureTolerance() {
        const sessionsWithTemp = this.sessions.filter(s => s.temperature !== null);
        if (sessionsWithTemp.length === 0) {
            this.toleranceTemp.textContent = '--°C';
            this.tempImprovement.textContent = 'Track to see progress';
            return;
        }

        // Find the lowest temperature tolerated
        const minTemp = Math.min(...sessionsWithTemp.map(s => s.temperature));
        this.toleranceTemp.textContent = `${minTemp}°C`;

        // Calculate improvement (compare first vs recent sessions)
        if (sessionsWithTemp.length >= 3) {
            const firstThree = sessionsWithTemp.slice(0, 3);
            const lastThree = sessionsWithTemp.slice(-3);

            const firstAvg = firstThree.reduce((sum, s) => sum + s.temperature, 0) / firstThree.length;
            const lastAvg = lastThree.reduce((sum, s) => sum + s.temperature, 0) / lastThree.length;

            const improvement = firstAvg - lastAvg;
            if (improvement > 1) {
                this.tempImprovement.textContent = `Improved by ${improvement.toFixed(1)}°C`;
                this.tempImprovement.style.color = '#4caf50';
            } else if (improvement < -1) {
                this.tempImprovement.textContent = `Temperature tolerance decreased`;
                this.tempImprovement.style.color = '#f44336';
            } else {
                this.tempImprovement.textContent = 'Maintaining tolerance';
                this.tempImprovement.style.color = '#ff9800';
            }
        } else {
            this.tempImprovement.textContent = 'Keep tracking!';
        }
    }

    renderSessionsList(todaySessions) {
        if (todaySessions.length === 0) {
            this.sessionsList.innerHTML = '<p class="no-sessions">No sessions logged yet. Start by logging your first cold exposure session above!</p>';
            return;
        }

        const sortedSessions = todaySessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        this.sessionsList.innerHTML = sortedSessions.map(session => `
            <div class="session-item">
                <div class="session-info">
                    <div class="session-type">${this.formatExposureType(session.type)}</div>
                    <div class="session-details">
                        <span>Duration: ${session.duration} min</span>
                        ${session.temperature !== null ? `<span>Temp: ${session.temperature}°C</span>` : ''}
                        <span>Comfort: ${session.comfort}/10</span>
                    </div>
                    ${session.notes ? `<div class="session-notes">"${session.notes}"</div>` : ''}
                    <div class="session-time">${this.formatTime(session.timestamp)}</div>
                </div>
                <div class="session-metrics">
                    <div class="session-duration">${session.duration}m</div>
                    ${session.temperature !== null ? `<div class="session-temp">${session.temperature}°C</div>` : ''}
                    <div class="session-comfort">Comfort: ${session.comfort}/10</div>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        this.renderWeeklyChart();
        this.renderAdaptationChart();
    }

    renderWeeklyChart() {
        const weeklyData = this.getWeeklyData();
        const ctx = document.getElementById('weekly-chart');
        if (!ctx) return;

        const canvas = ctx;
        const ctx2d = canvas.getContext('2d');

        // Clear canvas
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        if (weeklyData.every(d => d.sessions === 0)) {
            ctx2d.fillStyle = '#666';
            ctx2d.font = '16px Arial';
            ctx2d.textAlign = 'center';
            ctx2d.fillText('No data yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        const maxSessions = Math.max(...weeklyData.map(d => d.sessions));
        const barWidth = canvas.width / weeklyData.length * 0.8;
        const barSpacing = canvas.width / weeklyData.length * 0.2;

        weeklyData.forEach((day, index) => {
            const barHeight = (day.sessions / Math.max(maxSessions, 1)) * (canvas.height - 60);
            const x = index * (barWidth + barSpacing) + barSpacing / 2;
            const y = canvas.height - barHeight - 30;

            // Bar
            ctx2d.fillStyle = day.sessions > 0 ? '#2196f3' : '#e3f2fd';
            ctx2d.fillRect(x, y, barWidth, barHeight);

            // Value
            ctx2d.fillStyle = '#333';
            ctx2d.font = '12px Arial';
            ctx2d.textAlign = 'center';
            ctx2d.fillText(day.sessions.toString(), x + barWidth / 2, y - 5);

            // Day label
            const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
            ctx2d.fillText(dayName, x + barWidth / 2, canvas.height - 10);
        });
    }

    renderAdaptationChart() {
        const weeklyData = this.getWeeklyData();
        const ctx = document.getElementById('adaptation-chart');
        if (!ctx) return;

        const canvas = ctx;
        const ctx2d = canvas.getContext('2d');

        // Clear canvas
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate adaptation scores for each day
        const adaptationData = weeklyData.map(day => {
            const daySessions = this.sessions.filter(s =>
                new Date(s.date).toDateString() === day.date
            );
            return this.calculateAdaptationScoreForSessions(daySessions);
        });

        if (adaptationData.every(score => score === 0)) {
            ctx2d.fillStyle = '#666';
            ctx2d.font = '16px Arial';
            ctx2d.textAlign = 'center';
            ctx2d.fillText('No data yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        const maxScore = Math.max(...adaptationData);
        const points = adaptationData.map((score, i) => ({
            x: (i / 6) * canvas.width,
            y: canvas.height - (score / Math.max(maxScore, 1)) * (canvas.height - 40) - 20,
            score: score
        }));

        // Draw line
        ctx2d.strokeStyle = '#00bcd4';
        ctx2d.lineWidth = 3;
        ctx2d.beginPath();

        points.forEach((point, i) => {
            if (i === 0) {
                ctx2d.moveTo(point.x, point.y);
            } else {
                ctx2d.lineTo(point.x, point.y);
            }
        });

        ctx2d.stroke();

        // Draw points
        points.forEach(point => {
            ctx2d.fillStyle = point.score > 75 ? '#009688' : point.score > 50 ? '#00bcd4' : '#4caf50';
            ctx2d.beginPath();
            ctx2d.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx2d.fill();
        });
    }

    calculateAdaptationScoreForSessions(sessions) {
        if (sessions.length === 0) return 0;

        const sessionScore = Math.min(sessions.length * 5, 30);
        const durationScore = Math.min(sessions.reduce((sum, s) => sum + s.duration, 0) * 0.5, 25);
        const tempScore = sessions.filter(s => s.temperature !== null).length > 0 ?
            Math.min(Math.abs(Math.min(...sessions.filter(s => s.temperature !== null).map(s => s.temperature)) - 20), 15) : 0;

        return Math.min(sessionScore + durationScore + tempScore, 100);
    }

    updateInsights(todaySessions, weeklyData, adaptationScore) {
        const insights = [];

        if (this.sessions.length === 0) {
            this.insightsList.innerHTML = '<p>Log some sessions to see personalized adaptation insights!</p>';
            return;
        }

        if (adaptationScore < 25) {
            insights.push('🏊‍♂️ You\'re in the beginner phase. Focus on consistency - try 2-3 sessions per week.');
        } else if (adaptationScore < 50) {
            insights.push('❄️ Good progress! Try gradually increasing session duration or lowering temperature.');
        } else if (adaptationScore < 75) {
            insights.push('🔥 You\'re adapting well! Consider more challenging exposures or longer durations.');
        } else {
            insights.push('⭐ Elite level! You\'re highly adapted. Maintain consistency and consider coaching others.');
        }

        const weeklySessions = this.getWeeklySessionCount();
        if (weeklySessions < 3) {
            insights.push('📅 Aim for 3-5 sessions per week for optimal adaptation progress.');
        }

        const avgDuration = this.sessions.reduce((sum, s) => sum + s.duration, 0) / this.sessions.length;
        if (avgDuration < 2) {
            insights.push('⏱️ Try extending your sessions gradually. Even 30 seconds more can help adaptation.');
        }

        const recentComfort = this.sessions.slice(-3).reduce((sum, s) => sum + s.comfort, 0) / Math.min(3, this.sessions.length);
        if (recentComfort < 4) {
            insights.push('😰 If sessions feel too uncomfortable, try shorter durations or slightly warmer temperatures.');
        }

        if (insights.length === 0) {
            insights.push('✅ Your cold exposure practice looks well-balanced. Keep up the great work!');
        }

        this.insightsList.innerHTML = insights.map(insight => `<p>${insight}</p>`).join('');
    }

    checkNewDay() {
        const lastDate = localStorage.getItem('coldExposureLastDate');
        if (lastDate && lastDate !== this.currentDate) {
            // New day - could add day reset logic here
        }
        localStorage.setItem('coldExposureLastDate', this.currentDate);
    }

    saveData() {
        localStorage.setItem('coldExposureSessions', JSON.stringify(this.sessions));
    }

    loadData() {
        const savedSessions = localStorage.getItem('coldExposureSessions');
        if (savedSessions) {
            this.sessions = JSON.parse(savedSessions).map(s => ({
                ...s,
                timestamp: new Date(s.timestamp)
            }));
        }
    }

    // Helper methods
    formatExposureType(type) {
        const types = {
            'cold-shower': '🚿 Cold Shower',
            'ice-bath': '🧊 Ice Bath',
            'cold-plunge': '🏊 Cold Plunge',
            'outdoor-cold': '❄️ Outdoor Cold',
            'cold-pack': '🧴 Cold Pack',
            'other': '📝 Other'
        };
        return types[type] || type;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showNotification(message) {
        // Simple notification - could be enhanced
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00bcd4;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColdExposureMonitor();
});