import { PatternRecognizer } from './PatternRecognizer.js';
import { CONSTANTS } from '../constants.js';

export class AIBrain {
    constructor() {
        this.recognizer = new PatternRecognizer();
        this.difficulty = 1.0; // 0.5 (Easy) to 1.5 (Hard)
    }

    notifyShotResult(aim, power, result) {
        this.recognizer.recordShot(aim, power, result);
    }

    processShot(shotVector, shotPower) {
        const prediction = this.recognizer.getPrediction();
        const reactionBase = CONSTANTS.GAME.KEEPER_REACTION_BASE; // 300ms

        // Calculate Reaction Delay
        // Higher difficulty -> Lower reaction time
        // Higher Shot Power -> Harder to save (doesn't affect reaction time but affects success)

        let reactionDelay = reactionBase / this.difficulty;

        // Random variance
        reactionDelay += (Math.random() * 100 - 50);

        // Anticipation Bonus: If predicted correctly, reduce delay significantly
        let anticipated = false;
        let anticipatedDir = 0;

        if (prediction) {
            // Check if actual shot matches prediction
            if ((prediction === 'LEFT' && shotVector.x < -0.3) ||
                (prediction === 'RIGHT' && shotVector.x > 0.3)) {
                // Correct guess! Fast reaction.
                reactionDelay -= 150;
                anticipated = true;
            } else if (prediction) {
                // Wrong guess! Penalty.
                reactionDelay += 100;
            }
        }

        // Cap minimum human reaction limit (approx 150ms)
        reactionDelay = Math.max(100, reactionDelay);

        return {
            delay: reactionDelay,
            anticipated: anticipated,
            targetLimit: this.calculateSaveProbability(shotVector, shotPower, anticipated)
        };
    }

    calculateSaveProbability(shotVector, shotPower, anticipated) {
        // Return a 'Success Threshold'
        // If the shot is perfectly in the corner and high power, chance is low.

        // Distance from center
        const dist = Math.abs(shotVector.x);
        const powerFactor = shotPower; // 0 to 1

        let successChance = 0.8; // Base chance to save

        if (dist > 0.8) successChance -= 0.3; // Corner shot
        if (powerFactor > 0.8) successChance -= 0.2; // Power shot
        if (anticipated) successChance += 0.4;

        return Math.min(0.95, Math.max(0.1, successChance));
    }
}
