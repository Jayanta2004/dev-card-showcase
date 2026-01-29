        // DOM Elements
        const noteInput = document.getElementById('noteInput');
        const countdownDisplay = document.getElementById('countdown');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const timerButtons = document.querySelectorAll('.timer-btn');
        const burnContainer = document.getElementById('burnContainer');
        const noteHistory = document.getElementById('noteHistory');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Timer variables
        let countdown;
        let timeLeft = 300; // Default 5 minutes in seconds
        let selectedTime = 300; // Default 5 minutes
        let isRunning = false;
        let originalNote = '';
        
        // Load history from localStorage
        loadHistory();
        
        // Timer button event listeners
        timerButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                timerButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                // Update selected time
                selectedTime = parseInt(button.dataset.seconds);
                
                // Update display only if timer is not running
                if (!isRunning) {
                    timeLeft = selectedTime;
                    updateDisplay();
                }
            });
        });
        
        // Start button event listener
        startBtn.addEventListener('click', () => {
            if (noteInput.value.trim() === '') {
                alert('Please enter a note before activating destruction!');
                return;
            }
            
            if (!isRunning) {
                startTimer();
                originalNote = noteInput.value;
                startBtn.disabled = true;
                resetBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-pause"></i> DESTRUCTION ACTIVE';
            } else {
                pauseTimer();
                startBtn.innerHTML = '<i class="fas fa-play"></i> RESUME DESTRUCTION';
            }
        });
        
        // Reset button event listener
        resetBtn.addEventListener('click', () => {
            resetTimer();
        });
        
        // Clear history button
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all history?')) {
                localStorage.removeItem('incineratorNotesHistory');
                noteHistory.innerHTML = '';
            }
        });
        
        // Timer functions
        function startTimer() {
            isRunning = true;
            noteInput.disabled = true;
            
            countdown = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(countdown);
                    triggerDestruction();
                }
            }, 1000);
        }
        
        function pauseTimer() {
            isRunning = false;
            clearInterval(countdown);
        }
        
        function resetTimer() {
            clearInterval(countdown);
            isRunning = false;
            timeLeft = selectedTime;
            updateDisplay();
            noteInput.disabled = false;
            startBtn.disabled = false;
            resetBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-play"></i> ACTIVATE DESTRUCTION';
            
            // Restore original note if it was saved
            if (originalNote) {
                noteInput.value = originalNote;
            }
        }
        
        function updateDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Change color when time is running low
            if (timeLeft <= 30) {
                countdownDisplay.style.color = '#ff3c00';
                countdownDisplay.style.textShadow = '0 0 10px rgba(255, 60, 0, 0.9)';
            } else if (timeLeft <= 60) {
                countdownDisplay.style.color = '#ff9900';
                countdownDisplay.style.textShadow = '0 0 10px rgba(255, 153, 0, 0.7)';
            } else {
                countdownDisplay.style.color = '#00ff95';
                countdownDisplay.style.textShadow = '0 0 10px rgba(0, 255, 149, 0.7)';
            }
        }
        
        function triggerDestruction() {
            // Create burn animation
            createBurnAnimation();
            
            // Add to history before clearing
            addToHistory(originalNote);
            
            // Clear the note after a delay to allow animation to play
            setTimeout(() => {
                noteInput.value = '';
                resetTimer();
                
                // Hide burn animation
                setTimeout(() => {
                    burnContainer.style.opacity = '0';
                    // Clear flames and ash after animation
                    setTimeout(() => {
                        burnContainer.innerHTML = '';
                    }, 1000);
                }, 1000);
            }, 2000);
        }
        
        function createBurnAnimation() {
            // Show the burn container
            burnContainer.style.opacity = '1';
            burnContainer.innerHTML = '<div class="burn-overlay"></div>';
            
            // Create flames
            for (let i = 0; i < 30; i++) {
                createFlame();
            }
            
            // Create ash particles
            for (let i = 0; i < 50; i++) {
                createAsh();
            }
        }
        
        function createFlame() {
            const flame = document.createElement('div');
            flame.classList.add('flame');
            
            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            flame.style.left = `${x}%`;
            flame.style.top = `${y}%`;
            
            // Random size
            const size = 20 + Math.random() * 60;
            flame.style.width = `${size}px`;
            flame.style.height = `${size}px`;
            
            // Random animation delay
            flame.style.animationDelay = `${Math.random() * 0.5}s`;
            
            burnContainer.appendChild(flame);
            
            // Remove flame after animation
            setTimeout(() => {
                flame.remove();
            }, 2000);
        }
        
        function createAsh() {
            const ash = document.createElement('div');
            ash.classList.add('ash');
            
            // Random position
            const x = Math.random() * 100;
            ash.style.left = `${x}%`;
            ash.style.top = '0%';
            
            // Random size
            const size = 2 + Math.random() * 6;
            ash.style.width = `${size}px`;
            ash.style.height = `${size}px`;
            
            burnContainer.appendChild(ash);
            
            // Animate ash falling
            const duration = 2 + Math.random() * 3;
            ash.style.transition = `all ${duration}s linear`;
            
            // Trigger animation
            setTimeout(() => {
                ash.style.top = '100%';
                ash.style.opacity = '0';
                ash.style.transform = `translateX(${Math.random() * 100 - 50}px)`;
            }, 10);
            
            // Remove ash after animation
            setTimeout(() => {
                ash.remove();
            }, duration * 1000);
        }
        
        function addToHistory(noteText) {
            if (!noteText.trim()) return;
            
            // Create history item
            const historyItem = document.createElement('li');
            const timestamp = new Date().toLocaleString();
            const truncatedNote = noteText.length > 100 ? noteText.substring(0, 100) + '...' : noteText;
            
            historyItem.innerHTML = `
                <div class="note-text">${truncatedNote}</div>
                <div class="time">Destroyed: ${timestamp}</div>
            `;
            
            // Add to the beginning of the list
            noteHistory.prepend(historyItem);
            
            // Save to localStorage
            saveHistoryItem(truncatedNote, timestamp);
            
            // Limit history to 10 items
            if (noteHistory.children.length > 10) {
                noteHistory.removeChild(noteHistory.lastChild);
                updateLocalStorage();
            }
        }
        
        function saveHistoryItem(noteText, timestamp) {
            let history = JSON.parse(localStorage.getItem('incineratorNotesHistory')) || [];
            history.unshift({ note: noteText, time: timestamp });
            
            // Keep only last 10 items
            if (history.length > 10) {
                history = history.slice(0, 10);
            }
            
            localStorage.setItem('incineratorNotesHistory', JSON.stringify(history));
        }
        
        function loadHistory() {
            const history = JSON.parse(localStorage.getItem('incineratorNotesHistory')) || [];
            
            history.forEach(item => {
                const historyItem = document.createElement('li');
                historyItem.innerHTML = `
                    <div class="note-text">${item.note}</div>
                    <div class="time">Destroyed: ${item.time}</div>
                `;
                noteHistory.appendChild(historyItem);
            });
        }
        
        function updateLocalStorage() {
            const items = Array.from(noteHistory.children).map(li => {
                const noteText = li.querySelector('.note-text').textContent;
                const time = li.querySelector('.time').textContent.replace('Destroyed: ', '');
                return { note: noteText, time: time };
            });
            
            localStorage.setItem('incineratorNotesHistory', JSON.stringify(items));
        }
        
        // Initialize display
        updateDisplay();