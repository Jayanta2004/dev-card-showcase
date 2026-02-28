const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabit");
const habitList = document.getElementById("habitList");
const levelDisplay = document.getElementById("level");
const xpFill = document.getElementById("xpFill");
const insightText = document.getElementById("insightText");

let habits = JSON.parse(localStorage.getItem("habits")) || [];
let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;

function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
}

function renderHabits() {
  habitList.innerHTML = "";
  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.textContent = habit.name;

    if (habit.completed) li.classList.add("completed");

    li.addEventListener("click", () => {
      habit.completed = !habit.completed;
      if (habit.completed) xp += 10;
      updateLevel();
      renderHabits();
      saveData();
    });

    habitList.appendChild(li);
  });
}

function updateLevel() {
  const xpNeeded = level * 100;
  if (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    insightText.textContent = "Great progress! Try increasing difficulty slightly.";
  }

  levelDisplay.textContent = level;
  xpFill.style.width = (xp / (level * 100)) * 100 + "%";
}

addHabitBtn.addEventListener("click", () => {
  if (!habitInput.value.trim()) return;

  habits.push({
    name: habitInput.value,
    completed: false
  });

  habitInput.value = "";
  renderHabits();
  saveData();
});

renderHabits();
updateLevel();