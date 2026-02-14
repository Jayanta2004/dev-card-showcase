// Recipe Organizer & Meal Planner
let recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
let mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '[]');
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function renderRecipes(filter = '', category = 'all') {
    const recipesDiv = document.getElementById('recipes');
    recipesDiv.innerHTML = '';
    let filtered = recipes.filter(r =>
        (category === 'all' || r.category === category) &&
        (r.title.toLowerCase().includes(filter.toLowerCase()) || r.ingredients.join(',').toLowerCase().includes(filter.toLowerCase()))
    );
    filtered.forEach((r, idx) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        if (r.photo) card.innerHTML += `<img src="${r.photo}" alt="Photo">`;
        card.innerHTML += `<b>${r.title}</b><br><small>${r.category}</small><br><span>${r.ingredients.join(', ')}</span><br>`;
        card.innerHTML += `<small>${r.nutrition}</small><br>`;
        card.innerHTML += `<button class="favorite-btn${favorites.includes(r.title) ? ' active' : ''}" data-title="${r.title}">★</button>`;
        card.innerHTML += `<button onclick="addToMealPlan('${r.title}')">Add to Meal Plan</button>`;
        recipesDiv.appendChild(card);
    });
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.onclick = function() {
            const title = this.dataset.title;
            if (favorites.includes(title)) {
                favorites = favorites.filter(f => f !== title);
            } else {
                favorites.push(title);
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            renderRecipes(document.getElementById('search-input').value, document.getElementById('category-filter').value);
        };
    });
}

function renderCategories() {
    const catSet = new Set(recipes.map(r => r.category));
    const catFilter = document.getElementById('category-filter');
    catFilter.innerHTML = '<option value="all">All</option>';
    catSet.forEach(cat => {
        if (cat) catFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

document.getElementById('add-recipe-btn').onclick = function() {
    const title = document.getElementById('recipe-title').value.trim();
    const category = document.getElementById('recipe-category').value.trim();
    const ingredients = document.getElementById('recipe-ingredients').value.split(',').map(i => i.trim()).filter(i => i);
    const steps = document.getElementById('recipe-steps').value.trim();
    const nutrition = document.getElementById('recipe-nutrition').value.trim();
    const photoInput = document.getElementById('recipe-photo');
    if (!title || !category || !ingredients.length || !steps) {
        alert('Please fill all required fields.');
        return;
    }
    let photo = '';
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photo = e.target.result;
            addRecipe({ title, category, ingredients, steps, nutrition, photo });
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        addRecipe({ title, category, ingredients, steps, nutrition, photo: '' });
    }
};

function addRecipe(recipe) {
    recipes.push(recipe);
    localStorage.setItem('recipes', JSON.stringify(recipes));
    renderRecipes();
    renderCategories();
}

document.getElementById('search-input').oninput = function() {
    renderRecipes(this.value, document.getElementById('category-filter').value);
};
document.getElementById('category-filter').onchange = function() {
    renderRecipes(document.getElementById('search-input').value, this.value);
};

function addToMealPlan(title) {
    if (mealPlan.length >= 7) mealPlan.shift();
    mealPlan.push(title);
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    renderMealPlanner();
    renderShoppingList();
    renderCalendar();
}

function renderMealPlanner() {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const planner = document.getElementById('meal-planner');
    planner.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const day = document.createElement('div');
        day.className = 'meal-day';
        day.innerHTML = `<b>${days[i]}</b><br>${mealPlan[i] || ''}`;
        planner.appendChild(day);
    }
}

function renderShoppingList() {
    const listDiv = document.getElementById('shopping-list');
    let items = [];
    mealPlan.forEach(title => {
        const recipe = recipes.find(r => r.title === title);
        if (recipe) items = items.concat(recipe.ingredients);
    });
    const unique = [...new Set(items)];
    listDiv.innerHTML = unique.map(i => `<div>${i}</div>`).join('');
}

document.getElementById('export-shopping-csv').onclick = function() {
    let csv = 'Item\n';
    let items = [];
    mealPlan.forEach(title => {
        const recipe = recipes.find(r => r.title === title);
        if (recipe) items = items.concat(recipe.ingredients);
    });
    const unique = [...new Set(items)];
    unique.forEach(i => { csv += `${i}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'shopping-list.csv';
    link.click();
};

document.getElementById('export-recipes-csv').onclick = function() {
    let csv = 'Title,Category,Ingredients,Steps,Nutrition\n';
    recipes.forEach(r => {
        csv += `${r.title},${r.category},${r.ingredients.join('|')},${r.steps.replace(/\n/g,' ')} ,${r.nutrition}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'recipes.csv';
    link.click();
};

document.getElementById('export-mealplan-pdf').onclick = function() {
    alert('PDF export is a placeholder. Use browser print to PDF for now.');
};

function renderCalendar() {
    const cal = document.getElementById('calendar-view');
    cal.innerHTML = '';
    mealPlan.forEach((title, idx) => {
        cal.innerHTML += `<div><b>Day ${idx+1}:</b> ${title}</div>`;
    });
}

renderRecipes();
renderCategories();
renderMealPlanner();
renderShoppingList();
renderCalendar();