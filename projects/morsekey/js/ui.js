/**
 * UIController - Updates the DOM based on application state
 */
export class UIController {
    constructor(appHooks) {
        this.decodedDisplay = document.getElementById('decoded-display');
        this.morseBuffer = document.getElementById('input-buffer');
        this.timingBar = document.getElementById('timing-bar');
        this.morseKey = document.getElementById('morse-key');
        this.charCount = document.getElementById('char-count');
        this.wpmDisplay = document.getElementById('wpm-display');
        this.cursor = this.decodedDisplay.querySelector('.cursor');
        this.paperTape = document.getElementById('paper-tape');
        this.canvas = document.getElementById('audio-visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.exportBtn = document.getElementById('export-btn');
        this.oscSelect = document.getElementById('osc-type');
        this.themeSelect = document.getElementById('theme-type');
        this.terminal = document.querySelector('.terminal-container');

        this.volSlider = document.getElementById('vol-slider');
        this.pitchSlider = document.getElementById('pitch-slider');
        this.playbackBtn = document.getElementById('playback-btn');
        this.playbackInput = document.getElementById('playback-input');
        this.vizToggle = document.getElementById('viz-toggle');

        this.vizMode = 'waveform'; // or 'spectrum'

        this.setupListeners(appHooks);
    }

    setupListeners(hooks) {
        this.exportBtn.onclick = () => hooks.onExport();
        this.oscSelect.onchange = (e) => hooks.onOscChange(e.target.value);
        this.themeSelect.onchange = (e) => hooks.onThemeChange(e.target.value);

        this.volSlider.oninput = (e) => hooks.onVolChange(parseFloat(e.target.value));
        this.pitchSlider.oninput = (e) => hooks.onPitchChange(parseInt(e.target.value));

        this.playbackBtn.onclick = () => {
            hooks.onPlayback(this.playbackInput.value);
            this.playbackInput.value = '';
        };

        this.vizToggle.onclick = () => {
            this.vizMode = this.vizMode === 'waveform' ? 'spectrum' : 'waveform';
            this.vizToggle.textContent = `MODE: ${this.vizMode.toUpperCase()}`;
        };

        // Tab listeners
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
                hooks.onTabChange(btn.dataset.tab);
            };
        });
    }

    setKeyState(active) {
        if (active) {
            this.morseKey.classList.add('active');
            this.terminal.classList.add('transmitting-shake');
        } else {
            this.morseKey.classList.remove('active');
            this.terminal.classList.remove('transmitting-shake');
        }
    }

    addTapeSymbol(type) {
        const symbol = document.createElement('div');
        symbol.className = `tape-symbol ${type}`;
        this.paperTape.appendChild(symbol);

        // Keep tape scrolled to right
        const scrollWidth = this.paperTape.scrollWidth;
        this.paperTape.style.transform = `translateX(-${Math.max(0, scrollWidth - 300)}px)`;

        // Remove old symbols to save memory
        if (this.paperTape.children.length > 50) {
            this.paperTape.removeChild(this.paperTape.firstChild);
        }
    }

    drawVisualizer(analyser) {
        if (!analyser) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            requestAnimationFrame(draw);

            if (this.vizMode === 'waveform') {
                analyser.getByteTimeDomainData(dataArray);
                this.drawWaveform(dataArray, bufferLength);
            } else {
                analyser.getByteFrequencyData(dataArray);
                this.drawSpectrum(dataArray, bufferLength);
            }
        };
        draw();
    }

    drawWaveform(dataArray, bufferLength) {
        this.ctx.fillStyle = 'rgba(12, 12, 12, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#00ff41';
        this.ctx.beginPath();
        const sliceWidth = this.canvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * this.canvas.height / 2;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
            x += sliceWidth;
        }
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
    }

    drawSpectrum(dataArray, bufferLength) {
        this.ctx.fillStyle = 'rgba(12, 12, 12, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const barWidth = (this.canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        const color = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#00ff41';
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    populateCheatSheet(dictionary) {
        const list = document.getElementById('morse-list');
        list.innerHTML = '';
        Object.entries(dictionary).sort().forEach(([code, char]) => {
            const li = document.createElement('li');
            li.className = 'morse-item';
            li.innerHTML = `<span>${char}</span> <span class="morse-code">${code}</span>`;
            list.appendChild(li);
        });
    }

    addToHistory(text) {
        const list = document.getElementById('history-list');
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-time">${new Date().toLocaleTimeString()}</div>
            <div class="history-content">${text}</div>
        `;
        list.prepend(item);
        if (list.children.length > 20) list.removeChild(list.lastChild);
    }

    updateBuffer(buffer) {
        this.morseBuffer.textContent = buffer;
    }

    addCharacter(char) {
        const span = document.createElement('span');
        span.className = 'character-pop';
        span.textContent = char;
        this.decodedDisplay.insertBefore(span, this.cursor);
        this.updateStats();
    }

    updateTiming(percent) {
        this.timingBar.style.width = `${percent}%`;
    }

    updateStats() {
        const text = this.decodedDisplay.innerText.replace('_', '').trim();
        this.charCount.textContent = `${text.length} Chars`;
    }

    clearBuffer() {
        this.morseBuffer.textContent = '';
    }
}
