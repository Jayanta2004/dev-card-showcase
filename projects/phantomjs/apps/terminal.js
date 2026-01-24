class TerminalApp {
    constructor(container, winId) {
        this.container = container;
        this.winId = winId;
        this.container.innerHTML = `
            <div class="app-terminal" id="term-${winId}">
                <div class="output"></div>
                <div class="input-line">
                    <span class="prompt">root@system:~#</span>
                    <input type="text" class="app-terminal-input" autocomplete="off" spellcheck="false">
                </div>
            </div>
        `;

        this.outputNode = this.container.querySelector('.output');
        this.inputNode = this.container.querySelector('input');
        this.history = [];
        this.historyIndex = -1;
        this.pwd = '/home/user';

        this.setupEventListeners();
        this.print("System Shell v2.0 - Authorized Use Only", "system");
        this.inputNode.focus();
    }

    setupEventListeners() {
        this.container.addEventListener('click', () => this.inputNode.focus());

        this.inputNode.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const cmd = this.inputNode.value.trim();
                if (cmd) {
                    this.print(`root@system:~# ${cmd}`, "dim");
                    await this.execute(cmd);
                    this.history.push(cmd);
                    this.historyIndex = this.history.length;
                    this.inputNode.value = '';
                    this.scrollToBottom();
                }
            } else if (e.key === 'ArrowUp') {
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputNode.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.inputNode.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.inputNode.value = '';
                }
            }
        });
    }

    print(text, type = "") {
        const div = document.createElement('div');
        div.className = type;
        div.textContent = text;
        this.outputNode.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const term = this.container.querySelector('.app-terminal');
        term.scrollTop = term.scrollHeight;
    }

    async execute(input) {
        const [cmdName, ...args] = input.split(' ');

        // Simple built-in commands for now, expandable later
        switch (cmdName.toLowerCase()) {
            case 'help':
                this.print("Available: help, clear, ls, cat, scan, exit");
                break;
            case 'clear':
                this.outputNode.innerHTML = "";
                break;
            case 'exit':
                window.WM.closeWindow(window.WM.windows.find(w => w.id === this.winId));
                break;
            case 'ls':
                this.print("Documents  Downloads  Secrets.txt");
                break;
            case 'scan':
                this.print("Network Scan Initiated...");
                await new Promise(r => setTimeout(r, 1000));
                this.print("found: 192.168.1.55 [OPEN]");
                break;
            default:
                this.print(`Command not found: ${cmdName}`, "error");
        }
    }
}

window.TerminalApp = TerminalApp;
