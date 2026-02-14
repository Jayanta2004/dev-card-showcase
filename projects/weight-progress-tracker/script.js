let weightEntries = JSON.parse(localStorage.getItem('weightEntries')) || [];
let targetWeight = parseFloat(localStorage.getItem('targetWeight')) || 0;
let chart = null;

// Set default date to today
document.getElementById('entryDate').valueAsDate = new Date();

function setTarget() {
    const currentWeight = parseFloat(document.getElementById('currentWeight').value);
    const newTargetWeight = parseFloat(document.getElementById('targetWeight').value);

    if (!currentWeight || !newTargetWeight) {
        alert('Please enter both current and target weight');
        return;
    }

    targetWeight = newTargetWeight;
    localStorage.setItem('targetWeight', targetWeight);

    // Add initial weight entry if not exists
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = weightEntries.find(entry => entry.date === today);

    if (!existingEntry) {
        const initialEntry = {
            date: today,
            weight: currentWeight,
            timestamp: new Date().toISOString()
        };
        weightEntries.push(initialEntry);
        localStorage.setItem('weightEntries', JSON.stringify(weightEntries));
    }

    updateTargetDisplay();
    updateStats();
    updateChart();
    updateWeightEntries();

    // Clear form
    document.getElementById('currentWeight').value = '';
    document.getElementById('targetWeight').value = '';

    showNotification('Target set and initial weight logged! 📈');
}

function addWeightEntry() {
    const weight = parseFloat(document.getElementById('newWeight').value);
    const date = document.getElementById('entryDate').value;

    if (!weight || !date) {
        alert('Please enter both weight and date');
        return;
    }

    // Check if entry for this date already exists
    const existingEntryIndex = weightEntries.findIndex(entry => entry.date === date);

    const entry = {
        date: date,
        weight: weight,
        timestamp: new Date().toISOString()
    };

    if (existingEntryIndex >= 0) {
        // Update existing entry
        weightEntries[existingEntryIndex] = entry;
    } else {
        // Add new entry
        weightEntries.push(entry);
    }

    // Sort entries by date
    weightEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    localStorage.setItem('weightEntries', JSON.stringify(weightEntries));

    updateStats();
    updateChart();
    updateWeightEntries();
    updateTargetDisplay();

    // Clear form
    document.getElementById('newWeight').value = '';
    document.getElementById('entryDate').valueAsDate = new Date();

    showNotification('Weight entry added! 💪');
}

function updateTargetDisplay() {
    if (targetWeight && weightEntries.length > 0) {
        const latestWeight = weightEntries[weightEntries.length - 1].weight;
        const weightToLose = Math.max(0, latestWeight - targetWeight);
        const totalToLose = Math.abs(weightEntries[0].weight - targetWeight);
        const progressPercent = totalToLose > 0 ? Math.min(100, ((totalToLose - weightToLose) / totalToLose) * 100) : 0;

        document.getElementById('currentWeightDisplay').textContent = latestWeight.toFixed(1);
        document.getElementById('targetWeightDisplay').textContent = targetWeight.toFixed(1);
        document.getElementById('weightToLose').textContent = weightToLose.toFixed(1);
        document.getElementById('progressPercent').textContent = progressPercent.toFixed(1);
        document.getElementById('progressFill').style.width = progressPercent + '%';

        document.getElementById('targetDisplay').style.display = 'block';
    }
}

function updateStats() {
    if (weightEntries.length === 0) return;

    const latestWeight = weightEntries[weightEntries.length - 1].weight;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEntries = weightEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
    const weightChange = recentEntries.length > 1 ? latestWeight - recentEntries[0].weight : 0;

    // Calculate unique days tracked
    const uniqueDates = new Set(weightEntries.map(entry => entry.date));

    document.getElementById('latestWeight').textContent = latestWeight.toFixed(1) + ' kg';
    document.getElementById('weightChange').textContent = (weightChange >= 0 ? '+' : '') + weightChange.toFixed(1) + ' kg';
    document.getElementById('totalEntries').textContent = weightEntries.length;
    document.getElementById('daysTracked').textContent = uniqueDates.size;
}

function updateChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');

    if (weightEntries.length === 0) return;

    // Group by month for monthly view
    const monthlyData = {};
    weightEntries.forEach(entry => {
        const date = new Date(entry.date);
        const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(entry);
    });

    // Get average weight per month
    const labels = [];
    const data = [];
    const targetData = [];

    Object.keys(monthlyData).sort().forEach(month => {
        const monthEntries = monthlyData[month];
        const avgWeight = monthEntries.reduce((sum, entry) => sum + entry.weight, 0) / monthEntries.length;

        labels.push(month);
        data.push(avgWeight.toFixed(1));
        targetData.push(targetWeight);
    });

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Your Weight',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Target Weight',
                data: targetData,
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                tension: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value + ' kg';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' kg';
                        }
                    }
                }
            }
        }
    });
}

function updateWeightEntries() {
    const container = document.getElementById('weightEntries');
    container.innerHTML = '';

    if (weightEntries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No weight entries yet. Start tracking your progress!</p>';
        return;
    }

    weightEntries.slice().reverse().forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'weight-entry';

        const date = new Date(entry.date).toLocaleDateString();
        const change = index < weightEntries.length - 1 ?
            (entry.weight - weightEntries[weightEntries.length - 2 - index].weight).toFixed(1) : 'N/A';

        entryDiv.innerHTML = `
            <div class="entry-info">
                <div class="entry-date">${date}</div>
                <div class="entry-weight">${entry.weight.toFixed(1)} kg</div>
                <div class="entry-change">Change: ${change !== 'N/A' ? (change >= 0 ? '+' : '') + change + ' kg' : change}</div>
            </div>
            <button class="delete-btn" onclick="deleteEntry(${weightEntries.length - 1 - index})">Delete</button>
        `;

        container.appendChild(entryDiv);
    });
}

function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this weight entry?')) {
        weightEntries.splice(index, 1);
        localStorage.setItem('weightEntries', JSON.stringify(weightEntries));
        updateStats();
        updateChart();
        updateWeightEntries();
        updateTargetDisplay();
    }
}

function showNotification(message) {
    alert(message);
}

// Initialize
if (targetWeight) {
    document.getElementById('targetWeight').value = targetWeight;
    updateTargetDisplay();
}
updateStats();
updateChart();
updateWeightEntries();