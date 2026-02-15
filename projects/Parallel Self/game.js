/**
 * GAME.JS
 * Main game logic for Parallel Self
 * Handles State Machine, Gameloop, Entities, Rendering
 */

/* =========================================
   CONSTANTS & CONFIG
   ========================================= */
const TILE_SIZE = 40;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

/* =========================================
   ENTITIES
   ========================================= */
class Entity {
    constructor(x, y, w, h) {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.size = new Vector2(w, h);
        this.color = 'white';
        this.grounded = false;
        this.active = true;
    }

    get rect() {
        return new Rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    update() {
        // Physics integration
        this.vel.y += Physics.GRAVITY;
        this.vel.x *= this.grounded ? Physics.FRICTION : Physics.AIR_RESISTANCE;

        this.pos.add(this.vel);
        this.grounded = false; // Reset grounded state, will be set by collision
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    resolveMapCollision(map) {
        // Simple AABB vs Tilemap resolution
        const startC = Math.floor(this.pos.x / TILE_SIZE);
        const endC = Math.floor((this.pos.x + this.size.x) / TILE_SIZE);
        const startR = Math.floor(this.pos.y / TILE_SIZE);
        const endR = Math.floor((this.pos.y + this.size.y) / TILE_SIZE);

        for (let r = startR; r <= endR; r++) {
            for (let c = startC; c <= endC; c++) {
                if (r < 0 || r >= map.length || c < 0 || c >= map[0].length) continue;

                const tile = map[r][c];
                // 1=Wall, 3=Door(Closed)
                const isSolid = tile === 1 || (tile === 3 && !game.levelState.doorsOpen);

                if (isSolid) {
                    const tileRect = new Rect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    if (Utils.rectIntersect(this.rect, tileRect)) {
                        this.resolveRectCollision(tileRect);
                    }
                }
            }
        }
    }

    resolveRectCollision(otherRect) {
        // Calculate overlap
        const dx = (this.pos.x + this.size.x / 2) - (otherRect.pos.x + otherRect.size.x / 2);
        const dy = (this.pos.y + this.size.y / 2) - (otherRect.pos.y + otherRect.size.y / 2);
        const combinedHalfW = (this.size.x + otherRect.size.x) / 2;
        const combinedHalfH = (this.size.y + otherRect.size.y) / 2;

        if (Math.abs(dx) < combinedHalfW && Math.abs(dy) < combinedHalfH) {
            const overlapX = combinedHalfW - Math.abs(dx);
            const overlapY = combinedHalfH - Math.abs(dy);

            if (overlapX >= overlapY) {
                if (dy > 0) {
                    this.pos.y += overlapY;
                    this.vel.y = 0;
                } else {
                    this.pos.y -= overlapY;
                    this.vel.y = 0;
                    this.grounded = true;
                }
            } else {
                if (dx > 0) {
                    this.pos.x += overlapX;
                    this.vel.x = 0;
                } else {
                    this.pos.x -= overlapX;
                    this.vel.x = 0;
                }
            }
        }
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.color = '#ff2e63';
        this.history = [];
        this.dead = false;
        this.finished = false;
        this.historyRate = 2; // Record every N frames to save memory/perf? No, record every frame for smoothness.
    }

    update(input) {
        if (this.dead || this.finished) return;

        // Input Handling
        if (input.isDown('left')) {
            this.vel.x -= 1;
        }
        if (input.isDown('right')) {
            this.vel.x += 1;
        }
        if (input.isPressed('jump') && this.grounded) {
            this.vel.y = Physics.JUMP_FORCE;
            game.audio.playJump();
            game.particles.emit(this.pos.x + this.size.x / 2, this.pos.y + this.size.y, '#fff', 5, 1);
        }

        this.vel.x = Utils.clamp(this.vel.x, -Physics.MAX_SPEED, Physics.MAX_SPEED);
        this.vel.y = Utils.clamp(this.vel.y, -Physics.TERMINAL_VELOCITY, Physics.TERMINAL_VELOCITY);

        this.record();

        super.update();
    }

    record() {
        // Record state for cloning
        this.history.push({
            x: this.pos.x,
            y: this.pos.y,
            vx: this.vel.x,
            vy: this.vel.y,
            grounded: this.grounded || false
        });
    }

    draw(ctx) {
        if (!this.active) return;
        super.draw(ctx);
        // Eyes
        ctx.fillStyle = 'white';
        const eyeOff = this.vel.x >= 0 ? 4 : -4;
        ctx.fillRect(this.pos.x + 6 + eyeOff, this.pos.y + 6, 8, 8);
        ctx.fillRect(this.pos.x + 18 + eyeOff, this.pos.y + 6, 8, 8);
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.active = false;
        game.audio.playDeath();
        game.particles.emit(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.color, 30, 5, 60);
        setTimeout(() => game.resetLoop(), 1000);
    }
}

class Clone extends Entity {
    constructor(x, y, history) {
        super(x, y, 30, 30);
        this.history = history;
        this.frame = 0;
        this.color = 'rgba(100, 200, 255, 0.6)';
    }

    update() {
        if (this.frame < this.history.length) {
            const state = this.history[this.frame];
            this.pos.x = state.x;
            this.pos.y = state.y;
            this.vel.x = state.vx;
            this.vel.y = state.vy;
            this.grounded = state.grounded;
            this.frame++;
        } else {
            // Clone finished history, stays at last pos
            this.active = false;
        }
    }

    draw(ctx) {
        if (this.active) super.draw(ctx);
    }
}

/* =========================================
   GAME DEFINITION
   ========================================= */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.input = new InputHandler();
        this.audio = new AudioSynth();
        this.particles = new ParticleSystem();

        this.state = 'MENU'; // MENU, PLAY, GAMEOVER, WIN
        this.currentLevelIdx = 0;
        this.level = null;

        this.player = null;
        this.clones = [];
        this.startTime = 0;

        this.levelState = {
            doorsOpen: false,
            buttonsPressed: []
        };

        this.ui = {
            timer: document.getElementById('timerFill'),
            status: document.getElementById('statusText'),
            menu: document.getElementById('main-menu'),
            overlay: document.getElementById('ui-overlay')
        };

        this.init();
    }

    init() {
        this.loop_callback = this.loop.bind(this);
        requestAnimationFrame(this.loop_callback);
        this.showMenu();
    }

    loadLevel(index) {
        if (index >= LEVELS.length) {
            this.state = 'WIN';
            this.showWinScreen();
            return;
        }

        this.currentLevelIdx = index;
        const data = LEVELS[index];
        this.level = {
            data: data,
            map: JSON.parse(JSON.stringify(data.layout)), // Deep copy
            spawn: this.findSpawn(data.layout),
            timeLimit: data.timeLimit
        };

        this.state = 'PLAY';
        this.clones = [];
        this.resetLoop();

        // Hide Menu
        this.ui.menu.style.display = 'none';
        this.CanvasFocus();
    }

    findSpawn(map) {
        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[0].length; c++) {
                if (map[r][c] === 9) return new Vector2(c * TILE_SIZE, r * TILE_SIZE);
            }
        }
        return new Vector2(50, 50);
    }

    resetLoop() {
        // Create clone from previous run if valid
        if (this.player && this.player.history.length > 0 && !this.player.dead) {
            this.clones.push(new Clone(this.level.spawn.x, this.level.spawn.y, [...this.player.history]));
            game.audio.playCloneSpawn();
        }

        // Reset Player
        this.player = new Player(this.level.spawn.x, this.level.spawn.y);
        this.startTime = Date.now();
        this.levelState.doorsOpen = false;
        this.ui.status.textContent = `Level ${this.currentLevelIdx + 1} | Loop ${this.clones.length + 1}`;
        game.audio.playSwitch(); // Sound effect for reset
    }

    showMenu() {
        this.state = 'MENU';
        this.ui.menu.style.display = 'flex';
        this.ui.overlay.style.opacity = '0';
    }

    showWinScreen() {
        alert("You beat all levels!"); // Placeholder for better UI
        this.showMenu();
    }

    CanvasFocus() {
        this.ui.overlay.style.opacity = '1';
        this.canvas.focus();
    }

    update() {
        this.input.update();
        this.particles.update();

        if (this.state === 'PLAY') {
            const elapsed = Date.now() - this.startTime;

            // Check time limit
            if (elapsed >= this.level.timeLimit) {
                this.resetLoop();
                return;
            }

            // Update UI Timer
            const pct = (elapsed / this.level.timeLimit) * 100;
            this.ui.timer.style.width = `${pct}%`;

            // Reset Level State for this frame
            let buttonCount = 0;
            let buttonsPressedNow = 0;

            // Update Entities
            this.clones.forEach(c => c.update());
            this.player.update(this.input);

            // Interaction Check (Button presses)
            // We need to count total buttons in level to know logic?
            // Actually simple logic: ANY button opens ALL doors (or specific ones? Simple for now: All opens all)
            // Or better: specific buttons. But map is simple. Let's say any button opens doors.
            // Check map for buttons

            // Re-scan map for logic is slow. Better to cache button locations.
            // Optimization: Scan map once on load.
            let activeButtons = false;

            const entities = [...this.clones, this.player];

            // Check collisions with tiles
            entities.forEach(e => {
                if (e.active) e.resolveMapCollision(this.level.map);

                // Check Button Press
                const c = Math.floor((e.pos.x + e.size.x / 2) / TILE_SIZE);
                const r = Math.floor((e.pos.y + e.size.y / 2) / TILE_SIZE);

                if (r >= 0 && r < this.level.map.length && c >= 0 && c < this.level.map[0].length) {
                    const tile = this.level.map[r][c];

                    if (tile === 2) { // Button
                        activeButtons = true;
                    }
                    if (tile === 4 && e === this.player) { // Exit
                        this.finishLevel();
                    }
                    if (tile === 5 && e.active) { // Spike
                        if (e === this.player) this.player.die();
                        else e.active = false; // Kill clone
                    }
                }
            });

            if (activeButtons && !this.levelState.doorsOpen) {
                this.levelState.doorsOpen = true;
                this.audio.playDoor();
            } else if (!activeButtons && this.levelState.doorsOpen) {
                this.levelState.doorsOpen = false;
            }

            // Manual Reset
            if (this.input.isPressed('restart')) {
                this.resetLoop();
            }
        }
    }

    finishLevel() {
        if (this.player.finished) return;
        this.player.finished = true;
        this.audio.playWin();
        setTimeout(() => {
            this.loadLevel(this.currentLevelIdx + 1);
        }, 1000);
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (this.state === 'PLAY' && this.level) {
            // Draw Map
            for (let r = 0; r < this.level.map.length; r++) {
                for (let c = 0; c < this.level.map[0].length; c++) {
                    const tile = this.level.map[r][c];
                    const x = c * TILE_SIZE;
                    const y = r * TILE_SIZE;

                    // Draw Tile
                    if (tile === 1) { // Wall
                        this.ctx.fillStyle = '#0f3460';
                        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                        // Bevel
                        this.ctx.strokeStyle = '#16213e';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                    } else if (tile === 2) { // Button
                        const pressed = this.levelState.doorsOpen; // Simplified logic, if door is open button is likely pressed
                        this.ctx.fillStyle = pressed ? '#00b894' : '#d63031';
                        this.ctx.fillRect(x + 5, y + 35, TILE_SIZE - 10, 5);
                        this.ctx.shadowBlur = 10;
                        this.ctx.shadowColor = this.ctx.fillStyle;
                        this.ctx.fillRect(x + 5, y + 35, TILE_SIZE - 10, 5);
                        this.ctx.shadowBlur = 0;
                    } else if (tile === 3) { // Door
                        this.ctx.strokeStyle = '#e94560';
                        this.ctx.lineWidth = 4;
                        this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

                        if (!this.levelState.doorsOpen) {
                            this.ctx.fillStyle = 'rgba(233, 69, 96, 0.5)';
                            this.ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                        }
                    } else if (tile === 4) { // Exit
                        this.ctx.fillStyle = '#f1c40f';
                        this.ctx.beginPath();
                        this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
                        this.ctx.fill();
                        // Glow
                        this.ctx.shadowBlur = 20;
                        this.ctx.shadowColor = '#f1c40f';
                        this.ctx.stroke();
                        this.ctx.shadowBlur = 0;
                    } else if (tile === 5) { // Spike
                        this.ctx.fillStyle = '#ff0000';
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y + TILE_SIZE);
                        this.ctx.lineTo(x + TILE_SIZE / 2, y);
                        this.ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
                        this.ctx.fill();
                    } else if (tile === 9) { // Spawn
                        // Invisible or marker
                        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
                        this.ctx.fillRect(x, y + 35, TILE_SIZE, 5);
                    }
                }
            }

            // Draw Help Text
            if (this.level.data.hint) {
                this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.level.data.hint, CANVAS_WIDTH / 2, 100);
            }

            // Draw Entities
            this.clones.forEach(c => c.draw(this.ctx));
            this.player.draw(this.ctx);

            // Draw Particles
            this.particles.draw(this.ctx);
        }

        requestAnimationFrame(this.loop_callback);
    }

    loop() {
        this.update();
        this.draw();
    }
}

// Global Game Instance
const game = new Game();

// Helper to start game from Menu
function startGame() {
    game.loadLevel(0);
    // Init Audio context on user gesture
    if (game.audio.ctx.state === 'suspended') {
        game.audio.ctx.resume();
    }
}
