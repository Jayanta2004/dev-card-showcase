const STORAGE_KEY = "freelance_contract_risk_scanner_v1";

const state = {
  contractText: "",
  findings: [],
  checklist: [],
  summary: ""
};

const rules = [
  {
    key: "payment",
    label: "Payment Terms",
    pattern: /(payment upon completion|net\s*60|net\s*90|no refunds|sole discretion for payment|invoice after final delivery)/i,
    risk: 20,
    finding: "Payment terms may delay or weaken freelancer cashflow.",
    suggestion: "Add milestone payments (e.g., 50% upfront, 50% on delivery) with late-fee clause."
  },
  {
    key: "scope",
    label: "Scope Creep",
    pattern: /(any additional requests included|unlimited revisions|as needed without extra cost|scope may change at any time)/i,
    risk: 18,
    finding: "Scope language may allow unpaid extra work.",
    suggestion: "Define deliverables and add change-request process with separate pricing."
  },
  {
    key: "liability",
    label: "Liability",
    pattern: /(unlimited liability|indemnify client for any damages|liable for all losses|consequential damages)/i,
    risk: 22,
    finding: "Liability exposure is high and potentially uncapped.",
    suggestion: "Cap liability to fees paid under this contract and exclude consequential damages."
  },
  {
    key: "termination",
    label: "Termination",
    pattern: /(terminate at any time without notice|no payment for partial work|client may cancel without compensation)/i,
    risk: 16,
    finding: "Termination terms may not protect completed or in-progress work.",
    suggestion: "Require notice period and pro-rata payment for completed work at termination."
  },
  {
    key: "ip",
    label: "IP Transfer",
    pattern: /(all rights transfer before full payment|work for hire from day one without payment)/i,
    risk: 14,
    finding: "IP transfer before payment may reduce leverage.",
    suggestion: "Transfer IP only after full payment is received."
  },
  {
    key: "nda",
    label: "Confidentiality Scope",
    pattern: /(confidentiality in perpetuity without exception|any information is confidential)/i,
    risk: 8,
    finding: "Confidentiality clause may be too broad or indefinite.",
    suggestion: "Limit confidentiality to defined categories and reasonable duration."
  }
];

const ui = {
  contractText: document.getElementById("contractText"),
  hint: document.getElementById("hint"),
  scanBtn: document.getElementById("scanBtn"),
  demoBtn: document.getElementById("demoBtn"),
  clearBtn: document.getElementById("clearBtn"),
  overallRisk: document.getElementById("overallRisk"),
  paymentFlags: document.getElementById("paymentFlags"),
  scopeFlags: document.getElementById("scopeFlags"),
  legalFlags: document.getElementById("legalFlags"),
  findingsList: document.getElementById("findingsList"),
  checklistBox: document.getElementById("checklistBox"),
  summaryOutput: document.getElementById("summaryOutput"),
  copySummaryBtn: document.getElementById("copySummaryBtn")
};

init();

function init() {
  hydrate();
  bind();
  render();
}

function bind() {
  ui.scanBtn.addEventListener("click", scanContract);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
  ui.copySummaryBtn.addEventListener("click", copySummary);
  ui.contractText.addEventListener("input", () => {
    state.contractText = ui.contractText.value;
    persist();
  });
}

function scanContract() {
  const text = ui.contractText.value.trim();
  if (!text) {
    setHint("Paste contract text before scanning.", true);
    return;
  }

  const findings = [];
  const checklist = [];
  let risk = 0;

  rules.forEach((rule) => {
    if (rule.pattern.test(text)) {
      findings.push({ category: rule.label, message: rule.finding, risk: rule.risk, suggestion: rule.suggestion });
      checklist.push({ done: false, text: rule.suggestion });
      risk += rule.risk;
    }
  });

  if (!/payment schedule|milestone|upfront|deposit/i.test(text)) {
    findings.push({ category: "Payment Terms", message: "No clear payment schedule found.", risk: 14, suggestion: "Add a dated payment schedule with milestones." });
    checklist.push({ done: false, text: "Insert milestone payment schedule." });
    risk += 14;
  }

  if (!/scope|deliverables|revision/i.test(text)) {
    findings.push({ category: "Scope", message: "Deliverables/scope definition appears weak.", risk: 12, suggestion: "Define exact deliverables and revision limits." });
    checklist.push({ done: false, text: "Define deliverables + revision cap." });
    risk += 12;
  }

  if (!/termination|notice/i.test(text)) {
    findings.push({ category: "Termination", message: "No explicit termination notice process found.", risk: 10, suggestion: "Add notice period and final settlement process." });
    checklist.push({ done: false, text: "Add termination notice + final payment clause." });
    risk += 10;
  }

  const normalizedRisk = clamp(risk, 0, 100);
  const summary = buildCleanSummary(text, findings);

  state.contractText = text;
  state.findings = findings;
  state.checklist = checklist;
  state.summary = summary;
  persist();
  render();
  setHint("Contract scanned successfully.", false);
}

function buildCleanSummary(text, findings) {
  const hasDeposit = /deposit|upfront|advance/i.test(text);
  const hasMilestones = /milestone/i.test(text);
  const hasTermination = /termination|notice/i.test(text);
  const hasIP = /intellectual property|ip|ownership/i.test(text);

  return [
    "Client Contract Summary (Cleaner Version)",
    "",
    `1. Payment: ${hasDeposit ? "Includes upfront/deposit terms." : "Should include upfront payment."} ${hasMilestones ? "Milestone-based payouts referenced." : "Add milestone payout schedule."}`,
    "2. Scope: Deliverables and revision limits should be explicitly documented with paid change requests.",
    `3. Liability: Keep freelancer liability capped and exclude consequential damages.${findings.some((f) => /Liability/.test(f.category)) ? " (Risk detected in current draft.)" : ""}`,
    `4. Termination: ${hasTermination ? "Termination process mentioned." : "Add notice period and pro-rata payment on termination."}`,
    `5. IP Transfer: ${hasIP ? "IP ownership clause present; ensure transfer after full payment." : "Add IP transfer clause tied to full payment."}`,
    "",
    "Recommended next step: apply checklist edits and confirm changes with client before signing."
  ].join("\n");
}

function render() {
  ui.contractText.value = state.contractText || "";
  renderScores();
  renderFindings();
  renderChecklist();
  ui.summaryOutput.value = state.summary || "";
}

function renderScores() {
  const payment = state.findings.filter((f) => /Payment/.test(f.category)).length;
  const scope = state.findings.filter((f) => /Scope/.test(f.category)).length;
  const legal = state.findings.filter((f) => /Liability|Termination|IP|Confidentiality/.test(f.category)).length;
  const totalRisk = clamp(state.findings.reduce((s, f) => s + f.risk, 0), 0, 100);

  ui.overallRisk.textContent = `${totalRisk}/100`;
  ui.overallRisk.style.color = totalRisk >= 70 ? "var(--danger)" : totalRisk >= 45 ? "var(--warn)" : "var(--ok)";
  ui.paymentFlags.textContent = String(payment);
  ui.scopeFlags.textContent = String(scope);
  ui.legalFlags.textContent = String(legal);
}

function renderFindings() {
  ui.findingsList.innerHTML = "";
  if (!state.findings.length) {
    const li = document.createElement("li");
    li.textContent = "No findings yet. Run scan to review risks.";
    ui.findingsList.appendChild(li);
    return;
  }

  state.findings.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = `${f.category}: ${f.message} (Risk +${f.risk})`;
    ui.findingsList.appendChild(li);
  });
}

function renderChecklist() {
  ui.checklistBox.innerHTML = "";
  if (!state.checklist.length) {
    ui.checklistBox.innerHTML = '<p class="hint">Checklist will appear after scan.</p>';
    return;
  }

  state.checklist.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "check-item";
    row.innerHTML = `
      <label>
        <input type="checkbox" data-check="${idx}" ${item.done ? "checked" : ""}>
        <span>${escapeHtml(item.text)}</span>
      </label>
    `;
    ui.checklistBox.appendChild(row);
  });

  ui.checklistBox.querySelectorAll("[data-check]").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const idx = Number(cb.getAttribute("data-check"));
      state.checklist[idx].done = e.target.checked;
      persist();
    });
  });
}

function copySummary() {
  if (!state.summary) {
    setHint("No summary yet. Run scan first.", true);
    return;
  }

  navigator.clipboard.writeText(state.summary)
    .then(() => setHint("Summary copied.", false))
    .catch(() => setHint("Clipboard not available here.", true));
}

function loadDemo() {
  const demo = [
    "Payment upon completion of all work. Net 60 terms apply.",
    "Unlimited revisions are included and additional requests may be made as needed without extra cost.",
    "Contractor agrees to indemnify client for any damages and accepts unlimited liability.",
    "Client may terminate at any time without notice and no payment for partial work will be owed.",
    "All rights transfer before full payment."
  ].join("\n");

  ui.contractText.value = demo;
  state.contractText = demo;
  scanContract();
}

function clearAll() {
  state.contractText = "";
  state.findings = [];
  state.checklist = [];
  state.summary = "";
  localStorage.removeItem(STORAGE_KEY);
  render();
  setHint("Scanner cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.contractText === "string") state.contractText = parsed.contractText;
    if (Array.isArray(parsed.findings)) state.findings = parsed.findings;
    if (Array.isArray(parsed.checklist)) state.checklist = parsed.checklist;
    if (typeof parsed.summary === "string") state.summary = parsed.summary;
  } catch (err) {
    console.error("hydrate failed", err);
  }
}

function setHint(text, isErr) {
  ui.hint.textContent = text;
  ui.hint.style.color = isErr ? "var(--danger)" : "var(--muted)";
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
