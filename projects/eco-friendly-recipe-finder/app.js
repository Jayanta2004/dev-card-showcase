// Eco-Friendly Recipe Finder App
const recipes = [
  {
    name: "Spring Veggie Stir-Fry",
    ingredients: ["asparagus", "peas", "carrots", "onion", "olive oil"],
    season: "Spring",
    local: true,
    lowImpact: true,
    carbon: 0.4,
    instructions: "Stir-fry all veggies in olive oil for 5-7 minutes. Serve warm.",
    description: "A quick, seasonal stir-fry with local spring vegetables."
  },
  {
    name: "Summer Tomato Salad",
    ingredients: ["tomato", "cucumber", "basil", "olive oil", "lemon"],
    season: "Summer",
    local: true,
    lowImpact: true,
    carbon: 0.3,
    instructions: "Chop all ingredients, toss with olive oil and lemon. Chill and serve.",
    description: "A refreshing salad using summer's best produce."
  },
  {
    name: "Autumn Root Roast",
    ingredients: ["potato", "carrot", "parsnip", "onion", "thyme"],
    season: "Autumn",
    local: true,
    lowImpact: true,
    carbon: 0.5,
    instructions: "Roast chopped roots with thyme at 200°C for 40 minutes.",
    description: "Hearty roasted roots for cool autumn days."
  },
  {
    name: "Winter Lentil Soup",
    ingredients: ["lentils", "carrot", "celery", "onion", "garlic"],
    season: "Winter",
    local: true,
    lowImpact: true,
    carbon: 0.6,
    instructions: "Simmer all ingredients in water for 30 minutes. Blend if desired.",
    description: "A warming, protein-rich soup for winter."
  },
  {
    name: "Avocado Toast",
    ingredients: ["avocado", "bread", "lemon", "salt", "pepper"],
    season: "All",
    local: false,
    lowImpact: false,
    carbon: 1.2,
    instructions: "Mash avocado, spread on toast, top with lemon, salt, and pepper.",
    description: "A trendy breakfast, but with a higher carbon footprint."
  }
];

function renderSearch() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Find Eco-Friendly Recipes</h2>
    <input id="search-input" type="text" placeholder="Search by name or ingredient...">
    <div id="recipe-list"></div>
  `;
  document.getElementById('search-input').addEventListener('input', handleSearch);
  handleSearch();
}

function handleSearch() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(query) ||
    r.ingredients.some(i => i.toLowerCase().includes(query))
  );
  renderRecipeList(filtered);
}

function renderRecipeList(list) {
  const container = document.getElementById('recipe-list');
  if (!list.length) {
    container.innerHTML = '<p>No recipes found.</p>';
    return;
  }
  container.innerHTML = list.map((r, idx) => `
    <div class="card">
      <div><strong>${r.name}</strong> <span class="footprint ${footprintColor(r.carbon)}">${r.carbon} kg CO₂e</span></div>
      <div>${r.description}</div>
      <div>Season: ${r.season}</div>
      <div>Local: ${r.local ? 'Yes' : 'No'}</div>
      <div>Low Impact: ${r.lowImpact ? 'Yes' : 'No'}</div>
      <div>Ingredients: ${r.ingredients.join(', ')}</div>
      <button class="action" onclick="showRecipe(${idx})">View Recipe</button>
    </div>
  `).join('');
}

function footprintColor(carbon) {
  if (carbon <= 0.5) return 'green';
  if (carbon <= 1) return 'yellow';
  return 'red';
}

function showRecipe(idx) {
  const r = recipes[idx];
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">${r.name}</h2>
    <div class="card">
      <div><strong>Carbon Footprint:</strong> <span class="footprint ${footprintColor(r.carbon)}">${r.carbon} kg CO₂e</span></div>
      <div><strong>Season:</strong> ${r.season}</div>
      <div><strong>Local:</strong> ${r.local ? 'Yes' : 'No'}</div>
      <div><strong>Low Impact:</strong> ${r.lowImpact ? 'Yes' : 'No'}</div>
      <div><strong>Ingredients:</strong> ${r.ingredients.join(', ')}</div>
      <div><strong>Instructions:</strong> ${r.instructions}</div>
    </div>
    <button class="action" onclick="renderSearch()">Back to Search</button>
  `;
}

function renderSeasonal() {
  renderRecipeList(recipes.filter(r => r.season === getCurrentSeason() || r.season === 'All'));
}

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if ([3,4,5].includes(month)) return 'Spring';
  if ([6,7,8].includes(month)) return 'Summer';
  if ([9,10,11].includes(month)) return 'Autumn';
  return 'Winter';
}

function renderLocal() {
  renderRecipeList(recipes.filter(r => r.local));
}

function renderLowImpact() {
  renderRecipeList(recipes.filter(r => r.lowImpact));
}

document.getElementById('nav-search').onclick = renderSearch;
document.getElementById('nav-seasonal').onclick = function() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<h2 class="section-title">Seasonal Recipes (${getCurrentSeason()})</h2><div id="recipe-list"></div>`;
  renderSeasonal();
};
document.getElementById('nav-local').onclick = function() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<h2 class="section-title">Local Recipes</h2><div id="recipe-list"></div>`;
  renderLocal();
};
document.getElementById('nav-lowimpact').onclick = function() {
  const main = document.getElementById('main-content');
  main.innerHTML = `<h2 class="section-title">Low Impact Recipes</h2><div id="recipe-list"></div>`;
  renderLowImpact();
};

// Initial load
renderSearch();
