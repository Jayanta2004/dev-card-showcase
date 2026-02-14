import { compileCSS } from './compiler.js';
import { loadPreset, getPresetList } from './presets.js';
import { initUI } from './ui.js';

const CONFIG = {
    cols: 40, // Expanded width
    rows: 15, // Depth of the automaton
};

const DOM = {
    tape: document.getElementById('tape-container'),
    grid: document.getElementById('grid-container'),
    style: document.getElementById('logic-styles'),
    btnRandom: document.getElementById('randomize-btn'),
    btnClear: document.getElementById('clear-btn'),
    cellCount: document.getElementById('cell-count'),
    ruleCount: document.getElementById('rule-count'),
    presetSelect: document.getElementById('preset-select'),
    themeSelect: document.getElementById('theme-select'),
};

function init() {
    console.log("Initializing CSSTuring...");

    // 1. Build the Tape (Row 0 inputs)
    buildTape();

    // 2. Build the Grid (Row 1..N display cells)
    buildGrid();

    // 3. Compile and Inject CSS Logic
    const { css, ruleCount } = compileCSS(CONFIG.rows, CONFIG.cols);
    DOM.style.textContent = css;

    // 4. Update Stats
    DOM.cellCount.textContent = CONFIG.cols * (CONFIG.rows + 1);
    DOM.ruleCount.textContent = ruleCount;

    // 5. Build UI for Presets & Themes
    buildUIElements();
    initUI();

    // 6. Handlers
    DOM.btnRandom.addEventListener('click', randomizeTape);
    DOM.btnClear.addEventListener('click', clearTape);
    DOM.presetSelect.addEventListener('change', (e) => loadPreset(e.target.value, DOM.tape));
    DOM.themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));

    // Initial State
    applyTheme('neon');
    loadPreset('single', DOM.tape);
}

function buildUIElements() {
    // Presets
    const presets = getPresetList();
    presets.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.key;
        opt.textContent = p.name;
        DOM.presetSelect.appendChild(opt);
    });

    // Themes
    const themes = [
        { id: 'neon', name: 'Neon Cyberpunk' },
        { id: 'retro', name: 'Retro Phosphor' },
        { id: 'blueprint', name: 'Blueprint' },
        { id: 'matrix', name: 'Digital Rain' },
        { id: 'paper', name: 'Hand Drawn' },
        { id: 'heatmap', name: 'Scientific Heatmap' },
        { id: 'high-contrast', name: 'High Contrast' },
    ];

    themes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        DOM.themeSelect.appendChild(opt);
    });
}

function applyTheme(themeId) {
    if (themeId === 'neon') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', themeId);
    }
}

function buildTape() {
    DOM.tape.innerHTML = '';
    for (let c = 0; c < CONFIG.cols; c++) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `t_${c}`; // Tape index
        input.dataset.index = c;
        // The last few cells might be boundary conditions, often set to 0
        DOM.tape.appendChild(input);
    }
}

function buildGrid() {
    DOM.grid.innerHTML = '';
    // Start from Row 1 because Row 0 is the tape inputs
    for (let r = 1; r <= CONFIG.rows; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        rowDiv.id = `row_${r}`;

        for (let c = 0; c < CONFIG.cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            // We give each cell a unique class-based ID for valid CSS targeting
            // using classes avoids ID specificity wars sometimes, but IDs are faster.
            // Let's use classes: .r_1_c_5
            cell.classList.add(`r_${r}_c_${c}`);
            cell.dataset.row = r;
            cell.dataset.col = c;

            rowDiv.appendChild(cell);
        }
        DOM.grid.appendChild(rowDiv);
    }
}

function randomizeTape() {
    const inputs = DOM.tape.querySelectorAll('input');
    inputs.forEach(input => {
        // Simple 50/50, but Rule 110 is more interesting with sparse input sometimes
        input.checked = Math.random() > 0.5;
    });
}

function clearTape() {
    const inputs = DOM.tape.querySelectorAll('input');
    inputs.forEach(input => input.checked = false);
    // Set the last one to true to trigger the pattern for standard demo
    inputs[inputs.length - 1].checked = true;
}

// Start
init();
