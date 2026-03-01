const themeToggle = document.getElementById("theme-toggle");
const exportBtn = document.getElementById("export-btn");
let darkMode = false;

// Theme toggle
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  themeToggle.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Add item on Enter key
document.querySelectorAll(".swot-input").forEach(input => {
  input.addEventListener("keypress", e => {
    if (e.key === "Enter" && input.value.trim() !== "") {
      addItem(input.dataset.target, input.value.trim());
      input.value = "";
    }
  });
});

// Add item function
function addItem(quadrant, text) {
  const itemsContainer = document.getElementById(`${quadrant}-items`);
  const card = document.createElement("div");
  card.classList.add("item-card");
  card.textContent = text;

  // Double click to edit
  card.addEventListener("dblclick", () => {
    const newText = prompt("Edit item:", card.textContent);
    if (newText !== null && newText.trim() !== "") card.textContent = newText;
  });

  itemsContainer.appendChild(card);
}

// Export SWOT JSON
exportBtn.addEventListener("click", () => {
  const swotData = {
    strengths: Array.from(document.getElementById("strength-items").children).map(c => c.textContent),
    weaknesses: Array.from(document.getElementById("weakness-items").children).map(c => c.textContent),
    opportunities: Array.from(document.getElementById("opportunity-items").children).map(c => c.textContent),
    threats: Array.from(document.getElementById("threat-items").children).map(c => c.textContent)
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(swotData, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "swot.json");
  dlAnchor.click();
});