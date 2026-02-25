// Personal Carbon Footprint Tracker
// Author: EWOC Contributors
// Description: Calculates and visualizes users’ daily/weekly carbon footprint based on activities.

const form = document.getElementById('activityForm');
const confirmation = document.getElementById('confirmation');
const chartDiv = document.getElementById('chart');
const logDiv = document.getElementById('log');

const STORAGE_KEY = 'carbonFootprintLog';

// Emission factors (kg CO2e per unit)
const FACTORS = {
    car: 0.21, // per km
    bus: 0.11, // per km
    train: 0.05, // per km
    flight: 90, // per hour
    electricity: 0.5, // per kWh
    meat: 5, // per meal
    vegetarian: 2, // per meal
    recycling: -1 // per kg (negative for offset)
};

function getLog() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveLog(log) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

function renderLog() {
    const log = getLog();
    if (!log.length) {
        logDiv.innerHTML = '<em>No activities logged yet.</em>';
        return;
    }
    logDiv.innerHTML = log.slice().reverse().map(a =>
        `<div class="log-card">
            <b>${a.date}</b> | ${activityLabel(a.activity)}: ${a.amount} (${a.footprint.toFixed(2)} kg CO₂e)
        </div>`
    ).join('');
}

function renderChart() {
    const log = getLog();
    if (!log.length) {
        chartDiv.innerHTML = '<em>No data yet.</em>';
        return;
    }
    // Get last 7 days
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    const totals = days.map(day =>
        log.filter(a => a.date === day).reduce((sum, a) => sum + a.footprint, 0)
    );
    const max = Math.max(...totals, 1);
    chartDiv.innerHTML = days.map((day, i) =>
        `<div class="bar" style="height:${80 + 120 * (totals[i]/max)}px">
            <span>${totals[i].toFixed(1)}</span>
            <div class="bar-label">${day.slice(5)}</div>
        </div>`
    ).join('');
}

function activityLabel(key) {
    switch(key) {
        case 'car': return 'Car Travel';
        case 'bus': return 'Bus Travel';
        case 'train': return 'Train Travel';
        case 'flight': return 'Flight';
        case 'electricity': return 'Electricity Use';
        case 'meat': return 'Meat Meal';
        case 'vegetarian': return 'Vegetarian Meal';
        case 'recycling': return 'Recycling';
        default: return key;
    }
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = form.date.value;
    const activity = form.activity.value;
    const amount = parseFloat(form.amount.value);
    if (!date || !activity || isNaN(amount)) return;
    const factor = FACTORS[activity] || 0;
    const footprint = amount * factor;
    const log = getLog();
    log.push({ date, activity, amount, footprint });
    saveLog(log);
    confirmation.textContent = 'Activity logged!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderLog();
    renderChart();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderLog();
renderChart();
