/**
 * NonEuclidScroll | State Manager
 * Tracks the current position in the non-Euclidean graph.
 * 
 * THEORETICAL BASIS:
 * This module implements a directed graph where nodes represent "rooms"
 * or "spatial segments". Unlike Euclidean geometry, the relationship
 * between nodes A and B is not necessarily reciprocal. 
 * A 'down' move from A to B followed by an 'up' move does not 
 * guarantee a return to A.
 */

class StateManager {
    /**
     * Initializes the state machine with a starting node and history tracking.
     */
    constructor() {
        /** @type {number|string} Current active node identifier */
        this.currentNodeId = 0;
        /** @type {Array} Keeps track of the last N nodes visited */
        this.history = [0];
        /** @type {number} Maximum history length for the HUD display */
        this.maxHistory = 10;

        /**
         * The Spatial Graph
         * A dictionary mapping nodeId to navigation vectors.
         * Structure: { title, desc, down: targetId, up: targetId }
         */
        this.graph = {
            0: {
                title: "Lobby of Silence",
                desc: "Where paths are chosen but never forgotten. The air is still.",
                down: 1,
                up: 5
            },
            1: {
                title: "The Falling Hall",
                desc: "Gravity is a suggestion here. Distant echoes of stone.",
                down: 2,
                up: 0
            },
            2: {
                title: "Mirror Corridor",
                desc: "Every reflection is a different you. The glass ripples.",
                down: 3,
                up: 6
            },
            3: {
                title: "The Red Chamber",
                desc: "Heat rises from the floorboards of time. It smells of copper.",
                down: 4,
                up: 1
            },
            4: {
                title: "Infinite Library",
                desc: "Books containing every word ever spoken. No one is reading.",
                down: 0,
                up: 2
            },
            5: {
                title: "The Attic of Dreams",
                desc: "Memories stored in jars of blue light. Some are leaking.",
                down: 0,
                up: 4
            },
            6: {
                title: "Void Walk",
                desc: "Step carefully, the floor is only logic. Watch the gaps.",
                down: 2,
                up: 3
            }
        };

        /** @type {Function|null} Callback executed when position changes */
        this.onNodeChange = null;
    }

    /**
     * Navigates the traveler through the spatial fold.
     * @param {string} direction - 'down' or 'up' vector
     */
    navigate(direction) {
        const node = this.graph[this.currentNodeId];
        const nextId = node[direction];

        if (nextId !== undefined) {
            this.currentNodeId = nextId;
            this.history.push(nextId);

            // Maintain a sliding window of recent locations
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }

            // Emit change event for DOM and Engine layers
            if (this.onNodeChange) {
                this.onNodeChange(this.currentNodeId, direction);
            }
        }
    }

    /**
     * Retrieves metadata for a specific coordinate.
     * @param {number|string} id 
     * @returns {Object}
     */
    getNodeData(id) {
        return this.graph[id] || this.graph[0];
    }

    /**
     * Gets data for the traveler's current coordinates.
     * @returns {Object}
     */
    getCurrent() {
        return this.getNodeData(this.currentNodeId);
    }
}

/** 
 * Singleton instance of the Spatial State.
 * Ensures all modules refer to the same reality.
 */
const State = new StateManager();
