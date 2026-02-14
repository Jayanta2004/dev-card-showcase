const activities = {
    running: { name: 'Running', met: 8.3 },
    cycling: { name: 'Cycling', met: 6.8 },
    swimming: { name: 'Swimming', met: 5.8 },
    walking: { name: 'Walking', met: 3.8 },
    yoga: { name: 'Yoga', met: 2.5 },
    weightlifting: { name: 'Weight Lifting', met: 3.0 },
    'jumping-rope': { name: 'Jumping Rope', met: 10.0 },
    dancing: { name: 'Dancing', met: 4.8 },
    tennis: { name: 'Tennis', met: 7.3 },
    basketball: { name: 'Basketball', met: 6.5 },
    soccer: { name: 'Soccer', met: 7.0 },
    skiing: { name: 'Skiing', met: 7.0 },
    hiking: { name: 'Hiking', met: 6.0 },
    gardening: { name: 'Gardening', met: 3.5 },
    housework: { name: 'Housework', met: 3.0 }
};

let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
let dailyGoal = parseInt(localStorage.getItem('dailyGoal')) || 0;
let chart = null;

function calculateCalories(activity, duration, weight) {
    const met = activities[activity].met;
    return Math.round(met * weight * (duration / 60));
}

function calculateBMI() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value) / 100; // convert to meters
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;

    if (!weight || !height || !age) {
        alert('Please fill in all profile fields');
        return;
    }

    const bmi = (weight / (height * height)).toFixed(1);
    let category = '';
    let color = '';

    if (bmi < 18.5) {
        category = 'Underweight';
        color = '#4299e1';
    } else if (bmi < 25) {
        category = 'Normal weight';
        color = '#48bb78';
    } else if (bmi < 30) {
        category = 'Overweight';
        color = '#ed8936';
    } else {
        category = 'Obese';
        color = '#e53e3e';
    }

    // Calculate BMR (Basal Metabolic Rate)
    const bmr = gender === 'male'
        ? 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age)
        : 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age);

    userProfile = { weight, height: height * 100, age, gender, bmi, bmr };
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    document.getElementById('bmiResult').innerHTML = `
        <div style="color: ${color}; font-weight: bold;">
            BMI: ${bmi} (${category})
        </div>
        <div>Daily Calorie Needs (BMR): ${Math.round(bmr)} calories</div>
    `;

    updateRecommendations();
}

function setGoal() {
    const goal = parseInt(document.getElementById('dailyGoal').value);
    if (goal > 0) {
        dailyGoal = goal;
        localStorage.setItem('dailyGoal', dailyGoal);
        updateGoalProgress();
        alert('Daily goal set successfully!');
    }
}

function addActivity() {
    const activity = document.getElementById('activity').value;
    const duration = parseFloat(document.getElementById('duration').value);
    const date = document.getElementById('activityDate').value || new Date().toISOString().split('T')[0];

    if (!activity || !duration) {
        alert('Please fill in activity and duration');
        return;
    }

    if (!userProfile.weight) {
        alert('Please set your weight in the profile section first');
        return;
    }

    const calories = calculateCalories(activity, duration, userProfile.weight);
    const entry = {
        date,
        activity: activities[activity].name,
        duration,
        calories,
        timestamp: new Date().toISOString()
    };

    activityLog.unshift(entry);
    localStorage.setItem('activityLog', JSON.stringify(activityLog));

    updateStats();
    updateChart();
    updateTable();
    updateGoalProgress();
    updateRecommendations();
    clearForm();

    showNotification('Activity logged successfully! 🔥');
}

function updateStats() {
    const totalSessions = activityLog.length;
    const totalCalories = activityLog.reduce((sum, entry) => sum + entry.calories, 0);
    const avgCalories = totalSessions > 0 ? Math.round(totalCalories / totalSessions) : 0;

    // Calculate this week's total
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyTotal = activityLog
        .filter(entry => new Date(entry.date) >= weekAgo)
        .reduce((sum, entry) => sum + entry.calories, 0);

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalCalories').textContent = totalCalories.toLocaleString();
    document.getElementById('avgCalories').textContent = avgCalories;
    document.getElementById('weeklyTotal').textContent = weeklyTotal;
}

function updateGoalProgress() {
    if (dailyGoal === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const todayCalories = activityLog
        .filter(entry => entry.date === today)
        .reduce((sum, entry) => sum + entry.calories, 0);

    const progress = Math.min((todayCalories / dailyGoal) * 100, 100);
    const remaining = Math.max(dailyGoal - todayCalories, 0);

    document.getElementById('goalProgress').innerHTML = `
        <div>Today's Progress: ${todayCalories} / ${dailyGoal} calories (${progress.toFixed(1)}%)</div>
        <div style="margin-top: 10px;">
            <div style="background: #e2e8f0; border-radius: 10px; height: 20px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #48bb78, #38a169); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
            </div>
        </div>
        ${remaining > 0 ? `<div style="margin-top: 10px; color: #ed8936;">${remaining} calories remaining to reach your goal!</div>` : '<div style="margin-top: 10px; color: #48bb78;">🎉 Goal achieved! Great job!</div>'}
    `;
}

function updateChart() {
    const ctx = document.getElementById('calorieChart').getContext('2d');

    // Group by activity for comparison
    const activityTotals = {};
    activityLog.forEach(entry => {
        if (!activityTotals[entry.activity]) {
            activityTotals[entry.activity] = 0;
        }
        activityTotals[entry.activity] += entry.calories;
    });

    const labels = Object.keys(activityTotals);
    const data = Object.values(activityTotals);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Calories Burned',
                data: data,
                backgroundColor: 'rgba(255, 107, 107, 0.6)',
                borderColor: 'rgba(255, 107, 107, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateTable() {
    const tbody = document.getElementById('activityBody');
    const filter = document.getElementById('filterPeriod').value;

    let filteredLog = activityLog;

    if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredLog = activityLog.filter(entry => new Date(entry.date) >= weekAgo);
    } else if (filter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredLog = activityLog.filter(entry => new Date(entry.date) >= monthAgo);
    }

    tbody.innerHTML = '';

    filteredLog.slice(0, 20).forEach((entry, index) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = new Date(entry.date).toLocaleDateString();
        row.insertCell(1).textContent = entry.activity;
        row.insertCell(2).textContent = entry.duration;
        row.insertCell(3).textContent = entry.calories;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteActivity(activityLog.indexOf(entry));
        row.insertCell(4).appendChild(deleteBtn);
    });
}

function deleteActivity(index) {
    if (confirm('Are you sure you want to delete this activity?')) {
        activityLog.splice(index, 1);
        localStorage.setItem('activityLog', JSON.stringify(activityLog));
        updateStats();
        updateChart();
        updateTable();
        updateGoalProgress();
    }
}

function updateRecommendations() {
    const recommendations = document.getElementById('recommendations');

    if (!userProfile.bmi) {
        recommendations.innerHTML = '<p>Complete your profile to get personalized recommendations!</p>';
        return;
    }

    let recs = [];

    if (userProfile.bmi >= 25) {
        recs.push('Consider increasing cardio activities like running or cycling for better calorie burn');
        recs.push('Try high-intensity activities like jumping rope for efficient weight management');
    } else if (userProfile.bmi < 18.5) {
        recs.push('Focus on strength training and moderate activities to build muscle mass');
        recs.push('Include more calorie-dense activities while maintaining balance');
    } else {
        recs.push('Great BMI! Mix cardio and strength training for optimal fitness');
    }

    // Activity variety recommendations
    const uniqueActivities = new Set(activityLog.map(a => a.activity));
    if (uniqueActivities.size < 3) {
        recs.push('Try different activities to keep your routine engaging and work different muscle groups');
    }

    // Frequency recommendations
    const recentWeek = activityLog.filter(a => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(a.date) >= weekAgo;
    });

    if (recentWeek.length < 3) {
        recs.push('Aim for 3-5 sessions per week for consistent progress');
    }

    recommendations.innerHTML = recs.map(rec => `<p>💡 ${rec}</p>`).join('');
}

function exportData() {
    const csvContent = [
        ['Date', 'Activity', 'Duration (min)', 'Calories Burned'],
        ...activityLog.map(entry => [
            entry.date,
            entry.activity,
            entry.duration,
            entry.calories
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calorie-burn-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function clearForm() {
    document.getElementById('activity').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('activityDate').value = '';
}

function showNotification(message) {
    alert(message);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load profile data
    if (userProfile.weight) document.getElementById('weight').value = userProfile.weight;
    if (userProfile.height) document.getElementById('height').value = userProfile.height;
    if (userProfile.age) document.getElementById('age').value = userProfile.age;
    if (userProfile.gender) document.getElementById('gender').value = userProfile.gender;
    if (userProfile.bmi) calculateBMI();

    if (dailyGoal) document.getElementById('dailyGoal').value = dailyGoal;

    updateStats();
    updateChart();
    updateTable();
    updateGoalProgress();
    updateRecommendations();
});
