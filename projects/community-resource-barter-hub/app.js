const STORAGE_KEY = "community_resource_barter_hub_v1";

const state = {
  listings: []
};

const ui = {
  listingForm: document.getElementById("listingForm"),
  title: document.getElementById("title"),
  listingType: document.getElementById("listingType"),
  category: document.getElementById("category"),
  owner: document.getElementById("owner"),
  trust: document.getElementById("trust"),
  damagePolicy: document.getElementById("damagePolicy"),
  pickupDate: document.getElementById("pickupDate"),
  pickupTime: document.getElementById("pickupTime"),
  description: document.getElementById("description"),
  hint: document.getElementById("hint"),
  totalListings: document.getElementById("totalListings"),
  lendCount: document.getElementById("lendCount"),
  borrowCount: document.getElementById("borrowCount"),
  dueSoon: document.getElementById("dueSoon"),
  reminderList: document.getElementById("reminderList"),
  categoryBars: document.getElementById("categoryBars"),
  listingRows: document.getElementById("listingRows"),
  demoBtn: document.getElementById("demoBtn"),
  clearBtn: document.getElementById("clearBtn")
};

init();

function init() {
  hydrate();
  setDefaultDateTime();
  bind();
  render();
}

function bind() {
  ui.listingForm.addEventListener("submit", onSaveListing);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
}

function setDefaultDateTime() {
  const now = new Date();
  if (!ui.pickupDate.value) ui.pickupDate.value = now.toISOString().slice(0, 10);
  if (!ui.pickupTime.value) {
    now.setHours(now.getHours() + 2, 0, 0, 0);
    ui.pickupTime.value = now.toTimeString().slice(0, 5);
  }
}

function onSaveListing(event) {
  event.preventDefault();

  const item = {
    id: `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: ui.title.value.trim(),
    listingType: ui.listingType.value,
    category: ui.category.value,
    owner: ui.owner.value.trim(),
    trust: clamp(Number(ui.trust.value) || 1, 1, 5),
    damagePolicy: ui.damagePolicy.value,
    pickupDate: ui.pickupDate.value,
    pickupTime: ui.pickupTime.value,
    description: ui.description.value.trim(),
    status: "Scheduled"
  };

  if (!item.title || !item.owner || !item.pickupDate || !item.pickupTime) {
    setHint("Title, owner, pickup date, and pickup time are required.", true);
    return;
  }

  state.listings.unshift(item);
  persist();
  render();

  ui.listingForm.reset();
  setDefaultDateTime();
  setHint("Listing saved.", false);
}

function render() {
  renderStats();
  renderReminders();
  renderCategoryBars();
  renderRows();
}

function renderStats() {
  ui.totalListings.textContent = String(state.listings.length);
  ui.lendCount.textContent = String(state.listings.filter((l) => l.listingType === "lend").length);
  ui.borrowCount.textContent = String(state.listings.filter((l) => l.listingType === "borrow").length);

  const soon = state.listings.filter((l) => hoursUntilPickup(l) >= 0 && hoursUntilPickup(l) <= 24).length;
  ui.dueSoon.textContent = String(soon);
}

function renderReminders() {
  ui.reminderList.innerHTML = "";

  if (!state.listings.length) {
    appendReminder("No listings yet.");
    return;
  }

  const sorted = state.listings
    .map((l) => ({ ...l, h: hoursUntilPickup(l) }))
    .filter((l) => l.h >= -12)
    .sort((a, b) => a.h - b.h);

  if (!sorted.length) {
    appendReminder("No upcoming pickups.");
    return;
  }

  sorted.slice(0, 6).forEach((l) => {
    const timing = l.h < 0 ? `${Math.abs(Math.round(l.h))}h overdue` : `in ${Math.round(l.h)}h`;
    const action = l.h <= 2 ? "Send immediate reminder" : l.h <= 24 ? "Send day-before reminder" : "No reminder needed yet";
    appendReminder(`${l.title} (${l.owner}) ${timing}: ${action}.`);
  });
}

function appendReminder(text) {
  const li = document.createElement("li");
  li.textContent = text;
  ui.reminderList.appendChild(li);
}

function renderCategoryBars() {
  ui.categoryBars.innerHTML = "";

  if (!state.listings.length) {
    ui.categoryBars.innerHTML = '<p class="hint">No activity yet.</p>';
    return;
  }

  const counts = {};
  state.listings.forEach((l) => { counts[l.category] = (counts[l.category] || 0) + 1; });
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map((r) => r[1]));

  rows.forEach(([name, count]) => {
    const pct = Math.round((count / max) * 100);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${escapeHtml(name)}</span>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <strong>${count}</strong>
    `;
    ui.categoryBars.appendChild(row);
  });
}

function renderRows() {
  ui.listingRows.innerHTML = "";

  if (!state.listings.length) {
    ui.listingRows.innerHTML = '<tr><td colspan="8">No listings added yet.</td></tr>';
    return;
  }

  state.listings.forEach((l) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(l.title)}</td>
      <td>${escapeHtml(cap(l.listingType))}</td>
      <td>${escapeHtml(l.category)}</td>
      <td>${escapeHtml(l.owner)}</td>
      <td>${trustPill(l.trust)}</td>
      <td>${escapeHtml(policyLabel(l.damagePolicy))}</td>
      <td>${escapeHtml(`${l.pickupDate} ${l.pickupTime}`)}</td>
      <td>
        <select data-status="${l.id}">
          <option value="Scheduled" ${l.status === "Scheduled" ? "selected" : ""}>Scheduled</option>
          <option value="Picked Up" ${l.status === "Picked Up" ? "selected" : ""}>Picked Up</option>
          <option value="Returned" ${l.status === "Returned" ? "selected" : ""}>Returned</option>
          <option value="Issue Reported" ${l.status === "Issue Reported" ? "selected" : ""}>Issue Reported</option>
          <option value="Cancelled" ${l.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
    `;
    ui.listingRows.appendChild(tr);
  });

  ui.listingRows.querySelectorAll("[data-status]").forEach((s) => {
    s.addEventListener("change", (e) => {
      const id = s.getAttribute("data-status");
      const listing = state.listings.find((x) => x.id === id);
      if (!listing) return;
      listing.status = e.target.value;
      persist();
    });
  });
}

function trustPill(score) {
  if (score >= 4.2) return `<span class="pill pill-good">${score.toFixed(1)}</span>`;
  if (score >= 3) return `<span class="pill pill-mid">${score.toFixed(1)}</span>`;
  return `<span class="pill pill-low">${score.toFixed(1)}</span>`;
}

function policyLabel(v) {
  if (v === "gentle-use") return "Gentle use";
  if (v === "repair-or-replace") return "Repair/replace";
  if (v === "deposit-required") return "Deposit required";
  return "Owner discretion";
}

function hoursUntilPickup(l) {
  const t = new Date(`${l.pickupDate}T${l.pickupTime}:00`).getTime();
  return (t - Date.now()) / (1000 * 60 * 60);
}

function loadDemo() {
  state.listings = [
    sample("Cordless Drill", "lend", "Tools", "Ayaan", 4.8, "repair-or-replace", plusHours(6), "Include bits, return clean"),
    sample("Projector", "lend", "Event Equipment", "Priya", 4.4, "deposit-required", plusHours(22), "HDMI cable included"),
    sample("Pressure Washer", "borrow", "Appliances", "Ravi", 4.1, "owner-discretion", plusHours(30), "Need for weekend cleaning"),
    sample("Calculus Textbook", "lend", "Books", "Sara", 4.9, "gentle-use", plusHours(12), "No markings please"),
    sample("Folding Chairs x20", "borrow", "Event Equipment", "Jayanta", 3.9, "repair-or-replace", plusHours(-3), "For community meetup")
  ];
  persist();
  render();
  setHint("Demo listings loaded.", false);
}

function sample(title, listingType, category, owner, trust, damagePolicy, when, description) {
  return {
    id: `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    listingType,
    category,
    owner,
    trust,
    damagePolicy,
    pickupDate: when.date,
    pickupTime: when.time,
    description,
    status: "Scheduled"
  };
}

function plusHours(hours) {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  return { date: d.toISOString().slice(0, 10), time: d.toTimeString().slice(0, 5) };
}

function clearAll() {
  state.listings = [];
  localStorage.removeItem(STORAGE_KEY);
  render();
  setHint("Hub cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.listings)) state.listings = parsed.listings;
  } catch (err) {
    console.error("hydrate failed", err);
  }
}

function setHint(text, isErr) {
  ui.hint.textContent = text;
  ui.hint.style.color = isErr ? "var(--danger)" : "var(--muted)";
}

function cap(v) {
  return v.charAt(0).toUpperCase() + v.slice(1);
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
