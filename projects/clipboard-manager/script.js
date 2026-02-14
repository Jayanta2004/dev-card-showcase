        // DOM Elements
        const textInput = document.getElementById('textInput');
        const copyBtn = document.getElementById('copyBtn');
        const saveBtn = document.getElementById('saveBtn');
        const clearBtn = document.getElementById('clearBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const savedItemsContainer = document.getElementById('savedItemsContainer');
        const emptyState = document.getElementById('emptyState');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        const savedCount = document.getElementById('savedCount');
        const totalCopies = document.getElementById('totalCopies');
        const charCount = document.getElementById('charCount');
        
        // Initialize saved items from localStorage or empty array
        let savedItems = JSON.parse(localStorage.getItem('clipboardItems')) || [];
        let copyCount = parseInt(localStorage.getItem('copyCount')) || 0;
        
        // Initialize stats
        updateStats();
        
        // Display saved items on page load
        renderSavedItems();
        
        // Event Listeners
        copyBtn.addEventListener('click', copyToClipboard);
        saveBtn.addEventListener('click', saveText);
        clearBtn.addEventListener('click', clearInput);
        clearAllBtn.addEventListener('click', clearAllSavedItems);
        textInput.addEventListener('input', updateButtonsState);
        
        // Update buttons state based on input
        function updateButtonsState() {
            const hasText = textInput.value.trim().length > 0;
            copyBtn.disabled = !hasText;
            saveBtn.disabled = !hasText;
        }
        
        // Copy text to clipboard
        async function copyToClipboard() {
            const text = textInput.value.trim();
            
            if (!text) {
                showNotification('Please enter some text to copy', true);
                return;
            }
            
            try {
                await navigator.clipboard.writeText(text);
                copyCount++;
                localStorage.setItem('copyCount', copyCount.toString());
                updateStats();
                showNotification('Text copied to clipboard!');
            } catch (err) {
                // Fallback for older browsers
                textInput.select();
                document.execCommand('copy');
                copyCount++;
                localStorage.setItem('copyCount', copyCount.toString());
                updateStats();
                showNotification('Text copied to clipboard!');
            }
        }
        
        // Save text to localStorage
        function saveText() {
            const text = textInput.value.trim();
            
            if (!text) {
                showNotification('Please enter some text to save', true);
                return;
            }
            
            // Create a new saved item
            const newItem = {
                id: Date.now(),
                text: text,
                date: new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                copyCount: 0
            };
            
            // Add to saved items array
            savedItems.unshift(newItem);
            
            // Update localStorage
            localStorage.setItem('clipboardItems', JSON.stringify(savedItems));
            
            // Update UI
            renderSavedItems();
            updateStats();
            
            // Show notification
            showNotification('Text saved successfully!');
            
            // Clear input
            textInput.value = '';
            updateButtonsState();
        }
        
        // Clear the input field
        function clearInput() {
            textInput.value = '';
            updateButtonsState();
        }
        
        // Render saved items to the UI
        function renderSavedItems() {
            // Clear the container
            savedItemsContainer.innerHTML = '';
            
            if (savedItems.length === 0) {
                // Show empty state
                savedItemsContainer.appendChild(emptyState);
                emptyState.style.display = 'block';
                clearAllBtn.disabled = true;
            } else {
                // Hide empty state
                emptyState.style.display = 'none';
                clearAllBtn.disabled = false;
                
                // Render each saved item
                savedItems.forEach(item => {
                    const savedItemEl = document.createElement('div');
                    savedItemEl.className = 'saved-item';
                    
                    // Limit displayed text length
                    const displayText = item.text.length > 200 
                        ? item.text.substring(0, 200) + '...' 
                        : item.text;
                    
                    savedItemEl.innerHTML = `
                        <div class="saved-item-content">${escapeHtml(displayText)}</div>
                        <div class="saved-item-meta">
                            <span>${item.date}</span>
                            <span>${item.text.length} chars</span>
                        </div>
                        <div class="item-actions">
                            <button class="item-action-btn copy-item-btn" title="Copy">
                                <i class="far fa-copy"></i>
                            </button>
                            <button class="item-action-btn delete-item-btn" title="Delete">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    
                    // Add event listeners for item actions
                    const copyBtn = savedItemEl.querySelector('.copy-item-btn');
                    const deleteBtn = savedItemEl.querySelector('.delete-item-btn');
                    
                    copyBtn.addEventListener('click', () => copySavedItem(item.id));
                    deleteBtn.addEventListener('click', () => deleteSavedItem(item.id));
                    
                    // Add click event to the whole item to copy
                    savedItemEl.addEventListener('click', (e) => {
                        // Don't trigger if clicking on action buttons
                        if (!e.target.closest('.item-actions')) {
                            copySavedItem(item.id);
                        }
                    });
                    
                    savedItemsContainer.appendChild(savedItemEl);
                });
            }
        }
        
        // Copy a saved item to clipboard
        async function copySavedItem(id) {
            const item = savedItems.find(item => item.id === id);
            
            if (!item) return;
            
            try {
                await navigator.clipboard.writeText(item.text);
                
                // Update copy count for this item
                item.copyCount = (item.copyCount || 0) + 1;
                copyCount++;
                
                // Update localStorage
                localStorage.setItem('clipboardItems', JSON.stringify(savedItems));
                localStorage.setItem('copyCount', copyCount.toString());
                
                // Update stats
                updateStats();
                
                // Show notification
                showNotification('Text copied to clipboard!');
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = item.text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Update copy count for this item
                item.copyCount = (item.copyCount || 0) + 1;
                copyCount++;
                
                // Update localStorage
                localStorage.setItem('clipboardItems', JSON.stringify(savedItems));
                localStorage.setItem('copyCount', copyCount.toString());
                
                // Update stats
                updateStats();
                
                // Show notification
                showNotification('Text copied to clipboard!');
            }
        }
        
        // Delete a saved item
        function deleteSavedItem(id) {
            // Filter out the item to delete
            savedItems = savedItems.filter(item => item.id !== id);
            
            // Update localStorage
            localStorage.setItem('clipboardItems', JSON.stringify(savedItems));
            
            // Update UI
            renderSavedItems();
            updateStats();
            
            // Show notification
            showNotification('Item deleted successfully');
        }
        
        // Clear all saved items
        function clearAllSavedItems() {
            if (savedItems.length === 0) return;
            
            if (confirm('Are you sure you want to delete all saved items?')) {
                savedItems = [];
                localStorage.removeItem('clipboardItems');
                renderSavedItems();
                updateStats();
                showNotification('All items cleared successfully');
            }
        }
        
        // Show notification
        function showNotification(message, isError = false) {
            notificationText.textContent = message;
            
            if (isError) {
                notification.classList.add('error');
                notification.querySelector('i').className = 'fas fa-exclamation-circle';
            } else {
                notification.classList.remove('error');
                notification.querySelector('i').className = 'fas fa-check-circle';
            }
            
            notification.classList.add('show');
            
            // Hide after 3 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Update statistics
        function updateStats() {
            // Update saved items count
            savedCount.textContent = savedItems.length;
            
            // Update total copies count
            totalCopies.textContent = copyCount;
            
            // Update character count
            const totalChars = savedItems.reduce((sum, item) => sum + item.text.length, 0);
            charCount.textContent = totalChars.toLocaleString();
        }
        
        // Helper function to escape HTML (prevent XSS)
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Initialize buttons state
        updateButtonsState();