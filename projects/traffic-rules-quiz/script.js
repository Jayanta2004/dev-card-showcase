
        const quizQuestions = [
            {
                question: "What does a solid yellow line on the road indicate?",
                options: [
                    "You may overtake if it's safe to do so",
                    "No overtaking allowed",
                    "Parking is permitted",
                    "Pedestrian crossing ahead"
                ],
                correctAnswer: 1,
                explanation: "A solid yellow line indicates no overtaking. Drivers are not allowed to cross this line to pass other vehicles."
            },
            {
                question: "When approaching a roundabout, who has the right of way?",
                options: [
                    "Vehicles entering the roundabout",
                    "Vehicles already in the roundabout",
                    "The larger vehicle",
                    "The vehicle on the right"
                ],
                correctAnswer: 1,
                explanation: "Vehicles already in the roundabout have the right of way. You must yield to traffic already circulating."
            },
            {
                question: "What should you do when you see a flashing red traffic light?",
                options: [
                    "Slow down and proceed with caution",
                    "Treat it as a stop sign",
                    "Speed up to clear the intersection",
                    "Ignore it if no other vehicles are present"
                ],
                correctAnswer: 1,
                explanation: "A flashing red light should be treated as a stop sign. Come to a complete stop, then proceed when safe."
            },
            {
                question: "What is the minimum safe following distance in good weather conditions?",
                options: [
                    "1 second",
                    "2 seconds",
                    "3 seconds",
                    "4 seconds"
                ],
                correctAnswer: 2,
                explanation: "The 3-second rule is recommended for maintaining a safe following distance in good conditions."
            },
            {
                question: "When are you allowed to use your horn?",
                options: [
                    "To greet friends",
                    "To alert other drivers of danger",
                    "To express frustration in traffic",
                    "To get through traffic faster"
                ],
                correctAnswer: 1,
                explanation: "Horns should only be used to alert other drivers of potential danger, not for expressing frustration."
            },
            {
                question: "What does a green arrow signal mean?",
                options: [
                    "Prepare to stop",
                    "Proceed in the direction of the arrow with caution",
                    "Proceed in the direction of the arrow, you have the right of way",
                    "Speed up to make the turn"
                ],
                correctAnswer: 2,
                explanation: "A green arrow means you have a protected turn in the direction of the arrow. You may proceed with caution."
            },
            {
                question: "When driving in fog, which lights should you use?",
                options: [
                    "High beam headlights",
                    "Parking lights only",
                    "Low beam headlights or fog lights",
                    "No lights needed during daytime"
                ],
                correctAnswer: 2,
                explanation: "Use low beam headlights or fog lights in fog. High beams reflect off the fog and reduce visibility."
            },
            {
                question: "What should you do when an emergency vehicle with sirens on is approaching from behind?",
                options: [
                    "Speed up to get out of the way",
                    "Pull over to the right and stop",
                    "Continue driving at the same speed",
                    "Switch lanes to the left"
                ],
                correctAnswer: 1,
                explanation: "Pull over to the right side of the road and stop to allow emergency vehicles to pass safely."
            },
            {
                question: "What does a broken white line on the road indicate?",
                options: [
                    "No lane changing allowed",
                    "Lane changing is permitted if safe",
                    "Edge of the roadway",
                    "Pedestrian crossing ahead"
                ],
                correctAnswer: 1,
                explanation: "Broken white lines separate lanes of traffic going in the same direction. Lane changes are permitted when safe."
            },
            {
                question: "When parking downhill with a curb, which way should you turn your wheels?",
                options: [
                    "Away from the curb",
                    "Toward the curb",
                    "Straight ahead",
                    "It doesn't matter"
                ],
                correctAnswer: 1,
                explanation: "When parking downhill with a curb, turn your wheels toward the curb. This helps prevent the car from rolling into traffic."
            }
        ];

        // Quiz state variables
        let currentQuestionIndex = 0;
        let userAnswers = new Array(quizQuestions.length).fill(null);
        let score = 0;
        let quizCompleted = false;

        // DOM elements
        const questionTextElement = document.getElementById('question-text');
        const optionsContainerElement = document.getElementById('options-container');
        const currentQuestionElement = document.getElementById('current-question');
        const totalQuestionsElement = document.getElementById('total-questions');
        const currentScoreElement = document.getElementById('current-score');
        const progressBarElement = document.getElementById('progress-bar');
        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');
        const questionSection = document.getElementById('question-section');
        const resultSection = document.getElementById('result-section');
        const finalScoreElement = document.getElementById('final-score');
        const scoreTextElement = document.getElementById('score-text');
        const feedbackMessageElement = document.getElementById('feedback-message');
        const answersReviewElement = document.getElementById('answers-review');
        const restartButton = document.getElementById('restart-btn');

        // Initialize quiz
        function initQuiz() {
            totalQuestionsElement.textContent = quizQuestions.length;
            updateProgressBar();
            loadQuestion(currentQuestionIndex);
            updateNavigationButtons();
        }

        // Load a specific question
        function loadQuestion(questionIndex) {
            const question = quizQuestions[questionIndex];
            questionTextElement.textContent = question.question;
            currentQuestionElement.textContent = questionIndex + 1;
            
            // Clear previous options
            optionsContainerElement.innerHTML = '';
            
            // Create new options
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                
                // Check if this option was previously selected by the user
                if (userAnswers[questionIndex] === index) {
                    optionElement.classList.add('selected');
                }
                
                optionElement.innerHTML = `
                    <span class="option-label">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${option}</span>
                `;
                
                optionElement.addEventListener('click', () => selectOption(index));
                optionsContainerElement.appendChild(optionElement);
            });
            
            // Update score display
            currentScoreElement.textContent = score;
        }

        // Handle option selection
        function selectOption(optionIndex) {
            // If quiz is completed, don't allow selection
            if (quizCompleted) return;
            
            // Get all option elements
            const optionElements = document.querySelectorAll('.option');
            
            // Remove selected class from all options
            optionElements.forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            optionElements[optionIndex].classList.add('selected');
            
            // Store user's answer
            userAnswers[currentQuestionIndex] = optionIndex;
            
            // Enable next button
            nextButton.disabled = false;
        }

        // Navigate to next question
        function nextQuestion() {
            if (currentQuestionIndex < quizQuestions.length - 1) {
                currentQuestionIndex++;
                loadQuestion(currentQuestionIndex);
                updateNavigationButtons();
                updateProgressBar();
            } else {
                // If this is the last question, show results
                showResults();
            }
        }

        // Navigate to previous question
        function previousQuestion() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                loadQuestion(currentQuestionIndex);
                updateNavigationButtons();
                updateProgressBar();
            }
        }

        // Update navigation buttons state
        function updateNavigationButtons() {
            prevButton.disabled = currentQuestionIndex === 0;
            
            // Enable next button if user has selected an answer for current question
            if (userAnswers[currentQuestionIndex] !== null) {
                nextButton.disabled = false;
            } else {
                nextButton.disabled = true;
            }
            
            // Change next button text on last question
            if (currentQuestionIndex === quizQuestions.length - 1) {
                nextButton.innerHTML = 'Show Results <i class="fas fa-chart-bar"></i>';
            } else {
                nextButton.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            }
        }

        // Update progress bar
        function updateProgressBar() {
            const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
            progressBarElement.style.width = `${progress}%`;
        }

        // Calculate score and show results
        function showResults() {
            // Calculate score
            score = 0;
            userAnswers.forEach((answer, index) => {
                if (answer === quizQuestions[index].correctAnswer) {
                    score++;
                }
            });
            
            // Update final score display
            finalScoreElement.textContent = `${score}/${quizQuestions.length}`;
            scoreTextElement.textContent = `You answered ${score} out of ${quizQuestions.length} questions correctly`;
            
            // Set feedback message based on score
            let feedbackMessage = '';
            let feedbackClass = '';
            
            if (score >= 9) {
                feedbackMessage = 'Excellent! You have exceptional knowledge of traffic rules.';
                feedbackClass = 'excellent';
            } else if (score >= 7) {
                feedbackMessage = 'Good job! You have a solid understanding of traffic rules.';
                feedbackClass = 'good';
            } else if (score >= 5) {
                feedbackMessage = 'Fair. You know the basics but could improve your knowledge.';
                feedbackClass = 'needs-improvement';
            } else {
                feedbackMessage = 'Needs improvement. Consider reviewing traffic rules for safety.';
                feedbackClass = 'needs-improvement';
            }
            
            feedbackMessageElement.textContent = feedbackMessage;
            feedbackMessageElement.className = `feedback-message ${feedbackClass}`;
            
            // Show answers review
            showAnswersReview();
            
            // Switch to results section
            questionSection.style.display = 'none';
            resultSection.style.display = 'block';
            
            // Mark quiz as completed
            quizCompleted = true;
        }

        // Show detailed review of answers
        function showAnswersReview() {
            answersReviewElement.innerHTML = '';
            
            quizQuestions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                const reviewItem = document.createElement('div');
                reviewItem.className = `review-item ${isCorrect ? 'user-correct' : 'user-incorrect'}`;
                
                let answerStatus = '';
                let correctAnswerText = '';
                
                if (userAnswer === null) {
                    answerStatus = 'You did not answer this question.';
                } else {
                    answerStatus = isCorrect ? 
                        `You answered correctly: ${question.options[userAnswer]}` : 
                        `Your answer: ${question.options[userAnswer]}`;
                    
                    if (!isCorrect) {
                        correctAnswerText = `Correct answer: ${question.options[question.correctAnswer]}`;
                    }
                }
                
                reviewItem.innerHTML = `
                    <div class="review-question">Q${index + 1}: ${question.question}</div>
                    <div class="review-answer ${isCorrect ? 'correct-answer' : ''}">${answerStatus}</div>
                    ${correctAnswerText ? `<div class="review-answer correct-answer">${correctAnswerText}</div>` : ''}
                    <div class="explanation">${question.explanation}</div>
                `;
                
                answersReviewElement.appendChild(reviewItem);
            });
        }

        // Restart the quiz
        function restartQuiz() {
            // Reset quiz state
            currentQuestionIndex = 0;
            userAnswers = new Array(quizQuestions.length).fill(null);
            score = 0;
            quizCompleted = false;
            
            // Reset UI
            questionSection.style.display = 'block';
            resultSection.style.display = 'none';
            
            // Reinitialize quiz
            initQuiz();
        }

        // Event listeners
        nextButton.addEventListener('click', nextQuestion);
        prevButton.addEventListener('click', previousQuestion);
        restartButton.addEventListener('click', restartQuiz);

        // Initialize the quiz when page loads
        document.addEventListener('DOMContentLoaded', initQuiz);
    