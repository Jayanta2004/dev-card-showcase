// Heart Age Calculator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

function initApp() {
    // Load navbar
    loadNavbar();

    // Initialize components
    initForm();
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
    const form = document.getElementById('healthForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const data = {
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            systolic: parseInt(document.getElementById('systolic').value),
            diastolic: parseInt(document.getElementById('diastolic').value),
            totalCholesterol: parseInt(document.getElementById('totalCholesterol').value),
            hdl: parseInt(document.getElementById('hdl').value),
            smoking: document.getElementById('smoking').value,
            diabetes: document.getElementById('diabetes').value,
            activity: document.getElementById('activity').value
        };

        const results = calculateHeartAge(data);
        displayResults(results);
        displayRiskFactors(data);
        displayRecommendations(data, results);
    });
}

// Heart age calculation (simplified model based on Framingham risk score)
function calculateHeartAge(data) {
    let riskScore = 0;

    // Age points
    if (data.gender === 'male') {
        if (data.age >= 20 && data.age <= 34) riskScore += 0;
        else if (data.age <= 39) riskScore += 4;
        else if (data.age <= 44) riskScore += 7;
        else if (data.age <= 49) riskScore += 9;
        else if (data.age <= 54) riskScore += 11;
        else if (data.age <= 59) riskScore += 13;
        else if (data.age <= 64) riskScore += 15;
        else if (data.age <= 69) riskScore += 17;
        else riskScore += 19;
    } else {
        if (data.age >= 20 && data.age <= 34) riskScore += 0;
        else if (data.age <= 39) riskScore += 2;
        else if (data.age <= 44) riskScore += 4;
        else if (data.age <= 49) riskScore += 5;
        else if (data.age <= 54) riskScore += 7;
        else if (data.age <= 59) riskScore += 8;
        else if (data.age <= 64) riskScore += 9;
        else if (data.age <= 69) riskScore += 10;
        else riskScore += 11;
    }

    // Blood pressure points
    const avgBP = (data.systolic + data.diastolic) / 2;
    if (data.gender === 'male') {
        if (avgBP < 120) riskScore += 0;
        else if (avgBP <= 129) riskScore += 1;
        else if (avgBP <= 139) riskScore += 2;
        else if (avgBP <= 159) riskScore += 3;
        else riskScore += 4;
    } else {
        if (avgBP < 120) riskScore += 0;
        else if (avgBP <= 129) riskScore += 3;
        else if (avgBP <= 139) riskScore += 4;
        else if (avgBP <= 149) riskScore += 5;
        else if (avgBP <= 159) riskScore += 6;
        else riskScore += 7;
    }

    // Cholesterol points (simplified)
    const cholesterolRatio = data.totalCholesterol / data.hdl;
    if (data.gender === 'male') {
        if (cholesterolRatio < 4.0) riskScore += 0;
        else if (cholesterolRatio <= 4.9) riskScore += 1;
        else if (cholesterolRatio <= 5.9) riskScore += 2;
        else if (cholesterolRatio <= 6.9) riskScore += 3;
        else riskScore += 4;
    } else {
        if (cholesterolRatio < 4.0) riskScore += 0;
        else if (cholesterolRatio <= 4.9) riskScore += 2;
        else if (cholesterolRatio <= 5.9) riskScore += 3;
        else if (cholesterolRatio <= 6.9) riskScore += 4;
        else riskScore += 5;
    }

    // Smoking points
    if (data.smoking === 'current') {
        riskScore += data.gender === 'male' ? 4 : 3;
    } else if (data.smoking === 'former') {
        riskScore += data.gender === 'male' ? 2 : 1;
    }

    // Diabetes points
    if (data.diabetes === 'yes') {
        riskScore += data.gender === 'male' ? 3 : 4;
    }

    // Physical activity adjustment (simplified - reduces risk)
    let activityModifier = 0;
    if (data.activity === 'active' || data.activity === 'very-active') {
        activityModifier = -2;
    } else if (data.activity === 'moderate') {
        activityModifier = -1;
    } else if (data.activity === 'sedentary') {
        activityModifier = 1;
    }

    riskScore += activityModifier;
    riskScore = Math.max(0, riskScore); // Ensure non-negative

    // Convert risk score to heart age (simplified mapping)
    let heartAge;
    if (riskScore <= 5) {
        heartAge = data.age - 5; // Lower risk
    } else if (riskScore <= 10) {
        heartAge = data.age - 2;
    } else if (riskScore <= 15) {
        heartAge = data.age + 2;
    } else if (riskScore <= 20) {
        heartAge = data.age + 5;
    } else {
        heartAge = data.age + 10; // High risk
    }

    heartAge = Math.max(20, Math.min(100, heartAge)); // Clamp to reasonable range

    return {
        chronologicalAge: data.age,
        heartAge: Math.round(heartAge),
        riskScore: riskScore,
        riskLevel: getRiskLevel(riskScore)
    };
}

function getRiskLevel(score) {
    if (score <= 5) return 'low';
    if (score <= 10) return 'moderate-low';
    if (score <= 15) return 'moderate';
    if (score <= 20) return 'moderate-high';
    return 'high';
}

function displayResults(results) {
    const container = document.getElementById('resultsContainer');

    const ageDifference = results.heartAge - results.chronologicalAge;
    const differenceText = ageDifference > 0 ? `${ageDifference} years older` :
                          ageDifference < 0 ? `${Math.abs(ageDifference)} years younger` :
                          'same as your age';

    container.innerHTML = `
        <div class="heart-age-display">
            <div class="heart-age-number">${results.heartAge}</div>
            <div class="heart-age-label">Your Heart Age</div>
            <div class="age-comparison">
                <div class="age-card chronological">
                    <div class="age-value">${results.chronologicalAge}</div>
                    <div class="age-label">Chronological Age</div>
                </div>
                <div class="age-card heart">
                    <div class="age-value">${results.heartAge}</div>
                    <div class="age-label">Heart Age</div>
                </div>
            </div>
            <p style="margin-top: 1rem; font-size: 1.1rem;">
                Your heart is <strong>${differenceText}</strong> than your actual age.
            </p>
        </div>
        <div style="text-align: center; margin-top: 1rem;">
            <p>Risk Level: <strong>${results.riskLevel.replace('-', ' ').toUpperCase()}</strong></p>
        </div>
    `;
}

function displayRiskFactors(data) {
    const container = document.getElementById('riskFactors');

    const factors = [
        { name: 'Blood Pressure', value: `${data.systolic}/${data.diastolic} mmHg`, risk: getBPRisk(data.systolic, data.diastolic) },
        { name: 'Total Cholesterol', value: `${data.totalCholesterol} mg/dL`, risk: getCholesterolRisk(data.totalCholesterol) },
        { name: 'HDL Cholesterol', value: `${data.hdl} mg/dL`, risk: getHDLRisk(data.hdl) },
        { name: 'Smoking Status', value: data.smoking.replace('-', ' '), risk: data.smoking === 'current' ? 'high' : data.smoking === 'former' ? 'moderate' : 'low' },
        { name: 'Diabetes', value: data.diabetes, risk: data.diabetes === 'yes' ? 'high' : 'low' },
        { name: 'Physical Activity', value: data.activity.replace('-', ' '), risk: data.activity === 'sedentary' ? 'high' : data.activity === 'active' || data.activity === 'very-active' ? 'low' : 'moderate' }
    ];

    container.innerHTML = factors.map(factor => `
        <div class="risk-factor ${factor.risk}-risk">
            <div class="risk-factor-name">${factor.name}</div>
            <div class="risk-factor-value">${factor.value}</div>
        </div>
    `).join('');
}

function getBPRisk(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return 'low';
    if (systolic < 130 && diastolic < 80) return 'moderate';
    if (systolic < 140 || diastolic < 90) return 'moderate-high';
    return 'high';
}

function getCholesterolRisk(total) {
    if (total < 200) return 'low';
    if (total < 240) return 'moderate';
    return 'high';
}

function getHDLRisk(hdl) {
    if (hdl >= 60) return 'low';
    if (hdl >= 40) return 'moderate';
    return 'high';
}

function displayRecommendations(data, results) {
    const container = document.getElementById('recommendations');

    const recommendations = [];

    // Blood pressure recommendations
    if (data.systolic >= 130 || data.diastolic >= 80) {
        recommendations.push({
            title: 'Blood Pressure Management',
            text: 'Consider lifestyle changes and consult your doctor about blood pressure management. Aim for less than 120/80 mmHg.'
        });
    }

    // Cholesterol recommendations
    if (data.totalCholesterol >= 240 || data.hdl < 40) {
        recommendations.push({
            title: 'Cholesterol Management',
            text: 'Focus on heart-healthy diet, regular exercise, and consult your doctor about cholesterol-lowering medications if needed.'
        });
    }

    // Smoking recommendations
    if (data.smoking === 'current') {
        recommendations.push({
            title: 'Smoking Cessation',
            text: 'Quitting smoking is the single most important step you can take for your heart health. Seek support and resources to quit.'
        });
    }

    // Diabetes management
    if (data.diabetes === 'yes') {
        recommendations.push({
            title: 'Diabetes Control',
            text: 'Work with your healthcare provider to maintain good blood sugar control, which is crucial for heart health.'
        });
    }

    // Activity recommendations
    if (data.activity === 'sedentary' || data.activity === 'light') {
        recommendations.push({
            title: 'Increase Physical Activity',
            text: 'Aim for at least 150 minutes of moderate exercise per week. Even brisk walking can significantly improve heart health.'
        });
    }

    // General recommendations
    recommendations.push({
        title: 'Heart-Healthy Lifestyle',
        text: 'Adopt a Mediterranean-style diet rich in fruits, vegetables, whole grains, and healthy fats. Maintain a healthy weight and manage stress.'
    });

    if (recommendations.length === 0) {
        recommendations.push({
            title: 'Maintain Healthy Habits',
            text: 'You\'re doing well! Continue your current healthy lifestyle choices and schedule regular check-ups with your healthcare provider.'
        });
    }

    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation">
            <h4>${rec.title}</h4>
            <p>${rec.text}</p>
        </div>
    `).join('');
}