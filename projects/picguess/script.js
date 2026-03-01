const levels = [
    { emojis: ["🐝","🍯","🐻"], answer: "honey" },
    { emojis: ["🌧","🌈","☁"], answer: "rain" },
    { emojis: ["🐍","💻","🐧"], answer: "python" },
    { emojis: ["🔥","🌋","🌡"], answer: "heat" },
    { emojis: ["❄","⛄","🌬"], answer: "cold" },
    { emojis: ["🌞","🏖","🕶"], answer: "summer" },
    { emojis: ["🎄","🎅","🎁"], answer: "christmas" },
    { emojis: ["🐟","🌊","🏊"], answer: "water" },
    { emojis: ["📚","🎓","🏫"], answer: "school" },
    { emojis: ["🚀","🌌","👨‍🚀"], answer: "space" }
];

let currentLevel = 0;
let score = 0;
let lives = 3;

const imageContainer = document.getElementById("imageContainer");
const input = document.getElementById("answerInput");
const button = document.getElementById("submitBtn");
const restartBtn = document.getElementById("restartBtn");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const levelDisplay = document.getElementById("level");

function loadLevel() {
    imageContainer.innerHTML = "";
    input.value = "";
    message.textContent = "";
    levelDisplay.textContent = currentLevel + 1;

    levels[currentLevel].emojis.forEach(emoji => {
        const box = document.createElement("div");
        box.className = "emoji-box";
        box.textContent = emoji;
        imageContainer.appendChild(box);
    });
}

button.addEventListener("click", () => {
    const userAnswer = input.value.toLowerCase().trim();

    if (userAnswer === levels[currentLevel].answer) {
        score += 10;
        scoreDisplay.textContent = score;
        message.textContent = "🎉 Correct!";
        currentLevel++;

        if (currentLevel >= levels.length) {
            message.textContent = "🏆 You Completed All Levels!";
            button.disabled = true;
            return;
        }

        setTimeout(loadLevel, 1000);
    } else {
        lives--;
        livesDisplay.textContent = lives;
        message.textContent = "❌ Wrong!";
        imageContainer.classList.add("shake");

        setTimeout(() => {
            imageContainer.classList.remove("shake");
        }, 400);

        if (lives <= 0) {
            message.textContent = "💀 Game Over!";
            button.disabled = true;
        }
    }
});

restartBtn.addEventListener("click", () => {
    currentLevel = 0;
    score = 0;
    lives = 3;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    button.disabled = false;
    loadLevel();
});

loadLevel();