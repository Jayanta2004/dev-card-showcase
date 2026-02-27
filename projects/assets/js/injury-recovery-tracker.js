let recoverySessions = JSON.parse(localStorage.getItem('recoverySessions')) || [];
let recoveryMilestones = JSON.parse(localStorage.getItem('recoveryMilestones')) || [];

const recoveryTips = [
    "Listen to your body and don't push through severe pain.",
    "Ice injuries for 15-20 minutes every 2-3 hours during the first 48 hours.",
    "Elevate the injured area above heart level when possible.",
    "Stay hydrated to support tissue healing and reduce inflammation.",
    "Get adequate rest and sleep for optimal recovery.",
    "Follow your healthcare provider's rehabilitation plan exactly.",
    "Maintain a healthy diet rich in anti-inflammatory foods.",
    "Use proper form during exercises to avoid re-injury.",
    "Track your progress daily to stay motivated.",
    "Communicate openly with your healthcare team about your recovery."
];

function logRecoverySession() {
    const painLevel = parseInt(document.getElementById('painLevel').value);
    const mobilityRating = parseInt(document.getElementById('mobilityRating').value);
    const sessionType = document.getElementById('sessionType').value;
    const date = document.getElementById('sessionDate').value;
    const notes = document.getElementById('notes').value;

    if (isNaN(painLevel) || isNaN(mobilityRating) || !date) {
        alert('Please fill in pain level, mobility rating, and date');
        return;
    }

    const session = {
        painLevel,
        mobilityRating,
        sessionType,
        date,
        notes,
        timestamp: new Date().getTime()
    };

    recoverySessions.push(session);
    localStorage.setItem('recoverySessions', JSON.stringify(recoverySessions));

    updateStats();
    updateMilestones();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('painLevel').value = '';
    document.getElementById('mobilityRating').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('sessionDate').value = '';
}

function updateStats() {
    if (recoverySessions.length === 0) return;

    const latestSession = recoverySessions[recoverySessions.length - 1];
    const currentPain = latestSession.painLevel;
    const currentMobility = latestSession.mobilityRating;

    // Calculate improvement (compare first session to latest)
    const firstSession = recoverySessions[0];
    const painReduction = firstSession.painLevel > 0 ?
        (((firstSession.painLevel - currentPain) / firstSession.painLevel) * 100).toFixed(1) : 0;
    const mobilityGain = firstSession.mobilityRating > 0 ?
        (((currentMobility - firstSession.mobilityRating) / firstSession.mobilityRating) * 100).toFixed(1) : 0;

    document.getElementById('currentPain').textContent = currentPain;
    document.getElementById('currentMobility').textContent = currentMobility;
    document.getElementById('painReduction').textContent = painReduction;
    document.getElementById('mobilityGain').textContent = mobilityGain;
}

function drawChart() {
    const ctx = document.getElementById('recoveryChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (recoverySessions.length === 0) return;

    const last7Sessions = recoverySessions.slice(-7);
    const painLevels = last7Sessions.map(session => session.painLevel);
    const mobilityRatings = last7Sessions.map(session => session.mobilityRating);

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / last7Sessions.length;

    // Draw pain level bars (red)
    ctx.fillStyle = 'rgba(220, 53, 69, 0.7)';
    painLevels.forEach((pain, index) => {
        const x = 25 + index * barWidth;
        const height = (pain / 10) * chartHeight;
        const y = ctx.canvas.height - height - 30;
        ctx.fillRect(x, y, barWidth - 2, height);
    });

    // Draw mobility rating bars (green)
    ctx.fillStyle = 'rgba(40, 167, 69, 0.7)';
    mobilityRatings.forEach((mobility, index) => {
        const x = 25 + index * barWidth;
        const height = (mobility / 10) * chartHeight;
        const y = ctx.canvas.height - height - 30;
        ctx.fillRect(x + 2, y, barWidth - 6, height);
    });

    // Add labels
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    last7Sessions.forEach((session, index) => {
        const x = 25 + index * barWidth;
        ctx.fillText(session.date.slice(-5), x + 5, ctx.canvas.height - 10);
    });

    // Legend
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(280, 10, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Pain', 300, 22);

    ctx.fillStyle = '#28a745';
    ctx.fillRect(280, 30, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Mobility', 300, 42);
}

function updateHistory() {
    const historyEl = document.getElementById('recoveryHistory');
    historyEl.innerHTML = '';

    recoverySessions.slice(-5).reverse().forEach(session => {
        const li = document.createElement('li');
        const painClass = session.painLevel <= 3 ? 'low' : session.painLevel <= 7 ? 'medium' : 'high';
        const mobilityClass = session.mobilityRating >= 8 ? 'good' : session.mobilityRating >= 6 ? 'average' : 'poor';

        li.innerHTML = `
            <div class="session-header">
                <span>${session.date} - ${session.sessionType.replace('-', ' ')}</span>
                <span>
                    <span class="pain-badge pain-${painClass}">Pain: ${session.painLevel}</span>
                    <span class="mobility-badge mobility-${mobilityClass}">Mobility: ${session.mobilityRating}</span>
                </span>
            </div>
            <div class="session-details">
                ${session.notes || 'No notes provided'}
            </div>
        `;
        historyEl.appendChild(li);
    });
}

function addMilestone() {
    const milestoneText = prompt('Enter a recovery milestone (e.g., "Walk without pain for 10 minutes"):');
    if (milestoneText && milestoneText.trim()) {
        const milestone = {
            text: milestoneText.trim(),
            status: 'pending',
            dateAdded: new Date().toISOString().split('T')[0],
            id: Date.now()
        };

        recoveryMilestones.push(milestone);
        localStorage.setItem('recoveryMilestones', JSON.stringify(recoveryMilestones));
        updateMilestones();
    }
}

function updateMilestones() {
    const milestoneListEl = document.getElementById('milestoneList');
    milestoneListEl.innerHTML = '';

    recoveryMilestones.forEach(milestone => {
        const div = document.createElement('div');
        div.className = `milestone-item ${milestone.status === 'achieved' ? 'completed' : ''}`;

        div.innerHTML = `
            <span>${milestone.text}</span>
            <div>
                <span class="status status-${milestone.status}">${milestone.status}</span>
                <button onclick="toggleMilestone(${milestone.id})" style="margin-left: 10px;">
                    ${milestone.status === 'achieved' ? 'Mark Pending' : 'Mark Achieved'}
                </button>
            </div>
        `;

        milestoneListEl.appendChild(div);
    });
}

function toggleMilestone(id) {
    const milestone = recoveryMilestones.find(m => m.id === id);
    if (milestone) {
        milestone.status = milestone.status === 'achieved' ? 'pending' : 'achieved';
        localStorage.setItem('recoveryMilestones', JSON.stringify(recoveryMilestones));
        updateMilestones();
    }
}

function getNewTip() {
    const randomTip = recoveryTips[Math.floor(Math.random() * recoveryTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
document.getElementById('sessionDate').valueAsDate = new Date();
updateStats();
updateMilestones();
updateHistory();
drawChart();
getNewTip();