const SAVE_KEY = "embers_save_v1";

let state = {
  fire: 0,
  wood: 0,
  people: 0,
  stage: 0
};

// DOM
const story = document.getElementById("story");
const fireEl = document.getElementById("fire");
const woodEl = document.getElementById("wood");
const peopleEl = document.getElementById("people");

const gatherWoodBtn = document.getElementById("gatherWood");
const stokeFireBtn = document.getElementById("stokeFire");
const recruitBtn = document.getElementById("recruit");

const peopleRow = document.getElementById("peopleRow");
const resetBtn = document.getElementById("resetBtn");

// ---------- STORY ----------
function updateStory(text) {
  story.textContent = text;
}

function progressStory() {
  if (state.fire >= 1) {
    stokeFireBtn.classList.remove("hidden");
  }

  if (state.fire >= 5) {
    recruitBtn.classList.remove("hidden");
    peopleRow.classList.remove("hidden");
  }
}

// ---------- ACTIONS ----------
gatherWoodBtn.onclick = () => {
  state.wood += 1;
  updateStory("You gather wood from the ruins.");
  render();
};

stokeFireBtn.onclick = () => {
  if (state.wood <= 0) {
    updateStory("You need wood to feed the fire.");
    return;
  }
  state.wood -= 1;
  state.fire += 1;
  updateStory("The fire grows warmer.");
  progressStory();
  render();
};

recruitBtn.onclick = () => {
  if (state.fire < 2) {
    updateStory("The fire is too weak.");
    return;
  }
  state.fire -= 2;
  state.people += 1;
  updateStory("A survivor joins you.");
  render();
};

// ---------- SAVE / LOAD ----------
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function load() {
  const data = localStorage.getItem(SAVE_KEY);
  if (data) {
    state = JSON.parse(data);
  }
  progressStory();
}

// ---------- RENDER ----------
function render() {
  fireEl.textContent = state.fire;
  woodEl.textContent = state.wood;
  peopleEl.textContent = state.people;
  save();
}

// ---------- RESET ----------
resetBtn.onclick = () => {
  if (!confirm("Restart the world?")) return;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
};

// ---------- INIT ----------
load();
render();