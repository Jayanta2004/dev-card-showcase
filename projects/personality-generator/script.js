const questions = [
  {
    question: "How do you prefer to spend your free time?",
    options: [
      { text: "Reading or watching movies", type: "Thinker" },
      { text: "Hanging out with friends", type: "Socializer" },
      { text: "Exploring new places", type: "Adventurer" },
      { text: "Building or creating something", type: "Creator" }
    ]
  },
  {
    question: "Which describes you best?",
    options: [
      { text: "Calm and logical", type: "Thinker" },
      { text: "Energetic and talkative", type: "Socializer" },
      { text: "Brave and curious", type: "Adventurer" },
      { text: "Creative and imaginative", type: "Creator" }
    ]
  },
  {
    question: "What motivates you the most?",
    options: [
      { text: "Knowledge", type: "Thinker" },
      { text: "People", type: "Socializer" },
      { text: "Freedom", type: "Adventurer" },
      { text: "Expression", type: "Creator" }
    ]
  },
  {
    question: "Your ideal weekend is?",
    options: [
      { text: "Quiet and peaceful", type: "Thinker" },
      { text: "Party or gathering", type: "Socializer" },
      { text: "Road trip", type: "Adventurer" },
      { text: "Art or music", type: "Creator" }
    ]
  },
  {
    question: "People describe you as?",
    options: [
      { text: "Wise", type: "Thinker" },
      { text: "Friendly", type: "Socializer" },
      { text: "Bold", type: "Adventurer" },
      { text: "Original", type: "Creator" }
    ]
  }
];

let currentQuestion = 0;
let answers = [];

const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const progressBar = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const resultCard = document.getElementById("resultCard");
const questionCard = document.getElementById("questionCard");
const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");
const personalityIcon = document.getElementById("personalityIcon");

function loadQuestion() {
  const q = questions[currentQuestion];
  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";

  q.options.forEach((option, index) => {
    const div = document.createElement("div");
    div.classList.add("option");
    div.textContent = option.text;

    if (answers[currentQuestion] === option.type) {
      div.classList.add("selected");
    }

    div.addEventListener("click", () => selectOption(option.type, div));
    optionsContainer.appendChild(div);
  });

  updateProgress();
}

function selectOption(type, selectedDiv) {
  answers[currentQuestion] = type;

  document.querySelectorAll(".option").forEach(opt => {
    opt.classList.remove("selected");
  });

  selectedDiv.classList.add("selected");
}

nextBtn.addEventListener("click", () => {
  if (!answers[currentQuestion]) {
    alert("Please select an option!");
    return;
  }

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    showResult();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
});

function updateProgress() {
  const percent = ((currentQuestion + 1) / questions.length) * 100;
  progressBar.style.width = percent + "%";
}

function showResult() {
  questionCard.classList.add("hidden");
  document.querySelector(".buttons").classList.add("hidden");
  resultCard.classList.remove("hidden");

  const count = {};
  answers.forEach(type => {
    count[type] = (count[type] || 0) + 1;
  });

  let personality = Object.keys(count).reduce((a, b) =>
    count[a] > count[b] ? a : b
  );

  const descriptions = {
    Thinker: "You are thoughtful, logical, and love deep ideas. You enjoy learning and peaceful environments.",
    Socializer: "You are energetic, friendly, and thrive in social settings. People love your vibe!",
    Adventurer: "You are bold, curious, and always ready for new experiences and challenges.",
    Creator: "You are imaginative, artistic, and love expressing yourself through ideas and art."
  };

  const icons = {
    Thinker: "🧠",
    Socializer: "😄",
    Adventurer: "🌍",
    Creator: "🎨"
  };

  resultTitle.textContent = personality;
  resultDescription.textContent = descriptions[personality];
  personalityIcon.textContent = icons[personality];
}

function restartQuiz() {
  currentQuestion = 0;
  answers = [];
  resultCard.classList.add("hidden");
  questionCard.classList.remove("hidden");
  document.querySelector(".buttons").classList.remove("hidden");
  loadQuestion();
}

loadQuestion();
