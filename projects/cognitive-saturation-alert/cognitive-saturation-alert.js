// Cognitive Saturation Alert JavaScript with Multi-Profile Support

class CognitiveSaturationTracker {
    constructor() {
        this.profiles = JSON.parse(localStorage.getItem('cognitiveProfiles')) || [];
        this.currentProfileId = localStorage.getItem('currentProfileId');
        
        if (this.profiles.length === 0) {
            const defaultProfile = {
                id: 'default-' + Date.now(),
                name: 'Default User',
                role: 'personal',
                color: '#667eea',
                description: 'Default profile for cognitive tracking',
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };
            this.profiles.push(defaultProfile);
            localStorage.setItem('cognitiveProfiles', JSON.stringify(this.profiles));
            this.currentProfileId = defaultProfile.id;
            localStorage.setItem('currentProfileId', this.currentProfileId);
        }
        
        if (!this.currentProfileId && this.profiles.length > 0) {
            this.currentProfileId = this.profiles[0].id;
            localStorage.setItem('currentProfileId', this.currentProfileId);
        }

        this.loadProfileData();
        
        this.currentSaturation = 0;
        this.breakTimer = null;
        this.breakDuration = 0;
        this.breakStartTime = null;
        this.pendingActivity = null;
        this.soundEnabled = true;
        this.lastSoundTime = 0;
        this.soundCooldown = 5 * 60 * 1000; 
        this.audioContext = null;
        this.chart = null;

        this.init();
    }

    loadProfileData() {
        const currentProfile = this.getCurrentProfile();
        if (!currentProfile) return;

        this.activities = JSON.parse(localStorage.getItem(`cognitiveActivities_${this.currentProfileId}`)) || [];
        this.breaks = JSON.parse(localStorage.getItem(`cognitiveBreaks_${this.currentProfileId}`)) || [];
        this.alerts = JSON.parse(localStorage.getItem(`cognitiveAlerts_${this.currentProfileId}`)) || [];
        
        currentProfile.lastActive = new Date().toISOString();
        localStorage.setItem('cognitiveProfiles', JSON.stringify(this.profiles));
    }

    getCurrentProfile() {
        return this.profiles.find(p => p.id === this.currentProfileId);
    }

    init() {
        this.createProfileSelector();
        this.updateSaturationLevel();
        this.updateStats();
        this.renderChart();
        this.renderHistory();
        this.checkAlerts();
        this.initSoundSettings();
    }

    createProfileSelector() {
        const container = document.querySelector('.saturation-container');
        if (!container) return;

        if (document.getElementById('profileSelector')) return;

        const currentProfile = this.getCurrentProfile();
        
        const selectorHTML = `
            <div class="profile-selector" id="profileSelector" style="
                background: white;
                border-radius: 10px;
                padding: 15px 20px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 15px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                border-left: 4px solid ${currentProfile?.color || '#667eea'};
            ">
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            background: ${currentProfile?.color || '#667eea'};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 1.2em;
                        ">
                            ${currentProfile?.name.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #2c3e50;">${currentProfile?.name || 'Default User'}</div>
                            <div style="font-size: 0.85em; color: #7f8c8d;">
                                <i class="fas fa-${this.getRoleIcon(currentProfile?.role)}"></i> 
                                ${currentProfile?.role ? currentProfile.role.charAt(0).toUpperCase() + currentProfile.role.slice(1) : 'Personal'}
                            </div>
                        </div>
                    </div>
                    <select id="profileSwitcher" style="
                        padding: 8px 15px;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        font-size: 0.95em;
                        outline: none;
                        min-width: 200px;
                        cursor: pointer;
                    ">
                        ${this.profiles.map(profile => `
                            <option value="${profile.id}" ${profile.id === this.currentProfileId ? 'selected' : ''}>
                                ${profile.name} (${profile.role})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.location.href='profiles.html'" style="
                        background: #f8f9fa;
                        border: 2px solid #e9ecef;
                        padding: 8px 15px;
                        border-radius: 8px;
                        color: #2c3e50;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        transition: all 0.2s ease;
                    ">
                        <i class="fas fa-users-cog"></i> Manage Profiles
                    </button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('afterbegin', selectorHTML);

        const switcher = document.getElementById('profileSwitcher');
        if (switcher) {
            switcher.addEventListener('change', (e) => {
                this.switchProfile(e.target.value);
            });
        }
    }

    getRoleIcon(role) {
        const icons = {
            'work': 'briefcase',
            'personal': 'user',
            'family': 'users',
            'project': 'project-diagram',
            'other': 'tag'
        };
        return icons[role] || 'user';
    }

    switchProfile(profileId) {
        if (profileId === this.currentProfileId) return;

        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) return;

        this.saveProfileData();

        this.currentProfileId = profileId;
        localStorage.setItem('currentProfileId', profileId);

        profile.lastActive = new Date().toISOString();
        localStorage.setItem('cognitiveProfiles', JSON.stringify(this.profiles));

        this.loadProfileData();

        this.updateProfileSelector();
        this.updateSaturationLevel();
        this.updateStats();
        this.renderChart();
        this.renderHistory();
        this.checkAlerts();

        this.showNotification(`Switched to profile: ${profile.name}`, 'success');
    }

    updateProfileSelector() {
        const selector = document.getElementById('profileSelector');
        if (selector) {
            selector.remove();
        }
        this.createProfileSelector();
    }

    saveProfileData() {
        if (!this.currentProfileId) return;

        localStorage.setItem(`cognitiveActivities_${this.currentProfileId}`, JSON.stringify(this.activities));
        localStorage.setItem(`cognitiveBreaks_${this.currentProfileId}`, JSON.stringify(this.breaks));
        localStorage.setItem(`cognitiveAlerts_${this.currentProfileId}`, JSON.stringify(this.alerts));
    }

    initSoundSettings() {
        const savedSoundSetting = localStorage.getItem(`soundNotificationsEnabled_${this.currentProfileId}`);
        if (savedSoundSetting !== null) {
            this.soundEnabled = savedSoundSetting === 'true';
        }
        
        const soundToggle = document.getElementById('soundNotifications');
        if (soundToggle) {
            soundToggle.checked = this.soundEnabled;
            soundToggle.addEventListener('change', (e) => {
                this.soundEnabled = e.target.checked;
                localStorage.setItem(`soundNotificationsEnabled_${this.currentProfileId}`, this.soundEnabled);

                if (this.soundEnabled) {
                    this.playNotificationSound('notification', true);
                }
            });
        }
        
        const soundType = document.getElementById('soundType');
        if (soundType) {
            const savedSoundType = localStorage.getItem(`notificationSoundType_${this.currentProfileId}`) || 'notification';
            soundType.value = savedSoundType;
            soundType.addEventListener('change', (e) => {
                localStorage.setItem(`notificationSoundType_${this.currentProfileId}`, e.target.value);
                this.playNotificationSound(e.target.value, true);
            });
        }
    }

    playNotificationSound(type = 'notification', isPreview = false) {
        if (!this.soundEnabled && !isPreview) return;
        
        if (!isPreview) {
            const now = Date.now();
            if (now - this.lastSoundTime < this.soundCooldown) {
                console.log('Sound on cooldown');
                return;
            }
            this.lastSoundTime = now;
        }

        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const soundType = document.getElementById('soundType')?.value || type;
            
            switch(soundType) {
                case 'alert':
                    this.playAlertSound();
                    break;
                case 'beep':
                    this.playBeepSound();
                    break;
                default:
                    this.playNotificationSoundEffect();
            }
        } catch (error) {
            console.log('Audio playback failed:', error);
            this.fallbackBeep();
        }
    }

    playNotificationSoundEffect() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); 
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime + 0.2); 
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    playAlertSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        
        for (let i = 0; i < 3; i++) {
            oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime + i * 0.2);
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime + i * 0.2 + 0.1);
        }
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    playBeepSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    fallbackBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.log('Fallback audio also failed:', e);
        }
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
        
        if (this.breakTimer) {
            clearInterval(this.breakTimer);
            this.breakTimer = null;
        }
       
        if (this.breakStartTime) {
            const interruptedBreak = {
                id: Date.now(),
                duration: Math.floor((Date.now() - this.breakStartTime) / 1000 / 60),
                timestamp: new Date().toISOString(),
                interrupted: true
            };
            this.breaks.push(interruptedBreak);
            this.saveData();
        }
        
        this.breakDuration = durations[type] * 60; // Convert to seconds
        this.breakStartTime = Date.now();

        this.startBreakTimer();
        this.showNotification(`Starting ${durations[type]}-minute break`);
    }

    startBreakTimer() {
        const timerDisplay = document.getElementById('breakTimerDisplay');
        const timerSection = document.getElementById('breakTimer');

        timerSection.style.display = 'block';

        if (this.breakTimer) {
            clearInterval(this.breakTimer);
        }

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

        if (this.breakStartTime) {
            const breakRecord = {
                id: Date.now(),
                duration: Math.floor((Date.now() - this.breakStartTime) / 1000 / 60),
                timestamp: new Date().toISOString(),
                completed: true
            };

            this.breaks.push(breakRecord);
            this.saveData();
        }

        this.breakStartTime = null;
        
        document.getElementById('breakTimer').style.display = 'none';
        this.updateStats();
        this.updateSaturationLevel();
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

    getActivityColor(activityType) {
        const colors = {
            'reading': '#4285F4',
            'writing': '#EA4335',
            'problem-solving': '#FBBC05',
            'decision-making': '#34A853',
            'learning': '#FF6D00',
            'multitasking': '#AA00FF',
            'meetings': '#00BCD4',
            'other': '#9E9E9E'
        };
        return colors[activityType] || '#667eea';
    }

    formatActivityType(type) {
        return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    renderHistory() {
        const historyContainer = document.getElementById('activityHistory');
        const recentActivities = this.activities.slice(-10).reverse();

        if (recentActivities.length === 0) {
            const currentProfile = this.getCurrentProfile();
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-brain"></i>
                    <h3>No Activities Yet for ${currentProfile?.name || 'This Profile'}</h3>
                    <p>Start logging your cognitive activities to track your mental load, prevent burnout, and maintain optimal brain function.</p>
                    <button class="log-btn" onclick="scrollToLogSection()">
                        <i class="fas fa-plus-circle"></i> Log Your First Activity
                    </button>
                </div>
            `;
        } else {
            historyContainer.innerHTML = recentActivities.map(activity => {
                const activityColor = this.getActivityColor(activity.type);
                const formattedType = this.formatActivityType(activity.type);
                const activityClass = activity.type.replace(/_/g, '-').toLowerCase();
                
                return `
                <div class="activity-item ${activityClass}" style="border-left-color: ${activityColor}">
                    <div class="activity-header">
                        <div class="activity-type-wrapper">
                            <span class="activity-type-icon ${activityClass}" style="background-color: ${activityColor}"></span>
                            <span class="activity-type" style="color: ${activityColor}">${formattedType}</span>
                        </div>
                        <span class="activity-time">${new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="activity-details">
                        <i class="fas fa-clock" style="color: #667eea; width: 16px;"></i> Duration: ${activity.duration} min | 
                        <i class="fas fa-bolt" style="color: #FF9800;"></i> Intensity: ${activity.intensity}/10<br>
                        <i class="fas fa-weight" style="color: #764ba2;"></i> Cognitive Load: ${Math.round(activity.cognitiveLoad)}<br>
                        ${activity.notes ? `<i class="fas fa-sticky-note" style="color: #4CAF50;"></i> Notes: ${activity.notes}` : ''}
                        ${activity.duration > 120 ? '<br><span class="long-session-badge"><i class="fas fa-exclamation-triangle"></i> Long session - take breaks!</span>' : ''}
                    </div>
                </div>
            `}).join('');
        }
    }

    checkAlerts() {
        if (this.currentSaturation >= 75 && !this.recentAlert()) {
            const alertLevel = this.currentSaturation >= 90 ? 'critical' : 'high';
            const alert = {
                id: Date.now(),
                level: alertLevel,
                message: this.currentSaturation >= 90 ?
                    'Critical cognitive saturation! Take an immediate break.' :
                    'High cognitive saturation detected. Consider taking a break.',
                timestamp: new Date().toISOString()
            };

            this.alerts.push(alert);
            this.saveData();
            this.showNotification(alert.message, 'error');
            this.playNotificationSound(alertLevel === 'critical' ? 'alert' : 'notification');
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
        if (!this.currentProfileId) return;
        
        localStorage.setItem(`cognitiveActivities_${this.currentProfileId}`, JSON.stringify(this.activities));
        localStorage.setItem(`cognitiveBreaks_${this.currentProfileId}`, JSON.stringify(this.breaks));
        localStorage.setItem(`cognitiveAlerts_${this.currentProfileId}`, JSON.stringify(this.alerts));
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