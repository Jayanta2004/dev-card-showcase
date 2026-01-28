/**
 * Sequencer Engine - Handles auto-play, tempo, and pattern management
 */

// Sequencer state
let currentPattern = 0;
let isPlaying = false;
let currentStep = 0;
let tempo = 120;
let intervalId = null;

/**
 * Play the current beat step
 */
function playBeat() {
    const pattern = beatPatterns[currentPattern];
    const beat = pattern[currentStep];
    
    // Trigger drum sound if beat is not null
    if (beat) {
        activatePad(beat);
    }
    
    // Update visual step indicator
    updateStepIndicator(currentStep);
    
    // Move to next step (loop back to 0 after 16)
    currentStep = (currentStep + 1) % 16;
}

/**
 * Toggle play/pause state
 */
function togglePlay() {
    isPlaying = !isPlaying;
    const playBtn = document.getElementById('playBtn');
    
    if (isPlaying) {
        // Start playing
        playBtn.textContent = '⏸ Pause';
        playBtn.classList.add('active');
        playBtn.setAttribute('aria-pressed', 'true');
        
        // Calculate interval based on tempo (16th notes)
        const interval = (60 / tempo) * 1000 / 4;
        intervalId = setInterval(playBeat, interval);
    } else {
        // Stop playing
        playBtn.textContent = '▶ Play';
        playBtn.classList.remove('active');
        playBtn.setAttribute('aria-pressed', 'false');
        
        // Clear interval and reset
        clearInterval(intervalId);
        currentStep = 0;
        updateStepIndicator(-1);
    }
}

/**
 * Update tempo and restart interval if playing
 * @param {number} newTempo - New tempo in BPM
 */
function updateTempo(newTempo) {
    tempo = newTempo;
    document.getElementById('bpmDisplay').textContent = `${tempo} BPM`;
    document.getElementById('tempoSlider').setAttribute('aria-valuenow', tempo);
    
    // If playing, restart with new tempo
    if (isPlaying) {
        clearInterval(intervalId);
        const interval = (60 / tempo) * 1000 / 4;
        intervalId = setInterval(playBeat, interval);
    }
}

/**
 * Update pattern display with current pattern name
 */
function updatePatternDisplay() {
    document.getElementById('patternName').textContent = patternNames[currentPattern];
}

/**
 * Change to next or previous pattern
 * @param {number} direction - 1 for next, -1 for previous
 */
function changePattern(direction) {
    currentPattern = (currentPattern + direction + beatPatterns.length) % beatPatterns.length;
    updatePatternDisplay();
    currentStep = 0;
    updateStepIndicator(-1);
}