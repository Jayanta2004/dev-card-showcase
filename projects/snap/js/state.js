/**
 * state.js
 * Central application state management.
 * Uses a simple Pub/Sub pattern for state changes.
 */

// Initial default state
const DEFAULT_FILTERS = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    'hue-rotate': 0,
    invert: 0,
    rotate: 0,
    flipH: false,
    flipV: false
};

const state = {
    images: [],          // Array of image objects
    currentIndex: -1,    // Currently selected image index
    filters: { ...DEFAULT_FILTERS }, // Current active filters
    isModalOpen: false,
    viewMode: 'grid',    // 'grid' or 'list'
    sortOrder: 'default',

    // History Tracking
    history: [],
    historyIndex: -1,
    favorites: new Set()
};

const listeners = [];

/**
 * Subscribe to state changes.
 * @param {Function} callback 
 */
export function subscribe(callback) {
    listeners.push(callback);
}

/**
 * Notify all listeners of a state change.
 * @param {string} changedKey - The key that changed (optional hint)
 */
function notify(changedKey = null) {
    listeners.forEach(cb => cb(state, changedKey));
}

// --- History Helpers ---

function pushHistory() {
    // If we are in the middle of the history, slice off the future
    if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
    }

    // Push copy of current filters
    state.history.push({ ...state.filters });
    state.historyIndex++;

    // Limit history size to 50
    if (state.history.length > 50) {
        state.history.shift();
        state.historyIndex--;
    }

    notify('history');
}

// --- Actions ---

/**
 * Set the gallery images data.
 * @param {Array} images 
 */
export function setImages(images) {
    state.images = images;
    notify('images');
}

/**
 * Add new images to the gallery.
 * @param {Array} newImages 
 */
export function addImages(newImages) {
    state.images = [...newImages, ...state.images];
    notify('images');
}

/**
 * Open the modal with a specific image index.
 * @param {number} index 
 */
export function openImage(index) {
    if (index >= 0 && index < state.images.length) {
        state.currentIndex = index;
        state.isModalOpen = true;

        // Initialize history with current state if empty or new session logic needed
        // For now, we keep global history for the session or clear it? 
        // Let's clear history on new image open to avoid undoing into previous image's edits?
        // User requirement: "gallery should maintain state... filters are not lost".
        // So we KEEP filters. But maybe we should reset History stack so 'Undo' doesn't just do nothing?
        // Actually, if we keep filters, we should push the initial state to history.

        if (state.history.length === 0) {
            pushHistory();
        }

        notify('openImage');
    }
}

/**
 * Close the modal.
 */
export function closeModal() {
    state.isModalOpen = false;
    notify('closeModal');
}

/**
 * update a specific filter value.
 * @param {string} name - Filter name (e.g., 'brightness')
 * @param {number} value - New value
 * @param {boolean} addToHistory - Whether to record this change in history (avoid spamming on drag)
 */
export function updateFilter(name, value, addToHistory = false) {
    if (state.filters.hasOwnProperty(name)) {
        state.filters[name] = parseFloat(value);
        if (addToHistory) {
            pushHistory();
        }
        notify('filters');
    }
}

/**
 * Reset all filters to default.
 */
export function resetFilters() {
    state.filters = { ...DEFAULT_FILTERS };
    pushHistory();
    notify('filters');
}

/**
 * Navigate to next/prev image.
 * @param {number} direction - 1 for next, -1 for prev
 */
export function navigateImage(direction) {
    if (!state.isModalOpen) return;

    const newIndex = state.currentIndex + direction;
    if (newIndex >= 0 && newIndex < state.images.length) {
        state.currentIndex = newIndex;
        notify('navigate');
    }
}

/**
 * Toggle favorite status of an image.
 * @param {string} id 
 */
export function toggleFavorite(id) {
    if (state.favorites.has(id)) {
        state.favorites.delete(id);
    } else {
        state.favorites.add(id);
    }
    // Persist to local storage (Mock)
    try {
        localStorage.setItem('snap_favorites', JSON.stringify([...state.favorites]));
    } catch (e) { }

    notify('favorites');
}

/**
 * Load favorites from storage.
 */
export function loadFavorites() {
    try {
        const stored = localStorage.getItem('snap_favorites');
        if (stored) {
            state.favorites = new Set(JSON.parse(stored));
            notify('favorites');
        }
    } catch (e) { }
}

/**
 * Set sort order.
 * @param {string} order - 'default', 'az', 'za'
 */
export function setSortOrder(order) {
    state.sortOrder = order;
    notify('sort');
}

/**
 * Undo last action.
 */
export function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        state.filters = { ...state.history[state.historyIndex] };
        notify('filters');
        notify('history');
    }
}

/**
 * Redo last action.
 */
export function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.filters = { ...state.history[state.historyIndex] };
        notify('filters');
        notify('history');
    }
}

/**
 * Get current state snapshot (read-only).
 */
export function getState() {
    return { ...state };
}

/**
 * Apply a preset to the filters.
 * @param {Object} presetValues 
 */
export function applyPreset(presetValues) {
    state.filters = { ...DEFAULT_FILTERS, ...presetValues };
    pushHistory();
    notify('filters');
}

export const DEFAULTS = DEFAULT_FILTERS;
