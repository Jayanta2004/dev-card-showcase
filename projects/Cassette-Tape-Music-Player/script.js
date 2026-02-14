const playPauseBtn = document.getElementById('playPauseBtn');
const leftReel = document.getElementById('leftReel');
const rightReel = document.getElementById('rightReel');
const progressBar = document.getElementById('progressBar');
const statusSpan = document.getElementById('status');
const currentTimeSpan = document.getElementById('currentTime');

let isPlaying = false;
let currentTime = 0;
const totalTime = 210; // 3:30 in seconds
let progressInterval;

function togglePlayPause() {
    isPlaying = !isPlaying;

    if (isPlaying) {
        playPauseBtn.textContent = '⏸️';
        statusSpan.textContent = 'Playing';
        leftReel.classList.add('rotating');
        rightReel.classList.add('rotating');
        startProgress();
    } else {
        playPauseBtn.textContent = '▶️';
        statusSpan.textContent = 'Paused';
        leftReel.classList.remove('rotating');
        rightReel.classList.remove('rotating');
        stopProgress();
    }
}

function startProgress() {
    progressInterval = setInterval(() => {
        currentTime += 0.1; // Increment by 0.1 seconds
        if (currentTime >= totalTime) {
            currentTime = totalTime;
            togglePlayPause(); // Auto-stop at end
        }
        updateProgress();
    }, 100);
}

function stopProgress() {
    clearInterval(progressInterval);
}

function updateProgress() {
    const progressPercent = (currentTime / totalTime) * 100;
    progressBar.style.width = progressPercent + '%';

    // Update time display
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    currentTimeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function resetPlayer() {
    currentTime = 0;
    updateProgress();
    if (isPlaying) {
        togglePlayPause();
    }
}

// Event listeners
playPauseBtn.addEventListener('click', togglePlayPause);

// Double-click to reset
playPauseBtn.addEventListener('dblclick', resetPlayer);

// Initial setup
updateProgress();