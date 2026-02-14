let price = 30000;
let history = [];
let cash = 10000;
let btc = 0;

let bids = [];
let asks = [];

const priceDisplay = document.getElementById("priceDisplay");
const cashSpan = document.getElementById("cash");
const btcSpan = document.getElementById("btc");
const totalValue = document.getElementById("totalValue");
const chart = document.getElementById("chart");
const ctx = chart.getContext("2d");

function updateMarket() {
  const change = (Math.random() - 0.5) * 500;
  price += change;
  price = Math.max(1000, price);

  history.push(price);
  if (history.length > 100) history.shift();

  generateOrderBook();
  render();
}

function generateOrderBook() {
  bids = [];
  asks = [];

  for (let i = 0; i < 5; i++) {
    bids.push({
      price: (price - Math.random() * 500).toFixed(2),
      amount: (Math.random() * 2).toFixed(3)
    });

    asks.push({
      price: (price + Math.random() * 500).toFixed(2),
      amount: (Math.random() * 2).toFixed(3)
    });
  }
}

function render() {
  priceDisplay.innerText = `BTC Price: $${price.toFixed(2)}`;

  document.getElementById("bids").innerHTML =
    bids.map(b => `<div class="order-entry">${b.amount} @ $${b.price}</div>`).join("");

  document.getElementById("asks").innerHTML =
    asks.map(a => `<div class="order-entry">${a.amount} @ $${a.price}</div>`).join("");

  cashSpan.textContent = cash.toFixed(2);
  btcSpan.textContent = btc.toFixed(4);

  totalValue.textContent =
    `Total Value: $${(cash + btc * price).toFixed(2)}`;

  drawChart();
}

function drawChart() {
  ctx.clearRect(0, 0, chart.width, chart.height);

  ctx.beginPath();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;

  history.forEach((p, i) => {
    const x = (chart.width / 100) * i;
    const y = chart.height - (p / 40000) * chart.height;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function marketBuy() {
  const amount = parseFloat(document.getElementById("amount").value);
  if (cash >= amount * price) {
    cash -= amount * price;
    btc += amount;
    render();
  }
}

function marketSell() {
  const amount = parseFloat(document.getElementById("amount").value);
  if (btc >= amount) {
    btc -= amount;
    cash += amount * price;
    render();
  }
}

function limitOrder() {
  const amount = parseFloat(document.getElementById("amount").value);
  const limitPrice = parseFloat(document.getElementById("limitPrice").value);

  if (!limitPrice) return;

  if (limitPrice >= price && cash >= amount * limitPrice) {
    cash -= amount * limitPrice;
    btc += amount;
  } else if (limitPrice <= price && btc >= amount) {
    btc -= amount;
    cash += amount * limitPrice;
  }

  render();
}

setInterval(updateMarket, 1000);
generateOrderBook();
render();
