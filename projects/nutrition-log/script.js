// Nutrition Log JavaScript
class NutritionLog {
    constructor() {
        this.foodDatabase = this.getFoodDatabase();
        this.meals = this.loadMeals();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateChart();
        this.displayMeals();
    }

    getFoodDatabase() {
        return {
            "apple": { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
            "banana": { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
            "chicken breast": { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
            "rice": { name: "White Rice (100g cooked)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
            "broccoli": { name: "Broccoli (100g)", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
            "salmon": { name: "Salmon (100g)", calories: 208, protein: 22, carbs: 0, fat: 13 },
            "oats": { name: "Oats (50g dry)", calories: 379, protein: 13.2, carbs: 67.7, fat: 6.9 },
            "eggs": { name: "Egg (large)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
            "milk": { name: "Milk (1 cup)", calories: 146, protein: 8, carbs: 12, fat: 8 },
            "bread": { name: "Whole Wheat Bread (1 slice)", calories: 81, protein: 3.6, carbs: 12.6, fat: 1 },
            "potato": { name: "Potato (medium)", calories: 163, protein: 4.3, carbs: 37, fat: 0.2 },
            "avocado": { name: "Avocado (half)", calories: 234, protein: 2.9, carbs: 12.8, fat: 21.4 },
            "spinach": { name: "Spinach (100g)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
            "yogurt": { name: "Greek Yogurt (100g)", calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
            "almonds": { name: "Almonds (28g)", calories: 161, protein: 6, carbs: 6, fat: 14 },
            "beef": { name: "Ground Beef (100g)", calories: 250, protein: 26, carbs: 0, fat: 17 },
            "pasta": { name: "Pasta (100g cooked)", calories: 157, protein: 5.8, carbs: 31, fat: 0.9 },
            "cheese": { name: "Cheddar Cheese (28g)", calories: 113, protein: 7, carbs: 0.4, fat: 9.3 },
            "orange": { name: "Orange", calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2 },
            "strawberries": { name: "Strawberries (100g)", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 }
        };
    }

    setupEventListeners() {
        // Food search
        document.getElementById('foodSearch').addEventListener('input', (e) => {
            this.showFoodSuggestions(e.target.value);
        });

        // Add food button
        document.getElementById('addFoodBtn').addEventListener('click', () => {
            this.addFoodToMeal();
        });

        // Form submission
        document.getElementById('mealForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logMeal();
        });
    }

    showFoodSuggestions(query) {
        const suggestionsDiv = document.getElementById('foodSuggestions');
        if (query.length < 2) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const matches = Object.keys(this.foodDatabase).filter(food =>
            food.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        if (matches.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        suggestionsDiv.innerHTML = matches.map(food => `
            <div class="suggestion-item" data-food="${food}">
                ${this.foodDatabase[food].name} - ${this.foodDatabase[food].calories} cal
            </div>
        `).join('');

        suggestionsDiv.style.display = 'block';

        // Add click listeners to suggestions
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('foodSearch').value = item.dataset.food;
                suggestionsDiv.style.display = 'none';
            });
        });
    }

    addFoodToMeal() {
        const foodInput = document.getElementById('foodSearch');
        const foodName = foodInput.value.toLowerCase().trim();

        if (!foodName || !this.foodDatabase[foodName]) {
            alert('Please select a valid food from the suggestions.');
            return;
        }

        const food = this.foodDatabase[foodName];
        const foodList = document.getElementById('foodList');

        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        foodItem.innerHTML = `
            <div class="food-info">
                <div class="food-name">${food.name}</div>
                <div class="food-macros">${food.calories} cal, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat</div>
            </div>
            <input type="number" class="quantity-input" value="1" min="0.1" step="0.1" data-food="${foodName}">
            <button class="remove-btn" onclick="nutritionLog.removeFood(this)">×</button>
        `;

        foodList.appendChild(foodItem);
        foodInput.value = '';
        this.updateChart();
    }

    removeFood(button) {
        button.parentElement.remove();
        this.updateChart();
    }

    calculateTotals() {
        const foodItems = document.querySelectorAll('.food-item');
        let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

        foodItems.forEach(item => {
            const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;
            const foodName = item.querySelector('.quantity-input').dataset.food;
            const food = this.foodDatabase[foodName];

            totals.calories += food.calories * quantity;
            totals.protein += food.protein * quantity;
            totals.carbs += food.carbs * quantity;
            totals.fat += food.fat * quantity;
        });

        return totals;
    }

    updateChart() {
        const totals = this.calculateTotals();

        // Update totals display
        document.getElementById('totalCalories').textContent = Math.round(totals.calories);
        document.getElementById('totalProtein').textContent = Math.round(totals.protein) + 'g';
        document.getElementById('totalCarbs').textContent = Math.round(totals.carbs) + 'g';
        document.getElementById('totalFat').textContent = Math.round(totals.fat) + 'g';

        // Update chart
        const ctx = document.getElementById('macroChart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [totals.protein, totals.carbs, totals.fat],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#fff',
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });
    }

    logMeal() {
        const mealName = document.getElementById('mealName').value.trim();
        if (!mealName) {
            alert('Please enter a meal name.');
            return;
        }

        const foodItems = document.querySelectorAll('.food-item');
        if (foodItems.length === 0) {
            alert('Please add at least one food item.');
            return;
        }

        const foods = [];
        foodItems.forEach(item => {
            const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;
            const foodName = item.querySelector('.quantity-input').dataset.food;
            foods.push({
                name: this.foodDatabase[foodName].name,
                quantity: quantity,
                macros: this.foodDatabase[foodName]
            });
        });

        const meal = {
            id: Date.now(),
            name: mealName,
            foods: foods,
            timestamp: new Date().toISOString(),
            totals: this.calculateTotals()
        };

        this.meals.push(meal);
        this.saveMeals();
        this.displayMeals();

        // Reset form
        document.getElementById('mealForm').reset();
        document.getElementById('foodList').innerHTML = '';
        this.updateChart();

        alert('Meal logged successfully!');
    }

    displayMeals() {
        const mealsList = document.getElementById('mealsList');
        const today = new Date().toDateString();

        const todaysMeals = this.meals.filter(meal =>
            new Date(meal.timestamp).toDateString() === today
        );

        if (todaysMeals.length === 0) {
            mealsList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No meals logged today yet.</p>';
            return;
        }

        mealsList.innerHTML = todaysMeals.reverse().map(meal => `
            <div class="meal-card">
                <div class="meal-header">
                    <div class="meal-title">${meal.name}</div>
                    <div class="meal-time">${new Date(meal.timestamp).toLocaleTimeString()}</div>
                </div>
                <div class="meal-foods">
                    ${meal.foods.map(food => `
                        <div class="food-summary">${food.quantity}x ${food.name}</div>
                    `).join('')}
                </div>
                <div class="meal-macros">
                    <span>${Math.round(meal.totals.calories)} cal</span>
                    <span>${Math.round(meal.totals.protein)}g protein</span>
                    <span>${Math.round(meal.totals.carbs)}g carbs</span>
                    <span>${Math.round(meal.totals.fat)}g fat</span>
                </div>
            </div>
        `).join('');
    }

    saveMeals() {
        localStorage.setItem('nutritionMeals', JSON.stringify(this.meals));
    }

    loadMeals() {
        const saved = localStorage.getItem('nutritionMeals');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize the app
const nutritionLog = new NutritionLog();