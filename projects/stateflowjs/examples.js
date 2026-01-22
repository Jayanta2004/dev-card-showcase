/**
 * examples.js - Predefined state machine examples
 */

const Examples = {
    /**
     * Traffic Light State Machine
     * Demonstrates a simple cyclic FSM with three states
     */
    trafficLight: {
        states: [
            { id: 0, name: 'Red', type: 'initial', x: 450, y: 150 },
            { id: 1, name: 'Green', type: 'normal', x: 250, y: 450 },
            { id: 2, name: 'Yellow', type: 'normal', x: 650, y: 450 }
        ],
        transitions: [
            { from: 0, to: 1, event: 'timer' },
            { from: 1, to: 2, event: 'timer' },
            { from: 2, to: 0, event: 'timer' }
        ],
        currentState: 0,
        history: []
    },

    /**
     * Door Lock State Machine
     * Demonstrates states with multiple transitions
     */
    doorLock: {
        states: [
            { id: 0, name: 'Locked', type: 'initial', x: 250, y: 350 },
            { id: 1, name: 'Unlocked', type: 'normal', x: 650, y: 350 },
            { id: 2, name: 'Error', type: 'final', x: 450, y: 150 }
        ],
        transitions: [
            { from: 0, to: 1, event: 'correct_pin' },
            { from: 0, to: 2, event: 'wrong_pin_3x' },
            { from: 1, to: 0, event: 'lock' },
            { from: 2, to: 0, event: 'reset' }
        ],
        currentState: 0,
        history: []
    },

    /**
     * Vending Machine State Machine
     * Demonstrates a more complex flow with multiple paths
     */
    vendingMachine: {
        states: [
            { id: 0, name: 'Idle', type: 'initial', x: 200, y: 200 },
            { id: 1, name: 'HasCoin', type: 'normal', x: 500, y: 200 },
            { id: 2, name: 'Dispensing', type: 'normal', x: 700, y: 400 },
            { id: 3, name: 'OutOfStock', type: 'final', x: 200, y: 500 }
        ],
        transitions: [
            { from: 0, to: 1, event: 'insert_coin' },
            { from: 1, to: 0, event: 'refund' },
            { from: 1, to: 2, event: 'select_item' },
            { from: 2, to: 0, event: 'dispense_complete' },
            { from: 2, to: 3, event: 'stock_empty' },
            { from: 3, to: 0, event: 'restock' }
        ],
        currentState: 0,
        history: []
    },

    /**
     * Media Player State Machine
     * Demonstrates self-loops and complex state relationships
     */
    mediaPlayer: {
        states: [
            { id: 0, name: 'Stopped', type: 'initial', x: 300, y: 350 },
            { id: 1, name: 'Playing', type: 'normal', x: 600, y: 250 },
            { id: 2, name: 'Paused', type: 'normal', x: 600, y: 450 }
        ],
        transitions: [
            { from: 0, to: 1, event: 'play' },
            { from: 1, to: 2, event: 'pause' },
            { from: 2, to: 1, event: 'resume' },
            { from: 1, to: 0, event: 'stop' },
            { from: 2, to: 0, event: 'stop' },
            { from: 1, to: 1, event: 'next_track' }
        ],
        currentState: 0,
        history: []
    },

    /**
     * User Authentication Flow
     * Demonstrates login/logout cycle with security states
     */
    authentication: {
        states: [
            { id: 0, name: 'LoggedOut', type: 'initial', x: 250, y: 350 },
            { id: 1, name: 'LoggedIn', type: 'normal', x: 650, y: 350 },
            { id: 2, name: 'Locked', type: 'final', x: 450, y: 550 }
        ],
        transitions: [
            { from: 0, to: 1, event: 'login_success' },
            { from: 0, to: 2, event: 'too_many_attempts' },
            { from: 1, to: 0, event: 'logout' },
            { from: 1, to: 0, event: 'session_timeout' },
            { from: 2, to: 0, event: 'admin_unlock' }
        ],
        currentState: 0,
        history: []
    }
};

/**
 * Load an example into the state machine
 */
function loadExample(exampleName, fsm, viz, ui) {
    if (!Examples[exampleName]) {
        console.error(`Example "${exampleName}" not found`);
        return;
    }

    const example = Examples[exampleName];
    fsm.import(example);
    
    // Update visualizer's counter to avoid ID conflicts
    viz.stateIdCounter = Math.max(...example.states.map(s => s.id), 0) + 1;
    
    ui.updateAll();
}

/**
 * Get list of available examples
 */
function getExampleList() {
    return [
        { id: 'trafficLight', name: '🚦 Traffic Light', description: 'Simple cyclic FSM with timer transitions' },
        { id: 'doorLock', name: '🔒 Door Lock', description: 'PIN-based lock with error handling' },
        { id: 'vendingMachine', name: '🥤 Vending Machine', description: 'Complex flow with inventory management' },
        { id: 'mediaPlayer', name: '🎵 Media Player', description: 'Player controls with self-loops' },
        { id: 'authentication', name: '🔐 User Authentication', description: 'Login/logout with security lockout' }
    ];
}