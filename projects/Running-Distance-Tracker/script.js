let runs = JSON.parse(localStorage.getItem('runningData')) || [];

const tips = [
    "Start with a proper warm-up to prevent injuries.",
    "Maintain a consistent pace to build endurance.",
    "Stay hydrated before, during, and after your run.",
    "Incorporate strength training to improve running performance.",
    "Track your progress to stay motivated.",
    "Listen to your body and rest when needed.",
    "Focus on proper running form: head up, shoulders relaxed.",
    "Gradually increase your distance to avoid overtraining.",
    "Use running apps to monitor your pace and distance.",
    "Celebrate small victories and set achievable goals."
];

function logRun() {
    const distance = parseFloat(document.getElementById('distance').value);
    const time = parseInt(document.getElementById('time').value);
    const date = document.getElementById('runDate').value;

    if (!distance || !time || !date) {
        alert('Please fill in all fields');
        return;
    }

    const pace = time / distance; // minutes per km
    const run = { distance, time, pace, date };

    runs.push(run);
    localStorage.setItem('runningData', JSON.stringify(runs));

    updateStats();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('distance').value = '';
    document.getElementById('time').value = '';
    document.getElementById('runDate').value = '';
}

function updateStats() {
    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
    const avgPace = runs.length ? runs.reduce((sum, run) => sum + run.pace, 0) / runs.length : 0;
    const bestPace = runs.length ? Math.min(...runs.map(run => run.pace)) : 0;

    document.getElementById('totalDistance').textContent = totalDistance.toFixed(1);
    document.getElementById('avgPace').textContent = formatPace(avgPace);
    document.getElementById('bestPace').textContent = formatPace(bestPace);
    document.getElementById('runCount').textContent = runs.length;
}

function formatPace(pace) {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function drawChart() {
    const ctx = document.getElementById('paceChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (runs.length === 0) return;

    const recentRuns = runs.slice(-7); // Last 7 runs
    const paces = recentRuns.map(run => run.pace);
    const maxPace = Math.max(...paces);
    const minPace = Math.min(...paces);

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / recentRuns.length;

    ctx.strokeStyle = '#0984e3';
    ctx.lineWidth = 2;
    ctx.beginPath();

    recentRuns.forEach((run, index) => {
        const x = 25 + index * barWidth;
        const height = ((maxPace - run.pace) / (maxPace - minPace || 1)) * chartHeight;
        const y = ctx.canvas.height - height - 30;

        ctx.fillStyle = '#74b9ff';
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(formatPace(run.pace), x + 5, y - 5);
        ctx.fillText(run.date.slice(-5), x + 5, ctx.canvas.height - 10);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('runHistory');
    historyEl.innerHTML = '';

    runs.slice(-5).reverse().forEach(run => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${run.date}: ${run.distance}km in ${run.time}min</span>
            <span>Pace: ${formatPace(run.pace)}/km</span>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
document.getElementById('runDate').valueAsDate = new Date();
updateStats();
updateHistory();
drawChart();
getNewTip();</content>
<parameter name="filePath">C:\Users\Gupta\Downloads\dev-card-showcase\projects\Running-Distance-Tracker\script.js