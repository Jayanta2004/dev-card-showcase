/**
 * Time-Under-Tension Tracker
 * Tracks muscle tension duration during workouts for hypertrophy optimization
 */

class TimeUnderTensionTracker {
    constructor() {
        this.workouts = this.loadWorkouts();
        this.currentChart = null;
        this.initializeElements();
        this.setupEventListeners();
        this.renderDashboard();
        this.renderHistory();
        this.renderInsights();
    }

    initializeElements() {
        // Form elements
        this.tutForm = document.getElementById('tutForm');
        this.exerciseSelect = document.getElementById('exerciseSelect');
        this.customExerciseInput = document.getElementById('customExerciseInput');
        this.setsInput = document.getElementById('setsInput');
        this.repsInput = document.getElementById('repsInput');
        this.repTimeInput = document.getElementById('repTimeInput');
        this.restTimeInput = document.getElementById('restTimeInput');
        this.weightInput = document.getElementById('weightInput');
        this.notesInput = document.getElementById('notesInput');

        // Calculation elements
        this.tutResults = document.getElementById('tutResults');
        this.totalTUT = document.getElementById('totalTUT');
        this.avgTUT = document.getElementById('avgTUT');
        this.tutPerSet = document.getElementById('tutPerSet');
        this.tutIndicator = document.getElementById('tutIndicator');
        this.tutFill = document.getElementById('tutFill');

        // Dashboard elements
        this.totalWorkouts = document.getElementById('totalWorkouts');
        this.totalExercises = document.getElementById('totalExercises');
        this.avgSessionTUT = document.getElementById('avgSessionTUT');
        this.bestTUT = document.getElementById('bestTUT');

        // Chart elements
        this.progressionChart = document.getElementById('progressionChart');
        this.chartPeriodSelect = document.getElementById('chartPeriodSelect');
        this.chartExerciseSelect = document.getElementById('chartExerciseSelect');

        // History elements
        this.historyList = document.getElementById('historyList');
        this.historyPeriodSelect = document.getElementById('historyPeriodSelect');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    }

    setupEventListeners() {
        // Form events
        this.tutForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.exerciseSelect.addEventListener('change', () => this.handleExerciseChange());

        // Chart controls
        this.chartPeriodSelect.addEventListener('change', () => this.renderProgressionChart());
        this.chartExerciseSelect.addEventListener('change', () => this.renderProgressionChart());

        // History controls
        this.historyPeriodSelect.addEventListener('change', () => this.renderHistory());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Real-time calculation
        [this.setsInput, this.repsInput, this.repTimeInput, this.restTimeInput].forEach(input => {
            input.addEventListener('input', () => this.calculateTUT());
        });
    }

    handleExerciseChange() {
        const isCustom = this.exerciseSelect.value === 'custom';
        this.customExerciseInput.style.display = isCustom ? 'block' : 'none';
        if (!isCustom) {
            this.customExerciseInput.value = '';
        }
    }

    calculateTUT() {
        const sets = parseInt(this.setsInput.value) || 0;
        const reps = parseInt(this.repsInput.value) || 0;
        const repTime = parseFloat(this.repTimeInput.value) || 0;
        const restTime = parseFloat(this.restTimeInput.value) || 0;

        if (sets > 0 && reps > 0 && repTime > 0) {
            // TUT = (reps × rep time) × sets + (sets - 1) × rest time
            const totalRepTime = reps * repTime;
            const totalRestTime = (sets - 1) * restTime;
            const totalTUT = (totalRepTime * sets) + totalRestTime;

            const avgTUT = totalTUT / sets;
            const tutPerSet = totalRepTime;

            this.updateTUTDisplay(totalTUT, avgTUT, tutPerSet);
            this.updateTUTIndicator(totalTUT);
        } else {
            this.resetTUTDisplay();
        }
    }

    updateTUTDisplay(totalTUT, avgTUT, tutPerSet) {
        this.totalTUT.textContent = `${totalTUT.toFixed(1)}s`;
        this.avgTUT.textContent = `${avgTUT.toFixed(1)}s`;
        this.tutPerSet.textContent = `${tutPerSet.toFixed(1)}s`;
    }

    resetTUTDisplay() {
        this.totalTUT.textContent = '0.0s';
        this.avgTUT.textContent = '0.0s';
        this.tutPerSet.textContent = '0.0s';
        this.tutFill.style.width = '0%';
    }

    updateTUTIndicator(totalTUT) {
        // TUT levels based on hypertrophy research
        // 40-70s per set is optimal for hypertrophy
        const optimalMin = 40;
        const optimalMax = 70;
        const maxTUT = 120; // Maximum reasonable TUT

        let percentage = 0;
        if (totalTUT >= optimalMin && totalTUT <= optimalMax) {
            percentage = 100;
        } else if (totalTUT < optimalMin) {
            percentage = (totalTUT / optimalMin) * 50; // 0-50% for below optimal
        } else {
            percentage = 50 + ((totalTUT - optimalMax) / (maxTUT - optimalMax)) * 50; // 50-100% for above optimal
        }

        percentage = Math.min(100, Math.max(0, percentage));
        this.tutFill.style.width = `${percentage}%`;

        // Update color based on TUT level
        if (totalTUT < 20) {
            this.tutFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)'; // Red - too short
        } else if (totalTUT >= 20 && totalTUT < 40) {
            this.tutFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)'; // Orange - suboptimal
        } else if (totalTUT >= 40 && totalTUT <= 70) {
            this.tutFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)'; // Green - optimal
        } else {
            this.tutFill.style.background = 'linear-gradient(90deg, #06b6d4, #22d3ee)'; // Blue - very long
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const workout = this.getFormData();
        if (!workout) return;

        this.workouts.unshift(workout);
        this.saveWorkouts();
        this.renderDashboard();
        this.renderHistory();
        this.renderProgressionChart();
        this.renderInsights();
        this.resetForm();

        // Show success message
        this.showNotification('Workout logged successfully!', 'success');
    }

    getFormData() {
        const exercise = this.exerciseSelect.value === 'custom'
            ? this.customExerciseInput.value.trim()
            : this.exerciseSelect.value;

        if (!exercise) {
            this.showNotification('Please select or enter an exercise name.', 'error');
            return null;
        }

        const sets = parseInt(this.setsInput.value);
        const reps = parseInt(this.repsInput.value);
        const repTime = parseFloat(this.repTimeInput.value);
        const restTime = parseFloat(this.restTimeInput.value);
        const weight = parseFloat(this.weightInput.value) || 0;

        if (!sets || !reps || !repTime) {
            this.showNotification('Please fill in all required fields.', 'error');
            return null;
        }

        // Calculate TUT
        const totalRepTime = reps * repTime;
        const totalRestTime = (sets - 1) * restTime;
        const totalTUT = (totalRepTime * sets) + totalRestTime;

        return {
            id: Date.now(),
            date: new Date().toISOString(),
            exercise,
            sets,
            reps,
            repTime,
            restTime,
            weight,
            totalTUT,
            avgTUT: totalTUT / sets,
            tutPerSet: totalRepTime,
            notes: this.notesInput.value.trim()
        };
    }

    resetForm() {
        this.tutForm.reset();
        this.customExerciseInput.style.display = 'none';
        this.resetTUTDisplay();
    }

    renderDashboard() {
        const totalWorkouts = this.workouts.length;
        const uniqueExercises = new Set(this.workouts.map(w => w.exercise)).size;
        const avgSessionTUT = totalWorkouts > 0
            ? this.workouts.reduce((sum, w) => sum + w.totalTUT, 0) / totalWorkouts
            : 0;
        const bestTUT = totalWorkouts > 0
            ? Math.max(...this.workouts.map(w => w.totalTUT))
            : 0;

        this.totalWorkouts.textContent = totalWorkouts;
        this.totalExercises.textContent = uniqueExercises;
        this.avgSessionTUT.textContent = `${avgSessionTUT.toFixed(1)}s`;
        this.bestTUT.textContent = `${bestTUT.toFixed(1)}s`;
    }

    renderProgressionChart() {
        const period = this.chartPeriodSelect.value;
        const selectedExercise = this.chartExerciseSelect.value;

        // Filter workouts by period
        const filteredWorkouts = this.filterWorkoutsByPeriod(this.workouts, period);

        // Filter by exercise if selected
        const exerciseWorkouts = selectedExercise === 'all'
            ? filteredWorkouts
            : filteredWorkouts.filter(w => w.exercise === selectedExercise);

        // Group by date and calculate average TUT
        const dateGroups = {};
        exerciseWorkouts.forEach(workout => {
            const date = new Date(workout.date).toDateString();
            if (!dateGroups[date]) {
                dateGroups[date] = [];
            }
            dateGroups[date].push(workout);
        });

        const labels = Object.keys(dateGroups).sort((a, b) => new Date(a) - new Date(b));
        const data = labels.map(date => {
            const workouts = dateGroups[date];
            return workouts.reduce((sum, w) => sum + w.totalTUT, 0) / workouts.length;
        });

        if (this.currentChart) {
            this.currentChart.destroy();
        }

        this.currentChart = new Chart(this.progressionChart, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Average TUT (seconds)',
                    data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `TUT: ${context.parsed.y.toFixed(1)}s`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time Under Tension (seconds)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    renderHistory() {
        const period = this.historyPeriodSelect.value;
        const filteredWorkouts = this.filterWorkoutsByPeriod(this.workouts, period);

        this.historyList.innerHTML = '';

        if (filteredWorkouts.length === 0) {
            this.historyList.innerHTML = '<p class="no-data">No workouts found for the selected period.</p>';
            return;
        }

        filteredWorkouts.forEach(workout => {
            const historyItem = this.createHistoryItem(workout);
            this.historyList.appendChild(historyItem);
        });
    }

    createHistoryItem(workout) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(workout.date);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="history-item-header">
                <div class="history-item-title">${workout.exercise}</div>
                <div class="history-item-date">${formattedDate} ${formattedTime}</div>
            </div>
            <div class="history-item-details">
                <div><strong>Sets:</strong> ${workout.sets}</div>
                <div><strong>Reps:</strong> ${workout.reps}</div>
                <div><strong>Rep Time:</strong> ${workout.repTime}s</div>
                <div><strong>Rest Time:</strong> ${workout.restTime}s</div>
                ${workout.weight > 0 ? `<div><strong>Weight:</strong> ${workout.weight}kg</div>` : ''}
            </div>
            <div class="history-item-metrics">
                <div class="metric-badge">
                    <span class="metric-badge-label">Total TUT</span>
                    <span class="metric-badge-value">${workout.totalTUT.toFixed(1)}s</span>
                </div>
                <div class="metric-badge">
                    <span class="metric-badge-label">Avg per Set</span>
                    <span class="metric-badge-value">${workout.avgTUT.toFixed(1)}s</span>
                </div>
                <div class="metric-badge">
                    <span class="metric-badge-label">TUT per Set</span>
                    <span class="metric-badge-value">${workout.tutPerSet.toFixed(1)}s</span>
                </div>
            </div>
            ${workout.notes ? `<div class="history-item-notes">${workout.notes}</div>` : ''}
        `;

        return item;
    }

    renderInsights() {
        const insights = this.generateInsights();
        const insightsContainer = document.getElementById('insightsContainer');

        insightsContainer.innerHTML = '';

        insights.forEach(insight => {
            const insightCard = document.createElement('div');
            insightCard.className = 'insight-card';
            insightCard.innerHTML = `
                <h3><i class="${insight.icon}"></i> ${insight.title}</h3>
                <div class="insight-content">
                    <p>${insight.content}</p>
                </div>
            `;
            insightsContainer.appendChild(insightCard);
        });
    }

    generateInsights() {
        const insights = [];

        if (this.workouts.length === 0) {
            insights.push({
                icon: 'fas fa-chart-line',
                title: 'Start Tracking',
                content: 'Log your first workout to see TUT insights and track your progress over time.'
            });
            return insights;
        }

        // Average TUT insight
        const avgTUT = this.workouts.reduce((sum, w) => sum + w.totalTUT, 0) / this.workouts.length;
        if (avgTUT < 40) {
            insights.push({
                icon: 'fas fa-clock',
                title: 'Increase TUT',
                content: `Your average TUT is ${avgTUT.toFixed(1)}s. Consider slowing down your reps or increasing rest time to reach the optimal 40-70s range for hypertrophy.`
            });
        } else if (avgTUT > 70) {
            insights.push({
                icon: 'fas fa-tachometer-alt',
                title: 'TUT Optimization',
                content: `Your average TUT is ${avgTUT.toFixed(1)}s. While longer TUT can be beneficial, ensure you're not sacrificing form for time under tension.`
            });
        } else {
            insights.push({
                icon: 'fas fa-check-circle',
                title: 'Optimal TUT Range',
                content: `Great! Your average TUT of ${avgTUT.toFixed(1)}s falls within the optimal 40-70s range for maximizing hypertrophy.`
            });
        }

        // Exercise variety insight
        const exerciseCount = new Set(this.workouts.map(w => w.exercise)).size;
        if (exerciseCount < 3) {
            insights.push({
                icon: 'fas fa-dumbbell',
                title: 'Exercise Variety',
                content: 'Consider adding more exercises to your routine. Variety helps prevent plateaus and targets different muscle fibers.'
            });
        }

        // Progress insight
        if (this.workouts.length >= 5) {
            const recent = this.workouts.slice(0, 5);
            const older = this.workouts.slice(5, 10);

            if (older.length > 0) {
                const recentAvg = recent.reduce((sum, w) => sum + w.totalTUT, 0) / recent.length;
                const olderAvg = older.reduce((sum, w) => sum + w.totalTUT, 0) / older.length;

                if (recentAvg > olderAvg * 1.1) {
                    insights.push({
                        icon: 'fas fa-arrow-up',
                        title: 'Progress Detected',
                        content: `Your recent workouts show ${((recentAvg / olderAvg - 1) * 100).toFixed(1)}% improvement in TUT. Keep up the great work!`
                    });
                }
            }
        }

        // Rest time insight
        const avgRestTime = this.workouts.reduce((sum, w) => sum + w.restTime, 0) / this.workouts.length;
        if (avgRestTime < 60) {
            insights.push({
                icon: 'fas fa-hourglass-half',
                title: 'Rest Time Consideration',
                content: `Your average rest time is ${avgRestTime.toFixed(0)}s. For hypertrophy-focused training, consider 60-90s rest between sets.`
            });
        }

        return insights;
    }

    filterWorkoutsByPeriod(workouts, period) {
        const now = new Date();
        const filterDate = new Date();

        switch (period) {
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                filterDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                filterDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return workouts; // 'all'
        }

        return workouts.filter(workout => new Date(workout.date) >= filterDate);
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all workout history? This action cannot be undone.')) {
            this.workouts = [];
            this.saveWorkouts();
            this.renderDashboard();
            this.renderHistory();
            this.renderProgressionChart();
            this.renderInsights();
            this.showNotification('Workout history cleared.', 'info');
        }
    }

    loadWorkouts() {
        const stored = localStorage.getItem('tut-workouts');
        return stored ? JSON.parse(stored) : [];
    }

    saveWorkouts() {
        localStorage.setItem('tut-workouts', JSON.stringify(this.workouts));
    }

    showNotification(message, type = 'info') {
        // Simple notification - you could enhance this with a proper notification system
        alert(message);
    }

    // Initialize chart exercise options
    updateChartExerciseOptions() {
        const exercises = [...new Set(this.workouts.map(w => w.exercise))].sort();

        this.chartExerciseSelect.innerHTML = '<option value="all">All Exercises</option>';

        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = exercise;
            this.chartExerciseSelect.appendChild(option);
        });
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TimeUnderTensionTracker();
});