const canvas = document.getElementById("captchaCanvas");
const ctx = canvas.getContext("2d");

const input = document.getElementById("captchaInput");
const verifyBtn = document.getElementById("verifyBtn");
const refreshBtn = document.getElementById("refreshBtn");
const result = document.getElementById("result");

let captchaText = "";

function generateCaptcha() {
  captchaText = "";
  input.value = "";
  result.textContent = "";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 6; i++) {
    captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Draw text
  ctx.font = "30px Arial";
  ctx.textBaseline = "middle";

  for (let i = 0; i < captchaText.length; i++) {
    const x = 20 + i * 30;
    const y = canvas.height / 2 + random(-5, 5);
    const angle = random(-0.3, 0.3);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = randomColor();
    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();
  }

  drawNoise();
}

function drawNoise() {
  // Lines
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = randomColor();
    ctx.beginPath();
    ctx.moveTo(random(0, canvas.width), random(0, canvas.height));
    ctx.lineTo(random(0, canvas.width), random(0, canvas.height));
    ctx.stroke();
  }

  // Dots
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = randomColor();
    ctx.beginPath();
    ctx.arc(random(0, canvas.width), random(0, canvas.height), 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomColor() {
  const colors = ["#1e293b", "#0f172a", "#334155", "#475569"];
  return colors[Math.floor(Math.random() * colors.length)];
}

verifyBtn.addEventListener("click", () => {
  if (input.value.toUpperCase() === captchaText) {
    result.textContent = "✅ CAPTCHA verified";
    result.style.color = "green";
  } else {
    result.textContent = "❌ Incorrect CAPTCHA";
    result.style.color = "red";
    generateCaptcha();
  }
});

refreshBtn.addEventListener("click", generateCaptcha);

generateCaptcha();
