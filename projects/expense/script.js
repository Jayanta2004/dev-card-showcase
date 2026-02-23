        // Sample initial data
        let expenses = [
            { id: 1, name: "Cozy Blanket", amount: 45.00, category: "home", date: "2023-10-15" },
            { id: 2, name: "Tea & Bookstore Visit", amount: 28.50, category: "food", date: "2023-10-14" },
            { id: 3, name: "Yoga Class", amount: 20.00, category: "care", date: "2023-10-12" },
            { id: 4, name: "Savings Deposit", amount: 200.00, category: "savings", date: "2023-10-10" },
            { id: 5, name: "Gas for Autumn Drive", amount: 35.00, category: "transport", date: "2023-10-08" },
            { id: 6, name: "Streaming Subscription", amount: 14.99, category: "media", date: "2023-10-05" }
        ];

        // Category mapping
        const categoryDetails = {
            home: { name: "Home & Hearth", color: "#A3B18A", icon: "fa-home" },
            food: { name: "Nourishment", color: "#BC8F8F", icon: "fa-utensils" },
            care: { name: "Gentle Care", color: "#D4A6A6", icon: "fa-spa" },
            savings: { name: "Future Comfort", color: "#D4B483", icon: "fa-piggy-bank" },
            transport: { name: "Journeying", color: "#A8C3B8", icon: "fa-car" },
            media: { name: "Comfort Media", color: "#C9A8B8", icon: "fa-book" },
            gifts: { name: "Heartwarming Gifts", color: "#D4A6A6", icon: "fa-gift" }
        };

        // DOM Elements
        const expenseList = document.getElementById('expenseList');
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        const expenseNameInput = document.getElementById('expenseName');
        const expenseAmountInput = document.getElementById('expenseAmount');
        const expenseCategoryInput = document.getElementById('expenseCategory');
        const expenseDateInput = document.getElementById('expenseDate');
        
        // Stats elements
        const totalExpensesEl = document.getElementById('totalExpenses');
        const remainingBudgetEl = document.getElementById('remainingBudget');
        const topCategoryEl = document.getElementById('topCategory');
        const dailyAverageEl = document.getElementById('dailyAverage');
        const monthlyBudgetEl = document.getElementById('monthlyBudget');
        const monthlySpentEl = document.getElementById('monthlySpent');
        const expenseCountEl = document.getElementById('expenseCount');
        
        // Category total elements
        const catHomeEl = document.getElementById('cat-home');
        const catFoodEl = document.getElementById('cat-food');
        const catCareEl = document.getElementById('cat-care');
        const catSavingsEl = document.getElementById('cat-savings');
        const catTransportEl = document.getElementById('cat-transport');
        const catMediaEl = document.getElementById('cat-media');

        // Initialize date to today
        expenseDateInput.valueAsDate = new Date();

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            renderExpenses();
            updateStats();
            
            // Add event listeners to category items
            document.querySelectorAll('.category-list li').forEach(item => {
                item.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    filterExpensesByCategory(category);
                });
            });
        });

        // Add expense event listener
        addExpenseBtn.addEventListener('click', addExpense);

        // Function to add a new expense
        function addExpense() {
            const name = expenseNameInput.value.trim();
            const amount = parseFloat(expenseAmountInput.value);
            const category = expenseCategoryInput.value;
            const date = expenseDateInput.value;

            // Validation
            if (!name || isNaN(amount) || amount <= 0) {
                alert("Please enter a valid expense name and amount.");
                return;
            }

            // Create new expense object
            const newExpense = {
                id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
                name,
                amount,
                category,
                date
            };

            // Add to expenses array
            expenses.push(newExpense);

            // Clear form inputs
            expenseNameInput.value = '';
            expenseAmountInput.value = '';

            // Re-render expenses and update stats
            renderExpenses();
            updateStats();

            // Show success message
            showNotification(`Added "${name}" to your cozy log!`);
        }

        // Function to render expenses
        function renderExpenses(filteredExpenses = null) {
            const expensesToRender = filteredExpenses || expenses;
            
            // If no expenses, show the empty state
            if (expensesToRender.length === 0) {
                expenseList.innerHTML = `
                    <div class="no-expenses">
                        <i class="fas fa-feather-alt"></i>
                        <p>No expenses to show. Add your first cozy expense to begin your gentle finance journey.</p>
                    </div>
                `;
                return;
            }

            // Clear expense list
            expenseList.innerHTML = '';

            // Sort expenses by date (newest first)
            const sortedExpenses = [...expensesToRender].sort((a, b) => new Date(b.date) - new Date(a.date));

            // Create expense items
            sortedExpenses.forEach(expense => {
                const category = categoryDetails[expense.category];
                const formattedDate = formatDate(expense.date);
                
                const expenseItem = document.createElement('div');
                expenseItem.className = 'expense-item';
                expenseItem.style.borderLeftColor = category.color;
                expenseItem.setAttribute('data-id', expense.id);
                
                expenseItem.innerHTML = `
                    <div class="expense-category">
                        <div class="category-icon" style="background-color: ${category.color}">
                            <i class="fas ${category.icon}"></i>
                        </div>
                        <div>
                            <div class="expense-name">${expense.name}</div>
                            <div class="expense-category-name">${category.name}</div>
                        </div>
                    </div>
                    <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                    <div class="expense-date">${formattedDate}</div>
                    <div class="expense-actions">
                        <div class="action-btn edit-btn" title="Edit expense">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="action-btn delete-btn" title="Delete expense">
                            <i class="fas fa-trash-alt"></i>
                        </div>
                    </div>
                `;
                
                expenseList.appendChild(expenseItem);
            });

            // Add event listeners to action buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const expenseId = parseInt(this.closest('.expense-item').getAttribute('data-id'));
                    editExpense(expenseId);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const expenseId = parseInt(this.closest('.expense-item').getAttribute('data-id'));
                    deleteExpense(expenseId);
                });
            });
        }

        // Function to filter expenses by category
        function filterExpensesByCategory(category) {
            if (!category) {
                renderExpenses();
                return;
            }
            
            const filteredExpenses = expenses.filter(expense => expense.category === category);
            renderExpenses(filteredExpenses);
            
            // Update the "no expenses" message for filtered view
            if (filteredExpenses.length === 0) {
                expenseList.innerHTML = `
                    <div class="no-expenses">
                        <i class="fas fa-feather-alt"></i>
                        <p>No expenses in the "${categoryDetails[category].name}" category yet.</p>
                    </div>
                `;
            }
        }

        // Function to edit an expense
        function editExpense(id) {
            const expense = expenses.find(e => e.id === id);
            if (!expense) return;

            // Fill the form with expense data
            expenseNameInput.value = expense.name;
            expenseAmountInput.value = expense.amount;
            expenseCategoryInput.value = expense.category;
            expenseDateInput.value = expense.date;

            // Remove the expense from the list
            expenses = expenses.filter(e => e.id !== id);

            // Update the display
            renderExpenses();
            updateStats();

            // Show notification
            showNotification(`Editing "${expense.name}" - update the details and click "Add Cozy Expense" to save.`);
        }

        // Function to delete an expense
        function deleteExpense(id) {
            const expense = expenses.find(e => e.id === id);
            if (!expense) return;

            if (confirm(`Are you sure you want to delete "${expense.name}"?`)) {
                expenses = expenses.filter(e => e.id !== id);
                renderExpenses();
                updateStats();
                showNotification(`Removed "${expense.name}" from your cozy log.`);
            }
        }

        // Function to update stats
        function updateStats() {
            // Calculate totals
            const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const budget = 1500; // Monthly budget
            const remaining = budget - total;
            const expenseCount = expenses.length;
            
            // Calculate daily average (assuming 30 days)
            const dailyAvg = total / 30;
            
            // Calculate category totals
            const categoryTotals = {};
            Object.keys(categoryDetails).forEach(cat => {
                categoryTotals[cat] = expenses
                    .filter(e => e.category === cat)
                    .reduce((sum, e) => sum + e.amount, 0);
            });
            
            // Find top category
            let topCategory = "-";
            let topCategoryAmount = 0;
            
            Object.keys(categoryTotals).forEach(cat => {
                if (categoryTotals[cat] > topCategoryAmount) {
                    topCategoryAmount = categoryTotals[cat];
                    topCategory = categoryDetails[cat].name;
                }
            });
            
            // Update DOM elements
            totalExpensesEl.textContent = `$${total.toFixed(2)}`;
            remainingBudgetEl.textContent = `$${remaining.toFixed(2)}`;
            topCategoryEl.textContent = topCategory;
            dailyAverageEl.textContent = `$${dailyAvg.toFixed(2)}`;
            monthlyBudgetEl.textContent = `$${budget.toFixed(2)}`;
            monthlySpentEl.textContent = `$${total.toFixed(2)}`;
            expenseCountEl.textContent = expenseCount;
            
            // Update category totals
            catHomeEl.textContent = `$${categoryTotals.home.toFixed(2)}`;
            catFoodEl.textContent = `$${categoryTotals.food.toFixed(2)}`;
            catCareEl.textContent = `$${categoryTotals.care.toFixed(2)}`;
            catSavingsEl.textContent = `$${categoryTotals.savings.toFixed(2)}`;
            catTransportEl.textContent = `$${categoryTotals.transport.toFixed(2)}`;
            catMediaEl.textContent = `$${categoryTotals.media.toFixed(2)}`;
            
            // Update remaining budget color
            if (remaining < 0) {
                remainingBudgetEl.classList.remove('positive');
                remainingBudgetEl.classList.add('negative');
            } else {
                remainingBudgetEl.classList.remove('negative');
                remainingBudgetEl.classList.add('positive');
            }
        }

        // Function to format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }

        // Function to show notification
        function showNotification(message) {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: var(--sage);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
                font-weight: 500;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                max-width: 300px;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(120%)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }

        // Initialize with sample data
        renderExpenses();
        updateStats();
