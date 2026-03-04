const categories = [
    {
        name: "Fruits",
        words: ["Apple", "Banana", "Orange", "Mango"]
    },
    {
        name: "Programming Languages",
        words: ["Java", "Python", "C++", "JavaScript"]
    },
    {
        name: "Planets",
        words: ["Earth", "Mars", "Venus", "Jupiter"]
    },
    {
        name: "Sports",
        words: ["Cricket", "Football", "Tennis", "Hockey"]
    }
];

let currentCategory;
let attempts = 3;

const wordGrid = document.getElementById("wordGrid");
const message = document.getElementById("message");
const attemptsDisplay = document.getElementById("attempts");
const restartBtn = document.getElementById("restartBtn");

function startGame() {
    attempts = 3;
    message.textContent = "";
    restartBtn.classList.add("hidden");
    attemptsDisplay.textContent = "Attempts Left: " + attempts;

    wordGrid.innerHTML = "";

    currentCategory = categories[Math.floor(Math.random() * categories.length)];

    currentCategory.words.forEach(word => {
        const div = document.createElement("div");
        div.classList.add("word");
        div.textContent = word;
        wordGrid.appendChild(div);
    });
}

document.getElementById("submitBtn").addEventListener("click", function() {
    const guess = document.getElementById("guessInput").value.trim();

    if (!guess) return;

    if (guess.toLowerCase() === currentCategory.name.toLowerCase()) {
        message.textContent = "🎉 Correct! The category is " + currentCategory.name;
        message.style.color = "lightgreen";
        restartBtn.classList.remove("hidden");
    } else {
        attempts--;
        attemptsDisplay.textContent = "Attempts Left: " + attempts;
        message.textContent = "❌ Wrong Guess!";
        message.style.color = "salmon";

        if (attempts === 0) {
            message.textContent = "💀 You Lost! Correct answer: " + currentCategory.name;
            restartBtn.classList.remove("hidden");
        }
    }

    document.getElementById("guessInput").value = "";
});

restartBtn.addEventListener("click", startGame);

startGame();