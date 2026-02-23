// longevity-habit-consistency-index.js

let habits = JSON.parse(localStorage.getItem('longevityHabits')) || [];
let habitLogs = JSON.parse(localStorage.getItem('longevityHabitLogs')) || {};
let currentDate = new Date();

function addHabit() {
    const name = document.getElementById('habitName').value.trim();
    const category = document.getElementById('habitCategory').value;
    const weight = parseInt(document.getElementById('habitWeight').value);
    const frequency = document.getElementById('habitFrequency').value;

    if (!name) {
        alert('Please enter a habit name');
        return;
    }

    if (weight < 1 || weight > 10) {
        alert('Weight must be between 1 and 10');
        return;
    }

    const habit = {
        id: Date.now(),
        name: name,
        category: category,
        weight: weight,
        frequency: frequency,
        created: new Date().toISOString()
    };

    habits.push(habit);
    saveHabits();

    // Clear form
    document.getElementById('habitName').value = '';
    document.getElementById('habitWeight').value = 5;

    displayHabits();
    displayDailyHabits();
    updateStats();
}

function displayHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';

    if (habits.length === 0) {
        habitsList.innerHTML = '<p style="text-align: center; color: #666;">No habits added yet. Add your first longevity habit above!</p>';
        return;
    }

    habits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';

        habitItem.innerHTML = `
            <div class="habit-info">
                <h4>${habit.name}</h4>
                <div class="habit-details">
                    <span class="category">${habit.category}</span> |
                    Weight: <span class="habit-weight">${habit.weight}</span> |
                    ${habit.frequency}
                </div>
            </div>
            <div class="habit-actions">
                <button class="edit-btn" onclick="editHabit(${habit.id})">Edit</button>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">Delete</button>
            </div>
        `;

        habitsList.appendChild(habitItem);
    });
}

function editHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newName = prompt('Edit habit name:', habit.name);
    if (newName === null) return;

    const newWeight = parseInt(prompt('Edit weight (1-10):', habit.weight));
    if (isNaN(newWeight) || newWeight < 1 || newWeight > 10) {
        alert('Invalid weight. Must be between 1 and 10.');
        return;
    }

    habit.name = newName.trim();
    habit.weight = newWeight;

    saveHabits();
    displayHabits();
    updateStats();
}

function deleteHabit(id) {
    if (!confirm('Are you sure you want to delete this habit? This will also delete all associated logs.')) {
        return;
    }

    habits = habits.filter(h => h.id !== id);

    // Remove from logs
    Object.keys(habitLogs).forEach(date => {
        if (habitLogs[date][id]) {
            delete habitLogs[date][id];
        }
    });

    saveHabits();
    saveLogs();
    displayHabits();
    displayDailyHabits();
    updateStats();
    updateChart();
}

function changeDate(delta) {
    currentDate.setDate(currentDate.getDate() + delta);
    displayDailyHabits();
}

function displayDailyHabits() {
    const dateKey = getDateKey(currentDate);
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const dailyHabits = document.getElementById('dailyHabits');
    dailyHabits.innerHTML = '';

    if (habits.length === 0) {
        dailyHabits.innerHTML = '<p style="text-align: center; color: #666;">Add some habits first to start tracking!</p>';
        updateDailySummary();
        return;
    }

    // Initialize log for this date if it doesn't exist
    if (!habitLogs[dateKey]) {
        habitLogs[dateKey] = {};
    }

    habits.forEach(habit => {
        const isCompleted = habitLogs[dateKey][habit.id] || false;

        const habitItem = document.createElement('div');
        habitItem.className = 'daily-habit-item';

        habitItem.innerHTML = `
            <div style="display: flex; align-items: center;">
                <input type="checkbox" class="habit-checkbox" id="habit-${habit.id}"
                       ${isCompleted ? 'checked' : ''} onchange="toggleHabit(${habit.id})">
                <div class="daily-habit-info">
                    <h4>${habit.name}</h4>
                    <span class="category">${habit.category} • Weight: ${habit.weight}</span>
                </div>
            </div>
        `;

        dailyHabits.appendChild(habitItem);
    });

    updateDailySummary();
}

function toggleHabit(habitId) {
    const dateKey = getDateKey(currentDate);
    const checkbox = document.getElementById(`habit-${habitId}`);

    habitLogs[dateKey][habitId] = checkbox.checked;
    saveLogs();
    updateDailySummary();
    updateStats();
    updateChart();
}

function updateDailySummary() {
    const dateKey = getDateKey(currentDate);
    const dailyLog = habitLogs[dateKey] || {};

    let completed = 0;
    let total = habits.length;

    habits.forEach(habit => {
        if (dailyLog[habit.id]) completed++;
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const longevityScore = calculateLongevityScore(dailyLog);

    document.getElementById('dailyCompleted').textContent = completed;
    document.getElementById('dailyTotal').textContent = total;
    document.getElementById('dailyRate').textContent = `${completionRate}%`;
    document.getElementById('dailyScore').textContent = longevityScore;
}

function calculateLongevityScore(dailyLog) {
    let score = 0;
    habits.forEach(habit => {
        if (dailyLog[habit.id]) {
            score += habit.weight;
        }
    });
    return score;
}

function updateStats() {
    if (habits.length === 0) {
        document.getElementById('overallConsistency').textContent = '0%';
        document.getElementById('overallScore').textContent = '0';
        document.getElementById('currentStreak').textContent = '0 days';
        document.getElementById('bestStreak').textContent = '0 days';
        return;
    }

    // Calculate overall consistency
    const allDates = Object.keys(habitLogs);
    if (allDates.length === 0) {
        document.getElementById('overallConsistency').textContent = '0%';
        document.getElementById('overallScore').textContent = '0';
        document.getElementById('currentStreak').textContent = '0 days';
        document.getElementById('bestStreak').textContent = '0 days';
        return;
    }

    let totalCompletions = 0;
    let totalPossible = 0;
    let totalScore = 0;

    allDates.forEach(date => {
        const dailyLog = habitLogs[date];
        let dailyCompleted = 0;
        let dailyScore = 0;

        habits.forEach(habit => {
            totalPossible++;
            if (dailyLog[habit.id]) {
                dailyCompleted++;
                totalCompletions++;
                dailyScore += habit.weight;
            }
        });

        totalScore += dailyScore;
    });

    const overallConsistency = Math.round((totalCompletions / totalPossible) * 100);
    const avgScore = Math.round(totalScore / allDates.length);

    document.getElementById('overallConsistency').textContent = `${overallConsistency}%`;
    document.getElementById('overallScore').textContent = avgScore;

    // Calculate streaks
    const streaks = calculateStreaks();
    document.getElementById('currentStreak').textContent = `${streaks.current} days`;
    document.getElementById('bestStreak').textContent = `${streaks.best} days`;

    generateInsights(overallConsistency, avgScore, streaks);
}

function calculateStreaks() {
    const dates = Object.keys(habitLogs).sort();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = dates.length - 1; i >= 0; i--) {
        const date = dates[i];
        const dailyLog = habitLogs[date];
        const completedCount = habits.reduce((count, habit) => {
            return count + (dailyLog[habit.id] ? 1 : 0);
        }, 0);

        if (completedCount === habits.length) {
            tempStreak++;
            if (i === dates.length - 1) {
                currentStreak = tempStreak;
            }
        } else {
            if (tempStreak > bestStreak) {
                bestStreak = tempStreak;
            }
            tempStreak = 0;
        }
    }

    if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
    }

    return { current: currentStreak, best: bestStreak };
}

function updateChart() {
    const period = parseInt(document.getElementById('chartPeriod').value);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - period + 1);

    const labels = [];
    const completionData = [];
    const scoreData = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = getDateKey(d);
        const dailyLog = habitLogs[dateKey] || {};

        let completed = 0;
        let score = 0;

        habits.forEach(habit => {
            if (dailyLog[habit.id]) {
                completed++;
                score += habit.weight;
            }
        });

        const completionRate = habits.length > 0 ? (completed / habits.length) * 100 : 0;

        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        completionData.push(Math.round(completionRate));
        scoreData.push(score);
    }

    const ctx = document.getElementById('consistencyChart').getContext('2d');

    if (window.consistencyChart) {
        window.consistencyChart.destroy();
    }

    window.consistencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion Rate %',
                data: completionData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.1
            }, {
                label: 'Longevity Score',
                data: scoreData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                yAxisID: 'y1',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Completion Rate (%)'
                    },
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Longevity Score'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

function generateInsights(consistency, avgScore, streaks) {
    const insights = document.getElementById('insights');
    insights.innerHTML = '';

    const insightItems = [];

    if (consistency >= 80) {
        insightItems.push({
            type: 'positive',
            title: 'Excellent Consistency!',
            message: `You're maintaining ${consistency}% consistency. This level of adherence will significantly impact your longevity. Keep up the great work!`
        });
    } else if (consistency >= 60) {
        insightItems.push({
            type: 'neutral',
            title: 'Good Progress',
            message: `Your ${consistency}% consistency shows commitment. Focus on the habits that challenge you most to improve your overall score.`
        });
    } else {
        insightItems.push({
            type: 'negative',
            title: 'Room for Improvement',
            message: `At ${consistency}% consistency, you're building habits but could benefit from more regular practice. Start with 1-2 key habits to build momentum.`
        });
    }

    if (streaks.current >= 7) {
        insightItems.push({
            type: 'positive',
            title: 'Strong Momentum',
            message: `Your ${streaks.current}-day streak shows excellent habit formation. Habits become automatic after about 66 days - you're on the right track!`
        });
    }

    if (avgScore >= 20) {
        insightItems.push({
            type: 'positive',
            title: 'High Impact Habits',
            message: `Your average longevity score of ${avgScore} indicates you're focusing on high-impact habits. This weighted approach maximizes your healthspan benefits.`
        });
    }

    const habitCompletionRates = habits.map(habit => {
        const totalDays = Object.keys(habitLogs).length;
        let completedDays = 0;

        Object.values(habitLogs).forEach(log => {
            if (log[habit.id]) completedDays++;
        });

        return {
            name: habit.name,
            rate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
        };
    });

    const weakestHabit = habitCompletionRates.reduce((min, habit) =>
        habit.rate < min.rate ? habit : min, habitCompletionRates[0]);

    if (weakestHabit && weakestHabit.rate < 50) {
        insightItems.push({
            type: 'neutral',
            title: 'Focus Area Identified',
            message: `"${weakestHabit.name}" has a ${weakestHabit.rate}% completion rate. Consider simplifying this habit or pairing it with an existing routine.`
        });
    }

    insightItems.forEach(item => {
        const insightItem = document.createElement('div');
        insightItem.className = `insight-item insight-${item.type}`;

        insightItem.innerHTML = `
            <h4>${item.title}</h4>
            <p>${item.message}</p>
        `;

        insights.appendChild(insightItem);
    });
}

function getDateKey(date) {
    return date.toISOString().split('T')[0];
}

function saveHabits() {
    localStorage.setItem('longevityHabits', JSON.stringify(habits));
}

function saveLogs() {
    localStorage.setItem('longevityHabitLogs', JSON.stringify(habitLogs));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayHabits();
    displayDailyHabits();
    updateStats();
    updateChart();
});