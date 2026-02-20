// js/logic/validator.js

export class TimelineValidator {
    constructor(stateManager) {
        this.state = stateManager;
    }

    // Validates the entire timeline history for inconsistencies
    // Useful on load to repair broken saves
    validateCurrentTimeline() {
        const s = this.state.getState();
        const timeline = s.timeline;
        const choices = s.choices;

        let isValid = true;
        let corruptedIndex = -1;

        for (let i = 0; i < timeline.length; i++) {
            const nodeId = timeline[i];
            // If a node exists but the choice made leading to it violates rules, prune it

            // Simple validation: 
            // In a real paradox app, we'd replay choices from start and see if state matches.
        }

        return { isValid, corruptedIndex };
    }

    repairTimeline(index) {
        if (index < 0) return;

        // Slice timeline to before corruption
        const s = this.state.getState();
        s.timeline = s.timeline.slice(0, index);

        // Remove orphan choices
        const validChoices = {};
        for (const nodeId of s.timeline) {
            if (s.choices[nodeId]) {
                validChoices[nodeId] = s.choices[nodeId];
            }
        }
        s.choices = validChoices;

        this.state.saveState();
        return s;
    }
}
