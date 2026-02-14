
import { Soul } from './soul.js';
import { AfterlifeStorage } from './afterlife.js';
import { GhostRenderer } from './renderer/main.js'; // New Renderer
import { SpectralSynth } from './audio/synth.js';
import { DroneEngine } from './audio/drone.js';
import { VoiceSynth } from './audio/voice.js';
import { SpiritBox } from './interaction/uibox.js';
import { Radar } from './interaction/radar.js';
import { Medium } from './interaction/medium.js';
import { CreditsOverlay } from './ui/credits.js';

class BrowserAfterlife {
    constructor() {
        this.canvas = document.getElementById('spirit-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.soul = new Soul();
        this.renderer = new GhostRenderer(this.ctx);
        this.afterlife = new AfterlifeStorage();

        // Audio
        this.synth = new SpectralSynth();
        this.drone = new DroneEngine(this.synth);
        this.voice = new VoiceSynth(this.synth);

        // UI
        this.box = new SpiritBox();
        this.radar = new Radar();
        this.medium = new Medium(this.ctx, window, (gesture) => this.handleGesture(gesture));
        this.credits = new CreditsOverlay();

        this.entities = [];
        this.running = false;

        this.init();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async init() {
        window.addEventListener('resize', () => this.resize());

        // Input
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Audio Activation
        window.addEventListener('click', async () => {
            if (!this.synth.started) {
                await this.synth.init();
                this.drone.start();
                this.box.log("Audio System: ONLINE");
            }
        });

        // 1. Summoning
        const ghosts = this.afterlife.summon();
        ghosts.forEach(ghostData => {
            this.spawnGhost(ghostData);
        });
        this.box.log(`Detected ${ghosts.length} spectral signatures.`);

        // Show memorial if ghosts found
        if (ghosts.length > 0) {
            // Need to convert data to full objects for credits? 
            // Or just pass the entities once spawned?
            // Let's pass entities after a short delay
            setTimeout(() => {
                this.credits.show(this.entities.map(e => e.soul));
            }, 2000);
        }

        // 2. Birth
        console.log(`Born: ${this.soul.name}`);
        this.box.log(`SESSION STARTED: ${this.soul.name}`);
        this.updateUI();

        // Add Self
        this.cameraEntity = {
            soul: this.soul,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            vx: 0, vy: 0,
            t: 0,
            trail: []
        };
        this.entities.push(this.cameraEntity);

        // 3. Start Loop
        this.running = true;
        this.loop();

        // 4. Persistence
        window.addEventListener('beforeunload', () => {
            this.afterlife.bury(this.soul);
        });

        // Controls
        document.getElementById('kill-btn').addEventListener('click', () => {
            this.afterlife.bury(this.soul);
            location.reload();
        });

        document.getElementById('summon-btn').addEventListener('click', () => {
            const lostSoul = new Soul();
            lostSoul.name = "Lost " + lostSoul.name;
            lostSoul.manifest.archetype = "Shade"; // Default for lost souls
            this.spawnGhost(lostSoul); // spawnGhost handles hydration check? No, passed Soul object
            this.box.log(`MANIFESTATION: ${lostSoul.name}`);
            this.voice.whisper(lostSoul.name);
        });
    }

    spawnGhost(dataOrSoul) {
        let soul;
        if (dataOrSoul instanceof Soul) {
            soul = dataOrSoul;
        } else {
            soul = new Soul(dataOrSoul);
        }

        this.entities.push({
            soul: soul,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            t: Math.random() * 1000,
            trail: []
        });
    }

    updateUI() {
        document.getElementById('entity-name').innerText = this.soul.name;

        const list = document.getElementById('ghost-list');
        list.innerHTML = '';
        this.entities.forEach(ent => {
            if (ent === this.cameraEntity) return;
            const li = document.createElement('li');
            li.innerHTML = `<span style="color:${ent.soul.color}">●</span> ${ent.soul.name} <small>[${ent.soul.manifest.archetype}]</small>`;
            list.appendChild(li);
        });
    }

    handleGesture(gesture) {
        if (gesture === 'CIRCLE') {
            this.box.log("RITUAL: SUMMONING CIRCLE DETECTED");
            // Summon random ghost
            const lostSoul = new Soul();
            lostSoul.name = "Summoned " + lostSoul.name;
            lostSoul.manifest.archetype = "Poltergeist";
            this.spawnGhost(lostSoul);
            this.voice.whisper("Join Us");
            this.synth.playTone(110, 1, 'sawtooth');
        } else {
            this.box.log(`RITUAL: UNKNOWN SYMBOL (${gesture})`);
        }
    }

    loop() {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update Physics
        this.entities.forEach(entity => {
            this.updateEntity(entity);
        });

        // Draw Visuals
        this.renderer.draw(this.entities, this.soul);

        // Draw Medium Trails
        this.medium.draw(this.ctx); // Wait, we passed ctx to medium, but let's be explicit if needed or rely on its internal ctx

        // Update UI
        this.box.update(this.entities);
        this.radar.update(this.entities);

        // Update Age
        const age = Math.floor((Date.now() - this.soul.born) / 1000);
        document.getElementById('entity-age').innerText = `${age}s`;

        // Audio Drone Modulation
        if (this.drone.active) {
            const danger = this.entities.length;
            // TODO: modulated intensity
        }

        requestAnimationFrame(() => this.loop());
    }

    updateEntity(entity) {
        // Self follows mouse loosely
        if (entity === this.cameraEntity) {
            const dx = this.mouseX - entity.x;
            const dy = this.mouseY - entity.y;
            entity.vx += dx * 0.005;
            entity.vy += dy * 0.005;
        }

        entity.trail.push({ x: entity.x, y: entity.y });
        if (entity.trail.length > 20) entity.trail.shift();

        // Archetype Behavior
        const type = entity.soul.manifest.archetype;

        if (type === 'Wraith') {
            // Chases mouse
            const dx = this.mouseX - entity.x;
            const dy = this.mouseY - entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 100) {
                entity.vx += (dx / dist) * 0.1;
                entity.vy += (dy / dist) * 0.1;
            }
        } else if (type === 'Poltergeist') {
            // Random jerky movements
            if (Math.random() > 0.95) {
                entity.vx += (Math.random() - 0.5) * 5;
                entity.vy += (Math.random() - 0.5) * 5;
            }
        }

        entity.x += entity.vx;
        entity.y += entity.vy;
        entity.t += 0.05;

        entity.vx *= 0.96;
        entity.vy *= 0.96;

        // Screen wrap
        if (entity.x < -50) entity.x = window.innerWidth + 50;
        if (entity.x > window.innerWidth + 50) entity.x = -50;
        if (entity.y < -50) entity.y = window.innerHeight + 50;
        if (entity.y > window.innerHeight + 50) entity.y = -50;
    }
}

new BrowserAfterlife();
