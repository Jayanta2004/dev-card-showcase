// vertical-jump-power-index.js

let jumpEntries = JSON.parse(localStorage.getItem('verticalJumpEntries')) || [];

function logJump() {
    const date = document.getElementById('sessionDate').value;
    const bodyWeight = parseFloat(document.getElementById('bodyWeight').value);
    const jumpHeight = parseFloat(document.getElementById('jumpHeight').value);
    const jumpType = document.getElementById('jumpType').value;
    const notes = document.getElementById('notes').value.trim();

    if (!date || isNaN(bodyWeight) || isNaN(jumpHeight) || bodyWeight <= 0 || jumpHeight <= 0) {
        alert('Please enter valid date, body weight, and jump height.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = jumpEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        jumpEntries = jumpEntries.filter(entry => entry.date !== date);
    }

    // Calculate power metrics
    const bodyWeightLbs = bodyWeight * 2.20462; // Convert kg to lbs
    const jumpHeightInches = jumpHeight * 0.393701; // Convert cm to inches

    // Lewis Power Rating formula
    const lewisPower = (bodyWeightLbs * Math.sqrt(jumpHeightInches)) / 4.9;

    // Estimated power output (simplified)
    const gravity = 9.81; // m/s²
    const heightMeters = jumpHeight / 100; // Convert cm to m
    const estimatedPower = bodyWeight * gravity * heightMeters; // Joules (simplified)

    const entry = {
        id: Date.now(),
        date,
        bodyWeight,
        jumpHeight,
        jumpType,
        lewisPower: parseFloat(lewisPower.toFixed(2)),
        estimatedPower: parseFloat(estimatedPower.toFixed(2)),
        notes
    };

    jumpEntries.push(entry);

    // Sort by date
    jumpEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 100 entries
    if (jumpEntries.length > 100) {
        jumpEntries = jumpEntries.slice(-100);
    }

    localStorage.setItem('verticalJumpEntries', JSON.stringify(jumpEntries));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('bodyWeight').value = '';
    document.getElementById('jumpHeight').value = '';
    document.getElementById('jumpType').value = 'squat';
    document.getElementById('notes').value = '';

    updateStats();
    updateChart();
    updateJumpList();
}

function getPerformanceLevel(heightCm) {
    if (heightCm >= 101.6) return { level: 'Elite', class: 'performance-elite' };
    if (heightCm >= 81.3) return { level: 'Advanced', class: 'performance-advanced' };
    if (heightCm >= 61.0) return { level: 'Intermediate', class: 'performance-intermediate' };
    return { level: 'Beginner', class: 'performance-beginner' };
}

function formatJumpType(type) {
    const types = {
        squat: 'Squat Jump',
        countermovement: 'Counter Movement Jump',
        drop: 'Drop Jump',
        other: 'Other'
    };
    return types[type] || type;
}

function updateStats() {
    const totalJumps = jumpEntries.length;

    if (totalJumps === 0) {
        document.getElementById('currentPower').textContent = '0.00';
        document.getElementById('bestHeight').textContent = '0.0cm';
        document.getElementById('performanceLevel').textContent = 'Unknown';
        document.getElementById('performanceLevel').className = 'stat-value';
        return;
    }

    // Current power (latest entry)
    const latestEntry = jumpEntries[jumpEntries.length - 1];
    const currentPower = latestEntry.lewisPower;

    // Best jump height
    const bestHeight = Math.max(...jumpEntries.map(entry => entry.jumpHeight));

    // Performance level based on best height
    const performanceLevel = getPerformanceLevel(bestHeight);
    const levelElement = document.getElementById('performanceLevel');
    levelElement.textContent = performanceLevel.level;
    levelElement.className = `stat-value ${performanceLevel.class}`;

    document.getElementById('currentPower').textContent = currentPower;
    document.getElementById('bestHeight').textContent = `${bestHeight.toFixed(1)}cm`;
}

function updateChart() {
    const ctx = document.getElementById('powerChart').getContext('2d');

    // Prepare data for last 20 jumps
    const chartEntries = jumpEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const heights = chartEntries.map(entry => entry.jumpHeight);
    const powers = chartEntries.map(entry => entry.lewisPower);

    // Performance level lines
    const eliteLine = new Array(heights.length).fill(101.6); // 40 inches in cm
    const advancedLine = new Array(heights.length).fill(81.3); // 32 inches in cm
    const intermediateLine = new Array(heights.length).fill(61.0); // 24 inches in cm

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jump Height (cm)',
                data: heights,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Power Index',
                data: powers,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }, {
                label: 'Elite Level (101.6cm)',
                data: eliteLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Advanced Level (81.3cm)',
                data: advancedLine,
                borderColor: '#ffc107',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Intermediate Level (61cm)',
                data: intermediateLine,
                borderColor: '#fd7e14',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Jump Height (cm)'
                    },
                    min: 0,
                    max: 120
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Power Index'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function updateJumpList() {
    const jumpList = document.getElementById('jumpList');
    jumpList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = jumpEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'jump-entry';

        const performanceLevel = getPerformanceLevel(entry.jumpHeight);

        entryDiv.innerHTML = `
            <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="metrics">
                <div class="metric">
                    <div class="label">Height</div>
                    <div class="value">${entry.jumpHeight.toFixed(1)}cm</div>
                </div>
                <div class="metric">
                    <div class="label">Weight</div>
                    <div class="value">${entry.bodyWeight}kg</div>
                </div>
                <div class="metric">
                    <div class="label">Power</div>
                    <div class="value ${performanceLevel.class}">${entry.lewisPower}</div>
                </div>
            </div>
            <div class="type">${formatJumpType(entry.jumpType)}</div>
            ${entry.notes ? `<div class="notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        jumpList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this jump entry?')) {
        jumpEntries = jumpEntries.filter(entry => entry.id !== id);
        localStorage.setItem('verticalJumpEntries', JSON.stringify(jumpEntries));
        updateStats();
        updateChart();
        updateJumpList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    updateStats();
    updateChart();
    updateJumpList();
});