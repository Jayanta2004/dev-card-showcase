
        // Quiz Questions Database
        const quizQuestions = [
            {
                question: "What is the largest planet in our solar system?",
                options: ["Earth", "Mars", "Jupiter", "Saturn"],
                correct: 2,
                hint: "It's named after the king of Roman gods and has a famous red spot."
            },
            {
                question: "How many colors are there in a rainbow?",
                options: ["5", "6", "7", "8"],
                correct: 2,
                hint: "Remember the acronym ROYGBIV!"
            },
            {
                question: "What do bees collect from flowers?",
                options: ["Leaves", "Pollen", "Seeds", "Water"],
                correct: 1,
                hint: "They use it to make honey."
            },
            {
                question: "Which of these animals can fly?",
                options: ["Penguin", "Bat", "Ostrich", "Kangaroo"],
                correct: 1,
                hint: "It's the only mammal that can truly fly."
            },
            {
                question: "What is the boiling point of water in Celsius?",
                options: ["90°C", "100°C", "110°C", "120°C"],
                correct: 1,
                hint: "At sea level, water turns to steam at this temperature."
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Mercury", "Neptune"],
                correct: 1,
                hint: "It's named after the Roman god of war."
            },
            {
                question: "How many legs does a spider have?",
                options: ["6", "8", "10", "12"],
                correct: 1,
                hint: "Twice as many as most insects."
            },
            {
                question: "What is the fastest land animal?",
                options: ["Lion", "Cheetah", "Leopard", "Horse"],
                correct: 1,
                hint: "It can run up to 70 miles per hour!"
            },
            {
                question: "Which of these is a type of cloud?",
                options: ["Cupcake", "Cumulus", "Carrot", "Cactus"],
                correct: 1,
                hint: "It's the fluffy, cotton-like cloud."
            },
            {
                question: "What do caterpillars turn into?",
                options: ["Frogs", "Butterflies", "Birds", "Fish"],
                correct: 1,
                hint: "They go through a transformation called metamorphosis."
            },
            {
                question: "Which is the smallest continent?",
                options: ["Europe", "Australia", "Antarctica", "South America"],
                correct: 1,
                hint: "It's also a country!"
            },
            {
                question: "What gas do plants breathe in?",
                options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
                correct: 1,
                hint: "Humans breathe this gas out."
            },
            {
                question: "How many sides does a triangle have?",
                options: ["2", "3", "4", "5"],
                correct: 1,
                hint: "Think about the prefix 'tri-' which means three."
            },
            {
                question: "What is the hardest natural substance on Earth?",
                options: ["Gold", "Iron", "Diamond", "Platinum"],
                correct: 2,
                hint: "It's often used in jewelry and cutting tools."
            },
            {
                question: "Which season comes after winter?",
                options: ["Summer", "Autumn", "Spring", "Monsoon"],
                correct: 2,
                hint: "Flowers bloom in this season."
            }
        ];

        // Game State
        let gameState = {
            currentQuestionIndex: 0,
            score: 0,
            streak: 0,
            totalQuestions: 10,
            questions: [],
            usedQuestions: new Set(),
            answered: false
        };

        // DOM Elements
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const nextBtn = document.getElementById('next-btn');
        const restartBtn = document.getElementById('restart-btn');
        const hintBtn = document.getElementById('hint-btn');
        const hintBox = document.getElementById('hint-box');
        const hintText = document.getElementById('hint-text');
        const scoreElement = document.getElementById('score');
        const questionCountElement = document.getElementById('question-count');
        const streakElement = document.getElementById('streak');
        const questionNumElement = document.getElementById('question-num');
        const resultModal = document.getElementById('result-modal');
        const finalScoreElement = document.getElementById('final-score');
        const resultMessageElement = document.getElementById('result-message');
        const modalRestartBtn = document.getElementById('modal-restart-btn');

        // Initialize the quiz
        function initQuiz() {
            gameState.currentQuestionIndex = 0;
            gameState.score = 0;
            gameState.streak = 0;
            gameState.usedQuestions.clear();
            gameState.questions = [];
            
            // Select random questions
            while (gameState.questions.length < gameState.totalQuestions) {
                const randomIndex = Math.floor(Math.random() * quizQuestions.length);
                if (!gameState.usedQuestions.has(randomIndex)) {
                    gameState.usedQuestions.add(randomIndex);
                    gameState.questions.push(quizQuestions[randomIndex]);
                }
            }
            
            updateStats();
            loadQuestion();
            hintBox.style.display = 'none';
            nextBtn.disabled = true;
            gameState.answered = false;
        }

        // Load a question
        function loadQuestion() {
            const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
            
            // Update question text
            questionText.textContent = currentQuestion.question;
            questionNumElement.textContent = `Question ${gameState.currentQuestionIndex + 1} of ${gameState.totalQuestions}`;
            
            // Clear previous options
            optionsContainer.innerHTML = '';
            
            // Create option elements
            currentQuestion.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = `option option-${index + 1}`;
                optionElement.innerHTML = `
                    <div class="option-content">
                        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                        ${option}
                    </div>
                `;
                
                optionElement.addEventListener('click', () => selectOption(index));
                optionsContainer.appendChild(optionElement);
            });
            
            // Set hint text
            hintText.textContent = currentQuestion.hint;
            
            // Reset button states
            nextBtn.disabled = true;
            gameState.answered = false;
            
            // Hide hint box
            hintBox.style.display = 'none';
        }

        // Handle option selection
        function selectOption(selectedIndex) {
            if (gameState.answered) return;
            
            gameState.answered = true;
            const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
            const options = document.querySelectorAll('.option');
            
            // Highlight correct and wrong answers
            options.forEach((option, index) => {
                if (index === currentQuestion.correct) {
                    option.classList.add('correct');
                } else if (index === selectedIndex && selectedIndex !== currentQuestion.correct) {
                    option.classList.add('wrong');
                }
                
                // Disable all options after selection
                option.style.pointerEvents = 'none';
            });
            
            // Update score and streak
            if (selectedIndex === currentQuestion.correct) {
                gameState.score += 10;
                gameState.streak++;
                
                // Add celebration effect
                if (gameState.streak >= 3) {
                    createConfetti();
                }
            } else {
                gameState.streak = 0;
            }
            
            updateStats();
            nextBtn.disabled = false;
        }

        // Update stats display
        function updateStats() {
            scoreElement.textContent = gameState.score;
            questionCountElement.textContent = `${gameState.currentQuestionIndex + 1}/${gameState.totalQuestions}`;
            streakElement.textContent = gameState.streak;
            
            // Add streak indicator
            if (gameState.streak >= 3) {
                streakElement.style.color = '#ff9ec0';
            } else {
                streakElement.style.color = '#5c6bc0';
            }
        }

        // Move to next question
        function nextQuestion() {
            gameState.currentQuestionIndex++;
            
            if (gameState.currentQuestionIndex < gameState.totalQuestions) {
                loadQuestion();
            } else {
                showResults();
            }
        }

        // Show hint
        function showHint() {
            hintBox.style.display = hintBox.style.display === 'block' ? 'none' : 'block';
        }

        // Show results
        function showResults() {
            finalScoreElement.textContent = `${gameState.score}/${gameState.totalQuestions * 10}`;
            
            // Set result message based on score
            const percentage = (gameState.score / (gameState.totalQuestions * 10)) * 100;
            let message = '';
            
            if (percentage >= 90) {
                message = "Outstanding! You're a true quiz master! 🏆";
            } else if (percentage >= 70) {
                message = "Great job! You know your stuff! 🌟";
            } else if (percentage >= 50) {
                message = "Good effort! Keep learning and trying! 👍";
            } else {
                message = "Nice try! Practice makes perfect! 🌈";
            }
            
            resultMessageElement.textContent = message;
            resultModal.style.display = 'flex';
            
            // Add celebration for high scores
            if (percentage >= 70) {
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => createConfetti(), i * 50);
                }
            }
        }

        // Create confetti effect
        function createConfetti() {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random position
            confetti.style.left = Math.random() * 100 + 'vw';
            
            // Random color
            const colors = ['#ff9ec0', '#7ec8ff', '#a5de8c', '#ffcc80', '#ba68c8'];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random size
            const size = Math.random() * 10 + 5;
            confetti.style.width = size + 'px';
            confetti.style.height = size * 2 + 'px';
            
            document.body.appendChild(confetti);
            
            // Animation
            const animation = confetti.animate([
                { top: '-20px', transform: 'rotate(0deg)' },
                { top: '100vh', transform: 'rotate(720deg)' }
            ], {
                duration: Math.random() * 2000 + 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            
            // Remove after animation
            animation.onfinish = () => confetti.remove();
        }

        // Event Listeners
        nextBtn.addEventListener('click', nextQuestion);
        restartBtn.addEventListener('click', initQuiz);
        hintBtn.addEventListener('click', showHint);
        modalRestartBtn.addEventListener('click', () => {
            resultModal.style.display = 'none';
            initQuiz();
        });

        // Close modal when clicking outside
        resultModal.addEventListener('click', (e) => {
            if (e.target === resultModal) {
                resultModal.style.display = 'none';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '4' && !gameState.answered) {
                const optionIndex = parseInt(e.key) - 1;
                selectOption(optionIndex);
            } else if (e.key === 'Enter' && nextBtn.disabled === false) {
                nextQuestion();
            } else if (e.key === 'h' || e.key === 'H') {
                showHint();
            } else if (e.key === 'r' || e.key === 'R') {
                initQuiz();
            }
        });

        // Initialize the quiz on page load
        window.onload = initQuiz;
