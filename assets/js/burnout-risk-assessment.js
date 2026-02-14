let assessmentHistory = JSON.parse(localStorage.getItem('burnoutAssessments')) || [];

const preventionTips = [
    "Take regular breaks throughout your workday using the Pomodoro technique.",
    "Set clear boundaries between work and personal time.",
    "Practice mindfulness or meditation for 10 minutes daily.",
    "Ensure you get 7-9 hours of quality sleep each night.",
    "Stay physically active with regular exercise.",
    "Connect with friends and family for social support.",
    "Learn to say 'no' to additional work when you're already overwhelmed.",
    "Celebrate small wins and acknowledge your accomplishments.",
    "Consider talking to a mental health professional if needed.",
    "Take at least one full day off work each week."
];

function updateWorkHoursValue() {
    document.getElementById('workHoursValue').textContent = document.getElementById('workHours').value;
}

function updateStressValue() {
    document.getElementById('stressValue').textContent = document.getElementById('stressLevel').value;
}

function updateMotivationValue() {
    document.getElementById('motivationValue').textContent = document.getElementById('motivationLevel').value;
}

function calculateBurnoutRisk() {
    // Get form values
    const workHours = parseInt(document.getElementById('workHours').value);
    const overtimeFrequency = parseInt(document.getElementById('overtimeFrequency').value);
    const stressLevel = parseInt(document.getElementById('stressLevel').value);
    const exhaustionFrequency = parseInt(document.getElementById('exhaustionFrequency').value);
    const motivationLevel = parseInt(document.getElementById('motivationLevel').value);
    const workLifeBalance = parseInt(document.getElementById('workLifeBalance').value);
    const personalTime = parseInt(document.getElementById('personalTime').value);

    // Calculate burnout score (0-100)
    // Higher scores indicate higher burnout risk
    let score = 0;

    // Workload factors (weighted heavily)
    if (workHours > 50) score += (workHours - 50) * 0.8;
    score += (overtimeFrequency - 1) * 10;

    // Stress and energy factors
    score += (stressLevel - 1) * 6;
    score += (exhaustionFrequency - 1) * 8;
    score += (11 - motivationLevel) * 5; // Inverted motivation

    // Work-life balance factors
    score += (6 - workLifeBalance) * 4;
    score += (6 - personalTime) * 4;

    // Cap at 100
    score = Math.min(Math.max(score, 0), 100);

    // Determine risk level
    let riskLevel, riskDescription, riskClass;
    if (score < 25) {
        riskLevel = "Low Risk";
        riskDescription = "Your current assessment shows low burnout risk. Keep up your healthy work habits!";
        riskClass = "low";
    } else if (score < 50) {
        riskLevel = "Moderate Risk";
        riskDescription = "You're showing some signs of stress. Consider implementing more work-life balance practices.";
        riskClass = "medium";
    } else if (score < 75) {
        riskLevel = "High Risk";
        riskDescription = "You're at significant risk of burnout. It's important to take immediate action to reduce stress.";
        riskClass = "high";
    } else {
        riskLevel = "Critical Risk";
        riskDescription = "You're at very high risk of burnout. Professional help and immediate lifestyle changes are recommended.";
        riskClass = "critical";
    }

    // Display results
    document.getElementById('burnoutScore').textContent = Math.round(score);
    document.getElementById('riskLevel').textContent = riskLevel;
    document.getElementById('riskDescription').textContent = riskDescription;

    const scoreCircle = document.getElementById('scoreCircle');
    scoreCircle.className = `score-circle risk-${riskClass}`;

    document.getElementById('resultsSection').style.display = 'block';

    // Generate recommendations
    generateRecommendations(score, riskClass);

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function generateRecommendations(score, riskLevel) {
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';

    const recommendations = [];

    if (score >= 75) {
        recommendations.push({
            title: "Seek Professional Help",
            description: "Consider consulting a mental health professional or counselor for burnout support.",
            priority: "high"
        });
        recommendations.push({
            title: "Take Extended Leave",
            description: "Request time off work or consider a sabbatical to fully recover.",
            priority: "high"
        });
    }

    if (score >= 50) {
        recommendations.push({
            title: "Immediate Stress Reduction",
            description: "Implement daily stress-reduction techniques like meditation or exercise.",
            priority: "high"
        });
        recommendations.push({
            title: "Workload Assessment",
            description: "Review and reduce your current workload with your supervisor.",
            priority: "high"
        });
    }

    if (score >= 25) {
        recommendations.push({
            title: "Improve Work-Life Balance",
            description: "Set strict boundaries between work and personal time.",
            priority: "medium"
        });
        recommendations.push({
            title: "Daily Breaks",
            description: "Take regular breaks throughout the workday to recharge.",
            priority: "medium"
        });
    }

    // Always include these
    recommendations.push({
        title: "Sleep Optimization",
        description: "Ensure 7-9 hours of quality sleep and maintain consistent sleep schedule.",
        priority: "medium"
    });
    recommendations.push({
        title: "Physical Activity",
        description: "Incorporate regular exercise and movement into your daily routine.",
        priority: "low"
    });
    recommendations.push({
        title: "Social Support",
        description: "Connect with friends, family, or support groups for emotional support.",
        priority: "low"
    });

    recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.className = `recommendation-item ${rec.priority}`;
        div.innerHTML = `
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
        `;
        recommendationsList.appendChild(div);
    });
}

function saveAssessment() {
    const score = parseInt(document.getElementById('burnoutScore').textContent);
    const riskLevel = document.getElementById('riskLevel').textContent;

    const assessment = {
        date: new Date().toISOString().split('T')[0],
        score: score,
        riskLevel: riskLevel,
        timestamp: new Date().getTime(),
        details: {
            workHours: document.getElementById('workHours').value,
            overtimeFrequency: document.getElementById('overtimeFrequency').value,
            stressLevel: document.getElementById('stressLevel').value,
            exhaustionFrequency: document.getElementById('exhaustionFrequency').value,
            motivationLevel: document.getElementById('motivationLevel').value,
            workLifeBalance: document.getElementById('workLifeBalance').value,
            personalTime: document.getElementById('personalTime').value
        }
    };

    assessmentHistory.push(assessment);
    localStorage.setItem('burnoutAssessments', JSON.stringify(assessmentHistory));

    updateHistory();
    drawTrendsChart();

    alert('Assessment saved successfully!');
}

function updateHistory() {
    const historyEl = document.getElementById('assessmentHistory');
    historyEl.innerHTML = '';

    assessmentHistory.slice(-5).reverse().forEach(assessment => {
        const li = document.createElement('li');
        const scoreClass = assessment.score < 25 ? 'low' : assessment.score < 50 ? 'medium' : assessment.score < 75 ? 'high' : 'critical';

        li.innerHTML = `
            <div>
                <div>${assessment.date}</div>
                <div style="color: #636e72; font-size: 14px;">${assessment.riskLevel}</div>
            </div>
            <span class="history-score score-${scoreClass}">${assessment.score}</span>
        `;
        historyEl.appendChild(li);
    });
}

function drawTrendsChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (assessmentHistory.length === 0) return;

    const last7Assessments = assessmentHistory.slice(-7);
    const scores = last7Assessments.map(assessment => assessment.score);
    const dates = last7Assessments.map(assessment => assessment.date);

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / last7Assessments.length;

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;

    scores.forEach((score, index) => {
        const x = 25 + index * barWidth;
        const height = (score / 100) * chartHeight;
        const y = ctx.canvas.height - height - 30;

        // Color based on risk level
        const color = score < 25 ? '#00b894' : score < 50 ? '#fdcb6e' : score < 75 ? '#e17055' : '#dc3545';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(score.toString(), x + 5, y - 5);
        ctx.fillText(dates[index].slice(-5), x + 5, ctx.canvas.height - 10);
    });
}

function getNewTip() {
    const randomTip = preventionTips[Math.floor(Math.random() * preventionTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
updateHistory();
drawTrendsChart();
getNewTip();