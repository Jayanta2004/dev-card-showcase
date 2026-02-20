const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const clearBtn = document.getElementById("clearBtn");
const pageLabel = document.getElementById("pageLabel");
const feedback = document.querySelector(".feedback");

const images = [
  "./images/img1.png",
  "./images/img2.png",
  "./images/img3.png",
  "./images/img4.png",
  "./images/img5.png",
  "./images/img6.png",
  "./images/img7.png",
  "./images/img8.png",
  "./images/img9.png",
  "./images/img10.png"
];

let current = 0;
let bg = new Image();
let drawing = false;
let lastX = null, lastY = null;

function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  drawBackground();
}
window.addEventListener("resize", resize);

function updateImage() {
  bg.src = images[current];
  pageLabel.textContent = `Practice ${current + 1} / ${images.length}`;
}

bg.onload = drawBackground;
resize();
updateImage();

prevBtn.onclick = () => {
  current = (current - 1 + images.length) % images.length;
  updateImage();
};

nextBtn.onclick = () => {
  current = (current + 1) % images.length;
  updateImage();
};

clearBtn.onclick = drawBackground;

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const imgRatio = bg.width / bg.height;
  const canvasRatio = canvas.width / canvas.height;

  let w, h;
  if (imgRatio > canvasRatio) {
    w = canvas.width * 0.9;
    h = w / imgRatio;
  } else {
    h = canvas.height * 0.9;
    w = h * imgRatio;
  }

  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  ctx.globalAlpha = 0.3;
  ctx.drawImage(bg, x, y, w, h);
  ctx.globalAlpha = 1;
}

// Drawing + feedback
canvas.addEventListener("mousedown", e => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mousemove", e => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  const dx = x - lastX;
  const dy = y - lastY;
  const dist = Math.hypot(dx, dy);

  if (dist < 2) {
    feedback.textContent = "Draw smoother strokes ✍️";
    feedback.className = "feedback warn";
  } else if (dist > 20) {
    feedback.textContent = "Slow down for accuracy 🎯";
    feedback.className = "feedback bad";
  } else {
    feedback.textContent = "Great control! 🌟";
    feedback.className = "feedback good";
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  lastX = x;
  lastY = y;
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  feedback.textContent = "Ready for next stroke…";
  feedback.className = "feedback";
});
