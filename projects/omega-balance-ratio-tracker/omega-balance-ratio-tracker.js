// omega-balance-ratio-tracker.js

let intakeEntries = JSON.parse(localStorage.getItem('omegaBalanceEntries')) || [];

function logIntake() {
    const date = document.getElementById('logDate').value;
    const omega3 = parseFloat(document.getElementById('omega3Intake').value) || 0;
    const omega6 = parseFloat(document.getElementById('omega6Intake').value) || 0;
    const sources = document.getElementById('foodSources').value.trim();

    if (!date) {
        alert('Please select a date.');
        return;
    }

    if (omega3 === 0 && omega6 === 0) {
        alert('Please enter at least one omega intake value.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = intakeEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        intakeEntries = intakeEntries.filter(entry => entry.date !== date);
    }

    // Calculate ratio (omega-3:omega-6)
    let ratio = 0;
    let ratioText = '0:1';
    if (omega6 > 0) {
        ratio = omega3 / omega6;
        ratioText = ratio.toFixed(2) + ':1';
    }

    const entry = {
        id: Date.now(),
        date,
        omega3,
        omega6,
        ratio,
        ratioText,
        sources
    };

    intakeEntries.push(entry);

    // Sort by date
    intakeEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 100 entries
    if (intakeEntries.length > 100) {
        intakeEntries = intakeEntries.slice(-100);
    }

    localStorage.setItem('omegaBalanceEntries', JSON.stringify(intakeEntries));

    // Clear form
    document.getElementById('logDate').value = '';
    document.getElementById('omega3Intake').value = '';
    document.getElementById('omega6Intake').value = '';
    document.getElementById('foodSources').value = '';

    updateStats();
    updateChart();
    updateIntakeList();
}

function getRatioStatus(ratio) {
    if (ratio >= 1) return { status: 'Optimal', class: 'ratio-optimal' };
    if (ratio >= 0.5) return { status: 'Good', class: 'ratio-good' };
    if (ratio >= 0.25) return { status: 'Poor', class: 'ratio-poor' };
    return { status: 'Critical', class: 'ratio-critical' };
}

function updateStats() {
    const totalEntries = intakeEntries.length;

    if (totalEntries === 0) {
        document.getElementById('currentRatio').textContent = '0:1';
        document.getElementById('ratioStatus').textContent = 'Unknown';
        document.getElementById('ratioStatus').className = 'stat-value';
        document.getElementById('avgOmega3').textContent = '0.0g';
        return;
    }

    // Calculate average ratio for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = intakeEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);

    let avgRatio = 0;
    if (recentEntries.length > 0) {
        const validRatios = recentEntries.filter(entry => entry.omega6 > 0);
        if (validRatios.length > 0) {
            avgRatio = validRatios.reduce((sum, entry) => sum + entry.ratio, 0) / validRatios.length;
        }
    }

    const ratioStatus = getRatioStatus(avgRatio);
    const ratioElement = document.getElementById('ratioStatus');
    ratioElement.textContent = ratioStatus.status;
    ratioElement.className = `stat-value ${ratioStatus.class}`;

    document.getElementById('currentRatio').textContent = avgRatio.toFixed(2) + ':1';

    // Calculate average omega-3 for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthEntries = intakeEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
    const avgOmega3 = monthEntries.length > 0
        ? (monthEntries.reduce((sum, entry) => sum + entry.omega3, 0) / monthEntries.length).toFixed(1)
        : '0.0';

    document.getElementById('avgOmega3').textContent = `${avgOmega3}g`;
}

function updateChart() {
    const ctx = document.getElementById('ratioChart').getContext('2d');

    // Prepare data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const chartEntries = intakeEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const ratios = chartEntries.map(entry => entry.ratio);
    const omega3Data = chartEntries.map(entry => entry.omega3);
    const omega6Data = chartEntries.map(entry => entry.omega6);

    // Optimal ratio line (1:4 = 0.25)
    const optimalLine = new Array(ratios.length).fill(0.25);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Omega-3:Omega-6 Ratio',
                data: ratios,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Optimal Ratio (1:4)',
                data: optimalLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Omega-3 Intake (g)',
                data: omega3Data,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Omega-6 Intake (g)',
                data: omega6Data,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
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
                        text: 'Omega-3:Omega-6 Ratio'
                    },
                    min: 0,
                    max: 1.5
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Intake (grams)'
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

function updateIntakeList() {
    const intakeList = document.getElementById('intakeList');
    intakeList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = intakeEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'intake-entry';

        const ratioStatus = getRatioStatus(entry.ratio);

        entryDiv.innerHTML = `
            <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="metrics">
                <div class="metric">
                    <div class="label">Omega-3</div>
                    <div class="value">${entry.omega3}g</div>
                </div>
                <div class="metric">
                    <div class="label">Omega-6</div>
                    <div class="value">${entry.omega6}g</div>
                </div>
                <div class="metric">
                    <div class="label">Ratio</div>
                    <div class="value ${ratioStatus.class}">${entry.ratioText}</div>
                </div>
            </div>
            <div class="ratio ${ratioStatus.class}">${ratioStatus.status}</div>
            ${entry.sources ? `<div class="sources">${entry.sources}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        intakeList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this intake entry?')) {
        intakeEntries = intakeEntries.filter(entry => entry.id !== id);
        localStorage.setItem('omegaBalanceEntries', JSON.stringify(intakeEntries));
        updateStats();
        updateChart();
        updateIntakeList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    updateStats();
    updateChart();
    updateIntakeList();
});