/* =========================================================
   Accessibility Violation Scanner
   ========================================================= */

const scanBtn = document.getElementById("scanBtn");
const resetBtn = document.getElementById("resetBtn");
const violationList = document.getElementById("violationList");
const scoreValue = document.getElementById("scoreValue");

/* ================= EVENT LISTENERS ================= */

scanBtn.addEventListener("click", runScan);
resetBtn.addEventListener("click", resetReport);

/* ================= MAIN SCAN ================= */

function runScan() {
  violationList.innerHTML = "";
  let violations = [];

  checkImages(violations);
  checkButtons(violations);
  checkContrast(violations);
  checkFontSize(violations);
  checkARIA(violations);

  renderViolations(violations);
  calculateScore(violations);
}

/* ================= CHECKS ================= */

function checkImages(violations) {
  const images = document.querySelectorAll("img");
  images.forEach(img => {
    if (!img.hasAttribute("alt") || img.alt.trim() === "") {
      violations.push({
        type: "Image missing alt text",
        severity: "high",
        fix: "Add descriptive alt attribute to image."
      });
    }
  });
}

function checkButtons(violations) {
  const buttons = document.querySelectorAll("button, .custom-button");
  buttons.forEach(btn => {
    if (btn.textContent.trim() === "") {
      violations.push({
        type: "Button without accessible label",
        severity: "high",
        fix: "Add visible text or aria-label."
      });
    }
  });
}

function checkContrast(violations) {
  const elements = document.querySelectorAll(".low-contrast");
  elements.forEach(el => {
    violations.push({
      type: "Low contrast text",
      severity: "low",
      fix: "Increase contrast between text and background."
    });
  });
}

function checkFontSize(violations) {
  const elements = document.querySelectorAll(".tiny-text");
  elements.forEach(el => {
    violations.push({
      type: "Font size too small",
      severity: "low",
      fix: "Use font size of at least 12–14px."
    });
  });
}

function checkARIA(violations) {
  const elements = document.querySelectorAll(".custom-button");
  elements.forEach(el => {
    if (!el.hasAttribute("role")) {
      violations.push({
        type: "Missing ARIA role",
        severity: "low",
        fix: "Add role='button' and keyboard support."
      });
    }
  });
}

/* ================= RENDER ================= */

function renderViolations(violations) {
  if (violations.length === 0) {
    violationList.innerHTML = "<p>No violations found 🎉</p>";
    return;
  }

  violations.forEach(v => {
    const div = document.createElement("div");
    div.className = `violation ${v.severity}`;
    div.innerHTML = `
      <strong>${v.type}</strong><br>
      Severity: ${v.severity}<br>
      Fix: ${v.fix}
    `;
    violationList.appendChild(div);
  });
}

/* ================= SCORE ================= */

function calculateScore(violations) {
  let score = 100;

  violations.forEach(v => {
    if (v.severity === "high") score -= 15;
    if (v.severity === "low") score -= 5;
  });

  score = Math.max(score, 0);
  scoreValue.innerText = score;
}

/* ================= RESET ================= */

function resetReport() {
  violationList.innerHTML = "";
  scoreValue.innerText = "-";
}