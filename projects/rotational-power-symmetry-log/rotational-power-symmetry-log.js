// rotational-power-symmetry-log.js

let assessments = JSON.parse(localStorage.getItem('rotationalAssessments')) || [];
let currentAssessment = null;
let currentMovement = 'medicine-ball';

const movementData = {
    'medicine-ball': {
        name: 'Medicine Ball Throw',
        description: 'Stand sideways to a wall, rotate and throw medicine ball with maximum force.',
        instructions: 'Measure distance thrown or use a force plate for accurate power measurement.',
        unit: 'distance (feet/lbs)'
    },
    'cable-rotation': {
        name: 'Cable Rotation',
        description: 'Perform rotational chop or lift using cable machine at chest height.',
        instructions: 'Use maximum weight possible while maintaining proper form.',
        unit: 'weight (lbs)'
    },
    'woodchopper': {
        name: 'Woodchopper',
        description: 'Rotational exercise mimicking chopping wood, can be done with cable or medicine ball.',
        instructions: 'Focus on explosive rotation while maintaining core stability.',
        unit: 'weight/distance'
    },
    'rotational-press': {
        name: 'Rotational Press',
        description: 'Landmine press or rotational dumbbell press combining vertical and horizontal movement.',
        instructions: 'Press weight while rotating torso for maximum power transfer.',
        unit: 'weight (lbs)'
    }
};

function selectMovement(movement) {
    currentMovement = movement;

    // Update button states
    document.querySelectorAll('.movement-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    loadAssessmentContent(movement);
}

function loadAssessmentContent(movement) {
    const data = movementData[movement];
    const contentDiv = document.getElementById('assessmentContent');

    contentDiv.innerHTML = `
        <div class="assessment-content">
            <h3>${data.name}</h3>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Instructions:</strong> ${data.instructions}</p>
            <p><strong>Unit:</strong> ${data.unit}</p>

            <div class="power-inputs">
                <div class="power-input-group">
                    <label for="leftPower">Left Side Power</label>
                    <input type="number" id="leftPower" placeholder="Enter value" step="0.1">
                </div>
                <div class="power-input-group">
                    <label for="rightPower">Right Side Power</label>
                    <input type="number" id="rightPower" placeholder="Enter value" step="0.1">
                </div>
            </div>

            <div class="symmetry-display">
                <h4>Power Symmetry</h4>
                <div class="symmetry-percentage" id="symmetryPercentage">--%</div>
                <div class="symmetry-status" id="symmetryStatus">Enter values to calculate</div>
            </div>
        </div>
    `;

    // Add input listeners for real-time calculation
    document.getElementById('leftPower').addEventListener('input', calculateSymmetry);
    document.getElementById('rightPower').addEventListener('input', calculateSymmetry);
}

function calculateSymmetry() {
    const leftPower = parseFloat(document.getElementById('leftPower').value) || 0;
    const rightPower = parseFloat(document.getElementById('rightPower').value) || 0;

    if (leftPower === 0 && rightPower === 0) {
        document.getElementById('symmetryPercentage').textContent = '--%';
        document.getElementById('symmetryStatus').textContent = 'Enter values to calculate';
        document.getElementById('symmetryStatus').className = 'symmetry-status';
        return;
    }

    // Calculate symmetry as percentage (lower value / higher value * 100)
    const higher = Math.max(leftPower, rightPower);
    const lower = Math.min(leftPower, rightPower);
    const symmetry = higher > 0 ? Math.round((lower / higher) * 100) : 0;

    document.getElementById('symmetryPercentage').textContent = `${symmetry}%`;

    // Update status based on symmetry percentage
    const statusElement = document.getElementById('symmetryStatus');
    statusElement.className = 'symmetry-status';

    if (symmetry >= 90) {
        statusElement.classList.add('excellent');
        statusElement.textContent = 'Excellent Symmetry';
    } else if (symmetry >= 80) {
        statusElement.classList.add('good');
        statusElement.textContent = 'Good Symmetry';
    } else if (symmetry >= 70) {
        statusElement.classList.add('fair');
        statusElement.textContent = 'Fair Symmetry';
    } else {
        statusElement.classList.add('poor');
        statusElement.textContent = 'Poor Symmetry - Needs Attention';
    }
}

function startAssessment() {
    const leftPower = parseFloat(document.getElementById('leftPower').value);
    const rightPower = parseFloat(document.getElementById('rightPower').value);

    if (!leftPower || !rightPower) {
        alert('Please enter power values for both sides.');
        return;
    }

    currentAssessment = {
        id: Date.now(),
        movement: currentMovement,
        leftPower: leftPower,
        rightPower: rightPower,
        symmetry: calculateSymmetryValue(leftPower, rightPower),
        date: new Date().toISOString(),
        notes: ''
    };

    document.getElementById('startAssessmentBtn').disabled = true;
    document.getElementById('saveAssessmentBtn').disabled = false;

    // Add notes input
    const contentDiv = document.getElementById('assessmentContent');
    contentDiv.innerHTML += `
        <div class="notes-input" style="margin-top: 20px;">
            <label for="assessmentNotes" style="display: block; margin-bottom: 10px; font-weight: bold;">Notes/Observations:</label>
            <textarea id="assessmentNotes" placeholder="Any observations about form, discomfort, or improvements needed?" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; resize: vertical; min-height: 80px;"></textarea>
        </div>
    `;
}

function calculateSymmetryValue(left, right) {
    const higher = Math.max(left, right);
    const lower = Math.min(left, right);
    return higher > 0 ? Math.round((lower / higher) * 100) : 0;
}

function saveAssessment() {
    if (!currentAssessment) return;

    const notes = document.getElementById('assessmentNotes').value.trim();
    currentAssessment.notes = notes;

    assessments.push(currentAssessment);

    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }

    localStorage.setItem('rotationalAssessments', JSON.stringify(assessments));

    // Reset UI
    document.getElementById('startAssessmentBtn').disabled = false;
    document.getElementById('saveAssessmentBtn').disabled = true;
    document.getElementById('leftPower').value = '';
    document.getElementById('rightPower').value = '';
    calculateSymmetry();

    currentAssessment = null;

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgSymmetry').textContent = '0%';
        document.getElementById('powerImbalance').textContent = '0%';
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('improvementRate').textContent = '0%';
        return;
    }

    const symmetries = assessments.map(a => a.symmetry);
    const avgSymmetry = Math.round(symmetries.reduce((a, b) => a + b, 0) / symmetries.length);

    // Calculate average power imbalance
    const imbalances = assessments.map(a => Math.abs(a.leftPower - a.rightPower) / Math.max(a.leftPower, a.rightPower));
    const avgImbalance = Math.round(imbalances.reduce((a, b) => a + b, 0) / imbalances.length * 100);

    // Calculate improvement rate (comparing first half vs second half)
    let improvementRate = 0;
    if (assessments.length >= 6) {
        const midPoint = Math.floor(assessments.length / 2);
        const firstHalf = assessments.slice(0, midPoint).map(a => a.symmetry);
        const secondHalf = assessments.slice(midPoint).map(a => a.symmetry);

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        improvementRate = Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
    }

    document.getElementById('avgSymmetry').textContent = `${avgSymmetry}%`;
    document.getElementById('powerImbalance').textContent = `${avgImbalance}%`;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('improvementRate').textContent = `${improvementRate > 0 ? '+' : ''}${improvementRate}%`;
}

function updateChart() {
    const ctx = document.getElementById('symmetryChart').getContext('2d');

    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const symmetryData = sortedAssessments.map(a => a.symmetry);
    const leftPowerData = sortedAssessments.map(a => a.leftPower);
    const rightPowerData = sortedAssessments.map(a => a.rightPower);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Symmetry %',
                data: symmetryData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Left Power',
                data: leftPowerData,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }, {
                label: 'Right Power',
                data: rightPowerData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Rotational Power Symmetry Trends'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Symmetry %'
                    },
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Power Output'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

function updateHistory() {
    const history = document.getElementById('assessmentHistory');
    history.innerHTML = '';

    // Show last 10 assessments
    const recentAssessments = assessments.slice(-10).reverse();

    recentAssessments.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'assessment-entry';

        const date = new Date(assessment.date).toLocaleString();
        const movementName = movementData[assessment.movement].name;

        item.innerHTML = `
            <h4>${movementName} - ${date}</h4>
            <p><strong>Symmetry:</strong> <span class="symmetry">${assessment.symmetry}%</span></p>
            <p><strong>Left Power:</strong> <span class="power-left">${assessment.leftPower}</span> | <strong>Right Power:</strong> <span class="power-right">${assessment.rightPower}</span></p>
            ${assessment.notes ? `<p><strong>Notes:</strong> ${assessment.notes}</p>` : ''}
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAssessmentContent('medicine-ball');
    updateStats();
    updateChart();
    updateHistory();
});