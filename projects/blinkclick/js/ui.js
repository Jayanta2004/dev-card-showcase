/**
 * UI Controller Module
 * Manages DOM updates, HUD elements, and visual feedback.
 */

class UIController {
    constructor() {
        this.signalBar = document.getElementById('signal-bar');
        this.thresholdValue = document.getElementById('threshold-value');
        this.fpsDisplay = document.getElementById('fps-display');
        this.terminal = document.querySelector('.instruction-terminal');
        this.blinkButton = document.getElementById('blink-button');
        this.indicator = document.querySelector('.blink-indicator');
        this.startBtn = document.getElementById('start-btn');
        this.overlay = document.getElementById('start-overlay');

        // --- Phase 2: Feature UI ---
        this.syncHistory = document.createElement('div');
        this.syncHistory.id = 'sync-history';
        this.terminal.parentNode.insertBefore(this.syncHistory, this.terminal.nextSibling);

        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.isVoiceMuted = false;
    }

    /**
     * Web Speech API - Synthetic Voice
     */
    speak(text) {
        if (this.isVoiceMuted) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2;
        utterance.pitch = 0.8;
        window.speechSynthesis.speak(utterance);
    }

    /**
     * Update detection metrics in the HUD
     * @param {Object} data - Detection results from the BlinkDetector
     */
    updateHUD(data) {
        if (!data) return;

        // Update technical signal strength bar (representing confidence)
        // We use a CSS width mapping for smooth visual feedback
        this.signalBar.style.width = `${data.confidence}%`;

        // Update the numeric threshold display
        this.thresholdValue.innerText = data.diff.toFixed(2);

        // Update indicator bar on button
        this.indicator.style.width = `${data.confidence}%`;

        // --- Phase 2: Adaptive UI Logic ---
        this.updateAdaptiveTheme(data.ambient);

        // --- Phase 2: Combo Feedback ---
        if (data.isCombo && data.comboCount > 1) {
            this.logTerminal(`COMBO X${data.comboCount} DETECTED!`);
            this.blinkButton.style.borderWidth = `${data.comboCount * 2}px`;
        } else {
            this.blinkButton.style.borderWidth = '1px';
        }

        // Update FPS every second
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsUpdate > 1000) {
            const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.fpsDisplay.innerText = `${fps.toString().padStart(2, '0')} FPS`;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }

        // Active state for button if confidence is high
        if (data.confidence > 50) {
            this.blinkButton.classList.add('active');
        } else {
            this.blinkButton.classList.remove('active');
        }
    }

    /**
     * Phase 2: Adaptive Theme Updates
     */
    updateAdaptiveTheme(ambient) {
        const root = document.documentElement;
        if (ambient < 30) {
            // Low light - Neon Red/Dark
            root.style.setProperty('--accent-primary', '#ff003c');
            root.style.setProperty('--accent-glow', 'rgba(255, 0, 60, 0.4)');
        } else if (ambient > 150) {
            // High light - Electric White/Blue
            root.style.setProperty('--accent-primary', '#ffffff');
            root.style.setProperty('--accent-glow', 'rgba(255, 255, 255, 0.4)');
        } else {
            // Normal - Original Cyan
            root.style.setProperty('--accent-primary', '#00f2ff');
            root.style.setProperty('--accent-glow', 'rgba(0, 242, 255, 0.4)');
        }
    }

    /**
     * Phase 2: Draw Heatmap on context
     */
    drawHeatmap(ctx, heatmap, cols, rows) {
        const cellW = ctx.canvas.width / cols;
        const cellH = ctx.canvas.height / rows;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const alpha = heatmap[y * cols + x];
                if (alpha > 0.1) {
                    ctx.fillStyle = `rgba(112, 0, 255, ${alpha * 0.3})`;
                    ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
                }
            }
        }
        ctx.restore();
    }

    /**
     * Trigger success animation
     */
    triggerSuccess(comboCount = 1) {
        this.blinkButton.classList.remove('disabled');
        this.blinkButton.classList.add('success-flash');

        const msg = comboCount > 1 ? `COMBO X${comboCount} REGISTERED!` : "NEURAL COMMAND REGISTERED.";
        this.logTerminal(msg);
        this.speak(msg);

        this.addToSyncLog(comboCount);

        setTimeout(() => {
            this.blinkButton.classList.remove('success-flash');
            this.blinkButton.classList.add('disabled');
        }, 1500);
    }

    /**
     * Phase 2: Add entry to Persistent Sync Log
     */
    addToSyncLog(comboCount) {
        const entry = document.createElement('div');
        entry.className = 'sync-entry';
        const uid = Math.random().toString(36).substr(2, 6).toUpperCase();
        const time = new Date().toLocaleTimeString();

        entry.innerHTML = `
            <span class="uid">[${uid}]</span>
            <span class="time">${time}</span>
            <span class="event">SYNC_LOCKED_${comboCount > 1 ? 'COMBO' : 'SOLO'}</span>
        `;

        this.syncHistory.prepend(entry);
        if (this.syncHistory.children.length > 5) {
            this.syncHistory.removeChild(this.syncHistory.lastChild);
        }
    }

    /**
     * Log a message to the typewriter terminal
     */
    logTerminal(message) {
        const p = document.createElement('p');
        p.className = 'typewriter';
        p.innerText = `> ${message}`;
        this.terminal.appendChild(p);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    /**
     * Show/Hide loading overlay
     */
    hideOverlay() {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 500);
    }

    /**
     * Enable the interface
     */
    enableInterface() {
        this.blinkButton.classList.remove('disabled');
        this.logTerminal("EYE ALIGNMENT CONFIRMED.");
        this.logTerminal("WAITING FOR BLINK TRIGGER.");
    }
}

// Export
window.UIController = UIController;
