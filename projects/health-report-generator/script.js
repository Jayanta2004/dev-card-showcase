// Health Report Generator JavaScript
class HealthReportGenerator {
    constructor() {
        this.charts = {};
        this.reportData = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDates();
        this.checkForExistingData();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('report-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateReport();
        });

        // Quick date buttons
        document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setQuickDate(e.target.dataset.days);
            });
        });

        // Export buttons
        document.getElementById('print-btn').addEventListener('click', () => {
            this.printReport();
        });

        document.getElementById('pdf-btn').addEventListener('click', () => {
            this.exportPDF();
        });

        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareReport();
        });

        // Clear data button
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all health data? This action cannot be undone.')) {
                this.clearAllData();
            }
        });
    }

    setDefaultDates() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); // Default to last 30 days

        document.getElementById('start-date').value = this.formatDateForInput(startDate);
        document.getElementById('end-date').value = this.formatDateForInput(endDate);
    }

    setQuickDate(days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(days));

        document.getElementById('start-date').value = this.formatDateForInput(startDate);
        document.getElementById('end-date').value = this.formatDateForInput(endDate);

        // Update active button
        document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    checkForExistingData() {
        // Check if any health data exists
        const hasData = this.checkDataAvailability();
        if (!hasData.anyData) {
            document.getElementById('no-data-message').classList.remove('hidden');
        }
    }

    checkDataAvailability() {
        const dataStatus = {
            meditation: false,
            calories: false,
            activities: false,
            weight: false,
            anyData: false
        };

        try {
            // Check meditation data
            const meditationData = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
            dataStatus.meditation = meditationData.length > 0;

            // Check calorie burn data
            const calorieData = JSON.parse(localStorage.getItem('calorieBurnData') || '[]');
            dataStatus.calories = calorieData.length > 0;

            // Check activity data
            const activityData = JSON.parse(localStorage.getItem('activityData') || '[]');
            dataStatus.activities = activityData.length > 0;

            // Check weight data (if exists)
            const weightData = JSON.parse(localStorage.getItem('weightData') || '[]');
            dataStatus.weight = weightData.length > 0;

            dataStatus.anyData = dataStatus.meditation || dataStatus.calories ||
                               dataStatus.activities || dataStatus.weight;

        } catch (error) {
            console.warn('Error checking data availability:', error);
        }

        return dataStatus;
    }

    async generateReport() {
        const formData = new FormData(document.getElementById('report-form'));
        const config = {
            startDate: new Date(document.getElementById('start-date').value),
            endDate: new Date(document.getElementById('end-date').value),
            metrics: formData.getAll('metrics'),
            options: formData.getAll('options')
        };

        // Validate date range
        if (config.startDate > config.endDate) {
            this.showMessage('Start date cannot be after end date', 'error');
            return;
        }

        // Show loading
        this.showLoading(true);

        try {
            // Collect data from all sources
            this.reportData = await this.collectReportData(config);

            if (!this.reportData.hasData) {
                document.getElementById('no-data-message').classList.remove('hidden');
                document.getElementById('report-container').classList.add('hidden');
                this.showLoading(false);
                return;
            }

            // Generate report sections
            this.renderReport(config);
            this.generateCharts(config);
            this.generateInsights(config);

            // Show report
            document.getElementById('report-container').classList.remove('hidden');
            document.getElementById('no-data-message').classList.add('hidden');

            this.showMessage('Report generated successfully!', 'success');

        } catch (error) {
            console.error('Error generating report:', error);
            this.showMessage('Error generating report. Please try again.', 'error');
        }

        this.showLoading(false);
    }

    async collectReportData(config) {
        const reportData = {
            hasData: false,
            dateRange: {
                start: config.startDate,
                end: config.endDate
            },
            metrics: {}
        };

        // Collect meditation data
        if (config.metrics.includes('meditation')) {
            const meditationData = this.getMeditationData(config.startDate, config.endDate);
            if (meditationData.length > 0) {
                reportData.metrics.meditation = meditationData;
                reportData.hasData = true;
            }
        }

        // Collect calorie burn data
        if (config.metrics.includes('calories')) {
            const calorieData = this.getCalorieData(config.startDate, config.endDate);
            if (calorieData.length > 0) {
                reportData.metrics.calories = calorieData;
                reportData.hasData = true;
            }
        }

        // Collect activity data
        if (config.metrics.includes('activities')) {
            const activityData = this.getActivityData(config.startDate, config.endDate);
            if (activityData.length > 0) {
                reportData.metrics.activities = activityData;
                reportData.hasData = true;
            }
        }

        // Collect weight data
        if (config.metrics.includes('weight')) {
            const weightData = this.getWeightData(config.startDate, config.endDate);
            if (weightData.length > 0) {
                reportData.metrics.weight = weightData;
                reportData.hasData = true;
            }
        }

        return reportData;
    }

    getMeditationData(startDate, endDate) {
        try {
            const data = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
            return data.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= startDate && sessionDate <= endDate;
            });
        } catch (error) {
            console.warn('Error loading meditation data:', error);
            return [];
        }
    }

    getCalorieData(startDate, endDate) {
        try {
            const data = JSON.parse(localStorage.getItem('calorieBurnData') || '[]');
            return data.filter(activity => {
                const activityDate = new Date(activity.date);
                return activityDate >= startDate && activityDate <= endDate;
            });
        } catch (error) {
            console.warn('Error loading calorie data:', error);
            return [];
        }
    }

    getActivityData(startDate, endDate) {
        try {
            const data = JSON.parse(localStorage.getItem('activityData') || '[]');
            return data.filter(activity => {
                const activityDate = new Date(activity.date);
                return activityDate >= startDate && activityDate <= endDate;
            });
        } catch (error) {
            console.warn('Error loading activity data:', error);
            return [];
        }
    }

    getWeightData(startDate, endDate) {
        try {
            const data = JSON.parse(localStorage.getItem('weightData') || '[]');
            return data.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= startDate && entryDate <= endDate;
            });
        } catch (error) {
            console.warn('Error loading weight data:', error);
            return [];
        }
    }

    renderReport(config) {
        // Update report header
        const dateRange = `${config.startDate.toLocaleDateString()} - ${config.endDate.toLocaleDateString()}`;
        document.getElementById('report-date-range').textContent = dateRange;
        document.getElementById('generation-date').textContent = new Date().toLocaleDateString();

        // Generate summary
        if (config.options.includes('summary')) {
            this.generateSummary();
        } else {
            document.getElementById('executive-summary').style.display = 'none';
        }

        // Update key metrics
        this.updateKeyMetrics();

        // Show/hide sections based on options
        this.toggleReportSections(config);
    }

    generateSummary() {
        const summary = document.getElementById('summary-content');
        const data = this.reportData.metrics;

        let summaryText = '';

        // Calculate period length
        const days = Math.ceil((this.reportData.dateRange.end - this.reportData.dateRange.start) / (1000 * 60 * 60 * 24));

        summaryText += `This health report covers a ${days}-day period from ${this.reportData.dateRange.start.toLocaleDateString()} to ${this.reportData.dateRange.end.toLocaleDateString()}. `;

        // Meditation summary
        if (data.meditation && data.meditation.length > 0) {
            const totalSessions = data.meditation.length;
            const totalMinutes = data.meditation.reduce((sum, s) => sum + s.duration, 0);
            const avgSession = Math.round(totalMinutes / totalSessions);
            summaryText += `You completed ${totalSessions} meditation sessions totaling ${totalMinutes} minutes, with an average session length of ${avgSession} minutes. `;
        }

        // Calorie burn summary
        if (data.calories && data.calories.length > 0) {
            const totalCalories = data.calories.reduce((sum, a) => sum + a.calories, 0);
            const activities = data.calories.length;
            summaryText += `You burned ${totalCalories.toLocaleString()} calories across ${activities} activities. `;
        }

        // Activity summary
        if (data.activities && data.activities.length > 0) {
            const totalHours = data.activities.reduce((sum, a) => sum + (a.duration / 60), 0);
            const wellnessScore = this.calculateAverageWellness(data.activities);
            summaryText += `You logged ${Math.round(totalHours * 10) / 10} hours of activities with an average wellness score of ${wellnessScore}. `;
        }

        // Weight summary
        if (data.weight && data.weight.length > 0) {
            const firstWeight = data.weight[0].weight;
            const lastWeight = data.weight[data.weight.length - 1].weight;
            const change = lastWeight - firstWeight;
            const direction = change > 0 ? 'gained' : change < 0 ? 'lost' : 'maintained';
            summaryText += `Your weight ${direction} ${Math.abs(change).toFixed(1)} kg during this period.`;
        }

        if (summaryText === '') {
            summaryText = 'No health data was found for the selected period.';
        }

        summary.innerHTML = `<p>${summaryText}</p>`;
    }

    updateKeyMetrics() {
        const data = this.reportData.metrics;

        // Meditation metrics
        if (data.meditation) {
            const total = data.meditation.length;
            const trend = this.calculateTrend(data.meditation, 'duration');
            document.getElementById('meditation-total').textContent = `${total} sessions`;
            document.getElementById('meditation-trend').textContent = trend.text;
            document.getElementById('meditation-trend').className = `metric-trend ${trend.class}`;
        }

        // Calorie metrics
        if (data.calories) {
            const total = data.calories.reduce((sum, a) => sum + a.calories, 0);
            const trend = this.calculateTrend(data.calories, 'calories');
            document.getElementById('calories-total').textContent = `${total.toLocaleString()} kcal`;
            document.getElementById('calories-trend').textContent = trend.text;
            document.getElementById('calories-trend').className = `metric-trend ${trend.class}`;
        }

        // Activity metrics
        if (data.activities) {
            const totalHours = data.activities.reduce((sum, a) => sum + (a.duration / 60), 0);
            document.getElementById('activity-total').textContent = `${Math.round(totalHours * 10) / 10} hours`;
            // Note: Activity trend would need different calculation
        }

        // Weight metrics
        if (data.weight && data.weight.length > 1) {
            const first = data.weight[0].weight;
            const last = data.weight[data.weight.length - 1].weight;
            const change = last - first;
            const direction = change > 0 ? '+' : '';
            document.getElementById('weight-change').textContent = `${direction}${change.toFixed(1)} kg`;
            document.getElementById('weight-trend').textContent = change > 0 ? 'Weight increased' : change < 0 ? 'Weight decreased' : 'Weight stable';
            document.getElementById('weight-trend').className = `metric-trend ${change > 0 ? 'negative' : change < 0 ? 'positive' : ''}`;
        }
    }

    calculateTrend(data, field) {
        if (data.length < 2) return { text: 'Not enough data', class: '' };

        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));

        const firstAvg = firstHalf.reduce((sum, item) => sum + item[field], 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, item) => sum + item[field], 0) / secondHalf.length;

        const change = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (Math.abs(change) < 5) {
            return { text: 'Stable', class: '' };
        } else if (change > 0) {
            return { text: `+${change.toFixed(1)}%`, class: 'positive' };
        } else {
            return { text: `${change.toFixed(1)}%`, class: 'negative' };
        }
    }

    calculateAverageWellness(activities) {
        // Simple wellness calculation based on activity diversity and consistency
        const uniqueActivities = new Set(activities.map(a => a.type)).size;
        const totalHours = activities.reduce((sum, a) => sum + (a.duration / 60), 0);
        const days = Math.ceil((this.reportData.dateRange.end - this.reportData.dateRange.start) / (1000 * 60 * 60 * 24));
        const avgHoursPerDay = totalHours / days;

        let score = 0;
        score += Math.min(uniqueActivities * 10, 40); // Diversity (max 40)
        score += Math.min(avgHoursPerDay * 5, 40); // Consistency (max 40)
        score += activities.length > days * 0.7 ? 20 : 10; // Frequency bonus (max 20)

        return Math.min(Math.round(score), 100);
    }

    toggleReportSections(config) {
        const sections = {
            'executive-summary': config.options.includes('summary'),
            'key-metrics': true, // Always show
            'charts-section': config.options.includes('charts'),
            'detailed-analysis': config.options.includes('trends'),
            'recommendations': config.options.includes('recommendations')
        };

        Object.entries(sections).forEach(([sectionId, show]) => {
            document.getElementById(sectionId).style.display = show ? 'block' : 'none';
        });
    }

    generateCharts(config) {
        if (!config.options.includes('charts')) return;

        // Destroy existing charts
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};

        const data = this.reportData.metrics;

        // Activity overview chart
        if (data.activities) {
            this.createActivityChart(data.activities);
        }

        // Meditation progress chart
        if (data.meditation) {
            this.createMeditationChart(data.meditation);
        }

        // Calorie burn trends chart
        if (data.calories) {
            this.createCaloriesChart(data.calories);
        }

        // Weight progress chart
        if (data.weight) {
            this.createWeightChart(data.weight);
        }
    }

    createActivityChart(activities) {
        const ctx = document.getElementById('activityChart').getContext('2d');

        // Group by date
        const dailyData = {};
        activities.forEach(activity => {
            const date = new Date(activity.date).toLocaleDateString();
            dailyData[date] = (dailyData[date] || 0) + (activity.duration / 60);
        });

        const labels = Object.keys(dailyData).sort();
        const data = labels.map(date => dailyData[date]);

        this.charts.activityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Hours per Day',
                    data,
                    backgroundColor: 'rgba(37, 99, 235, 0.6)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    createMeditationChart(meditations) {
        const ctx = document.getElementById('meditationChart').getContext('2d');

        // Group by date
        const dailyData = {};
        meditations.forEach(session => {
            const date = new Date(session.date).toLocaleDateString();
            dailyData[date] = (dailyData[date] || 0) + session.duration;
        });

        const labels = Object.keys(dailyData).sort();
        const data = labels.map(date => dailyData[date]);

        this.charts.meditationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Minutes per Day',
                    data,
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    createCaloriesChart(calories) {
        const ctx = document.getElementById('caloriesChart').getContext('2d');

        // Group by date
        const dailyData = {};
        calories.forEach(activity => {
            const date = new Date(activity.date).toLocaleDateString();
            dailyData[date] = (dailyData[date] || 0) + activity.calories;
        });

        const labels = Object.keys(dailyData).sort();
        const data = labels.map(date => dailyData[date]);

        this.charts.caloriesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Calories per Day',
                    data,
                    borderColor: 'rgba(245, 101, 101, 1)',
                    backgroundColor: 'rgba(245, 101, 101, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Calories'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    createWeightChart(weights) {
        const ctx = document.getElementById('weightChart').getContext('2d');

        const labels = weights.map(w => new Date(w.date).toLocaleDateString());
        const data = weights.map(w => w.weight);

        this.charts.weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Weight (kg)',
                    data,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    generateInsights(config) {
        if (!config.options.includes('trends')) return;

        const data = this.reportData.metrics;

        // Activity patterns
        if (data.activities) {
            this.generateActivityPatterns(data.activities);
        }

        // Consistency analysis
        this.generateConsistencyAnalysis(data);

        // Health score trends
        if (data.activities) {
            this.generateHealthScoreTrends(data.activities);
        }

        // Recommendations
        if (config.options.includes('recommendations')) {
            this.generateRecommendations(data);
        }
    }

    generateActivityPatterns(activities) {
        const patterns = document.getElementById('activity-patterns');

        const categoryCount = {};
        activities.forEach(activity => {
            const category = this.getActivityCategory(activity.type);
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const mostCommon = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)[0];

        const totalActivities = activities.length;
        const uniqueActivities = new Set(activities.map(a => a.type)).size;

        let analysis = `You participated in ${totalActivities} activities across ${uniqueActivities} different types. `;

        if (mostCommon) {
            const percentage = Math.round((mostCommon[1] / totalActivities) * 100);
            analysis += `Your most common activity category was ${mostCommon[0]} (${percentage}% of activities). `;
        }

        // Time analysis
        const avgDuration = activities.reduce((sum, a) => sum + a.duration, 0) / activities.length;
        analysis += `Average activity duration was ${Math.round(avgDuration)} minutes.`;

        patterns.textContent = analysis;
    }

    generateConsistencyAnalysis(data) {
        const analysis = document.getElementById('consistency-analysis');

        const days = Math.ceil((this.reportData.dateRange.end - this.reportData.dateRange.start) / (1000 * 60 * 60 * 24));

        let consistencyText = `Analysis period: ${days} days. `;

        // Calculate active days for each metric
        const metrics = [
            { name: 'Meditation', data: data.meditation, key: 'meditation' },
            { name: 'Calorie Burn', data: data.calories, key: 'calories' },
            { name: 'General Activities', data: data.activities, key: 'activities' }
        ];

        metrics.forEach(metric => {
            if (metric.data && metric.data.length > 0) {
                const activeDays = new Set(metric.data.map(item => item.date)).size;
                const consistency = Math.round((activeDays / days) * 100);
                consistencyText += `${metric.name}: ${consistency}% consistency (${activeDays}/${days} days). `;
            }
        });

        analysis.textContent = consistencyText;
    }

    generateHealthScoreTrends(activities) {
        const trends = document.getElementById('health-score-trends');

        // Calculate daily wellness scores
        const dailyScores = {};
        activities.forEach(activity => {
            const date = activity.date;
            if (!dailyScores[date]) {
                dailyScores[date] = [];
            }
            dailyScores[date].push(activity);
        });

        const scores = Object.values(dailyScores).map(dayActivities => {
            return this.calculateAverageWellness(dayActivities);
        });

        if (scores.length > 1) {
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
            const secondHalf = scores.slice(Math.floor(scores.length / 2));

            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            const trend = secondAvg - firstAvg;

            let trendText = `Average wellness score: ${Math.round(avgScore)}. `;
            if (Math.abs(trend) < 5) {
                trendText += 'Wellness score remained stable throughout the period.';
            } else if (trend > 0) {
                trendText += `Wellness score improved by ${Math.round(trend)} points.`;
            } else {
                trendText += `Wellness score decreased by ${Math.round(Math.abs(trend))} points.`;
            }

            trends.textContent = trendText;
        } else {
            trends.textContent = 'Not enough data for trend analysis.';
        }
    }

    generateRecommendations(data) {
        const recommendations = document.getElementById('recommendations-content');
        const recs = [];

        // Meditation recommendations
        if (!data.meditation || data.meditation.length === 0) {
            recs.push({
                icon: 'fas fa-brain',
                title: 'Start Meditation Practice',
                description: 'Regular meditation can improve mental clarity, reduce stress, and enhance overall wellness.'
            });
        } else if (data.meditation.length < 7) {
            recs.push({
                icon: 'fas fa-brain',
                title: 'Increase Meditation Frequency',
                description: 'Consider meditating daily to maximize the mental health benefits.'
            });
        }

        // Activity recommendations
        if (!data.activities || data.activities.length === 0) {
            recs.push({
                icon: 'fas fa-running',
                title: 'Start Activity Tracking',
                description: 'Begin logging your daily activities to understand your wellness patterns.'
            });
        } else {
            const uniqueActivities = new Set(data.activities.map(a => a.type)).size;
            if (uniqueActivities < 3) {
                recs.push({
                    icon: 'fas fa-dumbbell',
                    title: 'Diversify Activities',
                    description: 'Try different types of activities to improve overall wellness and prevent burnout.'
                });
            }
        }

        // Calorie burn recommendations
        if (!data.calories || data.calories.length === 0) {
            recs.push({
                icon: 'fas fa-fire',
                title: 'Track Calorie Burn',
                description: 'Monitor your physical activities to understand your energy expenditure.'
            });
        }

        // Weight recommendations
        if (data.weight && data.weight.length > 1) {
            const first = data.weight[0].weight;
            const last = data.weight[data.weight.length - 1].weight;
            const change = last - first;

            if (Math.abs(change) > 2) {
                recs.push({
                    icon: 'fas fa-weight',
                    title: 'Weight Change Analysis',
                    description: 'Consider consulting a healthcare professional about your weight changes.'
                });
            }
        }

        // General recommendations
        recs.push({
            icon: 'fas fa-balance-scale',
            title: 'Maintain Balance',
            description: 'Aim for a mix of physical, mental, and social activities for optimal wellness.'
        });

        recommendations.innerHTML = recs.map(rec => `
            <div class="recommendation-item">
                <i class="${rec.icon}"></i>
                <div class="content">
                    <div class="title">${rec.title}</div>
                    <div class="description">${rec.description}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityCategory(type) {
        const categories = {
            physical: ['walking', 'running', 'cycling', 'swimming', 'yoga', 'weight-training', 'sports'],
            mental: ['meditation', 'reading', 'learning', 'creative-work'],
            social: ['socializing'],
            work: ['work', 'housework']
        };

        for (const [category, activities] of Object.entries(categories)) {
            if (activities.includes(type)) {
                return category;
            }
        }

        return 'other';
    }

    printReport() {
        window.print();
    }

    async exportPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Add title
            pdf.setFontSize(20);
            pdf.text('Health Report', 20, 30);

            // Add date range
            pdf.setFontSize(12);
            const dateRange = document.getElementById('report-date-range').textContent;
            pdf.text(`Period: ${dateRange}`, 20, 45);

            // Add summary
            const summary = document.getElementById('summary-content').textContent;
            pdf.text('Summary:', 20, 60);
            const splitSummary = pdf.splitTextToSize(summary, 170);
            pdf.text(splitSummary, 20, 70);

            // Add charts as images
            let yPosition = 100;
            for (const [chartId, chart] of Object.entries(this.charts)) {
                if (yPosition > 250) {
                    pdf.addPage();
                    yPosition = 30;
                }

                const canvas = document.getElementById(chartId);
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 60);
                yPosition += 80;
            }

            // Save PDF
            pdf.save(`health-report-${new Date().toISOString().split('T')[0]}.pdf`);
            this.showMessage('PDF exported successfully!', 'success');

        } catch (error) {
            console.error('PDF export error:', error);
            this.showMessage('Error exporting PDF. Please try again.', 'error');
        }
    }

    shareReport() {
        if (navigator.share) {
            navigator.share({
                title: 'Health Report',
                text: 'Check out my health report',
                url: window.location.href
            });
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showMessage('Report URL copied to clipboard!', 'success');
            });
        }
    }

    clearAllData() {
        const keys = ['meditationSessions', 'calorieBurnData', 'activityData', 'weightData'];
        keys.forEach(key => localStorage.removeItem(key));

        // Reset the interface
        document.getElementById('report-container').classList.add('hidden');
        document.getElementById('no-data-message').classList.remove('hidden');

        this.showMessage('All health data cleared successfully.', 'success');
    }

    showLoading(show) {
        const submitBtn = document.querySelector('#report-form button[type="submit"]');
        if (show) {
            submitBtn.innerHTML = '<span class="loading"></span> Generating...';
            submitBtn.disabled = true;
        } else {
            submitBtn.innerHTML = '<i class="fas fa-chart-line"></i> Generate Report';
            submitBtn.disabled = false;
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `success-message ${type}`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Initialize the report generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HealthReportGenerator();
});