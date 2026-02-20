// Lower Back Strain Tracker JavaScript
// This module tracks lower back discomfort linked to posture with pain logging and sitting duration analysis

class LowerBackStrainTracker {
    constructor() {
        // Initialize strain data from localStorage
        this.strainData = this.loadData();
        // Chart instance for Chart.js
        this.chart = null;
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and rendering all components
     */
    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.updatePainDisplay();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging strain events
        document.getElementById('strainForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logStrainEvent();
        });

        // Pain level slider updates display in real-time
        document.getElementById('painLevel').addEventListener('input', () => {
            this.updatePainDisplay();
        });

        // Chart time range controls
        document.getElementById('timeRange').addEventListener('change', () => {
            this.renderChart();
        });

        document.getElementById('refreshChart').addEventListener('click', () => {
            this.renderChart();
        });

        // History view controls
        document.getElementById('viewRecent').addEventListener('click', () => {
            this.toggleHistoryView('recent');
        });

        document.getElementById('viewAll').addEventListener('click', () => {
            this.toggleHistoryView('all');
        });
    }

    /**
     * Update the pain level display based on slider value
     * Maps numerical values to descriptive labels
     */
    updatePainDisplay() {
        const painLevel = document.getElementById('painLevel').value;
        const painValue = document.getElementById('painValue');
        const painText = document.getElementById('painText');

        painValue.textContent = painLevel;

        // Map pain levels to descriptive labels
        const painLabels = {
            1: 'Very Mild',
            2: 'Mild',
            3: 'Noticeable',
            4: 'Uncomfortable',
            5: 'Distressing',
            6: 'Intense',
            7: 'Severe',
            8: 'Very Severe',
            9: 'Excruciating',
            10: 'Worst Possible'
        };

        painText.textContent = painLabels[painLevel] || 'Moderate';
    }

    /**
     * Log a new strain event from the form data
     * Calculates strain metrics and validates input
     */
    logStrainEvent() {
        // Collect form data
        const formData = {
            id: Date.now(),
            date: document.getElementById('strainDate').value,
            time: document.getElementById('strainTime').value,
            painLevel: parseInt(document.getElementById('painLevel').value),
            sittingDuration: parseInt(document.getElementById('sittingDuration').value),
            postureType: document.getElementById('postureType').value,
            activityType: document.getElementById('activityType').value,
            strainNotes: document.getElementById('strainNotes').value
        };

        // Validate sitting duration
        if (formData.sittingDuration < 0 || formData.sittingDuration > 480) {
            alert('Sitting duration must be between 0 and 480 minutes.');
            return;
        }

        // Add timestamp and formatted data
        formData.timestamp = new Date().toISOString();
        formData.dateTime = `${formData.date}T${formData.time}`;

        // Save to data array
        this.strainData.push(formData);
        this.saveData();

        // Reset form
        document.getElementById('strainForm').reset();
        this.updatePainDisplay();

        // Update UI
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();

        // Show success message
        this.showNotification('Strain logged successfully!', 'success');
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        if (this.strainData.length === 0) {
            this.resetDashboard();
            return;
        }

        // Calculate metrics
        const painLevels = this.strainData.map(s => s.painLevel);
        const sittingDurations = this.strainData.map(s => s.sittingDuration);

        const avgPainLevel = Math.round((painLevels.reduce((a, b) => a + b, 0) / painLevels.length) * 10) / 10;
        const avgSittingTime = Math.round(sittingDurations.reduce((a, b) => a + b, 0) / sittingDurations.length);
        const totalEpisodes = this.strainData.length;

        // Calculate strain score (0-100, higher = more strain)
        // Based on average pain level and sitting duration
        const painScore = (avgPainLevel / 10) * 60; // 60% weight on pain
        const sittingScore = Math.min((avgSittingTime / 120) * 40, 40); // 40% weight on sitting, max at 2 hours
        const strainScore = Math.round(painScore + sittingScore);

        // Update DOM
        document.getElementById('avgPainLevel').textContent = avgPainLevel;
        document.getElementById('avgSittingTime').textContent = `${avgSittingTime}m`;
        document.getElementById('totalEpisodes').textContent = totalEpisodes;
        document.getElementById('strainScore').textContent = strainScore;

        // Update risk indicator
        this.updateRiskIndicator(strainScore);
    }

    /**
     * Reset dashboard to default values
     */
    resetDashboard() {
        document.getElementById('avgPainLevel').textContent = '--';
        document.getElementById('avgSittingTime').textContent = '--';
        document.getElementById('totalEpisodes').textContent = '0';
        document.getElementById('strainScore').textContent = '--';
        this.updateRiskIndicator(0);
    }

    /**
     * Update the risk level indicator
     */
    updateRiskIndicator(score) {
        const fill = document.getElementById('riskFill');
        const label = document.getElementById('riskLabel');

        fill.style.setProperty('--fill-width', `${score}%`);
        fill.style.width = `${score}%`;

        if (score >= 70) label.textContent = 'High Risk - Immediate attention needed';
        else if (score >= 50) label.textContent = 'Moderate Risk - Monitor closely';
        else if (score >= 30) label.textContent = 'Low Risk - Good management';
        else if (score >= 10) label.textContent = 'Very Low Risk - Excellent';
        else label.textContent = 'No data available';
    }

    /**
     * Render the strain trends chart with sitting duration overlay
     */
    renderChart() {
        const ctx = document.getElementById('strainChart').getContext('2d');
        const timeRange = document.getElementById('timeRange').value;

        // Filter data based on time range
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Group by date and calculate averages
        const dateGroups = {};
        filteredData.forEach(strain => {
            const date = strain.date;
            if (!dateGroups[date]) {
                dateGroups[date] = { pain: [], sitting: [] };
            }
            dateGroups[date].pain.push(strain.painLevel);
            dateGroups[date].sitting.push(strain.sittingDuration);
        });

        const labels = Object.keys(dateGroups).sort();
        const painData = labels.map(date => {
            const pains = dateGroups[date].pain;
            return pains.reduce((a, b) => a + b, 0) / pains.length;
        });
        const sittingData = labels.map(date => {
            const sittings = dateGroups[date].sitting;
            return sittings.reduce((a, b) => a + b, 0) / sittings.length;
        });

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Pain Level',
                    data: painData,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Average Sitting Duration (min)',
                    data: sittingData,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Pain Level (1-10)'
                        },
                        min: 0,
                        max: 10
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Sitting Duration (minutes)'
                        },
                        min: 0,
                        grid: {
                            drawOnChartArea: false,
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // We'll use custom legend
                    }
                }
            }
        });
    }

    /**
     * Render the strain history
     */
    renderHistory(view = 'recent') {
        const historyList = document.getElementById('strainHistory');
        let dataToShow = this.strainData;

        if (view === 'recent') {
            dataToShow = this.strainData.slice(-10).reverse();
        } else {
            dataToShow = this.strainData.slice().reverse();
        }

        historyList.innerHTML = '';

        if (dataToShow.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No strain episodes logged yet.</p>';
            return;
        }

        dataToShow.forEach(strain => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const postureLabel = this.formatPostureType(strain.postureType);
            const activityLabel = this.formatActivityType(strain.activityType);
            const date = new Date(strain.date).toLocaleDateString();
            const time = strain.time;

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${activityLabel}</div>
                    <div class="history-item-pain">Pain: ${strain.painLevel}/10</div>
                </div>
                <div class="history-item-details">
                    <p><strong>Posture:</strong> ${postureLabel}</p>
                    <p><strong>Sitting Duration:</strong> ${strain.sittingDuration} minutes</p>
                    ${strain.strainNotes ? `<p><strong>Notes:</strong> ${strain.strainNotes}</p>` : ''}
                </div>
                <div class="history-item-meta">
                    <span>${date} at ${time}</span>
                    <span>ID: ${strain.id}</span>
                </div>
            `;

            historyList.appendChild(historyItem);
        });
    }

    /**
     * Render posture and strain insights
     */
    renderInsights() {
        if (this.strainData.length === 0) return;

        // Pain patterns
        const painLevels = this.strainData.map(s => s.painLevel);
        const avgPain = painLevels.reduce((a, b) => a + b, 0) / painLevels.length;
        const maxPain = Math.max(...painLevels);

        const painPatterns = document.getElementById('painPatterns');
        let patternText = `Your average pain level is ${avgPain.toFixed(1)}/10 with peaks at ${maxPain}/10. `;

        if (avgPain >= 7) {
            patternText += 'Your pain levels are consistently high - consider consulting a healthcare professional.';
        } else if (avgPain >= 5) {
            patternText += 'You experience moderate pain - focus on posture correction and regular breaks.';
        } else if (avgPain >= 3) {
            patternText += 'You have mild discomfort - good awareness, continue monitoring.';
        } else {
            patternText += 'You maintain low pain levels - excellent posture habits!';
        }

        painPatterns.innerHTML = `<p>${patternText}</p>`;

        // Posture risks
        const postureCounts = {};
        this.strainData.forEach(strain => {
            postureCounts[strain.postureType] = (postureCounts[strain.postureType] || 0) + 1;
        });

        const riskyPostures = Object.entries(postureCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        const postureRisks = document.getElementById('postureRisks');
        if (riskyPostures.length > 0) {
            let riskText = 'Your most common postures during strain episodes: ';
            riskText += riskyPostures.map(([posture, count]) =>
                `${this.formatPostureType(posture)} (${count} times)`
            ).join(', ');
            riskText += '. Consider adjusting these positions to reduce strain.';
            postureRisks.innerHTML = `<p>${riskText}</p>`;
        }

        // Sitting habits
        const sittingDurations = this.strainData.map(s => s.sittingDuration);
        const avgSitting = sittingDurations.reduce((a, b) => a + b, 0) / sittingDurations.length;
        const longSitting = sittingDurations.filter(d => d > 120).length;

        const sittingHabits = document.getElementById('sittingHabits');
        let sittingText = `Your average sitting duration before pain is ${Math.round(avgSitting)} minutes. `;

        if (longSitting > this.strainData.length * 0.5) {
            sittingText += 'You frequently sit for extended periods (>2 hours) before experiencing pain. Try taking breaks every 45-60 minutes.';
        } else if (avgSitting > 90) {
            sittingText += 'You tend to sit for longer periods before pain occurs. Consider more frequent position changes.';
        } else {
            sittingText += 'You experience pain after relatively short sitting periods. Focus on maintaining proper posture throughout.';
        }

        sittingHabits.innerHTML = `<p>${sittingText}</p>`;

        // Render tips
        this.renderTips();
    }

    /**
     * Render personalized tips based on data
     */
    renderTips() {
        const tipsList = document.getElementById('tips');
        tipsList.innerHTML = '';

        if (this.strainData.length < 3) {
            this.addTip('Start logging your back strain episodes to get personalized posture and ergonomics recommendations.', '📝');
            return;
        }

        const avgPain = this.strainData.reduce((sum, s) => sum + s.painLevel, 0) / this.strainData.length;
        const avgSitting = this.strainData.reduce((sum, s) => sum + s.sittingDuration, 0) / this.strainData.length;

        if (avgSitting > 120) {
            this.addTip('Set a timer to stand up and stretch every 45-60 minutes during work sessions.', '⏰');
            this.addTip('Try a standing desk or alternate between sitting and standing throughout the day.', '🪑');
        }

        if (avgPain >= 6) {
            this.addTip('Consider consulting a healthcare professional for persistent high pain levels.', '🏥');
            this.addTip('Apply ice or heat therapy and consider gentle stretching exercises recommended by a professional.', '🧊');
        }

        // Check for posture patterns
        const postureCounts = {};
        this.strainData.forEach(strain => {
            postureCounts[strain.postureType] = (postureCounts[strain.postureType] || 0) + 1;
        });

        const mostCommonPosture = Object.entries(postureCounts)
            .sort(([,a], [,b]) => b - a)[0];

        if (mostCommonPosture && mostCommonPosture[1] >= 3) {
            const posture = mostCommonPosture[0];
            if (posture === 'slouched') {
                this.addTip('Work on maintaining an upright posture with proper lumbar support.', '📐');
            } else if (posture === 'crossed_legs') {
                this.addTip('Avoid crossing your legs while sitting - keep both feet flat on the floor.', '🦵');
            } else if (posture === 'no_back_support') {
                this.addTip('Ensure your chair provides proper back support, especially in the lumbar region.', '💺');
            }
        }

        this.addTip('Practice the "20-20-20" rule: Every 20 minutes, look at something 20 feet away for 20 seconds.', '👁️');
        this.addTip('Keep your computer screen at eye level and about an arm\'s length away.', '💻');
    }

    /**
     * Add a tip to the tips list
     */
    addTip(text, icon) {
        const tipItem = document.createElement('div');
        tipItem.className = 'tip-item';
        tipItem.innerHTML = `
            <h4>${icon} Tip</h4>
            <p>${text}</p>
        `;
        document.getElementById('tips').appendChild(tipItem);
    }

    /**
     * Toggle between recent and all history views
     */
    toggleHistoryView(view) {
        // Update button states
        document.getElementById('viewRecent').classList.toggle('active', view === 'recent');
        document.getElementById('viewAll').classList.toggle('active', view === 'all');

        // Render history
        this.renderHistory(view);
    }

    /**
     * Filter data by time range
     */
    filterDataByTimeRange(range) {
        if (range === 'all') return this.strainData;

        const days = parseInt(range);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.strainData.filter(strain => {
            const strainDate = new Date(strain.date);
            return strainDate >= cutoffDate;
        });
    }

    /**
     * Format posture type for display
     */
    formatPostureType(posture) {
        const postureLabels = {
            'good': 'Good posture',
            'slouched': 'Slouched forward',
            'leaning': 'Leaning to side',
            'crossed_legs': 'Crossed legs',
            'no_back_support': 'No back support',
            'standing': 'Standing/walking',
            'other': 'Other'
        };
        return postureLabels[posture] || posture;
    }

    /**
     * Format activity type for display
     */
    formatActivityType(activity) {
        const activityLabels = {
            'desk_work': 'Desk work/computer',
            'meeting': 'Meeting/conference',
            'driving': 'Driving',
            'reading': 'Reading',
            'eating': 'Eating at desk',
            'phone': 'Phone use',
            'other': 'Other activity'
        };
        return activityLabels[activity] || activity;
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Simple alert for now - could be enhanced with toast notifications
        alert(message);
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('lowerBackStrainData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        localStorage.setItem('lowerBackStrainData', JSON.stringify(this.strainData));
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LowerBackStrainTracker();
});