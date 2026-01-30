const activities = {
    running: { name: 'Running', met: 8.3 },
    cycling: { name: 'Cycling', met: 6.8 },
    swimming: { name: 'Swimming', met: 5.8 },
    walking: { name: 'Walking', met: 3.8 },
    yoga: { name: 'Yoga', met: 2.5 },
    weightlifting: { name: 'Weight Lifting', met: 3.0 }
};

let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
let weight = parseFloat(localStorage.getItem('weight')) || 0;

document.getElementById('weight').value = weight;

function calculateCalories(activity, duration, weight) {
    const met = activities[activity].met;
    return Math.round(met * weight * (duration / 60));
}

function addActivity() {
    const activity = document.getElementById('activity').value;
    const duration = parseFloat(document.getElementById('duration').value);
    weight = parseFloat(document.getElementById('weight').value);

    if (!activity || !duration || !weight) {
        alert('Please fill in all fields');
        return;
    }

    const calories = calculateCalories(activity, duration, weight);
    const date = new Date().toLocaleDateString();

    const entry = {
        date,
        activity: activities[activity].name,
        duration,
        calories
    };

    activityLog.push(entry);
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    localStorage.setItem('weight', weight);

    updateTable();
    updateChart();
    updateInsights();
    clearForm();
}

function updateTable() {
    const tbody = document.getElementById('activityBody');
    tbody.innerHTML = '';

    activityLog.forEach((entry, index) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.activity;
        row.insertCell(2).textContent = entry.duration;
        row.insertCell(3).textContent = entry.calories;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteActivity(index);
        row.insertCell(4).appendChild(deleteBtn);
    });
}

function deleteActivity(index) {
    activityLog.splice(index, 1);
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    updateTable();
    updateChart();
    updateInsights();
}

function updateChart() {
    const ctx = document.getElementById('calorieChart').getContext('2d');
    const activityTotals = {};

    activityLog.forEach(entry => {
        if (!activityTotals[entry.activity]) {
            activityTotals[entry.activity] = 0;
        }
        activityTotals[entry.activity] += entry.calories;
    });

    const labels = Object.keys(activityTotals);
    const data = Object.values(activityTotals);

    if (window.calorieChart) {
        window.calorieChart.destroy();
    }

    window.calorieChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calories Burned',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateInsights() {
    const today = new Date().toLocaleDateString();
    const todayActivities = activityLog.filter(entry => entry.date === today);
    const totalCalories = todayActivities.reduce((sum, entry) => sum + entry.calories, 0);
    const averageCalories = activityLog.length > 0 ? Math.round(activityLog.reduce((sum, entry) => sum + entry.calories, 0) / activityLog.length) : 0;

    document.getElementById('totalCalories').textContent = `Total Calories Burned Today: ${totalCalories}`;
    document.getElementById('averageCalories').textContent = `Average Calories per Activity: ${averageCalories}`;
}

function clearForm() {
    document.getElementById('activity').value = '';
    document.getElementById('duration').value = '';
}

// Initialize
updateTable();
updateChart();
updateInsights();