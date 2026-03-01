// Nap Efficiency Tracker JavaScript

class NapEfficiencyTracker {
    constructor() {
        this.naps = JSON.parse(localStorage.getItem('napSessions')) || [];
        this.pendingRating = JSON.parse(localStorage.getItem('pendingNapRating')) || null;
        this.timer = {
            interval: null,
            startTime: null,
            pausedTime: 0,
            isRunning: false,
            isPaused: false,
            duration: 20 * 60 * 1000 // 20 minutes in milliseconds
        };

        this.initializeEventListeners();
        this.renderNapList();
        this.renderAnalytics();
        this.checkPendingRating();
        this.updateTimerDisplay();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('napForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logNap();
        });

        // Rating submission
        document.getElementById('submitRating').addEventListener('click', () => {
            this.submitRating();
        });

        // Timer controls
        document.getElementById('startTimer').addEventListener('click', () => {
            this.startTimer();
        });

        document.getElementById('pauseTimer').addEventListener('click', () => {
            this.pauseTimer();
        });

        document.getElementById('resetTimer').addEventListener('click', () => {
            this.resetTimer();
        });

        // Timer duration change
        document.getElementById('timerDuration').addEventListener('change', (e) => {
            this.timer.duration = parseInt(e.target.value) * 60 * 1000;
            this.updateTimerDisplay();
        });
    }

    logNap() {
        const formData = new FormData(document.getElementById('napForm'));
        const napDate = new Date(formData.get('napDate'));
        const duration = parseInt(formData.get('napDuration'));
        const type = formData.get('napType');
        const preEnergy = parseInt(document.getElementById('preNapEnergy').value);
        const wakeMethod = formData.get('wakeUpMethod');

        const nap = {
            id: Date.now(),
            date: napDate.toISOString(),
            duration,
            type,
            preEnergy,
            wakeMethod,
            rated: false
        };

        this.naps.push(nap);
        this.saveNaps();

        // Set pending rating
        this.pendingRating = nap.id;
        localStorage.setItem('pendingNapRating', JSON.stringify(this.pendingRating));

        // Reset form
        document.getElementById('napForm').reset();
        document.getElementById('preNapEnergy').value = 5;

        // Show rating interface
        this.showRatingInterface(nap);

        // Update displays
        this.renderNapList();
        this.renderAnalytics();
    }

    showRatingInterface(nap) {
        document.getElementById('pendingRatings').style.display = 'none';
        document.getElementById('ratingInterface').style.display = 'block';

        const summary = `Nap on ${new Date(nap.date).toLocaleDateString()} at ${new Date(nap.date).toLocaleTimeString()} for ${nap.duration} minutes (${nap.type})`;
        document.getElementById('napSummary').textContent = summary;

        // Reset rating form
        document.getElementById('postNapEnergy').value = 5;
        document.getElementById('grogginessLevel').value = 5;
        document.getElementById('notes').value = '';
    }

    submitRating() {
        if (!this.pendingRating) return;

        const nap = this.naps.find(n => n.id === this.pendingRating);
        if (!nap) return;

        const postEnergy = parseInt(document.getElementById('postNapEnergy').value);
        const productivityImpact = document.getElementById('productivityImpact').value;
        const grogginess = parseInt(document.getElementById('grogginessLevel').value);
        const notes = document.getElementById('notes').value;

        nap.postEnergy = postEnergy;
        nap.productivityImpact = productivityImpact;
        nap.grogginess = grogginess;
        nap.notes = notes;
        nap.energyGain = postEnergy - nap.preEnergy;
        nap.rated = true;

        this.saveNaps();

        // Clear pending rating
        this.pendingRating = null;
        localStorage.removeItem('pendingNapRating');

        // Hide rating interface
        document.getElementById('ratingInterface').style.display = 'none';
        document.getElementById('pendingRatings').style.display = 'block';

        // Update displays
        this.renderNapList();
        this.renderAnalytics();
    }

    checkPendingRating() {
        if (this.pendingRating) {
            const nap = this.naps.find(n => n.id === this.pendingRating);
            if (nap) {
                this.showRatingInterface(nap);
            } else {
                this.pendingRating = null;
                localStorage.removeItem('pendingNapRating');
            }
        }
    }

    renderNapList() {
        const napList = document.getElementById('napList');
        if (this.naps.length === 0) {
            napList.innerHTML = '<p>No naps logged yet. Start by logging your first nap!</p>';
            return;
        }

        napList.innerHTML = this.naps
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(nap => this.createNapItemHTML(nap))
            .join('');
    }

    createNapItemHTML(nap) {
        const date = new Date(nap.date);
        const typeLabels = {
            power: 'Power Nap',
            short: 'Short Nap',
            long: 'Long Nap',
            full: 'Full Sleep Cycle'
        };

        const impactLabels = {
            negative: 'Negative',
            neutral: 'Neutral',
            positive: 'Positive',
            highly_positive: 'Highly Positive'
        };

        return `
            <div class="nap-item">
                <div class="nap-item-header">
                    <div class="nap-item-title">${typeLabels[nap.type] || nap.type}</div>
                    <div class="nap-item-date">${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div class="nap-item-details">
                    <div class="nap-item-detail">
                        <div class="nap-item-detail-label">Duration</div>
                        <div class="nap-item-detail-value">${nap.duration} min</div>
                    </div>
                    <div class="nap-item-detail">
                        <div class="nap-item-detail-label">Pre-Nap Energy</div>
                        <div class="nap-item-detail-value">${nap.preEnergy}/10</div>
                    </div>
                    <div class="nap-item-detail">
                        <div class="nap-item-detail-label">Wake Method</div>
                        <div class="nap-item-detail-value">${nap.wakeMethod}</div>
                    </div>
                    ${nap.rated ? `
                        <div class="nap-item-rating">
                            <div class="nap-item-detail">
                                <div class="nap-item-detail-label">Post-Nap Energy</div>
                                <div class="nap-item-detail-value">${nap.postEnergy}/10</div>
                            </div>
                            <div class="nap-item-detail">
                                <div class="nap-item-detail-label">Productivity Impact</div>
                                <div class="nap-item-detail-value">${impactLabels[nap.productivityImpact] || nap.productivityImpact}</div>
                            </div>
                            <div class="nap-item-detail">
                                <div class="nap-item-detail-label">Grogginess</div>
                                <div class="nap-item-detail-value">${nap.grogginess}/10</div>
                            </div>
                            <div class="nap-item-detail">
                                <div class="nap-item-detail-label">Energy Gain</div>
                                <div class="nap-item-detail-value">${nap.energyGain > 0 ? '+' : ''}${nap.energyGain}</div>
                            </div>
                            ${nap.notes ? `
                                <div class="nap-item-detail">
                                    <div class="nap-item-detail-label">Notes</div>
                                    <div class="nap-item-detail-value">${nap.notes}</div>
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="nap-item-detail">
                            <div class="nap-item-detail-label">Status</div>
                            <div class="nap-item-detail-value">Pending Rating</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderAnalytics() {
        const ratedNaps = this.naps.filter(nap => nap.rated);
        if (ratedNaps.length === 0) {
            this.renderEmptyChart();
            this.updateAnalyticsSummary(0, '--', '--');
            return;
        }

        this.renderEfficiencyChart(ratedNaps);
        this.updateAnalyticsSummary(ratedNaps);
    }

    renderEfficiencyChart(naps) {
        const ctx = document.getElementById('efficiencyChart').getContext('2d');

        // Group by nap type
        const typeData = {};
        naps.forEach(nap => {
            if (!typeData[nap.type]) {
                typeData[nap.type] = { durations: [], energyGains: [] };
            }
            typeData[nap.type].durations.push(nap.duration);
            typeData[nap.type].energyGains.push(nap.energyGain);
        });

        const datasets = Object.keys(typeData).map(type => {
            const data = typeData[type];
            const avgEnergyGain = data.energyGains.reduce((a, b) => a + b, 0) / data.energyGains.length;
            const avgDuration = data.durations.reduce((a, b) => a + b, 0) / data.durations.length;

            return {
                label: this.getTypeLabel(type),
                data: [{
                    x: avgDuration,
                    y: avgEnergyGain,
                    r: Math.max(5, data.durations.length * 2) // Size based on sample count
                }],
                backgroundColor: this.getTypeColor(type),
                borderColor: this.getTypeColor(type),
                borderWidth: 2
            };
        });

        new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Average Duration (minutes)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Average Energy Gain'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.raw;
                                return `${context.dataset.label}: Duration ${point.x.toFixed(1)}min, Energy Gain ${point.y > 0 ? '+' : ''}${point.y.toFixed(1)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderEmptyChart() {
        const ctx = document.getElementById('efficiencyChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Nap Efficiency',
                    data: [0],
                    backgroundColor: '#e1e5e9'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
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

    updateAnalyticsSummary(naps) {
        if (naps.length === 0) {
            document.getElementById('avgDuration').textContent = '-- min';
            document.getElementById('bestType').textContent = '--';
            document.getElementById('avgEnergyGain').textContent = '--';
            return;
        }

        const avgDuration = naps.reduce((sum, nap) => sum + nap.duration, 0) / naps.length;

        // Find most effective type
        const typeStats = {};
        naps.forEach(nap => {
            if (!typeStats[nap.type]) {
                typeStats[nap.type] = { count: 0, totalGain: 0 };
            }
            typeStats[nap.type].count++;
            typeStats[nap.type].totalGain += nap.energyGain;
        });

        let bestType = null;
        let bestAvgGain = -Infinity;
        Object.keys(typeStats).forEach(type => {
            const avgGain = typeStats[type].totalGain / typeStats[type].count;
            if (avgGain > bestAvgGain) {
                bestAvgGain = avgGain;
                bestType = type;
            }
        });

        const avgEnergyGain = naps.reduce((sum, nap) => sum + nap.energyGain, 0) / naps.length;

        document.getElementById('avgDuration').textContent = `${avgDuration.toFixed(1)} min`;
        document.getElementById('bestType').textContent = this.getTypeLabel(bestType);
        document.getElementById('avgEnergyGain').textContent = `${avgEnergyGain > 0 ? '+' : ''}${avgEnergyGain.toFixed(1)}`;
    }

    getTypeLabel(type) {
        const labels = {
            power: 'Power Nap',
            short: 'Short Nap',
            long: 'Long Nap',
            full: 'Full Cycle'
        };
        return labels[type] || type;
    }

    getTypeColor(type) {
        const colors = {
            power: '#4299e1',
            short: '#48bb78',
            long: '#ed8936',
            full: '#9f7aea'
        };
        return colors[type] || '#a0aec0';
    }

    startTimer() {
        if (this.timer.isRunning) return;

        this.timer.startTime = Date.now() - this.timer.pausedTime;
        this.timer.isRunning = true;
        this.timer.isPaused = false;

        this.timer.interval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);

        document.getElementById('startTimer').disabled = true;
        document.getElementById('pauseTimer').disabled = false;
    }

    pauseTimer() {
        if (!this.timer.isRunning) return;

        clearInterval(this.timer.interval);
        this.timer.pausedTime = Date.now() - this.timer.startTime;
        this.timer.isRunning = false;
        this.timer.isPaused = true;

        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;
    }

    resetTimer() {
        clearInterval(this.timer.interval);
        this.timer.startTime = null;
        this.timer.pausedTime = 0;
        this.timer.isRunning = false;
        this.timer.isPaused = false;

        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;

        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        let elapsed;
        if (this.timer.isRunning) {
            elapsed = Date.now() - this.timer.startTime;
        } else if (this.timer.isPaused) {
            elapsed = this.timer.pausedTime;
        } else {
            elapsed = 0;
        }

        const remaining = Math.max(0, this.timer.duration - elapsed);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.querySelector('.time').textContent = timeString;

        // Auto-stop when timer reaches zero
        if (remaining <= 0 && this.timer.isRunning) {
            this.resetTimer();
            // Could add notification sound here
            alert('Nap time is up! Time to wake up.');
        }
    }

    saveNaps() {
        localStorage.setItem('napSessions', JSON.stringify(this.naps));
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NapEfficiencyTracker();
});