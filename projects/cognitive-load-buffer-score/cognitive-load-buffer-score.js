// Cognitive Load Buffer Score - JavaScript
class CognitiveLoadTracker {
    constructor() {
        this.assessments = this.loadAssessments();
        this.charts = {};
        this.currentChartView = 'buffer-trend';
        this.currentTimeRange = 30;

        this.initializeEventListeners();
        this.initializeCharts();
        this.updateUI();
        this.generateInsights();
        this.setDefaultDateTime();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Form submission
        document.getElementById('cognitiveForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logAssessment();
        });

        // Chart controls
        document.getElementById('chartView').addEventListener('change', (e) => {
            this.currentChartView = e.target.value;
            this.updateChart();
        });

        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.currentTimeRange = parseInt(e.target.value);
            this.updateChart();
        });

        // Assessment filters
        document.getElementById('filterTaskType').addEventListener('change', () => this.filterAssessments());
        document.getElementById('filterBufferRange').addEventListener('change', () => this.filterAssessments());
        document.getElementById('sortBy').addEventListener('change', () => this.sortAssessments());
    }

    // Set default date and time
    setDefaultDateTime() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('assessmentDate').value = localDateTime;
    }

    // Log new assessment
    logAssessment() {
        const formData = this.getFormData();

        if (!this.validateForm(formData)) {
            return;
        }

        const assessment = {
            id: Date.now(),
            ...formData,
            timestamp: new Date().toISOString(),
            bufferScore: this.calculateBufferScore(formData),
            cognitiveLoad: this.calculateCognitiveLoad(formData),
            performanceIndex: formData.cognitivePerformance
        };

        this.assessments.unshift(assessment);
        this.saveAssessments();
        this.updateUI();
        this.updateChart();
        this.generateInsights();
        this.clearForm();
        this.showSuccessMessage('Cognitive assessment logged successfully!');
    }

    // Get form data
    getFormData() {
        const strategies = Array.from(document.querySelectorAll('input[name="strategies"]:checked'))
            .map(cb => cb.value);

        return {
            date: document.getElementById('assessmentDate').value,
            taskComplexity: parseInt(document.getElementById('taskComplexity').value),
            timePressure: parseInt(document.getElementById('timePressure').value),
            mentalFatigue: parseInt(document.getElementById('mentalFatigue').value),
            distractionLevel: parseInt(document.getElementById('distractionLevel').value),
            focusQuality: parseInt(document.getElementById('focusQuality').value),
            cognitivePerformance: parseInt(document.getElementById('cognitivePerformance').value),
            taskType: document.getElementById('taskType').value,
            notes: document.getElementById('cognitiveLoadNotes').value,
            recoveryStrategies: strategies
        };
    }

    // Validate form data
    validateForm(data) {
        const errors = [];

        if (!data.date) errors.push('Date is required');
        if (!data.taskType) errors.push('Task type is required');
        if (!data.notes.trim()) errors.push('Notes are required');

        // Validate scales
        const scales = ['taskComplexity', 'timePressure', 'mentalFatigue', 'distractionLevel', 'focusQuality', 'cognitivePerformance'];
        scales.forEach(scale => {
            if (!data[scale] || data[scale] < 1 || data[scale] > 10) {
                errors.push(`${scale.replace(/([A-Z])/g, ' $1').toLowerCase()} must be between 1-10`);
            }
        });

        if (errors.length > 0) {
            this.showErrorMessage('Please fix the following errors:\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    // Calculate buffer score (0-100)
    calculateBufferScore(assessment) {
        // Higher scores = better cognitive buffer capacity
        let score = 0;

        // Focus quality and cognitive performance are positive contributors
        score += assessment.focusQuality * 8;
        score += assessment.cognitivePerformance * 8;

        // Mental fatigue and distraction are negative contributors
        score -= assessment.mentalFatigue * 4;
        score -= assessment.distractionLevel * 4;

        // Task complexity and time pressure have moderate negative impact
        score -= assessment.taskComplexity * 2;
        score -= assessment.timePressure * 2;

        // Recovery strategies improve buffer capacity
        score += assessment.recoveryStrategies.length * 5;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Calculate cognitive load (1-10)
    calculateCognitiveLoad(assessment) {
        // Cognitive load is influenced by task demands and current state
        let load = 0;

        load += assessment.taskComplexity * 0.4;
        load += assessment.timePressure * 0.3;
        load += assessment.mentalFatigue * 0.2;
        load += assessment.distractionLevel * 0.1;

        return Math.max(1, Math.min(10, Math.round(load)));
    }

    // Initialize charts
    initializeCharts() {
        const ctx = document.getElementById('cognitiveChart').getContext('2d');
        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Buffer Score',
                    data: [],
                    borderColor: '#9c27b0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333333'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333333'
                        }
                    }
                }
            }
        });

        this.updateChart();
    }

    // Update chart based on current view and time range
    updateChart() {
        const filteredAssessments = this.getFilteredAssessments();
        const chartData = this.prepareChartData(filteredAssessments);

        this.charts.main.data.labels = chartData.labels;
        this.charts.main.data.datasets[0].data = chartData.data;
        this.charts.main.data.datasets[0].label = chartData.label;
        this.charts.main.update();
    }

    // Prepare chart data based on view type
    prepareChartData(assessments) {
        switch (this.currentChartView) {
            case 'buffer-trend':
                return this.prepareBufferTrendData(assessments);
            case 'load-performance':
                return this.prepareLoadPerformanceData(assessments);
            case 'fatigue-impact':
                return this.prepareFatigueImpactData(assessments);
            case 'task-performance':
                return this.prepareTaskPerformanceData(assessments);
            default:
                return this.prepareBufferTrendData(assessments);
        }
    }

    // Prepare buffer score trend data
    prepareBufferTrendData(assessments) {
        const sortedAssessments = assessments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const labels = sortedAssessments.map(a => new Date(a.timestamp).toLocaleDateString());
        const data = sortedAssessments.map(a => a.bufferScore);

        return { labels, data, label: 'Buffer Score' };
    }

    // Prepare load vs performance data
    prepareLoadPerformanceData(assessments) {
        if (assessments.length === 0) {
            return { labels: [], data: [], label: 'Performance vs Load' };
        }

        const sortedAssessments = assessments.sort((a, b) => a.cognitiveLoad - b.cognitiveLoad);
        const labels = sortedAssessments.map(a => `Load: ${a.cognitiveLoad}`);
        const data = sortedAssessments.map(a => a.performanceIndex);

        return { labels, data, label: 'Performance Index' };
    }

    // Prepare fatigue impact data
    prepareFatigueImpactData(assessments) {
        if (assessments.length === 0) {
            return { labels: [], data: [], label: 'Fatigue Impact' };
        }

        const fatigueGroups = {};
        assessments.forEach(assessment => {
            const fatigue = assessment.mentalFatigue;
            if (!fatigueGroups[fatigue]) {
                fatigueGroups[fatigue] = [];
            }
            fatigueGroups[fatigue].push(assessment.performanceIndex);
        });

        const labels = Object.keys(fatigueGroups).sort();
        const data = labels.map(fatigue => {
            const performances = fatigueGroups[fatigue];
            return performances.reduce((sum, p) => sum + p, 0) / performances.length;
        });

        return { labels: labels.map(l => `Fatigue ${l}`), data, label: 'Average Performance' };
    }

    // Prepare task performance data
    prepareTaskPerformanceData(assessments) {
        const taskGroups = {};
        assessments.forEach(assessment => {
            const task = assessment.taskType;
            if (!taskGroups[task]) {
                taskGroups[task] = [];
            }
            taskGroups[task].push(assessment.performanceIndex);
        });

        const labels = Object.keys(taskGroups).map(task => this.formatTaskType(task));
        const data = labels.map((_, index) => {
            const task = Object.keys(taskGroups)[index];
            const performances = taskGroups[task];
            return performances.reduce((sum, p) => sum + p, 0) / performances.length;
        });

        return { labels, data, label: 'Average Performance' };
    }

    // Update UI elements
    updateUI() {
        this.updateStats();
        this.updateAssessmentsList();
        this.updateCognitiveAlert();
    }

    // Update statistics
    updateStats() {
        const assessments = this.assessments;
        const totalAssessments = assessments.length;

        if (totalAssessments === 0) {
            document.getElementById('bufferScore').textContent = '0';
            document.getElementById('cognitiveLoad').textContent = '0';
            document.getElementById('performanceIndex').textContent = '0';
            document.getElementById('recoveryFrequency').textContent = '0';
            return;
        }

        // Calculate average buffer score
        const avgBufferScore = Math.round(assessments.reduce((sum, a) => sum + a.bufferScore, 0) / totalAssessments);

        // Calculate average cognitive load
        const avgCognitiveLoad = (assessments.reduce((sum, a) => sum + a.cognitiveLoad, 0) / totalAssessments).toFixed(1);

        // Calculate average performance index
        const avgPerformanceIndex = (assessments.reduce((sum, a) => sum + a.performanceIndex, 0) / totalAssessments).toFixed(1);

        // Calculate recovery strategies frequency
        const totalStrategies = assessments.reduce((sum, a) => sum + a.recoveryStrategies.length, 0);
        const avgStrategiesPerDay = (totalStrategies / totalAssessments).toFixed(1);

        document.getElementById('bufferScore').textContent = avgBufferScore;
        document.getElementById('cognitiveLoad').textContent = avgCognitiveLoad;
        document.getElementById('performanceIndex').textContent = avgPerformanceIndex;
        document.getElementById('recoveryFrequency').textContent = avgStrategiesPerDay;
    }

    // Update cognitive alert
    updateCognitiveAlert() {
        const alert = document.getElementById('cognitiveAlert');
        const avgBufferScore = this.assessments.length > 0
            ? this.assessments.reduce((sum, a) => sum + a.bufferScore, 0) / this.assessments.length
            : 100;

        if (this.assessments.length < 3) {
            alert.classList.add('hidden');
            return;
        }

        if (avgBufferScore < 40) {
            document.getElementById('alertTitle').textContent = 'Cognitive Load Warning';
            document.getElementById('alertMessage').textContent =
                'Your cognitive buffer capacity is critically low. Consider implementing immediate recovery strategies and reducing task complexity.';
            alert.classList.remove('hidden');
        } else if (avgBufferScore < 70) {
            document.getElementById('alertTitle').textContent = 'Cognitive Load Caution';
            document.getElementById('alertMessage').textContent =
                'Your cognitive buffer capacity is approaching concerning levels. Monitor your mental fatigue and consider recovery strategies.';
            alert.classList.remove('hidden');
        } else {
            alert.classList.add('hidden');
        }
    }

    // Update assessments list
    updateAssessmentsList() {
        const assessmentsList = document.getElementById('assessmentsList');
        assessmentsList.innerHTML = '';

        if (this.assessments.length === 0) {
            assessmentsList.innerHTML = '<p style="text-align: center; color: #888;">No cognitive assessments logged yet.</p>';
            return;
        }

        this.assessments.forEach(assessment => {
            const assessmentElement = this.createAssessmentElement(assessment);
            assessmentsList.appendChild(assessmentElement);
        });
    }

    // Create assessment element
    createAssessmentElement(assessment) {
        const div = document.createElement('div');
        div.className = `assessment-item ${this.getBufferClass(assessment.bufferScore)} ${this.getTaskClass(assessment.taskType)}`;

        div.innerHTML = `
            <div class="assessment-header">
                <div class="assessment-title">${this.formatTaskType(assessment.taskType)}</div>
                <div class="assessment-meta">
                    <span>${new Date(assessment.timestamp).toLocaleDateString()}</span>
                    <span>Buffer: ${assessment.bufferScore}</span>
                    <span>Load: ${assessment.cognitiveLoad}/10</span>
                </div>
            </div>
            <div class="assessment-details">
                <div><strong>Complexity:</strong> ${assessment.taskComplexity}/10 | <strong>Time Pressure:</strong> ${assessment.timePressure}/10</div>
                <div><strong>Mental Fatigue:</strong> ${assessment.mentalFatigue}/10 | <strong>Distraction:</strong> ${assessment.distractionLevel}/10</div>
                <div><strong>Focus Quality:</strong> ${assessment.focusQuality}/10 | <strong>Performance:</strong> ${assessment.cognitivePerformance}/10</div>
            </div>
            <div class="assessment-notes">${assessment.notes}</div>
            <div class="assessment-strategies">
                ${assessment.recoveryStrategies.map(strategy =>
                    `<span class="strategy-tag">${this.formatStrategyLabel(strategy)}</span>`
                ).join('')}
            </div>
            <div class="assessment-actions">
                <button class="btn-secondary" onclick="tracker.editAssessment(${assessment.id})">Edit</button>
                <button class="btn-danger" onclick="tracker.deleteAssessment(${assessment.id})">Delete</button>
            </div>
        `;

        return div;
    }

    // Filter assessments
    filterAssessments() {
        const taskTypeFilter = document.getElementById('filterTaskType').value;
        const bufferRangeFilter = document.getElementById('filterBufferRange').value;

        let filtered = this.assessments;

        if (taskTypeFilter !== 'all') {
            filtered = filtered.filter(assessment => assessment.taskType === taskTypeFilter);
        }

        if (bufferRangeFilter !== 'all') {
            filtered = filtered.filter(assessment => {
                const score = assessment.bufferScore;
                switch (bufferRangeFilter) {
                    case 'high': return score >= 70;
                    case 'medium': return score >= 40 && score < 70;
                    case 'low': return score < 40;
                    default: return true;
                }
            });
        }

        this.displayFilteredAssessments(filtered);
    }

    // Sort assessments
    sortAssessments() {
        const sortBy = document.getElementById('sortBy').value;
        let sorted = [...this.assessments];

        switch (sortBy) {
            case 'date':
                sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'buffer-score':
                sorted.sort((a, b) => b.bufferScore - a.bufferScore);
                break;
            case 'cognitive-load':
                sorted.sort((a, b) => b.cognitiveLoad - a.cognitiveLoad);
                break;
            case 'performance':
                sorted.sort((a, b) => b.performanceIndex - a.performanceIndex);
                break;
        }

        this.assessments = sorted;
        this.updateAssessmentsList();
    }

    // Display filtered assessments
    displayFilteredAssessments(assessments) {
        const assessmentsList = document.getElementById('assessmentsList');
        assessmentsList.innerHTML = '';

        if (assessments.length === 0) {
            assessmentsList.innerHTML = '<p style="text-align: center; color: #888;">No assessments match the current filters.</p>';
            return;
        }

        assessments.forEach(assessment => {
            const assessmentElement = this.createAssessmentElement(assessment);
            assessmentsList.appendChild(assessmentElement);
        });
    }

    // Generate insights
    generateInsights() {
        const assessments = this.assessments;
        const insightsDiv = document.getElementById('insights');

        if (assessments.length < 3) {
            insightsDiv.innerHTML = '<p>Log several cognitive assessments to receive personalized insights about your mental workload management and cognitive performance optimization.</p>';
            return;
        }

        const insights = [];

        // Buffer score trend
        const recentAssessments = assessments.slice(0, 10);
        if (recentAssessments.length >= 5) {
            const firstHalf = recentAssessments.slice(0, Math.floor(recentAssessments.length / 2));
            const secondHalf = recentAssessments.slice(Math.floor(recentAssessments.length / 2));

            const firstAvg = firstHalf.reduce((sum, a) => sum + a.bufferScore, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, a) => sum + a.bufferScore, 0) / secondHalf.length;

            if (secondAvg > firstAvg + 10) {
                insights.push('Your cognitive buffer capacity has improved significantly. Keep up the effective recovery strategies!');
            } else if (firstAvg > secondAvg + 10) {
                insights.push('Your cognitive buffer capacity has declined. Consider reviewing your recovery strategies and task management.');
            }
        }

        // Fatigue impact analysis
        const highFatigueAssessments = assessments.filter(a => a.mentalFatigue >= 7);
        const lowFatigueAssessments = assessments.filter(a => a.mentalFatigue <= 3);

        if (highFatigueAssessments.length > 0 && lowFatigueAssessments.length > 0) {
            const highFatigueAvg = highFatigueAssessments.reduce((sum, a) => sum + a.performanceIndex, 0) / highFatigueAssessments.length;
            const lowFatigueAvg = lowFatigueAssessments.reduce((sum, a) => sum + a.performanceIndex, 0) / lowFatigueAssessments.length;

            if (lowFatigueAvg > highFatigueAvg + 1) {
                insights.push('Mental fatigue significantly impacts your cognitive performance. Prioritize rest and recovery during high-fatigue periods.');
            }
        }

        // Task type performance
        const taskPerformance = {};
        assessments.forEach(assessment => {
            if (!taskPerformance[assessment.taskType]) {
                taskPerformance[assessment.taskType] = [];
            }
            taskPerformance[assessment.taskType].push(assessment.performanceIndex);
        });

        const bestTask = Object.entries(taskPerformance).reduce((best, [task, performances]) => {
            const avg = performances.reduce((sum, p) => sum + p, 0) / performances.length;
            return avg > best.avg ? { task, avg } : best;
        }, { task: '', avg: 0 });

        if (bestTask.task) {
            insights.push(`You perform best during ${this.formatTaskType(bestTask.task)} tasks. Consider scheduling these activities during your peak cognitive periods.`);
        }

        // Recovery strategy effectiveness
        const strategyUsage = {};
        assessments.forEach(assessment => {
            assessment.recoveryStrategies.forEach(strategy => {
                strategyUsage[strategy] = (strategyUsage[strategy] || 0) + 1;
            });
        });

        const mostUsedStrategy = Object.entries(strategyUsage).sort((a, b) => b[1] - a[1])[0];
        if (mostUsedStrategy) {
            insights.push(`${this.formatStrategyLabel(mostUsedStrategy[0])} is your most frequently used recovery strategy. Evaluate its effectiveness for your cognitive recovery.`);
        }

        // Distraction management
        const avgDistraction = assessments.reduce((sum, a) => sum + a.distractionLevel, 0) / assessments.length;
        if (avgDistraction > 6) {
            insights.push('High distraction levels are affecting your cognitive performance. Consider implementing better focus environments or techniques.');
        }

        insightsDiv.innerHTML = insights.map(insight => `<p>• ${insight}</p>`).join('');
    }

    // Edit assessment
    editAssessment(id) {
        const assessment = this.assessments.find(a => a.id === id);
        if (!assessment) return;

        // Populate form with assessment data
        document.getElementById('assessmentDate').value = assessment.date;
        document.getElementById('taskComplexity').value = assessment.taskComplexity;
        document.getElementById('timePressure').value = assessment.timePressure;
        document.getElementById('mentalFatigue').value = assessment.mentalFatigue;
        document.getElementById('distractionLevel').value = assessment.distractionLevel;
        document.getElementById('focusQuality').value = assessment.focusQuality;
        document.getElementById('cognitivePerformance').value = assessment.cognitivePerformance;
        document.getElementById('taskType').value = assessment.taskType;
        document.getElementById('cognitiveLoadNotes').value = assessment.notes;

        // Check recovery strategies
        document.querySelectorAll('input[name="strategies"]').forEach(cb => {
            cb.checked = assessment.recoveryStrategies.includes(cb.value);
        });

        // Remove the assessment and scroll to form
        this.deleteAssessment(id);
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Delete assessment
    deleteAssessment(id) {
        if (confirm('Are you sure you want to delete this cognitive assessment?')) {
            this.assessments = this.assessments.filter(a => a.id !== id);
            this.saveAssessments();
            this.updateUI();
            this.updateChart();
            this.generateInsights();
        }
    }

    // Utility functions
    formatTaskType(type) {
        const formats = {
            'analytical': 'Analytical Thinking',
            'creative': 'Creative Problem Solving',
            'learning': 'Learning New Information',
            'decision-making': 'Decision Making',
            'multitasking': 'Multitasking',
            'communication': 'Communication/Meetings',
            'planning': 'Planning & Organization',
            'routine': 'Routine Tasks',
            'other': 'Other'
        };
        return formats[type] || type;
    }

    formatStrategyLabel(strategy) {
        const formats = {
            'deep-breathing': 'Deep Breathing',
            'short-break': 'Short Break',
            'physical-activity': 'Physical Activity',
            'meditation': 'Meditation',
            'hydration': 'Hydration',
            'nutrition': 'Nutrition',
            'environment-change': 'Environment Change',
            'task-switching': 'Task Switching'
        };
        return formats[strategy] || strategy;
    }

    getBufferClass(score) {
        if (score >= 70) return 'buffer-high';
        if (score >= 40) return 'buffer-medium';
        return 'buffer-low';
    }

    getTaskClass(type) {
        return `task-${type}`;
    }

    getFilteredAssessments() {
        const days = this.currentTimeRange;
        if (days === 'all') return this.assessments;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.assessments.filter(assessment =>
            new Date(assessment.timestamp) >= cutoffDate
        );
    }

    clearForm() {
        document.getElementById('cognitiveForm').reset();
        this.setDefaultDateTime();
    }

    showSuccessMessage(message) {
        // Simple alert for now - could be enhanced with a toast notification
        alert(message);
    }

    showErrorMessage(message) {
        alert('Error: ' + message);
    }

    // Data persistence
    saveAssessments() {
        localStorage.setItem('cognitiveAssessments', JSON.stringify(this.assessments));
    }

    loadAssessments() {
        const data = localStorage.getItem('cognitiveAssessments');
        return data ? JSON.parse(data) : [];
    }
}

// Initialize the tracker when DOM is loaded
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new CognitiveLoadTracker();
});