// Meal Planner JavaScript
class MealPlanner {
    constructor() {
        this.currentDate = new Date();
        this.meals = this.loadMeals();
        this.nutritionGoals = {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fats: 67
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateDisplay();
        this.renderMeals();
        this.updateNutritionDisplay();
        this.renderMealSuggestions();
        this.initializeChart();
    }

    setupEventListeners() {
        // Date navigation
        document.getElementById('prevDay').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextDay').addEventListener('click', () => this.changeDate(1));

        // Add meal buttons
        document.querySelectorAll('.add-meal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.openMealModal(e.target.dataset.meal));
        });

        // Modal
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        document.querySelector('.cancel-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('mealForm').addEventListener('submit', (e) => this.saveMeal(e));

        // Meal suggestions
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeSuggestionCategory(e.target.dataset.category));
        });

        // Click outside modal to close
        document.getElementById('mealModal').addEventListener('click', (e) => {
            if (e.target.id === 'mealModal') this.closeModal();
        });
    }

    changeDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.updateDateDisplay();
        this.renderMeals();
        this.updateNutritionDisplay();
    }

    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent =
            this.currentDate.toLocaleDateString('en-US', options);
    }

    getDateKey() {
        return this.currentDate.toISOString().split('T')[0];
    }

    loadMeals() {
        const saved = localStorage.getItem('mealPlanner');
        return saved ? JSON.parse(saved) : {};
    }

    saveMeals() {
        localStorage.setItem('mealPlanner', JSON.stringify(this.meals));
    }

    getMealsForDate() {
        const dateKey = this.getDateKey();
        return this.meals[dateKey] || { breakfast: [], lunch: [], dinner: [], snacks: [] };
    }

    renderMeals() {
        const dayMeals = this.getMealsForDate();

        Object.keys(dayMeals).forEach(mealType => {
            const container = document.getElementById(`${mealType}Items`);
            container.innerHTML = '';

            if (dayMeals[mealType].length === 0) {
                container.innerHTML = `
                    <div class="empty-meal">
                        <i class="fas fa-${this.getMealIcon(mealType)}"></i>
                        <p>No ${mealType} planned yet</p>
                    </div>
                `;
            } else {
                dayMeals[mealType].forEach((meal, index) => {
                    const mealElement = this.createMealElement(meal, mealType, index);
                    container.appendChild(mealElement);
                });
            }
        });
    }

    getMealIcon(mealType) {
        const icons = {
            breakfast: 'coffee',
            lunch: 'utensils',
            dinner: 'moon',
            snacks: 'apple-alt'
        };
        return icons[mealType] || 'utensils';
    }

    createMealElement(meal, mealType, index) {
        const div = document.createElement('div');
        div.className = 'meal-item';
        div.innerHTML = `
            <div class="meal-info">
                <h4>${meal.name}</h4>
                <div class="meal-nutrition">
                    ${meal.calories} kcal | P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fats}g
                </div>
            </div>
            <div class="meal-actions">
                <button class="edit-btn" onclick="mealPlanner.editMeal('${mealType}', ${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="mealPlanner.deleteMeal('${mealType}', ${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return div;
    }

    openMealModal(mealType, editIndex = null) {
        const modal = document.getElementById('mealModal');
        const form = document.getElementById('mealForm');
        const title = document.getElementById('modalTitle');

        this.currentMealType = mealType;
        this.editIndex = editIndex;

        if (editIndex !== null) {
            const dayMeals = this.getMealsForDate();
            const meal = dayMeals[mealType][editIndex];
            title.textContent = 'Edit Meal';
            this.populateForm(meal);
        } else {
            title.textContent = 'Add Meal';
            form.reset();
            document.getElementById('mealCategory').value = mealType;
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    populateForm(meal) {
        document.getElementById('mealName').value = meal.name;
        document.getElementById('mealCalories').value = meal.calories;
        document.getElementById('mealProtein').value = meal.protein;
        document.getElementById('mealCarbs').value = meal.carbs;
        document.getElementById('mealFats').value = meal.fats;
        document.getElementById('mealCategory').value = meal.category;
    }

    closeModal() {
        document.getElementById('mealModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('mealForm').reset();
        this.editIndex = null;
    }

    saveMeal(e) {
        e.preventDefault();

        const meal = {
            name: document.getElementById('mealName').value,
            calories: parseInt(document.getElementById('mealCalories').value),
            protein: parseInt(document.getElementById('mealProtein').value),
            carbs: parseInt(document.getElementById('mealCarbs').value),
            fats: parseInt(document.getElementById('mealFats').value),
            category: document.getElementById('mealCategory').value
        };

        const dateKey = this.getDateKey();
        if (!this.meals[dateKey]) {
            this.meals[dateKey] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
        }

        if (this.editIndex !== null) {
            this.meals[dateKey][this.currentMealType][this.editIndex] = meal;
        } else {
            this.meals[dateKey][this.currentMealType].push(meal);
        }

        this.saveMeals();
        this.closeModal();
        this.renderMeals();
        this.updateNutritionDisplay();
    }

    editMeal(mealType, index) {
        this.openMealModal(mealType, index);
    }

    deleteMeal(mealType, index) {
        if (confirm('Are you sure you want to delete this meal?')) {
            const dateKey = this.getDateKey();
            this.meals[dateKey][mealType].splice(index, 1);
            this.saveMeals();
            this.renderMeals();
            this.updateNutritionDisplay();
        }
    }

    calculateDailyNutrition() {
        const dayMeals = this.getMealsForDate();
        const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

        Object.values(dayMeals).forEach(meals => {
            meals.forEach(meal => {
                totals.calories += meal.calories;
                totals.protein += meal.protein;
                totals.carbs += meal.carbs;
                totals.fats += meal.fats;
            });
        });

        return totals;
    }

    updateNutritionDisplay() {
        const totals = this.calculateDailyNutrition();

        // Update progress bars
        this.updateProgressBar('calorieProgress', totals.calories, this.nutritionGoals.calories);
        this.updateProgressBar('proteinProgress', totals.protein, this.nutritionGoals.protein);
        this.updateProgressBar('carbProgress', totals.carbs, this.nutritionGoals.carbs);
        this.updateProgressBar('fatProgress', totals.fats, this.nutritionGoals.fats);

        // Update counters
        document.getElementById('calorieCount').textContent = `${totals.calories} / ${this.nutritionGoals.calories} kcal`;
        document.getElementById('proteinCount').textContent = `${totals.protein} / ${this.nutritionGoals.protein}g`;
        document.getElementById('carbCount').textContent = `${totals.carbs} / ${this.nutritionGoals.carbs}g`;
        document.getElementById('fatCount').textContent = `${totals.fats} / ${this.nutritionGoals.fats}g`;

        // Update chart
        this.updateChart(totals);
    }

    updateProgressBar(elementId, current, target) {
        const percentage = Math.min((current / target) * 100, 100);
        document.getElementById(elementId).style.width = `${percentage}%`;
    }

    initializeChart() {
        const ctx = document.getElementById('nutritionChart').getContext('2d');
        this.nutritionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fats'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#4CAF50',
                        '#FF9800',
                        '#2196F3'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    updateChart(totals) {
        if (this.nutritionChart) {
            this.nutritionChart.data.datasets[0].data = [
                totals.protein,
                totals.carbs,
                totals.fats
            ];
            this.nutritionChart.update();
        }
    }

    renderMealSuggestions() {
        const suggestions = this.getMealSuggestions('balanced');
        const container = document.getElementById('mealSuggestions');
        container.innerHTML = '';

        suggestions.forEach(suggestion => {
            const card = this.createSuggestionCard(suggestion);
            container.appendChild(card);
        });
    }

    getMealSuggestions(category) {
        const suggestions = {
            balanced: [
                { name: 'Grilled Chicken Salad', calories: 350, protein: 35, carbs: 15, fats: 18 },
                { name: 'Quinoa Bowl', calories: 420, protein: 18, carbs: 55, fats: 12 },
                { name: 'Turkey Wrap', calories: 380, protein: 28, carbs: 35, fats: 14 },
                { name: 'Greek Yogurt Parfait', calories: 280, protein: 20, carbs: 30, fats: 8 }
            ],
            'high-protein': [
                { name: 'Salmon with Broccoli', calories: 450, protein: 40, carbs: 10, fats: 25 },
                { name: 'Chicken Breast', calories: 320, protein: 45, carbs: 0, fats: 12 },
                { name: 'Tofu Stir Fry', calories: 380, protein: 25, carbs: 20, fats: 18 },
                { name: 'Egg White Omelette', calories: 220, protein: 30, carbs: 5, fats: 8 }
            ],
            'low-carb': [
                { name: 'Avocado Chicken Salad', calories: 380, protein: 32, carbs: 8, fats: 22 },
                { name: 'Grilled Steak', calories: 420, protein: 45, carbs: 0, fats: 24 },
                { name: 'Cauliflower Rice Bowl', calories: 320, protein: 28, carbs: 12, fats: 16 },
                { name: 'Zucchini Noodles', calories: 280, protein: 20, carbs: 15, fats: 14 }
            ],
            vegetarian: [
                { name: 'Chickpea Curry', calories: 380, protein: 18, carbs: 45, fats: 12 },
                { name: 'Vegetable Stir Fry', calories: 320, protein: 12, carbs: 35, fats: 15 },
                { name: 'Lentil Soup', calories: 280, protein: 16, carbs: 40, fats: 6 },
                { name: 'Veggie Burger', calories: 350, protein: 20, carbs: 30, fats: 14 }
            ]
        };

        return suggestions[category] || suggestions.balanced;
    }

    createSuggestionCard(suggestion) {
        const div = document.createElement('div');
        div.className = 'suggestion-card';
        div.innerHTML = `
            <h4>${suggestion.name}</h4>
            <div class="suggestion-nutrition">
                ${suggestion.calories} kcal | P: ${suggestion.protein}g | C: ${suggestion.carbs}g | F: ${suggestion.fats}g
            </div>
            <button class="suggestion-add" onclick="mealPlanner.addSuggestion('${suggestion.name}', ${suggestion.calories}, ${suggestion.protein}, ${suggestion.carbs}, ${suggestion.fats})">
                <i class="fas fa-plus"></i> Add
            </button>
        `;
        return div;
    }

    changeSuggestionCategory(category) {
        // Update active button
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Render new suggestions
        this.renderMealSuggestions();
    }

    addSuggestion(name, calories, protein, carbs, fats) {
        // Determine meal type based on current time or default to lunch
        const now = new Date();
        const hour = now.getHours();
        let mealType = 'lunch';

        if (hour < 10) mealType = 'breakfast';
        else if (hour < 15) mealType = 'lunch';
        else if (hour < 20) mealType = 'dinner';
        else mealType = 'snacks';

        const meal = {
            name: name,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fats: fats,
            category: mealType
        };

        const dateKey = this.getDateKey();
        if (!this.meals[dateKey]) {
            this.meals[dateKey] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
        }

        this.meals[dateKey][mealType].push(meal);
        this.saveMeals();
        this.renderMeals();
        this.updateNutritionDisplay();

        // Show success feedback
        this.showNotification(`Added ${name} to ${mealType}!`);
    }

    showNotification(message) {
        // Simple notification - you could enhance this
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }
}

// Initialize the meal planner when DOM is loaded
let mealPlanner;
document.addEventListener('DOMContentLoaded', () => {
    mealPlanner = new MealPlanner();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);