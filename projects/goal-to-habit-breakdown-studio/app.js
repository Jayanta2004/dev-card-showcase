const STORAGE_KEY = "goal_to_habit_breakdown_studio_v1";

const state = {
  plan: null,
  progress: {},
  reflections: {}
};

const ui = {
  goalForm: document.getElementById("goalForm"),
  goalTitle: document.getElementById("goalTitle"),
  horizonWeeks: document.getElementById("horizonWeeks"),
  hoursPerWeek: document.getElementById("hoursPerWeek"),
  accountabilityMode: document.getElementById("accountabilityMode"),
  checkpoints: document.getElementById("checkpoints"),
  hint: document.getElementById("hint"),
  weeklyCompletion: document.getElementById("weeklyCompletion"),
  streak: document.getElementById("streak"),
  checkpointProgress: document.getElementById("checkpointProgress"),
  adjustmentLoad: document.getElementById("adjustmentLoad"),
  adjustmentList: document.getElementById("adjustmentList"),
  accountabilityText: document.getElementById("accountabilityText"),
  systemsGrid: document.getElementById("systemsGrid"),
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
  ui.goalForm.addEventListener("submit", onGenerate);
  ui.demoBtn.addEventListener("click", loadDemo);
  ui.clearBtn.addEventListener("click", clearAll);
}

function onGenerate(event) {
  event.preventDefault();

  const input = {
    goalTitle: ui.goalTitle.value.trim(),
    horizonWeeks: clamp(Number(ui.horizonWeeks.value) || 12, 2, 52),
    hoursPerWeek: clamp(Number(ui.hoursPerWeek.value) || 8, 2, 80),
    accountabilityMode: ui.accountabilityMode.value,
    checkpoints: parseCheckpoints(ui.checkpoints.value)
  };

  if (!input.goalTitle) {
    setHint("Goal title is required.", true);
    return;
  }

  state.plan = buildPlan(input);
  state.progress = {};
  state.reflections = {};
  persist();
  render();
  setHint("Goal system generated.", false);
}

function parseCheckpoints(value) {
  const raw = value.split(",").map((x) => x.trim()).filter(Boolean);
  return raw.length ? raw : ["Checkpoint 1", "Checkpoint 2", "Checkpoint 3"];
}

function buildPlan(input) {
  const weeklySystems = [];
  const habitsPerWeek = input.hoursPerWeek >= 12 ? 5 : input.hoursPerWeek >= 8 ? 4 : 3;

  for (let w = 1; w <= Math.min(8, input.horizonWeeks); w += 1) {
    const habits = [];
    for (let i = 1; i <= habitsPerWeek; i += 1) {
      habits.push(`Day ${i}: ${habitTemplate(input.goalTitle, w, i)}`);
    }
    weeklySystems.push({ week: w, habits });
  }

  return {
    id: `p_${Date.now()}`,
    ...input,
    weeklySystems,
    checkpointDone: input.checkpoints.map(() => false)
  };
}

function habitTemplate(goal, week, idx) {
  const verbs = ["Deep work", "Practice", "Build", "Review", "Ship"];
  return `${verbs[(week + idx) % verbs.length]} block for ${shortGoal(goal)}`;
}

function shortGoal(goal) {
  return goal.length > 32 ? `${goal.slice(0, 32)}...` : goal;
}

function render() {
  renderSystems();
  renderStats();
  renderAdjustments();
  renderAccountability();
}

function renderSystems() {
  ui.systemsGrid.innerHTML = "";

  if (!state.plan) {
    ui.systemsGrid.innerHTML = '<p class="hint">Generate a plan to view weekly systems and habits.</p>';
    return;
  }

  state.plan.weeklySystems.forEach((w) => {
    const card = document.createElement("article");
    card.className = "week-card";

    const completed = w.habits.filter((_, idx) => state.progress[habitKey(w.week, idx)]).length;
    card.innerHTML = `
      <h4>Week ${w.week}</h4>
      <p class="week-meta">${completed}/${w.habits.length} habits complete</p>
      <div id="habits_${w.week}"></div>
      <div class="reflect">
        <label>
          <span>Weekly Reflection</span>
          <textarea data-reflect="${w.week}" placeholder="What worked, what failed, what to adjust?">${escapeHtml(state.reflections[w.week] || "")}</textarea>
        </label>
      </div>
    `;

    const habitWrap = card.querySelector(`#habits_${w.week}`);
    w.habits.forEach((habit, idx) => {
      const key = habitKey(w.week, idx);
      const checked = Boolean(state.progress[key]);
      const row = document.createElement("div");
      row.className = "habit-row";
      row.innerHTML = `
        <label>
          <input type="checkbox" data-habit="${key}" ${checked ? "checked" : ""}>
          ${escapeHtml(habit)}
        </label>
      `;
      habitWrap.appendChild(row);
    });

    ui.systemsGrid.appendChild(card);
  });

  ui.systemsGrid.querySelectorAll("[data-habit]").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const key = cb.getAttribute("data-habit");
      state.progress[key] = e.target.checked;
      persist();
      render();
    });
  });

  ui.systemsGrid.querySelectorAll("[data-reflect]").forEach((ta) => {
    ta.addEventListener("input", () => {
      const week = ta.getAttribute("data-reflect");
      state.reflections[week] = ta.value.slice(0, 500);
      persist();
      renderStats();
      renderAdjustments();
    });
  });
}

function renderStats() {
  if (!state.plan) {
    ui.weeklyCompletion.textContent = "0%";
    ui.streak.textContent = "0";
    ui.checkpointProgress.textContent = "0%";
    ui.adjustmentLoad.textContent = "0";
    return;
  }

  const totalHabits = state.plan.weeklySystems.reduce((s, w) => s + w.habits.length, 0);
  const doneHabits = Object.values(state.progress).filter(Boolean).length;
  const completion = totalHabits ? Math.round((doneHabits / totalHabits) * 100) : 0;

  const weekFlags = state.plan.weeklySystems.map((w) => {
    const done = w.habits.filter((_, i) => state.progress[habitKey(w.week, i)]).length;
    return done >= Math.ceil(w.habits.length * 0.7);
  });

  let streak = 0;
  for (const ok of weekFlags) {
    if (!ok) break;
    streak += 1;
  }

  const cpDone = Math.round((Math.min(doneHabits, state.plan.checkpoints.length) / state.plan.checkpoints.length) * 100);

  const lowWeeks = state.plan.weeklySystems.filter((w) => {
    const done = w.habits.filter((_, i) => state.progress[habitKey(w.week, i)]).length;
    return done < Math.ceil(w.habits.length * 0.5);
  }).length;

  ui.weeklyCompletion.textContent = `${completion}%`;
  ui.streak.textContent = String(streak);
  ui.checkpointProgress.textContent = `${cpDone}%`;
  ui.adjustmentLoad.textContent = String(lowWeeks);
}

function renderAdjustments() {
  ui.adjustmentList.innerHTML = "";
  if (!state.plan) {
    addAdjustment("No plan yet.");
    return;
  }

  const adjustments = [];
  state.plan.weeklySystems.forEach((w) => {
    const done = w.habits.filter((_, i) => state.progress[habitKey(w.week, i)]).length;
    const ratio = done / w.habits.length;
    if (ratio < 0.5) {
      adjustments.push(`Week ${w.week}: reduce habit count by 1 and add one focused catch-up block.`);
    } else if (ratio < 0.75) {
      adjustments.push(`Week ${w.week}: keep habit load but shorten each block by 20%.`);
    }

    const refl = (state.reflections[w.week] || "").toLowerCase();
    if (/overwhelm|tired|burnout|stuck/.test(refl)) {
      adjustments.push(`Week ${w.week}: schedule one recovery day and split hardest task into micro-steps.`);
    }
  });

  if (!adjustments.length) adjustments.push("Current plan is stable. Continue with same weekly system.");
  adjustments.slice(0, 6).forEach(addAdjustment);
}

function addAdjustment(text) {
  const li = document.createElement("li");
  li.textContent = text;
  ui.adjustmentList.appendChild(li);
}

function renderAccountability() {
  if (!state.plan) {
    ui.accountabilityText.textContent = "Create a plan to generate accountability cadence.";
    return;
  }

  const mode = state.plan.accountabilityMode;
  if (mode === "solo") {
    ui.accountabilityText.textContent = "Solo loop: End-of-day checkmark + Sunday reflection summary.";
  } else if (mode === "buddy") {
    ui.accountabilityText.textContent = "Buddy loop: Share progress every Wednesday + weekend proof of work update.";
  } else {
    ui.accountabilityText.textContent = "Public loop: Post weekly wins + missed habits and next-week commitments.";
  }
}

function habitKey(week, idx) {
  return `w${week}_h${idx}`;
}

function loadDemo() {
  const input = {
    goalTitle: "Become job-ready frontend developer",
    horizonWeeks: 10,
    hoursPerWeek: 10,
    accountabilityMode: "buddy",
    checkpoints: ["Portfolio v1", "3 deployed projects", "10 job applications"]
  };

  state.plan = buildPlan(input);
  state.progress = {
    [habitKey(1, 0)]: true,
    [habitKey(1, 1)]: true,
    [habitKey(1, 2)]: true,
    [habitKey(1, 3)]: false,
    [habitKey(2, 0)]: true,
    [habitKey(2, 1)]: false
  };
  state.reflections = {
    1: "Good momentum. Need stricter deep-work blocks.",
    2: "Felt stuck and overwhelmed by too many tasks."
  };
  persist();
  render();
  setHint("Demo goal loaded.", false);
}

function clearAll() {
  state.plan = null;
  state.progress = {};
  state.reflections = {};
  localStorage.removeItem(STORAGE_KEY);
  render();
  setHint("Studio cleared.", false);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.plan) state.plan = parsed.plan;
    if (parsed.progress && typeof parsed.progress === "object") state.progress = parsed.progress;
    if (parsed.reflections && typeof parsed.reflections === "object") state.reflections = parsed.reflections;
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
