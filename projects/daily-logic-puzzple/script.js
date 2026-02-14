        // Set current date
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
        
        // Get DOM elements
        const checkBtn = document.getElementById('checkBtn');
        const hintBtn = document.getElementById('hintBtn');
        const solveBtn = document.getElementById('solveBtn');
        const resetBtn = document.getElementById('resetBtn');
        const showSolutionBtn = document.getElementById('showSolutionBtn');
        const hintBox = document.getElementById('hintBox');
        const solutionBox = document.getElementById('solutionBox');
        
        // Grid cells
        const gridCells = document.querySelectorAll('.grid-cell:not(.header-cell)');
        
        // Solution grid (for checking)
        const solution = {
            "Alex": "Pie",
            "Bailey": "Tiramisu", // Could also be Pudding
            "Casey": "Cheesecake",
            "Dakota": "Pudding", // Could also be Tiramisu
            "Elliot": "Ice Cream"
        };
        
        // Track user selections
        let userSelections = {};
        
        // Initialize grid cells with click functionality
        gridCells.forEach(cell => {
            cell.addEventListener('click', function() {
                const cellId = this.id;
                const [row, col] = cellId.split('-').slice(1).map(Number);
                
                // Cycle through possible values
                const values = ['?', '✓', '✗'];
                const currentValue = this.textContent;
                const currentIndex = values.indexOf(currentValue);
                const nextIndex = (currentIndex + 1) % values.length;
                this.textContent = values[nextIndex];
                
                // Update color based on selection
                if (this.textContent === '✓') {
                    this.style.backgroundColor = '#d4edda';
                    this.style.color = '#155724';
                } else if (this.textContent === '✗') {
                    this.style.backgroundColor = '#f8d7da';
                    this.style.color = '#721c24';
                } else {
                    this.style.backgroundColor = '#f1f8ff';
                    this.style.color = '#333';
                }
                
                // Update user selections
                updateUserSelections(row, col, this.textContent);
            });
        });
        
        function updateUserSelections(row, col, value) {
            // Map row to person name
            const people = ["Alex", "Bailey", "Casey", "Dakota", "Elliot"];
            const desserts = ["Cheesecake", "Ice Cream", "Pie", "Tiramisu", "Pudding"];
            
            const person = people[row - 1];
            const dessert = desserts[col - 1];
            
            if (!userSelections[person]) {
                userSelections[person] = {};
            }
            
            if (value === '✓') {
                userSelections[person][dessert] = true;
            } else if (value === '✗') {
                userSelections[person][dessert] = false;
            } else {
                delete userSelections[person][dessert];
            }
        }
        
        // Check solution button
        checkBtn.addEventListener('click', function() {
            let correct = true;
            let message = "";
            
            // Check each person's selection
            for (const person in solution) {
                const correctDessert = solution[person];
                
                // Check if user has marked the correct dessert
                if (userSelections[person] && userSelections[person][correctDessert] === true) {
                    // Good - they marked this one as correct
                } else {
                    correct = false;
                    message += `${person} should have ${correctDessert}. `;
                }
                
                // Check if they marked incorrect desserts as correct
                for (const dessert in userSelections[person]) {
                    if (userSelections[person][dessert] === true && dessert !== correctDessert) {
                        correct = false;
                        message += `${person} should not have ${dessert}. `;
                    }
                }
            }
            
            if (correct) {
                alert("Congratulations! Your solution is correct!");
            } else {
                alert("Not quite right. " + message + " Try again!");
            }
        });
        
        // Hint button
        hintBtn.addEventListener('click', function() {
            hintBox.style.display = 'block';
            setTimeout(() => {
                hintBox.style.display = 'none';
            }, 8000);
        });
        
        // Show solution button
        solveBtn.addEventListener('click', function() {
            // Fill in the correct answers
            const people = ["Alex", "Bailey", "Casey", "Dakota", "Elliot"];
            const desserts = ["Cheesecake", "Ice Cream", "Pie", "Tiramisu", "Pudding"];
            
            people.forEach((person, personIndex) => {
                const correctDessert = solution[person];
                const dessertIndex = desserts.indexOf(correctDessert);
                
                // Calculate cell ID
                const cellId = `cell-${personIndex + 1}-${dessertIndex + 1}`;
                const cell = document.getElementById(cellId);
                
                if (cell) {
                    cell.textContent = '✓';
                    cell.style.backgroundColor = '#d4edda';
                    cell.style.color = '#155724';
                }
            });
            
            alert("Solution filled in. See the grid for answers.");
        });
        
        // Show step-by-step solution
        showSolutionBtn.addEventListener('click', function() {
            if (solutionBox.style.display === 'block') {
                solutionBox.style.display = 'none';
                showSolutionBtn.textContent = 'Show Step-by-Step Solution';
            } else {
                solutionBox.style.display = 'block';
                showSolutionBtn.textContent = 'Hide Solution';
            }
        });
        
        // Reset button
        resetBtn.addEventListener('click', function() {
            gridCells.forEach(cell => {
                cell.textContent = '?';
                cell.style.backgroundColor = '#f1f8ff';
                cell.style.color = '#333';
            });
            userSelections = {};
            hintBox.style.display = 'none';
            solutionBox.style.display = 'none';
            showSolutionBtn.textContent = 'Show Step-by-Step Solution';
        });
        
        // Add some initial markings to demonstrate functionality
        window.addEventListener('load', function() {
            // Mark a few cells to show how it works
            document.getElementById('cell-3-1').click(); // Casey - Cheesecake
            document.getElementById('cell-5-2').click(); // Elliot - Ice Cream
            document.getElementById('cell-1-1').click(); // Alex - Cheesecake (wrong)
            document.getElementById('cell-1-1').click(); // Change to X
        });