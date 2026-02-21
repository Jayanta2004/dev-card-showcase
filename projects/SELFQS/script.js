
        // DOM Elements
        const currentQuestion = document.getElementById('currentQuestion');
        const currentCategory = document.getElementById('currentCategory');
        const generateBtn = document.getElementById('generateBtn');
        const favoriteBtn = document.getElementById('favoriteBtn');
        const shareBtn = document.getElementById('shareBtn');
        const saveAnswerBtn = document.getElementById('saveAnswerBtn');
        const answerText = document.getElementById('answerText');
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const streakCount = document.getElementById('streakCount');
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        const dailyQuote = document.getElementById('dailyQuote');

        // Question Database
        const questionDatabase = {
            learning: [
                "What's one thing you learned today that surprised you?",
                "How did you challenge your existing beliefs or assumptions today?",
                "What new skill or knowledge did you acquire, and how can you apply it?",
                "What mistake taught you the most today?",
                "How did you expand your perspective on a topic today?"
            ],
            growth: [
                "In what way did you step outside your comfort zone today?",
                "How have you grown as a person compared to this time last year?",
                "What limiting belief did you confront or overcome today?",
                "What personal strength did you utilize most today?",
                "What aspect of yourself are you actively working to improve?"
            ],
            relationships: [
                "How did you show kindness or empathy to someone today?",
                "What meaningful conversation did you have today?",
                "How did you nurture an important relationship in your life?",
                "What did you learn about someone else's perspective today?",
                "How did you practice active listening in a conversation today?"
            ],
            productivity: [
                "What was your most significant accomplishment today?",
                "How did you prioritize your time and energy effectively?",
                "What task did you complete that brought you a sense of satisfaction?",
                "How did you overcome procrastination today?",
                "What one thing could you do tomorrow to be more productive?"
            ],
            gratitude: [
                "What three things are you most grateful for today?",
                "Who made a positive impact on your day, and how?",
                "What simple pleasure brought you joy today?",
                "What privilege or advantage are you thankful for today?",
                "How did you express gratitude to someone today?"
            ],
            mindfulness: [
                "When did you feel most present and aware today?",
                "How did you practice self-compassion today?",
                "What thought patterns did you observe in yourself today?",
                "How did you manage stress or difficult emotions today?",
                "What moment of peace or calm did you experience today?"
            ]
        };

        // Quotes for inspiration
        const quotes = [
            "The unexamined life is not worth living. — Socrates",
            "Knowing yourself is the beginning of all wisdom. — Aristotle",
            "We do not learn from experience... we learn from reflecting on experience. — John Dewey",
            "He who knows others is wise; he who knows himself is enlightened. — Lao Tzu",
            "Self-reflection is the school of wisdom. — Baltasar Gracián",
            "Without reflection, we go blindly on our way. — Margaret J. Wheatley",
            "Life can only be understood backwards; but it must be lived forwards. — Søren Kierkegaard",
            "The journey into self-love and self-acceptance must begin with self-examination. — unknown",
            "Follow effective action with quiet reflection. From the quiet reflection will come even more effective action. — Peter Drucker"
        ];

        // State variables
        let currentQuestionObj = null;
        let selectedCategory = 'all';
        let favorites = JSON.parse(localStorage.getItem('questionFavorites')) || [];
        let history = JSON.parse(localStorage.getItem('questionHistory')) || [];
        let streak = parseInt(localStorage.getItem('reflectionStreak')) || 0;
        let lastReflectionDate = localStorage.getItem('lastReflectionDate') || null;
        let weeklyReflections = JSON.parse(localStorage.getItem('weeklyReflections')) || { count: 0, weekStart: getWeekStartDate() };

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Set random daily quote
            setRandomQuote();
            
            // Update streak and progress
            updateStreak();
            updateProgress();
            
            // Load history
            renderHistory();
            
            // Generate first question
            generateQuestion();
            
            // Set up category filters
            setupCategoryFilters();
        });

        // Generate a new question
        generateBtn.addEventListener('click', generateQuestion);

        // Add to favorites
        favoriteBtn.addEventListener('click', function() {
            if (!currentQuestionObj) return;
            
            const questionId = currentQuestionObj.category + '-' + currentQuestionObj.question.substring(0, 20);
            
            if (!favorites.some(fav => fav.id === questionId)) {
                favorites.push({
                    id: questionId,
                    question: currentQuestionObj.question,
                    category: currentQuestionObj.category,
                    date: new Date().toISOString()
                });
                localStorage.setItem('questionFavorites', JSON.stringify(favorites));
                
                // Update button
                favoriteBtn.innerHTML = '<i class="fas fa-star"></i> Favorited';
                favoriteBtn.classList.add('btn-favorite');
                setTimeout(() => {
                    favoriteBtn.innerHTML = '<i class="far fa-star"></i> Add to Favorites';
                    favoriteBtn.classList.remove('btn-favorite');
                }, 1500);
            }
        });

        // Share question
        shareBtn.addEventListener('click', function() {
            if (!currentQuestionObj) return;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Daily Self-Question',
                    text: currentQuestionObj.question,
                    url: window.location.href
                });
            } else {
                // Fallback for browsers without Web Share API
                navigator.clipboard.writeText(currentQuestionObj.question + "\n\n— Generated with Daily Self-Question Generator");
                alert('Question copied to clipboard!');
            }
        });

        // Save answer
        saveAnswerBtn.addEventListener('click', function() {
            if (!currentQuestionObj || !answerText.value.trim()) {
                alert('Please write a reflection before saving.');
                return;
            }
            
            // Create reflection object
            const reflection = {
                id: Date.now(),
                date: new Date().toISOString(),
                question: currentQuestionObj.question,
                category: currentQuestionObj.category,
                answer: answerText.value.trim(),
                favorite: false
            };
            
            // Add to history
            history.unshift(reflection);
            localStorage.setItem('questionHistory', JSON.stringify(history));
            
            // Update streak
            updateReflectionStreak();
            
            // Update progress
            updateWeeklyProgress();
            
            // Render updated history
            renderHistory();
            
            // Clear answer field
            answerText.value = '';
            
            // Show confirmation
            const originalText = saveAnswerBtn.innerHTML;
            saveAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Reflection Saved!';
            saveAnswerBtn.style.backgroundColor = '#2ecc71';
            
            setTimeout(() => {
                saveAnswerBtn.innerHTML = originalText;
                saveAnswerBtn.style.backgroundColor = '';
            }, 2000);
            
            // Generate new question
            setTimeout(generateQuestion, 500);
        });

        // Set up category filter buttons
        function setupCategoryFilters() {
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Update active button
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Update selected category
                    selectedCategory = this.dataset.category;
                    
                    // Generate question from selected category
                    generateQuestion();
                });
            });
        }

        // Generate a random question
        function generateQuestion() {
            let category;
            
            if (selectedCategory === 'all') {
                // Pick a random category
                const categories = Object.keys(questionDatabase);
                category = categories[Math.floor(Math.random() * categories.length)];
            } else {
                category = selectedCategory;
            }
            
            // Get random question from category
            const questions = questionDatabase[category];
            const question = questions[Math.floor(Math.random() * questions.length)];
            
            // Update current question object
            currentQuestionObj = {
                question: question,
                category: category
            };
            
            // Update display
            currentQuestion.textContent = question;
            currentCategory.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            
            // Reset favorite button
            favoriteBtn.innerHTML = '<i class="far fa-star"></i> Add to Favorites';
            favoriteBtn.classList.remove('btn-favorite');
        }

        // Render history list
        function renderHistory() {
            if (history.length === 0) {
                emptyHistory.style.display = 'block';
                return;
            }
            
            emptyHistory.style.display = 'none';
            historyList.innerHTML = '';
            
            // Show only last 10 reflections
            const recentHistory = history.slice(0, 10);
            
            recentHistory.forEach(reflection => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const date = new Date(reflection.date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                historyItem.innerHTML = `
                    <div class="history-date">${formattedDate}</div>
                    <div class="history-question">${reflection.question}</div>
                    <div class="history-category">${reflection.category}</div>
                    ${reflection.favorite ? '<i class="fas fa-star favorite-star"></i>' : ''}
                `;
                
                historyList.appendChild(historyItem);
            });
        }

        // Update streak counter
        function updateStreak() {
            streakCount.textContent = streak;
        }

        // Update reflection streak
        function updateReflectionStreak() {
            const today = new Date().toDateString();
            
            if (lastReflectionDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();
                
                if (lastReflectionDate === yesterdayStr) {
                    streak++;
                } else {
                    streak = 1;
                }
                
                lastReflectionDate = today;
                localStorage.setItem('reflectionStreak', streak.toString());
                localStorage.setItem('lastReflectionDate', lastReflectionDate);
                updateStreak();
            }
        }

        // Update weekly progress
        function updateWeeklyProgress() {
            const weekStart = getWeekStartDate();
            
            // If new week, reset counter
            if (weeklyReflections.weekStart !== weekStart) {
                weeklyReflections = { count: 1, weekStart: weekStart };
            } else {
                weeklyReflections.count = Math.min(weeklyReflections.count + 1, 7);
            }
            
            localStorage.setItem('weeklyReflections', JSON.stringify(weeklyReflections));
            updateProgress();
        }

        // Display weekly progress
        function updateProgress() {
            const count = weeklyReflections.count || 0;
            progressText.textContent = `${count}/7 days`;
            
            const percentage = (count / 7) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        // Get start of current week (Sunday)
        function getWeekStartDate() {
            const now = new Date();
            const day = now.getDay(); // 0 = Sunday
            const diff = now.getDate() - day;
            const weekStart = new Date(now.setDate(diff));
            return weekStart.toDateString();
        }

        // Set random daily quote
        function setRandomQuote() {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            dailyQuote.textContent = randomQuote;
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to save answer
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (document.activeElement === answerText) {
                    saveAnswerBtn.click();
                }
            }
            
            // Space to generate new question (when not typing)
            if (e.key === ' ' && document.activeElement !== answerText) {
                e.preventDefault();
                generateBtn.click();
            }
        });

        // Initialize with a random question
        generateQuestion();
    