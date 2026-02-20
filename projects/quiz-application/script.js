const quizData = {
  Math: {
    easy: [
      { q: "5 + 7 = ?", options: ["10", "12", "14"], answer: "12" },
      { q: "9 − 3 = ?", options: ["5", "6", "7"], answer: "6" },
      { q: "Square of 5?", options: ["10", "20", "25"], answer: "25" },
      { q: "10 ÷ 2 = ?", options: ["3", "5", "8"], answer: "5" }
    ],
    medium: [
      { q: "12 × 8 = ?", options: ["96", "84", "88"], answer: "96" },
      { q: "√144 = ?", options: ["10", "12", "14"], answer: "12" },
      { q: "15% of 200 = ?", options: ["20", "30", "40"], answer: "30" },
      { q: "LCM of 4 and 6?", options: ["12", "24", "8"], answer: "12" }
    ],
    hard: [
      { q: "Value of π (approx)?", options: ["3.12", "3.14", "3.41"], answer: "3.14" },
      { q: "x + 5 = 12, x = ?", options: ["5", "7", "9"], answer: "7" },
      { q: "Area of circle with r=7?", options: ["154", "144", "164"], answer: "154" },
      { q: "Simplify: 2³ × 2²", options: ["16", "32", "64"], answer: "32" }
    ]
  },

  Programming: {
    easy: [
      { q: "HTML is used for?", options: ["Styling", "Structure", "Logic"], answer: "Structure" },
      { q: "JS keyword to declare variable?", options: ["var", "int", "define"], answer: "var" },
      { q: "CSS is used for?", options: ["Logic", "Styling", "Database"], answer: "Styling" },
      { q: "Which tag creates a link?", options: ["<a>", "<p>", "<div>"], answer: "<a>" }
    ],
    medium: [
      { q: "Which is NOT a JS datatype?", options: ["Boolean", "Float", "Undefined"], answer: "Float" },
      { q: "CSS stands for?", options: ["Creative Style System", "Cascading Style Sheets"], answer: "Cascading Style Sheets" },
      { q: "Which symbol is used for comments in JS?", options: ["//", "##", "<!--"], answer: "//" },
      { q: "Which method adds item to array?", options: ["push()", "pop()", "shift()"], answer: "push()" }
    ],
    hard: [
      { q: "Which method converts JSON to object?", options: ["JSON.parse()", "JSON.stringify()"], answer: "JSON.parse()" },
      { q: "Which keyword stops a loop?", options: ["stop", "break", "exit"], answer: "break" },
      { q: "Which scope is default in JS?", options: ["Block", "Global", "Local"], answer: "Global" },
      { q: "Which operator checks value & type?", options: ["==", "===", "="], answer: "===" }
    ]
  },

  General: {
    easy: [
      { q: "Capital of France?", options: ["Rome", "Paris", "Berlin"], answer: "Paris" },
      { q: "National animal of India?", options: ["Lion", "Tiger", "Elephant"], answer: "Tiger" },
      { q: "How many days in a week?", options: ["5", "7", "10"], answer: "7" },
      { q: "Which planet do we live on?", options: ["Mars", "Earth", "Venus"], answer: "Earth" }
    ],
    medium: [
      { q: "Largest planet?", options: ["Earth", "Jupiter", "Mars"], answer: "Jupiter" },
      { q: "Fastest land animal?", options: ["Tiger", "Cheetah", "Horse"], answer: "Cheetah" },
      { q: "Who wrote Ramayana?", options: ["Valmiki", "Ved Vyasa", "Kalidasa"], answer: "Valmiki" },
      { q: "Which gas do plants absorb?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen"], answer: "Carbon Dioxide" }
    ],
    hard: [
      { q: "Who developed relativity?", options: ["Newton", "Einstein"], answer: "Einstein" },
      { q: "SI unit of force?", options: ["Pascal", "Newton", "Joule"], answer: "Newton" },
      { q: "Which year did WW2 end?", options: ["1942", "1945", "1950"], answer: "1945" },
      { q: "Smallest prime number?", options: ["0", "1", "2"], answer: "2" }
    ]
  }
};

/* ---------------- STATE ---------------- */
const topics = Object.keys(quizData);
let topic = topics[Math.floor(Math.random() * topics.length)];
let difficulty = "easy";
let score = 0;
let index = 0;
const TOTAL = 10;
let currentQuestion;

const usedQuestions = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set()
};

/* ---------------- DOM ---------------- */
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const progressFill = document.getElementById("progressFill");
const countEl = document.getElementById("count");
const difficultyEl = document.getElementById("difficulty");
const topicEl = document.getElementById("topic");

/* ---------------- LOGIC ---------------- */
function getNextQuestion(pool, level) {
  if (usedQuestions[level].size === pool.length) {
    usedQuestions[level].clear();
  }

  let q;
  do {
    q = pool[Math.floor(Math.random() * pool.length)];
  } while (usedQuestions[level].has(q));

  usedQuestions[level].add(q);
  return q;
}

function loadQuestion() {
  optionsEl.innerHTML = "";
  nextBtn.disabled = true;

  const pool = quizData[topic][difficulty];
  currentQuestion = getNextQuestion(pool, difficulty);

  questionEl.textContent = currentQuestion.q;
  topicEl.textContent = topic;
  difficultyEl.textContent = difficulty.toUpperCase();
  countEl.textContent = `${index + 1} / ${TOTAL}`;
  progressFill.style.width = `${((index + 1) / TOTAL) * 100}%`;

  currentQuestion.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, opt);
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(btn, selected) {
  document.querySelectorAll(".options button").forEach(b => b.disabled = true);

  if (selected === currentQuestion.answer) {
    btn.classList.add("correct");
    score++;
    if (difficulty === "easy") difficulty = "medium";
    else if (difficulty === "medium") difficulty = "hard";
  } else {
    btn.classList.add("wrong");
    if (difficulty === "hard") difficulty = "medium";
    else if (difficulty === "medium") difficulty = "easy";
  }

  nextBtn.disabled = false;
}

nextBtn.onclick = () => {
  index++;
  if (index < TOTAL) {
    loadQuestion();
  } else {
    questionEl.textContent = `🎉 Final Score: ${score} / ${TOTAL}`;
    optionsEl.innerHTML = "";
    nextBtn.style.display = "none";
    progressFill.style.width = "100%";
  }
};

loadQuestion();
