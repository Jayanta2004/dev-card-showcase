// Personalized Health Risk Projection Engine JavaScript

class HealthRiskEngine {
    constructor() {
        this.riskData = {};
        this.loadSavedData();
    }

    loadSavedData() {
        const saved = localStorage.getItem('healthRiskData');
        if (saved) {
            this.riskData = JSON.parse(saved);
            this.populateForm();
        }
    }

    saveData() {
        localStorage.setItem('healthRiskData', JSON.stringify(this.riskData));
    }

    populateForm() {
        Object.keys(this.riskData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.riskData[key];
                } else {
                    element.value = this.riskData[key];
                }
            }
        });
    }

    collectFormData() {
        const formData = {
            age: parseInt(document.getElementById('age').value) || 0,
            gender: document.getElementById('gender').value,
            height: parseInt(document.getElementById('height').value) || 0,
            weight: parseInt(document.getElementById('weight').value) || 0,
            systolicBP: parseInt(document.getElementById('systolicBP').value) || 0,
            diastolicBP: parseInt(document.getElementById('diastolicBP').value) || 0,
            totalCholesterol: parseInt(document.getElementById('totalCholesterol').value) || 0,
            hdlCholesterol: parseInt(document.getElementById('hdlCholesterol').value) || 0,
            bloodSugar: parseInt(document.getElementById('bloodSugar').value) || 0,
            exerciseMinutes: parseInt(document.getElementById('exerciseMinutes').value) || 0,
            smokingStatus: document.getElementById('smokingStatus').value,
            alcoholConsumption: document.getElementById('alcoholConsumption').value,
            familyHeartDisease: document.getElementById('familyHeartDisease').checked,
            familyDiabetes: document.getElementById('familyDiabetes').checked,
            familyCancer: document.getElementById('familyCancer').checked,
            familyStroke: document.getElementById('familyStroke').checked,
            familyHypertension: document.getElementById('familyHypertension').checked
        };

        this.riskData = formData;
        this.saveData();
        return formData;
    }

    calculateBMI(height, weight) {
        if (height > 0 && weight > 0) {
            const heightM = height / 100;
            return weight / (heightM * heightM);
        }
        return 0;
    }

    calculateCardiovascularRisk(data) {
        let risk = 0;

        // Age factor
        if (data.age > 40) risk += (data.age - 40) * 0.5;

        // Gender factor
        if (data.gender === 'male') risk += 5;

        // BMI factor
        const bmi = this.calculateBMI(data.height, data.weight);
        if (bmi > 25) risk += (bmi - 25) * 2;
        if (bmi > 30) risk += 10;

        // Blood pressure factor
        if (data.systolicBP > 120) risk += (data.systolicBP - 120) * 0.3;
        if (data.diastolicBP > 80) risk += (data.diastolicBP - 80) * 0.5;

        // Cholesterol factor
        if (data.totalCholesterol > 200) risk += (data.totalCholesterol - 200) * 0.1;
        if (data.hdlCholesterol < 40) risk += (40 - data.hdlCholesterol) * 0.2;

        // Smoking factor
        if (data.smokingStatus === 'current') risk += 15;
        else if (data.smokingStatus === 'former') risk += 5;

        // Exercise factor
        if (data.exerciseMinutes < 150) risk += (150 - data.exerciseMinutes) * 0.1;

        // Family history
        if (data.familyHeartDisease) risk += 10;
        if (data.familyStroke) risk += 5;
        if (data.familyHypertension) risk += 5;

        return Math.min(100, Math.max(0, risk));
    }

    calculateDiabetesRisk(data) {
        let risk = 0;

        // Age factor
        if (data.age > 45) risk += (data.age - 45) * 0.3;

        // BMI factor
        const bmi = this.calculateBMI(data.height, data.weight);
        if (bmi > 25) risk += (bmi - 25) * 1.5;
        if (bmi > 30) risk += 15;

        // Blood sugar factor
        if (data.bloodSugar > 100) risk += (data.bloodSugar - 100) * 0.2;
        if (data.bloodSugar > 126) risk += 10;

        // Family history
        if (data.familyDiabetes) risk += 20;

        // Exercise factor
        if (data.exerciseMinutes < 150) risk += (150 - data.exerciseMinutes) * 0.05;

        // Alcohol factor
        if (data.alcoholConsumption === 'heavy') risk += 10;

        return Math.min(100, Math.max(0, risk));
    }

    calculateHypertensionRisk(data) {
        let risk = 0;

        // Age factor
        if (data.age > 35) risk += (data.age - 35) * 0.4;

        // BMI factor
        const bmi = this.calculateBMI(data.height, data.weight);
        if (bmi > 25) risk += (bmi - 25) * 1.2;

        // Current blood pressure
        if (data.systolicBP > 130) risk += (data.systolicBP - 130) * 0.5;
        if (data.diastolicBP > 85) risk += (data.diastolicBP - 85) * 0.8;

        // Family history
        if (data.familyHypertension) risk += 15;

        // Lifestyle factors
        if (data.smokingStatus === 'current') risk += 8;
        if (data.alcoholConsumption === 'heavy') risk += 8;
        if (data.exerciseMinutes < 150) risk += (150 - data.exerciseMinutes) * 0.03;

        return Math.min(100, Math.max(0, risk));
    }

    calculateMetabolicSyndromeRisk(data) {
        let risk = 0;

        // BMI factor
        const bmi = this.calculateBMI(data.height, data.weight);
        if (bmi > 25) risk += (bmi - 25) * 2;
        if (bmi > 30) risk += 20;

        // Blood pressure
        if (data.systolicBP > 130 || data.diastolicBP > 85) risk += 15;

        // Cholesterol
        if (data.totalCholesterol > 200) risk += 10;
        if (data.hdlCholesterol < 40) risk += 10;

        // Blood sugar
        if (data.bloodSugar > 100) risk += 10;

        // Age factor
        if (data.age > 40) risk += (data.age - 40) * 0.3;

        // Exercise factor
        if (data.exerciseMinutes < 150) risk += (150 - data.exerciseMinutes) * 0.02;

        return Math.min(100, Math.max(0, risk));
    }

    getRiskLevel(riskScore) {
        if (riskScore < 20) return { level: 'Low', color: 'low-risk' };
        if (riskScore < 40) return { level: 'Moderate', color: 'moderate-risk' };
        if (riskScore < 70) return { level: 'High', color: 'high-risk' };
        return { level: 'Very High', color: 'very-high-risk' };
    }

    calculateOverallScore(risks) {
        const weights = {
            cvd: 0.4,
            diabetes: 0.3,
            hypertension: 0.2,
            metabolic: 0.1
        };

        const overall = (
            risks.cvd * weights.cvd +
            risks.diabetes * weights.diabetes +
            risks.hypertension * weights.hypertension +
            risks.metabolic * weights.metabolic
        );

        return Math.round(overall);
    }

    generateRecommendations(data, risks) {
        const recommendations = [];

        if (risks.cvd > 30) {
            recommendations.push({
                title: 'Cardiovascular Health',
                text: 'Focus on heart-healthy lifestyle changes. Consider consulting a cardiologist for personalized assessment.'
            });
        }

        if (risks.diabetes > 25) {
            recommendations.push({
                title: 'Blood Sugar Management',
                text: 'Monitor blood glucose regularly and consider dietary modifications to improve insulin sensitivity.'
            });
        }

        if (risks.hypertension > 20) {
            recommendations.push({
                title: 'Blood Pressure Control',
                text: 'Implement DASH diet principles and regular exercise to help manage blood pressure naturally.'
            });
        }

        const bmi = this.calculateBMI(data.height, data.weight);
        if (bmi > 25) {
            recommendations.push({
                title: 'Weight Management',
                text: 'Gradual weight loss through sustainable diet and exercise can significantly improve health markers.'
            });
        }

        if (data.exerciseMinutes < 150) {
            recommendations.push({
                title: 'Physical Activity',
                text: 'Aim for at least 150 minutes of moderate exercise per week to improve overall health outcomes.'
            });
        }

        if (data.smokingStatus === 'current') {
            recommendations.push({
                title: 'Smoking Cessation',
                text: 'Quitting smoking is the single most important step you can take for your health.'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                title: 'Maintain Healthy Lifestyle',
                text: 'Continue your current healthy habits. Regular check-ups and preventive care are recommended.'
            });
        }

        return recommendations;
    }

    projectFutureRisks(currentRisks, data) {
        const projections = [];
        const currentAge = data.age;

        for (let years = 0; years <= 10; years += 2) {
            const age = currentAge + years;
            const ageMultiplier = 1 + (years * 0.02); // Age increases risk over time

            const projectedRisks = {
                year: years,
                cvd: Math.min(100, currentRisks.cvd * ageMultiplier),
                diabetes: Math.min(100, currentRisks.diabetes * ageMultiplier),
                hypertension: Math.min(100, currentRisks.hypertension * ageMultiplier),
                metabolic: Math.min(100, currentRisks.metabolic * ageMultiplier)
            };

            projections.push(projectedRisks);
        }

        return projections;
    }

    displayResults(data) {
        const cvdRisk = this.calculateCardiovascularRisk(data);
        const diabetesRisk = this.calculateDiabetesRisk(data);
        const hypertensionRisk = this.calculateHypertensionRisk(data);
        const metabolicRisk = this.calculateMetabolicSyndromeRisk(data);

        const risks = {
            cvd: cvdRisk,
            diabetes: diabetesRisk,
            hypertension: hypertensionRisk,
            metabolic: metabolicRisk
        };

        const overallScore = this.calculateOverallScore(risks);
        const overallRiskLevel = this.getRiskLevel(overallScore);

        // Update overall score
        document.getElementById('overallScore').textContent = overallScore;
        document.getElementById('overallRisk').textContent = overallRiskLevel.level;

        // Update individual risk scores
        this.updateRiskDisplay('cvd', cvdRisk);
        this.updateRiskDisplay('diabetes', diabetesRisk);
        this.updateRiskDisplay('hypertension', hypertensionRisk);
        this.updateRiskDisplay('metabolic', metabolicRisk);

        // Generate recommendations
        const recommendations = this.generateRecommendations(data, risks);
        this.displayRecommendations(recommendations);

        // Create projection chart
        const projections = this.projectFutureRisks(risks, data);
        this.createProjectionChart(projections);

        // Update projection summary
        const futureRisk = projections[projections.length - 1];
        const futureOverall = this.calculateOverallScore({
            cvd: futureRisk.cvd,
            diabetes: futureRisk.diabetes,
            hypertension: futureRisk.hypertension,
            metabolic: futureRisk.metabolic
        });
        const futureLevel = this.getRiskLevel(futureOverall);

        document.getElementById('projectionSummary').textContent =
            `Projected 10-year risk: ${futureOverall}% (${futureLevel.level})`;

        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }

    updateRiskDisplay(riskType, score) {
        const riskLevel = this.getRiskLevel(score);
        const barElement = document.getElementById(`${riskType}RiskBar`);
        const scoreElement = document.getElementById(`${riskType}RiskScore`);
        const levelElement = document.getElementById(`${riskType}RiskLevel`);

        barElement.style.setProperty('--risk-percentage', `${score}%`);
        barElement.className = `risk-fill ${riskLevel.color}`;
        scoreElement.textContent = `${Math.round(score)}%`;
        levelElement.textContent = riskLevel.level;
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationsList');
        container.innerHTML = '';

        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <h4>${rec.title}</h4>
                <p>${rec.text}</p>
            `;
            container.appendChild(item);
        });
    }

    createProjectionChart(projections) {
        const ctx = document.getElementById('riskProjectionChart').getContext('2d');

        const data = {
            labels: projections.map(p => `${p.year} years`),
            datasets: [
                {
                    label: 'Cardiovascular Disease',
                    data: projections.map(p => p.cvd),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Diabetes',
                    data: projections.map(p => p.diabetes),
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Hypertension',
                    data: projections.map(p => p.hypertension),
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Metabolic Syndrome',
                    data: projections.map(p => p.metabolic),
                    borderColor: '#1abc9c',
                    backgroundColor: 'rgba(26, 188, 156, 0.1)',
                    tension: 0.4
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Health Risk Projection Over 10 Years'
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Risk Percentage (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Years from Now'
                        }
                    }
                }
            }
        };

        new Chart(ctx, config);
    }
}

// Initialize the health risk engine
const healthRiskEngine = new HealthRiskEngine();

// Global function for button click
function calculateRisks() {
    const data = healthRiskEngine.collectFormData();

    // Basic validation
    if (data.age === 0 || data.height === 0 || data.weight === 0) {
        alert('Please fill in your age, height, and weight for accurate calculations.');
        return;
    }

    healthRiskEngine.displayResults(data);
}

// Auto-save form data on input changes
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            healthRiskEngine.collectFormData();
        });
    });
});