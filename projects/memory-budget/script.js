let transactions = [];
let currentType = "income";

const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const list = document.getElementById("list");
const memoryText = document.getElementById("memoryText");

const amountInput = document.getElementById("amount");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");

const incomeBtn = document.getElementById("incomeBtn");
const expenseBtn = document.getElementById("expenseBtn");

/* Toggle income / expense */
function setType(type) {
    currentType = type;

    if (type === "income") {
        incomeBtn.classList.add("active");
        expenseBtn.classList.remove("active");
        amountInput.placeholder = "Income amount";
    } else {
        expenseBtn.classList.add("active");
        incomeBtn.classList.remove("active");
        amountInput.placeholder = "Expense amount";
    }
}

/* Add transaction */
function addTransaction() {
    const title = titleInput.value.trim();
    const amount = +amountInput.value;
    const category = categoryInput.value;

    if (title === "" || amount <= 0) {
        alert("Please enter valid details");
        return;
    }

    const transaction = {
        id: Date.now(),
        title,
        amount,
        category,
        type: currentType
    };

    transactions.push(transaction);

    updateUI();
    updateMemory();

    titleInput.value = "";
    amountInput.value = "";
}

/* Update UI */
function updateUI() {
    list.innerHTML = "";

    let income = 0;
    let expense = 0;

    transactions.forEach(tx => {
        if (tx.type === "income") income += tx.amount;
        else expense += tx.amount;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${tx.title} <small>(${tx.category})</small></span>
            <strong style="color:${tx.type === "income" ? "#22c55e" : "#ef4444"}">
                ${tx.type === "income" ? "+" : "-"}₹${tx.amount}
            </strong>
        `;
        list.prepend(li);
    });

    incomeEl.textContent = `₹${income}`;
    expenseEl.textContent = `₹${expense}`;
    balanceEl.textContent = `₹${income - expense}`;
}

/* Budget Memory Logic */
function updateMemory() {
    if (transactions.length < 2) {
        memoryText.textContent = "Keep adding transactions to build spending insights.";
        return;
    }

    const last = transactions[transactions.length - 1];

    if (last.type === "expense" && last.amount > 1000) {
        memoryText.textContent =
            `⚠️ High spending detected on ${last.category}. Watch your habits.`;
    } else if (last.type === "income") {
        memoryText.textContent =
            `💡 Income added. Consider saving a portion for future goals.`;
    } else {
        memoryText.textContent =
            `📊 You're managing your budget consistently.`;
    }
}

/* Init */
setType("income");
