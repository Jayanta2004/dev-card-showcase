let studySessions = JSON.parse(localStorage.getItem('retentionData')) || [];

function logStudySession() {
    const topic = document.getElementById('topic').value.trim();
    const initialScore = parseInt(document.getElementById('initialScore').value);
    const date = document.getElementById('studyDate').value;

    if (!topic || isNaN(initialScore) || !date) {
        alert('Please fill in all fields');
        return;
    }

    const session = {
        id: Date.now(),
        type: 'study',
        topic: topic,
        score: initialScore,
        date: date
    };

    studySessions.push(session);
    localStorage.setItem('retentionData', JSON.stringify(studySessions));

    updateTopics();
    updateStats();
    updateHistory();
    clearStudyForm();
}

function logRetentionTest() {
    const topic = document.getElementById('testTopic').value;
    const score = parseInt(document.getElementById('testScore').value);
    const date = document.getElementById('testDate').value;

    if (!topic || isNaN(score) || !date) {
        alert('Please fill in all fields');
        return;
    }

    const test = {
        id: Date.now(),
        type: 'test',
        topic: topic,
        score: score,
        date: date
    };

    studySessions.push(test);
    localStorage.setItem('retentionData', JSON.stringify(studySessions));

    updateStats();
    updateHistory();
    clearTestForm();
}

function updateTopics() {
    const topics = [...new Set(studySessions.map(s => s.topic))];
    const testSelect = document.getElementById('testTopic');
    const graphSelect = document.getElementById('graphTopic');

    testSelect.innerHTML = '<option value="">Select Topic</option>';
    graphSelect.innerHTML = '<option value="">Select Topic</option>';

    topics.forEach(topic => {
        const option1 = document.createElement('option');
        option1.value = topic;
        option1.textContent = topic;
        testSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = topic;
        option2.textContent = topic;
        graphSelect.appendChild(option2);
    });
}

function drawRetentionGraph() {
    const topic = document.getElementById('graphTopic').value;
    if (!topic) return;

    const canvas = document.getElementById('retentionChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const topicData = studySessions.filter(s => s.topic === topic).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (topicData.length === 0) return;

    const studyDate = new Date(topicData[0].date);
    const data = topicData.map(s => ({
        days: Math.floor((new Date(s.date) - studyDate) / (1000 * 60 * 60 * 24)),
        score: s.score,
        date: s.date
    }));

    // Draw axes
    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Days Since Study', canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Recall Score (%)', 0, 0);
    ctx.restore();

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        const score = 100 - (i * 20);
        ctx.fillText(score.toString(), padding - 30, y + 5);
        ctx.beginPath();
        ctx.moveTo(padding - 5, y);
        ctx.lineTo(padding, y);
        ctx.stroke();
    }

    // X-axis labels
    const maxDays = Math.max(...data.map(d => d.days), 30);
    for (let i = 0; i <= 5; i++) {
        const x = padding + (chartWidth / 5) * i;
        const days = Math.floor((maxDays / 5) * i);
        ctx.fillText(days.toString(), x, canvas.height - padding + 20);
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - padding);
        ctx.lineTo(x, canvas.height - padding + 5);
        ctx.stroke();
    }

    // Plot data
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((point, index) => {
        const x = padding + (point.days / maxDays) * chartWidth;
        const y = padding + ((100 - point.score) / 100) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = point.days === 0 ? '#28a745' : '#667eea';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });

    ctx.stroke();

    // Legend
    ctx.fillStyle = '#28a745';
    ctx.beginPath();
    ctx.arc(padding + 20, padding + 20, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#666';
    ctx.fillText('Initial Score', padding + 35, padding + 25);

    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(padding + 150, padding + 20, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('Retention Tests', padding + 165, padding + 25);
}

function updateStats() {
    const totalSessions = studySessions.filter(s => s.type === 'study').length;
    const totalTopics = new Set(studySessions.map(s => s.topic)).size;

    const initialScores = studySessions.filter(s => s.type === 'study').map(s => s.score);
    const avgInitialScore = initialScores.length > 0 ? Math.round(initialScores.reduce((a, b) => a + b, 0) / initialScores.length) : 0;

    // Calculate 7-day retention
    const sevenDayTests = studySessions.filter(s => {
        if (s.type !== 'test') return false;
        const studySession = studySessions.find(sess => sess.topic === s.topic && sess.type === 'study');
        if (!studySession) return false;
        const daysDiff = Math.floor((new Date(s.date) - new Date(studySession.date)) / (1000 * 60 * 60 * 24));
        return daysDiff >= 6 && daysDiff <= 8;
    });
    const avg7DayRetention = sevenDayTests.length > 0 ? Math.round(sevenDayTests.reduce((a, b) => a + b.score, 0) / sevenDayTests.length) : 0;

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalTopics').textContent = totalTopics;
    document.getElementById('avgInitialScore').textContent = avgInitialScore;
    document.getElementById('avg7DayRetention').textContent = avg7DayRetention;
}

function updateHistory() {
    const historyList = document.getElementById('activityHistory');
    historyList.innerHTML = '';

    const recentActivities = studySessions.slice(-10).reverse();

    recentActivities.forEach(activity => {
        const li = document.createElement('li');
        const date = new Date(activity.date).toLocaleDateString();
        const type = activity.type === 'study' ? '📚 Study Session' : '🧪 Retention Test';
        li.textContent = `${type} - ${activity.topic} - Score: ${activity.score}% - ${date}`;
        historyList.appendChild(li);
    });
}

function clearStudyForm() {
    document.getElementById('topic').value = '';
    document.getElementById('initialScore').value = '';
    document.getElementById('studyDate').value = '';
}

function clearTestForm() {
    document.getElementById('testTopic').value = '';
    document.getElementById('testScore').value = '';
    document.getElementById('testDate').value = '';
}

// Initialize
updateTopics();
updateStats();
updateHistory();