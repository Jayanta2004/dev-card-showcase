// Cognitive Switching Cost Tracker

class CognitiveSwitchTracker {
    constructor() {
        this.switches = JSON.parse(localStorage.getItem('cognitive-switches')) || [];
        this.currentTask = localStorage.getItem('current-task') || null;
        this.AVERAGE_SWITCH_COST = 25; // minutes based on research
        this.importedData = null;
        this.lastBreakTime = localStorage.getItem('last-break-time') ? 
            new Date(localStorage.getItem('last-break-time')) : new Date();
        this.BREAK_THRESHOLD = 90; 
        this.HIGH_COGNITIVE_LOAD = 7; 
        this.notificationShown = false;
        this.focusScore = 0;
        
        this.categoryColors = {
            'Development': '#4a90e2',
            'Meetings': '#e74c3c',
            'Email': '#f39c12',
            'Planning': '#27ae60',
            'Research': '#9b59b6',
            'Admin': '#1abc9c',
            'Creative': '#e67e22',
            'Other': '#95a5a6',
            'Break': '#f1c40f'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupModalEventListeners();
        this.setupImportExportListeners();
        this.setupWeeklyReportListener();
        this.updateUI();
        this.renderCharts();
        this.renderFlowAnalysis();
        this.displayRecentSwitches();
        this.startBreakMonitoring();
        this.calculateFocusScore();
        this.displayFocusScore();
        this.displayBreakAnalytics();
    }

    setupEventListeners() {
        const form = document.getElementById('task-switch-form');
        const cognitiveLoadSlider = document.getElementById('cognitive-load');
        const clearDataBtn = document.getElementById('clear-data-btn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.logTaskSwitch();
        });

        cognitiveLoadSlider.addEventListener('input', (e) => {
            document.getElementById('cognitive-load-value').textContent = e.target.value;
        });

        clearDataBtn.addEventListener('click', () => {
            this.showConfirmationModal();
        });
    }

    setupImportExportListeners() {
        const exportBtn = document.getElementById('export-data-btn');
        const importBtn = document.getElementById('import-data-btn');
        const importFile = document.getElementById('import-file');

        exportBtn.addEventListener('click', () => {
            this.exportData();
        });

        importBtn.addEventListener('click', () => {
            importFile.click();
        });

        importFile.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
    }

    setupWeeklyReportListener() {
        const reportBtn = document.getElementById('weekly-report-btn');
        reportBtn.addEventListener('click', () => {
            this.generateWeeklyReport();
        });
    }

    exportData() {
        if (this.switches.length === 0) {
            this.showNotification('No data to export!', 'error');
            return;
        }

        const exportData = {
            switches: this.switches,
            currentTask: this.currentTask,
            lastBreakTime: this.lastBreakTime,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `cognitive-switches-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.validateAndPreviewImport(importedData);
            } catch (error) {
                this.showNotification('Invalid JSON file format!', 'error');
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    }

    validateAndPreviewImport(data) {
        if (!data.switches || !Array.isArray(data.switches)) {
            this.showNotification('Invalid file format: Missing switches array!', 'error');
            return;
        }

        const isValid = data.switches.every(s => 
            s.id && s.timestamp && s.previousTask && s.currentTask && s.reason && 
            s.cognitiveLoad && s.switchCost
        );

        if (!isValid) {
            this.showNotification('Invalid file format: Corrupted switch data!', 'error');
            return;
        }

        this.importedData = data;
        this.showImportPreview(data);
    }

    showImportPreview(data) {
        const modal = document.getElementById('import-confirm-modal');
        const summary = document.getElementById('import-summary');
        
        const existingCount = this.switches.length;
        const newCount = data.switches.length;
        const uniqueCount = this.getUniqueSwitchesCount(data.switches);
        
        summary.innerHTML = `
            <strong>Import Summary:</strong><br>
            • Existing records: ${existingCount}<br>
            • New records to import: ${data.switches.length}<br>
            • Unique records after merge: ${uniqueCount}<br>
            • Export date: ${new Date(data.exportDate).toLocaleString() || 'Unknown'}<br>
            <br>
            <span style="color: #666;">The import will merge data without duplicates.</span>
        `;

        modal.classList.add('show');
    }

    getUniqueSwitchesCount(newSwitches) {
        const existingIds = new Set(this.switches.map(s => s.id));
        const uniqueNew = newSwitches.filter(s => !existingIds.has(s.id));
        return this.switches.length + uniqueNew.length;
    }

    importData() {
        if (!this.importedData) return;

        const existingIds = new Set(this.switches.map(s => s.id));
        const newSwitches = this.importedData.switches.filter(s => !existingIds.has(s.id));
        
        this.switches = [...newSwitches, ...this.switches];
        this.switches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (this.switches.length > 100) {
            this.switches = this.switches.slice(0, 100);
        }

        if (!this.currentTask && this.importedData.currentTask) {
            this.currentTask = this.importedData.currentTask;
        }

        if (this.importedData.lastBreakTime) {
            this.lastBreakTime = new Date(this.importedData.lastBreakTime);
        }

        this.saveData();
        this.destroyCharts();
        this.updateUI();
        this.renderCharts();
        this.renderFlowAnalysis();
        this.displayRecentSwitches();
        this.calculateFocusScore();
        this.displayFocusScore();
        this.displayBreakAnalytics();
        this.showNotification(`Successfully imported ${newSwitches.length} new records!`, 'success');
        this.importedData = null;
    }

    setupModalEventListeners() {
        const modal = document.getElementById('confirm-modal');
        const importModal = document.getElementById('import-confirm-modal');
        const breakModal = document.getElementById('break-modal');
        const reportModal = document.getElementById('weekly-report-modal');
        const cancelBtn = document.getElementById('modal-cancel');
        const confirmBtn = document.getElementById('modal-confirm');
        const importCancel = document.getElementById('import-cancel');
        const importConfirm = document.getElementById('import-confirm');
        const snoozeBtn = document.getElementById('modal-snooze');
        const dismissBtn = document.getElementById('modal-dismiss');
        const reportCancel = document.getElementById('report-cancel');
        const reportDownload = document.getElementById('report-download');

        cancelBtn.addEventListener('click', () => {
            this.hideConfirmationModal();
        });

        confirmBtn.addEventListener('click', () => {
            this.clearAllData();
            this.hideConfirmationModal();
        });

        if (snoozeBtn) {
            snoozeBtn.addEventListener('click', () => {
                this.hideBreakModal();
                this.notificationShown = true;
                setTimeout(() => {
                    this.notificationShown = false;
                }, 30 * 60 * 1000); // Reset after 30 minutes
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hideBreakModal();
            });
        }

        importCancel.addEventListener('click', () => {
            this.hideImportModal();
        });

        importConfirm.addEventListener('click', () => {
            this.importData();
            this.hideImportModal();
        });

        if (reportCancel) {
            reportCancel.addEventListener('click', () => {
                this.hideReportModal();
            });
        }

        if (reportDownload) {
            reportDownload.addEventListener('click', () => {
                this.downloadPDFReport();
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideConfirmationModal();
            }
        });

        importModal.addEventListener('click', (e) => {
            if (e.target === importModal) {
                this.hideImportModal();
            }
        });

        breakModal.addEventListener('click', (e) => {
            if (e.target === breakModal) {
                this.hideBreakModal();
            }
        });

        if (reportModal) {
            reportModal.addEventListener('click', (e) => {
                if (e.target === reportModal) {
                    this.hideReportModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modal.classList.contains('show')) {
                    this.hideConfirmationModal();
                }
                if (importModal.classList.contains('show')) {
                    this.hideImportModal();
                }
                if (breakModal.classList.contains('show')) {
                    this.hideBreakModal();
                }
                if (reportModal && reportModal.classList.contains('show')) {
                    this.hideReportModal();
                }
            }
        });
    }

    showConfirmationModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.add('show');
    }

    hideConfirmationModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('show');
    }

    showBreakModal() {
        const modal = document.getElementById('break-modal');
        modal.classList.add('show');
    }

    hideBreakModal() {
        const modal = document.getElementById('break-modal');
        modal.classList.remove('show');
    }

    hideImportModal() {
        const modal = document.getElementById('import-confirm-modal');
        modal.classList.remove('show');
        this.importedData = null;
    }

    showReportModal() {
        const modal = document.getElementById('weekly-report-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideReportModal() {
        const modal = document.getElementById('weekly-report-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    clearAllData() {
        localStorage.removeItem('cognitive-switches');
        localStorage.removeItem('current-task');
        localStorage.removeItem('last-break-time');
        
        this.switches = [];
        this.currentTask = null;
        this.lastBreakTime = new Date();
        
        document.getElementById('task-switch-form').reset();
        document.getElementById('cognitive-load').value = 5;
        document.getElementById('cognitive-load-value').textContent = '5';
        
        this.destroyCharts();
        
        this.updateUI();
        this.renderCharts();
        this.renderFlowAnalysis();
        this.displayRecentSwitches();
        this.calculateFocusScore();
        this.displayFocusScore();
        this.displayBreakAnalytics();
        
        this.showNotification('All data has been cleared successfully!', 'success');
        
        this.resetInsights();
    }

    destroyCharts() {
        const charts = ['switch-frequency-chart', 'time-loss-chart', 'flow-sankey-chart', 'top-transitions-chart', 'break-effectiveness-chart'];
        charts.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const existingChart = Chart.getChart(canvas);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
        });
    }

    resetInsights() {
        const insightsContent = document.getElementById('insights-content');
        insightsContent.innerHTML = `
            <p>💡 <strong>Did you know?</strong> Research shows that context switching can cost up to 25 minutes of productive time per switch.</p>
            <p>🎯 <strong>Tip:</strong> Try to batch similar tasks together and minimize interruptions during deep work sessions.</p>
            <p>📊 <strong>Get started:</strong> Log your first task switch to see personalized insights!</p>
        `;
    }

    startBreakMonitoring() {
        setInterval(() => {
            this.checkBreakRecommendation();
        }, 60000);
    }

    checkBreakRecommendation() {
        if (this.notificationShown) return;

        const focusDuration = this.calculateCurrentFocusDuration();
        const avgCognitiveLoad = this.calculateAverageCognitiveLoad();
        
        const lastSwitch = this.switches[0];
        if (lastSwitch && lastSwitch.reason === 'break') {
            this.lastBreakTime = new Date(lastSwitch.timestamp);
            return;
        }

        const now = new Date();
        const timeSinceBreak = Math.round((now - this.lastBreakTime) / (1000 * 60));

        if (timeSinceBreak > this.BREAK_THRESHOLD && avgCognitiveLoad > this.HIGH_COGNITIVE_LOAD) {
            this.showBreakRecommendation(timeSinceBreak, avgCognitiveLoad);
        }
    }

    calculateCurrentFocusDuration() {
        if (this.switches.length === 0) return 0;
        
        const lastSwitch = new Date(this.switches[0].timestamp);
        const now = new Date();
        return Math.round((now - lastSwitch) / (1000 * 60));
    }

    calculateAverageCognitiveLoad() {
        if (this.switches.length === 0) return 0;
        
        const recentSwitches = this.switches.slice(0, 5);
        const sum = recentSwitches.reduce((total, s) => total + s.cognitiveLoad, 0);
        return sum / recentSwitches.length;
    }

    showBreakRecommendation(duration, load) {
        const modal = document.getElementById('break-modal');
        const durationSpan = document.getElementById('break-duration');
        const loadSpan = document.getElementById('break-cognitive-load');
        const benefitSpan = document.getElementById('break-benefit');

        durationSpan.textContent = duration;
        loadSpan.textContent = load.toFixed(1);
        
        const productivityGain = this.calculateProductivityGain();
        benefitSpan.textContent = `+${productivityGain}%`;

        modal.classList.add('show');
        this.notificationShown = true;
    }

    calculateProductivityGain() {
        const breaks = this.switches.filter(s => s.reason === 'break');
        if (breaks.length < 2) return 25; // Default value

        let totalGain = 0;
        let validBreaks = 0;

        for (let i = 0; i < breaks.length; i++) {
            const breakIndex = this.switches.findIndex(s => s.id === breaks[i].id);
            
            if (breakIndex > 0 && breakIndex < this.switches.length - 1) {
                const beforeBreak = this.switches[breakIndex + 1];
                const afterBreak = this.switches[breakIndex - 1];
                
                if (beforeBreak && afterBreak) {
                    const loadReduction = beforeBreak.cognitiveLoad - afterBreak.cognitiveLoad;
                    const gain = (loadReduction / beforeBreak.cognitiveLoad) * 100;
                    totalGain += gain;
                    validBreaks++;
                }
            }
        }

        return validBreaks > 0 ? Math.round(totalGain / validBreaks) : 25;
    }

    calculateFocusScore() {
        if (this.switches.length === 0) {
            this.focusScore = 0;
            return 0;
        }

        let score = 100;

        // Penalize frequent switches (more than 4 per hour)
        const lastHour = this.switches.filter(s => {
            const switchTime = new Date(s.timestamp);
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return switchTime > hourAgo;
        }).length;

        if (lastHour > 4) {
            score -= (lastHour - 4) * 10;
        }

        const highLoadSwitches = this.switches.filter(s => s.cognitiveLoad > 7).length;
        score -= highLoadSwitches * 2;

        const breaks = this.switches.filter(s => s.reason === 'break').length;
        score += breaks * 5;

        if (this.switches.length > 1) {
            let avgFocusTime = 0;
            for (let i = 0; i < Math.min(5, this.switches.length - 1); i++) {
                const time1 = new Date(this.switches[i].timestamp);
                const time2 = new Date(this.switches[i + 1].timestamp);
                const diff = Math.abs(time2 - time1) / (1000 * 60);
                avgFocusTime += diff;
            }
            avgFocusTime /= Math.min(5, this.switches.length - 1);
            
            if (avgFocusTime > 45) {
                score += 10;
            } else if (avgFocusTime > 25) {
                score += 5;
            }
        }

        this.focusScore = Math.max(0, Math.min(100, Math.round(score)));
        return this.focusScore;
    }

    displayFocusScore() {
        const scoreElement = document.getElementById('focus-score');
        const circleElement = document.getElementById('focus-score-circle');
        
        if (scoreElement) {
            scoreElement.textContent = this.focusScore;
        }

        if (circleElement) {
            let color = '#e74c3c'; 
            if (this.focusScore >= 70) color = '#27ae60'; 
            else if (this.focusScore >= 40) color = '#f39c12'; 
            
            const percentage = this.focusScore;
            circleElement.style.background = `conic-gradient(${color} 0deg ${percentage * 3.6}deg, #e1e5e9 ${percentage * 3.6}deg 360deg)`;
        }
    }

    displayBreakAnalytics() {
        const analyticsDiv = document.getElementById('break-analytics');
        if (!analyticsDiv) return;

        const breaks = this.switches.filter(s => s.reason === 'break');
        
        if (breaks.length === 0) {
            analyticsDiv.innerHTML = `
                <div class="break-stat">
                    <span class="stat-label">Breaks Taken:</span>
                    <span class="stat-value">0</span>
                </div>
                <div class="break-stat">
                    <span class="stat-label">Log your first break to see analytics!</span>
                </div>
            `;
            return;
        }

        // Calculate average break interval
        let totalInterval = 0;
        let intervalCount = 0;
        
        for (let i = 0; i < breaks.length - 1; i++) {
            const break1 = new Date(breaks[i].timestamp);
            const break2 = new Date(breaks[i + 1].timestamp);
            const interval = Math.abs(break2 - break1) / (1000 * 60);
            totalInterval += interval;
            intervalCount++;
        }
        
        const avgInterval = intervalCount > 0 ? Math.round(totalInterval / intervalCount) : 0;
        
        // Calculate average break duration (time between break and next switch)
        let totalBreakDuration = 0;
        let durationCount = 0;
        
        for (let i = 0; i < breaks.length; i++) {
            const breakIndex = this.switches.findIndex(s => s.id === breaks[i].id);
            if (breakIndex > 0) {
                const nextSwitch = this.switches[breakIndex - 1];
                const breakTime = new Date(breaks[i].timestamp);
                const nextTime = new Date(nextSwitch.timestamp);
                const duration = Math.abs(nextTime - breakTime) / (1000 * 60);
                totalBreakDuration += duration;
                durationCount++;
            }
        }
        
        const avgBreakDuration = durationCount > 0 ? Math.round(totalBreakDuration / durationCount) : 0;

        analyticsDiv.innerHTML = `
            <div class="break-stat">
                <span class="stat-label">Total Breaks:</span>
                <span class="stat-value">${breaks.length}</span>
            </div>
            <div class="break-stat">
                <span class="stat-label">Avg Break Interval:</span>
                <span class="stat-value">${avgInterval} min</span>
            </div>
            <div class="break-stat">
                <span class="stat-label">Avg Break Duration:</span>
                <span class="stat-value">${avgBreakDuration} min</span>
            </div>
            <div class="break-stat">
                <span class="stat-label">Productivity Gain:</span>
                <span class="stat-value">+${this.calculateProductivityGain()}%</span>
            </div>
        `;
    }

    logTaskSwitch() {
        const previousTask = document.getElementById('previous-task').value.trim();
        const previousCategory = document.getElementById('previous-category').value;
        const currentTaskInput = document.getElementById('current-task-input').value.trim();
        const currentCategory = document.getElementById('current-category').value;
        const reason = document.getElementById('switch-reason').value;
        const cognitiveLoad = parseInt(document.getElementById('cognitive-load').value);

        if (!previousTask || !previousCategory || !currentTaskInput || !currentCategory || !reason) {
            alert('Please fill in all required fields.');
            return;
        }

        // Calculate dynamic switch cost based on cognitive load
        const baseCost = this.AVERAGE_SWITCH_COST;
        const cognitiveMultiplier = cognitiveLoad / 5;
        const switchCost = Math.round(baseCost * cognitiveMultiplier);

        const switchData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            previousTask,
            previousCategory,
            currentTask: currentTaskInput,
            currentCategory,
            reason,
            cognitiveLoad,
            switchCost,
            date: new Date().toDateString(),
            isBreak: reason === 'break'
        };

        this.switches.unshift(switchData);
        this.currentTask = currentTaskInput;

        if (reason === 'break') {
            this.lastBreakTime = new Date();
            localStorage.setItem('last-break-time', this.lastBreakTime.toISOString());
        }

        // Keep only last 100 switches
        if (this.switches.length > 100) {
            this.switches = this.switches.slice(0, 100);
        }

        this.saveData();
        this.updateUI();
        
        this.destroyCharts();
        this.renderCharts();
        this.renderFlowAnalysis();
        
        this.displayRecentSwitches();
        this.calculateFocusScore();
        this.displayFocusScore();
        this.displayBreakAnalytics();
        this.hideBreakModal();

        // Reset form
        document.getElementById('task-switch-form').reset();
        document.getElementById('cognitive-load').value = 5;
        document.getElementById('cognitive-load-value').textContent = '5';

        this.showNotification('Task switch logged successfully!', 'success');
    }

    calculateStats() {
        const today = new Date().toDateString();
        const todaySwitches = this.switches.filter(s => s.date === today);

        const totalTimeLost = todaySwitches.reduce((sum, s) => sum + s.switchCost, 0);
        const avgCost = todaySwitches.length > 0 ?
            Math.round(todaySwitches.reduce((sum, s) => sum + s.switchCost, 0) / todaySwitches.length) :
            this.AVERAGE_SWITCH_COST;

        return {
            todaySwitches: todaySwitches.length,
            totalTimeLost,
            avgCost,
            currentTask: this.currentTask
        };
    }

    updateUI() {
        const stats = this.calculateStats();

        document.getElementById('today-switches').textContent = stats.todaySwitches;
        document.getElementById('today-time-lost').textContent = `${stats.totalTimeLost} min`;
        document.getElementById('avg-switch-cost').textContent = `${stats.avgCost} min`;
        document.getElementById('current-task').textContent = stats.currentTask || 'None';
    }

    renderCharts() {
        this.renderSwitchFrequencyChart();
        this.renderTimeLossChart();
        this.renderBreakEffectivenessChart();
    }

    renderSwitchFrequencyChart() {
        const ctx = document.getElementById('switch-frequency-chart').getContext('2d');

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toDateString());
        }

        const switchCounts = last7Days.map(date =>
            this.switches.filter(s => s.date === date).length
        );

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
                datasets: [{
                    label: 'Task Switches',
                    data: switchCounts,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Task Switches (Last 7 Days)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderTimeLossChart() {
        const ctx = document.getElementById('time-loss-chart').getContext('2d');

        const reasons = {};
        this.switches.forEach(switchItem => {
            if (!reasons[switchItem.reason]) {
                reasons[switchItem.reason] = 0;
            }
            reasons[switchItem.reason] += switchItem.switchCost;
        });

        const labels = Object.keys(reasons).map(reason => this.formatReason(reason));
        const data = Object.values(reasons);

        if (data.length === 0) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#e1e5e9']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Time Lost by Switch Reason'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            return;
        }

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        '#4a90e2',
                        '#e74c3c',
                        '#f39c12',
                        '#27ae60',
                        '#9b59b6',
                        '#1abc9c',
                        '#e67e22'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Time Lost by Switch Reason'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderBreakEffectivenessChart() {
        const ctx = document.getElementById('break-effectiveness-chart');
        if (!ctx) return;

        const breaks = this.switches.filter(s => s.reason === 'break');
        
        if (breaks.length < 2) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [0]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Not enough break data yet'
                        }
                    }
                }
            });
            return;
        }
        
        const recentBreaks = breaks.slice(0, 5).reverse();
        const labels = [];
        const beforeLoad = [];
        const afterLoad = [];
        
        recentBreaks.forEach((breakItem, index) => {
            const breakIndex = this.switches.findIndex(s => s.id === breakItem.id);
            if (breakIndex > 0 && breakIndex < this.switches.length - 1) {
                const beforeBreak = this.switches[breakIndex + 1];
                const afterBreak = this.switches[breakIndex - 1];
                
                if (beforeBreak && afterBreak) {
                    labels.push(`Break ${index + 1}`);
                    beforeLoad.push(beforeBreak.cognitiveLoad);
                    afterLoad.push(afterBreak.cognitiveLoad);
                }
            }
        });
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Cognitive Load Before Break',
                        data: beforeLoad,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Cognitive Load After Break',
                        data: afterLoad,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Break Effectiveness - Cognitive Load Reduction'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Cognitive Load (1-10)'
                        }
                    }
                }
            }
        });
    }

    renderFlowAnalysis() {
        this.calculateFlowStats();
        this.renderSankeyChart();
        this.renderTopTransitionsChart();
        this.renderCategoryTimeLossTable();
    }

    calculateFlowStats() {
        if (this.switches.length === 0) {
            document.getElementById('most-common-transition').textContent = 'None';
            document.getElementById('most-common-count').textContent = '0 times';
            document.getElementById('most-costly-transition').textContent = 'None';
            document.getElementById('most-costly-time').textContent = '0 min lost';
            document.getElementById('total-categories').textContent = '0';
            document.getElementById('recommended-batch').textContent = 'None';
            return;
        }

        const categories = new Set();
        this.switches.forEach(s => {
            categories.add(s.previousCategory);
            categories.add(s.currentCategory);
        });
        document.getElementById('total-categories').textContent = categories.size;

        const transitions = {};
        this.switches.forEach(s => {
            const key = `${s.previousCategory}→${s.currentCategory}`;
            if (!transitions[key]) {
                transitions[key] = {
                    count: 0,
                    totalTime: 0,
                    from: s.previousCategory,
                    to: s.currentCategory
                };
            }
            transitions[key].count++;
            transitions[key].totalTime += s.switchCost;
        });

        let mostCommon = null;
        let maxCount = 0;
        Object.values(transitions).forEach(t => {
            if (t.count > maxCount) {
                maxCount = t.count;
                mostCommon = t;
            }
        });

        if (mostCommon) {
            document.getElementById('most-common-transition').textContent = 
                `${mostCommon.from} → ${mostCommon.to}`;
            document.getElementById('most-common-count').textContent = 
                `${mostCommon.count} times`;
        }

        let mostCostly = null;
        let maxTime = 0;
        Object.values(transitions).forEach(t => {
            if (t.totalTime > maxTime) {
                maxTime = t.totalTime;
                mostCostly = t;
            }
        });

        if (mostCostly) {
            document.getElementById('most-costly-transition').textContent = 
                `${mostCostly.from} → ${mostCostly.to}`;
            document.getElementById('most-costly-time').textContent = 
                `${mostCostly.totalTime} min lost`;
        }

        this.generateBatchRecommendation(transitions);
    }

    generateBatchRecommendation(transitions) {
        const pairs = [];
        Object.values(transitions).forEach(t => {
            if (t.count >= 3) { 
                pairs.push({
                    from: t.from,
                    to: t.to,
                    count: t.count
                });
            }
        });

        if (pairs.length === 0) {
            document.getElementById('recommended-batch').textContent = 'Batch similar tasks';
            return;
        }

        pairs.sort((a, b) => b.count - a.count);
        const topPair = pairs[0];
        
        document.getElementById('recommended-batch').textContent = 
            `${topPair.from} + ${topPair.to}`;
    }

    renderSankeyChart() {
        const ctx = document.getElementById('flow-sankey-chart').getContext('2d');
        
        if (this.switches.length === 0) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [0]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'No flow data available'
                        }
                    }
                }
            });
            return;
        }

        const flows = {};
        this.switches.forEach(s => {
            const from = s.previousCategory;
            const to = s.currentCategory;
            const key = `${from}→${to}`;
            
            if (!flows[key]) {
                flows[key] = {
                    from: from,
                    to: to,
                    count: 0
                };
            }
            flows[key].count++;
        });

        const topFlows = Object.values(flows)
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topFlows.map(f => `${f.from} → ${f.to}`),
                datasets: [{
                    label: 'Number of Switches',
                    data: topFlows.map(f => f.count),
                    backgroundColor: '#4a90e2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Category Flows'
                    }
                }
            }
        });
    }

    renderTopTransitionsChart() {
        const ctx = document.getElementById('top-transitions-chart').getContext('2d');
        
        if (this.switches.length === 0) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#e1e5e9']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            return;
        }

        const transitions = {};
        this.switches.forEach(s => {
            const key = `${s.previousCategory} → ${s.currentCategory}`;
            if (!transitions[key]) {
                transitions[key] = 0;
            }
            transitions[key] += s.switchCost;
        });

        const top5 = Object.entries(transitions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: top5.map(t => t[0]),
                datasets: [{
                    data: top5.map(t => t[1]),
                    backgroundColor: [
                        '#4a90e2',
                        '#e74c3c',
                        '#f39c12',
                        '#27ae60',
                        '#9b59b6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 5 by Time Lost'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderCategoryTimeLossTable() {
        const tbody = document.getElementById('category-time-loss-body');
        
        if (this.switches.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No data available yet</td></tr>';
            return;
        }

        const transitions = {};
        this.switches.forEach(s => {
            const key = `${s.previousCategory}|${s.currentCategory}`;
            if (!transitions[key]) {
                transitions[key] = {
                    from: s.previousCategory,
                    to: s.currentCategory,
                    count: 0,
                    totalTime: 0,
                    totalLoad: 0
                };
            }
            transitions[key].count++;
            transitions[key].totalTime += s.switchCost;
            transitions[key].totalLoad += s.cognitiveLoad;
        });

        const transitionArray = Object.values(transitions)
            .map(t => ({
                ...t,
                avgTime: Math.round(t.totalTime / t.count),
                avgLoad: Math.round(t.totalLoad / t.count)
            }))
            .sort((a, b) => b.totalTime - a.totalTime);

        tbody.innerHTML = transitionArray.map(t => `
            <tr>
                <td><span class="category-badge" style="background: ${this.categoryColors[t.from] || '#95a5a6'}20; color: ${this.categoryColors[t.from] || '#666'}">${t.from}</span></td>
                <td><span class="category-badge" style="background: ${this.categoryColors[t.to] || '#95a5a6'}20; color: ${this.categoryColors[t.to] || '#666'}">${t.to}</span></td>
                <td>${t.count} times</td>
                <td>${t.totalTime} min</td>
                <td>${t.avgTime} min</td>
            </tr>
        `).join('');
    }

    formatReason(reason) {
        const reasonMap = {
            'interruption': 'External Interruption',
            'distraction': 'Internal Distraction',
            'priority': 'Higher Priority',
            'deadline': 'Deadline Pressure',
            'completion': 'Task Completion',
            'break': 'Taking Break',
            'other': 'Other'
        };
        return reasonMap[reason] || reason;
    }

    displayRecentSwitches() {
        const list = document.getElementById('switches-list');
        const recentSwitches = this.switches.slice(0, 10);

        if (recentSwitches.length === 0) {
            list.innerHTML = '<p>No task switches logged yet. Start tracking to see your patterns!</p>';
            return;
        }

        list.innerHTML = recentSwitches.map(switchItem => `
            <div class="switch-item ${switchItem.reason === 'break' ? 'break-item' : ''}">
                <div class="time">${new Date(switchItem.timestamp).toLocaleString()}</div>
                <div class="tasks">
                    <span class="category-badge prev-category">${switchItem.previousCategory}</span>
                    ${switchItem.previousTask} 
                    → 
                    <span class="category-badge current-category">${switchItem.currentCategory}</span>
                    ${switchItem.currentTask}
                </div>
                <div class="reason">Reason: ${this.formatReason(switchItem.reason)}</div>
                <div class="cost">Time Lost: ${switchItem.switchCost} min (Load: ${switchItem.cognitiveLoad}/10)</div>
                ${switchItem.reason === 'break' ? '<span class="break-badge">☕ Break Taken</span>' : ''}
            </div>
        `).join('');
    }

    saveData() {
        localStorage.setItem('cognitive-switches', JSON.stringify(this.switches));
        localStorage.setItem('current-task', this.currentTask || '');
        if (this.lastBreakTime) {
            localStorage.setItem('last-break-time', this.lastBreakTime.toISOString());
        }
    }

    showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
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
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    generateWeeklyReport() {
        if (this.switches.length === 0) {
            this.showNotification('No data available to generate report!', 'error');
            return;
        }

        const reportData = this.prepareWeeklyReportData();
        this.displayReportPreview(reportData);
        this.showReportModal();
    }

    prepareWeeklyReportData() {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weeklySwitches = this.switches.filter(s => new Date(s.timestamp) >= oneWeekAgo);
        
        if (weeklySwitches.length === 0) {
            return this.prepareReportWithAllData();
        }

        return this.calculateReportMetrics(weeklySwitches);
    }

    prepareReportWithAllData() {
        return this.calculateReportMetrics(this.switches);
    }

    calculateReportMetrics(switches) {
        const interruptions = {};
        switches.forEach(s => {
            if (s.reason !== 'break' && s.reason !== 'completion') {
                interruptions[s.reason] = (interruptions[s.reason] || 0) + 1;
            }
        });

        const totalInterruptions = Object.values(interruptions).reduce((a, b) => a + b, 0);
        const interruptionPercentages = {};
        Object.entries(interruptions).forEach(([reason, count]) => {
            interruptionPercentages[reason] = Math.round((count / totalInterruptions) * 100);
        });

        const dayStats = {};
        switches.forEach(s => {
            const day = new Date(s.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
            if (!dayStats[day]) {
                dayStats[day] = { switches: 0, timeLost: 0, count: 0 };
            }
            dayStats[day].switches++;
            dayStats[day].timeLost += s.switchCost;
            dayStats[day].count++;
        });

        let bestDay = { name: 'None', avgTimeLost: Infinity };
        let worstDay = { name: 'None', avgTimeLost: 0 };

        Object.entries(dayStats).forEach(([day, stats]) => {
            const avgTimeLost = stats.timeLost / stats.switches;
            if (avgTimeLost < bestDay.avgTimeLost) {
                bestDay = { name: day, avgTimeLost };
            }
            if (avgTimeLost > worstDay.avgTimeLost) {
                worstDay = { name: day, avgTimeLost };
            }
        });

        const now = new Date();
        const thisWeek = switches.filter(s => {
            const date = new Date(s.timestamp);
            return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        });

        const lastWeek = switches.filter(s => {
            const date = new Date(s.timestamp);
            const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= twoWeeksAgo && date < oneWeekAgo;
        });

        const thisWeekSwitches = thisWeek.length;
        const lastWeekSwitches = lastWeek.length;
        const switchChange = lastWeekSwitches > 0 
            ? Math.round(((thisWeekSwitches - lastWeekSwitches) / lastWeekSwitches) * 100) 
            : 0;

        const thisWeekTimeLost = thisWeek.reduce((sum, s) => sum + s.switchCost, 0);
        const lastWeekTimeLost = lastWeek.reduce((sum, s) => sum + s.switchCost, 0);
        const timeLostChange = lastWeekTimeLost > 0 
            ? Math.round(((thisWeekTimeLost - lastWeekTimeLost) / lastWeekTimeLost) * 100) 
            : 0;

        const recommendations = this.generateRecommendations(switches);

        return {
            interruptionPercentages,
            bestDay: bestDay.name,
            worstDay: worstDay.name,
            weekComparison: {
                thisWeekSwitches,
                lastWeekSwitches,
                switchChange,
                thisWeekTimeLost,
                lastWeekTimeLost,
                timeLostChange
            },
            recommendations,
            totalSwitches: switches.length,
            totalTimeLost: switches.reduce((sum, s) => sum + s.switchCost, 0),
            avgCognitiveLoad: Math.round(switches.reduce((sum, s) => sum + s.cognitiveLoad, 0) / switches.length),
            focusScore: this.focusScore
        };
    }

    generateRecommendations(switches) {
        const recommendations = [];

        const interruptionCounts = {};
        switches.forEach(s => {
            if (s.reason !== 'break' && s.reason !== 'completion') {
                interruptionCounts[s.reason] = (interruptionCounts[s.reason] || 0) + 1;
            }
        });

        const topInterruption = Object.entries(interruptionCounts)
            .sort((a, b) => b[1] - a[1])[0];

        if (topInterruption) {
            const reason = this.formatReason(topInterruption[0]);
            recommendations.push({
                type: 'interruption',
                text: `Your main productivity disruptor is "${reason}". Try scheduling specific times to handle these interruptions.`
            });
        }

        const transitions = {};
        switches.forEach(s => {
            const key = `${s.previousCategory}→${s.currentCategory}`;
            transitions[key] = (transitions[key] || 0) + 1;
        });

        const topTransition = Object.entries(transitions)
            .sort((a, b) => b[1] - a[1])[0];

        if (topTransition) {
            const [from, to] = topTransition[0].split('→');
            recommendations.push({
                type: 'batching',
                text: `You frequently switch between ${from} and ${to}. Consider batching these activities together to reduce switching costs.`
            });
        }

        const highLoadSwitches = switches.filter(s => s.cognitiveLoad > 7).length;
        if (highLoadSwitches > switches.length * 0.3) {
            recommendations.push({
                type: 'break',
                text: `${highLoadSwitches} of your switches involved high cognitive load. Try taking more frequent breaks to maintain mental clarity.`
            });
        }

        const breaks = switches.filter(s => s.reason === 'break').length;
        if (breaks < switches.length * 0.1 && switches.length > 10) {
            recommendations.push({
                type: 'break-frequency',
                text: `You're taking relatively few breaks. Taking short breaks every 60-90 minutes can improve focus by up to 25%.`
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'general',
                text: 'Great job! Keep tracking your switches to maintain this productive pattern.'
            });
        }

        return recommendations;
    }

    displayReportPreview(data) {
        const previewDiv = document.getElementById('report-preview');
        
        if (!previewDiv) return;

        const interruptionHtml = Object.entries(data.interruptionPercentages)
            .map(([reason, percent]) => `
                <div class="interruption-item">
                    <span class="interruption-name">${this.formatReason(reason)}</span>
                    <div class="interruption-bar-container">
                        <div class="interruption-bar" style="width: ${percent}%"></div>
                    </div>
                    <span class="interruption-percent">${percent}%</span>
                </div>
            `).join('');

        const recommendationsHtml = data.recommendations.map(r => `
            <div class="recommendation-item">
                <i>💡</i> ${r.text}
            </div>
        `).join('');

        const switchChangeClass = data.weekComparison.switchChange > 0 ? 'comparison-negative' : 
                                 data.weekComparison.switchChange < 0 ? 'comparison-positive' : 'comparison-neutral';
        const timeChangeClass = data.weekComparison.timeLostChange > 0 ? 'comparison-negative' : 
                               data.weekComparison.timeLostChange < 0 ? 'comparison-positive' : 'comparison-neutral';

        previewDiv.innerHTML = `
            <div class="report-section">
                <h4><i>📊</i> Weekly Summary</h4>
                <div class="report-stat">
                    <span class="label">Total Switches:</span>
                    <span class="value highlight">${data.totalSwitches}</span>
                </div>
                <div class="report-stat">
                    <span class="label">Total Time Lost:</span>
                    <span class="value highlight">${data.totalTimeLost} min</span>
                </div>
                <div class="report-stat">
                    <span class="label">Avg Cognitive Load:</span>
                    <span class="value">${data.avgCognitiveLoad}/10</span>
                </div>
                <div class="report-stat">
                    <span class="label">Focus Score:</span>
                    <span class="value ${data.focusScore >= 70 ? 'highlight' : data.focusScore >= 40 ? 'comparison-neutral' : 'warning'}">${data.focusScore}</span>
                </div>
            </div>

            <div class="report-section">
                <h4><i>🔍</i> Interruption Sources</h4>
                ${interruptionHtml || '<p>No interruption data available</p>'}
            </div>

            <div class="report-section">
                <h4><i>📅</i> Productivity Patterns</h4>
                <div class="report-stat">
                    <span class="label">Best Day:</span>
                    <span class="day-badge best">${data.bestDay}</span>
                </div>
                <div class="report-stat">
                    <span class="label">Worst Day:</span>
                    <span class="day-badge worst">${data.worstDay}</span>
                </div>
            </div>

            <div class="report-section">
                <h4><i>📈</i> Week-over-Week Comparison</h4>
                <div class="report-stat">
                    <span class="label">Switches:</span>
                    <span class="value ${switchChangeClass}">
                        ${data.weekComparison.thisWeekSwitches} vs ${data.weekComparison.lastWeekSwitches} 
                        (${data.weekComparison.switchChange > 0 ? '+' : ''}${data.weekComparison.switchChange}%)
                    </span>
                </div>
                <div class="report-stat">
                    <span class="label">Time Lost:</span>
                    <span class="value ${timeChangeClass}">
                        ${data.weekComparison.thisWeekTimeLost} min vs ${data.weekComparison.lastWeekTimeLost} min 
                        (${data.weekComparison.timeLostChange > 0 ? '+' : ''}${data.weekComparison.timeLostChange}%)
                    </span>
                </div>
            </div>

            <div class="report-section">
                <h4><i>💪</i> Personalized Recommendations</h4>
                ${recommendationsHtml}
            </div>
        `;
    }

    downloadPDFReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const reportData = this.prepareWeeklyReportData();
        
        doc.setFontSize(20);
        doc.setTextColor(39, 174, 96);
        doc.text('Weekly Productivity Report', 20, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Weekly Summary', 20, 45);
        
        doc.setFontSize(11);
        doc.text(`• Total Switches: ${reportData.totalSwitches}`, 25, 55);
        doc.text(`• Total Time Lost: ${reportData.totalTimeLost} minutes`, 25, 62);
        doc.text(`• Avg Cognitive Load: ${reportData.avgCognitiveLoad}/10`, 25, 69);
        doc.text(`• Focus Score: ${reportData.focusScore}`, 25, 76);
        
        doc.setFontSize(14);
        doc.text('Interruption Sources', 20, 91);
        
        let yPos = 101;
        Object.entries(reportData.interruptionPercentages).forEach(([reason, percent]) => {
            doc.setFontSize(10);
            doc.text(`• ${this.formatReason(reason)}: ${percent}%`, 25, yPos);
            yPos += 7;
        });
        
        yPos += 5;
        doc.setFontSize(14);
        doc.text('Productivity Patterns', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        doc.text(`• Best Day: ${reportData.bestDay}`, 25, yPos);
        yPos += 7;
        doc.text(`• Worst Day: ${reportData.worstDay}`, 25, yPos);
        yPos += 10;
        
        doc.setFontSize(14);
        doc.text('Week-over-Week Comparison', 20, yPos);
        yPos += 10;
        
        const switchSymbol = reportData.weekComparison.switchChange > 0 ? '+' : '';
        const timeSymbol = reportData.weekComparison.timeLostChange > 0 ? '+' : '';
        
        doc.setFontSize(11);
        doc.text(`• Switches: ${reportData.weekComparison.thisWeekSwitches} vs ${reportData.weekComparison.lastWeekSwitches} (${switchSymbol}${reportData.weekComparison.switchChange}%)`, 25, yPos);
        yPos += 7;
        doc.text(`• Time Lost: ${reportData.weekComparison.thisWeekTimeLost} min vs ${reportData.weekComparison.lastWeekTimeLost} min (${timeSymbol}${reportData.weekComparison.timeLostChange}%)`, 25, yPos);
        yPos += 10;
        
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Personalized Recommendations', 20, yPos);
        yPos += 10;
        
        reportData.recommendations.forEach(rec => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(`• ${rec.text}`, 170);
            doc.text(lines, 25, yPos);
            yPos += (lines.length * 5) + 5;
        });
        
        doc.save(`productivity-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
        this.showNotification('PDF report downloaded successfully!', 'success');
        this.hideReportModal();
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CognitiveSwitchTracker();
});

// Add CSS animations for notifications
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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
}