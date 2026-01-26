
/**
 * TypeMorph - Main Script
 * Orchestrates the Physics Loop, Audio, Particles, and Entities.
 */

// Dependencies assumed loaded: setup.js, char.js

// ----------------------
// Main Application Setup
// ----------------------

let entities = [];

window.initMorph = function () {
    const morphElements = document.querySelectorAll('.morph-text');

    // Clear old entities
    entities = [];

    // Split text and create entities
    morphElements.forEach(el => {
        // Only if not already split? 
        // Or re-split every time (simplest for edit mode)
        const text = el.innerText;
        el.innerHTML = text.split('').map(char => {
            if (char === ' ') return '<span class="char" style="display:inline-block; width: 0.3em;">&nbsp;</span>';
            return `<span class="char">${char}</span>`;
        }).join('');
    });

    const chars = document.querySelectorAll('.char');
    chars.forEach(c => {
        if (window.MorphChar) {
            entities.push(new MorphChar(c));
        } else {
            console.error('MorphChar class is missing!');
        }
    });

    console.log('Morph Entities Initialized:', entities.length);
};

// Input Handlers
window.addEventListener('mousemove', e => {
    // Use window.MOUSE
    window.MOUSE.vx = e.clientX - window.MOUSE.lastX;
    window.MOUSE.vy = e.clientY - window.MOUSE.lastY;
    window.MOUSE.lastX = e.clientX;
    window.MOUSE.lastY = e.clientY;

    window.MOUSE.x = e.clientX;
    window.MOUSE.y = e.clientY;
});

// Animation Loop
let time = 0;
function loop() {
    time += 0.01;

    // Update Mic
    if (window.MICROPHONE) window.MICROPHONE.update();

    // Decay Mouse
    window.MOUSE.vx *= 0.9;
    window.MOUSE.vy *= 0.9;
    const mouseSpeed = Math.hypot(window.MOUSE.vx, window.MOUSE.vy);

    // Update Particles
    if (window.PARTICLES) window.PARTICLES.updateAndDraw();

    // Update Entities
    let totalProximity = 0;

    // Audio Level Aggregation
    let audioLevel = 0;
    if (window.MICROPHONE && window.MICROPHONE.active) audioLevel += window.MICROPHONE.volume;
    if (window.AUDIO && window.AUDIO.getVolume) audioLevel += window.AUDIO.getVolume();
    audioLevel = Math.min(1, audioLevel); // Clamp

    entities.forEach((entity, i) => {
        const wave = Math.sin(time * 2 + i * 0.2);
        // Pass audioLevel (3rd arg)
        totalProximity += entity.update(time, i, audioLevel, wave);
        entity.render();
    });

    // Update Audio
    if (window.AUDIO) {
        const avgProximity = entities.length > 0 ? totalProximity / entities.length : 0;
        window.AUDIO.update(mouseSpeed, avgProximity);
    }

    requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', () => {
    // Wait for other scripts to load? 
    // They are all deferred or at end of body, so it should be fine.

    // Check if MorphChar is ready
    if (typeof MorphChar === 'undefined') {
        console.error("MorphChar not loaded yet.");
    }

    window.initMorph();
    loop();
});

// Export Config global
window.TYPE_MORPH_CONFIG = CONFIG;
