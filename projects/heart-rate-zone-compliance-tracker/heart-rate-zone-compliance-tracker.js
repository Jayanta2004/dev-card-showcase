// heart-rate-zone-compliance-tracker.js

let workoutLogs = JSON.parse(localStorage.getItem('hrZoneWorkouts')) || [];
let currentZones = null;

// Calculate heart rate zones based on age and resting HR
function calculateZones(age, restingHR) {
    if (!age || !restingHR) return null;

    const maxHR = 220 - age;
    const reserve = maxHR - restingHR;

    return {
        1: { min: Math.round(restingHR), max: Math.round(restingHR + reserve * 0.5), name: 'Recovery', intensity: 'Very Light' },
        2: { min: Math.round(restingHR + reserve * 0.5), max: Math.round(restingHR + reserve * 0.6), name: 'Endurance', intensity: 'Light' },
        3: { min: Math.round(restingHR + reserve * 0.6), max: Math.round(restingHR + reserve * 0.7), name: 'Tempo', intensity: 'Moderate' },
        4: { min: Math.round(restingHR + reserve * 0.7), max: Math.round(restingHR + reserve * 0.8), name: 'Threshold', intensity: 'Hard' },
        5: { min: Math.round(restingHR + reserve * 0.8), max: Math.round(maxHR), name: 'Maximum', intensity: 'Maximum' }
    };
}

// Update zone display when age or resting HR changes
document.getElementById('age').addEventListener('input', updateZoneDisplay);
document.getElementById('restingHR').addEventListener('input', updateZoneDisplay);

function updateZoneDisplay() {
    const age = parseInt(document.getElementById('age').value);
    const restingHR = parseInt(document.getElementById('restingHR').value);

    if (age && restingHR) {
        currentZones = calculateZones(age, restingHR);
        displayZones(currentZones);
    } else {
        document.getElementById('zonesList').innerHTML = '<p>Please enter your age and resting heart rate to calculate zones.</p>';
    }
}

function displayZones(zones) {
    const zonesList = document.getElementById('zonesList');
    zonesList.innerHTML = '';

    for (let zoneNum = 1; zoneNum <= 5; zoneNum++) {
        const zone = zones[zoneNum];
        const zoneItem = document.createElement('div');
        zoneItem.className = 'zone-item';
        zoneItem.innerHTML = `
            <div>
                <span class="zone-name">Zone ${zoneNum} (${zone.name})</span>
                <div class="zone-intensity">${zone.intensity}</div>
            </div>
            <div class="zone-range">${zone.min} - ${zone.max} bpm</div>
        `;
        zonesList.appendChild(zoneItem);
    }
}

function logWorkout() {
    const workoutType = document.getElementById('workoutType').value;
    const targetZone = document.getElementById('targetZone').value;
    const duration = parseInt(document.getElementById('duration').value);
    const avgHR = parseInt(document.getElementById('avgHR').value);
    const hrDataInput = document.getElementById('hrData').value.trim();
    const notes = document.getElementById('notes').value.trim();

    if (!duration || !avgHR || !currentZones) {
        alert('Please fill in all required fields and calculate your heart rate zones first.');
        return;
    }

    // Parse HR data points if provided
    let hrDataPoints = [];
    if (hrDataInput) {
        hrDataPoints = hrDataInput.split(',').map(val => parseInt(val.trim())).filter(val => !isNaN(val));
    }

    // Calculate compliance
    const targetZoneData = currentZones[targetZone];
    let compliance = 0;

    if (hrDataPoints.length > 0) {
        // Calculate compliance based on data points
        const inZonePoints = hrDataPoints.filter(hr => hr >= targetZoneData.min && hr <= targetZoneData.max).length;
        compliance = Math.round((inZonePoints / hrDataPoints.length) * 100);
    } else {
        // Calculate compliance based on average HR
        if (avgHR >= targetZoneData.min && avgHR <= targetZoneData.max) {
            compliance = 100;
        } else if (avgHR < targetZoneData.min) {
            // Below zone - partial credit based on proximity
            const diff = targetZoneData.min - avgHR;
            compliance = Math.max(0, Math.round(100 - (diff / targetZoneData.min) * 100));
        } else {
            // Above zone - partial credit based on proximity
            const diff = avgHR - targetZoneData.max;
            compliance = Math.max(0, Math.round(100 - (diff / (220 - targetZoneData.max)) * 100));
        }
    }

    const workout = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        workoutType: workoutType,
        targetZone: targetZone,
        duration: duration,
        avgHR: avgHR,
        hrDataPoints: hrDataPoints,
        compliance: compliance,
        notes: notes,
        zones: currentZones // Store zones at time of workout
    };

    workoutLogs.push(workout);
    saveWorkouts();

    // Clear form
    document.getElementById('duration').value = '';
    document.getElementById('avgHR').value = '';
    document.getElementById('hrData').value = '';
    document.getElementById('notes').value = '';

    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
}

function saveWorkouts() {
    localStorage.setItem('hrZoneWorkouts', JSON.stringify(workoutLogs));
}

function updateStats() {
    if (workoutLogs.length === 0) {
        document.getElementById('overallCompliance').textContent = '0%';
        document.getElementById('zone2Compliance').textContent = '0%';
        document.getElementById('totalMinutes').textContent = '0 min';
        document.getElementById('weeklyWorkouts').textContent = '0';
        return;
    }

    // Overall compliance
    const overallCompliance = workoutLogs.reduce((sum, workout) => sum + workout.compliance, 0) / workoutLogs.length;
    document.getElementById('overallCompliance').textContent = `${Math.round(overallCompliance)}%`;

    // Zone 2 compliance
    const zone2Workouts = workoutLogs.filter(w => w.targetZone === '2');
    const zone2Compliance = zone2Workouts.length > 0 ?
        zone2Workouts.reduce((sum, w) => sum + w.compliance, 0) / zone2Workouts.length : 0;
    document.getElementById('zone2Compliance').textContent = `${Math.round(zone2Compliance)}%`;

    // Total minutes
    const totalMinutes = workoutLogs.reduce((sum, workout) => sum + workout.duration, 0);
    document.getElementById('totalMinutes').textContent = `${totalMinutes} min`;

    // Weekly workouts
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyWorkouts = workoutLogs.filter(workout =>
        new Date(workout.timestamp) >= oneWeekAgo
    ).length;
    document.getElementById('weeklyWorkouts').textContent = weeklyWorkouts;
}

function updateCharts() {
    updateComplianceChart();
    updateZoneDistributionChart();
}

function updateComplianceChart() {
    const sortedWorkouts = workoutLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedWorkouts.map(workout => new Date(workout.timestamp));
    const complianceData = sortedWorkouts.map(workout => workout.compliance);

    const ctx = document.getElementById('complianceChart').getContext('2d');
    if (window.complianceChart) {
        window.complianceChart.destroy();
    }

    window.complianceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Zone Compliance %',
                data: complianceData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y}% compliance`
                    }
                }
            }
        }
    });
}

function updateZoneDistributionChart() {
    const zoneCounts = {};
    workoutLogs.forEach(workout => {
        const zone = workout.targetZone;
        zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
    });

    const labels = Object.keys(zoneCounts).map(zone => `Zone ${zone}`);
    const data = Object.values(zoneCounts);

    const ctx = document.getElementById('zoneDistributionChart').getContext('2d');
    if (window.zoneDistributionChart) {
        window.zoneDistributionChart.destroy();
    }

    window.zoneDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#E8F5E8', // Zone 1
                    '#C8E6C9', // Zone 2
                    '#A5D6A7', // Zone 3
                    '#81C784', // Zone 4
                    '#66BB6A'  // Zone 5
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed} workouts`
                    }
                }
            }
        }
    });
}

function updateInsights() {
    // Best performing zone
    const zonePerformance = {};
    workoutLogs.forEach(workout => {
        const zone = workout.targetZone;
        if (!zonePerformance[zone]) {
            zonePerformance[zone] = { total: 0, count: 0 };
        }
        zonePerformance[zone].total += workout.compliance;
        zonePerformance[zone].count++;
    });

    let bestZone = 'No data available';
    let bestAvg = 0;
    Object.keys(zonePerformance).forEach(zone => {
        const avg = zonePerformance[zone].total / zonePerformance[zone].count;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestZone = `Zone ${zone} (${avg.toFixed(1)}% avg compliance, ${zonePerformance[zone].count} workouts)`;
        }
    });
    document.getElementById('bestZone').textContent = bestZone;

    // Progress trend
    if (workoutLogs.length < 5) {
        document.getElementById('progressTrend').textContent = 'Need at least 5 workouts for trend analysis';
    } else {
        const recent = workoutLogs.slice(-5);
        const earlier = workoutLogs.slice(-10, -5);

        if (earlier.length > 0) {
            const recentAvg = recent.reduce((sum, w) => sum + w.compliance, 0) / recent.length;
            const earlierAvg = earlier.reduce((sum, w) => sum + w.compliance, 0) / earlier.length;
            const change = recentAvg - earlierAvg;

            if (Math.abs(change) < 5) {
                document.getElementById('progressTrend').textContent = 'Zone compliance stable';
            } else if (change > 0) {
                document.getElementById('progressTrend').textContent = `Improving: +${change.toFixed(1)}% compliance in recent workouts`;
            } else {
                document.getElementById('progressTrend').textContent = `Declining: ${change.toFixed(1)}% compliance in recent workouts`;
            }
        } else {
            document.getElementById('progressTrend').textContent = 'Building training consistency';
        }
    }

    // Training intensity analysis
    const zoneDistribution = {};
    workoutLogs.forEach(workout => {
        const zone = workout.targetZone;
        zoneDistribution[zone] = (zoneDistribution[zone] || 0) + workout.duration;
    });

    const sortedZones = Object.entries(zoneDistribution)
        .sort(([,a], [,b]) => b - a);

    let intensityText = 'No data available';
    if (sortedZones.length > 0) {
        const [topZone, topMinutes] = sortedZones[0];
        intensityText = `Most time in Zone ${topZone} (${topMinutes} min total)`;
        if (sortedZones.length > 1) {
            const [secondZone, secondMinutes] = sortedZones[1];
            intensityText += `, followed by Zone ${secondZone} (${secondMinutes} min)`;
        }
    }
    document.getElementById('intensityAnalysis').textContent = intensityText;
}

function displayHistory(filter = 'all') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredWorkouts = workoutLogs;

    if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredWorkouts = workoutLogs.filter(workout => new Date(workout.timestamp) >= oneWeekAgo);
    } else if (filter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredWorkouts = workoutLogs.filter(workout => new Date(workout.timestamp) >= oneMonthAgo);
    }

    // Sort by most recent first
    filteredWorkouts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyDiv = document.getElementById('workoutHistory');
    historyDiv.innerHTML = '';

    if (filteredWorkouts.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666;">No workouts found</p>';
        return;
    }

    filteredWorkouts.forEach(workout => {
        const entry = document.createElement('div');
        entry.className = 'workout-entry';

        const date = new Date(workout.timestamp).toLocaleDateString();
        const time = new Date(workout.timestamp).toLocaleTimeString();
        const complianceClass = workout.compliance >= 90 ? 'excellent' :
                               workout.compliance >= 75 ? 'good' :
                               workout.compliance >= 60 ? 'fair' : 'poor';

        entry.innerHTML = `
            <h4>
                ${workout.workoutType.replace('-', ' ')} - ${date} ${time}
                <span class="compliance-badge ${complianceClass}">${workout.compliance}% compliant</span>
                <button class="delete-btn" onclick="deleteWorkout(${workout.id})">×</button>
            </h4>
            <div class="workout-details">
                <div class="detail-item">Target: Zone ${workout.targetZone}</div>
                <div class="detail-item">Duration: ${workout.duration} min</div>
                <div class="detail-item">Avg HR: ${workout.avgHR} bpm</div>
                ${workout.hrDataPoints.length > 0 ? `<div class="detail-item">Data points: ${workout.hrDataPoints.length}</div>` : ''}
            </div>
            ${workout.notes ? `<p><strong>Notes:</strong> ${workout.notes}</p>` : ''}
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteWorkout(id) {
    if (confirm('Are you sure you want to delete this workout?')) {
        workoutLogs = workoutLogs.filter(workout => workout.id !== id);
        saveWorkouts();
        updateStats();
        updateCharts();
        updateInsights();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved age and resting HR if available
    const savedAge = localStorage.getItem('userAge');
    const savedRestingHR = localStorage.getItem('userRestingHR');

    if (savedAge) document.getElementById('age').value = savedAge;
    if (savedRestingHR) document.getElementById('restingHR').value = savedRestingHR;

    // Save user inputs
    document.getElementById('age').addEventListener('change', function() {
        localStorage.setItem('userAge', this.value);
    });
    document.getElementById('restingHR').addEventListener('change', function() {
        localStorage.setItem('userRestingHR', this.value);
    });

    updateZoneDisplay();
    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
});