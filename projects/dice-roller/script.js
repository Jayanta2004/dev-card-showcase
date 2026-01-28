document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const diceNameInput = document.getElementById('diceName');
    const minValueInput = document.getElementById('minValue');
    const maxValueInput = document.getElementById('maxValue');
    const textValuesInput = document.getElementById('textValues');
    const customValuesInput = document.getElementById('customValues');
    const addDiceBtn = document.getElementById('addDiceBtn');
    const rollAllBtn = document.getElementById('rollAllBtn');
    const rollSelectedBtn = document.getElementById('rollSelectedBtn');
    const rollAllWithEffectBtn = document.getElementById('rollAllWithEffectBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const clearTableBtn = document.getElementById('clearTableBtn');
    const newSuggestionBtn = document.getElementById('newSuggestionBtn');
    const helpBtn = document.getElementById('helpBtn');
    const closeModal = document.getElementById('closeModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const suggestionModal = document.getElementById('suggestionModal');
    const helpModal = document.getElementById('helpModal');
    const applySuggestionBtn = document.getElementById('applySuggestionBtn');
    const anotherSuggestionBtn = document.getElementById('anotherSuggestionBtn');
    const saveSuggestionBtn = document.getElementById('saveSuggestionBtn');
    
    // Stats elements
    const totalRollsElement = document.getElementById('totalRolls');
    const activeDiceElement = document.getElementById('activeDice');
    const totalSumElement = document.getElementById('totalSum');
    const diceCountElement = document.getElementById('diceCount');
    const diceToRollElement = document.getElementById('diceToRoll');
    const resultsSummary = document.getElementById('resultsSummary');
    const suggestionDisplay = document.getElementById('suggestionDisplay');
    const historyList = document.getElementById('historyList');
    const diceVisualContainer = document.getElementById('diceVisualContainer');
    
    // Type buttons
    const typeButtons = document.querySelectorAll('.type-btn');
    const colorOptions = document.querySelectorAll('.color-option');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // Audio
    const rollSound = document.getElementById('rollSound');
    const clickSound = document.getElementById('clickSound');
    const successSound = document.getElementById('successSound');
    
    // Game State
    let gameState = {
        dice: [],
        selectedDice: [],
        lastRollResults: [],
        totalRolls: 0,
        suggestions: [],
        history: [],
        currentDiceType: 'numeric',
        currentColor: '#e74c3c',
        soundEnabled: true,
        autoSave: true,
        currentSuggestion: null
    };
    
    // Suggestions Database
    const suggestions = {
        all: [
            {
                title: "Play a Mini Game",
                text: "Use these numbers to play a quick dice game!",
                icon: "🎮",
                details: "Assign each dice to a game action. Highest number goes first, lowest number has a disadvantage.",
                category: "games"
            },
            {
                title: "Make a Decision",
                text: "Let the dice decide for you!",
                icon: "🤔",
                details: "Assign each option to a dice result. The highest roll wins the decision.",
                category: "decisions"
            },
            {
                title: "Creative Writing Prompt",
                text: "Use these numbers as story elements!",
                icon: "📝",
                details: "First dice: number of characters. Second dice: setting number. Third dice: conflict type.",
                category: "creative"
            },
            {
                title: "Daily Challenge",
                text: "Turn your roll into today's challenge!",
                icon: "💪",
                details: "Add all dice numbers together. Do that many pushups/squats/etc. Or complete that many tasks.",
                category: "games"
            },
            {
                title: "Random Selection",
                text: "Pick something randomly from a list!",
                icon: "🎯",
                details: "Use the dice results to select items from any list (books to read, movies to watch, etc.).",
                category: "decisions"
            },
            {
                title: "Art Prompt",
                text: "Create art based on these numbers!",
                icon: "🎨",
                details: "Use each number as a parameter: color palette, number of elements, style inspiration.",
                category: "creative"
            }
        ],
        games: [],
        decisions: [],
        creative: []
    };
    
    // Initialize
    init();
    
    // Event Listeners
    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            gameState.currentDiceType = this.dataset.type;
            showDiceTypeOptions(gameState.currentDiceType);
            playSound(clickSound);
        });
    });
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            gameState.currentColor = this.dataset.color;
            playSound(clickSound);
        });
    });
    
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const preset = this.dataset.preset;
            loadPreset(preset);
            playSound(clickSound);
        });
    });
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            // Filter suggestions by category
            playSound(clickSound);
        });
    });
    
    addDiceBtn.addEventListener('click', addDice);
    rollAllBtn.addEventListener('click', () => rollDice('all'));
    rollSelectedBtn.addEventListener('click', () => rollDice('selected'));
    rollAllWithEffectBtn.addEventListener('click', () => rollDice('all', true));
    clearAllBtn.addEventListener('click', clearAll);
    clearTableBtn.addEventListener('click', clearTable);
    newSuggestionBtn.addEventListener('click', generateSuggestion);
    helpBtn.addEventListener('click', () => helpModal.style.display = 'flex');
    closeModal.addEventListener('click', () => suggestionModal.style.display = 'none');
    closeHelpModal.addEventListener('click', () => helpModal.style.display = 'none');
    
    applySuggestionBtn.addEventListener('click', applySuggestion);
    anotherSuggestionBtn.addEventListener('click', generateSuggestion);
    saveSuggestionBtn.addEventListener('click', saveSuggestion);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === suggestionModal) {
            suggestionModal.style.display = 'none';
        }
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    // Functions
    function init() {
        // Set first color as active
        if (colorOptions.length > 0) {
            colorOptions[0].classList.add('active');
            gameState.currentColor = colorOptions[0].dataset.color;
        }
        
        // Load from localStorage
        loadFromLocalStorage();
        
        // Update UI
        updateStats();
        updateDiceTable();
        updateHistoryDisplay();
        
        // Initialize suggestions
        organizeSuggestions();
    }
    
    function showDiceTypeOptions(type) {
        // Hide all options groups
        document.querySelectorAll('.options-group').forEach(group => {
            group.style.display = 'none';
        });
        
        // Show the selected one
        document.getElementById(`${type}Options`).style.display = 'block';
    }
    
    function loadPreset(preset) {
        switch(preset) {
            case 'd6':
                diceNameInput.value = 'Standard D6';
                minValueInput.value = 1;
                maxValueInput.value = 6;
                gameState.currentDiceType = 'numeric';
                showDiceTypeOptions('numeric');
                typeButtons[0].classList.add('active');
                typeButtons[1].classList.remove('active');
                typeButtons[2].classList.remove('active');
                break;
                
            case 'd20':
                diceNameInput.value = 'D&D D20';
                minValueInput.value = 1;
                maxValueInput.value = 20;
                gameState.currentDiceType = 'numeric';
                showDiceTypeOptions('numeric');
                typeButtons[0].classList.add('active');
                typeButtons[1].classList.remove('active');
                typeButtons[2].classList.remove('active');
                break;
                
            case 'coin':
                diceNameInput.value = 'Coin Flip';
                textValuesInput.value = 'Heads, Tails, Edge';
                gameState.currentDiceType = 'text';
                showDiceTypeOptions('text');
                typeButtons[0].classList.remove('active');
                typeButtons[1].classList.add('active');
                typeButtons[2].classList.remove('active');
                break;
                
            case 'yesno':
                diceNameInput.value = 'Yes/No/Mabye';
                customValuesInput.value = 'Yes\nNo\nMaybe\nTry Again\nDefinitely\nNo Way';
                gameState.currentDiceType = 'custom';
                showDiceTypeOptions('custom');
                typeButtons[0].classList.remove('active');
                typeButtons[1].classList.remove('active');
                typeButtons[2].classList.add('active');
                break;
        }
        
        // Random color for preset
        const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        colorOptions.forEach(opt => opt.classList.remove('active'));
        document.querySelector(`.color-option[data-color="${randomColor}"]`).classList.add('active');
        gameState.currentColor = randomColor;
    }
    
    function addDice() {
        if (gameState.dice.length >= 6) {
            showMessage('Maximum 6 dice allowed!', 'error');
            return;
        }
        
        const name = diceNameInput.value.trim() || `Dice ${gameState.dice.length + 1}`;
        const type = gameState.currentDiceType;
        const color = gameState.currentColor;
        
        let options = [];
        
        switch(type) {
            case 'numeric':
                const min = parseInt(minValueInput.value) || 1;
                const max = parseInt(maxValueInput.value) || 6;
                
                if (min >= max) {
                    showMessage('Max value must be greater than min value!', 'error');
                    return;
                }
                
                if (max - min > 100) {
                    showMessage('Range too large! Max 100 values allowed.', 'error');
                    return;
                }
                
                for (let i = min; i <= max; i++) {
                    options.push(i.toString());
                }
                break;
                
            case 'text':
                const textInput = textValuesInput.value.trim();
                if (!textInput) {
                    showMessage('Please enter some text options!', 'error');
                    return;
                }
                
                options = textInput.split(',').map(opt => opt.trim()).filter(opt => opt);
                
                if (options.length < 2 || options.length > 6) {
                    showMessage('Please enter 2-6 text options!', 'error');
                    return;
                }
                break;
                
            case 'custom':
                const customInput = customValuesInput.value.trim();
                if (!customInput) {
                    showMessage('Please enter custom values!', 'error');
                    return;
                }
                
                options = customInput.split('\n').map(opt => opt.trim()).filter(opt => opt);
                
                if (options.length < 2 || options.length > 12) {
                    showMessage('Please enter 2-12 custom values (one per line)!', 'error');
                    return;
                }
                break;
        }
        
        const dice = {
            id: Date.now(),
            name: name,
            type: type,
            color: color,
            options: options,
            lastResult: null,
            isSelected: false
        };
        
        gameState.dice.push(dice);
        playSound(clickSound);
        
        // Update UI
        updateDiceTable();
        updateStats();
        clearForm();
        
        // Auto-select new dice
        dice.isSelected = true;
        gameState.selectedDice.push(dice.id);
        
        saveToLocalStorage();
    }
    
    function clearForm() {
        diceNameInput.value = '';
        minValueInput.value = 1;
        maxValueInput.value = 6;
        textValuesInput.value = '';
        customValuesInput.value = '';
    }
    
    function updateDiceTable() {
        const tableBody = document.getElementById('diceTableBody');
        tableBody.innerHTML = '';
        
        if (gameState.dice.length === 0) {
            tableBody.innerHTML = `
                <div class="table-empty">
                    <div class="empty-icon">
                        <i class="fas fa-dice-d20"></i>
                    </div>
                    <div class="empty-title">No Dice Added</div>
                    <div class="empty-text">Add dice from the left panel to get started</div>
                </div>
            `;
            return;
        }
        
        gameState.dice.forEach((dice, index) => {
            const row = document.createElement('div');
            row.className = `dice-row ${dice.isSelected ? 'selected' : ''}`;
            row.dataset.id = dice.id;
            
            // Format options for display
            let optionsDisplay = '';
            if (dice.type === 'numeric') {
                optionsDisplay = `${dice.options[0]}-${dice.options[dice.options.length - 1]}`;
            } else {
                optionsDisplay = dice.options.slice(0, 3).join(', ');
                if (dice.options.length > 3) {
                    optionsDisplay += `... (+${dice.options.length - 3} more)`;
                }
            }
            
            // Last result display
            let resultDisplay = dice.lastResult !== null ? dice.lastResult : '–';
            
            row.innerHTML = `
                <div class="dice-name">
                    <span class="dice-color" style="background-color: ${dice.color}"></span>
                    <span>${dice.name}</span>
                </div>
                <div class="dice-type">
                    ${dice.type.charAt(0).toUpperCase() + dice.type.slice(1)}
                </div>
                <div class="dice-options" title="${dice.options.join(', ')}">
                    ${optionsDisplay}
                </div>
                <div class="dice-result">
                    ${resultDisplay}
                </div>
                <div class="dice-actions">
                    <button class="action-btn roll-btn" title="Roll this dice">
                        <i class="fas fa-dice"></i>
                    </button>
                    <button class="action-btn select-btn" title="Select/Deselect">
                        <i class="fas ${dice.isSelected ? 'fa-check-square' : 'fa-square'}"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Remove dice">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            tableBody.appendChild(row);
            
            // Add event listeners to action buttons
            const actionButtons = row.querySelectorAll('.action-btn');
            actionButtons[0].addEventListener('click', () => rollSingleDice(dice.id));
            actionButtons[1].addEventListener('click', () => toggleDiceSelection(dice.id));
            actionButtons[2].addEventListener('click', () => removeDice(dice.id));
        });
        
        updateStats();
    }
    
    function rollSingleDice(diceId) {
        const dice = gameState.dice.find(d => d.id === diceId);
        if (!dice) return;
        
        playSound(rollSound);
        
        // Show rolling animation
        showDiceRollAnimation([dice]);
        
        // Get random result
        const randomIndex = Math.floor(Math.random() * dice.options.length);
        const result = dice.options[randomIndex];
        
        // Update dice state
        dice.lastResult = result;
        
        // Update game state
        gameState.totalRolls++;
        gameState.lastRollResults = [{dice: dice, result: result}];
        
        // Update UI after animation
        setTimeout(() => {
            updateDiceTable();
            updateStats();
            updateResultsDisplay();
            addToHistory([{dice: dice, result: result}]);
            
            // Generate suggestion for single dice
            generateSuggestion();
        }, 1000);
    }
    
    function rollDice(mode = 'all', withEffect = false) {
        let diceToRoll = [];
        
        if (mode === 'all') {
            diceToRoll = gameState.dice;
        } else if (mode === 'selected') {
            diceToRoll = gameState.dice.filter(dice => dice.isSelected);
        }
        
        if (diceToRoll.length === 0) {
            showMessage('No dice to roll! Add or select some dice first.', 'error');
            return;
        }
        
        playSound(rollSound);
        
        if (withEffect) {
            showDiceRollAnimation(diceToRoll);
        }
        
        const results = [];
        const totalSum = {value: 0, count: 0};
        
        diceToRoll.forEach(dice => {
            const randomIndex = Math.floor(Math.random() * dice.options.length);
            const result = dice.options[randomIndex];
            
            dice.lastResult = result;
            results.push({dice: dice, result: result});
            
            // Calculate sum for numeric dice
            if (dice.type === 'numeric') {
                const numValue = parseInt(result);
                if (!isNaN(numValue)) {
                    totalSum.value += numValue;
                    totalSum.count++;
                }
            }
        });
        
        // Update game state
        gameState.totalRolls++;
        gameState.lastRollResults = results;
        
        // Update UI
        setTimeout(() => {
            updateDiceTable();
            updateStats();
            updateResultsDisplay();
            addToHistory(results);
            
            // Generate suggestion
            generateSuggestion();
            
            // Show total sum if we have numeric dice
            if (totalSum.count > 0) {
                showMessage(`Total sum: ${totalSum.value}`, 'success');
            }
        }, withEffect ? 1000 : 0);
    }
    
    function showDiceRollAnimation(diceArray) {
        diceVisualContainer.innerHTML = '';
        
        diceArray.forEach(dice => {
            const diceVisual = document.createElement('div');
            diceVisual.className = 'dice-visual rolling';
            diceVisual.style.backgroundColor = dice.color;
            diceVisual.textContent = '?';
            diceVisualContainer.appendChild(diceVisual);
        });
        
        // Stop animation after 1 second
        setTimeout(() => {
            const diceElements = diceVisualContainer.querySelectorAll('.dice-visual');
            diceElements.forEach((element, index) => {
                element.classList.remove('rolling');
                element.textContent = diceArray[index].lastResult || '?';
                
                // Add bounce effect
                element.style.animation = 'bounce 0.5s ease';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            });
        }, 1000);
    }
    
    function toggleDiceSelection(diceId) {
        const dice = gameState.dice.find(d => d.id === diceId);
        if (!dice) return;
        
        dice.isSelected = !dice.isSelected;
        
        if (dice.isSelected) {
            if (!gameState.selectedDice.includes(diceId)) {
                gameState.selectedDice.push(diceId);
            }
        } else {
            gameState.selectedDice = gameState.selectedDice.filter(id => id !== diceId);
        }
        
        playSound(clickSound);
        updateDiceTable();
        updateStats();
    }
    
    function removeDice(diceId) {
        if (confirm('Remove this dice?')) {
            gameState.dice = gameState.dice.filter(d => d.id !== diceId);
            gameState.selectedDice = gameState.selectedDice.filter(id => id !== diceId);
            
            playSound(clickSound);
            updateDiceTable();
            updateStats();
            saveToLocalStorage();
        }
    }
    
    function clearAll() {
        if (confirm('Clear all dice and reset everything?')) {
            gameState.dice = [];
            gameState.selectedDice = [];
            gameState.lastRollResults = [];
            
            playSound(clickSound);
            updateDiceTable();
            updateStats();
            clearResultsDisplay();
            diceVisualContainer.innerHTML = '';
            saveToLocalStorage();
        }
    }
    
    function clearTable() {
        if (confirm('Remove all dice from the table?')) {
            gameState.dice = [];
            gameState.selectedDice = [];
            
            playSound(clickSound);
            updateDiceTable();
            updateStats();
            saveToLocalStorage();
        }
    }
    
    function updateStats() {
        totalRollsElement.textContent = gameState.totalRolls;
        activeDiceElement.textContent = gameState.dice.length;
        diceCountElement.textContent = gameState.dice.length;
        
        // Calculate total sum of last roll
        let totalSum = 0;
        gameState.lastRollResults.forEach(item => {
            if (item.dice.type === 'numeric') {
                const numValue = parseInt(item.result);
                if (!isNaN(numValue)) {
                    totalSum += numValue;
                }
            }
        });
        
        totalSumElement.textContent = totalSum;
        
        // Update dice to roll count
        const diceToRollCount = gameState.selectedDice.length > 0 
            ? gameState.selectedDice.length 
            : gameState.dice.length;
        diceToRollElement.textContent = diceToRollCount;
    }
    
    function updateResultsDisplay() {
        resultsSummary.innerHTML = '';
        
        if (gameState.lastRollResults.length === 0) {
            resultsSummary.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-dice"></i>
                    <p>Roll dice to see results</p>
                </div>
            `;
            return;
        }
        
        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'results-grid';
        
        gameState.lastRollResults.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-dice">
                    <span class="dice-color" style="background-color: ${item.dice.color}; width: 12px; height: 12px; border-radius: 50%; display: inline-block;"></span>
                    ${item.dice.name}
                </div>
                <div class="result-value">${item.result}</div>
            `;
            resultsGrid.appendChild(resultItem);
        });
        
        resultsSummary.appendChild(resultsGrid);
    }
    
    function clearResultsDisplay() {
        resultsSummary.innerHTML = `
            <div class="no-results">
                <i class="fas fa-dice"></i>
                <p>Roll dice to see results</p>
            </div>
        `;
        
        suggestionDisplay.innerHTML = `
            <div class="suggestion-placeholder">
                <div class="placeholder-icon">✨</div>
                <div class="placeholder-text">
                    Roll dice to get personalized suggestions based on your results!
                </div>
            </div>
        `;
    }
    
    function addToHistory(results) {
        const historyItem = {
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            results: results.map(item => ({
                diceName: item.dice.name,
                result: item.result,
                color: item.dice.color
            }))
        };
        
        gameState.history.unshift(historyItem);
        
        // Keep only last 10 items
        if (gameState.history.length > 10) {
            gameState.history.pop();
        }
        
        updateHistoryDisplay();
        saveToLocalStorage();
    }
    
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        if (gameState.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No roll history yet</div>';
            return;
        }
        
        gameState.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const resultsText = item.results.map(r => `${r.diceName}: ${r.result}`).join(', ');
            
            historyItem.innerHTML = `
                <div class="history-time">${item.time}</div>
                <div class="history-results">${resultsText}</div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    function organizeSuggestions() {
        // Categorize suggestions
        suggestions.games = suggestions.all.filter(s => s.category === 'games');
        suggestions.decisions = suggestions.all.filter(s => s.category === 'decisions');
        suggestions.creative = suggestions.all.filter(s => s.category === 'creative');
    }
    
    function generateSuggestion() {
        if (gameState.lastRollResults.length === 0) {
            showMessage('Roll dice first to get suggestions!', 'error');
            return;
        }
        
        // Get random suggestion based on dice type
        let availableSuggestions = [];
        const category = document.querySelector('.tab-btn.active')?.dataset.category || 'all';
        
        if (category === 'all') {
            availableSuggestions = suggestions.all;
        } else {
            availableSuggestions = suggestions[category] || suggestions.all;
        }
        
        if (availableSuggestions.length === 0) {
            availableSuggestions = suggestions.all;
        }
        
        const randomIndex = Math.floor(Math.random() * availableSuggestions.length);
        const suggestion = availableSuggestions[randomIndex];
        gameState.currentSuggestion = suggestion;
        
        // Update suggestion display
        updateSuggestionDisplay(suggestion);
        
        // Show modal with suggestion
        showSuggestionModal(suggestion);
        
        playSound(successSound);
    }
    
    function updateSuggestionDisplay(suggestion) {
        suggestionDisplay.innerHTML = `
            <div class="suggestion-active">
                <div class="suggestion-icon">${suggestion.icon}</div>
                <div class="suggestion-content">
                    <h4>${suggestion.title}</h4>
                    <p>${suggestion.text}</p>
                    <div class="suggestion-details">
                        ${suggestion.details}
                    </div>
                </div>
            </div>
        `;
    }
    
    function showSuggestionModal(suggestion) {
        // Update modal with current results
        const resultValues = document.getElementById('modalResultValues');
        resultValues.innerHTML = '';
        
        gameState.lastRollResults.forEach(item => {
            const valueItem = document.createElement('div');
            valueItem.className = 'result-value-item';
            valueItem.innerHTML = `
                <div class="result-dice-name">${item.dice.name}</div>
                <div class="result-dice-value">${item.result}</div>
            `;
            resultValues.appendChild(valueItem);
        });
        
        // Update suggestion content
        document.getElementById('suggestionIcon').textContent = suggestion.icon;
        document.getElementById('suggestionTitle').textContent = suggestion.title;
        document.getElementById('suggestionText').textContent = suggestion.text;
        document.getElementById('suggestionDetails').textContent = suggestion.details;
        
        // Show modal
        suggestionModal.style.display = 'flex';
    }
    
    function applySuggestion() {
        showMessage('Suggestion applied! Have fun with your dice roll!', 'success');
        suggestionModal.style.display = 'none';
        
        // You could add more specific actions here based on the suggestion
    }
    
    function saveSuggestion() {
        if (gameState.currentSuggestion) {
            // In a real app, you might save to localStorage or a database
            showMessage('Suggestion saved to your collection!', 'success');
            suggestionModal.style.display = 'none';
        }
    }
    
    function showMessage(text, type) {
        // Create message element
        const message = document.createElement('div');
        message.className = 'game-message';
        message.textContent = text;
        
        // Style based on type
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.right = '20px';
        message.style.padding = '12px 24px';
        message.style.borderRadius = 'var(--radius-md)';
        message.style.fontWeight = '600';
        message.style.zIndex = '1000';
        message.style.boxShadow = 'var(--shadow-md)';
        message.style.animation = 'messageSlideIn 0.3s ease';
        
        if (type === 'error') {
            message.style.backgroundColor = 'var(--error-color)';
            message.style.color = 'white';
        } else {
            message.style.backgroundColor = 'var(--success-color)';
            message.style.color = 'white';
        }
        
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            message.style.animation = 'messageSlideOut 0.3s ease';
            setTimeout(() => {
                if (message.parentNode) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 3000);
        
        // Add CSS for animations if not already present
        if (!document.querySelector('#message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
            style.textContent = `
                @keyframes messageSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes messageSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function playSound(audio) {
        if (gameState.soundEnabled && audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    }
    
    function saveToLocalStorage() {
        if (gameState.autoSave) {
            const saveData = {
                dice: gameState.dice,
                totalRolls: gameState.totalRolls,
                history: gameState.history.slice(0, 20) // Keep last 20 rolls
            };
            
            localStorage.setItem('diceRollerData', JSON.stringify(saveData));
        }
    }
    
    function loadFromLocalStorage() {
        const saved = localStorage.getItem('diceRollerData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                gameState.dice = data.dice || [];
                gameState.totalRolls = data.totalRolls || 0;
                gameState.history = data.history || [];
                
                // Re-select dice that were selected
                gameState.selectedDice = gameState.dice
                    .filter(dice => dice.isSelected)
                    .map(dice => dice.id);
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
});