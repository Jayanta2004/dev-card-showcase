
        document.addEventListener('DOMContentLoaded', function() {
            // DOM elements
            const inputValue = document.getElementById('inputValue');
            const runSimulationBtn = document.getElementById('runSimulation');
            const resetSimulationBtn = document.getElementById('resetSimulation');
            const conditionOptions = document.querySelectorAll('.condition-option');
            const conditionText = document.getElementById('conditionText');
            const logicExplanation = document.getElementById('logicExplanation');

            // Flowchart nodes
            const nodeStart = document.getElementById('nodeStart');
            const nodeCondition = document.getElementById('nodeCondition');
            const nodeProcessTrue = document.getElementById('nodeProcessTrue');
            const nodeProcessFalse = document.getElementById('nodeProcessFalse');
            const nodeEndTrue = document.getElementById('nodeEndTrue');
            const nodeEndFalse = document.getElementById('nodeEndFalse');

            // Current condition state
            let currentCondition = 'greater';

            // Initialize connections
            initializeConnections();

            // Set up event listeners
            runSimulationBtn.addEventListener('click', runSimulation);
            resetSimulationBtn.addEventListener('click', resetSimulation);

            conditionOptions.forEach(option => {
                option.addEventListener('click', function() {
                    conditionOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    currentCondition = this.getAttribute('data-condition');
                    updateConditionText();
                });
            });

            // Function to initialize SVG connections
            function initializeConnections() {
                const svg = document.getElementById('connections');
                svg.innerHTML = '';

                // Get positions of nodes
                const startRect = nodeStart.getBoundingClientRect();
                const conditionRect = nodeCondition.getBoundingClientRect();
                const processTrueRect = nodeProcessTrue.getBoundingClientRect();
                const processFalseRect = nodeProcessFalse.getBoundingClientRect();
                const endTrueRect = nodeEndTrue.getBoundingClientRect();
                const endFalseRect = nodeEndFalse.getBoundingClientRect();

                const flowchartRect = document.getElementById('flowchart').getBoundingClientRect();

                // Adjust positions relative to the flowchart
                const startX = startRect.left + startRect.width/2 - flowchartRect.left;
                const startY = startRect.bottom - flowchartRect.top;

                const conditionX = conditionRect.left + conditionRect.width/2 - flowchartRect.left;
                const conditionY = conditionRect.top - flowchartRect.top;

                const processTrueX = processTrueRect.left + processTrueRect.width/2 - flowchartRect.left;
                const processTrueY = processTrueRect.top - flowchartRect.top;

                const processFalseX = processFalseRect.left + processFalseRect.width/2 - flowchartRect.left;
                const processFalseY = processFalseRect.top - flowchartRect.top;

                const endTrueX = endTrueRect.left + endTrueRect.width/2 - flowchartRect.left;
                const endTrueY = endTrueRect.top - flowchartRect.top;

                const endFalseX = endFalseRect.left + endFalseRect.width/2 - flowchartRect.left;
                const endFalseY = endFalseRect.top - flowchartRect.top;

                // Draw connections
                // Start to Condition
                drawConnection(svg, startX, startY, conditionX, conditionY, 'connection-start', '');

                // Condition to True
                drawConnection(svg, conditionX, conditionY + conditionRect.height, processTrueX, processTrueY, 'connection-true', 'TRUE');

                // Condition to False
                drawConnection(svg, conditionX, conditionY + conditionRect.height, processFalseX, processFalseY, 'connection-false', 'FALSE');

                // True to End True
                drawConnection(svg, processTrueX, processTrueY + processTrueRect.height, endTrueX, endTrueY, 'connection-true-end', '');

                // False to End False
                drawConnection(svg, processFalseX, processFalseY + processFalseRect.height, endFalseX, endFalseY, 'connection-false-end', '');
            }

            // Function to draw a connection line
            function drawConnection(svg, x1, y1, x2, y2, id, label) {
                // Create a curved path
                const midY = y1 + (y2 - y1) / 2;
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`);
                path.setAttribute('class', 'connection-path');
                path.setAttribute('id', id);
                svg.appendChild(path);

                // Add label if provided
                if (label) {
                    const labelX = x1 + (x2 - x1) / 2;
                    const labelY = midY - 10;

                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', labelX);
                    text.setAttribute('y', labelY);
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('fill', '#7f8c8d');
                    text.setAttribute('font-weight', 'bold');
                    text.setAttribute('font-size', '14');
                    text.textContent = label;
                    svg.appendChild(text);
                }
            }

            // Function to update condition text based on selected condition
            function updateConditionText() {
                let conditionStr = '';
                switch(currentCondition) {
                    case 'greater':
                        conditionStr = 'x > 10';
                        break;
                    case 'even':
                        conditionStr = 'x % 2 == 0';
                        break;
                    case 'positive':
                        conditionStr = 'x >= 0';
                        break;
                    case 'multiple':
                        conditionStr = 'x % 5 == 0';
                        break;
                }
                conditionText.textContent = conditionStr;
            }

            // Function to run the simulation
            function runSimulation() {
                const value = parseFloat(inputValue.value);
                let conditionResult = false;
                let explanation = '';

                // Reset highlighting
                resetHighlighting();

                // Evaluate condition based on selected type
                switch(currentCondition) {
                    case 'greater':
                        conditionResult = value > 10;
                        explanation = `Is ${value} greater than 10? ${conditionResult ? 'YES' : 'NO'}`;
                        break;
                    case 'even':
                        conditionResult = value % 2 === 0;
                        explanation = `Is ${value} an even number? ${conditionResult ? 'YES' : 'NO'}`;
                        break;
                    case 'positive':
                        conditionResult = value >= 0;
                        explanation = `Is ${value} a positive number (or zero)? ${conditionResult ? 'YES' : 'NO'}`;
                        break;
                    case 'multiple':
                        conditionResult = value % 5 === 0;
                        explanation = `Is ${value} a multiple of 5? ${conditionResult ? 'YES' : 'NO'}`;
                        break;
                }

                // Highlight the path taken
                highlightPath(conditionResult);

                // Update explanation
                logicExplanation.innerHTML = `
                    <h3><i class="fas fa-info-circle"></i> Decision Process</h3>
                    <p><strong>Input value:</strong> ${value}</p>
                    <p><strong>Condition:</strong> ${conditionText.textContent}</p>
                    <p><strong>Evaluation:</strong> ${explanation}</p>
                    <p><strong>Path taken:</strong> ${conditionResult ? 'TRUE path (if block)' : 'FALSE path (else block)'}</p>
                `;
                logicExplanation.classList.add('highlight');

                // Add a simple animation to the nodes
                animateNode(nodeStart, 0);
                animateNode(nodeCondition, 300);

                if (conditionResult) {
                    animateNode(nodeProcessTrue, 600);
                    animateNode(nodeEndTrue, 900);
                } else {
                    animateNode(nodeProcessFalse, 600);
                    animateNode(nodeEndFalse, 900);
                }
            }

            // Function to animate a node
            function animateNode(node, delay) {
                setTimeout(() => {
                    node.style.transform = node.style.transform.includes('scale') 
                        ? node.style.transform.replace('scale(1.05)', 'scale(1.1)') 
                        : node.style.transform + ' scale(1.1)';

                    setTimeout(() => {
                        node.style.transform = node.style.transform.replace('scale(1.1)', 'scale(1.05)');
                    }, 150);
                }, delay);
            }

            // Function to highlight the path taken
            function highlightPath(isTruePath) {
                // Highlight nodes
                nodeStart.classList.add('node-highlighted');
                nodeCondition.classList.add('node-highlighted');

                if (isTruePath) {
                    nodeProcessTrue.classList.add('node-highlighted');
                    nodeEndTrue.classList.add('node-highlighted');
                } else {
                    nodeProcessFalse.classList.add('node-highlighted');
                    nodeEndFalse.classList.add('node-highlighted');
                }

                // Highlight connections
                document.getElementById('connection-start').classList.add('highlighted');

                if (isTruePath) {
                    document.getElementById('connection-true').classList.add('highlighted');
                    document.getElementById('connection-true-end').classList.add('highlighted');
                } else {
                    document.getElementById('connection-false').classList.add('highlighted');
                    document.getElementById('connection-false-end').classList.add('highlighted');
                }
            }

            // Function to reset the simulation
            function resetSimulation() {
                // Reset input value
                inputValue.value = '15';

                // Reset highlighting
                resetHighlighting();

                // Reset condition to default
                conditionOptions.forEach(opt => opt.classList.remove('active'));
                document.querySelector('[data-condition="greater"]').classList.add('active');
                currentCondition = 'greater';
                updateConditionText();

                // Reset explanation
                logicExplanation.innerHTML = `
                    <h3><i class="fas fa-info-circle"></i> Current Logic</h3>
                    <p>Enter a value and click "Run Simulation" to see how the if-else statement evaluates your input.</p>
                `;
                logicExplanation.classList.remove('highlight');
            }

            // Function to reset all highlighting
            function resetHighlighting() {
                // Remove highlighting from nodes
                const nodes = document.querySelectorAll('.node');
                nodes.forEach(node => {
                    node.classList.remove('node-highlighted');
                });

                // Remove highlighting from connections
                const connections = document.querySelectorAll('.connection-path');
                connections.forEach(connection => {
                    connection.classList.remove('highlighted');
                });
            }

            // Initialize condition text
            updateConditionText();

            // Reinitialize connections on window resize
            window.addEventListener('resize', initializeConnections);

            // Run simulation on page load with default values
            setTimeout(runSimulation, 500);
        });
    