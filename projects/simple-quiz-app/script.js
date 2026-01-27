const quizData = [
  {
    question: "Which language is used for web development?",
    options: ["Python", "HTML", "C++", "Java"],
    answer: 1
  },
  {
    question: "Which symbol is used for comments in JavaScript?",
    options: ["<!-- -->", "//", "#", "**"],
    answer: 1
  },
  {
    question: "Which company owns GitHub?",
    options: ["Google", "Facebook", "Microsoft", "Amazon"],
    answer: 2
  }
];

let currentQuestion = 0;
let score = 0;
let selectedOption = null;

const questionEl = document.getElementById("question");
const scoreEl = document.getElementById("score");
const optionButtons = document.querySelectorAll(".options button");

function loadQuestion() {
  const q = quizData[currentQuestion];
  questionEl.textContent = q.question;

  optionButtons.forEach((btn, index) => {
    btn.textContent = q.options[index];
    btn.classList.remove("selected");
  });

  selectedOption = null;
  scoreEl.textContent = "";
}

function selectAnswer(index) {
  selectedOption = index;

  optionButtons.forEach(btn => btn.classList.remove("selected"));
  optionButtons[index].classList.add("selected");
}

function nextQuestion() {
  if (selectedOption === null) {
    alert("Please select an option!");
    return;
  }

  optionButtons.forEach((btn, index) => {
    if (index === quizData[currentQuestion].answer) {
      btn.style.backgroundColor = "#22c55e"; // correct
      btn.style.color = "white";
    } else if (index === selectedOption) {
      btn.style.backgroundColor = "#ef4444"; // wrong
      btn.style.color = "white";
    }
  });

  setTimeout(() => {
    if (selectedOption === quizData[currentQuestion].answer) {
      score++;
    }

    currentQuestion++;

    if (currentQuestion < quizData.length) {
      loadQuestion();
    } else {
      questionEl.textContent = "🎉 Quiz Completed!";
      document.querySelector(".options").style.display = "none";
      document.getElementById("nextBtn").style.display = "none";
      scoreEl.textContent = `Your Score: ${score} / ${quizData.length}`;
    }
  }, 700);
}

loadQuestion();