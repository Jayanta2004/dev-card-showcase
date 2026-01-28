// Interactive Code Playground
class CodePlayground {
    constructor() {
        this.editor = null;
        this.currentLanguage = 'javascript';
        this.currentTheme = 'vs-dark';
        this.tabs = new Map();
        this.activeTabId = 'editor-1';
        this.consoleLogs = [];
        this.history = [];
        this.isSplitting = false;
        
        this.initializeMonaco();
        this.setupEventListeners();
        this.loadHistory();
        this.loadFromURL();
    }

    // Initialize Monaco Editor
    initializeMonaco() {
        require(['vs/editor/editor.main'], () => {
            // Create first tab
            this.tabs.set('editor-1', {
                id: 'editor-1',
                name: 'Untitled 1',
                language: 'javascript',
                code: '// Start coding here...\nconsole.log("Hello, World!");'
            });

            this.editor = monaco.editor.create(
                document.getElementById('editor-container'),
                {
                    value: this.tabs.get('editor-1').code,
                    language: 'javascript',
                    theme: 'vs-dark',
                    automaticLayout: true,
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    suggest: {
                        showWords: true,
                        showClasses: true,
                        showFunctions: true,
                        showVariables: true,
                        showKeywords: true,
                        showSnippets: true,
                        showMethods: true,
                        showProperties: true,
                        showOperators: true,
                        showUnits: true,
                        showConstants: true,
                        showEnums: true,
                        showEnumMembers: true,
                        showStructs: true,
                        showInterfaces: true,
                        showModules: true,
                        showColors: true,
                        showValues: true,
                        showReferences: true,
                        showFolders: true,
                        showFiles: true,
                        showIssues: true
                    },
                    quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: false
                    }
                }
            );

            // Update line and character count on change
            this.editor.onDidChangeModelContent(() => {
                this.updateEditorInfo();
                this.updateTabCode();
            });

            // Monitor cursor position
            this.editor.onDidChangeCursorPosition((e) => {
                this.updateEditorInfo();
            });

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Language selector
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.switchLanguage();
        });

        // Theme selector
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.currentTheme = e.target.value;
            this.switchTheme();
        });

        // Run button
        document.getElementById('run-btn').addEventListener('click', () => this.runCode());

        // Format button
        document.getElementById('format-btn').addEventListener('click', () => this.formatCode());

        // Copy button
        document.getElementById('copy-btn').addEventListener('click', () => this.copyCode());

        // Clear console button
        document.getElementById('clear-console-btn').addEventListener('click', () => this.clearConsole());

        // Share button
        document.getElementById('share-btn').addEventListener('click', () => this.showShareModal());

        // Download button
        document.getElementById('download-btn').addEventListener('click', () => this.downloadCode());

        // Add tab button
        document.getElementById('add-tab-btn').addEventListener('click', () => this.addNewTab());

        // Output tab buttons
        document.querySelectorAll('.output-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchOutputTab(e.target.dataset.output));
        });

        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadTemplate(e.target.dataset.template));
        });

        // Clear history button
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Share modal copy button
        document.getElementById('copy-link-btn').addEventListener('click', () => this.copyShareLink());

        // Save modal
        document.getElementById('save-confirm-btn').addEventListener('click', () => this.confirmSave());

        // Splitter
        const splitter = document.getElementById('splitter');
        splitter.addEventListener('mousedown', (e) => this.handleSplitterDrag(e));

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.runCode();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveToHistory();
                        break;
                    case '/':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.formatCode();
                        }
                        break;
                }
            }
        });
    }

    // Switch language
    switchLanguage() {
        const langMap = {
            'javascript': 'javascript',
            'python': 'python',
            'html': 'html',
            'java': 'java',
            'cpp': 'cpp',
            'typescript': 'typescript',
            'css': 'css',
            'sql': 'sql'
        };

        if (this.editor) {
            const model = this.editor.getModel();
            const newLanguage = langMap[this.currentLanguage];
            monaco.editor.setModelLanguage(model, newLanguage);
        }
    }

    // Switch theme
    switchTheme() {
        if (this.editor) {
            monaco.editor.setTheme(this.currentTheme);
        }
    }

    // Update editor info (line and char count)
    updateEditorInfo() {
        if (this.editor) {
            const model = this.editor.getModel();
            const position = this.editor.getPosition();
            const lineCount = model.getLineCount();
            const charCount = model.getValueLength();

            document.getElementById('line-info').textContent = 
                `Line: ${position.lineNumber}, Col: ${position.column}`;
            document.getElementById('char-count').textContent = 
                `Chars: ${charCount}`;
        }
    }

    // Run code
    runCode() {
        const code = this.editor.getValue();
        this.clearConsole();

        // Intercept console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
            this.addConsoleLog('log', args.map(arg => this.formatValue(arg)).join(' '));
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.addConsoleLog('error', args.map(arg => this.formatValue(arg)).join(' '));
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addConsoleLog('warn', args.map(arg => this.formatValue(arg)).join(' '));
            originalWarn.apply(console, args);
        };

        console.info = (...args) => {
            this.addConsoleLog('info', args.map(arg => this.formatValue(arg)).join(' '));
            originalInfo.apply(console, args);
        };

        try {
            // Handle different language outputs
            if (this.currentLanguage === 'html') {
                this.runHTMLCode(code);
            } else if (this.currentLanguage === 'python') {
                this.addConsoleLog('warn', 'Python execution requires a backend. Install python-in-browser library for client-side execution.');
            } else {
                // Execute JavaScript
                eval(code);
                this.saveToHistory();
            }
        } catch (error) {
            this.addConsoleLog('error', `${error.name}: ${error.message}`);
        } finally {
            // Restore console methods
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            console.info = originalInfo;
        }
    }

    // Run HTML code
    runHTMLCode(code) {
        const iframe = document.getElementById('preview-iframe');
        iframe.srcdoc = code;
        this.switchOutputTab('preview');
        this.saveToHistory();
    }

    // Format code with Prettier
    formatCode() {
        if (!this.editor) return;

        const btn = document.getElementById('format-btn');
        btn.classList.add('formatting');

        try {
            const code = this.editor.getValue();
            let formatted = code;

            if (this.currentLanguage === 'javascript' || this.currentLanguage === 'typescript') {
                formatted = prettier.format(code, {
                    parser: 'babel',
                    printWidth: 80,
                    tabWidth: 2,
                    useTabs: false,
                    semi: true,
                    singleQuote: true,
                    trailingComma: 'es5'
                });
            } else if (this.currentLanguage === 'html') {
                formatted = prettier.format(code, {
                    parser: 'html',
                    printWidth: 80,
                    tabWidth: 2,
                    useTabs: false
                });
            } else if (this.currentLanguage === 'css') {
                formatted = prettier.format(code, {
                    parser: 'css',
                    printWidth: 80,
                    tabWidth: 2
                });
            }

            this.editor.setValue(formatted);
            this.showNotification('Code formatted successfully!', 'success');
        } catch (error) {
            this.showNotification(`Format error: ${error.message}`, 'error');
        } finally {
            btn.classList.remove('formatting');
        }
    }

    // Copy code to clipboard
    copyCode() {
        const code = this.editor.getValue();
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Code copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy code', 'error');
        });
    }

    // Add console log
    addConsoleLog(type, message) {
        const consoleLogs = document.getElementById('console-logs');
        const logEntry = document.createElement('div');
        logEntry.className = `console-log ${type}`;

        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `
            <span class="console-timestamp">[${timestamp}]</span>
            <span>${this.escapeHtml(message)}</span>
        `;

        consoleLogs.appendChild(logEntry);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }

    // Clear console
    clearConsole() {
        const consoleLogs = document.getElementById('console-logs');
        consoleLogs.innerHTML = '';
        this.consoleLogs = [];
    }

    // Format value for console display
    formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch {
                return String(value);
            }
        }
        return String(value);
    }

    // Escape HTML for console safety
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Show share modal
    showShareModal() {
        const code = this.editor.getValue();
        const encoded = btoa(code);
        const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
        
        document.getElementById('share-link').value = url;
        document.getElementById('share-modal').classList.add('active');
    }

    // Copy share link
    copyShareLink() {
        const shareLink = document.getElementById('share-link');
        shareLink.select();
        document.execCommand('copy');
        this.showNotification('Link copied to clipboard!', 'success');
    }

    // Download code
    downloadCode() {
        const code = this.editor.getValue();
        const ext = this.getFileExtension();
        const filename = `code_${Date.now()}.${ext}`;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Code downloaded!', 'success');
    }

    // Get file extension based on language
    getFileExtension() {
        const extensions = {
            'javascript': 'js',
            'python': 'py',
            'html': 'html',
            'java': 'java',
            'cpp': 'cpp',
            'typescript': 'ts',
            'css': 'css',
            'sql': 'sql'
        };
        return extensions[this.currentLanguage] || 'txt';
    }

    // Add new tab
    addNewTab() {
        const tabId = `editor-${Date.now()}`;
        this.tabs.set(tabId, {
            id: tabId,
            name: `Untitled ${this.tabs.size}`,
            language: 'javascript',
            code: '// New file\n'
        });

        this.addTabElement(tabId);
        this.switchTab(tabId);
    }

    // Add tab element to UI
    addTabElement(tabId) {
        const tab = this.tabs.get(tabId);
        const tabsList = document.getElementById('tabs-list');
        
        const tabEl = document.createElement('div');
        tabEl.className = 'tab';
        tabEl.dataset.tab = tabId;
        tabEl.innerHTML = `
            <span>${tab.name}</span>
            <button class="tab-close" data-tab-close="${tabId}">×</button>
        `;

        tabEl.addEventListener('click', () => this.switchTab(tabId));
        tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tabId);
        });

        tabsList.appendChild(tabEl);
    }

    // Switch to tab
    switchTab(tabId) {
        if (!this.tabs.has(tabId)) return;

        // Update active tab UI
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('tab-active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('tab-active');

        // Update editor
        this.activeTabId = tabId;
        const tab = this.tabs.get(tabId);
        if (this.editor) {
            this.editor.setValue(tab.code);
            const model = this.editor.getModel();
            monaco.editor.setModelLanguage(model, tab.language);
        }
    }

    // Close tab
    closeTab(tabId) {
        if (this.tabs.size === 1) {
            this.showNotification('Cannot close the last tab', 'warn');
            return;
        }

        this.tabs.delete(tabId);
        document.querySelector(`[data-tab="${tabId}"]`).remove();

        if (this.activeTabId === tabId) {
            const firstTab = this.tabs.keys().next().value;
            this.switchTab(firstTab);
        }
    }

    // Update tab code
    updateTabCode() {
        if (this.editor && this.tabs.has(this.activeTabId)) {
            const tab = this.tabs.get(this.activeTabId);
            tab.code = this.editor.getValue();
        }
    }

    // Switch output tab
    switchOutputTab(outputType) {
        document.querySelectorAll('.output-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-output="${outputType}"]`).classList.add('active');

        document.querySelectorAll('.output-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${outputType}-output`).classList.add('active');
    }

    // Load template
    loadTemplate(templateName) {
        const templates = {
            'hello-world': {
                code: `console.log("Hello, World!");`,
                language: 'javascript'
            },
            'console-log': {
                code: `// Display different types of data
console.log("String:", "Hello");
console.log("Number:", 42);
console.log("Array:", [1, 2, 3, 4, 5]);
console.log("Object:", { name: "John", age: 30 });
console.log("Boolean:", true);`,
                language: 'javascript'
            },
            'todo-app': {
                code: `const todos = [];

function addTodo(task) {
  todos.push({ id: todos.length + 1, task, done: false });
  console.log('Todo added:', task);
}

function completeTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.done = true;
}

function listTodos() {
  console.log('Todos:', todos);
}

addTodo('Learn JavaScript');
addTodo('Build Projects');
completeTodo(1);
listTodos();`,
                language: 'javascript'
            },
            'calculator': {
                code: `function calculate(a, b, operation) {
  switch(operation) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    default: return 'Unknown operation';
  }
}

console.log('10 + 5 =', calculate(10, 5, '+'));
console.log('10 - 5 =', calculate(10, 5, '-'));
console.log('10 * 5 =', calculate(10, 5, '*'));
console.log('10 / 5 =', calculate(10, 5, '/'));`,
                language: 'javascript'
            },
            'timer': {
                code: `function countdown(seconds) {
  let remaining = seconds;
  console.log(\`Starting countdown: \${seconds} seconds\`);
  
  const interval = setInterval(() => {
    console.log(\`Time remaining: \${remaining}s\`);
    remaining--;
    
    if (remaining < 0) {
      clearInterval(interval);
      console.log('Time is up!');
    }
  }, 1000);
}

countdown(5);`,
                language: 'javascript'
            },
            'weather-ui': {
                code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  .card { background: white; padding: 20px; border-radius: 10px; max-width: 300px; margin: 50px auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
  .temp { font-size: 48px; font-weight: bold; color: #333; }
  .city { font-size: 24px; color: #666; margin: 10px 0; }
  .desc { color: #999; margin: 10px 0; }
</style>
</head>
<body>
<div class="card">
  <div class="city">San Francisco</div>
  <div class="temp">72°F</div>
  <div class="desc">Partly Cloudy</div>
  <p>Humidity: 65% | Wind: 12 mph</p>
</div>
</body>
</html>`,
                language: 'html'
            },
            'form-validation': {
                code: `function validateEmail(email) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function validateForm(email, password) {
  const emailValid = validateEmail(email);
  const passwordValid = validatePassword(password);
  
  console.log('Email:', email, '- Valid:', emailValid);
  console.log('Password length:', password.length, '- Valid:', passwordValid);
  
  return emailValid && passwordValid;
}

console.log('Form Valid:', validateForm('user@example.com', 'password123'));
console.log('Form Valid:', validateForm('invalid.email', 'short'));`,
                language: 'javascript'
            }
        };

        const template = templates[templateName];
        if (template && this.editor) {
            this.editor.setValue(template.code);
            document.getElementById('language-select').value = template.language;
            this.currentLanguage = template.language;
            this.switchLanguage();
            this.showNotification('Template loaded!', 'success');
        }
    }

    // Save to history
    saveToHistory() {
        const code = this.editor.getValue();
        const snippet = {
            id: Date.now(),
            code: code.substring(0, 50) + '...',
            timestamp: new Date().toLocaleTimeString(),
            language: this.currentLanguage,
            fullCode: code
        };

        this.history.unshift(snippet);
        if (this.history.length > 10) {
            this.history.pop();
        }

        localStorage.setItem('codePlaygroundHistory', JSON.stringify(this.history));
        this.renderHistory();
    }

    // Load history
    loadHistory() {
        const saved = localStorage.getItem('codePlaygroundHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.renderHistory();
        }
    }

    // Render history
    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No history yet</p>';
            return;
        }

        this.history.forEach(item => {
            const item_el = document.createElement('button');
            item_el.className = 'history-item';
            item_el.title = item.code;
            item_el.textContent = item.code;
            item_el.addEventListener('click', () => {
                this.editor.setValue(item.fullCode);
                this.currentLanguage = item.language;
                document.getElementById('language-select').value = item.language;
                this.switchLanguage();
            });
            historyList.appendChild(item_el);
        });
    }

    // Clear history
    clearHistory() {
        if (confirm('Clear all history?')) {
            this.history = [];
            localStorage.removeItem('codePlaygroundHistory');
            this.renderHistory();
            this.showNotification('History cleared!', 'success');
        }
    }

    // Load from URL
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const encodedCode = params.get('code');
        
        if (encodedCode) {
            try {
                const code = atob(encodedCode);
                if (this.editor) {
                    this.editor.setValue(code);
                }
            } catch (error) {
                console.error('Failed to decode code from URL');
            }
        }
    }

    // Handle splitter drag
    handleSplitterDrag(e) {
        e.preventDefault();
        const splitter = document.getElementById('splitter');
        const container = document.querySelector('.splitter-container');
        
        splitter.classList.add('active');
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startEditorWidth = document.querySelector('.editor-section').offsetWidth;
        const startEditorHeight = document.querySelector('.editor-section').offsetHeight;

        const onMouseMove = (moveEvent) => {
            if (container.offsetWidth > container.offsetHeight) {
                // Horizontal split
                const diff = moveEvent.clientX - startX;
                const newEditorWidth = startEditorWidth + diff;
                const containerWidth = container.offsetWidth;
                
                if (newEditorWidth > 200 && newEditorWidth < containerWidth - 200) {
                    document.querySelector('.editor-section').style.flex = `0 0 ${newEditorWidth}px`;
                    document.querySelector('.output-section').style.flex = '1';
                }
            } else {
                // Vertical split
                const diff = moveEvent.clientY - startY;
                const newEditorHeight = startEditorHeight + diff;
                const containerHeight = container.offsetHeight;
                
                if (newEditorHeight > 200 && newEditorHeight < containerHeight - 200) {
                    document.querySelector('.editor-section').style.flex = `0 0 ${newEditorHeight}px`;
                    document.querySelector('.output-section').style.flex = '1';
                }
            }
        };

        const onMouseUp = () => {
            splitter.classList.remove('active');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize playground when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CodePlayground();
});
