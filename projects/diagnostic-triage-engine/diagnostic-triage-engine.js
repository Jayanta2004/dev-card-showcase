/**
 * Diagnostic Triage Engine - AI Symptom Prioritizer
 * Issue #6251
 *
 * Features:
 * - Probabilistic risk scoring based on symptom clusters
 * - Medical history and risk factor assessment
 * - Vital signs evaluation
 * - ESI-inspired triage categorization
 * - Clinical decision support recommendations
 */

// Symptom scoring database
const SYMPTOM_SCORES = {
    // Cardiovascular symptoms (high priority)
    'chest-pain': 9.5,
    'shortness-breath': 8.5,
    'palpitations': 6.0,
    'dizziness': 5.0,

    // Neurological symptoms (high priority)
    'severe-headache': 8.0,
    'confusion': 9.0,
    'seizures': 9.5,
    'weakness': 7.0,

    // Respiratory symptoms (high priority)
    'difficulty-breathing': 8.5,
    'cough-blood': 8.0,
    'wheezing': 5.5,

    // Gastrointestinal symptoms (variable priority)
    'severe-abdominal-pain': 7.5,
    'vomiting-blood': 8.0,
    'rectal-bleeding': 6.5
};

// Risk factor multipliers
const RISK_MULTIPLIERS = {
    'age-65-plus': 1.8,
    'heart-disease': 2.5,
    'diabetes': 1.6,
    'hypertension': 1.4,
    'smoking': 1.7,
    'obesity': 1.3,
    'family-history': 1.4,
    'recent-surgery': 1.5
};

// Vital signs normal ranges and scoring
const VITAL_SIGNS_RANGES = {
    'bp-systolic': { normal: [90, 140], critical_low: 90, critical_high: 180 },
    'bp-diastolic': { normal: [60, 90], critical_low: 60, critical_high: 110 },
    'heart-rate': { normal: [60, 100], critical_low: 40, critical_high: 150 },
    'resp-rate': { normal: [12, 20], critical_low: 8, critical_high: 30 },
    'temperature': { normal: [36.1, 37.2], critical_low: 35, critical_high: 38.5 },
    'o2-sat': { normal: [95, 100], critical_low: 90, critical_high: 100 }
};

// DOM elements
const assessBtn = document.getElementById('assess-patient');
const resetBtn = document.getElementById('reset-assessment');
const urgencyLevel = document.getElementById('urgency-level');
const riskScore = document.getElementById('risk-score');
const confidenceLevel = document.getElementById('confidence-level');
const recommendationList = document.getElementById('recommendation-list');
const clusterDisplay = document.getElementById('cluster-display');

// Assessment state
let currentAssessment = {
    symptoms: [],
    riskFactors: [],
    vitals: {},
    score: 0,
    confidence: 0,
    triageLevel: 'none'
};

// Symptom clustering for pattern recognition
function identifySymptomClusters(symptoms) {
    const clusters = {
        cardiovascular: ['chest-pain', 'shortness-breath', 'palpitations', 'dizziness'],
        neurological: ['severe-headache', 'confusion', 'seizures', 'weakness'],
        respiratory: ['difficulty-breathing', 'cough-blood', 'wheezing'],
        gastrointestinal: ['severe-abdominal-pain', 'vomiting-blood', 'rectal-bleeding']
    };

    const identifiedClusters = [];

    for (const [clusterName, clusterSymptoms] of Object.entries(clusters)) {
        const matchingSymptoms = symptoms.filter(symptom => clusterSymptoms.includes(symptom));
        if (matchingSymptoms.length > 0) {
            identifiedClusters.push({
                name: clusterName,
                symptoms: matchingSymptoms,
                severity: matchingSymptoms.length / clusterSymptoms.length
            });
        }
    }

    return identifiedClusters;
}

// Calculate base symptom score
function calculateSymptomScore(symptoms) {
    if (symptoms.length === 0) return 0;

    const scores = symptoms.map(symptom => SYMPTOM_SCORES[symptom] || 0);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Weight towards highest severity symptom but consider clustering
    return (maxScore * 0.7) + (avgScore * 0.3);
}

// Calculate risk factor multiplier
function calculateRiskMultiplier(riskFactors) {
    if (riskFactors.length === 0) return 1.0;

    const multipliers = riskFactors.map(factor => RISK_MULTIPLIERS[factor] || 1.0);
    return multipliers.reduce((a, b) => a * b, 1.0);
}

// Evaluate vital signs
function evaluateVitalSigns(vitals) {
    let vitalScore = 0;
    let abnormalCount = 0;

    for (const [vital, value] of Object.entries(vitals)) {
        if (!value || value === '') continue;

        const numValue = parseFloat(value);
        const ranges = VITAL_SIGNS_RANGES[vital];

        if (!ranges) continue;

        let deviation = 0;

        if (numValue < ranges.critical_low) {
            deviation = Math.abs(numValue - ranges.normal[0]) / ranges.normal[0];
            vitalScore += deviation * 3; // Critical deviation
            abnormalCount++;
        } else if (numValue > ranges.critical_high) {
            deviation = Math.abs(numValue - ranges.normal[1]) / ranges.normal[1];
            vitalScore += deviation * 3;
            abnormalCount++;
        } else if (numValue < ranges.normal[0] || numValue > ranges.normal[1]) {
            deviation = Math.min(
                Math.abs(numValue - ranges.normal[0]) / ranges.normal[0],
                Math.abs(numValue - ranges.normal[1]) / ranges.normal[1]
            );
            vitalScore += deviation * 1.5; // Moderate deviation
            abnormalCount++;
        }
    }

    return { score: vitalScore, abnormalCount };
}

// Calculate overall risk score
function calculateRiskScore(symptoms, riskFactors, vitals) {
    const symptomScore = calculateSymptomScore(symptoms);
    const riskMultiplier = calculateRiskMultiplier(riskFactors);
    const vitalEvaluation = evaluateVitalSigns(vitals);

    // Base score from symptoms
    let totalScore = symptomScore;

    // Apply risk factor multiplier
    totalScore *= riskMultiplier;

    // Add vital signs score
    totalScore += vitalEvaluation.score;

    // Cap the score
    totalScore = Math.min(totalScore, 10);

    return {
        score: totalScore,
        components: {
            symptoms: symptomScore,
            riskMultiplier: riskMultiplier,
            vitals: vitalEvaluation.score
        }
    };
}

// Determine triage level based on ESI principles
function determineTriageLevel(score, symptoms, vitals) {
    // Emergency (Level 1): Immediate life-threatening
    if (score >= 8.5 ||
        symptoms.includes('chest-pain') ||
        symptoms.includes('difficulty-breathing') ||
        symptoms.includes('seizures') ||
        vitals['o2-sat'] && parseFloat(vitals['o2-sat']) < 90) {
        return {
            level: 1,
            category: 'EMERGENCY',
            description: 'Immediate life-threatening condition',
            responseTime: 'Immediate'
        };
    }

    // Urgent (Level 2): Serious condition requiring prompt attention
    if (score >= 6.5 ||
        symptoms.includes('severe-headache') ||
        symptoms.includes('vomiting-blood') ||
        vitals['bp-systolic'] && parseFloat(vitals['bp-systolic']) > 180 ||
        vitals['heart-rate'] && parseFloat(vitals['heart-rate']) > 120) {
        return {
            level: 2,
            category: 'URGENT',
            description: 'Serious condition requiring prompt attention',
            responseTime: 'Within 15 minutes'
        };
    }

    // Semi-urgent (Level 3): Stable but requires medical attention
    if (score >= 4.0 ||
        symptoms.length > 2 ||
        vitals['temperature'] && parseFloat(vitals['temperature']) > 38.0) {
        return {
            level: 3,
            category: 'SEMI-URGENT',
            description: 'Stable but requires medical attention',
            responseTime: 'Within 30-60 minutes'
        };
    }

    // Non-urgent (Level 4): Minor condition
    return {
        level: 4,
        category: 'NON-URGENT',
        description: 'Minor condition, can wait',
        responseTime: 'Within 2 hours'
    };
}

// Generate recommendations based on assessment
function generateRecommendations(triageLevel, symptoms, riskFactors, vitals) {
    const recommendations = [];

    switch (triageLevel.level) {
        case 1:
            recommendations.push('🚨 IMMEDIATE MEDICAL ATTENTION REQUIRED');
            recommendations.push('Call emergency services (911) immediately');
            recommendations.push('Do not leave patient unattended');
            break;
        case 2:
            recommendations.push('⚡ Prompt medical evaluation needed');
            recommendations.push('Transport to emergency department');
            recommendations.push('Monitor vital signs continuously');
            break;
        case 3:
            recommendations.push('🟡 Medical attention required within 1 hour');
            recommendations.push('Schedule urgent care appointment');
            recommendations.push('Follow up with primary care physician');
            break;
        case 4:
            recommendations.push('🟢 Non-urgent condition');
            recommendations.push('Schedule routine appointment');
            recommendations.push('Monitor symptoms and seek care if they worsen');
            break;
    }

    // Add symptom-specific recommendations
    if (symptoms.includes('chest-pain')) {
        recommendations.push('• Keep patient comfortable and monitor breathing');
    }
    if (symptoms.includes('difficulty-breathing')) {
        recommendations.push('• Ensure patient is in comfortable position');
    }
    if (symptoms.includes('severe-headache')) {
        recommendations.push('• Keep environment quiet and darkened');
    }

    // Risk factor considerations
    if (riskFactors.includes('age-65-plus')) {
        recommendations.push('• Consider age-related factors in assessment');
    }
    if (riskFactors.includes('heart-disease')) {
        recommendations.push('• Cardiac history may increase urgency');
    }

    return recommendations;
}

// Calculate confidence level based on data completeness
function calculateConfidence(symptoms, riskFactors, vitals) {
    let confidence = 0;

    // Symptoms contribute 40% to confidence
    if (symptoms.length > 0) {
        confidence += Math.min(symptoms.length * 10, 40);
    }

    // Risk factors contribute 20% to confidence
    if (riskFactors.length > 0) {
        confidence += Math.min(riskFactors.length * 5, 20);
    }

    // Vitals contribute 40% to confidence
    const vitalCount = Object.values(vitals).filter(v => v && v !== '').length;
    confidence += Math.min(vitalCount * 8, 40);

    return Math.min(confidence, 100);
}

// Main assessment function
function assessPatient() {
    // Collect symptoms
    const symptomCheckboxes = document.querySelectorAll('#symptom-input input[type="checkbox"]:checked');
    currentAssessment.symptoms = Array.from(symptomCheckboxes).map(cb => cb.dataset.symptom);

    // Collect risk factors
    const riskCheckboxes = document.querySelectorAll('#medical-history input[type="checkbox"]:checked');
    currentAssessment.riskFactors = Array.from(riskCheckboxes).map(cb => cb.dataset.factor);

    // Collect vital signs
    currentAssessment.vitals = {
        'bp-systolic': document.getElementById('bp-systolic').value,
        'bp-diastolic': document.getElementById('bp-diastolic').value,
        'heart-rate': document.getElementById('heart-rate').value,
        'resp-rate': document.getElementById('resp-rate').value,
        'temperature': document.getElementById('temperature').value,
        'o2-sat': document.getElementById('o2-sat').value
    };

    // Perform calculations
    const riskCalculation = calculateRiskScore(
        currentAssessment.symptoms,
        currentAssessment.riskFactors,
        currentAssessment.vitals
    );

    currentAssessment.score = riskCalculation.score;
    currentAssessment.triageLevel = determineTriageLevel(
        currentAssessment.score,
        currentAssessment.symptoms,
        currentAssessment.vitals
    );
    currentAssessment.confidence = calculateConfidence(
        currentAssessment.symptoms,
        currentAssessment.riskFactors,
        currentAssessment.vitals
    );

    // Update UI
    updateAssessmentDisplay();
}

// Update the assessment results display
function updateAssessmentDisplay() {
    // Update triage level
    urgencyLevel.textContent = `Level ${currentAssessment.triageLevel.level}: ${currentAssessment.triageLevel.category}`;
    urgencyLevel.className = `triage-${currentAssessment.triageLevel.category.toLowerCase().replace(' ', '-')}`;

    // Update risk score
    riskScore.textContent = `Risk Score: ${currentAssessment.score.toFixed(2)}/10`;

    // Update confidence
    confidenceLevel.textContent = `Confidence: ${currentAssessment.confidence.toFixed(0)}%`;

    // Update recommendations
    const recommendations = generateRecommendations(
        currentAssessment.triageLevel,
        currentAssessment.symptoms,
        currentAssessment.riskFactors,
        currentAssessment.vitals
    );

    recommendationList.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationList.appendChild(li);
    });

    // Update symptom clusters
    const clusters = identifySymptomClusters(currentAssessment.symptoms);
    if (clusters.length > 0) {
        clusterDisplay.textContent = clusters.map(cluster =>
            `${cluster.name.charAt(0).toUpperCase() + cluster.name.slice(1)} (${(cluster.severity * 100).toFixed(0)}% match)`
        ).join(', ');
    } else {
        clusterDisplay.textContent = 'No significant clusters identified';
    }
}

// Reset assessment
function resetAssessment() {
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    // Reset inputs
    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => input.value = '');

    // Reset assessment state
    currentAssessment = {
        symptoms: [],
        riskFactors: [],
        vitals: {},
        score: 0,
        confidence: 0,
        triageLevel: 'none'
    };

    // Reset display
    urgencyLevel.textContent = 'No assessment performed';
    urgencyLevel.className = '';
    riskScore.textContent = 'Risk Score: 0.00';
    confidenceLevel.textContent = 'Confidence: 0%';
    recommendationList.innerHTML = '<li>Please complete symptom assessment</li>';
    clusterDisplay.textContent = 'None';
}

// Initialize the application
function init() {
    assessBtn.addEventListener('click', assessPatient);
    resetBtn.addEventListener('click', resetAssessment);

    // Add input validation for vital signs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            const ranges = VITAL_SIGNS_RANGES[this.id];

            if (ranges && value) {
                if (value < ranges.critical_low || value > ranges.critical_high) {
                    this.style.borderColor = '#d32f2f';
                } else if (value < ranges.normal[0] || value > ranges.normal[1]) {
                    this.style.borderColor = '#f57c00';
                } else {
                    this.style.borderColor = '#4caf50';
                }
            } else {
                this.style.borderColor = '#ced4da';
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);