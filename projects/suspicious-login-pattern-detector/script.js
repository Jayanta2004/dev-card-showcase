const analyzeBtn = document.getElementById("analyzeBtn");
const riskScoreEl = document.getElementById("riskScore");
const statusText = document.getElementById("statusText");
const historyEl = document.getElementById("history");

let knownLocation = "India";
let knownDevice = "Laptop";

function calculateRisk(location, device, time) {
  let risk = 0;

  const hour = parseInt(time.split(":")[0]);

  // Location check
  if (location.toLowerCase() !== knownLocation.toLowerCase()) {
    risk += 40;
  }

  // Device check
  if (device.toLowerCase() !== knownDevice.toLowerCase()) {
    risk += 30;
  }

  // Odd hour check
  if (hour < 6 || hour > 23) {
    risk += 30;
  }

  return Math.min(risk, 100);
}

function updateUI(risk) {
  riskScoreEl.textContent = risk + "%";

  if (risk < 30) {
    statusText.textContent = "Safe login detected";
    statusText.style.color = "#00ffcc";
  } else if (risk < 70) {
    statusText.textContent = "Moderate risk – unusual pattern";
    statusText.style.color = "#ffee00";
  } else {
    statusText.textContent = "High risk – suspicious login!";
    statusText.style.color = "#ff3b3b";
  }
}

function addToHistory(location, device, time, risk) {
  const li = document.createElement("li");
  li.textContent = `${time} | ${location} | ${device} → Risk: ${risk}%`;
  historyEl.prepend(li);
}

analyzeBtn.addEventListener("click", () => {
  const location = document.getElementById("location").value;
  const device = document.getElementById("device").value;
  const time = document.getElementById("time").value;

  if (!location || !device || !time) {
    alert("Please fill all fields");
    return;
  }

  const risk = calculateRisk(location, device, time);
  updateUI(risk);
  addToHistory(location, device, time, risk);
});
