// Entry point for AI-Powered Personal Finance Coach
// App logic for UI, data, and AI integration

// --- Data Model ---
let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

// --- UI Elements ---
const expenseForm = document.getElementById('expense-form');
const dashboard = document.getElementById('summary-cards');
const analysisContent = document.getElementById('analysis-content');
const predictionContent = document.getElementById('prediction-content');
const tipsContent = document.getElementById('tips-content');

// --- Utility Functions ---
function saveExpenses() {
	localStorage.setItem('expenses', JSON.stringify(expenses));
}

function addExpense(date, category, amount) {
	expenses.push({ date, category, amount: parseFloat(amount) });
	saveExpenses();
	updateDashboard();
	updateAnalysis();
	updatePredictions();
	updateTips();
}

function getTotalSpent() {
	return expenses.reduce((sum, e) => sum + e.amount, 0);
}

function getMonthlySpent(month, year) {
	return expenses.filter(e => {
		const d = new Date(e.date);
		return d.getMonth() === month && d.getFullYear() === year;
	}).reduce((sum, e) => sum + e.amount, 0);
}

function getCategoryTotals() {
	const totals = {};
	expenses.forEach(e => {
		if (!totals[e.category]) totals[e.category] = 0;
		totals[e.category] += e.amount;
	});
	return totals;
}

// --- UI Update Functions ---
function updateDashboard() {
	const now = new Date();
	const monthSpent = getMonthlySpent(now.getMonth(), now.getFullYear());
	dashboard.innerHTML = `
		<div class="summary-card">
			<div>Total Spent</div>
			<div style="font-size:1.5em;font-weight:bold;">$${getTotalSpent().toFixed(2)}</div>
		</div>
		<div class="summary-card">
			<div>This Month</div>
			<div style="font-size:1.5em;font-weight:bold;">$${monthSpent.toFixed(2)}</div>
		</div>
		<div class="summary-card">
			<div>Categories</div>
			<div style="font-size:1.1em;">${Object.keys(getCategoryTotals()).length}</div>
		</div>
	`;
}

function updateAnalysis() {
	if (expenses.length === 0) {
		analysisContent.innerHTML = '<em>No expenses yet. Add some to see analysis.</em>';
		return;
	}
	const totals = getCategoryTotals();
	let html = '<ul>';
	for (const cat in totals) {
		html += `<li><b>${cat}:</b> $${totals[cat].toFixed(2)}</li>`;
	}
	html += '</ul>';
	analysisContent.innerHTML = html;
}

function updatePredictions() {
	// Placeholder for AI predictions
	predictionContent.innerHTML = '<em>Expense prediction coming soon...</em>';
}

function updateTips() {
	// Placeholder for AI tips
	tipsContent.innerHTML = '<em>Personalized tips coming soon...</em>';
}

// --- Event Listeners ---
if (expenseForm) {
	expenseForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const date = document.getElementById('expense-date').value;
		const category = document.getElementById('expense-category').value.trim();
		const amount = document.getElementById('expense-amount').value;
		if (!date || !category || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
			alert('Please enter valid expense details.');
			return;
		}
		addExpense(date, category, amount);
		expenseForm.reset();
	});
}

// --- Initial Render ---
updateDashboard();
updateAnalysis();
updatePredictions();
updateTips();
