export class HelpModal {
    constructor() {
        this.overlay = null;
        this.createModal();

        // Show on first visit
        if (!localStorage.getItem('liquidAssets_seenHelp')) {
            this.show();
            localStorage.setItem('liquidAssets_seenHelp', 'true');
        }
    }

    createModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.style.display = 'none'; // Hidden by default

        const modal = document.createElement('div');
        modal.className = 'modal-content';

        const content = `
            <h2>Welcome to LiquidAssets</h2>
            <div class="modal-body">
                <p>LiquidAssets visualizes your financial flow as a real-time fluid simulation.</p>
                
                <h3>How to Use:</h3>
                <ul>
                    <li><strong>Income Stream:</strong> Adjust your monthly income slider to control the flow rate.</li>
                    <li><strong>Expenses:</strong> Add expenses as "Drains". Larger expenses create larger drains.</li>
                    <li><strong>Interaction:</strong> Drag the drain circles to rearrange your financial landscape.</li>
                    <li><strong>Savings:</strong> Liquid that stays in the tank represents your accumulated savings.</li>
                </ul>

                <h3>Visuals:</h3>
                <p>The fluid reacts to physics (SPH). Optimization allows for ~2000 particles on standard hardware.</p>
                
                <button id="close-help-btn" class="btn-primary">Start Simulation</button>
            </div>
        `;

        modal.innerHTML = content;
        this.overlay.appendChild(modal);
        document.body.appendChild(this.overlay);

        // Styles for modal
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 5, 10, 0.85);
                backdrop-filter: blur(5px);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .modal-content {
                background: #0a192f;
                border: 1px solid #64ffda;
                padding: 40px;
                border-radius: 8px;
                max-width: 600px;
                color: #ccd6f6;
                box-shadow: 0 0 50px rgba(100, 255, 218, 0.2);
            }
            .modal-content h2 {
                color: #ffd700;
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(255,215,0,0.3);
                padding-bottom: 10px;
            }
            .modal-content h3 {
                color: #64ffda;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            .modal-content ul {
                margin-left: 20px;
                line-height: 1.6;
            }
            .modal-content li {
                margin-bottom: 8px;
            }
            #close-help-btn {
                margin-top: 30px;
                width: 100%;
                padding: 15px;
                font-size: 1.1rem;
            }
        `;
        document.head.appendChild(style);

        // Event
        const btn = modal.querySelector('#close-help-btn');
        btn.addEventListener('click', () => this.hide());
    }

    show() {
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.overlay.style.display = 'none';

        // Trigger a splash or effect on start?
        // window.app.simulation.emitter.burst(); // Hypothetical
    }
}
