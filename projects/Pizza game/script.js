const loader = document.getElementById("loader");
const home = document.getElementById("home");
const game = document.getElementById("game");

const startBtn = document.getElementById("startGame");
const bakeBtn = document.getElementById("bakeBtn");
const pizza = document.getElementById("pizza");
const box = document.getElementById("box");
const success = document.getElementById("success");
const bakeTimeEl = document.getElementById("bakeTime");

const timerEl = document.getElementById("timer");
const coinsEl = document.getElementById("coins");
const orderNameEl = document.getElementById("orderName");

let time = 60;
let coins = localStorage.getItem("coins") ? parseInt(localStorage.getItem("coins")) : 0;
coinsEl.textContent = coins;
let timer;

// LOADER
loader.style.display = "flex";
setTimeout(() => {
  loader.style.display = "none";
  home.style.display = "flex";
}, 2000);

// TIMER
function startTimer() {
  time = 60;
  timerEl.textContent = time;
  timer = setInterval(() => {
    time--;
    timerEl.textContent = time;
    if (time === 0) fail();
  }, 1000);
}

// Random pizza names
const pizzaNames = [
  "Margherita", "Pepperoni", "Hawaiian", "Veggie Delight", "BBQ Chicken",
  "Meat Lovers", "Four Cheese", "Mushroom Magic", "Spicy Italian", "Cheesy Bacon",
  "Pesto Passion", "Garlic Lovers", "Mediterranean", "Supreme Feast", "Buffalo Chicken",
  "Spinach & Feta", "Taco Pizza", "Chilli Paneer", "Paneer Tikka", "Classic Veggie",
  "Sausage Party", "Seafood Special", "Tomato Basil", "Mexican Fiesta", "Chicken Ranch",
  "Pineapple Express", "Crispy Veggie", "Bacon & Egg", "Cheese Burst", "Golden Corn"
];

// Random toppings for order
const allToppings = ["Pepperoni","Mushroom","Olive","Corn","Cheese","Bacon","Chilli","Pineapple","Onion","Chicken","Sausage","Garlic","Spinach","Shrimp","Bell Pepper"];

// Function to get random pizza name
function getRandomPizzaName() {
  return pizzaNames[Math.floor(Math.random() * pizzaNames.length)];
}

// Function to get 2-4 random toppings for order
function getRandomToppings() {
  let shuffled = allToppings.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 2).join(", ");
}

// Set random order
function setRandomOrder() {
  const name = getRandomPizzaName();
  const toppings = getRandomToppings();
  orderNameEl.textContent = `${name} • ${toppings}`;
}

// START
startBtn.onclick = () => {
  home.style.display = "none";
  game.style.display = "block";
  startTimer();
  setRandomOrder();
};

// Toppings click
document.querySelectorAll(".top").forEach(btn => {
  btn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "topping";
    div.innerHTML = btn.dataset.svg;

    const pizzaRadius = 110;
    let angle = Math.random() * 2 * Math.PI;
    let r = Math.random() * pizzaRadius * 0.7;
    let x = pizzaRadius + r * Math.cos(angle) - 16;
    let y = pizzaRadius + r * Math.sin(angle) - 16;

    div.style.left = x + "px";
    div.style.top = y + "px";

    pizza.appendChild(div);
  });
});

// Sauces
document.querySelectorAll(".sauce").forEach(btn => {
  btn.addEventListener("click", () => {
    const existing = pizza.querySelector(".sauce-layer");
    if (existing) existing.remove();

    const sauce = document.createElement("div");
    sauce.className = "sauce-layer";
    sauce.style.background = btn.dataset.color;

    pizza.appendChild(sauce);
  });
});

// BAKE
bakeBtn.onclick = () => {
  let bake = 4;
  bakeTimeEl.textContent = `Baking: ${bake}s`;
  pizza.style.display = "none";

  const bakeTimer = setInterval(() => {
    bake--;
    bakeTimeEl.textContent = `Baking: ${bake}s`;
    if (bake === 0) {
      clearInterval(bakeTimer);
      pizza.classList.add("baked");
      pizza.style.display = "block";
      box.style.display = "block";
      bakeTimeEl.textContent = "";
    }
  }, 1000);
};

// DELIVERY
box.onclick = () => {
  coins += 20;
  coinsEl.textContent = coins;
  localStorage.setItem("coins", coins); 
  success.style.display = "block";

  setTimeout(resetGame, 2000);
};

// FAIL
function fail() {
  clearInterval(timer);
  alert("❌ Time up! -10 coins");
  coins -= 10;
  coinsEl.textContent = coins;
  localStorage.setItem("coins", coins); 
  resetGame();
}

// RESET
function resetGame() {
  clearInterval(timer);
  pizza.innerHTML = "";
  pizza.classList.remove("baked");
  box.style.display = "none";
  success.style.display = "none";
  game.style.display = "none";
  home.style.display = "flex";
  setRandomOrder(); 
}
