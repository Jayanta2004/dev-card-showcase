/**
 * UIController.js - Manages UI updates and user interactions
 */

class UIController {
    constructor(visualizer, fsm) {
        this.viz = visualizer;
        this.fsm = fsm;
    }

    /**
     * Update all UI elements
     */
    updateAll() {
        this.updateStats();
        this.updateStateList();
        this.updateHistory();
        this.updateTransitionList();
        this.updateWarnings();
        this.updateCanvasOverlay();
        this.viz.draw();
    }

    /**
     * Update statistics
     */
    updateStats() {
        document.getElementById('stateCount').textContent = this.fsm.states.size;
        document.getElementById('transitionCount').textContent = this.fsm.transitions.length;
    }

    /**
     * Update state list panel
     */
    updateStateList() {
        const stateListEl = document.getElementById('stateList');

        if (this.fsm.states.size === 0) {
            stateListEl.innerHTML = '<div class="empty-state">No states yet</div>';
            return;
        }

        stateListEl.innerHTML = '';
        this.fsm.states.forEach(state => {
            const div = document.createElement('div');
            div.className = 'state-item fade-in';

            if (state.id === this.fsm.currentState) div.classList.add('active');
            if (state.type === 'initial') div.classList.add('initial');
            if (state.type === 'final') div.classList.add('final');

            let badge = '';
            if (state.type === 'initial') badge = ' 🔶';
            if (state.type === 'final') badge = ' 🔴';
            if (state.id === this.fsm.currentState) badge += ' ⚡';

            div.textContent = state.name + badge;
            stateListEl.appendChild(div);
        });
    }

    /**
     * Update execution history
     */
    updateHistory() {
        const historyEl = document.getElementById('historyList');

        if (this.fsm.history.length === 0) {
            historyEl.innerHTML = '<div class="empty-state">No events fired yet</div>';
            return;
        }

        historyEl.innerHTML = '';
        const recentHistory = this.fsm.history.slice().reverse().slice(0, 15);

        recentHistory.forEach(h => {
            const div = document.createElement('div');
            div.className = 'history-item fade-in';

            if (h.success) {
                const fromName = this.fsm.states.get(h.from)?.name || 'Unknown';
                const toName = this.fsm.states.get(h.to)?.name || 'Unknown';
                div.innerHTML = `
                    <div style="font-size: 0.75em; color: #64748b; margin-bottom: 4px;">${h.timestamp}</div>
                    <div><strong>${h.event}:</strong> ${fromName} → ${toName}</div>
                `;
            } else {
                div.classList.add('failed');
                const fromName = this.fsm.states.get(h.from)?.name || 'Unknown';
                div.innerHTML = `
                    <div style="font-size: 0.75em; color: #64748b; margin-bottom: 4px;">${h.timestamp}</div>
                    <div><strong>${h.event}:</strong> Failed from ${fromName}</div>
                `;
            }

            historyEl.appendChild(div);
        });
    }

    /**
     * Update transition list
     */
    updateTransitionList() {
        const transListEl = document.getElementById('transitionListDisplay');

        if (this.fsm.transitions.length === 0) {
            transListEl.innerHTML = '<div class="empty-state">No transitions defined</div>';
            return;
        }

        transListEl.innerHTML = '';
        this.fsm.transitions.forEach(t => {
            const div = document.createElement('div');
            div.className = 'transition-item fade-in';

            const fromName = this.fsm.states.get(t.from)?.name || '?';
            const toName = this.fsm.states.get(t.to)?.name || '?';

            div.textContent = `${fromName} --[${t.event}]--> ${toName}`;
            transListEl.appendChild(div);
        });
    }

    /**
     * Update warnings (unreachable states, etc.)
     */
    updateWarnings() {
        const container = document.getElementById('warningContainer');
        container.innerHTML = '';

        const unreachable = this.fsm.getUnreachableStates();
        const deadEnds = this.fsm.getDeadEndStates();

        if (unreachable.length > 0) {
            const warning = document.createElement('div');
            warning.className = 'warning-box fade-in';
            const stateNames = unreachable.map(id => this.fsm.states.get(id)?.name || 'Unknown').join(', ');
            warning.innerHTML = `
                <strong>⚠️ Unreachable States</strong><br>
                <span style="font-size: 0.85em;">${stateNames}</span>
            `;
            container.appendChild(warning);
        }

        if (deadEnds.length > 0 && this.fsm.states.size > 0) {
            const warning = document.createElement('div');
            warning.className = 'warning-box fade-in';
            const stateNames = deadEnds.map(id => this.fsm.states.get(id)?.name || 'Unknown').join(', ');
            warning.innerHTML = `
                <strong>⚠️ Dead-end States</strong><br>
                <span style="font-size: 0.85em;">${stateNames} (no outgoing transitions)</span>
            `;
            container.appendChild(warning);
        }
    }

    /**
     * Show/hide canvas overlay
     */
    updateCanvasOverlay() {
        const overlay = document.getElementById('canvasOverlay');
        if (this.fsm.states.size > 0) {
            overlay.classList.add('hidden');
        } else {
            overlay.classList.remove('hidden');
        }
    }

    /**
     * Show error message temporarily
     */
    showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-box fade-in';
        errorEl.textContent = message;

        const container = document.getElementById('warningContainer');
        container.insertBefore(errorEl, container.firstChild);

        setTimeout(() => {
            errorEl.style.opacity = '0';
            errorEl.style.transition = 'opacity 0.3s';
            setTimeout(() => errorEl.remove(), 300);
        }, 3000);
    }

    /**
     * Update mode indicator
     */
    updateModeIndicator(mode) {
        const modeTexts = {
            state: { icon: '📍', text: 'Add State - Click canvas' },
            transition: { icon: '🔗', text: 'Add Transition - Click two states' },
            simulate: { icon: '▶️', text: 'Simulate - Click state or fire events' },
            delete: { icon: '🗑️', text: 'Delete - Click state to remove' }
        };

        const modeInfo = modeTexts[mode];
        document.querySelector('.mode-icon').textContent = modeInfo.icon;
        document.querySelector('.mode-text').textContent = modeInfo.text;

        // Update toolbar buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    }

    /**
     * Highlight state temporarily
     */
    highlightState(stateId) {
        const stateItems = document.querySelectorAll('.state-item');
        stateItems.forEach(item => {
            const stateName = this.fsm.states.get(stateId)?.name;
            if (item.textContent.includes(stateName)) {
                item.classList.add('pulsing');
                setTimeout(() => item.classList.remove('pulsing'), 500);
            }
        });
    }
}