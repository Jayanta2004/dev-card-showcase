const TOTAL_MEMORY = 100;
let usedMemory = 0;
let blocks = [];

const memoryDiv = document.getElementById("memory");
const statusText = document.getElementById("status");

function randomColor() {
  return `hsl(${Math.random()*360},70%,55%)`;
}

function renderMemory() {
  memoryDiv.innerHTML = "";

  blocks.forEach(b => {
    const div = document.createElement("div");
    div.className = "block";
    div.style.width = b.size + "%";
    div.style.background = b.color;
    div.textContent = `${b.name} (${b.size})`;
    memoryDiv.appendChild(div);
  });

  const freeSize = TOTAL_MEMORY - usedMemory;
  if (freeSize > 0) {
    const free = document.createElement("div");
    free.className = "block free";
    free.style.width = freeSize + "%";
    free.textContent = `Free (${freeSize})`;
    memoryDiv.appendChild(free);
  }
}

document.getElementById("allocateBtn").addEventListener("click", () => {
  const name = document.getElementById("processName").value.trim();
  const size = Number(document.getElementById("memorySize").value);

  if (!name || !size) return;

  if (usedMemory + size > TOTAL_MEMORY) {
    statusText.textContent = "❌ Not enough memory!";
    return;
  }

  blocks.push({
    name,
    size,
    color: randomColor()
  });

  usedMemory += size;
  renderMemory();

  statusText.textContent =
    `Allocated ${size}% memory to ${name}`;
});

document.getElementById("resetBtn").addEventListener("click", () => {
  blocks = [];
  usedMemory = 0;
  renderMemory();
  statusText.textContent = "Memory reset.";
});

renderMemory();