import { CONSTANTS } from '../constants.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.playerScore = 0;
        this.cpuScore = 0;
        this.playerHistory = []; // ['GOAL', 'MISS', ...]
        this.cpuHistory = [];
        this.currentRound = 1;
        this.turn = 'PLAYER'; // PLAYER or CPU
        this.isSuddenDeath = false;
        this.matchOver = false;
        this.winner = null;
    }

    recordResult(who, result) {
        if (who === 'PLAYER') {
            this.playerHistory.push(result);
            if (result === 'GOAL') this.playerScore++;
        } else {
            this.cpuHistory.push(result);
            if (result === 'GOAL') this.cpuScore++;
        }
    }

    nextTurn() {
        if (this.matchOver) return null;

        if (this.turn === 'PLAYER') {
            this.turn = 'CPU';
        } else {
            this.turn = 'PLAYER';
            this.currentRound++;
        }

        this.checkWinCondition();
        return this.turn;
    }

    checkWinCondition() {
        const pGoals = this.playerScore;
        const cGoals = this.cpuScore;
        const pShots = this.playerHistory.length;
        const cShots = this.cpuHistory.length;
        const total = CONSTANTS.GAME.TOTAL_ROUNDS;

        // Regular Rounds Logic (First 5)
        if (pShots <= total || cShots <= total) {
            const pRemaining = total - pShots;
            const cRemaining = total - cShots;

            // Mathematical win check (if opponent can't catch up)
            // If player has 3, CPU has 0, and CPU has 2 shots left -> CPU max 2 -> 3 > 2. Player Wins.
            // Note: We only check pairs effectively? usually penalty mechanism is strict.
            // Let's stick to simple "End of 5 pairs" unless mathematical impossibility.

            // Check Impossibility
            if (pGoals > cGoals + cRemaining) {
                this.endMatch('PLAYER');
                return;
            }
            if (cGoals > pGoals + pRemaining) {
                this.endMatch('CPU');
                return;
            }

            // End of 5 rounds
            if (pShots === total && cShots === total) {
                if (pGoals > cGoals) this.endMatch('PLAYER');
                else if (cGoals > pGoals) this.endMatch('CPU');
                else this.isSuddenDeath = true; // Draw -> Sudden Death
            }
        } else {
            // Sudden Death
            // Continued pairs. If logic is equal shots:
            if (pShots === cShots) {
                if (pGoals > cGoals) this.endMatch('PLAYER');
                else if (cGoals > pGoals) this.endMatch('CPU');
            }
        }
    }

    endMatch(winner) {
        this.matchOver = true;
        this.winner = winner;
    }
}
