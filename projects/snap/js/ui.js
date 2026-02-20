/**
 * ui.js
 * Handles all DOM interactions, event listeners, and UI updates.
 */

import {
    subscribe,
    openImage,
    closeModal,
    updateFilter,
    getState,
    resetFilters,
    navigateImage,
    applyPreset,
    undo,
    redo,
    setSortOrder, // New
    DEFAULTS
} from './state.js';

import {
    generateFilterString,
    PRESETS, // Import presets
    drawToCanvas,
    downloadCanvas
} from './filters.js';

import { filterGallery, handleFileUpload } from './gallery.js';

// DOM Elements Cache
const elements = {
    grid: document.querySelector('#gallery-grid'),
    modal: document.querySelector('#editor-modal'),
    modalTitle: document.querySelector('#modal-image-title'),
    activeImage: document.querySelector('#active-image'),
    canvas: document.querySelector('#export-canvas'),
    closeBtn: document.querySelector('#btn-close-modal'),
    resetBtn: document.querySelector('#btn-reset-filters'),
    undoBtn: document.querySelector('#btn-undo'),
    redoBtn: document.querySelector('#btn-redo'),
    downloadBtn: document.querySelector('#btn-download'),
    uploadBtn: document.querySelector('#btn-upload'),
    fileInput: document.querySelector('#file-upload'),
    searchInput: document.querySelector('#gallery-search'),
    sortSelect: document.querySelector('#gallery-sort'), // New
    btnFullscreen: document.querySelector('#btn-fullscreen'), // New
    btnCompare: document.querySelector('#btn-compare'), // New

    // Transforms
    btnRotateLeft: document.querySelector('#btn-rotate-left'),
    btnRotateRight: document.querySelector('#btn-rotate-right'),
    btnFlipH: document.querySelector('#btn-flip-h'),
    btnFlipV: document.querySelector('#btn-flip-v'),

    presetChips: document.querySelectorAll('.preset-chip'),
    prevBtn: document.querySelector('.nav-prev'),
    nextBtn: document.querySelector('.nav-next'),
    sliders: {}
};

// Cache sliders
document.querySelectorAll('input[type="range"]').forEach(input => {
    const key = input.id.replace('filter-', '');
    elements.sliders[key] = {
        input,
        label: document.querySelector(`.slider-value[data-for="${key}"]`)
    };
});

/**
 * Initialize UI Listeners
 */
export function initUI() {
    // Gallery Grid Interaction (Event Delegation)
    elements.grid.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const index = parseInt(item.dataset.index, 10);
            openImage(index);
        }
    });

    // Gallery Grid Keydown (Accessiblity)
    elements.grid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const item = e.target.closest('.gallery-item');
            if (item) {
                const index = parseInt(item.dataset.index, 10);
                openImage(index);
            }
        }
    });

    // Modal Actions
    elements.closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal || e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    // Navigation
    elements.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateImage(-1);
    });

    elements.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateImage(1);
    });

    // Reset
    elements.resetBtn.addEventListener('click', () => {
        resetFilters();
        document.querySelector('.preset-chip[data-preset="normal"]')?.classList.add('active');
    });

    // Undo/Redo
    elements.undoBtn.addEventListener('click', undo);
    elements.redoBtn.addEventListener('click', redo);

    // Sliders
    Object.keys(elements.sliders).forEach(key => {
        const { input } = elements.sliders[key];

        // Real-time update (no history push)
        input.addEventListener('input', (e) => {
            updateFilter(key, e.target.value, false);
            // Remove active state from presets as custom value is modified
            document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        });

        // History commit on release
        input.addEventListener('change', (e) => {
            updateFilter(key, e.target.value, true);
        });
    });

    // Reset
    elements.resetBtn.addEventListener('click', () => {
        resetFilters();
        document.querySelector('.preset-chip[data-preset="normal"]')?.classList.add('active');
    });

    // Presets
    document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const presetName = chip.dataset.preset;

            // UI Update
            document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Apply Logic
            const presetValues = PRESETS[presetName] || {};
            applyPreset(presetValues);
        });
    });

    // Download
    elements.downloadBtn.addEventListener('click', () => {
        const state = getState();
        const currentImg = state.images[state.currentIndex];
        drawToCanvas(elements.activeImage, elements.canvas, state.filters);
        downloadCanvas(elements.canvas, `snap-${currentImg.id}-edit.png`);
    });

    // Upload
    elements.uploadBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });

    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files);
            // Clear input so same file selection triggers change if needed
            e.target.value = '';
        }
    });

    // Search
    elements.searchInput.addEventListener('input', (e) => {
        filterGallery(e.target.value);
    });

    // Sort
    elements.sortSelect.addEventListener('change', (e) => {
        setSortOrder(e.target.value);
    });

    // Fullscreen
    elements.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            elements.modal.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Compare (Hold to view original)
    const toggleCompare = (showOriginal) => {
        if (showOriginal) {
            elements.activeImage.style.filter = 'none';
            elements.activeImage.style.transform = 'none'; // Also reset transforms for true original view? Or just filters? Usually comparisons keep geometry. Let's keep geometry but reset filters.
            // Wait, if I reset filter to none, that works. 
            // If I want to keep geometry, I need to re-apply JUST the transform.
            // Let's implement smart compare: Filter = none, but keep Transform? 
            // Complication: The `updateUI` applies everything from state. 
            // If I manually override style here, `updateUI` might interfere if state changes? 
            // State won't change on mouse hold.
            // Let's just remove filter.
            elements.activeImage.style.filter = 'none';
        } else {
            const state = getState();
            const filterStr = generateFilterString(state.filters);
            elements.activeImage.style.filter = filterStr;
        }
    };

    elements.btnCompare.addEventListener('mousedown', () => toggleCompare(true));
    elements.btnCompare.addEventListener('mouseup', () => toggleCompare(false));
    elements.btnCompare.addEventListener('mouseleave', () => toggleCompare(false));

    // Touch support for compare
    elements.btnCompare.addEventListener('touchstart', (e) => { e.preventDefault(); toggleCompare(true); });
    elements.btnCompare.addEventListener('touchend', (e) => { e.preventDefault(); toggleCompare(false); });

    // Transforms
    const updateTransformState = (key, delta) => {
        const state = getState();
        let val = state.filters[key];

        if (key === 'rotate') {
            val = (val + delta) % 360;
            if (val < 0) val += 360;
        } else {
            // Toggle boolean for flips
            val = !val;
        }

        updateFilter(key, val, true); // Push to history
    };

    elements.btnRotateLeft.addEventListener('click', () => updateTransformState('rotate', -90));
    elements.btnRotateRight.addEventListener('click', () => updateTransformState('rotate', 90));
    elements.btnFlipH.addEventListener('click', () => updateTransformState('flipH', 0));
    elements.btnFlipV.addEventListener('click', () => updateTransformState('flipV', 0));


    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        const state = getState();
        if (!state.isModalOpen) return;

        switch (e.key) {
            case 'Escape': closeModal(); break;
            case 'ArrowLeft': navigateImage(-1); break;
            case 'ArrowRight': navigateImage(1); break;
            case 'z':
                if (e.ctrlKey || e.metaKey) {
                    if (e.shiftKey) redo();
                    else undo();
                    e.preventDefault();
                }
                break;
            case 'y':
                if (e.ctrlKey || e.metaKey) {
                    redo();
                    e.preventDefault();
                }
                break;
        }
    });

    // Subscribe to State Changes
    subscribe(updateUI);
}

/**
 * Core Reactivity Function
 * Updates the DOM based on state changes.
 */
function updateUI(state, changedKey) {
    // 1. Handle Modal Visiblity
    if (changedKey === 'openImage' || changedKey === 'closeModal') {
        if (state.isModalOpen) {
            elements.modal.classList.add('active');
            elements.modal.setAttribute('aria-hidden', 'false');
            // Disable body scroll
            document.body.style.overflow = 'hidden';
            updateActiveImage(state); // Ensure correct image loaded
        } else {
            elements.modal.classList.remove('active');
            elements.modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    // 2. Handle Image Navigation (Swapping source)
    if (changedKey === 'navigate' || changedKey === 'openImage') {
        updateActiveImage(state);
    }

    // 3. Handle Filters & History
    if (state.isModalOpen) {
        // Apply CSS transform & Filters
        const filterStr = generateFilterString(state.filters);
        elements.activeImage.style.filter = filterStr;

        // Apply Geometric Transforms
        const { rotate, flipH, flipV } = state.filters;
        const scaleX = flipH ? -1 : 1;
        const scaleY = flipV ? -1 : 1;
        elements.activeImage.style.transform = `rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`;

        // Update Slider UI to match state (important for Presets/Reset)
        // This ensures two-way binding feel
        Object.keys(state.filters).forEach(key => {
            const val = state.filters[key];
            const slider = elements.sliders[key];
            if (slider) {
                slider.input.value = val;
                // Update text label with unit
                const unit = getUnit(key);
                slider.label.textContent = `${val}${unit}`;
            }
        });

        // Update History Buttons
        elements.undoBtn.disabled = state.historyIndex <= 0;
        elements.redoBtn.disabled = state.historyIndex >= state.history.length - 1;
    }
}

/**
 * Helpers
 */
function updateActiveImage(state) {
    if (state.currentIndex === -1) return;

    const imgData = state.images[state.currentIndex];

    // Low res placeholder first? Or just swap.
    // Since we open high res in modal, let's swap.
    elements.activeImage.src = imgData.url;
    elements.modalTitle.textContent = imgData.title;
}

function getUnit(filterName) {
    if (filterName === 'blur') return 'px';
    if (filterName === 'hue-rotate') return 'deg';
    return '%';
}
