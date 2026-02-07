
        // Affirmation database
        const affirmations = [
            { text: "I am worthy of love, respect, and all good things that come my way.", category: "self-worth" },
            { text: "I trust in my ability to make the right decisions for myself.", category: "confidence" },
            { text: "Every day, I am growing and becoming the best version of myself.", category: "growth" },
            { text: "I choose to focus on the positive and let go of what I cannot control.", category: "positivity" },
            { text: "My mind is calm, my heart is open, and my soul is at peace.", category: "peace" },
            { text: "I am enough, just as I am in this moment.", category: "self-worth" },
            { text: "I have the power to create the life I desire and deserve.", category: "confidence" },
            { text: "Challenges are opportunities for me to learn and grow stronger.", category: "growth" },
            { text: "I radiate positivity and attract wonderful experiences into my life.", category: "positivity" },
            { text: "I release all fears and doubts, embracing the tranquility within.", category: "peace" },
            { text: "My self-worth is independent of others' opinions or validation.", category: "self-worth" },
            { text: "I am confident in expressing my ideas and sharing my unique perspective.", category: "confidence" },
            { text: "Every experience helps me evolve into a wiser, more compassionate person.", category: "growth" },
            { text: "I find joy in simple moments and gratitude in everyday blessings.", category: "positivity" },
            { text: "I am at peace with my past and excited for my future.", category: "peace" }
        ];
        
        // DOM elements
        const affirmationText = document.getElementById('affirmation-text');
        const affirmationCategory = document.getElementById('affirmation-category');
        const generateBtn = document.getElementById('generate-btn');
        const favoriteBtn = document.getElementById('favorite-btn');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const favoritesPanel = document.getElementById('favorites-panel');
        const favoritesList = document.getElementById('favorites-list');
        const countElement = document.getElementById('count');
        
        // State variables
        let currentAffirmation = affirmations[0];
        let currentCategory = 'all';
        let favorites = JSON.parse(localStorage.getItem('affirmationFavorites')) || [];
        let generatedCount = parseInt(localStorage.getItem('affirmationCount')) || 1;
        
        // Initialize
        function init() {
            updateCount();
            displayFavorites();
            
            // Check if current affirmation is in favorites
            updateFavoriteButton();
            
            // Set initial category button as active
            document.querySelector(`[data-category="${currentCategory}"]`).classList.add('active');
        }
        
        // Generate a random affirmation
        function generateAffirmation() {
            // Filter affirmations by category if not "all"
            let filteredAffirmations;
            if (currentCategory === 'all') {
                filteredAffirmations = affirmations;
            } else {
                filteredAffirmations = affirmations.filter(aff => aff.category === currentCategory);
            }
            
            // Get random affirmation from filtered list
            const randomIndex = Math.floor(Math.random() * filteredAffirmations.length);
            currentAffirmation = filteredAffirmations[randomIndex];
            
            // Update display with animation
            affirmationText.classList.remove('fade-in');
            void affirmationText.offsetWidth; // Trigger reflow to restart animation
            affirmationText.classList.add('fade-in');
            
            // Update text and category
            affirmationText.textContent = currentAffirmation.text;
            affirmationCategory.textContent = formatCategory(currentAffirmation.category);
            
            // Update favorite button state
            updateFavoriteButton();
            
            // Increment and update count
            generatedCount++;
            updateCount();
            localStorage.setItem('affirmationCount', generatedCount.toString());
            
            // Add pulse animation to affirmation display
            const display = document.querySelector('.affirmation-display');
            display.classList.remove('pulse');
            void display.offsetWidth; // Trigger reflow
            display.classList.add('pulse');
        }
        
        // Format category for display
        function formatCategory(category) {
            const categoryMap = {
                'self-worth': 'Self-Worth',
                'confidence': 'Confidence',
                'positivity': 'Positivity',
                'growth': 'Growth',
                'peace': 'Inner Peace'
            };
            
            return categoryMap[category] || category;
        }
        
        // Update the count display
        function updateCount() {
            countElement.textContent = generatedCount;
        }
        
        // Toggle favorite status
        function toggleFavorite() {
            const index = favorites.findIndex(fav => fav.text === currentAffirmation.text);
            
            if (index === -1) {
                // Add to favorites
                favorites.push(currentAffirmation);
                favoriteBtn.classList.add('active');
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
                
                // Show notification
                showNotification('Affirmation added to favorites!');
            } else {
                // Remove from favorites
                favorites.splice(index, 1);
                favoriteBtn.classList.remove('active');
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
                
                // Show notification
                showNotification('Affirmation removed from favorites.');
            }
            
            // Update localStorage
            localStorage.setItem('affirmationFavorites', JSON.stringify(favorites));
            
            // Update favorites display
            displayFavorites();
        }
        
        // Update favorite button based on current affirmation
        function updateFavoriteButton() {
            const isFavorite = favorites.some(fav => fav.text === currentAffirmation.text);
            
            if (isFavorite) {
                favoriteBtn.classList.add('active');
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
            } else {
                favoriteBtn.classList.remove('active');
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
            }
        }
        
        // Display favorites in the panel
        function displayFavorites() {
            // Clear the list
            favoritesList.innerHTML = '';
            
            if (favorites.length === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.textContent = 'No favorite affirmations yet. Click the heart to add some!';
                emptyItem.style.fontStyle = 'italic';
                emptyItem.style.color = '#718096';
                favoritesList.appendChild(emptyItem);
                favoritesPanel.classList.remove('show');
                return;
            }
            
            // Show the panel
            favoritesPanel.classList.add('show');
            
            // Add each favorite to the list
            favorites.forEach((fav, index) => {
                const listItem = document.createElement('li');
                
                const textSpan = document.createElement('span');
                textSpan.textContent = fav.text;
                textSpan.style.flexGrow = '1';
                textSpan.style.marginRight = '15px';
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.title = 'Remove from favorites';
                
                // Add event listener to remove button
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeFavorite(index);
                });
                
                listItem.appendChild(textSpan);
                listItem.appendChild(removeBtn);
                favoritesList.appendChild(listItem);
            });
        }
        
        // Remove a favorite by index
        function removeFavorite(index) {
            // If removing the current affirmation, update the favorite button
            if (favorites[index].text === currentAffirmation.text) {
                favoriteBtn.classList.remove('active');
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
            }
            
            // Remove from array
            favorites.splice(index, 1);
            
            // Update localStorage
            localStorage.setItem('affirmationFavorites', JSON.stringify(favorites));
            
            // Update display
            displayFavorites();
            
            // Show notification
            showNotification('Affirmation removed from favorites.');
        }
        
        // Show a temporary notification
        function showNotification(message) {
            // Create notification element
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #5a67d8;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                font-weight: 500;
                animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            `;
            
            // Add to document
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
        
        // Set category filter
        function setCategory(category) {
            currentCategory = category;
            
            // Update active state of buttons
            categoryBtns.forEach(btn => {
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Generate a new affirmation in this category
            generateAffirmation();
        }
        
        // Event listeners
        generateBtn.addEventListener('click', generateAffirmation);
        favoriteBtn.addEventListener('click', toggleFavorite);
        
        // Add event listeners to category buttons
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setCategory(btn.dataset.category);
            });
        });
        
        // Initialize the app
        init();
        
        // Add CSS for notification animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);