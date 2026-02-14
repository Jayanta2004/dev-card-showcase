const goalInput = document.getElementById("goalInput");
const stepInput = document.getElementById("stepInput");
const setGoalBtn = document.getElementById("setGoalBtn");
const addStepsBtn = document.getElementById("addStepsBtn");

const stepsEl = document.getElementById("steps");
const goalEl = document.getElementById("goal");
const streakEl = document.getElementById("streak");
const progressBar = document.getElementById("progressBar");
const statusEl = document.getElementById("status");
const card = document.querySelector(".card");

const STORAGE_KEY = "step-goal-data";

let data = {
  goal: 0,
  steps: 0,
  streak: 0,
  lastDate: new Date().toDateString(),
  completedToday: false
};

function load() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved) data = saved;

  const today = new Date().toDateString();
  if (data.lastDate !== today) {
    data.steps = 0;
    data.completedToday = false;
    data.lastDate = today;
    save();
  }

  updateUI();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function updateUI() {
  stepsEl.textContent = data.steps;
  goalEl.textContent = data.goal || "—";
  streakEl.textContent = data.streak;

  addStepsBtn.disabled = !data.goal;

  const percent = data.goal
    ? Math.min((data.steps / data.goal) * 100, 100)
    : 0;

  progressBar.style.width = percent + "%";

  if (percent === 100 && !data.completedToday) {
    data.completedToday = true;
    data.streak++;
    statusEl.textContent = "🎉 Goal completed for today!";
    card.classList.add("completed");
    save();
  }
}

/* Set Goal */
setGoalBtn.addEventListener("click", () => {
  const value = Number(goalInput.value);
  if (value <= 0) {
    statusEl.textContent = "Enter a valid daily goal";
    return;
  }

  data.goal = value;
  data.steps = 0;
  data.completedToday = false;

  goalInput.value = "";
  card.classList.remove("completed");
  statusEl.textContent = "";

  save();
  updateUI();
});

/* Add Steps (USER DEFINED) */
addStepsBtn.addEventListener("click", () => {
  const stepsToAdd = Number(stepInput.value);

  if (!stepsToAdd || stepsToAdd <= 0) {
    statusEl.textContent = "Enter valid steps walked";
    return;
  }

  data.steps += stepsToAdd;
  stepInput.value = "";
  statusEl.textContent = "";

  save();
  updateUI();
});

/* Enable button only when valid */
stepInput.addEventListener("input", () => {
  addStepsBtn.disabled = !stepInput.value || !data.goal;
});

load();
