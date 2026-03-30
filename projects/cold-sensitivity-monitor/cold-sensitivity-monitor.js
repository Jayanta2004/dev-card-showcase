// cold-sensitivity-monitor.js

let exposures = JSON.parse(localStorage.getItem('coldExposures')) || [];

function logExposure() {
    const temperature = parseFloat(document.getElementById('temperature').value);
    const duration = parseInt(document.getElementById('duration').value);
    const discomfort = parseInt(document.getElementById('discomfort').value);
    const notes = document.getElementById('notes').value.trim();

    if (isNaN(temperature) || isNaN(duration) || isNaN(discomfort) || discomfort < 1 || discomfort > 10) {
        alert('Please fill in all required fields with valid values.');
        return;
    }

    const exposure = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        temperature,
        duration,
        discomfort,
        notes
    };

    exposures.push(exposure);

    // Keep only last 50 exposures
    if (exposures.length > 50) {
        exposures = exposures.slice(-50);
    }

    localStorage.setItem('coldExposures', JSON.stringify(exposures));

    // Clear form
    document.getElementById('temperature').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('discomfort').value = '5';
    document.getElementById('notes').value = '';

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (exposures.length === 0) {
        document.getElementById('avgDiscomfort').textContent = '0/10';
        document.getElementById('lowestTemp').textContent = '--°C';
        document.getElementById('totalExposures').textContent = '0';
        return;
    }

    const discomforts = exposures.map(e => e.discomfort);
    const avgDiscomfort = (discomforts.reduce((a, b) => a + b, 0) / discomforts.length).toFixed(1);
    const lowestTemp = Math.min(...exposures.map(e => e.temperature));

    document.getElementById('avgDiscomfort').textContent = `${avgDiscomfort}/10`;
    document.getElementById('lowestTemp').textContent = `${lowestTemp}°C`;
    document.getElementById('totalExposures').textContent = exposures.length;
}

function updateChart() {
    const ctx = document.getElementById('coldChart').getContext('2d');

    // Sort exposures by date
    const sortedExposures = exposures.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedExposures.map(e => e.date);
    const discomfortData = sortedExposures.map(e => e.discomfort);
    const tempData = sortedExposures.map(e => e.temperature);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Discomfort Level',
                data: discomfortData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Temperature (°C)',
                data: tempData,
                borderColor: '#17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Cold Exposure Trends'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Discomfort Level (1-10)'
                    },
                    min: 0,
                    max: 10
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    grid: {
                        drawOnChartArea: false,
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
}

function updateHistory() {
    const history = document.getElementById('exposuresHistory');
    history.innerHTML = '';

    // Show last 10 exposures
    const recentExposures = exposures.slice(-10).reverse();

    recentExposures.forEach(exposure => {
        const item = document.createElement('div');
        item.className = 'exposure-entry';

        item.innerHTML = `
            <h4>${exposure.date} ${exposure.time}</h4>
            <p><strong>Temperature:</strong> <span class="temperature">${exposure.temperature}°C</span></p>
            <p><strong>Duration:</strong> <span class="duration">${exposure.duration} minutes</span></p>
            <p><strong>Discomfort:</strong> <span class="discomfort">${exposure.discomfort}/10</span></p>
            ${exposure.notes ? `<p><strong>Notes:</strong> ${exposure.notes}</p>` : ''}
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateHistory();
});