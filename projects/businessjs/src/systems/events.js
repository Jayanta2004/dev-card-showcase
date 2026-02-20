/**
 * Global Events System
 * Triggers major game events (Funding, Crashes, Viral, etc.)
 */
import { store } from '../state/store.js';

export class GlobalEventSystem {
    constructor() {
        this.events = [
            {
                id: 'market_crash',
                name: 'Market Crash',
                chance: 0.001, // 0.1% per tick/day
                trigger: (state) => state.day > 30, // Only after day 30
                effect: (state) => {
                    const drop = 20 + Math.random() * 30; // 20-50% drop
                    state.demand = Math.max(0, state.demand - drop);
                    store.addEventLog({
                        type: 'bad',
                        message: `MARKET CRASH! Demand dropped by ${Math.round(drop)}%`,
                        timestamp: state.day
                    });
                }
            },
            {
                id: 'angel_investor',
                name: 'Angel Investor',
                chance: 0.005, // 0.5%
                trigger: (state) => state.reputation > 0,
                effect: (state) => {
                    const funding = 10000 + Math.floor(Math.random() * 50000);
                    state.cash += funding;
                    state.history.cash.push(state.cash); // immediate graph update
                    store.addEventLog({
                        type: 'good',
                        message: `Angel Investor funding received: $${funding.toLocaleString()}`,
                        timestamp: state.day
                    });
                }
            },
            {
                id: 'viral_post',
                name: 'Viral Social Post',
                chance: 0.01, // 1%
                trigger: (state) => true,
                effect: (state) => {
                    const boost = 5 + Math.random() * 10;
                    state.demand += boost;
                    store.addEventLog({
                        type: 'good',
                        message: `Viral Post! Demand up by ${Math.round(boost)}%`,
                        timestamp: state.day
                    });
                }
            }
        ];
    }

    update() {
        const state = store.get();
        if (state.day % 1 !== 0) return; // Daily check

        this.events.forEach(event => {
            if (event.trigger(state)) {
                if (Math.random() < event.chance) {
                    store.mutate(s => event.effect(s));
                }
            }
        });
    }
}
