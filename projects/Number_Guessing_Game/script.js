
        // Game state
        let secretNumber;
        let attempts;
        let maxAttempts = 10;
        let gameOver;
        let previousGuesses;

        // DOM elements
        const guessInput = document.getElementById('guess-input');
        const submitBtn = document.getElementById('submit-btn');
        const resetBtn = document.getElementById('reset-btn');
        const hintBtn = document.getElementById('hint-btn');
        const feedback = document.getElementById('feedback');
        const attemptsDisplay = document.getElementById('attempts');
        const remainingDisplay = document.getElementById('remaining');
        const guessesList = document.getElementById('guesses-list');

        // Initialize game
        function initGame() {
            secretNumber = Math.floor(Math.random() * 100) + 1;
            attempts = 0;
            gameOver = false;
            previousGuesses = [];
            
            // Reset UI
            guessInput.value = '';
            guessInput.disabled = false;
            submitBtn.disabled = false;
            hintBtn.disabled = false;
            feedback.textContent = 'Start by entering a number above!';
            feedback.className = 'feedback feedback-default';
            attemptsDisplay.textContent = attempts;
            remainingDisplay.textContent = maxAttempts - attempts;
            guessesList.innerHTML = '';
            
            // Log secret number for debugging (remove in production)
            console.log(`Secret number: ${secretNumber}`);
        }

        // Process the user's guess
        function processGuess() {
            if (gameOver) return;
            
            const guess = parseInt(guessInput.value);
            
            // Validate input
            if (isNaN(guess) || guess < 1 || guess > 100) {
                feedback.textContent = 'Please enter a valid number between 1 and 100!';
                feedback.className = 'feedback feedback-default';
                return;
            }
            
            // Check if already guessed
            if (previousGuesses.includes(guess)) {
                feedback.textContent = `You've already guessed ${guess}. Try a different number!`;
                feedback.className = 'feedback feedback-default';
                return;
            }
            
            // Increment attempts and update display
            attempts++;
            attemptsDisplay.textContent = attempts;
            remainingDisplay.textContent = maxAttempts - attempts;
            
            // Add to previous guesses list
            previousGuesses.push(guess);
            const guessItem = document.createElement('li');
            guessItem.textContent = guess;
            guessesList.appendChild(guessItem);
            
            // Check guess against secret number
            if (guess === secretNumber) {
                // Correct guess
                gameOver = true;
                feedback.innerHTML = `🎉 <strong>Congratulations!</strong> You found the number ${secretNumber} in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}!`;
                feedback.className = 'feedback feedback-correct';
                guessInput.disabled = true;
                submitBtn.disabled = true;
                hintBtn.disabled = true;
            } else if (guess < secretNumber) {
                // Guess is too low
                feedback.textContent = `Too low! Try a higher number.`;
                feedback.className = 'feedback feedback-low';
                
                // Check if game over
                if (attempts >= maxAttempts) {
                    endGame();
                }
            } else {
                // Guess is too high
                feedback.textContent = `Too high! Try a lower number.`;
                feedback.className = 'feedback feedback-high';
                
                // Check if game over
                if (attempts >= maxAttempts) {
                    endGame();
                }
            }
            
            // Clear input and focus
            guessInput.value = '';
            guessInput.focus();
        }

        // End game when max attempts reached
        function endGame() {
            gameOver = true;
            feedback.innerHTML = `💔 <strong>Game Over!</strong> The secret number was ${secretNumber}. Try again!`;
            feedback.className = 'feedback feedback-default';
            guessInput.disabled = true;
            submitBtn.disabled = true;
            hintBtn.disabled = true;
        }

        // Provide a hint to the user
        function provideHint() {
            if (gameOver) {
                feedback.textContent = 'Start a new game to get a hint!';
                feedback.className = 'feedback feedback-default';
                return;
            }
            
            if (attempts === 0) {
                feedback.textContent = 'Make at least one guess before getting a hint!';
                feedback.className = 'feedback feedback-default';
                return;
            }
            
            let hint;
            const lastGuess = previousGuesses[previousGuesses.length - 1];
            
            if (lastGuess < secretNumber) {
                const difference = secretNumber - lastGuess;
                if (difference > 30) {
                    hint = "You're way too low!";
                } else if (difference > 15) {
                    hint = "You're quite a bit too low!";
                } else if (difference > 5) {
                    hint = "You're just a little too low!";
                } else {
                    hint = "You're very close, just a bit higher!";
                }
            } else {
                const difference = lastGuess - secretNumber;
                if (difference > 30) {
                    hint = "You're way too high!";
                } else if (difference > 15) {
                    hint = "You're quite a bit too high!";
                } else if (difference > 5) {
                    hint = "You're just a little too high!";
                } else {
                    hint = "You're very close, just a bit lower!";
                }
            }
            
            feedback.textContent = `Hint: ${hint}`;
            feedback.className = 'feedback feedback-default';
        }

        // Event listeners
        submitBtn.addEventListener('click', processGuess);
        
        resetBtn.addEventListener('click', initGame);
        
        hintBtn.addEventListener('click', provideHint);
        
        guessInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                processGuess();
            }
        });
        
        // Initialize the game when page loads
        window.addEventListener('DOMContentLoaded', initGame);
    