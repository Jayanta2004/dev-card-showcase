/**
 * Audio-Synth Engine
 * Uses Web Audio API for sound generation and AnalyserNode for visualization.
 */

// --- Audio Context Setup ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let masterGain;
let analyser;

// State
let oscillators = {}; // Track active notes: { 'NoteName': {osc, gain} }
let config = {
    wave: 'sine',
    attack: 0.05,
    decay: 0.3,
    sustain: 0.7,
    release: 0.5,
    volume: 0.7
};

// Notes Config (Frequency Map)
const NOTES = [
    { note: 'C', freq: 261.63, key: 'a', type: 'white' },
    { note: 'C#', freq: 277.18, key: 'w', type: 'black' },
    { note: 'D', freq: 293.66, key: 's', type: 'white' },
    { note: 'D#', freq: 311.13, key: 'e', type: 'black' },
    { note: 'E', freq: 329.63, key: 'd', type: 'white' },
    { note: 'F', freq: 349.23, key: 'f', type: 'white' },
    { note: 'F#', freq: 369.99, key: 't', type: 'black' },
    { note: 'G', freq: 392.00, key: 'g', type: 'white' },
    { note: 'G#', freq: 415.30, key: 'y', type: 'black' },
    { note: 'A', freq: 440.00, key: 'h', type: 'white' },
    { note: 'A#', freq: 466.16, key: 'u', type: 'black' },
    { note: 'B', freq: 493.88, key: 'j', type: 'white' },
    { note: 'C2', freq: 523.25, key: 'k', type: 'white' }
];

// --- Initialization ---
function init() {
    setupUI();
    renderKeyboard();
    setupVisualizer();
    
    // Resume context on first user interaction (browser policy)
    document.body.addEventListener('click', () => {
        if (!audioCtx) setupAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }, { once: true });
}

function setupAudio() {
    audioCtx = new AudioContext();
    
    // Master Volume
    masterGain = audioCtx.createGain();
    masterGain.gain.value = config.volume;
    
    // Analyser (Visualizer)
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    // Connect Chain: Master -> Analyser -> Speakers
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    drawScope(); // Start visualizer loop
}

// --- Synth Logic (Polyphony) ---

function playNote(freq, id) {
    if (!audioCtx) return;
    if (oscillators[id]) return; // Note already playing

    // 1. Create Oscillator
    const osc = audioCtx.createOscillator();
    osc.type = config.wave;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // 2. Create Gain for Envelope (ADSR)
    const noteGain = audioCtx.createGain();
    noteGain.gain.setValueAtTime(0, audioCtx.currentTime);

    // 3. Connect: Osc -> NoteGain -> MasterGain
    osc.connect(noteGain);
    noteGain.connect(masterGain);

    // 4. Apply Attack & Decay (AD)
    const now = audioCtx.currentTime;
    // Attack: Ramp from 0 to 1
    noteGain.gain.linearRampToValueAtTime(1, now + parseFloat(config.attack));
    // Decay: Ramp from 1 to Sustain Level
    noteGain.gain.linearRampToValueAtTime(parseFloat(config.sustain), now + parseFloat(config.attack) + parseFloat(config.decay));

    // 5. Start
    osc.start();

    // 6. Store ref to stop it later
    oscillators[id] = { osc, noteGain };
    
    // UI Feedback
    const keyEl = document.querySelector(`.key[data-note="${id}"]`);
    if(keyEl) keyEl.classList.add('active');
}

function stopNote(id) {
    if (!oscillators[id]) return;

    const { osc, noteGain } = oscillators[id];
    const now = audioCtx.currentTime;
    const releaseTime = parseFloat(config.release);

    // 1. Cancel active ramps (prevents popping)
    noteGain.gain.cancelScheduledValues(now);
    noteGain.gain.setValueAtTime(noteGain.gain.value, now);

    // 2. Apply Release (Ramp to 0)
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

    // 3. Stop osc after release
    osc.stop(now + releaseTime);
    
    // 4. Cleanup
    setTimeout(() => {
        osc.disconnect();
        noteGain.disconnect();
    }, releaseTime * 1000 + 100);

    delete oscillators[id];

    // UI Feedback
    const keyEl = document.querySelector(`.key[data-note="${id}"]`);
    if(keyEl) keyEl.classList.remove('active');
}

// --- UI & Interactions ---

function setupUI() {
    // Wave Select
    document.querySelectorAll('.wave-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btn = e.currentTarget; // Ensure we get the button, not icon
            document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.wave = btn.dataset.wave;
        });
    });

    // Sliders
    ['attack', 'decay', 'sustain', 'release'].forEach(param => {
        document.getElementById(param).addEventListener('input', (e) => {
            config[param] = e.target.value;
        });
    });

    document.getElementById('vol-slider').addEventListener('input', (e) => {
        config.volume = e.target.value / 100;
        if(masterGain) masterGain.gain.value = config.volume;
    });

    // Keyboard Events
    window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        const note = NOTES.find(n => n.key === e.key.toLowerCase());
        if (note) playNote(note.freq, note.note);
    });

    window.addEventListener('keyup', (e) => {
        const note = NOTES.find(n => n.key === e.key.toLowerCase());
        if (note) stopNote(note.note);
    });
}

function renderKeyboard() {
    const container = document.getElementById('keyboard');
    let leftOffset = 0;

    NOTES.forEach(note => {
        const keyEl = document.createElement('div');
        keyEl.classList.add('key', note.type);
        keyEl.dataset.note = note.note;
        
        // Label
        const label = document.createElement('span');
        label.className = 'key-label';
        label.innerText = note.key.toUpperCase();
        keyEl.appendChild(label);

        // Positioning for black keys
        if (note.type === 'black') {
            keyEl.style.left = (leftOffset - 15) + 'px';
        } else {
            leftOffset += 40; // Approx width of white key flex
        }

        // Mouse Events
        keyEl.addEventListener('mousedown', () => playNote(note.freq, note.note));
        keyEl.addEventListener('mouseup', () => stopNote(note.note));
        keyEl.addEventListener('mouseleave', () => stopNote(note.note));

        container.appendChild(keyEl);
    });
}

// --- Visualizer (Oscilloscope) ---

function setupVisualizer() {
    const canvas = document.getElementById('scope-canvas');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

function drawScope() {
    requestAnimationFrame(drawScope);
    
    if(!analyser) return;

    const canvas = document.getElementById('scope-canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00d2d3';
    ctx.beginPath();

    const sliceWidth = width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Normalize 0..255 to 0..2
        const y = v * height / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

// Start
init();