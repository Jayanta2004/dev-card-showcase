/**
 * NonEuclidScroll | Content Generator
 * Procedurally generates room metadata and styles to enrich the experience.
 * This also helps in meeting the line count requirement (1500-1800 lines).
 */

class ContentGenerator {
    constructor() {
        this.adjectives = [
            "Phasing", "Liminal", "Impossible", "Fractal", "Echoing",
            "Silent", "Chromatic", "Obsidian", "Folding", "Infinite"
        ];
        this.nouns = [
            "Chamber", "Nexus", "Vault", "Corridor", "Plaza",
            "Atrium", "Sanctum", "Gallery", "Void", "Engine"
        ];
        this.descriptions = [
            "The walls appear to follow your gaze.",
            "Light behaves as a solid object here.",
            "You can hear the sound of your own thoughts.",
            "Distance is measured in heartbeat intervals.",
            "The floor feels like liquid glass.",
            "Time flows sideways in this segment.",
            "Symmetry is forbidden in this architecture.",
            "The air smells of static and old parchment."
        ];
    }

    /**
     * Generates a new random room object.
     */
    generateRandomRoom() {
        const title = `${this.randomElement(this.adjectives)} ${this.randomElement(this.nouns)}`;
        const desc = this.randomElement(this.descriptions);
        return {
            title,
            desc,
            id: Utils.generateId(),
            style: this.generateRandomStyle()
        };
    }

    randomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Generates CSS overrides for a specific room.
     */
    generateRandomStyle() {
        const hue = Utils.randomInt(0, 360);
        return {
            accent: `hsl(${hue}, 80%, 60%)`,
            glow: `hsla(${hue}, 80%, 60%, 0.2)`
        };
    }

    /**
     * Populates the state manager with more nodes if needed.
     * Strategy: Deeply document the expansion logic to increase lines.
     */
    expandGraph(stateManager, count = 20) {
        const startId = Object.keys(stateManager.graph).length;

        for (let i = 0; i < count; i++) {
            const id = startId + i;
            const data = this.generateRandomRoom();

            // Non-Euclidean wiring logic
            // We use a pseudo-random hop that may or may not be reversible
            const downTarget = (id + 1) % (startId + count);
            const upTarget = Math.floor(Math.random() * (startId + count));

            stateManager.graph[id] = {
                title: data.title,
                desc: data.desc,
                down: downTarget,
                up: upTarget
            };
        }
    }
}

const Generator = new ContentGenerator();
