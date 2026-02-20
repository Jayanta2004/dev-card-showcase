const titleInput = document.getElementById("title");
const dateInput = document.getElementById("date");
const priorityInput = document.getElementById("priority");
const progressInput = document.getElementById("progress");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function addTask() {
  const title = titleInput.value.trim();
  const date = dateInput.value;
  const priority = priorityInput.value;
  const progress = Number(progressInput.value);

  if (!title || progress < 0 || progress > 100) {
    alert("Please enter valid data");
    return;
  }

  tasks.push({
    id: Date.now(),
    title,
    date,
    priority,
    progress
  });

  clearForm();
  saveAndRender();
}

function clearForm() {
  titleInput.value = "";
  dateInput.value = "";
  progressInput.value = "";
}

function getStatus(task) {
  if (task.progress === 100) return "Completed";
  if (task.date && new Date(task.date) < new Date()) return "Overdue";
  return "In Progress";
}

function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    taskList.innerHTML += `
      <div class="task-card">
        <div class="card-header">
          <h3>${task.title}</h3>
          <span class="badge ${task.priority.toLowerCase()}">${task.priority}</span>
        </div>

        <div class="card-body">
          <div class="progress-wrapper">
            <div class="progress-bar" style="width:${task.progress}%"></div>
          </div>
          <div class="meta">
            <span>${task.progress}% • ${getStatus(task)}</span>
            <span>${task.date || "No deadline"}</span>
          </div>
        </div>

        <div class="card-footer">
          <button class="complete" onclick="completeTask(${task.id})">Complete</button>
          <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      </div>
    `;
  });
}

function completeTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, progress: 100 } : t
  );
  saveAndRender();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

function sortByPriority() {
  const order = { High: 1, Medium: 2, Low: 3 };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);
  saveAndRender();
}

function sortByProgress() {
  tasks.sort((a, b) => b.progress - a.progress);
  saveAndRender();
}

renderTasks();
