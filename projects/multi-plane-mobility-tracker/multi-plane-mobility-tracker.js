// multi-plane-mobility-tracker.js

let assessments = JSON.parse(localStorage.getItem('mobilityAssessments')) || [];
let currentAssessment = null;
let currentPlane = 'sagittal';

const planeData = {
    sagittal: {
        name: 'Sagittal Plane',
        description: 'Forward and backward movements',
        movements: [
            {
                name: 'Shoulder Flexion',
                description: 'Raise arms forward overhead',
                normalRange: '0-180°',
                test: 'Stand with arms at sides, raise both arms forward and up'
            },
            {
                name: 'Shoulder Extension',
                description: 'Move arms backward behind body',
                normalRange: '0-60°',
                test: 'From standing, move both arms backward'
            },
            {
                name: 'Hip Flexion',
                description: 'Bring knee toward chest',
                normalRange: '0-120°',
                test: 'Stand and lift one knee toward chest while keeping back straight'
            },
            {
                name: 'Hip Extension',
                description: 'Move leg backward',
                normalRange: '0-30°',
                test: 'Stand and move one leg backward while keeping back straight'
            },
            {
                name: 'Knee Flexion',
                description: 'Bend knee',
                normalRange: '0-140°',
                test: 'From standing, bend one knee bringing heel toward buttocks'
            },
            {
                name: 'Ankle Dorsiflexion',
                description: 'Pull toes upward',
                normalRange: '0-20°',
                test: 'Stand and lift toes upward toward shins'
            }
        ]
    },
    frontal: {
        name: 'Frontal Plane',
        description: 'Side-to-side movements',
        movements: [
            {
                name: 'Shoulder Abduction',
                description: 'Raise arms out to sides',
                normalRange: '0-180°',
                test: 'Stand with arms at sides, raise both arms out to sides'
            },
            {
                name: 'Shoulder Adduction',
                description: 'Bring arms across body',
                normalRange: '0-50°',
                test: 'From arms out to sides, bring them across chest'
            },
            {
                name: 'Hip Abduction',
                description: 'Move leg away from midline',
                normalRange: '0-45°',
                test: 'Stand and move one leg out to side while keeping it straight'
            },
            {
                name: 'Hip Adduction',
                description: 'Bring legs together',
                normalRange: '0-30°',
                test: 'From legs apart, bring one leg across midline'
            },
            {
                name: 'Lateral Neck Flexion',
                description: 'Tilt head side to side',
                normalRange: '0-45°',
                test: 'Stand and tilt head toward each shoulder'
            },
            {
                name: 'Spinal Lateral Flexion',
                description: 'Side bend at waist',
                normalRange: '0-35°',
                test: 'Stand and bend sideways at waist'
            }
        ]
    },
    transverse: {
        name: 'Transverse Plane',
        description: 'Rotational movements',
        movements: [
            {
                name: 'Shoulder Internal Rotation',
                description: 'Rotate arm inward',
                normalRange: '0-70°',
                test: 'With arm at 90° abduction, rotate arm inward'
            },
            {
                name: 'Shoulder External Rotation',
                description: 'Rotate arm outward',
                normalRange: '0-90°',
                test: 'With arm at 90° abduction, rotate arm outward'
            },
            {
                name: 'Hip Internal Rotation',
                description: 'Rotate leg inward',
                normalRange: '0-45°',
                test: 'With knee bent 90°, rotate leg inward'
            },
            {
                name: 'Hip External Rotation',
                description: 'Rotate leg outward',
                normalRange: '0-60°',
                test: 'With knee bent 90°, rotate leg outward'
            },
            {
                name: 'Thoracic Rotation',
                description: 'Twist upper body',
                normalRange: '0-35°',
                test: 'Stand and rotate upper body left and right'
            },
            {
                name: 'Cervical Rotation',
                description: 'Turn head side to side',
                normalRange: '0-80°',
                test: 'Stand and turn head left and right'
            }
        ]
    }
};

function selectPlane(plane) {
    currentPlane = plane;

    // Update button states
    document.querySelectorAll('.plane-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="selectPlane('${plane}')"]`).classList.add('active');

    // Load plane content
    loadPlaneContent(plane);
}

function loadPlaneContent(plane) {
    const content = document.getElementById('assessmentContent');
    const planeInfo = planeData[plane];

    let html = `
        <div class="plane-assessment active" id="${plane}Assessment">
            <h3>${planeInfo.name}</h3>
            <p><em>${planeInfo.description}</em></p>
    `;

    planeInfo.movements.forEach((movement, index) => {
        html += `
            <div class="movement-item">
                <h4>${movement.name}</h4>
                <p><strong>Description:</strong> ${movement.description}</p>
                <p><strong>Test:</strong> ${movement.test}</p>
                <p><strong>Normal Range:</strong> ${movement.normalRange}</p>

                <div class="range-input">
                    <label>Range of Motion (degrees):</label>
                    <input type="range" id="${plane}_${index}_range" min="0" max="180" value="90" step="5">
                    <span id="${plane}_${index}_rangeValue">90</span>°
                </div>

                <div class="pain-scale">
                    <label for="${plane}_${index}_pain">Pain/Symptoms (0-10):</label>
                    <input type="range" id="${plane}_${index}_pain" min="0" max="10" value="0">
                    <span id="${plane}_${index}_painValue">0</span>
                </div>
            </div>
        `;
    });

    html += `
            <div class="movement-item">
                <h4>Overall Notes</h4>
                <textarea id="${plane}_notes" placeholder="Any additional observations, limitations, or symptoms for this plane of movement..." rows="3"></textarea>
            </div>
        </div>
    `;

    content.innerHTML = html;

    // Add event listeners for range inputs
    planeInfo.movements.forEach((movement, index) => {
        const rangeInput = document.getElementById(`${plane}_${index}_range`);
        const rangeValue = document.getElementById(`${plane}_${index}_rangeValue`);
        const painInput = document.getElementById(`${plane}_${index}_pain`);
        const painValue = document.getElementById(`${plane}_${index}_painValue`);

        rangeInput.addEventListener('input', function() {
            rangeValue.textContent = this.value;
        });

        painInput.addEventListener('input', function() {
            painValue.textContent = this.value;
        });
    });
}

function startAssessment() {
    currentAssessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        planes: {}
    };

    document.getElementById('startAssessmentBtn').disabled = true;
    document.getElementById('saveAssessmentBtn').disabled = false;

    // Initialize all planes
    Object.keys(planeData).forEach(plane => {
        currentAssessment.planes[plane] = {
            movements: [],
            notes: '',
            score: 0
        };
    });
}

function saveAssessment() {
    if (!currentAssessment) return;

    // Collect data from all planes
    Object.keys(planeData).forEach(plane => {
        const planeAssessment = currentAssessment.planes[plane];
        const movements = planeData[plane].movements;

        movements.forEach((movement, index) => {
            const range = parseInt(document.getElementById(`${plane}_${index}_range`).value);
            const pain = parseInt(document.getElementById(`${plane}_${index}_pain`).value);

            planeAssessment.movements.push({
                name: movement.name,
                range: range,
                pain: pain,
                normalRange: movement.normalRange
            });
        });

        const notesElement = document.getElementById(`${plane}_notes`);
        planeAssessment.notes = notesElement ? notesElement.value : '';

        // Calculate plane score (average range minus pain penalty)
        const avgRange = planeAssessment.movements.reduce((sum, m) => sum + m.range, 0) / movements.length;
        const avgPain = planeAssessment.movements.reduce((sum, m) => sum + m.pain, 0) / movements.length;
        planeAssessment.score = Math.max(0, Math.min(100, avgRange - (avgPain * 5)));
    });

    // Calculate overall score
    const planeScores = Object.values(currentAssessment.planes).map(p => p.score);
    currentAssessment.overallScore = planeScores.reduce((sum, score) => sum + score, 0) / planeScores.length;

    assessments.push(currentAssessment);

    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }

    localStorage.setItem('mobilityAssessments', JSON.stringify(assessments));

    // Reset UI
    document.getElementById('startAssessmentBtn').disabled = false;
    document.getElementById('saveAssessmentBtn').disabled = true;
    currentAssessment = null;

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgMobility').textContent = '0/100';
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('improvementTrend').textContent = '0%';
        document.getElementById('bestScore').textContent = '0/100';
        return;
    }

    const scores = assessments.map(a => a.overallScore);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.round(Math.max(...scores));

    document.getElementById('avgMobility').textContent = `${avg}/100`;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('bestScore').textContent = `${best}/100`;

    // Calculate improvement trend
    if (assessments.length >= 5) {
        const recent = assessments.slice(-5).map(a => a.overallScore);
        const earlier = assessments.slice(-10, -5).map(a => a.overallScore);

        if (earlier.length > 0) {
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
            const improvement = Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100);
            document.getElementById('improvementTrend').textContent = `${improvement > 0 ? '+' : ''}${improvement}%`;
        }
    }
}

function updateChart() {
    const ctx = document.getElementById('mobilityChart').getContext('2d');

    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const overallScores = sortedAssessments.map(a => Math.round(a.overallScore));
    const sagittalScores = sortedAssessments.map(a => Math.round(a.planes.sagittal?.score || 0));
    const frontalScores = sortedAssessments.map(a => Math.round(a.planes.frontal?.score || 0));
    const transverseScores = sortedAssessments.map(a => Math.round(a.planes.transverse?.score || 0));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Overall Mobility',
                data: overallScores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Sagittal Plane',
                data: sagittalScores,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: false,
                tension: 0.4
            }, {
                label: 'Frontal Plane',
                data: frontalScores,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: false,
                tension: 0.4
            }, {
                label: 'Transverse Plane',
                data: transverseScores,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Multi-Plane Mobility Progress'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Mobility Score'
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
    const history = document.getElementById('assessmentsHistory');
    history.innerHTML = '';

    // Show last 10 assessments
    const recentAssessments = assessments.slice(-10).reverse();

    recentAssessments.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'assessment-entry';

        const date = new Date(assessment.date).toLocaleString();
        const overallScore = Math.round(assessment.overallScore);

        item.innerHTML = `
            <h4>${date}</h4>
            <p><strong>Overall Score:</strong> <span class="score">${overallScore}/100</span></p>
            <div class="plane-scores">
                <span class="plane-score sagittal">Sagittal: ${Math.round(assessment.planes.sagittal?.score || 0)}/100</span>
                <span class="plane-score frontal">Frontal: ${Math.round(assessment.planes.frontal?.score || 0)}/100</span>
                <span class="plane-score transverse">Transverse: ${Math.round(assessment.planes.transverse?.score || 0)}/100</span>
            </div>
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    selectPlane('sagittal'); // Start with sagittal plane
    updateStats();
    updateChart();
    updateHistory();
});