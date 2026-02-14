let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];

function saveTasks() {
  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function renderTasks() {
  document.querySelectorAll(".task-list").forEach(list => {
    list.innerHTML = "";
  });

  tasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.draggable = true;
    taskEl.dataset.id = task.id;

    taskEl.innerHTML = `
      ${task.text}
      <button class="delete-btn">x</button>
    `;

    // Delete
    taskEl.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTask(task.id);
    });

    // Drag events
    taskEl.addEventListener("dragstart", () => {
      taskEl.classList.add("dragging");
    });

    taskEl.addEventListener("dragend", () => {
      taskEl.classList.remove("dragging");
      saveTasks();
    });

    const column = document.querySelector(
      `[data-status="${task.status}"] .task-list`
    );

    column.appendChild(taskEl);
  });
}

function addTask(status) {
  const input = document.getElementById("todo-input");
  const text = input.value.trim();

  if (!text) return;

  const newTask = {
    id: Date.now().toString(),
    text,
    status
  };

  tasks.push(newTask);
  input.value = "";
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Drag & Drop
document.querySelectorAll(".column").forEach(column => {
  column.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const status = column.dataset.status;

    if (dragging) {
      const taskId = dragging.dataset.id;
      const task = tasks.find(t => t.id === taskId);
      task.status = status;

      column.querySelector(".task-list").appendChild(dragging);
    }
  });
});

renderTasks();
