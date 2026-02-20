/**
 * Dashboard View
 * The main overview screen.
 */
import { store } from '../../state/store.js';
import { Charts } from '../charts.js';

export class DashboardView {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'dashboard-grid';
        this.init();
    }

    init() {
        this.element.innerHTML = `
            <div class="glass-card stat-card-big" id="dash-balance">
                <div class="label" style="color:var(--text-muted); font-size:0.9rem;">Total Balance</div>
                <div class="value" style="font-size:2.5rem; font-weight:700; font-family:var(--font-mono); color:var(--text-main); margin-top:8px;">
                    $0.00
                </div>
                <div class="chart-container" id="chart-balance" style="height: 100px; margin-top: 10px;"></div>
            </div>
            
            <div class="glass-card">
                <div class="label">Revenue (Daily)</div>
                <div class="value" id="dash-revenue">$0</div>
            </div>

            <div class="glass-card">
                <div class="label">Expenses (Daily)</div>
                <div class="value" id="dash-expenses">$0</div>
            </div>

             <div class="glass-card">
                <div class="label">Market Demand</div>
                <div class="value" id="dash-demand">0</div>
            </div>

            <div class="glass-card">
                <div class="label">Runway</div>
                <div class="value" id="dash-runway" style="color:var(--accent-secondary);">∞</div>
            </div>
        `;
    }

    update(state) {
        const balanceEl = this.element.querySelector('#dash-balance .value');
        const revenueEl = this.element.querySelector('#dash-revenue');
        const expensesEl = this.element.querySelector('#dash-expenses');
        const demandEl = this.element.querySelector('#dash-demand');
        const runwayEl = this.element.querySelector('#dash-runway');
        const chartEl = this.element.querySelector('#chart-balance');

        if (balanceEl) balanceEl.textContent = `$${Math.floor(state.cash).toLocaleString()}`;
        if (revenueEl) revenueEl.textContent = `$${Math.floor(state.revenue).toLocaleString()}`;
        if (expensesEl) expensesEl.textContent = `$${Math.floor(state.expenses).toLocaleString()}`;
        if (demandEl) demandEl.textContent = Math.round(state.demand);

        if (state.runway !== undefined && runwayEl) {
            runwayEl.textContent = state.runway === Infinity ? '∞ days' : `${state.runway} days`;
            if (state.runway === Infinity) runwayEl.style.color = 'var(--accent-secondary)';
            else if (state.runway < 30) runwayEl.style.color = 'var(--danger)';
            else runwayEl.style.color = 'var(--warning)';
        }

        // Render Chart
        if (chartEl && state.history && state.history.cash.length > 2) {
            chartEl.innerHTML = Charts.createLineChart(state.history.cash, chartEl.clientWidth || 300, 100, '#38bdf8');
        }
    }

    getElement() {
        return this.element;
    }
}
