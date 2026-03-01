
        // Game data
        const gameData = {
            currentScreen: 'setup',
            currentQuestionIndex: 0,
            player1: {
                name: 'Alex',
                predictions: []
            },
            player2: {
                name: 'Sam',
                answers: []
            },
            questions: [
                {
                    text: "If stranded on a deserted island, what would be the one thing they'd bring?",
                    options: ["A survival kit", "A good book", "A music player", "Their pet"]
                },
                {
                    text: "What's their go-to karaoke song?",
                    options: ["Bohemian Rhapsody", "Don't Stop Believin'", "Sweet Caroline", "I Will Survive"]
                },
                {
                    text: "What would they do if they won the lottery?",
                    options: ["Travel the world", "Buy a mansion", "Invest it all", "Donate to charity"]
                },
                {
                    text: "What's their biggest pet peeve?",
                    options: ["Being late", "Loud chewing", "People who don't listen", "Messy spaces"]
                },
                {
                    text: "What superpower would they choose?",
                    options: ["Invisibility", "Flight", "Teleportation", "Time travel"]
                },
                {
                    text: "What's their comfort food?",
                    options: ["Pizza", "Ice cream", "Mac & cheese", "Chocolate"]
                },
                {
                    text: "How would they spend a perfect Sunday?",
                    options: ["Sleeping in", "Outdoor adventure", "Movie marathon", "Brunch with friends"]
                }
            ]
        };

        // Feedback messages based on accuracy
        const feedbackMessages = [
            { min: 0, max: 30, message: "Yikes! You might want to have a few more conversations with your friend! 🤔", emoji: "😬" },
            { min: 31, max: 50, message: "You know your friend... a little. Room for improvement! 🤷", emoji: "🙂" },
            { min: 51, max: 70, message: "Not bad! You're on your way to becoming an empathy expert! 👍", emoji: "😊" },
            { min: 71, max: 85, message: "Great job! You really understand your friend well! 🎉", emoji: "🥳" },
            { min: 86, max: 100, message: "Mind reader alert! You know your friend inside out! 🧠✨", emoji: "🤯" }
        ];

        // DOM elements
        const screens = {
            setup: document.getElementById('setup-screen'),
            prediction: document.getElementById('prediction-screen'),
            answer: document.getElementById('answer-screen'),
            results: document.getElementById('results-screen')
        };

        // Initialize the game
        function initGame() {
            // Set up event listeners
            document.getElementById('start-btn').addEventListener('click', startGame);
            document.getElementById('next-prediction-btn').addEventListener('click', nextPrediction);
            document.getElementById('next-answer-btn').addEventListener('click', nextAnswer);
            document.getElementById('play-again-btn').addEventListener('click', playAgain);
            document.getElementById('new-players-btn').addEventListener('click', newPlayers);
            
            // Update player name inputs to update avatars
            document.getElementById('player1-name').addEventListener('input', updatePlayerNames);
            document.getElementById('player2-name').addEventListener('input', updatePlayerNames);
            
            // Set initial player names
            updatePlayerNames();
        }

        // Update player names and avatars
        function updatePlayerNames() {
            const player1Name = document.getElementById('player1-name').value || 'Player 1';
            const player2Name = document.getElementById('player2-name').value || 'Player 2';
            
            // Update game data
            gameData.player1.name = player1Name;
            gameData.player2.name = player2Name;
            
            // Update avatars with first letter
            document.getElementById('predictor-avatar').textContent = player1Name.charAt(0).toUpperCase();
            document.getElementById('friend-avatar').textContent = player2Name.charAt(0).toUpperCase();
            
            // Update name displays
            document.getElementById('predictor-name').textContent = player1Name;
            document.getElementById('friend-name').textContent = player2Name;
            document.getElementById('actual-friend-name').textContent = player2Name;
            document.getElementById('result-predictor').textContent = player1Name;
            document.getElementById('result-friend').textContent = player2Name;
        }

        // Start the game
        function startGame() {
            // Reset game data
            gameData.currentQuestionIndex = 0;
            gameData.player1.predictions = [];
            gameData.player2.answers = [];
            
            // Update player names from inputs
            updatePlayerNames();
            
            // Switch to prediction screen
            switchScreen('prediction');
            loadPredictionQuestion();
        }

        // Switch between screens
        function switchScreen(screenName) {
            // Hide all screens
            Object.values(screens).forEach(screen => {
                screen.classList.remove('active-screen');
            });
            
            // Show the requested screen
            screens[screenName].classList.add('active-screen');
            gameData.currentScreen = screenName;
        }

        // Load a prediction question
        function loadPredictionQuestion() {
            const question = gameData.questions[gameData.currentQuestionIndex];
            const questionElement = document.getElementById('prediction-question');
            const optionsElement = document.getElementById('prediction-options');
            
            // Update question text
            questionElement.textContent = question.text;
            
            // Clear previous options
            optionsElement.innerHTML = '';
            
            // Add new options
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.textContent = option;
                optionElement.dataset.index = index;
                
                // Check if this option was already selected
                if (gameData.player1.predictions[gameData.currentQuestionIndex] === index) {
                    optionElement.classList.add('selected');
                }
                
                optionElement.addEventListener('click', () => {
                    // Remove selected class from all options
                    document.querySelectorAll('#prediction-options .option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked option
                    optionElement.classList.add('selected');
                    
                    // Store the prediction
                    gameData.player1.predictions[gameData.currentQuestionIndex] = index;
                });
                
                optionsElement.appendChild(optionElement);
            });
            
            // Update progress bar
            const progress = ((gameData.currentQuestionIndex + 1) / gameData.questions.length) * 100;
            document.getElementById('prediction-progress').style.width = `${progress}%`;
        }

        // Move to next prediction question
        function nextPrediction() {
            // Check if a prediction was made for current question
            if (gameData.player1.predictions[gameData.currentQuestionIndex] === undefined) {
                alert("Please select an answer before proceeding!");
                return;
            }
            
            // Move to next question or switch to answer phase
            gameData.currentQuestionIndex++;
            
            if (gameData.currentQuestionIndex < gameData.questions.length) {
                loadPredictionQuestion();
            } else {
                // Reset index for answer phase
                gameData.currentQuestionIndex = 0;
                switchScreen('answer');
                loadAnswerQuestion();
            }
        }

        // Load an answer question
        function loadAnswerQuestion() {
            const question = gameData.questions[gameData.currentQuestionIndex];
            const questionElement = document.getElementById('answer-question');
            const optionsElement = document.getElementById('answer-options');
            
            // Update question text
            questionElement.textContent = question.text;
            
            // Clear previous options
            optionsElement.innerHTML = '';
            
            // Add new options
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.textContent = option;
                optionElement.dataset.index = index;
                
                // Check if this option was already selected
                if (gameData.player2.answers[gameData.currentQuestionIndex] === index) {
                    optionElement.classList.add('selected');
                }
                
                optionElement.addEventListener('click', () => {
                    // Remove selected class from all options
                    document.querySelectorAll('#answer-options .option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked option
                    optionElement.classList.add('selected');
                    
                    // Store the answer
                    gameData.player2.answers[gameData.currentQuestionIndex] = index;
                });
                
                optionsElement.appendChild(optionElement);
            });
            
            // Update progress bar
            const progress = ((gameData.currentQuestionIndex + 1) / gameData.questions.length) * 100;
            document.getElementById('answer-progress').style.width = `${progress}%`;
        }

        // Move to next answer question
        function nextAnswer() {
            // Check if an answer was made for current question
            if (gameData.player2.answers[gameData.currentQuestionIndex] === undefined) {
                alert("Please select an answer before proceeding!");
                return;
            }
            
            // Move to next question or switch to results
            gameData.currentQuestionIndex++;
            
            if (gameData.currentQuestionIndex < gameData.questions.length) {
                loadAnswerQuestion();
            } else {
                calculateResults();
                switchScreen('results');
            }
        }

        // Calculate and display results
        function calculateResults() {
            let correctCount = 0;
            const comparisonContainer = document.getElementById('answer-comparison');
            
            // Clear previous comparison
            comparisonContainer.innerHTML = '';
            
            // Calculate correct predictions
            for (let i = 0; i < gameData.questions.length; i++) {
                const prediction = gameData.player1.predictions[i];
                const answer = gameData.player2.answers[i];
                const isCorrect = prediction === answer;
                
                if (isCorrect) correctCount++;
                
                // Create comparison item
                const comparisonItem = document.createElement('div');
                comparisonItem.className = `comparison-item ${isCorrect ? 'correct' : 'incorrect'}`;
                
                const questionText = gameData.questions[i].text;
                const predictionText = gameData.questions[i].options[prediction];
                const answerText = gameData.questions[i].options[answer];
                
                comparisonItem.innerHTML = `
                    <h4>Question ${i+1}</h4>
                    <p><strong>Prediction:</strong> ${predictionText}</p>
                    <p><strong>Actual Answer:</strong> ${answerText}</p>
                    <p><strong>Result:</strong> ${isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
                `;
                
                comparisonContainer.appendChild(comparisonItem);
            }
            
            // Calculate accuracy percentage
            const accuracy = Math.round((correctCount / gameData.questions.length) * 100);
            
            // Update score display
            document.getElementById('score-percent').textContent = `${accuracy}%`;
            
            // Update feedback message
            const feedback = feedbackMessages.find(f => accuracy >= f.min && accuracy <= f.max);
            document.getElementById('feedback-message').innerHTML = `
                ${feedback.message} ${feedback.emoji}
            `;
        }

        // Play again with same players
        function playAgain() {
            startGame();
        }

        // Start with new players
        function newPlayers() {
            // Reset player names
            document.getElementById('player1-name').value = '';
            document.getElementById('player2-name').value = '';
            
            // Switch to setup screen
            switchScreen('setup');
            updatePlayerNames();
        }

        // Initialize the game when page loads
        window.addEventListener('DOMContentLoaded', initGame);
    