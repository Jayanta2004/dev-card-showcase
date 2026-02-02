const form = document.getElementById('expense-form');
const expensesList = document.getElementById('expenses-list');
const summaryDiv = document.getElementById('summary');
let expenses = [];

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const payer = document.getElementById('payer').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const participants = document.getElementById('participants').value.split(',').map(p => p.trim()).filter(Boolean);
    if (!payer || !amount || participants.length === 0) return;
    expenses.push({ payer, amount, participants });
    form.reset();
    renderExpenses();
    renderSummary();
});

function renderExpenses() {
    expensesList.innerHTML = '<h3>Expenses</h3>' + expenses.map((exp, i) =>
        `<div><b>${exp.payer}</b> paid <b>₹${exp.amount.toFixed(2)}</b> for [${exp.participants.join(', ')}]</div>`
    ).join('');
}

function renderSummary() {
    const balances = {};
    expenses.forEach(exp => {
        const share = exp.amount / exp.participants.length;
        exp.participants.forEach(person => {
            if (!balances[person]) balances[person] = 0;
            balances[person] -= share;
        });
        if (!balances[exp.payer]) balances[exp.payer] = 0;
        balances[exp.payer] += exp.amount;
    });
    const people = Object.keys(balances);
    let summary = '<h3>Who Owes Whom</h3>';
    const owes = [];
    const debtors = people.filter(p => balances[p] < -0.01).sort((a,b) => balances[a]-balances[b]);
    const creditors = people.filter(p => balances[p] > 0.01).sort((a,b) => balances[b]-balances[a]);
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i], creditor = creditors[j];
        const debt = Math.min(-balances[debtor], balances[creditor]);
        owes.push(`<b>${debtor}</b> owes <b>${creditor}</b>: ₹${debt.toFixed(2)}`);
        balances[debtor] += debt;
        balances[creditor] -= debt;
        if (Math.abs(balances[debtor]) < 0.01) i++;
        if (Math.abs(balances[creditor]) < 0.01) j++;
    }
    summary += owes.length ? owes.join('<br>') : 'All settled!';
    summaryDiv.innerHTML = summary;
}
