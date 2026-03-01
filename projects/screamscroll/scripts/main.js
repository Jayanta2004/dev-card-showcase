/**
 * ScreamScroll - Main Application Entry
 * 
 * Orchestrates the initialization and loop of the application.
 */

document.addEventListener('DOMContentLoaded', () => {
    const audio = window.AudioProcessor;
    const scroll = window.ScrollingEngine;
    let ui = null;

    const startBtn = document.querySelector('.start-btn');
    const sensitivitySlider = document.getElementById('sensitivity-slider');

    /**
     * Main Animation Loop
     */
    function loop() {
        if (!audio.isInitialized) return;

        // 1. Process Audio
        const audioState = audio.update();
        const frequencyData = audio.getFrequencyData();

        // 2. Drive Scroll Engine
        const scrollState = scroll.update();
        scroll.applyAudioInput(audioState);

        // 3. Update Audio Feedback (Echo)
        if (window.EchoSoundscape) {
            window.EchoSoundscape.update(audioState.sustained);
        }

        // 4. Update UI
        if (ui) {
            ui.update({
                sustained: audioState.sustained,
                current: audioState.current,
                isWhistling: audioState.isWhistling,
                frequencyData: frequencyData
            }, scrollState);
        }

        requestAnimationFrame(loop);
    }

    /**
     * Start Application
     */
    async function startApp() {
        const initialized = await audio.initialize();
        if (initialized) {
            ui = window.createUIManager();
            ui.hideInitOverlay();

            // Initialize new systems
            if (window.EchoSoundscape) {
                window.EchoSoundscape.init(audio.audioContext);
            }

            // Ensure audio context is resumed
            await audio.resume();

            // Start the loop
            requestAnimationFrame(loop);
        } else {
            alert("Microphone access is required for ScreamScroll.");
        }
    }

    // Event Listeners
    startBtn.addEventListener('click', () => {
        startApp();
    });

    sensitivitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        // Inverse mapping: higher slider = lower threshold (more sensitive)
        const threshold = 0.5 - value;
        audio.setThreshold(threshold);
    });

    // Handle spacebar to start as well
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !audio.isInitialized) {
            startApp();
        }
    });

    console.log("ScreamScroll loaded. Waiting for user interaction.");
});
