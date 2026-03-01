// Window manager for handling popup windows and position tracking

const WindowManager = {
    windows: [],
    checkInterval: null,
    messageHandlers: {},
    sessionId: null,

    /**
     * Initialize the window manager
     */
    init() {
        this.windows = [];
        this.sessionId = Utils.generateId();
        this.setupMessageListener();
    },

    /**
     * Setup message listener for cross-window communication
     */
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Verify message is from our windows
            if (event.data && event.data.sessionId === this.sessionId) {
                this.handleMessage(event.data);
            }
        });
    },

    /**
     * Handle incoming messages from popup windows
     * @param {Object} data - Message data
     */
    handleMessage(data) {
        const { type, quadrantId, position } = data;

        if (type === 'position-update' && quadrantId !== undefined) {
            const windowData = this.windows.find(w => w.quadrantId === quadrantId);
            if (windowData) {
                windowData.position = position;
                windowData.lastUpdate = Date.now();
            }
        }

        // Call registered handlers
        if (this.messageHandlers[type]) {
            this.messageHandlers[type].forEach(handler => handler(data));
        }
    },

    /**
     * Register a message handler
     * @param {string} type - Message type
     * @param {Function} handler - Handler function
     */
    onMessage(type, handler) {
        if (!this.messageHandlers[type]) {
            this.messageHandlers[type] = [];
        }
        this.messageHandlers[type].push(handler);
    },

    /**
     * Create popup windows for all quadrants
     * @param {Array} quadrants - Array of quadrant data
     * @returns {Promise<Array>} Array of window references
     */
    async createWindows(quadrants) {
        this.closeAllWindows();
        this.windows = [];

        const positions = Utils.calculateWindowPositions(
            quadrants[0].width,
            quadrants[0].height
        );

        // Create windows with slight delay to avoid popup blocker
        for (let i = 0; i < quadrants.length; i++) {
            await this.createWindow(quadrants[i], positions[i], i);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return this.windows;
    },

    /**
     * Create a single popup window
     * @param {Object} quadrant - Quadrant data
     * @param {Object} position - Initial position {x, y}
     * @param {number} index - Window index
     * @returns {Promise<Object>} Window data
     */
    createWindow(quadrant, position, index) {
        return new Promise((resolve, reject) => {
            const features = `left=${position.x},top=${position.y},${CONFIG.WINDOW.features}`;

            const popup = window.open('', `splitview_${quadrant.id}`, features);

            if (!popup || popup.closed) {
                reject(new Error('Popup blocked. Please allow popups for this site.'));
                return;
            }

            // Write content to popup
            this.writeWindowContent(popup, quadrant);

            const windowData = {
                reference: popup,
                quadrantId: quadrant.id,
                quadrantName: quadrant.name,
                position: position,
                expectedPosition: {
                    x: CONFIG.QUADRANTS[index].expectedX,
                    y: CONFIG.QUADRANTS[index].expectedY
                },
                width: quadrant.width,
                height: quadrant.height,
                lastUpdate: Date.now()
            };

            this.windows.push(windowData);
            resolve(windowData);
        });
    },

    /**
     * Write HTML content to popup window
     * @param {Window} popup - Popup window reference
     * @param {Object} quadrant - Quadrant data
     */
    writeWindowContent(popup, quadrant) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Piece ${quadrant.id + 1}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            overflow: hidden;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        #piece {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: box-shadow 0.3s ease;
        }
        body.aligned #piece {
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.8),
                        0 0 60px rgba(102, 126, 234, 0.6),
                        inset 0 0 20px rgba(102, 126, 234, 0.3);
            animation: glow 1s ease-in-out infinite;
        }
        @keyframes glow {
            0%, 100% {
                filter: brightness(1);
            }
            50% {
                filter: brightness(1.2);
            }
        }
        .hint {
            position: absolute;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            background: rgba(0, 0, 0, 0.8);
            padding: 4px 8px;
            border-radius: 4px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        body.show-hint .hint {
            opacity: 1;
        }
        .hint.top { top: 10px; left: 50%; transform: translateX(-50%); }
        .hint.bottom { bottom: 10px; left: 50%; transform: translateX(-50%); }
        .hint.left { left: 10px; top: 50%; transform: translateY(-50%); }
        .hint.right { right: 10px; top: 50%; transform: translateY(-50%); }
    </style>
</head>
<body>
    <img id="piece" src="${quadrant.dataUrl}" alt="Puzzle piece ${quadrant.id + 1}">
    <div class="hint top">↑</div>
    <div class="hint bottom">↓</div>
    <div class="hint left">←</div>
    <div class="hint right">→</div>
    <script>
        const sessionId = '${this.sessionId}';
        const quadrantId = ${quadrant.id};
        
        // Send position updates to parent
        function sendPosition() {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'position-update',
                    sessionId: sessionId,
                    quadrantId: quadrantId,
                    position: {
                        x: window.screenX,
                        y: window.screenY
                    }
                }, '*');
            }
        }
        
        // Track window movement
        let lastX = window.screenX;
        let lastY = window.screenY;
        
        setInterval(() => {
            if (window.screenX !== lastX || window.screenY !== lastY) {
                lastX = window.screenX;
                lastY = window.screenY;
                sendPosition();
            }
        }, ${CONFIG.WINDOW.checkInterval});
        
        // Initial position send
        sendPosition();
        
        // Listen for messages from parent
        window.addEventListener('message', (event) => {
            if (event.data.sessionId === sessionId) {
                if (event.data.type === 'set-aligned') {
                    document.body.classList.toggle('aligned', event.data.aligned);
                }
                if (event.data.type === 'show-hint') {
                    document.body.classList.toggle('show-hint', event.data.show);
                    
                    // Update hint directions
                    if (event.data.direction) {
                        const hints = document.querySelectorAll('.hint');
                        hints.forEach(h => h.style.display = 'none');
                        
                        if (event.data.direction.includes('up')) {
                            document.querySelector('.hint.top').style.display = 'block';
                        }
                        if (event.data.direction.includes('down')) {
                            document.querySelector('.hint.bottom').style.display = 'block';
                        }
                        if (event.data.direction.includes('left')) {
                            document.querySelector('.hint.left').style.display = 'block';
                        }
                        if (event.data.direction.includes('right')) {
                            document.querySelector('.hint.right').style.display = 'block';
                        }
                    }
                }
            }
        });
        
        // Prevent accidental close
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            e.returnValue = '';
        });
    </script>
</body>
</html>`;

        popup.document.write(html);
        popup.document.close();
    },

    /**
     * Send message to a specific window
     * @param {number} quadrantId - Quadrant ID
     * @param {Object} message - Message data
     */
    sendToWindow(quadrantId, message) {
        const windowData = this.windows.find(w => w.quadrantId === quadrantId);
        if (windowData && windowData.reference && !windowData.reference.closed) {
            windowData.reference.postMessage({
                ...message,
                sessionId: this.sessionId
            }, '*');
        }
    },

    /**
     * Send message to all windows
     * @param {Object} message - Message data
     */
    broadcastToWindows(message) {
        this.windows.forEach(windowData => {
            if (windowData.reference && !windowData.reference.closed) {
                windowData.reference.postMessage({
                    ...message,
                    sessionId: this.sessionId
                }, '*');
            }
        });
    },

    /**
     * Get all window positions
     * @returns {Array} Array of window positions
     */
    getWindowPositions() {
        return this.windows.map(w => ({
            quadrantId: w.quadrantId,
            position: w.position,
            expectedPosition: w.expectedPosition
        }));
    },

    /**
     * Check if all windows are still open
     * @returns {boolean} True if all windows are open
     */
    areAllWindowsOpen() {
        return this.windows.every(w => w.reference && !w.reference.closed);
    },

    /**
     * Close a specific window
     * @param {number} quadrantId - Quadrant ID
     */
    closeWindow(quadrantId) {
        const windowData = this.windows.find(w => w.quadrantId === quadrantId);
        if (windowData && windowData.reference && !windowData.reference.closed) {
            windowData.reference.close();
        }
    },

    /**
     * Close all popup windows
     */
    closeAllWindows() {
        this.windows.forEach(windowData => {
            if (windowData.reference && !windowData.reference.closed) {
                windowData.reference.close();
            }
        });
        this.windows = [];
    },

    /**
     * Reset window positions
     */
    resetPositions() {
        if (!this.windows || this.windows.length === 0) {
            console.warn('No windows to reset');
            return;
        }

        const positions = Utils.calculateWindowPositions(
            this.windows[0].width,
            this.windows[0].height
        );

        this.windows.forEach((windowData, index) => {
            if (windowData.reference && !windowData.reference.closed) {
                windowData.reference.moveTo(positions[index].x, positions[index].y);
                windowData.position = positions[index];
            }
        });
    },

    /**
     * Cleanup
     */
    destroy() {
        this.closeAllWindows();
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        this.messageHandlers = {};
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WindowManager;
}
