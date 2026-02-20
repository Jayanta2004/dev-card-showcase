
        // Idea database with categories
        const ideas = {
            writing: [
                "Write a short story from the perspective of a forgotten childhood toy",
                "Create a poem about the changing seasons using only metaphors",
                "Develop a character who discovers they can hear people's thoughts but only when they lie",
                "Write a dialogue between two strangers stuck in an elevator during a power outage",
                "Craft a story about a world where memories can be bought and sold"
            ],
            art: [
                "Paint a landscape using only three colors and their shades",
                "Create a collage from recycled materials that represents your city",
                "Draw a self-portrait without looking at the paper or lifting your pen",
                "Design a poster for a movie that doesn't exist yet",
                "Sculpt something using only materials found in nature"
            ],
            technology: [
                "Build an app that helps people track their daily water intake with fun reminders",
                "Create a website that generates random writing prompts with visual inspiration",
                "Design a smart home device that helps reduce food waste",
                "Develop a browser extension that simplifies online research for students",
                "Build a simple game that teaches basic programming concepts"
            ],
            business: [
                "Start a subscription service for locally sourced, zero-waste household products",
                "Create an online platform connecting retired professionals with mentorship opportunities",
                "Develop a mobile app that helps small businesses manage customer loyalty programs",
                "Launch a service that offers personalized learning paths for skill development",
                "Start a business that turns food waste from restaurants into compost for community gardens"
            ],
            life: [
                "Learn a new language by watching one foreign film per week with subtitles",
                "Start a 30-day challenge to try a new recipe from a different country each day",
                "Create a monthly 'skill swap' with friends where each person teaches something they're good at",
                "Organize a community cleanup event in your local park or neighborhood",
                "Start a gratitude journal where you document three positive things each day"
            ]
        };

        // DOM elements
        const ideaText = document.getElementById('ideaText');
        const ideaCategory = document.getElementById('ideaCategory');
        const generateBtn = document.getElementById('generateBtn');
        const historyList = document.getElementById('historyList');
        const clearHistory = document.getElementById('clearHistory');
        const ideaCount = document.getElementById('ideaCount');
        
        // State variables
        let currentIdea = '';
        let currentCategory = '';
        let history = JSON.parse(localStorage.getItem('ideaHistory')) || [];
        let generatedCount = parseInt(localStorage.getItem('generatedCount')) || 0;
        
        // Update the counter display
        updateCounter();
        
        // Load history from localStorage
        loadHistory();
        
        // Generate a random idea
        function generateIdea() {
            // Get all categories
            const categories = Object.keys(ideas);
            
            // Pick a random category
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            
            // Pick a random idea from that category
            const categoryIdeas = ideas[randomCategory];
            const randomIdea = categoryIdeas[Math.floor(Math.random() * categoryIdeas.length)];
            
            // Store current idea and category
            currentIdea = randomIdea;
            currentCategory = randomCategory;
            
            // Add fade out animation
            ideaText.classList.add('fade-out');
            ideaCategory.classList.add('fade-out');
            
            // After fade out, update text and fade in
            setTimeout(() => {
                // Update the display
                ideaText.textContent = currentIdea;
                ideaCategory.textContent = randomCategory.charAt(0).toUpperCase() + randomCategory.slice(1);
                
                // Add fade in animation
                ideaText.classList.remove('fade-out');
                ideaCategory.classList.remove('fade-out');
                ideaText.classList.add('fade-in');
                ideaCategory.classList.add('fade-in');
                
                // Add pulse animation to the container
                document.querySelector('.idea-display').classList.add('pulse');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    ideaText.classList.remove('fade-in');
                    ideaCategory.classList.remove('fade-in');
                    document.querySelector('.idea-display').classList.remove('pulse');
                }, 500);
                
                // Add to history
                addToHistory(currentIdea, randomCategory);
                
                // Update counter
                generatedCount++;
                updateCounter();
                localStorage.setItem('generatedCount', generatedCount);
            }, 300);
        }
        
        // Add idea to history
        function addToHistory(idea, category) {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const historyItem = {
                idea: idea,
                category: category,
                time: timestamp
            };
            
            // Add to beginning of history array
            history.unshift(historyItem);
            
            // Keep only last 10 items
            if (history.length > 10) {
                history = history.slice(0, 10);
            }
            
            // Save to localStorage
            localStorage.setItem('ideaHistory', JSON.stringify(history));
            
            // Update history display
            loadHistory();
        }
        
        // Load history from localStorage
        function loadHistory() {
            // Clear current history list
            historyList.innerHTML = '';
            
            if (history.length === 0) {
                historyList.innerHTML = '<div class="history-item">No ideas generated yet. Click the button above to start!</div>';
                return;
            }
            
            // Add each history item to the list
            history.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <strong>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</strong>: ${item.idea}
                    <div style="color: var(--gray); font-size: 0.8rem; margin-top: 0.3rem;">${item.time}</div>
                `;
                historyList.appendChild(historyItem);
            });
        }
        
        // Update the counter display
        function updateCounter() {
            ideaCount.textContent = generatedCount;
        }
        
        // Clear history
        function clearHistoryList() {
            if (confirm("Are you sure you want to clear your idea history?")) {
                history = [];
                localStorage.setItem('ideaHistory', JSON.stringify(history));
                loadHistory();
            }
        }
        
        // Event listeners
        generateBtn.addEventListener('click', generateIdea);
        clearHistory.addEventListener('click', clearHistoryList);
        
        // Add keyboard shortcut (Spacebar to generate new idea)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('button, input, textarea')) {
                e.preventDefault();
                generateIdea();
            }
        });
        
        // Add a welcome idea after page loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                // Display a random welcome idea
                const categories = Object.keys(ideas);
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                const categoryIdeas = ideas[randomCategory];
                const randomIdea = categoryIdeas[Math.floor(Math.random() * categoryIdeas.length)];
                
                ideaText.textContent = randomIdea;
                ideaCategory.textContent = randomCategory.charAt(0).toUpperCase() + randomCategory.slice(1);
            }, 500);
        });
