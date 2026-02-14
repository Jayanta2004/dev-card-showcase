const pricing = {
  ec2: 70,        // per instance per month
  s3: 23,         // per TB per month
  rds: 150,       // per DB per month
  lambda: 0.20    // per million requests
};

const sliders = ["ec2", "s3", "rds", "lambda"];
const ctx = document.getElementById("costChart").getContext("2d");

sliders.forEach(id => {
  const slider = document.getElementById(id);
  const span = document.getElementById(id + "Val");

  slider.addEventListener("input", () => {
    span.textContent = slider.value;
    updateCost();
  });
});

function updateCost() {
  const usage = {};
  sliders.forEach(id => {
    usage[id] = parseFloat(document.getElementById(id).value);
  });

  const costs = {
    ec2: usage.ec2 * pricing.ec2,
    s3: usage.s3 * pricing.s3,
    rds: usage.rds * pricing.rds,
    lambda: usage.lambda * pricing.lambda
  };

  const total = Object.values(costs).reduce((a, b) => a + b, 0);

  document.getElementById("totalCost").textContent =
    `$${total.toFixed(2)} / month`;

  drawChart(costs);
  generateRecommendations(usage, total);
}

function drawChart(costs) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const keys = Object.keys(costs);
  const max = Math.max(...Object.values(costs)) * 1.2;

  const barWidth = 50;
  const spacing = 30;

  keys.forEach((key, i) => {
    const value = costs[key];
    const x = 40 + i * (barWidth + spacing);
    const barHeight = (value / max) * 150;

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(
      x,
      canvas.height - barHeight - 20,
      barWidth,
      barHeight
    );

    ctx.fillStyle = "#000";
    ctx.fillText(key.toUpperCase(), x + 5, canvas.height - 5);
  });
}

function generateRecommendations(usage, total) {
  const recDiv = document.getElementById("recommendations");
  let recs = [];

  if (usage.ec2 > 20)
    recs.push("⚡ Consider Reserved Instances or auto-scaling for EC2.");

  if (usage.s3 > 50)
    recs.push("🗂 Move infrequent S3 data to Glacier.");

  if (usage.rds > 10)
    recs.push("🛢 Consolidate databases or consider serverless DB.");

  if (usage.lambda > 100)
    recs.push("🔄 Optimize Lambda memory/time configuration.");

  if (recs.length === 0)
    recs.push("✅ Infrastructure usage looks optimized.");

  recDiv.innerHTML = recs.join("<br>");
}

updateCost();
