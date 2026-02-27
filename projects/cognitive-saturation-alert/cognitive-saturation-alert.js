// Cognitive Saturation Alert JavaScript with Multi-Profile Support, Enhanced Visualizations, and Storage Quota Handling

class CognitiveSaturationTracker {
    constructor() {
        this.profiles = JSON.parse(localStorage.getItem('cognitiveProfiles')) || [];
        this.currentProfileId = localStorage.getItem('currentProfileId');
        this.storageWarningShown = false;
        this.storageQuotaLimit = 5 * 1024 * 1024; 
        this.storageCriticalLimit = 8 * 1024 * 1024; 
        
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
        this.lineChart = null;
        this.pieChart = null;
        this.heatMapChart = null;
        this.currentChartType = 'line';
        this.checkStorageQuota();
        window.addEventListener('storage', this.handleStorageEvent.bind(this));

        this.init();
    }

    getUTCDateString(date = new Date()) {
        return new Date(date.toISOString().split('T')[0]).toISOString().split('T')[0];
    }

    isSameUTCDay(date1, date2) {
        return this.getUTCDateString(date1) === this.getUTCDateString(date2);
    }

    handleStorageEvent(e) {
        if (e.storageArea === localStorage && e.key && e.key.includes('cognitive')) {
            if (e.newValue === null) {
                this.showNotification('Storage quota warning: Some data may have been cleared', 'error');
                this.cleanupOldData();
            }
        }
    }

    checkStorageQuota() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += (localStorage[key].length * 2); 
                }
            }
            
            const sizeInMB = totalSize / (1024 * 1024);
            
            this.updateStorageIndicator(sizeInMB);
            
            if (totalSize > this.storageCriticalLimit) {
                this.showNotification('⚠️ Storage critically full! Automatically cleaning up old data...', 'error');
                this.cleanupOldData(true); // Force cleanup
                this.storageWarningShown = true;
            } else if (totalSize > this.storageQuotaLimit && !this.storageWarningShown) {
                this.showNotification('Storage is getting full. Keeping last 30 days of data.', 'warning');
                this.cleanupOldData();
                this.storageWarningShown = true;
            }
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                this.showNotification('Storage quota exceeded! Cleaning up old data...', 'error');
                this.cleanupOldData(true);
            }
        }
    }

    updateStorageIndicator(sizeInMB) {
        const existingIndicator = document.getElementById('storageIndicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const container = document.querySelector('.saturation-container');
        if (!container) return;

        let statusClass = 'storage-ok';
        let statusText = 'Storage: OK';
        
        if (sizeInMB > 8) {
            statusClass = 'storage-critical';
            statusText = '⚠️ Storage Critical';
        } else if (sizeInMB > 5) {
            statusClass = 'storage-warning';
            statusText = '⚠️ Storage Warning';
        }

        const indicatorHTML = `
            <div id="storageIndicator" style="
                background: white;
                border-radius: 8px;
                padding: 10px 15px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-left: 4px solid ${sizeInMB > 8 ? '#F44336' : (sizeInMB > 5 ? '#FF9800' : '#4CAF50')};
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                font-size: 0.9em;
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-database" style="color: ${sizeInMB > 8 ? '#F44336' : (sizeInMB > 5 ? '#FF9800' : '#4CAF50')};"></i>
                    <span>Storage: <strong>${sizeInMB.toFixed(2)} MB</strong> used</span>
                    <span style="color: ${sizeInMB > 8 ? '#F44336' : (sizeInMB > 5 ? '#FF9800' : '#7f8c8d')};">${statusText}</span>
                </div>
                <button onclick="window.tracker.cleanupOldData(true)" style="
                    background: ${sizeInMB > 5 ? '#f8f9fa' : 'transparent'};
                    border: 1px solid ${sizeInMB > 5 ? '#667eea' : 'transparent'};
                    padding: 5px 10px;
                    border-radius: 5px;
                    color: ${sizeInMB > 5 ? '#667eea' : '#7f8c8d'};
                    cursor: pointer;
                    font-size: 0.85em;
                    transition: all 0.2s ease;
                ">
                    <i class="fas fa-trash-alt"></i> Clean Old Data
                </button>
            </div>
        `;

        container.insertAdjacentHTML('afterbegin', indicatorHTML);
    }

    cleanupOldData(forceCleanup = false) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            let cleanupCount = 0;
            
            const originalActivityCount = this.activities.length;
            this.activities = this.activities.filter(activity => {
                const activityDate = new Date(activity.timestamp);
                if (activityDate < thirtyDaysAgo) {
                    cleanupCount++;
                    return false;
                }
                return true;
            });
            
            const originalAlertsCount = this.alerts.length;
            this.alerts = this.alerts.filter(alert => {
                const alertDate = new Date(alert.timestamp);
                if (alertDate < thirtyDaysAgo) {
                    cleanupCount++;
                    return false;
                }
                return true;
            });
            
            const originalBreaksCount = this.breaks.length;
            this.breaks = this.breaks.filter(breakItem => {
                const breakDate = new Date(breakItem.timestamp);
                if (breakDate < thirtyDaysAgo) {
                    cleanupCount++;
                    return false;
                }
                return true;
            });
            
            this.saveData();
            
            if (cleanupCount > 0) {
                const message = `Cleaned up ${cleanupCount} old items (older than 30 days)`;
                this.showNotification(message, 'success');
                this.updateStats();
                this.renderAllCharts();
                this.renderHistory();
                this.checkStorageQuota(); 
            } else if (forceCleanup) {
                this.showNotification('No old data to clean up', 'info');
            }
        } catch (e) {
            console.error('Cleanup failed:', e);
            this.showNotification('Failed to clean up old data', 'error');
        }
    }

    saveDataWithQuotaHandling(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                this.showNotification('Storage full! Attempting to clean up old data...', 'warning');
                this.cleanupOldData(true);
                
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                } catch (retryError) {
                    this.showNotification('Unable to save data even after cleanup. Please export and clear some data.', 'error');
                    this.promptDataExport();
                }
            } else {
                console.error('Error saving data:', e);
                this.showNotification('Error saving data', 'error');
            }
        }
    }

    promptDataExport() {
        const modal = document.createElement('div');
        modal.className = 'duration-warning-modal';
        modal.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ Storage Full</h3>
                <p>Your browser storage is full. To continue using the app, you need to free up space.</p>
                <p class="recommendation">💡 <strong>Recommendations:</strong></p>
                <ul>
                    <li>Export your data for backup</li>
                    <li>Clear old data manually</li>
                    <li>Use browser settings to clear site data</li>
                </ul>
                <div class="warning-actions">
                    <button class="cancel-btn" onclick="this.closest('.duration-warning-modal').remove()">Cancel</button>
                    <button class="confirm-btn" onclick="window.tracker.exportData(); this.closest('.duration-warning-modal').remove()">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    exportData() {
        const data = {
            profiles: this.profiles,
            activities: this.activities,
            breaks: this.breaks,
            alerts: this.alerts,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cognitive-saturation-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    loadProfileData() {
        const currentProfile = this.getCurrentProfile();
        if (!currentProfile) return;

        try {
            this.activities = JSON.parse(localStorage.getItem(`cognitiveActivities_${this.currentProfileId}`)) || [];
            this.breaks = JSON.parse(localStorage.getItem(`cognitiveBreaks_${this.currentProfileId}`)) || [];
            this.alerts = JSON.parse(localStorage.getItem(`cognitiveAlerts_${this.currentProfileId}`)) || [];
        } catch (e) {
            console.error('Error loading data:', e);
            this.activities = [];
            this.breaks = [];
            this.alerts = [];
            this.showNotification('Error loading saved data', 'error');
        }
        
        currentProfile.lastActive = new Date().toISOString();
        localStorage.setItem('cognitiveProfiles', JSON.stringify(this.profiles));
    }

    getCurrentProfile() {
        return this.profiles.find(p => p.id === this.currentProfileId);
    }

    init() {
        this.createProfileSelector();
        this.createChartControls();
        this.updateSaturationLevel();
        this.updateStats();
        this.renderAllCharts();
        this.renderHistory();
        this.checkAlerts();
        this.initSoundSettings();
        this.checkStorageQuota(); // Check quota on init
    }

    createChartControls() {
        const chartSection = document.querySelector('.chart-section');
        if (!chartSection) return;

        if (document.getElementById('chartControls')) return;

        const controlsHTML = `
            <div class="chart-controls" id="chartControls" style="
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                justify-content: center;
            ">
                <button class="chart-type-btn active" data-chart="line" onclick="window.tracker.switchChartType('line')">
                    <i class="fas fa-chart-line"></i> Trend Line
                </button>
                <button class="chart-type-btn" data-chart="pie" onclick="window.tracker.switchChartType('pie')">
                    <i class="fas fa-chart-pie"></i> Activity Distribution
                </button>
                <button class="chart-type-btn" data-chart="heatmap" onclick="window.tracker.switchChartType('heatmap')">
                    <i class="fas fa-th"></i> Heat Map
                </button>
            </div>
            <div class="chart-container" style="position: relative; height: 300px; width: 100%;">
                <canvas id="mainChart"></canvas>
            </div>
        `;

        const existingCanvas = document.getElementById('saturationChart');
        if (existingCanvas) {
            existingCanvas.style.display = 'none';
        }

        chartSection.insertAdjacentHTML('afterbegin', controlsHTML);
    }

    switchChartType(type) {
        this.currentChartType = type;
        
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.chart === type) {
                btn.classList.add('active');
            }
        });

        this.renderAllCharts();
    }

    renderAllCharts() {
        switch(this.currentChartType) {
            case 'line':
                this.renderLineChart();
                break;
            case 'pie':
                this.renderPieChart();
                break;
            case 'heatmap':
                this.renderHeatMap();
                break;
        }
    }

    renderLineChart() {
        const ctx = document.getElementById('mainChart').getContext('2d');

        const dates = [];
        const loads = [];
        const breaks = [];
        const todayUTC = this.getUTCDateString();

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateUTC = this.getUTCDateString(date);

            dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            const dayActivities = this.activities.filter(activity =>
                this.getUTCDateString(new Date(activity.timestamp)) === dateUTC
            );
            const dayLoad = dayActivities.reduce((sum, activity) => sum + activity.cognitiveLoad, 0);
            loads.push(dayLoad);

            const dayBreaks = this.breaks.filter(breakItem =>
                this.getUTCDateString(new Date(breakItem.timestamp)) === dateUTC
            );
            breaks.push(dayBreaks.length);
        }

        if (this.lineChart) {
            this.lineChart.destroy();
        }

        this.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Cognitive Load',
                    data: loads,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y',
                    fill: true
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
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Cognitive Load Trends (Last 7 Days - UTC)',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.dataset.label === 'Cognitive Load') {
                                    label += Math.round(context.raw);
                                } else {
                                    label += context.raw;
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        onClick: (e, legendItem, legend) => {
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;
                            const meta = ci.getDatasetMeta(index);
                            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                            ci.update();
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
                            text: 'Cognitive Load'
                        },
                        beginAtZero: true
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
                        beginAtZero: true,
                        max: Math.max(...breaks, 5)
                    }
                }
            }
        });
    }

    renderPieChart() {
        const ctx = document.getElementById('mainChart').getContext('2d');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoUTC = this.getUTCDateString(thirtyDaysAgo);

        const recentActivities = this.activities.filter(activity => {
            const activityDateUTC = this.getUTCDateString(new Date(activity.timestamp));
            return activityDateUTC >= thirtyDaysAgoUTC;
        });

        const activityTypes = {};
        const activityColors = {
            'reading': '#4285F4',
            'writing': '#EA4335',
            'problem-solving': '#FBBC05',
            'decision-making': '#34A853',
            'learning': '#FF6D00',
            'multitasking': '#AA00FF',
            'meetings': '#00BCD4',
            'other': '#9E9E9E'
        };

        recentActivities.forEach(activity => {
            const type = activity.type;
            if (!activityTypes[type]) {
                activityTypes[type] = {
                    count: 0,
                    totalLoad: 0,
                    totalDuration: 0
                };
            }
            activityTypes[type].count++;
            activityTypes[type].totalLoad += activity.cognitiveLoad;
            activityTypes[type].totalDuration += activity.duration;
        });

        const labels = [];
        const data = [];
        const backgroundColors = [];
        const tooltipData = [];

        Object.keys(activityTypes).forEach(type => {
            labels.push(this.formatActivityType(type));
            data.push(activityTypes[type].totalLoad);
            backgroundColors.push(activityColors[type] || '#667eea');
            
            tooltipData.push({
                count: activityTypes[type].count,
                duration: activityTypes[type].totalDuration,
                avgLoad: Math.round(activityTypes[type].totalLoad / activityTypes[type].count)
            });
        });

        if (this.pieChart) {
            this.pieChart.destroy();
        }

        this.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: 'white',
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Activity Distribution by Cognitive Load (Last 30 Days - UTC)',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            generateLabels: (chart) => {
                                const datasets = chart.data.datasets;
                                return chart.data.labels.map((label, i) => ({
                                    text: `${label} (${Math.round(datasets[0].data[i])} load)`,
                                    fillStyle: datasets[0].backgroundColor[i],
                                    strokeStyle: datasets[0].borderColor,
                                    lineWidth: 2,
                                    hidden: false,
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                const extra = tooltipData[context.dataIndex] || {};
                                return [
                                    `${label}: ${Math.round(value)} total load (${percentage}%)`,
                                    `📊 Activities: ${extra.count}`,
                                    `⏱️ Total Duration: ${extra.duration} min`,
                                    `📈 Avg Load: ${extra.avgLoad}`
                                ];
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });

        this.pieChart.canvas.onclick = (event) => {
            const activePoints = this.pieChart.getElementsAtEvent(event);
            if (activePoints[0]) {
                const chartData = activePoints[0]._chart.data;
                const idx = activePoints[0].index;
                const activityType = chartData.labels[idx];
                this.filterHistoryByActivity(activityType);
            }
        };
    }

    renderHeatMap() {
        const ctx = document.getElementById('mainChart').getContext('2d');

        const weeks = 4;
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hours = Array.from({ length: 12 }, (_, i) => `${i+8}:00`); // 8 AM to 7 PM

        const heatData = [];
        const backgrounds = [];
        
        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < 7; day++) {
                for (let hour = 0; hour < 12; hour++) {
                    const date = new Date();
                    date.setDate(date.getDate() - (weeks - week - 1) * 7 - (6 - day));
                    date.setHours(hour + 8, 0, 0, 0);

                    const hourActivities = this.activities.filter(activity => {
                        const activityDate = new Date(activity.timestamp);
                        return this.isSameUTCDay(activityDate, date) &&
                               activityDate.getUTCHours() === (hour + 8);
                    });

                    const totalLoad = hourActivities.reduce((sum, a) => sum + a.cognitiveLoad, 0);
                    heatData.push(totalLoad);

                    if (totalLoad === 0) {
                        backgrounds.push('#f5f5f5');
                    } else if (totalLoad < 100) {
                        backgrounds.push('#c6e0ff');
                    } else if (totalLoad < 250) {
                        backgrounds.push('#90c2ff');
                    } else if (totalLoad < 500) {
                        backgrounds.push('#5a9eff');
                    } else {
                        backgrounds.push('#ff6b6b');
                    }
                }
            }
        }

        if (this.heatMapChart) {
            this.heatMapChart.destroy();
        }

        this.heatMapChart = new Chart(ctx, {
            type: 'matrix',
            data: {
                datasets: [{
                    label: 'Cognitive Load Heat Map',
                    data: heatData.map((value, index) => {
                        const week = Math.floor(index / (7 * 12));
                        const day = Math.floor((index % (7 * 12)) / 12);
                        const hour = index % 12;
                        return {
                            x: day,
                            y: week * 12 + hour,
                            v: value
                        };
                    }),
                    backgroundColor: (ctx) => {
                        const value = ctx.dataset.data[ctx.dataIndex].v;
                        if (value === 0) return '#f5f5f5';
                        if (value < 100) return '#c6e0ff';
                        if (value < 250) return '#90c2ff';
                        if (value < 500) return '#5a9eff';
                        return '#ff6b6b';
                    },
                    borderColor: 'white',
                    borderWidth: 1,
                    width: ({ chart }) => (chart.chartArea || {}).width / 7 - 1,
                    height: ({ chart }) => (chart.chartArea || {}).height / 48 - 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Peak Cognitive Hours Heat Map (Last 4 Weeks - UTC)',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const point = context[0].raw;
                                const week = Math.floor(point.y / 12);
                                const hour = point.y % 12;
                                const day = point.x;
                                
                                const date = new Date();
                                date.setDate(date.getDate() - (4 - week - 1) * 7 - (6 - day));
                                
                                return `${date.toLocaleDateString()} - ${hours[hour]} UTC`;
                            },
                            label: (context) => {
                                const value = context.raw.v;
                                return value > 0 ? `Cognitive Load: ${Math.round(value)}` : 'No activity';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        labels: days,
                        position: 'top',
                        offset: true,
                        grid: { display: false },
                        ticks: { display: true }
                    },
                    y: {
                        type: 'category',
                        labels: [...hours, ...hours, ...hours, ...hours],
                        position: 'left',
                        offset: true,
                        grid: { display: false },
                        ticks: { 
                            display: true,
                            callback: (value, index) => {
                                if (index < 12) return hours[index];
                                if (index >= 12 && index < 24) return hours[index - 12];
                                if (index >= 24 && index < 36) return hours[index - 24];
                                if (index >= 36) return hours[index - 36];
                                return '';
                            }
                        }
                    }
                }
            }
        });

        this.addHeatMapLegend();
    }

    addHeatMapLegend() {
        const chartContainer = document.querySelector('.chart-container');
        
        const existingLegend = document.getElementById('heatMapLegend');
        if (existingLegend) {
            existingLegend.remove();
        }

        const legendHTML = `
            <div id="heatMapLegend" style="
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 8px;
                flex-wrap: wrap;
            ">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 20px; height: 20px; background: #f5f5f5; border-radius: 4px;"></div>
                    <span>No Activity</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 20px; height: 20px; background: #c6e0ff; border-radius: 4px;"></div>
                    <span>Low (&lt;100)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 20px; height: 20px; background: #90c2ff; border-radius: 4px;"></div>
                    <span>Moderate (100-250)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 20px; height: 20px; background: #5a9eff; border-radius: 4px;"></div>
                    <span>High (250-500)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 20px; height: 20px; background: #ff6b6b; border-radius: 4px;"></div>
                    <span>Very High (&gt;500)</span>
                </div>
            </div>
        `;

        chartContainer.insertAdjacentHTML('afterend', legendHTML);
    }

    filterHistoryByActivity(activityType) {
        const historyContainer = document.getElementById('activityHistory');
        const filteredActivities = this.activities
            .filter(activity => this.formatActivityType(activity.type) === activityType)
            .slice(-10)
            .reverse();

        if (filteredActivities.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter"></i>
                    <h3>No ${activityType} Activities Found</h3>
                    <p>There are no activities of type "${activityType}" in your history.</p>
                    <button class="log-btn" onclick="window.tracker.clearFilter()">
                        <i class="fas fa-times"></i> Clear Filter
                    </button>
                </div>
            `;
        } else {
            historyContainer.innerHTML = filteredActivities.map(activity => {
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
                    </div>
                </div>
            `}).join('');

            historyContainer.insertAdjacentHTML('beforebegin', `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="color: #667eea; font-weight: 600;">
                        <i class="fas fa-filter"></i> Filtered by: ${activityType}
                    </span>
                    <button class="clear-filter-btn" onclick="window.tracker.clearFilter()" style="
                        background: none;
                        border: 1px solid #667eea;
                        color: #667eea;
                        padding: 5px 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 0.9em;
                    ">
                        <i class="fas fa-times"></i> Clear Filter
                    </button>
                </div>
            `);
        }
    }

    clearFilter() {
        this.renderHistory();
        
        const filterUI = document.querySelector('.history-section > div:first-child');
        if (filterUI && filterUI.querySelector('.clear-filter-btn')) {
            filterUI.remove();
        }
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
        this.renderAllCharts();
        this.renderHistory();
        this.checkAlerts();
        this.checkStorageQuota(); 

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
        this.renderAllCharts();
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
        const todayUTC = this.getUTCDateString();
        
        const todayActivities = this.activities.filter(activity =>
            this.getUTCDateString(new Date(activity.timestamp)) === todayUTC
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
        const todayUTC = this.getUTCDateString();

        const todayActivities = this.activities.filter(activity =>
            this.getUTCDateString(new Date(activity.timestamp)) === todayUTC
        );
        const todayLoad = todayActivities.reduce((sum, activity) => sum + activity.cognitiveLoad, 0);
        document.getElementById('todayLoad').textContent = Math.round(todayLoad);

        // Weekly average
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoUTC = this.getUTCDateString(weekAgo);
        
        const weekActivities = this.activities.filter(activity => {
            const activityDateUTC = this.getUTCDateString(new Date(activity.timestamp));
            return activityDateUTC >= weekAgoUTC;
        });
        const weeklyAvg = weekActivities.length > 0 ?
            weekActivities.reduce((sum, activity) => sum + activity.cognitiveLoad, 0) / 7 : 0;
        document.getElementById('weeklyAvg').textContent = Math.round(weeklyAvg);

        // Alerts today
        const todayAlerts = this.alerts.filter(alert =>
            this.getUTCDateString(new Date(alert.timestamp)) === todayUTC
        );
        document.getElementById('alertsToday').textContent = todayAlerts.length;

        const todayBreaks = this.breaks.filter(breakItem =>
            this.getUTCDateString(new Date(breakItem.timestamp)) === todayUTC
        );
        const highSaturationPeriods = todayActivities.filter(activity => activity.cognitiveLoad > 100).length;
        const breakEfficiency = highSaturationPeriods > 0 ?
            Math.min(todayBreaks.length / highSaturationPeriods * 100, 100) : 100;
        document.getElementById('breakEfficiency').textContent = Math.round(breakEfficiency) + '%';
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
                        <span class="activity-time">${new Date(activity.timestamp).toLocaleString()} UTC</span>
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
        
        this.saveDataWithQuotaHandling(`cognitiveActivities_${this.currentProfileId}`, this.activities);
        this.saveDataWithQuotaHandling(`cognitiveBreaks_${this.currentProfileId}`, this.breaks);
        this.saveDataWithQuotaHandling(`cognitiveAlerts_${this.currentProfileId}`, this.alerts);
        
        this.checkStorageQuota();
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