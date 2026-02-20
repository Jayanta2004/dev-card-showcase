// Word Sprint Game Logic

class WordSprint {
    constructor() {
        this.words = [
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
            'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
            'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
            'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
            'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
            'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
            'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
        ];

        this.currentWord = '';
        this.wordQueue = [];
        this.score = 0;
        this.streak = 0;
        this.maxTime = 30;
        this.timeLeft = this.maxTime;
        this.gameActive = false;
        this.startTime = null;
        this.typedChars = 0;

        this.initializeElements();
        this.bindEvents();
        this.generateWordQueue();
        this.updateDisplay();
    }

    initializeElements() {
        this.timerBar = document.getElementById('timerBar');
        this.timeLeftDisplay = document.getElementById('timeLeft');
        this.scoreDisplay = document.getElementById('score');
        this.streakDisplay = document.getElementById('streak');
        this.wpmDisplay = document.getElementById('wpm');
        this.currentWordDisplay = document.getElementById('currentWord');
        this.wordQueueDisplay = document.getElementById('wordQueue');
        this.inputField = document.getElementById('inputField');
        this.inputFeedback = document.getElementById('inputFeedback');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.inputField.addEventListener('input', (e) => this.handleInput(e));
        this.inputField.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    generateWordQueue() {
        this.wordQueue = [];
        for (let i = 0; i < 5; i++) {
            this.wordQueue.push(this.getRandomWord());
        }
    }

    getRandomWord() {
        return this.words[Math.floor(Math.random() * this.words.length)];
    }

    startGame() {
        if (this.gameActive) return;

        this.gameActive = true;
        this.startTime = Date.now();
        this.typedChars = 0;
        this.score = 0;
        this.streak = 0;
        this.timeLeft = this.maxTime;
        this.currentWord = this.wordQueue.shift();
        this.wordQueue.push(this.getRandomWord());

        this.inputField.disabled = false;
        this.inputField.value = '';
        this.inputField.focus();
        this.inputField.className = '';
        this.inputFeedback.textContent = '';

        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Playing...';

        this.updateDisplay();
        this.startTimer();
    }

    resetGame() {
        this.gameActive = false;
        this.timeLeft = this.maxTime;
        this.score = 0;
        this.streak = 0;
        this.currentWord = '';
        this.startTime = null;
        this.typedChars = 0;

        this.inputField.disabled = true;
        this.inputField.value = '';
        this.inputField.className = '';
        this.inputFeedback.textContent = '';

        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Game';

        this.generateWordQueue();
        this.updateDisplay();
        this.stopTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft -= 0.1;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.endGame();
            }
            this.updateTimerDisplay();
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const percentage = (this.timeLeft / this.maxTime) * 100;
        this.timerBar.style.width = `${percentage}%`;

        // Change color based on time left
        if (percentage > 60) {
            this.timerBar.style.background = 'linear-gradient(90deg, #10b981, #f59e0b)';
        } else if (percentage > 30) {
            this.timerBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
        } else {
            this.timerBar.style.background = '#ef4444';
        }

        this.timeLeftDisplay.textContent = Math.ceil(this.timeLeft);
    }

    handleInput(e) {
        if (!this.gameActive) return;

        const input = e.target.value.trim();

        if (input === this.currentWord) {
            this.correctWord();
        } else if (this.currentWord.startsWith(input)) {
            this.inputField.className = '';
            this.inputFeedback.textContent = '';
        } else {
            this.inputField.className = 'incorrect';
            this.inputFeedback.textContent = 'Incorrect! Keep typing...';
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && this.gameActive) {
            e.preventDefault();
            const input = this.inputField.value.trim();
            if (input === this.currentWord) {
                this.correctWord();
            }
        }
    }

    correctWord() {
        // Calculate WPM
        this.typedChars += this.currentWord.length;
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
        const wpm = Math.round((this.typedChars / 5) / timeElapsed);

        // Update score and streak
        this.streak++;
        const basePoints = 10;
        const streakBonus = Math.floor(this.streak / 5) * 5; // Bonus every 5 streak
        const points = basePoints + streakBonus;
        this.score += points;

        // Refill time
        const timeBonus = 2 + Math.floor(this.streak / 10); // Extra time for streaks
        this.timeLeft = Math.min(this.maxTime, this.timeLeft + timeBonus);

        // Next word
        this.currentWord = this.wordQueue.shift();
        this.wordQueue.push(this.getRandomWord());

        // Reset input
        this.inputField.value = '';
        this.inputField.className = 'correct';
        this.inputFeedback.textContent = `Correct! +${points} points${streakBonus > 0 ? ` (+${streakBonus} streak bonus)` : ''}`;

        // Clear feedback after 1 second
        setTimeout(() => {
            this.inputFeedback.textContent = '';
            this.inputField.className = '';
        }, 1000);

        this.updateDisplay();
    }

    endGame() {
        this.gameActive = false;
        this.stopTimer();
        this.inputField.disabled = true;
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Game';
        this.currentWordDisplay.textContent = `Game Over! Final Score: ${this.score}`;
        this.inputFeedback.textContent = `You typed ${this.typedChars} characters with a streak of ${this.streak}!`;
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.streakDisplay.textContent = this.streak;
        this.currentWordDisplay.textContent = this.currentWord || 'Ready?';
        this.wpmDisplay.textContent = this.startTime ? Math.round((this.typedChars / 5) / ((Date.now() - this.startTime) / 1000 / 60)) : 0;

        // Update word queue display
        this.wordQueueDisplay.innerHTML = '';
        this.wordQueue.slice(0, 3).forEach(word => {
            const wordEl = document.createElement('div');
            wordEl.className = 'word';
            wordEl.textContent = word;
            this.wordQueueDisplay.appendChild(wordEl);
        });

        this.updateTimerDisplay();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordSprint();
});