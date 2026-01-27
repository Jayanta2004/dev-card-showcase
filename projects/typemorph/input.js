
/**
 * TypeMorph - Input Manager
 * Handles typing new text and refreshing the physics entities.
 */

document.addEventListener('DOMContentLoaded', () => {

    const h1 = document.querySelector('h1.morph-text');
    const p = document.querySelector('p.morph-text');
    const editBtn = document.getElementById('edit-btn');
    const micBtn = document.getElementById('mic-btn');

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in prompt (browser modal blocks anyway)

        switch (e.code) {
            case 'Space':
                // Float toggle
                const floatBtn = document.querySelector('button[data-mode="float"]');
                floatBtn.click();
                break;
            case 'KeyM':
                // Toggle Mic
                const mic = document.getElementById('mic-btn');
                if (mic) mic.click();
                break;
            case 'KeyS':
                // Toggle Sound
                if (audioBtn) audioBtn.click();
                break;
            case 'Digit1':
                window.setTheme('cyber');
                break;
            case 'Digit2':
                window.setTheme('heat');
                break;
            case 'Digit3':
                window.setTheme('zen');
                break;
            case 'Digit4':
                window.setTheme('matrix');
                break;
        }
    });

    // Theme Buttons
    const themeBtns = document.querySelectorAll('.theme-dot');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            window.setTheme(theme);

            // Update active circle
            themeBtns.forEach(b => b.style.transform = 'scale(1)');
            btn.style.transform = 'scale(1.2) translateY(-2px)';
            btn.style.borderColor = 'white';
        });
    });

    // Microphone Toggle
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (window.MICROPHONE) {
                window.MICROPHONE.toggle().then(() => {
                    micBtn.classList.toggle('active');
                    micBtn.innerText = micBtn.classList.contains('active') ? 'Mic ON' : 'Mic OFF';
                });
            }
        });
    }

    // Editable Text Feature
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            // Simple prompt for now, or contenteditable
            const newText = prompt("Enter your text (Title):", h1.innerText);
            if (newText) {
                updateText(newText);
            }
        });
    }

    function updateText(text) {
        if (!h1) return;

        // Update DOM
        h1.innerText = text;

        // Re-run init to split text and create new Physics Entities
        // We need to access the 'init' function from script.js. 
        // Best way: script.js exposes a 'reinit' or we just reload? 
        // Let's call the global window.initMorph() if we export it.
        if (window.initMorph) {
            window.initMorph();
        }
    }
});
