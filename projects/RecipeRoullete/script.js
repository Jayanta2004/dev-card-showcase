const recipes = [
  {
    name: "Veggie Pasta",
    ingredients: ["Pasta", "Tomato sauce", "Garlic", "Olive oil", "Vegetables"],
    steps: "Boil pasta, sauté veggies, add sauce, mix everything and serve hot."
  },
  {
    name: "Paneer Wrap",
    ingredients: ["Paneer", "Tortilla", "Onion", "Capsicum", "Spices"],
    steps: "Cook paneer with spices, add veggies, wrap inside tortilla and toast."
  },
  {
    name: "Fruit Smoothie",
    ingredients: ["Banana", "Berries", "Milk", "Honey"],
    steps: "Blend all ingredients until smooth. Serve chilled."
  },
  {
    name: "Classic Omelette",
    ingredients: ["Eggs", "Onion", "Tomato", "Salt", "Pepper"],
    steps: "Beat eggs, add chopped veggies, cook on pan until golden."
  },
  {
    name: "Grilled Sandwich",
    ingredients: ["Bread", "Cheese", "Tomato", "Butter", "Lettuce"],
    steps: "Assemble ingredients between bread slices and grill until crispy."
  }
];

const generateBtn = document.getElementById("generateBtn");
const recipeName = document.getElementById("recipeName");
const ingredients = document.getElementById("ingredients");
const steps = document.getElementById("steps");

generateBtn.addEventListener("click", () => {
  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];

  recipeName.textContent = randomRecipe.name;

  ingredients.innerHTML = "";
  randomRecipe.ingredients.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ingredients.appendChild(li);
  });

  steps.textContent = "Steps: " + randomRecipe.steps;
});