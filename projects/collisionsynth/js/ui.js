/**
 * @file ui.js
 * @description Controller for all DOM-based interactions and state bridging.
 */

class UIController {
    constructor(world, audio) {
        this.world = world;
        this.audio = audio;

        this.canvas = document.getElementById('main-canvas');
        this.overlay = document.getElementById('interaction-overlay');

        // Control elements
        this.controls = {
            gravity: document.getElementById('param-gravity'),
            friction: document.getElementById('param-friction'),
            speed: document.getElementById('param-speed'),
            reverb: document.getElementById('param-reverb'),
            scale: document.getElementById('param-scale'),
            theme: document.getElementById('param-theme'),
            btnAddBall: document.getElementById('btn-add-ball'),
            btnClear: document.getElementById('btn-clear'),
            btnRecord: document.getElementById('btn-record'),
            btnStart: document.getElementById('btn-start'),
            btnHelp: document.getElementById('btn-help'),
            statBPM: document.querySelector('#stat-bpm span'),
            statNodes: document.querySelector('#stat-nodes span')
        };

        // Modules
        this.recorder = null; // Lazy init
        this.docs = Documentation.init(); // Initialize docs module

        this.mousePos = new Utils.Vec2(0, 0);
        this.isMouseDown = false;

        this.setupListeners();
    }

    setupListeners() {
        // Physical parameters
        this.controls.gravity.oninput = (e) => this.world.params.gravity = parseFloat(e.target.value);
        this.controls.friction.oninput = (e) => this.world.params.friction = parseFloat(e.target.value);
        this.controls.speed.oninput = (e) => this.world.params.speed = parseFloat(e.target.value);

        // Audio parameters
        this.controls.reverb.oninput = (e) => this.audio.setReverb(parseFloat(e.target.value));
        this.controls.scale.onchange = (e) => this.audio.setScale(e.target.value);

        // System parameters
        this.controls.theme.onchange = (e) => Themes.apply(e.target.value);

        // Actions
        this.controls.btnAddBall.onclick = () => {
            const { w, h } = this.world;
            this.world.addBall(w / 2, h / 2, Utils.random(8, 15));
            this.updateStats();
        };

        this.controls.btnClear.onclick = () => {
            Presets.apply('standard', this.world);
            this.world.balls = [];
            this.updateStats();
        };

        this.controls.btnRecord.onclick = () => this.toggleRecording();
        this.controls.btnHelp.onclick = () => this.docs.toggle(true);

        // Canvas / Interaction
        this.canvas.onmousedown = (e) => {
            this.isMouseDown = true;
            this.updateMouse(e);
            this.world.handleInteraction(this.mousePos, true, e.button === 2);
        };

        window.onmousemove = (e) => {
            this.updateMouse(e);
            this.world.handleInteraction(this.mousePos, this.isMouseDown);
        };

        window.onmouseup = () => {
            this.isMouseDown = false;
            this.world.handleInteraction(this.mousePos, false);
        };

        // Visualizer click to cycle modes
        this.canvas.ondblclick = () => {
            // Access visualizer global or pass it in? 
            // Ideally UI shouldn't know about visualizer directly but for now...
            // Let's rely on main.js to handle this or expose it differently.
        };

        // Resize
        window.onresize = () => this.handleResize();

        // Keyboard
        window.onkeydown = (e) => {
            if (e.code === 'Space') {
                this.world.params.paused = !this.world.params.paused;
                e.preventDefault();
            }
        };
    }

    updateMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.set(e.clientX - rect.left, e.clientY - rect.top);
    }

    handleResize() {
        const sidePanel = document.getElementById('controls-panel');
        const header = document.querySelector('.main-header');

        const w = window.innerWidth - sidePanel.offsetWidth;
        const h = window.innerHeight - header.offsetHeight;

        this.canvas.width = w;
        this.canvas.height = h;
        this.world.resize(w, h);
    }

    updateStats() {
        this.controls.statNodes.innerText = this.world.balls.length;
    }

    toggleRecording() {
        if (!this.recorder) {
            // We need the audio destination. 
            // In a real app we'd pass this cleanly. 
            // For now assuming audio.masterGain connectable or just creating a stream dst.
            const dest = this.audio.ctx.createMediaStreamDestination();
            this.audio.masterGain.connect(dest);
            this.recorder = new SessionRecorder(this.canvas, dest);
        }

        if (this.recorder.isRecording) {
            this.recorder.stop();
            this.controls.btnRecord.innerText = "Start Recording";
            this.controls.btnRecord.classList.remove('active-record');
        } else {
            this.recorder.start();
            this.controls.btnRecord.innerText = "Stop Recording";
            this.controls.btnRecord.classList.add('active-record');
        }
    }

    showCollisionFeedback(ball, wall, normal) {
        // Create a temporary visual label at hit point
        const label = document.createElement('div');
        label.className = 'collision-pulse';
        label.style.left = `${ball.pos.x}px`;
        label.style.top = `${ball.pos.y}px`;

        // In reality, we'd need a separate container for this if we want it over the canvas
        // This is a placeholder for more complex kinetic UI
    }
}
