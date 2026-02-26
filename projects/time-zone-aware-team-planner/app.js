const STORAGE_KEY = "timezone_team_planner_v1";
const HALF_HOUR_MS = 30 * 60 * 1000;

const state = {
  members: [],
  burdens: {},
  history: [],
  suggestions: []
};

const ui = {
  memberForm: document.getElementById("memberForm"),
  memberName: document.getElementById("memberName"),
  utcOffset: document.getElementById("utcOffset"),
  workStart: document.getElementById("workStart"),
  workEnd: document.getElementById("workEnd"),
  maxMeetings: document.getElementById("maxMeetings"),
  weekStart: document.getElementById("weekStart"),
  duration: document.getElementById("duration"),
  meetingCount: document.getElementById("meetingCount"),
  memberRows: document.getElementById("memberRows"),
  historyRows: document.getElementById("historyRows"),
  suggestions: document.getElementById("suggestions"),
  hint: document.getElementById("hint"),
  totalMembers: document.getElementById("totalMembers"),
  avgBurden: document.getElementById("avgBurden"),
  spread: document.getElementById("spread"),
  scheduledThisWeek: document.getElementById("scheduledThisWeek"),
  generateBtn: document.getElementById("generateBtn"),
  applyAllBtn: document.getElementById("applyAllBtn"),
  demoBtn: document.getElementById("demoBtn"),
  clearBtn: document.getElementById("clearBtn")
};

init();

function init() {
  hydrate();
  fillOffsetOptions();
  setDefaultWeekStart();
  bind();
  renderAll();
}

function bind() {
  ui.memberForm.addEventListener("submit", onAddMember);
  ui.generateBtn.addEventListener("click", generateSlots);
  ui.applyAllBtn.addEventListener("click", scheduleAllSuggestions);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
}

function fillOffsetOptions() {
  ui.utcOffset.innerHTML = "";
  for (let h = -12; h <= 14; h += 0.5) {
    const val = Number(h.toFixed(1));
    const sign = val >= 0 ? "+" : "-";
    const abs = Math.abs(val);
    const hh = String(Math.floor(abs)).padStart(2, "0");
    const mm = abs % 1 === 0 ? "00" : "30";
    const opt = document.createElement("option");
    opt.value = String(val);
    opt.textContent = `UTC${sign}${hh}:${mm}`;
    if (val === 5.5) opt.selected = true;
    ui.utcOffset.appendChild(opt);
  }
}

function setDefaultWeekStart() {
  if (ui.weekStart.value) return;
  const monday = getMonday(new Date());
  ui.weekStart.value = monday.toISOString().slice(0, 10);
}

function onAddMember(event) {
  event.preventDefault();
  const member = {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: ui.memberName.value.trim(),
    utcOffset: Number(ui.utcOffset.value),
    workStart: clamp(Number(ui.workStart.value), 0, 23),
    workEnd: clamp(Number(ui.workEnd.value), 1, 24),
    maxMeetings: clamp(Number(ui.maxMeetings.value), 1, 20)
  };

  if (!member.name) {
    setHint("Member name is required.", true);
    return;
  }
  if (member.workEnd <= member.workStart) {
    setHint("Work end must be after work start.", true);
    return;
  }

  state.members.push(member);
  if (!(member.id in state.burdens)) state.burdens[member.id] = 0;
  persist();
  renderAll();
  ui.memberForm.reset();
  fillOffsetOptions();
  setHint("Member added.", false);
}

function generateSlots() {
  if (state.members.length < 2) {
    setHint("Add at least 2 members to generate slots.", true);
    return;
  }

  const weekStart = new Date(`${ui.weekStart.value}T00:00:00Z`);
  if (Number.isNaN(weekStart.getTime())) {
    setHint("Choose a valid week start date.", true);
    return;
  }

  const durationMins = clamp(Number(ui.duration.value) || 60, 15, 180);
  const meetingsNeeded = clamp(Number(ui.meetingCount.value) || 3, 1, 12);

  const minLimit = Math.min(...state.members.map((m) => m.maxMeetings));
  const already = countWeekHistory(weekStart);
  if (already + meetingsNeeded > minLimit) {
    setHint(`Cannot schedule ${meetingsNeeded}. Weekly limit hit (lowest member limit: ${minLimit}).`, true);
    return;
  }

  const allCandidates = buildCandidates(weekStart, durationMins);
  if (!allCandidates.length) {
    setHint("No viable slots found with current constraints.", true);
    state.suggestions = [];
    renderSuggestions();
    return;
  }

  const picked = pickFairSlots(allCandidates, meetingsNeeded, durationMins);
  state.suggestions = picked;
  persist();
  renderAll();
  setHint(`Generated ${picked.length} fair slot(s).`, false);
}

function buildCandidates(weekStartUtc, durationMins) {
  const list = [];
  for (let day = 0; day < 5; day += 1) {
    for (let step = 0; step < 48; step += 1) {
      const startUtc = new Date(weekStartUtc.getTime() + day * 24 * 60 * 60 * 1000 + step * HALF_HOUR_MS);
      const evald = evaluateSlot(startUtc, durationMins);
      if (evald.outsideCount <= Math.ceil(state.members.length / 2)) list.push(evald);
    }
  }
  return list.sort((a, b) => a.score - b.score);
}

function evaluateSlot(startUtc, durationMins) {
  const perMember = state.members.map((m) => {
    const localHour = utcToLocalHour(startUtc, m.utcOffset);
    const localEnd = localHour + durationMins / 60;
    const within = localHour >= m.workStart && localEnd <= m.workEnd;
    const inconvenience = computeInconvenience(localHour, localEnd, m, within);
    return { memberId: m.id, name: m.name, localHour, localEnd, within, inconvenience };
  });

  const totalCost = perMember.reduce((s, x) => s + x.inconvenience, 0);
  const outsideCount = perMember.filter((x) => !x.within).length;

  const burdensAfter = perMember.map((x) => (state.burdens[x.memberId] || 0) + x.inconvenience);
  const spreadAfter = stdDev(burdensAfter);

  const score = totalCost * 2 + outsideCount * 4 + spreadAfter * 1.5;

  return {
    id: `s_${startUtc.getTime()}`,
    startUtc: startUtc.toISOString(),
    durationMins,
    perMember,
    totalCost,
    outsideCount,
    spreadAfter,
    score
  };
}

function computeInconvenience(localHour, localEnd, member, within) {
  if (!within) {
    const dist = localHour < member.workStart
      ? member.workStart - localHour
      : localEnd - member.workEnd;
    return 3 + Math.max(0, dist);
  }

  const mid = (member.workStart + member.workEnd) / 2;
  const centerDist = Math.abs(localHour + (localEnd - localHour) / 2 - mid);
  return centerDist > 3 ? 1.1 : centerDist > 2 ? 0.5 : 0.1;
}

function pickFairSlots(candidates, targetCount, durationMins) {
  const picked = [];
  const tempBurden = { ...state.burdens };

  for (let i = 0; i < targetCount; i += 1) {
    let best = null;
    for (const c of candidates) {
      if (picked.some((p) => overlapsUtc(p.startUtc, c.startUtc, durationMins))) continue;

      const updated = state.members.map((m) => {
        const add = c.perMember.find((x) => x.memberId === m.id)?.inconvenience || 0;
        return (tempBurden[m.id] || 0) + add;
      });
      const fairSpread = stdDev(updated);
      const fairnessScore = c.totalCost * 2 + c.outsideCount * 4 + fairSpread * 2;

      if (!best || fairnessScore < best.fairnessScore) {
        best = { ...c, fairnessScore };
      }
    }

    if (!best) break;
    picked.push(best);
    best.perMember.forEach((p) => {
      tempBurden[p.memberId] = (tempBurden[p.memberId] || 0) + p.inconvenience;
    });
  }

  return picked;
}

function scheduleAllSuggestions() {
  if (!state.suggestions.length) {
    setHint("Generate slots first.", true);
    return;
  }
  state.suggestions.forEach((slot) => applySlot(slot.id, false));
  state.suggestions = [];
  persist();
  renderAll();
  setHint("Suggested slots scheduled and fairness ledger updated.", false);
}

function applySlot(slotId, rerender = true) {
  const slot = state.suggestions.find((s) => s.id === slotId);
  if (!slot) return;

  slot.perMember.forEach((p) => {
    state.burdens[p.memberId] = (state.burdens[p.memberId] || 0) + p.inconvenience;
  });

  const inconvenient = slot.perMember.filter((p) => !p.within).map((p) => p.name);

  state.history.unshift({
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    startUtc: slot.startUtc,
    durationMins: slot.durationMins,
    inconvenient,
    totalCost: Number(slot.totalCost.toFixed(2))
  });

  state.suggestions = state.suggestions.filter((s) => s.id !== slotId);
  persist();
  if (rerender) renderAll();
}

function renderAll() {
  renderMembers();
  renderStats();
  renderSuggestions();
  renderHistory();
}

function renderMembers() {
  ui.memberRows.innerHTML = "";
  if (!state.members.length) {
    ui.memberRows.innerHTML = '<tr><td colspan="6">No members yet.</td></tr>';
    return;
  }

  state.members.forEach((m) => {
    const row = document.createElement("tr");
    const burden = (state.burdens[m.id] || 0).toFixed(1);
    row.innerHTML = `
      <td>${escapeHtml(m.name)}</td>
      <td>${formatOffset(m.utcOffset)}</td>
      <td>${m.workStart}:00-${m.workEnd}:00</td>
      <td>${m.maxMeetings}</td>
      <td>${burden}</td>
      <td><button data-del="${m.id}" class="btn btn-ghost" type="button">Remove</button></td>
    `;
    ui.memberRows.appendChild(row);
  });

  ui.memberRows.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => removeMember(btn.getAttribute("data-del")));
  });
}

function renderStats() {
  ui.totalMembers.textContent = String(state.members.length);
  const burdenValues = state.members.map((m) => state.burdens[m.id] || 0);
  ui.avgBurden.textContent = burdenValues.length ? avg(burdenValues).toFixed(1) : "0.0";
  ui.spread.textContent = burdenValues.length ? stdDev(burdenValues).toFixed(1) : "0.0";

  const weekStart = new Date(`${ui.weekStart.value}T00:00:00Z`);
  ui.scheduledThisWeek.textContent = Number.isNaN(weekStart.getTime()) ? "0" : String(countWeekHistory(weekStart));
}

function renderSuggestions() {
  ui.suggestions.innerHTML = "";
  if (!state.suggestions.length) {
    ui.suggestions.innerHTML = '<p class="hint">No generated suggestions yet.</p>';
    return;
  }

  state.suggestions.forEach((slot) => {
    const inconvenient = slot.perMember.filter((p) => !p.within);
    const level = slot.totalCost <= 2 ? "ok" : slot.totalCost <= 6 ? "warn" : "danger";

    const card = document.createElement("article");
    card.className = "suggestion-card";
    card.innerHTML = `
      <div class="suggestion-top">
        <h3 class="suggestion-title">${formatUtcSlot(slot.startUtc)}</h3>
        <span class="pill pill-${level}">Cost ${slot.totalCost.toFixed(1)}</span>
      </div>
      <p class="suggestion-meta">Duration ${slot.durationMins} min | Inconvenient for ${inconvenient.length}/${state.members.length} members</p>
      <div class="badges">
        ${slot.perMember.map((p) => `<span class="badge">${escapeHtml(p.name)}: ${formatHour(p.localHour)} local${p.within ? "" : " (off-hours)"}</span>`).join("")}
      </div>
      <div class="planner-actions" style="margin-top:10px;">
        <button class="btn btn-primary" data-apply="${slot.id}" type="button">Schedule This Slot</button>
      </div>
    `;
    ui.suggestions.appendChild(card);
  });

  ui.suggestions.querySelectorAll("[data-apply]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applySlot(btn.getAttribute("data-apply"));
      setHint("Slot scheduled.", false);
    });
  });
}

function renderHistory() {
  ui.historyRows.innerHTML = "";
  if (!state.history.length) {
    ui.historyRows.innerHTML = '<tr><td colspan="4">No meetings scheduled yet.</td></tr>';
    return;
  }

  state.history.slice(0, 20).forEach((h) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatUtcSlot(h.startUtc)}</td>
      <td>${h.durationMins} min</td>
      <td>${h.inconvenient.length ? escapeHtml(h.inconvenient.join(", ")) : "None"}</td>
      <td>${h.totalCost.toFixed(1)}</td>
    `;
    ui.historyRows.appendChild(tr);
  });
}

function removeMember(id) {
  state.members = state.members.filter((m) => m.id !== id);
  delete state.burdens[id];
  persist();
  renderAll();
}

function countWeekHistory(weekStartUtc) {
  const from = weekStartUtc.getTime();
  const to = from + 7 * 24 * 60 * 60 * 1000;
  return state.history.filter((h) => {
    const t = new Date(h.startUtc).getTime();
    return t >= from && t < to;
  }).length;
}

function overlapsUtc(isoA, isoB, durationMins) {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  const dur = durationMins * 60 * 1000;
  return Math.abs(a - b) < dur;
}

function utcToLocalHour(dateUtc, offset) {
  const hours = dateUtc.getUTCHours() + dateUtc.getUTCMinutes() / 60 + offset;
  return ((hours % 24) + 24) % 24;
}

function formatHour(hour) {
  const h = Math.floor(hour);
  const m = hour % 1 >= 0.5 ? "30" : "00";
  return `${String(h).padStart(2, "0")}:${m}`;
}

function formatUtcSlot(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = d.toISOString().slice(11, 16);
  return `${day} ${time} UTC`;
}

function formatOffset(offset) {
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs)).padStart(2, "0");
  const mm = abs % 1 === 0 ? "00" : "30";
  return `UTC${sign}${hh}:${mm}`;
}

function getMonday(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((s, n) => s + n, 0) / values.length;
}

function stdDev(values) {
  if (!values.length) return 0;
  const mean = avg(values);
  const variance = avg(values.map((v) => (v - mean) ** 2));
  return Math.sqrt(variance);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function loadDemo() {
  state.members = [
    makeMember("Ayaan", 5.5, 10, 19, 6),
    makeMember("Jayanta", 1, 9, 17, 5),
    makeMember("Sofia", -5, 9, 17, 5),
    makeMember("Kenji", 9, 10, 18, 4)
  ];
  state.burdens = Object.fromEntries(state.members.map((m) => [m.id, 0]));
  state.history = [];
  state.suggestions = [];
  setDefaultWeekStart();
  persist();
  renderAll();
  setHint("Demo team loaded.", false);
}

function makeMember(name, utcOffset, workStart, workEnd, maxMeetings) {
  return {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    utcOffset,
    workStart,
    workEnd,
    maxMeetings
  };
}

function clearAll() {
  state.members = [];
  state.burdens = {};
  state.history = [];
  state.suggestions = [];
  localStorage.removeItem(STORAGE_KEY);
  renderAll();
  setHint("All planner data cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.members)) state.members = parsed.members;
    if (parsed.burdens && typeof parsed.burdens === "object") state.burdens = parsed.burdens;
    if (Array.isArray(parsed.history)) state.history = parsed.history;
    if (Array.isArray(parsed.suggestions)) state.suggestions = parsed.suggestions;
  } catch (err) {
    console.error("hydrate failed", err);
  }
}

function setHint(text, isErr) {
  ui.hint.textContent = text;
  ui.hint.style.color = isErr ? "var(--danger)" : "var(--muted)";
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
