/**
 * Market System
 * Handles demand, competition, and external factors.
 */
import { store } from '../state/store.js';

export class MarketSystem {
    update() {
        const state = store.get();

        // Market fluctuates slowly
        // Every 5 days maybe trigger a trend change?
        // For now, random walk

        if (state.day % 1 === 0) {
            store.mutate(s => {
                const change = (Math.random() - 0.5) * 2; // -1 to 1
                s.demand = Math.max(0, Math.min(100, s.demand + change));
            });
        }
    }
}
