export class MutationEngine {
    constructor() {
        // Configuration for how fast they learn
        this.learningRate = 0.5;
    }

    // Mutate based on a force vector applied by user
    evolveFromInteraction(particle, dragVector) {
        // Dragging UP (negative Y) reduces gravity
        if (dragVector.y < 0) {
            particle.dna.gravity.y += dragVector.y * this.learningRate * 0.1;
        }

        // Dragging DOWN increases gravity
        if (dragVector.y > 0) {
            particle.dna.gravity.y += dragVector.y * this.learningRate * 0.1;
        }

        // Dragging SIDEWAYS affects friction/air resistance
        // If moving fast horizontally, reduce friction (aerodynamic)
        if (Math.abs(dragVector.x) > 5) {
            particle.dna.friction = Math.min(1.0, particle.dna.friction + 0.001);
        }

        // Clamp values to prevent breaking the sim too much
        this.clampDNA(particle.dna);
        this.updateAppearance(particle);
    }

    clampDNA(dna) {
        // Gravity bounds
        dna.gravity.y = Math.max(-1000, Math.min(1000, dna.gravity.y));

        // Friction bounds
        dna.friction = Math.max(0.90, Math.min(1.01, dna.friction));
    }

    mixDNA(p1, p2) {
        // Transmission rate implies how fast rules spread
        const rate = 0.1;

        // 1. Gravity mixing
        // Tend towards the average
        const avgGx = (p1.dna.gravity.x + p2.dna.gravity.x) / 2;
        const avgGy = (p1.dna.gravity.y + p2.dna.gravity.y) / 2;

        p1.dna.gravity.x += (avgGx - p1.dna.gravity.x) * rate;
        p1.dna.gravity.y += (avgGy - p1.dna.gravity.y) * rate;
        p2.dna.gravity.x += (avgGx - p2.dna.gravity.x) * rate;
        p2.dna.gravity.y += (avgGy - p2.dna.gravity.y) * rate;

        // 2. Friction mixing
        const avgFriction = (p1.dna.friction + p2.dna.friction) / 2;
        p1.dna.friction += (avgFriction - p1.dna.friction) * rate;
        p2.dna.friction += (avgFriction - p2.dna.friction) * rate;

        // 3. Random Mutation Chance (Evolutionary drift)
        if (Math.random() < 0.05) {
            this.randomMutate(p1);
        }
        if (Math.random() < 0.05) {
            this.randomMutate(p2);
        }

        this.clampDNA(p1.dna);
        this.clampDNA(p2.dna);
        this.updateAppearance(p1);
        this.updateAppearance(p2);
    }

    randomMutate(p) {
        // Occasional random drift to prevent stagnation
        p.dna.gravity.y += (Math.random() - 0.5) * 50;
    }

    updateAppearance(particle) {
        // Visual feedback based on DNA
        // Anti-gravity (negative Y) -> Cyan/Blue
        // Heaviness (positive Y) -> Red/Orange

        const g = particle.dna.gravity.y;

        if (g < 0) {
            // Floating - Blue/Cyan
            const intensity = Math.min(100, Math.abs(g) / 5);
            particle.color = `hsla(${180 + intensity}, 80%, 60%, 1)`;
            particle.radius = 5 + intensity * 0.05; // Grow slightly when floating
        } else {
            // Falling - Red/Orange -> Green (normal)
            if (g > 600) {
                // Heavy
                particle.color = `hsla(10, 80%, 50%, 1)`;
            } else if (g < 400) {
                // Light
                particle.color = `hsla(100, 70%, 60%, 1)`;
            } else {
                // Normal
                particle.color = `hsla(150, 60%, 60%, 1)`; // Falling back to green
            }
        }
    }
}
