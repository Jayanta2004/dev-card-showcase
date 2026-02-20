const challenges = [
  {
    correct: [
      "function add(a, b) {",
      "  return a + b;",
      "}"
    ],
    buggy: [
      "function add(a, b) {",
      "  return a + b",
      "}"
    ],
    errorLine: 1
  },
  {
    correct: [
      "for (let i = 0; i < 5; i++) {",
      "  console.log(i);",
      "}"
    ],
    buggy: [
      "for (let i = 0; i < 5; i++)",
      "  console.log(i);",
      "}"
    ],
    errorLine: 0
  }
];

let current = 0;
let solved = false;

const correctCodeEl = document.getElementById("correctCode");
const buggyCodeEl = document.getElementById("buggyCode");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");

function loadChallenge() {
  solved = false;
  resultEl.textContent = "";

  const challenge = challenges[current];
  correctCodeEl.innerHTML = "";
  buggyCodeEl.innerHTML = "";

  challenge.correct.forEach(line => {
    correctCodeEl.innerHTML += `<span class="line">${line}</span>\n`;
  });

  challenge.buggy.forEach((line, index) => {
    const span = document.createElement("span");
    span.className = "line";
    span.textContent = line;

    span.onclick = () => checkAnswer(index, span);
    buggyCodeEl.appendChild(span);
    buggyCodeEl.appendChild(document.createTextNode("\n"));
  });
}

function checkAnswer(index, element) {
  if (solved) return;

  const errorLine = challenges[current].errorLine;

  if (index === errorLine) {
    element.classList.add("error-line");
    resultEl.textContent = "✅ Correct! You spotted the syntax error.";
    solved = true;
  } else {
    element.classList.add("correct-line");
    resultEl.textContent = "❌ Not this one. Try again!";
  }
}

nextBtn.onclick = () => {
  current = (current + 1) % challenges.length;
  loadChallenge();
};

loadChallenge();
