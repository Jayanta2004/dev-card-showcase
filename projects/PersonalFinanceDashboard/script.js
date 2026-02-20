// Personal Finance Dashboard - Complete Implementation

// State Management
const state = {
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  debts: [],
  investments: [],
  bills: [],
  currentMonth: new Date().toISOString().slice(0, 7)
};

const storageKey = "finance-dashboard-v2";

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initializeApp();
  setupEventListeners();
  updateDashboard();
});

// Load state from localStorage
function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.assign(state, data);
    } catch (e) {
      console.error('Error loading state:', e);
    }
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

// Utility Functions
const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(value || 0);

const formatDate = (date) => new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
}).format(new Date(date));

const showNotification = (message, type = 'success') => {
  const notifications = document.getElementById('notifications');
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  notifications.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
};

// Initialize App
function initializeApp() {
  // Set default month
  const monthSelect = document.getElementById('monthSelect');
  if (monthSelect) {
    monthSelect.value = state.currentMonth;
  }

  // Initialize charts
  initializeCharts();

  // Populate account dropdowns
  updateAccountDropdowns();
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      const section = document.getElementById(item.dataset.section);
      if (section) {
        section.classList.add('active');
        updateSection(item.dataset.section);
      }
    });
  });

  // Month Select
  const monthSelect = document.getElementById('monthSelect');
  if (monthSelect) {
    monthSelect.addEventListener('change', (e) => {
      state.currentMonth = e.target.value;
      updateDashboard();
    });
  }

  // Forms
  setupFormListeners();
}

function setupFormListeners() {
  // Transaction Form
  const transactionForm = document.getElementById('transactionForm');
  if (transactionForm) {
    transactionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTransaction();
    });
  }

  // Budget Form
  const budgetForm = document.getElementById('budgetForm');
  if (budgetForm) {
    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addBudget();
    });
  }

  // Goal Form
  const goalForm = document.getElementById('goalForm');
  if (goalForm) {
    goalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addGoal();
    });
  }

  // Debt Form
  const debtForm = document.getElementById('debtForm');
  if (debtForm) {
    debtForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addDebt();
    });
  }

  // Investment Form
  const investmentForm = document.getElementById('investmentForm');
  if (investmentForm) {
    investmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addInvestment();
    });
  }

  // Bill Form
  const billForm = document.getElementById('billForm');
  if (billForm) {
    billForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addBill();
    });
  }
}

// Update Dashboard
function updateDashboard() {
  updateSummaryCards();
  updateCharts();
  updateRecentTransactions();
}

function updateSection(section) {
  switch(section) {
    case 'dashboard':
      updateDashboard();
      break;
    case 'accounts':
      renderAccounts();
      break;
    case 'transactions':
      renderTransactions();
      break;
    case 'budgets':
      renderBudgets();
      break;
    case 'goals':
      renderGoals();
      break;
    case 'debts':
      renderDebts();
      break;
    case 'investments':
      renderInvestments();
      break;
    case 'bills':
      renderBills();
      break;
    case 'reports':
      renderReports();
      break;
  }
}

// Summary Cards
function updateSummaryCards() {
  const transactions = state.transactions.filter(t => 
    t.date.startsWith(state.currentMonth)
  );
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const netSavings = income - expenses;
  
  // Calculate net worth
  const accountTotal = state.accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const debtTotal = state.debts.reduce((sum, d) => sum + Number(d.amount), 0);
  const investmentTotal = state.investments.reduce((sum, i) => 
    sum + (Number(i.quantity) * Number(i.currentPrice || i.purchasePrice)), 0);
  const netWorth = accountTotal + investmentTotal - debtTotal;
  
  // Update UI
  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const netSavingsEl = document.getElementById('netSavings');
  const netWorthEl = document.getElementById('netWorth');
  const savingsRateEl = document.getElementById('savingsRate');
  
  if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(income);
  if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(expenses);
  if (netSavingsEl) netSavingsEl.textContent = formatCurrency(netSavings);
  if (netWorthEl) netWorthEl.textContent = formatCurrency(netWorth);
  
  if (savingsRateEl && income > 0) {
    const savingsRate = ((netSavings / income) * 100).toFixed(1);
    savingsRateEl.textContent = `Savings rate ${savingsRate}%`;
  }
}

// Charts
let trendChart, categoryChart, incomeExpenseChart, netWorthChart;

function initializeCharts() {
  // Spending Trends Chart
  const trendCanvas = document.getElementById('trendChart');
  if (trendCanvas) {
    trendChart = new Chart(trendCanvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Income',
          data: [],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4
        }, {
          label: 'Expenses',
          data: [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Category Pie Chart
  const categoryCanvas = document.getElementById('categoryChart');
  if (categoryCanvas) {
    categoryChart = new Chart(categoryCanvas, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#2563eb', '#10b981', '#f59e0b', '#ef4444', 
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          }
        }
      }
    });
  }

  // Income vs Expense Chart
  const incomeExpenseCanvas = document.getElementById('incomeExpenseChart');
  if (incomeExpenseCanvas) {
    incomeExpenseChart = new Chart(incomeExpenseCanvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Income',
          data: [],
          backgroundColor: '#10b981'
        }, {
          label: 'Expenses',
          data: [],
          backgroundColor: '#ef4444'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Net Worth Trend Chart
  const netWorthCanvas = document.getElementById('netWorthChart');
  if (netWorthCanvas) {
    netWorthChart = new Chart(netWorthCanvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Net Worth',
          data: [],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
}

function updateCharts() {
  updateTrendChart();
  updateCategoryChart();
}

function updateTrendChart() {
  if (!trendChart) return;
  
  const months = [];
  const incomeData = [];
  const expenseData = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const transactions = state.transactions.filter(t => t.date.startsWith(monthKey));
    const income = transactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    months.push(monthName);
    incomeData.push(income);
    expenseData.push(expenses);
  }
  
  trendChart.data.labels = months;
  trendChart.data.datasets[0].data = incomeData;
  trendChart.data.datasets[1].data = expenseData;
  trendChart.update();
}

function updateCategoryChart() {
  if (!categoryChart) return;
  
  const transactions = state.transactions.filter(t => 
    t.date.startsWith(state.currentMonth) && t.type === 'expense'
  );
  
  const categories = {};
  transactions.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
  });
  
  categoryChart.data.labels = Object.keys(categories);
  categoryChart.data.datasets[0].data = Object.values(categories);
  categoryChart.update();
}

// Recent Transactions
function updateRecentTransactions() {
  const container = document.getElementById('recentTransactions');
  if (!container) return;
  
  const recent = state.transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  if (recent.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No transactions yet</p>';
    return;
  }
  
  container.innerHTML = recent.map(t => `
    <div class="transaction-item">
      <div class="transaction-info">
        <h4>${t.category}</h4>
        <p>${formatDate(t.date)}${t.note ? ' • ' + t.note : ''}</p>
      </div>
      <div class="amount-${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
    </div>
  `).join('');
}

// ACCOUNTS
function showAddAccount() {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <h2>Add Account</h2>
    <form id="accountModalForm">
      <div class="form-grid">
        <div class="form-row">
          <label>Account Name</label>
          <input type="text" id="accountName" placeholder="Chase Checking" required />
        </div>
        <div class="form-row">
          <label>Account Type</label>
          <select id="accountType" required>
            <option>Checking</option>
            <option>Savings</option>
            <option>Credit Card</option>
            <option>Investment</option>
          </select>
        </div>
        <div class="form-row">
          <label>Current Balance</label>
          <input type="number" id="accountBalance" placeholder="0.00" step="0.01" required />
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Add Account</button>
    </form>
  `;
  
  modal.style.display = 'block';
  
  document.getElementById('accountModalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const account = {
      id: Date.now().toString(),
      name: document.getElementById('accountName').value,
      type: document.getElementById('accountType').value,
      balance: Number(document.getElementById('accountBalance').value)
    };
    state.accounts.push(account);
    saveState();
    renderAccounts();
    updateAccountDropdowns();
    closeModal();
    showNotification('Account added successfully!');
  });
}

function renderAccounts() {
  const container = document.getElementById('accountsList');
  if (!container) return;
  
  if (state.accounts.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 40px; grid-column: 1/-1;">No accounts yet. Click "Add Account" to get started.</p>';
    return;
  }
  
  container.innerHTML = state.accounts.map(account => `
    <div class="account-card">
      <h3>${account.name}</h3>
      <p class="account-type">${account.type}</p>
      <p>${formatCurrency(account.balance)}</p>
      <button class="btn btn-danger" onclick="deleteAccount('${account.id}')" style="margin-top: 12px;">Delete</button>
    </div>
  `).join('');
}

function deleteAccount(id) {
  if (confirm('Are you sure you want to delete this account?')) {
    state.accounts = state.accounts.filter(a => a.id !== id);
    saveState();
    renderAccounts();
    updateAccountDropdowns();
    showNotification('Account deleted');
  }
}

function updateAccountDropdowns() {
  const select = document.getElementById('transactionAccount');
  if (select) {
    select.innerHTML = '<option value="">Select Account</option>' + 
      state.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  }
}

// TRANSACTIONS
function showAddTransaction() {
  const section = document.getElementById('transactions');
  if (section) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-section="transactions"]').classList.add('active');
    section.classList.add('active');
    updateSection('transactions');
  }
}

function addTransaction() {
  const type = document.getElementById('transactionType').value;
  const account = document.getElementById('transactionAccount').value;
  const category = document.getElementById('transactionCategory').value;
  const amount = Number(document.getElementById('transactionAmount').value);
  const date = document.getElementById('transactionDate').value;
  const tags = document.getElementById('transactionTags').value;
  const note = document.getElementById('transactionNote').value;
  const recurring = document.getElementById('transactionRecurring').checked;
  
  if (!amount || !date) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  const transaction = {
    id: Date.now().toString(),
    type,
    account,
    category,
    amount,
    date,
    tags: tags.split(',').map(t => t.trim()).filter(t => t),
    note,
    recurring
  };
  
  state.transactions.push(transaction);
  saveState();
  
  // Update account balance
  if (account) {
    const acc = state.accounts.find(a => a.id === account);
    if (acc) {
      acc.balance += type === 'income' ? amount : -amount;
      saveState();
    }
  }
  
  renderTransactions();
  updateDashboard();
  document.getElementById('transactionForm').reset();
  showNotification('Transaction added successfully!');
}

function renderTransactions() {
  const tbody = document.querySelector('#transactionTable tbody');
  if (!tbody) return;
  
  const filtered = state.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted);">No transactions yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(t => {
    const account = state.accounts.find(a => a.id === t.account);
    return `
      <tr>
        <td>${formatDate(t.date)}</td>
        <td>
          ${t.category}
          ${t.note ? `<br><small style="color: var(--muted);">${t.note}</small>` : ''}
        </td>
        <td>${t.category}</td>
        <td>${account ? account.name : '-'}</td>
        <td class="amount-${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</td>
        <td>
          <button class="btn btn-danger" onclick="deleteTransaction('${t.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function deleteTransaction(id) {
  if (confirm('Delete this transaction?')) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveState();
    renderTransactions();
    updateDashboard();
    showNotification('Transaction deleted');
  }
}

// BUDGETS
function showAddBudget() {
  // Budget form is already on the page
}

function addBudget() {
  const category = document.getElementById('budgetCategory').value;
  const limit = Number(document.getElementById('budgetLimit').value);
  
  if (!category || !limit) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  const budget = {
    id: Date.now().toString(),
    category,
    limit
  };
  
  state.budgets.push(budget);
  saveState();
  renderBudgets();
  document.getElementById('budgetForm').reset();
  showNotification('Budget created successfully!');
}

function renderBudgets() {
  const container = document.getElementById('budgetList');
  if (!container) return;
  
  if (state.budgets.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 40px;">No budgets set</p>';
    return;
  }
  
  // Calculate spending per category
  const transactions = state.transactions.filter(t => 
    t.date.startsWith(state.currentMonth) && t.type === 'expense'
  );
  
  container.innerHTML = state.budgets.map(budget => {
    const spent = transactions
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const percentage = Math.min((spent / budget.limit) * 100, 100);
    const isOverspent = spent > budget.limit;
    
    return `
      <div class="budget-item ${isOverspent ? 'overspent' : ''}">
        <div class="budget-header">
          <h4>${budget.category}</h4>
          <span class="budget-amount ${isOverspent ? 'overspent' : ''}">
            ${formatCurrency(spent)} / ${formatCurrency(budget.limit)}
          </span>
        </div>
        <div class="progress">
          <div class="progress-bar" style="width: ${percentage}%; background: ${isOverspent ? 'var(--danger)' : 'var(--secondary)'}"></div>
        </div>
        <div class="progress-info">
          <span>${percentage.toFixed(0)}% used</span>
          <span>${formatCurrency(budget.limit - spent)} remaining</span>
        </div>
        <button class="btn btn-danger" onclick="deleteBudget('${budget.id}')" style="margin-top: 12px;">Delete</button>
        ${isOverspent ? '<p style="color: var(--danger); margin-top: 8px; font-size: 13px;">⚠ Over budget!</p>' : ''}
      </div>
    `;
  }).join('');
}

function deleteBudget(id) {
  if (confirm('Delete this budget?')) {
    state.budgets = state.budgets.filter(b => b.id !== id);
    saveState();
    renderBudgets();
    showNotification('Budget deleted');
  }
}

// GOALS
function showAddGoal() {
  // Form is already on page
}

function addGoal() {
  const name = document.getElementById('goalName').value;
  const target = Number(document.getElementById('goalTarget').value);
  const current = Number(document.getElementById('goalCurrent').value);
  const date = document.getElementById('goalDate').value;
  
  if (!name || !target || !date) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  const goal = {
    id: Date.now().toString(),
    name,
    target,
    current,
    date
  };
  
  state.goals.push(goal);
  saveState();
  renderGoals();
  document.getElementById('goalForm').reset();
  showNotification('Goal added successfully!');
}

function renderGoals() {
  const container = document.getElementById('goalsList');
  if (!container) return;
  
  if (state.goals.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 40px; grid-column: 1/-1;">No goals set</p>';
    return;
  }
  
  container.innerHTML = state.goals.map(goal => {
    const percentage = Math.min((goal.current / goal.target) * 100, 100);
    const remaining = goal.target - goal.current;
    
    return `
      <div class="goal-card-item">
        <h3>${goal.name}</h3>
        <p class="goal-meta">Target: ${formatCurrency(goal.target)} by ${formatDate(goal.date)}</p>
        <p>${formatCurrency(goal.current)}</p>
        <div class="progress">
          <div class="progress-bar" style="width: ${percentage}%"></div>
        </div>
        <div class="progress-info">
          <span>${percentage.toFixed(0)}% complete</span>
          <span>${formatCurrency(remaining)} to go</span>
        </div>
        <button class="btn btn-danger" onclick="deleteGoal('${goal.id}')" style="margin-top: 12px;">Delete</button>
      </div>
    `;
  }).join('');
}

function deleteGoal(id) {
  if (confirm('Delete this goal?')) {
    state.goals = state.goals.filter(g => g.id !== id);
    saveState();
    renderGoals();
    showNotification('Goal deleted');
  }
}

// DEBTS
function showAddDebt() {
  // Form is on page
}

function addDebt() {
  const name = document.getElementById('debtName').value;
  const amount = Number(document.getElementById('debtAmount').value);
  const interest = Number(document.getElementById('debtInterest').value);
  const minimum = Number(document.getElementById('debtMinimum').value);
  const due = document.getElementById('debtDue').value;
  
  if (!name || !amount) {
    showNotification('Please fill in required fields', 'error');
    return;
  }
  
  const debt = {
    id: Date.now().toString(),
    name,
    amount,
    interest,
    minimum,
    due
  };
  
  state.debts.push(debt);
  saveState();
  renderDebts();
  document.getElementById('debtForm').reset();
  showNotification('Debt added successfully!');
}

function renderDebts() {
  const container = document.getElementById('debtsList');
  if (!container) return;
  
  if (state.debts.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 40px; grid-column: 1/-1;">No debts tracked</p>';
    return;
  }
  
  container.innerHTML = state.debts.map(debt => `
    <div class="debt-card">
      <h3>${debt.name}</h3>
      <p>${formatCurrency(debt.amount)}</p>
      <p class="debt-meta">
        ${debt.interest ? `Interest: ${debt.interest}%` : ''}
        ${debt.minimum ? ` • Min Payment: ${formatCurrency(debt.minimum)}` : ''}
        ${debt.due ? ` • Due: ${formatDate(debt.due)}` : ''}
      </p>
      <button class="btn btn-danger" onclick="deleteDebt('${debt.id}')" style="margin-top: 12px;">Delete</button>
    </div>
  `).join('');
}

function deleteDebt(id) {
  if (confirm('Delete this debt?')) {
    state.debts = state.debts.filter(d => d.id !== id);
    saveState();
    renderDebts();
    showNotification('Debt deleted');
  }
}

// INVESTMENTS
function showAddInvestment() {
  // Form is on page
}

function addInvestment() {
  const type = document.getElementById('investmentType').value;
  const name = document.getElementById('investmentName').value;
  const quantity = Number(document.getElementById('investmentQuantity').value);
  const purchasePrice = Number(document.getElementById('investmentPrice').value);
  const currentPrice = Number(document.getElementById('investmentCurrent').value) || purchasePrice;
  
  if (!name || !quantity || !purchasePrice) {
    showNotification('Please fill in required fields', 'error');
    return;
  }
  
  const investment = {
    id: Date.now().toString(),
    type,
    name,
    quantity,
    purchasePrice,
    currentPrice
  };
  
  state.investments.push(investment);
  saveState();
  renderInvestments();
  document.getElementById('investmentForm').reset();
  showNotification('Investment added successfully!');
}

function renderInvestments() {
  const container = document.getElementById('investmentsList');
  if (!container) return;
  
  const portfolioSummary = document.getElementById('portfolioSummary');
  
  if (state.investments.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 40px; grid-column: 1/-1;">No investments tracked</p>';
    if (portfolioSummary) portfolioSummary.innerHTML = '<p style="text-align: center; color: var(--muted);">No data</p>';
    return;
  }
  
  // Calculate portfolio summary
  let totalValue = 0;
  let totalCost = 0;
  
  container.innerHTML = state.investments.map(inv => {
    const cost = inv.quantity * inv.purchasePrice;
    const value = inv.quantity * inv.currentPrice;
    const gain = value - cost;
    const gainPercent = ((gain / cost) * 100).toFixed(2);
    
    totalValue += value;
    totalCost += cost;
    
    return `
      <div class="investment-card">
        <h3>${inv.name}</h3>
        <p class="investment-meta">${inv.type} • ${inv.quantity} shares</p>
        <p>${formatCurrency(value)}</p>
        <p class="investment-meta" style="color: ${gain >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
          ${gain >= 0 ? '+' : ''}${formatCurrency(gain)} (${gainPercent}%)
        </p>
        <button class="btn btn-danger" onclick="deleteInvestment('${inv.id}')" style="margin-top: 12px;">Delete</button>
      </div>
    `;
  }).join('');
  
  // Update portfolio summary
  if (portfolioSummary) {
    const totalGain = totalValue - totalCost;
    const totalGainPercent = ((totalGain / totalCost) * 100).toFixed(2);
    
    portfolioSummary.innerHTML = `
      <div class="portfolio-stat">
        <h4>Total Value</h4>
        <p>${formatCurrency(totalValue)}</p>
      </div>
      <div class="portfolio-stat">
        <h4>Total Cost</h4>
        <p>${formatCurrency(totalCost)}</p>
      </div>
      <div class="portfolio-stat">
        <h4>Total Gain/Loss</h4>
        <p style="color: ${totalGain >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
          ${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)}
        </p>
      </div>
      <div class="portfolio-stat">
        <h4>Return</h4>
        <p style="color: ${totalGain >= 0 ? 'var(--secondary)' : 'var(--danger)'};">
          ${totalGain >= 0 ? '+' : ''}${totalGainPercent}%
        </p>
      </div>
    `;
  }
}

function deleteInvestment(id) {
  if (confirm('Delete this investment?')) {
    state.investments = state.investments.filter(i => i.id !== id);
    saveState();
    renderInvestments();
    showNotification('Investment deleted');
  }
}

// BILLS
function showAddBill() {
  // Form is on page
}

function addBill() {
  const name = document.getElementById('billName').value;
  const amount = Number(document.getElementById('billAmount').value);
  const due = document.getElementById('billDue').value;
  const frequency = document.getElementById('billFrequency').value;
  
  if (!name || !amount || !due) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  const bill = {
    id: Date.now().toString(),
    name,
    amount,
    due,
    frequency,
    paid: false
  };
  
  state.bills.push(bill);
  saveState();
  renderBills();
  document.getElementById('billForm').reset();
  showNotification('Bill added successfully!');
}

function renderBills() {
  const upcomingContainer = document.getElementById('upcomingBills');
  const historyContainer = document.getElementById('billHistory');
  
  if (!upcomingContainer) return;
  
  const upcoming = state.bills.filter(b => !b.paid).sort((a, b) => new Date(a.due) - new Date(b.due));
  const history = state.bills.filter(b => b.paid).sort((a, b) => new Date(b.due) - new Date(a.due));
  
  if (upcoming.length === 0) {
    upcomingContainer.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No upcoming bills</p>';
  } else {
    upcomingContainer.innerHTML = upcoming.map(bill => {
      const dueDate = new Date(bill.due);
      const today = new Date();
      const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      const status = daysUntil < 0 ? 'overdue' : (daysUntil <= 7 ? 'due-soon' : '');
      
      return `
        <div class="bill-item ${status}">
          <div class="bill-info">
            <h4>${bill.name}</h4>
            <p>${formatDate(bill.due)} • ${bill.frequency}
              ${daysUntil < 0 ? ` • ${Math.abs(daysUntil)} days overdue` : 
                daysUntil === 0 ? ' • Due today!' : 
                daysUntil <= 7 ? ` • Due in ${daysUntil} days` : ''}
            </p>
          </div>
          <div>
            <div class="bill-amount">${formatCurrency(bill.amount)}</div>
            <button class="btn btn-secondary" onclick="markBillPaid('${bill.id}')" style="margin-top: 8px; font-size: 12px;">Mark Paid</button>
          </div>
        </div>
      `;
    }).join('');
  }
  
  if (historyContainer) {
    if (history.length === 0) {
      historyContainer.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No payment history</p>';
    } else {
      historyContainer.innerHTML = history.slice(0, 10).map(bill => `
        <div class="bill-item">
          <div class="bill-info">
            <h4>${bill.name}</h4>
            <p>${formatDate(bill.due)} • Paid</p>
          </div>
          <div class="bill-amount">${formatCurrency(bill.amount)}</div>
        </div>
      `).join('');
    }
  }
}

function markBillPaid(id) {
  const bill = state.bills.find(b => b.id === id);
  if (bill) {
    bill.paid = true;
    saveState();
    renderBills();
    showNotification(`${bill.name} marked as paid!`);
  }
}

function deleteBill(id) {
  if (confirm('Delete this bill?')) {
    state.bills = state.bills.filter(b => b.id !== id);
    saveState();
    renderBills();
    showNotification('Bill deleted');
  }
}

// REPORTS
function renderReports() {
  updateReportsCharts();
  generateMonthlySummary();
}

function updateReportsCharts() {
  // Income vs Expense Chart
  if (incomeExpenseChart) {
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const transactions = state.transactions.filter(t => t.date.startsWith(monthKey));
      const income = transactions.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = transactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      months.push(monthName);
      incomeData.push(income);
      expenseData.push(expenses);
    }
    
    incomeExpenseChart.data.labels = months;
    incomeExpenseChart.data.datasets[0].data = incomeData;
    incomeExpenseChart.data.datasets[1].data = expenseData;
    incomeExpenseChart.update();
  }
  
  // Net Worth Trend
  if (netWorthChart) {
    const months = [];
    const netWorthData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // This is simplified - in real app would track historical values
      const accounts = state.accounts.reduce((sum, a) => sum + Number(a.balance), 0);
      const investments = state.investments.reduce((sum, i) => 
        sum + (Number(i.quantity) * Number(i.currentPrice || i.purchasePrice)), 0);
      const debts = state.debts.reduce((sum, d) => sum + Number(d.amount), 0);
      
      months.push(monthName);
      netWorthData.push(accounts + investments - debts);
    }
    
    netWorthChart.data.labels = months;
    netWorthChart.data.datasets[0].data = netWorthData;
    netWorthChart.update();
  }
}

function generateMonthlySummary() {
  const container = document.getElementById('monthlyReport');
  if (!container) return;
  
  const transactions = state.transactions.filter(t => t.date.startsWith(state.currentMonth));
  const income = transactions.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;
  
  // Top categories
  const categorySpending = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + Number(t.amount);
  });
  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  container.innerHTML = `
    <div class="report-section">
      <h4>Income</h4>
      <p style="color: var(--primary);">${formatCurrency(income)}</p>
    </div>
    <div class="report-section">
      <h4>Expenses</h4>
      <p style="color: var(--danger);">${formatCurrency(expenses)}</p>
    </div>
    <div class="report-section">
      <h4>Net Savings</h4>
      <p style="color: var(--secondary);">${formatCurrency(savings)}</p>
    </div>
    <div class="report-section">
      <h4>Savings Rate</h4>
      <p>${savingsRate}%</p>
    </div>
    <div class="report-section" style="grid-column: 1/-1;">
      <h4>Top Spending Categories</h4>
      ${topCategories.length > 0 ? topCategories.map(([cat, amount]) => `
        <p style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>${cat}</span>
          <strong>${formatCurrency(amount)}</strong>
        </p>
      `).join('') : '<p style="color: var(--muted);">No expense data</p>'}
    </div>
  `;
}

// Export Functions
function exportReport(format) {
  const transactions = state.transactions.filter(t => t.date.startsWith(state.currentMonth));
  
  if (format === 'csv') {
    let csv = 'Date,Type,Category,Account,amount,Note\n';
    transactions.forEach(t => {
      const account = state.accounts.find(a => a.id === t.account);
      csv += `${t.date},${t.type},${t.category},${account ? account.name : ''},${t.amount},"${t.note || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${state.currentMonth}.csv`;
    a.click();
    showNotification('CSV exported successfully!');
  } else if (format === 'pdf' || format === 'excel') {
    showNotification(`${format.toUpperCase()} export coming soon!`, 'warning');
  }
}

// Modal Functions
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
}

// Click outside modal to close
window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
}

    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = getMonthKey(date);
    const monthTx = filterByMonth(key);
    months.push({
      label: date.toLocaleDateString("en-US", { month: "short" }),
      income: sumByType(monthTx, "income"),
      expense: sumByType(monthTx, "expense"),
    });
  }
  return months;
};

const updateSummary = () => {
  const selected = getSelectedMonth();
  const monthTransactions = filterByMonth(selected);
  const income = sumByType(monthTransactions, "income");
  const expenses = sumByType(monthTransactions, "expense");
  const net = income - expenses;

  totalIncomeEl.textContent = formatCurrency(income);
  totalExpensesEl.textContent = formatCurrency(expenses);
  netSavingsEl.textContent = formatCurrency(net);

  const months = getMonthlyTotals();
  const current = months[months.length - 1];
  const prev = months[months.length - 2] || current;
  const incomeChange = prev.income ? ((current.income - prev.income) / prev.income) * 100 : 0;
  const expenseChange = prev.expense ? ((current.expense - prev.expense) / prev.expense) * 100 : 0;
  incomeTrendEl.textContent = `${incomeChange >= 0 ? "+" : ""}${incomeChange.toFixed(1)}% vs last month`;
  expenseTrendEl.textContent = `${expenseChange >= 0 ? "+" : ""}${expenseChange.toFixed(1)}% vs last month`;
  const savingsRate = income ? Math.max((net / income) * 100, 0) : 0;
  savingsRateEl.textContent = `Savings rate ${savingsRate.toFixed(0)}%`;
};

const updateGoal = () => {
  if (!state.goal) {
    goalTitle.textContent = "No goal set";
    goalMeta.textContent = "Set a target to see progress.";
    goalProgressEl.textContent = "0%";
    goalRemainingEl.textContent = "$0.00 remaining";
    goalBar.style.width = "0%";
    return;
  }
  const totalSavings = state.transactions.reduce((sum, tx) => {
    if (tx.type === "income") return sum + Number(tx.amount);
    if (tx.type === "expense") return sum - Number(tx.amount);
    return sum;
  }, 0);
  const progress = Math.min((totalSavings / state.goal.target) * 100, 100);
  const remaining = Math.max(state.goal.target - totalSavings, 0);
  goalTitle.textContent = state.goal.name;
  goalMeta.textContent = `Target ${formatCurrency(state.goal.target)} by ${formatDate(new Date(state.goal.date))}`;
  goalProgressEl.textContent = `${progress.toFixed(0)}%`;
  goalRemainingEl.textContent = `${formatCurrency(remaining)} remaining`;
  goalBar.style.width = `${progress}%`;
};

const updateBudgets = () => {
  budgetList.innerHTML = "";
  const selected = getSelectedMonth();
  const monthTransactions = filterByMonth(selected);

  if (!state.budgets.length) {
    budgetList.innerHTML = `<p class="muted">No budgets yet.</p>`;
    return;
  }

  state.budgets.forEach((budget) => {
    const spent = monthTransactions
      .filter((tx) => tx.type === "expense" && tx.category === budget.category)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const percent = Math.min((spent / budget.limit) * 100, 100);
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div>
        <h4>${budget.category}</h4>
        <p>${formatCurrency(spent)} spent of ${formatCurrency(budget.limit)}</p>
        <div class="progress" style="margin-top: 6px;">
          <div class="progress-bar" style="width:${percent}%"></div>
        </div>
      </div>
      <button data-id="${budget.id}">Remove</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      state.budgets = state.budgets.filter((entry) => entry.id !== budget.id);
      saveState();
      renderAll();
    });
    budgetList.appendChild(item);
  });
};

const updateReminders = () => {
  reminderList.innerHTML = "";
  if (!state.reminders.length) {
    reminderList.innerHTML = `<p class="muted">No reminders yet.</p>`;
    return;
  }
  const sorted = [...state.reminders].sort((a, b) => new Date(a.date) - new Date(b.date));
  sorted.forEach((reminder) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div>
        <h4>${reminder.name}</h4>
        <p>${formatDate(new Date(reminder.date))} • ${formatCurrency(reminder.amount)}</p>
      </div>
      <button data-id="${reminder.id}">Remove</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      state.reminders = state.reminders.filter((entry) => entry.id !== reminder.id);
      saveState();
      renderAll();
    });
    reminderList.appendChild(item);
  });
};

const updateTransactions = () => {
  const selected = getSelectedMonth();
  const monthTransactions = filterByMonth(selected)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  transactionTable.innerHTML = `
    <div class="table-row header">
      <div>Category</div>
      <div>Type</div>
      <div>Amount</div>
      <div>Date</div>
      <div>Note</div>
    </div>
  `;

  if (!monthTransactions.length) {
    transactionTable.innerHTML += `<div class="table-row">No transactions yet for this month.</div>`;
    return;
  }

  monthTransactions.forEach((tx) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <div>${tx.category}</div>
      <div><span class="tag">${tx.type}</span></div>
      <div>${formatCurrency(tx.amount)}</div>
      <div>${formatDate(new Date(tx.date))}</div>
      <div>${tx.note || "—"}</div>
    `;
    transactionTable.appendChild(row);
  });
};

const updateReport = () => {
  const selected = getSelectedMonth();
  const monthTransactions = filterByMonth(selected);
  const income = sumByType(monthTransactions, "income");
  const expenses = sumByType(monthTransactions, "expense");
  const net = income - expenses;
  const topCategory = Object.entries(groupByCategory(monthTransactions))
    .sort((a, b) => b[1] - a[1])[0];

  monthlyReport.innerHTML = "";
  const reportItems = [
    { label: "Income", value: formatCurrency(income) },
    { label: "Expenses", value: formatCurrency(expenses) },
    { label: "Net Savings", value: formatCurrency(net) },
    { label: "Top Category", value: topCategory ? `${topCategory[0]} (${formatCurrency(topCategory[1])})` : "None" },
  ];

  reportItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "report-item";
    row.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    monthlyReport.appendChild(row);
  });
};

const renderTrendChart = () => {
  const months = getMonthlyTotals();
  const ctx = document.getElementById("trendChart").getContext("2d");
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Income",
          data: months.map((m) => m.income),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Expenses",
          data: months.map((m) => m.expense),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.12)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: {
        y: {
          ticks: {
            callback: (value) => `$${value}`,
          },
        },
      },
    },
  });
};

const renderCategoryChart = () => {
  const selected = getSelectedMonth();
  const monthTransactions = filterByMonth(selected);
  const categories = groupByCategory(monthTransactions);
  const ctx = document.getElementById("categoryChart").getContext("2d");
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            "#2563eb",
            "#ef4444",
            "#f97316",
            "#10b981",
            "#8b5cf6",
            "#14b8a6",
            "#eab308",
          ],
        },
      ],
    },
    options: {
      plugins: { legend: { position: "right" } },
    },
  });
};

const renderAll = () => {
  updateSummary();
  updateGoal();
  updateBudgets();
  updateReminders();
  updateTransactions();
  updateReport();
  renderTrendChart();
  renderCategoryChart();
};

const initForms = () => {
  document.getElementById("transactionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const type = document.getElementById("transactionType").value;
    const category = document.getElementById("transactionCategory").value;
    const amount = Number(document.getElementById("transactionAmount").value);
    const date = document.getElementById("transactionDate").value;
    const note = document.getElementById("transactionNote").value;
    state.transactions.push({
      id: crypto.randomUUID(),
      type,
      category,
      amount,
      date: new Date(date).toISOString(),
      note,
    });
    event.target.reset();
    saveState();
    renderAll();
  });

  document.getElementById("budgetForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const category = document.getElementById("budgetCategory").value.trim();
    const limit = Number(document.getElementById("budgetLimit").value);
    if (!category || !limit) return;
    state.budgets.push({ id: crypto.randomUUID(), category, limit });
    event.target.reset();
    saveState();
    renderAll();
  });

  document.getElementById("goalForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("goalName").value;
    const target = Number(document.getElementById("goalTarget").value);
    const date = document.getElementById("goalDate").value;
    state.goal = { name, target, date: new Date(date).toISOString() };
    saveState();
    renderAll();
  });

  document.getElementById("reminderForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("reminderName").value;
    const date = document.getElementById("reminderDate").value;
    const amount = Number(document.getElementById("reminderAmount").value);
    state.reminders.push({ id: crypto.randomUUID(), name, date: new Date(date).toISOString(), amount });
    event.target.reset();
    saveState();
    renderAll();
  });
};

const initMonth = () => {
  const now = new Date();
  monthSelect.value = getMonthKey(now);
  monthSelect.addEventListener("change", renderAll);
};

loadState();
seedIfEmpty();
initForms();
initMonth();
renderAll();
