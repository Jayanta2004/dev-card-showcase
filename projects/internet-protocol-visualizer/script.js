const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.9;
canvas.height = 450;

const startBtn = document.getElementById("startBtn");
const speedControl = document.getElementById("speedControl");
const packetLossCheckbox = document.getElementById("packetLoss");
const logDiv = document.getElementById("log");

let speedMultiplier = 1;
let simulateLoss = false;

speedControl.addEventListener("input", () => {
    speedMultiplier = parseFloat(speedControl.value);
});

packetLossCheckbox.addEventListener("change", () => {
    simulateLoss = packetLossCheckbox.checked;
});

function log(message) {
    const p = document.createElement("p");
    p.innerText = message;
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
}

class Node {
    constructor(x, y, label, color) {
        this.x = x;
        this.y = y;
        this.label = label;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 50, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = this.color;
        ctx.font = "16px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(this.label, this.x, this.y + 5);
    }
}

class Packet {
    constructor(start, end, type = "data") {
        this.start = start;
        this.end = end;
        this.progress = 0;
        this.type = type;
        this.lost = simulateLoss && Math.random() < 0.2;
    }

    update() {
        this.progress += 0.01 * speedMultiplier;
    }

    draw() {
        if (this.lost) return;

        const x = this.start.x + (this.end.x - this.start.x) * this.progress;
        const y = this.start.y + (this.end.y - this.start.y) * this.progress;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = this.type === "ack" ? "#00ff00" : "#ff00ff";
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    isComplete() {
        return this.progress >= 1;
    }
}

const client = new Node(150, 220, "CLIENT", "#00f2ff");
const dns = new Node(canvas.width / 2, 100, "DNS", "#ff00ff");
const server = new Node(canvas.width - 150, 220, "SERVER", "#00ff99");

let packets = [];
let animationQueue = [];

function drawConnections() {
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(client.x, client.y);
    ctx.lineTo(server.x, server.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(client.x, client.y);
    ctx.lineTo(dns.x, dns.y);
    ctx.stroke();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();

    client.draw();
    dns.draw();
    server.draw();

    packets.forEach(packet => {
        packet.update();
        packet.draw();
    });

    packets = packets.filter(packet => !packet.isComplete());

    requestAnimationFrame(animate);
}

function enqueue(step) {
    animationQueue.push(step);
}

async function runQueue() {
    for (let step of animationQueue) {
        await step();
    }
    animationQueue = [];
}

function sendPacket(start, end, type="data") {
    return new Promise(resolve => {
        const packet = new Packet(start, end, type);
        packets.push(packet);

        const interval = setInterval(() => {
            if (packet.isComplete() || packet.lost) {
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });
}

function fragmentAndSend(start, end) {
    const fragments = [];
    for (let i = 0; i < 5; i++) {
        fragments.push(sendPacket(start, end));
    }
    return Promise.all(fragments);
}

startBtn.addEventListener("click", async () => {

    logDiv.innerHTML = "";
    log("DNS Resolution Started...");

    await sendPacket(client, dns);
    log("DNS resolved domain to IP.");

    log("TCP Handshake: SYN");
    await sendPacket(client, server);

    log("TCP Handshake: SYN-ACK");
    await sendPacket(server, client, "ack");

    log("TCP Handshake: ACK");
    await sendPacket(client, server, "ack");

    log("Connection Established.");

    log("Sending HTTP Request (Fragmented)...");
    await fragmentAndSend(client, server);

    log("Server Processing...");

    await fragmentAndSend(server, client);

    log("Response Delivered Successfully.");
});

animate();