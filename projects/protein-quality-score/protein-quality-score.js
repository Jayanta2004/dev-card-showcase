// protein-quality-score.js

// FAO/WHO reference amino acid pattern (mg/g protein)
const referencePattern = {
    histidine: 16,
    isoleucine: 30,
    leucine: 59,
    lysine: 45,
    methionineCysteine: 22,
    phenylalanineTyrosine: 38,
    threonine: 23,
    tryptophan: 6,
    valine: 39
};

// Food database with amino acid content per 100g
const foodDatabase = {
    // Animal proteins (high quality)
    'chicken_breast': {
        name: 'Chicken Breast',
        protein: 31,
        aminoAcids: {
            histidine: 9.3,
            isoleucine: 14.3,
            leucine: 22.8,
            lysine: 25.6,
            methionineCysteine: 9.7,
            phenylalanineTyrosine: 19.4,
            threonine: 12.6,
            tryptophan: 2.7,
            valine: 14.8
        }
    },
    'eggs': {
        name: 'Eggs',
        protein: 13,
        aminoAcids: {
            histidine: 3.0,
            isoleucine: 6.6,
            leucine: 10.9,
            lysine: 9.1,
            methionineCysteine: 5.8,
            phenylalanineTyrosine: 9.2,
            threonine: 5.5,
            tryptophan: 1.7,
            valine: 7.9
        }
    },
    'salmon': {
        name: 'Salmon',
        protein: 25,
        aminoAcids: {
            histidine: 6.8,
            isoleucine: 11.4,
            leucine: 20.4,
            lysine: 22.1,
            methionineCysteine: 9.7,
            phenylalanineTyrosine: 17.8,
            threonine: 10.4,
            tryptophan: 2.4,
            valine: 12.0
        }
    },
    // Plant proteins (varying quality)
    'lentils': {
        name: 'Lentils',
        protein: 9,
        aminoAcids: {
            histidine: 2.4,
            isoleucine: 3.3,
            leucine: 6.3,
            lysine: 6.3,
            methionineCysteine: 1.5,
            phenylalanineTyrosine: 5.0,
            threonine: 2.8,
            tryptophan: 0.8,
            valine: 3.7
        }
    },
    'quinoa': {
        name: 'Quinoa',
        protein: 14,
        aminoAcids: {
            histidine: 3.1,
            isoleucine: 4.0,
            leucine: 6.1,
            lysine: 5.1,
            methionineCysteine: 3.4,
            phenylalanineTyrosine: 6.8,
            threonine: 3.4,
            tryptophan: 1.1,
            valine: 4.4
        }
    },
    'tofu': {
        name: 'Tofu',
        protein: 8,
        aminoAcids: {
            histidine: 1.8,
            isoleucine: 3.0,
            leucine: 5.2,
            lysine: 4.8,
            methionineCysteine: 1.8,
            phenylalanineTyrosine: 4.4,
            threonine: 2.8,
            tryptophan: 1.0,
            valine: 3.2
        }
    },
    'almonds': {
        name: 'Almonds',
        protein: 21,
        aminoAcids: {
            histidine: 5.0,
            isoleucine: 7.8,
            leucine: 14.3,
            lysine: 6.0,
            methionineCysteine: 3.8,
            phenylalanineTyrosine: 12.5,
            threonine: 6.1,
            tryptophan: 2.4,
            valine: 8.8
        }
    },
    'peas': {
        name: 'Green Peas',
        protein: 5,
        aminoAcids: {
            histidine: 1.2,
            isoleucine: 1.8,
            leucine: 3.0,
            lysine: 2.8,
            methionineCysteine: 0.7,
            phenylalanineTyrosine: 2.4,
            threonine: 1.6,
            tryptophan: 0.4,
            valine: 2.0
        }
    },
    'rice': {
        name: 'White Rice',
        protein: 3,
        aminoAcids: {
            histidine: 0.7,
            isoleucine: 1.1,
            leucine: 2.1,
            lysine: 0.9,
            methionineCysteine: 0.8,
            phenylalanineTyrosine: 1.8,
            threonine: 0.9,
            tryptophan: 0.3,
            valine: 1.4
        }
    },
    'wheat': {
        name: 'Whole Wheat',
        protein: 13,
        aminoAcids: {
            histidine: 2.8,
            isoleucine: 3.6,
            leucine: 7.5,
            lysine: 2.7,
            methionineCysteine: 3.5,
            phenylalanineTyrosine: 7.0,
            threonine: 2.9,
            tryptophan: 1.2,
            valine: 4.4
        }
    }
};

let dailyFoods = JSON.parse(localStorage.getItem('proteinQualityFoods')) || [];

function populateFoodSelect() {
    const select = document.getElementById('foodSelect');
    Object.keys(foodDatabase).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = foodDatabase[key].name;
        select.appendChild(option);
    });
}

function calculateQualityScore(foods) {
    if (foods.length === 0) return { score: 0, totalProtein: 0, limitingAA: 'None' };

    // Aggregate amino acids from all foods
    let totalAminoAcids = {
        histidine: 0,
        isoleucine: 0,
        leucine: 0,
        lysine: 0,
        methionineCysteine: 0,
        phenylalanineTyrosine: 0,
        threonine: 0,
        tryptophan: 0,
        valine: 0
    };

    let totalProtein = 0;

    foods.forEach(food => {
        const foodData = foodDatabase[food.foodKey];
        const multiplier = food.quantity / 100; // per 100g
        totalProtein += foodData.protein * multiplier;

        Object.keys(totalAminoAcids).forEach(aa => {
            totalAminoAcids[aa] += foodData.aminoAcids[aa] * multiplier;
        });
    });

    // Calculate scores for each amino acid
    const scores = {};
    Object.keys(referencePattern).forEach(aa => {
        const required = referencePattern[aa] * totalProtein / 1000; // convert to mg
        scores[aa] = totalAminoAcids[aa] / required * 100;
    });

    // Find limiting amino acid
    const limitingAA = Object.keys(scores).reduce((a, b) =>
        scores[a] < scores[b] ? a : b
    );

    const qualityScore = Math.min(...Object.values(scores));

    return {
        score: Math.round(qualityScore),
        totalProtein: Math.round(totalProtein * 10) / 10,
        limitingAA: limitingAA.charAt(0).toUpperCase() + limitingAA.slice(1)
    };
}

function logFood() {
    const foodKey = document.getElementById('foodSelect').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const mealType = document.getElementById('mealType').value;

    if (!foodKey || !quantity || quantity <= 0) {
        alert('Please select a food and enter a valid quantity.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const entry = {
        id: Date.now(),
        date: today,
        foodKey,
        quantity,
        mealType
    };

    // Filter out today's entries and add new one
    dailyFoods = dailyFoods.filter(food => food.date !== today);
    dailyFoods.push(entry);

    localStorage.setItem('proteinQualityFoods', JSON.stringify(dailyFoods));

    // Clear form
    document.getElementById('foodSelect').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('mealType').value = 'breakfast';

    updateStats();
    updateFoodList();
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todaysFoods = dailyFoods.filter(food => food.date === today);

    const stats = calculateQualityScore(todaysFoods);

    document.getElementById('qualityScore').textContent = `${stats.score}%`;
    document.getElementById('totalProtein').textContent = `${stats.totalProtein}g`;
    document.getElementById('limitingAA').textContent = stats.limitingAA;
}

function updateFoodList() {
    const foodList = document.getElementById('foodList');
    foodList.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];
    const todaysFoods = dailyFoods.filter(food => food.date === today);

    todaysFoods.forEach(food => {
        const foodData = foodDatabase[food.foodKey];
        const entryDiv = document.createElement('div');
        entryDiv.className = 'food-entry';

        const qualityClass = foodData.protein > 15 ? 'quality-high' :
                           foodData.protein > 8 ? 'quality-medium' : 'quality-low';

        entryDiv.innerHTML = `
            <div class="food-info">
                <div class="food-name">${foodData.name}</div>
                <div class="food-details">
                    ${food.quantity}g • ${food.mealType} •
                    <span class="quality-indicator ${qualityClass}">${foodData.protein}g protein/100g</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteFood(${food.id})">Delete</button>
        `;

        foodList.appendChild(entryDiv);
    });
}

function deleteFood(id) {
    if (confirm('Are you sure you want to delete this food entry?')) {
        dailyFoods = dailyFoods.filter(food => food.id !== id);
        localStorage.setItem('proteinQualityFoods', JSON.stringify(dailyFoods));
        updateStats();
        updateFoodList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    populateFoodSelect();
    updateStats();
    updateFoodList();
});