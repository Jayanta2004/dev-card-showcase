const canvas = document.getElementById("apiCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.9;
canvas.height = 400;

const logDiv = document.getElementById("log");

let rateLimitCounter = 0;
let maxRequests = 5;

class Stage {
    constructor(x, y, label) {
        this.x = x;
        this.y = y;
        this.label = label;
    }

    draw() {
        ctx.fillStyle = "#111";
        ctx.strokeStyle = "#00f7ff";
        ctx.strokeRect(this.x, this.y, 150, 50);
        ctx.fillStyle = "#00f7ff";
        ctx.fillText(this.label, this.x + 10, this.y + 30);
    }
}

class Packet {
    constructor(stages) {
        this.stages = stages;
        this.current = 0;
        this.progress = 0;
    }

    update() {
        this.progress += 0.02;
        if (this.progress >= 1) {
            this.current++;
            this.progress = 0;
        }
    }

    draw() {
        if (this.current >= this.stages.length - 1) return;

        let start = this.stages[this.current];
        let end = this.stages[this.current + 1];

        let x = start.x + (end.x - start.x) * this.progress;
        let y = start.y + (end.y - start.y) * this.progress;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#ff00ff";
        ctx.fill();
    }
}

const stages = [
    new Stage(50, 200, "Request"),
    new Stage(250, 200, "Auth"),
    new Stage(450, 200, "Rate Limit"),
    new Stage(650, 200, "Controller"),
    new Stage(850, 200, "Database"),
    new Stage(1050, 200, "Response")
];

let packet = null;

function log(msg) {
    const p = document.createElement("p");
    p.innerText = msg;
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stages.forEach(stage => stage.draw());

    if (packet) {
        packet.update();
        packet.draw();
    }

    requestAnimationFrame(animate);
}

document.getElementById("sendRequest").onclick = () => {

    logDiv.innerHTML = "";
    rateLimitCounter++;

    if (rateLimitCounter > maxRequests) {
        log("❌ 429 Too Many Requests");
        return;
    }

    let headers = document.getElementById("headers").value;

    if (!headers.includes("Authorization")) {
        log("❌ 401 Unauthorized");
        return;
    }

    packet = new Packet(stages);

    log("Request Created");
    log("Authentication Passed");
    log("Rate Limit OK");
    log("Controller Executed");
    log("Database Queried");
    log("Response Sent (200 OK)");
};

animate();