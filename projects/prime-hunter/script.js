// ================= STATE =================
let score = 0;
let lives = 3;
let streak = 0;
let currentNumber = 0;
let highScore = Number(localStorage.getItem("primeHunterHighScore")) || 0;
let roundTime = 5000; // default timer per number
let timerStart = null;
let timerInterval = null;
let gameRunning = false;
let paused = false;

// ================= DOM =================
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const highScoreEl = document.getElementById("highScore");
const numberDisplay = document.getElementById("numberDisplay");
const resultEl = document.getElementById("result");
const primeBtn = document.getElementById("primeBtn");
const notPrimeBtn = document.getElementById("notPrimeBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const difficultySelect = document.getElementById("difficulty");
const timerBar = document.getElementById("timerBar");

// Set initial high score
highScoreEl.textContent = highScore;

// ================= UTIL =================
function getRandomNumber(difficulty) {
    if(difficulty === "easy") return Math.floor(Math.random()*50)+1;
    if(difficulty === "medium") return Math.floor(Math.random()*100)+1;
    return Math.floor(Math.random()*200)+1;
}

function isPrime(num){
    if(num<2) return false;
    for(let i=2;i*i<=num;i++){
        if(num%i===0) return false;
    }
    return true;
}

// ================= TIMER =================
function startTimerBar(){
    const startTime = performance.now();
    timerInterval = requestAnimationFrame(function tick(){
        if(!gameRunning) return;
        const elapsed = performance.now() - startTime;
        const ratio = Math.min(elapsed / roundTime, 1);
        timerBar.style.transform = `scaleX(${1-ratio})`;
        if(ratio<1) timerInterval = requestAnimationFrame(tick);
        else handleAnswer(false); // auto-fail
    });
}

// ================= GAME LOGIC =================
function nextNumber(){
    currentNumber = getRandomNumber(difficultySelect.value);
    numberDisplay.textContent = currentNumber;
    timerBar.style.transform = 'scaleX(1)';
    resultEl.textContent = '';
    startTimerBar();
}

function handleAnswer(userSaysPrime){
    cancelAnimationFrame(timerInterval);

    const correct = isPrime(currentNumber) === userSaysPrime;

    if(correct){
        score++;
        streak++;
        resultEl.textContent = `✅ Correct! Streak: ${streak}`;
        resultEl.style.color = "#22c55e";
    } else {
        lives--;
        streak=0;
        resultEl.textContent = `❌ Wrong! ${currentNumber} was ${isPrime(currentNumber)?'Prime':'Not Prime'}`;
        resultEl.style.color = "#ef4444";
    }

    scoreEl.textContent = score;
    livesEl.textContent = lives;

    if(score>highScore){
        highScore=score;
        localStorage.setItem("primeHunterHighScore",highScore);
        highScoreEl.textContent=highScore;
    }

    if(lives<=0){
        endGame();
    } else {
        setTimeout(nextNumber, 800);
    }
}

function startGame(){
    score=0;
    lives=3;
    streak=0;
    scoreEl.textContent=score;
    livesEl.textContent=lives;
    startBtn.disabled=true;
    pauseBtn.disabled=false;
    primeBtn.disabled=false;
    notPrimeBtn.disabled=false;
    gameRunning=true;
    nextNumber();
}

function pauseGame(){
    if(!paused){
        paused=true;
        gameRunning=false;
        pauseBtn.textContent='RESUME';
    } else {
        paused=false;
        gameRunning=true;
        pauseBtn.textContent='PAUSE';
        startTimerBar();
    }
}

function endGame(){
    gameRunning=false;
    resultEl.textContent += " 🏁 Game Over!";
    startBtn.disabled=false;
    pauseBtn.disabled=true;
    primeBtn.disabled=true;
    notPrimeBtn.disabled=true;
}

// ================= EVENTS =================
primeBtn.addEventListener("click",()=>handleAnswer(true));
notPrimeBtn.addEventListener("click",()=>handleAnswer(false));
startBtn.addEventListener("click",startGame);
pauseBtn.addEventListener("click",pauseGame);

// Keyboard shortcuts
document.addEventListener("keydown",(e)=>{
    if(!gameRunning) return;
    if(e.code==="KeyP") handleAnswer(true);
    if(e.code==="KeyN") handleAnswer(false);
    if(e.code==="Space") startBtn.click();
});
