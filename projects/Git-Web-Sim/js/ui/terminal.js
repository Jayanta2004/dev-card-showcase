/**
 * TERMINAL CONTROLLER
 * ===================
 * Manages the CLI experience. Parses user input, routes commands to the
 * Git Engine, and renders colored output to the DOM.
 */

class TerminalController {
    constructor(repo, uiCallback) {
        this.repo = repo;
        this.uiCallback = uiCallback; // Function to refresh UI (Graph, Tree) after commands
        
        // DOM Elements
        this.outputNode = document.getElementById('terminal-output');
        this.inputNode = document.getElementById('term-input');
        
        // State
        this.history = [];
        this.historyIndex = -1;
        
        // Bind Events
        this.inputNode.addEventListener('keydown', (e) => this._handleKey(e));
        
        // Expose helper for other UI components to log to term
        window.logToTerminal = (msg, type) => this.print(msg, type);
    }

    /**
     * Print a line to the terminal output.
     * @param {string} text - The message.
     * @param {string} type - 'system' | 'success' | 'error' | 'info'
     */
    print(text, type = 'system') {
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        line.textContent = text;
        
        this.outputNode.appendChild(line);
        this.outputNode.scrollTop = this.outputNode.scrollHeight;
    }

    clear() {
        this.outputNode.innerHTML = '';
        this.print("Terminal cleared.", "system");
    }

    /**
     * Handle Enter key to execute command.
     */
    _handleKey(e) {
        if (e.key === 'Enter') {
            const rawInput = this.inputNode.value.trim();
            if (!rawInput) return;

            // 1. Echo Command
            this.print(`user@web-sim:~$ ${rawInput}`, 'system');
            
            // 2. Process
            this._execute(rawInput);
            
            // 3. Reset
            this.history.push(rawInput);
            this.inputNode.value = '';
        }
    }

    /**
     * Parse and Execute the command string.
     */
    _execute(rawInput) {
        // Tokenize: Handle quotes for commit messages
        // Regex splits by spaces but keeps quotes grouped
        const args = rawInput.match(/(?:[^\s"]+|"[^"]*")+/g).map(t => t.replace(/"/g, ''));
        
        const cmd = args[0];

        if (cmd === 'clear') {
            this.clear();
            return;
        }

        if (cmd !== 'git') {
            this.print(`bash: ${cmd}: command not found. Try 'git --help'`, 'error');
            return;
        }

        const subCmd = args[1]; // e.g., 'commit'
        
        try {
            let result = "";

            switch (subCmd) {
                case 'init':
                    result = this.repo.init();
                    this.print(result, 'success');
                    break;

                case 'status':
                    const status = this.repo.status();
                    if (status.modified.length === 0 && status.untracked.length === 0) {
                        this.print("On branch " + this.repo.currentBranchName(), 'info');
                        this.print("nothing to commit, working tree clean", 'info');
                    } else {
                        this.print("Changes not staged for commit:", 'error');
                        status.modified.forEach(f => this.print(`  modified: ${f}`, 'error'));
                        this.print("Untracked files:", 'error');
                        status.untracked.forEach(f => this.print(`  ${f}`, 'error'));
                    }
                    break;

                case 'add':
                    if (!args[2]) throw new Error("usage: git add <file>");
                    if (args[2] === '.') {
                        // Add all
                        // Simplified: In this sim we iterate working dir
                        for (let [path, _] of this.repo.workingDir) {
                            this.repo.add(path);
                        }
                        result = "Added all files to staging.";
                    } else {
                        result = this.repo.add(args[2]);
                    }
                    this.print(result, 'success');
                    break;

                case 'commit':
                    const msgIdx = args.indexOf('-m');
                    if (msgIdx === -1 || !args[msgIdx + 1]) {
                        throw new Error("usage: git commit -m <message>");
                    }
                    const msg = args[msgIdx + 1];
                    result = this.repo.commit(msg);
                    this.print(result, 'success');
                    break;

                case 'log':
                    // Simple linear log
                    let oid = this.repo.resolveRef('HEAD');
                    let count = 0;
                    if (!oid) this.print("No commits yet.", 'info');
                    
                    while (oid && count < 10) {
                        const commit = this.repo.objects.get(oid);
                        this.print(`commit ${oid}`, 'info');
                        this.print(`Author: ${commit.author}`, 'system');
                        this.print(`    ${commit.message}\n`, 'system');
                        
                        if (commit.parents.length > 0) oid = commit.parents[0];
                        else oid = null;
                        count++;
                    }
                    break;

                case 'branch':
                    if (args[2]) {
                        result = this.repo.branch(args[2]);
                        this.print(result, 'success');
                    } else {
                        // List branches
                        this.repo.refs.forEach((oid, ref) => {
                            if (ref.startsWith('refs/heads/')) {
                                const name = ref.replace('refs/heads/', '');
                                const isHead = this.repo.HEAD === `ref: ${ref}`;
                                this.print(`${isHead ? '* ' : '  '}${name}`, isHead ? 'success' : 'system');
                            }
                        });
                    }
                    break;

                case 'checkout':
                    if (!args[2]) throw new Error("usage: git checkout <branch>");
                    result = this.repo.checkout(args[2]);
                    this.print(result, 'success');
                    break;

                case 'help':
                case '--help':
                    this.print("Available commands:", 'info');
                    this.print("  init, status, add <file>, commit -m <msg>", 'system');
                    this.print("  log, branch <name>, checkout <branch>", 'system');
                    break;

                default:
                    this.print(`git: '${subCmd}' is not a git command.`, 'error');
            }

            // TRIGGER UI UPDATE
            if (this.uiCallback) this.uiCallback();

        } catch (err) {
            this.print(`fatal: ${err.message}`, 'error');
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.TerminalController = TerminalController;
}