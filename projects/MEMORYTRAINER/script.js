
        const appState = {
            currentExercise: 'memory-cards',
            score: 0,
            streak: 0,
            exercisesCompleted: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            difficulty: 'easy'
        };

        // DOM Elements
        const exerciseItems = document.querySelectorAll('.exercise-item');
        const exerciseContents = document.querySelectorAll('.exercise-content');
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        // Stats elements
        const scoreElement = document.getElementById('score');
        const streakElement = document.getElementById('streak');
        const exercisesCompletedElement = document.getElementById('exercises-completed');
        const accuracyElement = document.getElementById('accuracy');
        
        // Exercise titles and descriptions
        const exerciseTitle = document.getElementById('current-exercise-title');
        const exerciseDescription = document.getElementById('current-exercise-description');
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            updateStats();
            setupEventListeners();
            initializeMemoryGame();
            initializeNumberSequence();
            initializeVisualMemory();
            initializeWordRecall();
        });
        
        // Setup event listeners
        function setupEventListeners() {
            // Exercise selection
            exerciseItems.forEach(item => {
                item.addEventListener('click', function() {
                    const exercise = this.getAttribute('data-exercise');
                    switchExercise(exercise);
                });
            });
            
            // Difficulty selection
            difficultyButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const difficulty = this.getAttribute('data-difficulty');
                    setDifficulty(difficulty);
                });
            });
        }
        
        // Switch between exercises
        function switchExercise(exercise) {
            // Update active exercise in sidebar
            exerciseItems.forEach(item => {
                if (item.getAttribute('data-exercise') === exercise) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Update active exercise content
            exerciseContents.forEach(content => {
                if (content.id === `${exercise}-exercise`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            // Update exercise title and description
            appState.currentExercise = exercise;
            updateExerciseInfo(exercise);
        }
        
        // Update exercise title and description
        function updateExerciseInfo(exercise) {
            const exerciseInfo = {
                'memory-cards': {
                    title: 'Memory Cards',
                    description: 'Flip cards to find matching pairs. Try to complete the game with as few moves as possible.'
                },
                'number-sequence': {
                    title: 'Number Sequence',
                    description: 'Memorize the sequence of numbers shown, then enter it correctly. Sequences get longer as you progress.'
                },
                'visual-memory': {
                    title: 'Visual Memory',
                    description: 'Memorize the pattern of highlighted squares, then recreate it by clicking on the squares.'
                },
                'word-recall': {
                    title: 'Word Recall',
                    description: 'Memorize the list of words shown, then recall as many as you can. Words are case-insensitive.'
                }
            };
            
            exerciseTitle.textContent = exerciseInfo[exercise].title;
            exerciseDescription.textContent = exerciseInfo[exercise].description;
        }
        
        // Set difficulty level
        function setDifficulty(difficulty) {
            appState.difficulty = difficulty;
            
            // Update active difficulty button
            difficultyButtons.forEach(button => {
                if (button.getAttribute('data-difficulty') === difficulty) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            // Reinitialize current exercise with new difficulty
            switch(appState.currentExercise) {
                case 'memory-cards':
                    initializeMemoryGame();
                    break;
                case 'number-sequence':
                    initializeNumberSequence();
                    break;
                case 'visual-memory':
                    initializeVisualMemory();
                    break;
                case 'word-recall':
                    initializeWordRecall();
                    break;
            }
        }
        
        // Update stats display
        function updateStats() {
            scoreElement.textContent = appState.score;
            streakElement.textContent = appState.streak;
            exercisesCompletedElement.textContent = appState.exercisesCompleted;
            
            const accuracy = appState.totalAttempts > 0 ? 
                Math.round((appState.correctAnswers / appState.totalAttempts) * 100) : 0;
            accuracyElement.textContent = `${accuracy}%`;
        }
        
        // Record a correct answer
        function recordCorrectAnswer(points = 10) {
            appState.score += points;
            appState.streak += 1;
            appState.exercisesCompleted += 1;
            appState.correctAnswers += 1;
            appState.totalAttempts += 1;
            updateStats();
        }
        
        // Record an incorrect answer
        function recordIncorrectAnswer() {
            appState.streak = 0;
            appState.totalAttempts += 1;
            updateStats();
        }

        // Memory Cards Game
        let memoryCards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let totalPairs = 0;
        let memoryMoves = 0;
        let memoryTimerInterval;
        let memorySeconds = 0;
        let memoryGameStarted = false;

        function initializeMemoryGame() {
            // Set up based on difficulty
            const difficultySettings = {
                easy: { pairs: 4, columns: 4 },
                medium: { pairs: 6, columns: 4 },
                hard: { pairs: 8, columns: 4 }
            };
            
            const settings = difficultySettings[appState.difficulty];
            totalPairs = settings.pairs;
            
            // Create card values
            let cardValues = [];
            for (let i = 1; i <= totalPairs; i++) {
                cardValues.push(i);
                cardValues.push(i);
            }
            
            // Shuffle cards
            cardValues = cardValues.sort(() => Math.random() - 0.5);
            
            // Create card elements
            const gameBoard = document.getElementById('memory-game-board');
            gameBoard.innerHTML = '';
            gameBoard.style.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;
            
            memoryCards = [];
            flippedCards = [];
            matchedPairs = 0;
            memoryMoves = 0;
            memorySeconds = 0;
            memoryGameStarted = false;
            
            document.getElementById('memory-timer').textContent = '00:00';
            document.getElementById('memory-result').className = 'result-message';
            
            cardValues.forEach((value, index) => {
                const card = document.createElement('div');
                card.className = 'memory-card';
                card.dataset.value = value;
                card.dataset.index = index;
                
                const cardContent = document.createElement('div');
                cardContent.textContent = '?';
                
                card.appendChild(cardContent);
                card.addEventListener('click', () => flipMemoryCard(card));
                
                gameBoard.appendChild(card);
                memoryCards.push(card);
            });
            
            // Set up game controls
            document.getElementById('start-memory-game').addEventListener('click', startMemoryGame);
            document.getElementById('reset-memory-game').addEventListener('click', initializeMemoryGame);
        }
        
        function startMemoryGame() {
            if (memoryGameStarted) return;
            
            memoryGameStarted = true;
            memorySeconds = 0;
            memoryMoves = 0;
            
            // Start timer
            clearInterval(memoryTimerInterval);
            memoryTimerInterval = setInterval(() => {
                memorySeconds++;
                const minutes = Math.floor(memorySeconds / 60).toString().padStart(2, '0');
                const seconds = (memorySeconds % 60).toString().padStart(2, '0');
                document.getElementById('memory-timer').textContent = `${minutes}:${seconds}`;
            }, 1000);
            
            // Reset all cards to face down
            memoryCards.forEach(card => {
                card.classList.remove('flipped', 'matched');
                card.querySelector('div').textContent = '?';
                card.style.pointerEvents = 'auto';
            });
            
            flippedCards = [];
            matchedPairs = 0;
            
            document.getElementById('memory-result').className = 'result-message';
        }
        
        function flipMemoryCard(card) {
            if (!memoryGameStarted) {
                alert('Click "Start Game" to begin!');
                return;
            }
            
            // If card is already flipped or matched, do nothing
            if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
                return;
            }
            
            // Flip the card
            card.classList.add('flipped');
            card.querySelector('div').textContent = card.dataset.value;
            flippedCards.push(card);
            
            // If two cards are flipped, check for match
            if (flippedCards.length === 2) {
                memoryMoves++;
                
                const card1 = flippedCards[0];
                const card2 = flippedCards[1];
                
                if (card1.dataset.value === card2.dataset.value) {
                    // Match found
                    setTimeout(() => {
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        flippedCards = [];
                        matchedPairs++;
                        
                        // Check if game is complete
                        if (matchedPairs === totalPairs) {
                            finishMemoryGame();
                        }
                    }, 500);
                } else {
                    // No match, flip cards back after delay
                    setTimeout(() => {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        card1.querySelector('div').textContent = '?';
                        card2.querySelector('div').textContent = '?';
                        flippedCards = [];
                    }, 1000);
                }
            }
        }
        
        function finishMemoryGame() {
            clearInterval(memoryTimerInterval);
            memoryGameStarted = false;
            
            // Calculate score based on time and moves
            const timeScore = Math.max(100 - memorySeconds, 10);
            const moveScore = Math.max(150 - (memoryMoves * 5), 10);
            const totalScore = timeScore + moveScore;
            
            // Update result display
            const resultElement = document.getElementById('memory-result');
            resultElement.textContent = `Congratulations! You matched all ${totalPairs} pairs in ${memorySeconds} seconds with ${memoryMoves} moves. Score: +${totalScore}`;
            resultElement.className = 'result-message success';
            
            // Update stats
            recordCorrectAnswer(totalScore);
        }

        // Number Sequence Game
        let currentSequence = '';
        let sequenceLength = 4;
        let sequenceTimerInterval;
        let sequenceSeconds = 0;
        let sequenceGameActive = false;
        let sequenceScore = 0;

        function initializeNumberSequence() {
            const difficultySettings = {
                easy: { length: 4, displayTime: 3000 },
                medium: { length: 6, displayTime: 4000 },
                hard: { length: 8, displayTime: 5000 }
            };
            
            const settings = difficultySettings[appState.difficulty];
            sequenceLength = settings.length;
            
            document.getElementById('sequence-timer').textContent = '00:00';
            document.getElementById('number-sequence-display').textContent = 'Click "Show Sequence" to begin';
            document.getElementById('sequence-input').value = '';
            document.getElementById('sequence-score').textContent = sequenceScore;
            document.getElementById('sequence-result').className = 'result-message';
            
            // Set up event listeners
            document.getElementById('show-sequence').addEventListener('click', showNumberSequence);
            document.getElementById('next-sequence').addEventListener('click', generateNewSequence);
            
            document.getElementById('sequence-input').addEventListener('keyup', function(event) {
                if (event.key === 'Enter' && sequenceGameActive) {
                    checkSequenceAnswer();
                }
            });
            
            generateNewSequence();
        }
        
        function generateNewSequence() {
            // Generate random sequence based on difficulty
            currentSequence = '';
            for (let i = 0; i < sequenceLength; i++) {
                currentSequence += Math.floor(Math.random() * 10);
            }
            
            document.getElementById('number-sequence-display').textContent = 'Click "Show Sequence" to begin';
            document.getElementById('sequence-input').value = '';
            document.getElementById('sequence-result').className = 'result-message';
            sequenceGameActive = false;
            clearInterval(sequenceTimerInterval);
            sequenceSeconds = 0;
            document.getElementById('sequence-timer').textContent = '00:00';
        }
        
        function showNumberSequence() {
            if (sequenceGameActive) return;
            
            sequenceGameActive = true;
            document.getElementById('number-sequence-display').textContent = currentSequence;
            document.getElementById('sequence-input').focus();
            
            // Start timer
            sequenceSeconds = 0;
            clearInterval(sequenceTimerInterval);
            sequenceTimerInterval = setInterval(() => {
                sequenceSeconds++;
                const minutes = Math.floor(sequenceSeconds / 60).toString().padStart(2, '0');
                const seconds = (sequenceSeconds % 60).toString().padStart(2, '0');
                document.getElementById('sequence-timer').textContent = `${minutes}:${seconds}`;
            }, 1000);
            
            // Hide sequence after time based on difficulty
            const displayTimes = {
                easy: 3000,
                medium: 4000,
                hard: 5000
            };
            
            setTimeout(() => {
                if (sequenceGameActive) {
                    document.getElementById('number-sequence-display').textContent = '???';
                }
            }, displayTimes[appState.difficulty]);
        }
        
        function checkSequenceAnswer() {
            if (!sequenceGameActive) return;
            
            clearInterval(sequenceTimerInterval);
            sequenceGameActive = false;
            
            const userInput = document.getElementById('sequence-input').value;
            const resultElement = document.getElementById('sequence-result');
            
            if (userInput === currentSequence) {
                // Calculate score based on time and length
                const timeBonus = Math.max(50 - sequenceSeconds, 10);
                const lengthBonus = sequenceLength * 5;
                const points = timeBonus + lengthBonus;
                
                sequenceScore += points;
                document.getElementById('sequence-score').textContent = sequenceScore;
                
                resultElement.textContent = `Correct! You remembered the sequence. +${points} points`;
                resultElement.className = 'result-message success';
                
                recordCorrectAnswer(points);
                
                // Generate new sequence after delay
                setTimeout(() => {
                    generateNewSequence();
                }, 2000);
            } else {
                resultElement.textContent = `Incorrect. The correct sequence was: ${currentSequence}`;
                resultElement.className = 'result-message error';
                
                recordIncorrectAnswer();
                
                // Generate new sequence after delay
                setTimeout(() => {
                    generateNewSequence();
                }, 3000);
            }
        }

        // Visual Memory Game
        let visualPattern = [];
        let userPattern = [];
        let visualTimerInterval;
        let visualSeconds = 0;
        let visualGameActive = false;
        let visualPatternSize = 9;

        function initializeVisualMemory() {
            const difficultySettings = {
                easy: { size: 9, patternLength: 3 },
                medium: { size: 9, patternLength: 4 },
                hard: { size: 9, patternLength: 5 }
            };
            
            const settings = difficultySettings[appState.difficulty];
            visualPatternSize = settings.size;
            
            document.getElementById('visual-timer').textContent = '00:00';
            document.getElementById('visual-result').className = 'result-message';
            
            // Create pattern display
            const patternDisplay = document.getElementById('visual-pattern-display');
            patternDisplay.innerHTML = '';
            patternDisplay.style.gridTemplateColumns = `repeat(3, 1fr)`;
            
            // Create input grid
            const patternInput = document.getElementById('visual-pattern-input');
            patternInput.innerHTML = '';
            patternInput.style.gridTemplateColumns = `repeat(3, 1fr)`;
            
            userPattern = [];
            visualPattern = generateVisualPattern(settings.patternLength);
            
            // Create display squares (non-interactive)
            for (let i = 0; i < visualPatternSize; i++) {
                const square = document.createElement('div');
                square.className = 'memory-card';
                square.dataset.index = i;
                square.textContent = '';
                
                if (visualPattern.includes(i)) {
                    square.style.backgroundColor = '#f0f4ff';
                }
                
                patternDisplay.appendChild(square);
            }
            
            // Create input squares (interactive)
            for (let i = 0; i < visualPatternSize; i++) {
                const square = document.createElement('div');
                square.className = 'memory-card';
                square.dataset.index = i;
                square.textContent = '';
                
                square.addEventListener('click', () => {
                    if (!visualGameActive) return;
                    
                    square.classList.toggle('flipped');
                    
                    const index = parseInt(square.dataset.index);
                    if (square.classList.contains('flipped')) {
                        if (!userPattern.includes(index)) {
                            userPattern.push(index);
                        }
                    } else {
                        const userIndex = userPattern.indexOf(index);
                        if (userIndex > -1) {
                            userPattern.splice(userIndex, 1);
                        }
                    }
                });
                
                patternInput.appendChild(square);
            }
            
            // Set up event listeners
            document.getElementById('show-visual-pattern').addEventListener('click', showVisualPattern);
            document.getElementById('check-visual-pattern').addEventListener('click', checkVisualPattern);
        }
        
        function generateVisualPattern(length) {
            const pattern = [];
            const availableIndices = [...Array(visualPatternSize).keys()];
            
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * availableIndices.length);
                pattern.push(availableIndices[randomIndex]);
                availableIndices.splice(randomIndex, 1);
            }
            
            return pattern;
        }
        
        function showVisualPattern() {
            if (visualGameActive) return;
            
            visualGameActive = true;
            userPattern = [];
            
            // Reset input squares
            document.querySelectorAll('#visual-pattern-input .memory-card').forEach(square => {
                square.classList.remove('flipped');
            });
            
            // Highlight pattern in display
            const displaySquares = document.querySelectorAll('#visual-pattern-display .memory-card');
            displaySquares.forEach(square => {
                square.style.backgroundColor = '#f0f4ff';
            });
            
            visualPattern.forEach(index => {
                displaySquares[index].style.backgroundColor = var('--primary-light');
            });
            
            // Start timer
            visualSeconds = 0;
            clearInterval(visualTimerInterval);
            visualTimerInterval = setInterval(() => {
                visualSeconds++;
                const minutes = Math.floor(visualSeconds / 60).toString().padStart(2, '0');
                const seconds = (visualSeconds % 60).toString().padStart(2, '0');
                document.getElementById('visual-timer').textContent = `${minutes}:${seconds}`;
            }, 1000);
            
            // Hide pattern after 3 seconds
            setTimeout(() => {
                displaySquares.forEach(square => {
                    square.style.backgroundColor = '#f0f4ff';
                });
            }, 3000);
        }
        
        function checkVisualPattern() {
            if (!visualGameActive) return;
            
            clearInterval(visualTimerInterval);
            visualGameActive = false;
            
            // Sort both patterns for comparison
            const sortedVisualPattern = [...visualPattern].sort((a, b) => a - b);
            const sortedUserPattern = [...userPattern].sort((a, b) => a - b);
            
            const resultElement = document.getElementById('visual-result');
            
            // Check if patterns match
            let isCorrect = sortedVisualPattern.length === sortedUserPattern.length;
            if (isCorrect) {
                for (let i = 0; i < sortedVisualPattern.length; i++) {
                    if (sortedVisualPattern[i] !== sortedUserPattern[i]) {
                        isCorrect = false;
                        break;
                    }
                }
            }
            
            if (isCorrect) {
                const timeBonus = Math.max(50 - visualSeconds, 10);
                const lengthBonus = visualPattern.length * 10;
                const points = timeBonus + lengthBonus;
                
                resultElement.textContent = `Perfect! You remembered the pattern. +${points} points`;
                resultElement.className = 'result-message success';
                
                recordCorrectAnswer(points);
                
                // Generate new pattern after delay
                setTimeout(() => {
                    initializeVisualMemory();
                }, 2000);
            } else {
                resultElement.textContent = `Pattern incorrect. Try again!`;
                resultElement.className = 'result-message error';
                
                recordIncorrectAnswer();
            }
        }

        // Word Recall Game
        let wordList = [];
        let wordTimerInterval;
        let wordSeconds = 0;
        let wordGameActive = false;
        let wordListLength = 5;

        function initializeWordRecall() {
            const difficultySettings = {
                easy: { length: 5, displayTime: 10000 },
                medium: { length: 7, displayTime: 15000 },
                hard: { length: 9, displayTime: 20000 }
            };
            
            const settings = difficultySettings[appState.difficulty];
            wordListLength = settings.length;
            
            document.getElementById('word-timer').textContent = '00:00';
            document.getElementById('word-list-display').textContent = 'Click "Show Words" to begin';
            document.getElementById('word-recall-input').value = '';
            document.getElementById('word-score').textContent = '0';
            document.getElementById('total-words').textContent = wordListLength;
            document.getElementById('word-result').className = 'result-message';
            
            // Generate word list
            wordList = generateWordList(wordListLength);
            
            // Set up event listeners
            document.getElementById('show-word-list').addEventListener('click', showWordList);
            document.getElementById('check-word-recall').addEventListener('click', checkWordRecall);
        }
        
        function generateWordList(length) {
            const wordBank = [
                'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew',
                'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'peach', 'quince', 'raspberry',
                'strawberry', 'tangerine', 'watermelon', 'zucchini', 'carrot', 'broccoli',
                'spinach', 'potato', 'tomato', 'cucumber', 'pepper', 'onion', 'garlic', 'ginger'
            ];
            
            const selectedWords = [];
            const availableWords = [...wordBank];
            
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * availableWords.length);
                selectedWords.push(availableWords[randomIndex]);
                availableWords.splice(randomIndex, 1);
            }
            
            return selectedWords;
        }
        
        function showWordList() {
            if (wordGameActive) return;
            
            wordGameActive = true;
            document.getElementById('word-list-display').textContent = wordList.join(', ');
            document.getElementById('word-recall-input').value = '';
            document.getElementById('word-recall-input').focus();
            
            // Start timer
            wordSeconds = 0;
            clearInterval(wordTimerInterval);
            wordTimerInterval = setInterval(() => {
                wordSeconds++;
                const minutes = Math.floor(wordSeconds / 60).toString().padStart(2, '0');
                const seconds = (wordSeconds % 60).toString().padStart(2, '0');
                document.getElementById('word-timer').textContent = `${minutes}:${seconds}`;
            }, 1000);
            
            // Hide words after time based on difficulty
            const displayTimes = {
                easy: 10000,
                medium: 15000,
                hard: 20000
            };
            
            setTimeout(() => {
                if (wordGameActive) {
                    document.getElementById('word-list-display').textContent = '???';
                }
            }, displayTimes[appState.difficulty]);
        }
        
        function checkWordRecall() {
            if (!wordGameActive) return;
            
            clearInterval(wordTimerInterval);
            wordGameActive = false;
            
            const userInput = document.getElementById('word-recall-input').value;
            const userWords = userInput.toLowerCase().split(',').map(word => word.trim()).filter(word => word.length > 0);
            
            // Find correctly recalled words
            const correctWords = [];
            userWords.forEach(word => {
                if (wordList.includes(word) && !correctWords.includes(word)) {
                    correctWords.push(word);
                }
            });
            
            const score = correctWords.length;
            document.getElementById('word-score').textContent = score;
            
            const resultElement = document.getElementById('word-result');
            
            if (score === wordListLength) {
                const timeBonus = Math.max(100 - wordSeconds, 10);
                const lengthBonus = wordListLength * 5;
                const points = timeBonus + lengthBonus;
                
                resultElement.textContent = `Perfect recall! You remembered all ${wordListLength} words. +${points} points`;
                resultElement.className = 'result-message success';
                
                recordCorrectAnswer(points);
            } else if (score >= wordListLength / 2) {
                const points = score * 10;
                
                resultElement.textContent = `Good job! You remembered ${score} out of ${wordListLength} words. +${points} points`;
                resultElement.className = 'result-message success';
                
                recordCorrectAnswer(points);
            } else {
                resultElement.textContent = `You remembered ${score} out of ${wordListLength} words. The words were: ${wordList.join(', ')}`;
                resultElement.className = 'result-message error';
                
                recordIncorrectAnswer();
            }
            
            // Generate new word list after delay
            setTimeout(() => {
                initializeWordRecall();
            }, 3000);
        }
    