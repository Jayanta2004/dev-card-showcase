class DetoxSymptomTracker {
    constructor() {
        this.symptoms = [
            'headache', 'fatigue', 'nausea', 'dizziness',
            'skin-changes', 'digestive-issues', 'mood-changes', 'energy-levels'
        ];
        this.chart = null;
        this.entries = this.loadEntries();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRatingInputs();
        this.setDefaultDate();
        this.updateDashboard();
        this.updateOverview();
        this.displayEntries();
        this.updateInsights();
    }

    setupEventListeners() {
        const form = document.getElementById('symptom-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupRatingInputs() {
        this.symptoms.forEach(symptom => {
            const input = document.getElementById(symptom);
            const value = document.querySelector(`label[for="${symptom}"]`).nextElementSibling.querySelector('.rating-value');

            input.addEventListener('input', () => {
                value.textContent = input.value;
            });
        });
    }

    setDefaultDate() {
        const dateInput = document.getElementById('log-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    handleSubmit(e) {
        e.preventDefault();

        const formData = this.getFormData();
        if (!this.validateFormData(formData)) return;

        this.saveEntry(formData);
        this.resetForm();
        this.updateDashboard();
        this.updateOverview();
        this.displayEntries();
        this.updateInsights();

        this.showSuccessMessage('Symptom entry logged successfully!');
    }

    getFormData() {
        const data = {
            id: Date.now(),
            date: document.getElementById('log-date').value,
            program: document.getElementById('detox-program').value,
            notes: document.getElementById('notes').value,
            symptoms: {}
        };

        this.symptoms.forEach(symptom => {
            data.symptoms[symptom] = parseInt(document.getElementById(symptom).value);
        });

        return data;
    }

    validateFormData(data) {
        if (!data.program) {
            this.showErrorMessage('Please select a detox program.');
            return false;
        }

        if (!data.date) {
            this.showErrorMessage('Please select a date.');
            return false;
        }

        // Check if entry already exists for this date and program
        const existingEntry = this.entries.find(entry =>
            entry.date === data.date && entry.program === data.program
        );

        if (existingEntry) {
            this.showErrorMessage('An entry already exists for this date and program. Please edit the existing entry or choose a different date.');
            return false;
        }

        return true;
    }

    saveEntry(entry) {
        this.entries.push(entry);
        this.saveEntries();
    }

    loadEntries() {
        const stored = localStorage.getItem('detox-symptom-entries');
        return stored ? JSON.parse(stored) : [];
    }

    saveEntries() {
        localStorage.setItem('detox-symptom-entries', JSON.stringify(this.entries));
    }

    resetForm() {
        document.getElementById('symptom-form').reset();
        this.setDefaultDate();
        this.setupRatingInputs(); // Reset rating displays
    }

    updateDashboard() {
        if (this.entries.length === 0) return;

        const ctx = document.getElementById('symptoms-chart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        // Sort entries by date
        const sortedEntries = this.entries.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Prepare data for chart
        const labels = sortedEntries.map(entry => this.formatDate(entry.date));
        const datasets = this.symptoms.map(symptom => ({
            label: this.formatSymptomName(symptom),
            data: sortedEntries.map(entry => entry.symptoms[symptom]),
            borderColor: this.getSymptomColor(symptom),
            backgroundColor: this.getSymptomColor(symptom, 0.1),
            tension: 0.4,
            fill: false
        }));

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Detox Symptom Trends Over Time',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Severity (1-10)'
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

    updateOverview() {
        if (this.entries.length === 0) {
            document.getElementById('current-program').textContent = 'No data logged yet';
            document.getElementById('days-tracked').textContent = '0';
            document.getElementById('avg-symptom-score').textContent = '0.0';
            document.getElementById('peak-day').textContent = 'N/A';
            return;
        }

        // Current program (most recent)
        const latestEntry = this.entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        document.getElementById('current-program').textContent = this.formatProgramName(latestEntry.program);

        // Days tracked
        const uniqueDates = [...new Set(this.entries.map(entry => entry.date))];
        document.getElementById('days-tracked').textContent = uniqueDates.length;

        // Average symptom score
        const avgScore = this.calculateAverageSymptomScore();
        document.getElementById('avg-symptom-score').textContent = avgScore.toFixed(1);

        // Peak day (highest average symptoms)
        const peakDay = this.findPeakDay();
        document.getElementById('peak-day').textContent = peakDay ? this.formatDate(peakDay.date) : 'N/A';
    }

    calculateAverageSymptomScore() {
        if (this.entries.length === 0) return 0;

        let totalScore = 0;
        let totalEntries = 0;

        this.entries.forEach(entry => {
            const entryScore = Object.values(entry.symptoms).reduce((sum, score) => sum + score, 0);
            totalScore += entryScore / this.symptoms.length; // Average per entry
            totalEntries++;
        });

        return totalScore / totalEntries;
    }

    findPeakDay() {
        if (this.entries.length === 0) return null;

        let peakEntry = null;
        let maxScore = 0;

        this.entries.forEach(entry => {
            const avgScore = Object.values(entry.symptoms).reduce((sum, score) => sum + score, 0) / this.symptoms.length;
            if (avgScore > maxScore) {
                maxScore = avgScore;
                peakEntry = entry;
            }
        });

        return peakEntry;
    }

    displayEntries() {
        const container = document.getElementById('entries-list');

        if (this.entries.length === 0) {
            container.innerHTML = '<p class="no-data">No symptom entries yet. Start logging to see your history.</p>';
            return;
        }

        // Sort by date (newest first) and take last 10
        const recentEntries = this.entries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        container.innerHTML = recentEntries.map(entry => this.createEntryHTML(entry)).join('');
    }

    createEntryHTML(entry) {
        const symptomHTML = this.symptoms.map(symptom => {
            const score = entry.symptoms[symptom];
            const severity = this.getSeverityClass(score);
            return `<div class="symptom-score ${severity}">
                ${this.formatSymptomName(symptom)}: ${score}/10
            </div>`;
        }).join('');

        return `
            <div class="entry-item">
                <div class="entry-header">
                    <div class="entry-date">${this.formatDate(entry.date)}</div>
                    <div class="entry-program">${this.formatProgramName(entry.program)}</div>
                </div>
                <div class="symptom-scores">${symptomHTML}</div>
                ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
            </div>
        `;
    }

    updateInsights() {
        const insightsContainer = document.getElementById('insights-content');

        if (this.entries.length < 3) {
            // Show default insights for new users
            return;
        }

        const insights = this.generateInsights();
        const insightsHTML = insights.map(insight => `
            <div class="insight-card">
                <h3>${insight.title}</h3>
                <p>${insight.description}</p>
            </div>
        `).join('');

        insightsContainer.innerHTML = insightsHTML;
    }

    generateInsights() {
        const insights = [];

        // Trend analysis
        const trend = this.analyzeSymptomTrend();
        if (trend) {
            insights.push(trend);
        }

        // Peak analysis
        const peakAnalysis = this.analyzePeakSymptoms();
        if (peakAnalysis) {
            insights.push(peakAnalysis);
        }

        // Program effectiveness
        const programEffectiveness = this.analyzeProgramEffectiveness();
        if (programEffectiveness) {
            insights.push(programEffectiveness);
        }

        // Recovery patterns
        const recoveryPattern = this.analyzeRecoveryPattern();
        if (recoveryPattern) {
            insights.push(recoveryPattern);
        }

        return insights;
    }

    analyzeSymptomTrend() {
        if (this.entries.length < 3) return null;

        const sortedEntries = this.entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        const recent = sortedEntries.slice(-3);
        const earlier = sortedEntries.slice(-6, -3);

        if (earlier.length === 0) return null;

        const recentAvg = recent.reduce((sum, entry) => {
            return sum + (Object.values(entry.symptoms).reduce((s, score) => s + score, 0) / this.symptoms.length);
        }, 0) / recent.length;

        const earlierAvg = earlier.reduce((sum, entry) => {
            return sum + (Object.values(entry.symptoms).reduce((s, score) => s + score, 0) / this.symptoms.length);
        }, 0) / earlier.length;

        const change = recentAvg - earlierAvg;

        if (Math.abs(change) < 0.5) {
            return {
                title: '📊 Stable Symptom Levels',
                description: 'Your symptoms have remained relatively stable over the past week. This could indicate your body is adapting to the detox process.'
            };
        } else if (change > 0) {
            return {
                title: '📈 Increasing Symptoms',
                description: 'Your symptoms have increased recently. This is common during detox as toxins are released. Monitor closely and consider adjusting your detox intensity if symptoms become severe.'
            };
        } else {
            return {
                title: '📉 Improving Symptoms',
                description: 'Great progress! Your symptoms are decreasing, suggesting your body is responding positively to the detox. Continue with your current approach.'
            };
        }
    }

    analyzePeakSymptoms() {
        if (this.entries.length === 0) return null;

        const symptomAverages = {};
        this.symptoms.forEach(symptom => {
            const scores = this.entries.map(entry => entry.symptoms[symptom]);
            symptomAverages[symptom] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        });

        const topSymptoms = Object.entries(symptomAverages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2);

        if (topSymptoms[0][1] > 3) {
            return {
                title: '🎯 Primary Symptoms',
                description: `Your most prominent symptoms are ${this.formatSymptomName(topSymptoms[0][0])} and ${this.formatSymptomName(topSymptoms[1][0])}. Focus on supporting these areas during your detox.`
            };
        }

        return null;
    }

    analyzeProgramEffectiveness() {
        const programGroups = {};
        this.entries.forEach(entry => {
            if (!programGroups[entry.program]) {
                programGroups[entry.program] = [];
            }
            programGroups[entry.program].push(entry);
        });

        if (Object.keys(programGroups).length < 2) return null;

        const programAverages = Object.entries(programGroups).map(([program, entries]) => {
            const avg = entries.reduce((sum, entry) => {
                return sum + (Object.values(entry.symptoms).reduce((s, score) => s + score, 0) / this.symptoms.length);
            }, 0) / entries.length;
            return { program, average: avg, entries: entries.length };
        });

        const bestProgram = programAverages.reduce((best, current) =>
            current.average < best.average ? current : best
        );

        if (bestProgram.entries >= 3) {
            return {
                title: '🏆 Most Effective Program',
                description: `${this.formatProgramName(bestProgram.program)} appears to be working well for you with an average symptom score of ${bestProgram.average.toFixed(1)}. Consider continuing or extending this approach.`
            };
        }

        return null;
    }

    analyzeRecoveryPattern() {
        if (this.entries.length < 5) return null;

        const sortedEntries = this.entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstHalf = sortedEntries.slice(0, Math.floor(sortedEntries.length / 2));
        const secondHalf = sortedEntries.slice(Math.floor(sortedEntries.length / 2));

        const firstHalfAvg = firstHalf.reduce((sum, entry) => {
            return sum + (Object.values(entry.symptoms).reduce((s, score) => s + score, 0) / this.symptoms.length);
        }, 0) / firstHalf.length;

        const secondHalfAvg = secondHalf.reduce((sum, entry) => {
            return sum + (Object.values(entry.symptoms).reduce((s, score) => s + score, 0) / secondHalf.length);
        }, 0) / secondHalf.length;

        if (secondHalfAvg < firstHalfAvg * 0.8) {
            return {
                title: '🌅 Recovery Pattern Detected',
                description: 'Your symptoms are improving over time, which is a positive sign of detox effectiveness. Your body appears to be adapting and healing.'
            };
        }

        return null;
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

    formatSymptomName(symptom) {
        return symptom.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatProgramName(program) {
        return program.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getSymptomColor(symptom, alpha = 1) {
        const colors = {
            'headache': `rgba(255, 99, 132, ${alpha})`,
            'fatigue': `rgba(54, 162, 235, ${alpha})`,
            'nausea': `rgba(255, 205, 86, ${alpha})`,
            'dizziness': `rgba(75, 192, 192, ${alpha})`,
            'skin-changes': `rgba(153, 102, 255, ${alpha})`,
            'digestive-issues': `rgba(255, 159, 64, ${alpha})`,
            'mood-changes': `rgba(199, 199, 199, ${alpha})`,
            'energy-levels': `rgba(83, 102, 255, ${alpha})`
        };
        return colors[symptom] || `rgba(128, 128, 128, ${alpha})`;
    }

    getSeverityClass(score) {
        if (score >= 7) return 'high';
        if (score >= 4) return 'medium';
        return 'low';
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
            messageEl.style.backgroundColor = 'var(--detox-primary)';
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

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DetoxSymptomTracker();
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