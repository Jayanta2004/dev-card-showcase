let truths = [
  "What is your biggest fear?",
  "Have you ever lied to your best friend?",
  "Who was your first crush?",
  "What habit do you want to change?",
  "What is your hidden talent?"
];

let dares = [
  "Do 10 push-ups 💪",
  "Sing your favorite song 🎤",
  "Do a silly dance 💃",
  "Speak in an accent for 30 seconds",
  "Text someone 'I miss you' 😄"
];

let usedTruths = [];
let usedDares = [];
let playCount = 0;

const resultCard = document.getElementById("resultCard");
const playCounter = document.getElementById("playCount");
const clickSound = document.getElementById("clickSound");

function getRandomItem(arr, usedArr) {
  if (usedArr.length === arr.length) {
    usedArr.length = 0; // reset when all used
  }

  let item;
  do {
    item = arr[Math.floor(Math.random() * arr.length)];
  } while (usedArr.includes(item));

  usedArr.push(item);
  return item;
}

function generateTruth() {
  playSound();
  animateCard("🤫 Truth: " + getRandomItem(truths, usedTruths));
}

function generateDare() {
  playSound();
  animateCard("🔥 Dare: " + getRandomItem(dares, usedDares));
}

function animateCard(text) {
  resultCard.classList.remove("spinner");
  void resultCard.offsetWidth;
  resultCard.classList.add("spinner");

  resultCard.textContent = "🎲 Picking...";
  
  setTimeout(() => {
    resultCard.textContent = text;
    playCount++;
    playCounter.textContent = playCount;
  }, 600);
}

function addTruth() {
  const input = document.getElementById("customInput");
  if (input.value.trim() !== "") {
    truths.push(input.value);
    input.value = "";
    alert("Truth added!");
  }
}

function addDare() {
  const input = document.getElementById("customInput");
  if (input.value.trim() !== "") {
    dares.push(input.value);
    input.value = "";
    alert("Dare added!");
  }
}

function resetGame() {
  usedTruths = [];
  usedDares = [];
  playCount = 0;
  playCounter.textContent = 0;
  resultCard.textContent = "Game Reset! Click to play.";
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function playSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}