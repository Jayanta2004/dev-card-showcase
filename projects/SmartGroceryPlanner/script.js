// Smart Grocery Planner & Pantry Manager

class GroceryApp {
    constructor() {
        this.pantryItems = JSON.parse(localStorage.getItem('pantryItems')) || [];
        this.groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
        this.mealPlans = JSON.parse(localStorage.getItem('mealPlans')) || [];
        this.shoppingHistory = JSON.parse(localStorage.getItem('shoppingHistory')) || [];
        this.budget = parseFloat(localStorage.getItem('budget')) || 500;
        this.currentEditingId = null;
        this.currentTab = 'pantry';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderPantry();
        this.renderGroceryList();
        this.renderMealPlans();
        this.renderHistory();
        this.checkExpiry();
        this.updateBudgetDisplay();
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Pantry Modal
        document.getElementById('addPantryBtn').addEventListener('click', () => this.openPantryModal());
        document.getElementById('closePantryModal').addEventListener('click', () => this.closePantryModal());
        document.getElementById('cancelPantryBtn').addEventListener('click', () => this.closePantryModal());
        document.getElementById('pantryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePantryItem();
        });

        // Grocery Modal
        document.getElementById('addGroceryBtn').addEventListener('click', () => this.openGroceryModal());
        document.getElementById('closeGroceryModal').addEventListener('click', () => this.closeGroceryModal());
        document.getElementById('cancelGroceryBtn').addEventListener('click', () => this.closeGroceryModal());
        document.getElementById('groceryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGroceryItem();
        });

        // Meal Modal
        document.getElementById('addMealBtn').addEventListener('click', () => this.openMealModal());
        document.getElementById('closeMealModal').addEventListener('click', () => this.closeMealModal());
        document.getElementById('cancelMealBtn').addEventListener('click', () => this.closeMealModal());
        document.getElementById('mealForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMealPlan();
        });
        document.getElementById('addIngredientBtn').addEventListener('click', () => this.addIngredientRow());

        // Budget Modal
        document.getElementById('setBudgetBtn').addEventListener('click', () => this.openBudgetModal());
        document.getElementById('closeBudgetModal').addEventListener('click', () => this.closeBudgetModal());
        document.getElementById('cancelBudgetBtn').addEventListener('click', () => this.closeBudgetModal());
        document.getElementById('budgetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBudget();
        });

        // Search and Filter
        document.getElementById('pantrySearch').addEventListener('input', (e) => {
            this.searchPantry(e.target.value);
        });
        document.getElementById('pantryFilter').addEventListener('change', (e) => {
            this.filterPantry(e.target.value);
        });

        // Grocery Actions
        document.getElementById('generateListBtn').addEventListener('click', () => this.generateFromMeals());
        document.getElementById('checkoutBtn').addEventListener('click', () => this.checkout());

        // History Actions
        document.getElementById('exportHistoryBtn').addEventListener('click', () => this.exportHistory());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-section`).classList.add('active');
    }

    // Pantry Management
    openPantryModal(itemId = null) {
        const modal = document.getElementById('pantryModal');
        const title = document.getElementById('pantryModalTitle');
        
        if (itemId) {
            const item = this.pantryItems.find(i => i.id === itemId);
            title.textContent = 'Edit Pantry Item';
            document.getElementById('pantryName').value = item.name;
            document.getElementById('pantryCategory').value = item.category;
            document.getElementById('pantryQuantity').value = item.quantity;
            document.getElementById('pantryUnit').value = item.unit;
            document.getElementById('pantryExpiry').value = item.expiryDate || '';
            document.getElementById('pantryCalories').value = item.nutrition?.calories || '';
            document.getElementById('pantryProtein').value = item.nutrition?.protein || '';
            document.getElementById('pantryCarbs').value = item.nutrition?.carbs || '';
            document.getElementById('pantryFats').value = item.nutrition?.fats || '';
            this.currentEditingId = itemId;
        } else {
            title.textContent = 'Add Pantry Item';
            document.getElementById('pantryForm').reset();
            this.currentEditingId = null;
        }
        
        modal.classList.add('active');
    }

    closePantryModal() {
        document.getElementById('pantryModal').classList.remove('active');
        document.getElementById('pantryForm').reset();
        this.currentEditingId = null;
    }

    savePantryItem() {
        const item = {
            id: this.currentEditingId || Date.now(),
            name: document.getElementById('pantryName').value,
            category: document.getElementById('pantryCategory').value,
            quantity: parseFloat(document.getElementById('pantryQuantity').value),
            unit: document.getElementById('pantryUnit').value,
            expiryDate: document.getElementById('pantryExpiry').value || null,
            addedDate: this.currentEditingId ? 
                this.pantryItems.find(i => i.id === this.currentEditingId).addedDate : 
                new Date().toISOString(),
            nutrition: {
                calories: parseInt(document.getElementById('pantryCalories').value) || 0,
                protein: parseFloat(document.getElementById('pantryProtein').value) || 0,
                carbs: parseFloat(document.getElementById('pantryCarbs').value) || 0,
                fats: parseFloat(document.getElementById('pantryFats').value) || 0
            }
        };

        if (this.currentEditingId) {
            const index = this.pantryItems.findIndex(i => i.id === this.currentEditingId);
            this.pantryItems[index] = item;
            this.showToast('Item updated successfully!');
        } else {
            this.pantryItems.push(item);
            this.showToast('Item added to pantry!');
        }

        this.saveData();
        this.renderPantry();
        this.updateDashboard();
        this.closePantryModal();
    }

    deletePantryItem(id) {
        if (confirm('Remove this item from pantry?')) {
            this.pantryItems = this.pantryItems.filter(i => i.id !== id);
            this.saveData();
            this.renderPantry();
            this.updateDashboard();
            this.showToast('Item removed from pantry');
        }
    }

    renderPantry(items = null) {
        const grid = document.getElementById('pantryGrid');
        const itemsToRender = items || this.pantryItems;

        if (itemsToRender.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Pantry is empty</h3>
                    <p>Start adding items to track your inventory</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = itemsToRender.map(item => {
            const expiryStatus = this.getExpiryStatus(item.expiryDate);
            const nutritionTags = this.getNutritionTags(item.nutrition);
            
            return `
                <div class="item-card ${expiryStatus.class}">
                    <div class="item-header">
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <span class="item-category">${this.getCategoryLabel(item.category)}</span>
                        </div>
                        <div class="item-actions">
                            <button class="icon-btn" onclick="groceryApp.openPantryModal(${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="icon-btn" onclick="groceryApp.deletePantryItem(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-details">
                        <div class="detail-row">
                            <span>Quantity:</span>
                            <strong>${item.quantity} ${item.unit}</strong>
                        </div>
                        ${item.expiryDate ? `
                            <div class="detail-row">
                                <span>Expires:</span>
                                <strong>${new Date(item.expiryDate).toLocaleDateString()}</strong>
                            </div>
                        ` : ''}
                        <div class="detail-row">
                            <span>Added:</span>
                            <strong>${new Date(item.addedDate).toLocaleDateString()}</strong>
                        </div>
                    </div>
                    ${expiryStatus.message ? `
                        <div class="expiry-warning ${expiryStatus.class === 'expired' ? 'expiry-danger' : ''}">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>${expiryStatus.message}</span>
                        </div>
                    ` : ''}
                    ${nutritionTags.length > 0 ? `
                        <div class="nutrition-tags">
                            ${nutritionTags.map(tag => `<span class="nutrition-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    searchPantry(query) {
        const filtered = this.pantryItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        this.renderPantry(filtered);
    }

    filterPantry(category) {
        if (category === 'all') {
            this.renderPantry();
        } else {
            const filtered = this.pantryItems.filter(item => item.category === category);
            this.renderPantry(filtered);
        }
    }

    getExpiryStatus(expiryDate) {
        if (!expiryDate) return { class: '', message: '' };
        
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { class: 'expired', message: 'Expired!' };
        } else if (diffDays <= 7) {
            return { class: 'expiring', message: `Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}` };
        }
        return { class: '', message: '' };
    }

    getNutritionTags(nutrition) {
        if (!nutrition) return [];
        const tags = [];
        if (nutrition.calories > 0) tags.push(`${nutrition.calories} cal`);
        if (nutrition.protein > 0) tags.push(`${nutrition.protein}g protein`);
        if (nutrition.carbs > 0) tags.push(`${nutrition.carbs}g carbs`);
        if (nutrition.fats > 0) tags.push(`${nutrition.fats}g fats`);
        return tags;
    }

    // Grocery List Management
    openGroceryModal(itemId = null) {
        const modal = document.getElementById('groceryModal');
        const title = document.getElementById('groceryModalTitle');
        
        if (itemId) {
            const item = this.groceryList.find(i => i.id === itemId);
            title.textContent = 'Edit Grocery Item';
            document.getElementById('groceryName').value = item.name;
            document.getElementById('groceryCategory').value = item.category;
            document.getElementById('groceryQuantity').value = item.quantity;
            document.getElementById('groceryUnit').value = item.unit;
            document.getElementById('groceryPrice').value = item.price;
            this.currentEditingId = itemId;
        } else {
            title.textContent = 'Add Grocery Item';
            document.getElementById('groceryForm').reset();
            this.currentEditingId = null;
        }
        
        modal.classList.add('active');
    }

    closeGroceryModal() {
        document.getElementById('groceryModal').classList.remove('active');
        document.getElementById('groceryForm').reset();
        this.currentEditingId = null;
    }

    saveGroceryItem() {
        const item = {
            id: this.currentEditingId || Date.now(),
            name: document.getElementById('groceryName').value,
            category: document.getElementById('groceryCategory').value,
            quantity: parseFloat(document.getElementById('groceryQuantity').value),
            unit: document.getElementById('groceryUnit').value,
            price: parseFloat(document.getElementById('groceryPrice').value),
            checked: false
        };

        if (this.currentEditingId) {
            const index = this.groceryList.findIndex(i => i.id === this.currentEditingId);
            this.groceryList[index] = item;
            this.showToast('Item updated!');
        } else {
            this.groceryList.push(item);
            this.showToast('Item added to grocery list!');
        }

        this.saveData();
        this.renderGroceryList();
        this.updateDashboard();
        this.closeGroceryModal();
    }

    deleteGroceryItem(id) {
        this.groceryList = this.groceryList.filter(i => i.id !== id);
        this.saveData();
        this.renderGroceryList();
        this.updateDashboard();
        this.showToast('Item removed from list');
    }

    toggleGroceryCheck(id) {
        const item = this.groceryList.find(i => i.id === id);
        item.checked = !item.checked;
        this.saveData();
        this.renderGroceryList();
    }

    renderGroceryList() {
        const list = document.getElementById('groceryList');
        const totalItems = this.groceryList.length;
        const totalCost = this.groceryList.reduce((sum, item) => sum + item.price, 0);
        const budgetRemaining = this.budget - this.calculateSpent() - totalCost;

        document.getElementById('groceryTotal').textContent = totalItems;
        document.getElementById('groceryCost').textContent = `$${totalCost.toFixed(2)}`;
        document.getElementById('budgetRemaining').textContent = `$${budgetRemaining.toFixed(2)}`;

        if (this.groceryList.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cart-shopping"></i>
                    <h3>Grocery list is empty</h3>
                    <p>Add items or generate from meal plans</p>
                </div>
            `;
            return;
        }

        list.innerHTML = this.groceryList.map(item => `
            <div class="grocery-item ${item.checked ? 'checked' : ''}">
                <div class="grocery-item-left">
                    <input type="checkbox" class="checkbox" 
                           ${item.checked ? 'checked' : ''} 
                           onchange="groceryApp.toggleGroceryCheck(${item.id})">
                    <div class="grocery-item-info">
                        <h4>${item.name}</h4>
                        <div class="grocery-item-meta">
                            <span><i class="fas fa-tag"></i> ${this.getCategoryLabel(item.category)}</span>
                            <span><i class="fas fa-weight"></i> ${item.quantity} ${item.unit}</span>
                        </div>
                    </div>
                </div>
                <div class="grocery-item-right">
                    <span class="price-tag">$${item.price.toFixed(2)}</span>
                    <button class="icon-btn" onclick="groceryApp.openGroceryModal(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn" onclick="groceryApp.deleteGroceryItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    generateFromMeals() {
        const today = new Date();
        const upcomingMeals = this.mealPlans.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= today;
        });

        if (upcomingMeals.length === 0) {
            this.showToast('No upcoming meals to generate from');
            return;
        }

        const ingredientsMap = new Map();
        
        upcomingMeals.forEach(meal => {
            meal.ingredients.forEach(ing => {
                const key = `${ing.name}-${ing.unit}`;
                if (ingredientsMap.has(key)) {
                    ingredientsMap.get(key).quantity += ing.quantity;
                } else {
                    ingredientsMap.set(key, {
                        name: ing.name,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        category: 'other',
                        price: 5.00
                    });
                }
            });
        });

        ingredientsMap.forEach(ing => {
            if (!this.groceryList.find(item => item.name.toLowerCase() === ing.name.toLowerCase())) {
                this.groceryList.push({
                    id: Date.now() + Math.random(),
                    ...ing,
                    checked: false
                });
            }
        });

        this.saveData();
        this.renderGroceryList();
        this.updateDashboard();
        this.showToast(`Generated ${ingredientsMap.size} items from meal plans!`);
    }

    checkout() {
        if (this.groceryList.length === 0) {
            this.showToast('Grocery list is empty!');
            return;
        }

        const totalCost = this.groceryList.reduce((sum, item) => sum + item.price, 0);
        const currentSpent = this.calculateSpent();
        
        if (currentSpent + totalCost > this.budget) {
            if (!confirm('This purchase will exceed your budget. Continue anyway?')) {
                return;
            }
        }

        // Add to history
        const historyEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: [...this.groceryList],
            total: totalCost
        };
        this.shoppingHistory.unshift(historyEntry);

        // Add items to pantry
        this.groceryList.forEach(item => {
            const existingItem = this.pantryItems.find(p => 
                p.name.toLowerCase() === item.name.toLowerCase()
            );
            
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                this.pantryItems.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    unit: item.unit,
                    addedDate: new Date().toISOString(),
                    expiryDate: null,
                    nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 }
                });
            }
        });

        // Clear grocery list
        this.groceryList = [];

        this.saveData();
        this.updateDashboard();
        this.renderPantry();
        this.renderGroceryList();
        this.renderHistory();
        this.showToast(`Checkout complete! $${totalCost.toFixed(2)} spent`);
    }

    // Meal Plans Management
    openMealModal(mealId = null) {
        const modal = document.getElementById('mealModal');
        const title = document.getElementById('mealModalTitle');
        
        if (mealId) {
            const meal = this.mealPlans.find(m => m.id === mealId);
            title.textContent = 'Edit Meal Plan';
            document.getElementById('mealName').value = meal.name;
            document.getElementById('mealDate').value = meal.date;
            document.getElementById('mealType').value = meal.type;
            document.getElementById('mealServings').value = meal.servings;
            
            const ingredientsList = document.getElementById('ingredientsList');
            ingredientsList.innerHTML = meal.ingredients.map(ing => `
                <div class="ingredient-row">
                    <input type="text" class="ingredient-name" value="${ing.name}" required>
                    <input type="number" class="ingredient-qty" value="${ing.quantity}" min="0" step="0.1" required>
                    <select class="ingredient-unit">
                        <option value="pcs" ${ing.unit === 'pcs' ? 'selected' : ''}>pcs</option>
                        <option value="kg" ${ing.unit === 'kg' ? 'selected' : ''}>kg</option>
                        <option value="g" ${ing.unit === 'g' ? 'selected' : ''}>g</option>
                        <option value="l" ${ing.unit === 'l' ? 'selected' : ''}>l</option>
                        <option value="ml" ${ing.unit === 'ml' ? 'selected' : ''}>ml</option>
                        <option value="lb" ${ing.unit === 'lb' ? 'selected' : ''}>lb</option>
                        <option value="oz" ${ing.unit === 'oz' ? 'selected' : ''}>oz</option>
                    </select>
                    <button type="button" class="btn-icon" onclick="groceryApp.removeIngredient(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
            
            this.currentEditingId = mealId;
        } else {
            title.textContent = 'Add Meal Plan';
            document.getElementById('mealForm').reset();
            document.getElementById('ingredientsList').innerHTML = `
                <div class="ingredient-row">
                    <input type="text" class="ingredient-name" placeholder="Ingredient" required>
                    <input type="number" class="ingredient-qty" placeholder="Qty" min="0" step="0.1" required>
                    <select class="ingredient-unit">
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                    </select>
                    <button type="button" class="btn-icon" onclick="groceryApp.removeIngredient(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            this.currentEditingId = null;
        }
        
        modal.classList.add('active');
    }

    closeMealModal() {
        document.getElementById('mealModal').classList.remove('active');
        document.getElementById('mealForm').reset();
        this.currentEditingId = null;
    }

    addIngredientRow() {
        const list = document.getElementById('ingredientsList');
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <input type="text" class="ingredient-name" placeholder="Ingredient" required>
            <input type="number" class="ingredient-qty" placeholder="Qty" min="0" step="0.1" required>
            <select class="ingredient-unit">
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="lb">lb</option>
                <option value="oz">oz</option>
            </select>
            <button type="button" class="btn-icon" onclick="groceryApp.removeIngredient(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(row);
    }

    removeIngredient(button) {
        const list = document.getElementById('ingredientsList');
        if (list.children.length > 1) {
            button.closest('.ingredient-row').remove();
        } else {
            this.showToast('At least one ingredient required');
        }
    }

    saveMealPlan() {
        const ingredientRows = document.querySelectorAll('.ingredient-row');
        const ingredients = Array.from(ingredientRows).map(row => ({
            name: row.querySelector('.ingredient-name').value,
            quantity: parseFloat(row.querySelector('.ingredient-qty').value),
            unit: row.querySelector('.ingredient-unit').value
        }));

        const meal = {
            id: this.currentEditingId || Date.now(),
            name: document.getElementById('mealName').value,
            date: document.getElementById('mealDate').value,
            type: document.getElementById('mealType').value,
            servings: parseInt(document.getElementById('mealServings').value),
            ingredients: ingredients
        };

        if (this.currentEditingId) {
            const index = this.mealPlans.findIndex(m => m.id === this.currentEditingId);
            this.mealPlans[index] = meal;
            this.showToast('Meal plan updated!');
        } else {
            this.mealPlans.push(meal);
            this.showToast('Meal plan added!');
        }

        this.saveData();
        this.renderMealPlans();
        this.updateDashboard();
        this.closeMealModal();
    }

    deleteMealPlan(id) {
        if (confirm('Delete this meal plan?')) {
            this.mealPlans = this.mealPlans.filter(m => m.id !== id);
            this.saveData();
            this.renderMealPlans();
            this.updateDashboard();
            this.showToast('Meal plan deleted');
        }
    }

    renderMealPlans() {
        const grid = document.getElementById('mealsGrid');

        if (this.mealPlans.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No meal plans</h3>
                    <p>Start planning your meals for the week</p>
                </div>
            `;
            return;
        }

        const sortedMeals = [...this.mealPlans].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        grid.innerHTML = sortedMeals.map(meal => `
            <div class="meal-card">
                <div class="meal-header">
                    <div class="meal-info">
                        <h3>${meal.name}</h3>
                        <div class="meal-meta">
                            <span><i class="fas fa-calendar"></i> ${new Date(meal.date).toLocaleDateString()}</span>
                            <span><i class="fas fa-clock"></i> ${meal.type}</span>
                            <span><i class="fas fa-users"></i> ${meal.servings} servings</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="icon-btn" onclick="groceryApp.openMealModal(${meal.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn" onclick="groceryApp.deleteMealPlan(${meal.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="meal-ingredients">
                    <h4>Ingredients:</h4>
                    <ul>
                        ${meal.ingredients.map(ing => 
                            `<li>${ing.quantity} ${ing.unit} ${ing.name}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // Shopping History
    renderHistory() {
        const list = document.getElementById('historyList');

        if (this.shoppingHistory.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>No shopping history</h3>
                    <p>Your past purchases will appear here</p>
                </div>
            `;
            return;
        }

        list.innerHTML = this.shoppingHistory.map(entry => `
            <div class="history-item">
                <div class="history-header">
                    <div>
                        <div class="history-date">
                            ${new Date(entry.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                        <div class="history-items">
                            ${entry.items.map(item => 
                                `<span class="history-tag">${item.name} (${item.quantity} ${item.unit})</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="history-total">$${entry.total.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }

    exportHistory() {
        if (this.shoppingHistory.length === 0) {
            this.showToast('No history to export');
            return;
        }

        const dataStr = JSON.stringify(this.shoppingHistory, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `shopping-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('History exported!');
    }

    clearHistory() {
        if (confirm('Clear all shopping history? This cannot be undone.')) {
            this.shoppingHistory = [];
            this.saveData();
            this.renderHistory();
            this.showToast('History cleared');
        }
    }

    // Budget Management
    openBudgetModal() {
        document.getElementById('budgetInput').value = this.budget;
        document.getElementById('budgetModal').classList.add('active');
    }

    closeBudgetModal() {
        document.getElementById('budgetModal').classList.remove('active');
    }

    saveBudget() {
        this.budget = parseFloat(document.getElementById('budgetInput').value);
        localStorage.setItem('budget', this.budget);
        this.updateBudgetDisplay();
        this.renderGroceryList();
        this.closeBudgetModal();
        this.showToast('Budget updated!');
    }

    updateBudgetDisplay() {
        const spent = this.calculateSpent();
        document.getElementById('budgetAmount').textContent = this.budget.toFixed(2);
        document.getElementById('spentAmount').textContent = spent.toFixed(2);
    }

    calculateSpent() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.shoppingHistory
            .filter(entry => {
                const date = new Date(entry.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, entry) => sum + entry.total, 0);
    }

    // Dashboard & Utilities
    updateDashboard() {
        document.getElementById('totalItems').textContent = this.pantryItems.length;
        document.getElementById('groceryCount').textContent = this.groceryList.length;
        document.getElementById('mealCount').textContent = this.mealPlans.length;
        
        const expiringCount = this.pantryItems.filter(item => {
            if (!item.expiryDate) return false;
            const diffDays = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        }).length;
        document.getElementById('expiringItems').textContent = expiringCount;
    }

    checkExpiry() {
        const expiring = this.pantryItems.filter(item => {
            if (!item.expiryDate) return false;
            const diffDays = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 3;
        });

        if (expiring.length > 0 && Notification.permission === 'granted') {
            new Notification('Items Expiring Soon!', {
                body: `${expiring.length} item(s) expiring in 3 days or less`,
                icon: '⚠️'
            });
        }
    }

    getCategoryLabel(category) {
        const labels = {
            fruits: 'Fruits & Vegetables',
            dairy: 'Dairy',
            meat: 'Meat & Protein',
            grains: 'Grains & Pasta',
            canned: 'Canned Goods',
            snacks: 'Snacks',
            beverages: 'Beverages',
            condiments: 'Condiments',
            other: 'Other'
        };
        return labels[category] || category;
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveData() {
        localStorage.setItem('pantryItems', JSON.stringify(this.pantryItems));
        localStorage.setItem('groceryList', JSON.stringify(this.groceryList));
        localStorage.setItem('mealPlans', JSON.stringify(this.mealPlans));
        localStorage.setItem('shoppingHistory', JSON.stringify(this.shoppingHistory));
    }
}

// Initialize the app
const groceryApp = new GroceryApp();

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
