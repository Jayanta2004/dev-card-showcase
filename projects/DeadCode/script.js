document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const codeInput = document.getElementById('codeInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsDiv = document.getElementById('results');
    const placeholderDiv = document.getElementById('resultsPlaceholder');
    const resultCountSpan = document.getElementById('resultCount');
    const checkUnusedFunctions = document.getElementById('checkUnusedFunctions');
    const checkUnusedVariables = document.getElementById('checkUnusedVariables');
    const checkUnusedImports = document.getElementById('checkUnusedImports');
    
    // Summary elements
    const totalFunctionsSpan = document.getElementById('totalFunctions');
    const unusedFunctionsSpan = document.getElementById('unusedFunctions');
    const totalVariablesSpan = document.getElementById('totalVariables');
    const unusedVariablesSpan = document.getElementById('unusedVariables');
    
    // Sample code
    const sampleCode = `// Sample code with some dead code
function calculateSum(a, b) {
    return a + b;
}

function calculateProduct(a, b) {
    return a * b;
}

function unusedFunction() {
    console.log("This function is never called");
}

const usedVariable = "I am used";
const unusedVariable = "I am not used";

// Function calls
const sum = calculateSum(5, 3);
console.log(usedVariable);

// Unused import (simulated)
// import { unusedImport } from './module.js';`;
    
    // Initialize with sample code
    codeInput.value = sampleCode;
    
    // Event Listeners
    analyzeBtn.addEventListener('click', analyzeCode);
    sampleBtn.addEventListener('click', loadSampleCode);
    clearBtn.addEventListener('click', clearCode);
    
    // Functions
    function loadSampleCode() {
        codeInput.value = sampleCode;
        clearResults();
        showNotification('Sample code loaded', 'info');
    }
    
    function clearCode() {
        codeInput.value = '';
        clearResults();
        showNotification('Code cleared', 'info');
    }
    
    function clearResults() {
        resultsDiv.innerHTML = '';
        resultsDiv.style.display = 'none';
        placeholderDiv.style.display = 'flex';
        resultCountSpan.textContent = '0 issues found';
        
        // Reset summary
        totalFunctionsSpan.textContent = '0';
        unusedFunctionsSpan.textContent = '0';
        totalVariablesSpan.textContent = '0';
        unusedVariablesSpan.textContent = '0';
    }
    
    function showNotification(message, type) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to DOM
        document.querySelector('.controls').appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    function analyzeCode() {
        const code = codeInput.value.trim();
        
        if (!code) {
            showNotification('Please enter some code to analyze', 'error');
            return;
        }
        
        // Clear previous results
        resultsDiv.innerHTML = '';
        resultsDiv.style.display = 'flex';
        placeholderDiv.style.display = 'none';
        
        // Initialize counters
        let totalFunctions = 0;
        let unusedFunctions = 0;
        let totalVariables = 0;
        let unusedVariables = 0;
        let issues = [];
        
        // Extract function definitions
        const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        const functionNames = [];
        let match;
        
        while ((match = functionRegex.exec(code)) !== null) {
            totalFunctions++;
            functionNames.push(match[1]);
        }
        
        // Extract arrow functions and const/let function assignments
        const arrowFunctionRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)|\w+)\s*=>/g;
        while ((match = arrowFunctionRegex.exec(code)) !== null) {
            totalFunctions++;
            functionNames.push(match[1]);
        }
        
        // Check for unused functions
        if (checkUnusedFunctions.checked) {
            functionNames.forEach(funcName => {
                // Count occurrences of function name (excluding definition)
                const functionDefRegex = new RegExp(`function\\s+${funcName}\\s*\\(|(?:const|let|var)\\s+${funcName}\\s*=.*=>`, 'g');
                const allOccurrencesRegex = new RegExp(`\\b${funcName}\\b`, 'g');
                
                const defMatches = code.match(functionDefRegex) || [];
                const allMatches = code.match(allOccurrencesRegex) || [];
                
                // If the function name appears only in its definition(s), it's unused
                if (allMatches.length <= defMatches.length) {
                    unusedFunctions++;
                    
                    // Find the line where the function is defined
                    const lines = code.split('\n');
                    let lineNumber = 0;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes(`function ${funcName}`) || 
                            lines[i].includes(`${funcName} =`) && lines[i].includes('=>')) {
                            lineNumber = i + 1;
                            break;
                        }
                    }
                    
                    issues.push({
                        type: 'function',
                        name: funcName,
                        line: lineNumber,
                        severity: 'high',
                        message: `Function "${funcName}" is defined but never called`
                    });
                }
            });
        }
        
        // Extract variable declarations (const, let, var)
        const variableRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\s*=\s*[^,;\n]+)?[,\s;]/g;
        const variableNames = [];
        const variableLines = {};
        
        // Reset regex lastIndex
        variableRegex.lastIndex = 0;
        
        // Get all lines
        const lines = code.split('\n');
        
        // Find all variable declarations
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            variableRegex.lastIndex = 0;
            
            while ((match = variableRegex.exec(line)) !== null) {
                // Skip function assignments (already handled)
                if (!line.includes('=>')) {
                    totalVariables++;
                    const varName = match[1];
                    variableNames.push(varName);
                    variableLines[varName] = i + 1;
                }
            }
        }
        
        // Check for unused variables
        if (checkUnusedVariables.checked) {
            variableNames.forEach(varName => {
                // Count occurrences of variable name (excluding declaration)
                const declarationRegex = new RegExp(`(?:const|let|var)\\s+${varName}\\b`, 'g');
                const allOccurrencesRegex = new RegExp(`\\b${varName}\\b`, 'g');
                
                const declMatches = code.match(declarationRegex) || [];
                const allMatches = code.match(allOccurrencesRegex) || [];
                
                // If the variable name appears only in its declaration(s), it's unused
                if (allMatches.length <= declMatches.length) {
                    unusedVariables++;
                    
                    issues.push({
                        type: 'variable',
                        name: varName,
                        line: variableLines[varName],
                        severity: 'medium',
                        message: `Variable "${varName}" is declared but never used`
                    });
                }
            });
        }
        
        // Check for unused imports (simplified check for import statements)
        if (checkUnusedImports.checked) {
            const importRegex = /import\s+(?:(?:\{[^}]*\}|\* as \w+|\w+)\s+from\s+)?['"][^'"]+['"]|import\s+['"][^'"]+['"]/g;
            const importStatements = code.match(importRegex) || [];
            
            importStatements.forEach((importStmt, index) => {
                // This is a simplified check - in a real implementation, you'd parse the imports properly
                // For this demo, we'll just flag all imports as potentially unused if they contain "unused"
                if (importStmt.includes('unused')) {
                    // Find the line number
                    const lines = code.split('\n');
                    let lineNumber = 0;
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes(importStmt.trim())) {
                            lineNumber = i + 1;
                            break;
                        }
                    }
                    
                    issues.push({
                        type: 'import',
                        name: 'unused import',
                        line: lineNumber,
                        severity: 'low',
                        message: `Possible unused import detected`
                    });
                }
            });
        }
        
        // Display results
        if (issues.length === 0) {
            resultsDiv.innerHTML = `
                <div class="result-item info">
                    <div class="result-header">
                        <div class="result-title">
                            <i class="fas fa-check-circle"></i>
                            <span>No dead code found!</span>
                        </div>
                    </div>
                    <div class="result-content">
                        Great! No unused functions, variables, or imports were detected in your code.
                    </div>
                </div>
            `;
        } else {
            issues.forEach(issue => {
                const severityClass = issue.severity === 'high' ? '' : issue.severity === 'medium' ? 'warning' : 'info';
                const severityIcon = issue.severity === 'high' ? 'exclamation-triangle' : 
                                    issue.severity === 'medium' ? 'exclamation-circle' : 'info-circle';
                const severityText = issue.severity === 'high' ? 'High' : 
                                    issue.severity === 'medium' ? 'Medium' : 'Low';
                
                const resultItem = document.createElement('div');
                resultItem.className = `result-item ${severityClass}`;
                resultItem.innerHTML = `
                    <div class="result-header">
                        <div class="result-title">
                            <i class="fas fa-${severityIcon}"></i>
                            <span>${issue.message}</span>
                        </div>
                        <div class="result-type">${issue.type.toUpperCase()}</div>
                    </div>
                    <div class="result-content">
                        ${issue.type === 'function' ? 'Function' : issue.type === 'variable' ? 'Variable' : 'Import'}: <strong>${issue.name}</strong>
                        ${issue.line ? ` | Line: ${issue.line}` : ''}
                        <br>
                        <span class="severity-badge">Severity: ${severityText}</span>
                    </div>
                `;
                
                resultsDiv.appendChild(resultItem);
            });
        }
        
        // Update result count
        resultCountSpan.textContent = `${issues.length} ${issues.length === 1 ? 'issue' : 'issues'} found`;
        
        // Update summary
        totalFunctionsSpan.textContent = totalFunctions;
        unusedFunctionsSpan.textContent = unusedFunctions;
        totalVariablesSpan.textContent = totalVariables;
        unusedVariablesSpan.textContent = unusedVariables;
        
        // Show notification
        showNotification(`Analysis complete: ${issues.length} issues found`, issues.length === 0 ? 'success' : 'info');
    }
    
    // Add CSS for notification
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        
        .notification.success {
            background-color: #4caf50;
            border-left: 4px solid #2e7d32;
        }
        
        .notification.info {
            background-color: #7e57c2;
            border-left: 4px solid #5e35b1;
        }
        
        .notification.error {
            background-color: #ff7b54;
            border-left: 4px solid #e64a19;
        }
        
        .severity-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 5px;
        }
        
        .result-item .severity-badge {
            background-color: #f0f0f0;
            color: #555;
        }
        
        .result-item.warning .severity-badge {
            background-color: #fff3e0;
            color: #ef6c00;
        }
        
        .result-item.info .severity-badge {
            background-color: #f3e5f5;
            color: #7e57c2;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});