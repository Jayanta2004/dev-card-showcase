let tasks = [];

const taskList = document.getElementById("taskList");
const totalTasksDisplay = document.getElementById("totalTasks");
const completedTasksDisplay = document.getElementById("completedTasks");

function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "task-item";
        li.dataset.priority = task.priority;
        if(task.completed) li.classList.add("completed");

        li.innerHTML = `
            <span>${task.name}</span>
            <div class="task-buttons">
                <button class="complete" onclick="toggleComplete(${index})">✓</button>
                <button class="edit" onclick="editTask(${index})">✎</button>
                <button class="delete" onclick="deleteTask(${index})">🗑️</button>
            </div>
        `;
        taskList.appendChild(li);
    });

    totalTasksDisplay.textContent = tasks.length;
    completedTasksDisplay.textContent = tasks.filter(t => t.completed).length;
}

function addTask() {
    const taskName = document.getElementById("taskName").value.trim();
    const priority = document.getElementById("priority").value;
    if(taskName === "") return alert("Enter a task!");

    tasks.push({name: taskName, priority, completed: false});
    document.getElementById("taskName").value = "";
    renderTasks();
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index,1);
    renderTasks();
}

function editTask(index) {
    const newName = prompt("Edit Task:", tasks[index].name);
    if(newName) tasks[index].name = newName;
    renderTasks();
}

// Initial render
renderTasks();
