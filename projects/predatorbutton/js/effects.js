/**
 * PREDATOR BUTTON - VISUAL EFFECTS
 * 
 * Manages feedback animations, glitch overlays, and form resets.
 */

(function () {
    const overlay = document.getElementById('capture-overlay');
    const form = document.getElementById('predator-form');
    const btn = document.getElementById('predator-btn');
    const container = document.querySelector('.app-container');
    const eye = document.querySelector('.btn-eye');

    /**
     * FEATURE: Ocular Stalking
     * Rotates the eye's pupil to 'look' at the cursor.
     */
    function updateEye() {
        if (!eye) return;

        const state = window.PredatorState;
        const dx = state.mouse.x - state.button.x;
        const dy = state.mouse.y - state.button.y;

        // Calculate angle and apply to pupil
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        eye.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
    }

    /**
     * FEATURE: Proximity Tremors
     * Shakes the screen based on how close the predator is.
     */
    function updateTremors() {
        const state = window.PredatorState;
        if (state.isHunting && state.proximity > 0.5) {
            const intensity = (state.proximity - 0.5) * 15;
            const rx = (Math.random() - 0.5) * intensity;
            const ry = (Math.random() - 0.5) * intensity;
            container.style.transform = `translate(${rx}px, ${ry}px)`;
        } else {
            container.style.transform = `translate(0, 0)`;
        }
    }

    /**
     * AGITATION DECAY
     * Agitation naturally lowers over time.
     */
    function decayAgitation() {
        if (window.PredatorState.agitation > 0) {
            window.PredatorState.agitation -= 0.1;
        }
    }

    /**
     * Handle the capture event
     */
    window.addEventListener('predator:capture', () => {
        // 1. Show capture overlay
        overlay.classList.remove('hidden');
        overlay.classList.add('active');

        // 2. Clear the form
        form.reset();

        // 3. Reset button position (jump back to start)
        setTimeout(() => {
            btn.style.left = '50%';
            btn.style.top = '50%';

            // 4. Hide overlay
            setTimeout(() => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.classList.add('hidden'), 200);
            }, 800);
        }, 100);
    });

    /**
     * Animation Loop for effects
     */
    function loop() {
        updateEye();
        updateTremors();
        decayAgitation();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
})();
