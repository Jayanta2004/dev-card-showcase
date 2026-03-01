const canvas = document.getElementById("zenCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsla(${hue}, 80%, 60%, 0.6)`;
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = random(1, 3);
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function generateArt() {
  // soft fade instead of hard clear for zen effect
  ctx.fillStyle = "rgba(2,6,23,0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const elements = 80;

  for (let i = 0; i < elements; i++) {
    const x = random(0, canvas.width);
    const y = random(0, canvas.height);
    const color = randomColor();

    if (Math.random() > 0.5) {
      drawCircle(x, y, random(5, 40), color);
    } else {
      drawLine(
        x,
        y,
        x + random(-120, 120),
        y + random(-120, 120),
        color
      );
    }
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.getElementById("generate").addEventListener("click", generateArt);
document.getElementById("clear").addEventListener("click", clearCanvas);

// auto-generate once on load
generateArt();