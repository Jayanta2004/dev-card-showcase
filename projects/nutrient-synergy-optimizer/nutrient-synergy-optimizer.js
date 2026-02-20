// nutrient-synergy-optimizer.js

const nutrients = [
    'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K', 'Iron', 'Calcium',
    'Magnesium', 'Zinc', 'Copper', 'Selenium', 'Iodine', 'Omega-3',
    'Protein', 'Fiber', 'Antioxidants', 'Probiotics'
];

const synergies = {
    'Vitamin C-Iron': { boost: 300, description: 'Vitamin C enhances iron absorption by converting it to a more absorbable form' },
    'Vitamin D-Calcium': { boost: 200, description: 'Vitamin D is essential for calcium absorption in the gut' },
    'Vitamin D-Magnesium': { boost: 150, description: 'Magnesium helps activate vitamin D in the body' },
    'Vitamin E-Vitamin C': { boost: 120, description: 'These antioxidants work together to protect cells from damage' },
    'Calcium-Magnesium': { boost: 100, description: 'These minerals work in balance for bone health and muscle function' },
    'Zinc-Copper': { boost: 180, description: 'Zinc and copper compete for absorption; balance is important' },
    'Iron-Zinc': { boost: 90, description: 'Iron can inhibit zinc absorption; timing intake helps' },
    'Omega-3-Vitamin D': { boost: 130, description: 'Omega-3 fatty acids enhance vitamin D receptor activity' },
    'Vitamin K-Calcium': { boost: 160, description: 'Vitamin K directs calcium to bones and prevents calcification in arteries' },
    'Magnesium-Vitamin K': { boost: 140, description: 'Magnesium activates vitamin K-dependent proteins' },
    'Selenium-Vitamin E': { boost: 110, description: 'These work together as part of the body\'s antioxidant defense system' },
    'Iodine-Selenium': { boost: 170, description: 'Selenium is needed to convert T4 thyroid hormone to active T3' },
    'Probiotics-Vitamin D': { boost: 125, description: 'Probiotics may enhance vitamin D production in the skin' },
    'Fiber-Vitamin C': { boost: 105, description: 'Fiber can enhance vitamin C absorption and utilization' },
    'Protein-Iron': { boost: 115, description: 'Protein enhances iron absorption, especially heme iron' },
    'Antioxidants-Vitamin E': { boost: 135, description: 'Various antioxidants support vitamin E recycling' }
};

let selectedNutrients = [];

function initNutrientList() {
    const nutrientList = document.getElementById('nutrientList');
    nutrients.forEach(nutrient => {
        const item = document.createElement('div');
        item.className = 'nutrient-item';
        item.textContent = nutrient;
        item.onclick = () => toggleNutrient(nutrient, item);
        nutrientList.appendChild(item);
    });
}

function toggleNutrient(nutrient, element) {
    if (selectedNutrients.includes(nutrient)) {
        selectedNutrients = selectedNutrients.filter(n => n !== nutrient);
        element.classList.remove('selected');
    } else {
        selectedNutrients.push(nutrient);
        element.classList.add('selected');
    }
}

function optimizeSynergies() {
    if (selectedNutrients.length < 2) {
        alert('Please select at least 2 nutrients to optimize synergies.');
        return;
    }

    const results = findSynergies(selectedNutrients);
    displayResults(results);
    document.getElementById('resultsSection').style.display = 'block';
}

function findSynergies(selected) {
    const results = [];
    for (let i = 0; i < selected.length; i++) {
        for (let j = i + 1; j < selected.length; j++) {
            const pair = `${selected[i]}-${selected[j]}`;
            const reversePair = `${selected[j]}-${selected[i]}`;
            if (synergies[pair]) {
                results.push({
                    nutrients: [selected[i], selected[j]],
                    boost: synergies[pair].boost,
                    description: synergies[pair].description
                });
            } else if (synergies[reversePair]) {
                results.push({
                    nutrients: [selected[i], selected[j]],
                    boost: synergies[reversePair].boost,
                    description: synergies[reversePair].description
                });
            }
        }
    }
    return results.sort((a, b) => b.boost - a.boost);
}

function displayResults(results) {
    const synergyCards = document.getElementById('synergyCards');
    synergyCards.innerHTML = '';

    if (results.length === 0) {
        synergyCards.innerHTML = '<p>No known synergies found for the selected nutrient combination.</p>';
        return;
    }

    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'synergy-card';
        card.innerHTML = `
            <h3>${result.nutrients.join(' + ')}</h3>
            <div class="synergy-pair">${result.nutrients[0]} & ${result.nutrients[1]}</div>
            <div class="absorption-boost">+${result.boost}% Absorption Boost</div>
            <p>${result.description}</p>
        `;
        synergyCards.appendChild(card);
    });

    updateChart(results);
}

function updateChart(results) {
    const ctx = document.getElementById('absorptionChart').getContext('2d');

    const labels = results.map(r => r.nutrients.join(' + '));
    const data = results.map(r => r.boost);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Absorption Boost (%)',
                data: data,
                backgroundColor: 'rgba(79, 209, 255, 0.6)',
                borderColor: 'rgba(79, 209, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Absorption Boost (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Nutrient Pairs'
                    }
                }
            }
        }
    });
}

function displayRecommendations() {
    const recommendationsDiv = document.getElementById('recommendations');
    const recommendations = [
        {
            title: 'Iron + Vitamin C',
            description: 'Take vitamin C-rich foods (citrus, bell peppers) with iron-rich foods (spinach, lentils) to boost iron absorption by up to 300%.'
        },
        {
            title: 'Calcium + Vitamin D',
            description: 'Consume vitamin D sources (sunlight, fatty fish) with calcium-rich foods (dairy, leafy greens) for optimal bone health.'
        },
        {
            title: 'Fat-Soluble Vitamins',
            description: 'Vitamins A, D, E, K are better absorbed with healthy fats. Eat them with avocados, nuts, or olive oil.'
        },
        {
            title: 'Timing Matters',
            description: 'Some nutrients compete for absorption. Space out calcium supplements and iron supplements by 2 hours.'
        },
        {
            title: 'Probiotics + Prebiotics',
            description: 'Eat probiotic-rich foods (yogurt, kefir) with prebiotic fibers (onions, garlic) to support gut health.'
        }
    ];

    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <div class="recommendation-title">${rec.title}</div>
            <div class="recommendation-description">${rec.description}</div>
        `;
        recommendationsDiv.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initNutrientList();
    displayRecommendations();
});