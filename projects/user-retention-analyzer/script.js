// User Retention Analyzer - Interactive JavaScript Implementation

class UserRetentionAnalyzer {
    constructor() {
        this.retentionData = this.generateInitialData();
        this.charts = {};
        this.intervals = {};
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.updateDashboard();
    }

    generateInitialData() {
        return {
            retention: {
                '7d': { rate: 87.3, churn: 12.7, sessions: 24.5 },
                '30d': { rate: 82.1, churn: 17.9, sessions: 28.3 },
                '90d': { rate: 76.8, churn: 23.2, sessions: 32.1 }
            },
            cohorts: {
                'new-users': { size: 2847, retention: 85 },
                'power-users': { size: 1234, retention: 92 },
                'casual-users': { size: 5621, retention: 67 }
            },
            churnRisk: {
                high: 342,
                medium: 1247,
                low: 7113
            },
            behavior: {
                dau: 8432,
                frequency: 4.2,
                adoption: 73,
                ttfv: 2.3
            },
            segments: {
                champions: 2341,
                regulars: 4127,
                casuals: 2891,
                atRisk: 641
            }
        };
    }

    setupEventListeners() {
        // Time period selector
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateRetentionMetrics(e.target.dataset.period);
            });
        });

        // Pattern controls
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateBehaviorPatterns(e.target.dataset.pattern);
            });
        });

        // Risk filter
        document.getElementById('risk-filter').addEventListener('change', (e) => {
            this.filterChurnRisk(e.target.value);
        });

        // Control buttons
        document.getElementById('run-analysis').addEventListener('click', () => {
            this.runAnalysis();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('reset-metrics').addEventListener('click', () => {
            this.resetMetrics();
        });

        document.getElementById('refresh-cohorts').addEventListener('click', () => {
            this.refreshCohorts();
        });

        document.getElementById('generate-strategies').addEventListener('click', () => {
            this.generateStrategies();
        });
    }

    initializeCharts() {
        this.initializeRetentionChart();
        this.initializeBehaviorHeatmap();
        this.initializeSegmentationChart();
    }

    initializeRetentionChart() {
        const canvas = document.getElementById('retention-chart');
        const ctx = canvas.getContext('2d');
        this.charts.retention = { canvas, ctx };

        this.drawRetentionChart();
    }

    drawRetentionChart() {
        const { ctx, canvas } = this.charts.retention;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Sample retention data points
        const data = [65, 72, 78, 82, 85, 87, 88, 89, 90, 91];
        const points = data.map((value, index) => ({
            x: (width / (data.length - 1)) * index,
            y: height - (value / 100) * height
        }));

        // Draw line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#6366f1';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    initializeBehaviorHeatmap() {
        const canvas = document.getElementById('behavior-heatmap');
        const ctx = canvas.getContext('2d');
        this.charts.behavior = { canvas, ctx };

        this.drawBehaviorHeatmap();
    }

    drawBehaviorHeatmap() {
        const { ctx, canvas } = this.charts.behavior;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate heatmap data (7 days x 24 hours)
        const data = [];
        for (let day = 0; day < 7; day++) {
            data[day] = [];
            for (let hour = 0; hour < 24; hour++) {
                // Simulate user activity patterns
                const baseActivity = Math.sin((hour - 6) * Math.PI / 12) * 0.5 + 0.5;
                const dayVariation = Math.random() * 0.3 + 0.7;
                data[day][hour] = baseActivity * dayVariation;
            }
        }

        const cellWidth = width / 24;
        const cellHeight = height / 7;

        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                const intensity = data[day][hour];
                const alpha = Math.min(intensity * 0.8 + 0.2, 1);

                ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
                ctx.fillRect(hour * cellWidth, day * cellHeight, cellWidth, cellHeight);
            }
        }

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 24; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, 0);
            ctx.lineTo(i * cellWidth, height);
            ctx.stroke();
        }

        for (let i = 0; i <= 7; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellHeight);
            ctx.lineTo(width, i * cellHeight);
            ctx.stroke();
        }
    }

    initializeSegmentationChart() {
        const canvas = document.getElementById('segmentation-pie');
        const ctx = canvas.getContext('2d');
        this.charts.segmentation = { canvas, ctx };

        this.drawSegmentationChart();
    }

    drawSegmentationChart() {
        const { ctx, canvas } = this.charts.segmentation;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const segments = [
            { name: 'Champions', value: 23, color: '#4CAF50' },
            { name: 'Regulars', value: 41, color: '#2196F3' },
            { name: 'Casuals', value: 29, color: '#FF9800' },
            { name: 'At Risk', value: 7, color: '#F44336' }
        ];

        let startAngle = -Math.PI / 2;
        segments.forEach(segment => {
            const angle = (segment.value / 100) * Math.PI * 2;

            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();

            startAngle += angle;
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
    }

    updateRetentionMetrics(period) {
        const data = this.retentionData.retention[period];
        document.getElementById('retention-rate').textContent = `${data.rate}%`;
        document.getElementById('churn-rate').textContent = `${data.churn}%`;
        document.getElementById('avg-session').textContent = `${data.sessions}m`;

        // Animate chart update
        this.animateChartUpdate();
    }

    updateBehaviorPatterns(pattern) {
        const patterns = {
            engagement: { dau: 8432, frequency: 4.2, adoption: 73, ttfv: 2.3 },
            usage: { dau: 7890, frequency: 3.8, adoption: 68, ttfv: 2.8 },
            features: { dau: 9123, frequency: 4.7, adoption: 81, ttfv: 1.9 }
        };

        const data = patterns[pattern];
        this.updateBehaviorMetrics(data);
        this.drawBehaviorHeatmap();
    }

    updateBehaviorMetrics(data) {
        const metrics = document.querySelectorAll('.pattern-metric');
        const values = [data.dau, data.frequency, data.adoption, data.ttfv];
        const labels = ['Daily Active Users', 'Session Frequency', 'Feature Adoption', 'Time to First Value'];
        const formats = ['n', '.1f', '%', '.1f'];
        const units = ['', '/day', '', ' days'];

        metrics.forEach((metric, index) => {
            const valueElement = metric.querySelector('.pattern-value');
            const trend = Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'negative' : 'neutral';
            const trendSymbol = trend === 'positive' ? '↗' : trend === 'negative' ? '↘' : '→';
            const change = Math.floor(Math.random() * 20) + 1;

            valueElement.textContent = `${values[index].toLocaleString()}${units[index]}`;
            metric.querySelector('.pattern-trend').textContent = `${trendSymbol} ${change}%`;
            metric.querySelector('.pattern-trend').className = `pattern-trend ${trend}`;
        });
    }

    filterChurnRisk(filter) {
        const predictions = document.querySelector('.churn-predictions');
        const items = predictions.querySelectorAll('.prediction-item');

        items.forEach(item => {
            const risk = item.querySelector('.prediction-risk');
            const isHigh = risk.classList.contains('high');
            const isMedium = risk.classList.contains('medium');

            if (filter === 'all') {
                item.style.display = 'block';
            } else if (filter === 'high' && isHigh) {
                item.style.display = 'block';
            } else if (filter === 'medium' && isMedium) {
                item.style.display = 'block';
            } else if (filter === 'low' && !isHigh && !isMedium) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    runAnalysis() {
        const btn = document.getElementById('run-analysis');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        btn.disabled = true;

        setTimeout(() => {
            // Simulate analysis completion
            this.updateDashboard();
            btn.innerHTML = originalText;
            btn.disabled = false;

            // Show success message
            this.showNotification('Analysis completed successfully!', 'success');
        }, 2000);
    }

    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            retention: this.retentionData.retention,
            cohorts: this.retentionData.cohorts,
            churnRisk: this.retentionData.churnRisk,
            behavior: this.retentionData.behavior,
            segments: this.retentionData.segments
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `retention-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    resetMetrics() {
        if (confirm('Are you sure you want to reset all metrics?')) {
            this.retentionData = this.generateInitialData();
            this.updateDashboard();
            this.showNotification('Metrics reset successfully!', 'info');
        }
    }

    refreshCohorts() {
        const btn = document.getElementById('refresh-cohorts');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

        setTimeout(() => {
            // Simulate cohort refresh
            Object.keys(this.retentionData.cohorts).forEach(cohort => {
                const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
                this.retentionData.cohorts[cohort].retention *= (1 + variation);
                this.retentionData.cohorts[cohort].retention = Math.max(0, Math.min(100, this.retentionData.cohorts[cohort].retention));
            });

            this.updateCohortsDisplay();
            btn.innerHTML = originalText;
            this.showNotification('Cohorts refreshed!', 'success');
        }, 1500);
    }

    generateStrategies() {
        const btn = document.getElementById('generate-strategies');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        setTimeout(() => {
            // Simulate strategy generation
            this.updateStrategiesDisplay();
            btn.innerHTML = originalText;
            this.showNotification('New strategies generated!', 'success');
        }, 2000);
    }

    updateCohortsDisplay() {
        Object.keys(this.retentionData.cohorts).forEach(cohort => {
            const data = this.retentionData.cohorts[cohort];
            const cohortElement = document.querySelector(`[data-cohort="${cohort}"]`);
            if (cohortElement) {
                const fill = cohortElement.querySelector('.retention-fill');
                const percentage = cohortElement.querySelector('.retention-percentage');

                fill.style.width = `${data.retention}%`;
                percentage.textContent = `${Math.round(data.retention)}%`;
            }
        });
    }

    updateStrategiesDisplay() {
        const strategies = [
            {
                name: 'Personalized Onboarding',
                priority: 'high',
                description: 'Implement AI-driven personalized onboarding flows based on user behavior patterns',
                impact: '+18% retention',
                cost: 'Medium'
            },
            {
                name: 'Proactive Support',
                priority: 'medium',
                description: 'Deploy predictive support system to identify and resolve issues before users churn',
                impact: '+12% retention',
                cost: 'High'
            },
            {
                name: 'Feature Gamification',
                priority: 'low',
                description: 'Add achievement systems and progress tracking to increase feature engagement',
                impact: '+7% retention',
                cost: 'Low'
            }
        ];

        const container = document.querySelector('.strategies-list');
        container.innerHTML = '';

        strategies.forEach(strategy => {
            const item = document.createElement('div');
            item.className = `strategy-item priority-${strategy.priority}`;
            item.innerHTML = `
                <div class="strategy-header">
                    <span class="strategy-name">${strategy.name}</span>
                    <span class="strategy-priority">${strategy.priority.charAt(0).toUpperCase() + strategy.priority.slice(1)} Priority</span>
                </div>
                <div class="strategy-description">${strategy.description}</div>
                <div class="strategy-impact">
                    <span>Expected Impact: ${strategy.impact}</span>
                    <span>Cost: ${strategy.cost}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateDashboard() {
        this.updateRetentionMetrics('7d');
        this.updateBehaviorPatterns('engagement');
        this.updateCohortsDisplay();
        this.drawRetentionChart();
        this.drawBehaviorHeatmap();
        this.drawSegmentationChart();
    }

    startRealTimeUpdates() {
        // Update last update time every minute
        this.intervals.updateTime = setInterval(() => {
            const now = new Date();
            document.querySelector('.last-update').textContent = `Updated ${Math.floor(Math.random() * 5) + 1} min ago`;
        }, 60000);

        // Simulate real-time data updates
        this.intervals.dataUpdate = setInterval(() => {
            // Small random variations in metrics
            Object.keys(this.retentionData.retention).forEach(period => {
                const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
                this.retentionData.retention[period].rate *= (1 + variation);
                this.retentionData.retention[period].rate = Math.max(0, Math.min(100, this.retentionData.retention[period].rate));
                this.retentionData.retention[period].churn = 100 - this.retentionData.retention[period].rate;
            });

            // Update active period if 7d is selected
            if (document.querySelector('.time-btn.active').dataset.period === '7d') {
                this.updateRetentionMetrics('7d');
            }
        }, 30000); // Update every 30 seconds
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    animateChartUpdate() {
        // Simple animation for chart updates
        const canvas = document.getElementById('retention-chart');
        canvas.style.transform = 'scale(0.95)';
        setTimeout(() => {
            canvas.style.transform = 'scale(1)';
        }, 150);
    }

    destroy() {
        // Clean up intervals
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
}

// Initialize the analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.retentionAnalyzer = new UserRetentionAnalyzer();
});

// Add notification styles dynamically
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    background: #10b981;
}

.notification.error {
    background: #ef4444;
}

.notification.info {
    background: #06b6d4;
}
`;

// Inject notification styles
const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);