// Decision Fatigue Monitor JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();
    updateDisplay();

    // Event listeners
    document.getElementById('fatigueRating').addEventListener('input', updateRatingDisplay);
    document.getElementById('decisionForm').addEventListener('submit', handleDecisionSubmit);
    document.getElementById('saveRatingBtn').addEventListener('click', saveTodaysRating);
    document.getElementById('viewWeek').addEventListener('click', () => switchChartView('week'));
    document.getElementById('viewMonth').addEventListener('click', () => switchChartView('month'));
});

function updateRatingDisplay() {
    const rating = document.getElementById('fatigueRating').value;
    document.getElementById('ratingValue').textContent = rating;

    const descriptions = {
        1: 'Very low fatigue',
        2: 'Low fatigue',
        3: 'Mild fatigue',
        4: 'Moderate fatigue',
        5: 'Moderate fatigue',
        6: 'Noticeable fatigue',
        7: 'High fatigue',
        8: 'Very high fatigue',
        9: 'Extreme fatigue',
        10: 'Complete decision paralysis'
    };

    document.getElementById('ratingDescription').textContent = descriptions[rating] || 'Moderate fatigue';
}

function handleDecisionSubmit(e) {
    e.preventDefault();

    const decision = {
        text: document.getElementById('decisionInput').value.trim(),
        type: document.getElementById('decisionType').value,
        timestamp: new Date().toISOString()
    };

    if (!decision.text) return;

    addTodaysDecision(decision);
    document.getElementById('decisionInput').value = '';
    updateDecisionsList();
    updateStatus();
}

function addTodaysDecision(decision) {
    const today = new Date().toDateString();
    const data = getData();

    if (!data.todaysDecisions) {
        data.todaysDecisions = [];
    }

    data.todaysDecisions.push(decision);
    saveData(data);
}

function saveTodaysRating() {
    const rating = parseInt(document.getElementById('fatigueRating').value);
    const today = new Date().toDateString();
    const data = getData();

    // Save today's entry
    const todaysEntry = {
        date: today,
        fatigueRating: rating,
        decisions: data.todaysDecisions || [],
        timestamp: new Date().toISOString()
    };

    if (!data.history) {
        data.history = [];
    }

    // Remove existing entry for today if it exists
    data.history = data.history.filter(entry => entry.date !== today);

    // Add new entry
    data.history.push(todaysEntry);

    // Clear today's decisions for next day
    data.todaysDecisions = [];

    saveData(data);
    updateDisplay();

    showNotification('Today\'s data saved successfully!', 'success');
}

function getData() {
    const data = localStorage.getItem('decisionFatigueData');
    return data ? JSON.parse(data) : { todaysDecisions: [], history: [] };
}

function saveData(data) {
    localStorage.setItem('decisionFatigueData', JSON.stringify(data));
}

function updateDisplay() {
    updateDecisionsList();
    updateStatus();
    updateInsights();
    updateCharts();
    updateHistoryTable();
}

function updateDecisionsList() {
    const data = getData();
    const decisions = data.todaysDecisions || [];
    const list = document.getElementById('decisionsList');

    if (decisions.length === 0) {
        list.innerHTML = '<p class="empty-state">No decisions logged yet today.</p>';
        return;
    }

    list.innerHTML = '';
    decisions.forEach((decision, index) => {
        const item = document.createElement('div');
        item.className = 'decision-item';
        item.innerHTML = `
            <div class="decision-text">${decision.text}</div>
            <span class="decision-type">${decision.type}</span>
            <button class="btn-remove" onclick="removeDecision(${index})">×</button>
        `;
        list.appendChild(item);
    });
}

function removeDecision(index) {
    const data = getData();
    data.todaysDecisions.splice(index, 1);
    saveData(data);
    updateDecisionsList();
    updateStatus();
}

function updateStatus() {
    const data = getData();
    const todayDecisions = (data.todaysDecisions || []).length;

    document.getElementById('todayDecisions').textContent = todayDecisions;
    document.getElementById('currentFatigue').textContent = 'Not rated today';

    // Calculate weekly average
    const history = data.history || [];
    const last7Days = history.slice(-7);
    if (last7Days.length > 0) {
        const avg = last7Days.reduce((sum, entry) => sum + entry.fatigueRating, 0) / last7Days.length;
        document.getElementById('weeklyAverage').textContent = avg.toFixed(1) + '/10';
    }

    // Calculate low fatigue streak
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].fatigueRating <= 5) {
            streak++;
        } else {
            break;
        }
    }
    document.getElementById('lowFatigueStreak').textContent = streak + ' days';
}

function updateInsights() {
    const data = getData();
    const history = data.history || [];
    if (history.length < 3) return;

    const insights = [];

    // Recent trend
    const recent = history.slice(-3);
    const avgRecent = recent.reduce((sum, entry) => sum + entry.fatigueRating, 0) / 3;
    const earlier = history.slice(-7, -3);
    if (earlier.length > 0) {
        const avgEarlier = earlier.reduce((sum, entry) => sum + entry.fatigueRating, 0) / earlier.length;
        if (avgRecent > avgEarlier + 1) {
            insights.push({
                title: 'Increasing Fatigue Trend',
                text: 'Your decision fatigue has been increasing recently. Consider reducing decision load or taking breaks.'
            });
        } else if (avgRecent < avgEarlier - 1) {
            insights.push({
                title: 'Improving Trend',
                text: 'Great job! Your decision fatigue levels are decreasing. Keep up the good habits.'
            });
        }
    }

    // High decision days
    const highDecisionDays = history.filter(entry => entry.decisions && entry.decisions.length > 10);
    if (highDecisionDays.length > 0) {
        insights.push({
            title: 'High Decision Load Days',
            text: `You had ${highDecisionDays.length} days with more than 10 decisions. Try batching similar decisions.`
        });
    }

    // Work-life balance
    const workDecisions = history.reduce((sum, entry) => {
        return sum + (entry.decisions ? entry.decisions.filter(d => d.type === 'work').length : 0);
    }, 0);
    const totalDecisions = history.reduce((sum, entry) => {
        return sum + (entry.decisions ? entry.decisions.length : 0);
    }, 0);

    if (totalDecisions > 0 && workDecisions / totalDecisions > 0.8) {
        insights.push({
            title: 'Work-Heavy Decisions',
            text: 'Most of your decisions are work-related. Consider balancing with more personal decisions or delegation.'
        });
    }

    // Recovery suggestions
    const highFatigueDays = history.filter(entry => entry.fatigueRating >= 8);
    if (highFatigueDays.length >= 2) {
        insights.push({
            title: 'Recovery Needed',
            text: 'You\'ve had multiple high-fatigue days. Consider implementing decision-making routines or taking mental breaks.'
        });
    }

    if (insights.length === 0) {
        insights.push({
            title: 'Keep Tracking!',
            text: 'Continue logging your decision fatigue to uncover patterns and improve your cognitive load management.'
        });
    }

    displayInsights(insights);
}

function displayInsights(insights) {
    const container = document.getElementById('insights');
    container.innerHTML = '';

    insights.forEach(insight => {
        const div = document.createElement('div');
        div.className = 'insight-item';
        div.innerHTML = `
            <h4>${insight.title}</h4>
            <p>${insight.text}</p>
        `;
        container.appendChild(div);
    });
}

function initializeCharts() {
    const fatigueCtx = document.getElementById('fatigueChart').getContext('2d');
    const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');

    window.fatigueChart = new Chart(fatigueCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Decision Fatigue Rating',
                data: [],
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 1,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Fatigue Rating (1-10)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });

    window.categoriesChart = new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4299e1',
                    '#48bb78',
                    '#ed8936',
                    '#e53e3e',
                    '#805ad5'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function switchChartView(view) {
    document.getElementById('viewWeek').classList.toggle('active', view === 'week');
    document.getElementById('viewMonth').classList.toggle('active', view === 'month');
    updateCharts(view);
}

function updateCharts(view = 'week') {
    const data = getData();
    const history = data.history || [];
    const days = view === 'week' ? 7 : 30;

    const recent = history.slice(-days);
    const labels = recent.map(entry => new Date(entry.date).toLocaleDateString());
    const ratings = recent.map(entry => entry.fatigueRating);

    window.fatigueChart.data.labels = labels;
    window.fatigueChart.data.datasets[0].data = ratings;
    window.fatigueChart.update();

    // Update categories chart
    const categoryCounts = {};
    history.forEach(entry => {
        if (entry.decisions) {
            entry.decisions.forEach(decision => {
                categoryCounts[decision.type] = (categoryCounts[decision.type] || 0) + 1;
            });
        }
    });

    const categoryLabels = Object.keys(categoryCounts);
    const categoryData = Object.values(categoryCounts);

    window.categoriesChart.data.labels = categoryLabels.map(label =>
        label.charAt(0).toUpperCase() + label.slice(1)
    );
    window.categoriesChart.data.datasets[0].data = categoryData;
    window.categoriesChart.update();
}

function updateHistoryTable() {
    const data = getData();
    const history = data.history || [];
    const tbody = document.getElementById('historyBody');

    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No data logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    history.slice().reverse().forEach(entry => {
        const decisionsCount = entry.decisions ? entry.decisions.length : 0;
        const topCategory = getTopCategory(entry.decisions || []);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(entry.date).toLocaleDateString()}</td>
            <td>${entry.fatigueRating}/10</td>
            <td>${decisionsCount}</td>
            <td>${topCategory}</td>
            <td>-</td>
        `;

        tbody.appendChild(row);
    });
}

function getTopCategory(decisions) {
    if (decisions.length === 0) return '-';

    const counts = {};
    decisions.forEach(d => {
        counts[d.type] = (counts[d.type] || 0) + 1;
    });

    const top = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    return top.charAt(0).toUpperCase() + top.slice(1);
}

function loadData() {
    updateRatingDisplay();
}

function showNotification(message, type) {
    alert(message);
}