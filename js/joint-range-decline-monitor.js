// Joint Range Decline Monitor JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

function initApp() {
    // Load navbar
    loadNavbar();

    // Initialize components
    initForm();
    initCharts();
    initHistory();
    initInsights();

    // Load existing data
    loadAssessments();
    updateDashboard();
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Re-initialize Lucide icons for navbar
            lucide.createIcons();
        });
}

// Form handling
function initForm() {
    const form = document.getElementById('romForm');

    // Set default date to today
    document.getElementById('assessmentDate').valueAsDate = new Date();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const assessment = {
            id: Date.now(),
            date: document.getElementById('assessmentDate').value,
            measurements: {
                shoulder: {
                    flexion: parseFloat(document.getElementById('shoulderFlexion').value) || 0,
                    extension: parseFloat(document.getElementById('shoulderExtension').value) || 0,
                    abduction: parseFloat(document.getElementById('shoulderAbduction').value) || 0,
                    adduction: parseFloat(document.getElementById('shoulderAdduction').value) || 0
                },
                elbow: {
                    flexion: parseFloat(document.getElementById('elbowFlexion').value) || 0,
                    extension: parseFloat(document.getElementById('elbowExtension').value) || 0
                },
                hip: {
                    flexion: parseFloat(document.getElementById('hipFlexion').value) || 0,
                    extension: parseFloat(document.getElementById('hipExtension').value) || 0,
                    abduction: parseFloat(document.getElementById('hipAbduction').value) || 0,
                    adduction: parseFloat(document.getElementById('hipAdduction').value) || 0
                },
                knee: {
                    flexion: parseFloat(document.getElementById('kneeFlexion').value) || 0,
                    extension: parseFloat(document.getElementById('kneeExtension').value) || 0
                },
                ankle: {
                    dorsiflexion: parseFloat(document.getElementById('ankleDorsiflexion').value) || 0,
                    plantarflexion: parseFloat(document.getElementById('anklePlantarflexion').value) || 0
                }
            },
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };

        saveAssessment(assessment);
        form.reset();
        document.getElementById('assessmentDate').valueAsDate = new Date();

        // Update UI
        loadAssessments();
        updateDashboard();
    });
}

// Data management
function saveAssessment(assessment) {
    const assessments = getAssessments();
    assessments.push(assessment);
    localStorage.setItem('jrdmAssessments', JSON.stringify(assessments));
}

function getAssessments() {
    const assessments = localStorage.getItem('jrdmAssessments');
    return assessments ? JSON.parse(assessments) : [];
}

function loadAssessments() {
    const assessments = getAssessments();
    updateHistory(assessments);
    updateInsights(assessments);
}

// Dashboard updates
function updateDashboard() {
    const assessments = getAssessments();

    if (assessments.length === 0) return;

    // Sort by date
    assessments.sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalAssessments = assessments.length;

    // Calculate average monthly decline
    let avgDecline = '--';
    if (assessments.length >= 2) {
        const firstAssessment = assessments[0];
        const lastAssessment = assessments[assessments.length - 1];
        const monthsDiff = (new Date(lastAssessment.date) - new Date(firstAssessment.date)) / (1000 * 60 * 60 * 24 * 30);

        if (monthsDiff > 0) {
            // Calculate total ROM decline across all joints
            let totalFirstROM = 0;
            let totalLastROM = 0;

            Object.keys(firstAssessment.measurements).forEach(joint => {
                Object.values(firstAssessment.measurements[joint]).forEach(value => {
                    totalFirstROM += value;
                });
            });

            Object.keys(lastAssessment.measurements).forEach(joint => {
                Object.values(lastAssessment.measurements[joint]).forEach(value => {
                    totalLastROM += value;
                });
            });

            const totalDecline = totalFirstROM - totalLastROM;
            avgDecline = (totalDecline / monthsDiff).toFixed(1) + '°/month';
        }
    }

    // Find most declining joint
    let mostDecline = '--';
    if (assessments.length >= 2) {
        const declines = {};

        Object.keys(assessments[0].measurements).forEach(joint => {
            const firstValues = Object.values(assessments[0].measurements[joint]);
            const lastValues = Object.values(assessments[assessments.length - 1].measurements[joint]);
            const jointDecline = firstValues.reduce((sum, val, i) => sum + (val - (lastValues[i] || 0)), 0);
            declines[joint] = jointDecline;
        });

        const maxDeclineJoint = Object.keys(declines).reduce((a, b) => declines[a] > declines[b] ? a : b);
        mostDecline = maxDeclineJoint.charAt(0).toUpperCase() + maxDeclineJoint.slice(1);
    }

    // Days since last assessment
    const lastAssessment = assessments[assessments.length - 1];
    const daysSince = Math.floor((new Date() - new Date(lastAssessment.date)) / (1000 * 60 * 60 * 24));

    document.getElementById('totalAssessments').textContent = totalAssessments;
    document.getElementById('avgDecline').textContent = avgDecline;
    document.getElementById('mostDecline').textContent = mostDecline;
    document.getElementById('lastAssessment').textContent = daysSince + ' days';

    // Update chart
    updateChart(assessments);
}

// Charts
function initCharts() {
    const ctx = document.getElementById('romChart').getContext('2d');
    window.romChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Shoulder ROM',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }, {
                label: 'Elbow ROM',
                data: [],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                tension: 0.4
            }, {
                label: 'Hip ROM',
                data: [],
                borderColor: '#f093fb',
                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                tension: 0.4
            }, {
                label: 'Knee ROM',
                data: [],
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                tension: 0.4
            }, {
                label: 'Ankle ROM',
                data: [],
                borderColor: '#43e97b',
                backgroundColor: 'rgba(67, 233, 123, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Range of Motion (degrees)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function updateChart(assessments) {
    if (assessments.length === 0) return;

    // Sort by date
    assessments.sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = assessments.map(a => new Date(a.date).toLocaleDateString());

    const datasets = [
        { label: 'Shoulder ROM', data: [], color: '#667eea' },
        { label: 'Elbow ROM', data: [], color: '#764ba2' },
        { label: 'Hip ROM', data: [], color: '#f093fb' },
        { label: 'Knee ROM', data: [], color: '#4facfe' },
        { label: 'Ankle ROM', data: [], color: '#43e97b' }
    ];

    assessments.forEach(assessment => {
        datasets[0].data.push(Object.values(assessment.measurements.shoulder).reduce((a, b) => a + b, 0));
        datasets[1].data.push(Object.values(assessment.measurements.elbow).reduce((a, b) => a + b, 0));
        datasets[2].data.push(Object.values(assessment.measurements.hip).reduce((a, b) => a + b, 0));
        datasets[3].data.push(Object.values(assessment.measurements.knee).reduce((a, b) => a + b, 0));
        datasets[4].data.push(Object.values(assessment.measurements.ankle).reduce((a, b) => a + b, 0));
    });

    window.romChart.data.labels = labels;
    window.romChart.data.datasets.forEach((dataset, i) => {
        dataset.data = datasets[i].data;
    });
    window.romChart.update();
}

// History
function initHistory() {
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
    document.getElementById('view6Months').addEventListener('click', () => filterHistory('6months'));
    document.getElementById('viewYear').addEventListener('click', () => filterHistory('year'));
}

function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    const assessments = getAssessments();
    let filteredAssessments = assessments;

    if (period === '6months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        filteredAssessments = assessments.filter(a => new Date(a.date) >= sixMonthsAgo);
    } else if (period === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filteredAssessments = assessments.filter(a => new Date(a.date) >= yearAgo);
    }

    updateHistory(filteredAssessments);
}

function updateHistory(assessments) {
    const historyList = document.getElementById('assessmentHistory');

    if (assessments.length === 0) {
        historyList.innerHTML = '<p>No assessments recorded yet.</p>';
        return;
    }

    // Sort by date descending
    assessments.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = assessments.map(assessment => {
        const totalROM = Object.values(assessment.measurements).reduce((sum, joint) => {
            return sum + Object.values(joint).reduce((jointSum, value) => jointSum + value, 0);
        }, 0);

        const jointSummaries = Object.entries(assessment.measurements).map(([joint, measurements]) => {
            const jointTotal = Object.values(measurements).reduce((a, b) => a + b, 0);
            return `<div class="joint-measurement">${joint.charAt(0).toUpperCase() + joint.slice(1)}: ${jointTotal}°</div>`;
        }).join('');

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-date">${new Date(assessment.date).toLocaleDateString()}</span>
                    <span class="history-summary">Total ROM: ${totalROM}°</span>
                </div>
                <div class="joint-measurements">
                    ${jointSummaries}
                </div>
                ${assessment.notes ? `<p style="margin-top: 0.5rem; font-style: italic;">${assessment.notes}</p>` : ''}
            </div>
        `;
    }).join('');
}

// Insights
function initInsights() {
    // Insights are updated when assessments are loaded
}

function updateInsights(assessments) {
    if (assessments.length === 0) return;

    // Mobility Status
    const latestAssessment = assessments[assessments.length - 1];
    const totalROM = Object.values(latestAssessment.measurements).reduce((sum, joint) => {
        return sum + Object.values(joint).reduce((jointSum, value) => jointSum + value, 0);
    }, 0);

    let mobilityStatus = 'Good';
    if (totalROM < 800) mobilityStatus = 'Fair';
    if (totalROM < 600) mobilityStatus = 'Poor';

    document.getElementById('mobilityStatus').innerHTML = `
        <p>Your current total range of motion is ${totalROM}°, indicating <strong>${mobilityStatus.toLowerCase()}</strong> overall mobility.</p>
    `;

    // Risk Assessment
    let riskLevel = 'Low';
    let riskFactors = [];

    if (assessments.length >= 2) {
        const recentDecline = calculateRecentDecline(assessments);
        if (recentDecline > 10) {
            riskLevel = 'Moderate';
            riskFactors.push('Significant recent decline detected');
        }
        if (recentDecline > 20) {
            riskLevel = 'High';
            riskFactors.push('Rapid mobility loss - consider professional assessment');
        }
    }

    // Check for joints with limited ROM
    Object.entries(latestAssessment.measurements).forEach(([joint, measurements]) => {
        const jointTotal = Object.values(measurements).reduce((a, b) => a + b, 0);
        const normalRanges = {
            shoulder: 470, elbow: 160, hip: 250, knee: 160, ankle: 80
        };

        if (jointTotal < normalRanges[joint] * 0.8) {
            riskFactors.push(`Limited ${joint} mobility`);
        }
    });

    document.getElementById('riskAssessment').innerHTML = `
        <p>Risk Level: <strong>${riskLevel}</strong></p>
        ${riskFactors.length > 0 ? '<ul>' + riskFactors.map(factor => `<li>${factor}</li>`).join('') + '</ul>' : '<p>No significant risk factors identified.</p>'}
    `;

    // Exercise Recommendations
    const recommendations = [];

    if (totalROM < 800) {
        recommendations.push('Daily stretching routine for all major joints');
        recommendations.push('Gentle yoga or tai chi classes');
    }

    if (riskLevel === 'Moderate' || riskLevel === 'High') {
        recommendations.push('Consult a physical therapist for personalized assessment');
        recommendations.push('Consider low-impact activities like swimming or cycling');
    }

    Object.entries(latestAssessment.measurements).forEach(([joint, measurements]) => {
        const jointTotal = Object.values(measurements).reduce((a, b) => a + b, 0);
        const normalRanges = {
            shoulder: 470, elbow: 160, hip: 250, knee: 160, ankle: 80
        };

        if (jointTotal < normalRanges[joint] * 0.8) {
            const exercises = {
                shoulder: 'Shoulder rolls, arm circles, wall angels',
                elbow: 'Elbow flexion/extension stretches',
                hip: 'Hip flexor stretches, leg swings',
                knee: 'Hamstring stretches, quad stretches',
                ankle: 'Ankle circles, calf stretches'
            };
            recommendations.push(`${joint.charAt(0).toUpperCase() + joint.slice(1)}: ${exercises[joint]}`);
        }
    });

    if (recommendations.length === 0) {
        recommendations.push('Maintain current activity level and continue regular assessments');
        recommendations.push('Focus on overall strength training to support joint health');
    }

    document.getElementById('exerciseRecommendations').innerHTML = `
        <ul>
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;
}

function calculateRecentDecline(assessments) {
    if (assessments.length < 2) return 0;

    const recent = assessments.slice(-3); // Last 3 assessments
    const first = recent[0];
    const last = recent[recent.length - 1];

    const firstTotal = Object.values(first.measurements).reduce((sum, joint) => {
        return sum + Object.values(joint).reduce((jointSum, value) => jointSum + value, 0);
    }, 0);

    const lastTotal = Object.values(last.measurements).reduce((sum, joint) => {
        return sum + Object.values(joint).reduce((jointSum, value) => jointSum + value, 0);
    }, 0);

    return firstTotal - lastTotal;
}