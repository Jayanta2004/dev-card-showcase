// AI-Powered Recipe Improviser (Demo: Keyword-based)
// Author: EWOC Contributors
// Description: Suggests creative recipes based on what’s in your fridge, with substitutions for missing ingredients.

const form = document.getElementById('ingredientForm');
const confirmation = document.getElementById('confirmation');
const recipeSuggestionsDiv = document.getElementById('recipeSuggestions');

const RECIPES = [
    {
        name: 'Veggie Omelette',
        ingredients: ['eggs', 'milk', 'cheese', 'bell pepper', 'onion'],
        steps: 'Beat eggs with milk, add chopped veggies and cheese, cook in a pan until set.',
        subs: { 'eggs': 'tofu (for vegan)', 'milk': 'plant milk', 'cheese': 'nutritional yeast', 'bell pepper': 'any veggie', 'onion': 'shallot' }
    },
    {
        name: 'Pasta Primavera',
        ingredients: ['pasta', 'tomato', 'zucchini', 'olive oil', 'garlic'],
        steps: 'Cook pasta, sauté veggies in olive oil, toss together with garlic.',
        subs: { 'pasta': 'zoodles', 'tomato': 'sun-dried tomato', 'zucchini': 'broccoli', 'olive oil': 'butter', 'garlic': 'garlic powder' }
    },
    {
        name: 'Simple Fried Rice',
        ingredients: ['rice', 'egg', 'carrot', 'peas', 'soy sauce'],
        steps: 'Stir-fry veggies, add rice and egg, season with soy sauce.',
        subs: { 'rice': 'quinoa', 'egg': 'tofu', 'carrot': 'bell pepper', 'peas': 'corn', 'soy sauce': 'tamari' }
    },
    {
        name: 'Chickpea Salad',
        ingredients: ['chickpeas', 'cucumber', 'tomato', 'lemon', 'olive oil'],
        steps: 'Mix all ingredients, season with lemon and olive oil.',
        subs: { 'chickpeas': 'beans', 'cucumber': 'zucchini', 'tomato': 'bell pepper', 'lemon': 'lime', 'olive oil': 'any oil' }
    },
    {
        name: 'Banana Pancakes',
        ingredients: ['banana', 'egg', 'flour', 'milk', 'baking powder'],
        steps: 'Mash banana, mix with egg, flour, milk, and baking powder. Cook on skillet.',
        subs: { 'banana': 'applesauce', 'egg': 'flax egg', 'flour': 'oat flour', 'milk': 'plant milk', 'baking powder': 'baking soda' }
    }
];

function suggestRecipes(available) {
    const availableSet = new Set(available.map(i => i.trim().toLowerCase()));
    return RECIPES.map(recipe => {
        const missing = recipe.ingredients.filter(i => !availableSet.has(i));
        return { ...recipe, missing };
    }).filter(r => r.missing.length < r.ingredients.length);
}

function renderRecipes(recipes, available) {
    if (!recipes.length) {
        recipeSuggestionsDiv.innerHTML = '<em>No recipes found with your ingredients. Try adding more or different items!</em>';
        return;
    }
    recipeSuggestionsDiv.innerHTML = recipes.map(r =>
        `<div class="recipe-card">
            <div class="meta"><b>${r.name}</b></div>
            <div><b>Ingredients:</b> ${r.ingredients.join(', ')}</div>
            <div><b>Steps:</b> ${r.steps}</div>
            ${r.missing.length ? `<div class="subs"><b>Missing:</b> ${r.missing.map(m => `${m} (try: ${r.subs[m] || 'other'})`).join(', ')}</div>` : '<div class="subs">All ingredients available!</div>'}
        </div>`
    ).join('');
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const ingredients = form.ingredients.value.split(',').map(i => i.trim()).filter(Boolean);
    if (!ingredients.length) return;
    const recipes = suggestRecipes(ingredients);
    confirmation.textContent = `Found ${recipes.length} recipe(s)!`;
    confirmation.classList.remove('hidden');
    renderRecipes(recipes, ingredients);
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});
