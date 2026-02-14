
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const codeArea = document.getElementById('codeArea');
            const examplesGrid = document.getElementById('examplesGrid');
            const argsInput = document.getElementById('argsInput');
            const flowDiagram = document.getElementById('flowDiagram');
            const callStack = document.getElementById('callStack');
            const consoleOutput = document.getElementById('consoleOutput');
            const tooltip = document.getElementById('tooltip');
            
            // Control Buttons
            const stepBtn = document.getElementById('stepBtn');
            const runBtn = document.getElementById('runBtn');
            const pauseBtn = document.getElementById('pauseBtn');
            const resetBtn = document.getElementById('resetBtn');
            const explainBtn = document.getElementById('explainBtn');
            const speedUpBtn = document.getElementById('speedUpBtn');
            const slowDownBtn = document.getElementById('slowDownBtn');
            const visualizeBtn = document.getElementById('visualizeBtn');
            const speedSlider = document.getElementById('speedSlider');
            const speedValue = document.getElementById('speedValue');
            
            // State
            let currentExample = 'factorial';
            let executionState = null;
            let animationSpeed = 1.5;
            let isRunning = false;
            let animationInterval = null;
            let currentNode = null;
            let currentLine = 0;
            
            // Function Examples
            const examples = {
                factorial: {
                    name: 'Factorial Recursive',
                    description: 'Calculate factorial using recursion',
                    code: `function factorial(n) {
    // Base case: factorial of 0 is 1
    if (n <= 1) {
        return 1;
    }
    
    // Recursive case: n * factorial(n-1)
    return n * factorial(n - 1);
}

// Main function to test factorial
function main() {
    const num = 5;
    console.log("Calculating factorial of", num);
    
    const result = factorial(num);
    console.log("Result:", result);
    
    return result;
}

// Start execution
main();`,
                    args: ['5'],
                    explanation: `This example demonstrates recursion. The factorial function calls itself with n-1 until it reaches the base case (n <= 1). Each recursive call adds a new frame to the call stack.`
                },
                
                fibonacci: {
                    name: 'Fibonacci Sequence',
                    description: 'Generate Fibonacci numbers with memoization',
                    code: `function fibonacci(n, memo = {}) {
    // Check if already calculated
    if (n in memo) {
        return memo[n];
    }
    
    // Base cases
    if (n <= 1) {
        return n;
    }
    
    // Recursive calculation with memoization
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
    return memo[n];
}

function printFibonacciSequence(limit) {
    console.log("Fibonacci sequence up to", limit + ":");
    
    for (let i = 0; i <= limit; i++) {
        const fib = fibonacci(i);
        console.log(\`fib(\${i}) = \${fib}\`);
    }
}

// Generate sequence
printFibonacciSequence(6);`,
                    args: ['6'],
                    explanation: `This shows memoization (caching) in recursion. The memo object stores previously computed Fibonacci numbers to avoid redundant calculations.`
                },
                
                power: {
                    name: 'Power Function',
                    description: 'Calculate power with optimization',
                    code: `function power(base, exponent) {
    // Base case: any number to power 0 is 1
    if (exponent === 0) {
        return 1;
    }
    
    // If exponent is negative
    if (exponent < 0) {
        return 1 / power(base, -exponent);
    }
    
    // Optimized calculation: x^n = (x^(n/2))^2
    if (exponent % 2 === 0) {
        const halfPower = power(base, exponent / 2);
        return halfPower * halfPower;
    } else {
        return base * power(base, exponent - 1);
    }
}

function calculatePowers() {
    const base = 2;
    const exponents = [3, 5, 10];
    
    console.log("Calculating powers of", base);
    
    exponents.forEach(exp => {
        const result = power(base, exp);
        console.log(\`\${base}^\${exp} = \${result}\`);
    });
}

calculatePowers();`,
                    args: ['2, 3'],
                    explanation: `Demonstrates optimized recursive power calculation using exponent halving for even exponents, reducing time complexity from O(n) to O(log n).`
                },
                
                arraySum: {
                    name: 'Array Sum Recursive',
                    description: 'Sum array elements using recursion',
                    code: `function arraySum(arr, index = 0) {
    // Base case: end of array
    if (index >= arr.length) {
        return 0;
    }
    
    // Current element + sum of rest
    return arr[index] + arraySum(arr, index + 1);
}

function findMax(arr, index = 0, currentMax = -Infinity) {
    // Base case: end of array
    if (index >= arr.length) {
        return currentMax;
    }
    
    // Update max if current element is larger
    if (arr[index] > currentMax) {
        currentMax = arr[index];
    }
    
    // Recursive call for next element
    return findMax(arr, index + 1, currentMax);
}

function processArray() {
    const numbers = [3, 7, 2, 9, 1, 4];
    console.log("Array:", numbers);
    
    const sum = arraySum(numbers);
    console.log("Sum:", sum);
    
    const max = findMax(numbers);
    console.log("Maximum:", max);
}

processArray();`,
                    args: ['[3,7,2,9,1,4]'],
                    explanation: `Shows two recursive functions processing arrays: one sums elements, another finds maximum. Both use index parameters to track position.`
                },
                
                palindrome: {
                    name: 'Palindrome Checker',
                    description: 'Check if string is palindrome recursively',
                    code: `function isPalindrome(str, start = 0, end = null) {
    // Initialize end index on first call
    if (end === null) {
        end = str.length - 1;
    }
    
    // Base case: single character or empty substring
    if (start >= end) {
        return true;
    }
    
    // If characters don't match
    if (str[start] !== str[end]) {
        return false;
    }
    
    // Recursive check on inner substring
    return isPalindrome(str, start + 1, end - 1);
}

function testPalindromes() {
    const testStrings = ["racecar", "hello", "madam", "level", "world"];
    
    console.log("Palindrome Check:");
    
    testStrings.forEach(str => {
        const result = isPalindrome(str);
        console.log(\`"\${str}" is palindrome: \${result}\`);
    });
}

testPalindromes();`,
                    args: ['"racecar"'],
                    explanation: `Recursively checks if a string reads the same forwards and backwards by comparing first and last characters, moving inward.`
                },
                
                gcd: {
                    name: 'GCD Euclidean Algorithm',
                    description: 'Find greatest common divisor using recursion',
                    code: `function gcd(a, b) {
    // Base case: if b is 0, GCD is a
    if (b === 0) {
        return a;
    }
    
    // Recursive case: GCD(a, b) = GCD(b, a % b)
    return gcd(b, a % b);
}

function lcm(a, b) {
    // LCM using GCD: LCM(a, b) = (a * b) / GCD(a, b)
    return (a * b) / gcd(a, b);
}

function calculateGCDAndLCM() {
    const pairs = [
        [48, 18],
        [56, 98],
        [1071, 462]
    ];
    
    console.log("GCD and LCM Calculations:");
    
    pairs.forEach(([a, b]) => {
        const gcdResult = gcd(a, b);
        const lcmResult = lcm(a, b);
        
        console.log(\`GCD(\${a}, \${b}) = \${gcdResult}\`);
        console.log(\`LCM(\${a}, \${b}) = \${lcmResult}\`);
    });
}

calculateGCDAndLCM();`,
                    args: ['48, 18'],
                    explanation: `Implements Euclidean algorithm for GCD recursively. LCM is calculated using the relationship: LCM(a,b) = (a*b)/GCD(a,b).`
                }
            };
            
            // Initialize
            function init() {
                // Create examples
                createExamples();
                
                // Load default example
                loadExample(currentExample);
                
                // Setup event listeners
                setupEventListeners();
                
                // Initialize speed slider
                updateSpeedDisplay();
            }
            
            // Create example buttons
            function createExamples() {
                examplesGrid.innerHTML = '';
                
                Object.keys(examples).forEach(key => {
                    const example = examples[key];
                    const exampleBtn = document.createElement('button');
                    exampleBtn.className = `example-btn ${key === currentExample ? 'active' : ''}`;
                    exampleBtn.dataset.example = key;
                    
                    exampleBtn.innerHTML = `
                        <div style="font-weight: 600; margin-bottom: 5px;">${example.name}</div>
                        <div style="font-size: 0.8rem; color: #b0b7d6;">${example.description}</div>
                    `;
                    
                    exampleBtn.addEventListener('click', function() {
                        currentExample = this.dataset.example;
                        loadExample(currentExample);
                        
                        // Update active button
                        document.querySelectorAll('.example-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        this.classList.add('active');
                    });
                    
                    examplesGrid.appendChild(exampleBtn);
                });
            }
            
            // Load example
            function loadExample(exampleKey) {
                const example = examples[exampleKey];
                if (!example) return;
                
                // Update code display
                renderCode(example.code);
                
                // Update args input
                argsInput.value = example.args.join(', ');
                
                // Reset visualization
                resetVisualization();
                
                // Initialize execution state
                initExecutionState(example.code, example.args);
            }
            
            // Render code with syntax highlighting
            function renderCode(code) {
                const lines = code.split('\n');
                let html = '';
                
                lines.forEach((line, index) => {
                    const lineNumber = index + 1;
                    let highlightedLine = highlightSyntax(line);
                    
                    html += `
                        <div class="code-line" data-line="${lineNumber}">
                            <span class="line-number">${lineNumber}</span>
                            <span class="code-content">${highlightedLine}</span>
                        </div>
                    `;
                });
                
                codeArea.innerHTML = html;
            }
            
            // Syntax highlighting
            function highlightSyntax(line) {
                let highlighted = line;
                
                // Keywords
                const keywords = ['function', 'if', 'else', 'return', 'for', 'while', 'const', 'let', 'var', 'console', 'log'];
                keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                    highlighted = highlighted.replace(regex, `<span class="code-keyword">${keyword}</span>`);
                });
                
                // Function names
                const functionNames = ['factorial', 'fibonacci', 'power', 'arraySum', 'findMax', 'isPalindrome', 'gcd', 'lcm', 'main', 'calculatePowers', 'printFibonacciSequence', 'processArray', 'testPalindromes', 'calculateGCDAndLCM'];
                functionNames.forEach(func => {
                    const regex = new RegExp(`\\b${func}\\b`, 'g');
                    highlighted = highlighted.replace(regex, `<span class="code-function">${func}</span>`);
                });
                
                // Variables and parameters
                const variables = ['n', 'memo', 'base', 'exponent', 'arr', 'index', 'currentMax', 'str', 'start', 'end', 'a', 'b', 'num', 'result', 'limit', 'numbers', 'sum', 'max', 'testStrings', 'pairs', 'gcdResult', 'lcmResult', 'halfPower', 'exp', 'fib'];
                variables.forEach(variable => {
                    const regex = new RegExp(`\\b${variable}\\b`, 'g');
                    highlighted = highlighted.replace(regex, `<span class="code-variable">${variable}</span>`);
                });
                
                // Strings
                highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="code-string">"$1"</span>');
                highlighted = highlighted.replace(/'([^']*)'/g, "<span class=\"code-string\">'$1'</span>");
                highlighted = highlighted.replace(/`([^`]*)`/g, '<span class="code-string">`$1`</span>');
                
                // Numbers
                highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');
                
                // Comments
                highlighted = highlighted.replace(/\/\/.*/g, '<span class="code-comment">$&</span>');
                
                // Operators
                const operators = ['=', '===', '!==', '<', '>', '<=', '>=', '\\+', '-', '\\*', '/', '%', '\\+\\+', '--', '&&', '\\|\\|', '!'];
                operators.forEach(op => {
                    const regex = new RegExp(`(${op})`, 'g');
                    highlighted = highlighted.replace(regex, '<span class="code-operator">$1</span>');
                });
                
                return highlighted;
            }
            
            // Initialize execution state
            function initExecutionState(code, args) {
                executionState = {
                    code: code,
                    args: args,
                    callStack: [],
                    variables: {},
                    output: [],
                    currentStep: 0,
                    nodes: [],
                    lines: code.split('\n'),
                    breakpoints: new Set()
                };
                
                // Parse code to create function nodes
                parseFunctions(code);
                
                // Update visualization
                updateVisualization();
            }
            
            // Parse functions from code
            function parseFunctions(code) {
                executionState.nodes = [];
                
                // Simple regex to find function definitions
                const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
                let match;
                const functions = [];
                
                while ((match = functionRegex.exec(code)) !== null) {
                    const funcName = match[1];
                    const params = match[2].split(',').map(p => p.trim()).filter(p => p);
                    
                    functions.push({
                        name: funcName,
                        params: params,
                        startLine: getLineNumber(code, match.index),
                        endLine: getLineNumber(code, match.index + match[0].length)
                    });
                }
                
                // Create nodes for each function
                functions.forEach((func, index) => {
                    const node = {
                        id: `node-${func.name}`,
                        name: func.name,
                        params: func.params,
                        x: 100 + (index * 250),
                        y: 100 + (index % 2 === 0 ? 0 : 150),
                        status: 'waiting', // waiting, active, completed
                        currentValues: {},
                        returnValue: null
                    };
                    
                    executionState.nodes.push(node);
                });
                
                // Add main execution node
                executionState.nodes.push({
                    id: 'node-main',
                    name: 'main',
                    params: [],
                    x: flowDiagram.clientWidth / 2,
                    y: 50,
                    status: 'waiting',
                    currentValues: {},
                    returnValue: null
                });
            }
            
            // Get line number from character index
            function getLineNumber(code, charIndex) {
                const lines = code.substring(0, charIndex).split('\n');
                return lines.length;
            }
            
            // Setup event listeners
            function setupEventListeners() {
                // Control buttons
                stepBtn.addEventListener('click', stepExecution);
                runBtn.addEventListener('click', startExecution);
                pauseBtn.addEventListener('click', pauseExecution);
                resetBtn.addEventListener('click', resetExecution);
                explainBtn.addEventListener('click', showExplanation);
                speedUpBtn.addEventListener('click', increaseSpeed);
                slowDownBtn.addEventListener('click', decreaseSpeed);
                visualizeBtn.addEventListener('click', visualizeExecution);
                
                // Speed slider
                speedSlider.addEventListener('input', function() {
                    animationSpeed = parseFloat(this.value);
                    updateSpeedDisplay();
                    
                    if (isRunning) {
                        pauseExecution();
                        startExecution();
                    }
                });
                
                // Code line click for breakpoints
                codeArea.addEventListener('click', function(e) {
                    const lineElement = e.target.closest('.code-line');
                    if (lineElement) {
                        const lineNum = parseInt(lineElement.dataset.line);
                        toggleBreakpoint(lineNum);
                    }
                });
                
                // Tooltip for code elements
                codeArea.addEventListener('mouseover', function(e) {
                    const codeElement = e.target;
                    if (codeElement.classList.contains('code-function')) {
                        showTooltip(codeElement, 'Function: Click to see flow');
                    } else if (codeElement.classList.contains('code-variable')) {
                        showTooltip(codeElement, 'Variable: Hover to see value');
                    }
                });
                
                codeArea.addEventListener('mouseout', function() {
                    hideTooltip();
                });
                
                // Window resize
                window.addEventListener('resize', updateVisualization);
            }
            
            // Show tooltip
            function showTooltip(element, text) {
                const rect = element.getBoundingClientRect();
                tooltip.textContent = text;
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
                tooltip.classList.add('show');
            }
            
            // Hide tooltip
            function hideTooltip() {
                tooltip.classList.remove('show');
            }
            
            // Update speed display
            function updateSpeedDisplay() {
                speedValue.textContent = `${animationSpeed}x`;
                speedSlider.value = animationSpeed;
            }
            
            // Increase speed
            function increaseSpeed() {
                animationSpeed = Math.min(5, animationSpeed + 0.5);
                updateSpeedDisplay();
                
                if (isRunning) {
                    pauseExecution();
                    startExecution();
                }
            }
            
            // Decrease speed
            function decreaseSpeed() {
                animationSpeed = Math.max(0.5, animationSpeed - 0.5);
                updateSpeedDisplay();
                
                if (isRunning) {
                    pauseExecution();
                    startExecution();
                }
            }
            
            // Step through execution
            function stepExecution() {
                if (!executionState) return;
                
                executionState.currentStep++;
                updateExecution();
                updateVisualization();
            }
            
            // Start execution
            function startExecution() {
                if (isRunning) return;
                
                isRunning = true;
                runBtn.disabled = true;
                pauseBtn.disabled = false;
                
                animationInterval = setInterval(() => {
                    executionState.currentStep++;
                    updateExecution();
                    updateVisualization();
                    
                    // Check for breakpoints
                    if (executionState.breakpoints.has(currentLine)) {
                        pauseExecution();
                        return;
                    }
                    
                    // Check if execution is complete
                    if (executionState.currentStep >= executionState.lines.length * 2) {
                        pauseExecution();
                        addConsoleOutput("Execution completed!");
                    }
                }, 1000 / animationSpeed);
            }
            
            // Pause execution
            function pauseExecution() {
                isRunning = false;
                clearInterval(animationInterval);
                runBtn.disabled = false;
                pauseBtn.disabled = true;
            }
            
            // Reset execution
            function resetExecution() {
                pauseExecution();
                loadExample(currentExample);
            }
            
            // Show explanation
            function showExplanation() {
                const example = examples[currentExample];
                if (example && example.explanation) {
                    addConsoleOutput("Explanation: " + example.explanation);
                }
            }
            
            // Visualize execution
            function visualizeExecution() {
                // Parse args
                const args = argsInput.value.split(',').map(arg => arg.trim());
                
                // Update execution state
                initExecutionState(examples[currentExample].code, args);
                
                // Start visualization
                startExecution();
            }
            
            // Toggle breakpoint
            function toggleBreakpoint(lineNum) {
                if (executionState.breakpoints.has(lineNum)) {
                    executionState.breakpoints.delete(lineNum);
                    // Remove highlight
                    const lineElement = document.querySelector(`.code-line[data-line="${lineNum}"]`);
                    if (lineElement) {
                        lineElement.classList.remove('code-highlight');
                    }
                } else {
                    executionState.breakpoints.add(lineNum);
                    // Add highlight
                    const lineElement = document.querySelector(`.code-line[data-line="${lineNum}"]`);
                    if (lineElement) {
                        lineElement.classList.add('code-highlight');
                    }
                }
            }
            
            // Update execution state
            function updateExecution() {
                if (!executionState) return;
                
                const lines = executionState.lines;
                const step = executionState.currentStep;
                
                // Calculate current line (simplified)
                currentLine = (step % lines.length) + 1;
                
                // Update current node based on line
                const currentLineText = lines[currentLine - 1];
                
                // Find which function this line belongs to
                let currentNodeName = 'main';
                for (const node of executionState.nodes) {
                    if (node.name !== 'main' && currentLineText.includes(node.name)) {
                        currentNodeName = node.name;
                        break;
                    }
                }
                
                // Update node status
                executionState.nodes.forEach(node => {
                    if (node.name === currentNodeName) {
                        node.status = 'active';
                        currentNode = node;
                        
                        // Simulate some value changes
                        if (node.params.length > 0) {
                            node.params.forEach((param, index) => {
                                if (executionState.args[index]) {
                                    node.currentValues[param] = executionState.args[index];
                                }
                            });
                        }
                        
                        // Simulate return value for some steps
                        if (step % 5 === 0 && node.name !== 'main') {
                            node.returnValue = Math.floor(Math.random() * 100);
                            node.status = 'completed';
                        }
                    } else if (node.status === 'active') {
                        node.status = 'completed';
                    }
                });
                
                // Update call stack
                updateCallStack();
                
                // Add console output for certain lines
                if (currentLineText.includes('console.log')) {
                    const logMatch = currentLineText.match(/console\.log\(([^)]+)\)/);
                    if (logMatch) {
                        const logContent = logMatch[1].replace(/["']/g, '');
                        addConsoleOutput(logContent);
                    }
                }
                
                // Highlight current line in code
                highlightCurrentLine(currentLine);
            }
            
            // Highlight current line in code
            function highlightCurrentLine(lineNum) {
                // Remove previous highlight
                document.querySelectorAll('.code-line').forEach(line => {
                    line.classList.remove('highlight');
                });
                
                // Add highlight to current line
                const currentLineElement = document.querySelector(`.code-line[data-line="${lineNum}"]`);
                if (currentLineElement) {
                    currentLineElement.classList.add('highlight');
                    currentLineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            // Update call stack
            function updateCallStack() {
                if (!executionState) return;
                
                let stackHTML = '';
                executionState.nodes.forEach(node => {
                    if (node.status !== 'waiting') {
                        const statusClass = node.status === 'active' ? 'active' : 'completed';
                        stackHTML += `
                            <div class="stack-item ${statusClass}">
                                ${node.name}(${node.params.map(p => `${p}=${node.currentValues[p] || '?'}`).join(', ')})
                                ${node.returnValue ? `→ ${node.returnValue}` : ''}
                            </div>
                        `;
                    }
                });
                
                callStack.innerHTML = `<h3 class="stack-title"><i class="fas fa-layer-group"></i> Call Stack</h3>${stackHTML}`;
            }
            
            // Add console output
            function addConsoleOutput(message) {
                const timestamp = new Date().toLocaleTimeString();
                const outputLine = document.createElement('div');
                outputLine.className = 'console-line';
                outputLine.textContent = `[${timestamp}] ${message}`;
                
                consoleOutput.appendChild(outputLine);
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
            }
            
            // Update visualization
            function updateVisualization() {
                if (!executionState) return;
                
                flowDiagram.innerHTML = '';
                
                // Create nodes
                executionState.nodes.forEach(node => {
                    createFunctionNode(node);
                });
                
                // Create flow lines between nodes
                createFlowLines();
                
                // Create value flows (animated)
                if (currentNode && currentNode.returnValue !== null) {
                    createValueFlow(currentNode);
                }
            }
            
            // Create function node
            function createFunctionNode(node) {
                const nodeElement = document.createElement('div');
                nodeElement.className = `function-node ${node.status}`;
                nodeElement.id = node.id;
                nodeElement.style.left = `${node.x}px`;
                nodeElement.style.top = `${node.y}px`;
                
                // Status badge
                let statusBadge = '';
                let statusText = '';
                switch (node.status) {
                    case 'waiting':
                        statusBadge = '<i class="fas fa-clock"></i>';
                        statusText = 'Waiting';
                        break;
                    case 'active':
                        statusBadge = '<i class="fas fa-play-circle"></i>';
                        statusText = 'Executing';
                        break;
                    case 'completed':
                        statusBadge = '<i class="fas fa-check-circle"></i>';
                        statusText = 'Completed';
                        break;
                }
                
                // Parameters display
                let paramsHTML = '';
                node.params.forEach(param => {
                    const value = node.currentValues[param] || '?';
                    paramsHTML += `
                        <div class="parameter">
                            <span class="param-name">${param}</span>
                            <span class="param-value">${value}</span>
                        </div>
                    `;
                });
                
                nodeElement.innerHTML = `
                    <div class="node-header">
                        <div class="node-title">${node.name}()</div>
                        <div class="node-status">${statusBadge} ${statusText}</div>
                    </div>
                    <div class="node-body">
                        ${paramsHTML || '<div style="color: #6272a4; font-style: italic;">No parameters</div>'}
                    </div>
                    <div class="node-footer">
                        <div>Line: ${getFunctionLine(node.name)}</div>
                        ${node.returnValue !== null ? `<div>Returns: <strong>${node.returnValue}</strong></div>` : '<div>No return yet</div>'}
                    </div>
                `;
                
                flowDiagram.appendChild(nodeElement);
            }
            
            // Get function line number
            function getFunctionLine(functionName) {
                const code = executionState.code;
                const lines = code.split('\n');
                
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes(`function ${functionName}`)) {
                        return i + 1;
                    }
                }
                
                return '?';
            }
            
            // Create flow lines between nodes
            function createFlowLines() {
                const nodes = executionState.nodes;
                
                for (let i = 0; i < nodes.length - 1; i++) {
                    const fromNode = nodes[i];
                    const toNode = nodes[i + 1] || nodes[0]; // Loop back to first
                    
                    if (fromNode.status === 'completed' && toNode.status === 'active') {
                        createFlowLine(fromNode, toNode, true);
                    } else {
                        createFlowLine(fromNode, toNode, false);
                    }
                }
            }
            
            // Create a single flow line
            function createFlowLine(fromNode, toNode, isActive) {
                const fromX = fromNode.x + 100;
                const fromY = fromNode.y + 60;
                const toX = toNode.x;
                const toY = toNode.y + 60;
                
                // Calculate line length and angle
                const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
                const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
                
                const lineElement = document.createElement('div');
                lineElement.className = `flow-line ${isActive ? 'active' : ''}`;
                lineElement.style.left = `${fromX}px`;
                lineElement.style.top = `${fromY}px`;
                lineElement.style.width = `${length}px`;
                lineElement.style.transform = `rotate(${angle}deg)`;
                lineElement.style.height = '3px';
                
                // Add arrow head
                if (isActive) {
                    lineElement.innerHTML = `<div style="position: absolute; right: -5px; top: -5px; width: 0; height: 0; border-left: 8px solid #00dbde; border-top: 5px solid transparent; border-bottom: 5px solid transparent;"></div>`;
                }
                
                flowDiagram.appendChild(lineElement);
            }
            
            // Create value flow animation
            function createValueFlow(fromNode) {
                if (!fromNode.returnValue) return;
                
                // Find a node to flow to (simplified)
                const toNode = executionState.nodes.find(n => n.status === 'active' && n !== fromNode);
                if (!toNode) return;
                
                const valueElement = document.createElement('div');
                valueElement.className = 'value-flow';
                valueElement.textContent = fromNode.returnValue;
                valueElement.style.left = `${fromNode.x + 100}px`;
                valueElement.style.top = `${fromNode.y + 60}px`;
                
                flowDiagram.appendChild(valueElement);
                
                // Animate movement
                const startX = fromNode.x + 100;
                const startY = fromNode.y + 60;
                const endX = toNode.x;
                const endY = toNode.y + 60;
                
                let progress = 0;
                const duration = 1000;
                const startTime = Date.now();
                
                function animate() {
                    const elapsed = Date.now() - startTime;
                    progress = Math.min(elapsed / duration, 1);
                    
                    const currentX = startX + (endX - startX) * progress;
                    const currentY = startY + (endY - startY) * progress;
                    
                    valueElement.style.left = `${currentX}px`;
                    valueElement.style.top = `${currentY}px`;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        valueElement.remove();
                    }
                }
                
                requestAnimationFrame(animate);
            }
            
            // Reset visualization
            function resetVisualization() {
                flowDiagram.innerHTML = '';
                callStack.innerHTML = '<h3 class="stack-title"><i class="fas fa-layer-group"></i> Call Stack</h3>';
                consoleOutput.innerHTML = '<h3 class="console-title"><i class="fas fa-terminal"></i> Console Output</h3>';
                
                // Remove all highlights
                document.querySelectorAll('.code-line').forEach(line => {
                    line.classList.remove('highlight', 'code-highlight');
                });
                
                // Clear breakpoints
                if (executionState) {
                    executionState.breakpoints.clear();
                }
            }
            
            // Initialize the application
            init();
        });
    