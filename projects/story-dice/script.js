const themeToggle = document.getElementById("theme-toggle");
const rollAllBtn = document.getElementById("roll-all");
const copyBtn = document.getElementById("copy-prompt");
const promptOutput = document.getElementById("prompt-output");
const promptHistory = document.getElementById("prompt-history");

let darkMode = false;
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  themeToggle.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Dice options
const diceOptions = {
  character: ["Hero", "Villain", "Wizard", "Alien", "Detective", "Robot", "Pirate", "Teacher", "Monster", "Princess"],
  setting: ["Forest", "City", "Space Station", "Beach", "Desert", "Castle", "School", "Underwater", "Haunted House", "Cave"],
  conflict: ["Lost Item", "Race Against Time", "Betrayal", "Monster Attack", "Secret Revealed", "Survival", "Escape", "Rescue", "Mystery", "Challenge"],
  twist: ["Unexpected Ally", "Time Travel", "Magic Appears", "Double Agent", "Secret Identity", "Sudden Disaster", "Treasure Found", "Villain Wins", "Plot Twist", "Hidden Truth"]
};

// Roll a single die
function rollDie(type) {
  const options = diceOptions[type];
  const value = options[Math.floor(Math.random()*options.length)];
  document.querySelector(`.dice-card[data-die="${type}"] .dice-value`).textContent = value;
  return value;
}

// Roll all dice
function rollAllDice() {
  const character = rollDie("character");
  const setting = rollDie("setting");
  const conflict = rollDie("conflict");
  const twist = rollDie("twist");
  const prompt = `Character: ${character}, Setting: ${setting}, Conflict: ${conflict}, Twist: ${twist}`;
  promptOutput.textContent = prompt;

  // Add to history
  const historyDiv = document.createElement("div");
  historyDiv.textContent = prompt;
  promptHistory.prepend(historyDiv);
}

// Add event listeners to roll buttons
document.querySelectorAll(".roll-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.parentElement.dataset.die;
    const value = rollDie(type);

    // Update prompt output (combine all current dice)
    const character = document.querySelector(`.dice-card[data-die="character"] .dice-value`).textContent;
    const setting = document.querySelector(`.dice-card[data-die="setting"] .dice-value`).textContent;
    const conflict = document.querySelector(`.dice-card[data-die="conflict"] .dice-value`).textContent;
    const twist = document.querySelector(`.dice-card[data-die="twist"] .dice-value`).textContent;
    const prompt = `Character: ${character}, Setting: ${setting}, Conflict: ${conflict}, Twist: ${twist}`;
    promptOutput.textContent = prompt;
  });
});

// Roll all dice button
rollAllBtn.addEventListener("click", rollAllDice);

// Copy prompt
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(promptOutput.textContent);
  alert("Prompt copied to clipboard!");
});