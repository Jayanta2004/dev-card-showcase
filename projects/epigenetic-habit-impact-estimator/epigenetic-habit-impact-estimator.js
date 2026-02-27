// epigenetic-habit-impact-estimator.js

let assessments = JSON.parse(localStorage.getItem('epigeneticAssessments')) || [];

function calculateImpact() {
    // Get all input values
    const exerciseIntensity = parseInt(document.getElementById('exerciseIntensity').value);
    const exerciseDuration = parseInt(document.getElementById('exerciseDuration').value);
    const dietQuality = parseInt(document.getElementById('dietQuality').value);
    const processedFood = parseInt(document.getElementById('processedFood').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
    const stressLevel = parseInt(document.getElementById('stressLevel').value);
    const meditationTime = parseInt(document.getElementById('meditationTime').value);
    const alcoholIntake = parseInt(document.getElementById('alcoholIntake').value);
    const smokingAmount = parseInt(document.getElementById('smokingAmount').value);
    const airQuality = parseInt(document.getElementById('airQuality').value);
    const sunExposure = parseInt(document.getElementById('sunExposure').value);

    // Calculate epigenetic scores (0-100 scale, higher is better)
    const methylationScore = calculateMethylationScore(
        exerciseIntensity, exerciseDuration, dietQuality, processedFood,
        sleepHours, sleepQuality, stressLevel, meditationTime,
        alcoholIntake, smokingAmount, airQuality, sunExposure
    );

    const histoneScore = calculateHistoneScore(
        exerciseIntensity, exerciseDuration, dietQuality, processedFood,
        sleepHours, sleepQuality, stressLevel, meditationTime,
        alcoholIntake, smokingAmount, airQuality, sunExposure
    );

    const telomereScore = calculateTelomereScore(
        exerciseIntensity, exerciseDuration, dietQuality, processedFood,
        sleepHours, sleepQuality, stressLevel, meditationTime,
        alcoholIntake, smokingAmount, airQuality, sunExposure
    );

    const overallScore = Math.round((methylationScore + histoneScore + telomereScore) / 3);

    // Display results
    document.getElementById('overallScore').textContent = overallScore;
    document.getElementById('methylationBar').style.width = `${methylationScore}%`;
    document.getElementById('methylationScore').textContent = `${methylationScore}%`;
    document.getElementById('histoneBar').style.width = `${histoneScore}%`;
    document.getElementById('histoneScore').textContent = `${histoneScore}%`;
    document.getElementById('telomereBar').style.width = `${telomereScore}%`;
    document.getElementById('telomereScore').textContent = `${telomereScore}%`;

    // Generate recommendations
    generateRecommendations(overallScore, methylationScore, histoneScore, telomereScore);

    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function calculateMethylationScore(exerciseI, exerciseD, dietQ, processedF, sleepH, sleepQ, stressL, meditationT, alcoholI, smokingA, airQ, sunE) {
    let score = 50; // Base score

    // Exercise impact (positive)
    score += (exerciseI * 2) + (exerciseD / 10);

    // Diet impact (positive for quality, negative for processed)
    score += (dietQ * 3) - (processedF / 2);

    // Sleep impact
    score += (sleepH * 2) + (sleepQ * 1.5);

    // Stress and meditation
    score -= (stressL * 2);
    score += (meditationT / 2);

    // Substance impact (negative)
    score -= (alcoholI * 1.5);
    score -= (smokingA * 3);

    // Environmental factors
    score += (airQ * 1.5);
    score += (sunE / 5);

    return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateHistoneScore(exerciseI, exerciseD, dietQ, processedF, sleepH, sleepQ, stressL, meditationT, alcoholI, smokingA, airQ, sunE) {
    let score = 50; // Base score

    // Exercise impact (positive)
    score += (exerciseI * 1.5) + (exerciseD / 15);

    // Diet impact
    score += (dietQ * 2.5) - (processedF / 3);

    // Sleep impact
    score += (sleepH * 1.8) + (sleepQ * 1.2);

    // Stress and meditation
    score -= (stressL * 1.8);
    score += (meditationT / 3);

    // Substance impact
    score -= (alcoholI * 1.2);
    score -= (smokingA * 2.5);

    // Environmental factors
    score += (airQ * 1.2);
    score += (sunE / 6);

    return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateTelomereScore(exerciseI, exerciseD, dietQ, processedF, sleepH, sleepQ, stressL, meditationT, alcoholI, smokingA, airQ, sunE) {
    let score = 50; // Base score

    // Exercise impact (positive)
    score += (exerciseI * 2.5) + (exerciseD / 8);

    // Diet impact
    score += (dietQ * 3.5) - (processedF / 1.5);

    // Sleep impact
    score += (sleepH * 2.2) + (sleepQ * 1.8);

    // Stress and meditation
    score -= (stressL * 2.5);
    score += (meditationT / 1.5);

    // Substance impact (highly negative for telomeres)
    score -= (alcoholI * 2);
    score -= (smokingA * 4);

    // Environmental factors
    score += (airQ * 1.8);
    score += (sunE / 4);

    return Math.max(0, Math.min(100, Math.round(score)));
}

function generateRecommendations(overall, methylation, histone, telomere) {
    const recommendations = [];

    if (overall < 60) {
        recommendations.push("Overall epigenetic health needs improvement. Focus on lifestyle changes.");
    }

    if (methylation < 70) {
        recommendations.push("Improve DNA methylation: Increase folate-rich foods, reduce processed foods, and manage stress.");
    }

    if (histone < 70) {
        recommendations.push("Enhance histone modification: Incorporate more antioxidants and omega-3s in your diet.");
    }

    if (telomere < 70) {
        recommendations.push("Protect telomere length: Quit smoking, reduce alcohol, and maintain regular exercise.");
    }

    if (recommendations.length === 0) {
        recommendations.push("Great job! Your epigenetic profile looks healthy. Continue your current habits.");
    }

    const list = document.getElementById('recommendationList');
    list.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        list.appendChild(li);
    });
}

function saveAssessment() {
    const assessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        overallScore: parseInt(document.getElementById('overallScore').textContent),
        methylationScore: parseInt(document.getElementById('methylationScore').textContent),
        histoneScore: parseInt(document.getElementById('histoneScore').textContent),
        telomereScore: parseInt(document.getElementById('telomereScore').textContent),
        habits: {
            exerciseIntensity: document.getElementById('exerciseIntensity').value,
            exerciseDuration: document.getElementById('exerciseDuration').value,
            dietQuality: document.getElementById('dietQuality').value,
            processedFood: document.getElementById('processedFood').value,
            sleepHours: document.getElementById('sleepHours').value,
            sleepQuality: document.getElementById('sleepQuality').value,
            stressLevel: document.getElementById('stressLevel').value,
            meditationTime: document.getElementById('meditationTime').value,
            alcoholIntake: document.getElementById('alcoholIntake').value,
            smokingAmount: document.getElementById('smokingAmount').value,
            airQuality: document.getElementById('airQuality').value,
            sunExposure: document.getElementById('sunExposure').value
        }
    };

    assessments.push(assessment);
    localStorage.setItem('epigeneticAssessments', JSON.stringify(assessments));

    updateHistory();
    updateChart();

    alert('Assessment saved successfully!');
}

function updateHistory() {
    const historyDiv = document.getElementById('assessmentHistory');
    historyDiv.innerHTML = '';

    assessments.slice(-5).reverse().forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <strong>${new Date(assessment.date).toLocaleDateString()}</strong><br>
            Overall Score: ${assessment.overallScore}/100<br>
            DNA Methylation: ${assessment.methylationScore}% | Histone: ${assessment.histoneScore}% | Telomere: ${assessment.telomereScore}%
        `;
        historyDiv.appendChild(item);
    });
}

function updateChart() {
    const ctx = document.getElementById('epigeneticChart').getContext('2d');

    const data = assessments.map(assessment => ({
        x: new Date(assessment.date),
        y: assessment.overallScore
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Overall Epigenetic Score',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Update range input displays
document.addEventListener('DOMContentLoaded', function() {
    // Range input listeners
    const ranges = ['exerciseIntensity', 'dietQuality', 'sleepQuality', 'stressLevel', 'airQuality'];
    ranges.forEach(id => {
        const input = document.getElementById(id);
        const display = document.getElementById(id.replace('Intensity', 'Value').replace('Quality', 'Value').replace('Level', 'Value').replace('airQuality', 'airValue'));
        if (display) {
            input.addEventListener('input', () => display.textContent = input.value);
        }
    });

    updateHistory();
    updateChart();
});