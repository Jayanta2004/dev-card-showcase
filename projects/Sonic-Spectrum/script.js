// --- DOM Elements ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uiPanel = document.getElementById('uiPanel');
const playerControls = document.getElementById('playerControls');
const trackNameDisplay = document.getElementById('trackName');
const btnPlayPause = document.getElementById('btnPlayPause');
const btnStop = document.getElementById('btnStop');
const audioElement = document.getElementById('audioElement');

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// --- Web Audio API State ---
let audioCtx = null;
let analyser = null;
let source = null;
let animationId = null;
let isPlaying = false;

// Resize Canvas to fit screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Drag & Drop Handlers ---
dropZone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
});

['dragenter', 'dragover'].forEach(evt => dropZone.classList.add('dragover'));
['dragleave', 'drop'].forEach(evt => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
fileInput.addEventListener('change', function() { handleFiles(this.files); });

function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    
    if (!file.type.startsWith('audio/')) {
        alert("Please drop a valid audio file (.mp3, .wav)");
        return;
    }

    // Update UI
    trackNameDisplay.innerText = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    dropZone.classList.add('hidden');
    playerControls.classList.remove('hidden');

    // Load Audio
    const objectUrl = URL.createObjectURL(file);
    audioElement.src = objectUrl;
    
    initWebAudio();
    playTrack();
}

// --- Audio Engine Setup ---
function initWebAudio() {
    if (audioCtx) return; // Only init once

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    
    // Higher FFT size = more detailed frequency bars
    analyser.fftSize = 512; 

    source = audioCtx.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
}

// --- Controls ---
function playTrack() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    audioElement.play();
    isPlaying = true;
    btnPlayPause.innerText = '⏸ Pause';
    drawVisualizer();
}

function pauseTrack() {
    audioElement.pause();
    isPlaying = false;
    btnPlayPause.innerText = '▶ Play';
    cancelAnimationFrame(animationId);
}

function stopTrack() {
    pauseTrack();
    audioElement.currentTime = 0;
    
    // Reset UI
    dropZone.classList.remove('hidden');
    playerControls.classList.add('hidden');
    
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

btnPlayPause.addEventListener('click', () => isPlaying ? pauseTrack() : playTrack());
btnStop.addEventListener('click', stopTrack);
audioElement.addEventListener('ended', stopTrack);

// --- Hardware Canvas Rendering Loop ---
function drawVisualizer() {
    if (!isPlaying) return;
    animationId = requestAnimationFrame(drawVisualizer);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Create a trailing effect by filling with low-opacity black instead of clearRect
    ctx.fillStyle = 'rgba(5, 5, 8, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Pulse the center radius based on bass (low frequencies)
    const bassAverage = (dataArray[0] + dataArray[1] + dataArray[2]) / 3;
    const baseRadius = 100 + (bassAverage / 4);

    // Draw Radial Bars
    const bars = 120; // Only use the lower 120 frequencies for a cleaner look
    const angleStep = (Math.PI * 2) / bars;

    for (let i = 0; i < bars; i++) {
        const value = dataArray[i];
        const barHeight = (value / 255) * 200; // Scale height
        
        const angle = i * angleStep;
        
        // Inner coordinate (circle surface)
        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        
        // Outer coordinate (bar tip)
        const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
        const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

        // Cyberpunk Gradient
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, '#00f3ff'); // Neon Cyan
        gradient.addColorStop(1, '#ff00ff'); // Neon Pink

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;
        ctx.stroke();
    }
    
    // Center glowing orb
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius - 10, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 243, 255, ${bassAverage / 1000})`; // Pulses with bass
    ctx.fill();
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.stroke();
}