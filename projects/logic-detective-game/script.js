let level = 1;
let score = 0;
let lives = 3;
let timeLeft = 30;
let timerInterval;

const rules = [
    {
        text: "multiply by 2",
        generate: (x) => x * 2
    },
    {
        text: "add 5",
        generate: (x) => x + 5
    },
    {
        text: "square the number",
        generate: (x) => x * x
    },
    {
        text: "multiply by 3 and add 1",
        generate: (x) => x * 3 + 1
    },
    {
        text: "subtract 4",
        generate: (x) => x - 4
    }
];

const cluesBox = document.getElementById("clues");
const messageBox = document.getElementById("message");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timerDisplay = document.getElementById("timer");

document.getElementById("submitBtn").addEventListener("click", checkAnswer);
document.getElementById("nextBtn").addEventListener("click", nextLevel);

function generateClues() {
    cluesBox.innerHTML = "";
    const currentRule = rules[level - 1];

    for (let i = 0; i < 4; i++) {
        let input = Math.floor(Math.random() * 10) + 1;
        let output = currentRule.generate(input);
        cluesBox.innerHTML += `${input} → ${output}<br>`;
    }
}

function checkAnswer() {
    let userInput = document.getElementById("answer").value.toLowerCase();
    let correctRule = rules[level - 1].text;

    if (userInput.includes(correctRule)) {
        score += 10;
        scoreDisplay.textContent = score;
        messageBox.style.color = "lightgreen";
        messageBox.textContent = "✅ Correct! You cracked the rule!";
        clearInterval(timerInterval);
    } else {
        lives--;
        livesDisplay.textContent = lives;
        messageBox.style.color = "red";
        messageBox.textContent = "❌ Wrong! Try again detective...";
        if (lives === 0) {
            endGame();
        }
    }
}

function nextLevel() {
    if (level < rules.length) {
        level++;
        levelDisplay.textContent = level;
        document.getElementById("answer").value = "";
        messageBox.textContent = "";
        resetTimer();
        generateClues();
    } else {
        messageBox.style.color = "cyan";
        messageBox.textContent = "🎉 You completed all levels!";
        clearInterval(timerInterval);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            lives--;
            livesDisplay.textContent = lives;
            resetTimer();
            if (lives === 0) {
                endGame();
            }
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    timerDisplay.textContent = timeLeft;
    startTimer();
}

function endGame() {
    clearInterval(timerInterval);
    messageBox.style.color = "orange";
    messageBox.textContent = "💀 Game Over! Refresh to play again.";
}

generateClues();
startTimer();