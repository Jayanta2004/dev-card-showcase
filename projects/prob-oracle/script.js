        const probabilityValue = document.getElementById('probabilityValue');
        const probYes = document.getElementById('probYes');
        const probNo = document.getElementById('probNo');
        const probMaybe = document.getElementById('probMaybe');
        const oracleQuestion = document.getElementById('oracleQuestion');
        const quantumState = document.getElementById('quantumState');
        
        let probabilities = {
            yes: 34,
            no: 33,
            maybe: 33
        };
        
        let observing = false;
        
        function updateDisplay() {
            probabilityValue.textContent = Math.floor(Math.random() * 100) + '%';
            probYes.textContent = probabilities.yes + '%';
            probNo.textContent = probabilities.no + '%';
            probMaybe.textContent = probabilities.maybe + '%';
            
            // Quantum noise effect
            quantumState.textContent = '⚛️ ' + Array.from({length: 10}, () => Math.random() > 0.5 ? '1' : '0').join('');
        }
        
        function consult() {
            if (!oracleQuestion.value) {
                oracleQuestion.value = "the universe whispers...";
            }
            
            // Quantum fluctuation
            probabilities.yes = Math.floor(20 + Math.random() * 60);
            probabilities.no = Math.floor(20 + Math.random() * 60);
            probabilities.maybe = Math.floor(20 + Math.random() * 60);
            
            // Normalize to 100%
            const total = probabilities.yes + probabilities.no + probabilities.maybe;
            probabilities.yes = Math.floor((probabilities.yes / total) * 100);
            probabilities.no = Math.floor((probabilities.no / total) * 100);
            probabilities.maybe = 100 - probabilities.yes - probabilities.no;
            
            updateDisplay();
        }
        
        function collapse() {
            // Collapse to a definite outcome based on probabilities
            const random = Math.random() * 100;
            let outcome;
            
            if (random < probabilities.yes) {
                outcome = 'yes';
                probabilities = { yes: 100, no: 0, maybe: 0 };
            } else if (random < probabilities.yes + probabilities.no) {
                outcome = 'no';
                probabilities = { yes: 0, no: 100, maybe: 0 };
            } else {
                outcome = 'maybe';
                probabilities = { yes: 0, no: 0, maybe: 100 };
            }
            
            updateDisplay();
            
            // Show outcome
            oracleQuestion.value = `the oracle says: ${outcome}`;
        }
        
        function reset() {
            probabilities = {
                yes: 34,
                no: 33,
                maybe: 33
            };
            oracleQuestion.value = '';
            updateDisplay();
        }
        
        document.getElementById('consultBtn').addEventListener('click', consult);
        document.getElementById('collapseBtn').addEventListener('click', collapse);
        document.getElementById('resetBtn').addEventListener('click', reset);
        
        // Click on outcomes to influence probabilities
        document.querySelectorAll('.outcome-card').forEach(card => {
            card.addEventListener('click', () => {
                const outcome = card.dataset.outcome;
                // Observer effect - focusing on one outcome changes probabilities
                if (outcome === 'yes') {
                    probabilities.yes = Math.min(90, probabilities.yes + 10);
                    probabilities.no = Math.max(5, probabilities.no - 5);
                    probabilities.maybe = Math.max(5, probabilities.maybe - 5);
                } else if (outcome === 'no') {
                    probabilities.no = Math.min(90, probabilities.no + 10);
                    probabilities.yes = Math.max(5, probabilities.yes - 5);
                    probabilities.maybe = Math.max(5, probabilities.maybe - 5);
                } else {
                    probabilities.maybe = Math.min(90, probabilities.maybe + 10);
                    probabilities.yes = Math.max(5, probabilities.yes - 5);
                    probabilities.no = Math.max(5, probabilities.no - 5);
                }
                
                // Normalize
                const total = probabilities.yes + probabilities.no + probabilities.maybe;
                probabilities.yes = Math.floor((probabilities.yes / total) * 100);
                probabilities.no = Math.floor((probabilities.no / total) * 100);
                probabilities.maybe = 100 - probabilities.yes - probabilities.no;
                
                updateDisplay();
            });
        });
        
        // Initial update
        updateDisplay();
        
        // Continuous quantum fluctuation
        setInterval(() => {
            if (!observing) {
                // Tiny random fluctuations
                probabilities.yes += (Math.random() - 0.5) * 2;
                probabilities.no += (Math.random() - 0.5) * 2;
                probabilities.maybe += (Math.random() - 0.5) * 2;
                
                // Keep in bounds
                probabilities.yes = Math.max(5, Math.min(90, probabilities.yes));
                probabilities.no = Math.max(5, Math.min(90, probabilities.no));
                probabilities.maybe = Math.max(5, Math.min(90, probabilities.maybe));
                
                // Normalize
                const total = probabilities.yes + probabilities.no + probabilities.maybe;
                probabilities.yes = Math.floor((probabilities.yes / total) * 100);
                probabilities.no = Math.floor((probabilities.no / total) * 100);
                probabilities.maybe = 100 - probabilities.yes - probabilities.no;
                
                updateDisplay();
            }
        }, 2000);