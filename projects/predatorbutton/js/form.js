/**
 * PREDATOR BUTTON - FORM CONTROLLER
 * 
 * Handles successfully "submitting" before being caught.
 */

(function () {
    const form = document.getElementById('predator-form');
    const statusEl = document.getElementById('activity-status');

    /**
     * FEATURE: Text Corruption
     * Randomly scrambles text while hunting to simulate "sabotage."
     */
    function corruptInputs() {
        if (!window.PredatorState.isHunting) return;
        if (Math.random() > 0.1) return; // 10% chance per frame

        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.value.length > 0 && Math.random() < 0.05) {
                const chars = input.value.split('');
                const idx = Math.floor(Math.random() * chars.length);
                const glitchChars = "!@#$%^&*<>?";
                chars[idx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
                input.value = chars.join('');
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // If the button is currently hunting, it's risky to submit
        if (window.PredatorState.isHunting) {
            console.log("Submit attempted while hunting...");
        }

        const name = document.getElementById('username').value;
        if (!name) {
            alert("IDENTITY REQUIRED TO SUBMIT.");
            return;
        }

        // Success state
        statusEl.innerText = "SUCCESS. DATA CONSUMED.";
        statusEl.style.color = "#00ff00";

        setTimeout(() => {
            form.reset();
            statusEl.innerText = "MONITORING...";
            statusEl.style.color = "var(--text-pale)";
        }, 2000);
    });

    /**
     * FEATURE: Agitation Building
     * Typing increases agitation, making the button faster.
     */
    form.addEventListener('input', () => {
        if (window.PredatorState.agitation < 100) {
            window.PredatorState.agitation += 5;
        }
    });

    /**
     * Loop for corruption
     */
    function loop() {
        corruptInputs();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    /**
     * PreventContextMenu to increase tension
     */
    window.addEventListener('contextmenu', e => e.preventDefault());
})();
