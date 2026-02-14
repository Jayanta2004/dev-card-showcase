/**
 * PREDATOR BUTTON - INPUT TRACKER
 * 
 * Monitors user interaction and manages the inactivity timer.
 * If movement stops for more than 1 second, it triggers the hunting state.
 */

(function () {
    let idleTimer = null;
    const statusEl = document.getElementById('activity-status');
    const btnEl = document.getElementById('predator-btn');

    /**
     * Resets the inactivity timer and updates state
     */
    function resetTimer() {
        if (window.PredatorState.isHunting) {
            window.PredatorState.isHunting = false;
            btnEl.classList.remove('is-hunting');
            statusEl.innerText = "MONITORING...";
            statusEl.style.color = "var(--text-pale)";
        }

        clearTimeout(idleTimer);

        idleTimer = setTimeout(() => {
            window.PredatorState.isHunting = true;
            btnEl.classList.add('is-hunting');
            statusEl.innerText = "HUNTING...";
            statusEl.style.color = "var(--accent-red)";
        }, window.PredatorState.config.idleThreshold);
    }

    /**
     * Handle mouse move events
     */
    window.addEventListener('mousemove', (e) => {
        window.PredatorState.mouse.x = e.clientX;
        window.PredatorState.mouse.y = e.clientY;
        resetTimer();
    });

    // Start monitoring immediately
    resetTimer();
})();
