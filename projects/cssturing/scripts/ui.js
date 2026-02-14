/**
 * UI Interactions
 * Handles the Help Modal, Export to Image, and other non-core interactions.
 */

const UI = {
    modal: document.getElementById('help-modal'),
    btnHelp: document.getElementById('help-btn'),
    btnClose: document.getElementById('close-modal'),
    btnExport: document.getElementById('export-btn'),
    gridContainer: document.getElementById('grid-container'),
    tapeContainer: document.getElementById('tape-container'),
};

export function initUI() {
    if (UI.btnHelp) {
        UI.btnHelp.addEventListener('click', openModal);
    }
    if (UI.btnClose) {
        UI.btnClose.addEventListener('click', closeModal);
    }
    if (UI.modal) {
        UI.modal.addEventListener('click', (e) => {
            if (e.target === UI.modal) closeModal();
        });
    }

    if (UI.btnExport) {
        UI.btnExport.addEventListener('click', exportImage);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === '?') openModal();
    });
}

function openModal() {
    UI.modal.classList.add('visible');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

function closeModal() {
    UI.modal.classList.remove('visible');
    document.body.style.overflow = '';
}

/**
 * Exports the current state of the Automaton as an image (PNG).
 * Since the grid is made of div elements, we can't just "toDataURL".
 * We must draw it to a canvas manually based on the computed styles.
 */
function exportImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Determine grid dimensions
    // We need to measure the actual cell size from CSS
    const firstCell = document.querySelector('.cell');
    if (!firstCell) return;

    const style = getComputedStyle(firstCell);
    const size = parseInt(style.width) || 20;
    const gap = 2; // Hardcoded or read from var

    // Tape Row + Grid Rows
    const tapeInputs = UI.tapeContainer.querySelectorAll('input');
    const cols = tapeInputs.length;
    const gridRows = UI.gridContainer.querySelectorAll('.row');
    const rows = gridRows.length;

    // Canvas Size
    // Width = cols * (size + gap) + padding
    // Height = (rows + 1) * (size + gap) + padding
    const width = cols * (size + gap) + 20;
    const height = (rows + 1) * (size + gap) + 20;

    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = '#0a0a0f'; // Default BG
    ctx.fillRect(0, 0, width, height);

    // Draw Tape
    tapeInputs.forEach((input, c) => {
        const x = 10 + c * (size + gap);
        const y = 10;

        // Input state is checked property
        const active = input.checked;
        ctx.fillStyle = active ? '#00ffcc' : '#1a1a25';
        ctx.fillRect(x, y, size, size);
    });

    // Draw Grid
    gridRows.forEach((row, r) => {
        const cells = row.querySelectorAll('.cell');
        cells.forEach((cell, c) => {
            const x = 10 + c * (size + gap);
            const y = 10 + (r + 1) * (size + gap);

            // Cell state is Computed Style background color!
            // This is the cool part: we read the CSS state.
            const cellStyle = getComputedStyle(cell);
            ctx.fillStyle = cellStyle.backgroundColor;
            ctx.fillRect(x, y, size, size);
        });
    });

    // Download
    const link = document.createElement('a');
    link.download = `cssturing-export-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}
