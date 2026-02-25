// Smart Grocery List Organizer
// Core logic for item management, recipes, diet, and deals

const groceryList = [];
const recipes = [];
const dietPreferences = [];
const deals = [];

// Grocery List Management
const listEl = document.getElementById('grocery-list');
const addItemForm = document.getElementById('add-item-form');
const itemInput = document.getElementById('item-input');

addItemForm.addEventListener('submit', e => {
    e.preventDefault();
    const item = itemInput.value.trim();
    if (item) {
        groceryList.push(item);
        renderList();
        itemInput.value = '';
    }
});

function renderList() {
    listEl.innerHTML = '';
    groceryList.forEach((item, idx) => {
        const li = document.createElement('li');
        li.textContent = item;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
            groceryList.splice(idx, 1);
            renderList();
        };
        li.appendChild(removeBtn);
        listEl.appendChild(li);
    });
}

// Recipe Management
const recipesEl = document.getElementById('recipes');
const addRecipeBtn = document.getElementById('add-recipe-btn');

addRecipeBtn.onclick = () => {
    const name = prompt('Recipe name:');
    if (name) {
        const ingredients = prompt('Ingredients (comma separated):');
        recipes.push({ name, ingredients: ingredients.split(',').map(i => i.trim()) });
        renderRecipes();
    }
};

function renderRecipes() {
    recipesEl.innerHTML = '';
    recipes.forEach(recipe => {
        const div = document.createElement('div');
        div.className = 'recipe';
        div.innerHTML = `<strong>${recipe.name}</strong><br>Ingredients: ${recipe.ingredients.join(', ')}`;
        recipesEl.appendChild(div);
    });
}

// Dietary Preferences
const dietForm = document.getElementById('diet-form');
const dietInput = document.getElementById('diet-input');
const dietListEl = document.getElementById('diet-list');

dietForm.addEventListener('submit', e => {
    e.preventDefault();
    const pref = dietInput.value.trim();
    if (pref) {
        dietPreferences.push(pref);
        renderDiet();
        dietInput.value = '';
    }
});

function renderDiet() {
    dietListEl.innerHTML = dietPreferences.map(p => `<span>${p}</span>`).join(', ');
}

// Store Deals (Mock)
const fetchDealsBtn = document.getElementById('fetch-deals-btn');
const dealsListEl = document.getElementById('deals-list');

fetchDealsBtn.onclick = () => {
    // Simulate fetching deals
    deals.length = 0;
    deals.push({ item: 'Milk', discount: '10%' });
    deals.push({ item: 'Bread', discount: '15%' });
    deals.push({ item: 'Eggs', discount: '5%' });
    renderDeals();
};

function renderDeals() {
    dealsListEl.innerHTML = '';
    deals.forEach(deal => {
        const div = document.createElement('div');
        div.className = 'deal';
        div.innerHTML = `<strong>${deal.item}</strong> - ${deal.discount} off`;
        dealsListEl.appendChild(div);
    });
}

// Optimize List (basic demo)
// Could be expanded to match recipes, diet, and deals

// ...extend with more features as needed...
