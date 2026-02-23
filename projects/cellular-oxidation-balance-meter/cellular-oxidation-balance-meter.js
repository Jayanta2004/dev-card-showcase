// cellular-oxidation-balance-meter.js

let assessments = JSON.parse(localStorage.getItem('oxidationAssessments')) || [];
let currentAssessment = null;

// Update value displays for range inputs
function updateValueDisplays() {
    const inputs = ['oxidativeStress', 'antioxidantCapacity', 'inflammationMarkers', 'cellularEnergy'];

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

// Calculate oxidation-reduction balance
function calculateBalance() {
    const oxidativeStress = parseFloat(document.getElementById('oxidativeStress').value);
    const antioxidantCapacity = parseFloat(document.getElementById('antioxidantCapacity').value);
    const inflammationMarkers = parseFloat(document.getElementById('inflammationMarkers').value);
    const cellularEnergy = parseFloat(document.getElementById('cellularEnergy').value);

    // Balance calculation: (antioxidant + cellular energy) - (oxidative stress + inflammation)
    // Normalized to 0-100 scale
    const balance = ((antioxidantCapacity + cellularEnergy) - (oxidativeStress + inflammationMarkers) + 20) / 40 * 100;
    const clampedBalance = Math.max(0, Math.min(100, balance));

    return {
        score: Math.round(clampedBalance),
        oxidativeStress,
        antioxidantCapacity,
        inflammationMarkers,
        cellularEnergy
    };
}

// Update balance display
function updateBalanceDisplay() {
    const result = calculateBalance();
    const score = result.score;

    // Update indicator position (0-100% mapped to 0-100% of bar width)
    const indicator = document.getElementById('balanceIndicator');
    indicator.style.left = score + '%';

    // Update score and status
    document.getElementById('balanceScore').textContent = score;

    const statusElement = document.getElementById('balanceStatus');
    statusElement.className = 'score-status';

    if (score >= 80) {
        statusElement.classList.add('excellent');
        statusElement.textContent = 'Excellent Balance - Optimal Redox State';
    } else if (score >= 60) {
        statusElement.classList.add('good');
        statusElement.textContent = 'Good Balance - Healthy Redox State';
    } else if (score >= 40) {
        statusElement.classList.add('fair');
        statusElement.textContent = 'Fair Balance - Monitor Antioxidants';
    } else {
        statusElement.classList.add('poor');
        statusElement.textContent = 'Poor Balance - High Oxidation Risk';
    }

    return result;
}

// Generate personalized recommendations
function generateRecommendations(balanceData) {
    const recommendations = [];
    const { score, oxidativeStress, antioxidantCapacity, inflammationMarkers, cellularEnergy } = balanceData;

    if (oxidativeStress > 7) {
        recommendations.push("🔥 High oxidative stress detected. Consider increasing antioxidant-rich foods like berries, leafy greens, and nuts.");
        recommendations.push("💊 Consider antioxidant supplements like vitamin C, E, or CoQ10 after consulting a healthcare provider.");
    }

    if (antioxidantCapacity < 4) {
        recommendations.push("🛡️ Low antioxidant capacity. Focus on colorful vegetables, fruits, and antioxidant-rich beverages like green tea.");
        recommendations.push("🥗 Include more cruciferous vegetables (broccoli, kale) and sulfur-rich foods for glutathione production.");
    }

    if (inflammationMarkers > 6) {
        recommendations.push("🔴 Elevated inflammation markers. Reduce processed foods, sugar, and focus on anti-inflammatory foods like fatty fish, turmeric, and ginger.");
        recommendations.push("🏃‍♂️ Incorporate anti-inflammatory exercise like walking or yoga, avoiding excessive high-intensity training.");
    }

    if (cellularEnergy < 4) {
        recommendations.push("⚡ Low cellular energy. Ensure adequate sleep (7-9 hours), consider mitochondrial-supporting nutrients like B-vitamins and magnesium.");
        recommendations.push("🍽️ Eat regular, balanced meals to maintain stable blood sugar and energy levels.");
    }

    if (score < 50) {
        recommendations.push("⚖️ Overall redox imbalance. Consider comprehensive testing for oxidative stress markers and consult with a functional medicine practitioner.");
        recommendations.push("🧘 Practice stress-reduction techniques like meditation or deep breathing to lower cortisol and oxidative stress.");
    }

    // Lifestyle recommendations
    recommendations.push("🌱 General recommendations: Stay hydrated, avoid smoking, limit alcohol, and maintain a consistent sleep schedule.");
    recommendations.push("📊 Track your progress weekly and adjust lifestyle factors based on how your balance score changes.");

    return recommendations;
}

// Event listeners
document.getElementById('calculateBalanceBtn').addEventListener('click', function() {
    const balanceData = updateBalanceDisplay();

    // Show recommendations
    const recommendationsDiv = document.getElementById('recommendations');
    const recommendationContent = document.getElementById('recommendationContent');

    const recommendations = generateRecommendations(balanceData);
    recommendationContent.innerHTML = '<ul>' + recommendations.map(rec => `<li>${rec}</li>`).join('') + '</ul>';
    recommendationsDiv.style.display = 'block';

    // Enable save button
    document.getElementById('saveAssessmentBtn').disabled = false;

    // Store current assessment data
    currentAssessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        balanceScore: balanceData.score,
        oxidativeStress: balanceData.oxidativeStress,
        antioxidantCapacity: balanceData.antioxidantCapacity,
        inflammationMarkers: balanceData.inflammationMarkers,
        cellularEnergy: balanceData.cellularEnergy,
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

    localStorage.setItem('oxidationAssessments', JSON.stringify(assessments));

    // Reset UI
    document.getElementById('saveAssessmentBtn').disabled = true;
    document.getElementById('recommendations').style.display = 'none';

    currentAssessment = null;

    updateStats();
    updateChart();
    updateHistory();
});

// Update statistics
function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgBalanceScore').textContent = '--';
        document.getElementById('oxidativeStressTrend').textContent = '--';
        document.getElementById('antioxidantCapacityAvg').textContent = '--';
        document.getElementById('totalAssessments').textContent = '0';
        return;
    }

    const balanceScores = assessments.map(a => a.balanceScore);
    const avgBalance = Math.round(balanceScores.reduce((a, b) => a + b, 0) / balanceScores.length);

    const oxidativeStressLevels = assessments.map(a => a.oxidativeStress);
    const avgOxidativeStress = (oxidativeStressLevels.reduce((a, b) => a + b, 0) / oxidativeStressLevels.length).toFixed(1);

    const antioxidantLevels = assessments.map(a => a.antioxidantCapacity);
    const avgAntioxidant = (antioxidantLevels.reduce((a, b) => a + b, 0) / antioxidantLevels.length).toFixed(1);

    // Calculate trend (last 3 vs first 3 assessments)
    let trend = '--';
    if (assessments.length >= 6) {
        const recent = assessments.slice(-3).map(a => a.oxidativeStress);
        const earlier = assessments.slice(0, 3).map(a => a.oxidativeStress);

        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

        if (recentAvg < earlierAvg) {
            trend = 'Improving ↓';
        } else if (recentAvg > earlierAvg) {
            trend = 'Worsening ↑';
        } else {
            trend = 'Stable →';
        }
    }

    document.getElementById('avgBalanceScore').textContent = avgBalance;
    document.getElementById('oxidativeStressTrend').textContent = trend;
    document.getElementById('antioxidantCapacityAvg').textContent = avgAntioxidant;
    document.getElementById('totalAssessments').textContent = assessments.length;
}

// Update chart
function updateChart() {
    const ctx = document.getElementById('oxidationChart').getContext('2d');

    if (assessments.length === 0) return;

    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const balanceData = sortedAssessments.map(a => a.balanceScore);
    const oxidativeStressData = sortedAssessments.map(a => a.oxidativeStress);
    const antioxidantData = sortedAssessments.map(a => a.antioxidantCapacity);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Balance Score',
                data: balanceData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Oxidative Stress',
                data: oxidativeStressData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }, {
                label: 'Antioxidant Capacity',
                data: antioxidantData,
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
                    text: 'Cellular Oxidation Balance Trends'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Balance Score'
                    },
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Stress/Capacity Level'
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

        item.innerHTML = `
            <h4>${date}</h4>
            <p><strong>Balance Score:</strong> <span class="balance-score">${assessment.balanceScore}</span></p>
            <p><strong>Oxidative Stress:</strong> <span class="stress-level">${assessment.oxidativeStress.toFixed(1)}</span> |
            <strong>Antioxidant Capacity:</strong> <span class="antioxidant-level">${assessment.antioxidantCapacity.toFixed(1)}</span></p>
            <p><strong>Inflammation:</strong> <span class="inflammation-level">${assessment.inflammationMarkers.toFixed(1)}</span> |
            <strong>Cellular Energy:</strong> <span class="energy-level">${assessment.cellularEnergy.toFixed(1)}</span></p>
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