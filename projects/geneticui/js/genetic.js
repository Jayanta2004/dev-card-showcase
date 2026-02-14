/**
 * @file genetic.js
 * @package GeneticUI.Evolution
 * @description 
 * The GeneticEngine is the orchestrator of the evolutionary design cycle.
 * It implements standard Genetic Algorithm (GA) procedures: Selection, 
 * Crossover, and Mutation, tailored specifically for CSS variables.
 * 
 * EVOLUTIONARY STRATEGY:
 * 1. Elitism: The fittest individuals (those selected by the user) are 
 *    preserved unchanged to prevent regression in the design quality.
 * 2. Uniform Crossover: Genes are swapped with a 60/40 bias toward the 
 *    primary parent, allowing for stable trait inheritance.
 * 3. Mutation Pressure: Random drift is applied to ensure the search space 
 *    remains broad and avoids local optima (design stagnation).
 * 4. Diversity Meta-Logic: Offspring that are too twin-like are discarded 
 *    to maintain a vibrant and variable design population.
 * 
 * @author GeneticUI Lab
 * @version 2.0.0
 */

class GeneticEngine {
    /**
     * @constructor
     * @param {number} [mutationRate=0.15] - Probability of a gene mutating (0.0 to 1.0).
     * High mutation rates lead to chaotic variation; low rates lead to subtle refinement.
     */
    constructor(mutationRate = 0.15) {
        /** @type {number} The active mutation coefficient. Adjust via slider in UI. */
        this.mutationRate = mutationRate;

        /** @type {number} Number of top-tier individuals to preserve. */
        this.elitismCount = 2;

        /** @type {number} Minimum genetic distance for sibling diversity. */
        this.diversityThreshold = 0.1;
    }

    /**
     * Performs Crossover between two parent genomes.
     * Respects locked traits in Parent A (the primary parent).
     * 
     * @param {Genome} parentA - Primary parent.
     * @param {Genome} parentB - Secondary parent.
     * @returns {Genome} New offspring.
     */
    crossover(parentA, parentB) {
        const childTraits = {};
        const keys = Object.keys(parentA.traits);

        keys.forEach(key => {
            // Respect trait locking from parent A
            if (parentA.lockedTraits[key]) {
                childTraits[key] = parentA.traits[key];
                return;
            }

            // Standard crossover: Uniform selection
            // We give a slight preference (60%) to parent A
            childTraits[key] = Math.random() < 0.6 ?
                parentA.traits[key] :
                parentB.traits[key];
        });

        const child = new Genome(childTraits, parentA.id);
        child.generation = Math.max(parentA.generation, parentB.generation) + 1;

        return child;
    }

    /**
     * Randomly mutates a genome's traits based on the global mutation rate.
     * 
     * @param {Genome} genome - The individual to mutate.
     * @returns {Genome} The mutated individual.
     */
    mutate(genome) {
        const traits = { ...genome.traits };
        const keys = Object.keys(traits);

        keys.forEach(key => {
            // Skip locked traits
            if (genome.lockedTraits[key]) return;

            if (Math.random() < this.mutationRate) {
                const val = traits[key];

                if (typeof val === 'number') {
                    // Precision-based drift
                    const driftRange = key.includes('Hue') ? 40 : 15;
                    const drift = (Math.random() - 0.5) * driftRange;
                    traits[key] = val + drift;

                    // Clamping and cycling
                    if (key.includes('Hue')) {
                        traits[key] = (traits[key] + 360) % 360;
                    } else if (key.includes('Saturation') || key.includes('Lightness')) {
                        traits[key] = Math.max(0, Math.min(100, traits[key]));
                    }
                }
                else if (typeof val === 'boolean') {
                    traits[key] = !val;
                }
                else {
                    // Categorical mutation: Pick new random choice
                    // This uses a temporary genome instance to get a fresh random trait
                    const temp = new Genome();
                    traits[key] = temp.traits[key];
                }
            }
        });

        // Update traits and return
        return new Genome(traits, genome.parentId);
    }

    /**
     * Calculates the "distance" (difference) between two genomes.
     * Useful for maintaining population diversity.
     */
    calculateDistance(g1, g2) {
        let diff = 0;
        const keys = Object.keys(g1.traits);

        keys.forEach(key => {
            if (g1.traits[key] !== g2.traits[key]) diff++;
        });

        return diff / keys.length;
    }

    /**
     * Core evolutionary cycle.
     * 
     * @param {Array<Genome>} selected - Set of user-favored individuals.
     * @param {number} populationSize - Total size for the next generation.
     * @returns {Array<Genome>} New generation population.
     */
    breedNextGeneration(selected, populationSize) {
        // SCENARIO 0: No selection - Full restart
        if (selected.length === 0) {
            return Array.from({ length: populationSize }, () => new Genome());
        }

        const nextGen = [];

        // 1. ELITISM: Ensure our favorites survive unchanged
        selected.forEach(s => {
            if (nextGen.length < this.elitismCount) {
                // Clone with incremented generation
                const elite = new Genome(s.traits, s.id);
                elite.generation = s.generation + 1;
                nextGen.push(elite);
            }
        });

        // 2. REPRODUCTION: Fill remaining slots with offspring
        while (nextGen.length < populationSize) {
            // Select parents from favored pool
            const p1 = selected[Math.floor(Math.random() * selected.length)];
            const p2 = selected[Math.floor(Math.random() * selected.length)];

            let offspring;

            // If p1 and p2 are the same, we simply mutate p1
            if (p1.id === p2.id) {
                offspring = this.mutate(p1);
            } else {
                offspring = this.crossover(p1, p2);
                offspring = this.mutate(offspring);
            }

            // Optional: Diversity check
            // We discard offspring that are too similar to existing gen unless pool is small
            if (selected.length > 2) {
                const isTooSimilar = nextGen.some(ind => this.calculateDistance(ind, offspring) < this.diversityThreshold);
                if (isTooSimilar && Math.random() > 0.3) continue;
            }

            nextGen.push(offspring);
        }

        return nextGen;
    }
}
