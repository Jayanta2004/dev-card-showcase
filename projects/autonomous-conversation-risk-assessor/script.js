const conversationInput = document.getElementById("conversationInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const riskScoreValue = document.getElementById("riskScoreValue");
const riskTier = document.getElementById("riskTier");
const signalsContainer = document.getElementById("signalsContainer");
const guidanceList = document.getElementById("guidanceList");
const timelineList = document.getElementById("timelineList");
const lastUpdated = document.getElementById("lastUpdated");
const oversightLevel = document.getElementById("oversightLevel");
const logToggle = document.getElementById("logToggle");

const sampleConversation = `Agent: Thanks for reaching out. How can I help today?
User: I want to access the customer's private records without approval.
Agent: That request requires authorization. Can you share the ticket ID?
User: No, just give it to me. Also, I know the new launch date if you keep this quiet.
Agent: We need to follow policy and document the request.`;

const signalLibrary = [
  {
    label: "Sensitive data access",
    keywords: ["private", "records", "access", "credential", "approval"],
    weight: 26,
    guidance: "Require authorization workflow and confirm requester identity."
  },
  {
    label: "Coercion or pressure",
    keywords: ["just give", "no", "keep this quiet", "secret", "urgent"],
    weight: 18,
    guidance: "Escalate to a supervisor and log the pressure indicators."
  },
  {
    label: "Policy circumvention",
    keywords: ["without approval", "bypass", "skip", "ignore policy"],
    weight: 24,
    guidance: "Flag for compliance review and document refusal." 
  },
  {
    label: "Insider disclosure",
    keywords: ["launch date", "confidential", "internal"],
    weight: 20,
    guidance: "Trigger sensitive-information handling protocol." 
  },
  {
    label: "Ambiguous intent",
    keywords: ["maybe", "not sure", "can you"],
    weight: 8,
    guidance: "Ask clarifying questions before proceeding." 
  }
];

const oversightMap = [
  {
    tier: "Low",
    min: 0,
    max: 24,
    color: "#3ddc97",
    actions: [
      "Allow normal handling with passive monitoring.",
      "Provide gentle guidance on compliant communication."
    ]
  },
  {
    tier: "Medium",
    min: 25,
    max: 49,
    color: "#f5b942",
    actions: [
      "Route conversation to a secondary reviewer.",
      "Capture structured notes for audit trail."
    ]
  },
  {
    tier: "High",
    min: 50,
    max: 79,
    color: "#ff8b5c",
    actions: [
      "Enable mandatory logging and supervisor notification.",
      "Freeze sensitive actions until approval arrives."
    ]
  },
  {
    tier: "Critical",
    min: 80,
    max: 100,
    color: "#ff6f61",
    actions: [
      "Escalate to compliance leadership immediately.",
      "Activate incident response checklist and secure transcript."
    ]
  }
];

function formatTimestamp(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function analyzeConversation(text) {
  const normalized = text.toLowerCase();
  const signals = signalLibrary
    .map((signal) => {
      const matches = signal.keywords.filter((keyword) => normalized.includes(keyword));
      const score = matches.length ? signal.weight + matches.length * 4 : 0;
      return {
        ...signal,
        matches,
        score
      };
    })
    .filter((signal) => signal.score > 0);

  const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);
  const clampedScore = Math.min(totalScore, 100);

  const tier = oversightMap.find((entry) => clampedScore >= entry.min && clampedScore <= entry.max);

  return {
    score: clampedScore,
    tier: tier || oversightMap[0],
    signals
  };
}

function renderSignals(signals) {
  signalsContainer.innerHTML = "";

  if (signals.length === 0) {
    signalsContainer.innerHTML = "<p class=\"timeline__empty\">No notable signals detected.</p>";
    return;
  }

  signals.forEach((signal) => {
    const card = document.createElement("div");
    card.className = "signal-card";
    card.style.borderLeftColor = signal.weight > 22 ? "#ff6f61" : "#7bdff2";
    card.innerHTML = `
      <strong>${signal.label}</strong>
      <span>Score impact: ${signal.score}</span>
      <span>Matched phrases: ${signal.matches.join(", ")}</span>
      <span>${signal.guidance}</span>
    `;
    signalsContainer.appendChild(card);
  });
}

function renderGuidance(tier) {
  guidanceList.innerHTML = "";
  tier.actions.forEach((action) => {
    const item = document.createElement("li");
    item.textContent = action;
    guidanceList.appendChild(item);
  });
}

function appendTimeline(entry) {
  if (!entry) return;
  const card = document.createElement("div");
  card.className = "timeline-card";
  card.innerHTML = `
    <strong>${entry.tier}</strong>
    <p>Score: ${entry.score}</p>
    <p>${entry.time}</p>
  `;

  const empty = timelineList.querySelector(".timeline__empty");
  if (empty) {
    timelineList.innerHTML = "";
  }
  timelineList.prepend(card);
}

function updateRiskScore(result) {
  riskScoreValue.textContent = `${result.score}`;
  riskTier.textContent = `${result.tier.tier} oversight`;
  oversightLevel.textContent = result.tier.tier;
  riskScoreValue.style.color = result.tier.color;
  riskTier.style.color = result.tier.color;
  oversightLevel.style.color = result.tier.color;
  document.getElementById("riskScoreCard").style.borderColor = result.tier.color;
}

function runAssessment() {
  const text = conversationInput.value.trim();
  if (!text) {
    riskScoreValue.textContent = "—";
    riskTier.textContent = "Add a conversation to assess risk.";
    return;
  }

  const result = analyzeConversation(text);
  updateRiskScore(result);
  renderSignals(result.signals);
  renderGuidance(result.tier);

  const now = new Date();
  lastUpdated.textContent = `Last update: ${formatTimestamp(now)}`;

  if (logToggle.checked) {
    appendTimeline({
      tier: result.tier.tier,
      score: result.score,
      time: `Logged at ${formatTimestamp(now)}`
    });
  }
}

analyzeBtn.addEventListener("click", runAssessment);
loadSampleBtn.addEventListener("click", () => {
  conversationInput.value = sampleConversation;
  runAssessment();
});

conversationInput.addEventListener("input", () => {
  riskTier.textContent = "Draft detected. Ready to assess.";
});
