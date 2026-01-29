const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

const options = [
  "Order Pizza 🍕",
  "Watch a Movie 🎬",
  "Take a Power Nap 😴",
  "Go for a Walk 🚶",
  "Treat Yourself ✨"
];

const colors = [
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#22c55e",
  "#facc15"
];

const size = 320;
const center = size / 2;

let currentRotation = 0;
let isSpinning = false;

/* ---------- DRAW WHEEL (STARTS AT TOP) ---------- */
function drawWheel(rotation = 0) {
  const slice = (2 * Math.PI) / options.length;

  ctx.clearRect(0, 0, size, size);
  ctx.save();

  ctx.translate(center, center);
  ctx.rotate(rotation - Math.PI / 2); // 🔑 start wheel at TOP
  ctx.translate(-center, -center);

  options.forEach((text, i) => {
    const start = slice * i;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, center, start, end);
    ctx.fillStyle = colors[i];
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Inter";
    ctx.fillText(text, center - 20, 6);
    ctx.restore();
  });

  ctx.restore();
}

drawWheel();

/* ---------- SPIN ---------- */
spinBtn.addEventListener("click", () => {
  if (isSpinning) return;

  isSpinning = true;
  spinBtn.disabled = true;
  result.textContent = "";

  const extraRotation =
    Math.random() * (6 * Math.PI) + 8 * Math.PI; // smooth spins

  const startRotation = currentRotation;
  const duration = 4200;
  let startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    const progress = Math.min((time - startTime) / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 4);
    currentRotation = startRotation + easeOut * extraRotation;

    drawWheel(currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      spinBtn.disabled = false;

      /* ---------- 🎯 PERFECT RESULT MATCH ---------- */
      const slice = (2 * Math.PI) / options.length;
      const normalized =
        ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) %
        (2 * Math.PI);

      const index =
        Math.floor((2 * Math.PI - normalized) / slice) %
        options.length;

      result.textContent = `🎯 Result: ${options[index]}`;
    }
  }

  requestAnimationFrame(animate);
});
