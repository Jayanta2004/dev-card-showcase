// AI-powered recipe suggestion logic
let recipes = [
  {
    title: "Veggie Stir Fry",
    ingredients: ["Broccoli", "Carrot", "Bell Pepper", "Soy Sauce"],
    diet: "Vegetarian",
    desc: "A quick and healthy stir fry with fresh vegetables and soy sauce."
  },
  {
    title: "Vegan Chili",
    ingredients: ["Beans", "Tomato", "Corn", "Onion"],
    diet: "Vegan",
    desc: "A hearty vegan chili packed with beans and veggies."
  },
  {
    title: "Gluten-Free Pancakes",
    ingredients: ["Gluten-Free Flour", "Egg", "Milk", "Honey"],
    diet: "Gluten-Free",
    desc: "Fluffy pancakes made with gluten-free flour and honey."
  },
  {
    title: "Keto Chicken Salad",
    ingredients: ["Chicken", "Avocado", "Lettuce", "Olive Oil"],
    diet: "Keto",
    desc: "A low-carb chicken salad with avocado and olive oil."
  },
  {
    title: "Classic Omelette",
    ingredients: ["Egg", "Cheese", "Spinach", "Tomato"],
    diet: "None",
    desc: "A classic omelette with cheese and veggies."
  }
];
let history = [];
let userProfile = {
  name: "Guest",
  pastIngredients: [],
  pastDiet: ""
};

// Navigation
const homeBtn = document.getElementById("homeBtn");
const historyBtn = document.getElementById("historyBtn");
const profileBtn = document.getElementById("profileBtn");
const homeSection = document.getElementById("homeSection");
const historySection = document.getElementById("historySection");
const profileSection = document.getElementById("profileSection");
const ingredientForm = document.getElementById("ingredientForm");
const ingredientInput = document.getElementById("ingredientInput");
const dietInput = document.getElementById("dietInput");
const recipeList = document.getElementById("recipeList");
const historyList = document.getElementById("historyList");
const profileInfo = document.getElementById("profileInfo");

function showSection(section) {
  homeSection.style.display = section === "home" ? "block" : "none";
  historySection.style.display = section === "history" ? "block" : "none";
  profileSection.style.display = section === "profile" ? "block" : "none";
}

homeBtn.addEventListener("click", () => showSection("home"));
historyBtn.addEventListener("click", () => {
  showSection("history");
  renderHistory();
});
profileBtn.addEventListener("click", () => {
  showSection("profile");
  renderProfile();
});

// Suggest recipes
ingredientForm.addEventListener("submit", e => {
  e.preventDefault();
  const ingredients = ingredientInput.value.split(",").map(i => i.trim()).filter(i => i);
  const diet = dietInput.value;
  userProfile.pastIngredients = ingredients;
  userProfile.pastDiet = diet;
  const suggested = suggestRecipes(ingredients, diet);
  renderRecipes(suggested);
  history.push({ ingredients, diet, suggested });
  ingredientForm.reset();
});

function suggestRecipes(ingredients, diet) {
  // Simple AI: match at least one ingredient and diet
  return recipes.filter(r => {
    const ingredientMatch = r.ingredients.some(i => ingredients.includes(i));
    const dietMatch = diet === "None" || r.diet === diet;
    return ingredientMatch && dietMatch;
  });
}

function renderRecipes(suggested) {
  recipeList.innerHTML = "";
  if (suggested.length === 0) {
    recipeList.innerHTML = "<p>No recipes found. Try different ingredients or preferences.</p>";
    return;
  }
  suggested.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <div class="recipe-title">${recipe.title}</div>
      <div class="recipe-desc">${recipe.desc}</div>
      <div class="recipe-ingredients">Ingredients: ${recipe.ingredients.join(", ")}</div>
      <div class="recipe-diet">Diet: ${recipe.diet}</div>
    `;
    recipeList.appendChild(card);
  });
}

function renderHistory() {
  historyList.innerHTML = "";
  history.slice().reverse().forEach(h => {
    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div><strong>Ingredients:</strong> ${h.ingredients.join(", ")}</div>
      <div><strong>Diet:</strong> ${h.diet}</div>
      <div><strong>Recipes Suggested:</strong> ${h.suggested.map(r => r.title).join(", ")}</div>
    `;
    historyList.appendChild(card);
  });
}

function renderProfile() {
  profileInfo.innerHTML = `
    <strong>Name:</strong> ${userProfile.name}<br>
    <strong>Last Ingredients:</strong> ${userProfile.pastIngredients.join(", ")}<br>
    <strong>Last Diet:</strong> ${userProfile.pastDiet}
  `;
}

// Initial render
showSection("home");
