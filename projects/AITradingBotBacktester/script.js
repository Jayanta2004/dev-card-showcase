const ctx = document.getElementById("chart").getContext("2d");

function generatePrices(length = 200) {
  let prices = [100];
  for (let i = 1; i < length; i++) {
    let change = (Math.random() - 0.5) * 2;
    prices.push(prices[i - 1] + change);
  }
  return prices;
}

function movingAverage(data, period) {
  return data.map((_, i) => {
    if (i < period) return null;
    let sum = 0;
    for (let j = 0; j < period; j++)
      sum += data[i - j];
    return sum / period;
  });
}

function calculateRSI(data, period = 14) {
  let rsi = [];
  for (let i = period; i < data.length; i++) {
    let gains = 0, losses = 0;
    for (let j = 0; j < period; j++) {
      let diff = data[i - j] - data[i - j - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    let rs = gains / (losses || 1);
    rsi.push(100 - (100 / (1 + rs)));
  }
  return rsi;
}

function runBacktest() {
  const strategy = document.getElementById("strategy").value;
  let capital = parseFloat(document.getElementById("capital").value);
  const prices = generatePrices();
  let position = 0;
  let equity = [];
  let trades = [];
  let peak = capital;
  let maxDrawdown = 0;

  let wins = 0;

  if (strategy === "ma") {
    const shortMA = movingAverage(prices, 5);
    const longMA = movingAverage(prices, 20);

    for (let i = 20; i < prices.length; i++) {
      if (shortMA[i] > longMA[i] && position === 0) {
        position = capital / prices[i];
        capital = 0;
        trades.push({ type: "buy", price: prices[i] });
      }
      else if (shortMA[i] < longMA[i] && position > 0) {
        capital = position * prices[i];
        if (capital > trades[trades.length - 1].price * position) wins++;
        position = 0;
        trades.push({ type: "sell", price: prices[i] });
      }

      let value = capital + position * prices[i];
      equity.push(value);

      peak = Math.max(peak, value);
      maxDrawdown = Math.max(maxDrawdown, (peak - value) / peak);
    }
  }

  if (strategy === "rsi") {
    const rsi = calculateRSI(prices);

    for (let i = 14; i < prices.length; i++) {
      if (rsi[i - 14] < 30 && position === 0) {
        position = capital / prices[i];
        capital = 0;
      }
      else if (rsi[i - 14] > 70 && position > 0) {
        capital = position * prices[i];
        position = 0;
        wins++;
      }

      let value = capital + position * prices[i];
      equity.push(value);

      peak = Math.max(peak, value);
      maxDrawdown = Math.max(maxDrawdown, (peak - value) / peak);
    }
  }

  const totalReturn = ((equity[equity.length - 1] /
    parseFloat(document.getElementById("capital").value)) - 1) * 100;

  const returns = equity.map((v, i) =>
    i === 0 ? 0 : (v - equity[i - 1]) / equity[i - 1]
  );

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.map(r => Math.pow(r - avgReturn, 2))
           .reduce((a, b) => a + b, 0) / returns.length
  );

  const sharpe = stdDev === 0 ? 0 : avgReturn / stdDev;

  document.getElementById("return").textContent =
    totalReturn.toFixed(2) + "%";

  document.getElementById("winRate").textContent =
    ((wins / (trades.length || 1)) * 100).toFixed(1) + "%";

  document.getElementById("drawdown").textContent =
    (maxDrawdown * 100).toFixed(2) + "%";

  document.getElementById("sharpe").textContent =
    sharpe.toFixed(2);

  drawChart(equity);
}

function drawChart(data) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;

  data.forEach((val, i) => {
    const x = (canvas.width / data.length) * i;
    const y = canvas.height - (val / Math.max(...data)) * canvas.height;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}
