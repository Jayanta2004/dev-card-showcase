const pricing = {
  gpt4: { input: 0.03 / 1000, output: 0.06 / 1000 },
  gpt4mini: { input: 0.005 / 1000, output: 0.015 / 1000 },
  claude: { input: 0.008 / 1000, output: 0.024 / 1000 },
  gemini: { input: 0.007 / 1000, output: 0.021 / 1000 }
};

const chart = document.getElementById("costChart");
const ctx = chart.getContext("2d");

function calculateCost() {
  const model = document.getElementById("modelSelect").value;
  const inputTokens = parseInt(document.getElementById("inputTokens").value);
  const outputTokens = parseInt(document.getElementById("outputTokens").value);
  const requests = parseInt(document.getElementById("requestsPerDay").value);

  const inputCostPerReq = inputTokens * pricing[model].input;
  const outputCostPerReq = outputTokens * pricing[model].output;
  const totalPerReq = inputCostPerReq + outputCostPerReq;

  const dailyCost = totalPerReq * requests;
  const monthlyCost = dailyCost * 30;

  document.getElementById("results").innerHTML = `
    <p><strong>Cost per Request:</strong> $${totalPerReq.toFixed(4)}</p>
    <p><strong>Daily Cost:</strong> $${dailyCost.toFixed(2)}</p>
    <p><strong>Monthly Cost:</strong> $${monthlyCost.toFixed(2)}</p>
  `;

  drawChart(inputCostPerReq, outputCostPerReq);
}

function drawChart(inputCost, outputCost) {
  ctx.clearRect(0, 0, chart.width, chart.height);

  const max = Math.max(inputCost, outputCost) * 1.5;
  const barWidth = 80;

  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(60, chart.height - (inputCost/max)*150 - 20, barWidth, (inputCost/max)*150);

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(180, chart.height - (outputCost/max)*150 - 20, barWidth, (outputCost/max)*150);

  ctx.fillStyle = "#000";
  ctx.fillText("Input", 75, chart.height - 5);
  ctx.fillText("Output", 195, chart.height - 5);
}
