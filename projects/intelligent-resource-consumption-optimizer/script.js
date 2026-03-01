const windowInput = document.getElementById("windowInput");
const concurrencyInput = document.getElementById("concurrencyInput");
const targetInput = document.getElementById("targetInput");
const optimizeBtn = document.getElementById("optimizeBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const signalsContainer = document.getElementById("signalsContainer");
const planList = document.getElementById("planList");
const timelineList = document.getElementById("timelineList");
const utilizationValue = document.getElementById("utilizationValue");
const costDelta = document.getElementById("costDelta");
const ecoScore = document.getElementById("ecoScore");

const sampleScenario = {
  window: "2026-02-26 08:00 - 18:00 UTC",
  concurrency: 420,
  target: 72
};

const signalCatalog = [
  {
    label: "CPU saturation drift",
    detail: "Compute usage trending above baseline.",
    weight: 28
  },
  {
    label: "Memory headroom",
    detail: "Available memory could be reduced safely.",
    weight: 18
  },
  {
    label: "Burst traffic spike",
    detail: "Forecasted surge over the next 2 hours.",
    weight: 32
  },
  {
    label: "Idle instance pool",
    detail: "5 nodes are under 20% utilization.",
    weight: 20
  }
];

const policyPlans = {
  stable: [
    "Hold current node count and monitor burst windows.",
    "Shift low-priority jobs to spot capacity.",
    "Enable predictive autoscaling for the next 4 hours." 
  ],
  optimize: [
    "Scale down idle nodes and rebalance workloads.",
    "Increase bin-packing efficiency with workload migration.",
    "Apply adaptive CPU caps on batch workloads." 
  ],
  burst: [
    "Pre-warm 3 additional nodes for burst coverage.",
    "Increase queue concurrency limits temporarily.",
    "Enable rapid rollback if latency exceeds SLO." 
  ]
};

function renderSignals(signals) {
  signalsContainer.innerHTML = "";
  signals.forEach((signal) => {
    const card = document.createElement("div");
    card.className = "signal-card";
    card.innerHTML = `
      <strong>${signal.label}</strong>
      <span>${signal.detail}</span>
      <span>Impact weight: ${signal.weight}</span>
    `;
    signalsContainer.appendChild(card);
  });
}

function renderPlan(tier, notes) {
  planList.innerHTML = "";
  const steps = policyPlans[tier] || [];
  steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    planList.appendChild(item);
  });

  if (notes) {
    const noteItem = document.createElement("li");
    noteItem.textContent = `Forecast window: ${notes}`;
    planList.appendChild(noteItem);
  }
}

function appendTimeline(entry) {
  const card = document.createElement("div");
  card.className = "timeline-card";
  card.innerHTML = `
    <strong>${entry.tier}</strong>
    <p>Window: ${entry.window}</p>
    <p>Concurrency: ${entry.concurrency}</p>
  `;

  const empty = timelineList.querySelector(".timeline__empty");
  if (empty) {
    timelineList.innerHTML = "";
  }
  timelineList.prepend(card);
}

function computeScores(concurrency, target) {
  const utilization = Math.min(95, Math.max(40, Math.round(target + (concurrency / 18))));
  const cost = Math.max(-18, Math.min(12, Math.round((75 - utilization) / 4)));
  const eco = Math.max(60, Math.min(98, Math.round(100 - Math.abs(78 - utilization))));

  return { utilization, cost, eco };
}

function runOptimizer() {
  const windowValue = windowInput.value.trim();
  const concurrency = Number(concurrencyInput.value);
  const target = Number(targetInput.value || 70);

  if (!windowValue || !concurrency) {
    utilizationValue.textContent = "—";
    costDelta.textContent = "Missing inputs";
    ecoScore.textContent = "—";
    return;
  }

  const { utilization, cost, eco } = computeScores(concurrency, target);
  utilizationValue.textContent = `${utilization}%`;
  utilizationValue.style.color = utilization > 80 ? "#ff8674" : "#4fd6b8";
  costDelta.textContent = `${cost > 0 ? "+" : ""}${cost}%`;
  costDelta.style.color = cost > 0 ? "#ff8674" : "#4fd6b8";
  ecoScore.textContent = `${eco}`;
  ecoScore.style.color = eco > 85 ? "#4fd6b8" : "#f3b564";

  const tier = utilization > 82 ? "burst" : utilization < 65 ? "optimize" : "stable";
  const signals = signalCatalog.slice(0, tier === "stable" ? 2 : 4);

  renderSignals(signals);
  renderPlan(tier, windowValue);

  appendTimeline({
    tier: tier.toUpperCase(),
    window: windowValue,
    concurrency
  });
}

optimizeBtn.addEventListener("click", runOptimizer);
loadSampleBtn.addEventListener("click", () => {
  windowInput.value = sampleScenario.window;
  concurrencyInput.value = sampleScenario.concurrency;
  targetInput.value = sampleScenario.target;
  runOptimizer();
});

renderSignals(signalCatalog.slice(0, 2));
renderPlan("stable", "");
