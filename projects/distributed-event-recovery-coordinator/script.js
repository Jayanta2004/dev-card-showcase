const windowInput = document.getElementById("windowInput");
const policySelect = document.getElementById("policySelect");
const notesInput = document.getElementById("notesInput");
const buildPlanBtn = document.getElementById("buildPlanBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const signalsContainer = document.getElementById("signalsContainer");
const planList = document.getElementById("planList");
const timelineList = document.getElementById("timelineList");
const logStatus = document.getElementById("logStatus");
const tierStatus = document.getElementById("tierStatus");
const pendingCount = document.getElementById("pendingCount");

const sampleScenario = {
  window: "2026-02-24 14:00 - 18:00 UTC",
  policy: "deterministic",
  notes: "Replay from partition 7 after consumer outage. Validate idempotency keys and isolate payment events."
};

const signalCatalog = [
  {
    label: "Consumer lag spike",
    detail: "Detected backlog beyond SLA threshold.",
    severity: "High",
    weight: 32
  },
  {
    label: "Ordering gap",
    detail: "Out-of-order offsets detected in partition 7.",
    severity: "Medium",
    weight: 22
  },
  {
    label: "Failed retry budget",
    detail: "Retry attempts exceeded configured limit.",
    severity: "High",
    weight: 26
  },
  {
    label: "Partial write risk",
    detail: "Downstream datastore reported partial commit.",
    severity: "Critical",
    weight: 36
  }
];

const policyGuidance = {
  deterministic: [
    "Lock replay window and snapshot offsets before reprocessing.",
    "Rehydrate state stores using durable log events.",
    "Validate checksum consistency after replay." 
  ],
  idempotent: [
    "Ensure idempotency keys are enforced in all consumers.",
    "Reprocess events in batches with duplicate detection.",
    "Emit reconciliation metrics for each batch." 
  ],
  compensating: [
    "Identify impacted aggregates and generate compensating events.",
    "Notify downstream services of corrective actions.",
    "Run balance checks to confirm remediation." 
  ]
};

function renderSignals(signals) {
  signalsContainer.innerHTML = "";
  signals.forEach((signal) => {
    const card = document.createElement("div");
    card.className = "signal-card";
    card.style.borderLeftColor = signal.severity === "Critical" ? "#ff7a63" : "#3dd9c6";
    card.innerHTML = `
      <strong>${signal.label}</strong>
      <span>${signal.detail}</span>
      <span>Severity: ${signal.severity} | Weight: ${signal.weight}</span>
    `;
    signalsContainer.appendChild(card);
  });
}

function renderPlan(policy, notes) {
  planList.innerHTML = "";
  const steps = policyGuidance[policy] || [];
  steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    planList.appendChild(item);
  });

  if (notes) {
    const notesItem = document.createElement("li");
    notesItem.textContent = `Notes: ${notes}`;
    planList.appendChild(notesItem);
  }
}

function appendTimeline(entry) {
  const card = document.createElement("div");
  card.className = "timeline-card";
  card.innerHTML = `
    <strong>${entry.policyLabel}</strong>
    <p>Window: ${entry.window}</p>
    <p>Pending replay: ${entry.pending}</p>
  `;

  const empty = timelineList.querySelector(".timeline__empty");
  if (empty) {
    timelineList.innerHTML = "";
  }
  timelineList.prepend(card);
}

function buildRecoveryPlan() {
  const windowValue = windowInput.value.trim();
  if (!windowValue) {
    logStatus.textContent = "Awaiting window";
    tierStatus.textContent = "Incomplete";
    return;
  }

  const policy = policySelect.value;
  const notes = notesInput.value.trim();
  const signals = signalCatalog.slice(0, policy === "compensating" ? 3 : 4);

  renderSignals(signals);
  renderPlan(policy, notes);

  const totalWeight = signals.reduce((sum, item) => sum + item.weight, 0);
  pendingCount.textContent = Math.max(2, Math.round(totalWeight / 18));

  tierStatus.textContent = totalWeight > 90 ? "Critical" : totalWeight > 60 ? "Elevated" : "Stable";
  logStatus.textContent = "Captured";

  appendTimeline({
    policyLabel: policySelect.options[policySelect.selectedIndex].text,
    window: windowValue,
    pending: pendingCount.textContent
  });
}

buildPlanBtn.addEventListener("click", buildRecoveryPlan);
loadSampleBtn.addEventListener("click", () => {
  windowInput.value = sampleScenario.window;
  policySelect.value = sampleScenario.policy;
  notesInput.value = sampleScenario.notes;
  buildRecoveryPlan();
});

renderSignals(signalCatalog.slice(0, 2));
renderPlan("deterministic", "");
