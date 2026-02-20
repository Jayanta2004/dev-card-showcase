window.VFX = class VFX {
    constructor() {
        this.container = document.getElementById('game-container');
        this.gap = 3;
    }

    createParticles(x, y, color = '#fff', count = 8) {
        const rect = this.container.getBoundingClientRect();
        // Calculate relative pos within container (which is relative)
        // Actually, easiest is to append to game-container which matches maze coordinates
        // But we need pixel coords.
        // Let's rely on the View's cell size.
        const cellSize = 40;
        const originX = x * (cellSize + this.gap) + cellSize / 2;
        const originY = y * (cellSize + this.gap) + cellSize / 2;

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.classList.add('vfx-particle');
            p.style.backgroundColor = color;
            p.style.width = Math.random() * 4 + 2 + 'px';
            p.style.height = p.style.width;

            p.style.left = originX + 'px';
            p.style.top = originY + 'px';

            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 30 + 10;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);

            // We need custom animation for translate because basic one only does scale/opacity
            // Or we simply use JS for the transform end state?
            // Let's use WAAPI for better perf or standard element.animate
            p.animate([
                { transform: `translate(0, 0) scale(1)`, opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0, .9, .57, 1)',
            }).onfinish = () => p.remove();

            this.container.appendChild(p);
        }
    }

    screenShake() {
        this.container.classList.remove('shake');
        void this.container.offsetWidth; // trigger reflow
        this.container.classList.add('shake');
    }

    startWipe() {
        let wipe = document.querySelector('.level-wipe');
        if (!wipe) {
            wipe = document.createElement('div');
            wipe.className = 'level-wipe';
            document.body.appendChild(wipe);
        }
        wipe.classList.remove('active');
        void wipe.offsetWidth;
        wipe.classList.add('active');
    }
};
