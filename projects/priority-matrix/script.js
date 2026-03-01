document.addEventListener("DOMContentLoaded", function () {

    const taskInput = document.getElementById("taskInput");
    const addBtn = document.querySelector(".input-section button");
    const taskLists = document.querySelectorAll(".task-list");
    const taskCount = document.getElementById("taskCount");

    let tasks = JSON.parse(localStorage.getItem("priorityTasks")) || [];

    /* ================= SAVE ================= */
    function saveTasks() {
        localStorage.setItem("priorityTasks", JSON.stringify(tasks));
    }

    /* ================= COUNT ================= */
    function updateCount() {
        taskCount.textContent = tasks.length;
    }

    /* ================= CREATE TASK ================= */
    function createTaskElement(task) {
        const div = document.createElement("div");
        div.classList.add("task");
        div.setAttribute("draggable", true);
        div.dataset.id = task.id;
        div.textContent = task.text;

        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", task.id);
        });

        return div;
    }

    /* ================= RENDER ================= */
    function renderTasks() {
        taskLists.forEach(list => list.innerHTML = "");

        tasks.forEach(task => {
            const list = document.querySelector(
                `[data-type="${task.type}"] .task-list`
            );
            if (list) {
                list.appendChild(createTaskElement(task));
            }
        });

        updateCount();
    }

    /* ================= ADD TASK ================= */
    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            type: "do"
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = "";
    }

    addBtn.addEventListener("click", addTask);

    taskInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            addTask();
        }
    });

    /* ================= DRAG & DROP ================= */
    taskLists.forEach(list => {

        list.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        list.addEventListener("drop", (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");

            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const quadrant = list.closest(".quadrant");
            task.type = quadrant.dataset.type;

            saveTasks();
            renderTasks();
        });
    });

    renderTasks();
});