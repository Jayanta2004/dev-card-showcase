let napLogs = JSON.parse(localStorage.getItem('napLogs')) || [];

const timingTips = [
    "Take power naps between 2-4 PM when natural energy dip occurs for maximum benefit.",
    "Avoid napping after 4 PM to prevent interference with nighttime sleep.",
    "The optimal power nap duration is 20-30 minutes to avoid grogginess.",
    "Nap in a cool, dark, quiet environment for best results.",
    "Set an alarm to avoid oversleeping - power naps should be short and sweet.",
    "Nap before mentally demanding tasks to boost cognitive performance.",
    "Consistency matters - try to nap at the same time daily for better results.",
    "Don't nap if you're not tired - forced naps can disrupt natural sleep patterns.",
    "Hydrate before napping to prevent dehydration-related fatigue upon waking.",
    "Create a pre-nap ritual like deep breathing to signal sleep time to your body."
];

function logNap() {
    const duration = parseInt(document.getElementById('napDuration').value);
    const quality = parseInt(document.getElementById('napQuality').value);
    const energyBefore = parseInt(document.getElementById('energyBefore').value);
    const energyAfter = parseInt(document.getElementById('energyAfter').value);
    const time = document.getElementById('napTime').value;
    const date = document.getElementById('napDate').value;

    if (!duration || !time || !date) {
        alert('Please fill in all required fields');
        return;
    }

    const energyGain = energyAfter - energyBefore;
    const napScore = calculateNapScore(duration, quality, energyGain);

    const log = {
        duration,
        quality,
        energyBefore,
        energyAfter,
        energyGain,
        time,
        date,
        napScore,
        timestamp: new Date().toISOString()
    };

    napLogs.push(log);
    localStorage.setItem('napLogs', JSON.stringify(napLogs));

    updateEnergyStats();
    updateChart();
    updateHistory();

    // Clear inputs
    document.getElementById('napDuration').value = '';
    document.getElementById('napQuality').value = 7;
    document.getElementById('qualityValue').textContent = '7';
    document.getElementById('energyBefore').value = 5;
    document.getElementById('energyBeforeValue').textContent = '5';
    document.getElementById('energyAfter').value = 8;
    document.getElementById('energyAfterValue').textContent = '8';
    document.getElementById('napTime').value = '';
    document.getElementById('napDate').value = '';
}

function calculateNapScore(duration, quality, energyGain) {
    let score = 0;

    // Duration score (0-40 points)
    if (duration >= 15 && duration <= 30) score += 40;
    else if (duration >= 10 && duration <= 45) score += 30;
    else if (duration >= 5 && duration <= 60) score += 20;
    else if (duration > 0) score += 10;

    // Quality score (0-30 points)
    score += (quality / 10) * 30;

    // Energy gain score (0-30 points)
    if (energyGain >= 3) score += 30;
    else if (energyGain >= 2) score += 25;
    else if (energyGain >= 1) score += 20;
    else if (energyGain >= 0) score += 15;
    else score += 5;

    return Math.min(100, Math.max(0, score));
}

function updateEnergyStats() {
    if (napLogs.length === 0) {
        document.getElementById('avgEnergyGain').textContent = '0';
        document.getElementById('bestDuration').textContent = '0';
        document.getElementById('totalNaps').textContent = '0';
        return;
    }

    const avgEnergyGain = napLogs.reduce((sum, log) => sum + log.energyGain, 0) / napLogs.length;
    const bestDuration = napLogs.reduce((best, log) =>
        log.energyGain > (napLogs.find(l => l.duration === best)?.energyGain || 0) ? log.duration : best, 0);

    document.getElementById('avgEnergyGain').textContent = avgEnergyGain.toFixed(1);
    document.getElementById('bestDuration').textContent = bestDuration;
    document.getElementById('totalNaps').textContent = napLogs.length;
}

function updateChart() {
    const canvas = document.getElementById('energyChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (napLogs.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No nap data yet', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Draw chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw data points
    const maxDuration = Math.max(...napLogs.map(log => log.duration));
    const maxEnergyGain = Math.max(...napLogs.map(log => log.energyGain));

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();

    napLogs.slice(-10).forEach((log, index) => {
        const x = padding + (index / Math.max(9, napLogs.slice(-10).length - 1)) * chartWidth;
        const y = canvas.height - padding - (log.energyGain / Math.max(maxEnergyGain, 1)) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Recent Naps', canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Energy Gain', 0, 0);
    ctx.restore();
}

function updateHistory() {
    const historyEl = document.getElementById('napHistory');
    historyEl.innerHTML = '';

    if (napLogs.length === 0) {
        historyEl.innerHTML = '<li>No power naps logged yet.</li>';
        return;
    }

    napLogs.slice(-5).reverse().forEach(log => {
        const li = document.createElement('li');

        const info = document.createElement('div');
        info.className = 'nap-info';
        info.innerHTML = `
            <h4>${log.date} at ${log.time}</h4>
            <p>Duration: ${log.duration}min | Quality: ${log.quality}/10</p>
            <p>Energy: ${log.energyBefore} → ${log.energyAfter}</p>
        `;

        const energyGain = document.createElement('div');
        energyGain.className = 'energy-gain';
        energyGain.textContent = `+${log.energyGain} energy`;

        li.appendChild(info);
        li.appendChild(energyGain);
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = timingTips[Math.floor(Math.random() * timingTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Update range value displays
document.getElementById('napQuality').addEventListener('input', function() {
    document.getElementById('qualityValue').textContent = this.value;
});

document.getElementById('energyBefore').addEventListener('input', function() {
    document.getElementById('energyBeforeValue').textContent = this.value;
});

document.getElementById('energyAfter').addEventListener('input', function() {
    document.getElementById('energyAfterValue').textContent = this.value;
});

// Initialize
document.getElementById('napDate').valueAsDate = new Date();
updateEnergyStats();
updateChart();
updateHistory();
getNewTip();