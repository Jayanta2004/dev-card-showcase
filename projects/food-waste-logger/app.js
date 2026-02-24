// Food Waste Logger JavaScript
// Handles waste logging, visualization, tips, and impact analysis

const wasteLogForm = document.getElementById('waste-log-form');
const wasteChart = document.getElementById('waste-chart');
const wasteTips = document.getElementById('waste-tips');
const wasteImpact = document.getElementById('waste-impact');
let wasteData = [];
let reminders = [];
let accessibilityEnabled = false;
let notificationTimeout = null;

wasteLogForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('waste-date').value;
    const type = document.getElementById('waste-type').value;
    const amount = parseInt(document.getElementById('waste-amount').value);
    const reason = document.getElementById('waste-reason').value;
    if (date && type && amount && reason) {
        wasteData.push({ date, type, amount, reason });
        renderChart();
        renderTips();
        renderImpact();
        wasteLogForm.reset();
    }
});

function renderChart() {
    const ctx = wasteChart.getContext('2d');
    ctx.clearRect(0, 0, wasteChart.width, wasteChart.height);
    ctx.font = '16px Arial';
    ctx.fillText('Food Waste (grams)', 10, 20);
    if (wasteData.length === 0) return;
    let maxAmount = Math.max(...wasteData.map(entry => entry.amount), 500);
    let barWidth = 40;
    let gap = 20;
    wasteData.forEach((entry, i) => {
        let x = 10 + i * (barWidth + gap);
        let y = wasteChart.height - (entry.amount / maxAmount) * (wasteChart.height - 40);
        ctx.fillStyle = '#e94e77';
        ctx.fillRect(x, y, barWidth, wasteChart.height - y - 20);
        ctx.fillStyle = '#333';
        ctx.fillText(entry.date, x, wasteChart.height - 5);
        ctx.fillText(entry.amount + 'g', x, y - 5);
        ctx.fillText(entry.type, x, y - 25);
    });
}

function renderTips() {
    if (wasteData.length === 0) {
        wasteTips.innerHTML = '<p>Log your food waste to get tips!</p>';
        return;
    }
    let reasons = wasteData.map(entry => entry.reason);
    let tips = '';
    if (reasons.includes('Spoiled')) {
        tips += 'Store food properly to prevent spoilage.<br>';
    }
    if (reasons.includes('Leftover')) {
        tips += 'Plan meals and use leftovers creatively.<br>';
    }
    if (reasons.includes('Expired')) {
        tips += 'Check expiry dates and buy only what you need.<br>';
    }
    if (tips === '') {
        tips = 'Keep tracking your waste to get personalized tips.';
    }
    wasteTips.innerHTML = `<p>${tips}</p>`;
}

function renderImpact() {
    if (wasteData.length === 0) {
        wasteImpact.innerHTML = '<p>No impact data yet.</p>';
        return;
    }
    let total = wasteData.reduce((sum, entry) => sum + entry.amount, 0);
    let avg = total / wasteData.length;
    let msg = `Total waste: ${total}g<br>Average per entry: ${avg.toFixed(2)}g`;
    let weekly = getWeeklyImpact();
    msg += '<br>' + weekly;
    wasteImpact.innerHTML = `<p>${msg}</p>`;
}

function getWeeklyImpact() {
    if (wasteData.length < 7) return '';
    let last7 = wasteData.slice(-7);
    let total7 = last7.reduce((sum, entry) => sum + entry.amount, 0);
    return `Last 7 days: ${total7}g waste.`;
}

// Export/import waste data
function exportWasteData() {
    const dataStr = JSON.stringify(wasteData);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waste-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importWasteData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                wasteData = imported;
                renderChart();
                renderTips();
                renderImpact();
            }
        } catch (err) {
            alert('Invalid waste data file.');
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
        alert('Food waste reminder: Log your waste today!');
    }, delay);
}

// Accessibility features
function toggleAccessibility() {
    accessibilityEnabled = !accessibilityEnabled;
    document.body.style.fontSize = accessibilityEnabled ? '20px' : '16px';
    document.body.style.background = accessibilityEnabled ? '#fffbe6' : '#f5f7fa';
}

// UI event bindings
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const reminderBtn = document.getElementById('reminder-btn');
    const accessibilityBtn = document.getElementById('accessibility-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportWasteData);
    if (importInput) importInput.addEventListener('change', e => importWasteData(e.target.files[0]));
    if (reminderBtn) reminderBtn.addEventListener('click', () => {
        const time = prompt('Enter reminder time (HH:MM):');
        if (time) setReminder(time);
    });
    if (accessibilityBtn) accessibilityBtn.addEventListener('click', toggleAccessibility);
});
