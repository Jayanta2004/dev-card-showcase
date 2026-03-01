/**
 * GravityFont - Tutorial System
 * Guides the user through the physics-based typography experience.
 */

class Tutorial {
    /**
     * @param {GravityFontApp} app 
     */
    constructor(app) {
        this.app = app;
        this.steps = [
            {
                message: "Welcome to GravityFont. Letters here are soft and flexible.",
                action: () => this.highlightInput()
            },
            {
                message: "Try typing your name to see it come to life.",
                trigger: 'input'
            },
            {
                message: "You can click and drag to interact with the letters.",
                trigger: 'mousedown'
            },
            {
                message: "Use the controls below to change physics behavior.",
                action: () => this.highlightControls()
            }
        ];
        this.currentStep = 0;
        this.overlay = null;
        this.isActive = false;
    }

    /**
     * Starts the tutorial overlay.
     */
    start() {
        this.isActive = true;
        this.createOverlay();
        this.showStep(0);
        console.log("Tutorial started.");
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.innerHTML = `
            <div class="tutorial-card">
                <p id="tutorial-text"></p>
                <button id="tutorial-next">Got it</button>
            </div>
        `;
        document.body.appendChild(this.overlay);

        document.getElementById('tutorial-next').addEventListener('click', () => this.nextStep());

        // Add styling for tutorial
        const style = document.createElement('style');
        style.innerHTML = `
            .tutorial-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(2px);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            }
            .tutorial-card {
                background: var(--surface-color);
                border: 1px solid var(--accent-color);
                padding: 2rem;
                border-radius: 12px;
                max-width: 400px;
                text-align: center;
                pointer-events: auto;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            }
            #tutorial-text {
                margin-bottom: 1.5rem;
                line-height: 1.6;
            }
            #tutorial-next {
                background: var(--accent-color);
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 100px;
                cursor: pointer;
                font-weight: bold;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    showStep(index) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[index];
        document.getElementById('tutorial-text').textContent = step.message;

        if (step.action) step.action();
    }

    nextStep() {
        this.currentStep++;
        this.showStep(this.currentStep);
    }

    highlightInput() {
        this.app.input.classList.add('highlight-pulse');
        setTimeout(() => this.app.input.classList.remove('highlight-pulse'), 3000);
    }

    highlightControls() {
        document.querySelector('.controls-footer').classList.add('highlight-pulse');
    }

    complete() {
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                this.isActive = false;
            }, 500);
        }
    }
}
