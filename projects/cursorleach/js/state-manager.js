/**
 * State Manager
 * Manages game state transitions and detachment logic
 */

const StateManager = {
    
    /**
     * Initialize state manager
     */
    init() {
        // Current state
        this.currentState = CONFIG.states.FREE;
        this.previousState = null;
        
        // State timing
        this.stateStartTime = performance.now();
        this.stateDuration = 0;
        
        // Detachment tracking
        this.detachmentAttempts = 0;
        this.lastDetachmentAttempt = 0;
        this.rapidMovementStartTime = 0;
        this.isInRapidMovement = false;
        
        // State change listeners
        this.stateChangeListeners = [];
        
        // UI elements
        this.stateDisplay = document.getElementById('stateDisplay');
        this.attachmentDisplay = document.getElementById('attachmentDisplay');
        this.resistanceDisplay = document.getElementById('resistanceDisplay');
        
        // Update initial state display
        this.updateStateDisplay();
    },
    
    /**
     * Update state manager
     * @param {number} deltaTime - Time delta
     */
    update(deltaTime) {
        // Update state duration
        this.stateDuration = performance.now() - this.stateStartTime;
        
        // Get current conditions
        const isTouching = Attachment.isCurrentlyTouching();
        const isAttached = Attachment.isCurrentlyAttached();
        const attachmentStrength = Attachment.getStrength();
        
        // Determine new state
        let newState = this.currentState;
        
        if (isAttached) {
            // Check for detachment conditions
            if (this.checkDetachmentConditions()) {
                newState = CONFIG.states.DETACHING;
            } else {
                newState = CONFIG.states.ATTACHED;
            }
        } else if (isTouching) {
            newState = CONFIG.states.TOUCHING;
        } else {
            // Check distance to determine if approaching
            const distance = Parasite.getDistanceToCursor();
            if (distance < CONFIG.gameplay.warningDistance) {
                newState = CONFIG.states.APPROACHING;
            } else {
                newState = CONFIG.states.FREE;
            }
        }
        
        // Change state if different
        if (newState !== this.currentState) {
            this.changeState(newState);
        }
        
        // Update detachment logic if in detaching state
        if (this.currentState === CONFIG.states.DETACHING) {
            this.updateDetachmentLogic(deltaTime);
        }
        
        // Update displays
        this.updateStateDisplay();
        this.updateAttachmentDisplay(attachmentStrength);
        this.updateResistanceDisplay();
    },
    
    /**
     * Change state
     * @param {string} newState - New state
     */
    changeState(newState) {
        if (newState === this.currentState) return;
        
        // Log state change if debug enabled
        if (CONFIG.debug.logState) {
            console.log(`State change: ${this.currentState} -> ${newState}`);
        }
        
        // Store previous state
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateStartTime = performance.now();
        this.stateDuration = 0;
        
        // Update visual states
        this.updateVisualStates();
        
        // Trigger state change effects
        this.onStateChange(newState);
        
        // Notify listeners
        this.notifyStateChange(newState, this.previousState);
    },
    
    /**
     * Update visual states for cursor and parasite
     */
    updateVisualStates() {
        // Update cursor state
        switch (this.currentState) {
            case CONFIG.states.FREE:
            case CONFIG.states.APPROACHING:
                CursorTracker.setState(null);
                break;
            case CONFIG.states.TOUCHING:
                CursorTracker.setState('hovering');
                break;
            case CONFIG.states.ATTACHED:
                CursorTracker.setState('attached');
                break;
            case CONFIG.states.DETACHING:
                CursorTracker.setState('detaching');
                break;
        }
        
        // Update parasite state
        Parasite.setState(this.currentState);
    },
    
    /**
     * Handle state change effects
     * @param {string} newState - New state
     */
    onStateChange(newState) {
        switch (newState) {
            case CONFIG.states.ATTACHED:
                this.onAttached();
                break;
            case CONFIG.states.DETACHING:
                this.onDetaching();
                break;
            case CONFIG.states.FREE:
                this.onFree();
                break;
        }
    },
    
    /**
     * Called when parasite attaches
     */
    onAttached() {
        // Screen shake effect
        if (CONFIG.effects.screenShake) {
            const appContainer = document.querySelector('.app-container');
            appContainer.classList.add('screen-shake');
            setTimeout(() => {
                appContainer.classList.remove('screen-shake');
            }, CONFIG.effects.shakeDuration);
        }
        
        // Highlight status panel
        const statusPanel = document.querySelector('.status-panel');
        if (statusPanel) {
            statusPanel.classList.add('highlight');
            setTimeout(() => {
                statusPanel.classList.remove('highlight');
            }, 500);
        }
    },
    
    /**
     * Called when entering detaching state
     */
    onDetaching() {
        this.detachmentAttempts++;
        this.lastDetachmentAttempt = performance.now();
    },
    
    /**
     * Called when returning to free state
     */
    onFree() {
        // Reset detachment tracking
        this.detachmentAttempts = 0;
        this.isInRapidMovement = false;
        this.rapidMovementStartTime = 0;
    },
    
    /**
     * Check if detachment conditions are met
     * @returns {boolean} True if should attempt detachment
     */
    checkDetachmentConditions() {
        if (!Attachment.isCurrentlyAttached()) {
            return false;
        }
        
        // Check cooldown
        const timeSinceLastAttempt = performance.now() - this.lastDetachmentAttempt;
        if (timeSinceLastAttempt < CONFIG.detachment.cooldownTime) {
            return false;
        }
        
        // Get physics data
        const avgVelocity = Physics.getAverageVelocity(5);
        const jerk = Physics.calculateJerk();
        const isErratic = Physics.isErraticMotion();
        
        // Check velocity threshold
        const meetsVelocity = avgVelocity.magnitude > CONFIG.detachment.velocityThreshold;
        
        // Check jerk threshold
        const meetsJerk = jerk > CONFIG.detachment.jerkThreshold;
        
        // Track rapid movement duration
        if (meetsVelocity && (meetsJerk || isErratic)) {
            if (!this.isInRapidMovement) {
                this.isInRapidMovement = true;
                this.rapidMovementStartTime = performance.now();
            }
            
            const rapidMovementDuration = performance.now() - this.rapidMovementStartTime;
            
            // Check if rapid movement duration is met
            if (rapidMovementDuration >= CONFIG.detachment.rapidMovementDuration) {
                return true;
            }
        } else {
            this.isInRapidMovement = false;
        }
        
        return false;
    },
    
    /**
     * Update detachment logic
     * @param {number} deltaTime - Time delta
     */
    updateDetachmentLogic(deltaTime) {
        // Continue checking conditions
        if (this.checkDetachmentConditions()) {
            // Random chance to detach
            if (Math.random() < CONFIG.detachment.detachmentChance) {
                // Successful detachment
                Attachment.forceDetach();
                this.changeState(CONFIG.states.FREE);
                
                // Visual feedback
                this.createDetachmentFeedback();
            } else {
                // Failed attempt - reduce attachment strength slightly
                Attachment.decreaseStrength(0.05);
            }
        } else {
            // Conditions no longer met - return to attached state
            this.changeState(CONFIG.states.ATTACHED);
        }
    },
    
    /**
     * Create visual feedback for successful detachment
     */
    createDetachmentFeedback() {
        // Flash effect
        const flashElement = document.createElement('div');
        flashElement.className = 'flash-effect active';
        document.body.appendChild(flashElement);
        
        setTimeout(() => {
            flashElement.remove();
        }, 300);
    },
    
    /**
     * Update state display
     */
    updateStateDisplay() {
        if (!this.stateDisplay) return;
        
        // Format state name
        const stateName = this.currentState.charAt(0).toUpperCase() + 
                         this.currentState.slice(1);
        
        this.stateDisplay.textContent = stateName;
        
        // Remove all state classes
        this.stateDisplay.classList.remove(
            'state-free', 'state-approaching', 'state-touching', 
            'state-attached', 'state-detaching'
        );
        
        // Add current state class
        this.stateDisplay.classList.add(`state-${this.currentState}`);
    },
    
    /**
     * Update attachment display
     * @param {number} strength - Attachment strength
     */
    updateAttachmentDisplay(strength) {
        if (!this.attachmentDisplay) return;
        
        const percentage = Utils.toPercentage(strength, 0);
        this.attachmentDisplay.textContent = percentage;
        
        // Update class based on strength
        this.attachmentDisplay.classList.remove(
            'attachment-low', 'attachment-medium', 'attachment-high'
        );
        
        if (strength < 0.33) {
            this.attachmentDisplay.classList.add('attachment-low');
        } else if (strength < 0.66) {
            this.attachmentDisplay.classList.add('attachment-medium');
        } else {
            this.attachmentDisplay.classList.add('attachment-high');
        }
    },
    
    /**
     * Update resistance display
     */
    updateResistanceDisplay() {
        if (!this.resistanceDisplay) return;
        
        const resistance = Resistance.getResistance();
        const percentage = Utils.toPercentage(resistance, 0);
        this.resistanceDisplay.textContent = percentage;
        
        // Update class based on resistance
        this.resistanceDisplay.classList.remove(
            'resistance-none', 'resistance-light', 'resistance-heavy'
        );
        
        if (resistance < 0.1) {
            this.resistanceDisplay.classList.add('resistance-none');
        } else if (resistance < 0.5) {
            this.resistanceDisplay.classList.add('resistance-light');
        } else {
            this.resistanceDisplay.classList.add('resistance-heavy');
        }
    },
    
    /**
     * Get current state
     * @returns {string} Current state
     */
    getState() {
        return this.currentState;
    },
    
    /**
     * Get previous state
     * @returns {string} Previous state
     */
    getPreviousState() {
        return this.previousState;
    },
    
    /**
     * Get state duration
     * @returns {number} Duration in milliseconds
     */
    getStateDuration() {
        return this.stateDuration;
    },
    
    /**
     * Add state change listener
     * @param {Function} callback - Callback function
     */
    addStateChangeListener(callback) {
        this.stateChangeListeners.push(callback);
    },
    
    /**
     * Notify state change listeners
     * @param {string} newState - New state
     * @param {string} oldState - Old state
     */
    notifyStateChange(newState, oldState) {
        this.stateChangeListeners.forEach(callback => {
            callback(newState, oldState);
        });
    },
    
    /**
     * Reset state manager
     */
    reset() {
        this.currentState = CONFIG.states.FREE;
        this.previousState = null;
        this.stateStartTime = performance.now();
        this.detachmentAttempts = 0;
        this.isInRapidMovement = false;
        this.updateVisualStates();
        this.updateStateDisplay();
    }
    
};
