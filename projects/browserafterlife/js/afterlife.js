
export class AfterlifeStorage {
    constructor() {
        this.STORAGE_KEY = 'browser_afterlife_graveyard';
        this.MAX_GHOSTS = 10;
    }

    bury(soul) {
        if (!soul) return;

        // Calculate final age
        const age = Math.floor((Date.now() - soul.born) / 1000);

        const ghostData = {
            name: soul.name,
            hash: soul.hash,
            born: soul.born,
            color: soul.color, // Preserved
            personality: soul.personality,
            age: age,
            diedAt: Date.now()
        };

        const graveyard = this.getGraveyard();
        graveyard.push(ghostData);

        // Keep population under control (remove oldest)
        if (graveyard.length > this.MAX_GHOSTS) {
            graveyard.shift();
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(graveyard));
        console.log(`${soul.name} has crossed over.`);
    }

    summon() {
        return this.getGraveyard();
    }

    getGraveyard() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
}
