        // Game state
        const gameState = {
            currentCategory: null,
            currentDifficulty: 'easy',
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalTime: 0,
            gameActive: false,
            selectedOption: null,
            timer: null,
            timeLeft: 30,
            userStats: {
                totalQuizzes: 0,
                totalScore: 0,
                totalCorrect: 0,
                totalQuestionsAttempted: 0,
                categoryStats: {},
                badges: []
            }
        };

        // Psychology questions database
        const psychologyQuestions = {
            cognitive: {
                easy: [
                    {
                        question: "What is the cognitive process of encoding, storing, and retrieving information called?",
                        options: ["Perception", "Memory", "Learning", "Attention"],
                        correctAnswer: 1,
                        explanation: "Memory is the cognitive process that involves encoding, storing, and retrieving information over time.",
                        fact: "Short-term memory can only hold about 7±2 items for about 20-30 seconds without rehearsal."
                    },
                    {
                        question: "Which cognitive bias causes people to overestimate their abilities?",
                        options: ["Confirmation bias", "Dunning-Kruger effect", "Hindsight bias", "Availability heuristic"],
                        correctAnswer: 1,
                        explanation: "The Dunning-Kruger effect is a cognitive bias where people with low ability at a task overestimate their ability.",
                        fact: "The term 'Dunning-Kruger effect' was coined in 1999 by psychologists David Dunning and Justin Kruger."
                    },
                    {
                        question: "What type of memory is responsible for knowing how to ride a bike?",
                        options: ["Episodic memory", "Semantic memory", "Procedural memory", "Working memory"],
                        correctAnswer: 2,
                        explanation: "Procedural memory is responsible for knowing how to perform tasks, like riding a bike or tying shoes.",
                        fact: "Procedural memory is often implicit, meaning we can perform the task without consciously thinking about it."
                    },
                    {
                        question: "Which part of the brain is primarily responsible for higher cognitive functions?",
                        options: ["Cerebellum", "Frontal lobe", "Occipital lobe", "Brainstem"],
                        correctAnswer: 1,
                        explanation: "The frontal lobe is responsible for higher cognitive functions like reasoning, planning, and problem-solving.",
                        fact: "The frontal lobe doesn't fully develop until around age 25, which explains why teenagers often make impulsive decisions."
                    },
                    {
                        question: "What is the term for mental shortcuts that simplify decision making?",
                        options: ["Algorithms", "Heuristics", "Schemata", "Prototypes"],
                        correctAnswer: 1,
                        explanation: "Heuristics are mental shortcuts that allow people to solve problems and make judgments quickly and efficiently.",
                        fact: "While heuristics save time, they can sometimes lead to cognitive biases and errors in judgment."
                    }
                ],
                medium: [
                    {
                        question: "Which cognitive theory suggests that information is processed in three stages?",
                        options: ["Piaget's theory", "Information processing theory", "Social learning theory", "Gestalt theory"],
                        correctAnswer: 1,
                        explanation: "The information processing theory compares the human mind to a computer, with information going through encoding, storage, and retrieval.",
                        fact: "This theory emerged in the 1950s and 1960s as computers became more prevalent, influencing how psychologists thought about cognition."
                    },
                    {
                        question: "What is the 'cocktail party effect' an example of?",
                        options: ["Selective attention", "Divided attention", "Sustained attention", "Executive attention"],
                        correctAnswer: 0,
                        explanation: "The cocktail party effect demonstrates selective attention - the ability to focus on one conversation while filtering out others.",
                        fact: "This effect shows that even when we're not consciously listening to other conversations, our brain is still processing them at some level."
                    }
                ],
                hard: [
                    {
                        question: "Which cognitive phenomenon explains why people remember uncompleted tasks better than completed ones?",
                        options: ["Zeigarnik effect", "Von Restorff effect", "Serial position effect", "Primacy effect"],
                        correctAnswer: 0,
                        explanation: "The Zeigarnik effect, discovered by Bluma Zeigarnik, states that people remember uncompleted or interrupted tasks better than completed ones.",
                        fact: "This effect is often used in marketing - cliffhangers in TV shows or incomplete progress bars encourage continued engagement."
                    }
                ]
            },
            social: {
                easy: [
                    {
                        question: "What is the phenomenon where people are less likely to help when others are present?",
                        options: ["Social loafing", "Bystander effect", "Groupthink", "Social facilitation"],
                        correctAnswer: 1,
                        explanation: "The bystander effect occurs when the presence of others discourages an individual from intervening in an emergency situation.",
                        fact: "The bystander effect was famously studied after the murder of Kitty Genovese in 1964, though the original reporting was later found to be inaccurate."
                    },
                    {
                        question: "What type of social influence involves changing behavior to fit in with a group?",
                        options: ["Compliance", "Obedience", "Conformity", "Persuasion"],
                        correctAnswer: 2,
                        explanation: "Conformity involves changing attitudes or behaviors to align with group norms or expectations.",
                        fact: "Solomon Asch's conformity experiments in the 1950s showed that people would give obviously wrong answers to conform with a group."
                    }
                ],
                medium: [
                    {
                        question: "Which theory suggests we determine our own attitudes by observing our behavior?",
                        options: ["Cognitive dissonance theory", "Self-perception theory", "Social comparison theory", "Attribution theory"],
                        correctAnswer: 1,
                        explanation: "Self-perception theory suggests that people develop attitudes by observing their own behavior and concluding what attitudes must have caused it.",
                        fact: "This theory helps explain the 'foot-in-the-door' technique, where agreeing to a small request makes people more likely to agree to larger ones later."
                    }
                ],
                hard: [
                    {
                        question: "In social psychology, what does 'deindividuation' refer to?",
                        options: ["Loss of self-awareness in groups", "Enhanced self-awareness in crowds", "Individual conformity pressure", "Group identity formation"],
                        correctAnswer: 0,
                        explanation: "Deindividuation is the loss of self-awareness and individual accountability in groups, which can lead to disinhibited behavior.",
                        fact: "Deindividuation helps explain why people might behave differently in crowds or online anonymity than they would individually."
                    }
                ]
            },
            developmental: {
                easy: [
                    {
                        question: "Which psychologist is known for his theory of cognitive development in children?",
                        options: ["Freud", "Piaget", "Erikson", "Skinner"],
                        correctAnswer: 1,
                        explanation: "Jean Piaget proposed a stage theory of cognitive development that describes how children construct a mental model of the world.",
                        fact: "Piaget identified four stages of cognitive development: sensorimotor, preoperational, concrete operational, and formal operational."
                    },
                    {
                        question: "According to Erikson, what is the primary conflict of adolescence?",
                        options: ["Trust vs. Mistrust", "Identity vs. Role Confusion", "Initiative vs. Guilt", "Intimacy vs. Isolation"],
                        correctAnswer: 1,
                        explanation: "Erikson's psychosocial stage for adolescence (12-18 years) is Identity vs. Role Confusion, where teens explore who they are.",
                        fact: "Erikson proposed eight stages of psychosocial development spanning the entire lifespan."
                    }
                ],
                medium: [
                    {
                        question: "What is the term for a child's understanding that objects continue to exist when out of sight?",
                        options: ["Conservation", "Object permanence", "Theory of mind", "Egocentrism"],
                        correctAnswer: 1,
                        explanation: "Object permanence is the understanding that objects continue to exist even when they cannot be seen, heard, or touched.",
                        fact: "Jean Piaget believed object permanence develops during the sensorimotor stage (birth to 2 years)."
                    }
                ],
                hard: [
                    {
                        question: "According to Vygotsky, what is the range between what a learner can do independently and with help?",
                        options: ["Zone of proximal development", "Scaffolding range", "Cognitive developmental zone", "Learning potential range"],
                        correctAnswer: 0,
                        explanation: "The zone of proximal development (ZPD) is the difference between what a learner can do without help and what they can do with guidance.",
                        fact: "Vygotsky emphasized social interaction in learning, contrasting with Piaget's focus on individual discovery."
                    }
                ]
            },
            clinical: {
                easy: [
                    {
                        question: "Which therapy focuses on changing negative thought patterns?",
                        options: ["Psychoanalysis", "Cognitive behavioral therapy", "Humanistic therapy", "Gestalt therapy"],
                        correctAnswer: 1,
                        explanation: "Cognitive Behavioral Therapy (CBT) focuses on identifying and changing negative thought patterns and behaviors.",
                        fact: "CBT is one of the most researched and evidence-based forms of psychotherapy, effective for many disorders."
                    },
                    {
                        question: "What disorder is characterized by persistent, uncontrollable worry?",
                        options: ["Major depressive disorder", "Generalized anxiety disorder", "Panic disorder", "Obsessive-compulsive disorder"],
                        correctAnswer: 1,
                        explanation: "Generalized Anxiety Disorder (GAD) involves excessive, uncontrollable worry about everyday things.",
                        fact: "GAD affects about 3-4% of the population and is more common in women than men."
                    }
                ],
                medium: [
                    {
                        question: "What is the primary symptom of bipolar disorder?",
                        options: ["Panic attacks", "Mood swings between depression and mania", "Persistent sadness", "Disorganized thinking"],
                        correctAnswer: 1,
                        explanation: "Bipolar disorder is characterized by extreme mood swings that include emotional highs (mania or hypomania) and lows (depression).",
                        fact: "There are several types of bipolar disorder, with Bipolar I involving full manic episodes and Bipolar II involving hypomanic episodes."
                    }
                ],
                hard: [
                    {
                        question: "Which personality disorder is characterized by a pervasive pattern of grandiosity and need for admiration?",
                        options: ["Borderline personality disorder", "Narcissistic personality disorder", "Antisocial personality disorder", "Histrionic personality disorder"],
                        correctAnswer: 1,
                        explanation: "Narcissistic Personality Disorder involves a pervasive pattern of grandiosity, need for admiration, and lack of empathy.",
                        fact: "The term 'narcissism' comes from Greek mythology, where Narcissus fell in love with his own reflection."
                    }
                ]
            }
        };

        // Psychology facts for explanations
        const psychologyFacts = [
            "The brain uses about 20% of the body's total energy, despite being only about 2% of body weight.",
            "The average number of thoughts a person has each day is estimated to be around 70,000.",
            "Memory is reconstructive, not reproductive - we rebuild memories each time we recall them.",
            "Yawning is contagious due to empathy and social bonding mechanisms in the brain.",
            "The 'Baader-Meinhof phenomenon' is when you learn something new and then see it everywhere.",
            "Multitasking reduces productivity by up to 40% according to some studies.",
            "It takes about 66 days on average to form a new habit, according to a University College London study.",
            "The placebo effect can work even when people know they're taking a placebo.",
            "Around 90% of people report experiencing 'earworms' - songs stuck in their head.",
            "The human brain has about 86 billion neurons and trillions of connections."
        ];

        // Badges system
        const badges = [
            { id: 'first_quiz', name: 'First Quiz', icon: 'fas fa-star', description: 'Complete your first psychology quiz', color: '#FFD700' },
            { id: 'perfect_score', name: 'Perfect Score', icon: 'fas fa-crown', description: 'Get a perfect score on any quiz', color: '#9d4edd' },
            { id: 'speed_demon', name: 'Speed Demon', icon: 'fas fa-bolt', description: 'Complete a quiz with average time under 10s per question', color: '#FF6B6B' },
            { id: 'streak_master', name: 'Streak Master', icon: 'fas fa-fire', description: 'Achieve a 10-question correct streak', color: '#FF8C42' },
            { id: 'category_expert', name: 'Category Expert', icon: 'fas fa-brain', description: 'Master all questions in one category', color: '#4a6fa5' },
            { id: 'psychology_buff', name: 'Psychology Buff', icon: 'fas fa-book', description: 'Complete 5 quizzes', color: '#2a9d8f' }
        ];

        // DOM Elements
        const totalScoreEl = document.getElementById('total-score');
        const currentStreakEl = document.getElementById('current-streak');
        const accuracyRateEl = document.getElementById('accuracy-rate');
        const avgTimeEl = document.getElementById('avg-time');
        const categoriesContainer = document.getElementById('categories-container');
        const quizContainer = document.getElementById('quiz-container');
        const startQuizButton = document.getElementById('start-quiz-button');
        const resetButton = document.getElementById('reset-button');
        const currentQuestionTextEl = document.getElementById('current-question-text');
        const progressPercentEl = document.getElementById('progress-percent');
        const progressFillEl = document.getElementById('progress-fill');
        const timerEl = document.getElementById('timer');
        const questionNumberEl = document.getElementById('question-number');
        const questionTextEl = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const explanationContainer = document.getElementById('explanation-container');
        const explanationTextEl = document.getElementById('explanation-text');
        const psychologyFactEl = document.getElementById('psychology-fact');
        const hintButton = document.getElementById('hint-button');
        const nextButton = document.getElementById('next-button');
        const resultsContainer = document.getElementById('results-container');
        const finalScoreEl = document.getElementById('final-score');
        const performanceTitleEl = document.getElementById('performance-title');
        const performanceDescEl = document.getElementById('performance-desc');
        const resultsAccuracyEl = document.getElementById('results-accuracy');
        const resultsTimeEl = document.getElementById('results-time');
        const resultsCategoryEl = document.getElementById('results-category');
        const resultsStreakEl = document.getElementById('results-streak');
        const badgesListEl = document.getElementById('badges-list');
        const playAgainButton = document.getElementById('play-again-button');
        const backToMenuButton = document.getElementById('back-to-menu-button');
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');

        // Initialize the game
        function initGame() {
            loadUserStats();
            updateStatsDisplay();
            setupCategories();
            setupEventListeners();
            setupDifficultySelector();
        }

        // Load user stats from localStorage
        function loadUserStats() {
            const savedStats = localStorage.getItem('psychologyQuizStats');
            if (savedStats) {
                gameState.userStats = JSON.parse(savedStats);
            }
            
            // Initialize category stats if not present
            if (!gameState.userStats.categoryStats) {
                gameState.userStats.categoryStats = {
                    cognitive: { played: 0, correct: 0, total: 0, score: 0 },
                    social: { played: 0, correct: 0, total: 0, score: 0 },
                    developmental: { played: 0, correct: 0, total: 0, score: 0 },
                    clinical: { played: 0, correct: 0, total: 0, score: 0 }
                };
            }
            
            // Initialize badges if not present
            if (!gameState.userStats.badges) {
                gameState.userStats.badges = [];
            }
        }

        // Save user stats to localStorage
        function saveUserStats() {
            localStorage.setItem('psychologyQuizStats', JSON.stringify(gameState.userStats));
        }

        // Update stats display
        function updateStatsDisplay() {
            totalScoreEl.textContent = gameState.userStats.totalScore;
            
            const accuracy = gameState.userStats.totalQuestionsAttempted > 0 ?
                Math.round((gameState.userStats.totalCorrect / gameState.userStats.totalQuestionsAttempted) * 100) : 0;
            accuracyRateEl.textContent = `${accuracy}%`;
            
            // Calculate average time (placeholder - would need more complex tracking)
            const avgTime = gameState.userStats.totalQuestionsAttempted > 0 ?
                Math.round(gameState.totalTime / gameState.userStats.totalQuestionsAttempted) : 0;
            avgTimeEl.textContent = `${avgTime}s`;
            
            currentStreakEl.textContent = gameState.currentStreak;
        }

        // Setup categories display
        function setupCategories() {
            categoriesContainer.innerHTML = '';
            
            const categories = [
                { id: 'cognitive', name: 'Cognitive Psychology', icon: 'fas fa-brain', color: 'var(--cognitive-color)' },
                { id: 'social', name: 'Social Psychology', icon: 'fas fa-users', color: 'var(--social-color)' },
                { id: 'developmental', name: 'Developmental Psychology', icon: 'fas fa-baby', color: 'var(--developmental-color)' },
                { id: 'clinical', name: 'Clinical Psychology', icon: 'fas fa-heartbeat', color: 'var(--clinical-color)' }
            ];
            
            categories.forEach(category => {
                const categoryCard = document.createElement('div');
                categoryCard.className = `category-card ${category.id}`;
                categoryCard.dataset.category = category.id;
                
                const stats = gameState.userStats.categoryStats[category.id] || { played: 0, correct: 0, total: 0, score: 0 };
                const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                
                categoryCard.innerHTML = `
                    <div class="category-icon" style="background-color: ${category.color};">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="category-name">${category.name}</div>
                    <div class="category-stats">
                        ${stats.played} quizzes | ${accuracy}% accuracy
                    </div>
                `;
                
                categoryCard.addEventListener('click', () => selectCategory(category.id));
                categoriesContainer.appendChild(categoryCard);
            });
        }

        // Setup difficulty selector
        function setupDifficultySelector() {
            difficultyButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    difficultyButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    gameState.currentDifficulty = this.dataset.difficulty;
                });
            });
        }

        // Select a category
        function selectCategory(categoryId) {
            // Remove active class from all categories
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active class to selected category
            document.querySelector(`.category-card[data-category="${categoryId}"]`).classList.add('active');
            
            gameState.currentCategory = categoryId;
            startQuizButton.disabled = false;
            startQuizButton.innerHTML = `<i class="fas fa-play-circle"></i> Start ${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Quiz`;
        }

        // Start the quiz
        function startQuiz() {
            if (!gameState.currentCategory) {
                alert('Please select a category first!');
                return;
            }
            
            // Reset game state
            gameState.questions = [];
            gameState.currentQuestionIndex = 0;
            gameState.score = 0;
            gameState.correctAnswers = 0;
            gameState.currentStreak = 0;
            gameState.totalTime = 0;
            gameState.gameActive = true;
            gameState.selectedOption = null;
            gameState.timeLeft = 30;
            
            // Get questions for selected category and difficulty
            const categoryQuestions = psychologyQuestions[gameState.currentCategory];
            if (!categoryQuestions) {
                console.error('No questions found for category:', gameState.currentCategory);
                return;
            }
            
            const difficultyQuestions = categoryQuestions[gameState.currentDifficulty];
            if (!difficultyQuestions || difficultyQuestions.length === 0) {
                console.error('No questions found for difficulty:', gameState.currentDifficulty);
                return;
            }
            
            // Select 5 random questions
            const shuffled = [...difficultyQuestions].sort(() => 0.5 - Math.random());
            gameState.questions = shuffled.slice(0, 5);
            gameState.totalQuestions = gameState.questions.length;
            
            // Hide categories, show quiz
            document.querySelector('.panel:first-child').style.display = 'none';
            quizContainer.style.display = 'flex';
            
            // Start first question
            loadQuestion();
            startTimer();
            
            // Update button
            startQuizButton.style.display = 'none';
            resetButton.style.display = 'none';
        }

        // Load current question
        function loadQuestion() {
            if (gameState.currentQuestionIndex >= gameState.questions.length) {
                endQuiz();
                return;
            }
            
            const question = gameState.questions[gameState.currentQuestionIndex];
            
            // Update progress
            const progress = ((gameState.currentQuestionIndex) / gameState.totalQuestions) * 100;
            currentQuestionTextEl.textContent = `Question ${gameState.currentQuestionIndex + 1} of ${gameState.totalQuestions}`;
            progressPercentEl.textContent = `${Math.round(progress)}%`;
            progressFillEl.style.width = `${progress}%`;
            
            // Update question number and text
            questionNumberEl.textContent = `Question #${gameState.currentQuestionIndex + 1}`;
            questionTextEl.textContent = question.question;
            
            // Clear previous options
            optionsContainer.innerHTML = '';
            
            // Add new options
            const letters = ['A', 'B', 'C', 'D'];
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.index = index;
                
                optionElement.innerHTML = `
                    <div class="option-letter">${letters[index]}</div>
                    <div class="option-text">${option}</div>
                `;
                
                optionElement.addEventListener('click', () => selectOption(index, optionElement));
                optionsContainer.appendChild(optionElement);
            });
            
            // Reset UI state
            explanationContainer.style.display = 'none';
            nextButton.disabled = true;
            nextButton.innerHTML = '<i class="fas fa-arrow-right"></i> Next Question';
            hintButton.disabled = false;
            gameState.selectedOption = null;
            gameState.timeLeft = 30;
            timerEl.textContent = gameState.timeLeft;
            
            // Reset timer
            if (gameState.timer) {
                clearInterval(gameState.timer);
            }
            startTimer();
        }

        // Start timer for current question
        function startTimer() {
            gameState.timer = setInterval(() => {
                gameState.timeLeft--;
                timerEl.textContent = gameState.timeLeft;
                
                if (gameState.timeLeft <= 0) {
                    clearInterval(gameState.timer);
                    if (gameState.gameActive && gameState.selectedOption === null) {
                        // Time's up, show explanation
                        showExplanation(-1); // -1 indicates timeout
                    }
                }
            }, 1000);
        }

        // Select an option
        function selectOption(index, element) {
            if (!gameState.gameActive || gameState.selectedOption !== null) return;
            
            gameState.selectedOption = index;
            clearInterval(gameState.timer);
            
            // Highlight selected option
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            element.classList.add('selected');
            
            const question = gameState.questions[gameState.currentQuestionIndex];
            const isCorrect = index === question.correctAnswer;
            
            // Update score and stats
            if (isCorrect) {
                gameState.score += 10;
                gameState.correctAnswers++;
                gameState.currentStreak++;
                gameState.bestStreak = Math.max(gameState.bestStreak, gameState.currentStreak);
                element.classList.add('correct');
            } else {
                gameState.currentStreak = 0;
                element.classList.add('incorrect');
                
                // Highlight correct answer
                const correctOption = document.querySelector(`.option[data-index="${question.correctAnswer}"]`);
                if (correctOption) {
                    correctOption.classList.add('correct');
                }
            }
            
            // Add time bonus for quick answers
            const timeBonus = Math.floor(gameState.timeLeft / 3);
            gameState.score += timeBonus;
            
            // Update total time
            gameState.totalTime += (30 - gameState.timeLeft);
            
            // Update user stats
            gameState.userStats.totalQuestionsAttempted++;
            if (isCorrect) gameState.userStats.totalCorrect++;
            gameState.userStats.totalScore += gameState.score;
            
            // Update category stats
            const categoryStats = gameState.userStats.categoryStats[gameState.currentCategory];
            categoryStats.played++;
            categoryStats.total++;
            if (isCorrect) categoryStats.correct++;
            categoryStats.score += gameState.score;
            
            // Show explanation
            showExplanation(index);
            
            // Enable next button
            nextButton.disabled = false;
            
            // Update stats display
            updateStatsDisplay();
        }

        // Show explanation for current question
        function showExplanation(selectedIndex) {
            const question = gameState.questions[gameState.currentQuestionIndex];
            
            // Set explanation text
            explanationTextEl.textContent = question.explanation;
            
            // Set random psychology fact
            const randomFact = psychologyFacts[Math.floor(Math.random() * psychologyFacts.length)];
            psychologyFactEl.textContent = randomFact;
            
            // Show explanation container
            explanationContainer.style.display = 'block';
            
            // Scroll to explanation
            explanationContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Move to next question
        function nextQuestion() {
            gameState.currentQuestionIndex++;
            loadQuestion();
        }

        // End the quiz
        function endQuiz() {
            gameState.gameActive = false;
            clearInterval(gameState.timer);
            
            // Update user stats
            gameState.userStats.totalQuizzes++;
            
            // Check for badges
            checkForBadges();
            
            // Save stats
            saveUserStats();
            
            // Show results
            showResults();
        }

        // Check for earned badges
        function checkForBadges() {
            const newBadges = [];
            
            // First quiz badge
            if (gameState.userStats.totalQuizzes === 1 && !gameState.userStats.badges.includes('first_quiz')) {
                newBadges.push('first_quiz');
                gameState.userStats.badges.push('first_quiz');
            }
            
            // Perfect score badge
            if (gameState.correctAnswers === gameState.totalQuestions && !gameState.userStats.badges.includes('perfect_score')) {
                newBadges.push('perfect_score');
                gameState.userStats.badges.push('perfect_score');
            }
            
            // Speed demon badge
            const avgTime = gameState.totalTime / gameState.totalQuestions;
            if (avgTime < 10 && !gameState.userStats.badges.includes('speed_demon')) {
                newBadges.push('speed_demon');
                gameState.userStats.badges.push('speed_demon');
            }
            
            // Streak master badge
            if (gameState.bestStreak >= 10 && !gameState.userStats.badges.includes('streak_master')) {
                newBadges.push('streak_master');
                gameState.userStats.badges.push('streak_master');
            }
            
            // Category expert badge (simplified - would need more tracking)
            const categoryStats = gameState.userStats.categoryStats[gameState.currentCategory];
            if (categoryStats.correct >= 20 && !gameState.userStats.badges.includes('category_expert')) {
                newBadges.push('category_expert');
                gameState.userStats.badges.push('category_expert');
            }
            
            // Psychology buff badge
            if (gameState.userStats.totalQuizzes >= 5 && !gameState.userStats.badges.includes('psychology_buff')) {
                newBadges.push('psychology_buff');
                gameState.userStats.badges.push('psychology_buff');
            }
            
            // Show notification for new badges
            if (newBadges.length > 0) {
                setTimeout(() => {
                    alert(`Congratulations! You earned ${newBadges.length} new badge(s)!`);
                }, 500);
            }
        }

        // Show quiz results
        function showResults() {
            // Hide quiz, show results
            quizContainer.style.display = 'none';
            resultsContainer.style.display = 'block';
            
            // Calculate final score
            const maxScore = gameState.totalQuestions * 10;
            const percentage = Math.round((gameState.score / maxScore) * 100);
            
            // Set final score
            finalScoreEl.textContent = `${gameState.score}/${maxScore}`;
            
            // Set performance title and description
            let performanceTitle = '';
            let performanceDesc = '';
            
            if (percentage >= 90) {
                performanceTitle = 'Psychology Professor';
                performanceDesc = 'Outstanding! You have exceptional knowledge of psychology concepts.';
            } else if (percentage >= 75) {
                performanceTitle = 'Psychology Graduate';
                performanceDesc = 'Great job! You have a strong understanding of psychology principles.';
            } else if (percentage >= 60) {
                performanceTitle = 'Psychology Student';
                performanceDesc = 'Good work! You have a solid foundation in psychology.';
            } else if (percentage >= 40) {
                performanceTitle = 'Psychology Enthusiast';
                performanceDesc = 'Not bad! You have some psychology knowledge - keep learning!';
            } else {
                performanceTitle = 'Psychology Novice';
                performanceDesc = 'You\'re just starting your psychology journey. Keep studying and try again!';
            }
            
            performanceTitleEl.textContent = performanceTitle;
            performanceDescEl.textContent = performanceDesc;
            
            // Set detailed results
            const accuracy = Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100);
            resultsAccuracyEl.textContent = `${accuracy}%`;
            
            const avgTime = Math.round(gameState.totalTime / gameState.totalQuestions);
            resultsTimeEl.textContent = `${avgTime}s`;
            
            resultsCategoryEl.textContent = gameState.currentCategory.charAt(0).toUpperCase() + gameState.currentCategory.slice(1);
            resultsStreakEl.textContent = gameState.bestStreak;
            
            // Display badges
            displayBadges();
            
            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }

        // Display earned badges
        function displayBadges() {
            badgesListEl.innerHTML = '';
            
            badges.forEach(badge => {
                const badgeEl = document.createElement('div');
                badgeEl.className = 'badge';
                if (gameState.userStats.badges.includes(badge.id)) {
                    badgeEl.classList.add('earned');
                }
                
                badgeEl.innerHTML = `
                    <i class="${badge.icon}"></i>
                    <div class="badge-name">${badge.name}</div>
                `;
                
                badgeEl.style.backgroundColor = badge.color;
                badgesListEl.appendChild(badgeEl);
            });
        }

        // Reset all progress
        function resetProgress() {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                gameState.userStats = {
                    totalQuizzes: 0,
                    totalScore: 0,
                    totalCorrect: 0,
                    totalQuestionsAttempted: 0,
                    categoryStats: {
                        cognitive: { played: 0, correct: 0, total: 0, score: 0 },
                        social: { played: 0, correct: 0, total: 0, score: 0 },
                        developmental: { played: 0, correct: 0, total: 0, score: 0 },
                        clinical: { played: 0, correct: 0, total: 0, score: 0 }
                    },
                    badges: []
                };
                
                saveUserStats();
                updateStatsDisplay();
                setupCategories();
                alert('All progress has been reset.');
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            // Start quiz button
            startQuizButton.addEventListener('click', startQuiz);
            
            // Reset button
            resetButton.addEventListener('click', resetProgress);
            
            // Hint button
            hintButton.addEventListener('click', function() {
                if (!gameState.gameActive || gameState.selectedOption !== null) return;
                
                const question = gameState.questions[gameState.currentQuestionIndex];
                const correctIndex = question.correctAnswer;
                const letters = ['A', 'B', 'C', 'D'];
                
                // Give a hint (50/50 style)
                const options = document.querySelectorAll('.option');
                let incorrectOptions = [];
                
                options.forEach((opt, index) => {
                    if (index !== correctIndex) {
                        incorrectOptions.push(opt);
                    }
                });
                
                // Remove one incorrect option
                const toRemove = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
                toRemove.style.opacity = '0.3';
                toRemove.style.pointerEvents = 'none';
                
                // Disable hint button
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-lightbulb"></i> Hint Used';
            });
            
            // Next question button
            nextButton.addEventListener('click', nextQuestion);
            
            // Play again button
            playAgainButton.addEventListener('click', function() {
                resultsContainer.style.display = 'none';
                startQuiz();
            });
            
            // Back to menu button
            backToMenuButton.addEventListener('click', function() {
                resultsContainer.style.display = 'none';
                document.querySelector('.panel:first-child').style.display = 'block';
                startQuizButton.style.display = 'flex';
                resetButton.style.display = 'flex';
            });
        }

        // Initialize the game when page loads
        document.addEventListener('DOMContentLoaded', initGame);