const canvas = document.getElementById('rally-canvas');
const ctx = canvas.getContext('2d');
const speedDisplay = document.getElementById('speed');
const lapDisplay = document.getElementById('lap');
const timeDisplay = document.getElementById('time');

class Car {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.1;
        this.friction = 0.05;
        this.turnSpeed = 0.05;
        this.width = 20;
        this.height = 10;
        this.driftBoost = 0;
    }

    update(keys, track) {
        // Acceleration
        if (keys.up || keys.w) {
            this.speed += this.acceleration;
        }
        if (keys.down || keys.s) {
            this.speed -= this.acceleration * 0.5;
        }
        if (keys.space) {
            this.speed *= 0.9; // Brake
        }

        // Turning
        if (keys.left || keys.a) {
            this.angle -= this.turnSpeed * (this.speed / this.maxSpeed);
        }
        if (keys.right || keys.d) {
            this.angle += this.turnSpeed * (this.speed / this.maxSpeed);
        }

        // Friction and terrain
        let friction = this.friction;
        if (this.inSand(track)) {
            friction *= 2; // More friction in sand
        }
        this.speed *= (1 - friction);

        // Limit speed
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed * 0.5) this.speed = -this.maxSpeed * 0.5;

        // Drift boost
        if (Math.abs(this.angle) > 0.1 && this.speed > 2) {
            this.driftBoost += 0.01;
            if (this.driftBoost > 1) this.driftBoost = 1;
        } else {
            if (this.driftBoost > 0) this.driftBoost -= 0.02;
        }
        this.speed += this.driftBoost * 0.1;

        // Move
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Wrap around screen (simple)
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    inSand(track) {
        // Check if car is in sand area
        return track.sandPatches.some(patch => Math.hypot(this.x - patch.x, this.y - patch.y) < patch.radius);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = 'red';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        ctx.restore();
    }
}

class Track {
    constructor() {
        this.checkpoints = [];
        this.sandPatches = [];
        this.path = [];
        this.generateTrack();
    }

    generateTrack() {
        // Simple procedural track: oval with variations
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radiusX = 300;
        const radiusY = 150;
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radiusX + Math.sin(angle * 3) * 50;
            const y = centerY + Math.sin(angle) * radiusY + Math.cos(angle * 3) * 30;
            this.path.push({x, y});
        }
        // Checkpoints
        this.checkpoints = [
            {x: centerX + radiusX, y: centerY, passed: false},
            {x: centerX, y: centerY - radiusY, passed: false},
            {x: centerX - radiusX, y: centerY, passed: false},
            {x: centerX, y: centerY + radiusY, passed: false}
        ];
        // Sand patches
        for (let i = 0; i < 10; i++) {
            this.sandPatches.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 50 + Math.random() * 50
            });
        }
    }

    draw() {
        // Draw track path
        ctx.strokeStyle = 'brown';
        ctx.lineWidth = 20;
        ctx.beginPath();
        this.path.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.stroke();

        // Draw sand patches
        this.sandPatches.forEach(patch => {
            ctx.beginPath();
            ctx.arc(patch.x, patch.y, patch.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(222, 184, 135, 0.5)'; // Sandy color
            ctx.fill();
        });
        // Draw checkpoints
        this.checkpoints.forEach(cp => {
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = cp.passed ? 'green' : 'yellow';
            ctx.fill();
        });
    }

    checkCheckpoint(car) {
        this.checkpoints.forEach(cp => {
            if (!cp.passed && Math.hypot(car.x - cp.x, car.y - cp.y) < 15) {
                cp.passed = true;
            }
        });
    }
}

class Game {
    constructor() {
        this.car = new Car(canvas.width / 2, canvas.height / 2);
        this.track = new Track();
        this.keys = {};
        this.lap = 1;
        this.maxLaps = 3;
        this.startTime = Date.now();
        this.nightMode = false;
        this.particles = [];
        this.bindEvents();
        this.gameLoop();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        document.getElementById('night-mode').addEventListener('click', () => {
            this.nightMode = !this.nightMode;
            if (this.nightMode) {
                canvas.style.backgroundColor = '#2c2c2c';
                for (let i = 0; i < 50; i++) {
                    this.particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        vx: Math.random() * 2 - 1,
                        vy: Math.random() * 2 + 1,
                        life: 100
                    });
                }
            } else {
                canvas.style.backgroundColor = '#deb887';
                this.particles = [];
            }
        });
    }

    update() {
        this.car.update(this.keys, this.track);
        this.track.checkCheckpoint(this.car);

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.y > canvas.height) {
                p.y = 0;
                p.x = Math.random() * canvas.width;
            }
        });
        this.particles = this.particles.filter(p => p.life > 0);

        // Check if all checkpoints passed
        if (this.track.checkpoints.every(cp => cp.passed)) {
            this.lap++;
            if (this.lap > this.maxLaps) {
                alert('Race Complete!');
                this.lap = this.maxLaps;
            } else {
                this.track.checkpoints.forEach(cp => cp.passed = false);
            }
        }

        speedDisplay.textContent = `Speed: ${Math.round(this.car.speed * 10)}`;
        lapDisplay.textContent = `Lap: ${this.lap}/${this.maxLaps}`;
        const elapsed = (Date.now() - this.startTime) / 1000;
        timeDisplay.textContent = `Time: ${elapsed.toFixed(2)}`;
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.track.draw();
        this.car.draw();

        // Draw particles
        this.particles.forEach(p => {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.life / 100})`;
            ctx.fillRect(p.x, p.y, 2, 2);
        });
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

new Game();