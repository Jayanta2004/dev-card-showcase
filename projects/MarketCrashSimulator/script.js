let price = 10000;
let history = [];
let cash = 50000;
let shares = 5;
let crashMode = false;

const panicSlider = document.getElementById("panic");
const liquiditySlider = document.getElementById("liquidity");
const panicVal = document.getElementById("panicVal");
const liqVal = document.getElementById("liqVal");

const ctx = document.getElementById("chart").getContext("2d");

panicSlider.oninput = () => panicVal.textContent = panicSlider.value;
liquiditySlider.oninput = () => liqVal.textContent = liquiditySlider.value;

function triggerCrash() {
  crashMode = true;
}

function updateMarket() {
  let volatility = crashMode ? 0.08 : 0.02;
  let panicFactor = parseFloat(panicSlider.value);
  let liquidity = parseFloat(liquiditySlider.value) / 100;

  let change = (Math.random() - 0.5) * volatility * price;

  if (crashMode) {
    change -= price * 0.03 * panicFactor * (1 - liquidity);
  }

  price += change;
  price = Math.max(1000, price);

  history.push(price);
  if (history.length > 100) history.shift();

  updatePortfolio();
  drawChart();

  if (price < 4000) crashMode = false;
}

function updatePortfolio() {
  document.getElementById("price").textContent =
    "$" + price.toFixed(2);

  document.getElementById("cash").textContent = cash.toFixed(2);
  document.getElementById("shares").textContent = shares;

  const total = cash + shares * price;
  document.getElementById("total").textContent = total.toFixed(2);
}

function drawChart() {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.strokeStyle = crashMode ? "#ef4444" : "#22c55e";
  ctx.lineWidth = 2;

  history.forEach((p, i) => {
    const x = (canvas.width / 100) * i;
    const y = canvas.height - (p / 15000) * canvas.height;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

setInterval(updateMarket, 1000);
updatePortfolio();
