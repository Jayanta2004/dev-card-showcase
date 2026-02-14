const questions = [
  "I enjoy trying new experiences.",
  "I prefer planning over spontaneity.",
  "I feel energized around people.",
  "I trust logic more than emotions.",
  "I stay calm under pressure."
];

let current = 0;
let score = 0;

const questionEl = document.getElementById("question");
const resultEl = document.getElementById("result");
const typeEl = document.getElementById("personalityType");
const descEl = document.getElementById("description");

questionEl.textContent = questions[current];

function answer(value) {
  score += value;
  current++;

  if (current < questions.length) {
    questionEl.textContent = questions[current];
  } else {
    showResult();
  }
}

function showResult() {
  document.querySelector(".card").classList.add("hidden");
  resultEl.classList.remove("hidden");

  if (score >= 2) {
    typeEl.textContent = "🌟 Explorer";
    descEl.textContent =
      "You are curious, open-minded, and enjoy embracing change and challenges.";
  } else if (score >= 0) {
    typeEl.textContent = "⚖️ Thinker";
    descEl.textContent =
      "You balance logic and emotion well and prefer thoughtful decision-making.";
  } else {
    typeEl.textContent = "🛡️ Stabilizer";
    descEl.textContent =
      "You value structure, reliability, and emotional consistency.";
  }
}

function restart() {
  current = 0;
  score = 0;
  questionEl.textContent = questions[current];
  resultEl.classList.add("hidden");
  document.querySelector(".card").classList.remove("hidden");
}
