const puzzles = [
    { q: "2, 4, 8, 16, ?", a: "32" },
    { q: "5 + 7 × 2 = ?", a: "19" },
    { q: "What is the square root of 144?", a: "12" },
    { q: "Unscramble: 'RAEB'", a: "bear" },
    { q: "What has keys but no locks?", a: "keyboard" },
    { q: "10, 20, 40, 80, ?", a: "160" },
    { q: "What is 15 × 3?", a: "45" },
    { q: "What comes after J in alphabet?", a: "k" },
    { q: "What is 100 ÷ 4?", a: "25" },
    { q: "I speak without a mouth. What am I?", a: "echo" },
    { q: "3, 9, 27, ?", a: "81" },
    { q: "What is 9²?", a: "81" },
    { q: "What has hands but can’t clap?", a: "clock" },
    { q: "7 + 8 + 9 = ?", a: "24" },
    { q: "What month has 28 days?", a: "all" },
    { q: "What is 50% of 200?", a: "100" },
    { q: "What goes up but never down?", a: "age" },
    { q: "1, 1, 2, 3, 5, ?", a: "8" },
    { q: "What is 11 × 11?", a: "121" },
    { q: "What has one eye but can’t see?", a: "needle" }
];

let level = 0;
let score = 0;
let time = 20;
let timerInterval;

function loadPuzzle() {
    if (level >= puzzles.length) {
        endGame();
        return;
    }

    const card = document.getElementById("card");
    card.classList.add("fade");

    setTimeout(() => {
        card.classList.remove("fade");
        document.getElementById("question").textContent = puzzles[level].q;
        document.getElementById("levelText").textContent = `Level ${level + 1}`;
        document.getElementById("answer").value = "";
        document.getElementById("message").textContent = "";
        updateProgress();
        startTimer();
    }, 300);
}

function checkAnswer() {
    const input = document.getElementById("answer").value.toLowerCase().trim();
    const correct = puzzles[level].a.toLowerCase();

    if (input === correct) {
        score += 10;
        level++;
        loadPuzzle();
    } else {
        document.getElementById("message").textContent = "Wrong answer!";
        document.getElementById("message").style.color = "#ff4d4d";
    }
    updateScore();
}

function startTimer() {
    clearInterval(timerInterval);
    time = 20;
    document.getElementById("timerText").textContent = `⏱ ${time}s`;

    timerInterval = setInterval(() => {
        time--;
        document.getElementById("timerText").textContent = `⏱ ${time}s`;

        if (time <= 0) {
            level++;
            loadPuzzle();
        }
    }, 1000);
}

function updateScore() {
    document.getElementById("scoreText").textContent = `Score: ${score}`;
}

function updateProgress() {
    const progress = (level / puzzles.length) * 100;
    document.getElementById("progress").style.width = progress + "%";
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById("question").textContent =
        `🎉 Game Complete! Final Score: ${score}`;
    document.getElementById("answer").style.display = "none";
    document.querySelector(".puzzle-card button").style.display = "none";
    document.getElementById("restartBtn").style.display = "inline-block";
    document.getElementById("progress").style.width = "100%";
}

function restartGame() {
    level = 0;
    score = 0;
    updateScore();
    document.getElementById("answer").style.display = "inline-block";
    document.querySelector(".puzzle-card button").style.display = "inline-block";
    document.getElementById("restartBtn").style.display = "none";
    loadPuzzle();
}

updateScore();
loadPuzzle();
