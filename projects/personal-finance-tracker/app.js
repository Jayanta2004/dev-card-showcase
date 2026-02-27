// Personal Finance Tracker App
// Author: Ayaanshaikh12243
// Description: Visualize expenses, set budgets, and track savings goals

// --- State Management ---
const state = {
    expenses: [],
    budgets: [],
    savings: [],
    view: 'dashboard',
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem('financeState', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('financeState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.expenses = parsed.expenses || [];
        state.budgets = parsed.budgets || [];
        state.savings = parsed.savings || [];
        state.view = parsed.view || 'dashboard';
    }
}

// --- Navigation ---
function setView(view) {
    state.view = view;
    saveState();
    render();
}

document.getElementById('dashboardBtn').onclick = () => setView('dashboard');
document.getElementById('expensesBtn').onclick = () => setView('expenses');
document.getElementById('budgetsBtn').onclick = () => setView('budgets');
document.getElementById('savingsBtn').onclick = () => setView('savings');

// --- Render Functions ---
function render() {
    const main = document.getElementById('mainContent');
    switch (state.view) {
        case 'dashboard':
            main.innerHTML = renderDashboard();
            break;
        case 'expenses':
            main.innerHTML = renderExpenses();
            break;
        case 'budgets':
            main.innerHTML = renderBudgets();
            break;
        case 'savings':
            main.innerHTML = renderSavings();
            break;
    }
    attachEventListeners();
}

// --- Dashboard ---
function renderDashboard() {
    const totalExpenses = state.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalBudget = state.budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSavings = state.savings.reduce((sum, s) => sum + Number(s.amount), 0);
    return `
        <h2>Dashboard</h2>
        <div class="summary">
            <div><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</div>
            <div><strong>Total Budget:</strong> $${totalBudget.toFixed(2)}</div>
            <div><strong>Total Savings:</strong> $${totalSavings.toFixed(2)}</div>
        </div>
        <div class="charts">
            <canvas id="expenseChart" width="400" height="200"></canvas>
        </div>
    `;
}

// --- Expenses ---
function renderExpenses() {
    return `
        <h2>Expenses</h2>
        <form id="expenseForm">
            <input type="text" id="expenseName" placeholder="Expense Name" required />
            <input type="number" id="expenseAmount" placeholder="Amount" min="0" step="0.01" required />
            <input type="date" id="expenseDate" required />
            <button type="submit">Add Expense</button>
        </form>
        <table class="expense-table">
            <thead>
                <tr><th>Name</th><th>Amount</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
                ${state.expenses.map((e, i) => `
                    <tr>
                        <td>${e.name}</td>
                        <td>$${Number(e.amount).toFixed(2)}</td>
                        <td>${e.date}</td>
                        <td><button data-index="${i}" class="delete-expense">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// --- Budgets ---
function renderBudgets() {
    return `
        <h2>Budgets</h2>
        <form id="budgetForm">
            <input type="text" id="budgetName" placeholder="Budget Name" required />
            <input type="number" id="budgetAmount" placeholder="Amount" min="0" step="0.01" required />
            <button type="submit">Add Budget</button>
        </form>
        <table class="budget-table">
            <thead>
                <tr><th>Name</th><th>Amount</th><th>Action</th></tr>
            </thead>
            <tbody>
                ${state.budgets.map((b, i) => `
                    <tr>
                        <td>${b.name}</td>
                        <td>$${Number(b.amount).toFixed(2)}</td>
                        <td><button data-index="${i}" class="delete-budget">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// --- Savings ---
function renderSavings() {
    return `
        <h2>Savings Goals</h2>
        <form id="savingsForm">
            <input type="text" id="savingsName" placeholder="Goal Name" required />
            <input type="number" id="savingsAmount" placeholder="Amount" min="0" step="0.01" required />
            <button type="submit">Add Goal</button>
        </form>
        <table class="savings-table">
            <thead>
                <tr><th>Name</th><th>Amount</th><th>Action</th></tr>
            </thead>
            <tbody>
                ${state.savings.map((s, i) => `
                    <tr>
                        <td>${s.name}</td>
                        <td>$${Number(s.amount).toFixed(2)}</td>
                        <td><button data-index="${i}" class="delete-savings">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// --- Event Listeners ---
function attachEventListeners() {
    // Expense Form
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('expenseName').value;
            const amount = document.getElementById('expenseAmount').value;
            const date = document.getElementById('expenseDate').value;
            state.expenses.push({ name, amount, date });
            saveState();
            render();
        };
        document.querySelectorAll('.delete-expense').forEach(btn => {
            btn.onclick = function() {
                const idx = this.getAttribute('data-index');
                state.expenses.splice(idx, 1);
                saveState();
                render();
            };
        });
    }
    // Budget Form
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('budgetName').value;
            const amount = document.getElementById('budgetAmount').value;
            state.budgets.push({ name, amount });
            saveState();
            render();
        };
        document.querySelectorAll('.delete-budget').forEach(btn => {
            btn.onclick = function() {
                const idx = this.getAttribute('data-index');
                state.budgets.splice(idx, 1);
                saveState();
                render();
            };
        });
    }
    // Savings Form
    const savingsForm = document.getElementById('savingsForm');
    if (savingsForm) {
        savingsForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('savingsName').value;
            const amount = document.getElementById('savingsAmount').value;
            state.savings.push({ name, amount });
            saveState();
            render();
        };
        document.querySelectorAll('.delete-savings').forEach(btn => {
            btn.onclick = function() {
                const idx = this.getAttribute('data-index');
                state.savings.splice(idx, 1);
                saveState();
                render();
            };
        });
    }
}

// --- Initialization ---
loadState();
render();

// --- Chart Rendering (Placeholder) ---
// You can integrate Chart.js or similar for visualizations
// Example: renderExpenseChart();
