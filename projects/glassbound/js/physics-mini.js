// Glassbound - Condensed Physics & Systems
class CrackPhysics {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cracks = [];
        this.setupCanvas();
    }
    
    setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    createCrack(x, y, intensity = 1.0, angle = null) {
        angle = angle !== null ? angle : Math.random() * Math.PI * 2;
        const length = (30 + Math.random() * 120) * intensity;
        const crack = { x, y, angle, intensity, segments: [], progress: 0 };
        
        // Generate segments
        let cx = x, cy = y;
        for (let i = 0; i < 10; i++) {
            const segLen = length / 10;
            angle += (Math.random() - 0.5) * 0.3;
            const nx = cx + Math.cos(angle) * segLen;
            const ny = cy + Math.sin(angle) * segLen;
            crack.segments.push({ x1: cx, y1: cy, x2: nx, y2: ny, prog: 0 });
            cx = nx; cy = ny;
        }
        
        this.cracks.push(crack);
        return crack;
    }
    
    update(dt) {
        this.cracks.forEach(c => {
            if (c.progress < 1) {
                c.progress = Math.min(1, c.progress + dt / 300);
                c.segments.forEach((s, i) => {
                    if (i <= c.progress * c.segments.length) s.prog = Math.min(1, s.prog + dt / 50);
                });
            }
        });
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.cracks.forEach(c => {
            c.segments.forEach(s => {
                if (s.prog > 0) {
                    const x2 = s.x1 + (s.x2 - s.x1) * s.prog;
                    const y2 = s.y1 + (s.y2 - s.y1) * s.prog;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * c.intensity})`;
                    this.ctx.lineWidth = 2 * c.intensity;
                    this.ctx.lineCap = 'round';
                    this.ctx.shadowBlur = 3;
                    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(s.x1, s.y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            });
        });
    }
    
    clear() { this.cracks = []; this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
    resize() { this.setupCanvas(); }
}

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
    }
    
    explode(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: 2 + Math.random() * 6
            });
        }
    }
    
    update() {
        this.particles = this.particles.filter(p => {
            p.vy += 0.5;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.015;
            return p.life > 0;
        });
    }
    
    render() {
        this.container.innerHTML = '';
        this.particles.forEach(p => {
            const el = document.createElement('div');
            el.className = 'particle';
            el.style.cssText = `left:${p.x}px;top:${p.y}px;width:${p.size}px;height:${p.size}px;opacity:${p.life}`;
            this.container.appendChild(el);
        });
    }
    
    clear() { this.particles = []; this.container.innerHTML = ''; }
}

class TensionSystem {
    constructor() {
        this.tension = 0;
        this.stage = 1;
        this.stages = ['CONFINED', 'STRESSED', 'FRACTURING', 'CRITICAL', 'BREAKING'];
    }
    
    add(amount) {
        this.tension = Math.min(100, this.tension + amount);
        this.stage = Math.min(5, Math.floor(this.tension / 20) + 1);
    }
    
    update(dt) {
        if (this.tension > 0) this.tension = Math.max(0, this.tension - (dt / 2000));
    }
    
    getPercent() { return this.tension; }
    getStageName() { return this.stages[this.stage - 1]; }
    isBreaking() { return this.tension >= 100; }
    reset() { this.tension = 0; this.stage = 1; }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CrackPhysics, ParticleSystem, TensionSystem };
}
