/**
 * @file app.js
 * @package GeneticUI.Main
 * @description 
 * The App class serves as the central nervous system of the GeneticUI platform.
 * It coordinates the flow of data between the GeneticEngine (logic), 
 * the Renderer (view), and the UIManager (state).
 * 
 * ARCHITECTURAL OVERVIEW:
 * - Event-Driven: Responds to user breeding and selection commands.
 * - Reactive Rendering: Population changes trigger automatic UI updates.
 * - Modular Design: Logic is separated into Genome, Engine, and UI components.
 * 
 * WORKFLOW:
 * 1. Initialize core engines and UI shell.
 * 2. Generate initial random design population.
 * 3. Capture user selection (fitness assignment).
 * 4. Trigger breeding cycle to produce next generation.
 * 
 * @author GeneticUI Lab
 * @version 2.2.0
 */

class App {
    /**
     * @constructor
     * Prepares the genetic environment and binds interface elements.
     */
    constructor() {
        // --- Population State ---
        /** @type {number} Total layouts per generation */
        this.populationSize = 8;

        /** @type {number} Current generational tick */
        this.generationCount = 1;

        /** @type {Array<Genome>} Active set of design organisms */
        this.currentPopulation = [];

        /** @type {Set<Genome>} Set of parents selected for the next evolutionary step */
        this.selectedGenomes = new Set();

        // --- Core Modules ---
        /** @type {GeneticEngine} */
        this.engine = new GeneticEngine(0.15);
        /** @type {UIManager} */
        this.ui = new UIManager();

        // --- DOM Cache ---
        this.grid = document.getElementById('generation-grid');
        this.evolveBtn = document.getElementById('evolve-btn');
        this.genDisplay = document.getElementById('gen-count');
        this.mutationSlider = document.getElementById('mutation-rate');
        this.mutationVal = document.getElementById('mutation-val');

        this.init();
    }

    /**
     * Initializes the application.
     */
    init() {
        // Listeners
        this.evolveBtn.addEventListener('click', () => this.evolve());

        this.mutationSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            this.engine.mutationRate = val / 100;
            this.mutationVal.textContent = `${val}%`;
        });

        // Setup "DNA View" resolution switching
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const res = btn.dataset.res;
                this.grid.className = `generation-grid view-${res}`;
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Generate and initial render
        this.spawnInitialGeneration();
        this.renderPopulation();

        Renderer.notify("GeneticUI v2.0 Ready", "success");
        console.log("🧬 Genetic Environment Initialized");
    }

    /**
     * Creates the very first set of random genomes.
     */
    spawnInitialGeneration() {
        this.currentPopulation = Array.from(
            { length: this.populationSize },
            () => new Genome()
        );
    }

    /**
     * User selection hook.
     * @param {Genome} genome 
     * @param {boolean} isSelected 
     */
    handleSelection(genome, isSelected) {
        if (isSelected) {
            this.selectedGenomes.add(genome);
        } else {
            this.selectedGenomes.delete(genome);
        }

        // Contextual button updates
        const count = this.selectedGenomes.size;
        this.evolveBtn.textContent = count > 0 ?
            `Breed ${count} Parents` :
            'Generate Randomly';

        this.evolveBtn.classList.toggle('pulse', count > 0);
    }

    /**
     * Triggers the breeding cycle.
     */
    evolve() {
        // 1. Breed
        const parents = Array.from(this.selectedGenomes);
        this.currentPopulation = this.engine.breedNextGeneration(parents, this.populationSize);

        // 2. Increment
        this.generationCount++;
        this.genDisplay.textContent = this.generationCount;

        // 3. Clear Selections
        this.selectedGenomes.clear();
        this.evolveBtn.textContent = 'Breed Next Gen';

        // 4. Animate and Render
        this.grid.style.opacity = '0';
        this.grid.style.transform = 'translateY(10px)';

        setTimeout(() => {
            this.renderPopulation();
            this.grid.style.opacity = '1';
            this.grid.style.transform = 'translateY(0)';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);

        Renderer.notify(`Generation ${this.generationCount} successfully bred`);
    }

    /**
     * Maps the population to the DOM.
     */
    renderPopulation() {
        this.grid.innerHTML = '';

        this.currentPopulation.forEach(genome => {
            const card = Renderer.renderCard(genome, {
                onSelect: (g, s) => this.handleSelection(g, s),
                onArchive: (g) => this.ui.saveToGallery(g),
                onCompare: (g) => this.ui.openComparison(g),
                onSandbox: (g) => this.ui.openSandbox(g)
            });
            this.grid.appendChild(card);
        });
    }

    /**
     * Global export utility
     */
    exportDNA() {
        const dna = Array.from(this.selectedGenomes).map(g => g.serialize());
        const blob = new Blob([JSON.stringify(dna)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genetic-ui-ancestry-gen-${this.generationCount}.json`;
        a.click();
    }
}

// Bootstrap
window.addEventListener('load', () => {
    // Inject custom scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    window.app = new App();
});
