// Select elements
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const balanceEl = document.getElementById('balance');

// Load transactions from LocalStorage or start empty
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Update LocalStorage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Calculate totals
function calculateSummary() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  totalIncomeEl.textContent = income;
  totalExpenseEl.textContent = expense;
  balanceEl.textContent = income - expense;
}

// Render all transactions
function renderTransactions() {
  transactionList.innerHTML = '';

  transactions.forEach((transaction, index) => {
    const li = document.createElement('li');
    li.classList.add(transaction.type);

    li.innerHTML = `
      <span>${transaction.title} (${transaction.type})</span>
      <span>₹${transaction.amount} <button class="delete-btn">x</button></span>
    `;

    // Attach delete event listener properly
    li.querySelector('.delete-btn').addEventListener('click', () => {
      deleteTransaction(index);
    });

    transactionList.appendChild(li);
  });

  calculateSummary();
}

// Delete transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);  // Remove from array
  updateLocalStorage();           // Update LocalStorage
  renderTransactions();           // Re-render list
}

// Add transaction form submit
transactionForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  if(title && !isNaN(amount)) {
    transactions.push({ title, amount, type });
    updateLocalStorage();
    renderTransactions();
    transactionForm.reset();
  }
});

// Initial render
renderTransactions();
