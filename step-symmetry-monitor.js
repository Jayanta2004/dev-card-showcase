// step-symmetry-monitor.js

let symmetryHistory = JSON.parse(localStorage.getItem('stepSymmetryHistory')) || [];

function calculateSymmetry() {
    const left = parseFloat(document.getElementById('leftSteps').value);
    const right = parseFloat(document.getElementById('rightSteps').value);

    if (isNaN(left) || isNaN(right) || left <= 0 || right <= 0) {
        alert('Please enter valid positive numbers for both left and right steps.');
        return;
    }

    // Calculate symmetry percentage
    const min = Math.min(left, right);
    const max = Math.max(left, right);
    const symmetry = (min / max) * 100;

    // Display result
    const display = document.getElementById('symmetryDisplay');
    const number = document.getElementById('symmetryNumber');
    const label = document.getElementById('symmetryLabel');
    const alertBox = document.getElementById('alertBox');

    number.textContent = symmetry.toFixed(1) + '%';

    let bgColor = '';
    let textLabel = '';

    if (symmetry >= 95) {
        bgColor = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        textLabel = 'Excellent Symmetry';
        alertBox.style.display = 'none';
    } else if (symmetry >= 90) {
        bgColor = 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)';
        textLabel = 'Good Symmetry';
        alertBox.style.display = 'none';
    } else if (symmetry >= 85) {
        bgColor = 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
        textLabel = 'Moderate Asymmetry';
        alertBox.style.display = 'block';
    } else {
        bgColor = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
        textLabel = 'Significant Asymmetry';
        alertBox.style.display = 'block';
    }

    display.style.background = bgColor;
    label.textContent = textLabel;
    display.style.display = 'block';

    // Add to history
    const now = new Date();
    symmetryHistory.push({
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        symmetry: symmetry,
        left: left,
        right: right
    });

    // Keep only last 30 entries
    if (symmetryHistory.length > 30) {
        symmetryHistory = symmetryHistory.slice(-30);
    }

    localStorage.setItem('stepSymmetryHistory', JSON.stringify(symmetryHistory));

    updateHistoryChart();
}

function updateHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');

    const labels = symmetryHistory.map(entry => entry.date + ' ' + entry.time);
    const data = symmetryHistory.map(entry => entry.symmetry);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Step Symmetry (%)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Step Symmetry History'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Symmetry (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date/Time'
                    }
                }
            }
        }
    });
}

// Load history on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHistoryChart();
});