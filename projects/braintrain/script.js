        // Brain Training App
        class BrainTrainingApp {
            constructor() {
                // Game state
                this.currentGame = 'math';
                this.gameStates = {
                    math: {
                        active: false,
                        score: 0,
                        timeLeft: 60,
                        timer: null,
                        highScore: parseInt(localStorage.getItem('mathHighScore')) || 0,
                        problem: null
                    },
                    memory: {
                        active: false,
                        moves: 0,
                        matches: 0,
                        totalPairs: 8,
                        flippedCards: [],
                        matchedCards: [],
                        canFlip: true,
                        bestScore: localStorage.getItem('memoryBestScore') || '-',
                        cards: []
                    },
                    reaction: {
                        active: false,
                        startTime: null,
                        reactionTimes: JSON.parse(localStorage.getItem('reactionTimes')) || [],
                        currentReaction: null,
                        waiting: false
                    }
                };

                this.init();
            }

            init() {
                this.setupEventListeners();
                this.updateHighScores();
                this.setupMemoryCards();
            }

            setupEventListeners() {
                // Tab navigation
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const tab = e.currentTarget.dataset.tab;
                        this.switchGame(tab);
                    });
                });

                // Math game
                document.getElementById('mathStartBtn').addEventListener('click', () => this.startMathGame());
                document.getElementById('mathResetBtn').addEventListener('click', () => this.resetMathGame());

                // Memory game
                document.getElementById('memoryStartBtn').addEventListener('click', () => this.startMemoryGame());
                document.getElementById('memoryResetBtn').addEventListener('click', () => this.showAllCards());

                // Reaction game
                document.getElementById('reactionStartBtn').addEventListener('click', () => this.startReactionTest());
                document.getElementById('reactionResetBtn').addEventListener('click', () => this.clearReactionHistory());
                document.getElementById('reactionTarget').addEventListener('click', () => this.handleReactionClick());

                // Footer buttons
                document.getElementById('showResults').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showResults();
                });

                document.getElementById('resetAll').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.resetAllData();
                });

                document.getElementById('helpBtn').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showHelp();
                });
            }

            // Game Switching
            switchGame(game) {
                // Update active tab
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.tab === game) {
                        btn.classList.add('active');
                    }
                });

                // Update active game container
                document.querySelectorAll('.game-container').forEach(container => {
                    container.classList.remove('active');
                });
                document.getElementById(`${game}Game`).classList.add('active');

                this.currentGame = game;

                // Stop any running games
                this.stopMathGame();
                this.hideAllCards();
            }

            // ===== MATH GAME =====
            startMathGame() {
                const state = this.gameStates.math;
                
                if (state.active) return;
                
                state.active = true;
                state.score = 0;
                state.timeLeft = 60;
                
                // Update UI
                document.getElementById('mathStartBtn').disabled = true;
                document.getElementById('mathScore').textContent = '0';
                document.getElementById('mathTime').textContent = '60';
                document.getElementById('mathTimerBar').style.width = '100%';
                
                // Start timer
                this.startMathTimer();
                
                // Generate first problem
                this.generateMathProblem();
            }

            startMathTimer() {
                const state = this.gameStates.math;
                const timerBar = document.getElementById('mathTimerBar');
                
                state.timer = setInterval(() => {
                    state.timeLeft--;
                    
                    // Update display
                    document.getElementById('mathTime').textContent = state.timeLeft;
                    timerBar.style.width = `${(state.timeLeft / 60) * 100}%`;
                    
                    // Time's up
                    if (state.timeLeft <= 0) {
                        this.endMathGame();
                    }
                }, 1000);
            }

            generateMathProblem() {
                const state = this.gameStates.math;
                
                // Generate random numbers and operation
                const operations = ['+', '-', '×', '÷'];
                const operation = operations[Math.floor(Math.random() * operations.length)];
                
                let num1, num2, correctAnswer;
                
                switch(operation) {
                    case '+':
                        num1 = Math.floor(Math.random() * 50) + 1;
                        num2 = Math.floor(Math.random() * 50) + 1;
                        correctAnswer = num1 + num2;
                        break;
                    case '-':
                        num1 = Math.floor(Math.random() * 50) + 1;
                        num2 = Math.floor(Math.random() * num1) + 1;
                        correctAnswer = num1 - num2;
                        break;
                    case '×':
                        num1 = Math.floor(Math.random() * 12) + 1;
                        num2 = Math.floor(Math.random() * 12) + 1;
                        correctAnswer = num1 * num2;
                        break;
                    case '÷':
                        num2 = Math.floor(Math.random() * 10) + 2;
                        correctAnswer = Math.floor(Math.random() * 10) + 2;
                        num1 = num2 * correctAnswer;
                        break;
                }
                
                // Generate wrong answers
                const answers = new Set([correctAnswer]);
                while (answers.size < 4) {
                    let wrongAnswer;
                    const offset = Math.floor(Math.random() * 10) + 1;
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    wrongAnswer = correctAnswer + (offset * direction);
                    
                    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
                        answers.add(wrongAnswer);
                    }
                }
                
                // Convert to array and shuffle
                const answerArray = Array.from(answers);
                this.shuffleArray(answerArray);
                
                // Store problem
                state.problem = {
                    num1,
                    num2,
                    operation,
                    correctAnswer,
                    answers: answerArray
                };
                
                // Update UI
                const problemDisplay = document.getElementById('mathProblem');
                let displayOperation = operation;
                if (operation === '×') displayOperation = '×';
                if (operation === '÷') displayOperation = '÷';
                
                problemDisplay.textContent = `${num1} ${displayOperation} ${num2} = ?`;
                
                // Update answer buttons
                const optionsContainer = document.getElementById('mathOptions');
                optionsContainer.innerHTML = '';
                
                answerArray.forEach((answer, index) => {
                    const button = document.createElement('div');
                    button.className = 'math-option';
                    button.textContent = answer;
                    button.dataset.answer = answer;
                    
                    button.addEventListener('click', () => this.checkMathAnswer(answer));
                    
                    optionsContainer.appendChild(button);
                });
            }

            checkMathAnswer(answer) {
                const state = this.gameStates.math;
                if (!state.active || !state.problem) return;
                
                const isCorrect = answer === state.problem.correctAnswer;
                const buttons = document.querySelectorAll('.math-option');
                
                // Show correct/incorrect feedback
                buttons.forEach(button => {
                    const buttonAnswer = parseInt(button.dataset.answer);
                    
                    if (buttonAnswer === state.problem.correctAnswer) {
                        button.classList.add('correct');
                    } else if (buttonAnswer === answer && !isCorrect) {
                        button.classList.add('incorrect');
                    }
                    
                    button.style.pointerEvents = 'none';
                });
                
                // Update score if correct
                if (isCorrect) {
                    state.score++;
                    document.getElementById('mathScore').textContent = state.score;
                }
                
                // Generate next problem after delay
                setTimeout(() => {
                    if (state.active) {
                        this.generateMathProblem();
                    }
                }, 1000);
            }

            endMathGame() {
                const state = this.gameStates.math;
                
                // Stop timer
                clearInterval(state.timer);
                state.active = false;
                
                // Update high score
                if (state.score > state.highScore) {
                    state.highScore = state.score;
                    localStorage.setItem('mathHighScore', state.highScore);
                    document.getElementById('mathHighScore').textContent = state.highScore;
                }
                
                // Enable start button
                document.getElementById('mathStartBtn').disabled = false;
                
                // Show results
                alert(`Time's up! Your score: ${state.score}\nHigh Score: ${state.highScore}`);
            }

            resetMathGame() {
                const state = this.gameStates.math;
                
                // Stop timer
                clearInterval(state.timer);
                state.active = false;
                
                // Reset state
                state.score = 0;
                state.timeLeft = 60;
                
                // Update UI
                document.getElementById('mathStartBtn').disabled = false;
                document.getElementById('mathScore').textContent = '0';
                document.getElementById('mathTime').textContent = '60';
                document.getElementById('mathTimerBar').style.width = '100%';
                document.getElementById('mathProblem').textContent = 'Ready?';
                
                // Clear options
                document.getElementById('mathOptions').innerHTML = '';
            }

            stopMathGame() {
                const state = this.gameStates.math;
                if (state.timer) {
                    clearInterval(state.timer);
                    state.timer = null;
                }
                state.active = false;
                document.getElementById('mathStartBtn').disabled = false;
            }

            // ===== MEMORY GAME =====
            setupMemoryCards() {
                const state = this.gameStates.memory;
                const symbols = ['★', '♥', '♦', '♣', '♠', '●', '▲', '■'];
                const cards = [...symbols, ...symbols]; // Create pairs
                this.shuffleArray(cards);
                
                state.cards = cards.map((symbol, index) => ({
                    id: index,
                    symbol: symbol,
                    flipped: false,
                    matched: false
                }));
                
                this.renderMemoryCards();
            }

            renderMemoryCards() {
                const grid = document.getElementById('memoryGrid');
                grid.innerHTML = '';
                
                this.gameStates.memory.cards.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'memory-card';
                    cardElement.dataset.id = card.id;
                    
                    cardElement.innerHTML = `
                        <div class="front">${card.symbol}</div>
                        <div class="back"></div>
                    `;
                    
                    cardElement.addEventListener('click', () => this.flipMemoryCard(card.id));
                    
                    if (card.flipped || card.matched) {
                        cardElement.classList.add('flipped');
                    }
                    
                    if (card.matched) {
                        cardElement.classList.add('matched');
                    }
                    
                    grid.appendChild(cardElement);
                });
            }

            startMemoryGame() {
                const state = this.gameStates.memory;
                
                // Reset game state
                state.moves = 0;
                state.matches = 0;
                state.flippedCards = [];
                state.matchedCards = [];
                state.canFlip = true;
                
                // Reset cards
                state.cards.forEach(card => {
                    card.flipped = false;
                    card.matched = false;
                });
                
                // Update UI
                document.getElementById('memoryMoves').textContent = '0';
                document.getElementById('memoryMatches').textContent = '0/8';
                document.getElementById('memoryStartBtn').disabled = true;
                
                // Shuffle cards
                this.shuffleArray(state.cards);
                this.renderMemoryCards();
                
                // Show all cards briefly
                this.showAllCards();
                setTimeout(() => this.hideAllCards(), 2000);
            }

            flipMemoryCard(cardId) {
                const state = this.gameStates.memory;
                
                if (!state.canFlip || state.flippedCards.length >= 2) return;
                
                const card = state.cards.find(c => c.id === cardId);
                if (!card || card.flipped || card.matched) return;
                
                // Flip card
                card.flipped = true;
                state.flippedCards.push(cardId);
                
                // Update UI
                const cardElement = document.querySelector(`.memory-card[data-id="${cardId}"]`);
                cardElement.classList.add('flipped');
                
                // Check for match
                if (state.flippedCards.length === 2) {
                    state.moves++;
                    document.getElementById('memoryMoves').textContent = state.moves;
                    
                    state.canFlip = false;
                    
                    setTimeout(() => this.checkMemoryMatch(), 1000);
                }
            }

            checkMemoryMatch() {
                const state = this.gameStates.memory;
                
                if (state.flippedCards.length !== 2) return;
                
                const [id1, id2] = state.flippedCards;
                const card1 = state.cards.find(c => c.id === id1);
                const card2 = state.cards.find(c => c.id === id2);
                
                if (card1.symbol === card2.symbol) {
                    // Match found
                    card1.matched = true;
                    card2.matched = true;
                    state.matches++;
                    state.matchedCards.push(id1, id2);
                    
                    // Update UI
                    document.getElementById('memoryMatches').textContent = `${state.matches}/8`;
                    
                    // Check for game completion
                    if (state.matches === state.totalPairs) {
                        this.endMemoryGame();
                    }
                } else {
                    // No match, flip cards back
                    card1.flipped = false;
                    card2.flipped = false;
                    
                    const cardElement1 = document.querySelector(`.memory-card[data-id="${id1}"]`);
                    const cardElement2 = document.querySelector(`.memory-card[data-id="${id2}"]`);
                    
                    cardElement1.classList.remove('flipped');
                    cardElement2.classList.remove('flipped');
                }
                
                // Reset for next turn
                state.flippedCards = [];
                state.canFlip = true;
            }

            showAllCards() {
                const state = this.gameStates.memory;
                
                state.cards.forEach(card => {
                    card.flipped = true;
                });
                
                this.renderMemoryCards();
                
                setTimeout(() => {
                    if (!state.active) return;
                    state.cards.forEach(card => {
                        if (!card.matched) {
                            card.flipped = false;
                        }
                    });
                    this.renderMemoryCards();
                }, 2000);
            }

            hideAllCards() {
                const state = this.gameStates.memory;
                
                state.cards.forEach(card => {
                    if (!card.matched) {
                        card.flipped = false;
                    }
                });
                
                this.renderMemoryCards();
                document.getElementById('memoryStartBtn').disabled = false;
            }

            endMemoryGame() {
                const state = this.gameStates.memory;
                
                // Update best score
                const currentBest = state.bestScore === '-' ? Infinity : parseInt(state.bestScore);
                
                if (state.moves < currentBest) {
                    state.bestScore = state.moves.toString();
                    localStorage.setItem('memoryBestScore', state.bestScore);
                    document.getElementById('memoryBestScore').textContent = state.bestScore;
                }
                
                // Show completion message
                setTimeout(() => {
                    alert(`🎉 Congratulations!\nYou completed the memory game in ${state.moves} moves!\nBest Score: ${state.bestScore}`);
                    document.getElementById('memoryStartBtn').disabled = false;
                }, 500);
            }

            // ===== REACTION GAME =====
            startReactionTest() {
                const state = this.gameStates.reaction;
                
                if (state.waiting) return;
                
                // Reset current reaction
                state.currentReaction = null;
                state.startTime = null;
                
                // Update UI
                const target = document.getElementById('reactionTarget');
                target.classList.add('waiting');
                target.textContent = 'Wait for green...';
                document.getElementById('reactionResult').textContent = '';
                
                // Start waiting period (1-4 seconds)
                const waitTime = Math.random() * 3000 + 1000;
                
                state.waiting = true;
                state.startTime = Date.now() + waitTime;
                
                // Change to green after wait
                setTimeout(() => {
                    if (!state.waiting) return;
                    
                    target.classList.remove('waiting');
                    target.textContent = 'CLICK NOW!';
                    state.startTime = Date.now();
                }, waitTime);
                
                // Timeout if no click
                setTimeout(() => {
                    if (state.waiting && state.startTime < Date.now()) {
                        target.classList.add('waiting');
                        target.textContent = 'Too slow!';
                        state.waiting = false;
                        
                        setTimeout(() => {
                            target.textContent = 'Wait for green...';
                        }, 1000);
                    }
                }, 5000);
            }

            handleReactionClick() {
                const state = this.gameStates.reaction;
                
                if (!state.waiting || !state.startTime || state.startTime > Date.now()) {
                    // Clicked too early
                    if (state.waiting) {
                        const target = document.getElementById('reactionTarget');
                        target.classList.add('waiting');
                        target.textContent = 'Too early!';
                        state.waiting = false;
                        
                        setTimeout(() => {
                            target.textContent = 'Wait for green...';
                        }, 1000);
                    }
                    return;
                }
                
                // Calculate reaction time
                const reactionTime = Date.now() - state.startTime;
                state.currentReaction = reactionTime;
                state.reactionTimes.push(reactionTime);
                
                // Store in localStorage
                localStorage.setItem('reactionTimes', JSON.stringify(state.reactionTimes));
                
                // Update UI
                const result = document.getElementById('reactionResult');
                result.textContent = `${reactionTime} ms`;
                
                if (reactionTime < 200) {
                    result.className = 'reaction-result';
                    result.textContent += ' ⚡ Super Fast!';
                } else if (reactionTime < 300) {
                    result.className = 'reaction-result';
                    result.textContent += ' 🏎️ Fast!';
                } else if (reactionTime < 500) {
                    result.className = 'reaction-result';
                    result.textContent += ' 👍 Good';
                } else {
                    result.className = 'reaction-result slow';
                    result.textContent += ' 🐢 Slow';
                }
                
                // Update stats
                this.updateReactionStats();
                
                // Add to history
                this.addReactionToHistory(reactionTime);
                
                // Reset for next test
                state.waiting = false;
                const target = document.getElementById('reactionTarget');
                target.classList.add('waiting');
                
                setTimeout(() => {
                    target.textContent = 'Wait for green...';
                }, 1000);
            }

            updateReactionStats() {
                const state = this.gameStates.reaction;
                
                if (state.reactionTimes.length === 0) {
                    document.getElementById('reactionCurrent').textContent = '-';
                    document.getElementById('reactionAverage').textContent = '-';
                    document.getElementById('reactionBest').textContent = '-';
                    return;
                }
                
                // Current
                if (state.currentReaction) {
                    document.getElementById('reactionCurrent').textContent = `${state.currentReaction}ms`;
                }
                
                // Average
                const average = Math.round(
                    state.reactionTimes.reduce((a, b) => a + b, 0) / state.reactionTimes.length
                );
                document.getElementById('reactionAverage').textContent = `${average}ms`;
                
                // Best
                const best = Math.min(...state.reactionTimes);
                document.getElementById('reactionBest').textContent = `${best}ms`;
            }

            addReactionToHistory(time) {
                const history = document.getElementById('reactionHistory');
                const timeElement = document.createElement('div');
                
                timeElement.className = 'reaction-time';
                timeElement.textContent = `${time}ms`;
                
                if (time < 250) {
                    timeElement.className += ' fast';
                } else if (time > 450) {
                    timeElement.className += ' slow';
                }
                
                // Add to beginning
                history.insertBefore(timeElement, history.firstChild);
                
                // Limit history to 10 items
                while (history.children.length > 10) {
                    history.removeChild(history.lastChild);
                }
            }

            clearReactionHistory() {
                const state = this.gameStates.reaction;
                
                state.reactionTimes = [];
                state.currentReaction = null;
                localStorage.removeItem('reactionTimes');
                
                // Update UI
                document.getElementById('reactionHistory').innerHTML = '';
                this.updateReactionStats();
                document.getElementById('reactionResult').textContent = '';
                
                const target = document.getElementById('reactionTarget');
                target.classList.add('waiting');
                target.textContent = 'Wait for green...';
            }

            // ===== UTILITY FUNCTIONS =====
            shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            updateHighScores() {
                // Math high score
                document.getElementById('mathHighScore').textContent = this.gameStates.math.highScore;
                
                // Memory best score
                document.getElementById('memoryBestScore').textContent = this.gameStates.memory.bestScore;
                
                // Reaction stats
                this.updateReactionStats();
                
                // Load reaction history
                const reactionTimes = JSON.parse(localStorage.getItem('reactionTimes')) || [];
                reactionTimes.forEach(time => this.addReactionToHistory(time));
            }

            showResults() {
                const mathScore = this.gameStates.math.highScore;
                const memoryScore = this.gameStates.memory.bestScore;
                const reactionTimes = this.gameStates.reaction.reactionTimes;
                
                const avgReaction = reactionTimes.length > 0 
                    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
                    : 0;
                const bestReaction = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;
                
                const resultsHTML = `
                    <div class="results-screen">
                        <h2 class="results-title">
                            <i class="fas fa-chart-bar"></i>
                            Your Statistics
                        </h2>
                        
                        <div class="results-stats">
                            <div class="result-item">
                                <div class="result-icon">
                                    <i class="fas fa-calculator"></i>
                                </div>
                                <div class="result-label">Math High Score</div>
                                <div class="result-value">${mathScore}</div>
                            </div>
                            
                            <div class="result-item">
                                <div class="result-icon">
                                    <i class="fas fa-memory"></i>
                                </div>
                                <div class="result-label">Memory Best Moves</div>
                                <div class="result-value">${memoryScore}</div>
                            </div>
                            
                            <div class="result-item">
                                <div class="result-icon">
                                    <i class="fas fa-bolt"></i>
                                </div>
                                <div class="result-label">Avg Reaction Time</div>
                                <div class="result-value">${avgReaction || '-'}ms</div>
                            </div>
                        </div>
                        
                        <div class="performance-rating">
                            ${this.getPerformanceRating(mathScore, memoryScore, avgReaction)}
                        </div>
                    </div>
                `;
                
                // Replace main content with results
                const mainContent = document.querySelector('.main-content');
                mainContent.innerHTML = resultsHTML;
                
                // Add back button
                const backButton = document.createElement('button');
                backButton.className = 'btn btn-primary';
                backButton.style.marginTop = '30px';
                backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Games';
                backButton.onclick = () => location.reload();
                
                mainContent.querySelector('.results-screen').appendChild(backButton);
            }

            getPerformanceRating(mathScore, memoryScore, avgReaction) {
                let rating = '';
                
                if (mathScore > 30 && memoryScore !== '-' && parseInt(memoryScore) < 20 && avgReaction < 300) {
                    rating = '🏆 Elite Brain Power!';
                } else if (mathScore > 20 && avgReaction < 400) {
                    rating = '⭐ Excellent Performance';
                } else if (mathScore > 10) {
                    rating = '👍 Good Performance';
                } else {
                    rating = '💪 Keep Practicing!';
                }
                
                return rating;
            }

            resetAllData() {
                if (confirm('Are you sure you want to clear all game data? This cannot be undone.')) {
                    // Clear localStorage
                    localStorage.removeItem('mathHighScore');
                    localStorage.removeItem('memoryBestScore');
                    localStorage.removeItem('reactionTimes');
                    
                    // Reset game states
                    this.gameStates.math.highScore = 0;
                    this.gameStates.memory.bestScore = '-';
                    this.gameStates.reaction.reactionTimes = [];
                    
                    // Update UI
                    this.updateHighScores();
                    alert('All game data has been cleared!');
                }
            }

            showHelp() {
                const helpText = `
                    🧠 BRAIN TRAINING GYM - HELP 🧠
                    
                    1. MATH SPEED TEST:
                       • Solve math problems in 60 seconds
                       • Choose the correct answer from 4 options
                       • Score 1 point for each correct answer
                       
                    2. MEMORY TEST:
                       • Memorize card positions
                       • Find matching pairs
                       • Try to complete with fewest moves
                       
                    3. REACTION TIME:
                       • Click when circle turns green
                       • Don't click too early!
                       • Try to beat your best time
                       
                    TIPS:
                    • Practice daily for best results
                    • Take breaks between sessions
                    • Challenge yourself with harder levels
                    
                    Your scores are saved automatically!
                `;
                
                alert(helpText);
            }
        }

        // Initialize the app
        const brainTrainingApp = new BrainTrainingApp();

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Number keys for math game
            if (e.key >= '1' && e.key <= '4' && brainTrainingApp.currentGame === 'math') {
                const buttons = document.querySelectorAll('.math-option');
                const index = parseInt(e.key) - 1;
                if (buttons[index]) {
                    buttons[index].click();
                }
            }
            
            // Space to start/restart current game
            if (e.code === 'Space') {
                e.preventDefault();
                const currentGame = brainTrainingApp.currentGame;
                
                if (currentGame === 'math') {
                    document.getElementById('mathStartBtn').click();
                } else if (currentGame === 'memory') {
                    document.getElementById('memoryStartBtn').click();
                } else if (currentGame === 'reaction') {
                    document.getElementById('reactionStartBtn').click();
                }
            }
        });

        // Add visual feedback on load
        document.addEventListener('DOMContentLoaded', () => {
            // Animate header
            const header = document.querySelector('.header');
            header.style.animation = 'fadeIn 1s ease';
            
            // Pulse brain icon
            const brainIcon = document.querySelector('.fa-brain');
            setInterval(() => {
                brainIcon.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    brainIcon.style.transform = 'scale(1)';
                }, 500);
            }, 2000);
        });