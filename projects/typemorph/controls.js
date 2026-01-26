
/**
 * TypeMorph - Controls
 * Connects the UI sliders/buttons to the Physics Config.
 */

document.addEventListener('DOMContentLoaded', () => {
    const config = window.TYPE_MORPH_CONFIG;
    if (!config) return console.error('Config not found!');

    // Sliders
    const inputs = {
        damping: document.getElementById('damping'),
        stiffness: document.getElementById('stiffness'),
        radius: document.getElementById('radius')
    };

    // Update Config when slider moves
    Object.keys(inputs).forEach(key => {
        const input = inputs[key];
        if (!input) return;

        // Set initial value from config
        input.value = config[key];

        input.addEventListener('input', (e) => {
            config[key] = parseFloat(e.target.value);
        });
    });

    // Mode Buttons
    // Only select buttons that actually switch modes
    const buttons = document.querySelectorAll('button[data-mode]');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all MODE buttons
            buttons.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            // Update config
            if (btn.dataset.mode) {
                config.mode = btn.dataset.mode;
            }

            // Audio Feedback
            if (window.AUDIO) window.AUDIO.triggerPluck();
        });
    });

    // Audio Toggle
    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            if (!window.AUDIO) return;

            // First click initializes Context if needed
            window.AUDIO_MANAGER.init();
            window.AUDIO_MANAGER.resume();

            window.AUDIO.start();

            const isMuted = audioBtn.classList.contains('active');
            if (isMuted) {
                // Unmute
                window.AUDIO.toggleMute(false);
                audioBtn.classList.remove('active');
                audioBtn.innerText = 'unmute';
                audioBtn.style.color = 'white';
                audioBtn.style.background = 'transparent';
            } else {
                // Mute (Actually, let's make the button state logically "Sound ON")
                // Wait, default text was "unmute" meaning it was muted. 
                // Let's swap logic: Click "unmute" -> Sound On -> Button becomes "Mute"

                audioBtn.classList.add('active');
                audioBtn.innerText = 'MUTE';
                audioBtn.style.background = '#ff3366';
                window.AUDIO.toggleMute(false); // Unmute
            }
        });
    }
});
