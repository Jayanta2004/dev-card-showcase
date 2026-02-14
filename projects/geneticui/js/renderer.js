/**
 * @file renderer.js
 * @description Advanced layout rendering engine for GeneticUI.
 * Responsible for translating Genome objects into interactive DOM elements.
 */

class Renderer {
    /**
     * Renders a layout card into the provided grid.
     * 
     * @param {Genome} genome - The genetic data to render.
     * @param {Object} callbacks - Interaction hooks (onSelect, onArchive, onCompare).
     * @returns {HTMLElement} The constructed layout card.
     */
    static renderCard(genome, { onSelect, onArchive, onCompare, onSandbox }) {
        // Create main card container
        const card = document.createElement('div');
        card.className = 'layout-card';
        card.dataset.id = genome.id;

        // Apply Genotypes to CSS Variables (Phenotype projection)
        const styles = genome.getStyleMap();
        Object.entries(styles).forEach(([prop, val]) => {
            card.style.setProperty(prop, val);
        });

        // Structure HTML
        card.innerHTML = `
            <div class="card-badges">
                ${genome.generation > 1 ? `<span class="badge gen-badge">Gen ${genome.generation}</span>` : ''}
            </div>
            
            <div class="preview-window">
                <div class="preview-content-wrapper" style="height: 100%; transition: var(--trans);">
                    ${this.getTemplateContent(genome)}
                </div>
            </div>

            <div class="card-meta">
                <div class="dna-tag">#${genome.id.split('-')[1]}</div>
                <div class="card-actions">
                    <button class="icon-btn archive-btn" title="Archive to Memory">📦</button>
                    <button class="icon-btn compare-btn" title="A/B Comparison">⚖️</button>
                    <button class="icon-btn sandbox-btn" title="Open in Sandbox">🛠️</button>
                </div>
            </div>
        `;

        // Interaction Listeners
        card.addEventListener('click', (e) => {
            // Prevent selection if clicking an action button
            if (e.target.closest('.card-actions')) return;

            card.classList.toggle('selected');
            if (onSelect) onSelect(genome, card.classList.contains('selected'));
        });

        // Action Button Listeners
        card.querySelector('.archive-btn').addEventListener('click', () => onArchive(genome));
        card.querySelector('.compare-btn').addEventListener('click', () => onCompare(genome));
        card.querySelector('.sandbox-btn').addEventListener('click', () => onSandbox(genome));

        return card;
    }

    /**
     * Resolves the appropriate template string based on genome traits.
     */
    static getTemplateContent(genome) {
        const type = genome.traits.layoutType || 'landing';
        const templateFn = UITemplates[type] || UITemplates.landing;
        return templateFn(genome.traits);
    }

    /**
     * Renders a full Sandbox view for a single genome.
     */
    static renderSandbox(genome, container) {
        container.innerHTML = '';

        const sandboxEl = document.createElement('div');
        sandboxEl.className = 'sandbox-focused';

        // Re-use card style logic for the sandbox preview
        const styles = genome.getStyleMap();
        Object.entries(styles).forEach(([prop, val]) => {
            sandboxEl.style.setProperty(prop, val);
        });

        sandboxEl.innerHTML = `
            <div class="full-preview-box" style="
                background: var(--bg-color); 
                color: var(--txt-color); 
                padding: 4rem; 
                border-radius: var(--br);
                border: var(--bw) solid var(--p-color);
                box-shadow: var(--shd);
                min-height: 400px;
                transition: var(--trans);
                position: relative;
            ">
                ${this.getTemplateContent(genome)}
            </div>
            <div class="genome-string-display">
                <h4>GENOME STRING</h4>
                <code>${genome.serialize().substring(0, 100)}...</code>
            </div>
        `;

        container.appendChild(sandboxEl);
    }

    /**
     * Notification helper UI.
     */
    static notify(message, type = 'info') {
        const area = document.getElementById('notification-area');
        const note = document.createElement('div');
        note.className = `notification ${type}`;
        note.textContent = message;

        area.appendChild(note);
        setTimeout(() => note.remove(), 3000);
    }
}
