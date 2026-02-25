let healthData = JSON.parse(localStorage.getItem('arterialHealthData')) || [];

const tips = [
    "Maintain a healthy blood pressure below 120/80 mmHg.",
    "Aim for HDL cholesterol above 60 mg/dL for optimal heart health.",
    "Keep LDL cholesterol below 100 mg/dL to reduce cardiovascular risk.",
    "Regular exercise can improve your arterial health significantly.",
    "A Mediterranean diet is excellent for heart health.",
    "Quit smoking to dramatically reduce your cardiovascular risk.",
    "Maintain a healthy weight to support arterial function.",
    "Get regular check-ups to monitor your cardiovascular health.",
    "Reduce stress through meditation or relaxation techniques.",
    "Stay hydrated to support blood flow and arterial health."
];

document.getElementById('healthForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateHealthIndex();
});

function calculateHealthIndex() {
    const systolic = parseFloat(document.getElementById('systolic').value);
    const diastolic = parseFloat(document.getElementById('diastolic').value);
    const totalChol = parseFloat(document.getElementById('totalChol').value);
    const hdl = parseFloat(document.getElementById('hdl').value);
    const ldl = parseFloat(document.getElementById('ldl').value);
    const age = parseFloat(document.getElementById('age').value);
    const smoking = document.getElementById('smoking').value;
    const exercise = parseFloat(document.getElementById('exercise').value) || 0;
    const diet = parseFloat(document.getElementById('diet').value) || 5;

    // Calculate individual risk scores (0-100, higher is worse)
    const bpScore = calculateBPRisk(systolic, diastolic);
    const cholScore = calculateCholesterolRisk(totalChol, hdl, ldl);
    const ageScore = calculateAgeRisk(age);
    const smokingScore = calculateSmokingRisk(smoking);
    const lifestyleScore = calculateLifestyleRisk(exercise, diet);

    // Weighted overall score (0-100, lower is better)
    const overallScore = Math.round(
        (bpScore * 0.3) +
        (cholScore * 0.25) +
        (ageScore * 0.2) +
        (smokingScore * 0.15) +
        (lifestyleScore * 0.1)
    );

    // Convert to health index (0-100, higher is better)
    const healthIndex = Math.max(0, 100 - overallScore);

    const dataEntry = {
        date: new Date().toISOString(),
        systolic,
        diastolic,
        totalChol,
        hdl,
        ldl,
        age,
        smoking,
        exercise,
        diet,
        healthIndex,
        bpScore,
        cholScore,
        ageScore,
        smokingScore,
        lifestyleScore
    };

    healthData.push(dataEntry);
    if (healthData.length > 50) healthData.shift(); // Keep last 50 entries
    localStorage.setItem('arterialHealthData', JSON.stringify(healthData));

    displayResults(healthIndex, bpScore, cholScore, ageScore, smokingScore, lifestyleScore);
    updateTrendsChart();
    checkAlerts(healthIndex, systolic, diastolic, totalChol, hdl, ldl);
}

function calculateBPRisk(systolic, diastolic) {
    let score = 0;
    if (systolic >= 180 || diastolic >= 120) score = 100;
    else if (systolic >= 160 || diastolic >= 100) score = 80;
    else if (systolic >= 140 || diastolic >= 90) score = 60;
    else if (systolic >= 130 || diastolic >= 80) score = 40;
    else if (systolic >= 120 || diastolic >= 80) score = 20;
    return score;
}

function calculateCholesterolRisk(total, hdl, ldl) {
    let score = 0;

    // Total cholesterol
    if (total >= 240) score += 30;
    else if (total >= 200) score += 20;
    else if (total < 200) score += 10;

    // HDL (higher is better)
    if (hdl < 40) score += 30;
    else if (hdl < 60) score += 15;

    // LDL
    if (ldl >= 160) score += 30;
    else if (ldl >= 130) score += 20;
    else if (ldl >= 100) score += 10;

    return Math.min(100, score);
}

function calculateAgeRisk(age) {
    if (age >= 65) return 80;
    if (age >= 55) return 60;
    if (age >= 45) return 40;
    if (age >= 35) return 20;
    return 10;
}

function calculateSmokingRisk(smoking) {
    switch (smoking) {
        case 'current': return 100;
        case 'former': return 40;
        case 'never': return 10;
        default: return 10;
    }
}

function calculateLifestyleRisk(exercise, diet) {
    let score = 50; // Base score

    // Exercise (more is better)
    if (exercise >= 7) score -= 20;
    else if (exercise >= 5) score -= 15;
    else if (exercise >= 3) score -= 10;
    else if (exercise >= 1) score -= 5;

    // Diet (higher rating is better)
    if (diet >= 8) score -= 20;
    else if (diet >= 6) score -= 15;
    else if (diet >= 4) score -= 10;
    else if (diet >= 2) score -= 5;

    return Math.max(0, score);
}

function displayResults(healthIndex, bpScore, cholScore, ageScore, smokingScore, lifestyleScore) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';

    // Update score circle
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreValue = document.getElementById('scoreValue');
    scoreValue.textContent = healthIndex;

    // Color based on score
    let color;
    if (healthIndex >= 80) color = '#4caf50';
    else if (healthIndex >= 60) color = '#ffa726';
    else color = '#ff4757';

    scoreCircle.style.background = `conic-gradient(${color} 0deg, ${color} ${healthIndex * 3.6}deg, #ddd ${healthIndex * 3.6}deg)`;

    // Score description
    let description, riskLevel;
    if (healthIndex >= 80) {
        description = "Excellent arterial health! Keep up the good work.";
        riskLevel = "Low Risk";
    } else if (healthIndex >= 60) {
        description = "Good arterial health, but there's room for improvement.";
        riskLevel = "Moderate Risk";
    } else if (healthIndex >= 40) {
        description = "Fair arterial health. Consider lifestyle changes.";
        riskLevel = "High Risk";
    } else {
        description = "Poor arterial health. Consult a healthcare professional.";
        riskLevel = "Very High Risk";
    }

    document.getElementById('scoreDescription').textContent = description;
    document.getElementById('riskLevel').textContent = `Risk Level: ${riskLevel}`;

    // Factors breakdown
    const factorsList = document.getElementById('factorsList');
    factorsList.innerHTML = `
        <div class="factor-item ${getRiskClass(bpScore)}">
            <h4>Blood Pressure</h4>
            <p>Risk Score: ${bpScore}/100</p>
        </div>
        <div class="factor-item ${getRiskClass(cholScore)}">
            <h4>Cholesterol</h4>
            <p>Risk Score: ${cholScore}/100</p>
        </div>
        <div class="factor-item ${getRiskClass(ageScore)}">
            <h4>Age</h4>
            <p>Risk Score: ${ageScore}/100</p>
        </div>
        <div class="factor-item ${getRiskClass(smokingScore)}">
            <h4>Smoking</h4>
            <p>Risk Score: ${smokingScore}/100</p>
        </div>
        <div class="factor-item ${getRiskClass(lifestyleScore)}">
            <h4>Lifestyle</h4>
            <p>Risk Score: ${lifestyleScore}/100</p>
        </div>
    `;
}

function getRiskClass(score) {
    if (score >= 70) return 'high-risk';
    if (score >= 40) return 'medium-risk';
    return 'low-risk';
}

function updateTrendsChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');

    const recentData = healthData.slice(-10); // Last 10 entries
    const labels = recentData.map(entry => new Date(entry.date).toLocaleDateString());
    const scores = recentData.map(entry => entry.healthIndex);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Arterial Health Index',
                data: scores,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
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

function checkAlerts(healthIndex, systolic, diastolic, totalChol, hdl, ldl) {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    const alerts = [];

    if (systolic >= 180 || diastolic >= 120) {
        alerts.push({
            type: 'danger',
            message: 'Hypertensive crisis! Seek immediate medical attention.'
        });
    } else if (systolic >= 140 || diastolic >= 90) {
        alerts.push({
            type: 'warning',
            message: 'High blood pressure detected. Consider lifestyle changes or consult a doctor.'
        });
    }

    if (totalChol >= 240) {
        alerts.push({
            type: 'warning',
            message: 'Very high cholesterol levels. Dietary changes and medical consultation recommended.'
        });
    }

    if (ldl >= 190) {
        alerts.push({
            type: 'danger',
            message: 'Extremely high LDL cholesterol. Immediate medical attention required.'
        });
    }

    if (hdl < 40) {
        alerts.push({
            type: 'warning',
            message: 'Low HDL cholesterol. Focus on heart-healthy foods and exercise.'
        });
    }

    if (healthIndex < 40) {
        alerts.push({
            type: 'danger',
            message: 'Overall arterial health is poor. Comprehensive lifestyle changes and medical consultation strongly recommended.'
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            message: 'No critical alerts at this time. Continue monitoring your health regularly.'
        });
    }

    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alert.type}`;
        alertDiv.textContent = alert.message;
        alertsContainer.appendChild(alertDiv);
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
updateTrendsChart();
getNewTip();