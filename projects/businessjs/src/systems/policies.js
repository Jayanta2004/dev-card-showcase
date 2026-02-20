/**
 * Policy System
 * Manages active strategies and their continuous effects.
 */
import { store } from '../state/store.js';

export class PolicySystem {
    constructor() {
        this.policies = [
            {
                id: 'crunch_mode',
                name: 'Crunch Mode',
                desc: 'Increase productivity by 20%, but drain morale and fatigue twice as fast.',
                cost: 0
            },
            {
                id: 'aggressive_marketing',
                name: 'Aggressive Marketing',
                desc: 'Boost demand by 25%, but costs $500/day and risks reputation drops.',
                cost: 500
            },
            {
                id: 'remote_work',
                name: 'Remote First',
                desc: 'Boost morale, but R&D progress is 15% slower.',
                cost: 0
            }
        ];
    }

    update() {
        const state = store.get();
        if (state.day % 1 !== 0) return;

        const active = state.policies.active;

        store.mutate(s => {
            if (active.includes('aggressive_marketing')) {
                // Cost handled in FinanceSystem
                // Boost demand
                s.demand = Math.min(100, s.demand + 0.1);
                // Reputation risk
                if (Math.random() < 0.05) s.reputation -= 1;
            }

            if (active.includes('crunch_mode')) {
                s.employees.forEach(emp => {
                    emp.productivity *= 1.2; // Temporary boost logic handled in employee system or here? 
                    // Better to modify the system variable or handle in EmployeeSystem.
                    // For now, let's just act as "Modifiers" in other systems.
                    // But we can apply permanent degradation here
                    emp.fatigue += 2;
                    emp.morale -= 0.5;
                });
            }
            // s.expenses += dailyPolicyCost; // Handled in Finance
        });
    }

    toggle(policyId) {
        store.mutate(s => {
            const idx = s.policies.active.indexOf(policyId);
            if (idx > -1) {
                s.policies.active.splice(idx, 1);
            } else {
                s.policies.active.push(policyId);
            }
        });
    }

    getPolicies() {
        return this.policies;
    }
}
