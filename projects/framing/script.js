        // Initialize data storage
        let decisionData = {
            positive: { yes: 0, no: 0 },
            negative: { yes: 0, no: 0 },
            totalDecisions: 0
        };
        
        // DOM elements
        const scenarioButtons = document.querySelectorAll('.scenario-btn');
        const scenarioContainers = document.querySelectorAll('.scenario-container');
        const frameOptions = document.querySelectorAll('.frame-option');
        const yesButtons = document.querySelectorAll('.yes-btn');
        const noButtons = document.querySelectorAll('.no-btn');
        const positiveRateElement = document.getElementById('positiveRate');
        const negativeRateElement = document.getElementById('negativeRate');
        const framingEffectElement = document.getElementById('framingEffect');
        const totalDecisionsElement = document.getElementById('totalDecisions');
        const positiveBar = document.getElementById('positiveBar');
        const negativeBar = document.getElementById('negativeBar');
        const resetBtn = document.getElementById('resetBtn');
        
        // Current state
        let currentScenario = 1;
        let selectedFrame = null;
        
        // Initialize the first scenario as active
        document.getElementById('scenario1').style.display = 'block';
        
        // Scenario selector functionality
        scenarioButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                scenarioButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update scenario display
                const scenarioId = button.getAttribute('data-scenario');
                scenarioContainers.forEach(container => {
                    container.style.display = 'none';
                });
                document.getElementById(`scenario${scenarioId}`).style.display = 'block';
                
                // Reset frame selection for new scenario
                frameOptions.forEach(option => option.classList.remove('selected'));
                selectedFrame = null;
                currentScenario = parseInt(scenarioId);
            });
        });
        
        // Frame selection functionality
        frameOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Deselect all frames
                frameOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Select clicked frame
                option.classList.add('selected');
                selectedFrame = option.getAttribute('data-frame');
                
                // Enable decision buttons
                yesButtons.forEach(btn => btn.disabled = false);
                noButtons.forEach(btn => btn.disabled = false);
            });
        });
        
        // Decision functionality
        function makeDecision(isYes) {
            if (!selectedFrame) {
                alert('Please select a framing option first.');
                return;
            }
            
            // Record the decision
            if (isYes) {
                decisionData[selectedFrame].yes++;
            } else {
                decisionData[selectedFrame].no++;
            }
            
            decisionData.totalDecisions++;
            
            // Update UI
            updateResults();
            
            // Show feedback
            const feedback = isYes ? 
                `You chose "Yes" with ${selectedFrame} framing.` : 
                `You chose "No" with ${selectedFrame} framing.`;
            
            // Reset for next decision
            frameOptions.forEach(option => option.classList.remove('selected'));
            selectedFrame = null;
            
            // Move to next scenario after a delay
            setTimeout(() => {
                if (currentScenario < 4) {
                    scenarioButtons[currentScenario].click(); // Next scenario
                } else {
                    scenarioButtons[0].click(); // Back to first scenario
                }
            }, 1000);
        }
        
        // Attach decision event listeners
        yesButtons.forEach(button => {
            button.addEventListener('click', () => makeDecision(true));
        });
        
        noButtons.forEach(button => {
            button.addEventListener('click', () => makeDecision(false));
        });
        
        // Update results display
        function updateResults() {
            // Calculate rates
            const positiveTotal = decisionData.positive.yes + decisionData.positive.no;
            const negativeTotal = decisionData.negative.yes + decisionData.negative.no;
            
            const positiveRate = positiveTotal > 0 ? 
                Math.round((decisionData.positive.yes / positiveTotal) * 100) : 0;
                
            const negativeRate = negativeTotal > 0 ? 
                Math.round((decisionData.negative.yes / negativeTotal) * 100) : 0;
            
            const framingEffect = Math.abs(positiveRate - negativeRate);
            
            // Update UI elements
            positiveRateElement.textContent = `${positiveRate}%`;
            negativeRateElement.textContent = `${negativeRate}%`;
            framingEffectElement.textContent = `${framingEffect}%`;
            totalDecisionsElement.textContent = decisionData.totalDecisions;
            
            // Update visualization bars
            positiveBar.style.height = `${positiveRate}%`;
            negativeBar.style.height = `${negativeRate}%`;
            
            // Add color coding to framing effect
            if (framingEffect < 10) {
                framingEffectElement.style.color = '#27ae60';
            } else if (framingEffect < 30) {
                framingEffectElement.style.color = '#f39c12';
            } else {
                framingEffectElement.style.color = '#e74c3c';
            }
        }
        
        // Reset all data
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                decisionData = {
                    positive: { yes: 0, no: 0 },
                    negative: { yes: 0, no: 0 },
                    totalDecisions: 0
                };
                
                // Reset UI
                updateResults();
                
                // Reset scenario
                scenarioButtons[0].click();
                
                // Show confirmation
                alert('All data has been reset. You can start making decisions again.');
            }
        });
        
        // Initialize with some example data to demonstrate the effect
        function initializeWithExampleData() {
            // Simulate data showing the framing effect
            decisionData.positive.yes = 42;
            decisionData.positive.no = 18;
            decisionData.negative.yes = 22;
            decisionData.negative.no = 38;
            decisionData.totalDecisions = 120;
            
            updateResults();
        }
        
        // Initialize with example data on page load
        window.addEventListener('load', () => {
            // Small delay to let page render first
            setTimeout(initializeWithExampleData, 500);
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // 1-4 keys to select scenario
            if (e.key >= '1' && e.key <= '4') {
                const scenarioIndex = parseInt(e.key) - 1;
                if (scenarioButtons[scenarioIndex]) {
                    scenarioButtons[scenarioIndex].click();
                }
            }
            
            // p/n keys to select frame
            if (e.key === 'p' || e.key === 'P') {
                const positiveFrame = document.querySelector('.frame-option.positive');
                if (positiveFrame) {
                    positiveFrame.click();
                }
            }
            
            if (e.key === 'n' || e.key === 'N') {
                const negativeFrame = document.querySelector('.frame-option.negative');
                if (negativeFrame) {
                    negativeFrame.click();
                }
            }
            
            // y/n keys to make decisions
            if (e.key === 'y' || e.key === 'Y') {
                makeDecision(true);
            }
            
            if (e.key === 'n' && !(e.key === 'N')) {
                makeDecision(false);
            }
            
            // r key to reset
            if (e.key === 'r' || e.key === 'R') {
                resetBtn.click();
            }
        });