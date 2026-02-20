/**
 * Scheduler Logic
 * Handles task prioritizing and suitability calculations
 */
const Scheduler = {

    ENERGY_VALUES: {
        'low': 25,
        'medium': 50,
        'high': 85
    },

    /**
     * Calculate how well a task fits the current energy level
     * @param {Object} task 
     * @param {number} currentEnergy 
     * @returns {number} Score 0-100
     */
    calculateSuitability: (task, currentEnergy) => {
        const requiredEnergy = Scheduler.ENERGY_VALUES[task.energy] || 50;

        // Difference
        const diff = Math.abs(currentEnergy - requiredEnergy);

        // Base score: 100 minus the difference
        let score = 100 - diff;

        // Penalize mismatched "High Energy" tasks heavily when energy is Low
        // It's worse to do a hard task when tired than an easy task when energetic
        if (task.energy === 'high' && currentEnergy < 40) {
            score -= 30;
        }

        // Feature 4: Vibe Matching
        // If a vibe is set and task has a vibe, boost score if match, penalize if not
        if (task.vibe && window.State && window.State.data.currentVibe !== 'any') {
            if (task.vibe === window.State.data.currentVibe) {
                score += 15;
            } else {
                score -= 10;
            }
        }

        return Math.max(0, Math.min(100, score));
    },

    /**
     * Feature 3: Suggest best time today for a high energy task
     */
    findBestSlotFor(taskEnergy) {
        if (!window.State) return null;
        const curve = window.State.data.energyCurve;
        const currentHour = new Date().getHours();

        // Look ahead
        const future = curve.filter(p => p.hour > currentHour);
        if (future.length === 0) return 'Tomorrow';

        // Find peak match
        const req = Scheduler.ENERGY_VALUES[taskEnergy];
        const best = future.reduce((prev, curr) => {
            return (Math.abs(curr.level - req) < Math.abs(prev.level - req)) ? curr : prev;
        });

        return `${best.hour}:00`;
    },

    /**
     * Sort tasks based on suitability for current energy
     * @param {Array} tasks 
     * @param {number} currentEnergy 
     * @returns {Array} Sorted tasks
     */
    sortTasks: (tasks, currentEnergy) => {
        // Create a copy to avoid mutating state directly in place (though State manager handles replacment)
        const activeTasks = tasks.filter(t => t.status !== 'completed');

        return activeTasks.sort((a, b) => {
            const scoreA = Scheduler.calculateSuitability(a, currentEnergy);
            const scoreB = Scheduler.calculateSuitability(b, currentEnergy);

            // Primary sort: Suitability (Desc)
            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }

            // Secondary sort: High priority tasks first (if we had priority field, assuming High Energy tasks might be more critical?)
            // Actually, let's keep original creation order as tiebreaker
            return 0;
        });
    },

    /**
     * Get the single best task recommendation
     * @param {Array} tasks 
     * @param {number} currentEnergy 
     * @returns {Object|null}
     */
    getRecommendedTask: (tasks, currentEnergy) => {
        const sorted = Scheduler.sortTasks(tasks, currentEnergy);
        if (sorted.length === 0) return null;

        // Only recommend if the score is decent (> 50)
        const best = sorted[0];
        const score = Scheduler.calculateSuitability(best, currentEnergy);

        if (score < 40) {
            // If the best match is still bad (e.g. only High Energy tasks exist but user has 10% energy)
            return { ...best, warning: true, score };
        }

        return { ...best, warning: false, score };
    },

    /**
     * Get statistics for the dashboard
     */
    getStats: (tasks) => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const remaining = total - completed;
        return { total, completed, remaining };
    }
};

window.Scheduler = Scheduler;
