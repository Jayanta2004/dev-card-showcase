/**
 * app.js - Main application initialization and event binding
 */

// Initialize core components
const canvas = document.getElementById('stateCanvas');
const fsm = new StateMachine();
const viz = new Visualizer(canvas, fsm);
const ui = new UIController(viz, fsm);

// ===== Mode Selection =====
document.getElementById('modeState').addEventListener('click', () => {
    viz.setMode('state');
    ui.updateModeIndicator('state');
});

document.getElementById('modeTransition').addEventListener('click', () => {
    viz.setMode('transition');
    ui.updateModeIndicator('transition');
});

document.getElementById('modeSimulate').addEventListener('click', () => {
    viz.setMode('simulate');
    ui.updateModeIndicator('simulate');
});

document.getElementById('modeDelete').addEventListener('click', () => {
    viz.setMode('delete');
    ui.updateModeIndicator('delete');
});

// ===== State Creation =====
document.getElementById('addStateBtn').addEventListener('click', () => {
    const name = document.getElementById('stateName').value.trim();

    if (!name) {
        ui.showError('Please enter a state name');
        return;
    }

    const type = document.getElementById('stateType').value;

    // Only one initial state allowed
    if (type === 'initial') {
        Array.from(fsm.states.values()).forEach(s => {
            if (s.type === 'initial') s.type = 'normal';
        });
    }

    // Add to center of canvas
    const x = canvas.width / 2;
    const y = canvas.height / 2;

    fsm.addState(viz.stateIdCounter++, name, type, x, y);
    document.getElementById('stateName').value = '';

    ui.updateAll();
});

// Enter key to add state
document.getElementById('stateName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('addStateBtn').click();
    }
});

// ===== Event Execution =====
document.getElementById('fireEventBtn').addEventListener('click', () => {
    const event = document.getElementById('eventName').value.trim();

    if (!event) {
        ui.showError('Please enter an event name');
        return;
    }

    const result = fsm.fireEvent(event);

    if (result.success) {
        // Highlight the transition
        ui.highlightState(result.to.id);

        // VISUAL FEEDBACK: Animate the transition
        viz.animateTransition(result.from.id, result.to.id);

        document.getElementById('eventName').value = '';
    } else {
        ui.showError(result.message);
    }

    ui.updateAll();
});

// Enter key to fire event
document.getElementById('eventName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('fireEventBtn').click();
    }
});

// ===== File Operations =====
document.getElementById('exportBtn').addEventListener('click', () => {
    const data = fsm.export();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `state-machine-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
});

document.getElementById('importBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                fsm.import(data);
                viz.stateIdCounter = Math.max(...Array.from(fsm.states.keys()), 0) + 1;
                ui.updateAll();
            } catch (err) {
                ui.showError('Error loading file: Invalid JSON format');
                console.error(err);
            }
        };

        reader.readAsText(file);
    };

    input.click();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    if (fsm.states.size === 0) return;

    if (confirm('Clear all states and transitions? This cannot be undone.')) {
        fsm.clear();
        viz.stateIdCounter = 0;
        ui.updateAll();
    }
});

// ===== Load Example =====
document.getElementById('loadExampleBtn').addEventListener('click', () => {
    const examples = getExampleList();

    let message = 'Choose an example to load:\n\n';
    examples.forEach((ex, idx) => {
        message += `${idx + 1}. ${ex.name}\n   ${ex.description}\n\n`;
    });
    message += 'Enter number (1-' + examples.length + '):';

    const choice = prompt(message);
    const index = parseInt(choice) - 1;

    if (index >= 0 && index < examples.length) {
        if (fsm.states.size > 0) {
            if (!confirm('This will replace your current state machine. Continue?')) {
                return;
            }
        }

        loadExample(examples[index].id, fsm, viz, ui);
    }
});

// ===== Help Modal =====
document.getElementById('helpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('active');
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('helpModal').classList.remove('active');
});

// Close modal on outside click
document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
        document.getElementById('helpModal').classList.remove('active');
    }
});

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
    // Don't trigger if typing in input field
    if (e.target.tagName === 'INPUT') return;

    switch (e.key) {
        case '1':
            viz.setMode('state');
            ui.updateModeIndicator('state');
            break;
        case '2':
            viz.setMode('transition');
            ui.updateModeIndicator('transition');
            break;
        case '3':
            viz.setMode('simulate');
            ui.updateModeIndicator('simulate');
            break;
        case '4':
            viz.setMode('delete');
            ui.updateModeIndicator('delete');
            break;
        case 'Escape':
            viz.selectedFrom = null;
            viz.draw();
            break;
    }
});

// ===== Canvas Event Listeners =====
canvas.addEventListener('click', (e) => viz.handleClick(e));
canvas.addEventListener('mousemove', (e) => viz.handleMouseMove(e));

// ===== Initial Setup =====
ui.updateAll();
console.log('StateflowJS initialized successfully!');
console.log('Keyboard shortcuts: 1-4 to switch modes, Esc to cancel selection');