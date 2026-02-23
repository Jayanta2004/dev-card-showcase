// Gut Microbiome Log JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();
    updateDisplay();

    const form = document.getElementById('gutEntryForm');
    form.addEventListener('submit', handleFormSubmit);

    // Set default time to current time
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('mealTime').value = timeString;
});

function handleFormSubmit(e) {
    e.preventDefault();

    const symptoms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    const entry = {
        date: new Date().toISOString(),
        mealType: document.getElementById('mealType').value,
        foodItems: document.getElementById('foodItems').value.trim(),
        mealTime: document.getElementById('mealTime').value,
        portionSize: document.getElementById('portionSize').value,
        symptoms: symptoms,
        notes: document.getElementById('notes').value.trim()
    };

    saveEntry(entry);
    updateDisplay();
    form.reset();

    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    // Reset time to current
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('mealTime').value = timeString;

    showNotification('Entry logged successfully!', 'success');
}

function saveEntry(entry) {
    const data = getData();
    data.entries.push(entry);
    localStorage.setItem('gutMicrobiomeData', JSON.stringify(data));
}

function getData() {
    const data = localStorage.getItem('gutMicrobiomeData');
    return data ? JSON.parse(data) : { entries: [] };
}

function updateDisplay() {
    updateSummary();
    updateRecentEntries();
    updateInsights();
    updateCorrelations();
    updateCharts();
    updateHistoryTable();
}

function updateSummary() {
    const data = getData();
    const entries = data.entries;
    const today = new Date().toDateString();

    const todayEntries = entries.filter(e => new Date(e.date).toDateString() === today);
    const mealsToday = todayEntries.length;
    const symptomsToday = todayEntries.reduce((sum, e) => sum + e.symptoms.length, 0);

    document.getElementById('mealsToday').textContent = mealsToday;
    document.getElementById('symptomsToday').textContent = symptomsToday;

    // Most common symptom today
    const symptomCounts = {};
    todayEntries.forEach(entry => {
        entry.symptoms.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
    });

    const topSymptom = Object.keys(symptomCounts).reduce((a, b) =>
        symptomCounts[a] > symptomCounts[b] ? a : b, 'None');
    document.getElementById('topSymptom').textContent =
        topSymptom.charAt(0).toUpperCase() + topSymptom.slice(1);

    // Gut health score (simple calculation based on symptoms)
    let score = 10;
    if (symptomsToday > 0) {
        score = Math.max(1, 10 - (symptomsToday * 0.5) - (mealsToday > 3 ? 1 : 0));
    }
    document.getElementById('gutHealthScore').textContent = Math.round(score) + '/10';
}

function updateRecentEntries() {
    const data = getData();
    const entries = data.entries;
    const today = new Date().toDateString();

    const todayEntries = entries
        .filter(e => new Date(e.date).toDateString() === today)
        .slice(-5) // Last 5 entries
        .reverse();

    const list = document.getElementById('recentEntries');

    if (todayEntries.length === 0) {
        list.innerHTML = '<p class="empty-state">No entries today.</p>';
        return;
    }

    list.innerHTML = '';
    todayEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'entry-item';

        const time = new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const symptomsText = entry.symptoms.length > 0 ?
            `Symptoms: ${entry.symptoms.join(', ')}` : 'No symptoms reported';

        item.innerHTML = `
            <div class="entry-header">
                <span class="entry-time">${time}</span>
                <span class="entry-type">${entry.mealType}</span>
            </div>
            <div class="entry-foods">${entry.foodItems}</div>
            <div class="entry-symptoms">${symptomsText}</div>
        `;

        list.appendChild(item);
    });
}

function updateInsights() {
    const data = getData();
    const entries = data.entries;
    if (entries.length < 7) return;

    const insights = [];

    // Recent symptom trends
    const last7Days = entries.filter(e => {
        const entryDate = new Date(e.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
    });

    const totalSymptoms = last7Days.reduce((sum, e) => sum + e.symptoms.length, 0);
    const avgSymptomsPerDay = totalSymptoms / 7;

    if (avgSymptomsPerDay > 2) {
        insights.push({
            title: 'High Symptom Frequency',
            text: `You've reported an average of ${avgSymptomsPerDay.toFixed(1)} symptoms per day this week. Consider reviewing your diet or consulting a healthcare professional.`
        });
    } else if (avgSymptomsPerDay < 0.5) {
        insights.push({
            title: 'Good Gut Health',
            text: 'Your symptom reports have been low this week. Keep up the good habits!'
        });
    }

    // Meal timing patterns
    const mealTimes = entries.map(e => e.mealTime).filter(t => t);
    if (mealTimes.length > 5) {
        const avgHour = mealTimes.reduce((sum, time) => {
            const [hours, minutes] = time.split(':');
            return sum + parseInt(hours) + parseInt(minutes)/60;
        }, 0) / mealTimes.length;

        if (avgHour > 20 || avgHour < 6) {
            insights.push({
                title: 'Late Night Eating',
                text: 'Some of your meals are quite late. Consider eating earlier to support better digestion.'
            });
        }
    }

    // Most problematic foods (simple correlation)
    const foodSymptomMap = {};
    entries.forEach(entry => {
        const foods = entry.foodItems.toLowerCase().split(',').map(f => f.trim());
        foods.forEach(food => {
            if (!foodSymptomMap[food]) {
                foodSymptomMap[food] = { count: 0, symptoms: 0 };
            }
            foodSymptomMap[food].count++;
            foodSymptomMap[food].symptoms += entry.symptoms.length;
        });
    });

    const problematicFoods = Object.keys(foodSymptomMap)
        .filter(food => foodSymptomMap[food].count >= 2)
        .map(food => ({
            food,
            ratio: foodSymptomMap[food].symptoms / foodSymptomMap[food].count
        }))
        .sort((a, b) => b.ratio - a.ratio)
        .slice(0, 3);

    if (problematicFoods.length > 0 && problematicFoods[0].ratio > 0.5) {
        insights.push({
            title: 'Potential Food Triggers',
            text: `Foods like ${problematicFoods.slice(0, 2).map(p => p.food).join(' and ')} have been associated with symptoms. Consider reducing or eliminating these temporarily.`
        });
    }

    if (insights.length === 0) {
        insights.push({
            title: 'Keep Tracking!',
            text: 'Continue logging your meals and symptoms to identify patterns and improve your gut health.'
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

function updateCorrelations() {
    const data = getData();
    const entries = data.entries;
    if (entries.length < 10) return;

    const correlations = [];

    // Simple food-symptom correlation analysis
    const foodSymptomMap = {};

    entries.forEach(entry => {
        const foods = entry.foodItems.toLowerCase().split(',').map(f => f.trim());
        foods.forEach(food => {
            if (!foodSymptomMap[food]) {
                foodSymptomMap[food] = {};
            }
            entry.symptoms.forEach(symptom => {
                foodSymptomMap[food][symptom] = (foodSymptomMap[food][symptom] || 0) + 1;
            });
        });
    });

    // Find strongest correlations
    const correlationList = [];
    Object.keys(foodSymptomMap).forEach(food => {
        const totalOccurrences = Object.values(foodSymptomMap[food]).reduce((a, b) => a + b, 0);
        if (totalOccurrences >= 3) { // Only show foods eaten at least 3 times
            Object.keys(foodSymptomMap[food]).forEach(symptom => {
                const count = foodSymptomMap[food][symptom];
                const strength = count / totalOccurrences;
                if (strength >= 0.5) { // 50% or more correlation
                    correlationList.push({
                        food: food,
                        symptom: symptom,
                        strength: strength,
                        count: count
                    });
                }
            });
        }
    });

    correlationList.sort((a, b) => b.strength - a.strength);

    const container = document.getElementById('correlations');
    container.innerHTML = '';

    if (correlationList.length === 0) {
        container.innerHTML = '<p>Correlations will appear as you log more data.</p>';
        return;
    }

    correlationList.slice(0, 5).forEach(corr => {
        const item = document.createElement('div');
        item.className = 'correlation-item';
        item.innerHTML = `
            <div class="correlation-header">
                <span class="food-name">${corr.food}</span>
                <span class="correlation-strength">${Math.round(corr.strength * 100)}% correlation</span>
            </div>
            <div class="symptoms-list">Associated with: ${corr.symptom} (${corr.count} times)</div>
        `;
        container.appendChild(item);
    });
}

function initializeCharts() {
    const ctx = document.getElementById('symptomChart').getContext('2d');

    window.symptomChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Symptom Frequency',
                data: [],
                backgroundColor: '#ed8936',
                borderColor: '#dd6b20',
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
                        text: 'Occurrences'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Symptoms'
                    }
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
    const entries = data.entries;
    const days = view === 'week' ? 7 : 30;

    const recent = entries.filter(e => {
        const entryDate = new Date(e.date);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return entryDate >= cutoff;
    });

    const symptomCounts = {};
    recent.forEach(entry => {
        entry.symptoms.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
    });

    const labels = Object.keys(symptomCounts);
    const values = Object.values(symptomCounts);

    window.symptomChart.data.labels = labels.map(label =>
        label.charAt(0).toUpperCase() + label.slice(1)
    );
    window.symptomChart.data.datasets[0].data = values;
    window.symptomChart.update();
}

function updateHistoryTable() {
    const data = getData();
    const entries = data.entries;
    const tbody = document.getElementById('historyBody');

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No entries logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    entries.slice().reverse().forEach((entry, index) => {
        const row = document.createElement('tr');
        const dateTime = new Date(entry.date).toLocaleString();
        const symptomsText = entry.symptoms.length > 0 ? entry.symptoms.join(', ') : 'None';

        row.innerHTML = `
            <td>${dateTime}</td>
            <td>${entry.mealType}</td>
            <td>${entry.foodItems}</td>
            <td>${symptomsText}</td>
            <td>${entry.notes || '-'}</td>
            <td><button class="btn-delete" onclick="deleteEntry(${entries.length - 1 - index})">Delete</button></td>
        `;

        tbody.appendChild(row);
    });
}

function deleteEntry(index) {
    const data = getData();
    data.entries.splice(index, 1);
    localStorage.setItem('gutMicrobiomeData', JSON.stringify(data));
    updateDisplay();
    showNotification('Entry deleted.', 'info');
}

function loadData() {
    updateDisplay();
}

function showNotification(message, type) {
    alert(message);
}