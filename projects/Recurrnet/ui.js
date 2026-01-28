/**
 * RECURRNET UI CONTROLLER
 * Bridges the DOM with the Deep Learning Engine.
 * Manages the high-speed training loop and live inference updates.
 * @author saiusesgithub
 */

const SAMPLE_DATA = {
    english: "The quick brown fox jumps over the lazy dog. ".repeat(50),
    code: "function hello() { console.log('world'); } if(true) { return false; } ".repeat(20),
    shakespeare: `
To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them. To die—to sleep,
No more; and by a sleep to say we end
The heart-ache and the thousand natural shocks
That flesh is heir to: 'tis a consummation
Devoutly to be wish'd. To die, to sleep;
To sleep, perchance to dream—ay, there's the rub:
For in that sleep of death what dreams may come,
When we have shuffled off this mortal coil,
Must give us pause—there's the respect
That makes calamity of so long life.
`.trim()
};

class UIController {
    constructor() {
        // Components
        this.loader = new TextLoader();
        this.lossGraph = new LossGraph('loss-canvas');
        this.heatmap = new Heatmap('heatmap-canvas');
        this.rnn = null;
        this.trainer = null;

        // State
        this.training = false;
        this.stepsPerFrame = 5; // How many batches per visual update

        // DOM Elements
        this.dom = {
            corpus: document.getElementById('corpus-input'),
            btnTrain: document.getElementById('btn-train'),
            btnReset: document.getElementById('btn-reset'),
            
            // Stats
            statIter: document.getElementById('disp-iter'),
            statLoss: document.getElementById('disp-loss'),
            statTime: document.getElementById('disp-time'),
            
            // Params
            paramHidden: document.getElementById('param-hidden'),
            paramLr: document.getElementById('param-lr'),
            paramSeq: document.getElementById('param-seq'),
            paramTemp: document.getElementById('param-temp'),
            
            // Output
            sampleText: document.getElementById('sample-text'),
            logs: document.getElementById('sys-logs')
        };

        this.initListeners();
    }

    initListeners() {
        // Data Loaders
        document.getElementById('btn-load-eng').onclick = () => this.dom.corpus.value = SAMPLE_DATA.english;
        document.getElementById('btn-load-code').onclick = () => this.dom.corpus.value = SAMPLE_DATA.code;
        document.getElementById('btn-load-shakes').onclick = () => this.dom.corpus.value = SAMPLE_DATA.shakespeare;

        // Main Actions
        this.dom.btnTrain.onclick = () => this.toggleTraining();
        
        this.dom.btnReset.onclick = () => {
            this.stop();
            this.rnn = null;
            this.trainer = null;
            this.lossGraph.data = [];
            this.lossGraph.draw();
            this.log("Model reset.");
        };

        // Range Sliders UI Updates
        const linkSlider = (id, targetId) => {
            const el = document.getElementById(id);
            el.oninput = () => document.getElementById(targetId).innerText = el.value;
        };
        linkSlider('param-hidden', 'val-hidden');
        linkSlider('param-lr', 'val-lr');
        linkSlider('param-seq', 'val-seq');
    }

    toggleTraining() {
        if (this.training) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        const text = this.dom.corpus.value.trim();
        if (text.length < 100) {
            this.log("Error: Corpus too short. Please add more text.");
            return;
        }

        // Initialize if new
        if (!this.rnn) {
            this.log("Preprocessing Data...");
            const stats = this.loader.load(text);
            
            document.getElementById('stat-chars').innerText = stats.length;
            document.getElementById('stat-vocab').innerText = stats.vocabSize;

            this.log(`Building Model (Vocab: ${stats.vocabSize}, Hidden: ${this.dom.paramHidden.value})...`);
            
            this.rnn = new RNN(
                stats.vocabSize, 
                parseInt(this.dom.paramHidden.value), 
                stats.vocabSize
            );
            
            this.trainer = new Trainer(this.rnn, this.loader);
        }

        this.training = true;
        this.trainer.paused = false;
        this.dom.btnTrain.innerHTML = '<i class="ri-pause-fill"></i> Pause Training';
        this.dom.btnTrain.className = "btn-secondary";
        
        this.loop();
    }

    stop() {
        this.training = false;
        if(this.trainer) this.trainer.paused = true;
        this.dom.btnTrain.innerHTML = '<i class="ri-play-fill"></i> Resume Training';
        this.dom.btnTrain.className = "btn-primary";
    }

    loop() {
        if (!this.training) return;

        const startT = performance.now();
        const lr = parseFloat(this.dom.paramLr.value);
        const seq = parseInt(this.dom.paramSeq.value);

        // Run multiple steps per frame for speed
        for (let i = 0; i < this.stepsPerFrame; i++) {
            const info = this.trainer.trainStep({ learningRate: lr, seqLength: seq });
            if (!info) {
                this.stop(); 
                this.log("Training complete (End of Epoch).");
                return;
            }
        }

        const time = performance.now() - startT;

        // UI Updates (Once per frame)
        this.updateUI(time);
        
        // Sampling (Every 50 frames)
        if (this.trainer.iter % 200 === 0) {
            this.runSample();
        }

        requestAnimationFrame(() => this.loop());
    }

    updateUI(timeMs) {
        this.dom.statIter.innerText = this.trainer.iter;
        this.dom.statLoss.innerText = this.trainer.smoothLoss.toFixed(4);
        this.dom.statTime.innerText = timeMs.toFixed(1) + "ms";

        this.lossGraph.update(this.trainer.smoothLoss);
        
        // Visualize the hidden state of the first char in corpus
        const h = this.trainer.getCurrentHiddenState(0);
        this.heatmap.draw(h);
    }

    runSample() {
        const temp = parseFloat(this.dom.paramTemp.value);
        const txt = this.trainer.sample(0, 100, temp);
        this.dom.sampleText.innerText = txt + "...";
    }

    log(msg) {
        const div = document.createElement('div');
        div.className = 'log';
        if (msg.includes('Error')) div.style.color = '#f44336';
        div.innerText = `> ${msg}`;
        this.dom.logs.prepend(div);
        if(this.dom.logs.children.length > 20) this.dom.logs.lastChild.remove();
    }
}

// Boot
window.onload = () => {
    window.app = new UIController();
};