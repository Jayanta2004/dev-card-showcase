// Elements
const startBtn = document.getElementById("startBtn");
const wordInput = document.getElementById("wordInput");
const submitBtn = document.getElementById("submitBtn");
const wordHistory = document.getElementById("wordHistory");
const currentPlayerEl = document.getElementById("currentPlayer");
const requiredLetterEl = document.getElementById("requiredLetter");
const messageEl = document.getElementById("message");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");

const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");

// Game state
let usedWords = [];
let currentPlayer = 1;
let lastLetter = '';
let score1 = 0;
let score2 = 0;
let gameActive = false;

// Start Game
startBtn.addEventListener("click", () => {
  resetGame();
});

function resetGame() {
  usedWords = [];
  lastLetter = '';
  score1 = 0;
  score2 = 0;
  currentPlayer = 1;
  gameActive = true;

  updateScoreboard();
  wordHistory.innerHTML = '';
  currentPlayerEl.textContent = "Player 1";
  requiredLetterEl.textContent = "-";
  messageEl.textContent = "";

  wordInput.disabled = false;
  submitBtn.disabled = false;
  wordInput.value = "";
  wordInput.focus();
}

// Submit word
submitBtn.addEventListener("click", () => {
  if (!gameActive) return;
  const word = wordInput.value.trim().toLowerCase();
  if (!word) return;

  // Check already used
  if (usedWords.includes(word)) {
    messageEl.textContent = "❌ Word already used!";
    return;
  }

  // Check first letter
  if (lastLetter && word[0] !== lastLetter) {
    messageEl.textContent = `❌ Word must start with '${lastLetter}'`;
    return;
  }

  addWord(word);
  wordInput.value = "";

  // Handle next turn
  if (modeSelect.value === "pvp") {
    switchPlayer();
  } else {
    cpuTurn();
  }
});

// Add word to history
function addWord(word) {
  usedWords.push(word);
  const li = document.createElement("li");
  li.textContent = word;
  wordHistory.appendChild(li);

  lastLetter = word[word.length - 1];
  requiredLetterEl.textContent = lastLetter.toUpperCase();

  // Update score
  if (currentPlayer === 1) score1++;
  else score2++;

  updateScoreboard();
  messageEl.textContent = "";
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  currentPlayerEl.textContent = currentPlayer === 1 ? "Player 1" : "Player 2";
}

// Update scoreboard
function updateScoreboard() {
  score1El.textContent = score1;
  score2El.textContent = score2;
}

// CPU Turn
function cpuTurn() {
  currentPlayerEl.textContent = "CPU";
  wordInput.disabled = true;
  submitBtn.disabled = true;

  setTimeout(() => {
    const cpuWord = generateCPUWord(lastLetter);
    if (cpuWord) {
      addWord(cpuWord);
      currentPlayer = 1;
      currentPlayerEl.textContent = "Player 1";
      wordInput.disabled = false;
      submitBtn.disabled = false;
      wordInput.focus();
    } else {
      messageEl.textContent = "🎉 CPU cannot continue! You win!";
      wordInput.disabled = true;
      submitBtn.disabled = true;
      gameActive = false;
    }
  }, 800); // small delay for realism
}

// Simple CPU word generator
const dictionary = [
  "apple","elephant","tiger","rocket","table","egg","grape",
  "eagle","lion","night","tree","ear","rat","top","panther",
  "ring","giraffe","fish","hat","train","nest","tap","pen",
  "nose","snake","kangaroo","owl","lamp","monkey","yak"
];

function generateCPUWord(startLetter) {
  // Filter dictionary
  const candidates = dictionary.filter(w => w.startsWith(startLetter) && !usedWords.includes(w));

  if (candidates.length === 0) return null; // No valid word left

  // Difficulty logic
  const difficulty = difficultySelect.value;
  if (difficulty === "easy") {
    // Random pick
    return candidates[Math.floor(Math.random() * candidates.length)];
  } else if (difficulty === "medium") {
    // Pick the shortest word
    return candidates.sort((a,b) => a.length - b.length)[0];
  } else if (difficulty === "hard") {
    // Pick the longest word
    return candidates.sort((a,b) => b.length - a.length)[0];
  }

  return candidates[0];
}