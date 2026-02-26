const STORAGE_KEY = "crowdsourced_accessibility_feedback_tool_v1";

const state = {
  reports: []
};

const ui = {
  reportForm: document.getElementById("reportForm"),
  productName: document.getElementById("productName"),
  pageUrl: document.getElementById("pageUrl"),
  issueType: document.getElementById("issueType"),
  severity: document.getElementById("severity"),
  assistiveTech: document.getElementById("assistiveTech"),
  screenshotUrl: document.getElementById("screenshotUrl"),
  description: document.getElementById("description"),
  hint: document.getElementById("hint"),
  totalReports: document.getElementById("totalReports"),
  criticalCount: document.getElementById("criticalCount"),
  openCount: document.getElementById("openCount"),
  avgPriority: document.getElementById("avgPriority"),
  priorityQueue: document.getElementById("priorityQueue"),
  typeBars: document.getElementById("typeBars"),
  reportRows: document.getElementById("reportRows"),
  demoBtn: document.getElementById("demoBtn"),
  clearBtn: document.getElementById("clearBtn")
};

init();

function init() {
  hydrate();
  bind();
  render();
}

function bind() {
  ui.reportForm.addEventListener("submit", onSaveReport);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
}

function onSaveReport(event) {
  event.preventDefault();

  const report = {
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productName: ui.productName.value.trim(),
    pageUrl: ui.pageUrl.value.trim(),
    issueType: ui.issueType.value,
    severity: ui.severity.value,
    assistiveTech: ui.assistiveTech.value,
    screenshotUrl: ui.screenshotUrl.value.trim(),
    description: ui.description.value.trim(),
    upvotes: 1,
    status: "Open",
    createdAt: new Date().toISOString()
  };

  if (!report.productName || !report.pageUrl || !report.description) {
    setHint("Product, URL, and description are required.", true);
    return;
  }

  report.priorityScore = computePriority(report);

  state.reports.unshift(report);
  persist();
  render();

  ui.reportForm.reset();
  setHint("Accessibility issue published.", false);
}

function computePriority(report) {
  const sev = report.severity === "critical" ? 70 : report.severity === "high" ? 50 : report.severity === "medium" ? 30 : 15;
  const voteWeight = Math.min(25, report.upvotes * 2.5);
  const techWeight = /NVDA|JAWS|VoiceOver|TalkBack/.test(report.assistiveTech) ? 8 : 3;
  return clamp(Math.round(sev + voteWeight + techWeight), 0, 100);
}

function render() {
  renderStats();
  renderQueue();
  renderIssueTypeBars();
  renderRows();
}

function renderStats() {
  ui.totalReports.textContent = String(state.reports.length);
  ui.criticalCount.textContent = String(state.reports.filter((r) => r.severity === "critical").length);
  ui.openCount.textContent = String(state.reports.filter((r) => r.status !== "Resolved").length);
  ui.avgPriority.textContent = state.reports.length ? avg(state.reports.map((r) => r.priorityScore)).toFixed(1) : "0.0";
}

function renderQueue() {
  ui.priorityQueue.innerHTML = "";

  if (!state.reports.length) {
    addQueue("No reports yet.");
    return;
  }

  state.reports
    .slice()
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 6)
    .forEach((r) => {
      addQueue(`${r.productName} - ${r.issueType} (${r.severity}) | Priority ${r.priorityScore} | ${r.upvotes} upvotes`);
    });
}

function addQueue(text) {
  const li = document.createElement("li");
  li.textContent = text;
  ui.priorityQueue.appendChild(li);
}

function renderIssueTypeBars() {
  ui.typeBars.innerHTML = "";

  if (!state.reports.length) {
    ui.typeBars.innerHTML = '<p class="hint">No issue-type data yet.</p>';
    return;
  }

  const counts = {};
  state.reports.forEach((r) => { counts[r.issueType] = (counts[r.issueType] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map((e) => e[1]));

  entries.forEach(([name, count]) => {
    const pct = Math.round((count / max) * 100);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${escapeHtml(name)}</span>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <strong>${count}</strong>
    `;
    ui.typeBars.appendChild(row);
  });
}

function renderRows() {
  ui.reportRows.innerHTML = "";

  if (!state.reports.length) {
    ui.reportRows.innerHTML = '<tr><td colspan="8">No accessibility reports yet.</td></tr>';
    return;
  }

  state.reports
    .slice()
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><a href="${escapeAttr(r.pageUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.productName)}</a></td>
        <td>${escapeHtml(r.issueType)}</td>
        <td>${severityPill(r.severity)}</td>
        <td>${escapeHtml(r.assistiveTech)}</td>
        <td>${r.upvotes}</td>
        <td>${r.priorityScore}</td>
        <td>
          <select data-status="${r.id}">
            <option value="Open" ${r.status === "Open" ? "selected" : ""}>Open</option>
            <option value="In Review" ${r.status === "In Review" ? "selected" : ""}>In Review</option>
            <option value="Planned" ${r.status === "Planned" ? "selected" : ""}>Planned</option>
            <option value="Resolved" ${r.status === "Resolved" ? "selected" : ""}>Resolved</option>
          </select>
        </td>
        <td>
          <button class="btn btn-soft" type="button" data-upvote="${r.id}">Upvote</button>
          ${r.screenshotUrl ? `<a class="btn btn-ghost" href="${escapeAttr(r.screenshotUrl)}" target="_blank" rel="noopener noreferrer">Shot</a>` : ""}
        </td>
      `;
      ui.reportRows.appendChild(tr);
    });

  ui.reportRows.querySelectorAll("[data-upvote]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-upvote");
      const item = state.reports.find((x) => x.id === id);
      if (!item) return;
      item.upvotes += 1;
      item.priorityScore = computePriority(item);
      persist();
      render();
    });
  });

  ui.reportRows.querySelectorAll("[data-status]").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const id = sel.getAttribute("data-status");
      const item = state.reports.find((x) => x.id === id);
      if (!item) return;
      item.status = e.target.value;
      persist();
      renderStats();
    });
  });
}

function severityPill(level) {
  if (level === "critical") return '<span class="pill pill-critical">critical</span>';
  if (level === "high") return '<span class="pill pill-high">high</span>';
  if (level === "medium") return '<span class="pill pill-medium">medium</span>';
  return '<span class="pill pill-low">low</span>';
}

function loadDemo() {
  state.reports = [
    sample("Acme Pay", "https://acmepay.example/checkout", "Forms & Labels", "critical", "NVDA", "Card form fields unlabeled for screen readers.", "https://images.example/a11y1.png", 12, "Open"),
    sample("Orbit LMS", "https://orbitlms.example/course/42", "Keyboard Navigation", "high", "Keyboard only", "Cannot access lesson actions without mouse.", "", 8, "In Review"),
    sample("Nova Docs", "https://novadocs.example/editor", "Color Contrast", "medium", "Zoom/Text scaling", "Low contrast on sidebar controls.", "", 5, "Planned"),
    sample("Zen Health", "https://zenhealth.example/login", "Screen Reader", "critical", "VoiceOver", "Error alerts are not announced.", "https://images.example/a11y2.png", 15, "Open"),
    sample("Metro Events", "https://metro.example/tickets", "Touch Target", "high", "TalkBack", "Tap targets too small on mobile checkout.", "", 7, "Resolved")
  ];

  state.reports.forEach((r) => { r.priorityScore = computePriority(r); });
  persist();
  render();
  setHint("Demo reports loaded.", false);
}

function sample(productName, pageUrl, issueType, severity, assistiveTech, description, screenshotUrl, upvotes, status) {
  const s = {
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    productName,
    pageUrl,
    issueType,
    severity,
    assistiveTech,
    description,
    screenshotUrl,
    upvotes,
    status,
    createdAt: new Date().toISOString()
  };
  s.priorityScore = computePriority(s);
  return s;
}

function clearAll() {
  state.reports = [];
  localStorage.removeItem(STORAGE_KEY);
  render();
  setHint("All reports cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.reports)) {
      state.reports = parsed.reports.map((r) => ({ ...r, priorityScore: computePriority(r) }));
    }
  } catch (err) {
    console.error("hydrate failed", err);
  }
}

function setHint(text, isErr) {
  ui.hint.textContent = text;
  ui.hint.style.color = isErr ? "var(--danger)" : "var(--muted)";
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((s, n) => s + n, 0) / values.length;
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

function escapeAttr(input) {
  return escapeHtml(input).replace(/`/g, "&#96;");
}
