
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const panelsContainer = document.getElementById('panelsContainer');
            const puzzleDisplay = document.getElementById('puzzleDisplay');
            const puzzleTitle = document.getElementById('puzzleTitle');
            const puzzleContent = document.getElementById('puzzleContent');
            const puzzleClose = document.getElementById('puzzleClose');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const successScreen = document.getElementById('successScreen');
            const restartButton = document.getElementById('restartButton');
            
            // Audio elements
            const correctSound = document.getElementById('correctSound');
            const wrongSound = document.getElementById('wrongSound');
            const pageSound = document.getElementById('pageSound');
            const successSound = document.getElementById('successSound');
            
            // Game state
            let gameState = {
                currentPanel: null,
                solvedPanels: [],
                inventory: [],
                hintsUsed: 0
            };
            
            // Puzzle data
            const puzzles = [
                {
                    id: 1,
                    title: "The Locked Door",
                    description: "You find yourself in a mysterious room. The door is locked with a strange mechanism. There's a note on the table with a riddle.",
                    status: "unsolved",
                    solution: "2718",
                    type: "riddle",
                    content: {
                        visual: `
                            <div style="text-align: center; width: 100%;">
                                <div style="font-size: 5rem; margin-bottom: 20px;">🔒</div>
                                <div style="font-family: 'Bangers', cursive; font-size: 2rem; color: var(--comic-red); margin-bottom: 10px;">4-DIGIT LOCK</div>
                                <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                                    <div style="width: 50px; height: 70px; background-color: #333; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">?</div>
                                    <div style="width: 50px; height: 70px; background-color: #333; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">?</div>
                                    <div style="width: 50px; height: 70px; background-color: #333; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">?</div>
                                    <div style="width: 50px; height: 70px; background-color: #333; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">?</div>
                                </div>
                            </div>
                        `,
                        instructions: "Solve the riddle to find the 4-digit code:<br><br>'I am not a circle, but I never end. I'm found in math, on which you depend. The first four digits of me, to the door you must send.'",
                        hint: "Think about a famous mathematical constant that starts with 2.718..."
                    }
                },
                {
                    id: 2,
                    title: "The Cryptic Message",
                    description: "You discover a torn piece of paper with a strange coded message. It seems to be written in some kind of cipher.",
                    status: "unsolved",
                    solution: "COMIC",
                    type: "cipher",
                    content: {
                        visual: `
                            <div style="text-align: center; width: 100%;">
                                <div style="font-size: 5rem; margin-bottom: 20px;">📜</div>
                                <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px; border: 3px solid var(--panel-border); font-family: monospace; font-size: 1.5rem; letter-spacing: 5px;">
                                    DPNJD
                                </div>
                                <div style="margin-top: 20px; font-weight: bold; color: var(--comic-blue);">
                                    Caesar Cipher: Shift = ?
                                </div>
                            </div>
                        `,
                        instructions: "The message 'DPNJD' is encoded using a Caesar cipher. Each letter is shifted by the same amount in the alphabet. What does it say?",
                        hint: "Try shifting each letter backward by 1 position in the alphabet."
                    }
                },
                {
                    id: 3,
                    title: "The Pattern Puzzle",
                    description: "A wall panel has a sequence of symbols. You need to figure out the pattern to continue the sequence.",
                    status: "unsolved",
                    solution: "TRIANGLE",
                    type: "pattern",
                    content: {
                        visual: `
                            <div style="text-align: center; width: 100%;">
                                <div style="font-size: 5rem; margin-bottom: 20px;">🧩</div>
                                <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
                                    <div style="font-size: 3rem;">⬜</div>
                                    <div style="font-size: 3rem;">🔶</div>
                                    <div style="font-size: 3rem;">⬜</div>
                                    <div style="font-size: 3rem;">🔶</div>
                                    <div style="font-size: 3rem;">⬜</div>
                                    <div style="font-size: 3rem;">?</div>
                                </div>
                                <div style="font-weight: bold; color: var(--comic-purple);">
                                    Pattern: Square, Triangle, Square, Triangle, Square, ?
                                </div>
                            </div>
                        `,
                        instructions: "Identify the pattern in the sequence and determine what comes next. Enter your answer as a word (e.g., 'TRIANGLE' or 'SQUARE').",
                        hint: "Look at the alternating pattern. What comes after a square in this sequence?"
                    }
                },
                {
                    id: 4,
                    title: "The Hidden Objects",
                    description: "A detailed illustration contains several hidden objects. Find all the items to reveal a clue.",
                    status: "unsolved",
                    solution: "KEY",
                    type: "hidden",
                    content: {
                        visual: `
                            <div style="text-align: center; width: 100%;">
                                <div style="font-size: 5rem; margin-bottom: 20px;">🔍</div>
                                <div style="background-color: #e0e0e0; padding: 20px; border-radius: 10px; border: 3px solid var(--panel-border); position: relative; min-height: 200px;">
                                    <div style="position: absolute; top: 30px; left: 40px; font-size: 2rem;">🗝️</div>
                                    <div style="position: absolute; top: 80px; right: 60px; font-size: 2rem;">📖</div>
                                    <div style="position: absolute; bottom: 50px; left: 100px; font-size: 2rem;">🕯️</div>
                                    <div style="position: absolute; bottom: 30px; right: 100px; font-size: 2rem;">✏️</div>
                                </div>
                                <div style="margin-top: 20px; font-weight: bold; color: var(--comic-green);">
                                    Find the hidden objects! One of them is the answer.
                                </div>
                            </div>
                        `,
                        instructions: "Look at the scene above. One of the hidden objects is the answer to this puzzle. Which object might unlock something?",
                        hint: "Think about what you would use to unlock a door."
                    }
                },
                {
                    id: 5,
                    title: "The Math Challenge",
                    description: "A strange device displays a mathematical equation. Solve it to proceed.",
                    status: "unsolved",
                    solution: "42",
                    type: "math",
                    content: {
                        visual: `
                            <div style="text-align: center; width: 100%;">
                                <div style="font-size: 5rem; margin-bottom: 20px;">🧮</div>
                                <div style="background-color: #333; color: white; padding: 20px; border-radius: 10px; font-family: monospace; font-size: 1.8rem; margin-bottom: 20px;">
                                    (7 × 6) + (10 ÷ 2) - 5 = ?
                                </div>
                                <div style="font-weight: bold; color: var(--comic-yellow);">
                                    Solve the equation to find the answer.
                                </div>
                            </div>
                        `,
                        instructions: "Calculate the mathematical expression above. Enter the numerical answer.",
                        hint: "Remember the order of operations: parentheses first, then multiplication/division, then addition/subtraction."
                    }
                },
                {
                    id: 6,
                    title: "The Final Combination",
                    description: "You've reached the final panel! Combine all the clues you've collected to escape.",
                    status: "unsolved",
                    solution: "COMICBOOK",
                    type: "final",
                    content: {
                        visual: `
                            <div style="text-align: center; width: 100%;">
                                <div style="font-size: 5rem; margin-bottom: 20px;">🚪</div>
                                <div style="background-color: #222; color: white; padding: 20px; border-radius: 10px; font-family: monospace; font-size: 1.2rem; margin-bottom: 20px; text-align: left;">
                                    <div>PANEL 1: First letter of solution = C</div>
                                    <div>PANEL 2: The decoded word = COMIC</div>
                                    <div>PANEL 3: Shape = TRIANGLE (not needed)</div>
                                    <div>PANEL 4: Hidden object = KEY (K)</div>
                                    <div>PANEL 5: Mathematical answer = 42 (not needed)</div>
                                    <div>PANEL 6: Combine all relevant letters...</div>
                                </div>
                                <div style="font-weight: bold; color: var(--comic-red);">
                                    Combine the clues to form the final password!
                                </div>
                            </div>
                        `,
                        instructions: "You need to combine clues from previous puzzles. From Panel 1, take the first letter of the solution. From Panel 2, use the whole word. From Panel 4, use the first letter. Combine them to form one word.",
                        hint: "C + COMIC + K = C COMIC K. Now rearrange to form a meaningful word."
                    }
                }
            ];
            
            // Initialize the game
            function init() {
                // Load saved game state
                loadGameState();
                
                // Create panels
                createPanels();
                
                // Set up event listeners
                setupEventListeners();
                
                // Update progress
                updateProgress();
                
                // Play page turn sound
                playSound(pageSound);
            }
            
            // Create comic panels
            function createPanels() {
                panelsContainer.innerHTML = '';
                
                puzzles.forEach(puzzle => {
                    const panel = document.createElement('div');
                    panel.className = `panel ${puzzle.status === 'solved' ? 'solved' : 'unsolved'} ${puzzle.id > 1 && !isPanelUnlocked(puzzle.id) ? 'locked' : ''}`;
                    panel.dataset.id = puzzle.id;
                    
                    // Panel number
                    const panelNumber = document.createElement('div');
                    panelNumber.className = 'panel-number';
                    panelNumber.textContent = puzzle.id;
                    
                    // Panel content
                    const panelContent = document.createElement('div');
                    panelContent.className = 'panel-content';
                    
                    // Panel title
                    const panelTitle = document.createElement('h3');
                    panelTitle.className = 'panel-title';
                    panelTitle.textContent = puzzle.title;
                    
                    // Panel image placeholder
                    const panelImage = document.createElement('div');
                    panelImage.className = 'panel-image';
                    
                    // Different icons for different puzzle types
                    const iconMap = {
                        'riddle': '🔍',
                        'cipher': '📜',
                        'pattern': '🧩',
                        'hidden': '🔎',
                        'math': '🧮',
                        'final': '🚪'
                    };
                    
                    panelImage.innerHTML = `<div style="font-size: 4rem;">${iconMap[puzzle.type]}</div>`;
                    
                    // Panel description
                    const panelDescription = document.createElement('p');
                    panelDescription.className = 'panel-description';
                    panelDescription.textContent = puzzle.description;
                    
                    // Panel status
                    const panelStatus = document.createElement('div');
                    panelStatus.className = `panel-status ${puzzle.status}`;
                    panelStatus.textContent = puzzle.status === 'solved' ? 'SOLVED!' : 'UNSOLVED';
                    
                    // Add inventory if any
                    const inventory = document.createElement('div');
                    inventory.className = 'inventory';
                    
                    // Add items found in this panel to inventory
                    const panelInventory = getPanelInventory(puzzle.id);
                    panelInventory.forEach(item => {
                        const itemElement = document.createElement('div');
                        itemElement.className = 'inventory-item';
                        itemElement.innerHTML = `<i class="fas fa-key"></i> ${item}`;
                        inventory.appendChild(itemElement);
                    });
                    
                    // Assemble panel
                    panelContent.appendChild(panelTitle);
                    panelContent.appendChild(panelImage);
                    panelContent.appendChild(panelDescription);
                    
                    if (panelInventory.length > 0) {
                        panelContent.appendChild(inventory);
                    }
                    
                    panelContent.appendChild(panelStatus);
                    
                    panel.appendChild(panelNumber);
                    panel.appendChild(panelContent);
                    
                    // Add click event if not locked
                    if (!panel.classList.contains('locked')) {
                        panel.addEventListener('click', () => openPuzzle(puzzle.id));
                    }
                    
                    panelsContainer.appendChild(panel);
                });
            }
            
            // Check if a panel is unlocked
            function isPanelUnlocked(panelId) {
                // Panel 1 is always unlocked
                if (panelId === 1) return true;
                
                // Other panels require all previous panels to be solved
                for (let i = 1; i < panelId; i++) {
                    const prevPuzzle = puzzles.find(p => p.id === i);
                    if (!prevPuzzle || prevPuzzle.status !== 'solved') {
                        return false;
                    }
                }
                
                return true;
            }
            
            // Get inventory items from a panel
            function getPanelInventory(panelId) {
                const items = [];
                
                if (panelId === 2 && puzzles[1].status === 'solved') {
                    items.push('DECODED MESSAGE');
                }
                
                if (panelId === 4 && puzzles[3].status === 'solved') {
                    items.push('SMALL KEY');
                }
                
                if (panelId === 5 && puzzles[4].status === 'solved') {
                    items.push('NUMBER 42');
                }
                
                return items;
            }
            
            // Open a puzzle
            function openPuzzle(panelId) {
                const puzzle = puzzles.find(p => p.id === panelId);
                if (!puzzle) return;
                
                // Set current panel
                gameState.currentPanel = panelId;
                
                // Update panel display
                puzzleTitle.textContent = `PANEL ${panelId}: ${puzzle.title}`;
                
                // Create puzzle content
                createPuzzleContent(puzzle);
                
                // Show puzzle display
                puzzleDisplay.classList.add('active');
                
                // Highlight active panel
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                document.querySelector(`.panel[data-id="${panelId}"]`).classList.add('active');
                
                // Play sound
                playSound(pageSound);
            }
            
            // Create puzzle content
            function createPuzzleContent(puzzle) {
                puzzleContent.innerHTML = '';
                
                // Add speech bubble with instructions
                const speechBubble = document.createElement('div');
                speechBubble.className = 'speech-bubble';
                speechBubble.innerHTML = `<p><strong>Comic Hero:</strong> ${puzzle.content.instructions}</p>`;
                puzzleContent.appendChild(speechBubble);
                
                // Add puzzle scene
                const puzzleScene = document.createElement('div');
                puzzleScene.className = 'puzzle-scene';
                
                // Visual element
                const puzzleVisual = document.createElement('div');
                puzzleVisual.className = 'puzzle-visual';
                puzzleVisual.innerHTML = puzzle.content.visual;
                
                // Interaction element
                const puzzleInteraction = document.createElement('div');
                puzzleInteraction.className = 'puzzle-interaction';
                
                // Input for answer
                const answerInput = document.createElement('input');
                answerInput.type = 'text';
                answerInput.className = 'puzzle-input';
                answerInput.placeholder = 'Enter your answer here...';
                answerInput.id = 'answerInput';
                
                // Submit button
                const submitButton = document.createElement('button');
                submitButton.className = 'comic-button primary';
                submitButton.innerHTML = '<i class="fas fa-check-circle"></i> Submit Answer';
                submitButton.addEventListener('click', () => checkAnswer(puzzle.id, answerInput.value));
                
                // Hint button
                const hintButton = document.createElement('button');
                hintButton.className = 'comic-button secondary';
                hintButton.innerHTML = '<i class="fas fa-lightbulb"></i> Get Hint';
                hintButton.addEventListener('click', () => showHint(puzzle.content.hint));
                
                // Button container
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'puzzle-buttons';
                buttonContainer.appendChild(submitButton);
                buttonContainer.appendChild(hintButton);
                
                // Allow Enter key to submit
                answerInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        checkAnswer(puzzle.id, answerInput.value);
                    }
                });
                
                // Assemble interaction
                puzzleInteraction.appendChild(answerInput);
                puzzleInteraction.appendChild(buttonContainer);
                
                // Assemble scene
                puzzleScene.appendChild(puzzleVisual);
                puzzleScene.appendChild(puzzleInteraction);
                
                // Add to content
                puzzleContent.appendChild(puzzleScene);
                
                // Add hint container (hidden by default)
                const hintContainer = document.createElement('div');
                hintContainer.className = 'hint-container';
                hintContainer.id = 'hintContainer';
                hintContainer.innerHTML = `
                    <div class="hint-title">
                        <i class="fas fa-lightbulb"></i> HINT
                    </div>
                    <p id="hintText"></p>
                `;
                puzzleContent.appendChild(hintContainer);
                
                // Focus on input
                setTimeout(() => answerInput.focus(), 100);
            }
            
            // Show hint
            function showHint(hintText) {
                const hintContainer = document.getElementById('hintContainer');
                const hintTextElement = document.getElementById('hintText');
                
                hintTextElement.textContent = hintText;
                hintContainer.classList.add('active');
                
                // Track hint usage
                gameState.hintsUsed++;
                saveGameState();
            }
            
            // Check answer
            function checkAnswer(panelId, answer) {
                const puzzle = puzzles.find(p => p.id === panelId);
                if (!puzzle) return;
                
                const normalizedAnswer = answer.trim().toUpperCase();
                const normalizedSolution = puzzle.solution.toUpperCase();
                
                let isCorrect = false;
                
                // Handle different puzzle types
                if (puzzle.type === 'math') {
                    // For math puzzles, check numeric equality
                    isCorrect = parseInt(normalizedAnswer) === parseInt(normalizedSolution);
                } else {
                    // For other puzzles, check string equality
                    isCorrect = normalizedAnswer === normalizedSolution;
                }
                
                if (isCorrect) {
                    // Mark puzzle as solved
                    puzzle.status = 'solved';
                    
                    // Add to solved panels if not already there
                    if (!gameState.solvedPanels.includes(panelId)) {
                        gameState.solvedPanels.push(panelId);
                    }
                    
                    // Add inventory items based on puzzle
                    addInventoryItem(panelId);
                    
                    // Update game state
                    saveGameState();
                    
                    // Update UI
                    updateProgress();
                    createPanels();
                    
                    // Show success message
                    showMessage('Correct!', 'success');
                    
                    // Play success sound
                    playSound(correctSound);
                    
                    // Check if all puzzles are solved
                    if (gameState.solvedPanels.length === puzzles.length) {
                        setTimeout(() => {
                            puzzleDisplay.classList.remove('active');
                            showSuccessScreen();
                        }, 1500);
                    } else {
                        // Close puzzle after delay
                        setTimeout(() => {
                            puzzleDisplay.classList.remove('active');
                            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                        }, 1500);
                    }
                } else {
                    // Show error message
                    showMessage('Try again!', 'error');
                    
                    // Shake input
                    const answerInput = document.getElementById('answerInput');
                    answerInput.classList.add('shake');
                    setTimeout(() => answerInput.classList.remove('shake'), 500);
                    
                    // Play error sound
                    playSound(wrongSound);
                }
            }
            
            // Add inventory item based on solved puzzle
            function addInventoryItem(panelId) {
                if (panelId === 2) {
                    gameState.inventory.push('DECODED MESSAGE: COMIC');
                } else if (panelId === 4) {
                    gameState.inventory.push('SMALL KEY');
                } else if (panelId === 5) {
                    gameState.inventory.push('NUMBER 42');
                }
            }
            
            // Show message
            function showMessage(text, type) {
                // Create message element
                const message = document.createElement('div');
                message.className = `speech-bubble ${type === 'success' ? 'right' : ''}`;
                message.style.backgroundColor = type === 'success' ? 'var(--comic-green)' : 'var(--comic-red)';
                message.style.color = 'white';
                message.style.borderColor = type === 'success' ? 'var(--comic-green)' : 'var(--comic-red)';
                message.innerHTML = `<p><strong>${type === 'success' ? 'SUCCESS!' : 'OOPS!'}</strong> ${text}</p>`;
                
                // Add to puzzle content
                puzzleContent.appendChild(message);
                
                // Remove after delay
                setTimeout(() => {
                    if (message.parentNode) {
                        message.remove();
                    }
                }, 3000);
            }
            
            // Update progress
            function updateProgress() {
                const solvedCount = gameState.solvedPanels.length;
                const totalCount = puzzles.length;
                const percentage = (solvedCount / totalCount) * 100;
                
                progressFill.style.width = `${percentage}%`;
                progressText.textContent = `${solvedCount}/${totalCount} Puzzles Solved`;
            }
            
            // Show success screen
            function showSuccessScreen() {
                successScreen.classList.add('active');
                playSound(successSound);
            }
            
            // Play sound
            function playSound(audioElement) {
                if (audioElement) {
                    audioElement.currentTime = 0;
                    audioElement.play().catch(e => console.log("Audio play failed:", e));
                }
            }
            
            // Save game state
            function saveGameState() {
                localStorage.setItem('comicEscapeRoomState', JSON.stringify(gameState));
            }
            
            // Load game state
            function loadGameState() {
                const saved = localStorage.getItem('comicEscapeRoomState');
                if (saved) {
                    try {
                        const savedState = JSON.parse(saved);
                        gameState = savedState;
                        
                        // Update puzzle statuses based on solved panels
                        puzzles.forEach(puzzle => {
                            if (gameState.solvedPanels.includes(puzzle.id)) {
                                puzzle.status = 'solved';
                            } else {
                                puzzle.status = 'unsolved';
                            }
                        });
                    } catch (e) {
                        console.log("Error loading saved game:", e);
                    }
                }
            }
            
            // Reset game
            function resetGame() {
                // Reset game state
                gameState = {
                    currentPanel: null,
                    solvedPanels: [],
                    inventory: [],
                    hintsUsed: 0
                };
                
                // Reset puzzles
                puzzles.forEach(puzzle => {
                    puzzle.status = 'unsolved';
                });
                
                // Save and reload
                saveGameState();
                createPanels();
                updateProgress();
                
                // Hide success screen
                successScreen.classList.remove('active');
                
                // Play page sound
                playSound(pageSound);
            }
            
            // Set up event listeners
            function setupEventListeners() {
                // Close puzzle button
                puzzleClose.addEventListener('click', () => {
                    puzzleDisplay.classList.remove('active');
                    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                });
                
                // Restart button
                restartButton.addEventListener('click', resetGame);
                
                // Close puzzle when clicking outside (on overlay)
                puzzleDisplay.addEventListener('click', function(e) {
                    if (e.target === puzzleDisplay) {
                        puzzleDisplay.classList.remove('active');
                        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                    }
                });
                
                // Add some comic book sound effects
                document.querySelectorAll('.panel').forEach(panel => {
                    panel.addEventListener('mouseenter', () => {
                        if (!panel.classList.contains('locked')) {
                            // Play a subtle sound effect on hover
                            pageSound.currentTime = 0.1;
                            pageSound.play().catch(() => {});
                        }
                    });
                });
            }
            
            // Initialize the game
            init();
        });
    