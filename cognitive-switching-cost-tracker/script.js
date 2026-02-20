// Cognitive Switching Cost Tracker

class CognitiveSwitchTracker {
    constructor() {
        this.switches = JSON.parse(localStorage.getItem('cognitive-switches')) || [];
        this.currentTask = localStorage.getItem('current-task') || null;
        this.AVERAGE_SWITCH_COST = 25; // minutes based on research

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.renderCharts();
        this.displayRecentSwitches();
    }

    setupEventListeners() {
        const form = document.getElementById('task-switch-form');
        const cognitiveLoadSlider = document.getElementById('cognitive-load');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.logTaskSwitch();
        });

        cognitiveLoadSlider.addEventListener('input', (e) => {
            document.getElementById('cognitive-load-value').textContent = e.target.value;
        });
    }

    logTaskSwitch() {
        const previousTask = document.getElementById('previous-task').value.trim();
        const currentTaskInput = document.getElementById('current-task-input').value.trim();
        const reason = document.getElementById('switch-reason').value;
        const cognitiveLoad = parseInt(document.getElementById('cognitive-load').value);

        if (!previousTask || !currentTaskInput || !reason) {
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
            currentTask: currentTaskInput,
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
        this.renderCharts();
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
                <div class="tasks">${switchItem.previousTask} → ${switchItem.currentTask}</div>
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
        // Simple notification - could be enhanced with a proper notification system
        const notification = document.createElement('div');
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
            z-index: 1000;
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