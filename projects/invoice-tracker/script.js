let invoices = [];

const clientName = document.getElementById("clientName");
const invoiceDate = document.getElementById("invoiceDate");
const invoiceAmount = document.getElementById("invoiceAmount");
const invoiceStatus = document.getElementById("invoiceStatus");
const addInvoice = document.getElementById("addInvoice");
const invoiceCards = document.getElementById("invoiceCards");
const totalCount = document.getElementById("totalCount");
const totalAmount = document.getElementById("totalAmount");
const paidAmount = document.getElementById("paidAmount");
const unpaidAmount = document.getElementById("unpaidAmount");
const searchClient = document.getElementById("searchClient");
const filterStatus = document.getElementById("filterStatus");
const exportCSV = document.getElementById("exportCSV");

addInvoice.addEventListener("click", () => {
  if (!clientName.value || !invoiceDate.value || !invoiceAmount.value) return;

  invoices.push({
    client: clientName.value,
    date: invoiceDate.value,
    amount: parseFloat(invoiceAmount.value),
    status: invoiceStatus.value
  });

  renderInvoices();
  clientName.value = '';
  invoiceDate.value = '';
  invoiceAmount.value = '';
});

function renderInvoices() {
  invoiceCards.innerHTML = '';

  const filtered = invoices.filter(inv => {
    const matchesClient = inv.client.toLowerCase().includes(searchClient.value.toLowerCase());
    const matchesStatus = filterStatus.value === "all" || inv.status === filterStatus.value;
    return matchesClient && matchesStatus;
  });

  filtered.forEach((inv, index) => {
    const div = document.createElement("div");
    div.className = "invoice-card";
    div.innerHTML = `
      <h3>${inv.client}</h3>
      <p>Date: ${inv.date}</p>
      <p>Amount: $${inv.amount.toFixed(2)}</p>
      <span class="status ${inv.status}">${inv.status.toUpperCase()}</span>
    `;
    invoiceCards.appendChild(div);
  });

  updateTotals(filtered);
}

function updateTotals(filtered) {
  totalCount.textContent = filtered.length;
  totalAmount.textContent = filtered.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2);
  paidAmount.textContent = filtered.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0).toFixed(2);
  unpaidAmount.textContent = filtered.filter(i => i.status === "unpaid").reduce((sum, i) => sum + i.amount, 0).toFixed(2);
}

// Filters
searchClient.addEventListener("input", renderInvoices);
filterStatus.addEventListener("change", renderInvoices);

// Export CSV
exportCSV.addEventListener("click", () => {
  let csv = "Client,Date,Amount,Status\n";
  invoices.forEach(inv => {
    csv += `${inv.client},${inv.date},${inv.amount},${inv.status}\n`;
  });
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invoices.csv";
  a.click();
  URL.revokeObjectURL(url);
});