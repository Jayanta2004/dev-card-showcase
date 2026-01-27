let score = 0;
let timeLeft = 60;

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const diffs = document.querySelectorAll(".diff");

diffs.forEach(diff => {
  diff.addEventListener("click", () => {
    diff.style.display = "none";
    score++;
    scoreEl.textContent = score;
  });
});

let timer = setInterval(() => {
  timeLeft--;
  timeEl.textContent = timeLeft;

  if (timeLeft === 0) {
    clearInterval(timer);
    alert("Game Over! Your score: " + score);
  }
}, 1000);

function restartGame() {
  location.reload();
}
