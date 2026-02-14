        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const textInput = document.getElementById('textInput');
            const charCount = document.getElementById('charCount');
            const styleGrid = document.getElementById('styleGrid');
            const sizeSlider = document.getElementById('sizeSlider');
            const sizeValue = document.getElementById('sizeValue');
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            const fontSizeValue = document.getElementById('fontSizeValue');
            const tailPositionSlider = document.getElementById('tailPositionSlider');
            const tailPositionValue = document.getElementById('tailPositionValue');
            const colorPicker = document.getElementById('colorPicker');
            const generateBtn = document.getElementById('generateBtn');
            const clearBtn = document.getElementById('clearBtn');
            const exportBtn = document.getElementById('exportBtn');
            const bubbleCanvas = document.getElementById('bubbleCanvas');
            const bubbleContainer = document.getElementById('bubbleContainer');
            const emptyState = document.getElementById('emptyState');
            const bubblesList = document.getElementById('bubblesList');
            
            // State
            let currentBubbleId = 1;
            let bubbles = [];
            let selectedStyle = 'normal';
            let selectedColor = '#ffffff';
            let isDragging = false;
            let dragBubble = null;
            let dragOffsetX = 0;
            let dragOffsetY = 0;
            
            // Bubble Styles
            const bubbleStyles = [
                { id: 'normal', name: 'Normal', icon: 'fa-comment', color: '#ffffff' },
                { id: 'thought', name: 'Thought', icon: 'fa-brain', color: '#e3f2fd' },
                { id: 'angry', name: 'Angry', icon: 'fa-angry', color: '#ffebee' },
                { id: 'whisper', name: 'Whisper', icon: 'fa-volume-down', color: '#f3e5f5' },
                { id: 'shout', name: 'Shout', icon: 'fa-volume-up', color: '#fff3e0' },
                { id: 'excited', name: 'Excited', icon: 'fa-laugh-beam', color: '#e8f5e9' },
                { id: 'sad', name: 'Sad', icon: 'fa-sad-tear', color: '#e8eaf6' },
                { id: 'love', name: 'Love', icon: 'fa-heart', color: '#fce4ec' }
            ];
            
            // Tail Positions
            const tailPositions = [
                { id: 1, name: 'Bottom Center', class: 'tail-bottom' },
                { id: 2, name: 'Bottom Left', class: 'tail-bottom-left' },
                { id: 3, name: 'Bottom Right', class: 'tail-bottom-right' },
                { id: 4, name: 'Top Center', class: 'tail-top' },
                { id: 5, name: 'Top Left', class: 'tail-top-left' },
                { id: 6, name: 'Top Right', class: 'tail-top-right' },
                { id: 7, name: 'Left', class: 'tail-left' },
                { id: 8, name: 'Right', class: 'tail-right' }
            ];
            
            // Color Options
            const colorOptions = [
                '#ffffff', '#e3f2fd', '#f3e5f5', '#e8f5e9', 
                '#fff3e0', '#ffebee', '#f5f5f5', '#e8eaf6',
                '#fce4ec', '#fff8e1', '#e0f2f1', '#f1f8e9'
            ];
            
            // Initialize
            function init() {
                // Set up character counter
                updateCharCount();
                textInput.addEventListener('input', updateCharCount);
                
                // Create style options
                createStyleOptions();
                
                // Create color options
                createColorOptions();
                
                // Set up event listeners
                setupEventListeners();
                
                // Load saved bubbles
                loadBubbles();
                
                // Generate a sample bubble
                setTimeout(() => {
                    if (bubbles.length === 0) {
                        generateSampleBubble();
                    }
                }, 500);
            }
            
            // Update character count
            function updateCharCount() {
                const length = textInput.value.length;
                charCount.textContent = length;
                
                if (length > 450) {
                    charCount.style.color = '#e91e63';
                } else if (length > 300) {
                    charCount.style.color = '#ff9800';
                } else {
                    charCount.style.color = '#666';
                }
            }
            
            // Create style options
            function createStyleOptions() {
                styleGrid.innerHTML = '';
                
                bubbleStyles.forEach(style => {
                    const styleOption = document.createElement('div');
                    styleOption.className = `style-option ${style.id === selectedStyle ? 'active' : ''}`;
                    styleOption.dataset.style = style.id;
                    
                    styleOption.innerHTML = `
                        <div class="style-icon">
                            <i class="fas ${style.icon}"></i>
                        </div>
                        <div class="style-name">${style.name}</div>
                    `;
                    
                    styleOption.addEventListener('click', function() {
                        // Update selected style
                        selectedStyle = this.dataset.style;
                        
                        // Update active style
                        document.querySelectorAll('.style-option').forEach(opt => {
                            opt.classList.remove('active');
                        });
                        this.classList.add('active');
                        
                        // Update default color for this style
                        const styleData = bubbleStyles.find(s => s.id === selectedStyle);
                        if (styleData) {
                            selectedColor = styleData.color;
                            updateSelectedColor();
                        }
                    });
                    
                    styleGrid.appendChild(styleOption);
                });
            }
            
            // Create color options
            function createColorOptions() {
                colorPicker.innerHTML = '';
                
                colorOptions.forEach(color => {
                    const colorOption = document.createElement('div');
                    colorOption.className = `color-option ${color === selectedColor ? 'active' : ''}`;
                    colorOption.style.backgroundColor = color;
                    colorOption.dataset.color = color;
                    
                    colorOption.addEventListener('click', function() {
                        selectedColor = this.dataset.color;
                        updateSelectedColor();
                    });
                    
                    colorPicker.appendChild(colorOption);
                });
            }
            
            // Update selected color
            function updateSelectedColor() {
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('active');
                    if (opt.dataset.color === selectedColor) {
                        opt.classList.add('active');
                    }
                });
            }
            
            // Set up event listeners
            function setupEventListeners() {
                // Size slider
                sizeSlider.addEventListener('input', function() {
                    sizeValue.textContent = `${this.value}px`;
                });
                
                // Font size slider
                fontSizeSlider.addEventListener('input', function() {
                    fontSizeValue.textContent = `${this.value}px`;
                });
                
                // Tail position slider
                tailPositionSlider.addEventListener('input', function() {
                    const position = tailPositions[this.value - 1];
                    tailPositionValue.textContent = position.name;
                });
                
                // Generate button
                generateBtn.addEventListener('click', generateBubble);
                
                // Clear button
                clearBtn.addEventListener('click', clearAllBubbles);
                
                // Export button
                exportBtn.addEventListener('click', exportAsPNG);
                
                // Allow Enter key to generate bubble (with Ctrl)
                textInput.addEventListener('keydown', function(e) {
                    if (e.ctrlKey && e.key === 'Enter') {
                        generateBubble();
                    }
                });
                
                // Drag and drop for bubbles
                bubbleContainer.addEventListener('mousedown', startDrag);
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
                
                // Touch events for mobile
                bubbleContainer.addEventListener('touchstart', startDragTouch);
                document.addEventListener('touchmove', dragTouch);
                document.addEventListener('touchend', stopDrag);
            }
            
            // Generate a bubble
            function generateBubble() {
                const text = textInput.value.trim();
                
                if (text === '') {
                    alert('Please enter some text first!');
                    textInput.focus();
                    return;
                }
                
                // Create bubble object
                const bubble = {
                    id: currentBubbleId++,
                    text: text,
                    style: selectedStyle,
                    color: selectedColor,
                    size: parseInt(sizeSlider.value),
                    fontSize: parseInt(fontSizeSlider.value),
                    tailPosition: parseInt(tailPositionSlider.value),
                    position: {
                        x: Math.random() * 70 + 15, // 15-85%
                        y: Math.random() * 70 + 15  // 15-85%
                    },
                    rotation: Math.random() * 10 - 5 // -5 to 5 degrees
                };
                
                // Add to array
                bubbles.push(bubble);
                
                // Save to localStorage
                saveBubbles();
                
                // Create bubble element
                createBubbleElement(bubble);
                
                // Update UI
                updateBubblesList();
                
                // Hide empty state
                emptyState.style.display = 'none';
            }
            
            // Generate sample bubble
            function generateSampleBubble() {
                textInput.value = "Hello! I'm a speech bubble! 😊 Drag me around!";
                updateCharCount();
                
                // Set random style
                const randomStyle = bubbleStyles[Math.floor(Math.random() * bubbleStyles.length)];
                selectedStyle = randomStyle.id;
                selectedColor = randomStyle.color;
                
                // Update UI
                document.querySelectorAll('.style-option').forEach(opt => {
                    opt.classList.remove('active');
                    if (opt.dataset.style === selectedStyle) {
                        opt.classList.add('active');
                    }
                });
                updateSelectedColor();
                
                // Generate bubble
                generateBubble();
            }
            
            // Create bubble element
            function createBubbleElement(bubble) {
                const bubbleEl = document.createElement('div');
                bubbleEl.className = `speech-bubble ${bubble.style}`;
                bubbleEl.id = `bubble-${bubble.id}`;
                bubbleEl.dataset.id = bubble.id;
                
                // Set position and rotation
                bubbleEl.style.left = `${bubble.position.x}%`;
                bubbleEl.style.top = `${bubble.position.y}%`;
                bubbleEl.style.transform = `translate(-50%, -50%) rotate(${bubble.rotation}deg)`;
                
                // Set size
                bubbleEl.style.width = `${bubble.size}px`;
                
                // Set background color (override style color if custom color is selected)
                if (bubble.color !== bubbleStyles.find(s => s.id === bubble.style).color) {
                    bubbleEl.style.backgroundColor = bubble.color;
                    
                    // Also update tail color
                    bubbleEl.style.setProperty('--tail-color', bubble.color);
                }
                
                // Get tail position
                const tailPosition = tailPositions.find(t => t.id === bubble.tailPosition);
                
                // Create tail if not a thought bubble
                if (bubble.style !== 'thought') {
                    const tailEl = document.createElement('div');
                    tailEl.className = `tail ${tailPosition.class}`;
                    bubbleEl.appendChild(tailEl);
                }
                
                // Create text content
                const textEl = document.createElement('div');
                textEl.className = 'bubble-text';
                textEl.textContent = bubble.text;
                textEl.style.fontSize = `${bubble.fontSize}px`;
                
                // Add text to bubble
                bubbleEl.appendChild(textEl);
                
                // Add to container
                bubbleContainer.appendChild(bubbleEl);
                
                // Make draggable
                makeDraggable(bubbleEl, bubble.id);
                
                // Add double-click to edit
                bubbleEl.addEventListener('dblclick', function() {
                    editBubble(bubble.id);
                });
            }
            
            // Make bubble draggable
            function makeDraggable(element, bubbleId) {
                element.addEventListener('mousedown', function(e) {
                    if (e.target === element || e.target.closest('.bubble-text')) {
                        startDragBubble(e, bubbleId, element);
                    }
                });
                
                element.addEventListener('touchstart', function(e) {
                    if (e.target === element || e.target.closest('.bubble-text')) {
                        startDragBubbleTouch(e, bubbleId, element);
                    }
                });
            }
            
            // Start dragging bubble
            function startDragBubble(e, bubbleId, element) {
                isDragging = true;
                dragBubble = element;
                
                const rect = element.getBoundingClientRect();
                dragOffsetX = e.clientX - rect.left;
                dragOffsetY = e.clientY - rect.top;
                
                // Bring to front
                element.style.zIndex = '100';
                
                e.preventDefault();
            }
            
            // Start dragging bubble (touch)
            function startDragBubbleTouch(e, bubbleId, element) {
                if (e.touches.length !== 1) return;
                
                isDragging = true;
                dragBubble = element;
                
                const rect = element.getBoundingClientRect();
                dragOffsetX = e.touches[0].clientX - rect.left;
                dragOffsetY = e.touches[0].clientY - rect.top;
                
                // Bring to front
                element.style.zIndex = '100';
                
                e.preventDefault();
            }
            
            // General drag start (for container)
            function startDrag(e) {
                // Check if we clicked on a bubble
                const bubble = e.target.closest('.speech-bubble');
                if (bubble) {
                    const bubbleId = parseInt(bubble.dataset.id);
                    startDragBubble(e, bubbleId, bubble);
                }
            }
            
            function startDragTouch(e) {
                if (e.touches.length !== 1) return;
                
                // Check if we touched a bubble
                const bubble = e.target.closest('.speech-bubble');
                if (bubble) {
                    const bubbleId = parseInt(bubble.dataset.id);
                    startDragBubbleTouch(e, bubbleId, bubble);
                }
            }
            
            // Drag
            function drag(e) {
                if (!isDragging || !dragBubble) return;
                
                const containerRect = bubbleContainer.getBoundingClientRect();
                let clientX, clientY;
                
                if (e.type === 'touchmove') {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }
                
                // Calculate new position in percentages
                const newX = ((clientX - containerRect.left - dragOffsetX) / containerRect.width) * 100;
                const newY = ((clientY - containerRect.top - dragOffsetY) / containerRect.height) * 100;
                
                // Constrain within container
                const constrainedX = Math.max(5, Math.min(newX, 95));
                const constrainedY = Math.max(5, Math.min(newY, 95));
                
                dragBubble.style.left = `${constrainedX}%`;
                dragBubble.style.top = `${constrainedY}%`;
                
                // Update bubble position in data
                const bubbleId = parseInt(dragBubble.dataset.id);
                const bubble = bubbles.find(b => b.id === bubbleId);
                if (bubble) {
                    bubble.position.x = constrainedX;
                    bubble.position.y = constrainedY;
                    saveBubbles();
                }
            }
            
            function dragTouch(e) {
                drag(e);
            }
            
            // Stop dragging
            function stopDrag() {
                if (isDragging && dragBubble) {
                    dragBubble.style.zIndex = '1';
                }
                
                isDragging = false;
                dragBubble = null;
            }
            
            // Edit bubble
            function editBubble(bubbleId) {
                const bubble = bubbles.find(b => b.id === bubbleId);
                if (!bubble) return;
                
                // Fill input with bubble text
                textInput.value = bubble.text;
                updateCharCount();
                
                // Set style
                selectedStyle = bubble.style;
                document.querySelectorAll('.style-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.style === selectedStyle);
                });
                
                // Set color
                selectedColor = bubble.color;
                updateSelectedColor();
                
                // Set size
                sizeSlider.value = bubble.size;
                sizeValue.textContent = `${bubble.size}px`;
                
                // Set font size
                fontSizeSlider.value = bubble.fontSize;
                fontSizeValue.textContent = `${bubble.fontSize}px`;
                
                // Set tail position
                tailPositionSlider.value = bubble.tailPosition;
                const tailPosition = tailPositions.find(t => t.id === bubble.tailPosition);
                tailPositionValue.textContent = tailPosition.name;
                
                // Delete the bubble (will be re-added when user clicks "Generate Bubble")
                deleteBubble(bubbleId);
                
                // Focus on input
                textInput.focus();
            }
            
            // Delete bubble
            function deleteBubble(bubbleId) {
                // Remove from array
                bubbles = bubbles.filter(b => b.id !== bubbleId);
                
                // Remove from DOM
                const bubbleEl = document.getElementById(`bubble-${bubbleId}`);
                if (bubbleEl) bubbleEl.remove();
                
                // Save to localStorage
                saveBubbles();
                
                // Update bubbles list
                updateBubblesList();
                
                // Show empty state if no bubbles left
                if (bubbles.length === 0) {
                    emptyState.style.display = 'block';
                }
            }
            
            // Clear all bubbles
            function clearAllBubbles() {
                if (bubbles.length === 0) return;
                
                if (confirm('Are you sure you want to clear all speech bubbles?')) {
                    bubbles = [];
                    bubbleContainer.innerHTML = '';
                    emptyState.style.display = 'block';
                    saveBubbles();
                    updateBubblesList();
                }
            }
            
            // Update bubbles list
            function updateBubblesList() {
                // Clear list
                bubblesList.innerHTML = '<h3 class="bubbles-list-title"><i class="fas fa-list"></i> Your Bubbles</h3>';
                
                // Add each bubble
                bubbles.forEach(bubble => {
                    const bubbleItem = document.createElement('div');
                    bubbleItem.className = 'bubble-item';
                    bubbleItem.dataset.id = bubble.id;
                    
                    // Get style color
                    const styleData = bubbleStyles.find(s => s.id === bubble.style);
                    
                    bubbleItem.innerHTML = `
                        <div class="bubble-preview">
                            <div class="bubble-preview-color" style="background-color: ${bubble.color};"></div>
                            <div class="bubble-preview-text">${bubble.text.substring(0, 30)}${bubble.text.length > 30 ? '...' : ''}</div>
                        </div>
                        <div class="bubble-item-controls">
                            <button class="bubble-item-btn edit-bubble-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="bubble-item-btn delete-bubble-btn" title="Delete">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    
                    // Add event listeners
                    const editBtn = bubbleItem.querySelector('.edit-bubble-btn');
                    const deleteBtn = bubbleItem.querySelector('.delete-bubble-btn');
                    
                    editBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        editBubble(bubble.id);
                    });
                    
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        deleteBubble(bubble.id);
                    });
                    
                    // Click on item to focus the bubble
                    bubbleItem.addEventListener('click', function() {
                        const bubbleEl = document.getElementById(`bubble-${bubble.id}`);
                        if (bubbleEl) {
                            // Highlight the bubble
                            bubbleEl.style.boxShadow = '0 0 0 3px #2575fc';
                            setTimeout(() => {
                                bubbleEl.style.boxShadow = '';
                            }, 2000);
                        }
                    });
                    
                    bubblesList.appendChild(bubbleItem);
                });
            }
            
            // Export as PNG
            function exportAsPNG() {
                if (bubbles.length === 0) {
                    alert('No bubbles to export! Create some bubbles first.');
                    return;
                }
                
                // Create a temporary canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size
                canvas.width = bubbleContainer.offsetWidth;
                canvas.height = bubbleContainer.offsetHeight;
                
                // Draw background
                ctx.fillStyle = '#f8f9fa';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw each bubble
                bubbles.forEach(bubble => {
                    // This is a simplified version - in a real app, you would use html2canvas library
                    // For now, we'll create a basic representation
                    
                    const x = (bubble.position.x / 100) * canvas.width;
                    const y = (bubble.position.y / 100) * canvas.height;
                    
                    // Draw bubble body
                    ctx.fillStyle = bubble.color;
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 3;
                    
                    // Different shapes based on style
                    if (bubble.style === 'thought') {
                        // Thought bubble (circles)
                        ctx.beginPath();
                        ctx.arc(x, y, bubble.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        
                        // Smaller circles for thought bubble
                        ctx.beginPath();
                        ctx.arc(x + bubble.size / 3, y + bubble.size / 3, bubble.size / 6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.arc(x + bubble.size / 2, y + bubble.size / 2, bubble.size / 8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                    } else {
                        // Regular speech bubble
                        ctx.beginPath();
                        ctx.roundRect(x - bubble.size / 2, y - bubble.size / 4, bubble.size, bubble.size / 2, 20);
                        ctx.fill();
                        ctx.stroke();
                        
                        // Draw tail
                        const tailPosition = tailPositions.find(t => t.id === bubble.tailPosition);
                        ctx.beginPath();
                        
                        if (tailPosition.class.includes('bottom')) {
                            ctx.moveTo(x - 20, y + bubble.size / 4);
                            ctx.lineTo(x, y + bubble.size / 4 + 30);
                            ctx.lineTo(x + 20, y + bubble.size / 4);
                        } else if (tailPosition.class.includes('top')) {
                            ctx.moveTo(x - 20, y - bubble.size / 4);
                            ctx.lineTo(x, y - bubble.size / 4 - 30);
                            ctx.lineTo(x + 20, y - bubble.size / 4);
                        }
                        
                        ctx.fill();
                        ctx.stroke();
                    }
                    
                    // Draw text
                    ctx.fillStyle = '#333';
                    ctx.font = `${bubble.fontSize}px 'Comic Neue', cursive`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Wrap text
                    const words = bubble.text.split(' ');
                    let line = '';
                    let lineHeight = bubble.fontSize * 1.2;
                    let lines = [];
                    
                    for (let i = 0; i < words.length; i++) {
                        const testLine = line + words[i] + ' ';
                        const metrics = ctx.measureText(testLine);
                        const testWidth = metrics.width;
                        
                        if (testWidth > bubble.size * 0.8 && i > 0) {
                            lines.push(line);
                            line = words[i] + ' ';
                        } else {
                            line = testLine;
                        }
                    }
                    lines.push(line);
                    
                    // Draw lines
                    const startY = y - ((lines.length - 1) * lineHeight) / 2;
                    
                    lines.forEach((line, index) => {
                        ctx.fillText(line.trim(), x, startY + (index * lineHeight));
                    });
                });
                
                // Create download link
                const link = document.createElement('a');
                link.download = `speech-bubbles-${new Date().getTime()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                // Show feedback
                const originalText = exportBtn.innerHTML;
                exportBtn.innerHTML = '<i class="fas fa-check"></i> Exported!';
                setTimeout(() => {
                    exportBtn.innerHTML = originalText;
                }, 2000);
            }
            
            // Save bubbles to localStorage
            function saveBubbles() {
                const data = {
                    bubbles: bubbles,
                    currentBubbleId: currentBubbleId
                };
                localStorage.setItem('speechBubblesData', JSON.stringify(data));
            }
            
            // Load bubbles from localStorage
            function loadBubbles() {
                const saved = localStorage.getItem('speechBubblesData');
                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        bubbles = data.bubbles || [];
                        currentBubbleId = data.currentBubbleId || 1;
                        
                        // Create bubble elements
                        bubbles.forEach(bubble => createBubbleElement(bubble));
                        
                        // Update bubbles list
                        updateBubblesList();
                        
                        // Hide empty state if we have bubbles
                        if (bubbles.length > 0) {
                            emptyState.style.display = 'none';
                        }
                    } catch (e) {
                        console.error('Error loading saved data:', e);
                    }
                }
            }
            
            // Initialize the app
            init();
        });