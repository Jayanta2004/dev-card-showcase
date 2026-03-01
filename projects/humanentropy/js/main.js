import { InputTracker } from './core/input-tracker.js';
import { EntropyEngine } from './core/entropy-engine.js';
import { PatternDetector } from './core/pattern-detector.js';
import { UIRenderer } from './ui/ui-renderer.js';
import { Visualizer } from './ui/visualizer.js';
import { TimeUtils } from './utils/time-utils.js';
import { MathUtils } from './utils/math-utils.js';

/**
 * Main Application Module
 * Orchestrates the analysis loop and updates the UI.
 */
class HumanEntropyApp {
    constructor() {
        // Initialize Modules
        this.tracker = new InputTracker();
        this.entropyEngine = new EntropyEngine();
        this.patternDetector = new PatternDetector();
        this.ui = new UIRenderer();
        this.visualizer = new Visualizer('main-visualizer');

        // State
        this.isRunning = false;
        this.updateInterval = null;

        this.setupControls();
        this.start();
    }

    setupControls() {
        document.getElementById('reset-entropy').addEventListener('click', () => {
            this.tracker.reset();
            this.ui.log('Analysis reset by user.', 'warn');
        });
    }

    start() {
        this.tracker.start();
        this.isRunning = true;
        this.loop();
        this.ui.log('System initialized. Monitoring started.', 'system');
    }

    loop() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.loop());

        const now = TimeUtils.now();
        const lastInputTime = this.tracker.mouseHistory.length > 0
            ? this.tracker.mouseHistory[this.tracker.mouseHistory.length - 1].t
            : 0;

        // If idle for more than 3 seconds, run demo
        if (now - lastInputTime > 3000) {
            this.runDemo(now);
        }

        // 1. Get Data
        const mouseData = this.tracker.getRecentMouseData(500); // Window for analysis
        const keyData = this.tracker.getRecentKeyData(200);

        // 2. Analyze Entropy
        const entropyResult = this.entropyEngine.analyzeMouseEntropy(mouseData);
        // Normalize entropy: Max theoretical is ~3 bits for angles + ~2.3 for speed.
        // Let's assume max reasonable "random" entropy is around 4.0 bits total.
        const predictability = this.entropyEngine.getPredictability(entropyResult.totalEntropy, 4.0);

        // 3. Pattern Detection (Quantized stream)
        // We need to feed the pattern detector a sequence. 
        // Let's use quantized angles from recent mouse moves.
        if (mouseData.length > 10) {
            const quantizedSeq = mouseData.slice(-20).map(pt => this.quantizeDirection(pt.angle));
            this.patternDetector.train(quantizedSeq);

            // Check for next move prediction
            const prediction = this.patternDetector.predict(quantizedSeq.slice(-5));
            if (prediction && prediction.probability > 0.8) {
                // High confidence prediction
                // this.ui.log(`Pattern Predicted: ${prediction.state} (${(prediction.probability*100).toFixed(0)}%)`, 'info');
            }
        }

        // 4. Update UI
        // Calculate directional buckets for radar chart
        const dirBuckets = new Array(8).fill(0);
        mouseData.forEach(pt => {
            if (pt.velocity > 1) {
                const idx = this.quantizeDirection(pt.angle);
                dirBuckets[idx]++;
            }
        });
        // Normalize buckets
        const maxBucket = Math.max(...dirBuckets) || 1;
        const normBuckets = dirBuckets.map(v => v / maxBucket);

        this.ui.render({
            entropy: entropyResult.totalEntropy,
            predictability: predictability,
            lastPos: this.tracker.currentPos,
            directionBuckets: normBuckets,
            timingHistory: this.getTimingHistory(mouseData), // derived
            sequenceLength: mouseData.length,
            complexity: (entropyResult.totalEntropy * 1.5).toFixed(2) // Fake complexity syntax
        });

        this.ui.updateStatus(mouseData.length > 0 && (TimeUtils.now() - mouseData[mouseData.length - 1].t < 1000));
        this.ui.updateClock();

        // 5. Visualize
        // Pass 1.0 - predictability as "Entropy Level" (Chaos amount)
        // Or just pass calculated entropy normalized.
        // Predictability 1.0 = Order. Predictability 0.0 = Chaos.
        // Visualizer expects EntropyLevel (1.0 = Chaos).
        // So pass (1.0 - predictability).
        this.visualizer.update(this.tracker.currentPos, 1.0 - predictability);
        this.visualizer.draw();
    }

    /**
     * Helper to get integer direction 0-7 from radians.
     */
    quantizeDirection(rad) {
        let deg = MathUtils.radToDeg(rad);
        if (deg < 0) deg += 360;
        return Math.floor(deg / 45) % 8;
    }

    getTimingHistory(data) {
        if (data.length < 2) return [];
        // Delta times between moves
        const deltas = [];
        for (let i = 1; i < data.length; i++) {
            deltas.push(Math.min((data[i].t - data[i - 1].t) / 100, 1.0)); // Normalize to 100ms
        }
        return deltas.slice(-50);
    }

    /**
     * Runs auto-demo if user is idle.
     * Simulates a perfect circle movement (Low Entropy) or Random (High Entropy).
     */
    runDemo(time) {
        // Toggle behavior every 5 seconds
        const mode = Math.floor(time / 5000) % 2;
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const radius = 200;

        let demoPos;

        if (mode === 0) {
            // Predictable Circle
            const angle = time * 0.002;
            demoPos = {
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius,
                t: time,
                velocity: 10,
                angle: angle
            };
        } else {
            // Random Jitter
            // Perlin noise would be better but Math.random works for "High Entropy"
            if (!this.lastDemoPos) this.lastDemoPos = center;
            demoPos = {
                x: this.lastDemoPos.x + (Math.random() - 0.5) * 50,
                y: this.lastDemoPos.y + (Math.random() - 0.5) * 50,
                t: time,
                velocity: Math.random() * 50,
                angle: Math.random() * Math.PI * 2
            };

            // Constrain to screen
            demoPos.x = MathUtils.clamp(demoPos.x, 0, window.innerWidth);
            demoPos.y = MathUtils.clamp(demoPos.y, 0, window.innerHeight);
            this.lastDemoPos = demoPos;
        }

        // Feed fake input
        this.tracker.mouseHistory.push(demoPos);
        if (this.tracker.mouseHistory.length > this.tracker.historySize) {
            this.tracker.mouseHistory.shift();
        }
        this.tracker.currentPos = { x: demoPos.x, y: demoPos.y };

        // Indicate Demo Mode
        this.ui.log('AUTO-DEMO ACTIVE: Generating synthetic data...', 'system');
    }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
    window.app = new HumanEntropyApp();
});
