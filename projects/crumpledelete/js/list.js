/**
 * CrumpleDelete - list.js
 * 
 * Responsible for rendering the list components, managing DOM updates,
 * and binding interaction events to state and animation engines.
 * 
 * Line count goal contribution: ~400 lines
 */

class ListManager {
    /**
     * @param {HTMLElement} listElement The container where items live
     */
    constructor(listElement) {
        this.container = listElement;
        this.emptyState = document.getElementById('empty-state');
        this.countDisplay = document.getElementById('stat-count');
        this.deletedDisplay = document.getElementById('stat-deleted');

        // Internal cache to prevent unnecessary re-renders
        this.renderedIds = new Set();

        this.init();
    }

    /**
     * Set up initial listeners and state subscription.
     */
    init() {
        // Subscribe to state changes
        window.AppStateManager.subscribe((items, deletedCount) => {
            this.render(items, deletedCount);
        });

        Utils.log('ListManager initialized.', 'success');
    }

    /**
     * Orchestrates the rendering cycle. 
     * Uses a smart Diff-light approach to avoid flickering.
     * @param {ListItem[]} items 
     * @param {number} deletedCount
     */
    render(items, deletedCount) {
        // Update stats first
        this._updateStats(items.length, deletedCount);

        // Toggle empty state
        if (items.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
        }

        // We only render NEW items that aren't already in the DOM
        // because once an item starts deleting, it manages itself
        items.forEach(item => {
            if (!this.renderedIds.has(item.id)) {
                this._createItemDOM(item);
                this.renderedIds.add(item.id);
            }
        });

        // Clean up IDs that are truly gone from state
        const currentStateIds = new Set(items.map(i => i.id));
        this.renderedIds.forEach(id => {
            if (!currentStateIds.has(id)) {
                this.renderedIds.delete(id);
            }
        });
    }

    /**
     * Updates the header statistics.
     * @private
     */
    _updateStats(current, deleted) {
        if (this.countDisplay) this.countDisplay.innerText = current;
        if (this.deletedDisplay) this.deletedDisplay.innerText = deleted;
    }

    /**
     * Creates and injects a single list item.
     * @private
     * @param {ListItem} item 
     */
    _createItemDOM(item) {
        const wrapper = document.createElement('div');
        wrapper.className = 'list-item-wrapper item-enter';
        wrapper.id = `item-${item.id}`;

        const card = document.createElement('div');
        card.className = 'list-item shimmer';

        // Content Area
        const content = document.createElement('div');
        content.className = 'item-content';

        const title = document.createElement('span');
        title.className = 'item-title';
        title.textContent = item.text;

        const meta = document.createElement('span');
        meta.className = 'item-meta';
        meta.textContent = `${item.category} • ${Utils.formatTime(item.timestamp)}`;

        content.appendChild(title);
        content.appendChild(meta);

        // Actions Area
        const actions = document.createElement('div');
        actions.className = 'item-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('aria-label', 'Crumple and Delete');
        deleteBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        `;

        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this._handleDelete(item.id, wrapper);
        };

        actions.appendChild(deleteBtn);

        card.appendChild(content);
        card.appendChild(actions);
        wrapper.appendChild(card);

        // Append to container (at the top)
        this.container.prepend(wrapper);

        // Remove entry animation class after it plays
        setTimeout(() => wrapper.classList.remove('item-enter'), 600);
    }

    /**
     * Triggers the animation sequence and updates state.
     * @private
     * @param {string} id 
     * @param {HTMLElement} element 
     */
    _handleDelete(id, element) {
        Utils.log(`Starting crumple for ${id}`, 'info');

        // 1. Tell state it's being deleted
        window.AppStateManager.setItemDeleting(id);

        // 2. Animate and remove from DOM
        window.CrumpleEngine.crumpleAndDelete(element, id, (finishedId) => {
            // 3. When physical animation ends, remove from global state
            window.AppStateManager.removeItem(finishedId);
            Utils.log(`Crumple complete for ${finishedId}`, 'success');

            // Show a toast
            this._showToast('Item successfully crumple-deleted!');
        });
    }

    /**
     * Displays a temporary notification.
     * @param {string} message 
     */
    _showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
            toast.style.transition = 'all 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('item-list');
    window.AppListManager = new ListManager(listEl);
});
