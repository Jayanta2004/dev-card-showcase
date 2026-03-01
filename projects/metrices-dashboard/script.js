const metrics = [
    { name: "Water Intake", current: 6, goal: 8, weekly: [6,7,5,8,6,7,8] },
    { name: "Sleep Hours", current: 7, goal: 8, weekly: [7,6,8,7,7,8,7] },
    { name: "Steps", current: 8000, goal: 10000, weekly: [5000,7000,8000,6000,9000,10000,9500] },
    { name: "Exercise", current: 30, goal: 45, weekly: [20,25,30,35,40,30,45] },
    { name: "Mood", current: 3, goal: 5, weekly: [3,4,2,4,3,5,4] },
    { name: "Meditation", current: 15, goal: 20, weekly: [10,15,12,18,15,20,20] },
    { name: "Reading", current: 20, goal: 30, weekly: [15,20,10,25,20,30,30] },
    { name: "Calories Intake", current: 1800, goal: 2000, weekly: [1800,1900,1750,2000,1850,1950,2000] },
    { name: "Screen Time", current: 5, goal: 3, weekly: [6,5,4,5,3,4,3] },
    { name: "Tasks Completed", current: 4, goal: 6, weekly: [3,4,5,4,6,5,6] }
];

const metricsCards = document.getElementById("metrics-cards");
const chartsContainer = document.getElementById("charts-container");
const badgeNotification = document.getElementById("badge-notification");
const toggleModeBtn = document.getElementById("toggle-mode");

const addMetricBtn = document.getElementById("add-metric-btn");
const metricNameInput = document.getElementById("metric-name");
const metricCurrentInput = document.getElementById("metric-current");
const metricGoalInput = document.getElementById("metric-goal");

// Render metric card
function renderMetric(metric){
    const card = document.createElement("div");
    card.classList.add("metric-card");

    let percent = Math.min(Math.floor((metric.current/metric.goal)*100),100);
    if(metric.name === "Screen Time") percent = Math.min(Math.floor((metric.goal/metric.current)*100),100);

    card.innerHTML = `
        <h3>${metric.name}</h3>
        <div class="metric-circle" style="background: conic-gradient(#4caf50 0% ${percent}%, #ccc ${percent}% 100%)">
            ${percent}%
        </div>
        <p>${metric.current} / ${metric.goal}</p>
        <canvas id="chart-${metric.name.replace(/\s/g,'')}" height="100"></canvas>
    `;
    metricsCards.appendChild(card);

    // Render chart
    renderChart(metric);

    if(percent >= 100) showBadge(`${metric.name} Goal Achieved!`);
}

// Render chart per metric
function renderChart(metric){
    const ctx = document.getElementById(`chart-${metric.name.replace(/\s/g,'')}`).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets: [{
                label: metric.name,
                data: metric.weekly || [],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76,175,80,0.2)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Render all default metrics
metrics.forEach(renderMetric);

// Add new metric from user input
addMetricBtn.addEventListener('click', ()=>{
    const name = metricNameInput.value.trim();
    const current = parseFloat(metricCurrentInput.value);
    const goal = parseFloat(metricGoalInput.value);

    if(!name || isNaN(current) || isNaN(goal) || goal <= 0){
        alert("Please enter valid metric name and numeric values for current and goal.");
        return;
    }

    const newMetric = { name, current, goal, weekly: Array(7).fill(current) };
    metrics.push(newMetric);
    renderMetric(newMetric);

    metricNameInput.value = '';
    metricCurrentInput.value = '';
    metricGoalInput.value = '';
});

// Badge notification
function showBadge(message){
    badgeNotification.innerText = message;
    badgeNotification.style.display = 'block';
    setTimeout(()=> badgeNotification.style.display='none',1500);
}

// Dark/Light toggle
toggleModeBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('dark-mode');
});