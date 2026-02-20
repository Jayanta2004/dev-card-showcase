document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dock = document.getElementById('dock');
    const input = document.getElementById('cmd-input');
    const feedback = document.getElementById('feedback');
    
    // --- Configuration ---
    const DEFAULT_STEP = 50; // Pixels to move if no number specified
    const MAX_OFFSET = 1000; // Safety boundary for relative movement
    
    // --- State Management ---
    let state = {
        isLocked: false,
        anchorClass: 'center', // center, top-left, top-right, bottom-left, bottom-right
        offsetX: 0,            // Relative X pixels from anchor
        offsetY: 0             // Relative Y pixels from anchor
    };

    // --- Input Handling ---
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCommand = input.value;
            if (rawCommand.trim() !== "") {
                parseAndExecute(rawCommand);
                input.value = ''; // Clear input
            }
        }
    });

    // --- Command Parsing Logic ---
    function parseAndExecute(rawCmd) {
        // Normalize: lowercase, remove extra spaces
        const cmd = rawCmd.trim().toLowerCase().replace(/\s+/g, ' ');

        // 1. Check Lock/Unlock (Highest Priority)
        if (cmd.includes('unlock position') || cmd === 'unlock') {
            setLock(false);
            return;
        }

        // If locked, reject all other commands
        if (state.isLocked) {
            showFeedback("🔒 UI is locked. Type 'unlock position'", true);
            triggerShake();
            return;
        }

        if (cmd.includes('lock position') || cmd === 'lock') {
            setLock(true);
            return;
        }

        // 2. Check Reset
        if (cmd === 'reset position' || cmd === 'default position' || cmd === 'reset') {
            resetDock();
            showFeedback("↺ Position reset to default");
            return;
        }

        // 3. Check Docking Presets (Absolute Positioning)
        if (handleDocking(cmd)) return;

        // 4. Check Relative Movement (Pixels/Direction)
        if (handleMovement(cmd)) return;

        // 5. Unknown Command
        showFeedback("⚠ Unknown command. Type a valid instruction.", true);
        triggerShake();
    }

    // --- Action Handlers ---

    function setLock(locked) {
        state.isLocked = locked;
        if (locked) {
            dock.classList.add('locked');
            showFeedback("🔒 Position Locked");
        } else {
            dock.classList.remove('locked');
            showFeedback("🔓 Position Unlocked");
        }
    }

    function resetDock() {
        state.anchorClass = 'center';
        state.offsetX = 0;
        state.offsetY = 0;
        updateUI();
    }

    function handleDocking(cmd) {
        // Map synonyms to CSS classes
        const presets = {
            'top left': 'top-left',
            'top right': 'top-right',
            'bottom left': 'bottom-left',
            'bottom right': 'bottom-right',
            'center': 'center',
            'middle': 'center'
        };

        // Check if command contains any of the preset keys
        for (const [key, className] of Object.entries(presets)) {
            // Logic: Command must contain the key AND (start with move/place/dock OR be exactly 'center the ui')
            if (cmd.includes(key) && (cmd.includes('move') || cmd.includes('place') || cmd.includes('dock') || cmd === 'center the ui')) {
                
                state.anchorClass = className;
                state.offsetX = 0; // Reset relative offsets when docking
                state.offsetY = 0;
                
                updateUI();
                showFeedback(`📍 Docked to ${key}`);
                return true;
            }
        }
        return false;
    }

    function handleMovement(cmd) {
        // Regex: Optional Number + Optional 'px' + Direction (up/down/left/right)
        // Matches: "move 50px right", "50 right", "move right", "right"
        const moveRegex = /(\d+)?(?:px)?\s*(up|down|left|right)/;
        const match = cmd.match(moveRegex);

        if (match) {
            const amount = match[1] ? parseInt(match[1], 10) : DEFAULT_STEP;
            const direction = match[2];

            let newX = state.offsetX;
            let newY = state.offsetY;

            // Calculate new potential offsets
            if (direction === 'up') newY -= amount;
            if (direction === 'down') newY += amount;
            if (direction === 'left') newX -= amount;
            if (direction === 'right') newX += amount;

            // Safety Boundary Check
            if (Math.abs(newX) > MAX_OFFSET || Math.abs(newY) > MAX_OFFSET) {
                showFeedback("⛔ Limit reached! Cannot move further.", true);
                triggerShake();
                return true; 
            }

            // Apply changes
            state.offsetX = newX;
            state.offsetY = newY;
            updateUI();
            showFeedback(`📐 Moved ${direction} ${amount}px`);
            return true;
        }
        return false;
    }

    // --- UI Update Engine ---

    function updateUI() {
        // 1. Reset base classes
        dock.className = 'dock-panel';
        if (state.isLocked) dock.classList.add('locked');

        // 2. Add anchor class
        dock.classList.add(state.anchorClass);

        // 3. Apply Transform
        // If centered, we use CSS calc() to combine the -50% center alignment with our JS offset
        if (state.anchorClass === 'center') {
            dock.style.transform = `translate(calc(-50% + ${state.offsetX}px), calc(-50% + ${state.offsetY}px))`;
        } else {
            // For corners, just use the raw offset
            dock.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px)`;
        }
    }

    // --- Feedback Helpers ---

    function showFeedback(text, isError = false) {
        feedback.textContent = text;
        feedback.style.color = isError ? '#ff5555' : '#ccc';
        
        // Auto-revert color after delay
        setTimeout(() => {
            if (feedback.textContent === text) {
                feedback.style.color = '#888';
            }
        }, 3000);
    }

    function triggerShake() {
        // Shake the input box container to indicate error
        const inputWrapper = document.querySelector('.input-wrapper');
        inputWrapper.classList.add('shake-anim');
        setTimeout(() => {
            inputWrapper.classList.remove('shake-anim');
        }, 300);
    }
});