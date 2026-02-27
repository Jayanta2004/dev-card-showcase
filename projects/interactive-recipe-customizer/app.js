// Interactive Recipe Customizer - Adjust, Swap, and See Nutrition

const recipes = [
    {
        name: 'Pancakes',
        servings: 4,
        ingredients: [
            { name: 'Flour', amount: 200, unit: 'g', nutrition: { calories: 728, protein: 24, fat: 2, carbs: 152 } },
            { name: 'Milk', amount: 300, unit: 'ml', nutrition: { calories: 195, protein: 10, fat: 7, carbs: 18 } },
            { name: 'Egg', amount: 2, unit: 'pcs', nutrition: { calories: 140, protein: 12, fat: 10, carbs: 2 } },
            { name: 'Sugar', amount: 30, unit: 'g', nutrition: { calories: 120, protein: 0, fat: 0, carbs: 30 } },
            { name: 'Butter', amount: 30, unit: 'g', nutrition: { calories: 215, protein: 0, fat: 24, carbs: 0 } }
        ],
        instructions: [
            'Mix flour, sugar, and a pinch of salt in a bowl.',
            'Add milk and eggs, whisk until smooth.',
            'Heat a pan, melt butter, pour batter, and cook both sides until golden.'
        ]
    },
    {
        name: 'Veggie Omelette',
        servings: 2,
        ingredients: [
            { name: 'Egg', amount: 3, unit: 'pcs', nutrition: { calories: 210, protein: 18, fat: 15, carbs: 3 } },
            { name: 'Bell Pepper', amount: 50, unit: 'g', nutrition: { calories: 15, protein: 0, fat: 0, carbs: 3 } },
            { name: 'Onion', amount: 30, unit: 'g', nutrition: { calories: 12, protein: 0, fat: 0, carbs: 3 } },
            { name: 'Cheese', amount: 40, unit: 'g', nutrition: { calories: 160, protein: 10, fat: 13, carbs: 2 } }
        ],
        instructions: [
            'Beat eggs in a bowl.',
            'Add chopped veggies and cheese.',
            'Pour into a pan and cook until set.'
        ]
    }
];

const ingredientSwaps = {
    'Milk': ['Almond Milk', 'Soy Milk', 'Oat Milk'],
    'Flour': ['Whole Wheat Flour', 'Oat Flour', 'Almond Flour'],
    'Sugar': ['Honey', 'Maple Syrup', 'Stevia'],
    'Egg': ['Chia Egg', 'Flax Egg'],
    'Butter': ['Coconut Oil', 'Olive Oil'],
    'Cheese': ['Vegan Cheese', 'Feta'],
};

let currentRecipeIdx = 0;
let currentServings = 0;
let customIngredients = [];

function renderRecipeSelect() {
    const select = document.getElementById('recipeSelect');
    select.innerHTML = '';
    recipes.forEach((r, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = r.name;
        select.appendChild(opt);
    });
    select.value = 0;
}

function renderCustomizer() {
    const recipe = recipes[currentRecipeIdx];
    const customDiv = document.getElementById('customizer');
    customDiv.innerHTML = '';
    // Serving size
    const servingRow = document.createElement('div');
    servingRow.innerHTML = `<label>Servings: <input type="number" id="servingInput" min="1" value="${currentServings}"></label>`;
    customDiv.appendChild(servingRow);
    // Ingredients
    customIngredients.forEach((ing, idx) => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `<input type="number" min="0" value="${ing.amount}" id="amount${idx}" />
            <label>${ing.name} (${ing.unit})</label>`;
        // Swaps
        if (ingredientSwaps[ing.name]) {
            const swapSelect = document.createElement('select');
            [ing.name, ...ingredientSwaps[ing.name]].forEach(optName => {
                const opt = document.createElement('option');
                opt.value = optName;
                opt.textContent = optName;
                if (optName === ing.name) opt.selected = true;
                swapSelect.appendChild(opt);
            });
            swapSelect.onchange = function() {
                customIngredients[idx].name = this.value;
                renderCustomizer();
                renderInstructions();
                renderNutrition();
            };
            row.appendChild(swapSelect);
        }
        row.querySelector('input').oninput = function() {
            customIngredients[idx].amount = parseFloat(this.value);
            renderNutrition();
        };
        customDiv.appendChild(row);
    });
    document.getElementById('servingInput').oninput = function() {
        currentServings = parseInt(this.value);
        updateIngredientsForServings();
        renderCustomizer();
        renderNutrition();
    };
}

function updateIngredientsForServings() {
    const recipe = recipes[currentRecipeIdx];
    const ratio = currentServings / recipe.servings;
    customIngredients = recipe.ingredients.map(ing => ({ ...ing, amount: Math.round(ing.amount * ratio * 100) / 100 }));
}

function renderInstructions() {
    const recipe = recipes[currentRecipeIdx];
    const instDiv = document.getElementById('instructions');
    instDiv.innerHTML = '<ol>' + recipe.instructions.map(i => `<li>${i}</li>`).join('') + '</ol>';
}

function renderNutrition() {
    let total = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    customIngredients.forEach(ing => {
        if (ing.nutrition) {
            const ratio = ing.amount / recipes[currentRecipeIdx].ingredients.find(i => i.name === ing.name)?.amount || 1;
            total.calories += ing.nutrition.calories * ratio;
            total.protein += ing.nutrition.protein * ratio;
            total.fat += ing.nutrition.fat * ratio;
            total.carbs += ing.nutrition.carbs * ratio;
        }
    });
    total = Object.fromEntries(Object.entries(total).map(([k,v]) => [k, Math.round(v*10)/10]));
    document.getElementById('nutrition').innerHTML = `<b>Calories:</b> ${total.calories} kcal<br>
        <b>Protein:</b> ${total.protein} g<br>
        <b>Fat:</b> ${total.fat} g<br>
        <b>Carbs:</b> ${total.carbs} g`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderRecipeSelect();
    currentRecipeIdx = 0;
    currentServings = recipes[0].servings;
    updateIngredientsForServings();
    renderCustomizer();
    renderInstructions();
    renderNutrition();
    document.getElementById('recipeSelect').onchange = function() {
        currentRecipeIdx = parseInt(this.value);
        currentServings = recipes[currentRecipeIdx].servings;
        updateIngredientsForServings();
        renderCustomizer();
        renderInstructions();
        renderNutrition();
    };
});
