        // Game variables
        let playerHealth = 100;
        let computerHealth = 100;
        let playerScore = 0;
        let computerScore = 0;
        let problemsSolved = 0;
        let playerStreak = 0;
        let correctAnswers = 0;
        let totalProblems = 0;
        let currentProblem = null;
        let currentDifficulty = 'easy';
        let timeRemaining = 30;
        let timer = null;
        
        // DOM Elements
        const playerHealthBar = document.getElementById('player-health-bar');
        const computerHealthBar = document.getElementById('computer-health-bar');
        const playerScoreElement = document.getElementById('player-score');
        const computerScoreElement = document.getElementById('computer-score');
        const mathProblemElement = document.getElementById('math-problem');
        const answerInput = document.getElementById('answer-input');
        const submitBtn = document.getElementById('submit-btn');
        const nextBtn = document.getElementById('next-btn');
        const resetBtn = document.getElementById('reset-btn');
        const messageElement = document.getElementById('message');
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        const problemsSolvedElement = document.getElementById('problems-solved');
        const playerStreakElement = document.getElementById('player-streak');
        const playerAccuracyElement = document.getElementById('player-accuracy');
        const timeRemainingElement = document.getElementById('time-remaining');
        
        // Initialize game
        function initGame() {
            playerHealth = 100;
            computerHealth = 100;
            playerScore = 0;
            computerScore = 0;
            problemsSolved = 0;
            playerStreak = 0;
            correctAnswers = 0;
            totalProblems = 0;
            timeRemaining = 30;
            
            updateUI();
            generateProblem();
            startTimer();
            
            messageElement.textContent = "Game started! Solve the problem to attack the computer.";
            messageElement.className = "message neutral-message";
        }
        
        // Generate a math problem based on difficulty
        function generateProblem() {
            let num1, num2, operator, answer;
            
            if (currentDifficulty === 'easy') {
                // Addition or subtraction
                operator = Math.random() > 0.5 ? '+' : '-';
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                
                // Ensure no negative results for subtraction
                if (operator === '-' && num1 < num2) {
                    [num1, num2] = [num2, num1];
                }
                
                answer = operator === '+' ? num1 + num2 : num1 - num2;
            } 
            else if (currentDifficulty === 'medium') {
                // Multiplication
                operator = '×';
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
            } 
            else {
                // Hard: mixed operations including division
                const operators = ['+', '-', '×', '÷'];
                operator = operators[Math.floor(Math.random() * operators.length)];
                
                if (operator === '÷') {
                    // For division, ensure integer result
                    num2 = Math.floor(Math.random() * 10) + 1;
                    answer = Math.floor(Math.random() * 10) + 1;
                    num1 = num2 * answer;
                } else if (operator === '×') {
                    num1 = Math.floor(Math.random() * 15) + 1;
                    num2 = Math.floor(Math.random() * 15) + 1;
                    answer = num1 * num2;
                } else {
                    num1 = Math.floor(Math.random() * 50) + 1;
                    num2 = Math.floor(Math.random() * 50) + 1;
                    
                    if (operator === '-' && num1 < num2) {
                        [num1, num2] = [num2, num1];
                    }
                    
                    answer = operator === '+' ? num1 + num2 : num1 - num2;
                }
            }
            
            currentProblem = {
                num1: num1,
                num2: num2,
                operator: operator,
                answer: answer
            };
            
            mathProblemElement.textContent = `${num1} ${operator} ${num2} = ?`;
            answerInput.value = '';
            answerInput.focus();
            
            // Reset timer
            timeRemaining = 30;
            timeRemainingElement.textContent = timeRemaining;
        }
        
        // Check the player's answer
        function checkAnswer() {
            if (!currentProblem) return;
            
            const playerAnswer = parseInt(answerInput.value);
            
            if (isNaN(playerAnswer)) {
                messageElement.textContent = "Please enter a valid number!";
                messageElement.className = "message incorrect-message";
                return;
            }
            
            totalProblems++;
            problemsSolved++;
            
            if (playerAnswer === currentProblem.answer) {
                // Correct answer - attack computer
                correctAnswers++;
                playerStreak++;
                computerHealth -= 10;
                playerScore += 10;
                
                messageElement.textContent = `Correct! ${currentProblem.num1} ${currentProblem.operator} ${currentProblem.num2} = ${currentProblem.answer}. You dealt 10 damage to the computer!`;
                messageElement.className = "message correct-message";
                
                // Check if computer is defeated
                if (computerHealth <= 0) {
                    computerHealth = 0;
                    endGame(true);
                    return;
                }
            } else {
                // Incorrect answer - computer heals
                playerStreak = 0;
                computerHealth += 5;
                computerScore += 5;
                
                // Cap computer health at 100
                if (computerHealth > 100) computerHealth = 100;
                
                messageElement.textContent = `Incorrect! The correct answer was ${currentProblem.answer}. The computer healed 5 health.`;
                messageElement.className = "message incorrect-message";
            }
            
            // Computer's turn to attack
            setTimeout(computerTurn, 1000);
            
            updateUI();
            answerInput.value = '';
        }
        
        // Computer's turn to solve a problem and attack
        function computerTurn() {
            // Generate a problem for the computer to "solve"
            let problem;
            if (currentDifficulty === 'easy') {
                const operator = Math.random() > 0.5 ? '+' : '-';
                const num1 = Math.floor(Math.random() * 20) + 1;
                const num2 = Math.floor(Math.random() * 20) + 1;
                problem = `${num1} ${operator} ${num2}`;
            } else if (currentDifficulty === 'medium') {
                const num1 = Math.floor(Math.random() * 12) + 1;
                const num2 = Math.floor(Math.random() * 12) + 1;
                problem = `${num1} × ${num2}`;
            } else {
                const operators = ['+', '-', '×', '÷'];
                const operator = operators[Math.floor(Math.random() * operators.length)];
                const num1 = Math.floor(Math.random() * 50) + 1;
                const num2 = Math.floor(Math.random() * 50) + 1;
                problem = `${num1} ${operator} ${num2}`;
            }
            
            // Computer has a 75% chance to get it right (adjustable)
            const computerCorrect = Math.random() > 0.25;
            
            if (computerCorrect) {
                // Computer attacks player
                playerHealth -= 8;
                computerScore += 8;
                
                messageElement.textContent += ` Computer solved "${problem}" correctly and dealt 8 damage to you!`;
                
                if (playerHealth <= 0) {
                    playerHealth = 0;
                    endGame(false);
                    return;
                }
            } else {
                // Computer fails, player heals slightly
                playerHealth += 3;
                playerScore += 3;
                
                // Cap player health at 100
                if (playerHealth > 100) playerHealth = 100;
                
                messageElement.textContent += ` Computer failed to solve "${problem}" correctly. You healed 3 health.`;
            }
            
            updateUI();
            
            // Generate new problem after a delay
            setTimeout(() => {
                generateProblem();
                messageElement.textContent = "New problem! Solve it to attack the computer.";
                messageElement.className = "message neutral-message";
            }, 2000);
        }
        
        // End the game
        function endGame(playerWon) {
            clearInterval(timer);
            
            if (playerWon) {
                messageElement.textContent = "Congratulations! You defeated the computer!";
                messageElement.className = "message correct-message";
            } else {
                messageElement.textContent = "Game Over! The computer defeated you. Try again!";
                messageElement.className = "message incorrect-message";
            }
            
            // Disable answer submission
            submitBtn.disabled = true;
            nextBtn.disabled = true;
        }
        
        // Update UI elements
        function updateUI() {
            // Update health bars
            playerHealthBar.style.width = `${playerHealth}%`;
            computerHealthBar.style.width = `${computerHealth}%`;
            
            // Update scores
            playerScoreElement.textContent = playerScore;
            computerScoreElement.textContent = computerScore;
            
            // Update stats
            problemsSolvedElement.textContent = problemsSolved;
            playerStreakElement.textContent = playerStreak;
            
            const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0;
            playerAccuracyElement.textContent = `${accuracy}%`;
            
            // Update time remaining
            timeRemainingElement.textContent = timeRemaining;
        }
        
        // Start the timer for each problem
        function startTimer() {
            clearInterval(timer);
            
            timer = setInterval(() => {
                timeRemaining--;
                timeRemainingElement.textContent = timeRemaining;
                
                if (timeRemaining <= 0) {
                    clearInterval(timer);
                    // Time's up - treat as incorrect answer
                    messageElement.textContent = "Time's up! The computer gets to attack.";
                    messageElement.className = "message incorrect-message";
                    
                    // Computer attacks
                    computerTurn();
                }
            }, 1000);
        }
        
        // Event Listeners
        submitBtn.addEventListener('click', () => {
            checkAnswer();
            // Reset timer after answering
            startTimer();
        });
        
        answerInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                checkAnswer();
                startTimer();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            generateProblem();
            messageElement.textContent = "New problem! Solve it to attack the computer.";
            messageElement.className = "message neutral-message";
            startTimer();
        });
        
        resetBtn.addEventListener('click', initGame);
        
        // Difficulty selection
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentDifficulty = button.dataset.difficulty;
                
                messageElement.textContent = `Difficulty set to ${button.textContent}. New game starting!`;
                messageElement.className = "message neutral-message";
                
                initGame();
            });
        });
        
        // Initialize the game on page load
        window.addEventListener('load', initGame);