// Daily planner logic
let tasks = [];
let reminders = [];
let currentLayout = "list";

// Navigation
const plannerBtn = document.getElementById("plannerBtn");
const remindersBtn = document.getElementById("remindersBtn");
const layoutBtn = document.getElementById("layoutBtn");
const plannerSection = document.getElementById("plannerSection");
const remindersSection = document.getElementById("remindersSection");
const layoutSection = document.getElementById("layoutSection");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskTime = document.getElementById("taskTime");
const scheduleList = document.getElementById("scheduleList");
const reminderForm = document.getElementById("reminderForm");
const reminderInput = document.getElementById("reminderInput");
const reminderTime = document.getElementById("reminderTime");
const reminderList = document.getElementById("reminderList");
const layoutOptions = document.getElementById("layoutOptions");

function showSection(section) {
  plannerSection.style.display = section === "planner" ? "block" : "none";
  remindersSection.style.display = section === "reminders" ? "block" : "none";
  layoutSection.style.display = section === "layout" ? "block" : "none";
}

plannerBtn.addEventListener("click", () => showSection("planner"));
remindersBtn.addEventListener("click", () => {
  showSection("reminders");
  renderReminders();
});
layoutBtn.addEventListener("click", () => {
  showSection("layout");
});

// Add task
taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const desc = taskInput.value.trim();
  const time = taskTime.value;
  if (!desc || !time) return;
  tasks.push({ desc, time });
  renderTasks();
  taskForm.reset();
});

// Add reminder
reminderForm.addEventListener("submit", e => {
  e.preventDefault();
  const desc = reminderInput.value.trim();
  const time = reminderTime.value;
  if (!desc || !time) return;
  reminders.push({ desc, time });
  renderReminders();
  reminderForm.reset();
});

// Render tasks
function renderTasks() {
  scheduleList.innerHTML = "";
  tasks.forEach((task, idx) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.draggable = true;
    card.innerHTML = `
      <span class="task-time">${task.time}</span>
      <span class="task-desc">${task.desc}</span>
      <button class="delete-btn" data-idx="${idx}">Delete</button>
    `;
    card.addEventListener("dragstart", e => {
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", idx);
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
    card.addEventListener("drop", e => {
      e.preventDefault();
      const fromIdx = parseInt(e.dataTransfer.getData("text/plain"));
      const toIdx = idx;
      if (fromIdx !== toIdx) {
        const moved = tasks.splice(fromIdx, 1)[0];
        tasks.splice(toIdx, 0, moved);
        renderTasks();
      }
    });
    card.addEventListener("dragover", e => {
      e.preventDefault();
    });
    card.querySelector(".delete-btn").addEventListener("click", () => {
      tasks.splice(idx, 1);
      renderTasks();
    });
    scheduleList.appendChild(card);
  });
}

// Render reminders
function renderReminders() {
  reminderList.innerHTML = "";
  reminders.forEach((reminder, idx) => {
    const card = document.createElement("div");
    card.className = "reminder-card";
    card.innerHTML = `
      <span class="reminder-time">${reminder.time}</span>
      <span class="reminder-desc">${reminder.desc}</span>
      <button class="delete-btn" data-idx="${idx}">Delete</button>
    `;
    card.querySelector(".delete-btn").addEventListener("click", () => {
      reminders.splice(idx, 1);
      renderReminders();
    });
    reminderList.appendChild(card);
  });
}

// Layout customization
layoutOptions.addEventListener("click", e => {
  if (e.target.classList.contains("layout-btn")) {
    currentLayout = e.target.dataset.layout;
    document.body.classList.remove("grid-view", "minimal-view");
    if (currentLayout === "grid") {
      document.body.classList.add("grid-view");
    } else if (currentLayout === "minimal") {
      document.body.classList.add("minimal-view");
    }
    renderTasks();
  }
});

// Initial render
showSection("planner");
renderTasks();
