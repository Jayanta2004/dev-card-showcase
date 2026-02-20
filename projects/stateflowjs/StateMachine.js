/**
 * StateMachine.js - Core finite state machine logic
 */

class StateMachine {
    constructor() {
        this.states = new Map();
        this.transitions = [];
        this.currentState = null;
        this.history = [];
    }

    /**
     * Add a new state to the machine
     */
    addState(id, name, type, x, y) {
        this.states.set(id, {
            id,
            name,
            type, // 'normal', 'initial', 'final'
            x,
            y
        });

        // Auto-set as current if it's the initial state
        if (type === 'initial' && !this.currentState) {
            this.currentState = id;
        }
    }

    /**
     * Remove a state and all its transitions
     */
    removeState(id) {
        this.states.delete(id);
        
        // Remove all transitions involving this state
        this.transitions = this.transitions.filter(
            t => t.from !== id && t.to !== id
        );

        // Reset current state if it was the removed one
        if (this.currentState === id) {
            this.currentState = null;
        }
    }

    /**
     * Add a transition between states
     */
    addTransition(from, to, event) {
        this.transitions.push({
            from,
            to,
            event
        });
    }

    /**
     * Remove a transition by index
     */
    removeTransition(index) {
        this.transitions.splice(index, 1);
    }

    /**
     * Fire an event to trigger a state transition
     */
    fireEvent(event) {
        if (!this.currentState) {
            return {
                success: false,
                message: 'No current state set. Set an initial state first.'
            };
        }

        // Find matching transition
        const transition = this.transitions.find(
            t => t.from === this.currentState && t.event === event
        );

        if (!transition) {
            const currentStateName = this.states.get(this.currentState).name;
            
            this.history.push({
                event,
                from: this.currentState,
                to: null,
                success: false,
                timestamp: new Date().toLocaleTimeString()
            });

            return {
                success: false,
                message: `No transition for event "${event}" from state "${currentStateName}"`
            };
        }

        // Execute transition
        const fromState = this.states.get(this.currentState);
        const toState = this.states.get(transition.to);

        this.history.push({
            event,
            from: this.currentState,
            to: transition.to,
            success: true,
            timestamp: new Date().toLocaleTimeString()
        });

        this.currentState = transition.to;

        return {
            success: true,
            message: `Transitioned from "${fromState.name}" to "${toState.name}"`,
            from: fromState,
            to: toState
        };
    }

    /**
     * Detect unreachable states (states with no path from initial state)
     */
    getUnreachableStates() {
        if (this.states.size === 0) return [];

        const reachable = new Set();
        const initial = Array.from(this.states.values()).find(s => s.type === 'initial');

        if (!initial) {
            // If no initial state, all states are considered unreachable
            return Array.from(this.states.keys());
        }

        // BFS to find all reachable states
        const queue = [initial.id];
        reachable.add(initial.id);

        while (queue.length > 0) {
            const current = queue.shift();
            const outgoing = this.transitions.filter(t => t.from === current);

            outgoing.forEach(t => {
                if (!reachable.has(t.to)) {
                    reachable.add(t.to);
                    queue.push(t.to);
                }
            });
        }

        return Array.from(this.states.keys()).filter(id => !reachable.has(id));
    }

    /**
     * Get states with no outgoing transitions (dead-end states)
     */
    getDeadEndStates() {
        const deadEnds = [];
        
        for (let [id, state] of this.states) {
            if (state.type === 'final') continue; // Final states are expected to have no outgoing
            
            const hasOutgoing = this.transitions.some(t => t.from === id);
            if (!hasOutgoing) {
                deadEnds.push(id);
            }
        }

        return deadEnds;
    }

    /**
     * Export state machine to JSON
     */
    export() {
        return {
            states: Array.from(this.states.values()),
            transitions: this.transitions,
            currentState: this.currentState,
            history: this.history
        };
    }

    /**
     * Import state machine from JSON
     */
    import(data) {
        this.states.clear();
        this.transitions = [];
        this.history = [];

        data.states.forEach(s => this.states.set(s.id, s));
        this.transitions = data.transitions || [];
        this.currentState = data.currentState || null;
        this.history = data.history || [];
    }

    /**
     * Reset execution state (keep structure, clear history)
     */
    reset() {
        this.history = [];
        const initial = Array.from(this.states.values()).find(s => s.type === 'initial');
        this.currentState = initial ? initial.id : null;
    }

    /**
     * Clear everything
     */
    clear() {
        this.states.clear();
        this.transitions = [];
        this.currentState = null;
        this.history = [];
    }
}