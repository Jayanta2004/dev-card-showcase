document.addEventListener('DOMContentLoaded', function() {
    const thyroidForm = document.getElementById('thyroidForm');
    const resultsTable = document.getElementById('resultsTable');
    const avgTSHEl = document.getElementById('avgTSH');
    const avgT3El = document.getElementById('avgT3');
    const avgT4El = document.getElementById('avgT4');
    const totalTestsEl = document.getElementById('totalTests');
    const thyroidChartCanvas = document.getElementById('thyroidChart');

    let results = JSON.parse(localStorage.getItem('thyroidResults')) || [];
    let chart;

    // Normal ranges
    const RANGES = {
        TSH: { min: 0.4, max: 4.0 },
        T3: { min: 80, max: 200 },
        T4: { min: 0.8, max: 1.8 }
    };

    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    function saveResults() {
        localStorage.setItem('thyroidResults', JSON.stringify(results));
    }

    function isInRange(value, hormone) {
        const range = RANGES[hormone];
        return value >= range.min && value <= range.max;
    }

    function getResultClass(result) {
        const hormones = ['TSH', 'T3', 'T4'];
        const outOfRange = hormones.filter(h => !isInRange(result[h.toLowerCase()], h)).length;

        if (outOfRange === 0) return 'normal-range';
        if (outOfRange === 1) return 'borderline';
        return 'abnormal';
    }

    function calculateStats() {
        if (results.length === 0) {
            avgTSHEl.textContent = '-- mIU/L';
            avgT3El.textContent = '-- ng/dL';
            avgT4El.textContent = '-- ng/dL';
            totalTestsEl.textContent = '--';
            return;
        }

        const totalTSH = results.reduce((sum, result) => sum + result.tsh, 0);
        const totalT3 = results.reduce((sum, result) => sum + result.t3, 0);
        const totalT4 = results.reduce((sum, result) => sum + result.t4, 0);

        const avgTSH = (totalTSH / results.length).toFixed(2);
        const avgT3 = (totalT3 / results.length).toFixed(1);
        const avgT4 = (totalT4 / results.length).toFixed(2);

        avgTSHEl.textContent = `${avgTSH} mIU/L`;
        avgT3El.textContent = `${avgT3} ng/dL`;
        avgT4El.textContent = `${avgT4} ng/dL`;
        totalTestsEl.textContent = results.length;
    }

    function renderResultsTable() {
        if (results.length === 0) {
            resultsTable.innerHTML = '<p>No lab results logged yet. Start tracking your thyroid levels!</p>';
            return;
        }

        // Sort results by date (newest first)
        results.sort((a, b) => new Date(b.date) - new Date(a.date));

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>TSH (mIU/L)</th>
                    <th>T3 (ng/dL)</th>
                    <th>T4 (ng/dL)</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${results.map((result, index) => `
                    <tr class="${getResultClass(result)}">
                        <td>${new Date(result.date).toLocaleDateString()}</td>
                        <td class="hormone-level tsh-level">${result.tsh}</td>
                        <td class="hormone-level t3-level">${result.t3}</td>
                        <td class="hormone-level t4-level">${result.t4}</td>
                        <td>${result.notes || '-'}</td>
                        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        resultsTable.innerHTML = '';
        resultsTable.appendChild(table);

        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm('Are you sure you want to delete this lab result?')) {
                    results.splice(index, 1);
                    saveResults();
                    renderResultsTable();
                    calculateStats();
                    updateChart();
                }
            });
        });
    }

    function updateChart() {
        if (results.length === 0) {
            if (chart) chart.destroy();
            return;
        }

        // Sort results by date for chart
        const sortedResults = [...results].sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = sortedResults.map(result => new Date(result.date).toLocaleDateString());
        const tshData = sortedResults.map(result => result.tsh);
        const t3Data = sortedResults.map(result => result.t3);
        const t4Data = sortedResults.map(result => result.t4);

        if (chart) chart.destroy();

        chart = new Chart(thyroidChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'TSH (mIU/L)',
                    data: tshData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.1,
                    yAxisID: 'y'
                }, {
                    label: 'T3 (ng/dL)',
                    data: t3Data,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.1,
                    yAxisID: 'y1'
                }, {
                    label: 'T4 (ng/dL)',
                    data: t4Data,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    tension: 0.1,
                    yAxisID: 'y1'
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
                            text: 'TSH (mIU/L)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'T3/T4 (ng/dL)'
                        },
                        grid: {
                            drawOnChartArea: false,
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
                        radius: 4
                    }
                }
            }
        });
    }

    thyroidForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const tsh = parseFloat(document.getElementById('tsh').value);
        const t3 = parseFloat(document.getElementById('t3').value);
        const t4 = parseFloat(document.getElementById('t4').value);
        const notes = document.getElementById('notes').value.trim();

        const newResult = {
            date,
            tsh,
            t3,
            t4,
            notes: notes || null
        };

        results.push(newResult);
        saveResults();

        // Reset form
        thyroidForm.reset();
        document.getElementById('date').valueAsDate = new Date();

        // Update UI
        calculateStats();
        renderResultsTable();
        updateChart();
    });

    // Initial render
    calculateStats();
    renderResultsTable();
    updateChart();
});