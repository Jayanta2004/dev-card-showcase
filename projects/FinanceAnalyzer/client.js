// Basic client-side logic for file import, transaction display, and chart rendering
const fileInput = document.getElementById('fileInput');
const importBtn = document.getElementById('importBtn');
const transactionsTable = document.getElementById('transactionsTable').querySelector('tbody');
const chartsDiv = document.getElementById('charts');
const recommendationsDiv = document.getElementById('recommendations');

importBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) return alert('Please select a file.');
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        // For demo: parse CSV, categorize, and visualize
        const rows = text.split('\n').slice(1); // skip header
        const transactions = rows.map(row => {
            const cols = row.split(',');
            return {
                date: cols[0],
                description: cols[1],
                amount: parseFloat(cols[2]),
                category: categorize(cols[1], parseFloat(cols[2]))
            };
        }).filter(t => t.date);
        renderTransactions(transactions);
        renderCharts(transactions);
        renderRecommendations(transactions);
    };
    reader.readAsText(file);
});

function categorize(desc, amt) {
    // Simple ML-like categorization (stub)
    if (/grocery|mart|food/i.test(desc)) return 'Groceries';
    if (/uber|ola|taxi|cab/i.test(desc)) return 'Transport';
    if (/rent|lease/i.test(desc)) return 'Rent';
    if (amt < 0) return 'Income';
    return 'Other';
}

function renderTransactions(transactions) {
    transactionsTable.innerHTML = '';
    transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${t.date}</td><td>${t.description}</td><td>${t.amount}</td><td>${t.category}</td>`;
        transactionsTable.appendChild(tr);
    });
}

function renderCharts(transactions) {
    chartsDiv.innerHTML = '<canvas id="spendingChart" height="120"></canvas>';
    const ctx = document.getElementById('spendingChart').getContext('2d');
    const categories = {};
    transactions.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    });
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#4f8cff','#ffb347','#ff6961','#77dd77','#f9cb9c']
            }]
        },
        options: {
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function renderRecommendations(transactions) {
    // Simple recommendations (stub)
    const totalSpent = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    let msg = '';
    if (totalSpent > 50000) msg = 'Consider reducing your monthly expenses.';
    else msg = 'Great job keeping your spending in check!';
    recommendationsDiv.innerHTML = `<div class="recommendation">${msg}</div>`;
}
