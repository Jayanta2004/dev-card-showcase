        // Application state
        let currentState = {
            panels: [],
            selectedPanel: null,
            selectedCharacter: 'hero',
            selectedBackground: 'city',
            selectedDialogueStyle: 'speech',
            panelSize: 3
        };

        // Available options
        const characters = [
            { id: 'hero', name: 'Hero', emoji: '🦸', color: '#3366ff' },
            { id: 'heroine', name: 'Heroine', emoji: '🦸‍♀️', color: '#ff3366' },
            { id: 'villain', name: 'Villain', emoji: '👿', color: '#333333' },
            { id: 'robot', name: 'Robot', emoji: '🤖', color: '#666666' },
            { id: 'alien', name: 'Alien', emoji: '👽', color: '#00cc66' },
            { id: 'cat', name: 'Cat', emoji: '😼', color: '#ff9900' },
            { id: 'dog', name: 'Dog', emoji: '🐶', color: '#996633' },
            { id: 'wizard', name: 'Wizard', emoji: '🧙', color: '#9900ff' }
        ];

        const backgrounds = [
            { id: 'city', name: 'City', emoji: '🏙️', color: '#4a90e2' },
            { id: 'space', name: 'Space', emoji: '🚀', color: '#0d1b2a' },
            { id: 'forest', name: 'Forest', emoji: '🌲', color: '#2d5a27' },
            { id: 'beach', name: 'Beach', emoji: '🏖️', color: '#ffcc80' },
            { id: 'house', name: 'House', emoji: '🏠', color: '#ffb74d' },
            { id: 'school', name: 'School', emoji: '🏫', color: '#80deea' },
            { id: 'castle', name: 'Castle', emoji: '🏰', color: '#b39ddb' },
            { id: 'lab', name: 'Lab', emoji: '🔬', color: '#26c6da' }
        ];

        const dialogueStyles = [
            { id: 'speech', name: 'Speech', emoji: '💬', color: '#ffffff' },
            { id: 'thought', name: 'Thought', emoji: '💭', color: '#e1f5fe' },
            { id: 'shout', name: 'Shout', emoji: '📢', color: '#ffebee' },
            { id: 'whisper', name: 'Whisper', emoji: '🔇', color: '#f3e5f5' }
        ];

        // Initialize the application
        function initApp() {
            renderOptions();
            setupEventListeners();
            updatePanelCount();
            
            // Add a default first panel
            addNewPanel();
        }

        // Render option buttons
        function renderOptions() {
            // Render characters
            const characterContainer = document.getElementById('character-options');
            characterContainer.innerHTML = '';
            
            characters.forEach(character => {
                const option = document.createElement('div');
                option.className = `option ${currentState.selectedCharacter === character.id ? 'active' : ''}`;
                option.dataset.id = character.id;
                option.dataset.type = 'character';
                
                option.innerHTML = `
                    <div class="option-icon">${character.emoji}</div>
                    <div class="option-label">${character.name}</div>
                `;
                
                option.addEventListener('click', () => {
                    currentState.selectedCharacter = character.id;
                    document.querySelectorAll('#character-options .option').forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    
                    // Update selected panel if exists
                    if (currentState.selectedPanel) {
                        updatePanel(currentState.selectedPanel, { character: character.id });
                    }
                });
                
                characterContainer.appendChild(option);
            });
            
            // Render backgrounds
            const backgroundContainer = document.getElementById('background-options');
            backgroundContainer.innerHTML = '';
            
            backgrounds.forEach(background => {
                const option = document.createElement('div');
                option.className = `option ${currentState.selectedBackground === background.id ? 'active' : ''}`;
                option.dataset.id = background.id;
                option.dataset.type = 'background';
                
                option.innerHTML = `
                    <div class="option-icon">${background.emoji}</div>
                    <div class="option-label">${background.name}</div>
                `;
                
                option.addEventListener('click', () => {
                    currentState.selectedBackground = background.id;
                    document.querySelectorAll('#background-options .option').forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    
                    // Update selected panel if exists
                    if (currentState.selectedPanel) {
                        updatePanel(currentState.selectedPanel, { background: background.id });
                    }
                });
                
                backgroundContainer.appendChild(option);
            });
            
            // Render dialogue styles
            const dialogueContainer = document.getElementById('dialogue-options');
            dialogueContainer.innerHTML = '';
            
            dialogueStyles.forEach(style => {
                const option = document.createElement('div');
                option.className = `option ${currentState.selectedDialogueStyle === style.id ? 'active' : ''}`;
                option.dataset.id = style.id;
                option.dataset.type = 'dialogue';
                
                option.innerHTML = `
                    <div class="option-icon">${style.emoji}</div>
                    <div class="option-label">${style.name}</div>
                `;
                
                option.addEventListener('click', () => {
                    currentState.selectedDialogueStyle = style.id;
                    document.querySelectorAll('#dialogue-options .option').forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    
                    // Update selected panel if exists
                    if (currentState.selectedPanel) {
                        updatePanel(currentState.selectedPanel, { dialogueStyle: style.id });
                    }
                });
                
                dialogueContainer.appendChild(option);
            });
        }

        // Setup event listeners
        function setupEventListeners() {
            // Panel management buttons
            document.getElementById('add-panel-btn').addEventListener('click', addNewPanel);
            document.getElementById('clear-panels-btn').addEventListener('click', clearAllPanels);
            document.getElementById('generate-comic-btn').addEventListener('click', generateComicStrip);
            document.getElementById('export-btn').addEventListener('click', exportAsImage);
            document.getElementById('reset-btn').addEventListener('click', resetAll);
            document.getElementById('print-btn').addEventListener('click', printComic);
            
            // Panel size slider
            document.getElementById('panel-size-slider').addEventListener('input', function() {
                currentState.panelSize = parseInt(this.value);
                if (currentState.selectedPanel) {
                    updatePanelSize(currentState.selectedPanel, currentState.panelSize);
                }
            });
        }

        // Add a new panel to the canvas
        function addNewPanel() {
            const panelId = `panel-${Date.now()}`;
            const panelCount = currentState.panels.length;
            
            // Calculate position to avoid overlap
            const left = 20 + (panelCount % 3) * 320;
            const top = 20 + Math.floor(panelCount / 3) * 250;
            
            const newPanel = {
                id: panelId,
                title: `Panel ${panelCount + 1}`,
                character: currentState.selectedCharacter,
                background: currentState.selectedBackground,
                dialogueStyle: currentState.selectedDialogueStyle,
                dialogueText: 'Add your dialogue here...',
                position: { left, top },
                size: currentState.panelSize
            };
            
            currentState.panels.push(newPanel);
            renderPanel(newPanel);
            updatePanelCount();
            
            // Hide empty canvas message
            document.getElementById('empty-canvas-message').style.display = 'none';
        }

        // Render a panel on the canvas
        function renderPanel(panel) {
            const canvas = document.getElementById('comic-canvas');
            
            // Remove existing panel with same ID
            const existingPanel = document.getElementById(panel.id);
            if (existingPanel) {
                existingPanel.remove();
            }
            
            // Create panel element
            const panelElement = document.createElement('div');
            panelElement.className = 'comic-panel';
            panelElement.id = panel.id;
            
            // Calculate size based on panel size setting
            const width = 300 + (panel.size - 3) * 50;
            const height = 200 + (panel.size - 3) * 40;
            
            panelElement.style.width = `${width}px`;
            panelElement.style.height = `${height}px`;
            panelElement.style.left = `${panel.position.left}px`;
            panelElement.style.top = `${panel.position.top}px`;
            
            // Find character, background, and dialogue style
            const character = characters.find(c => c.id === panel.character);
            const background = backgrounds.find(b => b.id === panel.background);
            const dialogueStyle = dialogueStyles.find(d => d.id === panel.dialogueStyle);
            
            // Set background color
            panelElement.style.backgroundColor = background ? background.color : '#ffffff';
            
            // Panel content
            panelElement.innerHTML = `
                <div class="panel-header">
                    <input type="text" class="panel-title-input" value="${panel.title}" data-panel-id="${panel.id}">
                    <button class="delete-panel" data-panel-id="${panel.id}">×</button>
                </div>
                <div class="panel-content">
                    <div class="character-container">
                        <div class="comic-character">${character ? character.emoji : '🦸'}</div>
                    </div>
                    <div class="dialogue-bubble" style="background-color: ${dialogueStyle ? dialogueStyle.color : '#ffffff'}">
                        <textarea class="dialogue-input" data-panel-id="${panel.id}" placeholder="Enter dialogue...">${panel.dialogueText}</textarea>
                    </div>
                </div>
            `;
            
            // Make panel draggable
            makeDraggable(panelElement, panel.id);
            
            // Add event listeners for panel interactions
            const titleInput = panelElement.querySelector('.panel-title-input');
            titleInput.addEventListener('input', function() {
                updatePanel(panel.id, { title: this.value });
            });
            
            const dialogueInput = panelElement.querySelector('.dialogue-input');
            dialogueInput.addEventListener('input', function() {
                updatePanel(panel.id, { dialogueText: this.value });
            });
            
            const deleteBtn = panelElement.querySelector('.delete-panel');
            deleteBtn.addEventListener('click', function() {
                deletePanel(panel.id);
            });
            
            // Select panel when clicked
            panelElement.addEventListener('click', function(e) {
                if (e.target.classList.contains('delete-panel') || e.target.classList.contains('panel-title-input') || e.target.classList.contains('dialogue-input')) {
                    return;
                }
                selectPanel(panel.id);
            });
            
            canvas.appendChild(panelElement);
            selectPanel(panel.id);
        }

        // Make a panel draggable
        function makeDraggable(element, panelId) {
            let isDragging = false;
            let offsetX, offsetY;
            
            element.addEventListener('mousedown', startDrag);
            
            function startDrag(e) {
                if (e.target.classList.contains('delete-panel') || 
                    e.target.classList.contains('panel-title-input') || 
                    e.target.classList.contains('dialogue-input')) {
                    return;
                }
                
                isDragging = true;
                offsetX = e.clientX - element.getBoundingClientRect().left;
                offsetY = e.clientY - element.getBoundingClientRect().top;
                
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
                
                e.preventDefault();
                selectPanel(panelId);
            }
            
            function drag(e) {
                if (!isDragging) return;
                
                const canvas = document.getElementById('comic-canvas');
                const canvasRect = canvas.getBoundingClientRect();
                
                // Calculate new position
                let newLeft = e.clientX - canvasRect.left - offsetX;
                let newTop = e.clientY - canvasRect.top - offsetY;
                
                // Keep panel within canvas bounds
                newLeft = Math.max(10, Math.min(newLeft, canvasRect.width - element.offsetWidth - 10));
                newTop = Math.max(10, Math.min(newTop, canvasRect.height - element.offsetHeight - 10));
                
                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;
                
                // Update panel position in state
                const panelIndex = currentState.panels.findIndex(p => p.id === panelId);
                if (panelIndex !== -1) {
                    currentState.panels[panelIndex].position = { left: newLeft, top: newTop };
                }
            }
            
            function stopDrag() {
                isDragging = false;
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDrag);
            }
        }

        // Update panel properties
        function updatePanel(panelId, updates) {
            const panelIndex = currentState.panels.findIndex(p => p.id === panelId);
            if (panelIndex !== -1) {
                currentState.panels[panelIndex] = { ...currentState.panels[panelIndex], ...updates };
                renderPanel(currentState.panels[panelIndex]);
            }
        }

        // Update panel size
        function updatePanelSize(panelId, size) {
            const panelIndex = currentState.panels.findIndex(p => p.id === panelId);
            if (panelIndex !== -1) {
                currentState.panels[panelIndex].size = size;
                renderPanel(currentState.panels[panelIndex]);
            }
        }

        // Select a panel
        function selectPanel(panelId) {
            currentState.selectedPanel = panelId;
            
            // Highlight selected panel
            document.querySelectorAll('.comic-panel').forEach(panel => {
                panel.style.boxShadow = panel.id === panelId ? '0 0 0 3px #ff3366' : '5px 5px 0 rgba(0, 0, 0, 0.1)';
            });
            
            // Update controls to match selected panel
            const panel = currentState.panels.find(p => p.id === panelId);
            if (panel) {
                // Update character selection
                document.querySelectorAll('#character-options .option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.id === panel.character);
                });
                currentState.selectedCharacter = panel.character;
                
                // Update background selection
                document.querySelectorAll('#background-options .option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.id === panel.background);
                });
                currentState.selectedBackground = panel.background;
                
                // Update dialogue style selection
                document.querySelectorAll('#dialogue-options .option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.id === panel.dialogueStyle);
                });
                currentState.selectedDialogueStyle = panel.dialogueStyle;
                
                // Update size slider
                document.getElementById('panel-size-slider').value = panel.size;
                currentState.panelSize = panel.size;
            }
        }

        // Delete a panel
        function deletePanel(panelId) {
            currentState.panels = currentState.panels.filter(p => p.id !== panelId);
            document.getElementById(panelId)?.remove();
            updatePanelCount();
            
            // Show empty canvas message if no panels left
            if (currentState.panels.length === 0) {
                document.getElementById('empty-canvas-message').style.display = 'block';
                currentState.selectedPanel = null;
            } else {
                // Select the first panel if the selected panel was deleted
                if (currentState.selectedPanel === panelId) {
                    selectPanel(currentState.panels[0].id);
                }
            }
        }

        // Clear all panels
        function clearAllPanels() {
            if (confirm('Are you sure you want to clear all panels?')) {
                currentState.panels = [];
                document.getElementById('comic-canvas').innerHTML = '';
                document.getElementById('empty-canvas-message').style.display = 'block';
                updatePanelCount();
                currentState.selectedPanel = null;
            }
        }

        // Update panel count display
        function updatePanelCount() {
            document.getElementById('panel-count').textContent = currentState.panels.length;
        }

        // Generate the final comic strip
        function generateComicStrip() {
            const outputContainer = document.getElementById('comic-output');
            outputContainer.innerHTML = '';
            
            if (currentState.panels.length === 0) {
                outputContainer.innerHTML = '<div class="empty-output-message" style="text-align: center; padding: 50px; color: #999; font-size: 1.2rem; width: 100%;">No panels to generate! Add some panels first.</div>';
                return;
            }
            
            // Sort panels by position (left to right, top to bottom)
            const sortedPanels = [...currentState.panels].sort((a, b) => {
                if (Math.abs(a.position.top - b.position.top) < 50) {
                    return a.position.left - b.position.left;
                }
                return a.position.top - b.position.top;
            });
            
            // Create output panels
            sortedPanels.forEach(panel => {
                const outputPanel = document.createElement('div');
                outputPanel.className = 'comic-panel';
                outputPanel.style.position = 'relative';
                outputPanel.style.width = '280px';
                outputPanel.style.margin = '10px';
                outputPanel.style.display = 'inline-block';
                outputPanel.style.verticalAlign = 'top';
                
                // Find character, background, and dialogue style
                const character = characters.find(c => c.id === panel.character);
                const background = backgrounds.find(b => b.id === panel.background);
                const dialogueStyle = dialogueStyles.find(d => d.id === panel.dialogueStyle);
                
                // Set background color
                outputPanel.style.backgroundColor = background ? background.color : '#ffffff';
                
                outputPanel.innerHTML = `
                    <div class="panel-header">
                        <div class="panel-title-input" style="border: none; pointer-events: none;">${panel.title}</div>
                    </div>
                    <div class="panel-content">
                        <div class="character-container">
                            <div class="comic-character">${character ? character.emoji : '🦸'}</div>
                        </div>
                        <div class="dialogue-bubble" style="background-color: ${dialogueStyle ? dialogueStyle.color : '#ffffff'}">
                            <div class="dialogue-text">${panel.dialogueText}</div>
                        </div>
                    </div>
                `;
                
                outputContainer.appendChild(outputPanel);
            });
        }

        // Export as image (simulated)
        function exportAsImage() {
            alert('In a real application, this would export your comic as an image. For now, you can take a screenshot of your comic!');
            
            // In a real implementation, you would use a library like html2canvas
            // For this demo, we'll simulate the export
            generateComicStrip();
            
            // Show a success message
            const originalText = document.getElementById('export-btn').innerHTML;
            document.getElementById('export-btn').innerHTML = '<i class="fas fa-check"></i> Export Ready!';
            document.getElementById('export-btn').style.backgroundColor = '#00cc66';
            
            setTimeout(() => {
                document.getElementById('export-btn').innerHTML = originalText;
                document.getElementById('export-btn').style.backgroundColor = '';
            }, 2000);
        }

        // Print comic
        function printComic() {
            generateComicStrip();
            window.print();
        }

        // Reset everything
        function resetAll() {
            if (confirm('Are you sure you want to reset everything? This will clear all panels and settings.')) {
                currentState = {
                    panels: [],
                    selectedPanel: null,
                    selectedCharacter: 'hero',
                    selectedBackground: 'city',
                    selectedDialogueStyle: 'speech',
                    panelSize: 3
                };
                
                document.getElementById('comic-canvas').innerHTML = '';
                document.getElementById('empty-canvas-message').style.display = 'block';
                document.getElementById('comic-output').innerHTML = '<div class="empty-output-message" style="text-align: center; padding: 50px; color: #999; font-size: 1.2rem; width: 100%;">Your generated comic strip will appear here!</div>';
                
                updatePanelCount();
                renderOptions();
                
                // Reset slider
                document.getElementById('panel-size-slider').value = 3;
                
                // Add a default panel
                addNewPanel();
            }
        }

        // Initialize the app when the page loads
        document.addEventListener('DOMContentLoaded', initApp);