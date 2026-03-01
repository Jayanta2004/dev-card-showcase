const questions = [
  "How often do you feel mentally drained?",
  "How overwhelmed do your tasks feel?",
  "How tense does your body feel today?",
  "How hard is it to relax lately?",
  "How pressured do you feel overall?"
];

let index = 0;
let total = 0;

const questionEl = document.getElementById("question");
const quizEl = document.getElementById("quiz");
const resultEl = document.getElementById("result");
const levelEl = document.getElementById("level");
const messageEl = document.getElementById("message");
const ringEl = document.querySelector(".ring");

questionEl.textContent = questions[index];

function answer(value) {
  total += value;
  index++;

  if (index < questions.length) {
    questionEl.textContent = questions[index];
  } else {
    showResult();
  }
}

function showResult() {
  quizEl.classList.add("hidden");
  resultEl.classList.remove("hidden");

  const percent = Math.round((total / (questions.length * 5)) * 100);
  const deg = (percent / 100) * 360;

  ringEl.style.background = `conic-gradient(
    #00ffd5 0deg,
    #ff00cc ${deg}deg,
    rgba(255,255,255,0.2) ${deg}deg
  )`;

  if (percent < 35) {
    levelEl.textContent = "Low Stress 😌";
    messageEl.textContent =
      "You seem balanced and calm. Keep protecting your energy.";
  } else if (percent < 70) {
    levelEl.textContent = "Moderate Stress 😐";
    messageEl.textContent =
      "Some pressure is showing. Small breaks can make a big difference.";
  } else {
    levelEl.textContent = "High Stress 😫";
    messageEl.textContent =
      "You're carrying a lot right now. Slowing down could really help.";
  }
}

function restart() {
  index = 0;
  total = 0;
  questionEl.textContent = questions[index];
  quizEl.classList.remove("hidden");
  resultEl.classList.add("hidden");
}
