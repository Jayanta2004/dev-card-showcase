class OvercommitmentRiskAnalyzer {
    constructor() {
        this.capacity = this.loadCapacity();
        this.tasks = this.loadTasks();
        this.assessments = this.loadAssessments();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRatingInputs();
        this.setDefaultDate();
        this.updateCapacityDisplay();
        this.updateTasksDisplay();
        this.updateAnalysis();
        this.updateRecommendations();
        this.updateHistory();
    }

    setupEventListeners() {
        const capacityForm = document.getElementById('capacity-form');
        capacityForm.addEventListener('submit', (e) => this.handleCapacitySubmit(e));

        const taskForm = document.getElementById('task-form');
        taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
    }

    setupRatingInputs() {
        const ratingInputs = ['energy-level', 'stress-level', 'sleep-quality'];
        ratingInputs.forEach(id => {
            const input = document.getElementById(id);
            const value = input.nextElementSibling;

            input.addEventListener('input', () => {
                value.textContent = input.value;
            });
        });
    }

    setDefaultDate() {
        const dateInput = document.getElementById('assessment-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    handleCapacitySubmit(e) {
        e.preventDefault();

        const capacityData = this.getCapacityData();
        this.capacity = capacityData;
        this.saveCapacity();

        // Create assessment record
        const assessment = {
            id: Date.now(),
            date: capacityData.date,
            capacity: capacityData,
            tasks: [...this.tasks],
            riskLevel: this.calculateRiskLevel(),
            totalHours: this.calculateTotalTaskHours(),
            capacityUtilization: this.calculateCapacityUtilization()
        };

        this.assessments.push(assessment);
        this.saveAssessments();

        this.updateCapacityDisplay();
        this.updateAnalysis();
        this.updateRecommendations();
        this.updateHistory();

        this.showSuccessMessage('Capacity assessment updated successfully!');
    }

    handleTaskSubmit(e) {
        e.preventDefault();

        const taskData = this.getTaskData();
        this.tasks.push(taskData);
        this.saveTasks();

        this.resetTaskForm();
        this.updateTasksDisplay();
        this.updateAnalysis();
        this.updateRecommendations();

        this.showSuccessMessage('Task added successfully!');
    }

    getCapacityData() {
        return {
            date: document.getElementById('assessment-date').value,
            availableHours: parseFloat(document.getElementById('available-hours').value),
            energyLevel: parseInt(document.getElementById('energy-level').value),
            stressLevel: parseInt(document.getElementById('stress-level').value),
            sleepQuality: parseInt(document.getElementById('sleep-quality').value)
        };
    }

    getTaskData() {
        return {
            id: Date.now(),
            name: document.getElementById('task-name').value,
            hours: parseFloat(document.getElementById('task-hours').value),
            priority: document.getElementById('task-priority').value,
            deadline: document.getElementById('task-deadline').value || null
        };
    }

    resetTaskForm() {
        document.getElementById('task-form').reset();
        document.getElementById('task-priority').value = 'medium';
    }

    calculateRiskLevel() {
        if (!this.capacity || this.tasks.length === 0) return 'unknown';

        const totalHours = this.calculateTotalTaskHours();
        const utilization = this.calculateCapacityUtilization();
        const stressFactor = this.capacity.stressLevel / 10;
        const energyFactor = (11 - this.capacity.energyLevel) / 10; // Inverted
        const sleepFactor = (11 - this.capacity.sleepQuality) / 10; // Inverted

        // Risk factors
        const overloadRisk = Math.max(0, (utilization - 100) / 100); // Over 100% utilization
        const stressRisk = stressFactor;
        const recoveryRisk = (energyFactor + sleepFactor) / 2;

        // Weighted risk score (0-1)
        const riskScore = (overloadRisk * 0.4) + (stressRisk * 0.3) + (recoveryRisk * 0.3);

        if (riskScore < 0.2) return 'low';
        if (riskScore < 0.4) return 'medium';
        if (riskScore < 0.7) return 'high';
        return 'critical';
    }

    calculateTotalTaskHours() {
        return this.tasks.reduce((total, task) => total + task.hours, 0);
    }

    calculateCapacityUtilization() {
        if (!this.capacity) return 0;
        const totalHours = this.calculateTotalTaskHours();
        return (totalHours / this.capacity.availableHours) * 100;
    }

    updateCapacityDisplay() {
        if (!this.capacity) return;

        // Update form values
        document.getElementById('assessment-date').value = this.capacity.date;
        document.getElementById('available-hours').value = this.capacity.availableHours;
        document.getElementById('energy-level').value = this.capacity.energyLevel;
        document.getElementById('stress-level').value = this.capacity.stressLevel;
        document.getElementById('sleep-quality').value = this.capacity.sleepQuality;

        // Update rating displays
        document.querySelector('#energy-level + .rating-value').textContent = this.capacity.energyLevel;
        document.querySelector('#stress-level + .rating-value').textContent = this.capacity.stressLevel;
        document.querySelector('#sleep-quality + .rating-value').textContent = this.capacity.sleepQuality;
    }

    updateTasksDisplay() {
        const container = document.getElementById('tasks-list');

        if (this.tasks.length === 0) {
            container.innerHTML = '<p class="no-data">No tasks added yet. Add some tasks to see your workload analysis.</p>';
            return;
        }

        container.innerHTML = this.tasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const deadlineText = task.deadline ? this.formatDate(task.deadline) : 'No deadline';
        const priorityClass = `priority-${task.priority}`;

        return `
            <div class="task-item" data-id="${task.id}">
                <div class="task-name">${task.name}</div>
                <div class="task-hours">${task.hours}h</div>
                <div class="task-priority ${priorityClass}">${this.capitalizeFirst(task.priority)}</div>
                <div class="task-deadline">${deadlineText}</div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="analyzer.deleteTask(${task.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.updateTasksDisplay();
        this.updateAnalysis();
        this.updateRecommendations();
        this.showSuccessMessage('Task deleted successfully!');
    }

    updateAnalysis() {
        const riskLevel = this.calculateRiskLevel();
        const totalHours = this.calculateTotalTaskHours();
        const utilization = this.calculateCapacityUtilization();

        // Update risk level
        const riskElement = document.getElementById('risk-level');
        riskElement.className = `risk-indicator risk-${riskLevel}`;
        riskElement.textContent = this.formatRiskLevel(riskLevel);

        // Update metrics
        document.getElementById('total-hours').textContent = totalHours.toFixed(1);
        document.getElementById('available-capacity').textContent = this.capacity ? `${this.capacity.availableHours}h` : '0h';
        document.getElementById('capacity-utilization').textContent = `${utilization.toFixed(1)}%`;

        // Update chart
        this.updateChart();
    }

    updateChart() {
        const ctx = document.getElementById('capacity-chart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        if (!this.capacity || this.tasks.length === 0) {
            return;
        }

        const data = {
            labels: ['Available Capacity', 'Task Load', 'Buffer'],
            datasets: [{
                data: [
                    this.capacity.availableHours,
                    this.calculateTotalTaskHours(),
                    Math.max(0, this.capacity.availableHours - this.calculateTotalTaskHours())
                ],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',  // Green for available
                    'rgba(255, 152, 0, 0.8)',  // Orange for tasks
                    'rgba(244, 67, 54, 0.8)'   // Red for overcommitment
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 152, 0, 1)',
                    'rgba(244, 67, 54, 1)'
                ],
                borderWidth: 2
            }]
        };

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Capacity vs Task Load',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations-content');
        const riskLevel = this.calculateRiskLevel();

        if (!this.capacity || this.tasks.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="recommendation-card">
                    <h3>💡 Getting Started</h3>
                    <p>Update your capacity assessment and add your current tasks to get personalized recommendations for managing your workload.</p>
                </div>
            `;
            return;
        }

        const recommendations = this.generateRecommendations(riskLevel);
        const recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
            </div>
        `).join('');

        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    generateRecommendations(riskLevel) {
        const recommendations = [];

        switch (riskLevel) {
            case 'low':
                recommendations.push({
                    title: '✅ Low Risk - Good Balance',
                    description: 'Your current workload appears manageable. Continue monitoring and consider taking on additional tasks if your capacity allows.'
                });
                break;

            case 'medium':
                recommendations.push({
                    title: '⚠️ Medium Risk - Monitor Closely',
                    description: 'Your workload is approaching capacity limits. Review task priorities and consider delegating or postponing lower-priority items.'
                });
                if (this.capacity.stressLevel > 6) {
                    recommendations.push({
                        title: '🧘 Stress Management',
                        description: 'Your stress levels are elevated. Consider incorporating stress-reduction activities like exercise, meditation, or breaks between tasks.'
                    });
                }
                break;

            case 'high':
                recommendations.push({
                    title: '🚨 High Risk - Action Required',
                    description: 'You are significantly overcommitted. Immediately review and reduce your task load. Focus on high-priority items only and reschedule others.'
                });
                recommendations.push({
                    title: '📅 Prioritization Strategy',
                    description: 'Use the Eisenhower Matrix: Focus on urgent and important tasks. Delegate or eliminate tasks that are neither urgent nor important.'
                });
                break;

            case 'critical':
                recommendations.push({
                    title: '🚨🚨 Critical Risk - Immediate Action',
                    description: 'You are severely overcommitted and at high risk of burnout. Stop accepting new tasks immediately and focus on completing only essential work.'
                });
                recommendations.push({
                    title: '🏥 Seek Support',
                    description: 'Consider discussing your workload with a supervisor or mentor. You may need to renegotiate deadlines or request additional resources.'
                });
                break;
        }

        // Energy and sleep recommendations
        if (this.capacity.energyLevel < 5) {
            recommendations.push({
                title: '⚡ Energy Management',
                description: 'Your energy levels are low. Ensure adequate sleep, nutrition, and consider short breaks or power naps between tasks.'
            });
        }

        if (this.capacity.sleepQuality < 6) {
            recommendations.push({
                title: '😴 Sleep Optimization',
                description: 'Poor sleep quality can reduce productivity. Maintain a consistent sleep schedule and create a better sleep environment.'
            });
        }

        // Task-specific recommendations
        const urgentTasks = this.tasks.filter(task => task.priority === 'urgent');
        if (urgentTasks.length > 0) {
            recommendations.push({
                title: '🔥 Urgent Tasks',
                description: `You have ${urgentTasks.length} urgent task(s). Focus on these first to prevent crises.`
            });
        }

        return recommendations;
    }

    updateHistory() {
        const container = document.getElementById('history-list');

        if (this.assessments.length === 0) {
            container.innerHTML = '<p class="no-data">No assessments yet. Complete your first capacity assessment to see history.</p>';
            return;
        }

        // Sort by date (newest first) and take last 10
        const recentAssessments = this.assessments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        container.innerHTML = recentAssessments.map(assessment => this.createAssessmentHTML(assessment)).join('');
    }

    createAssessmentHTML(assessment) {
        const riskClass = `risk-${assessment.riskLevel}`;

        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-date">${this.formatDate(assessment.date)}</div>
                    <div class="history-risk ${riskClass}">${this.formatRiskLevel(assessment.riskLevel)}</div>
                </div>
                <div class="history-metrics">
                    <div class="metric-item">
                        <span>Tasks:</span>
                        <span>${assessment.tasks.length}</span>
                    </div>
                    <div class="metric-item">
                        <span>Total Hours:</span>
                        <span>${assessment.totalHours.toFixed(1)}h</span>
                    </div>
                    <div class="metric-item">
                        <span>Utilization:</span>
                        <span>${assessment.capacityUtilization.toFixed(1)}%</span>
                    </div>
                    <div class="metric-item">
                        <span>Energy:</span>
                        <span>${assessment.capacity.energyLevel}/10</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Data persistence methods
    loadCapacity() {
        const stored = localStorage.getItem('overcommitment-capacity');
        return stored ? JSON.parse(stored) : null;
    }

    saveCapacity() {
        localStorage.setItem('overcommitment-capacity', JSON.stringify(this.capacity));
    }

    loadTasks() {
        const stored = localStorage.getItem('overcommitment-tasks');
        return stored ? JSON.parse(stored) : [];
    }

    saveTasks() {
        localStorage.setItem('overcommitment-tasks', JSON.stringify(this.tasks));
    }

    loadAssessments() {
        const stored = localStorage.getItem('overcommitment-assessments');
        return stored ? JSON.parse(stored) : [];
    }

    saveAssessments() {
        localStorage.setItem('overcommitment-assessments', JSON.stringify(this.assessments));
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatRiskLevel(risk) {
        return risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            messageEl.style.backgroundColor = 'var(--risk-primary)';
        } else {
            messageEl.style.backgroundColor = 'var(--error-color)';
        }

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.analyzer = new OvercommitmentRiskAnalyzer();
});

// Add CSS animations for messages
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