let otp = "";
let timer;
let timeLeft = 10;
let lives = 3;
let score = 0;

generateOtp();
startTimer();

function generateOtp() {
    otp = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById("otp").innerText = otp;
}

function startTimer() {
    clearInterval(timer);
    timeLeft = Math.max(5, 15 - score);
    updateProgress();

    timer = setInterval(() => {
        timeLeft--;
        updateProgress();

        if (timeLeft <= 0) {
            loseLife("⏱ Time Up!");
        }
    }, 1000);
}

function updateProgress() {
    const percent = (timeLeft / Math.max(5, 15 - score)) * 100;
    document.getElementById("progress").style.width = percent + "%";
}

function verifyOtp() {
    const userOtp = document.getElementById("userOtp").value;

    if (userOtp === otp) {
        score++;
        document.getElementById("score").innerText = score;
        document.getElementById("message").innerText = "✅ OTP Verified!";
        resetRound();
    } else {
        loseLife("❌ Wrong OTP");
    }
}

function loseLife(msg) {
    lives--;
    document.getElementById("lives").innerText = lives;
    document.getElementById("message").innerText = msg;

    if (lives <= 0) {
        gameOver();
    } else {
        resetRound();
    }
}

function resetRound() {
    document.getElementById("userOtp").value = "";
    generateOtp();
    startTimer();
}

function gameOver() {
    clearInterval(timer);
    document.getElementById("message").innerText =
        `💀 Game Over! Final Score: ${score}`;
}
