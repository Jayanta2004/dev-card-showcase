/**
 * Product System
 * Handles R&D and Product Quality.
 */
import { store } from '../state/store.js';

export class ProductSystem {
    update() {
        const state = store.get();
        if (state.day % 1 !== 0) return;

        // R&D Progress
        if (state.product.rdInvestment > 0) {
            store.mutate(s => {
                // Progress based on investment and employee skill (simplified to just money for now)
                // Base progress = investment / 1000
                const progress = (s.product.rdInvestment / 1000) * (1 + (s.employees.length * 0.05));
                s.product.rdProgress += progress;

                // Check for Level Up
                if (s.product.rdProgress >= 100) {
                    s.product.version++;
                    s.product.quality += 10;
                    s.product.features++;
                    s.product.rdProgress = 0;
                    s.demand += 15; // Big boost

                    store.addEventLog({
                        type: 'good',
                        message: `Product Upgraded to v${s.product.version}.0! Quality +10, Demand +15`,
                        timestamp: s.day
                    });
                }
            });
        }
    }

    setInvestment(amount) {
        store.mutate(s => {
            s.product.rdInvestment = amount;
        });
    }
}
