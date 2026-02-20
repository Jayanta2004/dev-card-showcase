// Personal Finance & Expense Analyzer - app.js
// Core logic for expenses, categories, and charts

const expenseForm = document.getElementById('expense-form');
const expenseDate = document.getElementById('expense-date');
const expenseAmount = document.getElementById('expense-amount');
const expenseCategory = document.getElementById('expense-category');
const expenseNote = document.getElementById('expense-note');
const expensesList = document.getElementById('expenses-list');
const categoryChartCanvas = document.getElementById('category-chart');
const trendChartCanvas = document.getElementById('trend-chart');

let expenses = [
  { date: '2026-02-15', amount: 12.5, category: 'Food', note: 'Lunch' },
  { date: '2026-02-15', amount: 3.2, category: 'Transport', note: 'Bus fare' },
  { date: '2026-02-14', amount: 25, category: 'Shopping', note: 'Book' },
  { date: '2026-02-13', amount: 60, category: 'Bills', note: 'Electricity' },
  { date: '2026-02-13', amount: 8, category: 'Entertainment', note: 'Movie' }
];
let categoryChart = null;
let trendChart = null;

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function loadExpenses() {
  const data = localStorage.getItem('expenses');
  if (data) {
    expenses = JSON.parse(data);
  }
}

function renderExpenses() {
  expensesList.innerHTML = '';
  if (expenses.length === 0) {
    expensesList.innerHTML = '<li>No expenses yet. Add one!</li>';
    return;
  }
  expenses.slice().reverse().forEach((exp, idx) => {
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.innerHTML = `
      <div class="info">
        <span class="amount">₹${exp.amount.toFixed(2)}</span>
        <span class="category">${exp.category} | ${exp.date}</span>
        ${exp.note ? `<span class="note">${exp.note}</span>` : ''}
      </div>
      <button class="delete-btn" data-idx="${expenses.length - 1 - idx}">Delete</button>
    `;
    expensesList.appendChild(li);
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      deleteExpense(idx);
    });
  });
}

function deleteExpense(idx) {
  if (confirm('Delete this expense?')) {
    expenses.splice(idx, 1);
    saveExpenses();
    renderExpenses();
    renderCharts();
  }
}

expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const date = expenseDate.value;
  const amount = parseFloat(expenseAmount.value);
  const category = expenseCategory.value;
  const note = expenseNote.value.trim();
  if (date && amount && category) {
    expenses.push({ date, amount, category, note });
    saveExpenses();
    renderExpenses();
    renderCharts();
    expenseForm.reset();
  }
});

function renderCharts() {
  // Category Pie Chart
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  const categories = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(categoryChartCanvas.getContext('2d'), {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: [
          '#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#ffc107', '#607d8b'
        ]
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
  // Trend Line Chart
  const dateTotals = {};
  expenses.forEach(exp => {
    dateTotals[exp.date] = (dateTotals[exp.date] || 0) + exp.amount;
  });
  const dates = Object.keys(dateTotals).sort();
  const totals = dates.map(d => dateTotals[d]);
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(trendChartCanvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Total Spent',
        data: totals,
        fill: false,
        borderColor: '#4caf50',
        backgroundColor: '#4caf50',
        tension: 0.2,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4caf50',
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Initial load
loadExpenses();
renderExpenses();
renderCharts();
