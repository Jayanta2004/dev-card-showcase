function updateUI() {
  oxygen.style.width = state.oxygen + "%";
  food.style.width   = state.food + "%";
  water.style.width  = state.water + "%";
  energy.style.width = state.energy + "%";

  document.getElementById("planetName").innerText =
    `Planet ${currentPlanet + 1} / 10 — ${planets[currentPlanet]}`;
}

function log(message) {
  const box = document.getElementById("log");
  const entry = document.createElement("div");
  entry.className = "log-entry";
  const time = new Date().toLocaleTimeString();
  entry.innerHTML = `<span>[${time}]</span>${message}`;
  box.prepend(entry);
}

log("🚀 Colony deployed on Planet 1");
updateUI();
