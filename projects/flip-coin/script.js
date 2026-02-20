const coin = document.getElementById("coin");
const flipBtn = document.getElementById("flipBtn");
const resultText = document.getElementById("result");

let isFlipping = false;

flipBtn.addEventListener("click", () => {
  if (isFlipping) return;
  isFlipping = true;

  const flipResult = Math.random() < 0.5 ? "HEADS" : "TAILS";
  const rotation = flipResult === "HEADS" ? 0 : 180;

  coin.style.transition = "transform 1s";
  coin.style.transform = `rotateY(${rotation + 720}deg)`;

  setTimeout(() => {
    resultText.textContent = `Result: ${flipResult}`;
    isFlipping = false;
  }, 1000);
});
