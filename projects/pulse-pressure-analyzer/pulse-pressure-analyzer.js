// Pulse Pressure Analyzer JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    loadData();
    initializeCharts();
    updateDisplay();

    const form = document.getElementById('bpForm');
    form.addEventListener('submit', handleFormSubmit);

    // Chart view controls
    document.getElementById('viewWeek').addEventListener('click', () => switchChartView('week'));
    document.getElementById('viewMonth').addEventListener('click', () => switchChartView('month'));
    document.getElementById('viewQuarter').addEventListener('click', () => switchChartView('quarter'));

    // Set default measurement time to now
    document.getElementById('measurementTime').value = new Date().toISOString().slice(0, 16);
});

let trendsChart = null;
let currentChartView = 'week';

function initializeForm() {
    // Add input validation
    const systolicInput = document.getElementById('systolic');
    const diastolicInput = document.getElementById('diastolic');

    systolicInput.addEventListener('input', validateBPInputs);
    diastolicInput.addEventListener('input', validateBPInputs);
}

function validateBPInputs() {
    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);

    if (systolic && diastolic && systolic <= diastolic) {
        showInputError('Systolic pressure should be higher than diastolic pressure');
        return false;
    }

    clearInputError();
    return true;
}

function showInputError(message) {
    clearInputError();
    const form = document.getElementById('bpForm');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.textContent = message;
    form.appendChild(errorDiv);
}

function clearInputError() {
    const existingError = document.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);
    const measurementTime = document.getElementById('measurementTime').value;
    const position = document.getElementById('position').value;
    const arm = document.getElementById('arm').value;
    const notes = document.getElementById('notes').value.trim();

    if (!validateBPInputs()) {
        return;
    }

    if (systolic < 80 || systolic > 250 || diastolic < 40 || diastolic > 150) {
        showNotification('Blood pressure values seem unusual. Please verify your readings.', 'warning');
    }

    const pulsePressure = systolic - diastolic;
    const analysis = analyzePulsePressure(pulsePressure, systolic, diastolic);

    const readingData = {
        timestamp: new Date(measurementTime).toISOString(),
        systolic: systolic,
        diastolic: diastolic,
        pulsePressure: pulsePressure,
        position: position,
        arm: arm,
        notes: notes,
        category: analysis.category,
        riskLevel: analysis.riskLevel,
        alerts: analysis.alerts,
        date: new Date(measurementTime).toDateString()
    };

    saveReading(readingData);
    displayResults(readingData, analysis);
    updateChart();
    updateDisplay();

    // Reset form but keep time as current
    document.getElementById('bpForm').reset();
    document.getElementById('measurementTime').value = new Date().toISOString().slice(0, 16);

    showNotification('Blood pressure reading saved successfully!', 'success');
}

function analyzePulsePressure(pp, sbp, dbp) {
    let category = '';
    let riskLevel = '';
    let alerts = [];

    // Pulse Pressure Categories (general guidelines)
    if (pp < 40) {
        category = 'Low';
        riskLevel = 'Low';
        alerts.push('Low pulse pressure may indicate hypovolemia or aortic stenosis');
    } else if (pp >= 40 && pp <= 60) {
        category = 'Normal';
        riskLevel = 'Low';
    } else if (pp > 60 && pp <= 80) {
        category = 'Elevated';
        riskLevel = 'Moderate';
        alerts.push('Elevated pulse pressure may indicate arterial stiffness');
    } else {
        category = 'High';
        riskLevel = 'High';
        alerts.push('High pulse pressure increases cardiovascular risk');
        alerts.push('Consider consulting healthcare provider');
    }

    // Additional checks based on SBP and DBP
    if (sbp >= 140 || dbp >= 90) {
        alerts.push('Hypertension detected - monitor closely');
        riskLevel = riskLevel === 'High' ? 'High' : 'Moderate';
    }

    if (sbp < 90 || dbp < 60) {
        alerts.push('Hypotension detected - ensure adequate hydration');
    }

    return {
        category: category,
        riskLevel: riskLevel,
        alerts: alerts,
        arterialStiffness: getArterialStiffnessIndicator(pp),
        ageAdjustedRange: getAgeAdjustedRange(pp)
    };
}

function getArterialStiffnessIndicator(pp) {
    if (pp <= 50) return 'Good arterial compliance';
    if (pp <= 70) return 'Normal arterial stiffness';
    if (pp <= 90) return 'Increased arterial stiffness';
    return 'Significant arterial stiffness';
}

function getAgeAdjustedRange(pp) {
    // General age-adjusted ranges (these are approximate)
    const age = new Date().getFullYear() - 1990; // Rough age estimation
    if (age < 30) return '30-45 mmHg';
    if (age < 50) return '35-50 mmHg';
    if (age < 70) return '40-60 mmHg';
    return '45-65 mmHg';
}

function displayResults(reading, analysis) {
    document.getElementById('resultsDisplay').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';

    // Update pulse pressure display
    document.getElementById('pulsePressure').textContent = reading.pulsePressure;
    document.getElementById('ppCategory').textContent = analysis.category;

    // Update category styling
    const categoryElement = document.getElementById('ppCategory');
    categoryElement.className = 'pp-category';
    categoryElement.classList.add(`category-${analysis.category.toLowerCase()}`);

    // Update health insights
    document.getElementById('cvRisk').textContent = analysis.riskLevel;
    document.getElementById('cvRisk').className = `risk-${analysis.riskLevel.toLowerCase()}`;

    document.getElementById('arterialStiffness').textContent = analysis.arterialStiffness;
    document.getElementById('ageRange').textContent = analysis.ageAdjustedRange;

    // Show alerts if any
    if (analysis.alerts.length > 0) {
        document.getElementById('alertsSection').style.display = 'block';
        const alertsList = document.getElementById('alertsList');
        alertsList.innerHTML = analysis.alerts.map(alert =>
            `<div class="alert-item">${alert}</div>`
        ).join('');
    } else {
        document.getElementById('alertsSection').style.display = 'none';
    }
}

function saveReading(readingData) {
    const readings = getStoredReadings();
    readings.push(readingData);
    localStorage.setItem('pulsePressureReadings', JSON.stringify(readings));
}

function getStoredReadings() {
    const stored = localStorage.getItem('pulsePressureReadings');
    return stored ? JSON.parse(stored) : [];
}

function initializeCharts() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Pulse Pressure (mmHg)',
                data: [],
                borderColor: '#e53e3e',
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#e53e3e',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Systolic BP',
                data: [],
                borderColor: '#3182ce',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 4,
                tension: 0.4
            }, {
                label: 'Diastolic BP',
                data: [],
                borderColor: '#38a169',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 4,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Pulse Pressure: ${context.parsed.y} mmHg`;
                            } else if (context.datasetIndex === 1) {
                                return `Systolic: ${context.parsed.y} mmHg`;
                            } else {
                                return `Diastolic: ${context.parsed.y} mmHg`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Pressure (mmHg)'
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

    updateChart();
}

function updateChart() {
    if (!trendsChart) return;

    const readings = getStoredReadings();
    let filteredReadings = readings;

    // Filter based on current view
    const now = new Date();
    if (currentChartView === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredReadings = readings.filter(r => new Date(r.timestamp) >= weekAgo);
    } else if (currentChartView === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredReadings = readings.filter(r => new Date(r.timestamp) >= monthAgo);
    } else if (currentChartView === 'quarter') {
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filteredReadings = readings.filter(r => new Date(r.timestamp) >= quarterAgo);
    }

    // Sort by timestamp
    filteredReadings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = filteredReadings.map(r => {
        const date = new Date(r.timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    });

    const ppData = filteredReadings.map(r => r.pulsePressure);
    const sbpData = filteredReadings.map(r => r.systolic);
    const dbpData = filteredReadings.map(r => r.diastolic);

    trendsChart.data.labels = labels;
    trendsChart.data.datasets[0].data = ppData;
    trendsChart.data.datasets[1].data = sbpData;
    trendsChart.data.datasets[2].data = dbpData;
    trendsChart.update();

    updateTrendStats(filteredReadings);
}

function updateTrendStats(readings) {
    if (readings.length === 0) {
        document.getElementById('avgPP').textContent = '-- mmHg';
        document.getElementById('ppRange').textContent = '-- mmHg';
        document.getElementById('ppTrend').textContent = '--';
        document.getElementById('ppConsistency').textContent = '--%';
        return;
    }

    const ppValues = readings.map(r => r.pulsePressure);
    const avgPP = ppValues.reduce((a, b) => a + b, 0) / ppValues.length;
    const minPP = Math.min(...ppValues);
    const maxPP = Math.max(...ppValues);

    document.getElementById('avgPP').textContent = avgPP.toFixed(1) + ' mmHg';
    document.getElementById('ppRange').textContent = `${minPP}-${maxPP} mmHg`;

    // Calculate trend
    if (readings.length >= 2) {
        const firstHalf = ppValues.slice(0, Math.floor(ppValues.length / 2));
        const secondHalf = ppValues.slice(Math.floor(ppValues.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const trendElement = document.getElementById('ppTrend');
        if (secondAvg > firstAvg + 5) {
            trendElement.textContent = 'Increasing';
            trendElement.style.color = '#e53e3e';
        } else if (secondAvg < firstAvg - 5) {
            trendElement.textContent = 'Decreasing';
            trendElement.style.color = '#38a169';
        } else {
            trendElement.textContent = 'Stable';
            trendElement.style.color = '#718096';
        }
    }

    // Calculate consistency (coefficient of variation)
    const mean = avgPP;
    const variance = ppValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / ppValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100;
    const consistency = Math.max(0, 100 - cv * 2); // Higher consistency = lower CV

    document.getElementById('ppConsistency').textContent = consistency.toFixed(1) + '%';
}

function switchChartView(view) {
    currentChartView = view;

    // Update button states
    document.getElementById('viewWeek').classList.toggle('active', view === 'week');
    document.getElementById('viewMonth').classList.toggle('active', view === 'month');
    document.getElementById('viewQuarter').classList.toggle('active', view === 'quarter');

    updateChart();
}

function updateDisplay() {
    const readings = getStoredReadings();

    // Update statistics
    document.getElementById('totalReadings').textContent = readings.length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyReadings = readings.filter(r => new Date(r.timestamp) >= weekAgo);
    document.getElementById('weeklyReadings').textContent = weeklyReadings.length;

    // Calculate risk distribution
    if (readings.length > 0) {
        const normalReadings = readings.filter(r => r.category === 'Normal').length;
        const highRiskReadings = readings.filter(r => r.riskLevel === 'High').length;

        const normalPercent = (normalReadings / readings.length * 100).toFixed(1);
        const highRiskPercent = (highRiskReadings / readings.length * 100).toFixed(1);

        document.getElementById('normalRange').textContent = normalPercent + '%';
        document.getElementById('highRisk').textContent = highRiskPercent + '%';
    }

    // Update recommendations
    updateRecommendations(readings);

    // Update history table
    updateHistoryTable(readings);
}

function updateRecommendations(readings) {
    if (readings.length < 3) {
        document.getElementById('lifestyleAdvice').textContent = 'Continue monitoring to receive personalized recommendations.';
        document.getElementById('monitoringAdvice').textContent = 'Take readings at consistent times for best trend analysis.';
        document.getElementById('medicalAdvice').textContent = 'Consult healthcare provider for baseline assessment.';
        return;
    }

    // Analyze patterns and provide recommendations
    const recentReadings = readings.slice(-10);
    const avgPP = recentReadings.reduce((sum, r) => sum + r.pulsePressure, 0) / recentReadings.length;
    const highReadings = recentReadings.filter(r => r.pulsePressure > 60).length;

    let lifestyleAdvice = '';
    if (avgPP > 60) {
        lifestyleAdvice = 'Consider lifestyle modifications: reduce salt intake, increase physical activity, manage stress, and maintain healthy weight.';
    } else if (avgPP < 40) {
        lifestyleAdvice = 'Ensure adequate hydration and monitor for symptoms of low blood pressure.';
    } else {
        lifestyleAdvice = 'Maintain current healthy lifestyle habits. Regular exercise and balanced diet are beneficial.';
    }

    let monitoringAdvice = '';
    if (highReadings > recentReadings.length * 0.3) {
        monitoringAdvice = 'Increased monitoring recommended. Consider daily readings and track lifestyle factors.';
    } else {
        monitoringAdvice = 'Weekly monitoring sufficient. Continue regular check-ups with healthcare provider.';
    }

    let medicalAdvice = '';
    const veryHighReadings = readings.filter(r => r.pulsePressure > 80).length;
    if (veryHighReadings > 0) {
        medicalAdvice = 'High pulse pressure readings detected. Consult healthcare provider for cardiovascular assessment.';
    } else if (readings.some(r => r.alerts.length > 0)) {
        medicalAdvice = 'Some readings have generated alerts. Discuss with healthcare provider for personalized guidance.';
    } else {
        medicalAdvice = 'Readings appear within normal ranges. Continue regular monitoring and annual check-ups.';
    }

    document.getElementById('lifestyleAdvice').textContent = lifestyleAdvice;
    document.getElementById('monitoringAdvice').textContent = monitoringAdvice;
    document.getElementById('medicalAdvice').textContent = medicalAdvice;
}

function updateHistoryTable(readings) {
    const tbody = document.getElementById('historyBody');

    if (readings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No blood pressure readings logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = readings.slice(-15).reverse().map(reading => {
        const date = new Date(reading.timestamp).toLocaleString();
        const bpDisplay = `${reading.systolic}/${reading.diastolic}`;
        const categoryClass = `category-${reading.category.toLowerCase()}`;

        return `
            <tr>
                <td>${date}</td>
                <td>${bpDisplay}</td>
                <td>${reading.pulsePressure} mmHg</td>
                <td><span class="category-badge ${categoryClass}">${reading.category}</span></td>
                <td>${reading.position}</td>
                <td>${reading.notes || '-'}</td>
            </tr>
        `;
    }).join('');
}

function loadData() {
    // Load any existing data on page load
    updateDisplay();
}

function showNotification(message, type = 'info') {
    // Simple notification - you could enhance this with a proper notification system
    alert(message);
}