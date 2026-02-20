// thoracic-mobility-progress-tracker.js

let assessmentEntries = JSON.parse(localStorage.getItem('thoracicMobilityEntries')) || [];

function logAssessment() {
    const date = document.getElementById('assessmentDate').value;
    const rotationLeft = parseFloat(document.getElementById('rotationLeft').value) || 0;
    const rotationRight = parseFloat(document.getElementById('rotationRight').value) || 0;
    const extension = parseFloat(document.getElementById('extension').value) || 0;
    const flexion = parseFloat(document.getElementById('flexion').value) || 0;
    const sideBendLeft = parseFloat(document.getElementById('sideBendLeft').value) || 0;
    const sideBendRight = parseFloat(document.getElementById('sideBendRight').value) || 0;
    const notes = document.getElementById('assessmentNotes').value.trim();

    if (!date) {
        alert('Please select a date.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = assessmentEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        assessmentEntries = assessmentEntries.filter(entry => entry.date !== date);
    }

    // Calculate composite mobility score (0-100)
    // Normalize each measurement to 0-25 points (25 points each for 4 categories)
    const rotationScore = Math.min((rotationLeft + rotationRight) / 90 * 25, 25); // Max expected: 90°
    const extensionScore = Math.min(extension / 35 * 25, 25); // Max expected: 35°
    const flexionScore = Math.min(flexion / 40 * 25, 25); // Max expected: 40°
    const sideBendScore = Math.min((sideBendLeft + sideBendRight) / 50 * 25, 25); // Max expected: 50°

    const compositeScore = Math.round(rotationScore + extensionScore + flexionScore + sideBendScore);

    const entry = {
        id: Date.now(),
        date,
        measurements: {
            rotationLeft,
            rotationRight,
            extension,
            flexion,
            sideBendLeft,
            sideBendRight
        },
        compositeScore,
        notes
    };

    assessmentEntries.push(entry);

    // Sort by date
    assessmentEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (assessmentEntries.length > 50) {
        assessmentEntries = assessmentEntries.slice(-50);
    }

    localStorage.setItem('thoracicMobilityEntries', JSON.stringify(assessmentEntries));

    // Clear form
    document.getElementById('assessmentDate').value = '';
    document.getElementById('rotationLeft').value = '';
    document.getElementById('rotationRight').value = '';
    document.getElementById('extension').value = '';
    document.getElementById('flexion').value = '';
    document.getElementById('sideBendLeft').value = '';
    document.getElementById('sideBendRight').value = '';
    document.getElementById('assessmentNotes').value = '';

    updateStats();
    updateChart();
    updateRecommendations();
    updateAssessmentList();
}

function getMobilityLevel(score) {
    if (score >= 80) return { level: 'Excellent', class: 'mobility-excellent' };
    if (score >= 60) return { level: 'Good', class: 'mobility-good' };
    if (score >= 40) return { level: 'Fair', class: 'mobility-fair' };
    return { level: 'Poor', class: 'mobility-poor' };
}

function updateStats() {
    const totalAssessments = assessmentEntries.length;

    if (totalAssessments === 0) {
        document.getElementById('currentScore').textContent = '0';
        document.getElementById('totalRotation').textContent = '0°';
        document.getElementById('mobilityLevel').textContent = 'Unknown';
        document.getElementById('mobilityLevel').className = 'stat-value';
        return;
    }

    // Current composite score (latest entry)
    const latestEntry = assessmentEntries[assessmentEntries.length - 1];
    const currentScore = latestEntry.compositeScore;

    // Total rotation (latest)
    const totalRotation = latestEntry.measurements.rotationLeft + latestEntry.measurements.rotationRight;

    // Mobility level
    const mobilityLevel = getMobilityLevel(currentScore);
    const levelElement = document.getElementById('mobilityLevel');
    levelElement.textContent = mobilityLevel.level;
    levelElement.className = `stat-value ${mobilityLevel.class}`;

    document.getElementById('currentScore').textContent = currentScore;
    document.getElementById('totalRotation').textContent = `${totalRotation}°`;
}

function updateChart() {
    const ctx = document.getElementById('mobilityChart').getContext('2d');

    // Prepare data for last 20 assessments
    const chartEntries = assessmentEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const scores = chartEntries.map(entry => entry.compositeScore);
    const rotations = chartEntries.map(entry => entry.measurements.rotationLeft + entry.measurements.rotationRight);
    const extensions = chartEntries.map(entry => entry.measurements.extension);
    const flexions = chartEntries.map(entry => entry.measurements.flexion);

    // Reference lines
    const excellentLine = new Array(scores.length).fill(80);
    const goodLine = new Array(scores.length).fill(60);
    const fairLine = new Array(scores.length).fill(40);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Composite Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Total Rotation (°)',
                data: rotations,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Extension (°)',
                data: extensions,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Flexion (°)',
                data: flexions,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Excellent (80+)',
                data: excellentLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Good (60-79)',
                data: goodLine,
                borderColor: '#ffc107',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Fair (40-59)',
                data: fairLine,
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
                        text: 'Composite Score (0-100)'
                    },
                    min: 0,
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Degrees (°)'
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

function updateRecommendations() {
    const recommendationsDiv = document.getElementById('recommendations');

    if (assessmentEntries.length < 2) {
        recommendationsDiv.innerHTML = '<p>Log at least 2 assessments to get personalized recommendations for improving thoracic mobility.</p>';
        return;
    }

    const latestEntry = assessmentEntries[assessmentEntries.length - 1];
    const measurements = latestEntry.measurements;

    let recommendations = '<p>Based on your latest assessment:</p><ul>';

    // Rotation recommendations
    const totalRotation = measurements.rotationLeft + measurements.rotationRight;
    if (totalRotation < 60) {
        recommendations += '<li>Rotation is limited - try thoracic rotation stretches and foam rolling.</li>';
    } else if (Math.abs(measurements.rotationLeft - measurements.rotationRight) > 10) {
        recommendations += '<li>Rotation asymmetry detected - focus on balancing left/right thoracic mobility.</li>';
    }

    // Extension recommendations
    if (measurements.extension < 20) {
        recommendations += '<li>Extension is restricted - practice cobra pose, child\'s pose, and backbends.</li>';
    }

    // Flexion recommendations
    if (measurements.flexion < 25) {
        recommendations += '<li>Flexion is limited - work on forward folds and spinal flexion exercises.</li>';
    }

    // Side bending recommendations
    const totalSideBend = measurements.sideBendLeft + measurements.sideBendRight;
    if (totalSideBend < 30) {
        recommendations += '<li>Side bending is restricted - incorporate side bend stretches and lateral flexion exercises.</li>';
    }

    // General recommendations
    recommendations += '<li>Consider thoracic mobility exercises 3-4 times per week for best results.</li>';
    recommendations += '<li>Combine mobility work with strength training to maintain improvements.</li>';

    // Progress check
    if (assessmentEntries.length >= 3) {
        const recentScores = assessmentEntries.slice(-3).map(e => e.compositeScore);
        const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const avgEarlier = assessmentEntries.slice(-6, -3).map(e => e.compositeScore).reduce((a, b) => a + b, 0) / 3 || avgRecent;

        if (avgRecent > avgEarlier + 5) {
            recommendations += '<li>Great progress! Keep up the consistent mobility work.</li>';
        } else if (avgRecent < avgEarlier - 5) {
            recommendations += '<li>Mobility has decreased - review your routine and consider professional assessment.</li>';
        }
    }

    recommendations += '</ul>';
    recommendationsDiv.innerHTML = recommendations;
}

function updateAssessmentList() {
    const assessmentList = document.getElementById('assessmentList');
    assessmentList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = assessmentEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'assessment-entry';

        const measurements = entry.measurements;
        const totalRotation = measurements.rotationLeft + measurements.rotationRight;
        const totalSideBend = measurements.sideBendLeft + measurements.sideBendRight;

        const mobilityLevel = getMobilityLevel(entry.compositeScore);

        entryDiv.innerHTML = `
            <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="metrics">
                <div class="metric">
                    <div class="label">Score</div>
                    <div class="value ${mobilityLevel.class}">${entry.compositeScore}</div>
                </div>
                <div class="metric">
                    <div class="label">Rotation</div>
                    <div class="value">${totalRotation}°</div>
                </div>
                <div class="metric">
                    <div class="label">Extension</div>
                    <div class="value">${measurements.extension}°</div>
                </div>
            </div>
            <div class="measurements">
                Flexion: ${measurements.flexion}° | Side Bend: ${totalSideBend}° | L/R Rotation: ${measurements.rotationLeft}°/${measurements.rotationRight}°
            </div>
            ${entry.notes ? `<div class="notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        assessmentList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this assessment?')) {
        assessmentEntries = assessmentEntries.filter(entry => entry.id !== id);
        localStorage.setItem('thoracicMobilityEntries', JSON.stringify(assessmentEntries));
        updateStats();
        updateChart();
        updateRecommendations();
        updateAssessmentList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assessmentDate').value = today;

    updateStats();
    updateChart();
    updateRecommendations();
    updateAssessmentList();
});