const STORAGE_KEY = "community_problem_map_v1";

const state = {
  issues: []
};

const statusFlow = ["Open", "In Progress", "Resolved"];
const categories = ["Roads", "Waste", "Safety", "Water", "Traffic"];

const nodes = {
  issueForm: document.getElementById("issueForm"),
  title: document.getElementById("title"),
  category: document.getElementById("category"),
  description: document.getElementById("description"),
  lat: document.getElementById("lat"),
  lng: document.getElementById("lng"),
  reporter: document.getElementById("reporter"),
  geoBtn: document.getElementById("geoBtn"),
  formHint: document.getElementById("formHint"),
  loadDemoBtn: document.getElementById("loadDemoBtn"),
  clearBtn: document.getElementById("clearBtn"),
  totalIssues: document.getElementById("totalIssues"),
  openIssues: document.getElementById("openIssues"),
  progressIssues: document.getElementById("progressIssues"),
  resolvedIssues: document.getElementById("resolvedIssues"),
  priorityList: document.getElementById("priorityList"),
  trendBars: document.getElementById("trendBars"),
  issueFeed: document.getElementById("issueFeed"),
  heatmap: document.getElementById("heatmap")
};

init();

function init() {
  hydrate();
  bindEvents();
  render();
}

function bindEvents() {
  nodes.issueForm.addEventListener("submit", onPostIssue);
  nodes.geoBtn.addEventListener("click", useMyLocation);
  nodes.loadDemoBtn.addEventListener("click", loadDemo);
  nodes.clearBtn.addEventListener("click", clearAll);
}

function onPostIssue(event) {
  event.preventDefault();

  const issue = {
    id: `i_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: nodes.title.value.trim(),
    category: nodes.category.value,
    description: nodes.description.value.trim(),
    lat: Number(nodes.lat.value),
    lng: Number(nodes.lng.value),
    reporter: nodes.reporter.value.trim() || "Anonymous",
    upvotes: 1,
    status: "Open",
    createdAt: new Date().toISOString()
  };

  if (!issue.title || !issue.category || Number.isNaN(issue.lat) || Number.isNaN(issue.lng)) {
    setHint("Title, category, latitude, and longitude are required.", true);
    return;
  }

  state.issues.push(issue);
  persist();
  render();
  nodes.issueForm.reset();
  setHint("Issue posted successfully.", false);
}

function useMyLocation() {
  if (!navigator.geolocation) {
    setHint("Geolocation is not supported in this browser.", true);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      nodes.lat.value = pos.coords.latitude.toFixed(6);
      nodes.lng.value = pos.coords.longitude.toFixed(6);
      setHint("Location captured.", false);
    },
    () => setHint("Could not fetch location. Enter coordinates manually.", true),
    { enableHighAccuracy: true, timeout: 6000 }
  );
}

function render() {
  const sorted = sortByPriority(state.issues);
  renderMetrics(sorted);
  renderPriorityList(sorted);
  renderTrends(sorted);
  renderIssueFeed(sorted);
  drawHeatmap(sorted);
}

function renderMetrics(issues) {
  const open = issues.filter((i) => i.status === "Open").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;

  nodes.totalIssues.textContent = String(issues.length);
  nodes.openIssues.textContent = String(open);
  nodes.progressIssues.textContent = String(inProgress);
  nodes.resolvedIssues.textContent = String(resolved);
}

function renderPriorityList(issues) {
  nodes.priorityList.innerHTML = "";
  if (!issues.length) {
    const li = document.createElement("li");
    li.textContent = "No issues yet.";
    nodes.priorityList.appendChild(li);
    return;
  }

  issues.slice(0, 5).forEach((issue) => {
    const li = document.createElement("li");
    li.textContent = `${issue.title} (${issue.category}) - ${issue.upvotes} votes, ${issue.status}`;
    nodes.priorityList.appendChild(li);
  });
}

function renderTrends(issues) {
  const counts = Object.fromEntries(categories.map((c) => [c, 0]));
  issues.forEach((issue) => {
    counts[issue.category] = (counts[issue.category] || 0) + 1;
  });

  nodes.trendBars.innerHTML = "";
  const max = Math.max(1, ...Object.values(counts));

  categories.forEach((category) => {
    const value = counts[category] || 0;
    const pct = Math.round((value / max) * 100);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${category}</span>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <strong>${value}</strong>
    `;
    nodes.trendBars.appendChild(row);
  });
}

function renderIssueFeed(issues) {
  nodes.issueFeed.innerHTML = "";

  if (!issues.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No issues posted yet.";
    nodes.issueFeed.appendChild(empty);
    return;
  }

  issues.forEach((issue) => {
    const card = document.createElement("article");
    card.className = "issue-card";

    card.innerHTML = `
      <div class="issue-top">
        <div>
          <h4 class="issue-title">${escapeHtml(issue.title)}</h4>
          <p class="issue-meta">${escapeHtml(issue.reporter)} | ${formatDate(issue.createdAt)} | ${issue.lat.toFixed(4)}, ${issue.lng.toFixed(4)}</p>
        </div>
        <span class="pill pill-${issue.category.toLowerCase()}">${escapeHtml(issue.category)}</span>
      </div>
      <p class="issue-desc">${escapeHtml(issue.description || "No description provided.")}</p>
      <div class="card-actions">
        <button class="vote" data-vote-id="${issue.id}" type="button">Upvote (${issue.upvotes})</button>
        <select class="status" data-status-id="${issue.id}">
          ${statusFlow.map((s) => `<option value="${s}" ${s === issue.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
    `;

    nodes.issueFeed.appendChild(card);
  });

  nodes.issueFeed.querySelectorAll("[data-vote-id]").forEach((btn) => {
    btn.addEventListener("click", () => upvote(btn.getAttribute("data-vote-id")));
  });

  nodes.issueFeed.querySelectorAll("[data-status-id]").forEach((select) => {
    select.addEventListener("change", (event) => updateStatus(select.getAttribute("data-status-id"), event.target.value));
  });
}

function upvote(id) {
  const issue = state.issues.find((item) => item.id === id);
  if (!issue) return;
  issue.upvotes += 1;
  persist();
  render();
}

function updateStatus(id, status) {
  const issue = state.issues.find((item) => item.id === id);
  if (!issue) return;
  issue.status = status;
  persist();
  render();
}

function drawHeatmap(issues) {
  const canvas = nodes.heatmap;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(620, Math.floor(rect.width));
  const height = 360;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, width, height);
  drawMapBase(ctx, width, height);

  if (!issues.length) {
    ctx.fillStyle = "#4f657d";
    ctx.font = '600 14px "Manrope", sans-serif';
    ctx.fillText("No issue points yet.", 18, 28);
    return;
  }

  const latMin = Math.min(...issues.map((i) => i.lat));
  const latMax = Math.max(...issues.map((i) => i.lat));
  const lngMin = Math.min(...issues.map((i) => i.lng));
  const lngMax = Math.max(...issues.map((i) => i.lng));

  issues.forEach((issue) => {
    const x = scale(issue.lng, lngMin, lngMax, 28, width - 28);
    const y = scale(issue.lat, latMin, latMax, height - 28, 28);
    const radius = 10 + Math.min(24, issue.upvotes * 2.2);

    const gradient = ctx.createRadialGradient(x, y, 3, x, y, radius);
    gradient.addColorStop(0, "rgba(244, 108, 42, 0.50)");
    gradient.addColorStop(0.6, "rgba(244, 108, 42, 0.18)");
    gradient.addColorStop(1, "rgba(244, 108, 42, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(22, 40, 60, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#2f465f";
  ctx.font = '500 11px "IBM Plex Mono", monospace';
  ctx.fillText("Higher glow = denser / higher voted issue cluster", 14, height - 12);
}

function drawMapBase(ctx, width, height) {
  ctx.fillStyle = "#f9fcff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#e3edf7";
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const x = 20 + (i * (width - 40)) / 9;
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, height - 20);
    ctx.stroke();
  }
  for (let j = 0; j < 6; j += 1) {
    const y = 20 + (j * (height - 40)) / 5;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(width - 20, y);
    ctx.stroke();
  }
}

function loadDemo() {
  const now = Date.now();
  state.issues = [
    sampleIssue(now, "Potholes on Main St", "Roads", 19.0770, 72.8800, "Damaging bikes", 17, "Open", "Ward 4 resident"),
    sampleIssue(now - 1, "Garbage not collected", "Waste", 19.0831, 72.8772, "Overflow for 3 days", 12, "In Progress", "NGO volunteer"),
    sampleIssue(now - 2, "Broken streetlight", "Safety", 19.0742, 72.8686, "Dark crossing zone", 9, "Open", "Student group"),
    sampleIssue(now - 3, "Low water pressure", "Water", 19.0900, 72.8854, "Morning supply very weak", 14, "In Progress", "Local resident"),
    sampleIssue(now - 4, "Signal timing failure", "Traffic", 19.0712, 72.8920, "Heavy jams at peak", 19, "Open", "Commuter"),
    sampleIssue(now - 5, "Road cave-in risk", "Roads", 19.0964, 72.8732, "Visible cracks widening", 21, "Resolved", "Citizen reporter")
  ];
  persist();
  render();
  setHint("Demo dataset loaded.", false);
}

function sampleIssue(seed, title, category, lat, lng, description, upvotes, status, reporter) {
  return {
    id: `i_${seed}`,
    title,
    category,
    description,
    lat,
    lng,
    reporter,
    upvotes,
    status,
    createdAt: new Date(seed).toISOString()
  };
}

function clearAll() {
  state.issues = [];
  persist();
  render();
  setHint("All data cleared.", false);
}

function sortByPriority(issues) {
  return issues.slice().sort((a, b) => {
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.issues)) {
      state.issues = parsed.issues.map((issue) => ({
        ...issue,
        lat: Number(issue.lat),
        lng: Number(issue.lng),
        upvotes: Number(issue.upvotes) || 0
      }));
    }
  } catch (error) {
    console.error("hydrate failed", error);
  }
}

function setHint(message, isError) {
  nodes.formHint.textContent = message;
  nodes.formHint.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function scale(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return (outMin + outMax) / 2;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
