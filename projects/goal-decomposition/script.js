const goalInput = document.getElementById("goalInput");
const taskInput = document.getElementById("taskInput");
const addGoalBtn = document.getElementById("addGoalBtn");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const progressBar = document.getElementById("progressBar");
const prioritySelect = document.getElementById("priority");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let goal = localStorage.getItem("goal") || "";

function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("goal", goal);
}

function updateProgress() {
    if (tasks.length === 0) {
        progressBar.style.width = "0%";
        return;
    }
    const done = tasks.filter(t => t.done).length;
    const percent = (done / tasks.length) * 100;
    progressBar.style.width = percent + "%";
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        if (task.done) li.classList.add("done");

        const span = document.createElement("span");
        span.textContent = task.text;
        span.onclick = () => {
            tasks[index].done = !tasks[index].done;
            saveData();
            renderTasks();
        };

        const priority = document.createElement("span");
        priority.textContent = task.priority;
        priority.className = `priority ${task.priority}`;

        const del = document.createElement("button");
        del.textContent = "✖";
        del.onclick = () => {
            tasks.splice(index, 1);
            saveData();
            renderTasks();
        };

        li.append(span, priority, del);
        taskList.appendChild(li);
    });

    updateProgress();
}

addGoalBtn.onclick = () => {
    goal = goalInput.value;
    saveData();
    alert("Goal saved!");
};

addTaskBtn.onclick = () => {
    if (!taskInput.value) return;

    tasks.push({
        text: taskInput.value,
        priority: prioritySelect.value,
        done: false
    });

    taskInput.value = "";
    saveData();
    renderTasks();
};

taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTaskBtn.click();
});

renderTasks();
