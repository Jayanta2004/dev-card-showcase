// kinetic-chain-integrity-log.js

let assessments = JSON.parse(localStorage.getItem('kineticChainAssessments')) || [];
let integrityChart = null;

function logAssessment() {
    const date = document.getElementById('assessmentDate').value;
    const movementType = document.getElementById('movementType').value;
    const assessmentType = document.getElementById('assessmentType').value;

    // Get segment scores
    const segments = {
        footAnkle: parseInt(document.getElementById('footAnkle').value),
        knee: parseInt(document.getElementById('knee').value),
        hip: parseInt(document.getElementById('hip').value),
        lumbar: parseInt(document.getElementById('lumbar').value),
        thoracic: parseInt(document.getElementById('thoracic').value),
        coreStability: parseInt(document.getElementById('coreStability').value),
        shoulder: parseInt(document.getElementById('shoulder').value),
        elbow: parseInt(document.getElementById('elbow').value),
        wrist: parseInt(document.getElementById('wrist').value)
    };

    const overallIntegrity = parseInt(document.getElementById('overallIntegrity').value);
    const compensationLevel = document.getElementById('compensationLevel').value;

    // Get compensating segments
    const compensatingSegments = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    const movementNotes = document.getElementById('movementNotes').value.trim();
    const recommendedActions = document.getElementById('recommendedActions').value.trim();

    if (!date || !movementType || !assessmentType || !overallIntegrity || !compensationLevel || !movementNotes || !recommendedActions) {
        alert('Please fill in all required fields.');
        return;
    }

    const assessment = {
        id: Date.now(),
        date,
        movementType,
        assessmentType,
        segments,
        overallIntegrity,
        compensationLevel,
        compensatingSegments,
        movementNotes,
        recommendedActions,
        createdAt: new Date().toISOString()
    };

    assessments.push(assessment);

    // Sort by date
    assessments.sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem('kineticChainAssessments', JSON.stringify(assessments));

    // Clear form
    document.getElementById('assessmentDate').value = '';
    document.getElementById('movementType').value = '';
    document.getElementById('assessmentType').value = '';
    Object.keys(segments).forEach(key => {
        document.getElementById(key).value = '';
    });
    document.getElementById('overallIntegrity').value = '';
    document.getElementById('compensationLevel').value = '';
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('movementNotes').value = '';
    document.getElementById('recommendedActions').value = '';

    updateDisplay();
    showAlert();
}

function updateDisplay() {
    updateStats();
    updateChart();
    updateInsights();
    updateAssessmentList();
}

function updateStats() {
    const totalAssessments = assessments.length;
    document.getElementById('totalAssessments').textContent = totalAssessments;

    if (totalAssessments === 0) {
        document.getElementById('avgIntegrity').textContent = '0';
        document.getElementById('mostCompensated').textContent = 'None';
        document.getElementById('integrityTrend').textContent = '0%';
        return;
    }

    // Calculate average integrity
    const avgIntegrity = (assessments.reduce((sum, a) => sum + a.overallIntegrity, 0) / totalAssessments).toFixed(1);
    document.getElementById('avgIntegrity').textContent = avgIntegrity;

    // Find most compensated segment
    const segmentCounts = {};
    assessments.forEach(assessment => {
        assessment.compensatingSegments.forEach(segment => {
            segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
        });
    });

    const mostCompensated = Object.entries(segmentCounts).sort(([,a], [,b]) => b - a)[0];
    document.getElementById('mostCompensated').textContent = mostCompensated ?
        mostCompensated[0].replace('-', '/').replace(/\b\w/g, l => l.toUpperCase()) : 'None';

    // Calculate trend (last 5 vs first 5)
    if (totalAssessments >= 10) {
        const recent = assessments.slice(0, 5).reduce((sum, a) => sum + a.overallIntegrity, 0) / 5;
        const earlier = assessments.slice(-5).reduce((sum, a) => sum + a.overallIntegrity, 0) / 5;
        const trend = ((recent - earlier) / earlier * 100).toFixed(1);
        document.getElementById('integrityTrend').textContent = trend + '%';
    } else {
        document.getElementById('integrityTrend').textContent = 'N/A';
    }
}

function updateChart() {
    const ctx = document.getElementById('integrityChart').getContext('2d');
    const chartView = document.getElementById('chartView').value;
    const timeRange = document.getElementById('timeRange').value;

    // Filter assessments by time range
    const filteredAssessments = filterAssessmentsByTime(assessments, timeRange);

    if (integrityChart) {
        integrityChart.destroy();
    }

    let chartData, chartOptions;

    switch (chartView) {
        case 'integrity':
            chartData = getIntegrityOverTimeData(filteredAssessments);
            chartOptions = getLineChartOptions('Overall Integrity Over Time', 'Integrity Score');
            break;
        case 'segments':
            chartData = getSegmentsAverageData(filteredAssessments);
            chartOptions = getBarChartOptions('Average Segment Scores', 'Score');
            break;
        case 'movement':
            chartData = getMovementTypeData(filteredAssessments);
            chartOptions = getBarChartOptions('Integrity by Movement Type', 'Average Integrity');
            break;
        case 'compensation':
            chartData = getCompensationLevelData(filteredAssessments);
            chartOptions = getBarChartOptions('Assessments by Compensation Level', 'Count');
            break;
    }

    integrityChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartOptions
    });
}

function getIntegrityOverTimeData(assessments) {
    const sortedAssessments = [...assessments].sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        type: 'line',
        data: {
            labels: sortedAssessments.map(a => new Date(a.date).toLocaleDateString()),
            datasets: [{
                label: 'Overall Integrity',
                data: sortedAssessments.map(a => a.overallIntegrity),
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                tension: 0.4,
                fill: true
            }]
        }
    };
}

function getSegmentsAverageData(assessments) {
    if (assessments.length === 0) return { type: 'bar', data: { labels: [], datasets: [] } };

    const segmentNames = {
        footAnkle: 'Foot/Ankle',
        knee: 'Knee',
        hip: 'Hip',
        lumbar: 'Lumbar',
        thoracic: 'Thoracic',
        coreStability: 'Core',
        shoulder: 'Shoulder',
        elbow: 'Elbow',
        wrist: 'Wrist'
    };

    const averages = {};
    Object.keys(segmentNames).forEach(key => {
        const scores = assessments.map(a => a.segments[key]).filter(score => score != null);
        averages[key] = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    });

    return {
        type: 'bar',
        data: {
            labels: Object.values(segmentNames),
            datasets: [{
                label: 'Average Score',
                data: Object.values(averages),
                backgroundColor: 'rgba(56, 189, 248, 0.8)',
                borderColor: '#38bdf8',
                borderWidth: 1
            }]
        }
    };
}

function getMovementTypeData(assessments) {
    const movementGroups = {};
    assessments.forEach(assessment => {
        if (!movementGroups[assessment.movementType]) {
            movementGroups[assessment.movementType] = [];
        }
        movementGroups[assessment.movementType].push(assessment.overallIntegrity);
    });

    const labels = Object.keys(movementGroups).map(type =>
        type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    const data = Object.values(movementGroups).map(scores =>
        scores.reduce((sum, score) => sum + score, 0) / scores.length
    );

    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Average Integrity',
                data,
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: '#8b5cf6',
                borderWidth: 1
            }]
        }
    };
}

function getCompensationLevelData(assessments) {
    const compensationCounts = {};
    assessments.forEach(assessment => {
        compensationCounts[assessment.compensationLevel] = (compensationCounts[assessment.compensationLevel] || 0) + 1;
    });

    const labels = Object.keys(compensationCounts).map(level =>
        level.replace(/\b\w/g, l => l.toUpperCase())
    );

    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Count',
                data: Object.values(compensationCounts),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
                borderWidth: 1
            }]
        }
    };
}

function getLineChartOptions(title, yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                color: '#ffffff'
            },
            legend: {
                labels: {
                    color: '#94a3b8'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                }
            },
            y: {
                beginAtZero: true,
                max: 10,
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                },
                title: {
                    display: true,
                    text: yLabel,
                    color: '#94a3b8'
                }
            }
        }
    };
}

function getBarChartOptions(title, yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                color: '#ffffff'
            },
            legend: {
                labels: {
                    color: '#94a3b8'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                },
                title: {
                    display: true,
                    text: yLabel,
                    color: '#94a3b8'
                }
            }
        }
    };
}

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (assessments.length < 3) {
        insightsDiv.innerHTML = '<p>Log several movement assessments to receive personalized insights about your kinetic chain integrity and recommendations for improvement.</p>';
        return;
    }

    let insights = '<div class="insights-list">';

    // Calculate segment averages
    const segmentAverages = {};
    const segmentNames = {
        footAnkle: 'Foot/Ankle',
        knee: 'Knee',
        hip: 'Hip',
        lumbar: 'Lumbar Spine',
        thoracic: 'Thoracic Spine',
        coreStability: 'Core Stability',
        shoulder: 'Shoulder',
        elbow: 'Elbow',
        wrist: 'Wrist/Hand'
    };

    Object.keys(segmentNames).forEach(key => {
        const scores = assessments.map(a => a.segments[key]).filter(score => score != null);
        segmentAverages[key] = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    });

    // Find weakest segments
    const weakestSegments = Object.entries(segmentAverages)
        .sort(([,a], [,b]) => a - b)
        .slice(0, 3)
        .filter(([, score]) => score < 7);

    if (weakestSegments.length > 0) {
        insights += '<div class="insight-item">';
        insights += '<h4><i class="fas fa-exclamation-triangle"></i> Areas Needing Attention</h4>';
        insights += '<p>Your weakest segments are: ' +
            weakestSegments.map(([key]) => segmentNames[key]).join(', ') +
            '. Focus on mobility and strength work for these areas.</p>';
        insights += '</div>';
    }

    // Check compensation patterns
    const compensationCounts = {};
    assessments.forEach(assessment => {
        assessment.compensatingSegments.forEach(segment => {
            compensationCounts[segment] = (compensationCounts[segment] || 0) + 1;
        });
    });

    const frequentCompensations = Object.entries(compensationCounts)
        .filter(([, count]) => count >= assessments.length * 0.3)
        .sort(([,a], [,b]) => b - a);

    if (frequentCompensations.length > 0) {
        insights += '<div class="insight-item">';
        insights += '<h4><i class="fas fa-random"></i> Common Compensation Patterns</h4>';
        insights += '<p>You frequently compensate in: ' +
            frequentCompensations.map(([segment]) => segment.replace('-', '/').replace(/\b\w/g, l => l.toUpperCase())).join(', ') +
            '. Address these patterns with targeted corrective exercises.</p>';
        insights += '</div>';
    }

    // Movement-specific insights
    const movementAverages = {};
    assessments.forEach(assessment => {
        if (!movementAverages[assessment.movementType]) {
            movementAverages[assessment.movementType] = [];
        }
        movementAverages[assessment.movementType].push(assessment.overallIntegrity);
    });

    const challengingMovements = Object.entries(movementAverages)
        .map(([movement, scores]) => [movement, scores.reduce((sum, score) => sum + score, 0) / scores.length])
        .filter(([, avg]) => avg < 7)
        .sort(([,a], [,b]) => a - b);

    if (challengingMovements.length > 0) {
        insights += '<div class="insight-item">';
        insights += '<h4><i class="fas fa-dumbbell"></i> Movement Challenges</h4>';
        insights += '<p>Focus on improving: ' +
            challengingMovements.map(([movement]) => movement.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') +
            '. Break down these movements and work on proper sequencing.</p>';
        insights += '</div>';
    }

    // Progress insights
    if (assessments.length >= 5) {
        const recentAvg = assessments.slice(0, 3).reduce((sum, a) => sum + a.overallIntegrity, 0) / 3;
        const olderAvg = assessments.slice(-3).reduce((sum, a) => sum + a.overallIntegrity, 0) / 3;

        if (recentAvg > olderAvg + 0.5) {
            insights += '<div class="insight-item positive">';
            insights += '<h4><i class="fas fa-chart-line"></i> Great Progress!</h4>';
            insights += '<p>Your kinetic chain integrity has improved by ' + (recentAvg - olderAvg).toFixed(1) + ' points recently. Keep up the good work!</p>';
            insights += '</div>';
        } else if (olderAvg > recentAvg + 0.5) {
            insights += '<div class="insight-item warning">';
            insights += '<h4><i class="fas fa-chart-line"></i> Integrity Declining</h4>';
            insights += '<p>Your recent assessments show a decline in integrity. Review your movement patterns and consider additional mobility work.</p>';
            insights += '</div>';
        }
    }

    insights += '</div>';
    insightsDiv.innerHTML = insights;
}

function updateAssessmentList() {
    const listDiv = document.getElementById('assessmentList');
    const filterMovement = document.getElementById('filterMovement').value;
    const filterCompensation = document.getElementById('filterCompensation').value;
    const sortBy = document.getElementById('sortBy').value;

    let filteredAssessments = assessments;

    if (filterMovement !== 'all') {
        filteredAssessments = filteredAssessments.filter(a => a.movementType === filterMovement);
    }

    if (filterCompensation !== 'all') {
        filteredAssessments = filteredAssessments.filter(a => a.compensationLevel === filterCompensation);
    }

    // Sort assessments
    filteredAssessments.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'integrity':
                return b.overallIntegrity - a.overallIntegrity;
            case 'movement':
                return a.movementType.localeCompare(b.movementType);
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });

    listDiv.innerHTML = '';

    if (filteredAssessments.length === 0) {
        listDiv.innerHTML = '<p>No assessments match the current filters.</p>';
        return;
    }

    filteredAssessments.forEach(assessment => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'assessment-item';

        const movementName = assessment.movementType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const compensationClass = assessment.compensationLevel.toLowerCase();

        itemDiv.innerHTML = `
            <div class="assessment-header">
                <div>
                    <h3 class="assessment-title">${movementName}</h3>
                    <div class="assessment-meta">
                        ${new Date(assessment.date).toLocaleDateString()} •
                        <span class="assessment-type">${assessment.assessmentType.replace('-', ' ')}</span>
                    </div>
                </div>
            </div>
            <div class="assessment-integrity">
                <div class="integrity-item">
                    <div class="integrity-label">Overall</div>
                    <div class="integrity-value">${assessment.overallIntegrity}/10</div>
                </div>
                <div class="integrity-item">
                    <div class="integrity-label">Foot/Ankle</div>
                    <div class="integrity-value">${assessment.segments.footAnkle}/10</div>
                </div>
                <div class="integrity-item">
                    <div class="integrity-label">Knee</div>
                    <div class="integrity-value">${assessment.segments.knee}/10</div>
                </div>
                <div class="integrity-item">
                    <div class="integrity-label">Hip</div>
                    <div class="integrity-value">${assessment.segments.hip}/10</div>
                </div>
            </div>
            <div class="assessment-compensation">
                <span class="compensation-level ${compensationClass}">${assessment.compensationLevel}</span>
            </div>
            ${assessment.compensatingSegments.length > 0 ? `
            <div class="assessment-segments">
                <div class="segment-tags">
                    ${assessment.compensatingSegments.map(segment =>
                        `<span class="segment-tag">${segment.replace('-', '/')}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
            <div class="assessment-content">
                <div class="assessment-notes">
                    <strong>Notes:</strong> ${assessment.movementNotes}
                </div>
                <div class="assessment-actions">
                    <strong>Actions:</strong> ${assessment.recommendedActions}
                </div>
            </div>
            <div class="assessment-actions">
                <button class="btn-secondary" onclick="editAssessment(${assessment.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-danger" onclick="deleteAssessment(${assessment.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        listDiv.appendChild(itemDiv);
    });
}

function deleteAssessment(id) {
    if (confirm('Are you sure you want to delete this assessment?')) {
        assessments = assessments.filter(a => a.id !== id);
        localStorage.setItem('kineticChainAssessments', JSON.stringify(assessments));
        updateDisplay();
    }
}

function editAssessment(id) {
    // For now, just show an alert. Could implement full editing later.
    alert('Edit functionality coming soon!');
}

function showAlert() {
    const alertDiv = document.getElementById('integrityAlert');
    const lastAssessment = assessments[0];

    if (!lastAssessment) return;

    // Show alert if integrity is low or compensation is high
    const showAlert = lastAssessment.overallIntegrity < 6 ||
                     lastAssessment.compensationLevel === 'significant' ||
                     lastAssessment.compensationLevel === 'severe';

    if (showAlert) {
        let message = '';
        if (lastAssessment.overallIntegrity < 6) {
            message = `Your recent ${lastAssessment.movementType.replace('-', ' ')} assessment shows low integrity (${lastAssessment.overallIntegrity}/10). Focus on proper movement sequencing and address any weak links.`;
        } else if (lastAssessment.compensationLevel === 'significant' || lastAssessment.compensationLevel === 'severe') {
            message = `Significant compensation detected in your recent assessment. Work on mobility for the compensating segments and consider consulting a movement specialist.`;
        }

        document.getElementById('alertTitle').textContent = 'Integrity Issue Detected';
        document.getElementById('alertMessage').textContent = message;
        alertDiv.classList.remove('hidden');
    } else {
        alertDiv.classList.add('hidden');
    }
}

function filterAssessmentsByTime(assessments, timeRange) {
    const now = new Date();
    let cutoffDate;

    switch (timeRange) {
        case '7':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90':
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            return assessments;
    }

    return assessments.filter(assessment => new Date(assessment.date) >= cutoffDate);
}

// Event listeners
document.getElementById('assessmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logAssessment();
});

document.getElementById('chartView').addEventListener('change', updateChart);
document.getElementById('timeRange').addEventListener('change', updateChart);
document.getElementById('filterMovement').addEventListener('change', updateAssessmentList);
document.getElementById('filterCompensation').addEventListener('change', updateAssessmentList);
document.getElementById('sortBy').addEventListener('change', updateAssessmentList);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
});