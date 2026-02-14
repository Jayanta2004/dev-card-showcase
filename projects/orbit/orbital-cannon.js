const canvas = document.getElementById('cannon-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const waveDisplay = document.getElementById('wave');
const healthDisplay = document.getElementById('health');

class Planet {
    constructor(x, y, radius = 50) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
    }
}

class Cannon {
    constructor(planet, angle) {
        this.planet = planet;
        this.angle = angle;
        this.targetAngle = angle;
        this.rotationSpeed = 0;
        this.inertia = 0.9;
        this.length = 30;
    }

    update(mouseX, mouseY) {
        // Calculate target angle to mouse
        const dx = mouseX - this.planet.x;
        const dy = mouseY - this.planet.y;
        this.targetAngle = Math.atan2(dy, dx);

        // Rotate with inertia
        const angleDiff = this.targetAngle - this.angle;
        this.rotationSpeed += angleDiff * 0.01;
        this.rotationSpeed *= this.inertia;
        this.angle += this.rotationSpeed;
    }

    draw() {
        const x = this.planet.x + Math.cos(this.angle) * this.planet.radius;
        const y = this.planet.y + Math.sin(this.angle) * this.planet.radius;
        const endX = x + Math.cos(this.angle) * this.length;
        const endY = y + Math.sin(this.angle) * this.length;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    fire() {
        const x = this.planet.x + Math.cos(this.angle) * this.planet.radius;
        const y = this.planet.y + Math.sin(this.angle) * this.planet.radius;
        return new Shot(x, y, this.angle);
    }
}

class Meteor {
    constructor() {
        // Spawn from edge
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        if (side === 0) { // Top
            x = Math.random() * canvas.width;
            y = -10;
            vx = (Math.random() - 0.5) * 2;
            vy = Math.random() * 2 + 1;
        } else if (side === 1) { // Right
            x = canvas.width + 10;
            y = Math.random() * canvas.height;
            vx = -(Math.random() * 2 + 1);
            vy = (Math.random() - 0.5) * 2;
        } else if (side === 2) { // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + 10;
            vx = (Math.random() - 0.5) * 2;
            vy = -(Math.random() * 2 + 1);
        } else { // Left
            x = -10;
            y = Math.random() * canvas.height;
            vx = Math.random() * 2 + 1;
            vy = (Math.random() - 0.5) * 2;
        }
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 10;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'orange';
        ctx.fill();
    }

    hitsPlanet(planet) {
        return Math.hypot(this.x - planet.x, this.y - planet.y) < planet.radius + this.radius;
    }
}

class Shot {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * 8;
        this.vy = Math.sin(angle) * 8;
        this.radius = 3;
        this.life = 200; // Frames
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }

    hits(meteor) {
        return Math.hypot(this.x - meteor.x, this.y - meteor.y) < this.radius + meteor.radius;
    }
}

class Game {
    constructor() {
        this.planet = new Planet(canvas.width / 2, canvas.height / 2);
        this.cannons = [
            new Cannon(this.planet, 0),
            new Cannon(this.planet, Math.PI / 2),
            new Cannon(this.planet, Math.PI),
            new Cannon(this.planet, -Math.PI / 2)
        ];
        this.meteors = [];
        this.shots = [];
        this.score = 0;
        this.wave = 1;
        this.health = 100;
        this.mouse = {x: canvas.width / 2, y: canvas.height / 2};
        this.multiPlanet = false;
        this.extraPlanet = null;
        this.spawnTimer = 0;
        this.bindEvents();
        this.gameLoop();
    }

    bindEvents() {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.fireShots();
            }
        });
        document.getElementById('multi-planet').addEventListener('click', () => {
            this.multiPlanet = !this.multiPlanet;
            if (this.multiPlanet) {
                this.extraPlanet = new Planet(150, 150, 30);
            } else {
                this.extraPlanet = null;
            }
        });
    }

    fireShots() {
        this.cannons.forEach(cannon => {
            // Predictive aiming: find closest meteor and predict position
            let target = null;
            let minDist = Infinity;
            this.meteors.forEach(meteor => {
                const dist = Math.hypot(meteor.x - this.planet.x, meteor.y - this.planet.y);
                if (dist < minDist) {
                    minDist = dist;
                    target = meteor;
                }
            });
            if (target) {
                // Predict position (simple: assume constant velocity)
                const shotSpeed = 8;
                const dist = Math.hypot(target.x - cannon.planet.x, target.y - cannon.planet.y);
                const time = dist / shotSpeed;
                const predX = target.x + target.vx * time;
                const predY = target.y + target.vy * time;
                const dx = predX - cannon.planet.x;
                const dy = predY - cannon.planet.y;
                cannon.targetAngle = Math.atan2(dy, dx);
            }
            this.shots.push(cannon.fire());
        });
    }

    update() {
        // Update cannons
        this.cannons.forEach(cannon => cannon.update(this.mouse.x, this.mouse.y));

        // Update meteors
        this.meteors.forEach(meteor => meteor.update());

        // Update shots
        this.shots.forEach(shot => shot.update());
        this.shots = this.shots.filter(shot => shot.life > 0);

        // Spawn meteors
        this.spawnTimer++;
        if (this.spawnTimer > 120 - this.wave * 10) { // Faster spawning
            this.meteors.push(new Meteor());
            this.spawnTimer = 0;
        }

        // Check collisions
        this.shots.forEach(shot => {
            this.meteors.forEach(meteor => {
                if (shot.hits(meteor)) {
                    shot.life = 0;
                    meteor.radius = 0; // Remove
                    this.score += 10;
                }
            });
        });
        this.meteors = this.meteors.filter(meteor => meteor.radius > 0);

        // Check planet hits
        this.meteors.forEach(meteor => {
            if (meteor.hitsPlanet(this.planet)) {
                this.health -= 10;
                meteor.radius = 0;
            }
            if (this.extraPlanet && meteor.hitsPlanet(this.extraPlanet)) {
                this.health -= 5;
                meteor.radius = 0;
            }
        });
        this.meteors = this.meteors.filter(meteor => meteor.radius > 0);

        // Next wave
        if (this.meteors.length === 0 && this.spawnTimer > 240) {
            this.wave++;
            this.spawnTimer = 0;
        }

        // Game over
        if (this.health <= 0) {
            alert('Game Over!');
            this.health = 100;
            this.score = 0;
            this.wave = 1;
            this.meteors = [];
            this.shots = [];
        }

        scoreDisplay.textContent = `Score: ${this.score}`;
        waveDisplay.textContent = `Wave: ${this.wave}`;
        healthDisplay.textContent = `Health: ${this.health}`;
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.planet.draw();
        if (this.extraPlanet) this.extraPlanet.draw();
        this.cannons.forEach(cannon => cannon.draw());
        this.meteors.forEach(meteor => meteor.draw());
        this.shots.forEach(shot => shot.draw());
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

new Game();