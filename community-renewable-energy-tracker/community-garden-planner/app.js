// Water Usage Dashboard JS
const form = document.getElementById('water-log-form');
const dateInput = document.getElementById('date');
const usageInput = document.getElementById('usage');
const tipsList = document.getElementById('tips-list');
const ctx = document.getElementById('usageChart').getContext('2d');

let usageData = JSON.parse(localStorage.getItem('waterUsageData') || '[]');

function saveData() {
    localStorage.setItem('waterUsageData', JSON.stringify(usageData));
}

function renderChart() {
    const labels = usageData.map(entry => entry.date);
    const data = usageData.map(entry => entry.usage);
    if (window.usageChart) window.usageChart.destroy();
    window.usageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Liters Used',
                data,
                borderColor: '#fff',
                backgroundColor: 'rgba(34,34,34,0.5)',
                pointBackgroundColor: '#bdbdbd',
                tension: 0.3,
                fill: true,
            }]
        },
        options: {
            plugins: {
                legend: { labels: { color: '#fff' } }
            },
            scales: {
                x: { ticks: { color: '#bdbdbd' }, grid: { color: '#232323' } },
                y: { ticks: { color: '#bdbdbd' }, grid: { color: '#232323' } }
            }
        }
    });
}

function getTips() {
    if (usageData.length < 3) return [
        'Log at least 3 days to get personalized tips.',
        'Fix leaky faucets to save water.',
        'Turn off the tap while brushing your teeth.'
    ];
    const avg = usageData.reduce((a, b) => a + b.usage, 0) / usageData.length;
    const tips = [];
    if (avg > 200) tips.push('Your average usage is high. Try shorter showers and full laundry loads.');
    else if (avg > 120) tips.push('Good job! Try to reduce usage by 10% for even more savings.');
    else tips.push('Excellent! Your water usage is below average. Keep it up!');
    tips.push('Check for leaks and use water-efficient fixtures.');
    tips.push('Collect rainwater for gardening if possible.');
    return tips;
}

function renderTips() {
    tipsList.innerHTML = '';
    getTips().forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const date = dateInput.value;
    const usage = parseInt(usageInput.value, 10);
    if (!date || isNaN(usage)) return;
    // Prevent duplicate date entries
    usageData = usageData.filter(entry => entry.date !== date);
    usageData.push({ date, usage });
    usageData.sort((a, b) => a.date.localeCompare(b.date));
    saveData();
    renderChart();
    renderTips();
    form.reset();
});

// Initial render
renderChart();
renderTips();
// Community Garden Planner
// Plan, schedule, and track garden activities

// Plan Section
const planForm = document.getElementById('plan-form');
const planList = document.getElementById('plan-list');
let plans = JSON.parse(localStorage.getItem('gardenPlans') || '[]');

planForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('plant-name').value.trim();
    const location = document.getElementById('plot-location').value.trim();
    const date = document.getElementById('plant-date').value;
    if (!name || !location || !date) return;
    plans.push({ name, location, date });
    localStorage.setItem('gardenPlans', JSON.stringify(plans));
    renderPlans();
    planForm.reset();
};

function renderPlans() {
    planList.innerHTML = '';
    if (plans.length === 0) {
        planList.innerHTML = '<li>No plantings planned yet.</li>';
        return;
    }
    plans.slice().reverse().forEach((p, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${p.name}</strong> in <span style='color:#bdbdbd;'>${p.location}</span> on ${p.date}</span> <button data-idx="${plans.length-1-idx}" class="remove-plan">Remove</button>`;
        planList.appendChild(li);
    });
    document.querySelectorAll('.remove-plan').forEach(btn => {
        btn.onclick = function() {
            plans.splice(parseInt(btn.getAttribute('data-idx')), 1);
            localStorage.setItem('gardenPlans', JSON.stringify(plans));
            renderPlans();
        };
    });
}

// Schedule Section
const activityForm = document.getElementById('activity-form');
const activityList = document.getElementById('activity-list');
let activities = JSON.parse(localStorage.getItem('gardenActivities') || '[]');

activityForm.onsubmit = function(e) {
    e.preventDefault();
    const desc = document.getElementById('activity-desc').value.trim();
    const date = document.getElementById('activity-date').value;
    if (!desc || !date) return;
    activities.push({ desc, date });
    localStorage.setItem('gardenActivities', JSON.stringify(activities));
    renderActivities();
    activityForm.reset();
};

function renderActivities() {
    activityList.innerHTML = '';
    if (activities.length === 0) {
        activityList.innerHTML = '<li>No activities scheduled yet.</li>';
        return;
    }
    activities.slice().reverse().forEach((a, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${a.date}: <strong>${a.desc}</strong></span> <button data-idx="${activities.length-1-idx}" class="remove-activity">Remove</button>`;
        activityList.appendChild(li);
    });
    document.querySelectorAll('.remove-activity').forEach(btn => {
        btn.onclick = function() {
            activities.splice(parseInt(btn.getAttribute('data-idx')), 1);
            localStorage.setItem('gardenActivities', JSON.stringify(activities));
            renderActivities();
        };
    });
}

// Harvest Section
const harvestForm = document.getElementById('harvest-form');
const harvestList = document.getElementById('harvest-list');
let harvests = JSON.parse(localStorage.getItem('gardenHarvests') || '[]');

harvestForm.onsubmit = function(e) {
    e.preventDefault();
    const plant = document.getElementById('harvest-plant').value.trim();
    const date = document.getElementById('harvest-date').value;
    const amount = parseFloat(document.getElementById('harvest-amount').value);
    if (!plant || !date || isNaN(amount)) return;
    harvests.push({ plant, date, amount });
    localStorage.setItem('gardenHarvests', JSON.stringify(harvests));
    renderHarvests();
    harvestForm.reset();
};

function renderHarvests() {
    harvestList.innerHTML = '';
    if (harvests.length === 0) {
        harvestList.innerHTML = '<li>No harvests logged yet.</li>';
        return;
    }
    harvests.slice().reverse().forEach((h, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${h.plant}</strong> - ${h.amount} kg on ${h.date}</span> <button data-idx="${harvests.length-1-idx}" class="remove-harvest">Remove</button>`;
        harvestList.appendChild(li);
    });
    document.querySelectorAll('.remove-harvest').forEach(btn => {
        btn.onclick = function() {
            harvests.splice(parseInt(btn.getAttribute('data-idx')), 1);
            localStorage.setItem('gardenHarvests', JSON.stringify(harvests));
            renderHarvests();
        };
    });
}

// Initial renders
renderPlans();
renderActivities();
renderHarvests();
