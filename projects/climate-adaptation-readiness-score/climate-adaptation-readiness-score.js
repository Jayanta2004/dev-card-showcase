// climate-adaptation-readiness-score.js

let climateEntries = JSON.parse(localStorage.getItem('climateReadinessEntries')) || [];

function logAssessment() {
    const date = document.getElementById('assessmentDate').value;
    const restingHeartRate = parseInt(document.getElementById('restingHeartRate').value);
    const bodyTemperature = parseFloat(document.getElementById('bodyTemperature').value);
    const sweatRate = parseInt(document.getElementById('sweatRate').value);
    const hydrationLevel = parseInt(document.getElementById('hydrationLevel').value);
    const vo2Max = document.getElementById('vo2Max').value ? parseFloat(document.getElementById('vo2Max').value) : null;
    const heatTolerance = parseInt(document.getElementById('heatTolerance').value);
    const environmentalTemp = parseFloat(document.getElementById('environmentalTemp').value);

    // Get selected symptoms
    const symptomCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const symptoms = Array.from(symptomCheckboxes).map(cb => cb.value);

    const notes = document.getElementById('climateNotes').value.trim();

    if (!date || !restingHeartRate || !bodyTemperature || !sweatRate || !hydrationLevel || !heatTolerance || !environmentalTemp) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = climateEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        climateEntries = climateEntries.filter(entry => entry.date !== date);
    }

    // Calculate readiness score (0-100)
    const readinessScore = calculateReadinessScore({
        restingHeartRate,
        bodyTemperature,
        sweatRate,
        hydrationLevel,
        vo2Max,
        heatTolerance,
        symptoms,
        environmentalTemp
    });

    const entry = {
        id: Date.now(),
        date,
        restingHeartRate,
        bodyTemperature,
        sweatRate,
        hydrationLevel,
        vo2Max,
        heatTolerance,
        environmentalTemp,
        symptoms,
        readinessScore: parseFloat(readinessScore.toFixed(1)),
        notes
    };

    climateEntries.push(entry);

    // Sort by date
    climateEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (climateEntries.length > 50) {
        climateEntries = climateEntries.slice(-50);
    }

    localStorage.setItem('climateReadinessEntries', JSON.stringify(climateEntries));

    // Clear form
    document.getElementById('assessmentDate').value = '';
    document.getElementById('restingHeartRate').value = '';
    document.getElementById('bodyTemperature').value = '';
    document.getElementById('sweatRate').value = '';
    document.getElementById('hydrationLevel').value = '';
    document.getElementById('vo2Max').value = '';
    document.getElementById('heatTolerance').value = '';
    document.getElementById('environmentalTemp').value = '';
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('climateNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateAssessmentList();
}

function calculateReadinessScore(metrics) {
    let score = 0;
    let maxScore = 0;

    // Resting Heart Rate (20 points) - Lower is better
    maxScore += 20;
    if (metrics.restingHeartRate <= 60) score += 20;
    else if (metrics.restingHeartRate <= 70) score += 15;
    else if (metrics.restingHeartRate <= 80) score += 10;
    else if (metrics.restingHeartRate <= 90) score += 5;

    // Body Temperature (15 points) - Closer to 36.5-37.0°C is better
    maxScore += 15;
    const tempDiff = Math.abs(metrics.bodyTemperature - 36.8);
    if (tempDiff <= 0.5) score += 15;
    else if (tempDiff <= 1.0) score += 10;
    else if (tempDiff <= 1.5) score += 5;

    // Sweat Rate (15 points) - 500-1000 ml/hour is optimal
    maxScore += 15;
    if (metrics.sweatRate >= 500 && metrics.sweatRate <= 1000) score += 15;
    else if (metrics.sweatRate >= 400 && metrics.sweatRate <= 1200) score += 10;
    else if (metrics.sweatRate >= 300 && metrics.sweatRate <= 1500) score += 5;

    // Hydration Level (15 points)
    maxScore += 15;
    score += (metrics.hydrationLevel / 10) * 15;

    // VO2 Max (10 points) - Higher is better (if provided)
    if (metrics.vo2Max) {
        maxScore += 10;
        if (metrics.vo2Max >= 45) score += 10;
        else if (metrics.vo2Max >= 40) score += 8;
        else if (metrics.vo2Max >= 35) score += 6;
        else if (metrics.vo2Max >= 30) score += 4;
        else if (metrics.vo2Max >= 25) score += 2;
    }

    // Heat Tolerance (10 points)
    maxScore += 10;
    score += (metrics.heatTolerance / 10) * 10;

    // Symptoms penalty (10 points) - Fewer symptoms is better
    maxScore += 10;
    const symptomPenalty = metrics.symptoms.length * 2;
    score += Math.max(0, 10 - symptomPenalty);

    // Environmental temperature adjustment (5 points)
    maxScore += 5;
    if (metrics.environmentalTemp >= 25 && metrics.environmentalTemp <= 35) {
        // Hot conditions - readiness becomes more important
        score += 5;
    } else if (metrics.environmentalTemp >= 15 && metrics.environmentalTemp <= 40) {
        score += 3;
    } else {
        score += 1;
    }

    return (score / maxScore) * 100;
}

function getReadinessStatus(score) {
    if (score >= 80) return { status: 'Excellent', class: 'excellent' };
    if (score >= 65) return { status: 'Good', class: 'good' };
    if (score >= 50) return { status: 'Fair', class: 'fair' };
    return { status: 'Poor', class: 'poor' };
}

function getHeatToleranceLevel(tolerance) {
    if (tolerance >= 8) return 'High';
    if (tolerance >= 6) return 'Moderate';
    if (tolerance >= 4) return 'Low';
    return 'Very Low';
}

function getHydrationStatus(level) {
    if (level >= 8) return 'Well Hydrated';
    if (level >= 6) return 'Adequately Hydrated';
    if (level >= 4) return 'Mildly Dehydrated';
    return 'Significantly Dehydrated';
}

function getCardioFitness(vo2Max) {
    if (!vo2Max) return 'Unknown';
    if (vo2Max >= 45) return 'Excellent';
    if (vo2Max >= 40) return 'Good';
    if (vo2Max >= 35) return 'Fair';
    return 'Needs Improvement';
}

function updateStats() {
    const totalAssessments = climateEntries.length;

    if (totalAssessments === 0) {
        document.getElementById('currentReadinessScore').textContent = '0/100';
        document.getElementById('heatToleranceLevel').textContent = 'Unknown';
        document.getElementById('hydrationStatus').textContent = 'Unknown';
        document.getElementById('cardioFitness').textContent = 'Unknown';
        return;
    }

    // Current readiness score (latest entry)
    const latestEntry = climateEntries[climateEntries.length - 1];
    const currentScore = latestEntry.readinessScore;
    const status = getReadinessStatus(currentScore);

    document.getElementById('currentReadinessScore').textContent = `${currentScore}/100`;
    document.getElementById('currentReadinessScore').className = `stat-value readiness-${status.class}`;

    // Heat tolerance level
    const avgHeatTolerance = climateEntries.reduce((sum, entry) => sum + entry.heatTolerance, 0) / totalAssessments;
    document.getElementById('heatToleranceLevel').textContent = getHeatToleranceLevel(avgHeatTolerance);

    // Hydration status
    const avgHydration = climateEntries.reduce((sum, entry) => sum + entry.hydrationLevel, 0) / totalAssessments;
    document.getElementById('hydrationStatus').textContent = getHydrationStatus(avgHydration);

    // Cardiovascular fitness
    const vo2Entries = climateEntries.filter(entry => entry.vo2Max);
    if (vo2Entries.length > 0) {
        const avgVo2Max = vo2Entries.reduce((sum, entry) => sum + entry.vo2Max, 0) / vo2Entries.length;
        document.getElementById('cardioFitness').textContent = getCardioFitness(avgVo2Max);
    } else {
        document.getElementById('cardioFitness').textContent = 'Unknown';
    }
}

function updateChart() {
    const ctx = document.getElementById('readinessChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = climateEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const readinessScores = chartEntries.map(entry => entry.readinessScore);
    const bodyTemperatures = chartEntries.map(entry => entry.bodyTemperature);
    const restingHeartRates = chartEntries.map(entry => entry.restingHeartRate);
    const environmentalTemps = chartEntries.map(entry => entry.environmentalTemp);

    // Reference lines
    const excellentLine = new Array(readinessScores.length).fill(80);
    const goodLine = new Array(readinessScores.length).fill(65);
    const fairLine = new Array(readinessScores.length).fill(50);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Readiness Score',
                data: readinessScores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Body Temperature (°C)',
                data: bodyTemperatures,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Resting Heart Rate (bpm)',
                data: restingHeartRates,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Environmental Temp (°C)',
                data: environmentalTemps,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Excellent (≥80)',
                data: excellentLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Good (≥65)',
                data: goodLine,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Fair (≥50)',
                data: fairLine,
                borderColor: '#ffc107',
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
                        text: 'Readiness Score'
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
                        text: 'Temperature (°C)'
                    },
                    min: 30,
                    max: 45,
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
                        text: 'Heart Rate (bpm)'
                    },
                    min: 40,
                    max: 120,
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

    if (climateEntries.length < 3) {
        insightsDiv.innerHTML = '<p>Log at least 3 climate readiness assessments to receive personalized insights about your adaptation to environmental challenges.</p>';
        return;
    }

    // Analyze patterns
    const avgReadiness = climateEntries.reduce((sum, entry) => sum + entry.readinessScore, 0) / climateEntries.length;
    const avgBodyTemp = climateEntries.reduce((sum, entry) => sum + entry.bodyTemperature, 0) / climateEntries.length;
    const avgHeartRate = climateEntries.reduce((sum, entry) => sum + entry.restingHeartRate, 0) / climateEntries.length;
    const avgHydration = climateEntries.reduce((sum, entry) => sum + entry.hydrationLevel, 0) / climateEntries.length;

    // Analyze environmental temperature impact
    const hotWeatherEntries = climateEntries.filter(entry => entry.environmentalTemp >= 25);
    const coldWeatherEntries = climateEntries.filter(entry => entry.environmentalTemp <= 15);

    let insights = '<p>Based on your climate adaptation assessments:</p><ul>';

    if (avgReadiness >= 75) {
        insights += '<li><strong>Excellent climate readiness!</strong> Your physiological markers indicate strong adaptation to environmental challenges. Continue your current practices.</li>';
    } else if (avgReadiness >= 60) {
        insights += '<li><strong>Good climate adaptation.</strong> You\'re generally well-prepared, but there may be opportunities for improvement in specific areas.</li>';
    } else {
        insights += '<li><strong>Climate adaptation needs attention.</strong> Consider focusing on hydration, heat acclimation, and cardiovascular fitness to improve your environmental resilience.</li>';
    }

    if (avgBodyTemp > 37.2) {
        insights += '<li><strong>Elevated body temperature detected.</strong> Your average body temperature suggests you may benefit from better heat dissipation strategies or heat acclimation training.</li>';
    }

    if (avgHeartRate > 75) {
        insights += '<li><strong>Elevated resting heart rate.</strong> Consider cardiovascular training and stress management to improve your baseline cardiovascular fitness.</li>';
    }

    if (avgHydration < 7) {
        insights += '<li><strong>Hydration optimization needed.</strong> Your hydration levels suggest you may benefit from improved fluid intake strategies, especially in hot conditions.</li>';
    }

    if (hotWeatherEntries.length > 0) {
        const hotWeatherAvg = hotWeatherEntries.reduce((sum, entry) => sum + entry.readinessScore, 0) / hotWeatherEntries.length;
        if (hotWeatherAvg < 70) {
            insights += '<li><strong>Hot weather vulnerability.</strong> Your readiness scores are lower in hot conditions. Consider heat acclimation protocols and improved hydration strategies.</li>';
        }
    }

    // Symptom analysis
    const allSymptoms = climateEntries.flatMap(entry => entry.symptoms);
    const symptomFrequency = {};
    allSymptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
    });

    const mostCommonSymptoms = Object.entries(symptomFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2);

    if (mostCommonSymptoms.length > 0) {
        insights += `<li><strong>Common symptoms:</strong> ${mostCommonSymptoms.map(([symptom, count]) => `${symptom.replace(/([A-Z])/g, ' $1').toLowerCase()} (${count} times)`).join(', ')}. Address these through targeted interventions.</li>`;
    }

    insights += '<li><strong>Improvement strategies:</strong> Gradual heat exposure, electrolyte balance monitoring, cardiovascular training, and consistent hydration can significantly improve your climate adaptation readiness.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateAssessmentList() {
    const assessmentList = document.getElementById('assessmentList');
    assessmentList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = climateEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'assessment-entry';

        const readinessStatus = getReadinessStatus(entry.readinessScore);

        entryDiv.innerHTML = `
            <div class="assessment-header">
                <div class="assessment-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="readiness-score ${readinessStatus.class}">${readinessStatus.status} (${entry.readinessScore})</div>
            </div>
            <div class="assessment-details">
                <div class="detail-item">
                    <div class="detail-label">Heart Rate</div>
                    <div class="detail-value">${entry.restingHeartRate} bpm</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Body Temp</div>
                    <div class="detail-value">${entry.bodyTemperature}°C</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sweat Rate</div>
                    <div class="detail-value">${entry.sweatRate} ml/h</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Hydration</div>
                    <div class="detail-value">${entry.hydrationLevel}/10</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Heat Tolerance</div>
                    <div class="detail-value">${entry.heatTolerance}/10</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Env Temp</div>
                    <div class="detail-value">${entry.environmentalTemp}°C</div>
                </div>
            </div>
            ${entry.symptoms.length > 0 ? `<div class="symptoms-display">${entry.symptoms.map(symptom => `<span class="symptom-tag">${symptom.replace(/([A-Z])/g, ' $1')}</span>`).join('')}</div>` : ''}
            ${entry.notes ? `<div class="assessment-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        assessmentList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this climate assessment?')) {
        climateEntries = climateEntries.filter(entry => entry.id !== id);
        localStorage.setItem('climateReadinessEntries', JSON.stringify(climateEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateAssessmentList();
    }
}

// Form submission
document.getElementById('climateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logAssessment();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assessmentDate').value = today;

    updateStats();
    updateChart();
    updateInsights();
    updateAssessmentList();
});