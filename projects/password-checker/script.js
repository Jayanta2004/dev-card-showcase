const input = document.getElementById("password");
const meter = document.querySelector(".meter");
const scoreText = document.getElementById("score");
const verdict = document.getElementById("verdict");

const RADIUS = 85;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

meter.style.strokeDasharray = CIRCUMFERENCE;
meter.style.strokeDashoffset = CIRCUMFERENCE;

input.addEventListener("input", () => {
  const value = input.value;
  let score = 0;

  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const percent = Math.round((score / 5) * 100);
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  meter.style.strokeDashoffset = offset;
  scoreText.textContent = `${percent}%`;

  if (percent <= 40) {
    meter.style.stroke = "#ff3d3d";
    verdict.textContent = "⚠️ Threat Level: High";
  } else if (percent <= 80) {
    meter.style.stroke = "#ffc107";
    verdict.textContent = "⚠️ Threat Level: Moderate";
  } else {
    meter.style.stroke = "#00ffcc";
    verdict.textContent = "🛡️ Password Fortified";
  }
});
