const questions = [
    {
      question: "Which language runs in a web browser?",
      answers: [
        { text: "Java", correct: false },
        { text: "C", correct: false },
        { text: "Python", correct: false },
        { text: "JavaScript", correct: true }
      ]
    },
    {
      question: "What does CSS stand for?",
      answers: [
        { text: "Central Style Sheets", correct: false },
        { text: "Cascading Style Sheets", correct: true },
        { text: "Computer Style Sheets", correct: false },
        { text: "Creative Style System", correct: false }
      ]
    },
    {
      question: "Which HTML tag is used for JavaScript?",
      answers: [
        { text: "<script>", correct: true },
        { text: "<js>", correct: false },
        { text: "<javascript>", correct: false },
        { text: "<code>", correct: false }
      ]
    }
  ];
  
  const questionEl = document.getElementById("question");
  const answersEl = document.getElementById("answers");
  const nextBtn = document.getElementById("nextBtn");
  const quizEl = document.getElementById("quiz");
  const resultEl = document.getElementById("result");
  const scoreEl = document.getElementById("score");
  const restartBtn = document.getElementById("restartBtn");
  
  let currentQuestionIndex = 0;
  let score = 0;
  
  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    quizEl.classList.remove("hidden");
    resultEl.classList.add("hidden");
    nextBtn.textContent = "Next";
    showQuestion();
  }
  
  function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    questionEl.textContent = currentQuestion.question;
  
    currentQuestion.answers.forEach(answer => {
      const button = document.createElement("button");
      button.textContent = answer.text;
      if (answer.correct) {
        button.dataset.correct = "true";
      }
      button.addEventListener("click", selectAnswer);
      answersEl.appendChild(button);
    });
  }
  
  function resetState() {
    nextBtn.style.display = "none";
    while (answersEl.firstChild) {
      answersEl.removeChild(answersEl.firstChild);
    }
  }
  
  function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
  
    if (isCorrect) {
      selectedBtn.classList.add("correct");
      score++;
    } else {
      selectedBtn.classList.add("wrong");
    }
  
    Array.from(answersEl.children).forEach(button => {
      button.disabled = true;
      if (button.dataset.correct === "true") {
        button.classList.add("correct");
      }
    });
  
    nextBtn.style.display = "block";
  }
  
  function showResult() {
    quizEl.classList.add("hidden");
    resultEl.classList.remove("hidden");
    scoreEl.textContent = `${score} / ${questions.length}`;
  }
  
  nextBtn.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showResult();
    }
  });
  
  restartBtn.addEventListener("click", startQuiz);
  
  startQuiz();
  