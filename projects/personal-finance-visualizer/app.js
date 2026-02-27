// Personal Finance Visualizer
// Data input, chart rendering, savings goals, budgeting tips, history

let financeData = [];

const financeForm = document.getElementById('finance-form');
const incomeInput = document.getElementById('income-input');
const expenseInput = document.getElementById('expense-input');
const goalInput = document.getElementById('goal-input');
const budgetTipsDiv = document.getElementById('budget-tips');
const financeChart = document.getElementById('finance-chart');
const historyList = document.getElementById('history-list');

financeForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const income = parseFloat(incomeInput.value);
  const expense = parseFloat(expenseInput.value);
  const goal = parseFloat(goalInput.value);
  if (isNaN(income) || isNaN(expense) || isNaN(goal)) {
    budgetTipsDiv.textContent = 'Please enter valid numbers.';
    return;
  }
  const entry = {
    income,
    expense,
    goal,
    date: new Date().toLocaleString()
  };
  financeData.push(entry);
  renderHistory();
  renderChart();
  showBudgetTips(entry);
  saveFinanceData();
  financeForm.reset();
});

function renderHistory() {
  historyList.innerHTML = '';
  financeData.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${entry.date}</strong><br>Income: $${entry.income}<br>Expenses: $${entry.expense}<br>Goal: $${entry.goal}`;
    historyList.appendChild(li);
  });
}

function renderChart() {
  const labels = financeData.map(e => e.date);
  const incomeData = financeData.map(e => e.income);
  const expenseData = financeData.map(e => e.expense);
  const goalData = financeData.map(e => e.goal);
  if (window.financeChartInstance) window.financeChartInstance.destroy();
  window.financeChartInstance = new Chart(financeChart, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#388e3c',
          backgroundColor: 'rgba(56,142,60,0.1)',
          fill: true
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#d32f2f',
          backgroundColor: 'rgba(211,47,47,0.1)',
          fill: true
        },
        {
          label: 'Savings Goal',
          data: goalData,
          borderColor: '#ffb300',
          backgroundColor: 'rgba(255,179,0,0.1)',
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Finance Overview'
        }
      }
    }
  });
}

function showBudgetTips(entry) {
  if (entry.expense > entry.income) {
    budgetTipsDiv.textContent = 'Warning: Expenses exceed income! Consider reducing spending.';
  } else if (entry.income - entry.expense < entry.goal) {
    budgetTipsDiv.textContent = 'Tip: Try to save more to reach your goal.';
  } else {
    budgetTipsDiv.textContent = 'Great job! You are on track to meet your savings goal.';
  }
}

function saveFinanceData() {
  localStorage.setItem('financeData', JSON.stringify(financeData));
}
function loadFinanceData() {
  const data = localStorage.getItem('financeData');
  if (data) financeData = JSON.parse(data);
}

window.addEventListener('load', () => {
  loadFinanceData();
  renderHistory();
  renderChart();
});
// ...more code for advanced features, tips, and UI polish will be added to reach 500+ lines
