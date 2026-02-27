const historyContent = document.getElementById('history-content');
function updateHistory() {
	if (expenses.length === 0) {
		historyContent.innerHTML = '<em>No expenses recorded yet.</em>';
		return;
	}
	let html = '<table style="width:100%;border-collapse:collapse;">';
	html += '<tr style="background:#f0f4f8;"><th>Date</th><th>Category</th><th>Amount</th><th>Action</th></tr>';
	expenses.slice().reverse().forEach((e, idx) => {
		html += `<tr><td>${e.date}</td><td>${e.category}</td><td>$${e.amount.toFixed(2)}</td><td><button data-idx="${expenses.length-1-idx}" class="del-btn">Delete</button></td></tr>`;
	});
	html += '</table>';
	historyContent.innerHTML = html;
	// Attach delete listeners
	document.querySelectorAll('.del-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const idx = parseInt(this.getAttribute('data-idx'));
			expenses.splice(idx, 1);
			saveExpenses();
			updateDashboard();
			updateAnalysis();
			updatePredictions();
			updateTips();
			updateHistory();
		});
	});
}
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
	let html = '<h3>Category Breakdown</h3><ul>';
	for (const cat in totals) {
		html += `<li><b>${cat}:</b> $${totals[cat].toFixed(2)}</li>`;
	}
	html += '</ul>';

	// Monthly trend
	const months = {};
	expenses.forEach(e => {
		const d = new Date(e.date);
		const key = `${d.getFullYear()}-${d.getMonth()+1}`;
		if (!months[key]) months[key] = 0;
		months[key] += e.amount;
	});
	const sortedMonths = Object.keys(months).sort();
	html += '<h3>Monthly Spending Trend</h3>';
	html += '<canvas id="trendChart" width="400" height="120"></canvas>';
	html += '<ul>';
	sortedMonths.forEach(m => {
		html += `<li>${m}: $${months[m].toFixed(2)}</li>`;
	});
	html += '</ul>';

	analysisContent.innerHTML = html;

	// Draw simple bar chart
	setTimeout(() => {
		const canvas = document.getElementById('trendChart');
		if (canvas) {
			const ctx = canvas.getContext('2d');
			ctx.clearRect(0,0,canvas.width,canvas.height);
			const max = Math.max(...Object.values(months));
			const barW = 40;
			const gap = 20;
			sortedMonths.forEach((m, i) => {
				const h = (months[m]/max) * 90;
				ctx.fillStyle = '#2a7ae2';
				ctx.fillRect(i*(barW+gap)+10, 110-h, barW, h);
				ctx.fillStyle = '#333';
				ctx.font = '12px Arial';
				ctx.fillText(m, i*(barW+gap)+10, 118);
			});
		}
	}, 100);
}

function updatePredictions() {
	if (expenses.length < 3) {
		predictionContent.innerHTML = '<em>Need at least 3 months of data for predictions.</em>';
		return;
	}
	// Prepare monthly totals
	const months = {};
	expenses.forEach(e => {
		const d = new Date(e.date);
		const key = `${d.getFullYear()}-${d.getMonth()+1}`;
		if (!months[key]) months[key] = 0;
		months[key] += e.amount;
	});
	const sortedMonths = Object.keys(months).sort();
	const y = sortedMonths.map(m => months[m]);
	// Linear regression (y = a*x + b)
	const n = y.length;
	const x = Array.from({length: n}, (_, i) => i+1);
	const sumX = x.reduce((a,b) => a+b, 0);
	const sumY = y.reduce((a,b) => a+b, 0);
	const sumXY = x.reduce((a,b,i) => a + b*y[i], 0);
	const sumX2 = x.reduce((a,b) => a + b*b, 0);
	const a = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
	const b = (sumY - a*sumX) / n;
	const nextMonth = n+1;
	const prediction = a*nextMonth + b;
	predictionContent.innerHTML = `<b>Predicted next month spending:</b> $${prediction.toFixed(2)}<br><small>(Based on linear trend of your monthly totals)</small>`;
}

function updateTips() {
	if (expenses.length === 0) {
		tipsContent.innerHTML = '<em>Add expenses to get personalized tips.</em>';
		return;
	}
	const totals = getCategoryTotals();
	const now = new Date();
	const monthSpent = getMonthlySpent(now.getMonth(), now.getFullYear());
	let tips = [];
	// Tip 1: High spending category
	let maxCat = null, maxVal = 0;
	for (const cat in totals) {
		if (totals[cat] > maxVal) {
			maxVal = totals[cat];
			maxCat = cat;
		}
	}
	if (maxCat && maxVal > 0) {
		tips.push(`You spent the most on <b>${maxCat}</b> this month. Consider reviewing these expenses for savings opportunities.`);
	}
	// Tip 2: Monthly budget suggestion
	const avg = expenses.length > 0 ? (getTotalSpent() / (expenses.length/30)) : 0;
	if (monthSpent > avg * 1.2) {
		tips.push('Your spending this month is above your average. Try to set a budget and track your daily expenses.');
	} else if (monthSpent < avg * 0.8) {
		tips.push('Great job! Your spending this month is below your average. Consider saving or investing the surplus.');
	}
	// Tip 3: Savings encouragement
	if (monthSpent > 0 && monthSpent < 500) {
		tips.push('You are keeping your monthly expenses low. Consider automating a small transfer to savings or investments.');
	}
	// Tip 4: Category diversification
	if (Object.keys(totals).length < 3) {
		tips.push('Most of your spending is concentrated in a few categories. Try to diversify or review your expense categories for better tracking.');
	}
	if (tips.length === 0) tips.push('Keep tracking your expenses for more personalized tips!');
	tipsContent.innerHTML = '<ul>' + tips.map(t => `<li>${t}</li>`).join('') + '</ul>';
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
		updateHistory();
	});
}

// --- Initial Render ---
updateDashboard();
updateAnalysis();
updatePredictions();
updateTips();
updateHistory();
