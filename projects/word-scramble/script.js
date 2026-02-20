document.addEventListener('DOMContentLoaded', function() {
    // Game Elements
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const correctElement = document.getElementById('correct');
    const scrambledWordElement = document.getElementById('scrambledWord');
    const answerInput = document.getElementById('answerInput');
    const submitBtn = document.getElementById('submitBtn');
    const lettersGrid = document.getElementById('lettersGrid');
    const wordHint = document.getElementById('wordHint');
    const letterHints = document.getElementById('letterHints');
    const historyList = document.getElementById('historyList');
    const gameStatus = document.getElementById('gameStatus');
    const timerWarning = document.getElementById('timerWarning');
    const gameOverModal = document.getElementById('gameOverModal');
    
    // Buttons
    const startBtn = document.getElementById('startBtn');
    const hintBtn = document.getElementById('hintBtn');
    const skipBtn = document.getElementById('skipBtn');
    const resetBtn = document.getElementById('resetBtn');
    const shuffleTilesBtn = document.getElementById('shuffleTilesBtn');
    const resetTilesBtn = document.getElementById('resetTilesBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const closeModal = document.getElementById('closeModal');
    const soundToggle = document.getElementById('soundToggle');
    const musicToggle = document.getElementById('musicToggle');
    
    // Difficulty & Category
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // Stats Elements
    const wordLengthElement = document.getElementById('wordLength');
    const wordNumberElement = document.getElementById('wordNumber');
    const remainingAttemptsElement = document.getElementById('remainingAttempts');
    const accuracyRateElement = document.getElementById('accuracyRate');
    const avgTimeElement = document.getElementById('avgTime');
    const currentStreakElement = document.getElementById('currentStreak');
    const accuracyBar = document.getElementById('accuracyBar');
    const speedBar = document.getElementById('speedBar');
    const streakBar = document.getElementById('streakBar');
    
    // Final Score Elements
    const finalScoreElement = document.getElementById('finalScore');
    const finalSolvedElement = document.getElementById('finalSolved');
    const finalTimeElement = document.getElementById('finalTime');
    const performanceMessage = document.getElementById('performanceMessage');
    
    // Audio
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const clickSound = document.getElementById('clickSound');
    
    // Game State
    let gameState = {
        isPlaying: false,
        timeLeft: 60,
        score: 0,
        correctCount: 0,
        currentWord: null,
        scrambledLetters: [],
        selectedLetters: [],
        usedHints: 0,
        usedSkips: 0,
        totalHints: 3,
        totalSkips: 5,
        currentDifficulty: 'easy',
        currentCategory: 'general',
        attemptsLeft: 3,
        wordsSolved: 0,
        totalWords: 10,
        startTime: null,
        wordStartTime: null,
        gameHistory: [],
        currentStreak: 0,
        soundEnabled: true,
        musicEnabled: false
    };
    
    // Word Database (categorized by difficulty)
    const wordDatabase = {
        easy: {
            general: ['APPLE', 'HOUSE', 'TABLE', 'CHAIR', 'WATER', 'BRAIN', 'CLOUD', 'PLANT', 'PHONE', 'MUSIC'],
            technology: ['EMAIL', 'CODE', 'DATA', 'CHIP', 'DISK', 'WIFI', 'BLOG', 'APP', 'WEB', 'KEY'],
            nature: ['LEAF', 'TREE', 'ROSE', 'BIRD', 'FISH', 'MOON', 'STAR', 'RAIN', 'SNOW', 'WIND'],
            science: ['ATOM', 'CELL', 'GENE', 'WAVE', 'HEAT', 'ACID', 'BASE', 'MASS', 'TIME', 'SPACE']
        },
        medium: {
            general: ['PENCIL', 'WINDOW', 'GARDEN', 'TRAVEL', 'SILVER', 'FRIEND', 'PURPLE', 'ORANGE', 'POCKET', 'BOTTLE'],
            technology: ['SERVER', 'DOMAIN', 'BINARY', 'MEMORY', 'SCREEN', 'CURSOR', 'DIGITAL', 'ONLINE', 'DEVICE', 'SENSOR'],
            nature: ['FOREST', 'RIVER', 'FLOWER', 'ANIMAL', 'WINTER', 'SUMMER', 'OCEAN', 'DESERT', 'VALLEY', 'ISLAND'],
            science: ['ENERGY', 'MATTER', 'FORCE', 'THEORY', 'METHOD', 'PROTON', 'NEUTRON', 'ELECTRON', 'SYSTEM', 'MODEL']
        },
        hard: {
            general: ['ELEPHANT', 'UNIVERSE', 'NOTEBOOK', 'CALENDAR', 'FURNITURE', 'BREAKFAST', 'MOUNTAIN', 'TELEVISION', 'ECONOMY', 'KNOWLEDGE'],
            technology: ['ALGORITHM', 'DATABASE', 'PROTOCOL', 'INTERFACE', 'PLATFORM', 'SECURITY', 'NETWORK', 'SOFTWARE', 'HARDWARE', 'FIREWALL'],
            nature: ['VOLCANO', 'HURRICANE', 'ECOSYSTEM', 'PHOTOSYNTHESIS', 'BIODIVERSITY', 'CLIMATE', 'PRECIPITATION', 'ENVIRONMENT', 'GEOGRAPHY', 'ATMOSPHERE'],
            science: ['GRAVITY', 'QUANTUM', 'EVOLUTION', 'CHEMISTRY', 'BIOLOGY', 'PHYSICS', 'EQUATION', 'HYPOTHESIS', 'EXPERIMENT', 'VARIABLE']
        }
    };
    
    // Initialize Game
    initGame();
    
    // Event Listeners
    startBtn.addEventListener('click', startGame);
    hintBtn.addEventListener('click', useHint);
    skipBtn.addEventListener('click', skipWord);
    resetBtn.addEventListener('click', resetGame);
    submitBtn.addEventListener('click', checkAnswer);
    shuffleTilesBtn.addEventListener('click', shuffleLetterTiles);
    resetTilesBtn.addEventListener('click', resetLetterTiles);
    clearHistoryBtn.addEventListener('click', clearHistory);
    playAgainBtn.addEventListener('click', playAgain);
    closeModal.addEventListener('click', () => gameOverModal.style.display = 'none');
    
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            checkAnswer();
        }
    });
    
    answerInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '');
    });
    
    soundToggle.addEventListener('click', toggleSound);
    musicToggle.addEventListener('click', toggleMusic);
    
    // Difficulty selection
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            gameState.currentDifficulty = this.dataset.level;
            playSound(clickSound);
        });
    });
    
    // Category selection
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            gameState.currentCategory = this.dataset.category;
            playSound(clickSound);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === gameOverModal) {
            gameOverModal.style.display = 'none';
        }
    });
    
    // Functions
    function initGame() {
        updateUI();
        loadFromLocalStorage();
        generateLetterTiles([]);
        updateHistoryDisplay();
        updateProgressBars();
    }
    
    function startGame() {
        if (gameState.isPlaying) return;
        
        playSound(clickSound);
        
        // Reset game state
        gameState.isPlaying = true;
        gameState.timeLeft = 60;
        gameState.score = 0;
        gameState.correctCount = 0;
        gameState.usedHints = 0;
        gameState.usedSkips = 0;
        gameState.wordsSolved = 0;
        gameState.currentStreak = 0;
        gameState.startTime = Date.now();
        gameState.gameHistory = [];
        
        // Update UI
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-pause"></i><span class="btn-text">GAME RUNNING</span>';
        answerInput.disabled = false;
        submitBtn.disabled = false;
        hintBtn.disabled = false;
        skipBtn.disabled = false;
        
        gameStatus.innerHTML = '<span class="status-dot"></span> PLAYING';
        gameStatus.style.color = 'var(--success-color)';
        
        // Start timer
        startTimer();
        
        // Load first word
        loadNewWord();
    }
    
    function startTimer() {
        const timer = setInterval(() => {
            if (!gameState.isPlaying) {
                clearInterval(timer);
                return;
            }
            
            gameState.timeLeft--;
            timerElement.textContent = gameState.timeLeft;
            
            // Update timer warning
            if (gameState.timeLeft <= 10) {
                timerWarning.classList.add('visible');
                timerWarning.innerHTML = `<i class="fas fa-clock"></i><span>${gameState.timeLeft}s LEFT!</span>`;
                
                if (gameState.timeLeft <= 5) {
                    timerWarning.style.color = 'var(--error-color)';
                }
            }
            
            // Check if time's up
            if (gameState.timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }
    
    function loadNewWord() {
        if (gameState.wordsSolved >= gameState.totalWords) {
            endGame();
            return;
        }
        
        // Get random word from database
        const categoryWords = wordDatabase[gameState.currentDifficulty][gameState.currentCategory];
        const randomIndex = Math.floor(Math.random() * categoryWords.length);
        gameState.currentWord = categoryWords[randomIndex];
        
        // Scramble the word
        gameState.scrambledLetters = scrambleWord(gameState.currentWord);
        gameState.selectedLetters = [];
        gameState.attemptsLeft = 3;
        gameState.wordStartTime = Date.now();
        
        // Update UI
        updateScrambledWord();
        generateLetterTiles(gameState.scrambledLetters);
        clearAnswerInput();
        updateWordInfo();
        updateAttempts();
        clearHints();
        
        // Update word number
        wordNumberElement.textContent = gameState.wordsSolved + 1;
    }
    
    function scrambleWord(word) {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters;
    }
    
    function updateScrambledWord() {
        scrambledWordElement.innerHTML = '';
        
        if (!gameState.currentWord) {
            scrambledWordElement.innerHTML = '<span class="letter-placeholder">Click START to begin</span>';
            return;
        }
        
        gameState.scrambledLetters.forEach((letter, index) => {
            const span = document.createElement('span');
            span.className = 'scrambled-letter';
            span.textContent = letter;
            span.style.animationDelay = `${index * 0.1}s`;
            scrambledWordElement.appendChild(span);
        });
    }
    
    function generateLetterTiles(letters) {
        lettersGrid.innerHTML = '';
        
        if (letters.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'letters-empty';
            placeholder.textContent = 'Letters will appear here';
            lettersGrid.appendChild(placeholder);
            return;
        }
        
        letters.forEach((letter, index) => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = letter;
            tile.dataset.index = index;
            tile.dataset.letter = letter;
            
            tile.addEventListener('click', function() {
                if (!gameState.isPlaying) return;
                
                playSound(clickSound);
                
                const letterIndex = parseInt(this.dataset.index);
                
                // Toggle selection
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    gameState.selectedLetters = gameState.selectedLetters.filter(l => l.index !== letterIndex);
                } else {
                    this.classList.add('selected');
                    gameState.selectedLetters.push({
                        index: letterIndex,
                        letter: this.dataset.letter
                    });
                }
                
                // Update answer input
                updateAnswerFromTiles();
            });
            
            lettersGrid.appendChild(tile);
        });
    }
    
    function updateAnswerFromTiles() {
        const answer = gameState.selectedLetters.map(l => l.letter).join('');
        answerInput.value = answer;
    }
    
    function shuffleLetterTiles() {
        if (!gameState.isPlaying || !gameState.currentWord) return;
        
        playSound(clickSound);
        
        // Shuffle the scrambled letters
        gameState.scrambledLetters = scrambleWord(gameState.scrambledLetters.join(''));
        
        // Regenerate tiles
        generateLetterTiles(gameState.scrambledLetters);
        
        // Clear selected letters
        gameState.selectedLetters = [];
        answerInput.value = '';
        
        // Update scrambled word display
        updateScrambledWord();
    }
    
    function resetLetterTiles() {
        if (!gameState.isPlaying || !gameState.currentWord) return;
        
        playSound(clickSound);
        
        // Reset to original scrambled order (if we stored it)
        generateLetterTiles(gameState.scrambledLetters);
        
        // Clear selected letters
        gameState.selectedLetters = [];
        answerInput.value = '';
    }
    
    function clearAnswerInput() {
        answerInput.value = '';
        answerInput.focus();
    }
    
    function useHint() {
        if (!gameState.isPlaying || !gameState.currentWord || gameState.usedHints >= gameState.totalHints) return;
        
        playSound(clickSound);
        
        gameState.usedHints++;
        const hintsLeft = gameState.totalHints - gameState.usedHints;
        
        // Update hint button
        const hintCounter = hintBtn.querySelector('.hint-counter');
        hintCounter.textContent = `(${hintsLeft})`;
        
        if (hintsLeft === 0) {
            hintBtn.disabled = true;
        }
        
        // Provide a hint
        provideHint();
    }
    
    function provideHint() {
        // Show word category hint
        const categoryNames = {
            general: 'General Vocabulary',
            technology: 'Technology Related',
            nature: 'Nature & Environment',
            science: 'Science & Research'
        };
        
        // Show first and last letter
        const firstLetter = gameState.currentWord[0];
        const lastLetter = gameState.currentWord[gameState.currentWord.length - 1];
        
        wordHint.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>Category: ${categoryNames[gameState.currentCategory]} | First letter: ${firstLetter} | Last letter: ${lastLetter}</span>
        `;
        
        // Show letter positions hint
        updateLetterHints();
    }
    
    function updateLetterHints() {
        letterHints.innerHTML = '';
        
        // Show some correct letter positions
        const wordLength = gameState.currentWord.length;
        const lettersToShow = Math.min(3, Math.ceil(wordLength / 3));
        
        for (let i = 0; i < lettersToShow; i++) {
            const position = Math.floor(Math.random() * wordLength);
            const letter = gameState.currentWord[position];
            
            const hintSpan = document.createElement('span');
            hintSpan.className = 'letter-hint';
            hintSpan.textContent = `Position ${position + 1}: ${letter}`;
            letterHints.appendChild(hintSpan);
        }
    }
    
    function clearHints() {
        wordHint.innerHTML = '<i class="fas fa-info-circle"></i><span>Hint will appear here</span>';
        letterHints.innerHTML = '';
    }
    
    function skipWord() {
        if (!gameState.isPlaying || !gameState.currentWord || gameState.usedSkips >= gameState.totalSkips) return;
        
        playSound(clickSound);
        
        gameState.usedSkips++;
        const skipsLeft = gameState.totalSkips - gameState.usedSkips;
        
        // Update skip button
        const skipCounter = skipBtn.querySelector('.skip-counter');
        skipCounter.textContent = `(${skipsLeft})`;
        
        if (skipsLeft === 0) {
            skipBtn.disabled = true;
        }
        
        // Add to history as skipped
        addToHistory(gameState.currentWord, false, true);
        
        // Load next word
        loadNewWord();
    }
    
    function checkAnswer() {
        if (!gameState.isPlaying || !gameState.currentWord) return;
        
        const userAnswer = answerInput.value.trim().toUpperCase();
        
        if (userAnswer.length !== gameState.currentWord.length) {
            showMessage('Word length must match!', 'error');
            return;
        }
        
        if (userAnswer === gameState.currentWord) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }
    }
    
    function handleCorrectAnswer() {
        playSound(correctSound);
        
        // Calculate score
        const timeTaken = Math.floor((Date.now() - gameState.wordStartTime) / 1000);
        const baseScore = gameState.currentWord.length * 10;
        const timeBonus = Math.max(0, 30 - timeTaken) * 2;
        const streakBonus = gameState.currentStreak * 5;
        const totalScore = baseScore + timeBonus + streakBonus;
        
        // Update game state
        gameState.score += totalScore;
        gameState.correctCount++;
        gameState.wordsSolved++;
        gameState.currentStreak++;
        
        // Update UI
        scoreElement.textContent = gameState.score;
        correctElement.textContent = gameState.correctCount;
        
        // Visual feedback
        scrambledWordElement.style.color = 'var(--success-color)';
        setTimeout(() => {
            scrambledWordElement.style.color = 'var(--primary-color)';
        }, 500);
        
        // Add to history
        addToHistory(gameState.currentWord, true, false, timeTaken);
        
        // Check if game is complete
        if (gameState.wordsSolved >= gameState.totalWords) {
            endGame();
        } else {
            // Load next word after delay
            setTimeout(() => {
                loadNewWord();
            }, 1000);
        }
    }
    
    function handleWrongAnswer() {
        playSound(wrongSound);
        
        gameState.attemptsLeft--;
        updateAttempts();
        
        // Visual feedback
        scrambledWordElement.style.color = 'var(--error-color)';
        setTimeout(() => {
            scrambledWordElement.style.color = 'var(--primary-color)';
        }, 500);
        
        if (gameState.attemptsLeft <= 0) {
            // No attempts left for this word
            showMessage(`Out of attempts! The word was: ${gameState.currentWord}`, 'error');
            
            // Add to history as failed
            addToHistory(gameState.currentWord, false, false);
            
            // Load next word after delay
            setTimeout(() => {
                loadNewWord();
            }, 2000);
        } else {
            showMessage('Incorrect! Try again.', 'error');
        }
    }
    
    function updateAttempts() {
        remainingAttemptsElement.textContent = gameState.attemptsLeft;
    }
    
    function updateWordInfo() {
        wordLengthElement.textContent = gameState.currentWord.length;
    }
    
    function addToHistory(word, isCorrect, isSkipped, timeTaken = null) {
        const historyItem = {
            word: word,
            correct: isCorrect,
            skipped: isSkipped,
            time: timeTaken,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        gameState.gameHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (gameState.gameHistory.length > 10) {
            gameState.gameHistory.pop();
        }
        
        updateHistoryDisplay();
        updateProgressBars();
        saveToLocalStorage();
    }
    
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        if (gameState.gameHistory.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'history-empty';
            emptyState.innerHTML = `
                <div class="empty-icon">📝</div>
                <div class="empty-text">No words solved yet</div>
                <div class="empty-sub">Start playing to see your progress</div>
            `;
            historyList.appendChild(emptyState);
            return;
        }
        
        gameState.gameHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const statusClass = item.correct ? 'correct' : item.skipped ? 'skipped' : 'incorrect';
            const statusText = item.correct ? 'SOLVED' : item.skipped ? 'SKIPPED' : 'FAILED';
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-word">${item.word}</div>
                    <div class="history-details">
                        ${item.timestamp} ${item.time ? `• ${item.time}s` : ''}
                    </div>
                </div>
                <div class="history-status ${statusClass}">${statusText}</div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    function updateProgressBars() {
        // Calculate accuracy
        const totalAttempts = gameState.gameHistory.length;
        const correctAttempts = gameState.gameHistory.filter(item => item.correct).length;
        const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
        
        accuracyRateElement.textContent = `${accuracy}%`;
        accuracyBar.style.width = `${accuracy}%`;
        
        // Calculate average time
        const solvedWords = gameState.gameHistory.filter(item => item.correct && item.time);
        const avgTime = solvedWords.length > 0 
            ? Math.round(solvedWords.reduce((sum, item) => sum + item.time, 0) / solvedWords.length)
            : 0;
        
        avgTimeElement.textContent = `${avgTime}s`;
        speedBar.style.width = `${Math.min(100, avgTime * 10)}%`;
        
        // Update streak
        currentStreakElement.textContent = gameState.currentStreak;
        streakBar.style.width = `${Math.min(100, gameState.currentStreak * 20)}%`;
    }
    
    function updateUI() {
        timerElement.textContent = gameState.timeLeft;
        scoreElement.textContent = gameState.score;
        correctElement.textContent = gameState.correctCount;
        
        // Update hint and skip counters
        const hintCounter = hintBtn.querySelector('.hint-counter');
        const skipCounter = skipBtn.querySelector('.skip-counter');
        
        hintCounter.textContent = `(${gameState.totalHints - gameState.usedHints})`;
        skipCounter.textContent = `(${gameState.totalSkips - gameState.usedSkips})`;
    }
    
    function endGame() {
        gameState.isPlaying = false;
        
        // Stop timer
        clearInterval(timer);
        
        // Update UI
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i><span class="btn-text">PLAY AGAIN</span>';
        answerInput.disabled = true;
        submitBtn.disabled = true;
        hintBtn.disabled = true;
        skipBtn.disabled = true;
        
        gameStatus.innerHTML = '<span class="status-dot"></span> GAME OVER';
        gameStatus.style.color = 'var(--error-color)';
        timerWarning.classList.remove('visible');
        
        // Calculate final stats
        const accuracy = gameState.gameHistory.length > 0 
            ? Math.round((gameState.correctCount / gameState.gameHistory.length) * 100)
            : 0;
        
        // Update high score
        const highScore = localStorage.getItem('wordScrambleHighScore') || 0;
        if (gameState.score > highScore) {
            localStorage.setItem('wordScrambleHighScore', gameState.score);
            document.getElementById('highScore').textContent = gameState.score;
        }
        
        // Update final score modal
        finalScoreElement.textContent = gameState.score;
        finalSolvedElement.textContent = `${gameState.correctCount}/${gameState.totalWords}`;
        finalTimeElement.textContent = `${60 - gameState.timeLeft}s`;
        
        // Performance message
        let message = '';
        if (gameState.correctCount === gameState.totalWords) {
            message = 'Perfect score! You are a word scramble master!';
        } else if (gameState.correctCount >= gameState.totalWords * 0.7) {
            message = 'Excellent performance! Well done!';
        } else if (gameState.correctCount >= gameState.totalWords * 0.5) {
            message = 'Good job! Keep practicing to improve!';
        } else {
            message = 'Nice effort! Try again to beat your score!';
        }
        performanceMessage.textContent = message;
        
        // Show game over modal
        setTimeout(() => {
            gameOverModal.style.display = 'flex';
        }, 1000);
    }
    
    function resetGame() {
        playSound(clickSound);
        
        if (confirm('Are you sure you want to reset the current game?')) {
            gameState.isPlaying = false;
            gameState.timeLeft = 60;
            gameState.score = 0;
            gameState.correctCount = 0;
            gameState.currentWord = null;
            gameState.scrambledLetters = [];
            gameState.selectedLetters = [];
            gameState.usedHints = 0;
            gameState.usedSkips = 0;
            gameState.attemptsLeft = 3;
            gameState.wordsSolved = 0;
            gameState.currentStreak = 0;
            
            // Reset UI
            updateUI();
            scrambledWordElement.innerHTML = '<span class="letter-placeholder">Click START to begin</span>';
            generateLetterTiles([]);
            clearAnswerInput();
            clearHints();
            updateAttempts();
            
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i><span class="btn-text">START GAME</span>';
            answerInput.disabled = true;
            submitBtn.disabled = true;
            hintBtn.disabled = false;
            skipBtn.disabled = false;
            
            gameStatus.innerHTML = '<span class="status-dot"></span> READY';
            gameStatus.style.color = 'var(--success-color)';
            timerWarning.classList.remove('visible');
            
            wordNumberElement.textContent = '1';
            wordLengthElement.textContent = '0';
        }
    }
    
    function playAgain() {
        gameOverModal.style.display = 'none';
        resetGame();
        setTimeout(startGame, 300);
    }
    
    function clearHistory() {
        playSound(clickSound);
        
        if (confirm('Clear all game history?')) {
            gameState.gameHistory = [];
            updateHistoryDisplay();
            updateProgressBars();
            saveToLocalStorage();
        }
    }
    
    function toggleSound() {
        gameState.soundEnabled = !gameState.soundEnabled;
        soundToggle.innerHTML = gameState.soundEnabled 
            ? '<i class="fas fa-volume-up"></i> SOUND ON'
            : '<i class="fas fa-volume-mute"></i> SOUND OFF';
        playSound(clickSound);
    }
    
    function toggleMusic() {
        gameState.musicEnabled = !gameState.musicEnabled;
        musicToggle.innerHTML = gameState.musicEnabled 
            ? '<i class="fas fa-music"></i> MUSIC ON'
            : '<i class="fas fa-music"></i> MUSIC OFF';
    }
    
    function playSound(audio) {
        if (gameState.soundEnabled && audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    }
    
    function showMessage(text, type) {
        // Create message element
        const message = document.createElement('div');
        message.className = `game-message ${type}`;
        message.textContent = text;
        
        // Style based on type
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.padding = '12px 24px';
        message.style.borderRadius = 'var(--radius-md)';
        message.style.fontWeight = '600';
        message.style.zIndex = '1000';
        message.style.boxShadow = 'var(--shadow-md)';
        message.style.animation = 'messageSlideIn 0.3s ease';
        
        if (type === 'error') {
            message.style.backgroundColor = 'var(--error-color)';
            message.style.color = 'white';
        } else {
            message.style.backgroundColor = 'var(--success-color)';
            message.style.color = 'white';
        }
        
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            message.style.animation = 'messageSlideOut 0.3s ease';
            setTimeout(() => {
                if (message.parentNode) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 3000);
        
        // Add CSS for animations if not already present
        if (!document.querySelector('#message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
            style.textContent = `
                @keyframes messageSlideIn {
                    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes messageSlideOut {
                    from { transform: translateX(-50%) translateY(0); opacity: 1; }
                    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function saveToLocalStorage() {
        const saveData = {
            highScore: Math.max(gameState.score, localStorage.getItem('wordScrambleHighScore') || 0),
            totalWordsPlayed: (parseInt(localStorage.getItem('totalWordsPlayed') || 0)) + gameState.gameHistory.length,
            gameHistory: gameState.gameHistory.slice(0, 50) // Keep last 50 games
        };
        
        localStorage.setItem('wordScrambleData', JSON.stringify(saveData));
    }
    
    function loadFromLocalStorage() {
        const saved = localStorage.getItem('wordScrambleData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                document.getElementById('highScore').textContent = data.highScore || 0;
                document.getElementById('totalWords').textContent = data.totalWordsPlayed || 0;
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
});