const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

let activities = JSON.parse(localStorage.getItem("timeLeaks")) || [];

function addActivity() {
    const task = document.getElementById("task").value;
    const minutes = parseInt(document.getElementById("minutes").value);

    if (!task || !minutes) return;

    activities.push({ task, minutes });
    save();
    render();
}

function save() {
    localStorage.setItem("timeLeaks", JSON.stringify(activities));
}

function resetData() {
    activities = [];
    save();
    render();
}

function render() {
    drawRadar();
    updateList();
    detectLeaks();
}

function drawRadar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = activities.reduce((sum, a) => sum + a.minutes, 0);
    let start = 0;

    activities.forEach((a) => {
        const angle = (a.minutes / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 120, start, start + angle);
        ctx.fillStyle = getColor(a.minutes);
        ctx.fill();
        start += angle;
    });
}

function getColor(minutes) {
    if (minutes < 30) return "#00ffcc";
    if (minutes < 60) return "#ffd200";
    return "#ff4b2b";
}

function updateList() {
    const list = document.getElementById("activityList");
    list.innerHTML = "";

    activities.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${a.task} — ${a.minutes} min`;
        list.appendChild(li);
    });
}

function detectLeaks() {
    const msg = document.getElementById("leakMsg");

    const leaks = activities.filter(a => a.minutes >= 60);

    if (leaks.length === 0) {
        msg.textContent = "No major time leaks detected";
        msg.style.color = "#00ffcc";
    } else {
        msg.textContent = `⚠ Time leak detected in ${leaks.length} activity(s)!`;
        msg.style.color = "#ff4b2b";
    }
}

render();
