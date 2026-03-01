/**
 * Biological Time-Travel (History Manager) PRO
 * 
 * Implements a non-destructive state timeline for the Reaction-Diffusion
 * simulation. This allowing users to "undo" or "redo" evolutionary
 * steps by maintaining a stack of previous GRID-B and GRID-A snapshots.
 * 
 * @class HistoryManager
 */
export class HistoryManager {
    /**
     * @param {Simulation} simulation - The simulation engine to track
     */
    constructor(simulation) {
        /** @type {Simulation} */
        this.sim = simulation;

        /** 
         * @type {Array<{a: Float32Array, b: Float32Array}>} 
         * LIFO/FIFO compatible storage for grid snapshots.
         */
        this.stack = [];

        /** @type {number} Maximum deep-history steps to prevent memory bloat */
        this.maxHistory = 15;

        /** @type {number} Current position pointer in the history stack */
        this.currentIndex = -1;
    }

    /**
     * Captures a deep copy of the current simulation concentration grids.
     * If saving occurs after an undo, the forward history (redo) is purged.
     */
    save() {
        // Purge "future" history if we diverged from an undo state
        if (this.currentIndex < this.stack.length - 1) {
            this.stack = this.stack.slice(0, this.currentIndex + 1);
        }

        // Deep clone F32Arrays to ensure isolation from simulation updates
        const snapshot = {
            a: new Float32Array(this.sim.gridA),
            b: new Float32Array(this.sim.gridB)
        };

        this.stack.push(snapshot);

        // Circular buffer behavior: drop oldest entry if limit reached
        if (this.stack.length > this.maxHistory) {
            this.stack.shift();
        } else {
            this.currentIndex++;
        }

        console.log(`History Snapshot: Step ${this.currentIndex}`);
    }

    /**
     * Reverts the simulation to the previous state in the stack.
     * 
     * @returns {number|null} Current index if successful
     */
    undo() {
        if (this.currentIndex <= 0) return null;

        this.currentIndex--;
        this.applyState(this.stack[this.currentIndex]);
        return this.currentIndex;
    }

    /**
     * Advances the simulation to a previously "undone" state.
     * 
     * @returns {number|null} Current index if successful
     */
    redo() {
        if (this.currentIndex >= this.stack.length - 1) return null;

        this.currentIndex++;
        this.applyState(this.stack[this.currentIndex]);
        return this.currentIndex;
    }

    /**
     * Injects snapshot data back into active and passive simulation buffers.
     * CRITICAL: We must sync the "next" buffers to prevent the RD step from
     * immediately calculating based on the old "next" state.
     * 
     * @param {Object} state - The {a, b} snapshot object
     * @private
     */
    applyState(state) {
        // Restore active grids
        this.sim.gridA.set(state.a);
        this.sim.gridB.set(state.b);

        // Synchronize double-buffering targets to maintain temporal consistency
        this.sim.nextA.set(state.a);
        this.sim.nextB.set(state.b);
    }
}
