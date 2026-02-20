/**
 * NonEuclidScroll | Main App
 * Bootstraps the engine, state, and DOM.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing NonEuclidScroll Engine...");

    // 1. Expand the graph for complex navigation
    Generator.expandGraph(State, 50);

    // 2. Initialize DOM with first state
    const firstNode = State.getCurrent();
    DOM.init(firstNode);

    // 3. Initialize Engine
    const engine = new ScrollEngine();

    // 4. Connect Engine to DOM transitions
    State.onNodeChange = (newNodeId, direction) => {
        const data = State.getNodeData(newNodeId);
        DOM.transition(data, direction);
    };

    // 5. Handle Keyboard shortcuts (Debug & Manual Control)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'd') {
            document.getElementById('debug-overlay').classList.toggle('hidden');
        }

        // Manual override for testing
        if (e.key === 'ArrowDown') {
            engine.triggerTransition('down');
        }
        if (e.key === 'ArrowUp') {
            engine.triggerTransition('up');
        }
    });

    console.log("Engine Ready. Current Node:", State.currentNodeId);
});
