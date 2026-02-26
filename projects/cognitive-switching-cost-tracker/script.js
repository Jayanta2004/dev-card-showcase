// Cognitive Switching Cost Tracker

class CognitiveSwitchTracker {
    constructor() {
        this.switches = JSON.parse(localStorage.getItem('cognitive-switches')) || [];
        this.currentTask = localStorage.getItem('current-task') || null;
        this.AVERAGE_SWITCH_COST = 25; // minutes based on research
        this.importedData = null;
        this.categoryColors = {
            'Development': '#4a90e2',
            'Meetings': '#e74c3c',
            'Email': '#f39c12',
            'Planning': '#27ae60',
            'Research': '#9b59b6',
            'Admin': '#1abc9c',
            'Creative': '#e67e22',
            'Other': '#95a5a6'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupModalEventListeners();
        this.setupImportExportListeners();
        this.updateUI();
        this.renderCharts();
        this.renderFlowAnalysis();
        this.displayRecentSwitches();
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

    exportData() {
        if (this.switches.length === 0) {
            this.showNotification('No data to export!', 'error');
            return;
        }

        const exportData = {
            switches: this.switches,
            currentTask: this.currentTask,
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

        this.saveData();
        this.destroyCharts();
        this.updateUI();
        this.renderCharts();
        this.renderFlowAnalysis();
        this.displayRecentSwitches();
        this.showNotification(`Successfully imported ${newSwitches.length} new records!`, 'success');
        this.importedData = null;
    }

    setupModalEventListeners() {
        const modal = document.getElementById('confirm-modal');
        const importModal = document.getElementById('import-confirm-modal');
        const cancelBtn = document.getElementById('modal-cancel');
        const confirmBtn = document.getElementById('modal-confirm');
        const importCancel = document.getElementById('import-cancel');
        const importConfirm = document.getElementById('import-confirm');

        cancelBtn.addEventListener('click', () => {
            this.hideConfirmationModal();
        });

        confirmBtn.addEventListener('click', () => {
            this.clearAllData();
            this.hideConfirmationModal();
        });

        importCancel.addEventListener('click', () => {
            this.hideImportModal();
        });

        importConfirm.addEventListener('click', () => {
            this.importData();
            this.hideImportModal();
        });

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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modal.classList.contains('show')) {
                    this.hideConfirmationModal();
                }
                if (importModal.classList.contains('show')) {
                    this.hideImportModal();
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

    hideImportModal() {
        const modal = document.getElementById('import-confirm-modal');
        modal.classList.remove('show');
        this.importedData = null;
    }

    clearAllData() {
        localStorage.removeItem('cognitive-switches');
        localStorage.removeItem('current-task');
        
        this.switches = [];
        this.currentTask = null;
        
        document.getElementById('task-switch-form').reset();
        document.getElementById('cognitive-load').value = 5;
        document.getElementById('cognitive-load-value').textContent = '5';
        
        this.destroyCharts();
        
        this.updateUI();
        this.renderCharts();
        this.renderFlowAnalysis();
        this.displayRecentSwitches();
        
        this.showNotification('All data has been cleared successfully!', 'success');
        
        this.resetInsights();
    }

    destroyCharts() {
        const charts = ['switch-frequency-chart', 'time-loss-chart', 'flow-sankey-chart', 'top-transitions-chart'];
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
        const cognitiveMultiplier = cognitiveLoad / 5; // Scale with cognitive load
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
            date: new Date().toDateString()
        };

        this.switches.unshift(switchData);
        this.currentTask = currentTaskInput;

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

        // Reset form
        document.getElementById('task-switch-form').reset();
        document.getElementById('cognitive-load').value = 5;
        document.getElementById('cognitive-load-value').textContent = '5';

        // Show success message
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
    }

    renderSwitchFrequencyChart() {
        const ctx = document.getElementById('switch-frequency-chart').getContext('2d');

        // Get data for last 7 days
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

        // Group by reason
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

        const nodes = new Set();
        Object.values(flows).forEach(f => {
            nodes.add(f.from);
            nodes.add(f.to);
        });

        const nodeArray = Array.from(nodes);
        
        const flowData = Object.values(flows).map(f => ({
            from: f.from,
            to: f.to,
            flow: f.count
        }));

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
            <div class="switch-item">
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
            </div>
        `).join('');
    }

    saveData() {
        localStorage.setItem('cognitive-switches', JSON.stringify(this.switches));
        localStorage.setItem('current-task', this.currentTask || '');
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