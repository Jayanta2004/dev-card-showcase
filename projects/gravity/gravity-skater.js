const canvas = document.getElementById('skater-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const tricksDisplay = document.getElementById('tricks');
const timeDisplay = document.getElementById('time');

class GravityWell {
    constructor(x, y, strength = 0.1) {
        this.x = x;
        this.y = y;
        this.strength = strength;
        this.radius = 50;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fill();
    }

    attract(skater) {
        const dx = this.x - skater.x;
        const dy = this.y - skater.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const force = this.strength / (dist * dist);
            skater.vx += (dx / dist) * force;
            skater.vy += (dy / dist) * force;
        }
    }
}

class Skater {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 10;
        this.onGround = false;
        this.jumpPower = 5;
        this.gravityDir = 0; // Direction of gravity manipulation
        this.trickMultiplier = 1;
    }

    update(wells, keys, mouse) {
        // Gravity from wells
        wells.forEach(well => well.attract(this));

        // Directional gravity manipulation
        if (keys.left || keys.a) this.gravityDir -= 0.05;
        if (keys.right || keys.d) this.gravityDir += 0.05;

        // Apply manipulated gravity
        this.vx += Math.cos(this.gravityDir) * 0.01;
        this.vy += Math.sin(this.gravityDir) * 0.01;

        // Friction
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Check ground (near well)
        this.onGround = wells.some(well => Math.hypot(this.x - well.x, this.y - well.y) < well.radius + this.radius);
    }

    jump(mouseX, mouseY) {
        if (this.onGround) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                this.vx += (dx / dist) * this.jumpPower;
                this.vy += (dy / dist) * this.jumpPower;
                this.onGround = false;
                // Trick scoring
                this.trickMultiplier++;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        // Draw gravity direction
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(this.gravityDir) * 20, this.y + Math.sin(this.gravityDir) * 20);
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
    }
}

class Game {
    constructor() {
        this.skater = new Skater(canvas.width / 2, canvas.height / 2);
        this.wells = [
            new GravityWell(200, 200),
            new GravityWell(600, 300),
            new GravityWell(400, 500)
        ];
        this.keys = {};
        this.mouse = {x: 0, y: 0};
        this.score = 0;
        this.tricks = 0;
        this.startTime = Date.now();
        this.timeAttack = false;
        this.bindEvents();
        this.gameLoop();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.skater.jump(this.mouse.x, this.mouse.y);
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        document.getElementById('time-attack').addEventListener('click', () => {
            this.timeAttack = !this.timeAttack;
            if (this.timeAttack) {
                this.startTime = Date.now();
                this.score = 0;
                this.tricks = 0;
            }
        });
    }

    update() {
        this.skater.update(this.wells, this.keys, this.mouse);

        // Score tricks
        if (this.skater.onGround && this.skater.trickMultiplier > 1) {
            this.score += 10 * this.skater.trickMultiplier;
            this.tricks += this.skater.trickMultiplier;
            this.skater.trickMultiplier = 1;
        }

        scoreDisplay.textContent = `Score: ${this.score}`;
        tricksDisplay.textContent = `Tricks: ${this.tricks}`;
        const elapsed = (Date.now() - this.startTime) / 1000;
        timeDisplay.textContent = `Time: ${elapsed.toFixed(2)}`;
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.wells.forEach(well => well.draw());
        this.skater.draw();

        // Draw mouse aim
        ctx.beginPath();
        ctx.moveTo(this.skater.x, this.skater.y);
        ctx.lineTo(this.mouse.x, this.mouse.y);
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

new Game();