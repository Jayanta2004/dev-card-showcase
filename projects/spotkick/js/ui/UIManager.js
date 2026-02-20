export class UIManager {
    constructor() {
        this.elements = {
            hud: document.getElementById('hud'),
            controls: document.getElementById('controls-overlay'),
            mainMenu: document.getElementById('main-menu'),
            gameOver: document.getElementById('game-over'),
            feedback: document.getElementById('round-feedback'),

            playerScore: document.getElementById('player-score'),
            cpuScore: document.getElementById('cpu-score'),
            playerDots: document.getElementById('player-dots'),
            cpuDots: document.getElementById('cpu-dots'),
            timer: document.getElementById('round-timer'),

            arrow: document.getElementById('direction-arrow'),
            powerFill: document.getElementById('power-fill'),
            instruction: document.getElementById('instruction-text'),

            finalScore: document.getElementById('final-score'),
            endTitle: document.getElementById('end-title'),
            feedbackText: document.getElementById('feedback-text'),

            btnStart: document.getElementById('btn-start'),
            btnRestart: document.getElementById('btn-restart')
        };
    }

    showMenu() {
        this.elements.mainMenu.classList.add('active');
        this.elements.gameOver.classList.add('hidden');
        this.elements.hud.classList.add('hidden');
        this.elements.controls.classList.add('hidden');
    }

    startGame() {
        this.elements.mainMenu.classList.remove('active');
        this.elements.gameOver.classList.remove('active'); // ensure hidden
        this.elements.gameOver.classList.add('hidden');
        this.elements.hud.classList.remove('hidden');
    }

    updateScore(playerScore, cpuScore, round) {
        this.elements.playerScore.textContent = playerScore;
        this.elements.cpuScore.textContent = cpuScore;
        this.elements.timer.textContent = `Rd ${round}`;
    }

    initDots(totalRounds) {
        this.elements.playerDots.innerHTML = '';
        this.elements.cpuDots.innerHTML = '';
        for (let i = 0; i < totalRounds; i++) {
            const d1 = document.createElement('div'); d1.className = 'dot';
            const d2 = document.createElement('div'); d2.className = 'dot';
            this.elements.playerDots.appendChild(d1);
            this.elements.cpuDots.appendChild(d2);
        }
    }

    updateDots(playerHistory, cpuHistory) {
        const pDots = this.elements.playerDots.children;
        const cDots = this.elements.cpuDots.children;

        playerHistory.forEach((res, i) => {
            if (pDots[i]) pDots[i].className = `dot ${res === 'GOAL' ? 'scored' : 'missed'}`;
        });

        cpuHistory.forEach((res, i) => {
            if (cDots[i]) cDots[i].className = `dot ${res === 'GOAL' ? 'scored' : 'missed'}`;
        });
    }

    showControls(show) {
        if (show) this.elements.controls.classList.remove('hidden');
        else this.elements.controls.classList.add('hidden');
    }

    updateAim(value) {
        // Value -1 to 1.
        // Arrow is laid flat with rotateX(60deg). We need to rotate it around Z (which is now 'up' relative to the arrow plane)
        // Actually, if we rotate Z, it will spin flat on the ground.
        const angle = value * 45; // +/- 45 deg
        this.elements.arrow.style.transform = `rotateX(60deg) rotateZ(${angle}deg)`;
    }

    updatePower(value) {
        // Value 0 to 1
        this.elements.powerFill.style.width = `${value * 100}%`;
    }

    setInstruction(text) {
        this.elements.instruction.textContent = text;
        this.elements.instruction.classList.remove('animate-pop');
        void this.elements.instruction.offsetWidth; // trigger reflow
        this.elements.instruction.classList.add('animate-pop');
    }

    showFeedback(text, type) {
        this.elements.feedback.classList.remove('hidden');
        this.elements.feedbackText.textContent = text;
        this.elements.feedbackText.style.color = type === 'good' ? '#2ecc71' : '#e74c3c';
        this.elements.feedback.classList.add('animate-slide-up');

        setTimeout(() => {
            this.elements.feedback.classList.add('hidden');
            this.elements.feedback.classList.remove('animate-slide-up');
        }, 2000);
    }

    showGameOver(pScore, cScore, won) {
        this.elements.gameOver.classList.remove('hidden');
        this.elements.gameOver.classList.add('active');
        this.elements.finalScore.textContent = `${pScore} - ${cScore}`;
        this.elements.endTitle.textContent = won ? "VICTORY" : "DEFEAT";
        this.elements.endTitle.style.color = won ? 'var(--color-primary)' : 'var(--color-secondary)';
    }

    onStart(cb) { this.elements.btnStart.onclick = cb; }
    onRestart(cb) { this.elements.btnRestart.onclick = cb; }
}
