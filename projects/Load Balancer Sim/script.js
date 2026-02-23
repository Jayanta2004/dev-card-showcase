/**
 * Load-Balancer-Sim Engine
 * Simulates request routing physics and server processing logic.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const SERVER_COUNT = 4;
let width, height;
let trafficRate = 2; // Req/sec
let processingSpeed = 1000; // ms
let algorithm = 'round-robin';

// --- State ---
let lastTime = 0;
let requestTimer = 0;
let rrIndex = 0; // Round Robin Index
let requests = [];
let servers = [];
let totalRequests = 0;
let droppedRequests = 0;

// --- Entities ---

class Server {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.active = true;
        this.currentLoad = 0; // Active requests
        this.maxLoad = 10;    // Visual cap for color intensity
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Color based on health and load
        if (!this.active) {
            ctx.fillStyle = '#ef4444'; // Red (Dead)
            ctx.strokeStyle = '#7f1d1d';
        } else {
            // Green to Yellow gradient based on load
            const loadRatio = Math.min(this.currentLoad / this.maxLoad, 1);
            // Simple interpolation: Green(120hue) -> Red(0hue) is too drastic, let's do Green -> Yellow
            // HSL: Green is ~140, Yellow is ~50.
            // Let's keep it Green(145) but change lightness or saturation
            ctx.fillStyle = this.currentLoad > 0 ? '#fbbf24' : '#4ade80'; // Yellow if working, Green if idle
            ctx.strokeStyle = '#fff';
        }
        
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`S${this.id + 1}`, this.x, this.y - 45);
        
        // Load Counter
        if (this.active) {
            ctx.font = 'bold 14px Roboto Mono';
            ctx.fillText(this.currentLoad, this.x, this.y);
        } else {
            ctx.font = '12px Inter';
            ctx.fillText('OFF', this.x, this.y);
        }
    }
}

class Request {
    constructor() {
        this.x = 50; // Spawn left
        this.y = height / 2;
        this.radius = 4;
        this.speed = 8;
        this.target = null; // Reference to Server object
        this.state = 'traveling'; // traveling, processing, complete
        this.processTimer = 0;
    }

    update() {
        if (this.state === 'traveling') {
            if (!this.target) return; // Should not happen if logic works
            
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < this.speed) {
                // Arrived
                this.x = this.target.x;
                this.y = this.target.y;
                this.state = 'processing';
                this.target.currentLoad++; // Increase server load
            } else {
                // Move
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
        } else if (this.state === 'processing') {
            this.processTimer += 16; // approx 60fps frame time
            if (this.processTimer >= processingSpeed) {
                this.state = 'complete';
                this.target.currentLoad--; // Decrease server load
            }
        }
    }

    draw() {
        if (this.state === 'complete') return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
}

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    setupServers();
    
    requestAnimationFrame(animate);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    setupServers(); // Re-position servers
}

function setupServers() {
    servers = [];
    const startY = height / 2 - ((SERVER_COUNT - 1) * 80) / 2;
    for (let i = 0; i < SERVER_COUNT; i++) {
        servers.push(new Server(i, width - 100, startY + i * 80));
    }
    renderServerToggles();
}

function setupControls() {
    // Traffic Slider
    document.getElementById('traffic-slider').addEventListener('input', (e) => {
        trafficRate = parseInt(e.target.value);
        document.getElementById('traffic-val').innerText = trafficRate;
    });

    // Speed Slider
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        processingSpeed = parseInt(e.target.value);
        document.getElementById('speed-val').innerText = processingSpeed;
    });

    // Algo Radio
    document.querySelectorAll('input[name="algo"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            algorithm = e.target.value;
        });
    });
}

function renderServerToggles() {
    const container = document.getElementById('server-toggles');
    container.innerHTML = '';
    servers.forEach(server => {
        const btn = document.createElement('button');
        btn.className = `server-btn ${server.active ? '' : 'offline'}`;
        btn.innerHTML = `<i class="fas fa-server"></i> S${server.id + 1}`;
        btn.onclick = () => toggleServer(server.id);
        container.appendChild(btn);
    });
}

function toggleServer(id) {
    const server = servers.find(s => s.id === id);
    server.active = !server.active;
    if (!server.active) {
        // If killing a server, existing requests drop? 
        // For visual simplicity, let's keep processing current ones but accept no new ones.
    }
    renderServerToggles();
}

// --- Logic Core ---

function getTargetServer() {
    const activeServers = servers.filter(s => s.active);
    
    if (activeServers.length === 0) return null;

    if (algorithm === 'round-robin') {
        // Find next active server starting from rrIndex
        // Simple approach: keep trying incrementing index until we find active
        let attempts = 0;
        while (attempts < servers.length) {
            const target = servers[rrIndex % servers.length];
            rrIndex++;
            if (target.active) return target;
            attempts++;
        }
        return null;
    } 
    
    else if (algorithm === 'random') {
        const randIndex = Math.floor(Math.random() * activeServers.length);
        return activeServers[randIndex];
    } 
    
    else if (algorithm === 'least-conn') {
        // Find server with min currentLoad
        return activeServers.reduce((prev, curr) => {
            return prev.currentLoad < curr.currentLoad ? prev : curr;
        });
    }
}

function spawnRequest() {
    const target = getTargetServer();
    totalRequests++;

    if (!target) {
        droppedRequests++;
        return; // No active servers, request dropped
    }

    const req = new Request();
    req.target = target;
    requests.push(req);
}

// --- Animation Loop ---

function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Draw LB Node (Central Hub)
    const lbX = width / 2;
    const lbY = height / 2;
    
    // Draw connections lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    servers.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(lbX, lbY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
    });

    // Draw LB
    ctx.beginPath();
    ctx.arc(lbX, lbY, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Inter';
    ctx.fillText("LB", lbX, lbY);

    // Spawn Logic
    requestTimer += deltaTime;
    const interval = 1000 / trafficRate;
    if (requestTimer > interval) {
        spawnRequest();
        requestTimer = 0;
    }

    // Update & Draw Requests
    // Filter out complete requests
    requests = requests.filter(r => r.state !== 'complete');
    
    requests.forEach(r => {
        r.update();
        r.draw();
    });

    // Draw Servers
    servers.forEach(s => s.draw());

    // Update Stats
    document.getElementById('stat-total').innerText = totalRequests;
    document.getElementById('stat-dropped').innerText = droppedRequests;
    const activeConn = servers.reduce((acc, s) => acc + s.currentLoad, 0);
    document.getElementById('stat-active').innerText = activeConn;

    requestAnimationFrame(animate);
}

// Start
init();