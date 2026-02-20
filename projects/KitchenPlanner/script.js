// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const recipeBank = document.getElementById('recipeBank');
    const weekCalendar = document.getElementById('weekCalendar');
    const shoppingList = document.getElementById('shoppingList');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const recipeModal = document.getElementById('recipeModal');
    const recipeDetailModal = document.getElementById('recipeDetailModal');
    const confirmModal = document.getElementById('confirmModal');
    const recipeForm = document.getElementById('recipeForm');
    const recipeSearch = document.getElementById('recipeSearch');
    const clearWeekBtn = document.getElementById('clearWeekBtn');
    const pantryToggle = document.getElementById('pantryToggle');
    const togglePantryModeBtn = document.getElementById('togglePantryMode');
    const printListBtn = document.getElementById('printListBtn');
    const copyListBtn = document.getElementById('copyListBtn');
    const clearListBtn = document.getElementById('clearListBtn');
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const currentWeekElement = document.getElementById('currentWeek');
    
    // Close modal buttons
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Confirmation modal elements
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmCancel = document.getElementById('confirmCancel');
    const confirmOk = document.getElementById('confirmOk');
    
    // Ingredient management
    const addIngredientBtn = document.getElementById('addIngredientBtn');
    const ingredientsContainer = document.querySelector('.ingredients-input');
    
    // Shopping list stats
    const totalItemsElement = document.getElementById('totalItems');
    const itemsToBuyElement = document.getElementById('itemsToBuy');
    
    // App State
    let recipes = [];
    let mealPlan = {};
    let shoppingListData = {};
    let currentWeekStart = getCurrentWeekStart();
    let pantryMode = false;
    let confirmAction = null;
    let confirmData = null;
    
    // Ingredient categories for grouping in shopping list
    const ingredientCategories = {
        'Produce': ['onion', 'garlic', 'tomato', 'potato', 'carrot', 'lettuce', 'spinach', 'broccoli', 'apple', 'banana', 'orange', 'lemon', 'lime', 'herb', 'pepper', 'cucumber', 'celery', 'mushroom', 'avocado'],
        'Dairy & Eggs': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'egg', 'parmesan', 'cheddar', 'mozzarella', 'sour cream'],
        'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'bacon', 'sausage', 'ground beef', 'steak'],
        'Pantry Staples': ['flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'rice', 'pasta', 'noodle', 'bean', 'lentil', 'canned tomato', 'broth', 'stock', 'soy sauce', 'honey', 'spice', 'herb', 'baking powder', 'baking soda'],
        'Bakery': ['bread', 'tortilla', 'wrap', 'bagel', 'croissant', 'roll', 'bun'],
        'Frozen': ['frozen vegetable', 'frozen fruit', 'ice cream', 'frozen meal'],
        'Beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'wine', 'beer']
    };
    
    // Initialize the app
    function init() {
        loadDataFromStorage();
        renderRecipeBank();
        renderWeekCalendar();
        updateShoppingList();
        
        setupEventListeners();
        setupDragAndDrop();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Recipe modal
        addRecipeBtn.addEventListener('click', () => showModal(recipeModal));
        
        // Close modals
        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === recipeModal) recipeModal.style.display = 'none';
            if (e.target === recipeDetailModal) recipeDetailModal.style.display = 'none';
            if (e.target === confirmModal) confirmModal.style.display = 'none';
        });
        
        // Recipe form submission
        recipeForm.addEventListener('submit', handleRecipeSubmit);
        
        // Recipe search
        recipeSearch.addEventListener('input', filterRecipes);
        
        // Add ingredient row
        addIngredientBtn.addEventListener('click', addIngredientRow);
        
        // Week navigation
        prevWeekBtn.addEventListener('click', () => navigateWeek(-1));
        nextWeekBtn.addEventListener('click', () => navigateWeek(1));
        
        // Clear week
        clearWeekBtn.addEventListener('click', clearWeek);
        
        // Pantry mode
        pantryToggle.addEventListener('change', togglePantryMode);
        togglePantryModeBtn.addEventListener('click', () => {
            pantryToggle.checked = !pantryToggle.checked;
            togglePantryMode();
        });
        
        // Shopping list buttons
        printListBtn.addEventListener('click', printShoppingList);
        copyListBtn.addEventListener('click', copyShoppingList);
        clearListBtn.addEventListener('click', clearShoppingList);
        
        // Confirmation modal
        confirmCancel.addEventListener('click', () => confirmModal.style.display = 'none');
        confirmOk.addEventListener('click', handleConfirmAction);
    }
    
    // Data storage functions
    function saveDataToStorage() {
        localStorage.setItem('kitchenPlanner_recipes', JSON.stringify(recipes));
        localStorage.setItem('kitchenPlanner_mealPlan', JSON.stringify(mealPlan));
        localStorage.setItem('kitchenPlanner_shoppingList', JSON.stringify(shoppingListData));
        localStorage.setItem('kitchenPlanner_currentWeek', JSON.stringify(currentWeekStart));
    }
    
    function loadDataFromStorage() {
        const savedRecipes = localStorage.getItem('kitchenPlanner_recipes');
        const savedMealPlan = localStorage.getItem('kitchenPlanner_mealPlan');
        const savedShoppingList = localStorage.getItem('kitchenPlanner_shoppingList');
        const savedWeek = localStorage.getItem('kitchenPlanner_currentWeek');
        
        if (savedRecipes) {
            recipes = JSON.parse(savedRecipes);
        } else {
            // Load sample recipes if no data exists
            loadSampleRecipes();
        }
        
        if (savedMealPlan) {
            mealPlan = JSON.parse(savedMealPlan);
        } else {
            initializeMealPlan();
        }
        
        if (savedShoppingList) {
            shoppingListData = JSON.parse(savedShoppingList);
        }
        
        if (savedWeek) {
            currentWeekStart = new Date(JSON.parse(savedWeek));
        }
    }
    
    // Sample recipes for first-time users
    function loadSampleRecipes() {
        recipes = [
            {
                id: '1',
                name: 'Vegetable Stir Fry',
                category: 'Dinner',
                servings: 4,
                prepTime: 25,
                ingredients: [
                    { quantity: '2', unit: 'tbsp', name: 'vegetable oil' },
                    { quantity: '1', unit: '', name: 'onion, sliced' },
                    { quantity: '2', unit: 'clove', name: 'garlic, minced' },
                    { quantity: '1', unit: 'inch', name: 'ginger, grated' },
                    { quantity: '2', unit: 'cup', name: 'broccoli florets' },
                    { quantity: '1', unit: '', name: 'bell pepper, sliced' },
                    { quantity: '1', unit: 'cup', name: 'carrot, sliced' },
                    { quantity: '2', unit: 'tbsp', name: 'soy sauce' },
                    { quantity: '1', unit: 'tbsp', name: 'honey' },
                    { quantity: '1', unit: 'tsp', name: 'sesame oil' }
                ],
                instructions: '1. Heat oil in a large pan or wok.\n2. Add onion, garlic, and ginger. Stir-fry for 2 minutes.\n3. Add broccoli, bell pepper, and carrot. Cook for 5-7 minutes.\n4. Mix soy sauce, honey, and sesame oil. Pour over vegetables.\n5. Stir-fry for another 2 minutes until vegetables are tender-crisp.\n6. Serve over rice or noodles.'
            },
            {
                id: '2',
                name: 'Scrambled Eggs with Toast',
                category: 'Breakfast',
                servings: 2,
                prepTime: 10,
                ingredients: [
                    { quantity: '4', unit: '', name: 'eggs' },
                    { quantity: '2', unit: 'tbsp', name: 'milk' },
                    { quantity: '1', unit: 'tbsp', name: 'butter' },
                    { quantity: '2', unit: 'slice', name: 'bread' },
                    { quantity: '1', unit: 'pinch', name: 'salt' },
                    { quantity: '1', unit: 'pinch', name: 'black pepper' }
                ],
                instructions: '1. Whisk eggs with milk, salt, and pepper.\n2. Melt butter in a non-stick pan over medium heat.\n3. Pour egg mixture into pan. Let sit for a few seconds, then gently stir.\n4. Continue cooking and stirring until eggs are softly set.\n5. Toast bread while eggs cook.\n6. Serve eggs with toast.'
            },
            {
                id: '3',
                name: 'Greek Salad',
                category: 'Lunch',
                servings: 2,
                prepTime: 15,
                ingredients: [
                    { quantity: '1', unit: '', name: 'cucumber, diced' },
                    { quantity: '2', unit: '', name: 'tomatoes, diced' },
                    { quantity: '1/2', unit: '', name: 'red onion, thinly sliced' },
                    { quantity: '1', unit: 'cup', name: 'kalamata olives' },
                    { quantity: '4', unit: 'oz', name: 'feta cheese, cubed' },
                    { quantity: '2', unit: 'tbsp', name: 'olive oil' },
                    { quantity: '1', unit: 'tbsp', name: 'red wine vinegar' },
                    { quantity: '1', unit: 'tsp', name: 'dried oregano' }
                ],
                instructions: '1. Combine cucumber, tomatoes, red onion, olives, and feta in a bowl.\n2. Whisk together olive oil, red wine vinegar, and oregano.\n3. Pour dressing over salad and toss gently.\n4. Let sit for 10 minutes before serving to allow flavors to meld.'
            },
            {
                id: '4',
                name: 'Spaghetti Bolognese',
                category: 'Dinner',
                servings: 6,
                prepTime: 45,
                ingredients: [
                    { quantity: '1', unit: 'lb', name: 'ground beef' },
                    { quantity: '1', unit: '', name: 'onion, diced' },
                    { quantity: '2', unit: 'clove', name: 'garlic, minced' },
                    { quantity: '1', unit: 'can', name: 'crushed tomatoes (28 oz)' },
                    { quantity: '2', unit: 'tbsp', name: 'tomato paste' },
                    { quantity: '1', unit: 'tsp', name: 'dried oregano' },
                    { quantity: '1', unit: 'tsp', name: 'dried basil' },
                    { quantity: '1', unit: 'lb', name: 'spaghetti' },
                    { quantity: '1/4', unit: 'cup', name: 'parmesan cheese, grated' }
                ],
                instructions: '1. Brown ground beef in a large pot over medium heat. Drain excess fat.\n2. Add onion and garlic, cook until softened.\n3. Stir in crushed tomatoes, tomato paste, oregano, and basil.\n4. Simmer for 30 minutes, stirring occasionally.\n5. Cook spaghetti according to package directions.\n6. Serve sauce over spaghetti, topped with parmesan cheese.'
            }
        ];
        
        saveDataToStorage();
    }
    
    // Initialize empty meal plan
    function initializeMealPlan() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const meals = ['Breakfast', 'Lunch', 'Dinner'];
        
        mealPlan = {};
        
        // Get dates for the current week
        const weekDates = getWeekDates(currentWeekStart);
        
        days.forEach((day, index) => {
            const dateStr = weekDates[index].toDateString();
            mealPlan[dateStr] = {};
            
            meals.forEach(meal => {
                mealPlan[dateStr][meal] = [];
            });
        });
    }
    
    // Get current week's Monday
    function getCurrentWeekStart() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to get Monday
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
    }
    
    // Get array of dates for the week starting from Monday
    function getWeekDates(startDate) {
        const dates = [];
        const current = new Date(startDate);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(current);
            dates.push(date);
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    }
    
    // Format date for display
    function formatDate(date) {
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Format week display
    function formatWeekDisplay(startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        return `Week of ${startStr} - ${endStr}`;
    }
    
    // Navigate between weeks
    function navigateWeek(direction) {
        currentWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
        renderWeekCalendar();
        saveDataToStorage();
    }
    
    // Render recipe bank
    function renderRecipeBank() {
        recipeBank.innerHTML = '';
        
        if (recipes.length === 0) {
            recipeBank.innerHTML = `
                <div class="empty-list">
                    <i class="fas fa-book-open"></i>
                    <p>No recipes yet</p>
                    <p>Click "Add Recipe" to get started</p>
                </div>
            `;
            return;
        }
        
        recipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            recipeBank.appendChild(recipeCard);
        });
    }
    
    // Create recipe card element
    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.draggable = true;
        card.dataset.recipeId = recipe.id;
        
        // Create ingredients preview
        const ingredientsPreview = recipe.ingredients
            .slice(0, 3)
            .map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`)
            .join(', ');
        
        card.innerHTML = `
            <div class="recipe-card-header">
                <div>
                    <h3>${recipe.name}</h3>
                    <span class="recipe-category ${recipe.category.toLowerCase()}">${recipe.category}</span>
                </div>
                <button class="btn-icon view-recipe-btn" data-recipe-id="${recipe.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
            <div class="recipe-info">
                <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                <span><i class="fas fa-clock"></i> ${recipe.prepTime} min</span>
            </div>
            <div class="recipe-ingredients-preview">
                ${ingredientsPreview}${recipe.ingredients.length > 3 ? '...' : ''}
            </div>
            <div class="recipe-actions">
                <button class="btn-icon edit-recipe-btn" data-recipe-id="${recipe.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-recipe-btn" data-recipe-id="${recipe.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const viewBtn = card.querySelector('.view-recipe-btn');
        const editBtn = card.querySelector('.edit-recipe-btn');
        const deleteBtn = card.querySelector('.delete-recipe-btn');
        
        viewBtn.addEventListener('click', () => showRecipeDetail(recipe.id));
        editBtn.addEventListener('click', () => editRecipe(recipe.id));
        deleteBtn.addEventListener('click', () => confirmDeleteRecipe(recipe.id));
        
        // Setup drag start
        card.addEventListener('dragstart', handleDragStart);
        
        return card;
    }
    
    // Filter recipes based on search input
    function filterRecipes() {
        const searchTerm = recipeSearch.value.toLowerCase();
        const recipeCards = document.querySelectorAll('.recipe-card');
        
        recipeCards.forEach(card => {
            const recipeName = card.querySelector('h3').textContent.toLowerCase();
            const recipeCategory = card.querySelector('.recipe-category').textContent.toLowerCase();
            const recipeIngredients = card.querySelector('.recipe-ingredients-preview').textContent.toLowerCase();
            
            const matches = recipeName.includes(searchTerm) || 
                           recipeCategory.includes(searchTerm) || 
                           recipeIngredients.includes(searchTerm);
            
            card.style.display = matches ? 'block' : 'none';
        });
    }
    
    // Render week calendar
    function renderWeekCalendar() {
        weekCalendar.innerHTML = '';
        
        // Update week display
        currentWeekElement.textContent = formatWeekDisplay(currentWeekStart);
        
        // Get dates for the week
        const weekDates = getWeekDates(currentWeekStart);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const meals = ['Breakfast', 'Lunch', 'Dinner'];
        
        days.forEach((day, index) => {
            const date = weekDates[index];
            const dateStr = date.toDateString();
            
            // Initialize meal plan for this date if not exists
            if (!mealPlan[dateStr]) {
                mealPlan[dateStr] = {
                    'Breakfast': [],
                    'Lunch': [],
                    'Dinner': []
                };
            }
            
            // Create day row
            const dayRow = document.createElement('div');
            dayRow.className = 'day-row';
            dayRow.dataset.date = dateStr;
            
            // Day header
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `
                <div class="day-name">${day}</div>
                <div class="day-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            `;
            
            // Meals container
            const dayMeals = document.createElement('div');
            dayMeals.className = 'day-meals';
            
            // Create meal slots
            meals.forEach(meal => {
                const mealSlot = document.createElement('div');
                mealSlot.className = `meal-slot ${meal.toLowerCase()}`;
                mealSlot.dataset.meal = meal;
                mealSlot.dataset.date = dateStr;
                
                // Add drop event listeners
                mealSlot.addEventListener('dragover', handleDragOver);
                mealSlot.addEventListener('drop', handleDrop);
                
                // Meal label
                const mealLabel = document.createElement('div');
                mealLabel.className = 'meal-label';
                
                let mealTime = '';
                switch(meal) {
                    case 'Breakfast': mealTime = '7-9 AM'; break;
                    case 'Lunch': mealTime = '12-1 PM'; break;
                    case 'Dinner': mealTime = '6-8 PM'; break;
                }
                
                mealLabel.innerHTML = `
                    <span>${meal}</span>
                    <span class="meal-time">${mealTime}</span>
                `;
                
                mealSlot.appendChild(mealLabel);
                
                // Recipes scheduled for this meal
                const scheduledRecipes = mealPlan[dateStr] && mealPlan[dateStr][meal] ? mealPlan[dateStr][meal] : [];
                
                if (scheduledRecipes.length > 0) {
                    scheduledRecipes.forEach(recipeId => {
                        const recipe = recipes.find(r => r.id === recipeId);
                        if (recipe) {
                            const scheduledRecipe = createScheduledRecipeElement(recipe, dateStr, meal);
                            mealSlot.appendChild(scheduledRecipe);
                        }
                    });
                } else {
                    // Empty slot
                    mealSlot.classList.add('empty');
                    mealSlot.innerHTML = `
                        <div class="meal-label">
                            <span>${meal}</span>
                            <span class="meal-time">${mealTime}</span>
                        </div>
                        <i class="fas fa-plus-circle"></i>
                        <p>Drop recipe here</p>
                    `;
                }
                
                dayMeals.appendChild(mealSlot);
            });
            
            dayRow.appendChild(dayHeader);
            dayRow.appendChild(dayMeals);
            weekCalendar.appendChild(dayRow);
        });
    }
    
    // Create scheduled recipe element
    function createScheduledRecipeElement(recipe, dateStr, meal) {
        const element = document.createElement('div');
        element.className = 'scheduled-recipe';
        element.dataset.recipeId = recipe.id;
        
        element.innerHTML = `
            <h4>${recipe.name}</h4>
            <div class="scheduled-recipe-info">
                <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                <span><i class="fas fa-clock"></i> ${recipe.prepTime} min</span>
            </div>
            <button class="remove-recipe" data-date="${dateStr}" data-meal="${meal}" data-recipe-id="${recipe.id}">
                <i class="fas fa-times"></i> Remove
            </button>
        `;
        
        // Add event listener to remove button
        const removeBtn = element.querySelector('.remove-recipe');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeRecipeFromMeal(dateStr, meal, recipe.id);
        });
        
        // Add click to view recipe details
        element.addEventListener('click', () => {
            showRecipeDetail(recipe.id);
        });
        
        return element;
    }
    
    // Setup drag and drop functionality
    function setupDragAndDrop() {
        // Add dragover and drop event listeners to meal slots
        const mealSlots = document.querySelectorAll('.meal-slot');
        
        mealSlots.forEach(slot => {
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('drop', handleDrop);
        });
    }
    
    // Drag and drop event handlers
    function handleDragStart(e) {
        const recipeId = e.target.closest('.recipe-card').dataset.recipeId;
        e.dataTransfer.setData('text/plain', recipeId);
        e.target.classList.add('dragging');
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Add visual feedback
        if (e.target.classList.contains('meal-slot')) {
            e.target.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            e.target.style.border = '2px dashed #4CAF50';
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        
        // Remove visual feedback
        if (e.target.classList.contains('meal-slot')) {
            e.target.style.backgroundColor = '';
            e.target.style.border = '';
        }
        
        const recipeId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.querySelector('.recipe-card.dragging');
        
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
        }
        
        // Find the meal slot (could be the slot itself or a child element)
        let mealSlot = e.target;
        while (mealSlot && !mealSlot.classList.contains('meal-slot')) {
            mealSlot = mealSlot.parentElement;
        }
        
        if (!mealSlot) return;
        
        const dateStr = mealSlot.dataset.date;
        const meal = mealSlot.dataset.meal;
        
        // Add recipe to meal plan
        addRecipeToMeal(dateStr, meal, recipeId);
    }
    
    // Add recipe to meal plan
    function addRecipeToMeal(dateStr, meal, recipeId) {
        // Initialize date if not exists
        if (!mealPlan[dateStr]) {
            mealPlan[dateStr] = {
                'Breakfast': [],
                'Lunch': [],
                'Dinner': []
            };
        }
        
        // Initialize meal if not exists
        if (!mealPlan[dateStr][meal]) {
            mealPlan[dateStr][meal] = [];
        }
        
        // Add recipe if not already present
        if (!mealPlan[dateStr][meal].includes(recipeId)) {
            mealPlan[dateStr][meal].push(recipeId);
            
            // Update UI and shopping list
            renderWeekCalendar();
            updateShoppingList();
            saveDataToStorage();
        }
    }
    
    // Remove recipe from meal plan
    function removeRecipeFromMeal(dateStr, meal, recipeId) {
        if (mealPlan[dateStr] && mealPlan[dateStr][meal]) {
            const index = mealPlan[dateStr][meal].indexOf(recipeId);
            if (index !== -1) {
                mealPlan[dateStr][meal].splice(index, 1);
                
                // Update UI and shopping list
                renderWeekCalendar();
                updateShoppingList();
                saveDataToStorage();
            }
        }
    }
    
    // Clear entire week
    function clearWeek() {
        showConfirmModal(
            'Are you sure you want to clear the entire week? This will remove all scheduled recipes.',
            () => {
                initializeMealPlan();
                renderWeekCalendar();
                updateShoppingList();
                saveDataToStorage();
            }
        );
    }
    
    // Update shopping list based on meal plan
    function updateShoppingList() {
        // Reset shopping list data
        shoppingListData = {};
        
        // Aggregate ingredients from all scheduled recipes
        Object.keys(mealPlan).forEach(dateStr => {
            const meals = mealPlan[dateStr];
            
            Object.keys(meals).forEach(meal => {
                const recipeIds = meals[meal];
                
                recipeIds.forEach(recipeId => {
                    const recipe = recipes.find(r => r.id === recipeId);
                    if (recipe) {
                        addRecipeIngredientsToShoppingList(recipe);
                    }
                });
            });
        });
        
        renderShoppingList();
    }
    
    // Add recipe ingredients to shopping list with aggregation
    function addRecipeIngredientsToShoppingList(recipe) {
        recipe.ingredients.forEach(ingredient => {
            const key = `${ingredient.name.toLowerCase()}_${ingredient.unit}`;
            
            if (!shoppingListData[key]) {
                shoppingListData[key] = {
                    quantity: 0,
                    unit: ingredient.unit,
                    name: ingredient.name,
                    recipes: [],
                    checked: false
                };
            }
            
            // Parse quantity (could be fraction like "1/2")
            let qty = parseQuantity(ingredient.quantity);
            
            // Add to existing quantity
            shoppingListData[key].quantity += qty;
            
            // Add recipe to list if not already there
            if (!shoppingListData[key].recipes.includes(recipe.name)) {
                shoppingListData[key].recipes.push(recipe.name);
            }
        });
    }
    
    // Parse quantity string (handles fractions and whole numbers)
    function parseQuantity(qtyStr) {
        if (qtyStr.includes('/')) {
            const parts = qtyStr.split('/');
            return parseInt(parts[0]) / parseInt(parts[1]);
        }
        
        return parseFloat(qtyStr) || 0;
    }
    
    // Format quantity for display
    function formatQuantity(qty) {
        // If it's a whole number, display without decimal
        if (qty % 1 === 0) {
            return qty.toString();
        }
        
        // Try to convert to fraction
        const tolerance = 0.01;
        const fractions = [
            { decimal: 0.125, fraction: '⅛' },
            { decimal: 0.25, fraction: '¼' },
            { decimal: 0.333, fraction: '⅓' },
            { decimal: 0.5, fraction: '½' },
            { decimal: 0.666, fraction: '⅔' },
            { decimal: 0.75, fraction: '¾' }
        ];
        
        for (const frac of fractions) {
            if (Math.abs(qty - frac.decimal) < tolerance) {
                return frac.fraction;
            }
        }
        
        // Otherwise display with 1 decimal place
        return qty.toFixed(1).replace(/\.0$/, '');
    }
    
    // Render shopping list
    function renderShoppingList() {
        shoppingList.innerHTML = '';
        
        if (Object.keys(shoppingListData).length === 0) {
            shoppingList.innerHTML = `
                <div class="empty-list">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your shopping list will appear here</p>
                    <p>Drag recipes onto the calendar to get started</p>
                </div>
            `;
            
            totalItemsElement.textContent = '0';
            itemsToBuyElement.textContent = '0';
            return;
        }
        
        // Group items by category
        const categorizedItems = {};
        
        Object.keys(shoppingListData).forEach(key => {
            const item = shoppingListData[key];
            const category = categorizeIngredient(item.name);
            
            if (!categorizedItems[category]) {
                categorizedItems[category] = [];
            }
            
            categorizedItems[category].push(item);
        });
        
        // Sort categories
        const categoryOrder = ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry Staples', 'Bakery', 'Frozen', 'Beverages'];
        
        // Render each category
        categoryOrder.forEach(category => {
            if (categorizedItems[category]) {
                const aisleSection = document.createElement('div');
                aisleSection.className = 'aisle-section';
                
                const aisleHeader = document.createElement('div');
                aisleHeader.className = 'aisle-header';
                
                let icon = 'fas fa-leaf';
                switch(category) {
                    case 'Dairy & Eggs': icon = 'fas fa-egg'; break;
                    case 'Meat & Seafood': icon = 'fas fa-drumstick-bite'; break;
                    case 'Pantry Staples': icon = 'fas fa-box'; break;
                    case 'Bakery': icon = 'fas fa-bread-slice'; break;
                    case 'Frozen': icon = 'fas fa-snowflake'; break;
                    case 'Beverages': icon = 'fas fa-wine-bottle'; break;
                }
                
                aisleHeader.innerHTML = `
                    <i class="${icon}"></i>
                    <span>${category}</span>
                `;
                
                aisleSection.appendChild(aisleHeader);
                
                // Sort items alphabetically
                categorizedItems[category].sort((a, b) => a.name.localeCompare(b.name));
                
                // Create shopping items
                categorizedItems[category].forEach(item => {
                    const shoppingItem = createShoppingItemElement(item, key);
                    aisleSection.appendChild(shoppingItem);
                });
                
                shoppingList.appendChild(aisleSection);
            }
        });
        
        // Update stats
        updateShoppingStats();
    }
    
    // Categorize ingredient based on name
    function categorizeIngredient(ingredientName) {
        const name = ingredientName.toLowerCase();
        
        for (const [category, keywords] of Object.entries(ingredientCategories)) {
            for (const keyword of keywords) {
                if (name.includes(keyword)) {
                    return category;
                }
            }
        }
        
        return 'Other';
    }
    
    // Create shopping list item element
    function createShoppingItemElement(item, key) {
        const div = document.createElement('div');
        div.className = `shopping-item ${item.checked ? 'checked' : ''}`;
        div.dataset.key = key;
        
        // Format quantity
        const formattedQty = formatQuantity(item.quantity);
        
        // Create recipes string
        const recipesStr = item.recipes.length <= 2 
            ? item.recipes.join(', ') 
            : `${item.recipes.length} recipes`;
        
        div.innerHTML = `
            <input type="checkbox" class="item-checkbox" ${item.checked ? 'checked' : ''}>
            <div class="item-details">
                <div>
                    <span class="item-quantity">${formattedQty}</span>
                    <span class="item-unit">${item.unit}</span>
                    <span class="item-name">${item.name}</span>
                </div>
                <div class="item-recipes">${recipesStr}</div>
            </div>
        `;
        
        // Add event listener to checkbox
        const checkbox = div.querySelector('.item-checkbox');
        checkbox.addEventListener('change', (e) => {
            item.checked = e.target.checked;
            div.classList.toggle('checked', e.target.checked);
            updateShoppingStats();
            saveDataToStorage();
        });
        
        return div;
    }
    
    // Update shopping list statistics
    function updateShoppingStats() {
        const items = Object.values(shoppingListData);
        const total = items.length;
        const toBuy = items.filter(item => !item.checked).length;
        
        totalItemsElement.textContent = total;
        itemsToBuyElement.textContent = toBuy;
    }
    
    // Toggle pantry mode
    function togglePantryMode() {
        pantryMode = pantryToggle.checked;
        
        // Update button text
        if (pantryMode) {
            togglePantryModeBtn.innerHTML = '<i class="fas fa-clipboard-check"></i> Pantry Mode ON';
            togglePantryModeBtn.classList.add('btn-success');
        } else {
            togglePantryModeBtn.innerHTML = '<i class="fas fa-clipboard-check"></i> Pantry Check Mode';
            togglePantryModeBtn.classList.remove('btn-success');
        }
        
        // Update UI to reflect pantry mode
        const shoppingItems = document.querySelectorAll('.shopping-item');
        shoppingItems.forEach(item => {
            if (pantryMode) {
                item.style.opacity = '1';
            }
        });
    }
    
    // Print shopping list
    function printShoppingList() {
        if (Object.keys(shoppingListData).length === 0) {
            alert('Your shopping list is empty. Add some recipes to the calendar first.');
            return;
        }
        
        // Create a printable version
        const printWindow = window.open('', '_blank');
        const items = Object.values(shoppingListData);
        
        let printContent = `
            <html>
                <head>
                    <title>Kitchen Planner Shopping List</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #4CAF50; }
                        .category { margin-top: 20px; font-weight: bold; font-size: 1.2em; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; }
                        .item { margin: 5px 0; }
                        .checked { text-decoration: line-through; color: #888; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Kitchen Planner Shopping List</h1>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                    
                    <div class="stats">
                        <p><strong>Total Items:</strong> ${items.length}</p>
                        <p><strong>Items to Buy:</strong> ${items.filter(item => !item.checked).length}</p>
                    </div>
                    
                    <div class="no-print">
                        <button onclick="window.print()">Print List</button>
                        <button onclick="window.close()">Close</button>
                    </div>
        `;
        
        // Group items by category
        const categorizedItems = {};
        
        items.forEach(item => {
            const category = categorizeIngredient(item.name);
            if (!categorizedItems[category]) {
                categorizedItems[category] = [];
            }
            categorizedItems[category].push(item);
        });
        
        // Add items by category
        const categoryOrder = ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry Staples', 'Bakery', 'Frozen', 'Beverages', 'Other'];
        
        categoryOrder.forEach(category => {
            if (categorizedItems[category] && categorizedItems[category].length > 0) {
                printContent += `<div class="category">${category}</div>`;
                
                categorizedItems[category].forEach(item => {
                    const formattedQty = formatQuantity(item.quantity);
                    const checkedClass = item.checked ? 'checked' : '';
                    printContent += `
                        <div class="item ${checkedClass}">
                            <input type="checkbox" ${item.checked ? 'checked' : ''} disabled>
                            ${formattedQty} ${item.unit} ${item.name}
                            ${item.recipes.length > 0 ? ` (${item.recipes.join(', ')})` : ''}
                        </div>
                    `;
                });
            }
        });
        
        printContent += `
                </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    }
    
    // Copy shopping list to clipboard
    async function copyShoppingList() {
        if (Object.keys(shoppingListData).length === 0) {
            alert('Your shopping list is empty. Add some recipes to the calendar first.');
            return;
        }
        
        const items = Object.values(shoppingListData);
        let text = `Kitchen Planner Shopping List\n`;
        text += `Generated on ${new Date().toLocaleDateString()}\n\n`;
        
        // Group items by category
        const categorizedItems = {};
        
        items.forEach(item => {
            const category = categorizeIngredient(item.name);
            if (!categorizedItems[category]) {
                categorizedItems[category] = [];
            }
            categorizedItems[category].push(item);
        });
        
        // Add items by category
        const categoryOrder = ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry Staples', 'Bakery', 'Frozen', 'Beverages', 'Other'];
        
        categoryOrder.forEach(category => {
            if (categorizedItems[category] && categorizedItems[category].length > 0) {
                text += `${category.toUpperCase()}:\n`;
                
                categorizedItems[category].forEach(item => {
                    if (!item.checked || !pantryMode) {
                        const formattedQty = formatQuantity(item.quantity);
                        const checkmark = item.checked ? '[✓] ' : '[ ] ';
                        text += `  ${checkmark}${formattedQty} ${item.unit} ${item.name}\n`;
                    }
                });
                
                text += '\n';
            }
        });
        
        try {
            await navigator.clipboard.writeText(text);
            alert('Shopping list copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy shopping list: ', err);
            alert('Failed to copy shopping list to clipboard.');
        }
    }
    
    // Clear shopping list (uncheck all items)
    function clearShoppingList() {
        showConfirmModal(
            'Are you sure you want to clear all checkmarks from your shopping list?',
            () => {
                Object.keys(shoppingListData).forEach(key => {
                    shoppingListData[key].checked = false;
                });
                
                renderShoppingList();
                saveDataToStorage();
            }
        );
    }
    
    // Recipe form handling
    function addIngredientRow() {
        const ingredientRow = document.createElement('div');
        ingredientRow.className = 'ingredient-row';
        
        ingredientRow.innerHTML = `
            <input type="text" class="ingredient-qty" placeholder="2">
            <select class="ingredient-unit">
                <option value="">unit</option>
                <option value="tsp">tsp</option>
                <option value="tbsp">tbsp</option>
                <option value="cup">cup</option>
                <option value="oz">oz</option>
                <option value="lb">lb</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="piece">piece</option>
                <option value="clove">clove</option>
                <option value="slice">slice</option>
                <option value="can">can</option>
            </select>
            <input type="text" class="ingredient-name" placeholder="Ingredient name">
            <button type="button" class="btn-icon remove-ingredient"><i class="fas fa-times"></i></button>
        `;
        
        ingredientsContainer.appendChild(ingredientRow);
        
        // Add event listener to remove button
        const removeBtn = ingredientRow.querySelector('.remove-ingredient');
        removeBtn.addEventListener('click', () => {
            ingredientRow.remove();
        });
    }
    
    // Handle recipe form submission
    function handleRecipeSubmit(e) {
        e.preventDefault();
        
        // Get form values
        const recipeName = document.getElementById('recipeName').value;
        const recipeCategory = document.getElementById('recipeCategory').value;
        const recipeServings = parseInt(document.getElementById('recipeServings').value) || 4;
        const recipePrepTime = parseInt(document.getElementById('recipePrepTime').value) || 20;
        const recipeInstructions = document.getElementById('recipeInstructions').value;
        
        // Get ingredients
        const ingredientRows = ingredientsContainer.querySelectorAll('.ingredient-row');
        const ingredients = [];
        
        ingredientRows.forEach(row => {
            const qty = row.querySelector('.ingredient-qty').value;
            const unit = row.querySelector('.ingredient-unit').value;
            const name = row.querySelector('.ingredient-name').value;
            
            if (name.trim()) {
                ingredients.push({
                    quantity: qty || '1',
                    unit: unit,
                    name: name
                });
            }
        });
        
        // Validate
        if (!recipeName.trim()) {
            alert('Please enter a recipe name');
            return;
        }
        
        if (ingredients.length === 0) {
            alert('Please add at least one ingredient');
            return;
        }
        
        // Check if we're editing an existing recipe
        const isEditing = recipeForm.dataset.editingId;
        
        if (isEditing) {
            // Update existing recipe
            const recipeIndex = recipes.findIndex(r => r.id === isEditing);
            if (recipeIndex !== -1) {
                recipes[recipeIndex] = {
                    ...recipes[recipeIndex],
                    name: recipeName,
                    category: recipeCategory,
                    servings: recipeServings,
                    prepTime: recipePrepTime,
                    ingredients: ingredients,
                    instructions: recipeInstructions
                };
            }
            
            delete recipeForm.dataset.editingId;
        } else {
            // Create new recipe
            const newRecipe = {
                id: generateId(),
                name: recipeName,
                category: recipeCategory,
                servings: recipeServings,
                prepTime: recipePrepTime,
                ingredients: ingredients,
                instructions: recipeInstructions
            };
            
            recipes.push(newRecipe);
        }
        
        // Reset form
        recipeForm.reset();
        ingredientsContainer.innerHTML = `
            <div class="ingredient-row">
                <input type="text" class="ingredient-qty" placeholder="2">
                <select class="ingredient-unit">
                    <option value="">unit</option>
                    <option value="tsp">tsp</option>
                    <option value="tbsp">tbsp</option>
                    <option value="cup">cup</option>
                    <option value="oz">oz</option>
                    <option value="lb">lb</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="piece">piece</option>
                    <option value="clove">clove</option>
                    <option value="slice">slice</option>
                    <option value="can">can</option>
                </select>
                <input type="text" class="ingredient-name" placeholder="Ingredient name">
                <button type="button" class="btn-icon remove-ingredient"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Add event listener to the new remove button
        const newRemoveBtn = ingredientsContainer.querySelector('.remove-ingredient');
        newRemoveBtn.addEventListener('click', function() {
            this.closest('.ingredient-row').remove();
        });
        
        // Close modal and update UI
        closeAllModals();
        renderRecipeBank();
        updateShoppingList();
        saveDataToStorage();
        
        // Show success message
        alert(`Recipe "${recipeName}" has been ${isEditing ? 'updated' : 'saved'}!`);
    }
    
    // Show recipe detail modal
    function showRecipeDetail(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        // Populate modal with recipe data
        document.getElementById('detailRecipeName').textContent = recipe.name;
        document.getElementById('detailRecipeCategory').textContent = recipe.category;
        document.getElementById('detailRecipeServings').textContent = recipe.servings;
        document.getElementById('detailRecipePrepTime').textContent = recipe.prepTime;
        
        // Populate ingredients
        const ingredientsList = document.getElementById('detailRecipeIngredients');
        ingredientsList.innerHTML = '';
        
        recipe.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-circle"></i> ${ing.quantity} ${ing.unit} ${ing.name}`;
            ingredientsList.appendChild(li);
        });
        
        // Populate instructions
        const instructionsDiv = document.getElementById('detailRecipeInstructions');
        if (recipe.instructions && recipe.instructions.trim()) {
            instructionsDiv.textContent = recipe.instructions;
            document.getElementById('instructionsSection').style.display = 'block';
        } else {
            document.getElementById('instructionsSection').style.display = 'none';
        }
        
        // Set up action buttons
        const editBtn = document.getElementById('editRecipeBtn');
        const deleteBtn = document.getElementById('deleteRecipeBtn');
        
        editBtn.onclick = () => {
            recipeDetailModal.style.display = 'none';
            editRecipe(recipeId);
        };
        
        deleteBtn.onclick = () => {
            recipeDetailModal.style.display = 'none';
            confirmDeleteRecipe(recipeId);
        };
        
        // Show modal
        recipeDetailModal.style.display = 'flex';
    }
    
    // Edit recipe
    function editRecipe(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        // Populate form with recipe data
        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('recipeCategory').value = recipe.category;
        document.getElementById('recipeServings').value = recipe.servings;
        document.getElementById('recipePrepTime').value = recipe.prepTime;
        document.getElementById('recipeInstructions').value = recipe.instructions || '';
        
        // Populate ingredients
        ingredientsContainer.innerHTML = '';
        
        recipe.ingredients.forEach(ing => {
            const ingredientRow = document.createElement('div');
            ingredientRow.className = 'ingredient-row';
            
            ingredientRow.innerHTML = `
                <input type="text" class="ingredient-qty" value="${ing.quantity}">
                <select class="ingredient-unit">
                    <option value="">unit</option>
                    <option value="tsp" ${ing.unit === 'tsp' ? 'selected' : ''}>tsp</option>
                    <option value="tbsp" ${ing.unit === 'tbsp' ? 'selected' : ''}>tbsp</option>
                    <option value="cup" ${ing.unit === 'cup' ? 'selected' : ''}>cup</option>
                    <option value="oz" ${ing.unit === 'oz' ? 'selected' : ''}>oz</option>
                    <option value="lb" ${ing.unit === 'lb' ? 'selected' : ''}>lb</option>
                    <option value="g" ${ing.unit === 'g' ? 'selected' : ''}>g</option>
                    <option value="kg" ${ing.unit === 'kg' ? 'selected' : ''}>kg</option>
                    <option value="ml" ${ing.unit === 'ml' ? 'selected' : ''}>ml</option>
                    <option value="l" ${ing.unit === 'l' ? 'selected' : ''}>l</option>
                    <option value="piece" ${ing.unit === 'piece' ? 'selected' : ''}>piece</option>
                    <option value="clove" ${ing.unit === 'clove' ? 'selected' : ''}>clove</option>
                    <option value="slice" ${ing.unit === 'slice' ? 'selected' : ''}>slice</option>
                    <option value="can" ${ing.unit === 'can' ? 'selected' : ''}>can</option>
                </select>
                <input type="text" class="ingredient-name" value="${ing.name}">
                <button type="button" class="btn-icon remove-ingredient"><i class="fas fa-times"></i></button>
            `;
            
            ingredientsContainer.appendChild(ingredientRow);
            
            // Add event listener to remove button
            const removeBtn = ingredientRow.querySelector('.remove-ingredient');
            removeBtn.addEventListener('click', () => {
                ingredientRow.remove();
            });
        });
        
        // Mark form as editing this recipe
        recipeForm.dataset.editingId = recipeId;
        
        // Show modal
        recipeModal.style.display = 'flex';
    }
    
    // Confirm recipe deletion
    function confirmDeleteRecipe(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        showConfirmModal(
            `Are you sure you want to delete "${recipe.name}"? This will also remove it from your meal plan.`,
            () => {
                // Remove from recipes array
                recipes = recipes.filter(r => r.id !== recipeId);
                
                // Remove from meal plan
                Object.keys(mealPlan).forEach(dateStr => {
                    Object.keys(mealPlan[dateStr]).forEach(meal => {
                        const index = mealPlan[dateStr][meal].indexOf(recipeId);
                        if (index !== -1) {
                            mealPlan[dateStr][meal].splice(index, 1);
                        }
                    });
                });
                
                // Update UI
                renderRecipeBank();
                renderWeekCalendar();
                updateShoppingList();
                saveDataToStorage();
                
                // Show confirmation
                alert(`Recipe "${recipe.name}" has been deleted.`);
            }
        );
    }
    
    // Show confirmation modal
    function showConfirmModal(message, callback) {
        confirmMessage.textContent = message;
        confirmAction = callback;
        confirmModal.style.display = 'flex';
    }
    
    // Handle confirmation action
    function handleConfirmAction() {
        if (confirmAction) {
            confirmAction();
        }
        confirmModal.style.display = 'none';
        confirmAction = null;
    }
    
    // Close all modals
    function closeAllModals() {
        recipeModal.style.display = 'none';
        recipeDetailModal.style.display = 'none';
        confirmModal.style.display = 'none';
    }
    
    // Show modal
    function showModal(modal) {
        modal.style.display = 'flex';
    }
    
    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Initialize the app
    init();
});