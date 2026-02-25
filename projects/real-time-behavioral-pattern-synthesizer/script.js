// Real-Time Behavioral Pattern Synthesizer

class BehavioralPatternSynthesizer {
    constructor() {
        this.isActive = false;
        this.startTime = null;
        this.data = {
            mouseMoves: [],
            clicks: [],
            scrolls: [],
            keypresses: [],
            attentionSpans: [],
            patterns: {}
        };

        this.charts = {};
        this.currentAttentionStart = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCharts();
        this.setupControls();
    }

    setupEventListeners() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            if (this.isActive) {
                this.trackMouseMove(e);
            }
        });

        // Click tracking
        document.addEventListener('click', (e) => {
            if (this.isActive) {
                this.trackClick(e);
            }
        });

        // Scroll tracking
        document.addEventListener('scroll', () => {
            if (this.isActive) {
                this.trackScroll();
            }
        });

        // Keyboard tracking
        document.addEventListener('keydown', (e) => {
            if (this.isActive) {
                this.trackKeypress(e);
            }
        });

        // Attention span tracking (mouse movement indicates attention)
        document.addEventListener('mousemove', () => {
            if (this.isActive) {
                this.updateAttentionSpan();
            }
        });

        // Target interactions
        document.querySelectorAll('.target').forEach(target => {
            target.addEventListener('click', () => {
                if (this.isActive) {
                    this.trackTargetInteraction(target.id);
                }
            });
        });

        // Typing area
        document.getElementById('typingArea').addEventListener('input', (e) => {
            if (this.isActive) {
                this.trackTyping(e);
            }
        });
    }

    setupCharts() {
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        const patternCtx = document.getElementById('patternChart').getContext('2d');

        this.charts.activity = new Chart(activityCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Mouse Movements',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Clicks',
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        this.charts.patterns = new Chart(patternCtx, {
            type: 'radar',
            data: {
                labels: ['Exploration', 'Precision', 'Speed', 'Consistency', 'Focus'],
                datasets: [{
                    label: 'Behavioral Patterns',
                    data: [0, 0, 0, 0, 0],
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    pointBackgroundColor: '#FF9800'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    setupControls() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('exportBtn').addEventListener('click', () => this.export());
    }

    start() {
        this.isActive = true;
        this.startTime = Date.now();
        this.currentAttentionStart = Date.now();

        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;

        this.updateInsights('Analysis started. Begin interacting to generate behavioral data...');
    }

    stop() {
        this.isActive = false;

        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;

        this.analyzePatterns();
        this.updateInsights('Analysis stopped. Patterns have been synthesized.');
    }

    reset() {
        this.data = {
            mouseMoves: [],
            clicks: [],
            scrolls: [],
            keypresses: [],
            attentionSpans: [],
            patterns: {}
        };

        this.updateStats();
        this.resetCharts();
        this.updateInsights('Data reset. Ready to start new analysis.');
    }

    export() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `behavioral-patterns-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    trackMouseMove(e) {
        const timestamp = Date.now();
        this.data.mouseMoves.push({
            x: e.clientX,
            y: e.clientY,
            timestamp
        });

        this.updateStats();
        this.updateCharts();
    }

    trackClick(e) {
        const timestamp = Date.now();
        this.data.clicks.push({
            x: e.clientX,
            y: e.clientY,
            target: e.target.tagName,
            timestamp
        });

        this.updateStats();
        this.updateCharts();
    }

    trackScroll() {
        const timestamp = Date.now();
        this.data.scrolls.push({
            scrollY: window.scrollY,
            timestamp
        });

        this.updateStats();
    }

    trackKeypress(e) {
        const timestamp = Date.now();
        this.data.keypresses.push({
            key: e.key,
            timestamp
        });
    }

    trackTargetInteraction(targetId) {
        if (!this.data.patterns.targets) {
            this.data.patterns.targets = {};
        }
        this.data.patterns.targets[targetId] = (this.data.patterns.targets[targetId] || 0) + 1;
    }

    trackTyping(e) {
        const text = e.target.value;
        const words = text.trim().split(/\s+/).length;
        this.data.patterns.typingSpeed = words / ((Date.now() - this.startTime) / 60000); // words per minute
    }

    updateAttentionSpan() {
        if (this.currentAttentionStart) {
            const currentSpan = Date.now() - this.currentAttentionStart;
            this.data.attentionSpans.push(currentSpan);
        }
        this.currentAttentionStart = Date.now();
        this.updateStats();
    }

    updateStats() {
        document.getElementById('mouseMoves').textContent = this.data.mouseMoves.length;
        document.getElementById('clicks').textContent = this.data.clicks.length;
        document.getElementById('scrolls').textContent = this.data.scrolls.length;

        const avgAttention = this.data.attentionSpans.length > 0
            ? Math.round(this.data.attentionSpans.reduce((a, b) => a + b, 0) / this.data.attentionSpans.length / 1000)
            : 0;
        document.getElementById('attentionSpan').textContent = `${avgAttention}s`;
    }

    updateCharts() {
        // Update activity chart with recent data
        const timeLabels = [];
        const mouseData = [];
        const clickData = [];

        const now = Date.now();
        const windowSize = 60000; // 1 minute window

        // Group data by time intervals
        for (let i = 0; i < 60; i++) {
            const timePoint = now - (59 - i) * 1000;
            timeLabels.push(new Date(timePoint).toLocaleTimeString());

            const mouseCount = this.data.mouseMoves.filter(m => Math.abs(m.timestamp - timePoint) < 1000).length;
            const clickCount = this.data.clicks.filter(c => Math.abs(c.timestamp - timePoint) < 1000).length;

            mouseData.push(mouseCount);
            clickData.push(clickCount);
        }

        this.charts.activity.data.labels = timeLabels;
        this.charts.activity.data.datasets[0].data = mouseData;
        this.charts.activity.data.datasets[1].data = clickData;
        this.charts.activity.update();
    }

    resetCharts() {
        this.charts.activity.data.labels = [];
        this.charts.activity.data.datasets[0].data = [];
        this.charts.activity.data.datasets[1].data = [];
        this.charts.activity.update();

        this.charts.patterns.data.datasets[0].data = [0, 0, 0, 0, 0];
        this.charts.patterns.update();
    }

    analyzePatterns() {
        // Calculate behavioral patterns
        const patterns = {
            exploration: this.calculateExploration(),
            precision: this.calculatePrecision(),
            speed: this.calculateSpeed(),
            consistency: this.calculateConsistency(),
            focus: this.calculateFocus()
        };

        this.data.patterns = patterns;

        // Update pattern chart
        this.charts.patterns.data.datasets[0].data = [
            patterns.exploration,
            patterns.precision,
            patterns.speed,
            patterns.consistency,
            patterns.focus
        ];
        this.charts.patterns.update();

        this.updateInsights(this.generateInsights(patterns));
    }

    calculateExploration() {
        // Based on mouse movement coverage and target interactions
        const mouseCoverage = this.data.mouseMoves.length > 0 ? Math.min(100, this.data.mouseMoves.length / 10) : 0;
        const targetInteractions = Object.keys(this.data.patterns.targets || {}).length * 20;
        return Math.min(100, mouseCoverage + targetInteractions);
    }

    calculatePrecision() {
        // Based on click accuracy and typing accuracy
        const clickPrecision = this.data.clicks.length > 0 ? Math.min(100, 100 - (this.data.clicks.length / this.data.mouseMoves.length) * 100) : 0;
        return clickPrecision;
    }

    calculateSpeed() {
        // Based on mouse movement speed and typing speed
        const mouseSpeed = this.data.mouseMoves.length > 0 ? Math.min(100, this.data.mouseMoves.length / 5) : 0;
        const typingSpeed = this.data.patterns.typingSpeed || 0;
        return Math.min(100, mouseSpeed + typingSpeed);
    }

    calculateConsistency() {
        // Based on regularity of interactions
        const intervals = [];
        for (let i = 1; i < this.data.mouseMoves.length; i++) {
            intervals.push(this.data.mouseMoves[i].timestamp - this.data.mouseMoves[i-1].timestamp);
        }

        if (intervals.length < 2) return 0;

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        const consistency = Math.max(0, 100 - (Math.sqrt(variance) / avgInterval) * 100);

        return consistency;
    }

    calculateFocus() {
        // Based on attention span and scroll behavior
        const avgAttention = this.data.attentionSpans.length > 0
            ? this.data.attentionSpans.reduce((a, b) => a + b, 0) / this.data.attentionSpans.length
            : 0;
        const focusScore = Math.min(100, avgAttention / 1000); // Convert to seconds, cap at 100
        return focusScore;
    }

    generateInsights(patterns) {
        let insights = '<h4>Behavioral Analysis Results:</h4><ul>';

        if (patterns.exploration > 70) {
            insights += '<li>🌍 High exploration tendency - you actively seek out new information</li>';
        } else if (patterns.exploration < 30) {
            insights += '<li>🎯 Focused exploration - you prefer targeted interactions</li>';
        }

        if (patterns.precision > 70) {
            insights += '<li>🎯 High precision - you make deliberate, accurate interactions</li>';
        } else if (patterns.precision < 30) {
            insights += '<li>⚡ Quick interactions - you prefer speed over precision</li>';
        }

        if (patterns.speed > 70) {
            insights += '<li>🚀 Fast-paced behavior - you process information quickly</li>';
        } else if (patterns.speed < 30) {
            insights += '<li>🐌 Methodical approach - you take time to process information</li>';
        }

        if (patterns.consistency > 70) {
            insights += '<li>📊 Consistent patterns - your behavior follows predictable rhythms</li>';
        } else if (patterns.consistency < 30) {
            insights += '<li>🎲 Variable patterns - your behavior is highly dynamic</li>';
        }

        if (patterns.focus > 70) {
            insights += '<li>🎯 Strong focus - you maintain attention well</li>';
        } else if (patterns.focus < 30) {
            insights += '<li>🌊 Distracted tendencies - attention shifts frequently</li>';
        }

        insights += '</ul>';
        return insights;
    }

    updateInsights(content) {
        document.getElementById('insights').innerHTML = content;
    }
}

// Initialize the synthesizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BehavioralPatternSynthesizer();
});