/**
 * Time System
 * Manages calendar progression.
 */
import { store } from '../state/store.js';

export class TimeSystem {
    constructor() { }

    advanceDay() {
        store.mutate(state => {
            state.day++;
            state.tickCount++;

            // Monthly triggers?
            if (state.day % 30 === 0) {
                this.triggerMonthly(state);
            }
        });
    }

    triggerMonthly(state) {
        console.log('End of Month Processing...');
        // Pay salaries
        // Calculate monthly report
    }
}
