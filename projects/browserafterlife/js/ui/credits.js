
export class CreditsOverlay {
    constructor() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'credits-overlay';
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.overflow = 'hidden';
        this.overlay.style.zIndex = '5';
        this.overlay.style.display = 'none';

        document.body.appendChild(this.overlay);

        this.content = document.createElement('div');
        this.content.className = 'credits-content';
        this.content.style.position = 'absolute';
        this.content.style.bottom = '-100%';
        this.content.style.width = '100%';
        this.content.style.textAlign = 'center';
        this.content.style.color = '#555';
        this.content.style.fontFamily = 'monospace';
        this.content.style.fontSize = '12px';
        this.content.style.lineHeight = '20px';

        this.overlay.appendChild(this.content);

        this.active = false;
        this.y = 0;
    }

    show(souls) {
        if (this.active) return;
        this.active = true;
        this.overlay.style.display = 'block';

        let html = '<h3>-- MEMORIAL --</h3><br>';
        souls.forEach(s => {
            html += `${s.name} <span style="color:${s.color}">†</span> ${s.age}s<br>`;
            if (s.manifest && s.manifest.lastWord) {
                html += `"${s.manifest.lastWord}"<br><br>`;
            }
        });

        this.content.innerHTML = html;
        this.y = window.innerHeight;

        this.animate();
    }

    animate() {
        if (!this.active) return;

        this.y -= 0.5;
        this.content.style.transform = `translateY(${this.y}px)`;

        // Loop if needed, or just run once?
        if (this.y < -this.content.clientHeight) {
            this.y = window.innerHeight;
        }

        requestAnimationFrame(() => this.animate());
    }

    hide() {
        this.active = false;
        this.overlay.style.display = 'none';
    }
}
