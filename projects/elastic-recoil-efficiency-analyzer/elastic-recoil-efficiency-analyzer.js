// elastic-recoil-efficiency-analyzer.js

let analysisHistory = JSON.parse(localStorage.getItem('elasticRecoilHistory')) || [];
let currentEfficiency = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    updateStats();
    renderChart();

    document.getElementById('movementType').addEventListener('change', toggleCustomMovement);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeEfficiency);
});

function toggleCustomMovement() {
    const select = document.getElementById('movementType');
    const customInput = document.getElementById('customMovement');

    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
    }
}

function analyzeEfficiency() {
    const movementType = document.getElementById('movementType').value;
    let movementName = movementType;

    if (movementType === 'custom') {
        movementName = document.getElementById('customMovement').value.trim();
        if (!movementName) {
            alert('Please enter a custom movement name.');
            return;
        }
    }

    // Get factor values
    const landing = parseInt(document.getElementById('landing').value);
    const pushOff = parseInt(document.getElementById('pushOff').value);
    const timing = parseInt(document.getElementById('timing').value);
    const flexibility = parseInt(document.getElementById('flexibility').value);
    const strength = parseInt(document.getElementById('strength').value);
    const fatigue = parseInt(document.getElementById('fatigue').value);

    // Calculate efficiency score (weighted average)
    const techniqueScore = (landing + pushOff + timing) / 3;
    const physicalScore = (flexibility + strength + fatigue) / 3;
    const efficiency = Math.round((techniqueScore * 0.6 + physicalScore * 0.4) * 20); // Convert to percentage

    // Calculate energy return (based on technique and strength)
    const energyReturn = Math.round((techniqueScore * 0.7 + strength * 0.3) * 20);

    // Calculate form quality
    const formQuality = Math.round((techniqueScore + physicalScore) / 2);

    // Determine risk level
    let riskLevel = 'Low';
    if (efficiency < 40) riskLevel = 'High';
    else if (efficiency < 70) riskLevel = 'Moderate';

    currentEfficiency = efficiency;

    // Update display
    updateEfficiencyDisplay(efficiency, energyReturn, formQuality, riskLevel);

    // Generate recommendations
    generateRecommendations(efficiency, landing, pushOff, timing, flexibility, strength, fatigue);

    // Save to history
    saveAnalysis(movementName, efficiency, energyReturn, formQuality, riskLevel);

    // Update stats and chart
    updateStats();
    renderChart();
}

function updateEfficiencyDisplay(efficiency, energyReturn, formQuality, riskLevel) {
    // Update gauge
    const fill = document.getElementById('efficiencyFill');
    const score = document.getElementById('efficiencyScore');
    const label = document.getElementById('efficiencyLabel');

    fill.style.transform = `rotate(${efficiency * 3.6}deg)`; // 3.6 degrees per percent
    score.textContent = `${efficiency}%`;

    if (efficiency < 40) {
        label.textContent = 'Poor';
        label.style.color = '#d32f2f';
    } else if (efficiency < 70) {
        label.textContent = 'Good';
        label.style.color = '#f57c00';
    } else {
        label.textContent = 'Excellent';
        label.style.color = '#388e3c';
    }

    // Update details
    document.getElementById('energyReturn').textContent = `${energyReturn}%`;
    document.getElementById('formQuality').textContent = `${formQuality}/10`;

    const riskElement = document.getElementById('riskLevel');
    riskElement.textContent = riskLevel;
    if (riskLevel === 'High') riskElement.style.color = '#d32f2f';
    else if (riskLevel === 'Moderate') riskElement.style.color = '#f57c00';
    else riskElement.style.color = '#388e3c';
}

function generateRecommendations(efficiency, landing, pushOff, timing, flexibility, strength, fatigue) {
    const recommendations = document.getElementById('recommendations');
    recommendations.innerHTML = '';

    const recs = [];

    if (landing < 3) {
        recs.push({
            priority: 'High',
            text: 'Focus on improving landing technique. Practice soft, controlled landings with bent knees and proper foot positioning.'
        });
    }

    if (pushOff < 3) {
        recs.push({
            priority: 'High',
            text: 'Increase push-off power through explosive strength training. Incorporate plyometric exercises and strength training for lower body.'
        });
    }

    if (timing < 3) {
        recs.push({
            priority: 'Medium',
            text: 'Work on movement timing and rhythm. Practice with a metronome or coach to improve coordination.'
        });
    }

    if (flexibility < 3) {
        recs.push({
            priority: 'Medium',
            text: 'Improve joint flexibility through stretching and mobility exercises. Focus on ankles, knees, and hips.'
        });
    }

    if (strength < 3) {
        recs.push({
            priority: 'High',
            text: 'Build elastic strength with resistance training. Include exercises like squats, lunges, and calf raises.'
        });
    }

    if (fatigue > 3) {
        recs.push({
            priority: 'Low',
            text: 'Allow more recovery time. Current fatigue levels may be affecting performance.'
        });
    }

    if (efficiency < 50) {
        recs.push({
            priority: 'High',
            text: 'Consider consulting a coach or physical therapist for personalized technique analysis.'
        });
    }

    if (recs.length === 0) {
        recs.push({
            priority: 'Low',
            text: 'Great job! Your elastic recoil efficiency is excellent. Continue maintaining good form and training consistency.'
        });
    }

    recs.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'recommendation-item';
        div.innerHTML = `
            <span class="recommendation-priority">${rec.priority} Priority:</span>
            <span class="recommendation-text">${rec.text}</span>
        `;
        recommendations.appendChild(div);
    });
}

function saveAnalysis(movement, efficiency, energyReturn, formQuality, riskLevel) {
    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        movement: movement,
        efficiency: efficiency,
        energyReturn: energyReturn,
        formQuality: formQuality,
        riskLevel: riskLevel
    };

    analysisHistory.unshift(entry);
    if (analysisHistory.length > 50) analysisHistory = analysisHistory.slice(0, 50);

    saveHistory();
    loadHistory();
}

function loadHistory() {
    const historyLog = document.getElementById('historyLog');
    historyLog.innerHTML = '';

    if (analysisHistory.length === 0) {
        historyLog.innerHTML = '<p>No analysis history yet.</p>';
        return;
    }

    analysisHistory.slice(0, 10).forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-entry';
        div.innerHTML = `
            <div>
                <span class="history-movement">${entry.movement}</span>
                <span class="history-date">${new Date(entry.date).toLocaleDateString()}</span>
            </div>
            <span class="history-score">${entry.efficiency}%</span>
        `;
        historyLog.appendChild(div);
    });
}

function updateStats() {
    if (analysisHistory.length === 0) {
        document.getElementById('avgEfficiency').textContent = '0%';
        document.getElementById('bestMovement').textContent = '-';
        document.getElementById('improvementRate').textContent = '0%';
        document.getElementById('analysisCount').textContent = '0';
        return;
    }

    // Average efficiency
    const avgEfficiency = Math.round(analysisHistory.reduce((sum, entry) => sum + entry.efficiency, 0) / analysisHistory.length);
    document.getElementById('avgEfficiency').textContent = `${avgEfficiency}%`;

    // Best movement
    const bestEntry = analysisHistory.reduce((best, entry) => entry.efficiency > best.efficiency ? entry : best);
    document.getElementById('bestMovement').textContent = bestEntry.movement;

    // Improvement rate (compare first 5 vs last 5)
    let improvementRate = 0;
    if (analysisHistory.length >= 10) {
        const firstFive = analysisHistory.slice(-5);
        const lastFive = analysisHistory.slice(0, 5);
        const firstAvg = firstFive.reduce((sum, entry) => sum + entry.efficiency, 0) / 5;
        const lastAvg = lastFive.reduce((sum, entry) => sum + entry.efficiency, 0) / 5;
        improvementRate = Math.round(((lastAvg - firstAvg) / firstAvg) * 100);
    }
    document.getElementById('improvementRate').textContent = `${improvementRate > 0 ? '+' : ''}${improvementRate}%`;

    // Analysis count
    document.getElementById('analysisCount').textContent = analysisHistory.length;
}

function renderChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');

    // Get last 10 analyses
    const recentAnalyses = analysisHistory.slice(0, 10).reverse();
    const labels = recentAnalyses.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const data = recentAnalyses.map(entry => entry.efficiency);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Efficiency Score (%)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.4,
                pointBackgroundColor: '#4fd1ff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function saveHistory() {
    localStorage.setItem('elasticRecoilHistory', JSON.stringify(analysisHistory));
}