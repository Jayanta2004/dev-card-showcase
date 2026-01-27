document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const nameInput = document.getElementById('nameInput');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exampleBtn = document.getElementById('exampleBtn');
    const spinBtn = document.getElementById('spinBtn');
    const namesList = document.getElementById('namesList');
    const nameCount = document.getElementById('nameCount');
    const wheel = document.getElementById('wheel');
    const resultDisplay = document.getElementById('resultDisplay');
    const historyList = document.getElementById('historyList');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    
    // State
    let names = [];
    let isSpinning = false;
    let spinAnimation = null;
    let spinSpeed = 5;
    const colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
        '#9b59b6', '#1abc9c', '#d35400', '#34495e',
        '#16a085', '#8e44ad', '#27ae60', '#c0392b',
        '#2980b9', '#f1c40f', '#e67e22', '#7f8c8d'
    ];
    
    // Speed labels
    const speedLabels = {
        1: 'Very Slow', 2: 'Slow', 3: 'Slow-Medium', 4: 'Medium-Slow',
        5: 'Medium', 6: 'Medium-Fast', 7: 'Fast', 8: 'Very Fast',
        9: 'Extremely Fast', 10: 'Ludicrous Speed'
    };
    
    // Initialize
    loadFromLocalStorage();
    updateNamesList();
    updateWheel();
    updateSpeedDisplay();
    
    // Event Listeners
    addBtn.addEventListener('click', addName);
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addName();
    });
    
    clearBtn.addEventListener('click', clearAllNames);
    
    exampleBtn.addEventListener('click', addExampleNames);
    
    spinBtn.addEventListener('click', spinWheel);
    
    speedSlider.addEventListener('input', updateSpeedDisplay);
    
    // Functions
    function addName() {
        const name = nameInput.value.trim();
        
        if (name === '') {
            showMessage('Please enter a name', 'error');
            return;
        }
        
        if (names.includes(name)) {
            showMessage(`"${name}" is already in the list`, 'error');
            return;
        }
        
        names.push(name);
        nameInput.value = '';
        updateNamesList();
        updateWheel();
        saveToLocalStorage();
        showMessage(`"${name}" added to wheel`, 'success');
    }
    
    function removeName(index) {
        const removedName = names[index];
        names.splice(index, 1);
        updateNamesList();
        updateWheel();
        saveToLocalStorage();
        showMessage(`"${removedName}" removed from wheel`, 'info');
    }
    
    function clearAllNames() {
        if (names.length === 0) {
            showMessage('No names to clear', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to remove all ${names.length} names?`)) {
            names = [];
            updateNamesList();
            updateWheel();
            saveToLocalStorage();
            showMessage('All names cleared', 'info');
        }
    }
    
    function addExampleNames() {
        const exampleNames = [
            'Alex Johnson', 'Maria Garcia', 'David Smith', 'Sarah Williams',
            'James Brown', 'Emma Davis', 'Michael Miller', 'Olivia Wilson',
            'Robert Taylor', 'Sophia Anderson', 'William Thomas', 'Isabella Martinez'
        ];
        
        // Add only names that aren't already in the list
        let addedCount = 0;
        exampleNames.forEach(name => {
            if (!names.includes(name)) {
                names.push(name);
                addedCount++;
            }
        });
        
        updateNamesList();
        updateWheel();
        saveToLocalStorage();
        showMessage(`Added ${addedCount} example names`, 'success');
    }
    
    function updateNamesList() {
        nameCount.textContent = names.length;
        
        if (names.length === 0) {
            namesList.innerHTML = '<p class="empty-message">No names added yet. Add some names above!</p>';
            spinBtn.disabled = true;
            return;
        }
        
        spinBtn.disabled = false;
        namesList.innerHTML = '';
        
        names.forEach((name, index) => {
            const nameTag = document.createElement('div');
            nameTag.className = 'name-tag';
            nameTag.innerHTML = `
                <span>${name}</span>
                <button class="remove-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            namesList.appendChild(nameTag);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeName(index);
            });
        });
    }
    
    function updateWheel() {
        wheel.innerHTML = '<div class="wheel-center"></div><div class="pointer"></div>';
        
        if (names.length === 0) {
            wheel.style.background = '#ecf0f1';
            return;
        }
        
        const segmentAngle = 360 / names.length;
        
        for (let i = 0; i < names.length; i++) {
            const segment = document.createElement('div');
            segment.className = 'wheel-segment';
            segment.style.position = 'absolute';
            segment.style.width = '50%';
            segment.style.height = '50%';
            segment.style.transformOrigin = '100% 100%';
            segment.style.transform = `rotate(${i * segmentAngle}deg) skewY(${90 - segmentAngle}deg)`;
            segment.style.backgroundColor = colors[i % colors.length];
            segment.style.overflow = 'hidden';
            
            // Add text to segment
            const text = document.createElement('div');
            text.className = 'segment-text';
            text.textContent = names[i];
            text.style.position = 'absolute';
            text.style.left = '30%';
            text.style.bottom = '10%';
            text.style.transform = `rotate(${segmentAngle/2}deg)`;
            text.style.transformOrigin = '0 0';
            text.style.color = 'white';
            text.style.fontWeight = 'bold';
            text.style.fontSize = names[i].length > 10 ? '0.8rem' : '1rem';
            text.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
            text.style.whiteSpace = 'nowrap';
            
            segment.appendChild(text);
            wheel.appendChild(segment);
        }
    }
    
    function spinWheel() {
        if (isSpinning || names.length === 0) return;
        
        isSpinning = true;
        spinBtn.disabled = true;
        
        // Calculate spin parameters
        const baseDuration = 3000; // Base spin duration in ms
        const speedFactor = spinSpeed / 5; // Normalize speed
        const spinDuration = baseDuration / speedFactor;
        
        // Calculate random stopping point
        const segmentAngle = 360 / names.length;
        const winningSegment = Math.floor(Math.random() * names.length);
        const extraSpins = 5; // Number of full spins before stopping
        const stopAngle = (extraSpins * 360) + (winningSegment * segmentAngle) + (Math.random() * segmentAngle);
        
        // Apply spin animation
        let currentRotation = 0;
        const startTime = Date.now();
        
        function animateSpin() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            currentRotation = easeOut * stopAngle;
            wheel.style.transform = `rotate(${currentRotation}deg)`;
            
            if (progress < 1) {
                spinAnimation = requestAnimationFrame(animateSpin);
            } else {
                finishSpin(winningSegment);
            }
        }
        
        animateSpin();
    }
    
    function finishSpin(winningIndex) {
        isSpinning = false;
        spinBtn.disabled = false;
        
        const winner = names[winningIndex];
        
        // Display winner with animation
        resultDisplay.innerHTML = `<div class="winner-name">${winner}</div>`;
        resultDisplay.classList.add('winner');
        
        // Add to history
        addToHistory(winner);
        
        // Show confetti effect
        showConfetti();
        
        // Remove winner after 5 seconds
        setTimeout(() => {
            resultDisplay.classList.remove('winner');
        }, 5000);
        
        // Re-enable spin button after a short delay
        setTimeout(() => {
            spinBtn.disabled = false;
        }, 1000);
    }
    
    function addToHistory(name) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="history-name">${name}</span>
            <span class="history-time">${timeString}</span>
        `;
        
        // Remove empty message if it exists
        const emptyMsg = historyList.querySelector('.empty-history');
        if (emptyMsg) emptyMsg.remove();
        
        // Add new item at the beginning
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // Limit history to 10 items
        if (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
    
    function updateSpeedDisplay() {
        spinSpeed = parseInt(speedSlider.value);
        speedValue.textContent = speedLabels[spinSpeed];
    }
    
    function showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.position = 'fixed';
        messageEl.style.top = '20px';
        messageEl.style.right = '20px';
        messageEl.style.padding = '15px 25px';
        messageEl.style.borderRadius = '8px';
        messageEl.style.color = 'white';
        messageEl.style.fontWeight = '600';
        messageEl.style.zIndex = '1000';
        messageEl.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        messageEl.style.animation = 'slideInRight 0.3s ease';
        
        // Set color based on type
        if (type === 'error') {
            messageEl.style.backgroundColor = '#e74c3c';
        } else if (type === 'success') {
            messageEl.style.backgroundColor = '#27ae60';
        } else {
            messageEl.style.backgroundColor = '#3498db';
        }
        
        // Add to document
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
        
        // Add CSS for animations
        if (!document.querySelector('#message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function showConfetti() {
        const confettiCount = 100;
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-20px';
            confetti.style.opacity = '0.8';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            
            document.body.appendChild(confetti);
            
            // Animate confetti
            const animation = confetti.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 0.8 },
                { transform: `translate(${Math.random() * 100 - 50}px, 100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            
            // Remove after animation completes
            animation.onfinish = () => {
                document.body.removeChild(confetti);
            };
        }
    }
    
    function saveToLocalStorage() {
        localStorage.setItem('randomNamePicker', JSON.stringify({
            names: names,
            history: Array.from(historyList.children).slice(0, 10).map(child => ({
                name: child.querySelector('.history-name').textContent,
                time: child.querySelector('.history-time').textContent
            }))
        }));
    }
    
    function loadFromLocalStorage() {
        const saved = localStorage.getItem('randomNamePicker');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                names = data.names || [];
                
                // Restore history
                if (data.history && data.history.length > 0) {
                    data.history.forEach(item => {
                        const historyItem = document.createElement('div');
                        historyItem.className = 'history-item';
                        historyItem.innerHTML = `
                            <span class="history-name">${item.name}</span>
                            <span class="history-time">${item.time}</span>
                        `;
                        historyList.appendChild(historyItem);
                    });
                }
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
    
    // Initialize with some names if empty
    if (names.length === 0) {
        addExampleNames();
    }
});