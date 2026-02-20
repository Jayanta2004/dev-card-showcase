// mental-overload-warning-system.js

let assessments = JSON.parse(localStorage.getItem('mentalAssessments')) || [];

document.addEventListener('DOMContentLoaded', function() {
    updateSliders();
    displayHistory();
    renderChart();
});

function updateSliders() {
    const stressSlider = document.getElementById('stressLevel');
    const complexitySlider = document.getElementById('taskComplexity');
    const stressValue = document.getElementById('stressValue');
    const complexityValue = document.getElementById('complexityValue');

    stressSlider.addEventListener('input', function() {
        stressValue.textContent = this.value;
    });

    complexitySlider.addEventListener('input', function() {
        complexityValue.textContent = this.value;
    });
}

function calculateOverload() {
    const stress = parseInt(document.getElementById('stressLevel').value);
    const workload = parseFloat(document.getElementById('workloadHours').value);
    const complexity = parseInt(document.getElementById('taskComplexity').value);
    const sleep = parseFloat(document.getElementById('sleepHours').value);
    const breaks = parseInt(document.getElementById('breaksTaken').value);

    // Calculate overload score
    // Base score considers stress, complexity, and workload normalized to 8 hours
    let score = (stress * complexity * (workload / 8));

    // Adjust for sleep (less sleep increases score)
    score = score / (sleep / 8);

    // Adjust for breaks (more breaks decrease score)
    score = score / (breaks + 1);

    // Round to 1 decimal place
    score = Math.round(score * 10) / 10;

    // Determine risk level
    let riskLevel, riskClass;
    if (score < 2) {
        riskLevel = 'Low Risk';
        riskClass = 'low';
    } else if (score < 4) {
        riskLevel = 'Moderate Risk';
        riskClass = 'moderate';
    } else if (score < 6) {
        riskLevel = 'High Risk';
        riskClass = 'high';
    } else {
        riskLevel = 'Critical Risk';
        riskClass = 'critical';
    }

    // Display results
    document.getElementById('overloadScore').textContent = score;
    const riskElement = document.getElementById('riskLevel');
    riskElement.textContent = riskLevel;
    riskElement.className = 'risk-level ' + riskClass;

    // Generate alerts
    displayAlerts(score, riskClass);

    // Save assessment
    const assessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        stress: stress,
        workload: workload,
        complexity: complexity,
        sleep: sleep,
        breaks: breaks,
        score: score,
        riskLevel: riskLevel
    };

    assessments.unshift(assessment);
    if (assessments.length > 14) assessments = assessments.slice(0, 14); // Keep last 14 days

    localStorage.setItem('mentalAssessments', JSON.stringify(assessments));
    displayHistory();
    renderChart();
}

function displayAlerts(score, riskClass) {
    const alertsDiv = document.getElementById('alertsList');
    let alerts = [];

    if (riskClass === 'critical') {
        alerts.push({
            type: 'critical',
            message: '🚨 CRITICAL: Immediate action required! Take a break, meditate, or seek professional help.'
        });
    }

    if (riskClass === 'high') {
        alerts.push({
            type: 'high',
            message: '⚠️ HIGH RISK: Consider reducing workload and taking more breaks.'
        });
    }

    if (score > 3) {
        alerts.push({
            type: 'moderate',
            message: '📊 Monitor closely: Your current load may lead to burnout if sustained.'
        });
    }

    if (score < 2) {
        alerts.push({
            type: 'low',
            message: '✅ Good balance: Keep maintaining healthy work-life boundaries.'
        });
    }

    // Specific recommendations
    const stress = parseInt(document.getElementById('stressLevel').value);
    const sleep = parseFloat(document.getElementById('sleepHours').value);
    const breaks = parseInt(document.getElementById('breaksTaken').value);

    if (stress > 7) {
        alerts.push({
            type: 'high',
            message: '💭 High stress detected: Try deep breathing or mindfulness exercises.'
        });
    }

    if (sleep < 7) {
        alerts.push({
            type: 'moderate',
            message: '😴 Insufficient sleep: Aim for 7-9 hours nightly for optimal mental health.'
        });
    }

    if (breaks < 3) {
        alerts.push({
            type: 'moderate',
            message: '⏰ Few breaks taken: Take short breaks every 90 minutes to maintain focus.'
        });
    }

    let alertsHTML = '';
    alerts.forEach(alert => {
        alertsHTML += `<div class="alert ${alert.type}">${alert.message}</div>`;
    });

    alertsDiv.innerHTML = alertsHTML;
}

function displayHistory() {
    const historyDiv = document.getElementById('assessmentHistory');
    if (assessments.length === 0) {
        historyDiv.innerHTML = '<p>No assessments yet.</p>';
        return;
    }

    let historyHTML = '';
    assessments.slice(0, 7).forEach(assessment => { // Show last 7
        const date = new Date(assessment.date).toLocaleDateString();
        historyHTML += `
            <div class="assessment-item">
                <h4>${date}</h4>
                <p><strong>Score:</strong> ${assessment.score} (${assessment.riskLevel})</p>
                <p><strong>Stress:</strong> ${assessment.stress}/10 | <strong>Workload:</strong> ${assessment.workload}h | <strong>Sleep:</strong> ${assessment.sleep}h</p>
            </div>
        `;
    });

    historyDiv.innerHTML = historyHTML;
}

function renderChart() {
    const ctx = document.getElementById('overloadChart').getContext('2d');

    // Get last 7 days data
    const recentAssessments = assessments.slice(0, 7).reverse();
    const labels = recentAssessments.map(a => new Date(a.date).toLocaleDateString());
    const scores = recentAssessments.map(a => a.score);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Overload Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Overload Score'
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
                    display: false
                }
            }
        }
    });
}