let wellnessLogs = JSON.parse(localStorage.getItem('wellnessLogs')) || [];

const wellnessTips = [
    "Aim for 7-9 hours of quality sleep to optimize your overall wellness score.",
    "Incorporate at least 30 minutes of moderate exercise daily for better physical health.",
    "Stay hydrated by drinking at least 8 glasses of water throughout the day.",
    "Practice mindfulness or meditation to reduce stress and improve mental wellness.",
    "Eat a balanced diet with plenty of fruits, vegetables, and whole grains.",
    "Take short breaks during work to maintain mental clarity and reduce fatigue.",
    "Maintain social connections - regular interaction with others boosts emotional health.",
    "Get sunlight exposure in the morning to regulate your circadian rhythm.",
    "Limit screen time before bed to improve sleep quality.",
    "Practice gratitude daily - it can significantly improve mental health metrics."
];

function calculateWellnessScore(metrics) {
    let totalScore = 0;
    let weights = {
        sleep: 0.25,
        activity: 0.20,
        nutrition: 0.20,
        mental: 0.20,
        hydration: 0.15
    };

    // Sleep Score (0-100)
    let sleepScore = 0;
    if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) {
        sleepScore = 80 + (metrics.sleepQuality * 2);
    } else if (metrics.sleepHours >= 6 && metrics.sleepHours <= 10) {
        sleepScore = 60 + (metrics.sleepQuality * 2);
    } else if (metrics.sleepHours >= 5 && metrics.sleepHours <= 11) {
        sleepScore = 40 + (metrics.sleepQuality * 1.5);
    } else {
        sleepScore = Math.max(0, metrics.sleepQuality * 5);
    }
    sleepScore = Math.min(100, Math.max(0, sleepScore));

    // Activity Score (0-100)
    let activityScore = Math.min(100, (metrics.exerciseMinutes / 60) * 50 + (metrics.activityIntensity * 5));

    // Nutrition Score (0-100)
    let nutritionScore = (metrics.mealsCount / 3) * 40 + (metrics.dietQuality * 6);

    // Mental Health Score (0-100)
    let mentalScore = ((11 - metrics.stressLevel) / 10) * 50 + (metrics.moodLevel * 5);

    // Hydration Score (0-100)
    let hydrationScore = Math.min(100, (metrics.waterGlasses / 8) * 60 + (metrics.hydrationLevel * 4));

    totalScore = (sleepScore * weights.sleep) +
                (activityScore * weights.activity) +
                (nutritionScore * weights.nutrition) +
                (mentalScore * weights.mental) +
                (hydrationScore * weights.hydration);

    return {
        overall: Math.round(totalScore),
        breakdown: {
            sleep: Math.round(sleepScore),
            activity: Math.round(activityScore),
            nutrition: Math.round(nutritionScore),
            mental: Math.round(mentalScore),
            hydration: Math.round(hydrationScore)
        }
    };
}

function updateWellnessScore() {
    const metrics = {
        sleepHours: parseFloat(document.getElementById('sleepHours').value) || 0,
        sleepQuality: parseInt(document.getElementById('sleepQuality').value) || 1,
        exerciseMinutes: parseInt(document.getElementById('exerciseMinutes').value) || 0,
        activityIntensity: parseInt(document.getElementById('activityIntensity').value) || 1,
        mealsCount: parseInt(document.getElementById('mealsCount').value) || 0,
        dietQuality: parseInt(document.getElementById('dietQuality').value) || 1,
        stressLevel: parseInt(document.getElementById('stressLevel').value) || 10,
        moodLevel: parseInt(document.getElementById('moodLevel').value) || 1,
        waterGlasses: parseInt(document.getElementById('waterGlasses').value) || 0,
        hydrationLevel: parseInt(document.getElementById('hydrationLevel').value) || 1
    };

    // Validate inputs
    if (metrics.sleepHours === 0 || metrics.exerciseMinutes === 0 || metrics.mealsCount === 0 || metrics.waterGlasses === 0) {
        alert('Please fill in all required fields');
        return;
    }

    const score = calculateWellnessScore(metrics);

    const log = {
        date: new Date().toISOString().split('T')[0],
        metrics: metrics,
        score: score,
        timestamp: new Date().toISOString()
    };

    wellnessLogs.push(log);
    localStorage.setItem('wellnessLogs', JSON.stringify(wellnessLogs));

    updateScoreDisplay(score);
    updateCharts();
    generateInsights(score);
    getNewTip();

    // Clear inputs
    document.getElementById('sleepHours').value = '';
    document.getElementById('exerciseMinutes').value = '';
    document.getElementById('mealsCount').value = '';
    document.getElementById('waterGlasses').value = '';
}

function updateScoreDisplay(score) {
    document.getElementById('overallScore').textContent = score.overall;
    document.getElementById('sleepScore').textContent = score.breakdown.sleep;
    document.getElementById('activityScore').textContent = score.breakdown.activity;
    document.getElementById('nutritionScore').textContent = score.breakdown.nutrition;
    document.getElementById('mentalScore').textContent = score.breakdown.mental;
    document.getElementById('hydrationScore').textContent = score.breakdown.hydration;

    updateScoreCircle(score.overall);
}

function updateScoreCircle(score) {
    const circle = document.getElementById('wellnessCircle');
    const percentage = (score / 100) * 360;
    circle.style.background = `conic-gradient(#4ecdc4 0deg, #4ecdc4 ${percentage}deg, #e0e0e0 ${percentage}deg)`;
}

function updateCharts() {
    if (wellnessLogs.length === 0) return;

    drawScoreChart();
    drawRadarChart();
}

function drawScoreChart() {
    const canvas = document.getElementById('scoreChart');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const recentLogs = wellnessLogs.slice(-7); // Last 7 entries

    if (recentLogs.length === 0) return;

    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw data points
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 3;
    ctx.beginPath();

    const maxScore = 100;
    recentLogs.forEach((log, index) => {
        const x = padding + (index / Math.max(6, recentLogs.length - 1)) * chartWidth;
        const y = canvas.height - padding - (log.score.overall / maxScore) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Recent Wellness Scores', canvas.width / 2, canvas.height - 10);
}

function drawRadarChart() {
    const canvas = document.getElementById('radarChart');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (wellnessLogs.length === 0) return;

    const latest = wellnessLogs[wellnessLogs.length - 1];
    const metrics = latest.score.breakdown;

    const labels = ['Sleep', 'Activity', 'Nutrition', 'Mental', 'Hydration'];
    const values = [metrics.sleep, metrics.activity, metrics.nutrition, metrics.mental, metrics.hydration];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw background circles
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    // Draw data polygon
    ctx.strokeStyle = '#4ecdc4';
    ctx.fillStyle = 'rgba(78, 205, 196, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < values.length; i++) {
        const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
        const distance = (values[i] / 100) * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#4ecdc4';
    for (let i = 0; i < values.length; i++) {
        const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
        const distance = (values[i] / 100) * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius + 20);
        const y = centerY + Math.sin(angle) * (radius + 20);

        ctx.fillText(labels[i], x, y);
    }
}

function generateInsights(score) {
    const insights = [];
    const breakdown = score.breakdown;

    if (breakdown.sleep < 60) {
        insights.push("Your sleep score could be improved. Aim for 7-9 hours of quality sleep.");
    } else if (breakdown.sleep > 80) {
        insights.push("Excellent sleep habits! Keep up the good work.");
    }

    if (breakdown.activity < 50) {
        insights.push("Consider increasing your physical activity for better wellness.");
    } else if (breakdown.activity > 80) {
        insights.push("Great job staying active! Your body will thank you.");
    }

    if (breakdown.nutrition < 60) {
        insights.push("Focus on balanced nutrition with regular, quality meals.");
    }

    if (breakdown.mental < 60) {
        insights.push("Consider stress-reduction techniques to improve mental wellness.");
    } else if (breakdown.mental > 80) {
        insights.push("Your mental health metrics look strong!");
    }

    if (breakdown.hydration < 60) {
        insights.push("Increase your water intake for better hydration.");
    }

    if (score.overall > 80) {
        insights.push("Outstanding wellness score! You're doing great overall.");
    } else if (score.overall > 60) {
        insights.push("Good wellness score! Small improvements can make a big difference.");
    } else {
        insights.push("There's room for improvement. Focus on the areas with lower scores.");
    }

    document.getElementById('insights').innerHTML = insights.map(insight =>
        `<div class="insight-item">💡 ${insight}</div>`
    ).join('');
}

function getNewTip() {
    const randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Update range value displays
['sleepQuality', 'activityIntensity', 'dietQuality', 'stressLevel', 'moodLevel', 'hydrationLevel'].forEach(id => {
    const element = document.getElementById(id);
    const valueElement = document.getElementById(id + 'Value');

    element.addEventListener('input', function() {
        valueElement.textContent = this.value;
    });

    // Initialize values
    valueElement.textContent = element.value;
});

// Initialize
if (wellnessLogs.length > 0) {
    const latest = wellnessLogs[wellnessLogs.length - 1];
    updateScoreDisplay(latest.score);
    updateCharts();
    generateInsights(latest.score);
}
getNewTip();