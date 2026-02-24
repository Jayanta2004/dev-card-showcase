/**
 * Secure Sandbox Execution Chamber #5062
 * A comprehensive code execution environment with security measures
 */

class SecureSandboxExecutionChamber {
    constructor() {
        this.editor = null;
        this.currentLanguage = 'javascript';
        this.executionHistory = [];
        this.analytics = {
            totalExecutions: 0,
            successfulExecutions: 0,
            languageUsage: {},
            executionTimes: [],
            dailyActivity: {},
            errors: []
        };
        this.settings = this.loadSettings();
        this.templates = this.loadTemplates();
        this.isExecuting = false;
        this.executionTimeout = null;

        this.init();
    }

    init() {
        this.initMonacoEditor();
        this.initEventListeners();
        this.initCharts();
        this.loadHistory();
        this.updateAnalytics();
        this.applySettings();
        this.initConsole();
    }

    initMonacoEditor() {
        // Load Monaco Editor
        require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });

        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(document.getElementById('code-editor'), {
                value: this.getDefaultCode(),
                language: this.currentLanguage,
                theme: this.settings.theme === 'dark' ? 'vs-dark' : 'vs',
                fontSize: parseInt(this.settings.fontSize),
                tabSize: parseInt(this.settings.tabSize),
                wordWrap: this.settings.wordWrap ? 'on' : 'off',
                minimap: { enabled: this.settings.minimap },
                lineNumbers: this.settings.showLineNumbers ? 'on' : 'off',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                guides: {
                    bracketPairs: true,
                    indentation: true
                }
            });

            // Language change handler
            document.getElementById('language-select').addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });

            // Auto-execute on save if enabled
            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                if (this.settings.autoExecute) {
                    this.executeCode();
                }
            });
        });
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        if (this.editor) {
            const model = this.editor.getModel();
            monaco.editor.setModelLanguage(model, this.getMonacoLanguage(language));
        }
        this.updateLanguageUsage(language);
    }

    getMonacoLanguage(language) {
        const languageMap = {
            javascript: 'javascript',
            python: 'python',
            java: 'java',
            cpp: 'cpp',
            html: 'html'
        };
        return languageMap[language] || 'javascript';
    }

    getDefaultCode() {
        const defaults = {
            javascript: `// Welcome to Secure Sandbox Execution Chamber
// Write your JavaScript code here

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci of 10:', fibonacci(10));

// Try different code snippets!
// Remember: Network and filesystem access is blocked for security`,
            python: `# Welcome to Secure Sandbox Execution Chamber
# Python execution is simulated for security

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci of 10:", fibonacci(10))

# Note: This is a simulation - actual Python execution is not supported
# for security reasons. Only JavaScript execution is allowed.`,
            java: `// Welcome to Secure Sandbox Execution Chamber
// Java execution is simulated for security

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Secure Sandbox!");
        System.out.println("Fibonacci of 10: " + fibonacci(10));
    }

    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}

// Note: This is a simulation - actual Java compilation is not supported
// for security reasons. Only JavaScript execution is allowed.`,
            cpp: `// Welcome to Secure Sandbox Execution Chamber
// C++ execution is simulated for security

#include <iostream>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    std::cout << "Hello, Secure Sandbox!" << std::endl;
    std::cout << "Fibonacci of 10: " << fibonacci(10) << std::endl;
    return 0;
}

// Note: This is a simulation - actual C++ compilation is not supported
// for security reasons. Only JavaScript execution is allowed.`,
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Sandbox</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Secure Sandbox</h1>
        <p>This is a simulated HTML preview.</p>
        <p>Actual HTML rendering is not supported for security reasons.</p>
        <p>Only JavaScript execution is allowed in this environment.</p>
    </div>
</body>
</html>`
        };
        return defaults[this.currentLanguage] || defaults.javascript;
    }

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.getAttribute('href').substring(1));
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Execution controls
        document.getElementById('run-code').addEventListener('click', () => {
            this.executeCode();
        });

        document.getElementById('stop-execution').addEventListener('click', () => {
            this.stopExecution();
        });

        document.getElementById('clear-output').addEventListener('click', () => {
            this.clearOutput();
        });

        document.getElementById('save-snippet').addEventListener('click', () => {
            this.saveSnippet();
        });

        document.getElementById('share-code').addEventListener('click', () => {
            this.showShareModal();
        });

        // Console controls
        document.getElementById('clear-console').addEventListener('click', () => {
            this.clearConsole();
        });

        document.getElementById('export-console').addEventListener('click', () => {
            this.exportConsole();
        });

        // History controls
        document.getElementById('history-search').addEventListener('input', (e) => {
            this.filterHistory(e.target.value);
        });

        document.getElementById('history-language-filter').addEventListener('change', (e) => {
            this.filterHistoryByLanguage(e.target.value);
        });

        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });

        // Template selection
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', () => {
                const template = item.dataset.template;
                this.loadTemplate(template);
            });
        });

        // Settings
        this.initSettingsListeners();

        // Share modal
        document.getElementById('close-share-modal').addEventListener('click', () => {
            this.hideShareModal();
        });

        document.getElementById('copy-share-url').addEventListener('click', () => {
            this.copyToClipboard('share-url');
        });

        document.getElementById('copy-embed-code').addEventListener('click', () => {
            this.copyToClipboard('embed-code');
        });

        // Export functionality
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });
    }

    initSettingsListeners() {
        // Execution settings
        document.getElementById('auto-execute').addEventListener('change', (e) => {
            this.settings.autoExecute = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('show-line-numbers').addEventListener('change', (e) => {
            this.settings.showLineNumbers = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('execution-timeout').addEventListener('change', (e) => {
            this.settings.executionTimeout = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('max-output-length').addEventListener('change', (e) => {
            this.settings.maxOutputLength = parseInt(e.target.value);
            this.saveSettings();
        });

        // Security settings
        document.getElementById('block-network').addEventListener('change', (e) => {
            this.settings.blockNetwork = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('block-filesystem').addEventListener('change', (e) => {
            this.settings.blockFilesystem = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('max-memory').addEventListener('change', (e) => {
            this.settings.maxMemory = parseInt(e.target.value);
            this.saveSettings();
        });

        // Editor settings
        document.getElementById('font-size').addEventListener('change', (e) => {
            this.settings.fontSize = e.target.value;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('tab-size').addEventListener('change', (e) => {
            this.settings.tabSize = e.target.value;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('word-wrap').addEventListener('change', (e) => {
            this.settings.wordWrap = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('minimap').addEventListener('change', (e) => {
            this.settings.minimap = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });

        // Data management
        document.getElementById('export-settings').addEventListener('click', () => {
            this.exportSettings();
        });

        document.getElementById('import-settings').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importSettings(e.target.files[0]);
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                this.resetSettings();
            }
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.clearAllData();
            }
        });
    }

    initConsole() {
        const consoleInput = document.getElementById('console-input');
        consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeConsoleCommand(consoleInput.value);
                consoleInput.value = '';
            }
        });
    }

    initCharts() {
        // Language usage chart
        this.languageChart = new Chart(document.getElementById('language-chart'), {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Performance chart
        this.performanceChart = new Chart(document.getElementById('performance-chart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Activity chart
        this.activityChart = new Chart(document.getElementById('activity-chart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Executions',
                    data: [],
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Error chart
        this.errorChart = new Chart(document.getElementById('error-chart'), {
            type: 'pie',
            data: {
                labels: ['Syntax Errors', 'Runtime Errors', 'Timeout Errors', 'Memory Errors'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    async executeCode() {
        if (this.isExecuting) return;

        this.isExecuting = true;
        this.updateExecutionButtons();

        const code = this.editor ? this.editor.getValue() : '';
        const input = document.getElementById('execution-input').value;

        const startTime = performance.now();

        try {
            let result;
            if (this.currentLanguage === 'javascript') {
                result = await this.executeJavaScript(code, input);
            } else {
                result = this.simulateExecution(code, this.currentLanguage);
            }

            const executionTime = performance.now() - startTime;
            this.displayResult(result, executionTime);
            this.addToHistory(code, result, executionTime, true);
            this.updateAnalytics(true, executionTime);

        } catch (error) {
            const executionTime = performance.now() - startTime;
            this.displayError(error.message, executionTime);
            this.addToHistory(code, error.message, executionTime, false);
            this.updateAnalytics(false, executionTime, error);
        }

        this.isExecuting = false;
        this.updateExecutionButtons();
    }

    async executeJavaScript(code, input) {
        return new Promise((resolve, reject) => {
            // Set up timeout
            this.executionTimeout = setTimeout(() => {
                reject(new Error('Execution timeout'));
            }, this.settings.executionTimeout);

            // Create sandboxed execution environment
            const sandbox = {
                console: {
                    log: (...args) => {
                        this.logToConsole(args.join(' '));
                    },
                    error: (...args) => {
                        this.logToConsole('ERROR: ' + args.join(' '), 'error');
                    },
                    warn: (...args) => {
                        this.logToConsole('WARN: ' + args.join(' '), 'warning');
                    }
                },
                input: input,
                output: '',
                performance: {
                    now: () => performance.now()
                },
                // Block dangerous globals
                eval: undefined,
                Function: undefined,
                setTimeout: undefined,
                setInterval: undefined,
                clearTimeout: undefined,
                clearInterval: undefined,
                fetch: this.settings.blockNetwork ? undefined : fetch,
                XMLHttpRequest: this.settings.blockNetwork ? undefined : XMLHttpRequest,
                WebSocket: this.settings.blockNetwork ? undefined : WebSocket,
                localStorage: undefined,
                sessionStorage: undefined,
                indexedDB: undefined,
                // File system access
                FileReader: this.settings.blockFilesystem ? undefined : FileReader,
                File: this.settings.blockFilesystem ? undefined : File,
                Blob: this.settings.blockFilesystem ? undefined : Blob,
                // Memory monitoring
                memoryUsed: 0
            };

            try {
                // Execute code in sandbox
                const result = new Function(...Object.keys(sandbox), `
                    "use strict";
                    try {
                        ${code}
                        return output || 'Code executed successfully';
                    } catch (e) {
                        throw new Error(e.message);
                    }
                `)(...Object.values(sandbox));

                clearTimeout(this.executionTimeout);
                resolve(result);
            } catch (error) {
                clearTimeout(this.executionTimeout);
                reject(error);
            }
        });
    }

    simulateExecution(code, language) {
        const simulations = {
            python: `Python simulation: Code would execute as:
${code}

Output: [Simulated Python output]
Note: Only JavaScript execution is allowed for security reasons.`,
            java: `Java simulation: Code would compile and run as:
${code}

Output: [Simulated Java output]
Note: Only JavaScript execution is allowed for security reasons.`,
            cpp: `C++ simulation: Code would compile and run as:
${code}

Output: [Simulated C++ output]
Note: Only JavaScript execution is allowed for security reasons.`,
            html: `HTML simulation: Would render as:
${code}

Output: [Simulated HTML rendering]
Note: Only JavaScript execution is allowed for security reasons.`
        };

        return simulations[language] || 'Unsupported language';
    }

    executeConsoleCommand(command) {
        if (!command.trim()) return;

        this.logToConsole(`> ${command}`);

        try {
            // Execute command in global scope with restrictions
            const result = this.executeJavaScript(command, '');
            this.logToConsole(result);
        } catch (error) {
            this.logToConsole(`Error: ${error.message}`, 'error');
        }
    }

    displayResult(result, executionTime) {
        const output = document.getElementById('execution-output');
        const formattedResult = this.formatOutput(result);

        output.textContent = formattedResult;
        output.className = 'execution-output success';

        this.updateMetrics(executionTime, 'success');
    }

    displayError(error, executionTime) {
        const output = document.getElementById('execution-output');
        output.textContent = `Error: ${error}`;
        output.className = 'execution-output error';

        this.updateMetrics(executionTime, 'error');
    }

    formatOutput(result) {
        if (typeof result === 'object') {
            return JSON.stringify(result, null, 2);
        }
        return String(result);
    }

    updateMetrics(executionTime, status) {
        document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)}ms`;
        document.getElementById('memory-used').textContent = 'N/A'; // Would need more complex tracking
        document.getElementById('security-status').textContent = status === 'success' ? 'Safe' : 'Error';
        document.getElementById('security-status').className = status === 'success' ? 'success' : 'error';
    }

    logToConsole(message, type = 'log') {
        const consoleOutput = document.getElementById('console-output');
        const timestamp = new Date().toLocaleTimeString();
        const className = type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success';

        consoleOutput.innerHTML += `<div class="${className}">[${timestamp}] ${message}</div>`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    clearOutput() {
        document.getElementById('execution-output').textContent = '';
        this.updateMetrics(0, 'cleared');
    }

    clearConsole() {
        document.getElementById('console-output').innerHTML = '';
    }

    exportConsole() {
        const consoleOutput = document.getElementById('console-output').innerHTML;
        const blob = new Blob([consoleOutput.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
        this.downloadBlob(blob, 'console-log.txt');
    }

    saveSnippet() {
        const code = this.editor ? this.editor.getValue() : '';
        const snippet = {
            id: Date.now(),
            code: code,
            language: this.currentLanguage,
            timestamp: new Date().toISOString(),
            title: `Snippet ${new Date().toLocaleString()}`
        };

        const snippets = this.loadSnippets();
        snippets.push(snippet);
        localStorage.setItem('sandbox-snippets', JSON.stringify(snippets));

        this.showNotification('Snippet saved successfully!');
    }

    addToHistory(code, result, executionTime, success) {
        const historyItem = {
            id: Date.now(),
            code: code,
            result: result,
            language: this.currentLanguage,
            executionTime: executionTime,
            success: success,
            timestamp: new Date().toISOString()
        };

        this.executionHistory.unshift(historyItem);
        if (this.executionHistory.length > 100) {
            this.executionHistory = this.executionHistory.slice(0, 100);
        }

        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        this.executionHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.onclick = () => this.loadHistoryItem(item);

            historyItem.innerHTML = `
                <div class="history-meta">
                    <span>${item.language.toUpperCase()} • ${new Date(item.timestamp).toLocaleString()}</span>
                    <span class="${item.success ? 'success' : 'error'}">
                        ${item.success ? '✓' : '✗'} ${item.executionTime.toFixed(2)}ms
                    </span>
                </div>
                <div class="history-code">${this.truncateCode(item.code)}</div>
            `;

            historyList.appendChild(historyItem);
        });
    }

    loadHistoryItem(item) {
        if (this.editor) {
            this.editor.setValue(item.code);
            document.getElementById('language-select').value = item.language;
            this.changeLanguage(item.language);
        }
        this.switchSection('editor');
    }

    truncateCode(code) {
        return code.length > 100 ? code.substring(0, 100) + '...' : code;
    }

    filterHistory(query) {
        const items = document.querySelectorAll('.history-item');
        items.forEach(item => {
            const code = item.querySelector('.history-code').textContent.toLowerCase();
            item.style.display = code.includes(query.toLowerCase()) ? 'block' : 'none';
        });
    }

    filterHistoryByLanguage(language) {
        const items = document.querySelectorAll('.history-item');
        items.forEach(item => {
            if (language === 'all') {
                item.style.display = 'block';
            } else {
                const itemLanguage = item.querySelector('.history-meta span:first-child').textContent.split(' • ')[0].toLowerCase();
                item.style.display = itemLanguage === language ? 'block' : 'none';
            }
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear execution history?')) {
            this.executionHistory = [];
            this.saveHistory();
            this.updateHistoryDisplay();
        }
    }

    loadTemplate(templateName) {
        const template = this.templates[templateName];
        if (template && this.editor) {
            this.editor.setValue(template.code);
            if (template.language) {
                document.getElementById('language-select').value = template.language;
                this.changeLanguage(template.language);
            }
            this.switchSection('editor');
        }
    }

    updateAnalytics(success = null, executionTime = null, error = null) {
        if (success !== null) {
            this.analytics.totalExecutions++;
            if (success) {
                this.analytics.successfulExecutions++;
            }
            if (executionTime !== null) {
                this.analytics.executionTimes.push(executionTime);
                if (this.analytics.executionTimes.length > 50) {
                    this.analytics.executionTimes.shift();
                }
            }
            if (error) {
                this.analytics.errors.push(error);
            }
        }

        // Update language usage
        this.analytics.languageUsage[this.currentLanguage] = (this.analytics.languageUsage[this.currentLanguage] || 0) + 1;

        // Update daily activity
        const today = new Date().toDateString();
        this.analytics.dailyActivity[today] = (this.analytics.dailyActivity[today] || 0) + 1;

        this.saveAnalytics();
        this.updateAnalyticsDisplay();
        this.updateCharts();
    }

    updateAnalyticsDisplay() {
        document.getElementById('total-executions').textContent = this.analytics.totalExecutions;
        document.getElementById('success-rate').textContent = 
            this.analytics.totalExecutions > 0 ? 
            `${((this.analytics.successfulExecutions / this.analytics.totalExecutions) * 100).toFixed(1)}%` : '0%';
        
        const avgTime = this.analytics.executionTimes.length > 0 ? 
            this.analytics.executionTimes.reduce((a, b) => a + b, 0) / this.analytics.executionTimes.length : 0;
        document.getElementById('avg-execution-time').textContent = `${avgTime.toFixed(2)}ms`;

        const mostUsed = Object.entries(this.analytics.languageUsage)
            .sort(([,a], [,b]) => b - a)[0];
        document.getElementById('most-used-language').textContent = mostUsed ? mostUsed[0] : '-';
    }

    updateCharts() {
        // Language usage chart
        const languages = Object.keys(this.analytics.languageUsage);
        const usage = Object.values(this.analytics.languageUsage);
        this.languageChart.data.labels = languages;
        this.languageChart.data.datasets[0].data = usage;
        this.languageChart.update();

        // Performance chart
        const times = this.analytics.executionTimes.slice(-20);
        this.performanceChart.data.labels = times.map((_, i) => `Exec ${i + 1}`);
        this.performanceChart.data.datasets[0].data = times;
        this.performanceChart.update();

        // Activity chart
        const dates = Object.keys(this.analytics.dailyActivity).slice(-7);
        const activities = dates.map(date => this.analytics.dailyActivity[date]);
        this.activityChart.data.labels = dates;
        this.activityChart.data.datasets[0].data = activities;
        this.activityChart.update();

        // Error chart
        const errorCounts = [0, 0, 0, 0]; // syntax, runtime, timeout, memory
        this.analytics.errors.forEach(error => {
            if (error.message.includes('Syntax')) errorCounts[0]++;
            else if (error.message.includes('timeout')) errorCounts[2]++;
            else errorCounts[1]++;
        });
        this.errorChart.data.datasets[0].data = errorCounts;
        this.errorChart.update();
    }

    showShareModal() {
        const code = this.editor ? this.editor.getValue() : '';
        const shareUrl = this.generateShareUrl(code);
        const embedCode = this.generateEmbedCode(code);

        document.getElementById('share-url').value = shareUrl;
        document.getElementById('embed-code').value = embedCode;

        document.getElementById('share-modal').classList.add('active');
    }

    hideShareModal() {
        document.getElementById('share-modal').classList.remove('active');
    }

    generateShareUrl(code) {
        const encoded = btoa(JSON.stringify({
            code: code,
            language: this.currentLanguage,
            timestamp: Date.now()
        }));
        return `${window.location.origin}${window.location.pathname}#shared=${encoded}`;
    }

    generateEmbedCode(code) {
        const shareUrl = this.generateShareUrl(code);
        return `<iframe src="${shareUrl}" width="100%" height="400" frameborder="0"></iframe>`;
    }

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        element.select();
        document.execCommand('copy');
        this.showNotification('Copied to clipboard!');
    }

    exportData() {
        const data = {
            history: this.executionHistory,
            analytics: this.analytics,
            settings: this.settings,
            snippets: this.loadSnippets(),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, 'sandbox-data.json');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings();
        this.applyTheme();
        if (this.editor) {
            monaco.editor.setTheme(this.settings.theme === 'dark' ? 'vs-dark' : 'vs');
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('theme-toggle').textContent = this.settings.theme === 'dark' ? '☀️' : '🌙';
    }

    switchSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }

    stopExecution() {
        if (this.executionTimeout) {
            clearTimeout(this.executionTimeout);
            this.executionTimeout = null;
        }
        this.isExecuting = false;
        this.updateExecutionButtons();
        this.displayError('Execution stopped by user', 0);
    }

    updateExecutionButtons() {
        const runBtn = document.getElementById('run-code');
        const stopBtn = document.getElementById('stop-execution');

        runBtn.disabled = this.isExecuting;
        stopBtn.disabled = !this.isExecuting;
    }

    updateLanguageUsage(language) {
        this.analytics.languageUsage[language] = (this.analytics.languageUsage[language] || 0) + 1;
        this.saveAnalytics();
    }

    showNotification(message) {
        // Simple notification - could be enhanced with a proper notification system
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Data persistence methods
    loadSettings() {
        const defaultSettings = {
            theme: 'light',
            autoExecute: false,
            showLineNumbers: true,
            executionTimeout: 5000,
            maxOutputLength: 10000,
            blockNetwork: true,
            blockFilesystem: true,
            maxMemory: 50,
            fontSize: '14',
            tabSize: '4',
            wordWrap: false,
            minimap: true
        };

        try {
            const saved = localStorage.getItem('sandbox-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }

    saveSettings() {
        localStorage.setItem('sandbox-settings', JSON.stringify(this.settings));
    }

    applySettings() {
        this.applyTheme();

        // Apply settings to form elements
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });

        // Apply to Monaco editor
        if (this.editor) {
            this.editor.updateOptions({
                fontSize: parseInt(this.settings.fontSize),
                tabSize: parseInt(this.settings.tabSize),
                wordWrap: this.settings.wordWrap ? 'on' : 'off',
                minimap: { enabled: this.settings.minimap },
                lineNumbers: this.settings.showLineNumbers ? 'on' : 'off'
            });
        }
    }

    resetSettings() {
        localStorage.removeItem('sandbox-settings');
        this.settings = this.loadSettings();
        this.applySettings();
    }

    exportSettings() {
        const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, 'sandbox-settings.json');
    }

    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                this.settings = { ...this.settings, ...imported };
                this.saveSettings();
                this.applySettings();
                this.showNotification('Settings imported successfully!');
            } catch (error) {
                this.showNotification('Error importing settings: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        localStorage.clear();
        this.executionHistory = [];
        this.analytics = {
            totalExecutions: 0,
            successfulExecutions: 0,
            languageUsage: {},
            executionTimes: [],
            dailyActivity: {},
            errors: []
        };
        this.settings = this.loadSettings();
        this.applySettings();
        this.updateHistoryDisplay();
        this.updateAnalyticsDisplay();
        this.updateCharts();
        this.showNotification('All data cleared!');
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('sandbox-history');
            this.executionHistory = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.executionHistory = [];
        }
        this.updateHistoryDisplay();
    }

    saveHistory() {
        localStorage.setItem('sandbox-history', JSON.stringify(this.executionHistory));
    }

    loadAnalytics() {
        try {
            const saved = localStorage.getItem('sandbox-analytics');
            if (saved) {
                this.analytics = { ...this.analytics, ...JSON.parse(saved) };
            }
        } catch (e) {
            // Use default analytics
        }
    }

    saveAnalytics() {
        localStorage.setItem('sandbox-analytics', JSON.stringify(this.analytics));
    }

    loadSnippets() {
        try {
            const saved = localStorage.getItem('sandbox-snippets');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    loadTemplates() {
        return {
            fibonacci: {
                code: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
    console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
                language: 'javascript'
            },
            sorting: {
                code: `// Bubble Sort Implementation
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

// Quick Sort Implementation
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), ...middle, ...quickSort(right)];
}

// Test the algorithms
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log('Original array:', testArray);
console.log('Bubble sort:', bubbleSort([...testArray]));
console.log('Quick sort:', quickSort([...testArray]));`,
                language: 'javascript'
            },
            'linked-list': {
                code: `class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    add(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
    }

    print() {
        let current = this.head;
        const elements = [];
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        console.log('Linked List:', elements.join(' -> '));
    }

    reverse() {
        let prev = null;
        let current = this.head;
        let next = null;

        while (current) {
            next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        this.head = prev;
    }
}

// Test the linked list
const list = new LinkedList();
list.add(1);
list.add(2);
list.add(3);
list.add(4);

console.log('Original list:');
list.print();

list.reverse();
console.log('Reversed list:');
list.print();`,
                language: 'javascript'
            },
            'dom-manipulation': {
                code: `// DOM Manipulation Examples
// Note: This code demonstrates DOM operations but won't work in this sandbox
// as we don't have access to a real DOM. This is for educational purposes.

function createElementExample() {
    // Create a new div element
    const div = document.createElement('div');
    div.textContent = 'Hello, World!';
    div.className = 'greeting';
    div.style.color = 'blue';

    // Append it to the body
    document.body.appendChild(div);

    console.log('Element created and appended');
}

function eventHandlingExample() {
    // Create a button
    const button = document.createElement('button');
    button.textContent = 'Click me!';
    button.addEventListener('click', () => {
        console.log('Button clicked!');
        button.textContent = 'Clicked!';
    });

    document.body.appendChild(button);
}

function ajaxExample() {
    // Fetch data from an API
    fetch('https://jsonplaceholder.typicode.com/todos/1')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

console.log('DOM manipulation examples loaded');
console.log('Note: These functions would work in a real browser environment');
// createElementExample();
// eventHandlingExample();
// ajaxExample();`,
                language: 'javascript'
            },
            'string-utils': {
                code: `// String Utility Functions

function isPalindrome(str) {
    const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanStr === cleanStr.split('').reverse().join('');
}

function countWords(str) {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

function reverseString(str) {
    return str.split('').reverse().join('');
}

function removeDuplicates(str) {
    return [...new Set(str)].join('');
}

function findLongestWord(str) {
    const words = str.split(/\s+/);
    return words.reduce((longest, current) =>
        current.length > longest.length ? current : longest, '');
}

// Test the functions
const testString = "A man, a plan, a canal: Panama";

console.log('Original string:', testString);
console.log('Is palindrome:', isPalindrome(testString));
console.log('Word count:', countWords(testString));
console.log('Capitalized:', capitalizeWords(testString));
console.log('Reversed:', reverseString(testString));
console.log('Without duplicates:', removeDuplicates(testString));
console.log('Longest word:', findLongestWord(testString));`,
                language: 'javascript'
            }
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SecureSandboxExecutionChamber();
});