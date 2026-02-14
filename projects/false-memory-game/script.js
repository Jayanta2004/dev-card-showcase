const words = [
    "apple","river","cloud","stone","light","forest","dream",
    "glass","flame","shadow","ocean","wind","storm",
    "leaf","echo","star","dust","moon","spark","mist"
];

let shownWords = [];
let currentWord = "";
let score = 0;
let streak = 0;
let round = 1;
let timer = 5;
let timerInterval;

const wordDisplay = document.getElementById("word-display");
const seenBtn = document.getElementById("seenBtn");
const newBtn = document.getElementById("newBtn");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const roundEl = document.getElementById("round");
const feedback = document.getElementById("feedback");
const startBtn = document.getElementById("startBtn");
const choices = document.getElementById("choices");
const timerFill = document.getElementById("timer-fill");

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function nextRound() {
    clearInterval(timerInterval);
    timer = 5;
    updateTimerBar();

    if (Math.random() < 0.4 && shownWords.length > 0) {
        currentWord = shownWords[Math.floor(Math.random() * shownWords.length)];
    } else {
        currentWord = getRandomWord();
    }

    wordDisplay.textContent = currentWord;
    feedback.textContent = "";
    roundEl.textContent = round;

    timerInterval = setInterval(() => {
        timer--;
        updateTimerBar();

        if (timer <= 0) {
            clearInterval(timerInterval);
            handleAnswer(null);
        }
    }, 1000);
}

function updateTimerBar() {
    const percent = (timer / 5) * 100;
    timerFill.style.width = percent + "%";
}

function handleAnswer(choice) {
    clearInterval(timerInterval);

    const wasSeen = shownWords.includes(currentWord);
    let correct = false;

    if (choice === "seen" && wasSeen) correct = true;
    if (choice === "new" && !wasSeen) correct = true;

    if (correct) {
        score += 10 + streak * 2;
        streak++;
        feedback.textContent = "Correct!";
        feedback.style.color = "#22ff88";
    } else {
        streak = 0;
        feedback.textContent = "Wrong!";
        feedback.style.color = "#ff4d6d";
    }

    if (!wasSeen) {
        shownWords.push(currentWord);
    }

    scoreEl.textContent = score;
    streakEl.textContent = streak;

    round++;
    setTimeout(nextRound, 900);
}

seenBtn.onclick = () => handleAnswer("seen");
newBtn.onclick = () => handleAnswer("new");

startBtn.onclick = () => {
    score = 0;
    streak = 0;
    round = 1;
    shownWords = [];

    scoreEl.textContent = score;
    streakEl.textContent = streak;
    roundEl.textContent = round;

    startBtn.classList.add("hidden");
    choices.classList.remove("hidden");

    nextRound();
};
