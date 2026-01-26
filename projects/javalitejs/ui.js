/**
 * JavaLiteJS - UI Controller
 */

const UI = {
    elements: {
        input: document.getElementById('code-input'),
        display: document.getElementById('code-display'),
        lineNumbers: document.getElementById('line-numbers'),
        consoleOutput: document.getElementById('output-console'),
        problemOutput: document.getElementById('output-problems'),
        memoryBody: document.getElementById('memory-body'),
        astRoot: document.getElementById('ast-root'),
        compileStatus: document.getElementById('compile-status'),
        problemBadge: document.getElementById('problem-count'),
        codeContent: document.getElementById('code-content'),
        stepBtn: document.getElementById('btn-step')
    },

    init() {
        // Sync scroll
        this.elements.input.addEventListener('scroll', () => {
            this.elements.display.scrollTop = this.elements.input.scrollTop;
            this.elements.lineNumbers.scrollTop = this.elements.input.scrollTop;
        });

        // Input handler for highlighting
        this.elements.input.addEventListener('input', () => this.updateEditor());

        // Tab key support
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                document.execCommand('insertText', false, '    ');
            }
        });

        this.updateEditor();
    },

    updateEditor() {
        const text = this.elements.input.value;
        this.renderHighlighting(text);
        this.updateLineNumbers(text);

        // Clear previous execution lines
        const oldLine = document.querySelector('.exec-line');
        if (oldLine) oldLine.remove();

        // Reset status to ready if edited
        this.setStatus('Ready');
    },

    renderHighlighting(text) {
        // Basic syntax highlighter regex
        let html = text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"(.*?)"/g, '<span class="tok-str">"$1"</span>')
            .replace(/\b(int|boolean|String|if|else|while|for|true|false)\b/g, '<span class="tok-kw">$1</span>')
            .replace(/\b(System|out|println)\b/g, '<span class="tok-type">$1</span>')
            .replace(/\/\/.*$/gm, '<span class="tok-comment">$&</span>')
            .replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');

        // We can add error squiggles here if we had position info from compiled run

        this.elements.codeContent.innerHTML = html + '<br>';
    },

    updateLineNumbers(text) {
        const lines = text.split('\n').length;
        this.elements.lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    },

    setStatus(msg, type = '') {
        this.elements.compileStatus.textContent = msg;
        this.elements.compileStatus.className = 'status-indicator ' + type;
    },

    // --- Output & Console ---

    log(msg, type = 'log') {
        const div = document.createElement('div');
        div.className = `console-line ${type}`;
        div.textContent = msg;
        this.elements.consoleOutput.appendChild(div);
        this.elements.consoleOutput.scrollTop = this.elements.consoleOutput.scrollHeight;

        // Switch to Output tab
        document.querySelector('[data-target="console"]').click();
    },

    clearConsole() {
        this.elements.consoleOutput.innerHTML = '<div class="console-line system">Console Cleared.</div>';
        this.elements.problemOutput.innerHTML = '<div class="empty-state">No problems detected.</div>';
        this.elements.problemBadge.classList.add('hidden');
    },

    showProblems(errors) {
        this.elements.problemOutput.innerHTML = '';
        if (errors.length === 0) {
            this.elements.problemOutput.innerHTML = '<div class="empty-state">No problems detected.</div>';
            this.elements.problemBadge.classList.add('hidden');
            return;
        }

        this.elements.problemBadge.textContent = errors.length;
        this.elements.problemBadge.classList.remove('hidden');

        errors.forEach(err => {
            const div = document.createElement('div');
            div.className = 'console-line error';
            div.textContent = `[${err.type}] Line ${err.line}: ${err.message}`;
            this.elements.problemOutput.appendChild(div);

            // Highlight in editor
            this.markErrorLine(err.line);
        });

        // Switch to Problems tab
        document.querySelector('[data-target="problems"]').click();
    },

    markErrorLine(line) {
        // This is tricky with plain textarea overlay. 
        // We could add a class to the line number or try to inject span?
        // Simpler: Just rely on console output for now.
    },

    // --- Visualization ---

    highlightExecutionLine(line) {
        // Remove old
        const old = document.querySelector('.exec-line');
        if (old) old.remove();

        if (line > 0) {
            const lineHeight = 22.4; // 14px * 1.6 roughly. Better to calculate?
            // Since we can't easily get pixel offset of standard PRE text, 
            // we will try to insert a div into the code-wrapper at top percent?
            // Actually, inserting into code-content is better?
            // Re-render whole highlight with one line wrapped?

            // Alternative: Simply use the background of the line numbers or separate overlay
            const overlay = document.createElement('div');
            overlay.className = 'exec-line';
            overlay.style.top = `${(line - 1) * 22.4 + 16}px`; // 1rem padding top = 16px
            overlay.style.height = '22.4px';
            this.elements.display.parentElement.appendChild(overlay);
        }
    },

    renderMemory(snapshot) {
        this.elements.memoryBody.innerHTML = '';
        if (snapshot.length === 0) {
            this.elements.memoryBody.innerHTML = '<tr><td colspan="4" class="empty-row">Empty Memory</td></tr>';
            return;
        }

        snapshot.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${v.name}</td><td>${v.value}</td><td>${v.type}</td><td>Scope ${v.scopeIndex}</td>`;
            tr.classList.add('mem-changed'); // Animation
            this.elements.memoryBody.appendChild(tr);
        });
    },

    renderAST(ast) {
        this.elements.astRoot.innerHTML = '';
        if (!ast) return;
        this.elements.astRoot.appendChild(this.createASTNode(ast));
    },

    createASTNode(node) {
        const div = document.createElement('div');
        div.className = 'ast-node';

        const title = document.createElement('div');
        title.innerHTML = `<span class="ast-type">${node.type}</span>`;
        if (node.value !== undefined) title.innerHTML += ` <span class="ast-val">${node.value}</span>`;
        if (node.name) title.innerHTML += ` <span class="ast-val">${node.name}</span>`;
        if (node.operator) title.innerHTML += ` (${node.operator})`;

        div.appendChild(title);

        // Children
        const children = [];
        if (node.body) children.push(...(Array.isArray(node.body) ? node.body : [node.body]));
        if (node.thenBranch) children.push(node.thenBranch);
        if (node.elseBranch) children.push(node.elseBranch);
        if (node.left) children.push(node.left);
        if (node.right) children.push(node.right);
        if (node.expression) children.push(node.expression);
        if (node.initializer) children.push(node.initializer);
        if (node.condition) children.push(node.condition);
        if (node.update) children.push(node.update);
        if (node.init) children.push(node.init);

        children.forEach(child => {
            if (child) div.appendChild(this.createASTNode(child));
        });

        return div;
    }
};
