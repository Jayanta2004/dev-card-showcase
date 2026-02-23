// Glassbound - Condensed Interactions
class InteractionManager {
    constructor(container, zones, callback) {
        this.container = container;
        this.zones = zones;
        this.callback = callback;
        this.active = false;
        this.clickCount = 0;
        this.lastClick = 0;
        this.combo = 1;
        
        zones.forEach(zone => {
            zone.addEventListener('click', (e) => this.handleClick(e, zone));
            zone.addEventListener('mouseenter', () => { if (this.active) zone.style.background = 'rgba(255,255,255,0.03)'; });
            zone.addEventListener('mouseleave', () => { zone.style.background = ''; });
        });
    }
    
    handleClick(e, zone) {
        if (!this.active) return;
        e.preventDefault();
        
        const now = Date.now();
        this.combo = (now - this.lastClick < 1000) ? Math.min(3, this.combo + 0.2) : 1;
        this.lastClick = now;
        this.clickCount++;
        
        const rect = zone.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const x = (rect.left - containerRect.left) + (e.clientX - rect.left);
        const y = (rect.top - containerRect.top) + (e.clientY - rect.top);
        
        if (this.callback) {
            this.callback({
                x, y,
                intensity: (0.3 + Math.random() * 0.4) * this.combo,
                comboMultiplier: this.combo,
                clickCount: this.clickCount
            });
        }
    }
    
    activate() { this.active = true; }
    deactivate() { this.active = false; }
    reset() { this.clickCount = 0; this.combo = 1; }
}

class StressVisualization {
    constructor(container) {
        this.container = container;
        this.points = [];
    }
    
    addStressPoint(x, y, intensity) {
        const points = this.container.querySelectorAll('.stress-point');
        for (let p of points) {
            if (!p.classList.contains('active')) {
                p.style.left = `${x}px`;
                p.style.top = `${y}px`;
                p.classList.add('active');
                setTimeout(() => p.classList.remove('active'), 2000);
                return;
            }
        }
    }
    
    clear() {
        this.container.querySelectorAll('.stress-point').forEach(p => p.classList.remove('active'));
    }
}

class FeedbackSystem {
    constructor() {
        this.soundWave = document.querySelector('.sound-wave-container');
    }
    
    trigger(intensity) {
        if (this.soundWave) {
            this.soundWave.classList.add('active');
            setTimeout(() => this.soundWave.classList.remove('active'), 600);
        }
        if ('vibrate' in navigator) navigator.vibrate(Math.floor(intensity * 30));
    }
    
    impact(intensity) { this.trigger(intensity); }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InteractionManager, StressVisualization, FeedbackSystem };
}
