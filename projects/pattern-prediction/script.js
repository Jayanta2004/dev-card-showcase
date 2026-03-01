const patterns = [
    { seq: "2, 4, 6, 8, ?", ans: "10", hint: "Add 2" },
    { seq: "A, C, E, G, ?", ans: "I", hint: "Skip one letter" },
    { seq: "1, 1, 2, 3, 5, ?", ans: "8", hint: "Fibonacci" },
    { seq: "3, 9, 27, ?", ans: "81", hint: "×3" },
    { seq: "▲ ▲ ▲, ■ ■ ■, ▲ ▲ ▲, ?", ans: "■ ■ ■", hint: "Alternating shapes" },
    { seq: "5, 10, 20, 40, ?", ans: "80", hint: "×2" },
    { seq: "1, 4, 9, 16, ?", ans: "25", hint: "Squares" },
    { seq: "Z, X, V, T, ?", ans: "R", hint: "Back by 2 letters" },
    { seq: "7, 14, 28, ?", ans: "56", hint: "×2" },
    { seq: "10, 9, 7, 4, ?", ans: "0", hint: "-1, -2, -3, -4" }
];

let index = 0;
let score = 0;
let streak = 0;
let level = 1;
let time = 15;
let timer;

function startGame() {
    index = 0;
    score = 0;
    streak = 0;
    level = 1;
    updateStats();
    loadPattern();
}

function loadPattern() {
    if (index >= patterns.length) {
        endGame();
        return;
    }

    const card = document.getElementById("card");
    card.classList.add("fade");

    setTimeout(() => {
        card.classList.remove("fade");
        document.getElementById("pattern").textContent =
            patterns[index].seq;
        document.getElementById("answer").value = "";
        document.getElementById("message").textContent = "";
        updateProgress();
        startTimer();
    }, 250);
}

function checkAnswer() {
    const input = document.getElementById("answer").value.trim().toUpperCase();
    const correct = patterns[index].ans.toUpperCase();

    if (input === correct) {
        streak++;
        score += 10 + streak * 3;
        index++;
        if (index % 3 === 0) level++;
        loadPattern();
    } else {
        streak = 0;
        document.getElementById("message").textContent = "Wrong!";
        document.getElementById("message").style.color = "red";
    }
    updateStats();
}

function useHint() {
    score = Math.max(0, score - 5);
    document.getElementById("message").textContent =
        "Hint: " + patterns[index].hint;
    document.getElementById("message").style.color = "orange";
    updateStats();
}

function updateStats() {
    document.getElementById("score").textContent = `Score: ${score}`;
    document.getElementById("streak").textContent = `Streak: ${streak}`;
    document.getElementById("level").textContent = `Level: ${level}`;
}

function updateProgress() {
    const percent = (index / patterns.length) * 100;
    document.getElementById("bar").style.width = percent + "%";
}

function startTimer() {
    clearInterval(timer);
    time = 15;
    document.getElementById("timer").textContent = `⏱ ${time}s`;

    timer = setInterval(() => {
        time--;
        document.getElementById("timer").textContent = `⏱ ${time}s`;

        if (time <= 0) {
            streak = 0;
            index++;
            loadPattern();
            updateStats();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timer);
    const high = localStorage.getItem("highScore") || 0;
    if (score > high) {
        localStorage.setItem("highScore", score);
    }

    document.getElementById("pattern").textContent =
        `Game Over! Score: ${score} | High Score: ${localStorage.getItem("highScore")}`;
    document.getElementById("answer").style.display = "none";
}

startGame();
