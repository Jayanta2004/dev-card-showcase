const aquarium = document.getElementById("aquarium");
const addFishBtn = document.getElementById("addFish");
const feedFishBtn = document.getElementById("feedFish");

const fishes = [];

// Create plants along bottom
function createPlants() {
  const count = Math.floor(window.innerWidth / 80);
  for (let i = 0; i < count; i++) {
    const plant = document.createElement("div");
    plant.className = "plant";
    plant.style.left = i * 80 + Math.random() * 40 + "px";
    plant.style.height = 80 + Math.random() * 120 + "px";
    plant.style.animationDuration = 3 + Math.random() * 3 + "s";
    aquarium.appendChild(plant);
  }
}
createPlants();

// Fish logic
function addFish() {
  const fish = document.createElement("div");
  fish.className = "fish";
  fish.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;

  const x = Math.random() * (window.innerWidth - 80);
  const y = Math.random() * (window.innerHeight - 120);

  fish.style.left = x + "px";
  fish.style.top = y + "px";

  aquarium.appendChild(fish);

  const data = { el: fish, x, y };
  fishes.push(data);

  swimRandomly(data);
}

function swimRandomly(fish) {
  setInterval(() => {
    const x = Math.random() * (window.innerWidth - 80);
    const y = Math.random() * (window.innerHeight - 120);
    moveFish(fish, x, y);
  }, 4000);
}

function moveFish(fish, x, y) {
  if (x < fish.x) fish.el.style.transform = "scaleX(-1)";
  else fish.el.style.transform = "scaleX(1)";

  fish.x = x;
  fish.y = y;
  fish.el.style.left = x + "px";
  fish.el.style.top = y + "px";
}

// Initial fish
for (let i = 0; i < 5; i++) addFish();
addFishBtn.addEventListener("click", addFish);

// Ripple + attract nearby fish
aquarium.addEventListener("click", (e) => {
  const rx = e.clientX;
  const ry = e.clientY;

  const ripple = document.createElement("div");
  ripple.className = "ripple";
  ripple.style.left = rx + "px";
  ripple.style.top = ry + "px";
  aquarium.appendChild(ripple);
  setTimeout(() => ripple.remove(), 1200);

  fishes.forEach(fish => {
    const dx = fish.x - rx;
    const dy = fish.y - ry;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 250) {
      moveFish(fish, rx - 30, ry - 15);
    }
  });
});

// Feed fish
feedFishBtn.addEventListener("click", () => {
  const fx = Math.random() * window.innerWidth;

  const food = document.createElement("div");
  food.className = "food";
  food.style.left = fx + "px";
  food.style.top = "0px";
  aquarium.appendChild(food);

  fishes.forEach(fish => moveFish(fish, fx, 60));
  setTimeout(() => food.remove(), 3000);
});

// Bubbles generator
setInterval(() => {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.style.left = Math.random() * window.innerWidth + "px";
  const size = 6 + Math.random() * 10;
  bubble.style.width = bubble.style.height = size + "px";
  bubble.style.animationDuration = 4 + Math.random() * 5 + "s";
  aquarium.appendChild(bubble);
  setTimeout(() => bubble.remove(), 9000);
}, 400);
