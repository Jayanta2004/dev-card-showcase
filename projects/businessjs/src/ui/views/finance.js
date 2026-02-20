/**
 * Finance View
 * Detailed financial breakdown.
 */
import { store } from '../../state/store.js';
import { Charts } from '../charts.js';

export class FinanceView {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'view-finance';
        this.init();
    }

    init() {
        this.element.innerHTML = `
            <div class="glass-card stat-card-big">
                <h2>Financial Performance</h2>
                <div class="chart-container" id="chart-profit" style="height: 200px; margin-top: 1rem;"></div>
            </div>

            <div class="dashboard-grid" style="margin-top: 1rem;">
                <div class="glass-card">
                    <h3 style="color:var(--text-muted); font-size:0.9rem;">Income Statement (Daily)</h3>
                    <div style="margin-top:1rem; font-family:var(--font-mono);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span>Gross Revenue</span>
                            <span id="fin-revenue" style="color:var(--success);">$0</span>
                        </div>
                         <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:var(--text-muted);">
                            <span> - Expenses</span>
                            <span id="fin-expenses" style="color:var(--danger);">$0</span>
                        </div>
                        <div style="height:1px; background:var(--border-glass); margin:8px 0;"></div>
                        <div style="display:flex; justify-content:space-between; font-weight:700;">
                            <span>Net Profit</span>
                            <span id="fin-profit">$0</span>
                        </div>
                    </div>
                </div>

                <div class="glass-card">
                    <h3 style="color:var(--text-muted); font-size:0.9rem;">Expense Breakdown</h3>
                    <div style="margin-top:1rem; font-size:0.9rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Fixed OpEx</span>
                            <span>$100</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Salaries</span>
                            <span id="fin-salaries">$0</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>R&D Investment</span>
                            <span id="fin-rd">$0</span>
                        </div>
                         <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Policy Costs</span>
                            <span id="fin-policies">$0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    update(state) {
        // Main Numbers
        const rev = Math.floor(state.revenue);
        const exp = Math.floor(state.expenses);
        const profit = rev - exp;

        this.element.querySelector('#fin-revenue').textContent = `$${rev.toLocaleString()}`;
        this.element.querySelector('#fin-expenses').textContent = `-$${exp.toLocaleString()}`;

        const profitEl = this.element.querySelector('#fin-profit');
        profitEl.textContent = `$${profit.toLocaleString()}`;
        profitEl.style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';

        // Breakdown
        const salaries = state.employees.length * 150;
        const rd = state.product.rdInvestment || 0;
        // Hack: We don't track policy costs separately in state yet, so we estimate or need to refactor.
        // Expenses = 100 + Salaries + RD + Policy. So Policy = Expenses - 100 - Salaries - RD.
        const policyCost = Math.max(0, exp - 100 - salaries - rd);

        this.element.querySelector('#fin-salaries').textContent = `$${salaries.toLocaleString()}`;
        this.element.querySelector('#fin-rd').textContent = `$${rd.toLocaleString()}`;
        this.element.querySelector('#fin-policies').textContent = `$${policyCost.toLocaleString()}`;

        // Chart
        const chartEl = this.element.querySelector('#chart-profit');
        if (chartEl && state.history && state.history.profit.length > 2) {
            // Use profit history. Map to positive/negative colors? 
            // Simple line chart for now.
            chartEl.innerHTML = Charts.createLineChart(state.history.profit, chartEl.clientWidth || 600, 200, profit >= 0 ? '#10b981' : '#ef4444');
        }
    }

    getElement() {
        return this.element;
    }
}
