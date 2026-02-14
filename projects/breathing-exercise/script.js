// Breathing Exercise UI JavaScript
class BreathingExercise {
    constructor() {
        this.currentTechnique = '478';
        this.isActive = false;
        this.isPaused = false;
        this.currentPhase = 'prepare';
        this.cyclesCompleted = 0;
        this.sessionStartTime = null;
        this.currentCycle = 0;
        this.totalCycles = 5;
        this.phaseTimer = null;
        this.sessionTimer = null;
        this.audioEnabled = false;
        this.volume = 0.7;
        this.sessionHistory = JSON.parse(localStorage.getItem('breathingSessions') || '[]');

        this.techniques = {
            '478': {
                name: '4-7-8 Breathing',
                phases: [
                    { name: 'inhale', duration: 4, instruction: 'Breathe In' },
                    { name: 'inhale-hold', duration: 7, instruction: 'Hold' },
                    { name: 'exhale', duration: 8, instruction: 'Breathe Out' }
                ],
                cycles: 4,
                description: 'Perfect for sleep & relaxation'
            },
            'box': {
                name: 'Box Breathing',
                phases: [
                    { name: 'inhale', duration: 4, instruction: 'Breathe In' },
                    { name: 'inhale-hold', duration: 4, instruction: 'Hold' },
                    { name: 'exhale', duration: 4, instruction: 'Breathe Out' },
                    { name: 'exhale-hold', duration: 4, instruction: 'Hold' }
                ],
                cycles: 5,
                description: 'Great for focus & calm'
            },
            'deep': {
                name: 'Deep Breathing',
                phases: [
                    { name: 'inhale', duration: 5, instruction: 'Deep Breath In' },
                    { name: 'exhale', duration: 5, instruction: 'Slow Breath Out' }
                ],
                cycles: 10,
                description: 'Basic relaxation technique'
            },
            'alternate': {
                name: 'Alternate Nostril',
                phases: [
                    { name: 'right-nostril', duration: 4, instruction: 'Right Nostril' },
                    { name: 'hold', duration: 2, instruction: 'Hold' },
                    { name: 'left-nostril', duration: 4, instruction: 'Left Nostril' },
                    { name: 'hold', duration: 2, instruction: 'Hold' }
                ],
                cycles: 5,
                description: 'Balances energy & focus'
            },
            'stress': {
                name: 'Stress Relief',
                phases: [
                    { name: 'inhale', duration: 2, instruction: 'Quick In' },
                    { name: 'exhale', duration: 4, instruction: 'Long Out' }
                ],
                cycles: 10,
                description: 'Emergency relaxation'
            },
            'custom': {
                name: 'Custom Pattern',
                phases: [],
                cycles: 5,
                description: 'Personalized practice'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateTechniqueDisplay();
        this.renderSessionHistory();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startExercise());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseExercise());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetExercise());

        // Technique selection
        document.querySelectorAll('.technique-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const technique = e.currentTarget.dataset.technique;
                this.selectTechnique(technique);
            });
        });

        // Custom settings
        document.querySelectorAll('#custom-settings input').forEach(input => {
            input.addEventListener('change', () => this.updateCustomTechnique());
        });

        // Audio controls
        document.getElementById('audio-enabled').addEventListener('change', (e) => {
            this.audioEnabled = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('volume').addEventListener('input', (e) => {
            this.volume = parseFloat(e.target.value);
            this.saveSettings();
        });
    }

    selectTechnique(technique) {
        this.currentTechnique = technique;
        this.resetExercise();

        // Update UI
        document.querySelectorAll('.technique-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-technique="${technique}"]`).classList.add('active');

        // Show/hide custom settings
        const customSettings = document.getElementById('custom-settings');
        if (technique === 'custom') {
            customSettings.classList.remove('hidden');
            this.updateCustomTechnique();
        } else {
            customSettings.classList.add('hidden');
        }

        this.updateTechniqueDisplay();
    }

    updateCustomTechnique() {
        const inhale = parseInt(document.getElementById('inhale-time').value) || 4;
        const inhaleHold = parseInt(document.getElementById('inhale-hold-time').value) || 0;
        const exhale = parseInt(document.getElementById('exhale-time').value) || 6;
        const exhaleHold = parseInt(document.getElementById('exhale-hold-time').value) || 0;
        const cycles = parseInt(document.getElementById('cycles').value) || 5;

        const phases = [];
        if (inhale > 0) phases.push({ name: 'inhale', duration: inhale, instruction: 'Breathe In' });
        if (inhaleHold > 0) phases.push({ name: 'inhale-hold', duration: inhaleHold, instruction: 'Hold' });
        if (exhale > 0) phases.push({ name: 'exhale', duration: exhale, instruction: 'Breathe Out' });
        if (exhaleHold > 0) phases.push({ name: 'exhale-hold', duration: exhaleHold, instruction: 'Hold' });

        this.techniques.custom.phases = phases;
        this.techniques.custom.cycles = cycles;
        this.totalCycles = cycles;
    }

    updateTechniqueDisplay() {
        const technique = this.techniques[this.currentTechnique];
        document.getElementById('current-technique').textContent = technique.name;
        this.totalCycles = technique.cycles;
    }

    startExercise() {
        if (this.isActive && !this.isPaused) return;

        this.isActive = true;
        this.isPaused = false;
        this.currentCycle = 0;
        this.cyclesCompleted = 0;

        if (!this.sessionStartTime) {
            this.sessionStartTime = new Date();
            this.startSessionTimer();
        }

        this.updateButtonStates();
        this.startBreathingCycle();
        this.speak('Starting breathing exercise. Get comfortable and follow the circle.');
    }

    pauseExercise() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.clearTimers();
            this.speak('Exercise paused. Take your time.');
        } else {
            this.speak('Resuming exercise.');
            this.startBreathingCycle();
        }

        this.updateButtonStates();
    }

    resetExercise() {
        this.clearTimers();
        this.isActive = false;
        this.isPaused = false;
        this.currentPhase = 'prepare';
        this.currentCycle = 0;
        this.cyclesCompleted = 0;
        this.sessionStartTime = null;

        this.updateUI();
        this.updateButtonStates();
        this.speak('Exercise reset.');
    }

    startBreathingCycle() {
        if (!this.isActive || this.isPaused) return;

        const technique = this.techniques[this.currentTechnique];
        const phases = technique.phases;

        if (this.currentCycle >= this.totalCycles) {
            this.completeSession();
            return;
        }

        // Start the cycle
        let phaseIndex = 0;
        this.runPhase(phases, phaseIndex);
    }

    runPhase(phases, phaseIndex) {
        if (!this.isActive || this.isPaused || phaseIndex >= phases.length) {
            // Move to next cycle
            this.currentCycle++;
            this.cyclesCompleted = this.currentCycle;
            setTimeout(() => this.startBreathingCycle(), 1000);
            return;
        }

        const phase = phases[phaseIndex];
        this.currentPhase = phase.name;

        this.updateUI();
        this.animateBreathing(phase);
        this.speak(phase.instruction);

        // Set timer for this phase
        let timeLeft = phase.duration;
        this.updateTimer(timeLeft);

        this.phaseTimer = setInterval(() => {
            timeLeft--;
            this.updateTimer(timeLeft);
            this.updateProgress(phase, timeLeft);

            if (timeLeft <= 0) {
                clearInterval(this.phaseTimer);
                this.runPhase(phases, phaseIndex + 1);
            }
        }, 1000);
    }

    animateBreathing(phase) {
        const circle = document.querySelector('.breath-circle');
        circle.className = 'breath-circle'; // Reset classes

        if (phase.name.includes('inhale')) {
            circle.classList.add('breathing-inhale');
        } else if (phase.name.includes('exhale')) {
            circle.classList.add('breathing-exhale');
        } else if (phase.name.includes('hold')) {
            // Keep the current scale for hold phases
            if (phase.name === 'inhale-hold') {
                circle.classList.add('breathing-inhale-hold');
            } else if (phase.name === 'exhale-hold') {
                circle.classList.add('breathing-exhale-hold');
            }
        }
    }

    updateUI() {
        const phase = this.getCurrentPhaseInfo();
        document.getElementById('instruction').textContent = phase.instruction;
        document.getElementById('phase-text').textContent = this.formatPhaseName(this.currentPhase);
        document.getElementById('cycles-completed').textContent = this.cyclesCompleted;
    }

    updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        document.getElementById('timer').textContent =
            `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateProgress(phase, timeLeft) {
        const progress = ((phase.duration - timeLeft) / phase.duration) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }

    updateButtonStates() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');

        if (this.isActive && !this.isPaused) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        } else if (this.isPaused) {
            startBtn.disabled = false;
            pauseBtn.disabled = false;
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (!this.isPaused) {
                const elapsed = Math.floor((new Date() - this.sessionStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('session-time').textContent =
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    completeSession() {
        this.clearTimers();
        this.isActive = false;

        // Save session to history
        const session = {
            id: Date.now(),
            technique: this.currentTechnique,
            techniqueName: this.techniques[this.currentTechnique].name,
            cycles: this.cyclesCompleted,
            duration: Math.floor((new Date() - this.sessionStartTime) / 1000),
            date: new Date().toISOString(),
            completed: true
        };

        this.sessionHistory.unshift(session);
        this.saveSessionHistory();
        this.renderSessionHistory();

        this.updateButtonStates();
        this.speak('Great job! Session completed. Take a moment to relax.');

        // Reset for next session
        setTimeout(() => {
            this.resetExercise();
        }, 3000);
    }

    clearTimers() {
        if (this.phaseTimer) {
            clearInterval(this.phaseTimer);
            this.phaseTimer = null;
        }
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    getCurrentPhaseInfo() {
        const technique = this.techniques[this.currentTechnique];
        const phase = technique.phases.find(p => p.name === this.currentPhase);
        return phase || { instruction: 'Get ready...' };
    }

    formatPhaseName(phaseName) {
        const names = {
            'prepare': 'Prepare',
            'inhale': 'Inhale',
            'inhale-hold': 'Hold',
            'exhale': 'Exhale',
            'exhale-hold': 'Hold',
            'right-nostril': 'Right Nostril',
            'left-nostril': 'Left Nostril',
            'hold': 'Hold'
        };
        return names[phaseName] || 'Unknown';
    }

    speak(text) {
        if (!this.audioEnabled) return;

        // Cancel any ongoing speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.volume = this.volume;
            utterance.rate = 0.8;
            utterance.pitch = 1;

            window.speechSynthesis.speak(utterance);
        }
    }

    renderSessionHistory() {
        const historyList = document.getElementById('session-history');

        if (this.sessionHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <p>No sessions completed yet</p>
                    <small>Complete your first breathing exercise to see history</small>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.sessionHistory.slice(0, 10).map(session => `
            <div class="history-item">
                <div class="history-info">
                    <h4>${session.techniqueName}</h4>
                    <div class="history-meta">
                        ${new Date(session.date).toLocaleDateString()} •
                        ${Math.floor(session.duration / 60)}:${(session.duration % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <div class="history-stats">
                    <span class="stat">Cycles: <span class="value">${session.cycles}</span></span>
                    <span class="stat">Duration: <span class="value">${Math.floor(session.duration / 60)}m</span></span>
                </div>
            </div>
        `).join('');
    }

    saveSessionHistory() {
        localStorage.setItem('breathingSessions', JSON.stringify(this.sessionHistory.slice(0, 50))); // Keep last 50 sessions
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('breathingSettings') || '{}');
        this.audioEnabled = settings.audioEnabled || false;
        this.volume = settings.volume || 0.7;

        document.getElementById('audio-enabled').checked = this.audioEnabled;
        document.getElementById('volume').value = this.volume;
    }

    saveSettings() {
        const settings = {
            audioEnabled: this.audioEnabled,
            volume: this.volume
        };
        localStorage.setItem('breathingSettings', JSON.stringify(settings));
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.speak('Welcome to breathing exercises. Choose a technique and start your mindfulness journey.');
        }, 1000);
    }

    showMessage(message, type = 'info') {
        // Create a temporary message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        `;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Add CSS for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Initialize the breathing exercise when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BreathingExercise();
});