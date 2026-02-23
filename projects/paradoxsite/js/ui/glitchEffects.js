// js/ui/glitchEffects.js
export class GlitchEffects {
    constructor() {
        this.overlay = document.getElementById('glitch-overlay');
        this.container = document.body;
        this.isGlitching = false;
    }

    triggerGlobalGlitch(duration = 1000) {
        if (this.isGlitching) return;
        this.isGlitching = true;

        // Add classes
        this.container.classList.add('body-glitch');
        this.overlay.classList.add('static-noise');

        // Randomly glitch text elements visible on screen
        const texts = document.querySelectorAll('p, h2, button');
        const selectedTexts = [];

        for (let i = 0; i < Math.min(5, texts.length); i++) {
            const randomElement = texts[Math.floor(Math.random() * texts.length)];
            randomElement.classList.add('glitch-active');
            randomElement.setAttribute('data-text', randomElement.innerText);
            selectedTexts.push(randomElement);
        }

        // Screen split effect
        const splitDiv = document.createElement('div');
        splitDiv.style.position = 'fixed';
        splitDiv.style.top = '50%';
        splitDiv.style.left = '0';
        splitDiv.style.width = '100%';
        splitDiv.style.height = '5px';
        splitDiv.style.backgroundColor = 'var(--glitch-color-1)';
        splitDiv.style.zIndex = '99999';
        splitDiv.style.boxShadow = '0 0 20px var(--glitch-color-1)';
        this.container.appendChild(splitDiv);

        setTimeout(() => {
            this.container.classList.remove('body-glitch');
            this.overlay.classList.remove('static-noise');

            selectedTexts.forEach(el => {
                el.classList.remove('glitch-active');
            });

            splitDiv.remove();

            this.isGlitching = false;
        }, duration);
    }
}
