// js/ui/components.js

export const Components = {
    // Utility for building complex specialized HTML blocks if needed
    // Currently, renderer handles most logic.

    createStatusOverlay(container) {
        const overlay = document.createElement('div');
        overlay.className = 'timeline-status';
        overlay.innerHTML = `
            <div>TIMELINE INTEGRITY: <span id="integrity-val" class="status-value">100%</span></div>
            <div>OBSERVER STATUS: <span id="observer-val" class="status-value">AWAKE</span></div>
            <div>PARADOX EVENTS: <span id="paradox-val" class="status-value">0</span></div>
        `;
        container.appendChild(overlay);
        return overlay;
    },

    updateStatusOverlay(state) {
        const iVal = document.getElementById('integrity-val');
        const oVal = document.getElementById('observer-val');
        const pVal = document.getElementById('paradox-val');

        if (iVal) {
            iVal.innerText = `${state.flags.realityIntegrity}%`;
            if (state.flags.realityIntegrity < 50) iVal.classList.add('status-warning');
            else iVal.classList.remove('status-warning');
        }

        if (oVal) oVal.innerText = state.flags.isAwake ? 'AWAKE' : 'DREAMING';
        if (pVal) pVal.innerText = state.paradoxCount;
    }
}
