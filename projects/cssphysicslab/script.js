/**
 * CSS PHYSICS LAB CONTROL SCRIPT
 * Handles user interactions and updates CSS variables to control the simulation.
 */

// State
let state = {
    isPlaying: true,
    hasGravity: true,
    speed: 1, // 1x, 0.5x (slow), 2x (fast)
};

// DOM Elements
const root = document.documentElement;
const btnPlay = document.getElementById('btn-play');
const btnPause = document.getElementById('btn-pause');
const btnGravity = document.getElementById('btn-gravity');
const btnSpeed = document.getElementById('btn-speed');
const stages = document.querySelectorAll('.stage');

// Functions

/**
 * Toggles Play/Pause state
 * @param {boolean} play - true to play, false to pause
 */
function togglePlay(play) {
    state.isPlaying = play;
    
    // Update CSS Variable
    root.style.setProperty('--play-state', play ? 'running' : 'paused');
    
    // Update UI
    if (play) {
        btnPlay.classList.add('active');
        btnPause.classList.remove('active');
    } else {
        btnPlay.classList.remove('active');
        btnPause.classList.add('active');
    }
}

/**
 * Toggles Gravity (Bounce vs Float)
 * Applies specific classes to experiments that respond to gravity.
 */
function toggleGravity() {
    state.hasGravity = !state.hasGravity;
    
    // Update UI Text & Visuals
    btnGravity.textContent = state.hasGravity ? 'Gravity: ON' : 'Gravity: OFF';
    btnGravity.classList.toggle('active', state.hasGravity);

    // Apply class to stage to change animation
    const bounceStage = document.getElementById('stage-bounce');
    if (!state.hasGravity) {
        bounceStage.classList.add('no-gravity');
    } else {
        bounceStage.classList.remove('no-gravity');
    }

    // Optional: Reset animation to make transition smooth
    refreshAnimation(bounceStage);
}

/**
 * Cycles through speed modes: 1x -> 0.5x -> 2x -> 1x
 */
function toggleSpeed() {
    if (state.speed === 1) {
        state.speed = 0.5; // Slow
        btnSpeed.textContent = 'Speed: 0.5x';
    } else if (state.speed === 0.5) {
        state.speed = 2; // Fast
        btnSpeed.textContent = 'Speed: 2x';
    } else {
        state.speed = 1; // Normal
        btnSpeed.textContent = 'Speed: 1x';
    }

    root.style.setProperty('--speed-mult', state.speed);
}

/**
 * Resets the scene by forcing a re-flow of all animated elements.
 * This restarts CSS animations from 0%.
 */
function resetSim() {
    // 1. Pause temporarily
    const wasPlaying = state.isPlaying;
    root.style.setProperty('--play-state', 'paused');

    // 2. Remove animations (magic trick: cloning nodes or toggling a 'reset' class)
    // Here we will use the logic of removing classes/nodes or just re-triggering.
    // The simplest way to restart infinite CSS animations is to remove the element and add it back.
    
    stages.forEach(stage => {
        const content = stage.innerHTML;
        stage.innerHTML = '';
        void stage.offsetWidth; // Trigger reflow
        stage.innerHTML = content;
    });

    // 3. Resume if it was playing
    if (wasPlaying) {
        requestAnimationFrame(() => {
            root.style.setProperty('--play-state', 'running');
        });
    }
}

/**
 * Helper to restart a specific element's animation
 */
function refreshAnimation(element) {
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null; 
}

// Initialize
console.log("CSS Physics Lab Initialized 🧪");
