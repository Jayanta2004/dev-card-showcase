let score = 0;
let round = 1;
let highScore = localStorage.getItem("riskHighScore") || 0;

document.getElementById("highScore").textContent = highScore;

function play(choice) {
    let gain = 0;
    let risk = 0;

    if (choice === "safe") {
        gain = rand(5, 10);
        risk = 0.1;
    } else if (choice === "balanced") {
        gain = rand(10, 20);
        risk = 0.3;
    } else if (choice === "risky") {
        gain = rand(20, 40);
        risk = 0.6;
    }

    let outcome = Math.random();

    if (outcome < risk) {
        score = 0;
        round = 1;
        showMessage("💥 You lost everything!");
    } else {
        score += gain;
        round++;
        showMessage(`+${gain} points!`);
    }

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("riskHighScore", highScore);
    }

    updateUI();
}

function resetGame() {
    score = 0;
    round = 1;
    showMessage("Game restarted!");
    updateUI();
}

function updateUI() {
    document.getElementById("score").textContent = score;
    document.getElementById("round").textContent = round;
    document.getElementById("highScore").textContent = highScore;
}

function showMessage(text) {
    const msg = document.getElementById("message");
    msg.textContent = text;
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
