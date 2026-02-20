// ===========================================
// SPACE STRATEGY RTS - FIXED VERSION
// ===========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const resourcesEl = document.getElementById("resources");
const selectedPlanetEl = document.getElementById("selectedPlanet");

let lastTime = 0;

// ===========================================
// STARFIELD (Generated Once)
// ===========================================

const stars = [];
for (let i = 0; i < 250; i++) {
    stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2
    });
}

// ===========================================
// GAME STATE
// ===========================================

class GameState {
    constructor() {
        this.planets = [];
        this.fleets = [];
        this.selectedPlanet = null;
    }

    update(delta) {
        this.planets.forEach(p => p.update(delta));
        this.fleets.forEach(f => f.update(delta));
        this.handleArrivals();
    }

    draw() {
        // Clear background
        ctx.fillStyle = "#050510";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        ctx.fillStyle = "white";
        stars.forEach(s => {
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // Draw fleets
        this.fleets.forEach(f => f.draw());

        // Draw planets
        this.planets.forEach(p => p.draw());
    }

    handleArrivals() {
        this.fleets = this.fleets.filter(fleet => {
            if (fleet.arrived) {
                fleet.resolve();
                return false;
            }
            return true;
        });
    }
}

const game = new GameState();

// ===========================================
// PLANET CLASS
// ===========================================

class Planet {
    constructor(x, y, owner = null) {
        this.x = x;
        this.y = y;
        this.radius = 35;
        this.owner = owner;
        this.resources = 100;
        this.growthRate = 0.02;
        this.id = Math.floor(Math.random() * 1000);
    }

    update(delta) {
        this.resources += this.growthRate * delta;
        if (this.resources > 500) this.resources = 500;
    }

    draw() {
        ctx.save();

        if (this.owner === "player") ctx.fillStyle = "#00f5ff";
        else if (this.owner === "ai") ctx.fillStyle = "#ff006e";
        else ctx.fillStyle = "#777";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "14px monospace";
        ctx.fillText(Math.floor(this.resources), this.x - 15, this.y + 5);

        ctx.restore();
    }

    sendFleet(target) {
        if (this.resources < 20) return;

        const size = Math.floor(this.resources * 0.5);
        this.resources -= size;

        game.fleets.push(new Fleet(this, target, size));
    }
}

// ===========================================
// FLEET CLASS
// ===========================================

class Fleet {
    constructor(origin, target, size) {
        this.origin = origin;
        this.target = target;
        this.size = size;
        this.x = origin.x;
        this.y = origin.y;
        this.speed = 0.08;
        this.arrived = false;
    }

    update(delta) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3) {
            this.arrived = true;
            return;
        }

        this.x += (dx / dist) * this.speed * delta;
        this.y += (dy / dist) * this.speed * delta;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.origin.owner === "player" ? "#0ff" : "#ff006e";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    resolve() {
        if (!this.target.owner) {
            this.target.owner = this.origin.owner;
            this.target.resources = this.size;
            return;
        }

        if (this.target.owner === this.origin.owner) {
            this.target.resources += this.size;
        } else {
            this.target.resources -= this.size;
            if (this.target.resources <= 0) {
                this.target.owner = this.origin.owner;
                this.target.resources = Math.abs(this.target.resources);
            }
        }
    }
}

// ===========================================
// AI SYSTEM
// ===========================================

class AIController {
    constructor() {
        this.timer = 0;
    }

    update(delta) {
        this.timer += delta;
        if (this.timer > 3000) {
            this.makeMove();
            this.timer = 0;
        }
    }

    makeMove() {
        const aiPlanets = game.planets.filter(p => p.owner === "ai");
        const targets = game.planets.filter(p => p.owner !== "ai");

        if (aiPlanets.length === 0 || targets.length === 0) return;

        const from = aiPlanets[Math.floor(Math.random() * aiPlanets.length)];
        const to = targets[Math.floor(Math.random() * targets.length)];

        from.sendFleet(to);
    }
}

const ai = new AIController();

// ===========================================
// INPUT
// ===========================================

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const clicked = game.planets.find(p => {
        const dx = mx - p.x;
        const dy = my - p.y;
        return Math.sqrt(dx * dx + dy * dy) < p.radius;
    });

    if (!clicked) return;

    if (!game.selectedPlanet) {
        if (clicked.owner === "player") {
            game.selectedPlanet = clicked;
            selectedPlanetEl.textContent = clicked.id;
        }
    } else {
        if (clicked !== game.selectedPlanet) {
            game.selectedPlanet.sendFleet(clicked);
        }
        game.selectedPlanet = null;
        selectedPlanetEl.textContent = "None";
    }
});

// ===========================================
// MAP GENERATION
// ===========================================

function generateMap() {
    const margin = 100;

    for (let i = 0; i < 8; i++) {
        const x = margin + Math.random() * (canvas.width - margin * 2);
        const y = margin + Math.random() * (canvas.height - margin * 2);

        let owner = null;
        if (i === 0) owner = "player";
        if (i === 1) owner = "ai";

        game.planets.push(new Planet(x, y, owner));
    }
}

generateMap();

// ===========================================
// GAME LOOP
// ===========================================

function gameLoop(timestamp) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    game.update(delta);
    ai.update(delta);
    game.draw();

    const playerTotal = game.planets
        .filter(p => p.owner === "player")
        .reduce((sum, p) => sum + p.resources, 0);

    resourcesEl.textContent = Math.floor(playerTotal);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);