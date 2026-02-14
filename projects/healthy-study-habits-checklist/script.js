
        // Study habits data
        const studyHabits = {
            daily: [
                {
                    id: 1,
                    text: "Start with a clear study plan",
                    details: "Plan what you'll study today for better focus",
                    checked: false
                },
                {
                    id: 2,
                    text: "Take regular breaks (Pomodoro Technique)",
                    details: "Study for 25 mins, break for 5 mins",
                    checked: false
                },
                {
                    id: 3,
                    text: "Stay hydrated with enough water",
                    details: "Keep a water bottle nearby while studying",
                    checked: false
                },
                {
                    id: 4,
                    text: "Avoid multitasking",
                    details: "Focus on one subject or task at a time",
                    checked: false
                },
                {
                    id: 5,
                    text: "Review what you learned",
                    details: "Spend 10 mins at the end of the day reviewing",
                    checked: false
                },
                {
                    id: 6,
                    text: "Get 7-8 hours of sleep",
                    details: "Quality sleep enhances memory consolidation",
                    checked: false
                }
            ],
            weekly: [
                {
                    id: 7,
                    text: "Create a weekly study schedule",
                    details: "Plan your week ahead for balanced study sessions",
                    checked: false
                },
                {
                    id: 8,
                    text: "Review and organize notes",
                    details: "Spend time organizing and summarizing your notes",
                    checked: false
                },
                {
                    id: 9,
                    text: "Practice active recall",
                    details: "Test yourself on material you've learned",
                    checked: false
                },
                {
                    id: 10,
                    text: "Exercise at least 3 times",
                    details: "Physical activity improves cognitive function",
                    checked: false
                },
                {
                    id: 11,
                    text: "Connect with study group or peers",
                    details: "Discuss topics and teach each other",
                    checked: false
                },
                {
                    id: 12,
                    text: "Reflect on your progress",
                    details: "Assess what's working and what needs adjustment",
                    checked: false
                }
            ]
        };

        // DOM elements
        const dailyChecklist = document.getElementById('daily-checklist');
        const weeklyChecklist = document.getElementById('weekly-checklist');
        const progressFill = document.querySelector('.progress-fill');
        const progressPercent = document.querySelector('.progress-percent');
        const completedCount = document.querySelector('.completed-count');
        const totalCount = document.querySelector('.total-count');
        const resetBtn = document.getElementById('resetBtn');
        const fireworksContainer = document.getElementById('fireworks');
        const completionAnimation = document.getElementById('completionAnimation');
        const closeBtn = document.getElementById('closeBtn');

        // Initialize the checklist
        function initializeChecklist() {
            // Clear existing items
            dailyChecklist.innerHTML = '';
            weeklyChecklist.innerHTML = '';
            
            // Load from localStorage if available
            const savedData = localStorage.getItem('studyHabits');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                studyHabits.daily = parsedData.daily;
                studyHabits.weekly = parsedData.weekly;
            }
            
            // Create daily checklist items
            studyHabits.daily.forEach(habit => {
                createChecklistItem(habit, dailyChecklist);
            });
            
            // Create weekly checklist items
            studyHabits.weekly.forEach(habit => {
                createChecklistItem(habit, weeklyChecklist);
            });
            
            // Update progress
            updateProgress();
        }

        // Create a checklist item
        function createChecklistItem(habit, container) {
            const li = document.createElement('li');
            li.className = `checklist-item ${habit.checked ? 'checked' : ''}`;
            li.dataset.id = habit.id;
            
            li.innerHTML = `
                <div class="checkbox">
                    <i class="fas fa-check"></i>
                </div>
                <div class="item-content">
                    <div class="item-text">${habit.text}</div>
                    <div class="item-details">${habit.details}</div>
                </div>
            `;
            
            // Add click event
            li.addEventListener('click', () => {
                toggleHabit(habit.id);
            });
            
            container.appendChild(li);
        }

        // Toggle habit status
        function toggleHabit(id) {
            // Find the habit in daily or weekly
            let habit = studyHabits.daily.find(h => h.id === id);
            let listType = 'daily';
            
            if (!habit) {
                habit = studyHabits.weekly.find(h => h.id === id);
                listType = 'weekly';
            }
            
            if (habit) {
                habit.checked = !habit.checked;
                
                // Update UI
                const itemElement = document.querySelector(`.checklist-item[data-id="${id}"]`);
                itemElement.classList.toggle('checked');
                
                // Animate checkbox
                const checkbox = itemElement.querySelector('.checkbox');
                if (habit.checked) {
                    // Add a little bounce animation when checked
                    checkbox.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        checkbox.style.transform = 'scale(1)';
                    }, 300);
                    
                    // Add a subtle particle effect
                    createParticleEffect(itemElement);
                }
                
                // Update progress
                updateProgress();
                
                // Save to localStorage
                saveProgress();
                
                // Check if all habits are completed
                if (isAllCompleted()) {
                    showCompletionAnimation();
                }
            }
        }

        // Update progress bar and stats
        function updateProgress() {
            const totalHabits = studyHabits.daily.length + studyHabits.weekly.length;
            const completedHabits = studyHabits.daily.filter(h => h.checked).length + 
                                   studyHabits.weekly.filter(h => h.checked).length;
            
            const percentage = Math.round((completedHabits / totalHabits) * 100);
            
            // Update progress bar
            progressFill.style.width = `${percentage}%`;
            progressPercent.textContent = `${percentage}%`;
            completedCount.textContent = `${completedHabits} habit${completedHabits !== 1 ? 's' : ''} completed`;
            totalCount.textContent = `${totalHabits} total habits`;
            
            // Trigger fireworks if progress is 100%
            if (percentage === 100) {
                triggerFireworks();
            }
        }

        // Create particle effect when checking an item
        function createParticleEffect(element) {
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            for (let i = 0; i < 5; i++) {
                const particle = document.createElement('div');
                particle.className = 'firework';
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                particle.style.backgroundColor = getRandomColor();
                
                fireworksContainer.appendChild(particle);
                
                // Random direction and animation
                const angle = Math.random() * Math.PI * 2;
                const velocity = 2 + Math.random() * 3;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                let posX = x;
                let posY = y;
                let opacity = 1;
                
                function animateParticle() {
                    opacity -= 0.03;
                    posX += vx;
                    posY += vy;
                    
                    particle.style.left = `${posX}px`;
                    particle.style.top = `${posY}px`;
                    particle.style.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        particle.remove();
                    }
                }
                
                animateParticle();
            }
        }

        // Trigger fireworks animation
        function triggerFireworks() {
            fireworksContainer.style.opacity = '1';
            
            // Create multiple fireworks
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    createFirework();
                }, i * 200);
            }
            
            // Hide fireworks after 5 seconds
            setTimeout(() => {
                fireworksContainer.style.opacity = '0';
            }, 5000);
        }

        // Create a single firework
        function createFirework() {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = `${Math.random() * 100}%`;
            firework.style.top = `${Math.random() * 100}%`;
            firework.style.backgroundColor = getRandomColor();
            firework.style.width = `${Math.random() * 6 + 3}px`;
            firework.style.height = firework.style.width;
            
            fireworksContainer.appendChild(firework);
            
            // Animate firework explosion
            const duration = 1 + Math.random() * 2;
            firework.style.animation = `confetti ${duration}s linear forwards`;
            
            // Remove after animation
            setTimeout(() => {
                firework.remove();
            }, duration * 1000);
        }

        // Get random color for particles
        function getRandomColor() {
            const colors = ['#4361ee', '#3a0ca3', '#4cc9f0', '#06d6a0', '#ffd166', '#ef476f'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Show completion animation
        function showCompletionAnimation() {
            completionAnimation.classList.add('active');
        }

        // Close completion animation
        closeBtn.addEventListener('click', () => {
            completionAnimation.classList.remove('active');
        });

        // Reset all progress
        resetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset all progress?")) {
                // Reset all habits
                studyHabits.daily.forEach(habit => habit.checked = false);
                studyHabits.weekly.forEach(habit => habit.checked = false);
                
                // Reinitialize checklist
                initializeChecklist();
                
                // Hide completion animation if visible
                completionAnimation.classList.remove('active');
                
                // Hide fireworks
                fireworksContainer.style.opacity = '0';
                
                // Clear all particles
                fireworksContainer.innerHTML = '';
            }
        });

        // Save progress to localStorage
        function saveProgress() {
            localStorage.setItem('studyHabits', JSON.stringify(studyHabits));
        }

        // Check if all habits are completed
        function isAllCompleted() {
            const allHabits = [...studyHabits.daily, ...studyHabits.weekly];
            return allHabits.every(habit => habit.checked);
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', initializeChecklist);
        
        // Add some motivational quotes that change periodically
        const motivationalQuotes = [
            {text: "The secret of getting ahead is getting started.", author: "Mark Twain"},
            {text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki"},
            {text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson"},
            {text: "The only way to learn mathematics is to do mathematics.", author: "Paul Halmos"},
            {text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier"},
            {text: "The expert in anything was once a beginner.", author: "Helen Hayes"}
        ];
        
        // Change quote every 10 seconds
        let quoteIndex = 0;
        const motivationText = document.querySelector('.motivation-text');
        const motivationAuthor = document.querySelector('.motivation-author');
        
        function changeQuote() {
            quoteIndex = (quoteIndex + 1) % motivationalQuotes.length;
            const quote = motivationalQuotes[quoteIndex];
            
            // Fade out
            motivationText.style.opacity = '0';
            motivationAuthor.style.opacity = '0';
            
            setTimeout(() => {
                motivationText.textContent = `"${quote.text}"`;
                motivationAuthor.textContent = `- ${quote.author}`;
                
                // Fade in
                motivationText.style.opacity = '1';
                motivationAuthor.style.opacity = '1';
            }, 500);
        }
        
        // Start quote rotation
        setInterval(changeQuote, 10000);
    