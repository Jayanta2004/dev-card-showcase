// Elements
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");
const addBtn = document.getElementById("addBtn");
const expenseList = document.getElementById("expenseList");
const filterCategory = document.getElementById("filterCategory");
const totalAmountRight = document.getElementById("totalAmountRight");
const totalAmountHeader = document.getElementById("totalAmount");
const currencySelect = document.getElementById("currency");
const currencySymbol = document.getElementById("currencySymbol");
const currencySymbolRight = document.getElementById("currencySymbolRight");
const categorySummary = document.getElementById("categorySummary");
const lineChartCanvas = document.getElementById("lineChart");
const barChartCanvas = document.getElementById("barChart");
const pieChartCanvas = document.getElementById("pieChart");

// Load expenses
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let currency = localStorage.getItem("currency") || "$";
currencySelect.value = currency;
currencySymbol.textContent = currency;
currencySymbolRight.textContent = currency;

let lineChart, barChart, pieChart;

// Render expenses
function renderExpenses() {
  const filter = filterCategory.value;
  expenseList.innerHTML = "";

  const filtered = expenses.filter(exp => filter === "All" || exp.category === filter);

  if (!filtered.length) {
    expenseList.innerHTML = `<p style="text-align:center;color:#555;">No expenses found</p>`;
    updateTotal();
    renderCategorySummary();
    renderCharts();
    return;
  }

  filtered.forEach((exp, index) => {
    const card = document.createElement("div");
    card.className = "expense-card";

    card.innerHTML = `
      <div class="expense-info">
        <h3>${exp.title}</h3>
        <p>${currency}${exp.amount}</p>
        <p>📅 ${exp.date}</p>
        <p>🏷️ ${exp.category}</p>
      </div>
      <div class="actions">
        <button onclick="editExpense(${index})" title="Edit">✏️</button>
        <button onclick="deleteExpense(${index})" title="Delete">🗑️</button>
      </div>
    `;

    expenseList.appendChild(card);
  });

  updateTotal();
  renderCategorySummary();
  renderCharts();
}

// Update total
function updateTotal() {
  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  totalAmountRight.textContent = total.toFixed(2);
  totalAmountHeader.textContent = total.toFixed(2);
}

// Category summary cards
function renderCategorySummary() {
  const categories = ["Food","Travel","Shopping","Bills","Others"];
  categorySummary.innerHTML = "";
  categories.forEach(cat => {
    const totalCat = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + Number(e.amount),0);
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `<h4>${cat}</h4><p>${currency}${totalCat.toFixed(2)}</p>`;
    categorySummary.appendChild(card);
  });
}

// Charts: Line, Bar, Pie
function renderCharts() {
  const categories = ["Food","Travel","Shopping","Bills","Others"];
  const catData = categories.map(cat => expenses.filter(e => e.category === cat).reduce((sum,e)=>sum+Number(e.amount),0));

  const dates = [...new Set(expenses.map(e=>e.date))].sort();
  const dailyData = dates.map(date => expenses.filter(e=>e.date===date).reduce((sum,e)=>sum+Number(e.amount),0));

  // Destroy old charts if exist
  if(lineChart) lineChart.destroy();
  if(barChart) barChart.destroy();
  if(pieChart) pieChart.destroy();

  // Line Chart
  lineChart = new Chart(lineChartCanvas.getContext("2d"),{
    type:'line',
    data:{labels:dates,datasets:[{label:'Daily Expenses',data:dailyData,fill:false,borderColor:'#ff6384',tension:0.2,pointBackgroundColor:'#ff6384'}]},
    options:{responsive:true,plugins:{legend:{display:true}}}
  });

  // Bar Chart
  barChart = new Chart(barChartCanvas.getContext("2d"),{
    type:'bar',
    data:{labels:categories,datasets:[{label:'Expenses by Category',data:catData,backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF']}]},
    options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
  });

  // Pie Chart
  pieChart = new Chart(pieChartCanvas.getContext("2d"),{
    type:'pie',
    data:{labels:categories,datasets:[{label:'Expenses',data:catData,backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'],hoverOffset:10}]},
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom'},
        tooltip:{callbacks:{label:function(context){return `${context.label}: ${currency}${context.raw}`;}}}
      }
    }
  });
}

// Add expense
addBtn.onclick = () => {
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const category = categoryInput.value;

  if (!title || !amount || !date || !category) {
    alert("Please fill all fields");
    return;
  }

  expenses.push({ title, amount, date, category });
  localStorage.setItem("expenses", JSON.stringify(expenses));

  titleInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
  categoryInput.value = "";

  renderExpenses();
};

// Delete
window.deleteExpense = (index) => {
  if (!confirm("Delete this expense?")) return;
  expenses.splice(index,1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();
};

// Edit
window.editExpense = (index) => {
  const exp = expenses[index];
  titleInput.value = exp.title;
  amountInput.value = exp.amount;
  dateInput.value = exp.date;
  categoryInput.value = exp.category;

  expenses.splice(index,1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();
};

// Filter
filterCategory.onchange = renderExpenses;

// Currency change
currencySelect.onchange = () => {
  currency = currencySelect.value;
  localStorage.setItem("currency", currency);
  currencySymbol.textContent = currency;
  currencySymbolRight.textContent = currency;
  renderExpenses();
};

// Initial render
renderExpenses();
