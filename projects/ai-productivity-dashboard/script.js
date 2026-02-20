let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskList = document.getElementById("taskList");
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");

function renderTasks() {
    taskList.innerHTML = "";
    let completed = 0;

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span onclick="toggleComplete(${index})" 
            style="text-decoration:${task.completed ? 'line-through':'none'}">
            ${task.text}</span>
            <button onclick="deleteTask(${index})">X</button>
        `;
        if(task.completed) completed++;
        taskList.appendChild(li);
    });

    totalTasksEl.innerText = tasks.length;
    completedTasksEl.innerText = completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
    const input = document.getElementById("taskInput");
    if(input.value.trim() === "") return;

    tasks.push({ text: input.value, completed: false });
    input.value = "";
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

document.getElementById("themeToggle").addEventListener("click",()=>{
    document.body.classList.toggle("light");
});

renderTasks();
