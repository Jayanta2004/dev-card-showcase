/**
 * DJJS BUNDLED SCRIPT
 * Resolves ES Module CORS issues for local file execution.
 */

console.log("DJJS: Bundle Loaded");

// --- MATH UTILS ---
const MathUtils = {
    map: (value, inMin, inMax, outMin, outMax) => (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin,
    lerp: (a, b, t) => a + (b - a) * t,
    clamp: (value, min, max) => Math.min(Math.max(value, min), max)
};
const { map, lerp, clamp } = MathUtils;

// --- AUDIO ENGINE ---
const AudioEngine = new (class {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.analyser = null;
        this.compressor = null;
    }

    async init() {
        if (this.context) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();

        if (this.context.state === 'suspended') {
            await this.context.resume();
        }

        // Global Compressor (Limiter)
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -1; // Prevent clipping
        this.compressor.knee.value = 10;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.005;
        this.compressor.release.value = 0.25;

        // Master Chain
        this.masterGain = this.context.createGain();

        // Master Analyser (Visuals)
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;

        // Connections: MasterGain -> Compressor -> Analyser -> Destination
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.context.destination);

        console.log("AudioEngine: Context Created", this.context.state);
    }

    // loadAudio removed/unused to prevent file:// fetch errors

    get time() {
        return this.context ? this.context.currentTime : 0;
    }
})();

// --- EFFECTS ---
class Delay {
    constructor() {
        this.input = AudioEngine.context.createGain();
        this.output = AudioEngine.context.createGain();
        this.wet = AudioEngine.context.createGain();
        this.dry = AudioEngine.context.createGain();

        this.delayNode = AudioEngine.context.createDelay(2.0); // Max 2s
        this.feedbackNode = AudioEngine.context.createGain();

        this.input.connect(this.dry);
        this.input.connect(this.delayNode);

        this.delayNode.connect(this.feedbackNode);
        this.feedbackNode.connect(this.delayNode); // Loop

        this.delayNode.connect(this.wet);

        this.dry.connect(this.output);
        this.wet.connect(this.output);

        // Defaults
        this.dry.gain.value = 1;
        this.wet.gain.value = 0;
        this.feedbackNode.gain.value = 0.4;
        this.delayNode.delayTime.value = 0.5; // 500ms
    }

    setMix(amount) {
        const val = clamp(amount, 0, 1);
        this.dry.gain.value = Math.cos(val * 0.5 * Math.PI);
        this.wet.gain.value = Math.sin(val * 0.5 * Math.PI);
    }

    setTime(time) {
        if (this.delayNode) this.delayNode.delayTime.setTargetAtTime(time, AudioEngine.time, 0.01);
    }

    setFeedback(amount) {
        if (this.feedbackNode) this.feedbackNode.gain.setTargetAtTime(amount, AudioEngine.time, 0.01);
    }
}

class Distortion {
    constructor() {
        this.input = AudioEngine.context.createGain();
        this.output = AudioEngine.context.createGain();
        this.shaper = AudioEngine.context.createWaveShaper();

        this.input.connect(this.shaper);
        this.shaper.connect(this.output);

        this.shaper.curve = this.makeDistortionCurve(0);
        this.shaper.oversample = '4x';
    }

    setAmount(amount) {
        const curveAmount = amount * 400;
        this.shaper.curve = this.makeDistortionCurve(curveAmount);
    }

    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        let x;
        for (let i = 0; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
}

// --- MIXER ---
class ChannelStrip {
    constructor() {
        this.input = AudioEngine.context.createGain();

        this.low = AudioEngine.context.createBiquadFilter();
        this.low.type = 'lowshelf';
        this.low.frequency.value = 320;

        this.mid = AudioEngine.context.createBiquadFilter();
        this.mid.type = 'peaking';
        this.mid.frequency.value = 1000;
        this.mid.Q.value = 0.5;

        this.high = AudioEngine.context.createBiquadFilter();
        this.high.type = 'highshelf';
        this.high.frequency.value = 3200;

        this.fader = AudioEngine.context.createGain();
        this.output = AudioEngine.context.createGain();

        this.input.connect(this.low);
        this.low.connect(this.mid);
        this.mid.connect(this.high);
        this.high.connect(this.fader);
        this.fader.connect(this.output);

        this.fader.gain.value = 1;
    }

    setEQ(band, value) {
        let db = value > 0 ? value * 6 : value * 20;
        const node = this[band];
        if (node) node.gain.setTargetAtTime(db, AudioEngine.time, 0.01);
    }

    setVolume(vol) {
        this.fader.gain.setTargetAtTime(vol, AudioEngine.time, 0.01);
    }
}

const Mixer = new (class {
    constructor() {
        this.pendingInit = true; // wait for audio context
    }

    init() {
        if (!this.pendingInit) return;
        this.channelA = new ChannelStrip();
        this.channelB = new ChannelStrip();

        this.xfaderA = AudioEngine.context.createGain();
        this.xfaderB = AudioEngine.context.createGain();

        this.channelA.output.connect(this.xfaderA);
        this.channelB.output.connect(this.xfaderB);

        this.output = AudioEngine.context.createGain();

        this.xfaderA.connect(this.output);
        this.xfaderB.connect(this.output);

        this.setCrossfader(0);
        this.pendingInit = false;
    }

    setCrossfader(value, curveType = 'linear') {
        if (this.pendingInit) return;
        const val = clamp(value, -1, 1);
        const x = (val + 1) / 2;

        let gainA, gainB;
        // Linear for now simpliciy
        gainA = 1 - x;
        gainB = x;

        // Equal Power override
        gainA = Math.cos(x * 0.5 * Math.PI);
        gainB = Math.sin(x * 0.5 * Math.PI);

        this.xfaderA.gain.setTargetAtTime(gainA, AudioEngine.time, 0.01);
        this.xfaderB.gain.setTargetAtTime(gainB, AudioEngine.time, 0.01);
    }
})();

// --- DECK ---
class Deck {
    constructor(id) {
        this.id = id;
        this.buffer = null;
        this.source = null;
        this.isPlaying = false;

        this.startTime = 0;
        this.pauseTime = 0;
        this.playbackRate = 1.0;

        // Lazy init gain node if context not ready? 
        // We assume context is ready when created inside main init
        // BUT Deck is created before click.
        // We need to defer creation of nodes.
    }

    initNodes() {
        if (this.gainNode) return;
        this.gainNode = AudioEngine.context.createGain();
    }

    load(buffer) {
        this.buffer = buffer;
        this.stop();
        this.pauseTime = 0;
    }

    stop() {
        if (this.source) {
            try { this.source.stop(); } catch (e) { }
            this.source = null;
        }
        this.isPlaying = false;
    }

    play() {
        this.initNodes();
        if (this.isPlaying || !this.buffer) return;

        this.source = AudioEngine.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.loop = true; // Auto loop for this demo
        this.source.playbackRate.value = this.playbackRate;

        this.source.connect(this.gainNode);

        this.startTime = AudioEngine.time - this.pauseTime;
        this.source.start(0, this.pauseTime % this.buffer.duration);

        this.isPlaying = true;
    }

    pause() {
        if (!this.isPlaying || !this.source) return;

        this.source.stop();
        this.pauseTime = AudioEngine.time - this.startTime;
        this.isPlaying = false;
        this.source = null;
    }

    cue() {
        this.pause();
        this.pauseTime = 0;
    }

    setRate(rate) {
        this.playbackRate = rate;
        if (this.source) {
            this.source.playbackRate.setValueAtTime(rate, AudioEngine.time);
        }
    }
}

// --- WAVEFORM ---
class Waveform {
    constructor(canvasId, deckColor) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.color = deckColor;
        this.buffer = null;
        this.data = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    }

    load(buffer) {
        this.buffer = buffer;
        this.data = this.processBuffer(buffer);
        this.draw();
    }

    processBuffer(buffer) {
        const rawData = buffer.getChannelData(0);
        const samples = 4000;
        const step = Math.ceil(rawData.length / samples);
        const data = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            let max = 0;
            for (let j = 0; j < step; j++) {
                const val = Math.abs(rawData[(i * step) + j]);
                if (val > max) max = val;
            }
            data[i] = max;
        }
        return data;
    }

    draw() {
        if (!this.data) return;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;
        const centerY = height / 2;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const len = this.data.length;
        const sliceWidth = width / len;

        for (let i = 0; i < len; i++) {
            const x = i * sliceWidth;
            const y = this.data[i] * height * 0.4;
            ctx.moveTo(x, centerY - y);
            ctx.lineTo(x, centerY + y);
        }
        ctx.stroke();
    }
}

// --- CONTROLS ---
class Controls {
    constructor(decks, mixer, effects) {
        this.decks = decks;
        this.mixer = mixer;
        this.effects = effects;
        this.activeElement = null;
        this.startY = 0;
        this.startValue = 0;
        this.init();
    }

    init() {
        document.addEventListener('mouseup', () => {
            this.activeElement = null;
            document.body.style.cursor = 'default';
        });
        document.addEventListener('mousemove', (e) => this.handleDrag(e));

        document.querySelectorAll('.knob, .knob-small').forEach(knob => {
            knob.addEventListener('mousedown', (e) => this.startDrag(e, knob));
        });

        document.querySelectorAll('.vertical-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const deckId = e.target.id.split('-')[1].toUpperCase();
                const val = parseFloat(e.target.value);
                if (this.decks[deckId]) this.decks[deckId].setRate(val);
            });
            slider.addEventListener('dblclick', (e) => {
                e.target.value = 1;
                const deckId = e.target.id.split('-')[1].toUpperCase();
                if (this.decks[deckId]) this.decks[deckId].setRate(1);
            });
        });

        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deckId = e.target.dataset.deck;
                const deck = this.decks[deckId];
                if (!deck) return;

                if (e.target.classList.contains('play-btn')) {
                    if (deck.isPlaying) deck.pause();
                    else deck.play();
                    e.target.innerText = deck.isPlaying ? 'PAUSE' : 'PLAY';
                    e.target.classList.toggle('active', deck.isPlaying);
                } else if (e.target.classList.contains('cue-btn')) {
                    deck.cue();
                    const playBtn = document.querySelector(`.play-btn[data-deck="${deckId}"]`);
                    if (playBtn) {
                        playBtn.innerText = 'PLAY';
                        playBtn.classList.remove('active');
                    }
                }
            });
        });

        const xfader = document.getElementById('crossfader');
        if (xfader) {
            xfader.addEventListener('input', (e) => {
                this.mixer.setCrossfader(parseFloat(e.target.value));
            });
            xfader.addEventListener('dblclick', (e) => {
                e.target.value = 0;
                this.mixer.setCrossfader(0);
            });
        }
    }

    startDrag(e, element) {
        this.activeElement = element;
        this.startY = e.clientY;
        let current = parseFloat(element.dataset.value || 0.5);
        this.startValue = current;
        document.body.style.cursor = 'ns-resize';
        e.preventDefault();
    }

    handleDrag(e) {
        if (!this.activeElement) return;
        const deltaY = this.startY - e.clientY;
        let newValue = this.startValue + (deltaY * 0.005);
        newValue = clamp(newValue, 0, 1);
        this.updateParam(this.activeElement, newValue);
    }

    updateParam(element, value) {
        element.dataset.value = value;
        const rotation = map(value, 0, 1, -135, 135);
        element.style.transform = `rotate(${rotation}deg)`;

        if (element.dataset.deck) {
            const deck = element.dataset.deck;
            const param = element.dataset.param;
            const eqVal = map(value, 0, 1, -1, 1);
            if (param === 'high') this.mixer[deck === 'A' ? 'channelA' : 'channelB'].setEQ('high', eqVal);
            if (param === 'mid') this.mixer[deck === 'A' ? 'channelA' : 'channelB'].setEQ('mid', eqVal);
            if (param === 'low') this.mixer[deck === 'A' ? 'channelA' : 'channelB'].setEQ('low', eqVal);
        }
        else if (element.dataset.fx) {
            const fx = element.dataset.fx;
            if (fx === 'delay-time') this.effects.delay.setTime(value);
            if (fx === 'delay-feedback') this.effects.delay.setFeedback(value);
            if (fx === 'delay-mix') this.effects.delay.setMix(value);
            if (fx === 'distort-amount') this.effects.distortion.setAmount(value);
        }
    }
}

// --- VISUALIZER ---
const Visualizer = new (class {
    constructor() {
        this.fpsElement = document.getElementById('fps-counter');
        this.lastTime = 0;
        this.frameCount = 0;
        this.dataArray = null;
    }

    start() {
        if (!AudioEngine.analyser) return;
        this.dataArray = new Uint8Array(AudioEngine.analyser.frequencyBinCount);

        const loop = (time) => {
            const delta = time - this.lastTime;
            if (delta >= 1000) {
                if (this.fpsElement) this.fpsElement.innerText = `${this.frameCount} FPS`;
                this.frameCount = 0;
                this.lastTime = time;
            }
            this.frameCount++;

            AudioEngine.analyser.getByteFrequencyData(this.dataArray);
            this.reactToAudio();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    reactToAudio() {
        const bass = this.dataArray.slice(0, 5);
        const avgBass = bass.reduce((a, b) => a + b, 0) / bass.length;
        if (avgBass > 200) {
            document.body.style.boxShadow = `inset 0 0 ${avgBass / 5}px rgba(0,255,136, 0.1)`;
        } else {
            document.body.style.boxShadow = 'none';
        }
    }
})();

// --- AUTO DJ ---
const AutoDJ = new (class {
    constructor() {
        this.active = false;
        this.mixer = null;
        this.decks = null;
        this.effects = null;
        this.xfaderCurrent = 0;
    }

    init(mixer, decks, effects) {
        this.mixer = mixer;
        this.decks = decks;
        this.effects = effects;
        this.update();
    }

    toggleAuto() {
        this.active = !this.active;
        return this.active;
    }

    triggerChaos() {
        if (!this.effects) return;
        document.body.classList.add('chaos-mode');
        this.effects.distortion.setAmount(Math.random());
        this.effects.delay.setMix(Math.random() * 0.5);

        setTimeout(() => {
            document.body.classList.remove('chaos-mode');
            this.effects.distortion.setAmount(0);
            this.effects.delay.setMix(0);
        }, 1000);
    }

    update() {
        requestAnimationFrame(() => this.update());
        if (!this.active) return;

        const now = AudioEngine.time;
        // 8 sec phase
        const cycle = 8;
        const phase = (now % (cycle * 2)) / cycle;

        let target = 0;
        if (phase < 1) target = 1;
        else target = -1;

        this.xfaderCurrent = lerp(this.xfaderCurrent, target, 0.01);

        if (this.mixer) {
            this.mixer.setCrossfader(this.xfaderCurrent);
            const slider = document.getElementById('crossfader');
            if (slider) slider.value = this.xfaderCurrent;
        }

        if (this.decks) {
            if (!this.decks['A'].isPlaying) this.decks['A'].play();
            if (!this.decks['B'].isPlaying) this.decks['B'].play();
        }
    }
})();

// --- MAIN INIT ---

const deckA = new Deck('A');
const deckB = new Deck('B');
let delay, distortion; // Init after context

const waveformA = new Waveform('waveform-a', '#00bcd4');
const waveformB = new Waveform('waveform-b', '#ff4081');

const loader = document.getElementById('loader');
const app = document.getElementById('app');

loader.addEventListener('click', async () => {
    try {
        console.log("Initializing Audio Engine...");
        await AudioEngine.init();

        // Late Init of nodes requiring context
        Mixer.init();
        delay = new Delay();
        distortion = new Distortion();

        // Routing
        Mixer.output.connect(distortion.input);
        distortion.output.connect(delay.input);
        delay.output.connect(AudioEngine.masterGain);

        deckA.initNodes();
        deckB.initNodes();

        deckA.gainNode.connect(Mixer.channelA.input);
        deckB.gainNode.connect(Mixer.channelB.input);

        // Init UI Controls
        new Controls({ 'A': deckA, 'B': deckB }, Mixer, { delay, distortion });
        AutoDJ.init(Mixer, { 'A': deckA, 'B': deckB }, { delay, distortion });

        // Generate Audio
        loadDemoTracks();

        // UI Transition
        loader.style.opacity = 0;
        setTimeout(() => {
            loader.style.display = 'none';
            app.style.display = 'flex';
            waveformA.resize();
            waveformB.resize();
            Visualizer.start();
            console.log("DJJS Started!");
        }, 500);

    } catch (e) {
        console.error(e);
        alert(e);
    }
});

// Helper: Create Noise Buffer
function createNoiseBuffer() {
    const sr = AudioEngine.context.sampleRate;
    const len = sr * 1;
    const buffer = AudioEngine.context.createBuffer(1, len, sr);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

// Helper: Synthesize Drum Hit (Kick, Snare, Hat) into a target buffer
function mixDrum(targetData, type, startSample, vol, sr) {
    const len = targetData.length;

    // Kick: Sine sweep
    if (type === 'kick') {
        const dur = 0.3 * sr;
        const freqStart = 150;
        const freqEnd = 40;
        for (let i = 0; i < dur; i++) {
            if (startSample + i >= len) break;
            const t = i / sr;
            // Exponential pitch drop
            const freq = freqStart * Math.exp(-t * 20) + freqEnd;
            // Envelope
            const env = Math.exp(-t * 8);
            // Distortion (clip)
            const val = Math.sin(2 * Math.PI * freq * t) * env;
            targetData[startSample + i] += Math.max(-1, Math.min(1, val * 2)) * vol;
        }
    }
    // Snare: Noise + Tone
    else if (type === 'snare') {
        const dur = 0.2 * sr;
        for (let i = 0; i < dur; i++) {
            if (startSample + i >= len) break;
            const t = i / sr;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 15);
            const tone = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 10);
            targetData[startSample + i] += (noise * 0.8 + tone * 0.5) * vol;
        }
    }
    // Hat: High pass noise (approx)
    else if (type === 'hat') {
        const dur = 0.05 * sr;
        for (let i = 0; i < dur; i++) {
            if (startSample + i >= len) break;
            const t = i / sr;
            // Simple metallic noise
            const val = (Math.random() * 2 - 1) * Math.exp(-t * 50);
            targetData[startSample + i] += val * vol * 0.7;
        }
    }
}

function createBeatBuffer(bpm) {
    const sr = AudioEngine.context.sampleRate;
    const barTime = 240 / bpm; // 4 beats
    const len = sr * barTime; // 1 bar loop
    const buffer = AudioEngine.context.createBuffer(1, len, sr);
    const data = buffer.getChannelData(0);

    const beatLen = sr * (60 / bpm);
    const numBeats = 4;

    // Pattern: House Beat
    // Kick: 1, 2, 3, 4
    // Hat: Offbeats / 16ths
    // Snare/Clap: 2, 4

    for (let b = 0; b < numBeats; b++) {
        const pos = Math.floor(b * beatLen);

        // Kick on every beat
        mixDrum(data, 'kick', pos, 0.9, sr);

        // Clap/Snare on 2 and 4
        if (b === 1 || b === 3) {
            mixDrum(data, 'snare', pos, 0.6, sr);
        }

        // Hats (16th notes: 0, 0.25, 0.5, 0.75)
        for (let h = 0; h < 4; h++) {
            const hPos = Math.floor(pos + (h * beatLen / 4));
            // Open hat on the offbeat (0.5), closed on others
            let vol = (h === 2) ? 0.6 : 0.15;
            // Ghost note volume
            if (h === 2) vol = 0.5; // Open hat feel
            else vol = 0.1;

            // Actually, classic House: Kick on down, Open Hat on Up
            if (h === 2) {
                mixDrum(data, 'hat', hPos, 0.6, sr); // Open Hat (longer release simulates open)
            } else {
                mixDrum(data, 'hat', hPos, 0.1, sr); // Closed Ticks
            }
        }
    }
    return buffer;
}

// Generate a Deep House Chord Loop
function createPadBuffer() {
    const sr = AudioEngine.context.sampleRate;
    const bpm = 125;
    const barTime = 240 / bpm; // 4 beats
    const len = sr * barTime * 2; // 2 bars loop
    const buffer = AudioEngine.context.createBuffer(1, len, sr);
    const data = buffer.getChannelData(0);

    // Minor 9th Chord Stabs (A minor 9: A, C, E, G, B)
    // Frequencies: A2=110, C3=130.8, E3=164.8, G3=196, B3=246.9
    const chord = [110, 130.81, 164.81, 196.00, 246.94];

    // Simple synth logic: Sawtooth + LowPass Filter envelope
    const mixChord = (startSample, duration, vol) => {
        for (let i = 0; i < duration; i++) {
            if (startSample + i >= len) break;
            const t = i / sr;

            let signal = 0;
            // Sum oscillators
            chord.forEach((freq, idx) => {
                // Detune slightly for thickness
                const f = freq + (Math.random() - 0.5);
                // Sawtooth approx: sum of sines or just (i % p) / p
                // Using simple additive sine for cleaner "Deep" sound
                signal += Math.sin(2 * Math.PI * f * t); // Fundamental
                signal += Math.sin(2 * Math.PI * f * 2 * t) * 0.5; // Octave
            });

            // Filter Envelope (Pluck)
            // LP cutoff simulation: reduce volume of bright harmonics quickly
            // For simple additive, we just volume envelope the whole thing
            const attack = 0.01;
            const decay = 0.4;
            let env = 0;
            if (t < attack) env = t / attack;
            else env = Math.max(0, 1 - (t - attack) / decay);

            // Cubed envelope for snappier pluck
            env = env * env * env;

            data[startSample + i] += (signal / chord.length) * env * vol;
        }
    };

    const beatLen = Math.floor(sr * (60 / bpm));

    // Rhythm:
    // Bar 1: Stab on 1, Stab on 2.5 (3rd beat + eighth) -> "Dotted quarter feel"
    // Just a classic "Deep" pattern
    // 1 . . a 2 . . & 3 . . . 4 . . .

    // Let's do: Beat 1, Beat 2.5, Beat 4 (anticipation)
    const pos1 = 0;
    const pos2 = Math.floor(beatLen * 1.5); // "and" of 2
    const pos3 = Math.floor(beatLen * 2.5); // "and" of 3
    const pos4 = Math.floor(beatLen * 4); // Downbeat next bar?? No, let's keep it 1 bar loop mostly

    // Loop 1
    mixChord(0, beatLen, 0.7);
    mixChord(Math.floor(beatLen * 2.5), beatLen, 0.7);
    mixChord(Math.floor(beatLen * 3.5), beatLen, 0.7);

    // Loop 2 (Variation)
    const bar2Start = Math.floor(len / 2);
    mixChord(bar2Start, beatLen, 0.7);
    mixChord(bar2Start + Math.floor(beatLen * 1.5), beatLen, 0.6);
    mixChord(bar2Start + Math.floor(beatLen * 3), beatLen, 0.6);

    // Apply some delay/reverb tail simulation? 
    // Handled by the real Effects engine later!

    return buffer;
}

function loadDemoTracks() {
    console.log("Generating Synthesis...");
    const bufferA = createBeatBuffer(125);
    deckA.load(bufferA);
    waveformA.load(bufferA);

    const bufferB = createPadBuffer();
    deckB.load(bufferB);
    waveformB.load(bufferB);
}

// Bind Buttons
document.getElementById('auto-play-btn').addEventListener('click', (e) => {
    const isActive = AutoDJ.toggleAuto();
    e.target.classList.toggle('active', isActive);
});

document.getElementById('chaos-btn').addEventListener('click', () => {
    AutoDJ.triggerChaos();
});
