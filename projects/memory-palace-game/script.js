
const startBtn = document.getElementById("start-btn");
const difficultySelect = document.getElementById("difficulty");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const room = document.getElementById("room");
const timerEl = document.getElementById("timer");
const phaseText = document.getElementById("phase-text");
const scoreText = document.getElementById("score-text");

const picker = document.getElementById("picker");
const pickerItems = document.getElementById("picker-items");


let items = [];
let correctAnswers = {};
let score = 0;
let timeLeft = 30;
let activeSlot = null;

const itemPool = ["🍎", "📕", "🔑", "🕯️", "🪴", "🎧", "🧸", "🖊️"];


startBtn.addEventListener("click", startGame);


function startGame() {
  startScreen.classList.remove("active");
  gameScreen.classList.add("active");

  setupGame();
  startMemorization();
}

function setupGame() {
  room.innerHTML = "";
  correctAnswers = {};
  score = 0;
  timeLeft = 30;
  timerEl.textContent = timeLeft;

  
  const diff = difficultySelect.value;
  const count = diff === "easy" ? 4 : diff === "medium" ? 6 : 8;

  items = shuffle(itemPool).slice(0, count);

  items.forEach((item, index) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.textContent = item;
    slot.dataset.index = index;
    room.appendChild(slot);

    correctAnswers[index] = item;
  });
}


function startMemorization() {
  phaseText.textContent = "Memorize";

  const timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft === 0) {
      clearInterval(timer);
      startRecall();
    }
  }, 1000);
}


function startRecall() {
  phaseText.textContent = "Recall";

  room.querySelectorAll(".slot").forEach(slot => {
    slot.textContent = "";
    slot.addEventListener("click", () => openPicker(slot));
  });
}

function openPicker(slot) {
  activeSlot = slot;
  picker.classList.remove("hidden");
  pickerItems.innerHTML = "";

  items.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item;
    btn.addEventListener("click", () => selectItem(item));
    pickerItems.appendChild(btn);
  });
}

function selectItem(selectedItem) {
  const correctItem = correctAnswers[activeSlot.dataset.index];

  if (selectedItem === correctItem) {
    activeSlot.classList.add("correct");
    score++;
  } else {
    activeSlot.classList.add("wrong");
  }

  activeSlot.style.pointerEvents = "none";
  picker.classList.add("hidden");

  if (document.querySelectorAll(".slot.correct, .slot.wrong").length === items.length) {
    showResults();
  }
}


function showResults() {
  gameScreen.classList.remove("active");
  resultScreen.classList.add("active");
  scoreText.textContent = `You remembered ${score} out of ${items.length} items correctly.`;
}


function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
