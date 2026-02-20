// burnout-early-detection-meter.js

let burnoutEntries = JSON.parse(localStorage.getItem('burnoutAssessments')) || [];

function logAssessment() {
    const date = document.getElementById('assessmentDate').value;
    const workHours = parseFloat(document.getElementById('workHours').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const fatigueLevel = parseInt(document.getElementById('fatigueLevel').value);
    const mentalFatigue = parseInt(document.getElementById('mentalFatigue').value);
    const stressLevel = parseInt(document.getElementById('stressLevel').value);
    const motivationLevel = parseInt(document.getElementById('motivationLevel').value);
    const workSatisfaction = parseInt(document.getElementById('workSatisfaction').value);

    // Get selected symptoms
    const symptomCheckboxes = document.querySelectorAll('input[name="burnoutSymptoms"]:checked');
    const symptoms = Array.from(symptomCheckboxes).map(cb => cb.value);

    const notes = document.getElementById('burnoutNotes').value.trim();

    if (!date || !workHours || !sleepHours || !fatigueLevel || !mentalFatigue || !stressLevel || !motivationLevel) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = burnoutEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        burnoutEntries = burnoutEntries.filter(entry => entry.date !== date);
    }

    // Calculate burnout risk score (0-100)
    const riskScore = calculateBurnoutRisk({
        workHours,
        sleepHours,
        fatigueLevel,
        mentalFatigue,
        stressLevel,
        motivationLevel,
        workSatisfaction,
        symptoms
    });

    // Determine risk level
    const riskLevel = getRiskLevel(riskScore);

    const entry = {
        id: Date.now(),
        date,
        workHours,
        sleepHours,
        fatigueLevel,
        mentalFatigue,
        stressLevel,
        motivationLevel,
        workSatisfaction,
        symptoms,
        riskScore: parseFloat(riskScore.toFixed(1)),
        riskLevel,
        notes
    };

    burnoutEntries.push(entry);

    // Sort by date
    burnoutEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (burnoutEntries.length > 50) {
        burnoutEntries = burnoutEntries.slice(-50);
    }

    localStorage.setItem('burnoutAssessments', JSON.stringify(burnoutEntries));

    // Clear form
    document.getElementById('assessmentDate').value = '';
    document.getElementById('workHours').value = '';
    document.getElementById('sleepHours').value = '';
    document.getElementById('fatigueLevel').value = '';
    document.getElementById('mentalFatigue').value = '';
    document.getElementById('stressLevel').value = '';
    document.getElementById('motivationLevel').value = '';
    document.getElementById('workSatisfaction').value = 7;
    document.getElementById('satisfactionValue').textContent = '7';

    // Clear symptom checkboxes
    symptomCheckboxes.forEach(cb => cb.checked = false);

    document.getElementById('burnoutNotes').value = '';

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateAssessmentList();
}

function calculateBurnoutRisk(data) {
    // Weighted calculation based on burnout research factors
    let score = 0;

    // Work hours factor (overwork)
    if (data.workHours > 8) score += (data.workHours - 8) * 3; // 3 points per hour over 8
    if (data.workHours > 10) score += (data.workHours - 10) * 2; // Additional penalty

    // Sleep deficit
    if (data.sleepHours < 7) score += (7 - data.sleepHours) * 5; // 5 points per hour under 7
    if (data.sleepHours < 6) score += (6 - data.sleepHours) * 3; // Additional penalty

    // Fatigue factors (emotional exhaustion)
    score += data.fatigueLevel * 2; // Physical fatigue
    score += data.mentalFatigue * 3; // Mental fatigue (weighted more)

    // Stress and motivation (depersonalization/cynicism)
    score += data.stressLevel * 2.5;
    score += (11 - data.motivationLevel) * 2; // Inverse relationship

    // Work satisfaction (reduced accomplishment)
    score += (11 - data.workSatisfaction) * 1.5;

    // Symptoms factor
    const symptomWeights = {
        'emotionalExhaustion': 4,
        'cynicism': 3,
        'reducedEfficacy': 3,
        'irritability': 2,
        'concentrationIssues': 2.5,
        'sleepDisturbance': 2,
        'headaches': 1.5,
        'anxiety': 3
    };

    data.symptoms.forEach(symptom => {
        score += symptomWeights[symptom] || 1;
    });

    // Cap at 100 and ensure minimum 0
    return Math.max(0, Math.min(100, score));
}

function getRiskLevel(score) {
    if (score < 30) return 'Low';
    if (score < 60) return 'Moderate';
    if (score < 80) return 'High';
    return 'Critical';
}

function getRecoveryStatus(entries) {
    if (entries.length < 3) return { status: 'Unknown', class: '' };

    const recentEntries = entries.slice(-7); // Last 7 days
    const avgRisk = recentEntries.reduce((sum, entry) => sum + entry.riskScore, 0) / recentEntries.length;
    const trend = recentEntries.length >= 2 ?
        recentEntries[recentEntries.length - 1].riskScore - recentEntries[0].riskScore : 0;

    if (avgRisk >= 70 || trend > 10) return { status: 'Urgent Recovery Needed', class: 'recovery-urgent' };
    if (avgRisk >= 50 || trend > 5) return { status: 'Needs Attention', class: 'recovery-needs-attention' };
    return { status: 'Good', class: 'recovery-good' };
}

function updateStats() {
    const totalAssessments = burnoutEntries.length;

    if (totalAssessments === 0) {
        document.getElementById('currentRiskLevel').textContent = 'Unknown';
        document.getElementById('currentRiskLevel').className = 'stat-value';
        document.getElementById('riskScore').textContent = '0/100';
        document.getElementById('recoveryStatus').textContent = 'Unknown';
        document.getElementById('recoveryStatus').className = 'stat-value';
        document.getElementById('totalAssessments').textContent = '0';
        return;
    }

    // Current risk (latest entry)
    const latestEntry = burnoutEntries[burnoutEntries.length - 1];
    const currentRiskLevel = latestEntry.riskLevel;
    const riskScore = latestEntry.riskScore;

    // Recovery status
    const recovery = getRecoveryStatus(burnoutEntries);

    // Update display
    const riskElement = document.getElementById('currentRiskLevel');
    riskElement.textContent = currentRiskLevel;
    riskElement.className = `stat-value risk-${currentRiskLevel.toLowerCase()}`;

    const recoveryElement = document.getElementById('recoveryStatus');
    recoveryElement.textContent = recovery.status;
    recoveryElement.className = `stat-value ${recovery.class}`;

    document.getElementById('riskScore').textContent = `${riskScore}/100`;
    document.getElementById('totalAssessments').textContent = totalAssessments;
}

function updateAlert() {
    const alertDiv = document.getElementById('burnoutAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    if (burnoutEntries.length === 0) {
        alertDiv.classList.add('hidden');
        return;
    }

    const latestEntry = burnoutEntries[burnoutEntries.length - 1];
    const recentEntries = burnoutEntries.slice(-3); // Last 3 days
    const avgRecentRisk = recentEntries.reduce((sum, entry) => sum + entry.riskScore, 0) / recentEntries.length;

    if (latestEntry.riskLevel === 'Critical' || avgRecentRisk >= 70) {
        alertDiv.classList.remove('hidden');
        alertDiv.classList.add('critical');
        alertTitle.textContent = 'Critical Burnout Risk Detected';
        alertMessage.textContent = 'Your recent assessments show severe burnout symptoms. Immediate action is required to protect your health. Consider taking extended time off, seeking professional help, or making significant changes to your work-life balance.';
    } else if (latestEntry.riskLevel === 'High' || avgRecentRisk >= 50) {
        alertDiv.classList.remove('hidden');
        alertDiv.classList.remove('critical');
        alertTitle.textContent = 'High Burnout Risk Detected';
        alertMessage.textContent = 'You\'re showing significant burnout symptoms. Take immediate steps to reduce work hours, improve sleep, and incorporate stress-reduction activities. Consider speaking with a supervisor about workload adjustments.';
    } else if (latestEntry.riskLevel === 'Moderate' || avgRecentRisk >= 30) {
        alertDiv.classList.remove('hidden');
        alertDiv.classList.remove('critical');
        alertTitle.textContent = 'Moderate Burnout Risk';
        alertMessage.textContent = 'You\'re experiencing moderate burnout symptoms. Focus on better work-life balance, regular breaks, and stress management techniques to prevent escalation.';
    } else {
        alertDiv.classList.add('hidden');
    }
}

function updateChart() {
    const ctx = document.getElementById('burnoutChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = burnoutEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const riskScores = chartEntries.map(entry => entry.riskScore);
    const fatigueLevels = chartEntries.map(entry => (entry.fatigueLevel + entry.mentalFatigue) / 2);
    const stressLevels = chartEntries.map(entry => entry.stressLevel);
    const motivationLevels = chartEntries.map(entry => entry.motivationLevel);
    const workHours = chartEntries.map(entry => entry.workHours);

    // Reference lines
    const moderateRisk = new Array(riskScores.length).fill(30);
    const highRisk = new Array(riskScores.length).fill(60);
    const criticalRisk = new Array(riskScores.length).fill(80);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Burnout Risk Score',
                data: riskScores,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Average Fatigue',
                data: fatigueLevels,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Stress Level',
                data: stressLevels,
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253, 126, 20, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Motivation Level',
                data: motivationLevels,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Work Hours',
                data: workHours,
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Moderate Risk (30+)',
                data: moderateRisk,
                borderColor: '#ffc107',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'High Risk (60+)',
                data: highRisk,
                borderColor: '#fd7e14',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Critical Risk (80+)',
                data: criticalRisk,
                borderColor: '#dc3545',
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
                        text: 'Burnout Risk Score'
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
                        text: 'Fatigue/Stress/Motivation (1-10)'
                    },
                    min: 1,
                    max: 10,
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y2: {
                    type: 'linear',
                    display: false, // Hidden by default
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Work Hours'
                    },
                    min: 0,
                    max: 16,
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

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (burnoutEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 daily assessments to receive personalized insights about your burnout risk patterns and prevention strategies.</p>';
        return;
    }

    // Analyze patterns
    const recentEntries = burnoutEntries.slice(-10);
    const avgRiskScore = recentEntries.reduce((sum, entry) => sum + entry.riskScore, 0) / recentEntries.length;
    const avgWorkHours = recentEntries.reduce((sum, entry) => sum + entry.workHours, 0) / recentEntries.length;
    const avgSleepHours = recentEntries.reduce((sum, entry) => sum + entry.sleepHours, 0) / recentEntries.length;
    const avgFatigue = recentEntries.reduce((sum, entry) => sum + (entry.fatigueLevel + entry.mentalFatigue) / 2, 0) / recentEntries.length;

    // Find most common symptoms
    const symptomCounts = {};
    recentEntries.forEach(entry => {
        entry.symptoms.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
    });

    const topSymptoms = Object.entries(symptomCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([symptom]) => symptom);

    // Analyze trends
    const riskTrend = recentEntries.length >= 2 ?
        recentEntries[recentEntries.length - 1].riskScore - recentEntries[0].riskScore : 0;

    let insights = '<p>Based on your burnout assessment patterns:</p><ul>';

    if (avgRiskScore >= 70) {
        insights += '<li><strong>Critical burnout risk identified.</strong> Your current levels indicate severe burnout that requires immediate professional intervention. Consider speaking with a healthcare provider or mental health professional.</li>';
    } else if (avgRiskScore >= 50) {
        insights += '<li><strong>High burnout risk detected.</strong> You\'re experiencing significant burnout symptoms. Immediate lifestyle changes are needed including reduced work hours, improved sleep, and stress management.</li>';
    } else if (avgRiskScore >= 30) {
        insights += '<li><strong>Moderate burnout risk present.</strong> You\'re showing early burnout signs. Focus on prevention strategies like regular breaks, exercise, and work-life balance.</li>';
    } else {
        insights += '<li><strong>Low burnout risk.</strong> Your current patterns suggest good burnout prevention. Continue maintaining healthy work-life balance and stress management practices.</li>';
    }

    if (avgWorkHours > 9) {
        insights += `<li><strong>High work hours detected.</strong> Your average work hours (${avgWorkHours.toFixed(1)}h/day) exceed healthy limits. Consider workload reduction or time management strategies.</li>`;
    }

    if (avgSleepHours < 7) {
        insights += `<li><strong>Sleep deficit identified.</strong> Your average sleep (${avgSleepHours.toFixed(1)}h/night) is below recommended levels. Prioritize sleep hygiene and consider sleep schedule adjustments.</li>`;
    }

    if (avgFatigue > 6) {
        insights += '<li><strong>High fatigue levels.</strong> Your fatigue scores suggest chronic exhaustion. Incorporate regular rest periods, exercise, and consider professional assessment for underlying causes.</li>';
    }

    if (riskTrend > 10) {
        insights += '<li><strong>Risk increasing over time.</strong> Your burnout risk has been rising recently. Immediate intervention is needed to reverse this trend.</li>';
    } else if (riskTrend < -10) {
        insights += '<li><strong>Risk decreasing.</strong> Your recent changes are effectively reducing burnout risk. Continue with these positive strategies.</li>';
    }

    if (topSymptoms.length > 0) {
        const symptomNames = topSymptoms.map(symptom => {
            const nameMap = {
                'emotionalExhaustion': 'Emotional Exhaustion',
                'cynicism': 'Cynicism',
                'reducedEfficacy': 'Reduced Efficacy',
                'irritability': 'Irritability',
                'concentrationIssues': 'Concentration Issues',
                'sleepDisturbance': 'Sleep Disturbance',
                'headaches': 'Headaches',
                'anxiety': 'Anxiety'
            };
            return nameMap[symptom] || symptom;
        });
        insights += `<li><strong>Common symptoms:</strong> ${symptomNames.join(', ')}. Address these symptoms with targeted interventions.</li>`;
    }

    insights += '<li><strong>Burnout prevention strategies:</strong> Maintain consistent sleep (7-9 hours), take regular breaks, set work boundaries, practice stress management, stay physically active, and nurture social connections.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateAssessmentList() {
    const assessmentList = document.getElementById('assessmentList');
    assessmentList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = burnoutEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'assessment-entry';

        const symptomsText = entry.symptoms.length > 0 ?
            entry.symptoms.map(symptom => {
                const nameMap = {
                    'emotionalExhaustion': 'Emotional Exhaustion',
                    'cynicism': 'Cynicism',
                    'reducedEfficacy': 'Reduced Efficacy',
                    'irritability': 'Irritability',
                    'concentrationIssues': 'Concentration Issues',
                    'sleepDisturbance': 'Sleep Disturbance',
                    'headaches': 'Headaches',
                    'anxiety': 'Anxiety'
                };
                return nameMap[symptom] || symptom;
            }).join(', ') : 'None reported';

        entryDiv.innerHTML = `
            <div class="assessment-header">
                <div class="assessment-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="risk-indicator risk-${entry.riskLevel.toLowerCase()}-bg">${entry.riskLevel} Risk (${entry.riskScore})</div>
            </div>
            <div class="assessment-details">
                <div class="detail-item">
                    <div class="detail-label">Work Hours</div>
                    <div class="detail-value">${entry.workHours}h</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sleep Hours</div>
                    <div class="detail-value">${entry.sleepHours}h</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Physical Fatigue</div>
                    <div class="detail-value">${entry.fatigueLevel}/10</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Mental Fatigue</div>
                    <div class="detail-value">${entry.mentalFatigue}/10</div>
                </div>
            </div>
            <div class="assessment-metrics">
                <div class="metric-item">
                    <div class="metric-label">Stress</div>
                    <div class="metric-value">${entry.stressLevel}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Motivation</div>
                    <div class="metric-value">${entry.motivationLevel}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Work Satisfaction</div>
                    <div class="metric-value">${entry.workSatisfaction}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Risk Score</div>
                    <div class="metric-value">${entry.riskScore}/100</div>
                </div>
            </div>
            <div class="symptoms-list">Symptoms: ${symptomsText}</div>
            ${entry.notes ? `<div class="assessment-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        assessmentList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this burnout assessment?')) {
        burnoutEntries = burnoutEntries.filter(entry => entry.id !== id);
        localStorage.setItem('burnoutAssessments', JSON.stringify(burnoutEntries));
        updateStats();
        updateAlert();
        updateChart();
        updateInsights();
        updateAssessmentList();
    }
}

// Update satisfaction value display
document.getElementById('workSatisfaction').addEventListener('input', function() {
    document.getElementById('satisfactionValue').textContent = this.value;
});

// Form submission
document.getElementById('burnoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logAssessment();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assessmentDate').value = today;

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateAssessmentList();
});