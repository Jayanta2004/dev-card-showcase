// nitric-oxide-support-tracker.js

let noData = JSON.parse(localStorage.getItem('nitricOxideData')) || {
    supplements: [],
    activities: [],
    biomarkers: [],
    diet: [],
    dailyScores: {}
};

let currentNOLevel = 50; // Default starting level

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateNOLevel();
    updateStats();
    renderChart();

    // Supplement tracking
    document.querySelectorAll('.supplement-btn').forEach(btn => {
        btn.addEventListener('click', () => logSupplement(btn.dataset.supplement));
    });

    document.getElementById('addCustomSupplement').addEventListener('click', () => {
        const supplement = document.getElementById('customSupplement').value.trim();
        if (supplement) {
            logSupplement(supplement);
            document.getElementById('customSupplement').value = '';
        }
    });

    // Activity tracking
    document.querySelectorAll('.activity-btn').forEach(btn => {
        btn.addEventListener('click', () => logActivity(btn.dataset.activity));
    });

    // Food tracking
    document.querySelectorAll('.food-btn').forEach(btn => {
        btn.addEventListener('click', () => logFood(btn.dataset.food));
    });

    // Biomarker form
    document.getElementById('biomarkerForm').addEventListener('submit', logBiomarkers);
});

function logSupplement(supplement) {
    const entry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split('T')[0],
        item: supplement
    };

    noData.supplements.unshift(entry);
    if (noData.supplements.length > 50) noData.supplements = noData.supplements.slice(0, 50);

    saveData();
    renderSupplements();
    updateNOLevel();
    updateStats();
}

function logActivity(activity) {
    const entry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split('T')[0],
        item: activity
    };

    noData.activities.unshift(entry);
    if (noData.activities.length > 50) noData.activities = noData.activities.slice(0, 50);

    saveData();
    renderActivities();
    updateNOLevel();
    updateStats();
}

function logFood(food) {
    const entry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split('T')[0],
        item: food
    };

    noData.diet.unshift(entry);
    if (noData.diet.length > 50) noData.diet = noData.diet.slice(0, 50);

    saveData();
    renderDiet();
    updateNOLevel();
    updateStats();
}

function logBiomarkers(e) {
    e.preventDefault();

    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);
    const heartRate = parseInt(document.getElementById('heartRate').value);
    const symptoms = document.getElementById('symptoms').value.trim();

    if (systolic && diastolic) {
        const entry = {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            date: new Date().toISOString().split('T')[0],
            systolic,
            diastolic,
            heartRate: heartRate || null,
            symptoms
        };

        noData.biomarkers.unshift(entry);
        if (noData.biomarkers.length > 50) noData.biomarkers = noData.biomarkers.slice(0, 50);

        saveData();
        updateCurrentBP(systolic, diastolic);
        renderChart();
        updateStats();

        // Clear form
        document.getElementById('biomarkerForm').reset();
    }
}

function updateNOLevel() {
    const today = new Date().toISOString().split('T')[0];

    // Calculate NO level based on recent activities
    let level = 30; // Base level

    // Check today's supplements (boost by 20-40%)
    const todaySupplements = noData.supplements.filter(s => s.date === today).length;
    level += Math.min(todaySupplements * 8, 40);

    // Check today's activities (boost by 10-30%)
    const todayActivities = noData.activities.filter(a => a.date === today).length;
    level += Math.min(todayActivities * 6, 30);

    // Check today's diet (boost by 5-20%)
    const todayDiet = noData.diet.filter(d => d.date === today).length;
    level += Math.min(todayDiet * 4, 20);

    // Check recent BP (lower BP = higher NO level)
    const recentBP = noData.biomarkers.find(b => b.date === today);
    if (recentBP) {
        const avgBP = (recentBP.systolic + recentBP.diastolic * 2) / 3;
        if (avgBP < 120) level += 10;
        else if (avgBP > 140) level -= 15;
    }

    currentNOLevel = Math.max(0, Math.min(100, level));
    updateNOLevelDisplay();
    updateDailyScore();
}

function updateNOLevelDisplay() {
    const bar = document.getElementById('noLevelBar');
    const text = document.getElementById('noLevelText');

    bar.style.width = `${currentNOLevel}%`;

    if (currentNOLevel < 40) {
        text.textContent = 'Low';
        bar.style.background = '#ff4444';
    } else if (currentNOLevel < 70) {
        text.textContent = 'Moderate';
        bar.style.background = '#ffaa00';
    } else {
        text.textContent = 'Optimal';
        bar.style.background = '#44ff44';
    }
}

function updateCurrentBP(systolic, diastolic) {
    document.getElementById('currentBP').textContent = `${systolic}/${diastolic} mmHg`;
}

function updateDailyScore() {
    const today = new Date().toISOString().split('T')[0];
    const score = Math.round(currentNOLevel);
    noData.dailyScores[today] = score;
    document.getElementById('dailyScore').textContent = `${score}/100`;
    saveData();
}

function renderSupplements() {
    const container = document.getElementById('supplementLog');
    container.innerHTML = '';

    if (noData.supplements.length === 0) {
        container.innerHTML = '<p>No supplements logged yet.</p>';
        return;
    }

    noData.supplements.slice(0, 10).forEach(entry => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
            <span class="log-time">${entry.time}</span>
            <span class="log-item">${entry.item}</span>
        `;
        container.appendChild(div);
    });
}

function renderActivities() {
    const container = document.getElementById('activityLog');
    container.innerHTML = '';

    if (noData.activities.length === 0) {
        container.innerHTML = '<p>No activities logged yet.</p>';
        return;
    }

    noData.activities.slice(0, 10).forEach(entry => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
            <span class="log-time">${entry.time}</span>
            <span class="log-item">${entry.item}</span>
        `;
        container.appendChild(div);
    });
}

function renderDiet() {
    const container = document.getElementById('dietLog');
    container.innerHTML = '';

    if (noData.diet.length === 0) {
        container.innerHTML = '<p>No foods logged yet.</p>';
        return;
    }

    noData.diet.slice(0, 10).forEach(entry => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
            <span class="log-time">${entry.time}</span>
            <span class="log-item">${entry.item}</span>
        `;
        container.appendChild(div);
    });
}

function renderChart() {
    const ctx = document.getElementById('noChart').getContext('2d');

    // Get last 7 days of data
    const dates = [];
    const scores = [];
    const bpData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        scores.push(noData.dailyScores[dateStr] || 0);

        const bp = noData.biomarkers.find(b => b.date === dateStr);
        bpData.push(bp ? `${bp.systolic}/${bp.diastolic}` : null);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'NO Level (%)',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];

    // Average NO level
    const scores = Object.values(noData.dailyScores);
    const avgNO = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    document.getElementById('avgNOLevel').textContent = `${avgNO}%`;

    // Today's supplements
    const todaySupplements = noData.supplements.filter(s => s.date === today).length;
    document.getElementById('supplementsToday').textContent = todaySupplements;

    // This week's activities
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekActivities = noData.activities.filter(a => new Date(a.date) >= weekAgo).length;
    document.getElementById('activitiesWeek').textContent = weekActivities;

    // BP trend
    const recentBP = noData.biomarkers.slice(0, 3);
    if (recentBP.length >= 2) {
        const first = (recentBP[recentBP.length - 1].systolic + recentBP[recentBP.length - 1].diastolic * 2) / 3;
        const last = (recentBP[0].systolic + recentBP[0].diastolic * 2) / 3;
        const trend = last - first;
        document.getElementById('bpTrend').textContent = trend > 5 ? 'Rising' : trend < -5 ? 'Falling' : 'Stable';
    } else {
        document.getElementById('bpTrend').textContent = 'Unknown';
    }
}

function loadData() {
    renderSupplements();
    renderActivities();
    renderDiet();

    // Set current BP if available
    const latestBP = noData.biomarkers[0];
    if (latestBP) {
        updateCurrentBP(latestBP.systolic, latestBP.diastolic);
    }
}

function saveData() {
    localStorage.setItem('nitricOxideData', JSON.stringify(noData));
}