const signatureInput = document.getElementById("signatureInput");
const contextInput = document.getElementById("contextInput");
const mitigateBtn = document.getElementById("mitigateBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const signalsContainer = document.getElementById("signalsContainer");
const planList = document.getElementById("planList");
const timelineList = document.getElementById("timelineList");
const severityValue = document.getElementById("severityValue");
const pathValue = document.getElementById("pathValue");
const confidenceValue = document.getElementById("confidenceValue");

const sampleContext = {
  signature: "TimeoutError: redis.read",
  context: "CPU 92%, retries exhausted, queue depth 3k, latency 1.8s"
};

const patternCatalog = [
  {
    label: "Upstream latency surge",
    detail: "Multiple timeouts detected within 5 minutes.",
    severity: "High",
    weight: 32,
    workflow: [
      "Shift traffic to warm standby cache cluster.",
      "Throttle non-critical read requests.",
      "Replay failed requests with jittered backoff." 
    ]
  },
  {
    label: "Resource saturation",
    detail: "CPU and memory near saturation thresholds.",
    severity: "Medium",
    weight: 22,
    workflow: [
      "Scale compute pool by 2 nodes.",
      "Pause batch workloads until recovery completes." 
    ]
  },
  {
    label: "Queue backlog escalation",
    detail: "Queue depth exceeds adaptive threshold.",
    severity: "High",
    weight: 28,
    workflow: [
      "Enable priority lanes for critical jobs.",
      "Drain backlog with temporary worker surge." 
    ]
  },
  {
    label: "Dependency instability",
    detail: "Multiple retry budgets consumed across services.",
    severity: "Critical",
    weight: 36,
    workflow: [
      "Freeze non-essential workflows and notify on-call.",
      "Trigger circuit breaker for failing dependency." 
    ]
  }
];

function renderSignals(signals) {
  signalsContainer.innerHTML = "";
  if (signals.length === 0) {
    signalsContainer.innerHTML = "<p class=\"timeline__empty\">No context patterns matched.</p>";
    return;
  }

  signals.forEach((signal) => {
    const card = document.createElement("div");
    card.className = "signal-card";
    card.style.borderLeftColor = signal.severity === "Critical" ? "#ff7b6b" : "#6bc2ff";
    card.innerHTML = `
      <strong>${signal.label}</strong>
      <span>${signal.detail}</span>
      <span>Severity: ${signal.severity} | Weight: ${signal.weight}</span>
    `;
    signalsContainer.appendChild(card);
  });
}

function renderPlan(workflows) {
  planList.innerHTML = "";
  workflows.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    planList.appendChild(item);
  });
}

function appendTimeline(entry) {
  const card = document.createElement("div");
  card.className = "timeline-card";
  card.innerHTML = `
    <strong>${entry.signature}</strong>
    <p>Severity: ${entry.severity}</p>
    <p>Path: ${entry.path}</p>
  `;

  const empty = timelineList.querySelector(".timeline__empty");
  if (empty) {
    timelineList.innerHTML = "";
  }
  timelineList.prepend(card);
}

function deriveWorkflow(signals) {
  const workflows = signals.flatMap((signal) => signal.workflow);
  return [...new Set(workflows)];
}

function computeConfidence(totalWeight) {
  if (totalWeight >= 80) return "92%";
  if (totalWeight >= 60) return "84%";
  if (totalWeight >= 40) return "73%";
  return "60%";
}

function runMitigation() {
  const signature = signatureInput.value.trim();
  const context = contextInput.value.toLowerCase().trim();

  if (!signature || !context) {
    severityValue.textContent = "—";
    pathValue.textContent = "Missing inputs";
    confidenceValue.textContent = "—";
    return;
  }

  const signals = patternCatalog.filter((pattern) =>
    pattern.label.toLowerCase().includes("latency") ||
    context.includes("timeout") ||
    context.includes("latency") ||
    context.includes("retries") ||
    context.includes("queue") ||
    context.includes("cpu")
  );

  const totalWeight = signals.reduce((sum, item) => sum + item.weight, 0);
  const severity = totalWeight > 90 ? "Critical" : totalWeight > 60 ? "High" : "Elevated";
  const path = severity === "Critical" ? "Incident response" : severity === "High" ? "Adaptive recovery" : "Guided remediation";

  severityValue.textContent = severity;
  severityValue.style.color = severity === "Critical" ? "#ff7b6b" : "#f3b264";
  pathValue.textContent = path;
  confidenceValue.textContent = computeConfidence(totalWeight);

  renderSignals(signals);
  renderPlan(deriveWorkflow(signals));

  appendTimeline({
    signature,
    severity,
    path
  });
}

mitigateBtn.addEventListener("click", runMitigation);
loadSampleBtn.addEventListener("click", () => {
  signatureInput.value = sampleContext.signature;
  contextInput.value = sampleContext.context;
  runMitigation();
});

renderSignals(patternCatalog.slice(0, 2));
renderPlan(patternCatalog[0].workflow);
