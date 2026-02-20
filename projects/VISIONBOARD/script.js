        // DOM elements
        const visionBoard = document.getElementById('visionBoard');
        const emptyMessage = document.getElementById('emptyMessage');
        const addTextBtn = document.getElementById('addTextBtn');
        const addImageBtn = document.getElementById('addImageBtn');
        const textTitle = document.getElementById('textTitle');
        const textContent = document.getElementById('textContent');
        const imageUrl = document.getElementById('imageUrl');
        const clearBoardBtn = document.getElementById('clearBoardBtn');
        const saveBoardBtn = document.getElementById('saveBoardBtn');
        const themeOptions = document.querySelectorAll('.theme-option');
        const presetItems = document.querySelectorAll('.preset-item');

        // Variables to track dragging
        let draggedElement = null;
        let offsetX = 0, offsetY = 0;

        // Initialize with some example items
        document.addEventListener('DOMContentLoaded', function() {
            addBoardItem('text', 'Welcome!', 'This is your vision board. Add images, quotes, and goals that inspire you. Drag items to rearrange.', 50, 30);
            addBoardItem('text', 'My Goals', '• Learn a new skill\n• Travel to 3 new places\n• Read 20 books', 500, 80);
            addBoardItem('image', '', '', 300, 200, 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop');
            hideEmptyMessage();
        });

        // Add text item to board
        addTextBtn.addEventListener('click', function() {
            const title = textTitle.value.trim();
            const content = textContent.value.trim();
            
            if (content) {
                addBoardItem('text', title, content, getRandomPosition(100, 400), getRandomPosition(100, 300));
                textTitle.value = '';
                textContent.value = '';
                hideEmptyMessage();
            } else {
                alert('Please enter some text for your vision board item.');
            }
        });

        // Add image item to board
        addImageBtn.addEventListener('click', function() {
            const url = imageUrl.value.trim();
            
            if (url) {
                addBoardItem('image', '', '', getRandomPosition(100, 400), getRandomPosition(100, 300), url);
                imageUrl.value = '';
                hideEmptyMessage();
            } else {
                alert('Please enter an image URL.');
            }
        });

        // Handle preset items
        presetItems.forEach(item => {
            item.addEventListener('click', function() {
                const type = this.dataset.type;
                const title = this.dataset.title || '';
                const content = this.dataset.content || '';
                const url = this.dataset.url || '';
                
                if (type === 'text') {
                    addBoardItem('text', title, content, getRandomPosition(100, 400), getRandomPosition(100, 300));
                } else if (type === 'image') {
                    addBoardItem('image', '', '', getRandomPosition(100, 400), getRandomPosition(100, 300), url);
                }
                
                hideEmptyMessage();
            });
        });

        // Clear board
        clearBoardBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your vision board?')) {
                const items = visionBoard.querySelectorAll('.board-item');
                items.forEach(item => item.remove());
                showEmptyMessage();
            }
        });

        // Save board as image (simulated)
        saveBoardBtn.addEventListener('click', function() {
            alert('In a real implementation, this would save your vision board as an image. For now, take a screenshot!');
        });

        // Change theme
        themeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.dataset.theme;
                
                // Update active theme
                themeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Apply theme to vision board
                visionBoard.classList.remove('theme-light', 'theme-cream', 'theme-lavender', 'theme-mint');
                visionBoard.classList.add(`theme-${theme}`);
            });
        });

        // Drag and drop functionality for board items
        function makeElementDraggable(element) {
            element.addEventListener('mousedown', startDrag);
            element.addEventListener('touchstart', startDragTouch);
        }

        function startDrag(e) {
            e.preventDefault();
            draggedElement = this;
            
            // Calculate offset
            const rect = this.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            // Set up event listeners for dragging
            document.addEventListener('mousemove', dragElement);
            document.addEventListener('mouseup', stopDrag);
            
            // Bring to front
            bringToFront(this);
        }

        function startDragTouch(e) {
            e.preventDefault();
            draggedElement = this;
            
            // Calculate offset for touch
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            
            // Set up event listeners for dragging
            document.addEventListener('touchmove', dragElementTouch);
            document.addEventListener('touchend', stopDrag);
            
            // Bring to front
            bringToFront(this);
        }

        function dragElement(e) {
            if (!draggedElement) return;
            
            e.preventDefault();
            
            // Calculate new position
            const x = e.clientX - offsetX - visionBoard.getBoundingClientRect().left + visionBoard.scrollLeft;
            const y = e.clientY - offsetY - visionBoard.getBoundingClientRect().top + visionBoard.scrollTop;
            
            // Apply position
            draggedElement.style.left = `${x}px`;
            draggedElement.style.top = `${y}px`;
        }

        function dragElementTouch(e) {
            if (!draggedElement) return;
            
            e.preventDefault();
            
            const touch = e.touches[0];
            
            // Calculate new position
            const x = touch.clientX - offsetX - visionBoard.getBoundingClientRect().left + visionBoard.scrollLeft;
            const y = touch.clientY - offsetY - visionBoard.getBoundingClientRect().top + visionBoard.scrollTop;
            
            // Apply position
            draggedElement.style.left = `${x}px`;
            draggedElement.style.top = `${y}px`;
        }

        function stopDrag() {
            draggedElement = null;
            document.removeEventListener('mousemove', dragElement);
            document.removeEventListener('touchmove', dragElementTouch);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }

        // Bring element to front
        function bringToFront(element) {
            const items = visionBoard.querySelectorAll('.board-item');
            let maxZIndex = 0;
            
            items.forEach(item => {
                const zIndex = parseInt(window.getComputedStyle(item).zIndex) || 0;
                if (zIndex > maxZIndex) maxZIndex = zIndex;
            });
            
            element.style.zIndex = maxZIndex + 1;
        }

        // Add item to the vision board
        function addBoardItem(type, title, content, x, y, imageUrl = '') {
            const itemId = 'item-' + Date.now();
            const item = document.createElement('div');
            item.className = 'board-item';
            item.id = itemId;
            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
            
            // Random size for variety
            const width = type === 'text' ? 250 : 200;
            const height = type === 'text' ? 200 : 180;
            item.style.width = `${width}px`;
            item.style.height = `${height}px`;
            
            // Random rotation for visual interest
            const rotation = Math.random() * 6 - 3; // -3 to +3 degrees
            item.style.transform = `rotate(${rotation}deg)`;
            
            // Set z-index
            item.style.zIndex = 1;
            
            if (type === 'text') {
                item.innerHTML = `
                    <div class="board-item-text">
                        ${title ? `<div class="board-item-title">${title}</div>` : ''}
                        <div>${content.replace(/\n/g, '<br>')}</div>
                    </div>
                    <div class="item-controls">
                        <button class="item-control-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="item-control-btn delete-btn" title="Delete"><i class="fas fa-times"></i></button>
                    </div>
                `;
            } else if (type === 'image') {
                item.innerHTML = `
                    <img src="${imageUrl}" alt="Vision board image">
                    <div class="item-controls">
                        <button class="item-control-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="item-control-btn delete-btn" title="Delete"><i class="fas fa-times"></i></button>
                    </div>
                `;
            }
            
            visionBoard.appendChild(item);
            
            // Make draggable
            makeElementDraggable(item);
            
            // Add event listeners for control buttons
            const deleteBtn = item.querySelector('.delete-btn');
            const editBtn = item.querySelector('.edit-btn');
            
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                item.remove();
                if (visionBoard.querySelectorAll('.board-item').length === 0) {
                    showEmptyMessage();
                }
            });
            
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (type === 'text') {
                    const newTitle = prompt('Edit title:', title);
                    const newContent = prompt('Edit content:', content);
                    
                    if (newContent !== null) {
                        const textElement = item.querySelector('.board-item-text');
                        if (newTitle) {
                            textElement.querySelector('.board-item-title').textContent = newTitle;
                        }
                        textElement.querySelector('div:nth-child(2)').innerHTML = newContent.replace(/\n/g, '<br>');
                    }
                } else if (type === 'image') {
                    const newUrl = prompt('Enter new image URL:', imageUrl);
                    if (newUrl) {
                        item.querySelector('img').src = newUrl;
                    }
                }
            });
            
            return item;
        }

        // Helper functions
        function getRandomPosition(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function hideEmptyMessage() {
            emptyMessage.style.display = 'none';
        }

        function showEmptyMessage() {
            emptyMessage.style.display = 'flex';
        }

        // Allow dropping images onto the board
        visionBoard.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.backgroundColor = 'rgba(200, 200, 200, 0.1)';
        });

        visionBoard.addEventListener('dragleave', function() {
            this.style.backgroundColor = '';
        });

        visionBoard.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.backgroundColor = '';
            
            // Get the image URL from the dragged data
            const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
            
            if (url && url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                addBoardItem('image', '', '', e.offsetX, e.offsetY, url);
                hideEmptyMessage();
            }
        });

        // Handle image URL input via Enter key
        imageUrl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addImageBtn.click();
            }
        });
        
        // Handle text input via Enter key in textarea (new line) and Ctrl+Enter to submit
        textContent.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                addTextBtn.click();
            }
        });