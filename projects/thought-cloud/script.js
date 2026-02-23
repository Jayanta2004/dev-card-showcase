        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const thoughtInput = document.getElementById('thought-input');
            const moodSelect = document.getElementById('mood-select');
            const sizeSlider = document.getElementById('size-slider');
            const sizeValue = document.getElementById('size-value');
            const addThoughtBtn = document.getElementById('add-thought-btn');
            const addRandomBtn = document.getElementById('add-random-btn');
            const clearCloudBtn = document.getElementById('clear-cloud-btn');
            const thoughtCloud = document.getElementById('thought-cloud');
            const colorOptions = document.querySelectorAll('.color-option');
            const exampleThoughts = document.querySelectorAll('.example-thought');
            
            // Stats elements
            const totalThoughtsEl = document.getElementById('total-thoughts');
            const activeThoughtsEl = document.getElementById('active-thoughts');
            const avgSizeEl = document.getElementById('avg-size');
            const moodCountEl = document.getElementById('mood-count');
            
            // State variables
            let thoughts = [];
            let selectedColor = 1;
            let nextId = 1;
            let isDragging = false;
            let currentDraggedBubble = null;
            let dragOffset = { x: 0, y: 0 };
            
            // Mood emoji mapping
            const moodEmojis = {
                happy: "😊",
                excited: "😃",
                calm: "😌",
                thoughtful: "🤔",
                creative: "🎨",
                worried: "😟",
                inspired: "✨",
                grateful: "🙏"
            };
            
            // Initialize particles
            initParticles();
            
            // Set up color selection
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    selectedColor = parseInt(this.getAttribute('data-color'));
                });
            });
            
            // Update size slider display
            sizeSlider.addEventListener('input', function() {
                const size = parseInt(this.value);
                if (size < 100) {
                    sizeValue.textContent = "Small";
                } else if (size < 150) {
                    sizeValue.textContent = "Medium";
                } else {
                    sizeValue.textContent = "Large";
                }
            });
            
            // Add thought button
            addThoughtBtn.addEventListener('click', function() {
                const thoughtText = thoughtInput.value.trim();
                if (thoughtText) {
                    addThoughtToCloud(thoughtText, moodSelect.value, parseInt(sizeSlider.value), selectedColor);
                    thoughtInput.value = "";
                    thoughtInput.focus();
                } else {
                    alert("Please enter a thought before adding it to the cloud.");
                }
            });
            
            // Add random thought button
            addRandomBtn.addEventListener('click', function() {
                const randomThoughts = [
                    "I wonder what tomorrow will bring",
                    "Remember to call mom this weekend",
                    "The stars are beautiful tonight",
                    "I should learn something new",
                    "Time to take a deep breath",
                    "What makes me truly happy?",
                    "Small steps lead to big changes",
                    "Nature always finds a way",
                    "Let go of what you can't control",
                    "Kindness costs nothing"
                ];
                
                const randomMoods = ["happy", "excited", "calm", "thoughtful", "creative", "grateful"];
                const randomColors = [1, 2, 3, 4, 5, 6];
                
                const randomThought = randomThoughts[Math.floor(Math.random() * randomThoughts.length)];
                const randomMood = randomMoods[Math.floor(Math.random() * randomMoods.length)];
                const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
                const randomSize = 80 + Math.floor(Math.random() * 120);
                
                addThoughtToCloud(randomThought, randomMood, randomSize, randomColor);
            });
            
            // Clear cloud button
            clearCloudBtn.addEventListener('click', function() {
                if (thoughts.length > 0) {
                    if (confirm("Clear all thoughts from the cloud?")) {
                        thoughts.forEach(thought => {
                            if (thought.element) {
                                thought.element.remove();
                            }
                        });
                        thoughts = [];
                        updateStats();
                    }
                }
            });
            
            // Example thoughts
            exampleThoughts.forEach(example => {
                example.addEventListener('click', function() {
                    const thoughtText = this.getAttribute('data-thought');
                    const mood = this.getAttribute('data-mood');
                    
                    // Set the mood in the select
                    moodSelect.value = mood;
                    
                    // Add to cloud
                    addThoughtToCloud(thoughtText, mood, parseInt(sizeSlider.value), selectedColor);
                });
            });
            
            // Function to add a thought to the cloud
            function addThoughtToCloud(text, mood, size, colorClass) {
                // Create bubble element
                const bubble = document.createElement('div');
                bubble.className = `thought-bubble bubble-color-${colorClass}`;
                bubble.id = `thought-${nextId}`;
                
                // Set random position within the cloud container
                const maxX = thoughtCloud.clientWidth - size - 20;
                const maxY = thoughtCloud.clientHeight - size - 20;
                const posX = 10 + Math.random() * maxX;
                const posY = 10 + Math.random() * maxY;
                
                bubble.style.width = `${size}px`;
                bubble.style.height = `${size}px`;
                bubble.style.left = `${posX}px`;
                bubble.style.top = `${posY}px`;
                bubble.style.fontSize = `${Math.max(12, size / 10)}px`;
                
                // Add floating animation
                const floatDuration = 15 + Math.random() * 10;
                const floatDelay = Math.random() * 5;
                bubble.style.animation = `float ${floatDuration}s ease-in-out ${floatDelay}s infinite`;
                
                // Add content
                const emoji = moodEmojis[mood] || "💭";
                bubble.innerHTML = `
                    <div class="bubble-content">
                        <div class="bubble-emoji">${emoji}</div>
                        <div>${text}</div>
                    </div>
                `;
                
                // Add to cloud
                thoughtCloud.appendChild(bubble);
                
                // Add event listeners for interaction
                bubble.addEventListener('click', function(e) {
                    if (!isDragging) {
                        popBubble(this.id);
                    }
                });
                
                // Drag functionality
                bubble.addEventListener('mousedown', startDrag);
                bubble.addEventListener('touchstart', startDragTouch);
                
                // Store thought data
                const thought = {
                    id: nextId,
                    text: text,
                    mood: mood,
                    size: size,
                    color: colorClass,
                    element: bubble,
                    position: { x: posX, y: posY },
                    createdAt: new Date()
                };
                
                thoughts.push(thought);
                nextId++;
                
                // Update stats
                updateStats();
                
                // Remove initial message if present
                const initialMessage = thoughtCloud.querySelector('.initial-message');
                if (initialMessage) {
                    initialMessage.style.display = 'none';
                }
            }
            
            // Function to pop a bubble
            function popBubble(bubbleId) {
                const bubble = document.getElementById(bubbleId);
                if (bubble) {
                    bubble.classList.add('popped');
                    
                    // Remove from array after animation
                    setTimeout(() => {
                        bubble.remove();
                        
                        // Remove from thoughts array
                        const thoughtId = parseInt(bubbleId.replace('thought-', ''));
                        thoughts = thoughts.filter(t => t.id !== thoughtId);
                        
                        // Update stats
                        updateStats();
                        
                        // Show initial message if no thoughts left
                        if (thoughts.length === 0) {
                            const initialMessage = thoughtCloud.querySelector('.initial-message');
                            if (initialMessage) {
                                initialMessage.style.display = 'block';
                            }
                        }
                    }, 500);
                }
            }
            
            // Drag and drop functionality
            function startDrag(e) {
                e.preventDefault();
                isDragging = true;
                currentDraggedBubble = e.target.closest('.thought-bubble');
                
                if (!currentDraggedBubble) return;
                
                const rect = currentDraggedBubble.getBoundingClientRect();
                const cloudRect = thoughtCloud.getBoundingClientRect();
                
                dragOffset.x = e.clientX - rect.left + cloudRect.left;
                dragOffset.y = e.clientY - rect.top + cloudRect.top;
                
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
                
                // Bring to front
                currentDraggedBubble.style.zIndex = 1000;
            }
            
            function startDragTouch(e) {
                e.preventDefault();
                if (e.touches.length !== 1) return;
                
                isDragging = true;
                currentDraggedBubble = e.target.closest('.thought-bubble');
                
                if (!currentDraggedBubble) return;
                
                const touch = e.touches[0];
                const rect = currentDraggedBubble.getBoundingClientRect();
                const cloudRect = thoughtCloud.getBoundingClientRect();
                
                dragOffset.x = touch.clientX - rect.left + cloudRect.left;
                dragOffset.y = touch.clientY - rect.top + cloudRect.top;
                
                document.addEventListener('touchmove', dragTouch);
                document.addEventListener('touchend', stopDrag);
                
                // Bring to front
                currentDraggedBubble.style.zIndex = 1000;
            }
            
            function drag(e) {
                if (!isDragging || !currentDraggedBubble) return;
                
                const cloudRect = thoughtCloud.getBoundingClientRect();
                const bubbleSize = currentDraggedBubble.offsetWidth;
                
                let newX = e.clientX - dragOffset.x;
                let newY = e.clientY - dragOffset.y;
                
                // Constrain within cloud boundaries
                newX = Math.max(10, Math.min(newX, cloudRect.width - bubbleSize - 10));
                newY = Math.max(10, Math.min(newY, cloudRect.height - bubbleSize - 10));
                
                currentDraggedBubble.style.left = `${newX}px`;
                currentDraggedBubble.style.top = `${newY}px`;
            }
            
            function dragTouch(e) {
                if (!isDragging || !currentDraggedBubble || e.touches.length !== 1) return;
                
                const touch = e.touches[0];
                const cloudRect = thoughtCloud.getBoundingClientRect();
                const bubbleSize = currentDraggedBubble.offsetWidth;
                
                let newX = touch.clientX - dragOffset.x;
                let newY = touch.clientY - dragOffset.y;
                
                // Constrain within cloud boundaries
                newX = Math.max(10, Math.min(newX, cloudRect.width - bubbleSize - 10));
                newY = Math.max(10, Math.min(newY, cloudRect.height - bubbleSize - 10));
                
                currentDraggedBubble.style.left = `${newX}px`;
                currentDraggedBubble.style.top = `${newY}px`;
            }
            
            function stopDrag() {
                isDragging = false;
                if (currentDraggedBubble) {
                    currentDraggedBubble.style.zIndex = 1;
                    
                    // Update thought position in array
                    const thoughtId = parseInt(currentDraggedBubble.id.replace('thought-', ''));
                    const thought = thoughts.find(t => t.id === thoughtId);
                    if (thought) {
                        thought.position.x = parseFloat(currentDraggedBubble.style.left);
                        thought.position.y = parseFloat(currentDraggedBubble.style.top);
                    }
                }
                
                currentDraggedBubble = null;
                
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('touchmove', dragTouch);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchend', stopDrag);
            }
            
            // Update statistics
            function updateStats() {
                totalThoughtsEl.textContent = thoughts.length;
                activeThoughtsEl.textContent = thoughts.length;
                
                if (thoughts.length > 0) {
                    const totalSize = thoughts.reduce((sum, thought) => sum + thought.size, 0);
                    const avgSize = Math.round(totalSize / thoughts.length);
                    avgSizeEl.textContent = avgSize;
                    
                    // Count unique moods
                    const uniqueMoods = [...new Set(thoughts.map(thought => thought.mood))];
                    moodCountEl.textContent = uniqueMoods.length;
                } else {
                    avgSizeEl.textContent = 0;
                    moodCountEl.textContent = 0;
                }
            }
            
            // Initialize background particles
            function initParticles() {
                const particlesContainer = document.getElementById('particles');
                const particleCount = 50;
                
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    
                    // Random size
                    const size = 1 + Math.random() * 3;
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    
                    // Random position
                    particle.style.left = `${Math.random() * 100}vw`;
                    
                    // Random animation delay and duration
                    const delay = Math.random() * 20;
                    const duration = 15 + Math.random() * 25;
                    particle.style.animationDelay = `${delay}s`;
                    particle.style.animationDuration = `${duration}s`;
                    
                    particlesContainer.appendChild(particle);
                }
            }
            
            // Add some initial thoughts
            setTimeout(() => {
                addThoughtToCloud("Welcome to your thought cloud!", "happy", 140, 4);
                addThoughtToCloud("Click on bubbles to pop them", "thoughtful", 130, 2);
                addThoughtToCloud("Drag bubbles to move them around", "excited", 150, 5);
            }, 500);
            
            // Allow Enter key to add thoughts
            thoughtInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addThoughtBtn.click();
                }
            });
        });