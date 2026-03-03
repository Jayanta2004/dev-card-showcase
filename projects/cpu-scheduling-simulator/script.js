const addProcessBtn = document.getElementById("addProcess");
const runBtn = document.getElementById("runSimulation");
const queueDiv = document.getElementById("processQueue");
const metricsDiv = document.getElementById("metrics");
const canvas = document.getElementById("timelineCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 150;

let processes = [];
let pid = 1;

addProcessBtn.onclick = () => {
    const arrival = parseInt(document.getElementById("arrival").value);
    const burst = parseInt(document.getElementById("burst").value);
    const priority = parseInt(document.getElementById("priority").value) || 0;

    processes.push({
        id: "P" + pid++,
        arrival,
        burst,
        remaining: burst,
        priority,
        completion: 0,
        waiting: 0,
        turnaround: 0
    });

    renderQueue();
};

function renderQueue() {
    queueDiv.innerHTML = processes.map(p =>
        `${p.id} (A:${p.arrival}, B:${p.burst}, Pr:${p.priority})`
    ).join("<br>");
}

runBtn.onclick = () => {
    const algo = document.getElementById("algorithm").value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let result;
    if (algo === "fcfs") result = fcfs();
    if (algo === "sjf") result = sjf();
    if (algo === "rr") result = roundRobin();
    if (algo === "priority") result = priorityScheduling();

    drawTimeline(result.timeline);
    calculateMetrics(result.completed);
};

function fcfs() {
    let time = 0;
    let timeline = [];
    let completed = [];

    const sorted = [...processes].sort((a,b) => a.arrival - b.arrival);

    sorted.forEach(p => {
        if (time < p.arrival) time = p.arrival;
        timeline.push({id:p.id, start:time, duration:p.burst});
        time += p.burst;

        p.completion = time;
        completed.push(p);
    });

    return { timeline, completed };
}

function sjf() {
    let time = 0;
    let timeline = [];
    let completed = [];
    let remaining = [...processes];

    while (remaining.length > 0) {
        let available = remaining.filter(p => p.arrival <= time);
        if (available.length === 0) {
            time++;
            continue;
        }

        available.sort((a,b) => a.burst - b.burst);
        let current = available[0];

        timeline.push({id:current.id, start:time, duration:current.burst});
        time += current.burst;
        current.completion = time;

        completed.push(current);
        remaining = remaining.filter(p => p !== current);
    }

    return { timeline, completed };
}

function roundRobin() {
    let time = 0;
    let timeline = [];
    let completed = [];
    const quantum = parseInt(document.getElementById("quantum").value) || 2;
    let queue = [...processes];

    while (queue.length > 0) {
        let current = queue.shift();

        if (time < current.arrival) time = current.arrival;

        let execTime = Math.min(quantum, current.remaining);
        timeline.push({id:current.id, start:time, duration:execTime});
        time += execTime;
        current.remaining -= execTime;

        if (current.remaining > 0) {
            queue.push(current);
        } else {
            current.completion = time;
            completed.push(current);
        }
    }

    return { timeline, completed };
}

function priorityScheduling() {
    let time = 0;
    let timeline = [];
    let completed = [];
    let remaining = [...processes];

    while (remaining.length > 0) {
        let available = remaining.filter(p => p.arrival <= time);
        if (available.length === 0) {
            time++;
            continue;
        }

        available.sort((a,b) => a.priority - b.priority);
        let current = available[0];

        timeline.push({id:current.id, start:time, duration:current.burst});
        time += current.burst;
        current.completion = time;

        completed.push(current);
        remaining = remaining.filter(p => p !== current);
    }

    return { timeline, completed };
}

function drawTimeline(timeline) {
    let x = 10;
    timeline.forEach(block => {
        ctx.fillStyle = randomColor();
        ctx.fillRect(x, 50, block.duration * 20, 40);
        ctx.fillStyle = "black";
        ctx.fillText(block.id, x + 5, 75);
        x += block.duration * 20;
    });
}

function calculateMetrics(completed) {
    let totalWait = 0;
    let totalTurn = 0;

    completed.forEach(p => {
        p.turnaround = p.completion - p.arrival;
        p.waiting = p.turnaround - p.burst;
        totalWait += p.waiting;
        totalTurn += p.turnaround;
    });

    metricsDiv.innerHTML = `
        Avg Waiting Time: ${(totalWait/completed.length).toFixed(2)}<br>
        Avg Turnaround Time: ${(totalTurn/completed.length).toFixed(2)}
    `;
}

function randomColor() {
    return `hsl(${Math.random()*360},70%,70%)`;
}