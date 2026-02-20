// Recipe Organizer & Meal Planner
const addRecipeForm = document.getElementById('add-recipe-form');
const recipesListDiv = document.getElementById('recipes-list');
const mealPlannerForm = document.getElementById('meal-planner-form');
const mealRecipeSelect = document.getElementById('meal-recipe');
const mealPlanListDiv = document.getElementById('meal-plan-list');
const shoppingListDiv = document.getElementById('shopping-list');

let recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
let mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '[]');

function saveData() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
}

function renderRecipes() {
    recipesListDiv.innerHTML = '';
    recipes.forEach((recipe, idx) => {
        const div = document.createElement('div');
        div.className = 'recipe-entry';
        div.innerHTML = `
            <span class="recipe-title">${recipe.title}</span>
            <span class="recipe-ingredients">Ingredients: ${recipe.ingredients.join(', ')}</span>
            <span class="recipe-instructions">${recipe.instructions}</span>
        `;
        recipesListDiv.appendChild(div);
    });
    renderMealRecipeOptions();
}

function renderMealRecipeOptions() {
    mealRecipeSelect.innerHTML = recipes.map((r, i) => `<option value="${i}">${r.title}</option>`).join('');
}

function renderMealPlan() {
    mealPlanListDiv.innerHTML = '';
    if (mealPlan.length === 0) {
        mealPlanListDiv.textContent = 'No meals planned yet.';
        return;
    }
    mealPlan.forEach(mp => {
        const recipe = recipes[mp.recipeIdx];
        if (recipe) {
            const div = document.createElement('div');
            div.textContent = `${mp.day}: ${recipe.title}`;
            mealPlanListDiv.appendChild(div);
        }
    });
    renderShoppingList();
}

function renderShoppingList() {
    // Collect all ingredients for planned meals
    let ingredients = [];
    mealPlan.forEach(mp => {
        const recipe = recipes[mp.recipeIdx];
        if (recipe) {
            ingredients = ingredients.concat(recipe.ingredients);
        }
    });
    // Remove duplicates
    const uniqueIngredients = [...new Set(ingredients.map(i => i.trim().toLowerCase()))];
    shoppingListDiv.innerHTML = uniqueIngredients.length ? uniqueIngredients.map(i => `<div>${i}</div>`).join('') : 'No shopping list yet.';
}

addRecipeForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('recipe-title').value.trim();
    const ingredients = document.getElementById('ingredients').value.split(',').map(i => i.trim()).filter(Boolean);
    const instructions = document.getElementById('instructions').value.trim();
    recipes.push({ title, ingredients, instructions });
    saveData();
    renderRecipes();
    addRecipeForm.reset();
});

mealPlannerForm.addEventListener('submit', e => {
    e.preventDefault();
    const day = document.getElementById('day').value;
    const recipeIdx = parseInt(mealRecipeSelect.value);
    // Remove existing plan for the day
    mealPlan = mealPlan.filter(mp => mp.day !== day);
    mealPlan.push({ day, recipeIdx });
    saveData();
    renderMealPlan();
});

// Initial render
renderRecipes();
renderMealPlan();
