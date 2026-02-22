// Personal Energy Tracker - Log, Visualize, and Gain Insights

function getLogs() {
    return JSON.parse(localStorage.getItem('energyLogs') || '[]');
}
function saveLog(log) {
    const logs = getLogs();
    logs.push(log);
    localStorage.setItem('energyLogs', JSON.stringify(logs));
}

function renderHistory() {
    const logs = getLogs();
    const logHistory = document.getElementById('logHistory');
    logHistory.innerHTML = '';
    logs.slice().reverse().forEach(log => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${log.date}</strong> - Energy: <b>${log.energy}</b>/10<br>
            <span>Activities: ${log.activities.join(', ')}</span><br>
            <span>Mood: ${log.mood}</span>`;
        logHistory.appendChild(li);
    });
}

function renderChart() {
    const logs = getLogs();
    const ctx = document.getElementById('energyChart').getContext('2d');
    if (window.energyChart) window.energyChart.destroy();
    const labels = logs.map(l => l.date);
    const data = logs.map(l => l.energy);
    window.energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Energy Level',
                data: data,
                borderColor: '#f7971e',
                backgroundColor: 'rgba(247,151,30,0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { min: 0, max: 10 }
            }
        }
    });
}

function renderInsights() {
    const logs = getLogs();
    if (!logs.length) {
        document.getElementById('insights').innerHTML = '<em>No data yet.</em>';
        return;
    }
    // Find most common activities for high/low energy
    const high = logs.filter(l => l.energy >= 7);
    const low = logs.filter(l => l.energy <= 4);
    function topActivities(arr) {
        const freq = {};
        arr.forEach(l => l.activities.forEach(a => { freq[a] = (freq[a]||0)+1; }));
        return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([a])=>a).join(', ') || 'None';
    }
    const highActs = topActivities(high);
    const lowActs = topActivities(low);
    document.getElementById('insights').innerHTML = `<b>Top activities when energy is high:</b> ${highActs}<br>
        <b>Top activities when energy is low:</b> ${lowActs}`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    renderChart();
    renderInsights();
    const energySlider = document.getElementById('energyLevel');
    const energyValue = document.getElementById('energyValue');
    energySlider.addEventListener('input', () => {
        energyValue.textContent = energySlider.value;
    });
    document.getElementById('logForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const date = document.getElementById('logDate').value;
        const energy = parseInt(document.getElementById('energyLevel').value);
        const activities = document.getElementById('activities').value.split(',').map(a=>a.trim()).filter(Boolean);
        const mood = document.getElementById('mood').value.trim();
        if (!date || !energy || !activities.length || !mood) return;
        saveLog({ date, energy, activities, mood });
        renderHistory();
        renderChart();
        renderInsights();
        document.getElementById('logForm').reset();
        energyValue.textContent = 5;
        energySlider.value = 5;
    });
});
