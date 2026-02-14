/**
 * @file docs.js
 * @description Dynamic documentation generator for CollisionSynth.
 * Injects help modals and credits into the DOM.
 */

const Documentation = (() => {
    const content = `
        <div id="modal-backdrop">
            <div id="modal-content">
                <header>
                    <h2>CollisionSynth Guide</h2>
                    <button id="btn-close-modal">&times;</button>
                </header>
                <div class="scroll-content">
                    <section>
                        <h3>Concept</h3>
                        <p>CollisionSynth is a generative music environment where geometry acts as the score. By manipulating the walls and bouncing nodes, you create evolving rhythmic patterns based on physical interactions.</p>
                    </section>
                    
                    <section>
                        <h3>Controls</h3>
                        <ul>
                            <li><strong>Right Click & Drag</strong>: Move wall endpoints.</li>
                            <li><strong>Left Click (Space)</strong>: Add new nodes if not hovering connection.</li>
                            <li><strong>Control Panel</strong>: Adjust gravity, friction, and audio parameters.</li>
                        </ul>
                    </section>

                    <section>
                        <h3>Audio Architecture</h3>
                        <p>The sound engine uses the Web Audio API with a polyphonic synthesizer. Wall length determines the cutoff frequency, while impact velocity controls amplitude and FM modulation intensity.</p>
                    </section>

                    <section>
                        <h3>Shortcuts</h3>
                        <ul>
                            <li><kbd>Space</kbd> - Pause / Resume Physics</li>
                            <li><kbd>R</kbd> - Reset Simulation</li>
                            <li><kbd>D</kbd> - Toggle Debug Mode</li>
                        </ul>
                    </section>

                    <footer>
                        <p>Version 1.0.0 • No External Libraries • Pure Vanilla JS</p>
                    </footer>
                </div>
            </div>
        </div>
    `;

    return {
        init: () => {
            const container = document.createElement('div');
            container.id = 'docs-container';
            container.innerHTML = content;
            document.body.appendChild(container);

            const backdrop = document.getElementById('modal-backdrop');
            const closeBtn = document.getElementById('btn-close-modal');

            // Interaction logic
            const toggle = (force) => {
                const isActive = backdrop.classList.contains('visible');
                const shouldShow = force !== undefined ? force : !isActive;

                if (shouldShow) {
                    backdrop.classList.add('visible');
                } else {
                    backdrop.classList.remove('visible');
                }
            };

            closeBtn.onclick = () => toggle(false);
            backdrop.onclick = (e) => {
                if (e.target === backdrop) toggle(false);
            };

            return { toggle };
        }
    };
})();
