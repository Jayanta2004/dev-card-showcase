// Cognitive Saturation Alert JavaScript

class CognitiveSaturationTracker {
    constructor() {
        this.activities = JSON.parse(localStorage.getItem('cognitiveActivities')) || [];
        this.breaks = JSON.parse(localStorage.getItem('cognitiveBreaks')) || [];
        this.alerts = JSON.parse(localStorage.getItem('cognitiveAlerts')) || [];
        this.currentSaturation = 0;
        this.breakTimer = null;
        this.breakDuration = 0;
        this.breakStartTime = null;
        this.pendingActivity = null; 

        this.init();
    }

    init() {
        this.updateSaturationLevel();
        this.updateStats();
        this.renderChart();
        this.renderHistory();
        this.checkAlerts();
    }

    logCognitiveActivity() {
        const activityType = document.getElementById('activityType').value;
        const duration = parseInt(document.getElementById('activityDuration').value);
        const intensity = parseInt(document.getElementById('cognitiveIntensity').value);
        const notes = document.getElementById('activityNotes').value;

        if (!duration || duration <= 0) {
            this.showNotification('Please enter a valid duration', 'error');
            return;
        }

        if (duration > 120) {
            this.showDurationWarning(duration, activityType, intensity, notes);
            return; 
        }

        this.saveActivity(activityType, duration, intensity, notes);
    }

    showDurationWarning(duration, activityType, intensity, notes) {
        const warningModal = document.createElement('div');
        warningModal.className = 'duration-warning-modal';
        warningModal.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ Long Duration Detected</h3>
                <p>You're about to log an activity of <strong>${duration} minutes</strong> (${(duration/60).toFixed(1)} hours).</p>
                <p>Research suggests that continuous cognitive work beyond <strong>120 minutes (2 hours)</strong> can lead to:</p>
                <ul>
                    <li>Mental fatigue and burnout</li>
                    <li>Reduced focus and productivity</li>
                    <li>Increased error rates</li>
                    <li>Diminished cognitive performance</li>
                </ul>
                <p class="recommendation">💡 <strong>Recommendation:</strong> Break this into smaller sessions (e.g., ${Math.ceil(duration/60)} x 60-minute sessions with breaks in between).</p>
                <div class="warning-actions">
                    <button class="cancel-btn" onclick="window.tracker.cancelDurationWarning()">Adjust Duration</button>
                    <button class="confirm-btn" onclick="window.tracker.confirmLongDuration()">Continue Anyway</button>
                </div>
            </div>
        `;

        this.pendingActivity = {
            activityType,
            duration,
            intensity,
            notes
        };

        document.body.appendChild(warningModal);
    }

    cancelDurationWarning() {
        const modal = document.querySelector('.duration-warning-modal');
        if (modal) {
            modal.remove();
        }
        this.pendingActivity = null;
        document.getElementById('activityDuration').focus();
    }

    confirmLongDuration() {
        const modal = document.querySelector('.duration-warning-modal');
        if (modal) {
            modal.remove();
        }

        if (this.pendingActivity) {
            const duration = this.pendingActivity.duration;
            this.saveActivity(
                this.pendingActivity.activityType,
                this.pendingActivity.duration,
                this.pendingActivity.intensity,
                this.pendingActivity.notes
            );
            this.logLongDurationAlert(duration);
            this.pendingActivity = null;
        }
    }

    logLongDurationAlert(duration) {
        const alert = {
            id: Date.now(),
            level: 'warning',
            message: `Long duration activity logged: ${duration} minutes. Remember to take regular breaks.`,
            timestamp: new Date().toISOString(),
            type: 'duration_warning'
        };

        this.alerts.push(alert);
        this.saveData();
        this.updateStats();
    }

    saveActivity(activityType, duration, intensity, notes) {
        const activity = {
            id: Date.now(),
            type: activityType,
            duration: duration,
            intensity: intensity,
            notes: notes,
            timestamp: new Date().toISOString(),
            cognitiveLoad: this.calculateCognitiveLoad(activityType, duration, intensity)
        };

        this.activities.push(activity);
        this.saveData();
        this.updateSaturationLevel();
        this.updateStats();
        this.renderChart();
        this.renderHistory();
        this.checkAlerts();

        // Clear form
        document.getElementById('activityDuration').value = '';
        document.getElementById('activityNotes').value = '';
        document.getElementById('cognitiveIntensity').value = 5;
        updateIntensityValue();

        this.showNotification('Activity logged successfully!');
    }

    calculateCognitiveLoad(activityType, duration, intensity) {
        const activityMultipliers = {
            'reading': 1.2,
            'writing': 1.5,
            'problem-solving': 2.0,
            'decision-making': 1.8,
            'learning': 1.6,
            'multitasking': 2.5,
            'meetings': 1.3,
            'other': 1.0
        };

        const multiplier = activityMultipliers[activityType] || 1.0;
        return duration * intensity * multiplier;
    }

    updateSaturationLevel() {
        const today = new Date().toDateString();
        const todayActivities = this.activities.filter(activity =>
            new Date(activity.timestamp).toDateString() === today
        );

        const totalLoad = todayActivities.reduce((sum, activity) => sum + activity.cognitiveLoad, 0);

        // Saturation levels based on cognitive load thresholds
        if (totalLoad < 500) {
            this.currentSaturation = Math.min(totalLoad / 500 * 25, 25);
        } else if (totalLoad < 1500) {
            this.currentSaturation = 25 + ((totalLoad - 500) / 1000 * 25);
        } else if (totalLoad < 3000) {
            this.currentSaturation = 50 + ((totalLoad - 1500) / 1500 * 25);
        } else {
            this.currentSaturation = 75 + Math.min((totalLoad - 3000) / 2000 * 25, 25);
        }

        this.currentSaturation = Math.min(this.currentSaturation, 100);
        this.updateGauge();
        this.updateStatus();
    }

    updateGauge() {
        const gauge = document.getElementById('saturationGauge');
        const rotation = (this.currentSaturation / 100) * 180 - 90; // -90 to 90 degrees
        gauge.style.transform = `rotate(${rotation}deg)`;
    }

    updateStatus() {
        const status = document.getElementById('saturationStatus');
        const container = document.querySelector('.alert-section');

        container.classList.remove('alert-high', 'alert-critical');

        if (this.currentSaturation < 25) {
            status.textContent = 'Low - Good for complex tasks';
            status.style.color = '#4CAF50';
        } else if (this.currentSaturation < 50) {
            status.textContent = 'Moderate - Consider taking breaks';
            status.style.color = '#FFC107';
        } else if (this.currentSaturation < 75) {
            status.textContent = 'High - Take a break soon';
            status.style.color = '#FF9800';
            container.classList.add('alert-high');
        } else {
            status.textContent = 'Critical - Immediate break required';
            status.style.color = '#F44336';
            container.classList.add('alert-critical');
        }
    }

    takeBreak(type) {
        const durations = { short: 5, medium: 15, long: 30 };
        this.breakDuration = durations[type] * 60; // Convert to seconds
        this.breakStartTime = Date.now();

        this.startBreakTimer();
        this.showNotification(`Starting ${durations[type]}-minute break`);
    }

    startBreakTimer() {
        const timerDisplay = document.getElementById('breakTimerDisplay');
        const timerSection = document.getElementById('breakTimer');

        timerSection.style.display = 'block';

        this.breakTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.breakStartTime) / 1000);
            const remaining = this.breakDuration - elapsed;

            if (remaining <= 0) {
                this.endBreak();
                this.showNotification('Break completed! Ready to continue.');
                return;
            }

            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    endBreak() {
        if (this.breakTimer) {
            clearInterval(this.breakTimer);
            this.breakTimer = null;
        }

        const breakRecord = {
            id: Date.now(),
            duration: Math.floor((Date.now() - this.breakStartTime) / 1000 / 60), // minutes
            timestamp: new Date().toISOString()
        };

        this.breaks.push(breakRecord);
        this.saveData();

        document.getElementById('breakTimer').style.display = 'none';
        this.updateStats();
        this.updateSaturationLevel(); // Reduce saturation after break
    }

    updateStats() {
        const today = new Date().toDateString();

        // Today's load
        const todayActivities = this.activities.filter(activity =>
            new Date(activity.timestamp).toDateString() === today
        );
        const todayLoad = todayActivities.reduce((sum, activity) => sum + activity.cognitiveLoad, 0);
        document.getElementById('todayLoad').textContent = Math.round(todayLoad);

        // Weekly average
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekActivities = this.activities.filter(activity =>
            new Date(activity.timestamp) >= weekAgo
        );
        const weeklyAvg = weekActivities.length > 0 ?
            weekActivities.reduce((sum, activity) => sum + activity.cognitiveLoad, 0) / 7 : 0;
        document.getElementById('weeklyAvg').textContent = Math.round(weeklyAvg);

        // Alerts today
        const todayAlerts = this.alerts.filter(alert =>
            new Date(alert.timestamp).toDateString() === today
        );
        document.getElementById('alertsToday').textContent = todayAlerts.length;

        // Break efficiency (breaks taken vs high saturation periods)
        const todayBreaks = this.breaks.filter(breakItem =>
            new Date(breakItem.timestamp).toDateString() === today
        );
        const highSaturationPeriods = todayActivities.filter(activity => activity.cognitiveLoad > 100).length;
        const breakEfficiency = highSaturationPeriods > 0 ?
            Math.min(todayBreaks.length / highSaturationPeriods * 100, 100) : 100;
        document.getElementById('breakEfficiency').textContent = Math.round(breakEfficiency) + '%';
    }

    renderChart() {
        const ctx = document.getElementById('saturationChart').getContext('2d');

        // Get last 7 days of data
        const dates = [];
        const loads = [];
        const breaks = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            const dayActivities = this.activities.filter(activity =>
                new Date(activity.timestamp).toDateString() === dateStr
            );
            const dayLoad = dayActivities.reduce((sum, activity) => sum + activity.cognitiveLoad, 0);
            loads.push(dayLoad);

            const dayBreaks = this.breaks.filter(breakItem =>
                new Date(breakItem.timestamp).toDateString() === dateStr
            );
            breaks.push(dayBreaks.length);
        }

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Cognitive Load',
                    data: loads,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Breaks Taken',
                    data: breaks,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    type: 'bar',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Cognitive Load'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Breaks'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                }
            }
        });
    }

    renderHistory() {
        const historyContainer = document.getElementById('activityHistory');
        const recentActivities = this.activities.slice(-10).reverse();

        if (recentActivities.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-brain"></i>
                    <h3>No Activities Yet</h3>
                    <p>Start logging your cognitive activities to track your mental load, prevent burnout, and maintain optimal brain function.</p>
                    <button class="log-btn" onclick="scrollToLogSection()">
                        <i class="fas fa-plus-circle"></i> Log Your First Activity
                    </button>
                </div>
            `;
        } else {
            historyContainer.innerHTML = recentActivities.map(activity => `
                <div class="activity-item">
                    <div class="activity-header">
                        <span class="activity-type">${activity.type.replace('-', ' ')}</span>
                        <span class="activity-time">${new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="activity-details">
                        <i class="fas fa-clock" style="color: #667eea; width: 16px;"></i> Duration: ${activity.duration} min | 
                        <i class="fas fa-bolt" style="color: #FF9800;"></i> Intensity: ${activity.intensity}/10<br>
                        <i class="fas fa-weight" style="color: #764ba2;"></i> Cognitive Load: ${Math.round(activity.cognitiveLoad)}<br>
                        ${activity.notes ? `<i class="fas fa-sticky-note" style="color: #4CAF50;"></i> Notes: ${activity.notes}` : ''}
                        ${activity.duration > 120 ? '<br><span style="color: #FF9800; display: inline-block; margin-top: 5px;"><i class="fas fa-exclamation-triangle"></i> Long session - take breaks!</span>' : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    checkAlerts() {
        if (this.currentSaturation >= 75 && !this.recentAlert()) {
            const alert = {
                id: Date.now(),
                level: this.currentSaturation >= 90 ? 'critical' : 'high',
                message: this.currentSaturation >= 90 ?
                    'Critical cognitive saturation! Take an immediate break.' :
                    'High cognitive saturation detected. Consider taking a break.',
                timestamp: new Date().toISOString()
            };

            this.alerts.push(alert);
            this.saveData();
            this.showNotification(alert.message, 'error');
            this.updateStats();
        }
    }

    recentAlert() {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return this.alerts.some(alert =>
            new Date(alert.timestamp).getTime() > fiveMinutesAgo
        );
    }

    saveData() {
        localStorage.setItem('cognitiveActivities', JSON.stringify(this.activities));
        localStorage.setItem('cognitiveBreaks', JSON.stringify(this.breaks));
        localStorage.setItem('cognitiveAlerts', JSON.stringify(this.alerts));
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

function scrollToLogSection() {
    document.querySelector('.log-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    const logSection = document.querySelector('.log-section');
    logSection.style.transition = 'box-shadow 0.3s ease';
    logSection.style.boxShadow = '0 0 0 3px #667eea, 0 5px 15px rgba(0,0,0,0.08)';
    
    setTimeout(() => {
        logSection.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
    }, 1500);
}

// Global functions for HTML onclick handlers
function updateIntensityValue() {
    const value = document.getElementById('cognitiveIntensity').value;
    document.getElementById('intensityValue').textContent = value;
}

function logCognitiveActivity() {
    window.tracker.logCognitiveActivity();
}

function takeBreak(type) {
    window.tracker.takeBreak(type);
}

function endBreak() {
    window.tracker.endBreak();
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new CognitiveSaturationTracker();
});