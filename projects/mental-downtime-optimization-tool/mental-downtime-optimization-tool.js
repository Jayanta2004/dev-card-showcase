// mental-downtime-optimization-tool.js

let assessments = JSON.parse(localStorage.getItem('mentalDowntimeAssessments')) || [];
let currentAssessment = null;

// Update value displays for range inputs
function updateValueDisplays() {
    const inputs = ['mentalFatigue', 'cognitiveRecovery', 'attentionSpan', 'emotionalClarity'];

    inputs.forEach(id => {
        const input = document.getElementById(id);
        const display = document.getElementById(id + 'Value');

        input.addEventListener('input', function() {
            display.textContent = parseFloat(this.value).toFixed(1);
        });

        // Initialize display
        display.textContent = parseFloat(input.value).toFixed(1);
    });
}

// Calculate mental downtime optimization score
function calculateOptimizationScore() {
    const mentalFatigue = parseFloat(document.getElementById('mentalFatigue').value);
    const cognitiveRecovery = parseFloat(document.getElementById('cognitiveRecovery').value);
    const attentionSpan = parseFloat(document.getElementById('attentionSpan').value);
    const emotionalClarity = parseFloat(document.getElementById('emotionalClarity').value);

    // Get selected activities
    const selectedActivities = getSelectedActivities();

    // Base score from mental metrics (weighted average)
    const mentalScore = (cognitiveRecovery + attentionSpan + emotionalClarity - mentalFatigue + 10) / 30 * 100;

    // Activity bonus (0-20 points based on activity selection and quality)
    const activityBonus = calculateActivityBonus(selectedActivities, mentalFatigue);

    // Final score (capped at 100)
    const finalScore = Math.min(100, Math.max(0, mentalScore + activityBonus));

    return {
        score: Math.round(finalScore),
        mentalFatigue,
        cognitiveRecovery,
        attentionSpan,
        emotionalClarity,
        selectedActivities,
        activityBonus
    };
}

// Get selected downtime activities
function getSelectedActivities() {
    const checkboxes = document.querySelectorAll('.activity-option input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Calculate activity bonus based on selection quality and mental fatigue
function calculateActivityBonus(activities, fatigue) {
    if (activities.length === 0) return 0;

    // Activity effectiveness scores (higher is better for recovery)
    const activityScores = {
        'meditation': 8,
        'nature': 9,
        'sleep': 10,
        'music': 6,
        'reading': 7,
        'exercise': 7,
        'social': 6,
        'hobby': 8
    };

    // Calculate average activity effectiveness
    const avgEffectiveness = activities.reduce((sum, activity) => sum + (activityScores[activity] || 5), 0) / activities.length;

    // Bonus increases with higher fatigue (more recovery needed)
    const fatigueMultiplier = fatigue / 10;

    // Base bonus from activity count and quality
    const baseBonus = (activities.length / 8) * 10 + (avgEffectiveness / 10) * 10;

    return baseBonus * (0.5 + fatigueMultiplier * 0.5);
}

// Update score display with circular progress
function updateScoreDisplay(scoreData) {
    const score = scoreData.score;
    const circle = document.querySelector('.score-circle');

    // Update circular progress
    const angle = (score / 100) * 360;
    circle.style.background = `conic-gradient(var(--primary-color) 0deg, var(--primary-color) ${angle}deg, #e9ecef ${angle}deg)`;

    // Update score value
    document.getElementById('optimizationScore').textContent = score;

    // Update status
    const statusElement = document.getElementById('optimizationStatus');
    statusElement.className = 'score-status';

    if (score >= 80) {
        statusElement.classList.add('excellent');
        statusElement.textContent = 'Excellent Optimization - Peak Mental Recovery';
    } else if (score >= 60) {
        statusElement.classList.add('good');
        statusElement.textContent = 'Good Optimization - Effective Recovery Strategy';
    } else if (score >= 40) {
        statusElement.classList.add('fair');
        statusElement.textContent = 'Fair Optimization - Room for Improvement';
    } else {
        statusElement.classList.add('poor');
        statusElement.textContent = 'Poor Optimization - Needs Better Strategy';
    }

    return scoreData;
}

// Generate personalized recommendations
function generateRecommendations(scoreData) {
    const recommendations = [];
    const { mentalFatigue, cognitiveRecovery, attentionSpan, emotionalClarity, selectedActivities } = scoreData;

    if (mentalFatigue > 7) {
        recommendations.push("🔥 High mental fatigue detected. Prioritize restorative activities like quality sleep and meditation.");
        recommendations.push("⏰ Consider the Pomodoro technique: 25 minutes focused work followed by 5-minute breaks.");
    }

    if (cognitiveRecovery < 4) {
        recommendations.push("🧠 Low cognitive recovery. Incorporate nature exposure or mindfulness practices for better restoration.");
        recommendations.push("🌳 Try 'forest bathing' or spend time in green spaces to accelerate mental recovery.");
    }

    if (attentionSpan < 4) {
        recommendations.push("🎯 Poor attention quality. Short, frequent breaks with movement can help restore focus.");
        recommendations.push("🏃‍♂️ Take brief walks or do light stretching during breaks to reset attention resources.");
    }

    if (emotionalClarity < 4) {
        recommendations.push("😌 Low emotional clarity. Journaling or talking with trusted friends can help process emotions.");
        recommendations.push("📝 Practice emotional awareness through journaling or mindfulness meditation.");
    }

    // Activity-specific recommendations
    if (selectedActivities.length < 3) {
        recommendations.push("📋 Select more downtime activities. Aim for 3-5 different restorative activities daily.");
    }

    if (!selectedActivities.includes('sleep')) {
        recommendations.push("😴 Quality sleep is crucial for mental recovery. Ensure 7-9 hours of restorative sleep.");
    }

    if (!selectedActivities.includes('meditation') && mentalFatigue > 5) {
        recommendations.push("🧘 Consider adding meditation. Even 10 minutes daily can significantly improve mental clarity.");
    }

    if (!selectedActivities.includes('nature') && cognitiveRecovery < 6) {
        recommendations.push("🌳 Nature exposure enhances cognitive recovery. Try outdoor walks or gardening.");
    }

    // General recommendations
    recommendations.push("⏰ Schedule downtime strategically. Use ultradian rhythms (90-120 minute work cycles) for optimal mental performance.");
    recommendations.push("📊 Track your optimization score weekly to identify patterns and adjust your recovery strategy.");

    return recommendations;
}

// Event listeners
document.getElementById('calculateOptimizationBtn').addEventListener('click', function() {
    const scoreData = calculateOptimizationScore();
    updateScoreDisplay(scoreData);

    // Show recommendations
    const recommendationsDiv = document.getElementById('recommendations');
    const recommendationContent = document.getElementById('recommendationContent');

    const recommendations = generateRecommendations(scoreData);
    recommendationContent.innerHTML = '<ul>' + recommendations.map(rec => `<li>${rec}</li>`).join('') + '</ul>';
    recommendationsDiv.style.display = 'block';

    // Enable save button
    document.getElementById('saveAssessmentBtn').disabled = false;

    // Store current assessment data
    currentAssessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        optimizationScore: scoreData.score,
        mentalFatigue: scoreData.mentalFatigue,
        cognitiveRecovery: scoreData.cognitiveRecovery,
        attentionSpan: scoreData.attentionSpan,
        emotionalClarity: scoreData.emotionalClarity,
        selectedActivities: scoreData.selectedActivities,
        recommendations: recommendations
    };
});

document.getElementById('saveAssessmentBtn').addEventListener('click', function() {
    if (!currentAssessment) return;

    assessments.push(currentAssessment);

    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }

    localStorage.setItem('mentalDowntimeAssessments', JSON.stringify(assessments));

    // Reset UI
    document.getElementById('saveAssessmentBtn').disabled = true;
    document.getElementById('recommendations').style.display = 'none';

    // Reset checkboxes
    document.querySelectorAll('.activity-option input[type="checkbox"]').forEach(cb => cb.checked = false);

    currentAssessment = null;

    updateStats();
    updateChart();
    updateHistory();
});

// Update statistics
function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgOptimizationScore').textContent = '--';
        document.getElementById('mentalFatigueTrend').textContent = '--';
        document.getElementById('recoveryRateAvg').textContent = '--';
        document.getElementById('totalAssessments').textContent = '0';
        return;
    }

    const optimizationScores = assessments.map(a => a.optimizationScore);
    const avgScore = Math.round(optimizationScores.reduce((a, b) => a + b, 0) / optimizationScores.length);

    const fatigueLevels = assessments.map(a => a.mentalFatigue);
    const avgFatigue = (fatigueLevels.reduce((a, b) => a + b, 0) / fatigueLevels.length).toFixed(1);

    const recoveryLevels = assessments.map(a => a.cognitiveRecovery);
    const avgRecovery = (recoveryLevels.reduce((a, b) => a + b, 0) / recoveryLevels.length).toFixed(1);

    // Calculate trend (comparing first half vs second half)
    let trend = '--';
    if (assessments.length >= 6) {
        const midPoint = Math.floor(assessments.length / 2);
        const firstHalf = assessments.slice(0, midPoint).map(a => a.mentalFatigue);
        const secondHalf = assessments.slice(midPoint).map(a => a.mentalFatigue);

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        if (avgSecond < avgFirst) {
            trend = 'Improving ↓';
        } else if (avgSecond > avgFirst) {
            trend = 'Worsening ↑';
        } else {
            trend = 'Stable →';
        }
    }

    document.getElementById('avgOptimizationScore').textContent = avgScore;
    document.getElementById('mentalFatigueTrend').textContent = trend;
    document.getElementById('recoveryRateAvg').textContent = avgRecovery;
    document.getElementById('totalAssessments').textContent = assessments.length;
}

// Update chart
function updateChart() {
    const ctx = document.getElementById('mentalRecoveryChart').getContext('2d');

    if (assessments.length === 0) return;

    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const optimizationData = sortedAssessments.map(a => a.optimizationScore);
    const fatigueData = sortedAssessments.map(a => a.mentalFatigue);
    const recoveryData = sortedAssessments.map(a => a.cognitiveRecovery);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Optimization Score',
                data: optimizationData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Mental Fatigue',
                data: fatigueData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }, {
                label: 'Cognitive Recovery',
                data: recoveryData,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Mental Downtime Optimization Trends'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Optimization Score'
                    },
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Fatigue/Recovery Level'
                    },
                    max: 10
                }
            }
        }
    });
}

// Update history
function updateHistory() {
    const history = document.getElementById('assessmentHistory');
    history.innerHTML = '';

    // Show last 10 assessments
    const recentAssessments = assessments.slice(-10).reverse();

    recentAssessments.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'assessment-entry';

        const date = new Date(assessment.date).toLocaleString();
        const activitiesText = assessment.selectedActivities.length > 0
            ? assessment.selectedActivities.join(', ')
            : 'No activities selected';

        item.innerHTML = `
            <h4>${date}</h4>
            <p><strong>Optimization Score:</strong> <span class="optimization-score">${assessment.optimizationScore}</span></p>
            <p><strong>Mental Fatigue:</strong> <span class="fatigue-level">${assessment.mentalFatigue.toFixed(1)}</span> |
            <strong>Cognitive Recovery:</strong> <span class="recovery-level">${assessment.cognitiveRecovery.toFixed(1)}</span></p>
            <p><strong>Activities:</strong> <span class="activities-list">${activitiesText}</span></p>
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateValueDisplays();
    updateStats();
    updateChart();
    updateHistory();
});