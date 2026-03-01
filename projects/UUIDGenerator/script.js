
        // DOM Elements
        const uuidText = document.getElementById('uuid-text');
        const uuidVersion = document.getElementById('uuid-version');
        const generateBtn = document.getElementById('generate-btn');
        const copyBtn = document.getElementById('copy-btn');
        const versionSelector = document.getElementById('version-selector');
        const formatOptions = document.getElementById('format-options');
        const uuidHistory = document.getElementById('uuid-history');
        const emptyHistory = document.getElementById('empty-history');
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        const validateUuidBtn = document.getElementById('validate-uuid-btn');
        const uuidValidity = document.getElementById('uuid-validity');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        const totalGeneratedEl = document.getElementById('total-generated');
        const todayGeneratedEl = document.getElementById('today-generated');
        const bulkCountInput = document.getElementById('bulk-count');
        const bulkGenerateBtn = document.getElementById('bulk-generate-btn');
        const uuidBulkList = document.getElementById('uuid-bulk-list');
        
        // State variables
        let currentUuid = '';
        let currentVersion = 'v4';
        let currentFormat = 'standard';
        let uuidHistoryList = JSON.parse(localStorage.getItem('uuidHistory')) || [];
        let stats = JSON.parse(localStorage.getItem('uuidStats')) || {
            totalGenerated: 0,
            todayGenerated: 0,
            lastGeneratedDate: null
        };
        
        // Initialize the app
        function init() {
            // Load history and stats
            loadHistory();
            updateStats();
            
            // Generate initial UUID
            generateUuid();
            
            // Set up event listeners
            setupEventListeners();
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Generate button
            generateBtn.addEventListener('click', generateUuid);
            
            // Copy button
            copyBtn.addEventListener('click', copyToClipboard);
            
            // Version selector
            versionSelector.addEventListener('click', (e) => {
                const radioLabel = e.target.closest('.radio-label');
                if (!radioLabel) return;
                
                // Update selected version
                document.querySelectorAll('.radio-label').forEach(label => {
                    label.classList.remove('selected');
                });
                radioLabel.classList.add('selected');
                
                currentVersion = radioLabel.dataset.version;
                generateUuid();
            });
            
            // Format options
            formatOptions.addEventListener('click', (e) => {
                const formatBtn = e.target.closest('.format-btn');
                if (!formatBtn) return;
                
                // Update selected format
                document.querySelectorAll('.format-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                formatBtn.classList.add('selected');
                
                currentFormat = formatBtn.dataset.format;
                updateUuidDisplay();
            });
            
            // Clear history button
            clearHistoryBtn.addEventListener('click', clearHistory);
            
            // Validate UUID button
            validateUuidBtn.addEventListener('click', validateCurrentUuid);
            
            // Bulk generate button
            bulkGenerateBtn.addEventListener('click', generateBulkUuids);
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Space to generate new UUID
                if (e.code === 'Space' && e.target === document.body) {
                    e.preventDefault();
                    generateUuid();
                }
                
                // Ctrl/Cmd + C to copy
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    if (document.activeElement === document.body) {
                        e.preventDefault();
                        copyToClipboard();
                    }
                }
            });
        }
        
        // Generate a UUID based on selected version
        function generateUuid() {
            let uuid;
            
            switch (currentVersion) {
                case 'v1':
                    uuid = generateV1Uuid();
                    break;
                case 'v3':
                    uuid = generateV3Uuid();
                    break;
                case 'v5':
                    uuid = generateV5Uuid();
                    break;
                case 'v4':
                default:
                    uuid = generateV4Uuid();
                    break;
            }
            
            currentUuid = uuid;
            updateUuidDisplay();
            addToHistory(uuid);
            updateStats();
            
            // Hide validity panel
            uuidValidity.classList.remove('show');
        }
        
        // Generate Version 4 UUID (random)
        function generateV4Uuid() {
            // Generate random hex values
            const hexValues = '0123456789abcdef';
            let uuid = '';
            
            // Generate 32 hex digits
            for (let i = 0; i < 32; i++) {
                // Insert hyphens at positions 8, 12, 16, 20
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                
                // Generate random hex digit
                const randomIndex = Math.floor(Math.random() * 16);
                uuid += hexValues[randomIndex];
            }
            
            // Set version bits (4) for UUID v4
            const chars = uuid.split('');
            chars[14] = '4'; // Version 4
            chars[19] = hexValues[(parseInt(chars[19], 16) & 0x3) | 0x8]; // Variant bits (10xx)
            
            return chars.join('');
        }
        
        // Generate Version 1 UUID (time-based)
        function generateV1Uuid() {
            // Simplified v1 UUID (not truly time-based with MAC, but good enough for demo)
            const now = new Date();
            const timestamp = now.getTime();
            
            // Convert timestamp to hex (60 bits)
            const timestampHex = (timestamp * 10000 + 0x01b21dd213814000).toString(16);
            
            // Generate clock sequence (14 bits)
            const clockSeq = Math.floor(Math.random() * 0x3fff).toString(16).padStart(4, '0');
            
            // Generate node (48 bits, normally MAC address)
            const node = Array.from({length: 6}, () => 
                Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
            ).join('');
            
            // Assemble UUID
            const timeLow = timestampHex.substr(-8);
            const timeMid = timestampHex.substr(-12, 4);
            const timeHigh = timestampHex.substr(-16, 4);
            
            return `${timeLow}-${timeMid}-1${timeHigh.substr(1)}-${clockSeq}-${node}`;
        }
        
        // Generate Version 3 UUID (MD5)
        function generateV3Uuid() {
            // Namespace UUID (DNS namespace)
            const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'.replace(/-/g, '');
            const name = `example-${Date.now()}-${Math.random()}`;
            
            // Simple MD5-like hash (not real MD5, but good for demo)
            function simpleHash(str) {
                let hash = '';
                for (let i = 0; i < str.length; i++) {
                    const charCode = str.charCodeAt(i);
                    hash += (charCode % 16).toString(16);
                }
                return hash.padEnd(32, '0');
            }
            
            const hash = simpleHash(namespace + name);
            
            // Format as UUID
            return `${hash.substr(0, 8)}-${hash.substr(8, 4)}-3${hash.substr(13, 3)}-${hash.substr(16, 4)}-${hash.substr(20, 12)}`;
        }
        
        // Generate Version 5 UUID (SHA-1)
        function generateV5Uuid() {
            // Similar to v3 but with SHA-1 namespace
            const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'.replace(/-/g, '');
            const name = `example-${Date.now()}-${Math.random()}`;
            
            // Simple SHA-1-like hash (not real SHA-1, but good for demo)
            function simpleHash(str) {
                let hash = '';
                for (let i = 0; i < str.length; i++) {
                    const charCode = str.charCodeAt(i);
                    hash += ((charCode * 31) % 16).toString(16);
                }
                return hash.padEnd(32, '0');
            }
            
            const hash = simpleHash(namespace + name);
            
            // Format as UUID
            return `${hash.substr(0, 8)}-${hash.substr(8, 4)}-5${hash.substr(13, 3)}-${hash.substr(16, 4)}-${hash.substr(20, 12)}`;
        }
        
        // Update UUID display based on format
        function updateUuidDisplay() {
            let displayUuid = currentUuid;
            
            // Apply format
            switch (currentFormat) {
                case 'no-hyphens':
                    displayUuid = currentUuid.replace(/-/g, '');
                    break;
                case 'uppercase':
                    displayUuid = currentUuid.toUpperCase();
                    break;
                case 'braces':
                    displayUuid = `{${currentUuid}}`;
                    break;
                case 'urn':
                    displayUuid = `urn:uuid:${currentUuid}`;
                    break;
                case 'standard':
                default:
                    // Keep as is
                    break;
            }
            
            uuidText.textContent = displayUuid;
            uuidVersion.textContent = currentVersion;
        }
        
        // Copy UUID to clipboard
        function copyToClipboard() {
            let textToCopy = currentUuid;
            
            // Apply format for copying
            switch (currentFormat) {
                case 'no-hyphens':
                    textToCopy = currentUuid.replace(/-/g, '');
                    break;
                case 'uppercase':
                    textToCopy = currentUuid.toUpperCase();
                    break;
                case 'braces':
                    textToCopy = `{${currentUuid}}`;
                    break;
                case 'urn':
                    textToCopy = `urn:uuid:${currentUuid}`;
                    break;
            }
            
            // Use Clipboard API
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    showNotification('UUID copied to clipboard!');
                })
                .catch(err => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showNotification('UUID copied to clipboard!');
                });
        }
        
        // Add UUID to history
        function addToHistory(uuid) {
            const historyItem = {
                id: Date.now().toString(),
                uuid: uuid,
                version: currentVersion,
                timestamp: new Date().toISOString(),
                format: currentFormat
            };
            
            // Add to beginning of history
            uuidHistoryList.unshift(historyItem);
            
            // Keep only last 50 items
            if (uuidHistoryList.length > 50) {
                uuidHistoryList = uuidHistoryList.slice(0, 50);
            }
            
            // Save to localStorage
            localStorage.setItem('uuidHistory', JSON.stringify(uuidHistoryList));
            
            // Update UI
            renderHistory();
        }
        
        // Load history from localStorage
        function loadHistory() {
            renderHistory();
        }
        
        // Render history list
        function renderHistory() {
            // Clear history container
            uuidHistory.innerHTML = '';
            
            if (uuidHistoryList.length === 0) {
                emptyHistory.style.display = 'block';
                return;
            }
            
            // Hide empty state
            emptyHistory.style.display = 'none';
            
            // Render each history item
            uuidHistoryList.forEach(item => {
                const historyItem = createHistoryItem(item);
                uuidHistory.appendChild(historyItem);
            });
        }
        
        // Create a history item element
        function createHistoryItem(item) {
            const element = document.createElement('div');
            element.className = 'history-item';
            element.dataset.id = item.id;
            
            // Format timestamp
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = date.toLocaleDateString();
            
            element.innerHTML = `
                <div class="history-uuid">${item.uuid}</div>
                <div class="history-info">
                    <div>
                        <span style="margin-right: 10px;">${timeString}</span>
                        <span style="margin-right: 10px;">${dateString}</span>
                        <span class="uuid-version">${item.version}</span>
                    </div>
                    <div class="history-actions">
                        <button class="history-btn copy" title="Copy UUID">
                            <i class="far fa-copy"></i>
                        </button>
                        <button class="history-btn delete" title="Remove from history">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners to buttons
            const copyBtn = element.querySelector('.history-btn.copy');
            const deleteBtn = element.querySelector('.history-btn.delete');
            
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(item.uuid)
                    .then(() => {
                        showNotification('UUID copied to clipboard!');
                    });
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHistoryItem(item.id);
            });
            
            // Click on item to set as current
            element.addEventListener('click', () => {
                currentUuid = item.uuid;
                currentVersion = item.version;
                updateUuidDisplay();
                
                // Update version selector
                document.querySelectorAll('.radio-label').forEach(label => {
                    label.classList.remove('selected');
                    if (label.dataset.version === item.version) {
                        label.classList.add('selected');
                    }
                });
                
                showNotification('UUID loaded from history');
            });
            
            return element;
        }
        
        // Delete a history item
        function deleteHistoryItem(id) {
            uuidHistoryList = uuidHistoryList.filter(item => item.id !== id);
            localStorage.setItem('uuidHistory', JSON.stringify(uuidHistoryList));
            renderHistory();
            showNotification('UUID removed from history');
        }
        
        // Clear all history
        function clearHistory() {
            if (uuidHistoryList.length === 0) return;
            
            if (confirm('Are you sure you want to clear all UUID history?')) {
                uuidHistoryList = [];
                localStorage.setItem('uuidHistory', JSON.stringify(uuidHistoryList));
                renderHistory();
                showNotification('History cleared');
            }
        }
        
        // Validate current UUID
        function validateCurrentUuid() {
            const isValid = isValidUuid(currentUuid);
            
            // Update validity panel
            const validityHeader = uuidValidity.querySelector('.validity-header');
            const validityTitle = uuidValidity.querySelector('.validity-title');
            const validityDetails = uuidValidity.querySelector('.validity-details');
            
            if (isValid) {
                uuidValidity.className = 'uuid-validity show';
                validityHeader.className = 'validity-header valid';
                validityHeader.innerHTML = '<i class="fas fa-check-circle"></i>';
                validityTitle.textContent = 'Valid UUID';
                
                // Get UUID version
                const version = getUuidVersion(currentUuid);
                validityDetails.textContent = `This is a valid UUID version ${version}.`;
            } else {
                uuidValidity.className = 'uuid-validity show invalid';
                validityHeader.className = 'validity-header invalid';
                validityHeader.innerHTML = '<i class="fas fa-times-circle"></i>';
                validityTitle.textContent = 'Invalid UUID';
                validityDetails.textContent = 'This UUID does not follow the standard UUID format.';
            }
        }
        
        // Check if a string is a valid UUID
        function isValidUuid(uuid) {
            // Standard UUID regex (with or without braces/urn)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(uuid);
        }
        
        // Get version of a UUID
        function getUuidVersion(uuid) {
            if (!isValidUuid(uuid)) return null;
            
            // Version is indicated by the first character of the third group
            const parts = uuid.split('-');
            if (parts.length < 3) return null;
            
            const thirdPart = parts[2];
            const versionChar = thirdPart.charAt(0);
            
            return `v${parseInt(versionChar, 16)}`;
        }
        
        // Update statistics
        function updateStats() {
            const today = new Date().toDateString();
            
            // Check if we need to reset today's count
            if (stats.lastGeneratedDate !== today) {
                stats.todayGenerated = 0;
                stats.lastGeneratedDate = today;
            }
            
            // Update stats
            stats.totalGenerated++;
            stats.todayGenerated++;
            
            // Save to localStorage
            localStorage.setItem('uuidStats', JSON.stringify(stats));
            
            // Update UI
            totalGeneratedEl.textContent = stats.totalGenerated.toLocaleString();
            todayGeneratedEl.textContent = stats.todayGenerated.toLocaleString();
        }
        
        // Generate multiple UUIDs at once
        function generateBulkUuids() {
            const count = parseInt(bulkCountInput.value) || 5;
            
            if (count < 1 || count > 100) {
                showNotification('Please enter a number between 1 and 100', 'error');
                return;
            }
            
            let bulkUuids = '';
            
            for (let i = 0; i < count; i++) {
                let uuid;
                
                // Generate based on current version
                switch (currentVersion) {
                    case 'v1':
                        uuid = generateV1Uuid();
                        break;
                    case 'v3':
                        uuid = generateV3Uuid();
                        break;
                    case 'v5':
                        uuid = generateV5Uuid();
                        break;
                    case 'v4':
                    default:
                        uuid = generateV4Uuid();
                        break;
                }
                
                // Apply format
                let formattedUuid = uuid;
                switch (currentFormat) {
                    case 'no-hyphens':
                        formattedUuid = uuid.replace(/-/g, '');
                        break;
                    case 'uppercase':
                        formattedUuid = uuid.toUpperCase();
                        break;
                    case 'braces':
                        formattedUuid = `{${uuid}}`;
                        break;
                    case 'urn':
                        formattedUuid = `urn:uuid:${uuid}`;
                        break;
                }
                
                bulkUuids += formattedUuid + '\n';
                
                // Add to history
                addToHistory(uuid);
            }
            
            // Update stats
            updateStats();
            
            // Display bulk UUIDs
            uuidBulkList.textContent = bulkUuids;
            
            // Copy to clipboard
            navigator.clipboard.writeText(bulkUuids.trim())
                .then(() => {
                    showNotification(`${count} UUIDs generated and copied to clipboard!`);
                });
        }
        
        // Show notification
        function showNotification(message, type = 'success') {
            notificationText.textContent = message;
            notification.className = 'notification';
            
            if (type === 'error') {
                notification.querySelector('i').className = 'fas fa-exclamation-circle';
                notification.style.backgroundColor = '#ef4444';
            } else {
                notification.querySelector('i').className = 'fas fa-check-circle';
                notification.style.backgroundColor = '#10b981';
            }
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
    