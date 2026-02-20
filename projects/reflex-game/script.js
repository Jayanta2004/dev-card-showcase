const gameBox = document.getElementById("gameBox");
const startBtn = document.getElementById("startBtn");
const result = document.getElementById("result");
const message = document.getElementById("message");

let startTime;
let timeoutId;
let gameActive = false;

startBtn.addEventListener("click", startGame);

function startGame() {
  result.textContent = "";
  message.textContent = "Wait for green...";
  gameBox.classList.remove("ready");
  gameActive = false;

  const randomDelay = Math.floor(Math.random() * 3000) + 2000;

  timeoutId = setTimeout(() => {
    gameBox.classList.add("ready");
    startTime = Date.now();
    gameActive = true;
    message.textContent = "CLICK NOW!";
  }, randomDelay);
}

gameBox.addEventListener("click", () => {
  if (!gameActive) {
    result.textContent = "Too early! 😅";
    clearTimeout(timeoutId);
    return;
  }

  const reactionTime = Date.now() - startTime;
  result.textContent = `Your reaction time: ${reactionTime} ms`;
  message.textContent = "Click Start to try again!";
  gameActive = false;

  gameBox.classList.remove("ready");
});
