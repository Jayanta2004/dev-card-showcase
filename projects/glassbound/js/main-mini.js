// Glassbound - Main Application (Condensed)
class GlassboundApp {
    constructor() {
        this.state = { started: false, broken: false, clickCount: 0, crackCount: 0 };
        this.els = {
            container: document.querySelector('.glass-jar-container'),
            walls: document.querySelectorAll('.glass-wall'),
            canvas: document.getElementById('crack-canvas'),
            zones: document.querySelectorAll('.interaction-zone'),
            instruction: document.getElementById('instruction-overlay'),
            breakOverlay: document.getElementById('break-overlay'),
            beginBtn: document.getElementById('begin-button'),
            tensionFill: document.getElementById('tension-fill'),
            tensionValue: document.getElementById('tension-value'),
            stageNumber: document.getElementById('stage-number'),
            stageName: document.getElementById('stage-name'),
            clickCount: document.getElementById('click-count'),
            crackCount: document.getElementById('crack-count'),
            integrityValue: document.getElementById('integrity-value'),
            stressContainer: document.querySelector('.stress-indicator-container'),
            particleContainer: document.getElementById('particle-container')
        };
        this.systems = {};
        this.integrity = 100;
    }
    
    init() {
        this.systems.anim = new AnimationController();
        this.systems.anim.start();
        this.systems.physics = new CrackPhysics(this.els.canvas);
        this.systems.particles = new ParticleSystem(this.els.particleContainer);
        this.systems.tension = new TensionSystem();
        this.systems.stress = new StressVisualization(this.els.stressContainer);
        this.systems.feedback = new FeedbackSystem();
        this.systems.interaction = new InteractionManager(
            this.els.container,
            this.els.zones,
            (i) => this.handleInteraction(i)
        );
        
        this.els.beginBtn.addEventListener('click', () => this.start());
        window.addEventListener('resize', () => this.systems.physics.resize());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && this.state.broken) this.restart();
            if (e.key === ' ' && !this.state.started) { e.preventDefault(); this.start(); }
        });
    }
    
    start() {
        if (this.state.started) return;
        this.els.instruction.classList.add('hidden');
        this.systems.interaction.activate();
        this.state.started = true;
        this.startLoop();
    }
    
    handleInteraction(i) {
        if (this.state.broken) return;
        
        this.state.clickCount++;
        this.state.crackCount++;
        
        this.systems.tension.add(8 * i.comboMultiplier);
        this.systems.physics.createCrack(i.x, i.y, 0.5 + i.intensity * 1.2);
        this.integrity = Math.max(0, this.integrity - (5 * i.intensity));
        this.systems.stress.addStressPoint(i.x, i.y, i.intensity);
        this.systems.feedback.impact(i.intensity);
        
        this.systems.anim.register(`ripple_${Date.now()}`, new ImpactRipple(this.els.container, i.x, i.y));
        this.systems.anim.register(`shake_${Date.now()}`, new GlassShake(this.els.container, i.intensity * 0.8));
        
        this.updateUI();
        
        if (this.systems.tension.isBreaking() || this.integrity <= 0) this.triggerBreak();
        else this.updateGlassState();
    }
    
    updateGlassState() {
        const tension = this.systems.tension.getPercent();
        this.els.walls.forEach(w => {
            w.classList.remove('stressed', 'critical');
            if (tension >= 75 || this.integrity <= 30) w.classList.add('critical');
            else if (tension >= 50 || this.integrity <= 60) w.classList.add('stressed');
        });
    }
    
    triggerBreak() {
        if (this.state.broken) return;
        this.state.broken = true;
        this.systems.interaction.deactivate();
        
        this.els.container.classList.add('breaking');
        this.els.walls.forEach(w => w.classList.add('breaking'));
        
        const cx = this.els.canvas.width / 2;
        const cy = this.els.canvas.height / 2;
        
        for (let i = 0; i < 12; i++) {
            this.systems.physics.createCrack(cx, cy, 2, (Math.PI * 2 * i) / 12);
        }
        
        this.systems.particles.explode(cx, cy, 100);
        this.systems.anim.register('break_flash', new ScreenFlash('rgba(255,255,255,0.9)', 800));
        
        setTimeout(() => this.els.breakOverlay.classList.add('active'), 600);
        setTimeout(() => {
            this.systems.anim.register('break_blur', new GlassBlur(Array.from(this.els.walls), 0, 20, 1500));
        }, 300);
        setTimeout(() => this.showRestart(), 4000);
    }
    
    showRestart() {
        const btn = document.createElement('button');
        btn.className = 'instruction-button';
        btn.textContent = 'EXPERIENCE AGAIN';
        btn.style.marginTop = '40px';
        btn.addEventListener('click', () => this.restart());
        const content = this.els.breakOverlay.querySelector('.break-content');
        if (content && !content.querySelector('button')) content.appendChild(btn);
    }
    
    restart() {
        this.state = { started: false, broken: false, clickCount: 0, crackCount: 0 };
        this.integrity = 100;
        this.systems.tension.reset();
        this.systems.interaction.reset();
        this.systems.physics.clear();
        this.systems.particles.clear();
        this.systems.stress.clear();
        this.systems.anim.clear();
        
        this.els.container.classList.remove('breaking');
        this.els.walls.forEach(w => {
            w.classList.remove('stressed', 'critical', 'breaking');
            w.style.filter = '';
        });
        
        this.els.breakOverlay.classList.remove('active');
        const btn = this.els.breakOverlay.querySelector('button');
        if (btn) btn.remove();
        
        this.els.instruction.classList.remove('hidden');
        this.updateUI();
    }
    
    updateUI() {
        const t = this.systems.tension.getPercent();
        this.els.tensionFill.style.width = `${t}%`;
        this.els.tensionValue.textContent = `${Math.round(t)}%`;
        this.els.stageNumber.textContent = this.systems.tension.stage;
        this.els.stageName.textContent = this.systems.tension.getStageName();
        this.els.clickCount.textContent = this.state.clickCount;
        this.els.crackCount.textContent = this.state.crackCount;
        this.els.integrityValue.textContent = `${Math.round(this.integrity)}%`;
    }
    
    startLoop() {
        let last = performance.now();
        const loop = (now) => {
            if (!this.state.started && !this.state.broken) return;
            const dt = now - last;
            last = now;
            
            this.systems.tension.update(dt);
            this.systems.physics.update(dt);
            this.systems.particles.update();
            this.systems.physics.render();
            this.systems.particles.render();
            this.updateUI();
            
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.glassboundApp = new GlassboundApp();
    window.glassboundApp.init();
});

if (typeof module !== 'undefined' && module.exports) module.exports = { GlassboundApp };
