const questions = [
    {
        q: "What is the capital of France?",
        options: ["Berlin", "Paris", "Rome", "Madrid"],
        answer: 1
    },
    {
        q: "2 + 2 × 3 = ?",
        options: ["12", "10", "8", "6"],
        answer: 2
    },
    {
        q: "Which planet is known as the Red Planet?",
        options: ["Earth", "Venus", "Mars", "Jupiter"],
        answer: 2
    },
    {
        q: "What is the square root of 64?",
        options: ["6", "7", "8", "9"],
        answer: 2
    },
    {
        q: "Which language is used for web styling?",
        options: ["HTML", "Python", "CSS", "C++"],
        answer: 2
    },
    {
        q: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
        answer: 1
    },
    {
        q: "What is 15% of 200?",
        options: ["20", "25", "30", "35"],
        answer: 2
    },
    {
        q: "Which gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        answer: 1
    },
    {
        q: "What does CPU stand for?",
        options: [
            "Central Process Unit",
            "Central Processing Unit",
            "Computer Personal Unit",
            "Control Processing Unit"
        ],
        answer: 1
    },
    {
        q: "Which continent is the Sahara Desert located in?",
        options: ["Asia", "Australia", "Africa", "South America"],
        answer: 2
    },
    {
        q: "What is the value of π (approx)?",
        options: ["2.14", "3.14", "4.13", "3.41"],
        answer: 1
    },
    {
        q: "Which data structure uses FIFO?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        answer: 1
    }
];


let current = 0;
let score = 0;
let selected = null;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const confidenceSection = document.getElementById("confidenceSection");
const resultSection = document.getElementById("resultSection");
const finalScore = document.getElementById("finalScore");
const confidenceSlider = document.getElementById("confidence");
const confidenceValue = document.getElementById("confidenceValue");
const feedback = document.getElementById("feedback");

confidenceSlider.oninput = () => {
    confidenceValue.textContent = confidenceSlider.value + "%";
};

function loadQuestion() {
    selected = null;
    confidenceSection.classList.add("hidden");
    resultSection.classList.add("hidden");

    const q = questions[current];
    questionEl.textContent = q.q;
    optionsEl.innerHTML = "";

    q.options.forEach((opt, i) => {
        const btn = document.createElement("div");
        btn.className = "option";
        btn.textContent = opt;
        btn.onclick = () => {
            selected = i;
            confidenceSection.classList.remove("hidden");
        };
        optionsEl.appendChild(btn);
    });
}

document.getElementById("submitConfidence").onclick = () => {
    const confidence = confidenceSlider.value / 100;
    const correct = selected === questions[current].answer;

    let roundScore = 0;
    if (correct) {
        roundScore = Math.round(confidence * 100);
        feedback.textContent = `Correct! You earned ${roundScore} points.`;
    } else {
        roundScore = Math.round(confidence * -100);
        feedback.textContent = `Wrong! You lost ${Math.abs(roundScore)} points.`;
    }

    score += roundScore;

    confidenceSection.classList.add("hidden");
    resultSection.classList.remove("hidden");
};

document.getElementById("nextBtn").onclick = () => {
    current++;
    if (current >= questions.length) {
        showFinal();
    } else {
        loadQuestion();
    }
};

function showFinal() {
    document.getElementById("quizSection").classList.add("hidden");
    resultSection.classList.add("hidden");
    confidenceSection.classList.add("hidden");

    finalScore.classList.remove("hidden");
    document.getElementById("scoreText").textContent =
        `Final Score: ${score}`;

    const high = localStorage.getItem("highScore") || 0;
    if (score > high) {
        localStorage.setItem("highScore", score);
    }
}

loadQuestion();
