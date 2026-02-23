// Personal Travel Planner
// Map route viewing and expense tracking

const mapEl = document.getElementById('map');
const routeForm = document.getElementById('route-form');
const startLocationEl = document.getElementById('start-location');
const endLocationEl = document.getElementById('end-location');

const expenseForm = document.getElementById('expense-form');
const expenseDescEl = document.getElementById('expense-desc');
const expenseAmountEl = document.getElementById('expense-amount');
const expenseListEl = document.getElementById('expense-list');
const totalExpenseEl = document.getElementById('total-expense');

let expenses = [];

// Map route viewing (mock demo)
routeForm.addEventListener('submit', e => {
    e.preventDefault();
    const start = startLocationEl.value.trim();
    const end = endLocationEl.value.trim();
    if (start && end) {
        showRouteOnMap(start, end);
    }
});

function showRouteOnMap(start, end) {
    mapEl.innerHTML = `<div style='text-align:center;padding:40px;'>Route from <strong>${start}</strong> to <strong>${end}</strong> (Map API integration needed)</div>`;
}

// Expense tracking
expenseForm.addEventListener('submit', e => {
    e.preventDefault();
    const desc = expenseDescEl.value.trim();
    const amount = parseFloat(expenseAmountEl.value);
    if (desc && !isNaN(amount)) {
        expenses.push({ desc, amount });
        renderExpenses();
        expenseDescEl.value = '';
        expenseAmountEl.value = '';
    }
});

function renderExpenses() {
    expenseListEl.innerHTML = '';
    let total = 0;
    expenses.forEach((exp, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${exp.desc}</span><span>$${exp.amount.toFixed(2)}</span>`;
        expenseListEl.appendChild(li);
        total += exp.amount;
    });
    totalExpenseEl.textContent = `Total Expenses: $${total.toFixed(2)}`;
}

renderExpenses();
