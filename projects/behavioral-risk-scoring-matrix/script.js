/**
 * Behavioral Risk Scoring Matrix
 * Comprehensive assessment tool for behavioral risk evaluation
 * Version 1.0.0
 */

class BehavioralRiskScoringMatrix {
    constructor() {
        this.factors = {
            impulsivity: {
                name: 'Impulsivity',
                weight: 0.25,
                subFactors: {
                    decisionMaking: { name: 'Impulsive Decision Making', value: 0 },
                    riskTaking: { name: 'Risk-Taking Behavior', value: 0 },
                    planning: { name: 'Lack of Planning', value: 0 },
                    selfControl: { name: 'Self-Control Issues', value: 0 }
                }
            },
            emotional: {
                name: 'Emotional Regulation',
                weight: 0.20,
                subFactors: {
                    moodSwings: { name: 'Mood Swings', value: 0 },
                    anger: { name: 'Anger Management', value: 0 },
                    anxiety: { name: 'Anxiety Levels', value: 0 },
                    depression: { name: 'Depression Indicators', value: 0 }
                }
            },
            social: {
                name: 'Social Functioning',
                weight: 0.15,
                subFactors: {
                    relationships: { name: 'Relationship Quality', value: 0 },
                    isolation: { name: 'Social Isolation', value: 0 },
                    communication: { name: 'Communication Skills', value: 0 },
                    trust: { name: 'Trust Issues', value: 0 }
                }
            },
            cognitive: {
                name: 'Cognitive Patterns',
                weight: 0.20,
                subFactors: {
                    attention: { name: 'Attention Span', value: 0 },
                    memory: { name: 'Memory Function', value: 0 },
                    problemSolving: { name: 'Problem Solving', value: 0 },
                    learning: { name: 'Learning Ability', value: 0 }
                }
            },
            health: {
                name: 'Health Behaviors',
                weight: 0.20,
                subFactors: {
                    substance: { name: 'Substance Use', value: 0 },
                    sleep: { name: 'Sleep Patterns', value: 0 },
                    nutrition: { name: 'Nutrition Habits', value: 0 },
                    exercise: { name: 'Physical Activity', value: 0 }
                }
            }
        };

        this.currentAssessment = {};
        this.assessmentHistory = [];
        this.chartInstances = {};
        this.matrixPosition = { x: 0, y: 0 };
        this.riskThresholds = {
            low: 30,
            medium: 60,
            high: 80
        };

        this.initialize();
    }

    initialize() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateUI();
        this.loadAssessmentHistory();
    }

    setupEventListeners() {
        // Factor sliders
        Object.keys(this.factors).forEach(factor => {
            Object.keys(this.factors[factor].subFactors).forEach(subFactor => {
                const slider = document.getElementById(`${factor}-${subFactor}`);
                if (slider) {
                    slider.addEventListener('input', (e) => {
                        this.updateSubFactorValue(factor, subFactor, parseInt(e.target.value));
                    });
                }
            });
        });

        // Buttons
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateRisk());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveAssessment());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAssessment());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        document.getElementById('printBtn').addEventListener('click', () => this.printResults());

        // Demographics
        document.getElementById('age').addEventListener('input', (e) => this.updateDemographics('age', e.target.value));
        document.getElementById('gender').addEventListener('change', (e) => this.updateDemographics('gender', e.target.value));
        document.getElementById('occupation').addEventListener('input', (e) => this.updateDemographics('occupation', e.target.value));

        // Additional info
        document.getElementById('additionalNotes').addEventListener('input', (e) => this.updateAdditionalInfo(e.target.value));
    }

    updateSubFactorValue(factor, subFactor, value) {
        this.factors[factor].subFactors[subFactor].value = value;
        this.updateSliderDisplay(factor, subFactor, value);
        this.updateFactorAverage(factor);
        this.updateOverallScore();
        this.updateMatrixPosition();
    }

    updateSliderDisplay(factor, subFactor, value) {
        const display = document.getElementById(`${factor}-${subFactor}-value`);
        if (display) {
            display.textContent = value;
        }
    }

    updateFactorAverage(factor) {
        const subFactors = this.factors[factor].subFactors;
        const values = Object.values(subFactors).map(sf => sf.value);
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;

        const display = document.getElementById(`${factor}-average`);
        if (display) {
            display.textContent = Math.round(average);
        }
    }

    updateOverallScore() {
        const factorScores = {};
        let totalScore = 0;

        Object.keys(this.factors).forEach(factor => {
            const subFactors = this.factors[factor].subFactors;
            const values = Object.values(subFactors).map(sf => sf.value);
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            factorScores[factor] = average;
            totalScore += average * this.factors[factor].weight;
        });

        this.currentAssessment.overallScore = Math.round(totalScore);
        this.currentAssessment.factorScores = factorScores;

        this.updateScoreDisplay();
        this.updateRiskLevel();
        this.updateRecommendations();
    }

    updateScoreDisplay() {
        const scoreDisplay = document.getElementById('overallScore');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.currentAssessment.overallScore || 0;
        }
    }

    updateRiskLevel() {
        const score = this.currentAssessment.overallScore || 0;
        const riskLevel = document.getElementById('riskLevel');
        const riskLevelText = document.getElementById('riskLevelText');

        let level, colorClass, text;

        if (score < this.riskThresholds.low) {
            level = 'low';
            colorClass = 'low';
            text = 'Low Risk';
        } else if (score < this.riskThresholds.medium) {
            level = 'medium';
            colorClass = 'medium';
            text = 'Medium Risk';
        } else {
            level = 'high';
            colorClass = 'high';
            text = 'High Risk';
        }

        if (riskLevel) {
            riskLevel.className = `risk-level ${colorClass}`;
            riskLevel.textContent = text;
        }

        if (riskLevelText) {
            riskLevelText.textContent = text;
        }

        this.currentAssessment.riskLevel = level;
    }

    updateMatrixPosition() {
        const factorScores = this.currentAssessment.factorScores || {};
        const impulsivityScore = factorScores.impulsivity || 0;
        const emotionalScore = factorScores.emotional || 0;

        // Map scores to matrix coordinates (0-2 for 3x3 grid)
        const x = Math.min(2, Math.floor((impulsivityScore / 100) * 3));
        const y = Math.min(2, Math.floor((emotionalScore / 100) * 3));

        this.matrixPosition = { x, y };
        this.updateMatrixVisualization();
    }

    updateMatrixVisualization() {
        const position = document.getElementById('currentPosition');
        if (position) {
            const cellSize = 300 / 3; // 300px height divided by 3 rows
            const x = (this.matrixPosition.x * cellSize) + (cellSize / 2) - 10; // Center in cell
            const y = (this.matrixPosition.y * cellSize) + (cellSize / 2) - 10;

            position.style.left = `${x}px`;
            position.style.top = `${y}px`;
        }
    }

    updateRecommendations() {
        const score = this.currentAssessment.overallScore || 0;
        const recommendations = this.generateRecommendations(score);
        const list = document.getElementById('recommendationList');

        if (list) {
            list.innerHTML = '';
            recommendations.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                list.appendChild(li);
            });
        }
    }

    generateRecommendations(score) {
        const recommendations = [];

        if (score < this.riskThresholds.low) {
            recommendations.push('Continue maintaining healthy behavioral patterns');
            recommendations.push('Consider periodic self-assessment to monitor progress');
            recommendations.push('Share positive coping strategies with others');
        } else if (score < this.riskThresholds.medium) {
            recommendations.push('Develop a structured daily routine');
            recommendations.push('Practice mindfulness and stress-reduction techniques');
            recommendations.push('Seek support from trusted friends or family');
            recommendations.push('Consider professional counseling for specific concerns');
        } else {
            recommendations.push('Immediate professional intervention recommended');
            recommendations.push('Develop a comprehensive treatment plan');
            recommendations.push('Establish a strong support network');
            recommendations.push('Monitor progress with regular assessments');
            recommendations.push('Consider medication management if appropriate');
            recommendations.push('Implement crisis prevention strategies');
        }

        // Add factor-specific recommendations
        const factorScores = this.currentAssessment.factorScores || {};
        Object.keys(factorScores).forEach(factor => {
            const factorScore = factorScores[factor];
            if (factorScore > 70) {
                recommendations.push(...this.getFactorRecommendations(factor));
            }
        });

        return recommendations;
    }

    getFactorRecommendations(factor) {
        const recommendations = {
            impulsivity: [
                'Practice delayed gratification techniques',
                'Use decision-making frameworks before acting',
                'Implement impulse control strategies'
            ],
            emotional: [
                'Develop emotional regulation skills',
                'Practice daily mood tracking',
                'Learn stress management techniques'
            ],
            social: [
                'Build and maintain social connections',
                'Improve communication skills',
                'Address trust and relationship issues'
            ],
            cognitive: [
                'Engage in cognitive training exercises',
                'Practice memory and attention techniques',
                'Seek cognitive behavioral therapy'
            ],
            health: [
                'Establish healthy lifestyle habits',
                'Address substance use concerns',
                'Improve sleep and nutrition patterns'
            ]
        };

        return recommendations[factor] || [];
    }

    calculateRisk() {
        this.updateOverallScore();
        this.updateMatrixPosition();
        this.updateCharts();
        this.showNotification('Risk assessment calculated successfully', 'success');
    }

    initializeCharts() {
        this.initializeRiskChart();
        this.initializeTrendChart();
    }

    initializeRiskChart() {
        const ctx = document.getElementById('riskChart');
        if (ctx) {
            this.chartInstances.risk = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: Object.keys(this.factors).map(f => this.factors[f].name),
                    datasets: [{
                        label: 'Risk Scores',
                        data: [],
                        backgroundColor: 'rgba(0, 184, 148, 0.2)',
                        borderColor: 'rgba(0, 184, 148, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(0, 184, 148, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(0, 184, 148, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20
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
    }

    initializeTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (ctx) {
            this.chartInstances.trend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Overall Risk Score',
                        data: [],
                        borderColor: 'rgba(9, 132, 227, 1)',
                        backgroundColor: 'rgba(9, 132, 227, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
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
    }

    updateCharts() {
        this.updateRiskChart();
        this.updateTrendChart();
    }

    updateRiskChart() {
        if (this.chartInstances.risk) {
            const factorScores = this.currentAssessment.factorScores || {};
            this.chartInstances.risk.data.datasets[0].data = Object.values(factorScores);
            this.chartInstances.risk.update();
        }
    }

    updateTrendChart() {
        if (this.chartInstances.trend && this.assessmentHistory.length > 0) {
            const labels = this.assessmentHistory.map(item => new Date(item.date).toLocaleDateString());
            const scores = this.assessmentHistory.map(item => item.overallScore);

            this.chartInstances.trend.data.labels = labels;
            this.chartInstances.trend.data.datasets[0].data = scores;
            this.chartInstances.trend.update();
        }
    }

    updateDemographics(field, value) {
        if (!this.currentAssessment.demographics) {
            this.currentAssessment.demographics = {};
        }
        this.currentAssessment.demographics[field] = value;
    }

    updateAdditionalInfo(info) {
        this.currentAssessment.additionalInfo = info;
    }

    saveAssessment() {
        const assessment = {
            ...this.currentAssessment,
            date: new Date().toISOString(),
            id: Date.now()
        };

        this.assessmentHistory.unshift(assessment);
        this.saveToStorage();
        this.loadAssessmentHistory();
        this.updateTrendChart();
        this.showNotification('Assessment saved successfully', 'success');
    }

    resetAssessment() {
        if (confirm('Are you sure you want to reset the assessment? All current data will be lost.')) {
            Object.keys(this.factors).forEach(factor => {
                Object.keys(this.factors[factor].subFactors).forEach(subFactor => {
                    this.factors[factor].subFactors[subFactor].value = 0;
                    const slider = document.getElementById(`${factor}-${subFactor}`);
                    if (slider) slider.value = 0;
                    this.updateSliderDisplay(factor, subFactor, 0);
                });
                this.updateFactorAverage(factor);
            });

            this.currentAssessment = {};
            this.updateOverallScore();
            this.updateMatrixPosition();
            this.updateCharts();

            // Reset demographics
            document.getElementById('age').value = '';
            document.getElementById('gender').value = '';
            document.getElementById('occupation').value = '';

            // Reset additional info
            document.getElementById('additionalNotes').value = '';

            this.showNotification('Assessment reset successfully', 'info');
        }
    }

    exportResults() {
        const data = {
            assessment: this.currentAssessment,
            history: this.assessmentHistory,
            factors: this.factors
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `behavioral-risk-assessment-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Results exported successfully', 'success');
    }

    printResults() {
        window.print();
    }

    loadAssessmentHistory() {
        const historyList = document.getElementById('historyList');
        if (historyList) {
            historyList.innerHTML = '';

            this.assessmentHistory.slice(0, 10).forEach(assessment => {
                const item = document.createElement('div');
                item.className = 'history-item';

                const date = document.createElement('span');
                date.className = 'date';
                date.textContent = new Date(assessment.date).toLocaleDateString();

                const score = document.createElement('span');
                score.className = 'score';
                score.textContent = `Score: ${assessment.overallScore}`;

                item.appendChild(date);
                item.appendChild(score);
                historyList.appendChild(item);
            });
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('behavioralRiskAssessmentHistory', JSON.stringify(this.assessmentHistory));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            this.showNotification('Failed to save assessment history', 'error');
        }
    }

    loadFromStorage() {
        try {
            const history = localStorage.getItem('behavioralRiskAssessmentHistory');
            if (history) {
                this.assessmentHistory = JSON.parse(history);
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateUI() {
        this.updateOverallScore();
        this.updateMatrixPosition();
        this.updateCharts();
    }

    // Advanced risk calculation methods
    calculateWeightedRiskScore() {
        let totalScore = 0;
        let totalWeight = 0;

        Object.keys(this.factors).forEach(factor => {
            const factorData = this.factors[factor];
            const subFactors = factorData.subFactors;
            const values = Object.values(subFactors).map(sf => sf.value);
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;

            totalScore += average * factorData.weight;
            totalWeight += factorData.weight;
        });

        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    calculateRiskVariance() {
        const factorScores = Object.keys(this.factors).map(factor => {
            const subFactors = this.factors[factor].subFactors;
            const values = Object.values(subFactors).map(sf => sf.value);
            return values.reduce((sum, val) => sum + val, 0) / values.length;
        });

        const mean = factorScores.reduce((sum, val) => sum + val, 0) / factorScores.length;
        const variance = factorScores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / factorScores.length;

        return variance;
    }

    getRiskProfile() {
        const score = this.currentAssessment.overallScore || 0;
        const variance = this.calculateRiskVariance();

        if (score < this.riskThresholds.low) {
            return variance < 100 ? 'Low Risk - Stable' : 'Low Risk - Variable';
        } else if (score < this.riskThresholds.medium) {
            return variance < 150 ? 'Medium Risk - Moderate' : 'Medium Risk - Fluctuating';
        } else {
            return variance < 200 ? 'High Risk - Consistent' : 'High Risk - Volatile';
        }
    }

    // Validation methods
    validateAssessment() {
        const errors = [];

        Object.keys(this.factors).forEach(factor => {
            Object.keys(this.factors[factor].subFactors).forEach(subFactor => {
                const value = this.factors[factor].subFactors[subFactor].value;
                if (value < 0 || value > 100) {
                    errors.push(`${subFactor} value must be between 0 and 100`);
                }
            });
        });

        return errors;
    }

    // Data analysis methods
    getFactorCorrelations() {
        const correlations = {};
        const factorNames = Object.keys(this.factors);

        for (let i = 0; i < factorNames.length; i++) {
            for (let j = i + 1; j < factorNames.length; j++) {
                const factor1 = factorNames[i];
                const factor2 = factorNames[j];

                const score1 = this.getFactorScore(factor1);
                const score2 = this.getFactorScore(factor2);

                correlations[`${factor1}-${factor2}`] = this.calculateCorrelation(score1, score2);
            }
        }

        return correlations;
    }

    getFactorScore(factor) {
        const subFactors = this.factors[factor].subFactors;
        const values = Object.values(subFactors).map(sf => sf.value);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    calculateCorrelation(x, y) {
        // Simple correlation coefficient calculation
        const n = Math.min(x.length, y.length);
        if (n < 2) return 0;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    // Trend analysis methods
    analyzeTrends() {
        if (this.assessmentHistory.length < 2) {
            return { trend: 'insufficient-data', change: 0 };
        }

        const recentScores = this.assessmentHistory.slice(0, 5).map(a => a.overallScore);
        const firstScore = recentScores[recentScores.length - 1];
        const lastScore = recentScores[0];

        const change = lastScore - firstScore;
        const trend = change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable';

        return { trend, change, recentScores };
    }

    // Export methods for different formats
    exportToCSV() {
        const headers = ['Date', 'Overall Score', 'Risk Level', ...Object.keys(this.factors).map(f => this.factors[f].name)];
        const rows = this.assessmentHistory.map(assessment => [
            assessment.date,
            assessment.overallScore,
            assessment.riskLevel,
            ...Object.values(assessment.factorScores || {})
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `behavioral-risk-assessment-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Accessibility methods
    enhanceAccessibility() {
        // Add ARIA labels and descriptions
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const label = slider.previousElementSibling;
            if (label) {
                slider.setAttribute('aria-labelledby', label.id || '');
                slider.setAttribute('aria-valuemin', '0');
                slider.setAttribute('aria-valuemax', '100');
                slider.setAttribute('aria-valuenow', slider.value);
            }
        });

        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('btn')) {
                e.target.click();
            }
        });
    }

    // Performance monitoring
    monitorPerformance() {
        const startTime = performance.now();

        // Monitor calculation performance
        this.calculateRisk();

        const endTime = performance.now();
        const calculationTime = endTime - startTime;

        console.log(`Risk calculation took ${calculationTime.toFixed(2)} milliseconds`);

        if (calculationTime > 100) {
            console.warn('Risk calculation is taking longer than expected');
        }
    }

    // Error handling
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        this.showNotification(`An error occurred: ${error.message}`, 'error');
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        Object.keys(this.factors).forEach(factor => {
            Object.keys(this.factors[factor].subFactors).forEach(subFactor => {
                const slider = document.getElementById(`${factor}-${subFactor}`);
                if (slider) {
                    slider.removeEventListener('input', this.updateSubFactorValue);
                }
            });
        });

        // Destroy chart instances
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });

        // Clear intervals/timeouts if any
        // (Add cleanup for any timers here)
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.behavioralRiskMatrix = new BehavioralRiskScoringMatrix();
    } catch (error) {
        console.error('Failed to initialize Behavioral Risk Scoring Matrix:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Service worker registration (if needed for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Performance observer for monitoring
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
                console.log(`${entry.name}: ${entry.duration}ms`);
            }
        }
    });
    observer.observe({ entryTypes: ['measure'] });
}

// Memory usage monitoring (if available)
if ('memory' in performance) {
    setInterval(() => {
        const memInfo = performance.memory;
        console.log(`Memory usage: ${Math.round(memInfo.usedJSHeapSize / 1048576)} MB`);
    }, 30000); // Log every 30 seconds
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BehavioralRiskScoringMatrix;
}