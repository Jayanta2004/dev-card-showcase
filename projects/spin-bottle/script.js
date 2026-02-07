        // Game state
        const gameState = {
            players: [
                { id: 1, name: "Alex", avatarColor: "#2196F3", active: true },
                { id: 2, name: "Jordan", avatarColor: "#4CAF50", active: true },
                { id: 3, name: "Taylor", avatarColor: "#9C27B0", active: true },
                { id: 4, name: "Morgan", avatarColor: "#FF9800", active: true },
                { id: 5, name: "Casey", avatarColor: "#E91E63", active: true },
                { id: 6, name: "Riley", avatarColor: "#00BCD4", active: true }
            ],
            isSpinning: false,
            currentSpinAngle: 0,
            selectedPlayer: null,
            targetPlayer: null,
            nextPlayerId: 7
        };

        // Dare ideas
        const dares = [
            "Do your best impression of a famous celebrity",
            "Sing a song of your choice for 30 seconds",
            "Tell a funny joke that makes at least 2 people laugh",
            "Dance like nobody's watching for 1 minute",
            "Speak in an accent for the next 3 rounds",
            "Let the group choose a new hairstyle for you",
            "Call a friend and sing 'Happy Birthday' to them",
            "Post a silly selfie on social media",
            "Do 10 pushups right now",
            "Eat a spoonful of a condiment of the group's choice",
            "Wear socks on your hands for the next 10 minutes",
            "Talk only in rhymes for the next 5 minutes",
            "Let someone draw a mustache on your face",
            "Do an impression of another player",
            "Text the 5th person in your contacts 'I miss you'",
            "Balance a spoon on your nose for 30 seconds",
            "Let the group give you a new nickname for the rest of the game",
            "Act like a chicken until your next turn",
            "Say the alphabet backwards in 30 seconds",
            "Do a fashion show with 3 items from the room"
        ];

        // DOM Elements
        const playersList = document.getElementById('playersList');
        const playersCircle = document.getElementById('playersCircle');
        const bottle = document.getElementById('bottle');
        const spinBtn = document.getElementById('spinBtn');
        const addPlayerBtn = document.getElementById('addPlayerBtn');
        const resetBtn = document.getElementById('resetBtn');
        const dareBtn = document.getElementById('dareBtn');
        const resultContent = document.getElementById('resultContent');
        const dareList = document.getElementById('dareList');

        // Initialize the game
        function initGame() {
            renderPlayersList();
            renderPlayerMarkers();
            renderDareList();
            updateResultDisplay();
            
            // Set up event listeners
            spinBtn.addEventListener('click', spinBottle);
            addPlayerBtn.addEventListener('click', addPlayer);
            resetBtn.addEventListener('click', resetGame);
            dareBtn.addEventListener('click', generateRandomDare);
        }

        // Render players list
        function renderPlayersList() {
            playersList.innerHTML = '';
            
            gameState.players.forEach(player => {
                const playerItem = document.createElement('div');
                playerItem.className = 'player-item';
                playerItem.id = `player-${player.id}`;
                
                if (player.id === gameState.selectedPlayer) {
                    playerItem.classList.add('selected');
                }
                
                if (player.id === gameState.targetPlayer) {
                    playerItem.classList.add('target');
                }
                
                playerItem.innerHTML = `
                    <div class="player-info">
                        <div class="player-avatar" style="background-color: ${player.avatarColor}">
                            ${player.name.charAt(0)}
                        </div>
                        <div>
                            <div class="player-name">${player.name}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">${player.active ? 'Active' : 'Inactive'}</div>
                        </div>
                    </div>
                    <div class="player-actions">
                        <button class="icon-btn toggle-player-btn" data-id="${player.id}" title="${player.active ? 'Deactivate' : 'Activate'}">
                            <i class="fas fa-${player.active ? 'user-slash' : 'user-check'}"></i>
                        </button>
                        <button class="icon-btn remove-player-btn" data-id="${player.id}" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                playersList.appendChild(playerItem);
            });
            
            // Add event listeners for player buttons
            document.querySelectorAll('.toggle-player-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const playerId = parseInt(this.getAttribute('data-id'));
                    togglePlayer(playerId);
                });
            });
            
            document.querySelectorAll('.remove-player-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const playerId = parseInt(this.getAttribute('data-id'));
                    removePlayer(playerId);
                });
            });
        }

        // Render player markers around the bottle
        function renderPlayerMarkers() {
            playersCircle.innerHTML = '';
            
            const activePlayers = gameState.players.filter(p => p.active);
            if (activePlayers.length === 0) return;
            
            const angleStep = 360 / activePlayers.length;
            
            activePlayers.forEach((player, index) => {
                const angle = index * angleStep;
                const marker = document.createElement('div');
                marker.className = 'player-marker';
                marker.id = `marker-${player.id}`;
                marker.textContent = player.name.charAt(0);
                marker.style.backgroundColor = player.avatarColor;
                marker.style.transform = `rotate(${angle}deg) translate(0, -140px) rotate(-${angle}deg)`;
                
                if (player.id === gameState.selectedPlayer) {
                    marker.classList.add('selected');
                }
                
                if (player.id === gameState.targetPlayer) {
                    marker.classList.add('target');
                }
                
                playersCircle.appendChild(marker);
            });
        }

        // Render dare list
        function renderDareList() {
            dareList.innerHTML = '';
            
            // Show 5 random dares
            const shuffledDares = [...dares].sort(() => 0.5 - Math.random()).slice(0, 5);
            
            shuffledDares.forEach(dare => {
                const dareItem = document.createElement('div');
                dareItem.className = 'dare-item';
                dareItem.innerHTML = `
                    <div class="dare-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div>${dare}</div>
                `;
                dareList.appendChild(dareItem);
            });
        }

        // Spin the bottle
        function spinBottle() {
            if (gameState.isSpinning) return;
            
            const activePlayers = gameState.players.filter(p => p.active);
            if (activePlayers.length < 2) {
                alert("You need at least 2 active players to spin the bottle!");
                return;
            }
            
            // Reset previous selections
            gameState.selectedPlayer = null;
            gameState.targetPlayer = null;
            updateResultDisplay();
            
            // Start spinning
            gameState.isSpinning = true;
            spinBtn.disabled = true;
            spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Spinning...';
            
            // Calculate random spin (multiple full rotations plus extra)
            const fullRotations = 5 + Math.floor(Math.random() * 5);
            const extraAngle = Math.floor(Math.random() * 360);
            const totalRotation = (fullRotations * 360) + extraAngle;
            
            // Apply spinning animation
            bottle.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.3, 1)';
            bottle.style.transform = `translate(-50%, -50%) rotate(${totalRotation}deg)`;
            
            // Update current angle
            gameState.currentSpinAngle = totalRotation % 360;
            
            // Determine which player the bottle points to
            setTimeout(() => {
                gameState.isSpinning = false;
                spinBtn.disabled = false;
                spinBtn.innerHTML = '<i class="fas fa-sync-alt"></i> SPIN THE BOTTLE!';
                
                // Calculate which player is selected
                const activePlayers = gameState.players.filter(p => p.active);
                const angleStep = 360 / activePlayers.length;
                
                // The bottle points at 0 degrees (straight up)
                // We need to find which player segment contains the bottle's angle
                const normalizedAngle = (360 - (gameState.currentSpinAngle % 360)) % 360;
                const selectedIndex = Math.floor(normalizedAngle / angleStep);
                
                // Select a random target player (different from selected)
                let targetIndex;
                do {
                    targetIndex = Math.floor(Math.random() * activePlayers.length);
                } while (targetIndex === selectedIndex && activePlayers.length > 1);
                
                gameState.selectedPlayer = activePlayers[selectedIndex].id;
                gameState.targetPlayer = activePlayers[targetIndex].id;
                
                // Update UI
                renderPlayersList();
                renderPlayerMarkers();
                updateResultDisplay();
                
                // Add celebration effect
                celebrateSelection();
            }, 3000);
        }

        // Update result display
        function updateResultDisplay() {
            const selectedPlayer = gameState.players.find(p => p.id === gameState.selectedPlayer);
            const targetPlayer = gameState.players.find(p => p.id === gameState.targetPlayer);
            
            if (!selectedPlayer || !targetPlayer) {
                resultContent.innerHTML = `
                    <p>Spin the bottle to see who it selects!</p>
                    <p style="font-size: 1.2rem; color: #ffcc80;">Add at least 2 players to start the game</p>
                `;
                return;
            }
            
            resultContent.innerHTML = `
                <div class="player-pair">
                    <div class="player-result">
                        <div class="player-result-avatar" style="background-color: ${selectedPlayer.avatarColor}">
                            ${selectedPlayer.name.charAt(0)}
                        </div>
                        <div>${selectedPlayer.name}</div>
                    </div>
                    
                    <div class="vs-text">
                        <i class="fas fa-heart"></i>
                    </div>
                    
                    <div class="player-result">
                        <div class="player-result-avatar" style="background-color: ${targetPlayer.avatarColor}">
                            ${targetPlayer.name.charAt(0)}
                        </div>
                        <div>${targetPlayer.name}</div>
                    </div>
                </div>
                <div class="action-text" id="actionText">
                    Click "Random Dare" for a challenge!
                </div>
            `;
        }

        // Generate random dare
        function generateRandomDare() {
            const selectedPlayer = gameState.players.find(p => p.id === gameState.selectedPlayer);
            const targetPlayer = gameState.players.find(p => p.id === gameState.targetPlayer);
            
            if (!selectedPlayer || !targetPlayer) {
                alert("You need to spin the bottle first!");
                return;
            }
            
            const randomDare = dares[Math.floor(Math.random() * dares.length)];
            const actionText = document.getElementById('actionText');
            
            if (actionText) {
                actionText.innerHTML = `
                    <i class="fas fa-fire"></i> ${randomDare}
                `;
                actionText.classList.add('pulse');
                
                // Remove pulse animation after 3 seconds
                setTimeout(() => {
                    actionText.classList.remove('pulse');
                }, 3000);
            }
        }

        // Add a new player
        function addPlayer() {
            const names = ["Avery", "Blake", "Cameron", "Dakota", "Emerson", "Finley", "Harley", "Justice", "Kai", "Landry", "Marley", "Peyton", "Quinn", "Remy", "Rowan", "Sage", "Shiloh", "Skyler", "Tatum", "Winter"];
            const colors = ["#2196F3", "#4CAF50", "#9C27B0", "#FF9800", "#E91E63", "#00BCD4", "#FF5722", "#795548", "#607D8B", "#3F51B5"];
            
            const randomName = names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 100);
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            const newPlayer = {
                id: gameState.nextPlayerId++,
                name: randomName,
                avatarColor: randomColor,
                active: true
            };
            
            gameState.players.push(newPlayer);
            renderPlayersList();
            renderPlayerMarkers();
        }

        // Toggle player active state
        function togglePlayer(playerId) {
            const player = gameState.players.find(p => p.id === playerId);
            if (player) {
                player.active = !player.active;
                renderPlayersList();
                renderPlayerMarkers();
                
                // Clear selections if player was selected
                if ((playerId === gameState.selectedPlayer || playerId === gameState.targetPlayer) && !player.active) {
                    gameState.selectedPlayer = null;
                    gameState.targetPlayer = null;
                    updateResultDisplay();
                }
            }
        }

        // Remove a player
        function removePlayer(playerId) {
            // Don't allow removing if there are less than 3 players left
            if (gameState.players.length <= 2) {
                alert("You need at least 2 players to play the game!");
                return;
            }
            
            gameState.players = gameState.players.filter(p => p.id !== playerId);
            
            // Clear selections if player was selected
            if (playerId === gameState.selectedPlayer || playerId === gameState.targetPlayer) {
                gameState.selectedPlayer = null;
                gameState.targetPlayer = null;
                updateResultDisplay();
            }
            
            renderPlayersList();
            renderPlayerMarkers();
        }

        // Reset the game
        function resetGame() {
            if (confirm("Are you sure you want to reset the game? This will clear all players and results.")) {
                // Reset to initial state
                gameState.players = [
                    { id: 1, name: "Alex", avatarColor: "#2196F3", active: true },
                    { id: 2, name: "Jordan", avatarColor: "#4CAF50", active: true },
                    { id: 3, name: "Taylor", avatarColor: "#9C27B0", active: true },
                    { id: 4, name: "Morgan", avatarColor: "#FF9800", active: true },
                    { id: 5, name: "Casey", avatarColor: "#E91E63", active: true },
                    { id: 6, name: "Riley", avatarColor: "#00BCD4", active: true }
                ];
                gameState.isSpinning = false;
                gameState.currentSpinAngle = 0;
                gameState.selectedPlayer = null;
                gameState.targetPlayer = null;
                gameState.nextPlayerId = 7;
                
                // Reset bottle position
                bottle.style.transition = 'transform 0.5s';
                bottle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
                
                // Update UI
                renderPlayersList();
                renderPlayerMarkers();
                updateResultDisplay();
                renderDareList();
                
                // Enable spin button
                spinBtn.disabled = false;
                spinBtn.innerHTML = '<i class="fas fa-sync-alt"></i> SPIN THE BOTTLE!';
            }
        }

        // Celebration effect when bottle selects players
        function celebrateSelection() {
            const selectedMarker = document.getElementById(`marker-${gameState.selectedPlayer}`);
            const targetMarker = document.getElementById(`marker-${gameState.targetPlayer}`);
            
            if (selectedMarker) {
                selectedMarker.classList.add('pulse');
            }
            
            if (targetMarker) {
                targetMarker.classList.add('pulse');
            }
            
            // Remove pulse after 3 seconds
            setTimeout(() => {
                if (selectedMarker) selectedMarker.classList.remove('pulse');
                if (targetMarker) targetMarker.classList.remove('pulse');
            }, 3000);
        }

        // Initialize the game when page loads
        document.addEventListener('DOMContentLoaded', initGame);