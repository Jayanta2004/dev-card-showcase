// Cross-Modal Cognition Amplifier

class CrossModalCognitionAmplifier {
    constructor() {
        this.currentModality = 'visual-auditory';
        this.progress = {
            integration: 0,
            pattern: 0,
            responseTime: 0
        };
        this.sessionData = {
            exercises: [],
            responses: [],
            timings: []
        };

        this.colors = [
            { name: 'Red', hex: '#FF0000', frequency: 440 },
            { name: 'Blue', hex: '#0000FF', frequency: 523 },
            { name: 'Green', hex: '#00FF00', frequency: 659 },
            { name: 'Yellow', hex: '#FFFF00', frequency: 784 },
            { name: 'Purple', hex: '#800080', frequency: 880 },
            { name: 'Orange', hex: '#FFA500', frequency: 988 }
        ];

        this.currentColorIndex = 0;
        this.audioContext = null;
        this.rhythmInterval = null;
        this.rhythmTempo = 120;
        this.isRhythmPlaying = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCanvas();
        this.updateInsights('Welcome to Cross-Modal Cognition Amplifier. Select a training modality to begin enhancing your cognitive abilities.');
    }

    setupEventListeners() {
        // Modality switching
        document.querySelectorAll('.modality-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchModality(e.target.dataset.modality);
            });
        });

        // Visual-Auditory exercise
        document.getElementById('playSound').addEventListener('click', () => this.playColorSound());
        document.getElementById('nextColor').addEventListener('click', () => this.nextColor());
        document.getElementById('testAssociation').addEventListener('click', () => this.testAssociation());

        // Kinesthetic-Visual exercise
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('analyzePattern').addEventListener('click', () => this.analyzePattern());
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.drawShape(e.target.dataset.shape));
        });

        // Auditory-Kinesthetic exercise
        document.getElementById('tempo').addEventListener('input', (e) => this.updateTempo(e.target.value));
        document.getElementById('startRhythm').addEventListener('click', () => this.startRhythm());
        document.getElementById('stopRhythm').addEventListener('click', () => this.stopRhythm());
        document.getElementById('tapRhythm').addEventListener('click', () => this.tapRhythm());

        // Multi-Modal exercise
        document.getElementById('playSequence').addEventListener('click', () => this.playSequence());
        document.getElementById('submitResponse').addEventListener('click', () => this.submitResponse());
    }

    switchModality(modality) {
        // Update active button
        document.querySelectorAll('.modality-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-modality="${modality}"]`).classList.add('active');

        // Hide all exercises
        document.querySelectorAll('.exercise').forEach(ex => {
            ex.classList.remove('active');
        });

        // Show selected exercise
        document.getElementById(`${modality}-exercise`).classList.add('active');

        this.currentModality = modality;
        this.updateInsights(`Switched to ${modality.replace('-', ' ')} training modality. Begin your cognitive enhancement exercise.`);
    }

    // Visual-Auditory Integration
    nextColor() {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        this.updateColorDisplay();
    }

    updateColorDisplay() {
        const color = this.colors[this.currentColorIndex];
        const colorBox = document.getElementById('colorBox');
        const colorName = document.getElementById('colorName');
        const frequency = document.getElementById('frequency');

        colorBox.style.backgroundColor = color.hex;
        colorName.textContent = color.name;
        frequency.textContent = `${color.frequency} Hz`;
    }

    async playColorSound() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const color = this.colors[this.currentColorIndex];
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(color.frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);

        this.sessionData.exercises.push({
            type: 'visual-auditory',
            action: 'play_sound',
            color: color.name,
            timestamp: Date.now()
        });
    }

    testAssociation() {
        const startTime = Date.now();
        const color = this.colors[this.currentColorIndex];

        // Create a simple test
        const testColors = this.colors.slice(0, 4);
        const correctIndex = Math.floor(Math.random() * testColors.length);
        const testColor = testColors[correctIndex];

        const question = `What frequency corresponds to ${testColor.name}?`;
        const userAnswer = prompt(question);

        const responseTime = Date.now() - startTime;
        const correct = parseInt(userAnswer) === testColor.frequency;

        this.sessionData.responses.push({
            type: 'association_test',
            correct,
            responseTime,
            timestamp: Date.now()
        });

        const feedback = document.getElementById('feedback');
        if (correct) {
            feedback.textContent = `✅ Correct! Response time: ${responseTime}ms`;
            feedback.style.color = '#4CAF50';
            this.progress.integration = Math.min(100, this.progress.integration + 5);
        } else {
            feedback.textContent = `❌ Incorrect. The correct frequency is ${testColor.frequency} Hz`;
            feedback.style.color = '#f44336';
        }

        this.updateProgress();
    }

    // Kinesthetic-Visual Coordination
    initializeCanvas() {
        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');

        this.canvas = canvas;
        this.ctx = ctx;

        // Set up drawing
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            this.drawLine(lastX, lastY, e.offsetX, e.offsetY);
            [lastX, lastY] = [e.offsetX, e.offsetY];
        });

        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseout', () => isDrawing = false);
    }

    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }

    drawShape(shape) {
        this.clearCanvas();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.ctx.strokeStyle = '#FF9800';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();

        switch (shape) {
            case 'circle':
                this.ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
                break;
            case 'square':
                this.ctx.rect(centerX - 60, centerY - 60, 120, 120);
                break;
            case 'triangle':
                this.ctx.moveTo(centerX, centerY - 60);
                this.ctx.lineTo(centerX - 60, centerY + 60);
                this.ctx.lineTo(centerX + 60, centerY + 60);
                this.ctx.closePath();
                break;
            case 'wave':
                this.ctx.moveTo(50, centerY);
                for (let x = 50; x < this.canvas.width - 50; x += 10) {
                    const y = centerY + Math.sin((x - 50) * 0.1) * 40;
                    this.ctx.lineTo(x, y);
                }
                break;
        }

        this.ctx.stroke();

        this.sessionData.exercises.push({
            type: 'kinesthetic-visual',
            action: 'draw_shape',
            shape,
            timestamp: Date.now()
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    analyzePattern() {
        // Simple pattern analysis based on drawn content
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        let drawnPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) drawnPixels++; // Check alpha channel
        }

        const coverage = (drawnPixels / (this.canvas.width * this.canvas.height)) * 100;

        this.progress.pattern = Math.min(100, this.progress.pattern + coverage * 0.1);
        this.updateProgress();

        this.updateInsights(`Pattern analysis: ${coverage.toFixed(1)}% canvas coverage. ${coverage > 20 ? 'Good engagement!' : 'Try drawing more!'}`);
    }

    // Auditory-Kinesthetic Rhythm
    updateTempo(value) {
        this.rhythmTempo = parseInt(value);
        document.getElementById('tempoValue').textContent = value;
    }

    startRhythm() {
        if (this.isRhythmPlaying) return;

        this.isRhythmPlaying = true;
        const interval = (60 / this.rhythmTempo) * 1000; // Convert BPM to milliseconds
        let beatIndex = 0;

        this.rhythmInterval = setInterval(() => {
            this.playBeat(beatIndex);
            beatIndex = (beatIndex + 1) % 4;
        }, interval);

        document.getElementById('startRhythm').disabled = true;
        document.getElementById('stopRhythm').disabled = false;
    }

    stopRhythm() {
        if (!this.isRhythmPlaying) return;

        this.isRhythmPlaying = false;
        clearInterval(this.rhythmInterval);

        document.querySelectorAll('.beat-circle').forEach(circle => {
            circle.classList.remove('active');
        });

        document.getElementById('startRhythm').disabled = false;
        document.getElementById('stopRhythm').disabled = true;
    }

    playBeat(index) {
        // Visual beat
        document.querySelectorAll('.beat-circle').forEach((circle, i) => {
            circle.classList.toggle('active', i === index);
        });

        // Audio beat (simple beep)
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        }
    }

    tapRhythm() {
        const tappedBeat = Array.from(document.querySelectorAll('.beat-circle')).findIndex(circle =>
            circle.classList.contains('active')
        );

        if (tappedBeat !== -1) {
            document.getElementById(`beat${tappedBeat + 1}`).classList.add('tapped');
            setTimeout(() => {
                document.getElementById(`beat${tappedBeat + 1}`).classList.remove('tapped');
            }, 200);

            this.sessionData.exercises.push({
                type: 'auditory-kinesthetic',
                action: 'tap_rhythm',
                beat: tappedBeat,
                timestamp: Date.now()
            });

            this.updateRhythmFeedback('Good timing! 🎵');
            this.progress.integration = Math.min(100, this.progress.integration + 2);
            this.updateProgress();
        } else {
            this.updateRhythmFeedback('Tap when a beat is active! ⏰');
        }
    }

    updateRhythmFeedback(message) {
        document.getElementById('rhythmFeedback').textContent = message;
    }

    // Multi-Modal Integration
    playSequence() {
        const shapes = ['circle', 'square', 'triangle'];
        const words = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
        const sequence = [];

        // Generate random sequence
        for (let i = 0; i < 3; i++) {
            sequence.push({
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                word: words[Math.floor(Math.random() * words.length)],
                sound: 440 + Math.floor(Math.random() * 440) // Random frequency
            });
        }

        this.currentSequence = sequence;
        this.displaySequence(sequence);
    }

    displaySequence(sequence) {
        const display = document.getElementById('sequenceDisplay');
        display.innerHTML = '';

        sequence.forEach((item, index) => {
            setTimeout(() => {
                // Update visual
                this.updateShape(item.shape);
                document.getElementById('word').textContent = item.word;

                // Play sound
                this.playFrequency(item.sound);

                // Update display
                display.innerHTML = `Step ${index + 1}: ${item.shape} + ${item.word} + ${item.sound}Hz`;
            }, index * 1500);
        });
    }

    updateShape(shape) {
        const shapeElement = document.getElementById('shape');
        shapeElement.className = 'shape';

        switch (shape) {
            case 'circle':
                shapeElement.style.borderRadius = '50%';
                shapeElement.style.width = '80px';
                shapeElement.style.height = '80px';
                break;
            case 'square':
                shapeElement.style.borderRadius = '0';
                shapeElement.style.width = '80px';
                shapeElement.style.height = '80px';
                break;
            case 'triangle':
                shapeElement.style.width = '0';
                shapeElement.style.height = '0';
                shapeElement.style.borderLeft = '40px solid transparent';
                shapeElement.style.borderRight = '40px solid transparent';
                shapeElement.style.borderBottom = '80px solid #667eea';
                break;
        }
    }

    playFrequency(frequency) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    submitResponse() {
        const response = document.getElementById('response').value.trim();
        if (!response) return;

        const startTime = Date.now();
        // Simple analysis of response
        const words = response.toLowerCase().split(' ');
        let score = 0;

        if (this.currentSequence) {
            this.currentSequence.forEach(item => {
                if (words.includes(item.shape.toLowerCase()) ||
                    words.includes(item.word.toLowerCase())) {
                    score += 10;
                }
            });
        }

        const responseTime = Date.now() - startTime;

        this.sessionData.responses.push({
            type: 'multi_modal',
            response,
            score,
            responseTime,
            timestamp: Date.now()
        });

        this.progress.pattern = Math.min(100, this.progress.pattern + score * 0.5);
        this.progress.responseTime = Math.max(0, 1000 - responseTime); // Lower time is better
        this.updateProgress();

        document.getElementById('response').value = '';
        this.updateInsights(`Multi-modal response analyzed. Score: ${score}/30. ${score > 15 ? 'Excellent integration!' : 'Keep practicing!'}`);
    }

    updateProgress() {
        document.getElementById('integrationProgress').style.width = `${this.progress.integration}%`;
        document.getElementById('integrationScore').textContent = `${Math.round(this.progress.integration)}%`;

        document.getElementById('patternProgress').style.width = `${this.progress.pattern}%`;
        document.getElementById('patternScore').textContent = `${Math.round(this.progress.pattern)}%`;

        document.getElementById('responseProgress').style.width = `${this.progress.responseTime}%`;
        document.getElementById('responseScore').textContent = `${Math.round(this.progress.responseTime)}ms`;
    }

    updateInsights(message) {
        document.getElementById('insights').innerHTML = `<p>${message}</p>`;
    }
}

// Initialize the amplifier when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CrossModalCognitionAmplifier();
});