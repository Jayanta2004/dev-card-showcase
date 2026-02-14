let mobilityAssessments = JSON.parse(localStorage.getItem('mobilityAssessments')) || [];
let flexibilityTests = JSON.parse(localStorage.getItem('flexibilityTests')) || [];

const mobilityTips = [
    "Always warm up before stretching or mobility exercises to prevent injury.",
    "Breathe deeply and relax during stretches - tension reduces flexibility.",
    "Consistency is more important than intensity. Practice daily for best results.",
    "Focus on both sides of your body equally to maintain balance and symmetry.",
    "Use a foam roller to release tight muscles before mobility work.",
    "Stay hydrated - proper hydration improves tissue elasticity.",
    "Don't bounce during stretches. Hold positions steadily for 20-30 seconds.",
    "Consider yoga or Pilates classes for comprehensive mobility training.",
    "Track your progress regularly but don't compare yourself to others.",
    "If you experience pain (not just discomfort), stop and consult a professional."
];

const exerciseRecommendations = [
    {
        name: "Shoulder Rolls",
        description: "Gently roll shoulders forward and backward to improve mobility.",
        frequency: "Daily - 2 sets of 10 reps",
        category: "upper-body"
    },
    {
        name: "Cat-Cow Stretch",
        description: "Alternate between arching and rounding your back while on all fours.",
        frequency: "Daily - 2 sets of 10 reps",
        category: "spine"
    },
    {
        name: "Hip Circles",
        description: "Rotate hips in circular motions to improve hip joint mobility.",
        frequency: "Daily - 2 sets of 10 reps per direction",
        category: "lower-body"
    },
    {
        name: "Ankle Pumps",
        description: "Point and flex your toes to improve ankle mobility.",
        frequency: "Daily - 3 sets of 15 reps",
        category: "lower-body"
    },
    {
        name: "Neck Rotations",
        description: "Slowly turn your head side to side to maintain neck mobility.",
        frequency: "Daily - 2 sets of 10 reps per side",
        category: "upper-body"
    },
    {
        name: "Spinal Twists",
        description: "Gently twist your torso while seated to improve spinal rotation.",
        frequency: "Daily - 2 sets of 10 reps per side",
        category: "spine"
    },
    {
        name: "Knee Circles",
        description: "Rotate knees in circular motions while lying on your back.",
        frequency: "Daily - 2 sets of 10 reps per direction",
        category: "lower-body"
    },
    {
        name: "Wrist Flexor Stretch",
        description: "Extend one arm and use the other hand to gently pull back fingers.",
        frequency: "Daily - Hold 30 seconds per arm",
        category: "upper-body"
    }
];

function logAssessment() {
    const assessmentDate = document.getElementById('assessmentDate').value;
    const notes = document.getElementById('notes').value;

    // Get ROM measurements
    const rom = {
        shoulderFlexion: parseFloat(document.getElementById('shoulderFlexion').value) || 0,
        shoulderAbduction: parseFloat(document.getElementById('shoulderAbduction').value) || 0,
        elbowFlexion: parseFloat(document.getElementById('elbowFlexion').value) || 0,
        wristFlexion: parseFloat(document.getElementById('wristFlexion').value) || 0,
        spinalFlexion: document.getElementById('spinalFlexion').value,
        spinalExtension: parseFloat(document.getElementById('spinalExtension').value) || 0,
        spinalRotation: parseFloat(document.getElementById('spinalRotation').value) || 0,
        hipFlexion: parseFloat(document.getElementById('hipFlexion').value) || 0,
        kneeFlexion: parseFloat(document.getElementById('kneeFlexion').value) || 0,
        ankleDorsiflexion: parseFloat(document.getElementById('ankleDorsiflexion').value) || 0
    };

    if (!assessmentDate) {
        alert('Please select an assessment date and time');
        return;
    }

    const assessment = {
        date: assessmentDate,
        rom,
        notes,
        timestamp: new Date().getTime(),
        mobilityScore: calculateMobilityScore(rom)
    };

    mobilityAssessments.push(assessment);
    localStorage.setItem('mobilityAssessments', JSON.stringify(mobilityAssessments));

    updateStats();
    updateAlerts();
    updateHistory();
    drawChart();

    // Clear form
    document.getElementById('assessmentDate').value = '';
    document.getElementById('notes').value = '';
    Object.keys(rom).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = '';
        }
    });
}

function logFlexibilityTests() {
    const tests = {
        sitReach: parseFloat(document.getElementById('sitReach').value) || 0,
        shoulderFlex: parseFloat(document.getElementById('shoulderFlex').value) || 0,
        hamstringFlex: parseFloat(document.getElementById('hamstringFlex').value) || 0
    };

    const testDate = new Date().toISOString();

    const testEntry = {
        date: testDate,
        tests,
        timestamp: new Date().getTime()
    };

    flexibilityTests.push(testEntry);
    localStorage.setItem('flexibilityTests', JSON.stringify(flexibilityTests));

    // Clear test inputs
    Object.keys(tests).forEach(key => {
        document.getElementById(key).value = '';
    });
}

function calculateMobilityScore(rom) {
    // Calculate a composite score based on ROM measurements
    // Higher scores indicate better mobility
    let score = 0;
    let maxScore = 0;

    // Shoulder scores (out of 20 each)
    score += Math.min(rom.shoulderFlexion / 180 * 20, 20);
    maxScore += 20;
    score += Math.min(rom.shoulderAbduction / 180 * 20, 20);
    maxScore += 20;

    // Elbow and wrist (out of 15 each)
    score += Math.min(rom.elbowFlexion / 150 * 15, 15);
    maxScore += 15;
    score += Math.min(rom.wristFlexion / 90 * 15, 15);
    maxScore += 15;

    // Spine (out of 20)
    const spinalScore = rom.spinalFlexion === 'full' ? 20 :
                       rom.spinalFlexion === 'partial' ? 15 :
                       rom.spinalFlexion === 'limited' ? 10 : 5;
    score += spinalScore;
    maxScore += 20;

    // Lower body (out of 15 each)
    score += Math.min(rom.hipFlexion / 140 * 15, 15);
    maxScore += 15;
    score += Math.min(rom.kneeFlexion / 150 * 15, 15);
    maxScore += 15;
    score += Math.min(rom.ankleDorsiflexion / 25 * 15, 15);
    maxScore += 15;

    return Math.round((score / maxScore) * 100);
}

function updateStats() {
    const totalAssessments = mobilityAssessments.length;
    const avgMobilityScore = mobilityAssessments.length ?
        Math.round(mobilityAssessments.reduce((sum, assessment) => sum + assessment.mobilityScore, 0) / mobilityAssessments.length) : 0;

    // Assessments this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyAssessments = mobilityAssessments.filter(assessment =>
        new Date(assessment.date) > oneWeekAgo).length;

    // Calculate improvement rate (comparing last two assessments)
    let improvementRate = 0;
    if (mobilityAssessments.length >= 2) {
        const recent = mobilityAssessments.slice(-2);
        const improvement = recent[1].mobilityScore - recent[0].mobilityScore;
        improvementRate = Math.round((improvement / recent[0].mobilityScore) * 100);
    }

    document.getElementById('totalAssessments').textContent = totalAssessments;
    document.getElementById('avgMobilityScore').textContent = avgMobilityScore;
    document.getElementById('weeklyAssessments').textContent = weeklyAssessments;
    document.getElementById('improvementRate').textContent = improvementRate > 0 ? `+${improvementRate}%` : `${improvementRate}%`;
}

function updateAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    const alerts = [];

    // Check for recent assessments
    const lastAssessment = mobilityAssessments[mobilityAssessments.length - 1];
    if (lastAssessment) {
        // Low mobility score alert
        if (lastAssessment.mobilityScore < 60) {
            alerts.push({
                type: 'high',
                icon: '⚠️',
                message: 'Your mobility score is below average. Consider consulting a physical therapist or starting a mobility program.'
            });
        }

        // Improvement tracking
        if (mobilityAssessments.length >= 2) {
            const recent = mobilityAssessments.slice(-2);
            const improvement = recent[1].mobilityScore - recent[0].mobilityScore;
            if (improvement < 0) {
                alerts.push({
                    type: 'warning',
                    icon: '📉',
                    message: 'Mobility score decreased since last assessment. Review your routine and ensure proper form.'
                });
            }
        }

        // Specific joint concerns
        const rom = lastAssessment.rom;
        if (rom.shoulderFlexion < 140 || rom.shoulderAbduction < 120) {
            alerts.push({
                type: 'warning',
                icon: '🤚',
                message: 'Shoulder mobility may be limited. Include shoulder-specific exercises in your routine.'
            });
        }

        if (rom.spinalFlexion === 'poor' || rom.spinalFlexion === 'limited') {
            alerts.push({
                type: 'warning',
                icon: '🦴',
                message: 'Spinal flexibility needs improvement. Consider yoga or mobility exercises for better posture.'
            });
        }

        if (rom.hipFlexion < 100) {
            alerts.push({
                type: 'warning',
                icon: '🦵',
                message: 'Hip mobility is restricted. Include hip opening exercises to prevent lower back issues.'
            });
        }
    }

    // Default info alert if no specific alerts
    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            icon: 'ℹ️',
            message: 'Regular mobility assessments help prevent injuries and maintain joint health.'
        });
    }

    alerts.forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-item alert-${alert.type}`;
        div.innerHTML = `
            <span class="icon">${alert.icon}</span>
            <span>${alert.message}</span>
        `;
        alertsContainer.appendChild(div);
    });
}

function drawChart() {
    const ctx = document.getElementById('mobilityChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (mobilityAssessments.length === 0) return;

    const last7Assessments = mobilityAssessments.slice(-7);
    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / Math.max(last7Assessments.length, 1);

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;

    last7Assessments.forEach((assessment, index) => {
        const x = 25 + index * barWidth;
        const height = (assessment.mobilityScore / 100) * chartHeight;
        const y = ctx.canvas.height - height - 30;

        const color = assessment.mobilityScore >= 80 ? '#28a745' :
                     assessment.mobilityScore >= 60 ? '#ffc107' : '#dc3545';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(assessment.mobilityScore, x + 5, y - 5);
        ctx.fillText(new Date(assessment.date).toLocaleDateString().slice(-5), x + 5, ctx.canvas.height - 10);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('assessmentHistory');
    historyEl.innerHTML = '';

    mobilityAssessments.slice(-5).reverse().forEach(assessment => {
        const li = document.createElement('li');
        const scoreClass = assessment.mobilityScore >= 80 ? 'high' :
                          assessment.mobilityScore >= 60 ? 'moderate' : 'low';

        li.innerHTML = `
            <div class="assessment-header">
                <span>${new Date(assessment.date).toLocaleString()}</span>
                <span class="mobility-score score-${scoreClass}">Score: ${assessment.mobilityScore}/100</span>
            </div>
            <div class="assessment-details">
                <strong>Key Measurements:</strong><br>
                Shoulders: ${assessment.rom.shoulderFlexion}°/${assessment.rom.shoulderAbduction}° |
                Hips: ${assessment.rom.hipFlexion}° |
                Spine: ${assessment.rom.spinalFlexion}
                ${assessment.notes ? `<br><strong>Notes:</strong> ${assessment.notes}` : ''}
            </div>
        `;
        historyEl.appendChild(li);
    });
}

function getNewExercises() {
    const recommendationsEl = document.getElementById('exerciseRecommendations');
    const shuffled = [...exerciseRecommendations].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    recommendationsEl.innerHTML = '';

    selected.forEach(exercise => {
        const div = document.createElement('div');
        div.className = 'exercise-item';
        div.innerHTML = `
            <h3>${exercise.name}</h3>
            <p>${exercise.description}</p>
            <span class="exercise-frequency">${exercise.frequency}</span>
        `;
        recommendationsEl.appendChild(div);
    });
}

function getNewTip() {
    const randomTip = mobilityTips[Math.floor(Math.random() * mobilityTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
document.getElementById('assessmentDate').value = new Date().toISOString().slice(0, 16);
updateStats();
updateAlerts();
updateHistory();
drawChart();
getNewExercises();
getNewTip();