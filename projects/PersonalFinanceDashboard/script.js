const state = {
  transactions: [],
  budgets: [],
  goal: null,
  reminders: [],
};

const storageKey = "finance-dashboard";

const monthSelect = document.getElementById("monthSelect");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const netSavingsEl = document.getElementById("netSavings");
const goalProgressEl = document.getElementById("goalProgress");
const goalRemainingEl = document.getElementById("goalRemaining");
const incomeTrendEl = document.getElementById("incomeTrend");
const expenseTrendEl = document.getElementById("expenseTrend");
const savingsRateEl = document.getElementById("savingsRate");
const budgetList = document.getElementById("budgetList");
const reminderList = document.getElementById("reminderList");
const transactionTable = document.getElementById("transactionTable");
const monthlyReport = document.getElementById("monthlyReport");
const goalTitle = document.getElementById("goalTitle");
const goalMeta = document.getElementById("goalMeta");
const goalBar = document.getElementById("goalBar");

let trendChart;
let categoryChart;

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const loadState = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  const data = JSON.parse(saved);
  state.transactions = data.transactions || [];
  state.budgets = data.budgets || [];
  state.goal = data.goal || null;
  state.reminders = data.reminders || [];
};

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const seedIfEmpty = () => {
  if (state.transactions.length) return;
  const today = new Date();
  const sample = [
    { type: "income", category: "Salary", amount: 4200, date: new Date(today.getFullYear(), today.getMonth(), 1), note: "Monthly salary" },
    { type: "expense", category: "Rent", amount: 1300, date: new Date(today.getFullYear(), today.getMonth(), 3), note: "Apartment rent" },
    { type: "expense", category: "Groceries", amount: 320, date: new Date(today.getFullYear(), today.getMonth(), 8), note: "Weekly groceries" },
    { type: "expense", category: "Utilities", amount: 180, date: new Date(today.getFullYear(), today.getMonth(), 12), note: "Electricity" },
  ];
  state.transactions = sample.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    date: item.date.toISOString(),
  }));
  state.budgets = [
    { id: crypto.randomUUID(), category: "Groceries", limit: 600 },
    { id: crypto.randomUUID(), category: "Entertainment", limit: 250 },
  ];
  state.goal = {
    name: "Emergency Fund",
    target: 5000,
    date: new Date(today.getFullYear(), today.getMonth() + 6, 1).toISOString(),
  };
  state.reminders = [
    { id: crypto.randomUUID(), name: "Credit Card", amount: 120, date: new Date(today.getFullYear(), today.getMonth(), 20).toISOString() },
  ];
  saveState();
};

const getSelectedMonth = () => {
  if (!monthSelect.value) return getMonthKey(new Date());
  return monthSelect.value;
};

const filterByMonth = (monthKey) =>
  state.transactions.filter((tx) => getMonthKey(new Date(tx.date)) === monthKey);

const sumByType = (transactions, type) =>
  transactions.filter((tx) => tx.type === type).reduce((sum, tx) => sum + Number(tx.amount), 0);

const groupByCategory = (transactions) =>
  transactions.reduce((acc, tx) => {
    if (tx.type !== "expense") return acc;
    acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
    return acc;
  }, {});

const getMonthlyTotals = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
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
