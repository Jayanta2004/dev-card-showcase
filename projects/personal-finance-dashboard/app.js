// Personal Finance Dashboard
// Uses Chart.js for visualization

const expenseForm = document.getElementById('expense-form');
const budgetForm = document.getElementById('budget-form');
const dateInput = document.getElementById('date');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const notesInput = document.getElementById('notes');
const budgetInput = document.getElementById('budget');
const totalSpentSpan = document.getElementById('total-spent');
budgetAmountSpan = document.getElementById('budget-amount');
const remainingSpan = document.getElementById('remaining');
const expensesListDiv = document.getElementById('expenses-list');
const categoryChartCanvas = document.getElementById('category-chart');
const trendChartCanvas = document.getElementById('trend-chart');

let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
let budget = parseFloat(localStorage.getItem('budget') || '0');

function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('budget', budget.toString());
}

function renderSummary() {
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    totalSpentSpan.textContent = `$${total.toFixed(2)}`;
    budgetAmountSpan.textContent = `$${budget.toFixed(2)}`;
    remainingSpan.textContent = `$${(budget - total).toFixed(2)}`;
    if (budget - total < 0) remainingSpan.style.color = '#ff3b3b';
    else remainingSpan.style.color = '#c44536';
}

function renderExpenses() {
    expensesListDiv.innerHTML = '';
    expenses.slice().reverse().forEach(e => {
        const div = document.createElement('div');
        div.className = 'expense-entry';
        div.innerHTML = `
            <span class="expense-date">${e.date}</span>
            <span class="expense-category">${e.category}</span>
            <span class="expense-amount">$${parseFloat(e.amount).toFixed(2)}</span>
            ${e.notes ? `<span class="expense-notes">${e.notes}</span>` : ''}
        `;
        expensesListDiv.appendChild(div);
    });
}

function renderCategoryChart() {
    if (window.categoryChart) window.categoryChart.destroy();
    const categories = {};
    expenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + parseFloat(e.amount);
    });
    window.categoryChart = new Chart(categoryChartCanvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#f76b1c', '#f9d423', '#e94e77', '#6c5b7b', '#355c7d', '#b2bec3'
                ],
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderTrendChart() {
    if (window.trendChart) window.trendChart.destroy();
    // Group by date
    const dateTotals = {};
    expenses.forEach(e => {
        dateTotals[e.date] = (dateTotals[e.date] || 0) + parseFloat(e.amount);
    });
    const dates = Object.keys(dateTotals).sort();
    const totals = dates.map(d => dateTotals[d]);
    window.trendChart = new Chart(trendChartCanvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Spent',
                data: totals,
                fill: true,
                borderColor: '#f76b1c',
                backgroundColor: 'rgba(247,107,28,0.12)',
                tension: 0.3
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { ticks: { color: '#f76b1c' } },
                y: { ticks: { color: '#c44536' } }
            }
        }
    });
}

expenseForm.addEventListener('submit', e => {
    e.preventDefault();
    const entry = {
        date: dateInput.value,
        category: categoryInput.value,
        amount: amountInput.value,
        notes: notesInput.value.trim()
    };
    expenses.push(entry);
    saveData();
    renderSummary();
    renderExpenses();
    renderCategoryChart();
    renderTrendChart();
    expenseForm.reset();
});

budgetForm.addEventListener('submit', e => {
    e.preventDefault();
    budget = parseFloat(budgetInput.value);
    saveData();
    renderSummary();
});

// Initialize
renderSummary();
renderExpenses();
renderCategoryChart();
renderTrendChart();
