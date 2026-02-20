// ===== Expense Tracker - Complete Script =====

// State Management
const state = {
    expenses: [],
    budgets: {},
    selectedMonth: new Date(),
    filteredExpenses: []
};

// Category Icons
const categoryIcons = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    utilities: '💡',
    shopping: '🛍️',
    health: '💪',
    other: '📌'
};

// DOM Elements
const elements = {
    expensesList: document.getElementById('expensesList'),
    expenseForm: document.getElementById('expenseForm'),
    expenseModal: document.getElementById('expenseModal'),
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    dateFromFilter: document.getElementById('dateFromFilter'),
    dateToFilter: document.getElementById('dateToFilter'),
    amountFromFilter: document.getElementById('amountFromFilter'),
    amountToFilter: document.getElementById('amountToFilter'),
    sortBy: document.getElementById('sortBy'),
    currentMonth: document.getElementById('currentMonth'),
    totalSpent: document.getElementById('totalSpent'),
    highestCategory: document.getElementById('highestCategory'),
    transactionCount: document.getElementById('transactionCount'),
    budgetCategory: document.getElementById('budgetCategory'),
    budgetAmount: document.getElementById('budgetAmount'),
    budgetsList: document.getElementById('budgetsList'),
    categorySummary: document.getElementById('categorySummary'),
    monthlySummaryTotal: document.getElementById('monthlySummaryTotal'),
    monthlyBudgetLimit: document.getElementById('monthlyBudgetLimit'),
    monthlyRemaining: document.getElementById('monthlyRemaining'),
    monthlyAverage: document.getElementById('monthlyAverage'),
    categoryChart: document.getElementById('categoryChart'),
    trendChart: document.getElementById('trendChart'),
    toast: document.getElementById('toast'),
    modalTitle: document.getElementById('modalTitle'),
    expenseAmount: document.getElementById('expenseAmount'),
    expenseDate: document.getElementById('expenseDate'),
    expenseCategory: document.getElementById('expenseCategory'),
    expenseDescription: document.getElementById('expenseDescription'),
    expenseNotes: document.getElementById('expenseNotes')
};

let editingExpenseId = null;

// ===== Utility Functions =====

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getMonthYear(date) {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function isSameMonth(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() && 
           date1.getMonth() === date2.getMonth();
}

// ===== Modal Functions =====

function openAddExpenseModal() {
    editingExpenseId = null;
    elements.modalTitle.textContent = 'Add New Expense';
    elements.expenseForm.reset();
    elements.expenseDate.valueAsDate = new Date();
    elements.expenseModal.classList.add('active');
}

function closeAddExpenseModal() {
    elements.expenseModal.classList.remove('active');
    editingExpenseId = null;
}

function openEditExpenseModal(id) {
    const expense = state.expenses.find(e => e.id === id);
    if (!expense) return;
    
    editingExpenseId = id;
    elements.modalTitle.textContent = 'Edit Expense';
    elements.expenseAmount.value = expense.amount;
    elements.expenseDate.value = expense.date;
    elements.expenseCategory.value = expense.category;
    elements.expenseDescription.value = expense.description;
    elements.expenseNotes.value = expense.notes;
    elements.expenseModal.classList.add('active');
}

// ===== Expense Management =====

function saveExpense(event) {
    event.preventDefault();
    
    const expense = {
        id: editingExpenseId || Date.now(),
        amount: parseFloat(elements.expenseAmount.value),
        date: elements.expenseDate.value,
        category: elements.expenseCategory.value,
        description: elements.expenseDescription.value,
        notes: elements.expenseNotes.value
    };
    
    if (editingExpenseId) {
        const index = state.expenses.findIndex(e => e.id === editingExpenseId);
        state.expenses[index] = expense;
        showToast('Expense updated!');
    } else {
        state.expenses.push(expense);
        showToast('Expense added!');
    }
    
    saveToLocalStorage();
    closeAddExpenseModal();
    applyFilters();
    updateDashboard();
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        state.expenses = state.expenses.filter(e => e.id !== id);
        saveToLocalStorage();
        applyFilters();
        updateDashboard();
        showToast('Expense deleted!');
    }
}

function duplicateExpense(id) {
    const expense = state.expenses.find(e => e.id === id);
    if (expense) {
        state.expenses.push({
            ...expense,
            id: Date.now()
        });
        saveToLocalStorage();
        applyFilters();
        updateDashboard();
        showToast('Expense duplicated!');
    }
}

// ===== Filter & Search =====

function applyFilters() {
    let filtered = state.expenses;
    
    // Search by description or notes
    const searchTerm = elements.searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(e => 
            e.description.toLowerCase().includes(searchTerm) ||
            e.notes.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    const category = elements.categoryFilter.value;
    if (category) {
        filtered = filtered.filter(e => e.category === category);
    }
    
    // Filter by date range
    const dateFrom = elements.dateFromFilter.value;
    const dateTo = elements.dateToFilter.value;
    if (dateFrom) {
        filtered = filtered.filter(e => e.date >= dateFrom);
    }
    if (dateTo) {
        filtered = filtered.filter(e => e.date <= dateTo);
    }
    
    // Filter by amount range
    const amountFrom = elements.amountFromFilter.value ? parseFloat(elements.amountFromFilter.value) : 0;
    const amountTo = elements.amountToFilter.value ? parseFloat(elements.amountToFilter.value) : Infinity;
    filtered = filtered.filter(e => e.amount >= amountFrom && e.amount <= amountTo);
    
    state.filteredExpenses = filtered;
    sortExpenses();
}

function resetFilters() {
    elements.searchInput.value = '';
    elements.categoryFilter.value = '';
    elements.dateFromFilter.value = '';
    elements.dateToFilter.value = '';
    elements.amountFromFilter.value = '';
    elements.amountToFilter.value = '';
    elements.sortBy.value = 'date-desc';
    applyFilters();
}

function sortExpenses() {
    const sortBy = elements.sortBy.value;
    const expenses = [...state.filteredExpenses];
    
    switch (sortBy) {
        case 'date-asc':
            expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'date-desc':
            expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'amount-asc':
            expenses.sort((a, b) => a.amount - b.amount);
            break;
        case 'amount-desc':
            expenses.sort((a, b) => b.amount - a.amount);
            break;
    }
    
    state.filteredExpenses = expenses;
    displayExpenses();
}

function displayExpenses() {
    if (state.filteredExpenses.length === 0) {
        elements.expensesList.innerHTML = '<div class="empty-state">No expenses found</div>';
        return;
    }
    
    elements.expensesList.innerHTML = state.filteredExpenses.map(expense => `
        <div class="expense-item" style="border-left-color: var(--${getCategoryColor(expense.category)})">
            <div class="expense-category-icon">${categoryIcons[expense.category] || '📌'}</div>
            <div class="expense-details">
                <div class="expense-description">${expense.description || expense.category}</div>
                <div class="expense-meta">${formatDate(expense.date)} • ${expense.category}</div>
                ${expense.notes ? `<div class="expense-meta">Note: ${expense.notes}</div>` : ''}
            </div>
            <div class="expense-amount">${formatCurrency(expense.amount)}</div>
            <div class="expense-actions">
                <button onclick="openEditExpenseModal(${expense.id})" title="Edit">✏️</button>
                <button onclick="duplicateExpense(${expense.id})" title="Duplicate">📋</button>
                <button onclick="deleteExpense(${expense.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ===== Budget Management =====

function setBudget() {
    const category = elements.budgetCategory.value;
    const amount = parseFloat(elements.budgetAmount.value);
    
    if (!category || !amount || amount <= 0) {
        showToast('Please select a category and enter a valid amount');
        return;
    }
    
    state.budgets[category] = amount;
    saveToLocalStorage();
    displayBudgets();
    elements.budgetCategory.value = '';
    elements.budgetAmount.value = '';
    showToast(`Budget set for ${category}!`);
}

function deleteBudget(category) {
    delete state.budgets[category];
    saveToLocalStorage();
    displayBudgets();
    showToast('Budget deleted');
}

function displayBudgets() {
    if (Object.keys(state.budgets).length === 0) {
        elements.budgetsList.innerHTML = '<div class="empty-state" style="font-size: 0.9rem;">No budgets set</div>';
        return;
    }
    
    elements.budgetsList.innerHTML = Object.entries(state.budgets).map(([category, budget]) => {
        const spent = getMonthSpentByCategory(category);
        const percentage = (spent / budget) * 100;
        const isWarning = percentage >= 80;
        
        return `
            <div class="budget-item ${isWarning ? 'warning' : ''}">
                <div class="budget-item-info">
                    <div class="budget-item-category">${category}</div>
                    <div class="budget-item-progress">
                        <div class="budget-item-progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="budget-item-text">
                        ${formatCurrency(spent)} / ${formatCurrency(budget)} (${percentage.toFixed(0)}%)
                        ${isWarning ? '<span style="color: var(--warning);">⚠️ Alert</span>' : ''}
                    </div>
                </div>
                <button onclick="deleteBudget('${category}')" style="background: var(--danger); color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer;">✕</button>
            </div>
        `;
    }).join('');
}

// ===== Analytics & Summary =====

function getMonthTotal() {
    return state.expenses
        .filter(e => isSameMonth(new Date(e.date), state.selectedMonth))
        .reduce((sum, e) => sum + e.amount, 0);
}

function getMonthSpentByCategory(category) {
    return state.expenses
        .filter(e => e.category === category && isSameMonth(new Date(e.date), state.selectedMonth))
        .reduce((sum, e) => sum + e.amount, 0);
}

function getMonthExpensesByCategory() {
    const expenses = state.expenses.filter(e => isSameMonth(new Date(e.date), state.selectedMonth));
    const byCategory = {};
    
    Object.keys(categoryIcons).forEach(cat => {
        byCategory[cat] = expenses
            .filter(e => e.category === cat)
            .reduce((sum, e) => sum + e.amount, 0);
    });
    
    return byCategory;
}

function getLastSevenDays() {
    const data = {};
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        data[dateStr] = 0;
    }
    
    state.expenses.forEach(e => {
        if (data.hasOwnProperty(e.date)) {
            data[e.date] += e.amount;
        }
    });
    
    return data;
}

function updateDashboard() {
    // Update quick stats
    const monthTotal = getMonthTotal();
    elements.totalSpent.textContent = formatCurrency(monthTotal);
    
    const monthExpenses = state.expenses.filter(e => isSameMonth(new Date(e.date), state.selectedMonth));
    elements.transactionCount.textContent = monthExpenses.length;
    
    // Highest category
    const byCategory = getMonthExpensesByCategory();
    const highestCat = Object.entries(byCategory).reduce((a, b) => a[1] > b[1] ? a : b);
    elements.highestCategory.textContent = highestCat[1] > 0 ? highestCat[0] : '-';
    
    // Update category summary
    updateCategorySummary();
    
    // Update monthly summary
    updateMonthlySummary();
    
    // Update budgets display
    displayBudgets();
    
    // Update charts
    updateCharts();
}

function updateCategorySummary() {
    const byCategory = getMonthExpensesByCategory();
    elements.categorySummary.innerHTML = Object.entries(byCategory)
        .filter(([, amount]) => amount > 0)
        .map(([category, amount]) => `
            <div class="category-summary-item">
                <span class="category-summary-label">${categoryIcons[category]} ${category}</span>
                <span class="category-summary-value">${formatCurrency(amount)}</span>
            </div>
        `).join('') || '<div class="empty-state" style="font-size: 0.9rem;">No expenses this month</div>';
}

function updateMonthlySummary() {
    const total = getMonthTotal();
    const monthExpenses = state.expenses.filter(e => isSameMonth(new Date(e.date), state.selectedMonth));
    const daysInMonth = new Date(state.selectedMonth.getFullYear(), state.selectedMonth.getMonth() + 1, 0).getDate();
    const average = total / daysInMonth;
    
    elements.monthlySummaryTotal.textContent = formatCurrency(total);
    elements.currentMonth.textContent = getMonthYear(state.selectedMonth);
    elements.monthlyAverage.textContent = formatCurrency(average);
    
    // Total budget
    const totalBudget = Object.values(state.budgets).reduce((sum, b) => sum + b, 0);
    if (totalBudget > 0) {
        elements.monthlyBudgetLimit.textContent = formatCurrency(totalBudget);
        elements.monthlyRemaining.textContent = formatCurrency(Math.max(0, totalBudget - total));
    } else {
        elements.monthlyBudgetLimit.textContent = 'Not Set';
        elements.monthlyRemaining.textContent = '-';
    }
}

function updateCharts() {
    drawCategoryChart();
    drawTrendChart();
}

function drawCategoryChart() {
    const ctx = elements.categoryChart.getContext('2d');
    const byCategory = getMonthExpensesByCategory();
    const categories = Object.entries(byCategory).filter(([, amount]) => amount > 0);
    
    if (categories.length === 0) {
        ctx.clearRect(0, 0, elements.categoryChart.width, elements.categoryChart.height);
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('No data', elements.categoryChart.width / 2, elements.categoryChart.height / 2);
        return;
    }
    
    const labels = categories.map(([cat]) => cat);
    const data = categories.map(([, amount]) => amount);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6'];
    
    drawPieChart(ctx, data, labels, colors, elements.categoryChart.width, elements.categoryChart.height);
}

function drawTrendChart() {
    const ctx = elements.trendChart.getContext('2d');
    const lastSevenDays = getLastSevenDays();
    const labels = Object.keys(lastSevenDays).map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }));
    const data = Object.values(lastSevenDays);
    
    drawLineChart(ctx, labels, data, elements.trendChart.width, elements.trendChart.height);
}

function drawPieChart(ctx, data, labels, colors, width, height) {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 30;
    
    const total = data.reduce((a, b) => a + b, 0);
    let currentAngle = -Math.PI / 2;
    
    data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${((value / total) * 100).toFixed(0)}%`, labelX, labelY);
        
        currentAngle += sliceAngle;
    });
    
    // Draw legend
    let legendY = 20;
    ctx.textAlign = 'left';
    ctx.font = '12px Arial';
    labels.forEach((label, index) => {
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(20, legendY, 12, 12);
        ctx.fillStyle = '#333';
        ctx.fillText(`${label}: ${formatCurrency(data[index])}`, 35, legendY + 6);
        legendY += 20;
    });
}

function drawLineChart(ctx, labels, data, width, height) {
    ctx.clearRect(0, 0, width, height);
    
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const maxValue = Math.max(...data, 1);
    const xStep = chartWidth / (labels.length - 1 || 1);
    const yScale = chartHeight / maxValue;
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Draw line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((value, index) => {
        const x = padding + index * xStep;
        const y = height - padding - value * yScale;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#6366f1';
    data.forEach((value, index) => {
        const x = padding + index * xStep;
        const y = height - padding - value * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
        const x = padding + index * xStep;
        ctx.fillText(label, x, height - padding + 20);
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * i;
        const y = height - padding - (chartHeight / 5) * i;
        ctx.fillText(formatCurrency(value), padding - 10, y + 4);
    }
}

// ===== Month Navigation =====

function previousMonth() {
    state.selectedMonth = new Date(state.selectedMonth.getFullYear(), state.selectedMonth.getMonth() - 1);
    updateDashboard();
}

function nextMonth() {
    state.selectedMonth = new Date(state.selectedMonth.getFullYear(), state.selectedMonth.getMonth() + 1);
    updateDashboard();
}

// ===== Export Functions =====

function exportToCSV() {
    let csv = 'Date,Category,Description,Amount,Notes\n';
    
    state.expenses.forEach(expense => {
        const date = formatDate(expense.date);
        const category = expense.category;
        const description = expense.description.replace(/"/g, '""');
        const amount = expense.amount;
        const notes = expense.notes.replace(/"/g, '""');
        
        csv += `"${date}","${category}","${description}","${amount}","${notes}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    
    showToast('CSV exported!');
}

function printExpenses() {
    const printWindow = window.open('', '_blank');
    let html = `
        <html>
        <head>
            <title>Expense Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .total { font-weight: bold; font-size: 1.2em; }
            </style>
        </head>
        <body>
            <h1>Expense Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <table>
                <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Notes</th>
                </tr>
    `;
    
    state.expenses.forEach(expense => {
        html += `
            <tr>
                <td>${formatDate(expense.date)}</td>
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>${formatCurrency(expense.amount)}</td>
                <td>${expense.notes}</td>
            </tr>
        `;
    });
    
    const total = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    html += `
            </table>
            <p class="total">Total: ${formatCurrency(total)}</p>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// ===== Helper Functions =====

function getCategoryColor(category) {
    const colors = {
        food: 'primary',
        transport: 'warning',
        entertainment: 'info',
        utilities: 'secondary',
        shopping: 'danger',
        health: 'success',
        other: 'text-light'
    };
    return colors[category] || 'primary';
}

// ===== LocalStorage =====

function saveToLocalStorage() {
    localStorage.setItem('expenseTrackerData', JSON.stringify({
        expenses: state.expenses,
        budgets: state.budgets
    }));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('expenseTrackerData');
    if (saved) {
        const data = JSON.parse(saved);
        state.expenses = data.expenses || [];
        state.budgets = data.budgets || {};
    }
}

// ===== Event Listeners =====

elements.expenseForm.addEventListener('submit', saveExpense);
elements.searchInput.addEventListener('input', applyFilters);
elements.categoryFilter.addEventListener('change', applyFilters);
elements.dateFromFilter.addEventListener('change', applyFilters);
elements.dateToFilter.addEventListener('change', applyFilters);
elements.amountFromFilter.addEventListener('input', applyFilters);
elements.amountToFilter.addEventListener('input', applyFilters);
elements.sortBy.addEventListener('change', sortExpenses);

// Close modal on outside click
elements.expenseModal.addEventListener('click', (e) => {
    if (e.target === elements.expenseModal) {
        closeAddExpenseModal();
    }
});

// ===== Initialization =====

function init() {
    loadFromLocalStorage();
    updateDashboard();
    applyFilters();
    elements.currentMonth.textContent = getMonthYear(state.selectedMonth);
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
