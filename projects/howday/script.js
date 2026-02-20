
        // Mood data with enhanced properties
        const moods = [
            {
                emoji: "😢",
                label: "Very Rough",
                text: "I'm sorry today was hard. Be kind to yourself. Tomorrow is a new opportunity. 🤍",
                bg: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
                color: "#2c3e50",
                icon: "fas fa-cloud-rain"
            },
            {
                emoji: "😔",
                label: "Tough",
                text: "Some days are heavier than others. Remember to breathe and take things one step at a time. 🌙",
                bg: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
                color: "#596275",
                icon: "fas fa-cloud-moon"
            },
            {
                emoji: "😐",
                label: "Neutral",
                text: "A calm, steady day is still a good day. Sometimes peace is the greatest achievement. ☁️",
                bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#667eea",
                icon: "fas fa-cloud"
            },
            {
                emoji: "🙂",
                label: "Good",
                text: "Nice! It sounds like today had some bright moments. Cherish those peaceful feelings. 🌼",
                bg: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
                color: "#56ab2f",
                icon: "fas fa-sun"
            },
            {
                emoji: "😄",
                label: "Excellent!",
                text: "Yay! I'm so glad today was bright and positive! May tomorrow be just as wonderful! ✨",
                bg: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
                color: "#f7971e",
                icon: "fas fa-star"
            }
        ];

        // DOM Elements
        const moodSlider = document.getElementById('moodSlider');
        const emoji = document.getElementById('emoji');
        const moodLabel = document.getElementById('moodLabel');
        const message = document.getElementById('message');
        const streakCount = document.getElementById('streakCount');
        const avgMood = document.getElementById('avgMood');
        const daysTracked = document.getElementById('daysTracked');

        // App state
        let currentMood = 2;
        let moodHistory = [];
        let streak = 0;
        let today = new Date().toDateString();

        // Initialize from localStorage
        function initApp() {
            const savedData = localStorage.getItem('moodTrackerData');
            if (savedData) {
                const data = JSON.parse(savedData);
                moodHistory = data.moodHistory || [];
                streak = data.streak || 0;
                
                // Check if last entry was yesterday
                if (moodHistory.length > 0) {
                    const lastEntry = moodHistory[moodHistory.length - 1];
                    const lastDate = new Date(lastEntry.date);
                    const todayDate = new Date();
                    
                    // If last entry was yesterday, increment streak
                    if (lastDate.getDate() === todayDate.getDate() - 1) {
                        streak++;
                    } else if (lastDate.getDate() !== todayDate.getDate()) {
                        streak = 1; // Reset if missed a day
                    }
                }
            }
            
            updateStats();
            updateMood(currentMood);
        }

        // Update mood display
        function updateMood(value) {
            const mood = moods[value];
            currentMood = value;
            
            // Update emoji with animation
            emoji.textContent = mood.emoji;
            emoji.classList.remove('pulse');
            void emoji.offsetWidth; // Trigger reflow
            emoji.classList.add('pulse');
            
            // Update label
            moodLabel.textContent = mood.label;
            
            // Update message with fade effect
            message.innerHTML = `<i class="${mood.icon} message-icon"></i> ${mood.text}`;
            message.classList.remove('fade-in');
            void message.offsetWidth;
            message.classList.add('fade-in');
            
            // Update background
            document.body.style.background = mood.bg;
            
            // Update slider thumb color
            document.documentElement.style.setProperty('--thumb-color', mood.color);
            
            // Update message box border
            document.querySelector('.message-box').style.borderColor = mood.color + '20';
        }

        // Save mood to history
        function saveMood(moodValue) {
            const today = new Date().toDateString();
            
            // Check if we already have an entry for today
            const todayIndex = moodHistory.findIndex(entry => entry.date === today);
            
            if (todayIndex !== -1) {
                // Update today's entry
                moodHistory[todayIndex].mood = moodValue;
            } else {
                // Add new entry
                moodHistory.push({
                    date: today,
                    mood: moodValue
                });
                
                // Update streak
                streak = streak > 0 ? streak + 1 : 1;
            }
            
            // Save to localStorage
            const saveData = {
                moodHistory: moodHistory,
                streak: streak,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('moodTrackerData', JSON.stringify(saveData));
            
            // Update stats
            updateStats();
        }

        // Update statistics display
        function updateStats() {
            // Update streak
            streakCount.textContent = streak;
            
            // Update days tracked
            daysTracked.textContent = moodHistory.length;
            
            // Calculate average mood
            if (moodHistory.length > 0) {
                const total = moodHistory.reduce((sum, entry) => sum + entry.mood, 0);
                const average = (total / moodHistory.length).toFixed(1);
                avgMood.textContent = average;
                
                // Color code based on average
                if (average >= 3.5) {
                    avgMood.style.color = "#f7971e";
                } else if (average >= 2.5) {
                    avgMood.style.color = "#56ab2f";
                } else if (average >= 1.5) {
                    avgMood.style.color = "#667eea";
                } else {
                    avgMood.style.color = "#596275";
                }
            }
        }

        // Event listener for slider
        moodSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            updateMood(value);
        });

        // Event listener for when slider is released
        moodSlider.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            saveMood(value);
        });

        // Keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && currentMood > 0) {
                moodSlider.value = currentMood - 1;
                updateMood(currentMood - 1);
                saveMood(currentMood - 1);
            } else if (e.key === 'ArrowRight' && currentMood < 4) {
                moodSlider.value = currentMood + 1;
                updateMood(currentMood + 1);
                saveMood(currentMood + 1);
            }
        });

        // Initialize the app
        initApp();
