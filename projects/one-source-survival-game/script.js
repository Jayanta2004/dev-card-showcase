let day = 1;
let energy = 50;
let shelterLevel = 0;
let techLevel = 0;

const dayEl = document.getElementById("day");
const energyEl = document.getElementById("energy");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");

function updateUI() {
  dayEl.textContent = day;
  energyEl.textContent = energy;

  if (energy > 60) statusEl.textContent = "Thriving";
  else if (energy > 30) statusEl.textContent = "Stable";
  else statusEl.textContent = "Critical";

  if (energy <= 0) {
    alert("Colony Collapsed!");
    location.reload();
  }
}

function log(message) {
  const p = document.createElement("p");
  p.textContent = "Day " + day + ": " + message;
  logEl.prepend(p);
}

function buildShelter() {
  if (energy >= 15) {
    energy -= 15;
    shelterLevel++;
    log("Shelter improved. Protection increased.");
  }
  updateUI();
}

function growFood() {
  if (energy >= 10) {
    energy -= 10;
    energy += 15;
    log("Food grown successfully. Energy restored.");
  }
  updateUI();
}

function explore() {
  if (energy >= 20) {
    energy -= 20;

    let chance = Math.random();
    if (chance > 0.6) {
      energy += 30;
      log("Exploration success! Found energy source.");
    } else {
      log("Exploration failed. No gain.");
    }
  }
  updateUI();
}

function rest() {
  energy += 10;
  log("Colony rested. Energy restored.");
  updateUI();
}

function nextDay() {
  day++;
  energy += 5 + shelterLevel;

  if (Math.random() > 0.7) {
    energy -= 10;
    log("Storm hit the colony. Energy lost.");
  }

  updateUI();
}

updateUI();