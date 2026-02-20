const plants = [];
const WATER_TO_GROW = 10;

function addPlant(type) {
  plants.push({
    type,
    stage: 1,
    water: 0
  });
  render();
}

function waterAll() {
  plants.forEach((_, i) => waterPlant(i));
}

function waterPlant(index) {
  const plant = plants[index];
  plant.water++;

  if (plant.water >= WATER_TO_GROW) {
    if (plant.stage < 3) {
      plant.stage++;
      plant.water = 0;
    }
  }

  render();

  setTimeout(() => wateringEffect(index), 30);
}

function wateringEffect(index) {
  const plantEl = document.querySelectorAll(".plant")[index];
  if (!plantEl) return;

  plantEl.classList.add("wet");

  for (let i = 0; i < 12; i++) {
    const splash = document.createElement("div");
    splash.className = "splash";

    const x = (Math.random() - 0.5) * 70;
    const y = Math.random() * 120;

    splash.style.setProperty("--x", `${x}px`);
    splash.style.setProperty("--y", `${y}px`);

    splash.style.left = "50%";
    plantEl.appendChild(splash);

    setTimeout(() => splash.remove(), 700);
  }

  setTimeout(() => plantEl.classList.remove("wet"), 600);
}


function svgPlant(type, stage) {
  const cls = `stage-${stage}`;

  if (type === "cactus") return `
<svg class="${cls}" width="120" height="200" viewBox="0 0 120 200">
  <path d="M60 190 C55 130 55 70 60 30 C65 70 65 130 60 190" fill="#2E7D32"/>
  <path d="M42 140 C18 120 20 80 42 68 C50 80 48 120 42 140" fill="#2E7D32"/>
  <path d="M78 150 C102 135 100 105 78 95 C70 110 72 140 78 150" fill="#2E7D32"/>
</svg>`;

  if (type === "tree") return `
<svg class="${cls}" width="160" height="220" viewBox="0 0 160 220">
  <rect x="76" y="110" width="12" height="90" rx="6" fill="#6D4C41"/>
  <circle cx="80" cy="80" r="32" fill="#2E7D32"/>
  <circle cx="55" cy="95" r="28" fill="#388E3C"/>
  <circle cx="105" cy="95" r="28" fill="#388E3C"/>
  <circle cx="80" cy="55" r="28" fill="#1B5E20"/>
</svg>`;

  if (type === "bush") return `
<svg class="${cls}" width="160" height="120" viewBox="0 0 160 120">
  <circle cx="40" cy="70" r="30" fill="#388E3C"/>
  <circle cx="70" cy="60" r="35" fill="#2E7D32"/>
  <circle cx="100" cy="70" r="30" fill="#43A047"/>
  <circle cx="65" cy="85" r="28" fill="#1B5E20"/>
</svg>`;

  if (type === "flower") return `
<svg class="${cls}" width="120" height="200" viewBox="0 0 120 200">
  <rect x="58" y="80" width="4" height="90" fill="#2E7D32"/>
  <circle cx="60" cy="60" r="12" fill="#E53935"/>
  <circle cx="48" cy="60" r="10" fill="#FF7043"/>
  <circle cx="72" cy="60" r="10" fill="#FF7043"/>
</svg>`;
}

function render() {
  const garden = document.getElementById("garden");
  garden.innerHTML = "";

  plants.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "plant";
    div.onclick = () => waterPlant(i);
    div.innerHTML = svgPlant(p.type, p.stage);
    garden.appendChild(div);
  });
}