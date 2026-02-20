/**
 * PREDATOR BUTTON - MOVEMENT ENGINE
 * 
 * Uses Linear Interpolation (LERP) to move the button toward the cursor
 * when the "isHunting" state is active.
 */

(function () {
    const btn = document.getElementById('predator-btn');

    // Initial button state
    window.PredatorState.updateButtonRect(btn);

    // Internal position tracking to avoid layout thrashing
    let currentX = window.PredatorState.button.x;
    let currentY = window.PredatorState.button.y;

    /**
     * Linear Interpolation function
     */
    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    /**
     * Main Animation Loop
     */
    function update() {
        const state = window.PredatorState;

        if (state.isHunting) {
            const targetX = state.mouse.x;
            const targetY = state.mouse.y;

            // FEATURE: Lunging Logic
            // The predator occasionally lunges forward with high speed
            if (!state.isLunging && Math.random() < 0.005) {
                state.isLunging = true;
                setTimeout(() => state.isLunging = false, 300);
            }

            // Calculate current speed factor
            let factor = state.isLunging ? state.config.lungeFactor : state.config.lerpFactor;

            // FEATURE: Agitation multiplier (faster if user is active/typing)
            factor *= (1 + (state.agitation / 100));

            // Creep/Lunge toward mouse
            currentX = lerp(currentX, targetX, factor);
            currentY = lerp(currentY, targetY, factor);

            // Apply style (moving from center origin)
            btn.style.left = `${currentX}px`;
            btn.style.top = `${currentY}px`;
            btn.style.transform = 'translate(-50%, -50%)';

            // Update state rect for collision detection
            state.updateButtonRect(btn);

            // Update proximity (0 to 1)
            const dist = Math.sqrt((currentX - targetX) ** 2 + (currentY - targetY) ** 2);
            state.proximity = Math.max(0, 1 - (dist / 500));
        } else {
            // Keep internal coords in sync even when not moving
            const rect = btn.getBoundingClientRect();
            currentX = rect.left + rect.width / 2;
            currentY = rect.top + rect.height / 2;
        }

        requestAnimationFrame(update);
    }

    // Initialize engine
    requestAnimationFrame(update);
})();
