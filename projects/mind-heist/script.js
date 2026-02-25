let level = 1;
let timer = 30;
let countdown;
let correctAnswer;

const questionEl = document.getElementById("question");
const timerEl = document.getElementById("timer");
const levelEl = document.getElementById("level");
const messageEl = document.getElementById("message");

function generateQuestion() {
    const a = Math.floor(Math.random() * (level * 5));
    const b = Math.floor(Math.random() * (level * 5));
    correctAnswer = a + b;

    questionEl.textContent = `Decrypt Code: ${a} + ${b} = ?`;
}

function startTimer() {
    timer = 30;
    timerEl.textContent = timer;

    countdown = setInterval(() => {
        timer--;
        timerEl.textContent = timer;

        if (timer <= 0) {
            gameOver();
        }
    }, 1000);
}

function submitAnswer() {
    const input = document.getElementById("answerInput").value;

    if (parseInt(input) === correctAnswer) {
        clearInterval(countdown);
        level++;
        levelEl.textContent = level;
        messageEl.textContent = "ACCESS GRANTED";
        document.getElementById("answerInput").value = "";
        generateQuestion();
        startTimer();
    } else {
        messageEl.textContent = "ACCESS DENIED";
    }
}

function gameOver() {
    clearInterval(countdown);
    messageEl.textContent = "SYSTEM TRACED. GAME OVER.";
}

generateQuestion();
startTimer();