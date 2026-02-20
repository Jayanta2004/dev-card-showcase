/**
 * GuitarJS - Main Entry Point
 * Initializes the application and handles global state.
 */

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const overlay = document.getElementById('overlay');
    const status = document.querySelector('.status');

    startBtn.addEventListener('click', async () => {
        try {
            // 1. Initialize Audio
            startBtn.innerText = "Connecting...";
            await window.audioEngine.init();

            // 2. Initialize Components
            Fretboard.init();
            KeyboardStr.init();

            // 3. Update UI
            overlay.classList.add('hidden');
            status.innerText = "Ready to Rock | Preset: Standard Tuning";
            status.style.color = "#4caf50";

            console.log("GuitarJS Ready");
        } catch (e) {
            console.error("Initialization Failed:", e);
            startBtn.innerText = "Error - Refresh Page";
            status.innerText = "Audio Error";
            status.style.color = "#f44336";
        }
    });

    // Handle visibility change to mute if tab switched
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && window.audioEngine) {
            window.audioEngine.dampenAll();
        }
    });
});
