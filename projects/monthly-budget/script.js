    (function() {
        // ----- sample transactions (initial) -----
        let transactions = [
            { id: 1, description: 'salary', amount: 3200, category: 'income', type: 'income' },
            { id: 2, description: 'rent', amount: 1200, category: 'housing', type: 'expense' },
            { id: 3, description: 'groceries', amount: 280, category: 'food', type: 'expense' },
            { id: 4, description: 'gas', amount: 95, category: 'transport', type: 'expense' },
            { id: 5, description: 'netflix', amount: 15.99, category: 'entertainment', type: 'expense' },
            { id: 6, description: 'electricity', amount: 78.50, category: 'utilities', type: 'expense' },
            { id: 7, description: 'internet', amount: 65, category: 'utilities', type: 'expense' },
            { id: 8, description: 'dining out', amount: 120, category: 'food', type: 'expense' },
            { id: 9, description: 'freelance', amount: 450, category: 'income', type: 'income' },
        ];

        // helper to generate ids
        let nextId = 100;

        // ----- DOM elements -----
        const totalIncomeSpan = document.getElementById('totalIncome');
        const totalExpenseSpan = document.getElementById('totalExpense');
        const netBalanceSpan = document.getElementById('netBalance');
        const categoryListDiv = document.getElementById('categoryList');
        const canvas = document.getElementById('budgetBarChart');
        const ctx = canvas.getContext('2d');

        // form inputs
        const descInput = document.getElementById('descInput');
        const amountInput = document.getElementById('amountInput');
        const categorySelect = document.getElementById('categorySelect');
        const typeSelect = document.getElementById('typeSelect');
        const addBtn = document.getElementById('addTransactionBtn');
        const resetBtn = document.getElementById('resetDataBtn');

        // ----- helper: calculate totals & category aggregates -----
        function calculateTotals() {
            let totalIncome = 0, totalExpense = 0;
            transactions.forEach(t => {
                if (t.type === 'income') totalIncome += t.amount;
                else totalExpense += t.amount;
            });
            return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
        }

        // get expense breakdown by category (excluding income)
        function expenseByCategory() {
            const map = new Map(); // category -> amount
            transactions.filter(t => t.type === 'expense').forEach(exp => {
                const cat = exp.category;
                map.set(cat, (map.get(cat) || 0) + exp.amount);
            });
            return map;
        }

        // ----- update summary cards and category list -----
        function updateSummaryAndBreakdown() {
            const { totalIncome, totalExpense, balance } = calculateTotals();
            totalIncomeSpan.innerText = `$${totalIncome.toFixed(2)}`;
            totalExpenseSpan.innerText = `$${totalExpense.toFixed(2)}`;
            netBalanceSpan.innerText = `$${balance.toFixed(2)}`;

            // build category breakdown html
            const catMap = expenseByCategory();
            if (catMap.size === 0) {
                categoryListDiv.innerHTML = '<div class="category-item">no expenses</div>';
                return;
            }

            const sorted = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
            let htmlStr = '';
            sorted.forEach(([cat, amt]) => {
                // color dot based on category (soft colors)
                let dotColor = '#3d8c9c';
                if (cat === 'food') dotColor = '#c47a3c';
                else if (cat === 'housing') dotColor = '#2b6c8f';
                else if (cat === 'transport') dotColor = '#5e8b6c';
                else if (cat === 'entertainment') dotColor = '#9b6fa3';
                else if (cat === 'utilities') dotColor = '#b88b4b';
                else if (cat === 'other') dotColor = '#7f8c8d';
                htmlStr += `
                    <div class="category-item">
                        <span class="cat-name"><span class="cat-dot" style="background:${dotColor};"></span> ${cat}</span>
                        <span class="cat-amount">$${amt.toFixed(2)}</span>
                    </div>
                `;
            });
            categoryListDiv.innerHTML = htmlStr;
        }

        // ----- draw bar chart (income vs expense) -----
        function drawBarChart() {
            const { totalIncome, totalExpense } = calculateTotals();
            const maxVal = Math.max(totalIncome, totalExpense, 1000); // at least 1000 for scale

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const w = canvas.width;
            const h = canvas.height;
            const margin = 40;
            const chartTop = 30;
            const chartBottom = h - margin;
            const availableHeight = chartBottom - chartTop;

            // bars settings
            const barWidth = 70;
            const spacing = 60;
            const incomeX = 120;
            const expenseX = incomeX + barWidth + spacing;

            // scale factor
            const scale = (maxVal > 0) ? availableHeight / maxVal : 1;

            // draw income bar
            const incomeH = totalIncome * scale;
            ctx.fillStyle = '#2f9e79';
            ctx.shadowColor = '#1f4a3e';
            ctx.shadowBlur = 8;
            ctx.fillRect(incomeX, chartBottom - incomeH, barWidth, incomeH);
            // label
            ctx.shadowBlur = 0;
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillStyle = '#1b4d3b';
            ctx.fillText('income', incomeX, chartBottom + 20);
            ctx.fillStyle = '#145a40';
            ctx.fillText(`$${totalIncome.toFixed(0)}`, incomeX + 10, chartBottom - incomeH - 8);

            // expense bar
            const expenseH = totalExpense * scale;
            ctx.fillStyle = '#c44545';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#6b2b2b';
            ctx.fillRect(expenseX, chartBottom - expenseH, barWidth, expenseH);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#a13d3d';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText('expense', expenseX, chartBottom + 20);
            ctx.fillStyle = '#881e1e';
            ctx.fillText(`$${totalExpense.toFixed(0)}`, expenseX + 10, chartBottom - expenseH - 8);

            // faint grid line
            ctx.strokeStyle = '#c0d4e4';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margin, chartTop);
            ctx.lineTo(w - margin, chartTop);
            ctx.stroke();

            ctx.fillStyle = '#325c77';
            ctx.font = '12px Inter';
            ctx.fillText(`max $${maxVal.toFixed(0)}`, 10, chartTop - 6);
        }

        // ----- full refresh UI -----
        function refreshVisuals() {
            updateSummaryAndBreakdown();
            drawBarChart();
        }

        // ----- add transaction from form -----
        function addTransactionFromForm() {
            const desc = descInput.value.trim();
            let amount = parseFloat(amountInput.value);
            if (isNaN(amount) || amount <= 0) {
                alert('enter a positive amount');
                return;
            }
            const category = categorySelect.value;
            const type = typeSelect.value;

            // if type is income, we might override category to 'income' for consistency
            const finalCategory = (type === 'income') ? 'income' : category;

            const newTransaction = {
                id: nextId++,
                description: desc || (type === 'income' ? 'income' : 'expense'),
                amount: amount,
                category: finalCategory,
                type: type
            };
            transactions.push(newTransaction);
            refreshVisuals();

            // optional reset form to defaults (keep description, but reset amount)
            amountInput.value = '';
            descInput.value = '';
            typeSelect.value = 'expense';  // default expense
            categorySelect.value = 'food';
        }

        // ----- reset to initial demo data -----
        function resetToDemo() {
            transactions = [
                { id: 1, description: 'salary', amount: 3200, category: 'income', type: 'income' },
                { id: 2, description: 'rent', amount: 1200, category: 'housing', type: 'expense' },
                { id: 3, description: 'groceries', amount: 280, category: 'food', type: 'expense' },
                { id: 4, description: 'gas', amount: 95, category: 'transport', type: 'expense' },
                { id: 5, description: 'netflix', amount: 15.99, category: 'entertainment', type: 'expense' },
                { id: 6, description: 'electricity', amount: 78.50, category: 'utilities', type: 'expense' },
                { id: 7, description: 'internet', amount: 65, category: 'utilities', type: 'expense' },
                { id: 8, description: 'dining out', amount: 120, category: 'food', type: 'expense' },
                { id: 9, description: 'freelance', amount: 450, category: 'income', type: 'income' },
            ];
            nextId = 100;
            refreshVisuals();
        }

        // ----- attach listeners -----
        addBtn.addEventListener('click', addTransactionFromForm);
        resetBtn.addEventListener('click', resetToDemo);

        // optional: adjust category if type changes (income forces category income)
        typeSelect.addEventListener('change', function(e) {
            if (typeSelect.value === 'income') {
                // set category to income and disable? better just hint
                categorySelect.value = 'income';
            } else {
                if (categorySelect.value === 'income') categorySelect.value = 'food';
            }
        });

        // initialize display
        refreshVisuals();

        // adjust canvas size for sharpness (retina friendly)
        function resizeCanvas() {
            const container = canvas.parentNode;
            const containerWidth = container.clientWidth;
            canvas.width = Math.min(500, containerWidth - 40);
            canvas.height = 200;
            drawBarChart(); // redraw after resize
        }
        window.addEventListener('resize', () => {
            resizeCanvas();
            refreshVisuals();
        });
        resizeCanvas();
    })();