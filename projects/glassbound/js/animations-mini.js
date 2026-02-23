// Glassbound - Condensed Animations
class AnimationController {
    constructor() {
        this.anims = new Map();
        this.running = false;
        this.lastTime = 0;
    }
    
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    loop() {
        if (!this.running) return;
        const now = performance.now();
        const dt = now - this.lastTime;
        this.lastTime = now;
        
        this.anims.forEach((anim, id) => {
            if (anim.active) {
                anim.update(dt);
                if (anim.isComplete()) this.anims.delete(id);
            }
        });
        
        requestAnimationFrame(() => this.loop());
    }
    
    register(id, anim) { this.anims.set(id, anim); }
    stop() { this.running = false; }
    clear() { this.anims.clear(); }
}

class GlassShake {
    constructor(el, intensity, duration = 400) {
        this.el = el;
        this.intensity = intensity;
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
        this.orig = el.style.transform || '';
    }
    
    update(dt) {
        if (!this.active) return;
        this.elapsed += dt;
        const t = this.elapsed / this.duration;
        
        if (t >= 1) {
            this.el.style.transform = this.orig;
            this.active = false;
            return;
        }
        
        const decay = 1 - t * t;
        const x = Math.sin(t * 20) * this.intensity * 3 * decay;
        const y = Math.cos(t * 26) * this.intensity * 2 * decay;
        this.el.style.transform = `${this.orig} translate(${x}px, ${y}px)`;
    }
    
    isComplete() { return !this.active; }
}

class ImpactRipple {
    constructor(container, x, y) {
        this.container = container;
        this.duration = 800;
        this.elapsed = 0;
        this.active = true;
        this.ripples = [];
        
        for (let i = 0; i < 2; i++) {
            const el = document.createElement('div');
            el.className = 'crack-ripple';
            el.style.cssText = `left:${x}px;top:${y}px;width:0;height:0`;
            container.appendChild(el);
            this.ripples.push({ el, delay: i * 150, started: false });
        }
    }
    
    update(dt) {
        if (!this.active) return;
        this.elapsed += dt;
        
        this.ripples.forEach(r => {
            if (this.elapsed >= r.delay && !r.started) {
                r.started = true;
                r.el.classList.add('active');
            }
        });
        
        if (this.elapsed >= this.duration) {
            this.ripples.forEach(r => r.el.remove());
            this.active = false;
        }
    }
    
    isComplete() { return !this.active; }
}

class ScreenFlash {
    constructor(color = 'rgba(255,255,255,0.8)', duration = 500) {
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
        this.el = document.createElement('div');
        this.el.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:${color};pointer-events:none;z-index:9999;opacity:0`;
        document.body.appendChild(this.el);
    }
    
    update(dt) {
        if (!this.active) return;
        this.elapsed += dt;
        const t = this.elapsed / this.duration;
        
        if (t >= 1) {
            this.el.remove();
            this.active = false;
            return;
        }
        
        this.el.style.opacity = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
    }
    
    isComplete() { return !this.active; }
}

class GlassBlur {
    constructor(elements, from, to, duration) {
        this.elements = Array.isArray(elements) ? elements : [elements];
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
    }
    
    update(dt) {
        if (!this.active) return;
        this.elapsed += dt;
        const t = Math.min(1, this.elapsed / this.duration);
        const blur = this.from + (this.to - this.from) * (t * t * (3 - 2 * t));
        this.elements.forEach(el => el.style.filter = `blur(${blur}px)`);
        if (t >= 1) this.active = false;
    }
    
    isComplete() { return !this.active; }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationController, GlassShake, ImpactRipple, ScreenFlash, GlassBlur };
}
