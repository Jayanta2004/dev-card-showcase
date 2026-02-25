// DNA-Based Nutrition Planner JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadGeneticData();
    initializeChart();

    const geneticForm = document.getElementById('geneticForm');
    const progressForm = document.getElementById('progressForm');

    geneticForm.addEventListener('submit', handleGeneticSubmit);
    progressForm.addEventListener('submit', handleProgressSubmit);
});

function handleGeneticSubmit(e) {
    e.preventDefault();

    const geneticData = {
        fatMassGene: document.getElementById('fatMassGene').value,
        carbMetabolism: document.getElementById('carbMetabolism').value,
        vitaminD: document.getElementById('vitaminD').value,
        methylation: document.getElementById('methylation').value,
        endurance: document.getElementById('endurance').value,
        recovery: document.getElementById('recovery').value
    };

    // Check if all fields are filled
    if (Object.values(geneticData).some(value => !value)) {
        showNotification('Please fill in all genetic markers.', 'error');
        return;
    }

    saveGeneticData(geneticData);
    generateNutritionPlan(geneticData);
    showNotification('Nutrition plan generated successfully!', 'success');
}

function handleProgressSubmit(e) {
    e.preventDefault();

    const progressData = {
        date: new Date().toISOString(),
        weight: parseFloat(document.getElementById('weight').value),
        energyLevel: parseInt(document.getElementById('energyLevel').value),
        notes: document.getElementById('notes').value.trim()
    };

    if (!progressData.weight || !progressData.energyLevel) {
        showNotification('Please fill in weight and energy level.', 'error');
        return;
    }

    saveProgressData(progressData);
    updateProgressDisplay();
    progressForm.reset();
    showNotification('Progress logged successfully!', 'success');
}

function saveGeneticData(data) {
    localStorage.setItem('dnaNutritionGeneticData', JSON.stringify(data));
}

function loadGeneticData() {
    const data = localStorage.getItem('dnaNutritionGeneticData');
    if (data) {
        const geneticData = JSON.parse(data);
        // Populate form
        Object.keys(geneticData).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = geneticData[key];
        });
        generateNutritionPlan(geneticData);
    }
}

function generateNutritionPlan(geneticData) {
    const recommendations = [];
    const supplements = [];
    let macroRatios = { protein: 25, carbs: 50, fats: 25 }; // Default
    let calorieBase = 2000; // Base calories

    // Analyze genetic markers and generate recommendations
    if (geneticData.fatMassGene === 'AA') {
        recommendations.push({
            title: 'Weight Management Focus',
            text: 'Your FTO gene variant suggests higher fat storage tendency. Focus on portion control and regular exercise. Consider a moderate calorie deficit for weight management.'
        });
        calorieBase -= 200;
    } else if (geneticData.fatMassGene === 'TT') {
        recommendations.push({
            title: 'Metabolic Advantage',
            text: 'Your FTO gene variant supports efficient metabolism. You may maintain weight more easily. Focus on nutrient-dense foods.'
        });
        calorieBase += 100;
    }

    if (geneticData.carbMetabolism === 'GG') {
        recommendations.push({
            title: 'Carbohydrate Metabolism',
            text: 'Slower carbohydrate processing. Opt for complex carbohydrates and avoid high glycemic foods. Consider lower carb intake (40-45% of calories).'
        });
        macroRatios.carbs = 40;
        macroRatios.fats = 35;
    } else if (geneticData.carbMetabolism === 'CC') {
        recommendations.push({
            title: 'Efficient Carb Processing',
            text: 'Good carbohydrate metabolism. You can include a variety of carbohydrates. Maintain balanced carb intake.'
        });
    }

    if (geneticData.vitaminD === 'GG') {
        recommendations.push({
            title: 'Vitamin D Absorption',
            text: 'Reduced vitamin D absorption. Ensure adequate sun exposure and consider vitamin D rich foods or supplementation.'
        });
        supplements.push({
            name: 'Vitamin D3',
            dosage: '2000-5000 IU daily',
            reason: 'Supports bone health and immune function'
        });
    }

    if (geneticData.methylation === 'GG' || geneticData.methylation === 'AG') {
        recommendations.push({
            title: 'Methylation Support',
            text: 'Reduced methylation function. Focus on folate-rich foods and consider methylated B vitamin supplements.'
        });
        supplements.push({
            name: 'Methylfolate (B9)',
            dosage: '800-1000 mcg daily',
            reason: 'Supports methylation and homocysteine metabolism'
        });
        supplements.push({
            name: 'Methylcobalamin (B12)',
            dosage: '1000 mcg daily',
            reason: 'Supports energy production and neurological function'
        });
    }

    if (geneticData.endurance === 'XX') {
        recommendations.push({
            title: 'Endurance Focus',
            text: 'Genetic predisposition for endurance activities. Higher carbohydrate intake may support performance. Consider carb-loading before long sessions.'
        });
        macroRatios.carbs = 60;
        macroRatios.protein = 20;
        macroRatios.fats = 20;
        calorieBase += 300;
    } else if (geneticData.endurance === 'RR') {
        recommendations.push({
            title: 'Power Focus',
            text: 'Genetic predisposition for power activities. Higher protein intake supports muscle maintenance and recovery.'
        });
        macroRatios.protein = 30;
        macroRatios.carbs = 45;
        macroRatios.fats = 25;
    }

    if (geneticData.recovery === 'GG') {
        recommendations.push({
            title: 'Recovery Optimization',
            text: 'Slower natural recovery. Focus on anti-inflammatory foods, adequate protein, and recovery practices like sleep and stress management.'
        });
        supplements.push({
            name: 'Omega-3 Fish Oil',
            dosage: '1000-2000 mg EPA+DHA daily',
            reason: 'Supports anti-inflammatory response and recovery'
        });
    }

    // Calculate daily targets
    const proteinGrams = Math.round((calorieBase * macroRatios.protein / 100) / 4);
    const carbGrams = Math.round((calorieBase * macroRatios.carbs / 100) / 4);
    const fatGrams = Math.round((calorieBase * macroRatios.fats / 100) / 9);

    updatePlanDisplay(recommendations);
    updateMacroChart(macroRatios);
    updateDailyTargets(calorieBase, proteinGrams, carbGrams, fatGrams);
    updateSupplements(supplements);
}

function updatePlanDisplay(recommendations) {
    const container = document.getElementById('planOutput');
    container.innerHTML = '';

    if (recommendations.length === 0) {
        container.innerHTML = '<p>No specific recommendations based on your genetic profile.</p>';
        return;
    }

    recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'plan-recommendation';
        div.innerHTML = `
            <h4>${rec.title}</h4>
            <p>${rec.text}</p>
        `;
        container.appendChild(div);
    });
}

function updateMacroChart(ratios) {
    const ctx = document.getElementById('macroChart').getContext('2d');

    if (window.macroChart) {
        window.macroChart.destroy();
    }

    window.macroChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbohydrates', 'Fats'],
            datasets: [{
                data: [ratios.protein, ratios.carbs, ratios.fats],
                backgroundColor: [
                    '#4299e1',
                    '#48bb78',
                    '#ed8936'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function updateDailyTargets(calories, protein, carbs, fats) {
    document.getElementById('calorieTarget').textContent = calories + ' kcal';
    document.getElementById('proteinTarget').textContent = protein + 'g';
    document.getElementById('carbTarget').textContent = carbs + 'g';
    document.getElementById('fatTarget').textContent = fats + 'g';
}

function updateSupplements(supplements) {
    const container = document.getElementById('supplements');
    container.innerHTML = '';

    if (supplements.length === 0) {
        container.innerHTML = '<p>No specific supplements recommended based on your genetic profile.</p>';
        return;
    }

    supplements.forEach(sup => {
        const div = document.createElement('div');
        div.className = 'supplement-item';
        div.innerHTML = `
            <h4>${sup.name}</h4>
            <p><strong>Dosage:</strong> ${sup.dosage}<br><strong>Reason:</strong> ${sup.reason}</p>
        `;
        container.appendChild(div);
    });
}

function initializeChart() {
    // Initialize empty chart
    updateMacroChart({ protein: 25, carbs: 50, fats: 25 });
}

function saveProgressData(data) {
    const progress = getProgressData();
    progress.push(data);
    localStorage.setItem('dnaNutritionProgress', JSON.stringify(progress));
}

function getProgressData() {
    const data = localStorage.getItem('dnaNutritionProgress');
    return data ? JSON.parse(data) : [];
}

function updateProgressDisplay() {
    const progress = getProgressData();
    const container = document.getElementById('progressList');

    if (progress.length === 0) {
        container.innerHTML = '<p>No progress logged yet.</p>';
        return;
    }

    container.innerHTML = '';

    // Show last 5 entries
    progress.slice(-5).reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = 'progress-entry';
        div.innerHTML = `
            <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="details">
                Weight: ${entry.weight}kg | Energy: ${entry.energyLevel}/10
                ${entry.notes ? '<br>Notes: ' + entry.notes : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

function showNotification(message, type) {
    // Simple notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    if (type === 'success') {
        notification.style.background = '#48bb78';
    } else if (type === 'error') {
        notification.style.background = '#e53e3e';
    } else {
        notification.style.background = '#4299e1';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load progress data on page load
document.addEventListener('DOMContentLoaded', function() {
    updateProgressDisplay();
});