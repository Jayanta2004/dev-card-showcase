// Cellular Repair Habit Index - JavaScript
class CellularRepairTracker {
    constructor() {
        this.activities = this.loadActivities();
        this.charts = {};
        this.currentChartView = 'repair-index';
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
        document.getElementById('repairForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logActivity();
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

        // Activity filters
        document.getElementById('filterCategory').addEventListener('change', () => this.filterActivities());
        document.getElementById('filterType').addEventListener('change', () => this.filterActivities());
        document.getElementById('sortBy').addEventListener('change', () => this.sortActivities());
    }

    // Set default date and time
    setDefaultDateTime() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('repairDate').value = localDateTime;
    }

    // Log new activity
    logActivity() {
        const formData = this.getFormData();

        if (!this.validateForm(formData)) {
            return;
        }

        const activity = {
            id: Date.now(),
            ...formData,
            timestamp: new Date().toISOString(),
            repairIndex: this.calculateRepairIndex(formData)
        };

        this.activities.unshift(activity);
        this.saveActivities();
        this.updateUI();
        this.updateChart();
        this.generateInsights();
        this.clearForm();
        this.showSuccessMessage('Cellular repair activity logged successfully!');
    }

    // Get form data
    getFormData() {
        const benefits = Array.from(document.querySelectorAll('input[name="benefits"]:checked'))
            .map(cb => cb.value);

        return {
            date: document.getElementById('repairDate').value,
            category: document.getElementById('repairCategory').value,
            activityType: document.getElementById('activityType').value,
            activityName: document.getElementById('activityName').value,
            duration: parseInt(document.getElementById('duration').value),
            intensity: parseInt(document.getElementById('intensity').value),
            biomarkers: {
                energyLevel: parseInt(document.getElementById('energyLevel').value),
                inflammationLevel: parseInt(document.getElementById('inflammationLevel').value),
                antioxidantStatus: parseInt(document.getElementById('antioxidantStatus').value),
                repairEfficiency: parseInt(document.getElementById('repairEfficiency').value)
            },
            notes: document.getElementById('repairNotes').value,
            expectedBenefits: benefits
        };
    }

    // Validate form data
    validateForm(data) {
        const errors = [];

        if (!data.date) errors.push('Date is required');
        if (!data.category) errors.push('Category is required');
        if (!data.activityType) errors.push('Activity type is required');
        if (!data.activityName.trim()) errors.push('Activity name is required');
        if (!data.duration || data.duration < 1) errors.push('Valid duration is required');
        if (!data.intensity || data.intensity < 1 || data.intensity > 10) errors.push('Intensity must be between 1-10');
        if (!data.notes.trim()) errors.push('Notes are required');

        // Validate biomarkers
        Object.entries(data.biomarkers).forEach(([key, value]) => {
            if (!value || value < 1 || value > 10) {
                errors.push(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} must be between 1-10`);
            }
        });

        if (errors.length > 0) {
            this.showErrorMessage('Please fix the following errors:\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    // Calculate repair index
    calculateRepairIndex(activity) {
        let index = 0;

        // Base score from intensity and duration
        index += (activity.intensity * 10);
        index += Math.min(activity.duration / 10, 50); // Max 50 points for duration

        // Biomarker contributions
        const biomarkers = activity.biomarkers;
        index += biomarkers.energyLevel * 5;
        index += (11 - biomarkers.inflammationLevel) * 5; // Lower inflammation = higher score
        index += biomarkers.antioxidantStatus * 5;
        index += biomarkers.repairEfficiency * 5;

        // Category multipliers
        const categoryMultipliers = {
            'dna-repair': 1.5,
            'mitochondrial': 1.4,
            'autophagy': 1.3,
            'antioxidant': 1.2,
            'inflammation': 1.2,
            'sleep': 1.3,
            'nutrition': 1.1,
            'exercise': 1.2,
            'stress': 1.1,
            'other': 1.0
        };

        index *= categoryMultipliers[activity.category] || 1.0;

        // Benefits bonus
        index += activity.expectedBenefits.length * 5;

        return Math.round(Math.min(index, 500)); // Cap at 500
    }

    // Initialize charts
    initializeCharts() {
        const ctx = document.getElementById('repairChart').getContext('2d');
        this.charts.main = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Repair Index',
                    data: [],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
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
        const filteredActivities = this.getFilteredActivities();
        const chartData = this.prepareChartData(filteredActivities);

        this.charts.main.data.labels = chartData.labels;
        this.charts.main.data.datasets[0].data = chartData.data;
        this.charts.main.data.datasets[0].label = chartData.label;
        this.charts.main.update();
    }

    // Prepare chart data based on view type
    prepareChartData(activities) {
        switch (this.currentChartView) {
            case 'repair-index':
                return this.prepareRepairIndexData(activities);
            case 'category-activity':
                return this.prepareCategoryData(activities);
            case 'biomarker-trends':
                return this.prepareBiomarkerData(activities);
            case 'habit-streak':
                return this.prepareHabitStreakData(activities);
            default:
                return this.prepareRepairIndexData(activities);
        }
    }

    // Prepare repair index over time data
    prepareRepairIndexData(activities) {
        const dailyData = {};
        const sortedActivities = activities.sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedActivities.forEach(activity => {
            const date = new Date(activity.date).toLocaleDateString();
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(activity.repairIndex);
        });

        const labels = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
        const data = labels.map(date => {
            const scores = dailyData[date];
            return scores.reduce((sum, score) => sum + score, 0) / scores.length;
        });

        return { labels, data, label: 'Average Repair Index' };
    }

    // Prepare category activity data
    prepareCategoryData(activities) {
        const categoryData = {};
        activities.forEach(activity => {
            const category = activity.category;
            categoryData[category] = (categoryData[category] || 0) + 1;
        });

        const labels = Object.keys(categoryData);
        const data = labels.map(category => categoryData[category]);

        return { labels: labels.map(this.formatCategoryLabel), data, label: 'Activities Count' };
    }

    // Prepare biomarker trends data
    prepareBiomarkerData(activities) {
        if (activities.length === 0) {
            return { labels: [], data: [], label: 'Biomarker Average' };
        }

        const sortedActivities = activities.sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sortedActivities.map(activity =>
            new Date(activity.date).toLocaleDateString()
        );

        const biomarkerAverages = sortedActivities.map(activity => {
            const biomarkers = activity.biomarkers;
            return (biomarkers.energyLevel + biomarkers.antioxidantStatus +
                   biomarkers.repairEfficiency + (11 - biomarkers.inflammationLevel)) / 4;
        });

        return { labels, data: biomarkerAverages, label: 'Biomarker Average' };
    }

    // Prepare habit streak data
    prepareHabitStreakData(activities) {
        const streakData = this.calculateHabitStreaks(activities);
        const labels = Object.keys(streakData);
        const data = labels.map(date => streakData[date]);

        return { labels, data, label: 'Daily Activities' };
    }

    // Calculate habit streaks
    calculateHabitStreaks(activities) {
        const dailyActivities = {};
        activities.forEach(activity => {
            const date = new Date(activity.date).toLocaleDateString();
            dailyActivities[date] = (dailyActivities[date] || 0) + 1;
        });

        return dailyActivities;
    }

    // Update UI elements
    updateUI() {
        this.updateStats();
        this.updateActivitiesList();
        this.updateRepairAlert();
    }

    // Update statistics
    updateStats() {
        const activities = this.activities;
        const totalActivities = activities.length;

        // Calculate repair index score
        const avgRepairIndex = activities.length > 0
            ? Math.round(activities.reduce((sum, a) => sum + a.repairIndex, 0) / activities.length)
            : 0;

        // Find most active category
        const categoryCount = {};
        activities.forEach(activity => {
            categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
        });
        const mostActiveCategory = Object.keys(categoryCount).length > 0
            ? this.formatCategoryLabel(Object.keys(categoryCount).reduce((a, b) =>
                categoryCount[a] > categoryCount[b] ? a : b))
            : 'None';

        // Calculate consistency score
        const consistencyScore = this.calculateConsistencyScore();

        document.getElementById('totalActivities').textContent = totalActivities;
        document.getElementById('repairIndexScore').textContent = avgRepairIndex;
        document.getElementById('mostActiveCategory').textContent = mostActiveCategory;
        document.getElementById('consistencyScore').textContent = `${consistencyScore}%`;
    }

    // Calculate consistency score
    calculateConsistencyScore() {
        if (this.activities.length < 7) return 0;

        const last7Days = this.getLastNDays(7);
        const activeDays = new Set(
            this.activities
                .filter(activity => last7Days.includes(new Date(activity.date).toDateString()))
                .map(activity => new Date(activity.date).toDateString())
        ).size;

        return Math.round((activeDays / 7) * 100);
    }

    // Update repair alert
    updateRepairAlert() {
        const alert = document.getElementById('repairAlert');
        const avgRepairIndex = this.activities.length > 0
            ? this.activities.reduce((sum, a) => sum + a.repairIndex, 0) / this.activities.length
            : 0;

        if (this.activities.length < 3) {
            alert.classList.add('hidden');
            return;
        }

        if (avgRepairIndex < 150) {
            document.getElementById('alertTitle').textContent = 'Cellular Repair Opportunity';
            document.getElementById('alertMessage').textContent =
                'Your cellular repair index could be improved. Consider incorporating more repair-supporting habits into your routine.';
            alert.classList.remove('hidden');
        } else {
            alert.classList.add('hidden');
        }
    }

    // Update activities list
    updateActivitiesList() {
        const activitiesList = document.getElementById('activitiesList');
        activitiesList.innerHTML = '';

        if (this.activities.length === 0) {
            activitiesList.innerHTML = '<p style="text-align: center; color: #888;">No cellular repair activities logged yet.</p>';
            return;
        }

        this.activities.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            activitiesList.appendChild(activityElement);
        });
    }

    // Create activity element
    createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = `activity-item category-${activity.category}`;

        div.innerHTML = `
            <div class="activity-header">
                <div class="activity-title">${activity.activityName}</div>
                <div class="activity-meta">
                    <span>${this.formatCategoryLabel(activity.category)}</span>
                    <span>${activity.activityType}</span>
                    <span>${new Date(activity.date).toLocaleDateString()}</span>
                    <span>Index: ${activity.repairIndex}</span>
                </div>
            </div>
            <div class="activity-details">
                <div><strong>Duration:</strong> ${activity.duration} minutes</div>
                <div><strong>Intensity:</strong> ${activity.intensity}/10</div>
                <div><strong>Biomarkers:</strong> Energy ${activity.biomarkers.energyLevel}, Inflammation ${activity.biomarkers.inflammationLevel}, Antioxidants ${activity.biomarkers.antioxidantStatus}, Repair ${activity.biomarkers.repairEfficiency}</div>
            </div>
            <div class="activity-notes">${activity.notes}</div>
            <div class="activity-benefits">
                ${activity.expectedBenefits.map(benefit =>
                    `<span class="benefit-tag">${this.formatBenefitLabel(benefit)}</span>`
                ).join('')}
            </div>
            <div class="activity-actions">
                <button class="btn-secondary" onclick="tracker.editActivity(${activity.id})">Edit</button>
                <button class="btn-danger" onclick="tracker.deleteActivity(${activity.id})">Delete</button>
            </div>
        `;

        return div;
    }

    // Filter activities
    filterActivities() {
        const categoryFilter = document.getElementById('filterCategory').value;
        const typeFilter = document.getElementById('filterType').value;

        let filtered = this.activities;

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(activity => activity.category === categoryFilter);
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(activity => activity.activityType === typeFilter);
        }

        this.displayFilteredActivities(filtered);
    }

    // Sort activities
    sortActivities() {
        const sortBy = document.getElementById('sortBy').value;
        let sorted = [...this.activities];

        switch (sortBy) {
            case 'date':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'intensity':
                sorted.sort((a, b) => b.intensity - a.intensity);
                break;
            case 'category':
                sorted.sort((a, b) => a.category.localeCompare(b.category));
                break;
            case 'repair-index':
                sorted.sort((a, b) => b.repairIndex - a.repairIndex);
                break;
        }

        this.activities = sorted;
        this.updateActivitiesList();
    }

    // Display filtered activities
    displayFilteredActivities(activities) {
        const activitiesList = document.getElementById('activitiesList');
        activitiesList.innerHTML = '';

        if (activities.length === 0) {
            activitiesList.innerHTML = '<p style="text-align: center; color: #888;">No activities match the current filters.</p>';
            return;
        }

        activities.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            activitiesList.appendChild(activityElement);
        });
    }

    // Generate insights
    generateInsights() {
        const insightsDiv = document.getElementById('insights');
        const activities = this.activities;

        if (activities.length < 3) {
            insightsDiv.innerHTML = '<p>Log several cellular repair activities to receive personalized insights about your cellular health optimization and repair efficiency.</p>';
            return;
        }

        const insights = [];

        // Category distribution insight
        const categoryCount = {};
        activities.forEach(activity => {
            categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
        });
        const topCategory = Object.keys(categoryCount).reduce((a, b) =>
            categoryCount[a] > categoryCount[b] ? a : b);
        insights.push(`Your most active cellular repair category is ${this.formatCategoryLabel(topCategory)} with ${categoryCount[topCategory]} activities.`);

        // Intensity trend
        const avgIntensity = activities.reduce((sum, a) => sum + a.intensity, 0) / activities.length;
        if (avgIntensity > 7) {
            insights.push('You\'re maintaining high-intensity cellular repair activities. Consider balancing with moderate activities for sustainability.');
        } else if (avgIntensity < 4) {
            insights.push('Your cellular repair activities are on the lower intensity side. Consider increasing intensity for better repair stimulation.');
        }

        // Biomarker analysis
        const avgBiomarkers = activities.reduce((acc, activity) => {
            acc.energyLevel += activity.biomarkers.energyLevel;
            acc.inflammationLevel += activity.biomarkers.inflammationLevel;
            acc.antioxidantStatus += activity.biomarkers.antioxidantStatus;
            acc.repairEfficiency += activity.biomarkers.repairEfficiency;
            return acc;
        }, { energyLevel: 0, inflammationLevel: 0, antioxidantStatus: 0, repairEfficiency: 0 });

        Object.keys(avgBiomarkers).forEach(key => {
            avgBiomarkers[key] /= activities.length;
        });

        if (avgBiomarkers.inflammationLevel > 7) {
            insights.push('High inflammation levels detected. Focus on anti-inflammatory repair activities.');
        }
        if (avgBiomarkers.antioxidantStatus < 5) {
            insights.push('Antioxidant status could be improved. Consider antioxidant-rich repair activities.');
        }

        // Consistency insight
        const consistencyScore = this.calculateConsistencyScore();
        if (consistencyScore > 80) {
            insights.push('Excellent consistency in your cellular repair habits! Keep up the great work.');
        } else if (consistencyScore < 50) {
            insights.push('Consider increasing the frequency of your cellular repair activities for better results.');
        }

        insightsDiv.innerHTML = insights.map(insight => `<p>• ${insight}</p>`).join('');
    }

    // Edit activity
    editActivity(id) {
        const activity = this.activities.find(a => a.id === id);
        if (!activity) return;

        // Populate form with activity data
        document.getElementById('repairDate').value = activity.date;
        document.getElementById('repairCategory').value = activity.category;
        document.getElementById('activityType').value = activity.activityType;
        document.getElementById('activityName').value = activity.activityName;
        document.getElementById('duration').value = activity.duration;
        document.getElementById('intensity').value = activity.intensity;
        document.getElementById('energyLevel').value = activity.biomarkers.energyLevel;
        document.getElementById('inflammationLevel').value = activity.biomarkers.inflammationLevel;
        document.getElementById('antioxidantStatus').value = activity.biomarkers.antioxidantStatus;
        document.getElementById('repairEfficiency').value = activity.biomarkers.repairEfficiency;
        document.getElementById('repairNotes').value = activity.notes;

        // Check expected benefits
        document.querySelectorAll('input[name="benefits"]').forEach(cb => {
            cb.checked = activity.expectedBenefits.includes(cb.value);
        });

        // Remove the activity and scroll to form
        this.deleteActivity(id);
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Delete activity
    deleteActivity(id) {
        if (confirm('Are you sure you want to delete this cellular repair activity?')) {
            this.activities = this.activities.filter(a => a.id !== id);
            this.saveActivities();
            this.updateUI();
            this.updateChart();
            this.generateInsights();
        }
    }

    // Utility functions
    formatCategoryLabel(category) {
        return category.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatBenefitLabel(benefit) {
        return benefit.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getFilteredActivities() {
        const days = this.currentTimeRange;
        if (days === 'all') return this.activities;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.activities.filter(activity =>
            new Date(activity.date) >= cutoffDate
        );
    }

    getLastNDays(n) {
        const dates = [];
        for (let i = 0; i < n; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toDateString());
        }
        return dates;
    }

    clearForm() {
        document.getElementById('repairForm').reset();
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
    saveActivities() {
        localStorage.setItem('cellularRepairActivities', JSON.stringify(this.activities));
    }

    loadActivities() {
        const data = localStorage.getItem('cellularRepairActivities');
        return data ? JSON.parse(data) : [];
    }
}

// Initialize the tracker when DOM is loaded
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new CellularRepairTracker();
});