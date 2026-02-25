const planner = document.getElementById("planner");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("priority");
const addTaskBtn = document.getElementById("addTaskBtn");

// Generate initial time blocks for hours 9am - 5pm
const hours = Array.from({length: 9}, (_, i) => i + 9);

hours.forEach(hour => {
  const block = document.createElement("div");
  block.classList.add("time-block", "low");
  block.dataset.hour = hour;
  block.innerHTML = `<span>${hour}:00</span><span class="task">-</span>`;
  planner.appendChild(block);
});

// Add new task
addTaskBtn.addEventListener("click", () => {
  const task = taskInput.value.trim();
  const priority = prioritySelect.value;
  if (!task) return;

  // Find first empty block
  const emptyBlock = Array.from(document.querySelectorAll(".time-block"))
                          .find(b => b.querySelector(".task").textContent === "-");
  if (!emptyBlock) {
    alert("All time blocks are full!");
    return;
  }

  emptyBlock.querySelector(".task").textContent = task;
  emptyBlock.classList.remove("low", "medium", "high");
  emptyBlock.classList.add(priority);

  taskInput.value = "";
});

// Optional: click block to clear
planner.addEventListener("click", e => {
  const block = e.target.closest(".time-block");
  if (!block) return;

  if (confirm("Clear this task?")) {
    block.querySelector(".task").textContent = "-";
    block.classList.remove("low", "medium", "high");
    block.classList.add("low");
  }
});