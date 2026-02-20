/**
 * Finance System
 * Handles revenue, expenses, and cash flow.
 * Central authority on Money.
 */
import { store } from '../state/store.js';

export class FinanceSystem {
    update() {
        const state = store.get();
        if (state.day % 1 !== 0) return; // Daily updates

        // 1. Calculate Revenue
        const price = 50;
        const salesVolume = Math.floor(state.demand * (Math.random() * 0.2 + 0.9));
        const dailyRevenue = salesVolume * price;

        // 2. Calculate Expenses

        // a. Fixed Operations
        const fixedOpEx = 100;

        // b. Salaries
        const employeeCost = state.employees.length * 150;

        // c. R&D
        const rdCost = state.product.rdInvestment || 0;

        // d. Policies (Calculate cost here to ensure cash consistency)
        let policyCost = 0;
        if (state.policies && state.policies.active) {
            if (state.policies.active.includes('aggressive_marketing')) policyCost += 500;
            // Add other costly policies here if added
        }

        const dailyExpenses = fixedOpEx + employeeCost + rdCost + policyCost;

        // 3. Profit & Cash
        const dailyProfit = dailyRevenue - dailyExpenses;

        // 4. Runway
        let runway = Infinity;
        if (dailyProfit < 0) {
            runway = Math.floor(state.cash / Math.abs(dailyProfit));
        }

        // Apply Updates
        store.mutate(s => {
            s.cash += dailyProfit;
            s.revenue = dailyRevenue;
            s.expenses = dailyExpenses;
            s.runway = runway;

            // History
            s.history.cash.push(s.cash);
            if (s.history.cash.length > 100) s.history.cash.shift();

            s.history.profit.push(dailyProfit);
            if (s.history.profit.length > 100) s.history.profit.shift();
        });
    }
}
