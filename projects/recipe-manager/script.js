// ===== Recipe Manager - Complete JavaScript Logic =====

// Global state
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
let pantry = JSON.parse(localStorage.getItem('pantry')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentTab = 'recipes';
let currentRecipeId = null;
let editingRecipeId = null;
let currentWeekStart = getMonday(new Date());
let ingredientCount = 1;
let instructionCount = 1;

// Ingredient categories for shopping list
const ingredientCategories = {
    'Vegetables': ['tomato', 'onion', 'garlic', 'carrot', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'pepper', 'zucchini'],
    'Fruits': ['apple', 'banana', 'orange', 'lemon', 'lime', 'berries', 'strawberry', 'blueberry'],
    'Proteins': ['chicken', 'beef', 'fish', 'pork', 'lamb', 'egg', 'tofu', 'salmon'],
    'Dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream'],
    'Grains': ['bread', 'rice', 'pasta', 'flour', 'oats'],
    'Pantry': ['oil', 'salt', 'pepper', 'sugar', 'spice', 'sauce', 'vinegar'],
    'Other': []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderRecipes();
    renderFavorites();
    updateMealPlanSelects();
    initializeMealPlan();
    renderMealPlan();
});

// ===== Tab Management =====
function showTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Refresh content
    switch(tabName) {
        case 'recipes':
            renderRecipes();
            break;
        case 'mealPlan':
            renderMealPlan();
            break;
        case 'shoppingList':
            renderShoppingList();
            break;
        case 'pantry':
            renderPantry();
            break;
        case 'favorites':
            renderFavorites();
            break;
    }
}

// ===== Recipe Management =====
function openRecipeModal(recipeId = null) {
    const modal = document.getElementById('recipeModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('recipeForm');
    
    ingredientCount = 1;
    instructionCount = 1;
    form.reset();
    editingRecipeId = recipeId;
    
    if (recipeId) {
        title.textContent = 'Edit Recipe';
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            document.getElementById('recipeName').value = recipe.name;
            document.getElementById('recipeDescription').value = recipe.description;
            document.getElementById('recipeCuisine').value = recipe.cuisine;
            document.getElementById('recipeMealType').value = recipe.mealType;
            document.getElementById('recipeDifficulty').value = recipe.difficulty;
            document.getElementById('recipePrepTime').value = recipe.prepTime;
            document.getElementById('recipeCookTime').value = recipe.cookTime;
            document.getElementById('recipeServings').value = recipe.servings;
            document.getElementById('recipeCalories').value = recipe.nutrition.calories;
            document.getElementById('recipeProtein').value = recipe.nutrition.protein;
            document.getElementById('recipeCarbs').value = recipe.nutrition.carbs;
            document.getElementById('recipeFat').value = recipe.nutrition.fat;
            document.getElementById('recipeNotes').value = recipe.notes;
            
            // Load ingredients
            document.getElementById('ingredientsInputContainer').innerHTML = '';
            recipe.ingredients.forEach((ing, idx) => {
                addIngredientInput(ing);
            });
            
            // Load instructions
            document.getElementById('instructionsInputContainer').innerHTML = '';
            recipe.instructions.forEach((instr, idx) => {
                addInstructionInput(instr);
            });
            
            // Load dietary tags
            document.querySelectorAll('.checkbox-group input').forEach(cb => {
                cb.checked = recipe.dietary.includes(cb.value);
            });
            
            if (recipe.image) {
                document.getElementById('imagePreview').src = recipe.image;
                document.getElementById('imagePreview').style.display = 'block';
            }
        }
    } else {
        title.textContent = 'Add New Recipe';
        addIngredientInput();
        addInstructionInput();
    }
    
    modal.classList.add('active');
}

function closeRecipeModal() {
    document.getElementById('recipeModal').classList.remove('active');
    editingRecipeId = null;
}

function addIngredientInput(ingredient = '') {
    const container = document.getElementById('ingredientsInputContainer');
    const div = document.createElement('div');
    div.className = 'ingredient-input-row';
    div.innerHTML = `
        <input type="text" placeholder="Ingredient (e.g., 2 cups flour)" value="${ingredient}">
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
    ingredientCount++;
}

function addInstructionInput(instruction = '') {
    const container = document.getElementById('instructionsInputContainer');
    const div = document.createElement('div');
    div.className = 'instruction-input-row';
    div.innerHTML = `
        <textarea placeholder="Step ${instructionCount}">${instruction}</textarea>
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
    instructionCount++;
}

function previewRecipeImage() {
    const file = document.getElementById('recipeImage').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function saveRecipe(e) {
    e.preventDefault();
    
    const name = document.getElementById('recipeName').value;
    const description = document.getElementById('recipeDescription').value;
    const cuisine = document.getElementById('recipeCuisine').value;
    const mealType = document.getElementById('recipeMealType').value;
    const difficulty = document.getElementById('recipeDifficulty').value;
    const prepTime = parseInt(document.getElementById('recipePrepTime').value) || 0;
    const cookTime = parseInt(document.getElementById('recipeCookTime').value) || 0;
    const servings = parseInt(document.getElementById('recipeServings').value) || 1;
    
    const nutrition = {
        calories: parseInt(document.getElementById('recipeCalories').value) || 0,
        protein: parseFloat(document.getElementById('recipeProtein').value) || 0,
        carbs: parseFloat(document.getElementById('recipeCarbs').value) || 0,
        fat: parseFloat(document.getElementById('recipeFat').value) || 0
    };
    
    const ingredients = Array.from(document.querySelectorAll('.ingredient-input-row input'))
        .map(inp => inp.value.trim())
        .filter(v => v);
    
    const instructions = Array.from(document.querySelectorAll('.instruction-input-row textarea'))
        .map(ta => ta.value.trim())
        .filter(v => v);
    
    const dietary = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
        .map(cb => cb.value);
    
    let image = document.getElementById('imagePreview').src || '';
    
    if (!name) {
        showToast('Please enter a recipe name');
        return;
    }
    
    if (editingRecipeId) {
        const recipe = recipes.find(r => r.id === editingRecipeId);
        if (recipe) {
            recipe.name = name;
            recipe.description = description;
            recipe.cuisine = cuisine;
            recipe.mealType = mealType;
            recipe.difficulty = difficulty;
            recipe.prepTime = prepTime;
            recipe.cookTime = cookTime;
            recipe.servings = servings;
            recipe.nutrition = nutrition;
            recipe.ingredients = ingredients;
            recipe.instructions = instructions;
            recipe.dietary = dietary;
            recipe.notes = document.getElementById('recipeNotes').value;
            if (image) recipe.image = image;
        }
        showToast('Recipe updated!');
    } else {
        recipes.push({
            id: Date.now(),
            name,
            description,
            cuisine,
            mealType,
            difficulty,
            prepTime,
            cookTime,
            servings,
            nutrition,
            ingredients,
            instructions,
            dietary,
            notes: document.getElementById('recipeNotes').value,
            image,
            rating: 0,
            createdAt: new Date().toISOString()
        });
        showToast('Recipe added!');
    }
    
    saveToLocalStorage();
    closeRecipeModal();
    renderRecipes();
}

function deleteRecipe(recipeId) {
    if (confirm('Delete this recipe?')) {
        recipes = recipes.filter(r => r.id !== recipeId);
        favorites = favorites.filter(id => id !== recipeId);
        saveToLocalStorage();
        closeRecipeDetail();
        renderRecipes();
        showToast('Recipe deleted');
    }
}

function editRecipe(recipeId) {
    closeRecipeDetail();
    openRecipeModal(recipeId);
}

// ===== Recipe Display =====
function renderRecipes() {
    const container = document.getElementById('recipesContainer');
    
    if (recipes.length === 0) {
        container.innerHTML = '<div class="empty-state">No recipes yet. Create your first recipe!</div>';
        return;
    }
    
    const filtered = getFilteredRecipes();
    
    container.innerHTML = filtered.map(recipe => `
        <div class="recipe-card">
            ${recipe.image ? `<img src="${recipe.image}" class="recipe-card-image">` : '<div class="recipe-card-image" style="background: linear-gradient(135deg, #f0f0f0, #e0e0e0);"></div>'}
            <div class="recipe-card-content">
                <div class="recipe-card-header">
                    <div>
                        <div class="recipe-card-title">${recipe.name}</div>
                        <div class="recipe-card-rating">${'★'.repeat(recipe.rating)}${'☆'.repeat(5-recipe.rating)}</div>
                    </div>
                    <button class="recipe-favorites-btn" onclick="toggleFavorite(${recipe.id})">
                        ${favorites.includes(recipe.id) ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="recipe-card-tags">
                    <span class="tag">${recipe.cuisine}</span>
                    <span class="tag">${recipe.mealType}</span>
                    <span class="tag">${recipe.difficulty}</span>
                </div>
                <div class="recipe-card-meta">
                    <span>⏱️ ${recipe.prepTime + recipe.cookTime}m</span>
                    <span>🍽️ ${recipe.servings} servings</span>
                    <span>🔥 ${recipe.nutrition.calories} cal</span>
                </div>
                <p class="recipe-card-description">${recipe.description}</p>
                <div class="recipe-card-actions">
                    <button class="recipe-action-btn" onclick="openRecipeDetail(${recipe.id})">View Recipe</button>
                    <button class="recipe-action-btn second" onclick="addRecipeToMealPlan(${recipe.id})">📅 Add</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderFavorites() {
    const container = document.getElementById('favoritesContainer');
    const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));
    
    if (favoriteRecipes.length === 0) {
        container.innerHTML = '<div class="empty-state">No favorite recipes yet.</div>';
        return;
    }
    
    container.innerHTML = favoriteRecipes.map(recipe => `
        <div class="recipe-card">
            ${recipe.image ? `<img src="${recipe.image}" class="recipe-card-image">` : '<div class="recipe-card-image" style="background: linear-gradient(135deg, #f0f0f0, #e0e0e0); font-size: 4rem; display: flex; align-items:center; justify-content: center;">🍳</div>'}
            <div class="recipe-card-content">
                <div class="recipe-card-header">
                    <div class="recipe-card-title">${recipe.name}</div>
                    <button class="recipe-favorites-btn" onclick="toggleFavorite(${recipe.id})">❤️</button>
                </div>
                <div class="recipe-card-tags">
                    <span class="tag">${recipe.cuisine}</span>
                    <span class="tag">${recipe.mealType}</span>
                </div>
                <div class="recipe-card-meta">
                    <span>⏱️ ${recipe.prepTime + recipe.cookTime}m</span>
                    <span>🍽️ ${recipe.servings} servings</span>
                </div>
                <div class="recipe-card-actions">
                    <button class="recipe-action-btn" onclick="openRecipeDetail(${recipe.id})">View Recipe</button>
                    <button class="recipe-action-btn second" onclick="addRecipeToMealPlan(${recipe.id})">📅 Add</button>
                </div>
            </div>
        </div>
    `).join('');
}

function getFilteredRecipes() {
    const searchTerm = document.getElementById('recipeSearch').value.toLowerCase();
    const cuisineFilter = document.getElementById('cuisineFilter').value;
    const mealTypeFilter = document.getElementById('mealTypeFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const dietaryFilter = document.getElementById('dietaryFilter').value;
    
    return recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) || 
                             recipe.description.toLowerCase().includes(searchTerm);
        const matchesCuisine = !cuisineFilter || recipe.cuisine === cuisineFilter;
        const matchesMealType = !mealTypeFilter || recipe.mealType === mealTypeFilter;
        const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter;
        const matchesDietary = !dietaryFilter || recipe.dietary.includes(dietaryFilter);
        
        return matchesSearch && matchesCuisine && matchesMealType && matchesDifficulty && matchesDietary;
    });
}

function filterRecipes() {
    renderRecipes();
}

// ===== Recipe Detail View =====
function openRecipeDetail(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    currentRecipeId = recipeId;
    
    document.getElementById('recipeTitle').textContent = recipe.name;
    document.getElementById('recipeImage').src = recipe.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23f0f0f0" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3E🍳 Recipe Image%3C/text%3E%3C/svg%3E';
    
    document.getElementById('cuisineTag').textContent = recipe.cuisine;
    document.getElementById('mealTypeTag').textContent = recipe.mealType;
    document.getElementById('difficultyTag').textContent = recipe.difficulty;
    
    document.getElementById('prepTime').textContent = `${recipe.prepTime} min prep`;
    document.getElementById('cookTime').textContent = `${recipe.cookTime} min cook`;
    document.getElementById('servings').textContent = `${recipe.servings} servings`;
    
    // Nutrition
    document.getElementById('nutritionInfo').innerHTML = `
        <div class="nutrition-item">
            <div class="nutrition-value">${recipe.nutrition.calories}</div>
            <div class="nutrition-label">Calories</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-value">${recipe.nutrition.protein.toFixed(1)}g</div>
            <div class="nutrition-label">Protein</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-value">${recipe.nutrition.carbs.toFixed(1)}g</div>
            <div class="nutrition-label">Carbs</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-value">${recipe.nutrition.fat.toFixed(1)}g</div>
            <div class="nutrition-label">Fat</div>
        </div>
    `;
    
    // Scaler
    document.getElementById('servingsScaler').value = 1;
    
    // Ingredients
    document.getElementById('ingredientsList').innerHTML = recipe.ingredients.map(ing => `
        <li>
            <input type="checkbox">
            <span>${ing}</span>
        </li>
    `).join('');
    
    // Instructions
    document.getElementById('instructionsList').innerHTML = recipe.instructions.map(instr => `
        <li>${instr}</li>
    `).join('');
    
    document.getElementById('recipeNotes').textContent = recipe.notes;
    document.getElementById('recipeRating').textContent = `${recipe.rating} stars`;
    
    // Update stars
    document.querySelectorAll('.star').forEach((star, idx) => {
        star.classList.remove('active');
        if (idx < recipe.rating) star.classList.add('active');
    });
    
    document.getElementById('recipeDetailModal').classList.add('active');
}

function closeRecipeDetail() {
    document.getElementById('recipeDetailModal').classList.remove('active');
    currentRecipeId = null;
}

function updateIngredientsForServings() {
    // Placeholder for scaling logic
    const recipe = recipes.find(r => r.id === currentRecipeId);
    if (!recipe) return;
    
    const scaler = parseInt(document.getElementById('servingsScaler').value) || 1;
    const factor = scaler / recipe.servings;
    
    // Show scaled ingredients
    showToast(`Ingredients scaled for ${scaler} servings`);
}

function decreaseServings() {
    const input = document.getElementById('servingsScaler');
    input.value = Math.max(1, parseInt(input.value) - 1);
    updateIngredientsForServings();
}

function increaseServings() {
    const input = document.getElementById('servingsScaler');
    input.value = parseInt(input.value) + 1;
    updateIngredientsForServings();
}

function rateRecipe(rating) {
    const recipe = recipes.find(r => r.id === currentRecipeId);
    if (recipe) {
        recipe.rating = rating;
        document.querySelectorAll('.star').forEach((star, idx) => {
            star.classList.toggle('active', idx < rating);
        });
        document.getElementById('recipeRating').textContent = `${rating} stars`;
        saveToLocalStorage();
        showToast(`Recipe rated ${rating} stars!`);
    }
}

// ===== Favorites =====
function toggleFavorite(recipeId) {
    if (favorites.includes(recipeId)) {
        favorites = favorites.filter(id => id !== recipeId);
        showToast('Removed from favorites');
    } else {
        favorites.push(recipeId);
        showToast('Added to favorites!');
    }
    saveToLocalStorage();
    renderRecipes();
    renderFavorites();
}

// ===== Meal Planning =====
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function initializeMealPlan() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    
    days.forEach(day => {
        if (!mealPlan[day]) {
            mealPlan[day] = {};
            mealTypes.forEach(meal => {
                mealPlan[day][meal] = null;
            });
        }
    });
    
    saveToLocalStorage();
}

function updateMealPlanSelects() {
    const select = document.getElementById('mealPlanRecipeSelect');
    select.innerHTML = recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
}

function openMealPlannerModal(recipeId = null) {
    if (recipeId) {
        document.getElementById('mealPlanRecipeSelect').value = recipeId;
    }
    document.getElementById('mealPlannerModal').classList.add('active');
}

function closeMealPlannerModal() {
    document.getElementById('mealPlannerModal').classList.remove('active');
}

function addToMealPlan() {
    const recipeId = parseInt(document.getElementById('mealPlanRecipeSelect').value);
    const day = document.getElementById('mealPlanDay').value;
    const mealType = document.getElementById('mealPlanMealType').value;
    
    mealPlan[day][mealType] = recipeId;
    saveToLocalStorage();
    closeMealPlannerModal();
    renderMealPlan();
    showToast('Added to meal plan!');
}

function addRecipeToMealPlan(recipeId) {
    openMealPlannerModal(recipeId);
}

function renderMealPlan() {
    const start = currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    document.getElementById('weekTitle').textContent = 
        `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    
    const container = document.getElementById('mealPlanContainer');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    container.innerHTML = days.map(day => {
        const mealSlots = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
        return `
            <div class="meal-day">
                <div class="meal-day-title">${day}</div>
                <div class="meal-slots">
                    ${mealSlots.map(meal => {
                        const recipeId = mealPlan[day][meal];
                        const recipe = recipes.find(r => r.id === recipeId);
                        return `
                            <div class="meal-slot">
                                <div class="meal-slot-type">${meal}</div>
                                <div class="meal-slot-recipe">${recipe ? recipe.name : 'Not planned'}</div>
                                <div class="meal-slot-actions">
                                    <button class="meal-slot-btn" onclick="openMealPlannerModal(); document.getElementById('mealPlanDay').value='${day}'; document.getElementById('mealPlanMealType').value='${meal}';">Edit</button>
                                    <button class="meal-slot-btn" onclick="removeMealPlan('${day}', '${meal}')">Clear</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function removeMealPlan(day, meal) {
    mealPlan[day][meal] = null;
    saveToLocalStorage();
    renderMealPlan();
    showToast('Meal removed from plan');
}

function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderMealPlan();
}

function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderMealPlan();
}

// ===== Shopping List =====
function generateShoppingListFromMealPlan() {
    shoppingList = [];
    
    Object.values(mealPlan).forEach(dayMeals => {
        Object.values(dayMeals).forEach(recipeId => {
            if (recipeId) {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    recipe.ingredients.forEach(ing => {
                        const existing = shoppingList.find(item => item.ingredient === ing);
                        if (existing) {
                            existing.quantity++;
                        } else {
                            shoppingList.push({
                                ingredient: ing,
                                quantity: 1,
                                checked: false
                            });
                        }
                    });
                }
            }
        });
    });
    
    saveToLocalStorage();
    showTab('shoppingList');
    showToast('Shopping list generated!');
}

function renderShoppingList() {
    const container = document.getElementById('shoppingListContainer');
    
    if (shoppingList.length === 0) {
        container.innerHTML = '<div class="empty-state">Shopping list is empty</div>';
        return;
    }
    
    const categorized = {};
    
    shoppingList.forEach(item => {
        let category = 'Other';
        const itemLower = item.ingredient.toLowerCase();
        
        for (const [cat, keywords] of Object.entries(ingredientCategories)) {
            if (keywords.some(keyword => itemLower.includes(keyword))) {
                category = cat;
                break;
            }
        }
        
        if (!categorized[category]) {
            categorized[category] = [];
        }
        categorized[category].push(item);
    });
    
    container.innerHTML = Object.entries(categorized).map(([category, items]) => `
        <div class="shopping-category">
            <div class="shopping-category-title">${category}</div>
            ${items.map((item, idx) => `
                <div class="shopping-item ${item.checked ? 'checked' : ''}">
                    <input type="checkbox" ${item.checked ? 'checked' : ''} 
                           onchange="toggleShoppingItem(${shoppingList.indexOf(item)})">
                    <span class="shopping-item-name">${item.ingredient}</span>
                    <span class="shopping-item-qty">x${item.quantity}</span>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function toggleShoppingItem(index) {
    shoppingList[index].checked = !shoppingList[index].checked;
    saveToLocalStorage();
    renderShoppingList();
}

function clearShoppingList() {
    if (confirm('Clear entire shopping list?')) {
        shoppingList = [];
        saveToLocalStorage();
        renderShoppingList();
        showToast('Shopping list cleared');
    }
}

function exportShoppingList(format) {
    if (format === 'print') {
        window.print();
    } else if (format === 'pdf') {
        const text = shoppingList.map(item => `${item.ingredient} x${item.quantity}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        showToast('Shopping list exported!');
    }
}

function exportMealPlan() {
    const text = JSON.stringify(mealPlan, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meal-plan-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Meal plan exported!');
}

// ===== Pantry Management =====
function renderPantry() {
    const container = document.getElementById('pantryContainer');
    
    if (pantry.length === 0) {
        container.innerHTML = '<div class="empty-state">Pantry is empty</div>';
        return;
    }
    
    container.innerHTML = pantry.map((item, idx) => `
        <div class="pantry-item">
            <span class="pantry-item-name">${item}</span>
            <div class="pantry-item-actions">
                <button class="pantry-btn" onclick="removePantryItem(${idx})">Remove</button>
            </div>
        </div>
    `).join('');
}

function addPantryItem() {
    const input = document.getElementById('pantryItemInput');
    const item = input.value.trim();
    
    if (item && !pantry.includes(item)) {
        pantry.push(item);
        input.value = '';
        saveToLocalStorage();
        renderPantry();
        showToast('Item added to pantry');
    }
}

function removePantryItem(index) {
    pantry.splice(index, 1);
    saveToLocalStorage();
    renderPantry();
    showToast('Item removed from pantry');
}

// ===== Local Storage =====
function saveToLocalStorage() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    localStorage.setItem('pantry', JSON.stringify(pantry));
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('recipes');
    if (saved) recipes = JSON.parse(saved);
    
    const savedMeal = localStorage.getItem('mealPlan');
    if (savedMeal) mealPlan = JSON.parse(savedMeal);
    
    const savedShopping = localStorage.getItem('shoppingList');
    if (savedShopping) shoppingList = JSON.parse(savedShopping);
    
    const savedPantry = localStorage.getItem('pantry');
    if (savedPantry) pantry = JSON.parse(savedPantry);
    
    const savedFav = localStorage.getItem('favorites');
    if (savedFav) favorites = JSON.parse(savedFav);
}

// ===== Toast =====
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
