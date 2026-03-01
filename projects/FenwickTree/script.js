let arr = [];
let bit = [];

const arrayView = document.getElementById("arrayView");
const bitView = document.getElementById("bitView");
const result = document.getElementById("result");

function render(container, data, active = []) {
  container.innerHTML = "";
  data.forEach((v, i) => {
    const box = document.createElement("div");
    box.className = "box";
    if (active.includes(i)) box.classList.add("active");
    box.textContent = v;
    container.appendChild(box);
  });
}

function buildBIT(input) {
  arr = input;
  bit = new Array(arr.length + 1).fill(0);

  for (let i = 0; i < arr.length; i++) {
    updateBIT(i + 1, arr[i], false);
  }

  render(arrayView, arr);
  render(bitView, bit.slice(1));
}

function updateBIT(index, delta, renderUI = true) {
  while (index < bit.length) {
    bit[index] += delta;
    index += index & -index;
  }
  if (renderUI) render(bitView, bit.slice(1));
}

function prefixSum(index) {
  let sum = 0;
  let active = [];

  while (index > 0) {
    sum += bit[index];
    active.push(index - 1);
    index -= index & -index;
  }

  render(bitView, bit.slice(1), active);
  return sum;
}

/* ---------- Events ---------- */

document.getElementById("buildBtn").addEventListener("click", () => {
  const input = document.getElementById("arrayInput").value;
  if (!input) return;

  const nums = input.split(",").map(n => Number(n.trim()));
  buildBIT(nums);
  result.textContent = "Result: Tree Built";
});

document.getElementById("updateBtn").addEventListener("click", () => {
  const idx = Number(document.getElementById("updateIndex").value);
  const delta = Number(document.getElementById("updateValue").value);

  if (!idx || isNaN(delta)) return;

  arr[idx - 1] += delta;
  updateBIT(idx, delta);

  render(arrayView, arr);
  result.textContent = `Result: Updated index ${idx} by ${delta}`;
});

document.getElementById("queryBtn").addEventListener("click", () => {
  const idx = Number(document.getElementById("queryIndex").value);
  if (!idx) return;

  const ans = prefixSum(idx);
  result.textContent = `Result: Prefix Sum (1..${idx}) = ${ans}`;
});