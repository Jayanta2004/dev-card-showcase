// ==================== Wellness & Mood Insights Hub ==================== //

class WellnessApp {
    constructor() {
        this.moods = JSON.parse(localStorage.getItem('wellness_moods')) || [];
        this.stressLogs = JSON.parse(localStorage.getItem('wellness_stress')) || [];
        this.sleepLogs = JSON.parse(localStorage.getItem('wellness_sleep')) || [];
        this.goals = JSON.parse(localStorage.getItem('wellness_goals')) || {};
        
        this.initializeApp();
        this.attachEventListeners();
        this.updateDashboard();
    }

    initializeApp() {
        const today = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('lastVisit') !== today) {
            localStorage.setItem('lastVisit', today);
            this.checkStreak();
        }
        this.updateDateDisplay();
    }

    checkStreak() {
        const streakData = JSON.parse(localStorage.getItem('wellness_streak')) || {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (streakData.lastDate === yesterdayStr) {
            streakData.count = (streakData.count || 0) + 1;
        } else if (streakData.lastDate !== todayStr) {
            streakData.count = 1;
        }
        
        streakData.lastDate = todayStr;
        localStorage.setItem('wellness_streak', JSON.stringify(streakData));
        this.updateStreakDisplay();
    }

    updateStreakDisplay() {
        const streak = JSON.parse(localStorage.getItem('wellness_streak')) || {};
        const badge = document.getElementById('currentStreak');
        const count = streak.count || 0;
        badge.innerHTML = `<i class="fas fa-fire"></i> ${count} day streak`;
    }

    updateDateDisplay() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = today.toLocaleDateString('en-US', options);
        document.getElementById('dashDate').textContent = dateStr;
    }

    attachEventListeners() {
        // Tab Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.closest('.nav-tab')));
        });

        // Dashboard Buttons
        document.getElementById('quickMoodBtn').addEventListener('click', () => this.openModal('moodModal'));
        document.getElementById('quickStressBtn').addEventListener('click', () => this.openModal('stressModal'));
        document.getElementById('quickSleepBtn').addEventListener('click', () => this.openModal('sleepModal'));

        // Add Buttons
        document.getElementById('addMoodBtn').addEventListener('click', () => this.openModal('moodModal'));
        document.getElementById('addStressBtn').addEventListener('click', () => this.openModal('stressModal'));
        document.getElementById('addSleepBtn').addEventListener('click', () => this.openModal('sleepModal'));

        // Form Submissions
        document.getElementById('moodForm').addEventListener('submit', (e) => this.saveMood(e));
        document.getElementById('stressForm').addEventListener('submit', (e) => this.saveStress(e));
        document.getElementById('sleepForm').addEventListener('submit', (e) => this.saveSleep(e));

        // Close Buttons
        document.getElementById('closeMoodModal').addEventListener('click', () => this.closeModal('moodModal'));
        document.getElementById('closeStressModal').addEventListener('click', () => this.closeModal('stressModal'));
        document.getElementById('closeSleepModal').addEventListener('click', () => this.closeModal('sleepModal'));

        document.getElementById('cancelMoodBtn').addEventListener('click', () => this.closeModal('moodModal'));
        document.getElementById('cancelStressBtn').addEventListener('click', () => this.closeModal('stressModal'));
        document.getElementById('cancelSleepBtn').addEventListener('click', () => this.closeModal('sleepModal'));

        // Analytics
        document.getElementById('analyticsPeriod').addEventListener('change', (e) => this.updateAnalytics(e.target.value));
        document.getElementById('exportBtn').addEventListener('click', () => this.exportReport());

        // Stress Slider
        document.getElementById('stressLevel').addEventListener('input', (e) => {
            document.getElementById('stressDisplay').textContent = e.target.value;
        });

        document.getElementById('stressLevelSlider').addEventListener('input', (e) => {
            document.getElementById('sliderValue').textContent = e.target.value;
        });

        // Modal Close on Background Click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    switchTab(tabElement) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab
        tabElement.classList.add('active');
        const tabName = tabElement.getAttribute('data-tab');
        document.getElementById(`${tabName}-section`).classList.add('active');

        // Update analytics when switching to that tab
        if (tabName === 'analytics') {
            this.updateAnalytics('week');
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        
        if (modalId === 'sleepModal') {
            document.getElementById('sleepDate').valueAsDate = new Date();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        
        if (modalId === 'moodModal') {
            document.getElementById('moodForm').reset();
        } else if (modalId === 'stressModal') {
            document.getElementById('stressForm').reset();
            document.getElementById('stressDisplay').textContent = '5';
        } else if (modalId === 'sleepModal') {
            document.getElementById('sleepForm').reset();
        }
    }

    saveMood(e) {
        e.preventDefault();
        
        const moodValue = document.querySelector('input[name="mood"]:checked').value;
        const notes = document.getElementById('moodNotes').value;
        const factors = Array.from(document.querySelectorAll('input[name="factor"]:checked')).map(cb => cb.value);

        const mood = {
            id: Date.now(),
            value: parseInt(moodValue),
            emoji: this.getMoodEmoji(moodValue),
            label: this.getMoodLabel(moodValue),
            notes,
            factors,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        this.moods.unshift(mood);
        localStorage.setItem('wellness_moods', JSON.stringify(this.moods));
        
        this.showToast('Mood saved successfully!');
        this.closeModal('moodModal');
        this.updateDashboard();
        this.renderMoodHistory();
    }

    saveStress(e) {
        e.preventDefault();

        const level = parseInt(document.getElementById('stressLevel').value);
        const source = document.getElementById('stressSource').value;
        const strategy = document.getElementById('copingStrategy').value;
        const notes = document.getElementById('stressNotes').value;

        const stress = {
            id: Date.now(),
            level,
            source,
            strategy,
            notes,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        this.stressLogs.unshift(stress);
        localStorage.setItem('wellness_stress', JSON.stringify(this.stressLogs));

        this.showToast('Stress logged successfully!');
        this.closeModal('stressModal');
        this.updateDashboard();
        this.renderStressHistory();
    }

    saveSleep(e) {
        e.preventDefault();

        const date = document.getElementById('sleepDate').value;
        const hours = parseFloat(document.getElementById('sleepHours').value);
        const quality = parseInt(document.querySelector('input[name="quality"]:checked').value);
        const issues = Array.from(document.querySelectorAll('input[name="issue"]:checked')).map(cb => cb.value);
        const notes = document.getElementById('sleepNotes').value;

        const sleep = {
            id: Date.now(),
            date,
            hours,
            quality,
            issues,
            notes,
            timestamp: new Date().toISOString()
        };

        this.sleepLogs.unshift(sleep);
        localStorage.setItem('wellness_sleep', JSON.stringify(this.sleepLogs));

        this.showToast('Sleep logged successfully!');
        this.closeModal('sleepModal');
        this.updateDashboard();
        this.renderSleepHistory();
    }

    updateDashboard() {
        // Today's Mood
        const today = new Date().toISOString().split('T')[0];
        const todayMood = this.moods.find(m => m.date === today);
        
        if (todayMood) {
            document.getElementById('todayMood').textContent = todayMood.emoji;
            document.getElementById('moodDetail').textContent = todayMood.label + ' - ' + new Date(todayMood.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
            document.getElementById('todayMood').textContent = '-';
            document.getElementById('moodDetail').textContent = 'No check-in yet';
        }

        // Today's Stress
        const todayStress = this.stressLogs.find(s => s.date === today);
        if (todayStress) {
            document.getElementById('todayStress').textContent = todayStress.level + '/10';
            document.getElementById('stressDetail').textContent = this.getStressLabel(todayStress.level);
        } else {
            document.getElementById('todayStress').textContent = '-';
            document.getElementById('stressDetail').textContent = 'No log yet';
        }

        // Last Night's Sleep
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const lastSleep = this.sleepLogs.find(s => s.date === yesterdayStr || s.date === today);
        
        if (lastSleep) {
            document.getElementById('lastNightSleep').textContent = lastSleep.hours + 'h';
            document.getElementById('sleepDetail').textContent = `Quality: ${this.getSleepQualityLabel(lastSleep.quality)}`;
        } else {
            document.getElementById('lastNightSleep').textContent = '-';
            document.getElementById('sleepDetail').textContent = 'No data';
        }

        // Weekly Average
        this.updateWeeklyAverage();
        this.renderInsights();
        this.renderMoodHistory();
        this.renderStressHistory();
        this.renderSleepHistory();
    }

    updateWeeklyAverage() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const weekMoods = this.moods.filter(m => new Date(m.date) >= sevenDaysAgo);
        if (weekMoods.length === 0) {
            document.getElementById('weeklyAverage').textContent = '-';
            return;
        }

        const avgValue = weekMoods.reduce((sum, m) => sum + m.value, 0) / weekMoods.length;
        const rounded = Math.round(avgValue * 10) / 10;
        document.getElementById('weeklyAverage').textContent = this.getMoodEmoji(Math.round(avgValue)) + ' ' + rounded.toFixed(1);
    }

    renderInsights() {
        const container = document.getElementById('insightsContainer');
        container.innerHTML = '';

        const today = new Date().toISOString().split('T')[0];
        const todayMood = this.moods.find(m => m.date === today);
        const todayStress = this.stressLogs.find(s => s.date === today);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const insights = [];

        // Check mood trend
        const recentMoods = this.moods.filter(m => new Date(m.date) >= sevenDaysAgo);
        if (recentMoods.length >= 3) {
            const avgThisWeek = recentMoods.reduce((sum, m) => sum + m.value, 0) / recentMoods.length;
            if (avgThisWeek >= 4) {
                insights.push('Your mood has been great this week! Keep up the positive vibes.');
            } else if (avgThisWeek < 2.5) {
                insights.push('Your mood seems low recently. Consider doing something you enjoy today.');
            }
        }

        // Check stress patterns
        const recentStress = this.stressLogs.filter(s => new Date(s.date) >= sevenDaysAgo);
        if (recentStress.length >= 3) {
            const avgStress = recentStress.reduce((sum, s) => sum + s.level, 0) / recentStress.length;
            if (avgStress >= 7) {
                insights.push('Stress levels have been high. Try some relaxation techniques.');
            }
        }

        // Check sleep quality
        const recentSleep = this.sleepLogs.filter(s => new Date(s.date) >= sevenDaysAgo);
        if (recentSleep.length >= 3) {
            const avgSleep = recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length;
            if (avgSleep < 6) {
                insights.push('Your average sleep is below 6 hours. Aim for 7-9 hours per night.');
            } else if (avgSleep >= 7 && avgSleep <= 9) {
                insights.push('Great sleep schedule! Keep maintaining 7-9 hours per night.');
            }
        }

        // Daily reminder
        if (!todayMood) {
            insights.push('Don\'t forget to log your mood today!');
        }

        if (insights.length === 0) {
            insights.push('Keep tracking your wellness consistently for better insights!');
        }

        insights.forEach(insight => {
            const div = document.createElement('div');
            div.className = 'insight-item';
            div.textContent = insight;
            container.appendChild(div);
        });
    }

    renderMoodHistory() {
        const container = document.getElementById('moodList');
        if (this.moods.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-face-smile"></i><p>No mood entries yet. Start by logging your mood!</p></div>';
            return;
        }

        container.innerHTML = this.moods.map(mood => `
            <div class="mood-item">
                <div class="item-left">
                    <div class="item-emoji">${mood.emoji}</div>
                    <div class="item-content">
                        <div class="item-title">${mood.label}</div>
                        <div class="item-meta">
                            ${new Date(mood.timestamp).toLocaleDateString()} at ${new Date(mood.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        ${mood.notes ? `<div class="item-meta" style="margin-top: 8px; color: var(--text-secondary);">"${mood.notes}"</div>` : ''}
                        ${mood.factors.length > 0 ? `<div class="item-meta" style="margin-top: 6px;">Factors: ${mood.factors.join(', ')}</div>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="app.deleteMood(${mood.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderStressHistory() {
        const container = document.getElementById('stressList');
        if (this.stressLogs.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-wind"></i><p>No stress logs yet. Track your stress levels to identify patterns.</p></div>';
            return;
        }

        container.innerHTML = this.stressLogs.map(stress => `
            <div class="stress-item">
                <div class="item-left">
                    <div class="item-emoji" style="font-size: 24px; color: ${this.getStressColor(stress.level)}">●</div>
                    <div class="item-content">
                        <div class="item-title">Stress Level: ${stress.level}/10</div>
                        <div class="item-meta">
                            ${new Date(stress.timestamp).toLocaleDateString()} at ${new Date(stress.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div class="item-meta">Source: ${stress.source || 'Not specified'}</div>
                        ${stress.strategy ? `<div class="item-meta">Strategy: ${stress.strategy}</div>` : ''}
                        ${stress.notes ? `<div class="item-meta" style="color: var(--text-secondary);">"${stress.notes}"</div>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="app.deleteStress(${stress.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderSleepHistory() {
        const container = document.getElementById('sleepList');
        if (this.sleepLogs.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-moon"></i><p>No sleep logs yet. Track your sleep to improve your wellness.</p></div>';
            return;
        }

        container.innerHTML = this.sleepLogs.map(sleep => `
            <div class="sleep-item">
                <div class="item-left">
                    <div class="item-emoji">😴</div>
                    <div class="item-content">
                        <div class="item-title">${sleep.hours} hours on ${new Date(sleep.date).toLocaleDateString()}</div>
                        <div class="item-meta">Quality: ${this.getSleepQualityLabel(sleep.quality)}</div>
                        ${sleep.issues.length > 0 ? `<div class="item-meta">Issues: ${sleep.issues.join(', ')}</div>` : ''}
                        ${sleep.notes ? `<div class="item-meta" style="color: var(--text-secondary);">"${sleep.notes}"</div>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="app.deleteSleep(${sleep.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateAnalytics(period) {
        let startDate = new Date();
        
        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else {
            startDate = new Date(0); // All time
        }

        const filteredMoods = this.moods.filter(m => new Date(m.date) >= startDate);
        const filteredStress = this.stressLogs.filter(s => new Date(s.date) >= startDate);
        const filteredSleep = this.sleepLogs.filter(s => new Date(s.date) >= startDate);

        // Update stats
        const avgMood = filteredMoods.length > 0 
            ? (filteredMoods.reduce((sum, m) => sum + m.value, 0) / filteredMoods.length).toFixed(1)
            : '-';
        const avgStress = filteredStress.length > 0
            ? (filteredStress.reduce((sum, s) => sum + s.level, 0) / filteredStress.length).toFixed(1)
            : '-';
        const avgSleep = filteredSleep.length > 0
            ? (filteredSleep.reduce((sum, s) => sum + s.hours, 0) / filteredSleep.length).toFixed(1)
            : '-';

        document.getElementById('avgMood').textContent = avgMood !== '-' ? this.getMoodEmoji(avgMood) + ' ' + avgMood : '-';
        document.getElementById('avgStress').textContent = avgStress + '/10';
        document.getElementById('avgSleep').textContent = avgSleep + 'h';
        document.getElementById('checkInCount').textContent = filteredMoods.length + filteredStress.length + filteredSleep.length;

        // Render charts
        this.renderCharts(filteredMoods, filteredStress, filteredSleep);
    }

    renderCharts(moods, stressLogs, sleepLogs) {
        // Group data by date
        const dateGroups = {};
        
        moods.forEach(m => {
            if (!dateGroups[m.date]) dateGroups[m.date] = {};
            dateGroups[m.date].mood = m.value;
        });

        stressLogs.forEach(s => {
            if (!dateGroups[s.date]) dateGroups[s.date] = {};
            dateGroups[s.date].stress = s.level;
        });

        sleepLogs.forEach(s => {
            if (!dateGroups[s.date]) dateGroups[s.date] = {};
            dateGroups[s.date].sleep = s.hours;
        });

        const sortedDates = Object.keys(dateGroups).sort();
        
        // Mood Chart
        this.drawLineChart(
            'moodChart',
            sortedDates.map(d => dateGroups[d].mood || null),
            sortedDates.slice(-14),
            'Mood Trend',
            '#06b6d4'
        );

        // Stress Chart
        this.drawLineChart(
            'stressChart',
            sortedDates.map(d => dateGroups[d].stress || null),
            sortedDates.slice(-14),
            'Stress Levels',
            '#f97316'
        );

        // Sleep Chart
        this.drawLineChart(
            'sleepChart',
            sortedDates.map(d => dateGroups[d].sleep || null),
            sortedDates.slice(-14),
            'Sleep Duration',
            '#10b981'
        );

        // Correlation Chart
        const moods2 = sortedDates.map(d => dateGroups[d].mood || 0);
        const stress2 = sortedDates.map(d => dateGroups[d].stress || 0);
        this.drawCorrelationChart(moods2, stress2);
    }

    drawLineChart(canvasId, data, labels, title, color) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;

        const filteredData = data.slice(-14);
        const filteredLabels = labels.slice(-14);

        const padding = 40;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        const maxValue = Math.max(...filteredData.filter(d => d !== null), 10);

        // Clear canvas
        ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        let firstPoint = true;
        filteredData.forEach((value, index) => {
            if (value === null || value === undefined) return;
            
            const x = padding + (width / (filteredData.length - 1 || 1)) * index;
            const y = padding + height - (value / maxValue) * height;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = color;
        filteredData.forEach((value, index) => {
            if (value === null || value === undefined) return;
            
            const x = padding + (width / (filteredData.length - 1 || 1)) * index;
            const y = padding + height - (value / maxValue) * height;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        filteredLabels.forEach((label, index) => {
            const x = padding + (width / (filteredLabels.length - 1 || 1)) * index;
            ctx.fillText(label.slice(5), x, canvas.height - 20);
        });
    }

    drawCorrelationChart(moods, stress) {
        const canvas = document.getElementById('correlationChart');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;

        const padding = 40;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;

        // Clear canvas
        ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw axes
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Draw labels
        ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
        ctx.font = '12px Arial';
        ctx.fillText('Mood', 20, padding - 10);
        ctx.fillText('Stress', canvas.width - 30, canvas.height - 20);

        // Draw legend
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.fillText('Mood vs Stress Correlation', padding + 20, 30);
    }

    exportReport() {
        const period = document.getElementById('analyticsPeriod').value;
        const report = this.generateReport(period);
        
        // Create downloadable JSON
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wellness-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showToast('Report exported successfully!');
    }

    generateReport(period) {
        let startDate = new Date();
        
        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else {
            startDate = new Date(0);
        }

        const moods = this.moods.filter(m => new Date(m.date) >= startDate);
        const stress = this.stressLogs.filter(s => new Date(s.date) >= startDate);
        const sleep = this.sleepLogs.filter(s => new Date(s.date) >= startDate);

        return {
            period,
            generatedDate: new Date().toISOString(),
            summary: {
                averageMood: moods.length > 0 ? (moods.reduce((sum, m) => sum + m.value, 0) / moods.length).toFixed(1) : 0,
                averageStress: stress.length > 0 ? (stress.reduce((sum, s) => sum + s.level, 0) / stress.length).toFixed(1) : 0,
                averageSleep: sleep.length > 0 ? (sleep.reduce((sum, s) => sum + s.hours, 0) / sleep.length).toFixed(1) : 0,
                totalCheckIns: moods.length + stress.length + sleep.length,
                streak: JSON.parse(localStorage.getItem('wellness_streak')) || {}
            },
            data: {
                moods,
                stressLogs: stress,
                sleepLogs: sleep
            }
        };
    }

    deleteMood(id) {
        if (confirm('Are you sure you want to delete this mood entry?')) {
            this.moods = this.moods.filter(m => m.id !== id);
            localStorage.setItem('wellness_moods', JSON.stringify(this.moods));
            this.updateDashboard();
            this.showToast('Mood deleted');
        }
    }

    deleteStress(id) {
        if (confirm('Are you sure you want to delete this stress log?')) {
            this.stressLogs = this.stressLogs.filter(s => s.id !== id);
            localStorage.setItem('wellness_stress', JSON.stringify(this.stressLogs));
            this.updateDashboard();
            this.showToast('Stress log deleted');
        }
    }

    deleteSleep(id) {
        if (confirm('Are you sure you want to delete this sleep entry?')) {
            this.sleepLogs = this.sleepLogs.filter(s => s.id !== id);
            localStorage.setItem('wellness_sleep', JSON.stringify(this.sleepLogs));
            this.updateDashboard();
            this.showToast('Sleep entry deleted');
        }
    }

    getMoodEmoji(value) {
        const val = parseInt(value);
        const emojis = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
        return emojis[Math.min(Math.max(val, 1), 5)] || '😐';
    }

    getMoodLabel(value) {
        const val = parseInt(value);
        const labels = { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great' };
        return labels[Math.min(Math.max(val, 1), 5)] || 'Okay';
    }

    getStressLabel(level) {
        if (level <= 3) return 'Calm and relaxed';
        if (level <= 5) return 'Moderately stressed';
        if (level <= 7) return 'Quite stressed';
        return 'Very overwhelmed';
    }

    getStressColor(level) {
        if (level <= 3) return '#10b981';
        if (level <= 5) return '#fbbf24';
        if (level <= 7) return '#f97316';
        return '#ef4444';
    }

    getSleepQualityLabel(quality) {
        const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Excellent' };
        return labels[quality] || 'Unknown';
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        document.getElementById('toastMessage').textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize App
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WellnessApp();
});
