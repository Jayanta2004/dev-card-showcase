// psychological-load-redistribution-planner.js

let tasks = JSON.parse(localStorage.getItem('psychologicalLoadTasks')) || [];
let loadChart = null;

function addTask() {
    const name = document.getElementById('taskName').value.trim();
    const date = document.getElementById('taskDate').value;
    const duration = parseFloat(document.getElementById('taskDuration').value);
    const cognitiveLoad = parseInt(document.getElementById('cognitiveLoad').value);
    const emotionalLoad = parseInt(document.getElementById('emotionalLoad').value);
    const socialLoad = parseInt(document.getElementById('socialLoad').value);
    const physicalLoad = parseInt(document.getElementById('physicalLoad').value);
    const category = document.getElementById('taskCategory').value;
    const notes = document.getElementById('taskNotes').value.trim();

    if (!name || !date || !duration || !cognitiveLoad || !emotionalLoad || !socialLoad || !physicalLoad || !category) {
        alert('Please fill in all required fields.');
        return;
    }

    // Calculate total load (weighted average)
    const totalLoad = (cognitiveLoad * 0.4 + emotionalLoad * 0.3 + socialLoad * 0.15 + physicalLoad * 0.15);

    const task = {
        id: Date.now(),
        name,
        date,
        duration,
        cognitiveLoad,
        emotionalLoad,
        socialLoad,
        physicalLoad,
        totalLoad: parseFloat(totalLoad.toFixed(1)),
        category,
        notes,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);

    // Sort by date
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    localStorage.setItem('psychologicalLoadTasks', JSON.stringify(tasks));

    // Clear form
    document.getElementById('taskName').value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskDuration').value = '';
    document.getElementById('cognitiveLoad').value = '';
    document.getElementById('emotionalLoad').value = '';
    document.getElementById('socialLoad').value = '';
    document.getElementById('physicalLoad').value = '';
    document.getElementById('taskCategory').value = '';
    document.getElementById('taskNotes').value = '';

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateTaskList();
}

function calculateDailyLoads() {
    const dailyLoads = {};

    tasks.forEach(task => {
        if (!dailyLoads[task.date]) {
            dailyLoads[task.date] = {
                total: 0,
                cognitive: 0,
                emotional: 0,
                social: 0,
                physical: 0,
                taskCount: 0
            };
        }

        dailyLoads[task.date].total += task.totalLoad * task.duration;
        dailyLoads[task.date].cognitive += task.cognitiveLoad * task.duration;
        dailyLoads[task.date].emotional += task.emotionalLoad * task.duration;
        dailyLoads[task.date].social += task.socialLoad * task.duration;
        dailyLoads[task.date].physical += task.physicalLoad * task.duration;
        dailyLoads[task.date].taskCount += 1;
    });

    return dailyLoads;
}

function updateStats() {
    const dailyLoads = calculateDailyLoads();
    const dates = Object.keys(dailyLoads);

    if (dates.length === 0) {
        document.getElementById('avgDailyLoad').textContent = '0';
        document.getElementById('peakLoadDay').textContent = 'None';
        document.getElementById('balanceScore').textContent = '100%';
        document.getElementById('totalTasks').textContent = '0';
        return;
    }

    // Calculate average daily load
    const totalLoad = dates.reduce((sum, date) => sum + dailyLoads[date].total, 0);
    const avgLoad = (totalLoad / dates.length).toFixed(1);
    document.getElementById('avgDailyLoad').textContent = avgLoad;

    // Find peak load day
    let peakDate = null;
    let peakLoad = 0;
    dates.forEach(date => {
        if (dailyLoads[date].total > peakLoad) {
            peakLoad = dailyLoads[date].total;
            peakDate = date;
        }
    });
    document.getElementById('peakLoadDay').textContent = peakDate ? new Date(peakDate).toLocaleDateString() : 'None';

    // Calculate balance score (lower variance = higher balance)
    const loads = dates.map(date => dailyLoads[date].total);
    const mean = loads.reduce((sum, load) => sum + load, 0) / loads.length;
    const variance = loads.reduce((sum, load) => sum + Math.pow(load - mean, 2), 0) / loads.length;
    const stdDev = Math.sqrt(variance);
    const balanceScore = Math.max(0, Math.min(100, 100 - (stdDev / mean) * 50));
    document.getElementById('balanceScore').textContent = Math.round(balanceScore) + '%';

    document.getElementById('totalTasks').textContent = tasks.length;
}

function updateAlert() {
    const alertDiv = document.getElementById('loadAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    const dailyLoads = calculateDailyLoads();
    const dates = Object.keys(dailyLoads);

    if (dates.length < 2) {
        alertDiv.classList.add('hidden');
        return;
    }

    const loads = dates.map(date => dailyLoads[date].total);
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);
    const imbalanceRatio = maxLoad / (minLoad || 1);

    if (imbalanceRatio > 3) {
        alertTitle.textContent = 'Severe Load Imbalance';
        alertMessage.textContent = `Your schedule shows extreme load variation (${imbalanceRatio.toFixed(1)}x difference between highest and lowest load days). Consider redistributing high-load tasks across multiple days.`;
        alertDiv.classList.remove('hidden', 'warning');
        alertDiv.classList.add('critical');
    } else if (imbalanceRatio > 2) {
        alertTitle.textContent = 'Load Imbalance Detected';
        alertMessage.textContent = `Your task distribution shows significant load variation. Consider spacing out high-load activities for better mental balance.`;
        alertDiv.classList.remove('hidden', 'critical');
        alertDiv.classList.add('warning');
    } else {
        alertDiv.classList.add('hidden');
    }
}

function updateChart() {
    const ctx = document.getElementById('loadChart').getContext('2d');
    const chartView = document.getElementById('chartView').value;
    const loadType = document.getElementById('loadType').value;

    if (loadChart) {
        loadChart.destroy();
    }

    let labels = [];
    let data = [];
    let backgroundColor = 'rgba(54, 162, 235, 0.5)';
    let borderColor = 'rgba(54, 162, 235, 1)';

    if (chartView === 'daily') {
        const dailyLoads = calculateDailyLoads();
        const dates = Object.keys(dailyLoads).sort();

        labels = dates.map(date => new Date(date).toLocaleDateString());
        data = dates.map(date => {
            switch(loadType) {
                case 'cognitive': return dailyLoads[date].cognitive;
                case 'emotional': return dailyLoads[date].emotional;
                case 'social': return dailyLoads[date].social;
                case 'physical': return dailyLoads[date].physical;
                default: return dailyLoads[date].total;
            }
        });
    } else if (chartView === 'weekly') {
        // Group by weeks
        const weeklyLoads = {};
        tasks.forEach(task => {
            const date = new Date(task.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];

            if (!weeklyLoads[weekKey]) {
                weeklyLoads[weekKey] = { total: 0, cognitive: 0, emotional: 0, social: 0, physical: 0 };
            }

            weeklyLoads[weekKey].total += task.totalLoad * task.duration;
            weeklyLoads[weekKey].cognitive += task.cognitiveLoad * task.duration;
            weeklyLoads[weekKey].emotional += task.emotionalLoad * task.duration;
            weeklyLoads[weekKey].social += task.socialLoad * task.duration;
            weeklyLoads[weekKey].physical += task.physicalLoad * task.duration;
        });

        const weeks = Object.keys(weeklyLoads).sort();
        labels = weeks.map(week => {
            const date = new Date(week);
            return `Week of ${date.toLocaleDateString()}`;
        });
        data = weeks.map(week => {
            switch(loadType) {
                case 'cognitive': return weeklyLoads[week].cognitive;
                case 'emotional': return weeklyLoads[week].emotional;
                case 'social': return weeklyLoads[week].social;
                case 'physical': return weeklyLoads[week].physical;
                default: return weeklyLoads[week].total;
            }
        });
    } else if (chartView === 'category') {
        const categoryLoads = {};
        tasks.forEach(task => {
            if (!categoryLoads[task.category]) {
                categoryLoads[task.category] = { total: 0, cognitive: 0, emotional: 0, social: 0, physical: 0 };
            }

            categoryLoads[task.category].total += task.totalLoad * task.duration;
            categoryLoads[task.category].cognitive += task.cognitiveLoad * task.duration;
            categoryLoads[task.category].emotional += task.emotionalLoad * task.duration;
            categoryLoads[task.category].social += task.socialLoad * task.duration;
            categoryLoads[task.category].physical += task.physicalLoad * task.duration;
        });

        labels = Object.keys(categoryLoads).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
        data = Object.values(categoryLoads).map(load => {
            switch(loadType) {
                case 'cognitive': return load.cognitive;
                case 'emotional': return load.emotional;
                case 'social': return load.social;
                case 'physical': return load.physical;
                default: return load.total;
            }
        });
    }

    loadChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `${loadType.charAt(0).toUpperCase() + loadType.slice(1)} Load`,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Load Units'
                    }
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

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (tasks.length === 0) {
        insightsDiv.innerHTML = '<p>Add tasks to receive personalized insights about your psychological load distribution and optimization suggestions.</p>';
        return;
    }

    const dailyLoads = calculateDailyLoads();
    const dates = Object.keys(dailyLoads);
    const insights = [];

    // Analyze load patterns
    const loads = dates.map(date => dailyLoads[date].total);
    const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);

    if (maxLoad > avgLoad * 1.5) {
        insights.push(`<div class="insight-item"><i class="fas fa-exclamation-triangle"></i> <strong>High Load Days:</strong> Some days have ${((maxLoad/avgLoad - 1) * 100).toFixed(0)}% more load than average. Consider redistributing tasks from peak days.</div>`);
    }

    if (minLoad < avgLoad * 0.5) {
        insights.push(`<div class="insight-item"><i class="fas fa-check-circle"></i> <strong>Recovery Days:</strong> You have low-load days that can serve as recovery periods. Use these for restorative activities.</div>`);
    }

    // Analyze category distribution
    const categoryCount = {};
    tasks.forEach(task => {
        categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    });

    const dominantCategory = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
    if (categoryCount[dominantCategory] > tasks.length * 0.6) {
        insights.push(`<div class="insight-item"><i class="fas fa-balance-scale"></i> <strong>Category Balance:</strong> ${dominantCategory.charAt(0).toUpperCase() + dominantCategory.slice(1)} tasks dominate your schedule. Consider diversifying your activities.</div>`);
    }

    // Cognitive load analysis
    const highCognitiveTasks = tasks.filter(task => task.cognitiveLoad >= 8);
    if (highCognitiveTasks.length > tasks.length * 0.3) {
        insights.push(`<div class="insight-item"><i class="fas fa-brain"></i> <strong>Cognitive Load:</strong> ${highCognitiveTasks.length} high-cognitive-load tasks detected. Space these out to prevent mental fatigue.</div>`);
    }

    if (insights.length === 0) {
        insights.push('<div class="insight-item"><i class="fas fa-thumbs-up"></i> <strong>Good Balance:</strong> Your current task distribution shows reasonable psychological load balance.</div>');
    }

    insightsDiv.innerHTML = insights.join('');
}

function updateTaskList() {
    const taskListDiv = document.getElementById('taskList');
    const filterCategory = document.getElementById('filterCategory').value;
    const sortBy = document.getElementById('sortBy').value;

    let filteredTasks = tasks;

    if (filterCategory !== 'all') {
        filteredTasks = tasks.filter(task => task.category === filterCategory);
    }

    // Sort tasks
    filteredTasks.sort((a, b) => {
        switch(sortBy) {
            case 'date':
                return new Date(a.date) - new Date(b.date);
            case 'load':
                return b.totalLoad - a.totalLoad;
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });

    if (filteredTasks.length === 0) {
        taskListDiv.innerHTML = '<p class="no-tasks">No tasks found matching the current filters.</p>';
        return;
    }

    taskListDiv.innerHTML = filteredTasks.map(task => `
        <div class="task-item">
            <div class="task-header">
                <div>
                    <h4 class="task-title">${task.name}</h4>
                    <p class="task-date">${new Date(task.date).toLocaleDateString()} • ${task.duration}h</p>
                </div>
                <span class="task-category">${task.category}</span>
            </div>
            <div class="task-loads">
                <div class="load-item">
                    <div class="load-label">Cognitive</div>
                    <div class="load-value load-cognitive">${task.cognitiveLoad}</div>
                </div>
                <div class="load-item">
                    <div class="load-label">Emotional</div>
                    <div class="load-value load-emotional">${task.emotionalLoad}</div>
                </div>
                <div class="load-item">
                    <div class="load-label">Social</div>
                    <div class="load-value load-social">${task.socialLoad}</div>
                </div>
                <div class="load-item">
                    <div class="load-label">Physical</div>
                    <div class="load-value load-physical">${task.physicalLoad}</div>
                </div>
            </div>
            ${task.notes ? `<p class="task-notes">${task.notes}</p>` : ''}
            <div class="task-actions">
                <button class="btn-secondary" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-danger" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('psychologicalLoadTasks', JSON.stringify(tasks));
        updateStats();
        updateAlert();
        updateChart();
        updateInsights();
        updateTaskList();
    }
}

function editTask(taskId) {
    // For simplicity, we'll just prompt for basic edits
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newName = prompt('Edit task name:', task.name);
    if (newName && newName.trim()) {
        task.name = newName.trim();
        localStorage.setItem('psychologicalLoadTasks', JSON.stringify(tasks));
        updateTaskList();
    }
}

// Event listeners
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addTask();
});

document.getElementById('chartView').addEventListener('change', updateChart);
document.getElementById('loadType').addEventListener('change', updateChart);
document.getElementById('filterCategory').addEventListener('change', updateTaskList);
document.getElementById('sortBy').addEventListener('change', updateTaskList);

// Set default date to today
document.getElementById('taskDate').valueAsDate = new Date();

// Initialize
updateStats();
updateAlert();
updateChart();
updateInsights();
updateTaskList();