import { Renderer } from './Renderer.js';
import { ParticleSystem } from './Particles.js';
import { Rocket } from './Rocket.js';
import { Utils } from './Utils.js';
import { ObstacleManager } from './Obstacles.js';
import { AudioController } from './AudioController.js';

export class Game {
    constructor() {
        this.renderer = new Renderer('sim-canvas');
        this.particles = new ParticleSystem(3000);
        this.rocket = new Rocket();
        this.obstacles = new ObstacleManager(this.renderer.width, this.renderer.height);
        this.audio = new AudioController();

        this.state = 'IDLE'; // IDLE, IGNITION, ASCENT, STAGING, ORBIT, ABORT, GAMEOVER
        this.missionTime = -10; // T-Minus 10s
        this.altitude = 0;
        this.velocity = 0;
        this.score = 0;

        this.lastTime = 0;

        // Input State
        this.keys = {
            left: false,
            right: false
        };

        // Configuration
        this.launchConfig = {
            ignitionTime: -3,
            liftoffTime: 0,
            stagingTime: 30, // Increased for gameplay
            orbitTime: 60
        };

        // DOM Elements
        this.ui = {
            status: document.getElementById('status-text'),
            alt: document.getElementById('alt-value'),
            vel: document.getElementById('vel-value'),
            time: document.getElementById('time-value'),
            btnLaunch: document.getElementById('btn-launch'),
            btnAbort: document.getElementById('btn-abort'),
            btnReset: document.getElementById('btn-reset'),
            fuelBar: document.getElementById('fuel-fill'),
            integrityBar: document.getElementById('integrity-fill'),
            gameOverOverlay: document.getElementById('game-over-overlay'),
            gameOverReason: document.getElementById('game-over-reason')
        };

        this.bindEvents();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    bindEvents() {
        this.ui.btnLaunch.addEventListener('click', () => this.initiateLaunch());
        this.ui.btnAbort.addEventListener('click', () => this.abort());
        this.ui.btnReset.addEventListener('click', () => this.reset());

        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
        });
    }

    initiateLaunch() {
        if (this.state !== 'IDLE') return;
        this.audio.init().then(() => {
            this.state = 'IGNITION';
            this.missionTime = -10;
            this.ui.btnLaunch.classList.add('hidden');
            this.ui.btnAbort.classList.remove('hidden');
            this.updateStatus('AUTO_SEQUENCE_START');
            this.audio.playAlert();
        });
    }

    abort() {
        this.state = 'ABORT';
        this.updateStatus('MISSION_ABORTED');
        this.ui.btnAbort.classList.add('hidden');
        this.ui.btnReset.classList.remove('hidden');
        this.audio.stopEngine();
        this.audio.playAlert();
    }

    reset() {
        this.state = 'IDLE';
        this.missionTime = -10;
        this.altitude = 0;
        this.velocity = 0;

        this.rocket.isDead = false;
        this.rocket.x = 0;
        this.rocket.vx = 0;
        this.rocket.fuel = 100;
        this.rocket.health = 100;
        this.rocket.stage1Separated = false;

        this.obstacles.reset();

        this.ui.btnReset.classList.add('hidden');
        this.ui.btnLaunch.classList.remove('hidden');
        this.updateStatus('IDLE');
        this.renderer.initStars();
    }

    updateStatus(text) {
        this.ui.status.innerText = text;
        if (text === 'MISSION_ABORTED') {
            this.ui.status.style.color = '#ff2a2a';
        } else {
            this.ui.status.style.color = '#00f2ff';
        }
    }

    updatePhysics(dt) {
        if (this.state === 'IDLE' || this.state === 'GAMEOVER') return;

        // Clock
        if (this.state !== 'ABORT') {
            this.missionTime += dt;
        }

        // --- Phases ---
        if (this.state === 'IGNITION') {
            if (this.missionTime >= -3 && this.missionTime < 0) {
                this.audio.startEngine(); // Start rumble
                // Ramp throttle audio?
                this.audio.setEnginePitch(0.1 + (3 + this.missionTime) / 3);
            }

            if (this.missionTime >= 0) {
                this.state = 'ASCENT';
                this.updateStatus('LIFTOFF');
            }
        }

        if (this.state === 'ASCENT') {
            // 1. Vertical Movement
            let t = this.missionTime;
            // Cap velocity for gameplay
            this.velocity = Math.min(2000, 100 + (t * 50));
            this.altitude += (this.velocity / 3600) * 1000 * dt * 20;

            this.audio.setEnginePitch(this.velocity / 2000);

            // 2. Horizontal Movement (Steering)
            const moveSpeed = 400;
            if (this.keys.left) {
                this.rocket.vx -= moveSpeed * dt * 5;
                this.rocket.tilt = -0.1;
            } else if (this.keys.right) {
                this.rocket.vx += moveSpeed * dt * 5;
                this.rocket.tilt = 0.1;
            } else {
                // Return to center / dampening
                this.rocket.vx *= 0.95;
                this.rocket.tilt *= 0.9;
            }

            // Cap horizontal speed
            this.rocket.vx = Utils.clamp(this.rocket.vx, -300, 300);
            this.rocket.x += this.rocket.vx * dt;

            // Boundaries
            const maxOffset = (this.renderer.width / 2) - 50;
            if (this.rocket.x < -maxOffset) {
                this.rocket.x = -maxOffset;
                this.rocket.vx = 0;
            }
            if (this.rocket.x > maxOffset) {
                this.rocket.x = maxOffset;
                this.rocket.vx = 0;
            }

            // 3. Fuel System
            this.rocket.fuel -= dt * 2; // Lasts ~50 seconds
            if (this.rocket.fuel <= 0) {
                this.rocket.fuel = 0;
                this.triggerGameOver('FUEL_DEPLETED');
            }

            // 4. Obstacles
            this.obstacles.update(dt, this.velocity * 0.5);

            // 5. Collision Detection
            // Simple circle AABB or circle-circle
            // Rocket hitbox is roughly rect centered at x, height-150?
            const rBounds = {
                x: (this.renderer.width / 2) + this.rocket.x,
                y: this.renderer.height - 150, // Visual Y
                w: 30,
                h: 120
            };

            for (const obs of this.obstacles.obstacles) {
                // Circle detection against Rocket Center
                // Obs x,y are absolute screen coords
                const dx = obs.x - rBounds.x;
                const dy = obs.y - rBounds.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < (obs.size / 2 + 20)) {
                    // HIT
                    this.rocket.health -= 20; // Take damage
                    this.renderer.camera.shakeMagnitude = 10;
                    this.audio.playExplosion();

                    // Remove obstacle?
                    obs.y = 2000; // throw away

                    if (this.rocket.health <= 0) {
                        this.triggerGameOver('STRUCTURAL_FAILURE');
                    }
                }
            }

            // 6. Staging Logic
            if (this.missionTime > this.launchConfig.stagingTime && !this.rocket.stage1Separated) {
                // this.state = 'STAGING'; // Don't stop control during staging
                this.rocket.stage1Separated = true;
                this.updateStatus('STAGE_SEPARATION');
                this.renderer.camera.shakeMagnitude = 5;
                this.particles.spawnExplosion(this.renderer.width / 2 + this.rocket.x, this.renderer.height - 100);
                this.audio.playExplosion();
            }
        }
    }

    triggerGameOver(reason) {
        this.state = 'GAMEOVER';
        this.updateStatus(reason);
        this.audio.stopEngine();
        this.audio.playExplosion();
        this.rocket.isDead = true;

        // Show reset button
        this.ui.btnReset.classList.remove('hidden');
        this.ui.btnAbort.classList.add('hidden');
    }

    reset() {
        this.state = 'IDLE';
        this.missionTime = -10;
        this.altitude = 0;
        this.velocity = 0;

        this.rocket.isDead = false;
        this.rocket.x = 0;
        this.rocket.vx = 0;
        this.rocket.fuel = 100;
        this.rocket.health = 100;
        this.rocket.stage1Separated = false;

        this.obstacles.reset();

        this.ui.btnReset.classList.add('hidden');
        this.ui.btnLaunch.classList.remove('hidden');
        this.updateStatus('IDLE');
        this.renderer.initStars();
    }

    // ... (keep updateStatus)

    // ... (keep updateVisuals - wait I need to update particle spawn position based on rocket.x)

    updateVisuals(dt) {
        // Camera Shake Logic
        if (this.state === 'ASCENT') {
            this.renderer.camera.shakeMagnitude = Math.max(0, this.renderer.camera.shakeMagnitude * 0.9);
        }

        // Particle Emitters
        const cx = (this.renderer.width / 2) + this.rocket.x; // Follow rocket
        const cy = this.renderer.height - 150;

        if (this.state === 'ASCENT' || (this.state === 'IGNITION' && this.missionTime > -0.5)) {
            if (!this.rocket.isDead) {
                // Main Engine Flame
                if (!this.rocket.stage1Separated) {
                    for (let i = 0; i < 5; i++) {
                        this.particles.spawn(
                            cx + Utils.randomRange(-10, 10),
                            cy + 130,
                            'fire',
                            { vy: 300 + this.velocity }
                        );
                    }
                } else {
                    // Stage 2
                    for (let i = 0; i < 5; i++) {
                        this.particles.spawn(
                            cx + Utils.randomRange(-5, 5),
                            cy - 40,
                            'fire',
                            { vy: 400, color: '#00ccff', size: 3 }
                        );
                    }
                }
            }
        }

        this.updateUI();
    }

    updateUI() {
        // Format Time
        let t = Math.abs(this.missionTime);
        let min = Math.floor(t / 60);
        let sec = Math.floor(t % 60);
        let ms = Math.floor((t - Math.floor(t)) * 100);
        let sign = this.missionTime < 0 ? 'T-' : 'T+';
        this.ui.time.innerText = `${sign}${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;

        this.ui.alt.innerText = (this.altitude / 1000).toFixed(1);
        this.ui.vel.innerText = this.velocity.toFixed(0);

        // Update Fuel & Integrity Bars (Check existence first as we plan to add them)
        if (this.ui.fuelBar) this.ui.fuelBar.style.width = `${this.rocket.fuel}%`;
        if (this.ui.integrityBar) this.ui.integrityBar.style.width = `${this.rocket.health}%`;
    }

    draw() {
        this.renderer.clear();
        this.renderer.applyCameraShake();

        // 1. Draw Sky / Background
        // Parallax X based on rocket X?
        // Let's pass rocket.x to drawSky for parallax effect
        this.renderer.drawSky(this.altitude, this.rocket.x);
        this.renderer.drawPlanets(this.altitude);

        // 2. Draw Earth
        this.renderer.drawEarthParams(this.altitude);

        // 3. Draw Obstacles (Behind rocket?)
        this.obstacles.draw(this.renderer.ctx);

        // 4. Draw Particles
        this.particles.draw(this.renderer.ctx, 0);

        // 5. Draw Rocket
        this.rocket.draw(this.renderer.ctx, this.renderer.width / 2, this.renderer.height - 150);

        this.renderer.resetTransform();
    }

    loop(timestamp) {
        let dt = (timestamp - this.lastTime) / 1000;
        if (dt > 0.1) dt = 0.1; // Cap delta time
        this.lastTime = timestamp;

        this.updatePhysics(dt);
        this.updateVisuals(dt);
        this.particles.update(dt);
        this.draw();

        requestAnimationFrame(this.loop);
    }
}
