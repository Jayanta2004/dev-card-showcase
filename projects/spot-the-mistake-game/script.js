
        // Game state
        const gameState = {
            score: 0,
            timeLeft: 60,
            level: 1,
            mistakesFound: 0,
            totalMistakes: 5,
            gameActive: false,
            timerInterval: null,
            currentMistakeIndex: 0,
            selectedElement: null,
            hintsUsed: 0
        };

        // Game data - UI elements and mistakes for each level
        const gameData = [
            {
                level: 1,
                title: "Icon Consistency",
                mistake: { elementId: 3, type: "icon", correctIcon: "fas fa-envelope", wrongIcon: "fas fa-envelope-open" },
                explanation: "The envelope icon should be closed (fa-envelope) to match the 'Unread Messages' label, not open (fa-envelope-open).",
                elements: [
                    { id: 1, icon: "fas fa-user", label: "Profile" },
                    { id: 2, icon: "fas fa-cog", label: "Settings" },
                    { id: 3, icon: "fas fa-envelope", label: "Unread Messages" },
                    { id: 4, icon: "fas fa-bell", label: "Notifications" },
                    { id: 5, icon: "fas fa-chart-bar", label: "Analytics" },
                    { id: 6, icon: "fas fa-database", label: "Data Storage" },
                    { id: 7, icon: "fas fa-shield-alt", label: "Security" },
                    { id: 8, icon: "fas fa-cloud-upload-alt", label: "Upload" }
                ]
            },
            {
                level: 2,
                title: "Color Consistency",
                mistake: { elementId: 6, type: "color", correctColor: "#4361ee", wrongColor: "#f72585" },
                explanation: "The 'Data Storage' element should use the primary blue color (#4361ee) to maintain consistency with the design system, not pink (#f72585).",
                elements: [
                    { id: 1, icon: "fas fa-mobile-alt", label: "Mobile App" },
                    { id: 2, icon: "fas fa-desktop", label: "Desktop" },
                    { id: 3, icon: "fas fa-tablet-alt", label: "Tablet" },
                    { id: 4, icon: "fas fa-wifi", label: "Connectivity" },
                    { id: 5, icon: "fas fa-battery-full", label: "Battery" },
                    { id: 6, icon: "fas fa-database", label: "Data Storage" },
                    { id: 7, icon: "fas fa-memory", label: "Memory" },
                    { id: 8, icon: "fas fa-microchip", label: "Processor" }
                ]
            },
            {
                level: 3,
                title: "Label Alignment",
                mistake: { elementId: 2, type: "label", correctLabel: "User Settings", wrongLabel: "Settings User" },
                explanation: "The label should read 'User Settings' for proper English grammar and consistency with other labels, not 'Settings User'.",
                elements: [
                    { id: 1, icon: "fas fa-home", label: "Dashboard" },
                    { id: 2, icon: "fas fa-cog", label: "User Settings" },
                    { id: 3, icon: "fas fa-users", label: "Team Members" },
                    { id: 4, icon: "fas fa-file-invoice", label: "Invoices" },
                    { id: 5, icon: "fas fa-calendar", label: "Calendar" },
                    { id: 6, icon: "fas fa-chart-line", label: "Statistics" },
                    { id: 7, icon: "fas fa-comments", label: "Messages" },
                    { id: 8, icon: "fas fa-box", label: "Products" }
                ]
            },
            {
                level: 4,
                title: "Missing Element",
                mistake: { elementId: 5, type: "missing", missing: true },
                explanation: "The 'Calendar' element is completely missing from the right layout, breaking the UI consistency.",
                elements: [
                    { id: 1, icon: "fas fa-tachometer-alt", label: "Speed Test" },
                    { id: 2, icon: "fas fa-hdd", label: "Storage" },
                    { id: 3, icon: "fas fa-network-wired", label: "Network" },
                    { id: 4, icon: "fas fa-key", label: "Security Key" },
                    { id: 5, icon: "fas fa-calendar", label: "Calendar" },
                    { id: 6, icon: "fas fa-tasks", label: "Tasks" },
                    { id: 7, icon: "fas fa-history", label: "History" },
                    { id: 8, icon: "fas fa-trash-alt", label: "Trash" }
                ]
            },
            {
                level: 5,
                title: "Position Swap",
                mistake: { elementId: 4, type: "position", swapWith: 7 },
                explanation: "The 'Security' and 'Messages' elements are swapped. 'Security' should be in position 4, not position 7.",
                elements: [
                    { id: 1, icon: "fas fa-paint-brush", label: "Design" },
                    { id: 2, icon: "fas fa-code", label: "Development" },
                    { id: 3, icon: "fas fa-bug", label: "Testing" },
                    { id: 4, icon: "fas fa-shield-alt", label: "Security" },
                    { id: 5, icon: "fas fa-rocket", label: "Deployment" },
                    { id: 6, icon: "fas fa-chart-pie", label: "Analytics" },
                    { id: 7, icon: "fas fa-comments", label: "Messages" },
                    { id: 8, icon: "fas fa-question-circle", label: "Support" }
                ]
            }
        ];

        // DOM Elements
        const timerElement = document.getElementById('timer');
        const scoreElement = document.getElementById('score');
        const foundElement = document.getElementById('found');
        const levelElement = document.getElementById('level');
        const currentLevelElement = document.getElementById('current-level');
        const referenceLayout = document.getElementById('reference-layout');
        const challengeLayout = document.getElementById('challenge-layout');
        const feedbackContainer = document.getElementById('feedback');
        const feedbackText = document.getElementById('feedback-text');
        const hintButton = document.getElementById('hint-btn');
        const nextButton = document.getElementById('next-btn');
        const restartButton = document.getElementById('restart-btn');
        const gameCompleteElement = document.getElementById('game-complete');
        const finalScoreElement = document.getElementById('final-score');
        const finalTimeElement = document.getElementById('final-time');
        const accuracyElement = document.getElementById('accuracy');
        const playAgainButton = document.getElementById('play-again-btn');

        // Initialize the game
        function initGame() {
            gameState.score = 0;
            gameState.timeLeft = 60;
            gameState.level = 1;
            gameState.mistakesFound = 0;
            gameState.gameActive = true;
            gameState.currentMistakeIndex = 0;
            gameState.selectedElement = null;
            gameState.hintsUsed = 0;
            
            updateUI();
            loadLevel(gameState.currentMistakeIndex);
            startTimer();
            
            // Hide game complete screen
            gameCompleteElement.classList.remove('show');
            
            // Reset buttons
            nextButton.disabled = true;
            nextButton.innerHTML = '<i class="fas fa-arrow-right"></i> Next Challenge';
        }

        // Start the timer
        function startTimer() {
            clearInterval(gameState.timerInterval);
            
            gameState.timerInterval = setInterval(() => {
                if (!gameState.gameActive) return;
                
                gameState.timeLeft--;
                updateTimerDisplay();
                
                if (gameState.timeLeft <= 0) {
                    endGame();
                } else if (gameState.timeLeft <= 10) {
                    timerElement.classList.add('timer-warning');
                }
            }, 1000);
        }

        // Update timer display
        function updateTimerDisplay() {
            timerElement.textContent = gameState.timeLeft;
        }

        // Load a specific level
        function loadLevel(levelIndex) {
            const levelData = gameData[levelIndex];
            gameState.selectedElement = null;
            
            // Update level display
            currentLevelElement.textContent = levelData.level;
            
            // Clear layouts
            referenceLayout.innerHTML = '';
            challengeLayout.innerHTML = '';
            
            // Hide feedback
            feedbackContainer.classList.remove('show');
            
            // Create reference layout (correct version)
            levelData.elements.forEach(element => {
                const elementDiv = document.createElement('div');
                elementDiv.className = 'ui-element';
                elementDiv.dataset.id = element.id;
                
                const icon = document.createElement('i');
                icon.className = element.icon;
                
                const label = document.createElement('div');
                label.className = 'element-label';
                label.textContent = element.label;
                
                elementDiv.appendChild(icon);
                elementDiv.appendChild(label);
                
                referenceLayout.appendChild(elementDiv);
            });
            
            // Create challenge layout (with mistake)
            const mistake = levelData.mistake;
            
            levelData.elements.forEach(element => {
                const elementDiv = document.createElement('div');
                elementDiv.className = 'ui-element';
                elementDiv.dataset.id = element.id;
                
                // Add click event
                elementDiv.addEventListener('click', () => selectElement(elementDiv, element.id));
                
                const icon = document.createElement('i');
                const label = document.createElement('div');
                label.className = 'element-label';
                
                // Check if this element has the mistake
                if (element.id === mistake.elementId) {
                    elementDiv.classList.add('mistake');
                    
                    // Apply the mistake based on type
                    switch (mistake.type) {
                        case 'icon':
                            icon.className = mistake.wrongIcon;
                            label.textContent = element.label;
                            break;
                        case 'color':
                            icon.className = element.icon;
                            icon.style.color = mistake.wrongColor;
                            label.textContent = element.label;
                            break;
                        case 'label':
                            icon.className = element.icon;
                            label.textContent = mistake.wrongLabel;
                            break;
                        case 'missing':
                            // Don't add this element to challenge layout
                            return;
                        case 'position':
                            // Handle position swap in a separate pass
                            icon.className = element.icon;
                            label.textContent = element.label;
                            break;
                        default:
                            icon.className = element.icon;
                            label.textContent = element.label;
                    }
                } else if (mistake.type === 'position' && element.id === mistake.swapWith) {
                    // For position swap, put the swapped element here
                    const swappedElement = levelData.elements.find(e => e.id === mistake.elementId);
                    icon.className = swappedElement.icon;
                    label.textContent = swappedElement.label;
                } else {
                    // Normal element
                    icon.className = element.icon;
                    label.textContent = element.label;
                }
                
                elementDiv.appendChild(icon);
                elementDiv.appendChild(label);
                
                challengeLayout.appendChild(elementDiv);
            });
            
            // Update UI
            updateUI();
        }

        // Handle element selection
        function selectElement(elementDiv, elementId) {
            if (!gameState.gameActive || gameState.selectedElement) return;
            
            const levelData = gameData[gameState.currentMistakeIndex];
            const mistake = levelData.mistake;
            
            // Clear any previous selection
            document.querySelectorAll('.ui-element.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Mark selected element
            elementDiv.classList.add('selected');
            gameState.selectedElement = elementId;
            
            // Check if correct
            const isCorrect = elementId === mistake.elementId;
            
            if (isCorrect) {
                // Correct selection
                elementDiv.classList.add('correct');
                gameState.score += 100;
                gameState.mistakesFound++;
                
                // Bonus for time left
                if (gameState.timeLeft > 40) {
                    gameState.score += 50;
                } else if (gameState.timeLeft > 20) {
                    gameState.score += 25;
                }
                
                // Show feedback
                feedbackText.textContent = `Correct! ${levelData.explanation}`;
                feedbackContainer.classList.add('show');
                
                // Enable next button
                nextButton.disabled = false;
                
                // Update UI
                updateUI();
                
                // Check if game is complete
                if (gameState.mistakesFound >= gameState.totalMistakes) {
                    setTimeout(endGame, 1500);
                }
            } else {
                // Wrong selection
                feedbackText.textContent = "Not quite right. Look for inconsistencies in icons, colors, labels, or element positions.";
                feedbackContainer.classList.add('show');
                
                // Penalty for wrong selection
                gameState.score = Math.max(0, gameState.score - 20);
                gameState.timeLeft = Math.max(5, gameState.timeLeft - 5);
                
                updateUI();
                
                // Clear selection after a delay
                setTimeout(() => {
                    elementDiv.classList.remove('selected');
                    gameState.selectedElement = null;
                }, 1500);
            }
        }

        // Update UI elements
        function updateUI() {
            scoreElement.textContent = gameState.score;
            foundElement.textContent = `${gameState.mistakesFound}/${gameState.totalMistakes}`;
            levelElement.textContent = gameState.level;
            updateTimerDisplay();
        }

        // Provide a hint
        function provideHint() {
            if (!gameState.gameActive || gameState.hintsUsed >= 2) return;
            
            const levelData = gameData[gameState.currentMistakeIndex];
            const mistake = levelData.mistake;
            
            // Highlight the mistake area
            const mistakeElement = document.querySelector(`.ui-element[data-id="${mistake.elementId}"]`);
            if (mistakeElement) {
                mistakeElement.style.animation = "pulse 1s ease 3";
                setTimeout(() => {
                    mistakeElement.style.animation = "";
                }, 3000);
            }
            
            // Update score
            gameState.score = Math.max(0, gameState.score - 30);
            gameState.hintsUsed++;
            
            // Update hint button if max hints used
            if (gameState.hintsUsed >= 2) {
                hintButton.disabled = true;
                hintButton.innerHTML = '<i class="fas fa-lightbulb"></i> No Hints Left';
            }
            
            updateUI();
        }

        // Move to next level
        function nextLevel() {
            if (gameState.currentMistakeIndex >= gameData.length - 1) {
                endGame();
                return;
            }
            
            gameState.currentMistakeIndex++;
            gameState.level++;
            loadLevel(gameState.currentMistakeIndex);
            
            // Disable next button until next selection
            nextButton.disabled = true;
            
            updateUI();
        }

        // End the game
        function endGame() {
            gameState.gameActive = false;
            clearInterval(gameState.timerInterval);
            
            // Calculate accuracy
            const accuracy = gameState.mistakesFound / gameState.totalMistakes * 100;
            
            // Update final score display
            finalScoreElement.textContent = gameState.score;
            finalTimeElement.textContent = gameState.timeLeft;
            accuracyElement.textContent = `${accuracy.toFixed(0)}%`;
            
            // Show game complete screen
            gameCompleteElement.classList.add('show');
        }

        // Event Listeners
        hintButton.addEventListener('click', provideHint);
        nextButton.addEventListener('click', nextLevel);
        restartButton.addEventListener('click', initGame);
        playAgainButton.addEventListener('click', initGame);

        // Initialize the game on load
        document.addEventListener('DOMContentLoaded', initGame);
    