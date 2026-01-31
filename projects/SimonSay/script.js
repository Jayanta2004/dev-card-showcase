const buttons = ["green", "red", "yellow", "blue"];
let sequence = [];
let userSequence = [];
let score = 0;
let highScore = localStorage.getItem("simonHighScore") || 0;

document.getElementById("highScore").innerText = highScore;

const playSound = (color) => {
  const audio = new Audio(`https://actions.google.com/sounds/v1/cartoon/poof.ogg`);
  audio.volume = 0.3;
  audio.play();
};

const flashButton = (color) => {
  const btn = document.getElementById(color);
  btn.classList.add("active");
  playSound(color);

  setTimeout(() => {
    btn.classList.remove("active");
  }, 300);
};

const startGame = () => {
  sequence = [];
  userSequence = [];
  score = 0;
  updateScore();
  nextRound();
};

const nextRound = () => {
  const randomColor = buttons[Math.floor(Math.random() * 4)];
  sequence.push(randomColor);
  playSequence();
};

const playSequence = async () => {
  userSequence = [];
  for (let i = 0; i < sequence.length; i++) {
    setTimeout(() => flashButton(sequence[i]), i * 600);
  }
};

const handleUserClick = (color) => {
  userSequence.push(color);
  flashButton(color);

  if (userSequence[userSequence.length - 1] !== sequence[userSequence.length - 1]) {
    gameOver();
    return;
  }

  if (userSequence.length === sequence.length) {
    score++;
    updateScore();
    setTimeout(nextRound, 800);
  }
};

const updateScore = () => {
  document.getElementById("score").innerText = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("simonHighScore", highScore);
    document.getElementById("highScore").innerText = highScore;
  }
};

const gameOver = () => {
  alert(`Game Over! Score: ${score}`);
};

document.getElementById("startBtn").addEventListener("click", startGame);

buttons.forEach(color => {
  document.getElementById(color).addEventListener("click", () => handleUserClick(color));
});
