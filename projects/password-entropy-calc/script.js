const input = document.getElementById("passwordInput");
const lengthEl = document.getElementById("length");
const charsetEl = document.getElementById("charset");
const entropyEl = document.getElementById("entropy");
const crackTimeEl = document.getElementById("crackTime");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");
const toggleBtn = document.getElementById("toggleBtn");

input.addEventListener("input", calculateEntropy);

toggleBtn.addEventListener("click", () => {
  input.type = input.type === "password" ? "text" : "password";
});

function calculateEntropy() {
  const password = input.value;
  const length = password.length;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  let entropy = 0;
  if (length > 0 && poolSize > 0) {
    entropy = length * Math.log2(poolSize);
  }

  updateUI(length, poolSize, entropy);
}

function updateUI(length, poolSize, entropy) {
  lengthEl.textContent = length;
  charsetEl.textContent = poolSize;
  entropyEl.textContent = entropy.toFixed(2);

  let strength = "Very Weak";
  let percent = 0;
  let color = "red";

  if (entropy > 80) {
    strength = "Very Strong";
    percent = 100;
    color = "#00ff88";
  } else if (entropy > 60) {
    strength = "Strong";
    percent = 75;
    color = "#00bfff";
  } else if (entropy > 40) {
    strength = "Moderate";
    percent = 50;
    color = "orange";
  } else if (entropy > 20) {
    strength = "Weak";
    percent = 25;
    color = "yellow";
  }

  strengthFill.style.width = percent + "%";
  strengthFill.style.background = color;
  strengthText.textContent = "Strength: " + strength;

  crackTimeEl.textContent = estimateCrackTime(entropy);
}

function estimateCrackTime(entropy) {
  const guessesPerSecond = 1e10;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond;

  if (seconds < 60) return "Instantly";
  if (seconds < 3600) return Math.floor(seconds / 60) + " minutes";
  if (seconds < 86400) return Math.floor(seconds / 3600) + " hours";
  if (seconds < 31536000) return Math.floor(seconds / 86400) + " days";

  return Math.floor(seconds / 31536000) + " years";
}