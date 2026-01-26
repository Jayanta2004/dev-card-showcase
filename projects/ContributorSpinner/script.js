const contributors = [
  "Neeru", "Jayanta", "Alex", "Maria", "Sam", "Lily", "Raj", "Aisha"
];

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const resultDiv = document.getElementById("result");

let deg = 0;

// Populate wheel segments
function createWheel() {
  const segmentAngle = 360 / contributors.length;

  contributors.forEach((name, index) => {
    const segment = document.createElement("div");
    segment.classList.add("segment");
    segment.style.transform = `rotate(${index * segmentAngle}deg)`;
    segment.textContent = name;
    wheel.appendChild(segment);
  });
}

createWheel();

// Spin logic
spinBtn.addEventListener("click", () => {
  spinBtn.disabled = true;
  const randomSpin = Math.floor(Math.random() * 360) + 720; // 2–3 rotations
  deg += randomSpin;

  wheel.style.transform = `rotate(${deg}deg)`;
  
  setTimeout(() => {
    const actualDeg = deg % 360;
    const segmentAngle = 360 / contributors.length;
    const index = Math.floor((360 - actualDeg) / segmentAngle) % contributors.length;
    const winner = contributors[index];
    resultDiv.textContent = `🎉 Selected Contributor: ${winner}`;
    spinBtn.disabled = false;
  }, 4000);
});
