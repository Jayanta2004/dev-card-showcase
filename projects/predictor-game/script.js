const sequenceEl = document.getElementById("sequence");
const inputEl = document.getElementById("answerInput");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");

let score = 0;
let level = 1;
let correct = 0;

// ================= SEQUENCES =================
const patterns = [
  () => {
    const a = rand(1, 10), d = rand(2, 5);
    return seq(a, d, 4);
  },
  () => {
    const a = rand(1, 5), r = rand(2, 3);
    return seq(a, r, 4, true);
  },
  () => {
    let x = rand(1, 5), y = rand(1, 5);
    return {
      list: [x, y, x + y, y + x + y],
      answer: (x + y) * 2 + y
    };
  },
  () => {
    const a = rand(1, 10), b = rand(20, 30);
    return { list: [a, b, a, b], answer: a };
  }
];

function seq(start, step, len, geo = false) {
  const list = [];
  for (let i = 0; i < len; i++) {
    list.push(geo ? start * step ** i : start + step * i);
  }
  return {
    list,
    answer: geo ? list[len - 1] * step : list[len - 1] + step
  };
}

// ================= GAME =================
function newRound() {
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  inputEl.value = "";
  choicesEl.innerHTML = "";

  const p = patterns[rand(0, patterns.length - 1)]();
  correct = p.answer;
  sequenceEl.textContent = p.list.join("   ") + "   ?";

  if (Math.random() > 0.5) {
    inputEl.style.display = "block";
  } else {
    inputEl.style.display = "none";
    makeChoices();
  }
}

function makeChoices() {
  const set = new Set([correct]);
  while (set.size < 4) set.add(correct + rand(-10, 10));

  [...set].sort(() => Math.random() - 0.5).forEach(v => {
    const b = document.createElement("button");
    b.textContent = v;
    b.className = "choice-btn";
    b.onclick = () => check(v);
    choicesEl.appendChild(b);
  });
}

function check(val) {
  const answer = val ?? Number(inputEl.value);
  if (answer === correct) {
    feedbackEl.textContent = "Correct";
    feedbackEl.classList.add("correct");
    score++;
    if (score % 5 === 0) level++;
  } else {
    feedbackEl.textContent = `Incorrect • ${correct}`;
    feedbackEl.classList.add("wrong");
  }
  scoreEl.textContent = `Score ${score}`;
  levelEl.textContent = `Level ${level}`;
  setTimeout(newRound, 1200);
}

document.getElementById("submitBtn").onclick = () => check();

function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

newRound();
