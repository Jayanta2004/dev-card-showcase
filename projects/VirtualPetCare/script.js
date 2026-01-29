        // Pet state object
        const pet = {
            hunger: 50,
            happiness: 50,
            cleanliness: 50,
            lastUpdate: Date.now()
        };

        // DOM Elements
        const hungerValue = document.getElementById('hungerValue');
        const happinessValue = document.getElementById('happinessValue');
        const cleanlinessValue = document.getElementById('cleanlinessValue');
        const hungerProgress = document.getElementById('hungerProgress');
        const happinessProgress = document.getElementById('happinessProgress');
        const cleanlinessProgress = document.getElementById('cleanlinessProgress');
        const statusMessage = document.getElementById('statusMessage');
        const petMessage = document.getElementById('petMessage');
        const lastSaved = document.getElementById('lastSaved');
        
        const feedBtn = document.getElementById('feedBtn');
        const playBtn = document.getElementById('playBtn');
        const cleanBtn = document.getElementById('cleanBtn');

        // Pet messages for different states
        const messages = {
            hungry: ["I'm hungry!", "Feed me please!", "My tummy is rumbling..."],
            happy: ["I love playing!", "This is fun!", "You're the best!"],
            dirty: ["I need a bath!", "I'm getting messy!", "Clean me up!"],
            good: ["I feel great!", "Thanks for taking care of me!", "Life is good!"]
        };

        // Initialize the game
        function init() {
            loadPetState();
            updateDisplay();
            setInterval(updateStats, 30000); // Update stats every 30 seconds
            setInterval(savePetState, 10000); // Auto-save every 10 seconds
            
            // Set up event listeners
            feedBtn.addEventListener('click', feedPet);
            playBtn.addEventListener('click', playWithPet);
            cleanBtn.addEventListener('click', cleanPet);
            
            // Show initial message
            showPetMessage("Hello! I'm your new virtual pet!");
        }

        // Load pet state from localStorage
        function loadPetState() {
            const savedPet = localStorage.getItem('virtualPet');
            if (savedPet) {
                const parsedPet = JSON.parse(savedPet);
                pet.hunger = parsedPet.hunger || 50;
                pet.happiness = parsedPet.happiness || 50;
                pet.cleanliness = parsedPet.cleanliness || 50;
                pet.lastUpdate = parsedPet.lastUpdate || Date.now();
                
                // Update last saved time display
                const lastSaveTime = parsedPet.lastSaveTime || parsedPet.lastUpdate;
                if (lastSaveTime) {
                    const date = new Date(lastSaveTime);
                    lastSaved.textContent = `Last saved: ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                }
                
                showStatusMessage("Loaded your pet's previous state!");
            } else {
                showStatusMessage("Welcome to your new virtual pet!");
            }
        }

        // Save pet state to localStorage
        function savePetState() {
            pet.lastSaveTime = Date.now();
            localStorage.setItem('virtualPet', JSON.stringify(pet));
            
            // Update last saved time display
            const date = new Date();
            lastSaved.textContent = `Last saved: ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        // Update pet stats over time
        function updateStats() {
            const now = Date.now();
            const timePassed = (now - pet.lastUpdate) / 1000 / 60; // Time in minutes
            pet.lastUpdate = now;
            
            // Decrease stats over time (1% per minute)
            const decay = Math.min(timePassed, 60); // Cap at 60 minutes
            pet.hunger = Math.max(0, pet.hunger - decay * 0.5);
            pet.happiness = Math.max(0, pet.happiness - decay * 0.3);
            pet.cleanliness = Math.max(0, pet.cleanliness - decay * 0.4);
            
            updateDisplay();
            
            // Show message if any stat is too low
            if (pet.hunger < 20) {
                showPetMessage(getRandomMessage(messages.hungry));
            } else if (pet.cleanliness < 20) {
                showPetMessage(getRandomMessage(messages.dirty));
            } else if (pet.happiness < 20) {
                showPetMessage("I'm bored...");
            }
        }

        // Update the display with current pet stats
        function updateDisplay() {
            // Update values
            hungerValue.textContent = `${Math.round(pet.hunger)}%`;
            happinessValue.textContent = `${Math.round(pet.happiness)}%`;
            cleanlinessValue.textContent = `${Math.round(pet.cleanliness)}%`;
            
            // Update progress bars
            hungerProgress.style.width = `${pet.hunger}%`;
            happinessProgress.style.width = `${pet.happiness}%`;
            cleanlinessProgress.style.width = `${pet.cleanliness}%`;
            
            // Update pet appearance based on stats
            updatePetAppearance();
        }

        // Update pet appearance based on stats
        function updatePetAppearance() {
            const petBody = document.querySelector('.pet-body');
            const petMouth = document.querySelector('.pet-mouth');
            
            // Change color based on overall wellness
            const average = (pet.hunger + pet.happiness + pet.cleanliness) / 3;
            
            if (average > 70) {
                petBody.style.backgroundColor = '#d8a7ca'; // Healthy pink
                petMouth.style.borderBottom = '8px solid #2a2d43'; // Normal mouth
            } else if (average > 40) {
                petBody.style.backgroundColor = '#c997ba'; // Slightly dull
                petMouth.style.borderBottom = '6px solid #2a2d43'; // Smaller mouth
            } else {
                petBody.style.backgroundColor = '#ba87ab'; // Unhealthy dull color
                petMouth.style.borderBottom = '4px solid #2a2d43'; // Very small mouth
            }
        }

        // Feed the pet
        function feedPet() {
            pet.hunger = Math.min(100, pet.hunger + 15);
            pet.happiness = Math.min(100, pet.happiness + 5);
            pet.cleanliness = Math.max(0, pet.cleanliness - 3);
            
            updateDisplay();
            savePetState();
            
            showStatusMessage("You fed your pet! Hunger decreased.");
            showPetMessage(getRandomMessage(messages.hungry));
        }

        // Play with the pet
        function playWithPet() {
            pet.happiness = Math.min(100, pet.happiness + 15);
            pet.hunger = Math.max(0, pet.hunger - 5);
            
            updateDisplay();
            savePetState();
            
            showStatusMessage("You played with your pet! Happiness increased.");
            showPetMessage(getRandomMessage(messages.happy));
        }

        // Clean the pet
        function cleanPet() {
            pet.cleanliness = Math.min(100, pet.cleanliness + 20);
            pet.happiness = Math.min(100, pet.happiness + 5);
            
            updateDisplay();
            savePetState();
            
            showStatusMessage("You cleaned your pet! Cleanliness increased.");
            showPetMessage(getRandomMessage(messages.dirty));
        }

        // Show a status message
        function showStatusMessage(message) {
            statusMessage.textContent = message;
        }

        // Show a message from the pet
        function showPetMessage(message) {
            petMessage.textContent = message;
            petMessage.classList.add('show');
            
            setTimeout(() => {
                petMessage.classList.remove('show');
            }, 3000);
        }

        // Get a random message from an array
        function getRandomMessage(messageArray) {
            return messageArray[Math.floor(Math.random() * messageArray.length)];
        }

        // Initialize the game when the page loads
        window.addEventListener('DOMContentLoaded', init);
