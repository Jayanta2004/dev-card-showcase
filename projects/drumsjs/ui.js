/**
 * UI Management - Handles drum pads, particles, and visual feedback
 */

/**
 * Create drum pad elements in the grid
 */
function createDrumPads() {
    const container = document.getElementById('drumPads');
    drumSounds.forEach((drum) => {
        const pad = document.createElement('div');
        pad.className = 'pad';
        pad.tabIndex = 0;
        pad.setAttribute('role', 'button');
        pad.setAttribute('aria-label', `${drum.name} drum pad, press ${drum.key}`);
        pad.dataset.key = drum.key;
        pad.dataset.freq = drum.freq;
        
        pad.innerHTML = `
            <span class="pad-label">${drum.name}</span>
            <span class="pad-key">${drum.key}</span>
        `;
        
        // Mouse click event
        pad.addEventListener('click', () => activatePad(drum.key));
        
        // Keyboard events for accessibility
        pad.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activatePad(drum.key);
            }
        });
        
        container.appendChild(pad);
    });
}

/**
 * Activate a drum pad with visual and audio feedback
 * @param {string} key - The key associated with the drum pad
 */
function activatePad(key) {
    const pad = document.querySelector(`[data-key="${key}"]`);
    const drum = drumSounds.find(d => d.key === key);
    
    if (pad && drum) {
        // Add active class for visual feedback
        pad.classList.add('active');
        
        // Play the drum sound
        playDrumSound(drum.freq);
        
        // Remove active class after animation
        setTimeout(() => {
            pad.classList.remove('active');
        }, 300);
    }
}

/**
 * Create animated background particles
 */
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = Math.random() * 100 + 50;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation timing
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 15}s`;
        
        container.appendChild(particle);
    }
}

/**
 * Create step sequencer grid
 */
function createStepGrid() {
    const grid = document.getElementById('stepGrid');
    for (let i = 0; i < 16; i++) {
        const step = document.createElement('div');
        step.className = 'step';
        step.dataset.step = i;
        step.setAttribute('aria-label', `Step ${i + 1}`);
        grid.appendChild(step);
    }
}

/**
 * Update step indicator to show current playback position
 * @param {number} step - Current step index (-1 to clear all)
 */
function updateStepIndicator(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((s, i) => {
        if (i === step) {
            s.classList.add('active-step');
        } else {
            s.classList.remove('active-step');
        }
    });
}