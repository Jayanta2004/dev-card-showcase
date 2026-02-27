let tasks = [];
let ctx = document.getElementById('taskChart').getContext('2d');

let chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
            label: 'Task Priority Distribution',
            data: [0, 0, 0],
            backgroundColor: ['#00ffcc', '#ffcc00', '#ff4444']
        }]
    }
});

function addTask() {
    let name = document.getElementById("taskName").value;
    let priority = parseInt(document.getElementById("priority").value);
    let deadline = document.getElementById("deadline").value;

    if(name === "" || deadline === "") {
        alert("Please fill all fields");
        return;
    }

    let task = {
        name,
        priority,
        deadline
    };

    tasks.push(task);
    displayTasks();
    updateChart();
}

function displayTasks() {
    let list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.sort((a, b) => b.priority - a.priority);

    tasks.forEach((task, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            ${task.name} (Priority: ${task.priority}, Due: ${task.deadline})
            <button onclick="deleteTask(${index})">Delete</button>
        `;
        list.appendChild(li);
    });
}

function deleteTask(index) {
    tasks.splice(index, 1);
    displayTasks();
    updateChart();
}

function updateChart() {
    let counts = [0, 0, 0];

    tasks.forEach(task => {
        counts[task.priority - 1]++;
    });

    chart.data.datasets[0].data = counts;
    chart.update();
}