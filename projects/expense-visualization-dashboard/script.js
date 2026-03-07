document.addEventListener("DOMContentLoaded", () => {

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const addBtn = document.getElementById("addExpense");
const totalAmount = document.getElementById("totalAmount");
const breakdown = document.getElementById("categoryBreakdown");

const donutCanvas = document.getElementById("donutChart");
const barCanvas = document.getElementById("barChart");

const colors = {
  Food: "#6366f1",
  Transport: "#22c55e",
  Shopping: "#f59e0b",
  Bills: "#ef4444",
  Other: "#8b5cf6"
};

function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function calculate() {
  const totals = {};
  let total = 0;

  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
    total += e.amount;
  });

  totalAmount.textContent = "₹" + total;

  breakdown.innerHTML = "";
  Object.keys(totals).forEach(cat => {
    const div = document.createElement("div");
    div.innerHTML = `<span style="color:${colors[cat]}">●</span> ${cat}: ₹${totals[cat]}`;
    breakdown.appendChild(div);
  });

  drawDonut(totals);
  drawBar(totals);
}

addBtn.addEventListener("click", () => {
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!desc || !amount) return;

  expenses.push({ desc, amount, category });
  descInput.value = "";
  amountInput.value = "";

  save();
  calculate();
});

function drawDonut(data) {
  const ctx = donutCanvas.getContext("2d");
  ctx.clearRect(0,0,donutCanvas.width,donutCanvas.height);

  const total = Object.values(data).reduce((a,b)=>a+b,0);
  let startAngle = 0;

  Object.keys(data).forEach(cat => {
    const slice = (data[cat] / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(150,125);
    ctx.arc(150,125,100,startAngle,startAngle+slice);
    ctx.fillStyle = colors[cat];
    ctx.fill();

    startAngle += slice;
  });

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(150,125,50,0,Math.PI*2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function drawBar(data) {
  const ctx = barCanvas.getContext("2d");
  ctx.clearRect(0,0,barCanvas.width,barCanvas.height);

  const keys = Object.keys(data);
  const max = Math.max(...Object.values(data), 1);

  keys.forEach((cat,i) => {
    const height = (data[cat]/max) * 200;
    ctx.fillStyle = colors[cat];
    ctx.fillRect(i*60+40,250-height,40,height);
  });
}

calculate();

});