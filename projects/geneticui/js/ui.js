/**
 * @file ui.js
 * @package GeneticUI.Interface
 * @description 
 * The UIManager is the primary controller for the application's visual state.
 * It manages transitions between different views (Evolution, Gallery, Sandbox),
 * handles user interactions with modals, and provides a persistent storage 
 * interface for the design lineage memory.
 * 
 * CORE RESPONSIBILITIES:
 * 1. View Orchestration: Managing the visibility of different application containers.
 * 2. Genetic Memory: Interfacing with LocalStorage to save and retrieve prized genomes.
 * 3. Interaction Mapping: Routing button clicks to engine or renderer methods.
 * 4. Lineage Visualization: Drawing animated representations of genetic sequences.
 * 
 * @author GeneticUI Lab
 * @version 2.0.0
 */

class UIManager {
    /**
     * @constructor
     * Initializing the UI subsystem and loading cached design memory.
     */
    constructor() {
        /** @type {Array<Genome>} The pool of saved designs */
        this.gallery = this.loadGallery();

        /** @type {string} Current view context */
        this.activeView = 'evolution';

        // Lifecycle methods
        this.setupViewToggles();
        this.setupModals();
        this.initLineageCanvas();
    }

    /**
     * persistent storage for the "Genetic Memory" gallery.
     */
    loadGallery() {
        const stored = localStorage.getItem('genetic_gallery');
        if (!stored) return [];
        try {
            const data = JSON.parse(stored);
            return data.map(json => Genome.deserialize(json));
        } catch (e) {
            console.error("Failed to load gallery", e);
            return [];
        }
    }

    saveToGallery(genome) {
        // Prevent duplicates
        if (this.gallery.some(g => g.id === genome.id)) {
            Renderer.notify("Genome already in memory", "info");
            return;
        }

        this.gallery.push(genome);
        localStorage.setItem('genetic_gallery', JSON.stringify(this.gallery.map(g => g.serialize())));
        Renderer.notify("Saved to Genetic Memory", "success");
    }

    /**
     * View Switching Logic
     */
    setupViewToggles() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);

                // Update active state
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Resolution toggles
        const resBtns = document.querySelectorAll('.view-btn');
        const grid = document.getElementById('generation-grid');
        resBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const res = btn.dataset.res;
                grid.className = `generation-grid view-${res}`;
                resBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    switchView(viewId) {
        document.querySelectorAll('.view-container').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`view-${viewId}`);
        if (target) {
            target.classList.add('active');
            this.activeView = viewId;

            // Trigger specific view logic
            if (viewId === 'gallery') this.renderGallery();
        }
    }

    renderGallery() {
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '';
        this.gallery.forEach(genome => {
            const card = Renderer.renderCard(genome, {
                onSelect: () => { }, // Gallery cards are display-only or sandbox-entry
                onArchive: () => this.removeFromGallery(genome),
                onCompare: (g) => this.openComparison(g),
                onSandbox: (g) => this.openSandbox(g)
            });
            grid.appendChild(card);
        });
    }

    removeFromGallery(genome) {
        this.gallery = this.gallery.filter(g => g.id !== genome.id);
        localStorage.setItem('genetic_gallery', JSON.stringify(this.gallery.map(g => g.serialize())));
        this.renderGallery();
        Renderer.notify("Removed from memory", "info");
    }

    /**
     * Modal Management
     */
    setupModals() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.querySelector('.close-modal');

        closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    }

    openComparison(genomeA) {
        const overlay = document.getElementById('modal-overlay');
        const slots = document.getElementById('comparison-slots');
        slots.innerHTML = '';
        overlay.classList.remove('hidden');

        // Render target A
        const cardA = Renderer.renderCard(genomeA, {});
        slots.appendChild(cardA);

        // Find a comparison target (randomly from population or gallery)
        // This is a placeholder for a more complex "Selective Comparison" feature
    }

    openSandbox(genome) {
        this.switchView('sandbox');
        const controls = document.querySelectorAll('.nav-btn');
        controls.forEach(b => {
            b.classList.remove('active');
            if (btn.dataset.view === 'sandbox') btn.classList.add('active');
        });
        Renderer.renderSandbox(genome, document.getElementById('sandbox-preview-container'));
        this.renderSandboxControls(genome);
    }

    renderSandboxControls(genome) {
        const list = document.getElementById('lock-list');
        list.innerHTML = '';

        Object.keys(genome.traits).forEach(trait => {
            const div = document.createElement('div');
            div.className = 'lock-item';
            div.innerHTML = `
                <input type="checkbox" id="lock-${trait}" ${genome.lockedTraits[trait] ? 'checked' : ''}>
                <label for="lock-${trait}">${trait}</label>
            `;
            div.querySelector('input').addEventListener('change', (e) => {
                genome.lockedTraits[trait] = e.target.checked;
            });
            list.appendChild(div);
        });
    }

    /**
     * Lineage Visualization (Simple Canvas DNA visualization)
     */
    initLineageCanvas() {
        this.canvas = document.getElementById('lineage-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawDNA();
    }

    drawDNA() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = '#00a3ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < w; i++) {
            const y = h / 2 + Math.sin(i * 0.05 + Date.now() * 0.002) * 20;
            const y2 = h / 2 + Math.sin(i * 0.05 + Math.PI + Date.now() * 0.002) * 20;

            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);

            if (i % 20 === 0) {
                ctx.moveTo(i, y);
                ctx.lineTo(i, y2);
            }
        }
        ctx.stroke();
        requestAnimationFrame(() => this.drawDNA());
    }
}
