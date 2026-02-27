// Shoulder Mobility Tracker JavaScript

class ShoulderMobilityTracker {
    constructor() {
        this.data = this.loadData();
        this.currentView = 'week';
        this.chart = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderDashboard();
        this.renderHistory();
        this.renderRecommendations();
        this.updateChart();
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('mobility-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // History view controls
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.changeView(e.target.dataset.view));
        });

        // Pain slider
        const painSlider = document.getElementById('pain-level');
        const painValue = document.getElementById('pain-value');
        const painText = document.getElementById('pain-text');

        if (painSlider && painValue && painText) {
            painSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                painValue.textContent = value;
                painText.textContent = this.getPainLevelText(value);
            });
        }

        // Clear data button
        const clearBtn = document.getElementById('clear-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearData());
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const entry = {
            id: Date.now(),
            date: formData.get('assessment-date'),
            shoulderFlexion: parseInt(formData.get('shoulder-flexion')) || 0,
            shoulderAbduction: parseInt(formData.get('shoulder-abduction')) || 0,
            internalRotation: parseInt(formData.get('internal-rotation')) || 0,
            externalRotation: parseInt(formData.get('external-rotation')) || 0,
            painLevel: parseInt(formData.get('pain-level')) || 0,
            notes: formData.get('notes') || '',
            timestamp: new Date().toISOString()
        };

        // Validate data
        if (!this.validateEntry(entry)) {
            alert('Please fill in all required fields with valid values.');
            return;
        }

        // Add to data
        this.data.entries.push(entry);
        this.saveData();

        // Reset form
        e.target.reset();
        document.getElementById('pain-value').textContent = '0';
        document.getElementById('pain-text').textContent = 'No pain';

        // Update UI
        this.renderDashboard();
        this.renderHistory();
        this.updateChart();

        // Show success message
        this.showNotification('Mobility assessment saved successfully!', 'success');
    }

    validateEntry(entry) {
        return entry.date &&
               entry.shoulderFlexion >= 0 && entry.shoulderFlexion <= 180 &&
               entry.shoulderAbduction >= 0 && entry.shoulderAbduction <= 180 &&
               entry.internalRotation >= 0 && entry.internalRotation <= 90 &&
               entry.externalRotation >= 0 && entry.externalRotation <= 90 &&
               entry.painLevel >= 0 && entry.painLevel <= 10;
    }

    loadData() {
        const defaultData = {
            entries: []
        };

        try {
            const stored = localStorage.getItem('shoulder-mobility-data');
            return stored ? JSON.parse(stored) : defaultData;
        } catch (e) {
            console.error('Error loading data:', e);
            return defaultData;
        }
    }

    saveData() {
        try {
            localStorage.setItem('shoulder-mobility-data', JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving data:', e);
            this.showNotification('Error saving data. Please try again.', 'error');
        }
    }

    renderDashboard() {
        const entries = this.data.entries;
        if (entries.length === 0) return;

        // Calculate metrics
        const latest = entries[entries.length - 1];
        const avgFlexion = this.calculateAverage('shoulderFlexion');
        const avgAbduction = this.calculateAverage('shoulderAbduction');
        const avgPain = this.calculateAverage('painLevel');

        // Update metrics
        document.getElementById('latest-flexion').textContent = `${latest.shoulderFlexion}°`;
        document.getElementById('latest-abduction').textContent = `${latest.shoulderAbduction}°`;
        document.getElementById('avg-flexion').textContent = `${avgFlexion.toFixed(1)}°`;
        document.getElementById('avg-abduction').textContent = `${avgAbduction.toFixed(1)}°`;
        document.getElementById('avg-pain').textContent = avgPain.toFixed(1);
        document.getElementById('total-assessments').textContent = entries.length;
    }

    calculateAverage(property) {
        if (this.data.entries.length === 0) return 0;
        const sum = this.data.entries.reduce((acc, entry) => acc + (entry[property] || 0), 0);
        return sum / this.data.entries.length;
    }

    renderHistory() {
        const container = document.getElementById('history-list');
        if (!container) return;

        const filteredEntries = this.filterEntriesByView();
        const sortedEntries = filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = sortedEntries.map(entry => `
            <div class="history-item">
                <div class="history-date">${this.formatDate(entry.date)}</div>
                <div class="history-details">
                    <div class="history-mobility">
                        Flex: ${entry.shoulderFlexion}° | Abd: ${entry.shoulderAbduction}°
                    </div>
                    <div class="history-pain">Pain: ${entry.painLevel}/10</div>
                </div>
            </div>
        `).join('');
    }

    filterEntriesByView() {
        const now = new Date();
        const entries = this.data.entries;

        switch (this.currentView) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return entries.filter(entry => new Date(entry.date) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return entries.filter(entry => new Date(entry.date) >= monthAgo);
            case 'all':
            default:
                return entries;
        }
    }

    changeView(view) {
        this.currentView = view;

        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        this.renderHistory();
        this.updateChart();
    }

    updateChart() {
        const container = document.getElementById('mobility-chart');
        if (!container) return;

        const filteredEntries = this.filterEntriesByView();
        const sortedEntries = filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sortedEntries.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096; margin-top: 2rem;">No data available for the selected period.</p>';
            return;
        }

        // Prepare data for chart
        const labels = sortedEntries.map(entry => this.formatDate(entry.date));
        const flexionData = sortedEntries.map(entry => entry.shoulderFlexion);
        const abductionData = sortedEntries.map(entry => entry.shoulderAbduction);
        const painData = sortedEntries.map(entry => entry.painLevel);

        // Simple chart using CSS and HTML (fallback for environments without Chart.js)
        this.renderSimpleChart(container, labels, flexionData, abductionData, painData);
    }

    renderSimpleChart(container, labels, flexionData, abductionData, painData) {
        const maxFlexion = Math.max(...flexionData, 180);
        const maxAbduction = Math.max(...abductionData, 180);
        const maxPain = Math.max(...painData, 10);

        container.innerHTML = `
            <div style="display: flex; height: 100%; align-items: end; gap: 2px; padding: 1rem 0;">
                ${labels.map((label, i) => `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                        <div style="display: flex; flex-direction: column; align-items: center; height: 180px; justify-content: end; width: 100%; position: relative;">
                            <div style="background: #48bb78; width: 8px; height: ${(flexionData[i] / maxFlexion) * 100}%; border-radius: 4px 4px 0 0; position: absolute; bottom: 0; left: 2px;"></div>
                            <div style="background: #4299e1; width: 8px; height: ${(abductionData[i] / maxAbduction) * 100}%; border-radius: 4px 4px 0 0; position: absolute; bottom: 0; right: 2px;"></div>
                            <div style="background: #ed8936; width: 12px; height: ${(painData[i] / maxPain) * 100}%; border-radius: 6px 6px 0 0; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);"></div>
                        </div>
                        <div style="font-size: 0.75rem; color: #718096; transform: rotate(-45deg); white-space: nowrap;">${label}</div>
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; font-size: 0.875rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; background: #48bb78; border-radius: 2px;"></div>
                    <span>Flexion</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; background: #4299e1; border-radius: 2px;"></div>
                    <span>Abduction</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; background: #ed8936; border-radius: 2px;"></div>
                    <span>Pain</span>
                </div>
            </div>
        `;
    }

    renderRecommendations() {
        const entries = this.data.entries;
        if (entries.length === 0) return;

        const latest = entries[entries.length - 1];
        const avgFlexion = this.calculateAverage('shoulderFlexion');
        const avgAbduction = this.calculateAverage('shoulderAbduction');

        // Focus areas
        const focusAreas = [];
        if (latest.shoulderFlexion < 150) {
            focusAreas.push({ type: 'concern', text: 'Shoulder flexion is below optimal range. Focus on overhead reaching exercises.' });
        } else if (latest.shoulderFlexion >= 160) {
            focusAreas.push({ type: 'improvement', text: 'Excellent shoulder flexion! Maintain with regular stretching.' });
        }

        if (latest.shoulderAbduction < 140) {
            focusAreas.push({ type: 'concern', text: 'Shoulder abduction needs improvement. Include lateral raises in your routine.' });
        } else if (latest.shoulderAbduction >= 150) {
            focusAreas.push({ type: 'improvement', text: 'Good shoulder abduction range. Continue strengthening exercises.' });
        }

        // Exercises
        const exercises = [
            'Wall angels - 3 sets of 10 reps',
            'Shoulder rolls - 2 minutes daily',
            'Doorway stretches - 30 seconds per side',
            'Thread the needle pose - 5 breaths per side'
        ];

        // Desk tips
        const deskTips = [
            'Adjust monitor height to eye level',
            'Take stretch breaks every 30 minutes',
            'Use proper ergonomic chair setup',
            'Keep shoulders relaxed while typing'
        ];

        // Milestones
        const milestones = [
            { text: 'Achieve 160° shoulder flexion', achieved: latest.shoulderFlexion >= 160 },
            { text: 'Achieve 150° shoulder abduction', achieved: latest.shoulderAbduction >= 150 },
            { text: 'Maintain pain level below 3/10', achieved: latest.painLevel < 3 },
            { text: 'Complete 10 assessments', achieved: entries.length >= 10 }
        ];

        // Update DOM
        this.updateFocusAreas(focusAreas);
        this.updateExercises(exercises);
        this.updateDeskTips(deskTips);
        this.updateMilestones(milestones);
    }

    updateFocusAreas(areas) {
        const container = document.getElementById('focus-areas');
        if (!container) return;

        container.innerHTML = areas.map(area => `
            <div class="focus-area ${area.type}">${area.text}</div>
        `).join('');
    }

    updateExercises(exercises) {
        const container = document.getElementById('exercise-list');
        if (!container) return;

        container.innerHTML = exercises.map(exercise => `
            <div class="exercise-item">${exercise}</div>
        `).join('');
    }

    updateDeskTips(tips) {
        const container = document.getElementById('desk-tips');
        if (!container) return;

        container.innerHTML = tips.map(tip => `
            <div class="desk-tip">${tip}</div>
        `).join('');
    }

    updateMilestones(milestones) {
        const container = document.getElementById('milestones');
        if (!container) return;

        container.innerHTML = milestones.map(milestone => `
            <div class="milestone ${milestone.achieved ? 'achieved' : 'pending'}">
                ${milestone.achieved ? '✓' : '○'} ${milestone.text}
            </div>
        `).join('');
    }

    getPainLevelText(level) {
        const levels = ['No pain', 'Mild', 'Mild', 'Moderate', 'Moderate', 'Moderate', 'Severe', 'Severe', 'Severe', 'Very severe', 'Worst possible'];
        return levels[level] || 'No pain';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    clearData() {
        if (confirm('Are you sure you want to clear all mobility data? This action cannot be undone.')) {
            this.data.entries = [];
            this.saveData();
            this.renderDashboard();
            this.renderHistory();
            this.updateChart();
            this.renderRecommendations();
            this.showNotification('All data cleared successfully.', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        alert(message);
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShoulderMobilityTracker();
});