// Community Renewable Energy Tracker JavaScript
// Handles energy logging, visualization, comparison, progress, sharing, and leaderboard

const energyLogForm = document.getElementById('energy-log-form');
const energyChart = document.getElementById('energy-chart');
const neighborhoodComparison = document.getElementById('neighborhood-comparison');
const energyProgress = document.getElementById('energy-progress');
const energyLeaderboard = document.getElementById('energy-leaderboard');
const shareBtn = document.getElementById('share-btn');
const shareLink = document.getElementById('share-link');
let energyData = [];
let reminders = [];
let accessibilityEnabled = false;
let notificationTimeout = null;

energyLogForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('energy-date').value;
    const type = document.getElementById('energy-type').value;
    const amount = parseInt(document.getElementById('energy-amount').value);
    const neighborhood = document.getElementById('neighborhood').value;
    if (date && type && amount && neighborhood) {
        energyData.push({ date, type, amount, neighborhood });
        renderChart();
        renderComparison();
        renderProgress();
        renderLeaderboard();
        energyLogForm.reset();
    }
});

function renderChart() {
    const ctx = energyChart.getContext('2d');
    ctx.clearRect(0, 0, energyChart.width, energyChart.height);
    ctx.font = '16px Arial';
    ctx.fillText('Renewable Energy Usage (kWh)', 10, 20);
    if (energyData.length === 0) return;
    let maxAmount = Math.max(...energyData.map(entry => entry.amount), 100);
    let barWidth = 40;
    let gap = 20;
    energyData.forEach((entry, i) => {
        let x = 10 + i * (barWidth + gap);
        let y = energyChart.height - (entry.amount / maxAmount) * (energyChart.height - 40);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x, y, barWidth, energyChart.height - y - 20);
        ctx.fillStyle = '#333';
        ctx.fillText(entry.date, x, energyChart.height - 5);
        ctx.fillText(entry.amount + 'kWh', x, y - 5);
        ctx.fillText(entry.type, x, y - 25);
        ctx.fillText(entry.neighborhood, x, y - 45);
    });
}

function renderComparison() {
    if (energyData.length === 0) {
        neighborhoodComparison.innerHTML = '<p>Log energy usage to compare neighborhoods!</p>';
        return;
    }
    let neighborhoods = {};
    energyData.forEach(entry => {
        if (!neighborhoods[entry.neighborhood]) neighborhoods[entry.neighborhood] = 0;
        neighborhoods[entry.neighborhood] += entry.amount;
    });
    let sorted = Object.entries(neighborhoods).sort((a, b) => b[1] - a[1]);
    let html = '<ul>';
    sorted.forEach(([name, total]) => {
        html += `<li>${name}: ${total} kWh</li>`;
    });
    html += '</ul>';
    neighborhoodComparison.innerHTML = html;
}

function renderProgress() {
    if (energyData.length === 0) {
        energyProgress.innerHTML = '<p>No progress data yet.</p>';
        return;
    }
    let total = energyData.reduce((sum, entry) => sum + entry.amount, 0);
    let avg = total / energyData.length;
    let msg = `Total renewable energy used: ${total} kWh<br>Average per entry: ${avg.toFixed(2)} kWh`;
    let weekly = getWeeklyProgress();
    msg += '<br>' + weekly;
    energyProgress.innerHTML = `<p>${msg}</p>`;
}

function getWeeklyProgress() {
    if (energyData.length < 7) return '';
    let last7 = energyData.slice(-7);
    let total7 = last7.reduce((sum, entry) => sum + entry.amount, 0);
    return `Last 7 days: ${total7} kWh used.`;
}

function renderLeaderboard() {
    if (energyData.length === 0) {
        energyLeaderboard.innerHTML = '<p>No leaderboard data yet.</p>';
        return;
    }
    let neighborhoods = {};
    energyData.forEach(entry => {
        if (!neighborhoods[entry.neighborhood]) neighborhoods[entry.neighborhood] = 0;
        neighborhoods[entry.neighborhood] += entry.amount;
    });
    let sorted = Object.entries(neighborhoods).sort((a, b) => b[1] - a[1]);
    let html = '<ol>';
    sorted.forEach(([name, total]) => {
        html += `<li>${name}: ${total} kWh</li>`;
    });
    html += '</ol>';
    energyLeaderboard.innerHTML = html;
}

// Export/import energy data
function exportEnergyData() {
    const dataStr = JSON.stringify(energyData);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'energy-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importEnergyData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                energyData = imported;
                renderChart();
                renderComparison();
                renderProgress();
                renderLeaderboard();
            }
        } catch (err) {
            alert('Invalid energy data file.');
        }
    };
    reader.readAsText(file);
}

// Reminders and notifications
function setReminder(time) {
    reminders.push(time);
    scheduleNotification(time);
}

function scheduleNotification(time) {
    const now = new Date();
    const [h, m] = time.split(':').map(Number);
    const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    let delay = reminderDate - now;
    if (delay < 0) delay += 24 * 60 * 60 * 1000;
    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        alert('Renewable energy reminder: Log your usage today!');
    }, delay);
}

// Accessibility features
function toggleAccessibility() {
    accessibilityEnabled = !accessibilityEnabled;
    document.body.style.fontSize = accessibilityEnabled ? '20px' : '16px';
    document.body.style.background = accessibilityEnabled ? '#fffbe6' : '#e9f7ef';
}

// Sharing progress
shareBtn.addEventListener('click', function() {
    const url = window.location.href;
    shareLink.innerHTML = `<p>Share this link: <a href="${url}">${url}</a></p>`;
});

// UI event bindings
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const reminderBtn = document.getElementById('reminder-btn');
    const accessibilityBtn = document.getElementById('accessibility-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportEnergyData);
    if (importInput) importInput.addEventListener('change', e => importEnergyData(e.target.files[0]));
    if (reminderBtn) reminderBtn.addEventListener('click', () => {
        const time = prompt('Enter reminder time (HH:MM):');
        if (time) setReminder(time);
    });
    if (accessibilityBtn) accessibilityBtn.addEventListener('click', toggleAccessibility);
});
