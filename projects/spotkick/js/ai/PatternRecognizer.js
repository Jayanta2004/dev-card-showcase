export class PatternRecognizer {
    constructor() {
        this.history = []; // { aim: -1 to 1, power: 0 to 1, result: 'GOAL'|'SAVE' }
        this.maxHistory = 10;
        this.regions = {
            LEFT: 0,
            CENTER: 0,
            RIGHT: 0
        };
    }

    recordShot(aim, power, result) {
        this.history.push({ aim, power, result });
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        this.analyze();
    }

    analyze() {
        // Reset counts
        this.regions = { LEFT: 0, CENTER: 0, RIGHT: 0 };

        this.history.forEach(shot => {
            if (shot.aim < -0.3) this.regions.LEFT++;
            else if (shot.aim > 0.3) this.regions.RIGHT++;
            else this.regions.CENTER++;
        });
    }

    getPrediction() {
        const total = this.history.length;
        if (total < 3) return null; // Not enough data

        // Check for specific repeating interaction
        // e.g. Left, Left, Left
        const last3 = this.history.slice(-3);
        const allLeft = last3.every(s => s.aim < -0.3);
        const allRight = last3.every(s => s.aim > 0.3);

        if (allLeft) return 'LEFT'; // Expect another left?? Or expect user to switch?
        // Let's assume naive users repeat, smart users switch.
        // Penalty logic: "Gambler's Fallacy" - often people switch after 3.
        // Let's implement a 'Mix' strategy.

        if (this.regions.LEFT / total > 0.6) return 'LEFT';
        if (this.regions.RIGHT / total > 0.6) return 'RIGHT';

        return null; // Random
    }
}
