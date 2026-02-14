import { Drain } from '../core/Drain.js';
import { Config } from '../Config.js';

export class UIManager {
    constructor(simulation, graph, notifications) {
        this.sim = simulation;
        this.graph = graph;
        this.notifications = notifications;

        // State
        this.expenses = [];
        this.nextExpenseId = 1;

        // Elements
        this.elIncomeSlider = document.getElementById('income-slider');
        this.elIncomeVal = document.getElementById('income-val');
        this.elExpenseList = document.getElementById('expense-list');
        this.elAddExpenseBtn = document.getElementById('add-expense-btn');
        this.elResetBtn = document.getElementById('reset-sim-btn');

        // Stats
        this.elVol = document.getElementById('volume-stat');
        this.elSav = document.getElementById('savings-stat');
        this.elCount = document.getElementById('particle-count');

        this.initListeners();
        this.loadState();
    }

    initListeners() {
        // Income Slider
        this.elIncomeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.elIncomeVal.textContent = val;
            this.sim.emitter.setSalary(val);
            this.saveState();
        });

        // Add Expense
        this.elAddExpenseBtn.addEventListener('click', () => {
            this.createExpense('New Bill', 500, '#ff5f5f');
            this.saveState();
            if (this.notifications) this.notifications.success('New Expense Added');
        });

        // Reset
        this.elResetBtn.addEventListener('click', () => {
            // Clear particles
            this.sim.solver.particles = [];
            this.sim.grid.clear();
            // Reset Graph
            this.graph.history = [];
            // Reset Income curve
            this.sim.emitter.spawnRateCurve = 0;

            if (this.notifications) this.notifications.info('Simulation Reset');
        });
    }

    createExpense(name, amount, color) {
        const id = this.nextExpenseId++;

        // Create Logic Drain
        // Random position in bottom half
        const x = Math.random() * (this.sim.width - 100) + 50;
        const y = this.sim.height - 150 - Math.random() * 200;

        const drain = new Drain(id, name, amount, x, y, color);
        this.sim.addDrain(drain);

        // Add to List
        this.expenses.push({ id, name, amount, color });
        this.renderExpenseList();
    }

    removeExpense(id) {
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.sim.removeDrain(id);
        this.saveState();
        this.renderExpenseList();
        if (this.notifications) this.notifications.info('Expense Removed');
    }

    renderExpenseList() {
        this.elExpenseList.innerHTML = '';

        this.expenses.forEach(exp => {
            const el = document.createElement('div');
            el.className = 'expense-item';
            el.innerHTML = `
                <div class="color-dot" style="background-color: ${exp.color}"></div>
                <div class="expense-info">
                    <span class="expense-name">${exp.name}</span>
                    <span class="expense-amount">$${exp.amount}</span>
                </div>
                <div class="expense-controls">
                    <button class="btn-sm btn-danger" data-id="${exp.id}">X</button>
                </div>
            `;

            // Delete handler
            el.querySelector('button').addEventListener('click', () => {
                this.removeExpense(exp.id);
            });

            this.elExpenseList.appendChild(el);
        });
    }

    updateStats() {
        // Update Graph
        const vol = this.sim.volume;
        this.graph.pushValue(vol);
        this.graph.draw();

        // Update Text
        this.elVol.textContent = `${(vol / 100).toFixed(1)} L`;
        const savings = Math.floor(vol * Config.PIXELS_TO_DOLLARS * 100); // Scale factor
        this.elSav.textContent = `$${savings.toLocaleString()}`;
        this.elCount.textContent = this.sim.solver.particles.length;
    }

    // Persistence
    saveState() {
        const state = {
            income: parseInt(this.elIncomeSlider.value),
            expenses: this.expenses.map(exp => {
                // Find current position of drain to save it
                const drain = this.sim.drains.find(d => d.id === exp.id);
                return {
                    ...exp,
                    x: drain ? drain.pos.x : 0,
                    y: drain ? drain.pos.y : 0
                };
            })
        };
        localStorage.setItem('liquidAssetsState', JSON.stringify(state));
    }

    loadState() {
        const raw = localStorage.getItem('liquidAssetsState');
        if (!raw) {
            // Default setup
            this.createExpense('Rent', 2500, '#ff5f5f');
            this.createExpense('Groceries', 800, '#e6c84c');
            return;
        }

        const state = JSON.parse(raw);

        // Restore Income
        this.elIncomeSlider.value = state.income;
        this.elIncomeVal.textContent = state.income;
        this.sim.emitter.setSalary(state.income);

        // Restore Expenses
        state.expenses.forEach(exp => {
            if (exp.id >= this.nextExpenseId) this.nextExpenseId = exp.id + 1;

            // Create drain at saved pos
            const drain = new Drain(exp.id, exp.name, exp.amount, exp.x || 100, exp.y || 500, exp.color);
            this.sim.addDrain(drain);
            this.expenses.push(exp);
        });

        this.renderExpenseList();
    }
}
