document.addEventListener('DOMContentLoaded', function() {
    const runForm = document.getElementById('runForm');
    const runsTable = document.getElementById('runsTable');
    const avgCadenceEl = document.getElementById('avgCadence');
    const bestCadenceEl = document.getElementById('bestCadence');
    const totalRunsEl = document.getElementById('totalRuns');
    const totalDistanceEl = document.getElementById('totalDistance');
    const cadenceChartCanvas = document.getElementById('cadenceChart');

    let runs = JSON.parse(localStorage.getItem('runningCadenceRuns')) || [];
    let chart;

    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    function saveRuns() {
        localStorage.setItem('runningCadenceRuns', JSON.stringify(runs));
    }

    function calculateStats() {
        if (runs.length === 0) {
            avgCadenceEl.textContent = '-- spm';
            bestCadenceEl.textContent = '-- spm';
            totalRunsEl.textContent = '--';
            totalDistanceEl.textContent = '-- km';
            return;
        }

        const totalCadence = runs.reduce((sum, run) => sum + run.cadence, 0);
        const avgCadence = Math.round(totalCadence / runs.length);
        const bestCadence = Math.max(...runs.map(run => run.cadence));
        const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);

        avgCadenceEl.textContent = `${avgCadence} spm`;
        bestCadenceEl.textContent = `${bestCadence} spm`;
        totalRunsEl.textContent = runs.length;
        totalDistanceEl.textContent = `${totalDistance.toFixed(2)} km`;
    }

    function getCadenceClass(cadence) {
        if (cadence >= 170 && cadence <= 190) return 'optimal-range';
        if (cadence >= 160 && cadence < 170) return 'suboptimal';
        return 'poor';
    }

    function renderRunsTable() {
        if (runs.length === 0) {
            runsTable.innerHTML = '<p>No runs logged yet. Start tracking your cadence!</p>';
            return;
        }

        // Sort runs by date (newest first)
        runs.sort((a, b) => new Date(b.date) - new Date(a.date));

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Distance (km)</th>
                    <th>Time (min)</th>
                    <th>Cadence (spm)</th>
                    <th>Pace (min/km)</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${runs.map((run, index) => `
                    <tr class="${getCadenceClass(run.cadence)}">
                        <td>${new Date(run.date).toLocaleDateString()}</td>
                        <td>${run.distance}</td>
                        <td>${run.time}</td>
                        <td>${run.cadence}</td>
                        <td>${(run.time / run.distance).toFixed(2)}</td>
                        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        runsTable.innerHTML = '';
        runsTable.appendChild(table);

        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm('Are you sure you want to delete this run?')) {
                    runs.splice(index, 1);
                    saveRuns();
                    renderRunsTable();
                    calculateStats();
                    updateChart();
                }
            });
        });
    }

    function updateChart() {
        if (runs.length === 0) {
            if (chart) chart.destroy();
            return;
        }

        // Sort runs by date for chart
        const sortedRuns = [...runs].sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = sortedRuns.map(run => new Date(run.date).toLocaleDateString());
        const cadences = sortedRuns.map(run => run.cadence);

        if (chart) chart.destroy();

        chart = new Chart(cadenceChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cadence (steps/min)',
                    data: cadences,
                    borderColor: '#4fd1ff',
                    backgroundColor: 'rgba(79, 209, 255, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 140,
                        max: 200,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                elements: {
                    point: {
                        backgroundColor: '#4fd1ff'
                    }
                }
            }
        });
    }

    runForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const distance = parseFloat(document.getElementById('distance').value);
        const time = parseFloat(document.getElementById('time').value);
        const cadence = parseInt(document.getElementById('cadence').value);

        const newRun = {
            date,
            distance,
            time,
            cadence
        };

        runs.push(newRun);
        saveRuns();

        // Reset form
        runForm.reset();
        document.getElementById('date').valueAsDate = new Date();

        // Update UI
        calculateStats();
        renderRunsTable();
        updateChart();
    });

    // Initial render
    calculateStats();
    renderRunsTable();
    updateChart();
});