const canvas = document.getElementById("cloudCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.9;
canvas.height = 500;

let servers = [];
let loadBalancers = [];
let trafficInterval = null;
let requestCount = 0;

const rpsDisplay = document.getElementById("rps");
const activeDisplay = document.getElementById("activeServers");
const failedDisplay = document.getElementById("failedServers");

class Server {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.load = 0;
        this.failed = false;
    }

    draw() {
        ctx.fillStyle = this.failed ? "#ff0033" : "#00ff99";
        ctx.fillRect(this.x, this.y, 80, 50);

        ctx.fillStyle = "#000";
        ctx.fillText(`Load: ${this.load}`, this.x + 10, this.y + 30);
    }
}

class LoadBalancer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.index = 0;
    }

    draw() {
        ctx.fillStyle = "#ffaa00";
        ctx.fillRect(this.x, this.y, 100, 50);
        ctx.fillStyle = "#000";
        ctx.fillText("Load Balancer", this.x + 5, this.y + 30);
    }

    distribute() {
        if (servers.length === 0) return;
        let attempts = 0;

        while (servers[this.index].failed && attempts < servers.length) {
            this.index = (this.index + 1) % servers.length;
            attempts++;
        }

        if (!servers[this.index].failed) {
            servers[this.index].load++;
        }

        this.index = (this.index + 1) % servers.length;
    }
}

function drawConnections() {
    loadBalancers.forEach(lb => {
        servers.forEach(server => {
            ctx.beginPath();
            ctx.moveTo(lb.x + 50, lb.y + 50);
            ctx.lineTo(server.x + 40, server.y);
            ctx.strokeStyle = "#333";
            ctx.stroke();
        });
    });
}

function updateMetrics() {
    rpsDisplay.innerText = requestCount;
    activeDisplay.innerText = servers.filter(s => !s.failed).length;
    failedDisplay.innerText = servers.filter(s => s.failed).length;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    loadBalancers.forEach(lb => lb.draw());
    servers.forEach(server => server.draw());

    drawConnections();
    requestAnimationFrame(animate);
}

document.getElementById("addServer").onclick = () => {
    const x = 200 + servers.length * 120;
    const y = 300;
    servers.push(new Server(x, y));
    updateMetrics();
};

document.getElementById("addLB").onclick = () => {
    loadBalancers.push(new LoadBalancer(300, 100));
};

document.getElementById("simulateTraffic").onclick = () => {
    if (trafficInterval) return;

    trafficInterval = setInterval(() => {
        loadBalancers.forEach(lb => lb.distribute());
        requestCount++;
        updateMetrics();
    }, 500);
};

document.getElementById("triggerFailure").onclick = () => {
    if (servers.length === 0) return;
    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    randomServer.failed = true;
    updateMetrics();
};

animate();