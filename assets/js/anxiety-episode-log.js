let episodes = JSON.parse(localStorage.getItem('anxietyEpisodes')) || [];

const copingTips = [
    "Practice deep breathing: Inhale for 4 counts, hold for 4, exhale for 4.",
    "Ground yourself: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
    "Challenge negative thoughts: Ask yourself 'Is this thought based on facts or assumptions?'",
    "Use progressive muscle relaxation: Tense and release muscle groups from toes to head.",
    "Take a mindful walk: Focus on each step and your surroundings.",
    "Write down your worries: Set aside 'worry time' to process them constructively.",
    "Connect with others: Talk to a trusted friend or family member.",
    "Practice self-compassion: Treat yourself with the same kindness you'd show a friend.",
    "Limit caffeine and sugar: These can increase anxiety symptoms.",
    "Establish a routine: Regular sleep, meals, and exercise can reduce anxiety."
];

function logEpisode() {
    const intensity = parseInt(document.getElementById('intensity').value);
    const duration = parseInt(document.getElementById('duration').value);
    const dateTime = document.getElementById('episodeDateTime').value;
    const triggers = document.getElementById('triggers').value.split(',').map(t => t.trim()).filter(t => t);
    const notes = document.getElementById('notes').value;

    if (!intensity || !duration || !dateTime) {
        alert('Please fill in intensity, duration, and date/time');
        return;
    }

    const episode = {
        intensity,
        duration,
        dateTime,
        triggers,
        notes,
        timestamp: new Date().getTime()
    };

    episodes.push(episode);
    localStorage.setItem('anxietyEpisodes', JSON.stringify(episodes));

    updateStats();
    updateTriggerAnalysis();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('intensity').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('triggers').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('episodeDateTime').value = '';
}

function updateStats() {
    const totalEpisodes = episodes.length;
    const avgIntensity = episodes.length ? (episodes.reduce((sum, ep) => sum + ep.intensity, 0) / episodes.length).toFixed(1) : 0;

    // Most common trigger
    const allTriggers = episodes.flatMap(ep => ep.triggers);
    const triggerCounts = {};
    allTriggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
    const commonTrigger = Object.keys(triggerCounts).length ?
        Object.keys(triggerCounts).reduce((a, b) => triggerCounts[a] > triggerCounts[b] ? a : b) : 'None';

    // Episodes this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyCount = episodes.filter(ep => new Date(ep.dateTime) > oneWeekAgo).length;

    document.getElementById('totalEpisodes').textContent = totalEpisodes;
    document.getElementById('avgIntensity').textContent = avgIntensity;
    document.getElementById('commonTrigger').textContent = commonTrigger;
    document.getElementById('weeklyCount').textContent = weeklyCount;
}

function drawChart() {
    const ctx = document.getElementById('intensityChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (episodes.length === 0) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }

    const dailyAvgIntensity = last7Days.map(date => {
        const dayEpisodes = episodes.filter(ep => ep.dateTime.startsWith(date));
        return dayEpisodes.length ? dayEpisodes.reduce((sum, ep) => sum + ep.intensity, 0) / dayEpisodes.length : 0;
    });

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / 7;

    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 2;

    dailyAvgIntensity.forEach((avg, index) => {
        const x = 25 + index * barWidth;
        const height = (avg / 10) * chartHeight; // Max intensity 10
        const y = ctx.canvas.height - height - 30;

        const color = avg <= 3 ? '#00b894' : avg <= 7 ? '#fdcb6e' : '#e17055';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(avg.toFixed(1), x + 5, y - 5);
        ctx.fillText(last7Days[index].slice(-2), x + 5, ctx.canvas.height - 10);
    });
}

function updateTriggerAnalysis() {
    const triggerChart = document.getElementById('triggerChart');
    triggerChart.innerHTML = '';

    const allTriggers = episodes.flatMap(ep => ep.triggers);
    const triggerCounts = {};
    allTriggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });

    // Sort by frequency
    const sortedTriggers = Object.entries(triggerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10

    sortedTriggers.forEach(([trigger, count]) => {
        const div = document.createElement('div');
        div.className = 'trigger-item';
        div.innerHTML = `
            <span>${trigger}</span>
            <span class="trigger-count">${count}</span>
        `;
        triggerChart.appendChild(div);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('episodeHistory');
    historyEl.innerHTML = '';

    episodes.slice(-5).reverse().forEach(episode => {
        const li = document.createElement('li');
        const intensityClass = episode.intensity <= 3 ? 'low' : episode.intensity <= 7 ? 'medium' : 'high';

        li.innerHTML = `
            <div class="episode-header">
                <span>${new Date(episode.dateTime).toLocaleString()}</span>
                <span class="intensity-badge intensity-${intensityClass}">Level ${episode.intensity}</span>
            </div>
            <div class="episode-details">
                Duration: ${episode.duration}min |
                Triggers: ${episode.triggers.join(', ') || 'None specified'}
                ${episode.notes ? `<br>Notes: ${episode.notes}` : ''}
            </div>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = copingTips[Math.floor(Math.random() * copingTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
document.getElementById('episodeDateTime').value = new Date().toISOString().slice(0, 16);
updateStats();
updateTriggerAnalysis();
updateHistory();
drawChart();
getNewTip();