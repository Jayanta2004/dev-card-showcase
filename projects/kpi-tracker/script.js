const kpiDashboard = document.getElementById("kpi-dashboard");
const addKpiBtn = document.getElementById("add-kpi-btn");
const kpiNameInput = document.getElementById("kpi-name");
const kpiTargetInput = document.getElementById("kpi-target");
const themeToggle = document.getElementById("theme-toggle");
let darkMode = false;

let kpis = JSON.parse(localStorage.getItem("kpis")) || [];

// Function to render KPI cards
function renderKpis() {
  kpiDashboard.innerHTML = "";
  kpis.forEach((kpi, index) => {
    const card = document.createElement("div");
    card.classList.add("kpi-card");

    card.innerHTML = `
      <h3>${kpi.name}</h3>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${kpi.value}%"></div>
      </div>
      <input type="number" value="${kpi.value}" max="100" min="0" oninput="updateKpi(${index}, this.value)" />
      <button onclick="removeKpi(${index})">×</button>
    `;
    kpiDashboard.appendChild(card);
  });
}

// Add new KPI
addKpiBtn.addEventListener("click", () => {
  const name = kpiNameInput.value.trim();
  const target = Number(kpiTargetInput.value);
  if (!name || isNaN(target) || target <= 0) return;

  kpis.push({ name, value: 0, target });
  saveKpis();
  renderKpis();
  kpiNameInput.value = "";
  kpiTargetInput.value = "";
});

// Update KPI value
function updateKpi(index, value) {
  value = Math.min(Math.max(Number(value), 0), 100);
  kpis[index].value = value;
  saveKpis();
  renderKpis();
}

// Remove KPI
function removeKpi(index) {
  kpis.splice(index, 1);
  saveKpis();
  renderKpis();
}

// Save to localStorage
function saveKpis() {
  localStorage.setItem("kpis", JSON.stringify(kpis));
}

// Theme toggle
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  themeToggle.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Initial render
renderKpis();