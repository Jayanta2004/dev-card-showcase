/**
 * Controls Module
 * Handles UI interactions and CSS Variable updates
 */

const root = document.documentElement;

export function initControls() {
    setupButtons();
    setupSliders();
}

function setupButtons() {
    // Play / Pause
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnReset = document.getElementById('btn-reset');
    const btnGravity = document.getElementById('btn-gravity');

    btnPlay.addEventListener('click', () => setPlayState(true, btnPlay, btnPause));
    btnPause.addEventListener('click', () => setPlayState(false, btnPlay, btnPause));

    btnReset.addEventListener('click', resetSimulations);

    btnGravity.addEventListener('click', () => toggleGravity(btnGravity));
}

function setupSliders() {
    const speedRange = document.getElementById('range-speed');
    const speedVal = document.getElementById('val-speed');

    if (speedRange) {
        speedRange.addEventListener('input', (e) => {
            const val = e.target.value;
            speedVal.textContent = val + 'x';
            root.style.setProperty('--speed-mult', val);
        });
    }
}

/** 
 * Handlers 
 */
function setPlayState(isPlaying, playBtn, pauseBtn) {
    if (isPlaying) {
        root.style.setProperty('--play-state', 'running');
        playBtn.classList.add('active');
        pauseBtn.classList.remove('active');
    } else {
        root.style.setProperty('--play-state', 'paused');
        playBtn.classList.remove('active');
        pauseBtn.classList.add('active');
    }
}

function resetSimulations() {
    const stages = document.querySelectorAll('.stage');

    // Hard reset by re-inserting HTML to restart animations
    stages.forEach(stage => {
        const content = stage.innerHTML;
        stage.innerHTML = '';
        void stage.offsetWidth; // Force Reflow
        stage.innerHTML = content;
    });

    // Ensure we are playing
    root.style.setProperty('--play-state', 'running');
    document.getElementById('btn-play').classList.add('active');
    document.getElementById('btn-pause').classList.remove('active');
}

function toggleGravity(btn) {
    const isGravityOn = !btn.classList.contains('off');

    if (isGravityOn) {
        // Turn Off
        btn.classList.add('off');
        btn.classList.remove('active');
        btn.textContent = 'Gravity: OFF';
        document.body.classList.add('no-gravity');
    } else {
        // Turn On
        btn.classList.remove('off');
        btn.classList.add('active');
        btn.textContent = 'Gravity: ON';
        document.body.classList.remove('no-gravity');
    }

    // Visual feedback Reset
    resetSimulations();
}
