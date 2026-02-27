const canvas = document.getElementById("composer");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentShape = "circle";
const shapes = [];

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.querySelectorAll("button[data-shape]").forEach(btn => {
  btn.addEventListener("click", () => {
    currentShape = btn.dataset.shape;
  });
});

document.getElementById("clear").addEventListener("click", () => {
  shapes.length = 0;
});

function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 90%, 60%)`;
}

canvas.addEventListener("click", (e) => {
  shapes.push({
    x: e.clientX,
    y: e.clientY,
    size: Math.random() * 40 + 20,
    color: randomColor(),
    shape: currentShape,
    pulse: Math.random() * 2
  });
});

function drawShape(s) {
  ctx.save();
  ctx.translate(s.x, s.y);

  const scale = 1 + Math.sin(Date.now() * 0.003 + s.pulse) * 0.2;
  ctx.scale(scale, scale);

  ctx.fillStyle = s.color;
  ctx.shadowBlur = 20;
  ctx.shadowColor = s.color;

  if (s.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, s.size, 0, Math.PI * 2);
    ctx.fill();
  }

  if (s.shape === "square") {
    ctx.fillRect(-s.size, -s.size, s.size * 2, s.size * 2);
  }

  if (s.shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(0, -s.size);
    ctx.lineTo(-s.size, s.size);
    ctx.lineTo(s.size, s.size);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  shapes.forEach(drawShape);

  requestAnimationFrame(animate);
}

animate();