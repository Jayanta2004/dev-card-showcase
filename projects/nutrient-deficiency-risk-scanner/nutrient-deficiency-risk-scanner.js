// Nutrient Deficiency Risk Scanner JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();

    const form = document.getElementById('nutritionForm');
    form.addEventListener('submit', handleFormSubmit);
});

let riskChart = null;

// Nutrient database with deficiency risk calculations
const nutrientDatabase = {
    vitaminA: {
        name: 'Vitamin A',
        sources: ['leafyGreens', 'organMeats', 'fish', 'dairy', 'eggs'],
        weights: { leafyGreens: 0.3, organMeats: 0.4, fish: 0.2, dairy: 0.1, eggs: 0.1 },
        deficiencyFactors: ['lowFatDiet', 'malabsorption', 'smoking']
    },
    vitaminC: {
        name: 'Vitamin C',
        sources: ['citrus', 'berries', 'cruciferous'],
        weights: { citrus: 0.4, berries: 0.3, cruciferous: 0.3 },
        deficiencyFactors: ['smoking', 'stress', 'alcohol']
    },
    vitaminD: {
        name: 'Vitamin D',
        sources: ['fish', 'fortifiedFoods', 'dairy'],
        weights: { fish: 0.4, fortifiedFoods: 0.4, dairy: 0.2 },
        deficiencyFactors: ['limitedSunExposure', 'darkSkin', 'obesity']
    },
    vitaminB12: {
        name: 'Vitamin B12',
        sources: ['organMeats', 'fish', 'eggs', 'dairy'],
        weights: { organMeats: 0.4, fish: 0.3, eggs: 0.2, dairy: 0.1 },
        deficiencyFactors: ['veganDiet', 'age', 'malabsorption']
    },
    iron: {
        name: 'Iron',
        sources: ['redMeat', 'organMeats', 'leafyGreens', 'fortifiedFoods'],
        weights: { redMeat: 0.4, organMeats: 0.3, leafyGreens: 0.2, fortifiedFoods: 0.1 },
        deficiencyFactors: ['menstruation', 'pregnancy', 'lowMeatDiet']
    },
    calcium: {
        name: 'Calcium',
        sources: ['dairy', 'leafyGreens', 'fortifiedFoods'],
        weights: { dairy: 0.5, leafyGreens: 0.3, fortifiedFoods: 0.2 },
        deficiencyFactors: ['lactoseIntolerance', 'lowDairyDiet', 'age']
    },
    iodine: {
        name: 'Iodine',
        sources: ['fish', 'fortifiedFoods'],
        weights: { fish: 0.7, fortifiedFoods: 0.3 },
        deficiencyFactors: ['lowSeafoodDiet', 'noIodizedSalt']
    },
    zinc: {
        name: 'Zinc',
        sources: ['redMeat', 'organMeats', 'nuts', 'wholeGrains'],
        weights: { redMeat: 0.4, organMeats: 0.3, nuts: 0.2, wholeGrains: 0.1 },
        deficiencyFactors: ['vegetarianDiet', 'malabsorption', 'alcohol']
    },
    folate: {
        name: 'Folate',
        sources: ['leafyGreens', 'fortifiedFoods', 'citrus', 'organMeats'],
        weights: { leafyGreens: 0.3, fortifiedFoods: 0.3, citrus: 0.2, organMeats: 0.2 },
        deficiencyFactors: ['alcohol', 'pregnancy', 'malabsorption']
    },
    magnesium: {
        name: 'Magnesium',
        sources: ['nuts', 'wholeGrains', 'leafyGreens', 'fish'],
        weights: { nuts: 0.3, wholeGrains: 0.3, leafyGreens: 0.2, fish: 0.2 },
        deficiencyFactors: ['processedFoodDiet', 'alcohol', 'stress']
    }
};

function handleFormSubmit(e) {
    e.preventDefault();

    // Collect form data
    const formData = collectFormData();

    // Calculate deficiency risks
    const riskAssessment = calculateDeficiencyRisks(formData);

    // Display results
    displayResults(riskAssessment);

    // Update chart
    updateChart(riskAssessment);

    // Save assessment
    saveAssessment(riskAssessment);

    // Update history
    updateHistory();

    showNotification('Nutrient risk assessment completed!', 'success');
}

function collectFormData() {
    const formData = {};

    // Food frequency data
    const foodItems = [
        'leafyGreens', 'citrus', 'berries', 'cruciferous',
        'redMeat', 'organMeats', 'fish', 'eggs',
        'dairy', 'fortifiedFoods', 'nuts', 'wholeGrains'
    ];

    foodItems.forEach(item => {
        formData[item] = parseInt(document.getElementById(item).value) || 0;
    });

    // Lifestyle factors
    formData.alcohol = parseInt(document.getElementById('alcohol').value) || 0;
    formData.smoking = parseInt(document.getElementById('smoking').value) || 0;
    formData.medications = document.getElementById('medications').value.trim();

    return formData;
}

function calculateDeficiencyRisks(formData) {
    const risks = {};

    Object.keys(nutrientDatabase).forEach(nutrientKey => {
        const nutrient = nutrientDatabase[nutrientKey];
        let riskScore = 0;

        // Calculate base risk from food frequency
        let intakeScore = 0;
        nutrient.sources.forEach(source => {
            const frequency = formData[source] || 0;
            const weight = nutrient.weights[source] || 0;
            intakeScore += frequency * weight;
        });

        // Normalize intake score (0-5 scale)
        intakeScore = Math.min(intakeScore, 5);

        // Base risk is inverse of intake score (higher intake = lower risk)
        riskScore = Math.max(0, 100 - (intakeScore / 5) * 100);

        // Apply lifestyle modifiers
        if (formData.alcohol > 0 && nutrient.deficiencyFactors.includes('alcohol')) {
            riskScore += formData.alcohol * 10;
        }

        if (formData.smoking > 0 && nutrient.deficiencyFactors.includes('smoking')) {
            riskScore += formData.smoking * 15;
        }

        // Cap at 100%
        riskScore = Math.min(riskScore, 100);

        // Determine risk level
        let riskLevel = 'low';
        if (riskScore > 60) riskLevel = 'high';
        else if (riskScore > 30) riskLevel = 'moderate';

        risks[nutrientKey] = {
            name: nutrient.name,
            riskScore: Math.round(riskScore),
            riskLevel: riskLevel,
            intakeScore: intakeScore
        };
    });

    return risks;
}

function displayResults(riskAssessment) {
    document.getElementById('resultsDisplay').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';

    // Calculate risk counts
    const riskCounts = { high: 0, moderate: 0, low: 0 };
    Object.values(riskAssessment).forEach(nutrient => {
        riskCounts[nutrient.riskLevel]++;
    });

    document.getElementById('highRiskCount').textContent = riskCounts.high;
    document.getElementById('moderateRiskCount').textContent = riskCounts.moderate;
    document.getElementById('lowRiskCount').textContent = riskCounts.low;

    // Display individual nutrient risks
    const risksList = document.getElementById('nutrientRisksList');
    risksList.innerHTML = '';

    Object.values(riskAssessment).forEach(nutrient => {
        const riskItem = document.createElement('div');
        riskItem.className = `risk-item risk-${nutrient.riskLevel}`;

        riskItem.innerHTML = `
            <div class="nutrient-header">
                <span class="nutrient-name">${nutrient.name}</span>
                <span class="risk-percentage">${nutrient.riskScore}%</span>
            </div>
            <div class="risk-bar">
                <div class="risk-fill" style="width: ${nutrient.riskScore}%"></div>
            </div>
            <div class="risk-description">${getRiskDescription(nutrient)}</div>
        `;

        risksList.appendChild(riskItem);
    });

    // Update recommendations
    updateRecommendations(riskAssessment);
}

function getRiskDescription(nutrient) {
    const descriptions = {
        low: 'Low deficiency risk. Continue current dietary habits.',
        moderate: 'Moderate deficiency risk. Consider increasing intake of nutrient-rich foods.',
        high: 'High deficiency risk. Focus on nutrient-rich food sources or consult healthcare provider.'
    };

    return descriptions[nutrient.riskLevel];
}

function updateRecommendations(riskAssessment) {
    const highRiskNutrients = Object.values(riskAssessment)
        .filter(n => n.riskLevel === 'high')
        .map(n => n.name);

    const moderateRiskNutrients = Object.values(riskAssessment)
        .filter(n => n.riskLevel === 'moderate')
        .map(n => n.name);

    // Priority actions
    let priorityText = '';
    if (highRiskNutrients.length > 0) {
        priorityText = `Focus on improving intake of: ${highRiskNutrients.join(', ')}. `;
    }
    if (moderateRiskNutrients.length > 0) {
        priorityText += `Consider increasing: ${moderateRiskNutrients.join(', ')}.`;
    }
    if (highRiskNutrients.length === 0 && moderateRiskNutrients.length === 0) {
        priorityText = 'Great job! Your diet appears balanced. Continue maintaining these healthy eating habits.';
    }

    document.getElementById('priorityActions').textContent = priorityText;

    // Food sources
    const foodRecommendations = getFoodRecommendations(riskAssessment);
    document.getElementById('foodSources').textContent = foodRecommendations;

    // Supplementation
    const supplementRecommendations = getSupplementRecommendations(riskAssessment);
    document.getElementById('supplementation').textContent = supplementRecommendations;
}

function getFoodRecommendations(riskAssessment) {
    const recommendations = {
        vitaminA: 'Include more leafy greens, carrots, sweet potatoes, and organ meats.',
        vitaminC: 'Add citrus fruits, berries, bell peppers, and kiwi to your diet.',
        vitaminD: 'Include fatty fish, fortified foods, and consider safe sun exposure.',
        vitaminB12: 'Add animal products like meat, fish, eggs, and dairy.',
        iron: 'Include red meat, spinach, lentils, and fortified cereals.',
        calcium: 'Add dairy products, leafy greens, and fortified plant milks.',
        iodine: 'Include seafood and use iodized salt.',
        zinc: 'Add meat, shellfish, legumes, and nuts.',
        folate: 'Include leafy greens, citrus, beans, and fortified grains.',
        magnesium: 'Add nuts, seeds, whole grains, and leafy greens.'
    };

    const highRiskNutrients = Object.keys(riskAssessment)
        .filter(key => riskAssessment[key].riskLevel === 'high');

    if (highRiskNutrients.length > 0) {
        return highRiskNutrients.map(key => `${riskAssessment[key].name}: ${recommendations[key]}`).join(' ');
    }

    return 'Your diet appears to provide good nutrient variety. Continue including a wide range of colorful fruits and vegetables.';
}

function getSupplementRecommendations(riskAssessment) {
    const highRiskCount = Object.values(riskAssessment)
        .filter(n => n.riskLevel === 'high').length;

    if (highRiskCount > 3) {
        return 'Multiple high-risk nutrients detected. Consider consulting a healthcare provider or registered dietitian for personalized supplementation guidance.';
    } else if (highRiskCount > 0) {
        return 'For high-risk nutrients, consider targeted supplementation after consulting a healthcare provider. Focus on food sources first.';
    }

    return 'Supplementation likely unnecessary with current dietary patterns. Continue monitoring and focus on whole foods.';
}

function initializeCharts() {
    const ctx = document.getElementById('riskChart').getContext('2d');
    riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Deficiency Risk (%)',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const nutrient = context.label;
                            const risk = context.parsed.y;
                            let level = 'Low';
                            if (risk > 60) level = 'High';
                            else if (risk > 30) level = 'Moderate';
                            return `${nutrient}: ${risk}% (${level} Risk)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Risk Percentage'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Nutrients'
                    }
                }
            }
        }
    });
}

function updateChart(riskAssessment) {
    if (!riskChart) return;

    const nutrients = Object.values(riskAssessment);
    const labels = nutrients.map(n => n.name);
    const data = nutrients.map(n => n.riskScore);
    const colors = nutrients.map(n => getRiskColor(n.riskLevel));

    riskChart.data.labels = labels;
    riskChart.data.datasets[0].data = data;
    riskChart.data.datasets[0].backgroundColor = colors;
    riskChart.data.datasets[0].borderColor = colors.map(color => color.replace('0.7', '1'));
    riskChart.update();
}

function getRiskColor(riskLevel) {
    switch(riskLevel) {
        case 'high': return 'rgba(239, 68, 68, 0.7)';
        case 'moderate': return 'rgba(245, 158, 11, 0.7)';
        case 'low': return 'rgba(34, 197, 94, 0.7)';
        default: return 'rgba(156, 163, 175, 0.7)';
    }
}

function saveAssessment(riskAssessment) {
    const assessments = getStoredAssessments();

    const assessment = {
        date: new Date().toISOString(),
        risks: riskAssessment,
        summary: {
            highRisk: Object.values(riskAssessment).filter(n => n.riskLevel === 'high').length,
            moderateRisk: Object.values(riskAssessment).filter(n => n.riskLevel === 'moderate').length,
            lowRisk: Object.values(riskAssessment).filter(n => n.riskLevel === 'low').length,
            overallScore: calculateOverallScore(riskAssessment)
        }
    };

    assessments.push(assessment);
    localStorage.setItem('nutrientAssessments', JSON.stringify(assessments));
}

function calculateOverallScore(riskAssessment) {
    const totalRisk = Object.values(riskAssessment)
        .reduce((sum, nutrient) => sum + nutrient.riskScore, 0);
    return Math.round(totalRisk / Object.keys(riskAssessment).length);
}

function getStoredAssessments() {
    const stored = localStorage.getItem('nutrientAssessments');
    return stored ? JSON.parse(stored) : [];
}

function updateHistory() {
    const assessments = getStoredAssessments();
    const tbody = document.getElementById('historyBody');

    if (assessments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No assessments completed yet.</td></tr>';
        return;
    }

    tbody.innerHTML = assessments.slice(-10).reverse().map((assessment, index) => {
        const date = new Date(assessment.date).toLocaleDateString();
        const viewButton = `<button class="btn-small" onclick="viewAssessment(${assessments.length - 1 - index})">View</button>`;

        return `
            <tr>
                <td>${date}</td>
                <td>${assessment.summary.highRisk}</td>
                <td>${assessment.summary.moderateRisk}</td>
                <td>${assessment.summary.overallScore}%</td>
                <td>${viewButton}</td>
            </tr>
        `;
    }).join('');
}

function viewAssessment(index) {
    const assessments = getStoredAssessments();
    const assessment = assessments[index];

    if (assessment) {
        displayResults(assessment.risks);
        updateChart(assessment.risks);
        showNotification('Previous assessment loaded', 'info');
    }
}

function loadData() {
    updateHistory();
}

function showNotification(message, type = 'info') {
    // Simple notification - you could enhance this with a proper notification system
    alert(message);
}