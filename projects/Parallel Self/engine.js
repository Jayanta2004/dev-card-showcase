/**
 * ENGINE.JS
 * Core systems for Parallel Self
 * Contains: Math, Physics, Input, Audio, Particles, Utilities
 */

/* =========================================
   MATH UTILITIES
   ========================================= */
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const m = this.mag();
        if (m > 0) {
            this.div(m);
        }
        return this;
    }

    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
        return this;
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    static lerp(v1, v2, t) {
        return new Vector2(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        );
    }
}

class Rect {
    constructor(x, y, w, h) {
        this.pos = new Vector2(x, y);
        this.size = new Vector2(w, h);
    }

    get left() { return this.pos.x; }
    get right() { return this.pos.x + this.size.x; }
    get top() { return this.pos.y; }
    get bottom() { return this.pos.y + this.size.y; }
    get center() {
        return new Vector2(
            this.pos.x + this.size.x / 2,
            this.pos.y + this.size.y / 2
        );
    }

    intersects(other) {
        return (
            this.left < other.right &&
            this.right > other.left &&
            this.top < other.bottom &&
            this.bottom > other.top
        );
    }

    contains(point) {
        return (
            point.x >= this.left &&
            point.x <= this.right &&
            point.y >= this.top &&
            point.y <= this.bottom
        );
    }
}

/* =========================================
   INPUT SYSTEM
   ========================================= */
class InputHandler {
    constructor() {
        this.keys = {};
        this.prevKeys = {};
        this.mouse = new Vector2();
        this.mouseDown = false;
        this.prevMouseDown = false;

        // Key Mapping
        this.map = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right',
            ' ': 'jump',
            'r': 'restart', 'R': 'restart',
            'z': 'action', 'Z': 'action',
            'Escape': 'pause'
        };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', () => this.mouseDown = true);
        window.addEventListener('mouseup', () => this.mouseDown = false);
    }

    onKeyDown(e) {
        if (this.map[e.key]) {
            this.keys[this.map[e.key]] = true;
        }
    }

    onKeyUp(e) {
        if (this.map[e.key]) {
            this.keys[this.map[e.key]] = false;
        }
    }

    onMouseMove(e) {
        const rect = document.querySelector('canvas')?.getBoundingClientRect();
        if (rect) {
            this.mouse.set(e.clientX - rect.left, e.clientY - rect.top);
        }
    }

    update() {
        this.prevKeys = { ...this.keys };
        this.prevMouseDown = this.mouseDown;
    }

    isDown(action) {
        return !!this.keys[action];
    }

    isPressed(action) {
        return !!this.keys[action] && !this.prevKeys[action];
    }

    isReleased(action) {
        return !this.keys[action] && !!this.prevKeys[action];
    }
}

/* =========================================
   AUDIO SYSTEM (Web Audio API)
   ========================================= */
class AudioSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
        this.enabled = true;
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) this.ctx.resume();
        else this.ctx.suspend();
    }

    playTone(freq, type, duration, vol = 1) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playJump() {
        this.playTone(400, 'square', 0.1, 0.5);
        setTimeout(() => this.playTone(600, 'square', 0.1, 0.3), 50);
    }

    playLand() {
        this.playTone(100, 'sawtooth', 0.1, 0.5);
    }

    playSwitch() {
        this.playTone(800, 'sine', 0.1, 0.3);
    }

    playDoor() {
        this.playTone(200, 'triangle', 0.5, 0.4);
    }

    playWin() {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'square', 0.3, 0.3), i * 100);
        });
    }

    playCloneSpawn() {
        // Sci-fi warp sound
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playDeath() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
}

/* =========================================
   PARTICLE SYSTEM
   ========================================= */
class Particle {
    constructor(x, y, color, speed, life) {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed);
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.pos.add(this.vel);
        this.life--;
        this.size *= 0.95;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color, count = 10, speed = 2, life = 30) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, speed, life));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

/* =========================================
   PHYSICS CONSTANTS
   ========================================= */
const Physics = {
    GRAVITY: 0.8,
    FRICTION: 0.85,
    AIR_RESISTANCE: 0.95,
    MAX_SPEED: 12,
    JUMP_FORCE: -14,
    TERMINAL_VELOCITY: 20
};

/* =========================================
   UTILITIES
   ========================================= */
const Utils = {
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    },

    rectIntersect(r1, r2) {
        return (
            r1.x < r2.x + r2.w &&
            r1.x + r1.w > r2.x &&
            r1.y < r2.y + r2.h &&
            r1.y + r1.h > r2.y
        );
    },

    easeOutQuad(t) {
        return t * (2 - t);
    },

    formatTime(ms) {
        const secs = Math.ceil(ms / 1000);
        return secs < 10 ? `0${secs}` : secs;
    }
};
