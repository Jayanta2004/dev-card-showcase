class PostInjuryMobilityScore {
    constructor() {
        this.injury = this.loadInjury();
        this.assessments = this.loadAssessments();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScoreInputs();
        this.setDefaultDates();
        this.updateInjuryDisplay();
        this.updateProgress();
        this.updateMilestones();
        this.updateHistory();
        this.updateInsights();
    }

    setupEventListeners() {
        const injuryForm = document.getElementById('injury-form');
        injuryForm.addEventListener('submit', (e) => this.handleInjurySubmit(e));

        const mobilityForm = document.getElementById('mobility-form');
        mobilityForm.addEventListener('submit', (e) => this.handleMobilitySubmit(e));
    }

    setupScoreInputs() {
        const scoreInputs = ['flexion', 'extension', 'abduction', 'adduction', 'rotation', 'pain-level', 'functionality'];
        scoreInputs.forEach(id => {
            const input = document.getElementById(id);
            const value = input.nextElementSibling;

            input.addEventListener('input', () => {
                const unit = id === 'pain-level' ? '' : '%';
                value.textContent = input.value + unit;
            });
        });
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('injury-date').value = today;
        document.getElementById('assessment-date').value = today;
    }

    handleInjurySubmit(e) {
        e.preventDefault();

        const injuryData = this.getInjuryData();
        this.injury = injuryData;
        this.saveInjury();

        this.updateInjuryDisplay();
        this.showSuccessMessage('Injury details saved successfully!');
    }

    handleMobilitySubmit(e) {
        e.preventDefault();

        if (!this.injury) {
            this.showErrorMessage('Please complete injury assessment first.');
            return;
        }

        const assessmentData = this.getAssessmentData();
        this.assessments.push(assessmentData);
        this.saveAssessments();

        this.resetMobilityForm();
        this.updateProgress();
        this.updateMilestones();
        this.updateHistory();
        this.updateInsights();

        this.showSuccessMessage('Mobility assessment recorded successfully!');
    }

    getInjuryData() {
        return {
            date: document.getElementById('injury-date').value,
            type: document.getElementById('injury-type').value,
            bodyPart: document.getElementById('body-part').value,
            description: document.getElementById('injury-description').value
        };
    }

    getAssessmentData() {
        const data = {
            id: Date.now(),
            date: document.getElementById('assessment-date').value,
            scores: {
                flexion: parseInt(document.getElementById('flexion').value),
                extension: parseInt(document.getElementById('extension').value),
                abduction: parseInt(document.getElementById('abduction').value),
                adduction: parseInt(document.getElementById('adduction').value),
                rotation: parseInt(document.getElementById('rotation').value),
                painLevel: parseInt(document.getElementById('pain-level').value),
                functionality: parseInt(document.getElementById('functionality').value)
            },
            notes: document.getElementById('assessment-notes').value,
            mobilityScore: 0
        };

        // Calculate overall mobility score (weighted average)
        const movementScores = [data.scores.flexion, data.scores.extension, data.scores.abduction, data.scores.adduction, data.scores.rotation];
        const avgMovementScore = movementScores.reduce((sum, score) => sum + score, 0) / movementScores.length;
        const functionalityWeight = 0.7;
        const movementWeight = 0.3;

        data.mobilityScore = Math.round((data.scores.functionality * functionalityWeight) + (avgMovementScore * movementWeight));

        return data;
    }

    resetMobilityForm() {
        document.getElementById('mobility-form').reset();
        this.setDefaultDates();
        this.setupScoreInputs(); // Reset score displays
    }

    updateInjuryDisplay() {
        if (!this.injury) return;

        // Pre-fill form with existing injury data
        document.getElementById('injury-date').value = this.injury.date;
        document.getElementById('injury-type').value = this.injury.type;
        document.getElementById('body-part').value = this.injury.bodyPart;
        document.getElementById('injury-description').value = this.injury.description;
    }

    updateProgress() {
        if (this.assessments.length === 0) {
            document.getElementById('current-score').textContent = '0/100';
            document.getElementById('days-since-injury').textContent = '0';
            document.getElementById('assessments-count').textContent = '0';
            document.getElementById('recovery-progress').textContent = '0%';
            return;
        }

        // Sort assessments by date
        const sortedAssessments = this.assessments.sort((a, b) => new Date(a.date) - new Date(b.date));
        const latestAssessment = sortedAssessments[sortedAssessments.length - 1];

        // Current mobility score
        document.getElementById('current-score').textContent = `${latestAssessment.mobilityScore}/100`;

        // Days since injury
        if (this.injury) {
            const injuryDate = new Date(this.injury.date);
            const today = new Date();
            const daysDiff = Math.floor((today - injuryDate) / (1000 * 60 * 60 * 24));
            document.getElementById('days-since-injury').textContent = daysDiff;
        }

        // Assessments count
        document.getElementById('assessments-count').textContent = this.assessments.length;

        // Recovery progress (simplified calculation)
        const recoveryProgress = this.calculateRecoveryProgress();
        document.getElementById('recovery-progress').textContent = `${recoveryProgress}%`;

        // Update chart
        this.updateChart();
    }

    calculateRecoveryProgress() {
        if (this.assessments.length < 2) return 0;

        const sortedAssessments = this.assessments.sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstScore = sortedAssessments[0].mobilityScore;
        const latestScore = sortedAssessments[sortedAssessments.length - 1].mobilityScore;

        // Assume full recovery is 90+ score
        const targetScore = 90;
        const currentProgress = (latestScore / targetScore) * 100;

        return Math.min(100, Math.max(0, Math.round(currentProgress)));
    }

    updateChart() {
        const ctx = document.getElementById('mobility-chart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        if (this.assessments.length === 0) return;

        // Sort assessments by date
        const sortedAssessments = this.assessments.sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = sortedAssessments.map(assessment => this.formatDate(assessment.date));
        const mobilityScores = sortedAssessments.map(assessment => assessment.mobilityScore);
        const painLevels = sortedAssessments.map(assessment => assessment.scores.painLevel);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mobility Score',
                    data: mobilityScores,
                    borderColor: 'rgba(25, 118, 210, 1)',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Pain Level',
                    data: painLevels,
                    borderColor: 'rgba(244, 67, 54, 1)',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Mobility Recovery Progress',
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
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Mobility Score (%)'
                        },
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Pain Level (0-10)'
                        },
                        max: 10,
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
    }

    updateMilestones() {
        const milestonesContainer = document.getElementById('milestones-content');

        if (!this.injury || this.assessments.length === 0) {
            milestonesContainer.innerHTML = `
                <div class="milestone-card">
                    <h3>📅 Getting Started</h3>
                    <p>Complete your first injury assessment and mobility scoring to begin tracking your recovery progress.</p>
                </div>
            `;
            return;
        }

        const latestAssessment = this.assessments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const daysSinceInjury = this.getDaysSinceInjury();

        const milestones = this.getMilestones(latestAssessment, daysSinceInjury);
        const milestonesHTML = milestones.map(milestone => `
            <div class="milestone-card ${milestone.achieved ? 'achieved' : ''}">
                <h3>${milestone.icon} ${milestone.title}</h3>
                <p>${milestone.description}</p>
            </div>
        `).join('');

        milestonesContainer.innerHTML = milestonesHTML;
    }

    getMilestones(assessment, daysSinceInjury) {
        const milestones = [
            {
                title: 'Initial Assessment',
                icon: '📝',
                description: 'Complete your first mobility assessment',
                achieved: this.assessments.length >= 1
            },
            {
                title: '1 Week Mark',
                icon: '📅',
                description: 'Track progress for at least 7 days',
                achieved: daysSinceInjury >= 7
            },
            {
                title: 'Pain Management',
                icon: '💊',
                description: 'Reduce pain level to 3 or below',
                achieved: assessment.scores.painLevel <= 3
            },
            {
                title: 'Mobility Recovery',
                icon: '🏃',
                description: 'Achieve 70% mobility score',
                achieved: assessment.mobilityScore >= 70
            },
            {
                title: 'Functional Recovery',
                icon: '✅',
                description: 'Reach 80% functionality',
                achieved: assessment.scores.functionality >= 80
            },
            {
                title: 'Full Recovery',
                icon: '🎉',
                description: 'Achieve 90% overall mobility score',
                achieved: assessment.mobilityScore >= 90
            }
        ];

        return milestones;
    }

    getDaysSinceInjury() {
        if (!this.injury) return 0;
        const injuryDate = new Date(this.injury.date);
        const today = new Date();
        return Math.floor((today - injuryDate) / (1000 * 60 * 60 * 24));
    }

    updateHistory() {
        const container = document.getElementById('history-list');

        if (this.assessments.length === 0) {
            container.innerHTML = '<p class="no-data">No assessments yet. Complete your first mobility assessment to see history.</p>';
            return;
        }

        // Sort by date (newest first) and take last 10
        const recentAssessments = this.assessments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        container.innerHTML = recentAssessments.map(assessment => this.createAssessmentHTML(assessment)).join('');
    }

    createAssessmentHTML(assessment) {
        const scoresHTML = `
            <div class="score-item"><span>Mobility:</span> <span>${assessment.mobilityScore}%</span></div>
            <div class="score-item"><span>Pain:</span> <span>${assessment.scores.painLevel}/10</span></div>
            <div class="score-item"><span>Functionality:</span> <span>${assessment.scores.functionality}%</span></div>
            <div class="score-item"><span>Flexion:</span> <span>${assessment.scores.flexion}%</span></div>
            <div class="score-item"><span>Extension:</span> <span>${assessment.scores.extension}%</span></div>
        `;

        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-date">${this.formatDate(assessment.date)}</div>
                    <div class="history-score">${assessment.mobilityScore}%</div>
                </div>
                <div class="scores-grid">${scoresHTML}</div>
                ${assessment.notes ? `<div class="history-notes">${assessment.notes}</div>` : ''}
            </div>
        `;
    }

    updateInsights() {
        const insightsContainer = document.getElementById('insights-content');

        if (this.assessments.length < 2) {
            return; // Keep default insights
        }

        const insights = this.generateInsights();
        if (insights.length > 0) {
            const insightsHTML = insights.map(insight => `
                <div class="insight-card">
                    <h3>${insight.title}</h3>
                    <p>${insight.description}</p>
                </div>
            `).join('');

            insightsContainer.innerHTML += insightsHTML;
        }
    }

    generateInsights() {
        const insights = [];

        if (this.assessments.length < 2) return insights;

        const sortedAssessments = this.assessments.sort((a, b) => new Date(a.date) - new Date(b.date));
        const latest = sortedAssessments[sortedAssessments.length - 1];
        const previous = sortedAssessments[sortedAssessments.length - 2];

        // Progress analysis
        const scoreChange = latest.mobilityScore - previous.mobilityScore;
        if (Math.abs(scoreChange) >= 5) {
            if (scoreChange > 0) {
                insights.push({
                    title: '📈 Progress Detected',
                    description: `Great improvement! Your mobility score increased by ${scoreChange}% since your last assessment. Keep up the good work with your exercises.`
                });
            } else {
                insights.push({
                    title: '📉 Temporary Setback',
                    description: `Your mobility score decreased by ${Math.abs(scoreChange)}%. This can happen during recovery. Consider consulting your physiotherapist if this trend continues.`
                });
            }
        }

        // Pain analysis
        const painChange = latest.scores.painLevel - previous.scores.painLevel;
        if (painChange <= -2) {
            insights.push({
                title: '😊 Pain Reduction',
                description: 'Excellent! Your pain levels have decreased significantly. This is a positive sign of recovery and effective treatment.'
            });
        } else if (painChange >= 2) {
            insights.push({
                title: '⚠️ Increased Pain',
                description: 'Your pain levels have increased. Consider modifying your activities and consult your healthcare provider if pain persists.'
            });
        }

        // Recovery phase insights
        const daysSinceInjury = this.getDaysSinceInjury();
        if (daysSinceInjury > 21 && latest.mobilityScore < 50) {
            insights.push({
                title: '🏥 Recovery Check',
                description: 'You\'re beyond the initial healing phase (3 weeks) but mobility remains limited. Consider professional physiotherapy assessment.'
            });
        }

        // Functionality insights
        if (latest.scores.functionality >= 80 && latest.mobilityScore < 70) {
            insights.push({
                title: '🔄 Range of Motion Focus',
                description: 'Good functionality but limited range of motion. Focus on flexibility exercises and joint mobilization techniques.'
            });
        }

        return insights;
    }

    // Data persistence methods
    loadInjury() {
        const stored = localStorage.getItem('post-injury-details');
        return stored ? JSON.parse(stored) : null;
    }

    saveInjury() {
        localStorage.setItem('post-injury-details', JSON.stringify(this.injury));
    }

    loadAssessments() {
        const stored = localStorage.getItem('post-injury-assessments');
        return stored ? JSON.parse(stored) : [];
    }

    saveAssessments() {
        localStorage.setItem('post-injury-assessments', JSON.stringify(this.assessments));
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
            messageEl.style.backgroundColor = 'var(--mobility-primary)';
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
    new PostInjuryMobilityScore();
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