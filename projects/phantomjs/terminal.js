class Terminal {
    constructor() {
        this.outputNode = document.getElementById('output');
        this.inputNode = document.getElementById('command-input');
        this.history = [];
        this.historyIndex = -1;

        // Load history from local storage
        const savedHistory = localStorage.getItem('term_history');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
        }

        this.inputNode.style.display = 'none'; // Hide input during boot
        document.querySelector('.input-line .prompt').style.display = 'none';

        this.runBootSequence();
    }

    async runBootSequence() {
        const bootText = [
            "BIOS DATE 01/24/26 10:01:44 VER 1.0.2",
            "CPU: QUANTUM CORE i9-9900K @ 8.5GHz",
            "640K RAM SYSTEM 589824 BYTES FREE",
            "Checking NVRAM... OK",
            "Initializing Video Adapter... OK",
            "Loading Kernel... .................... 100%",
            "Mounting FileSystem... [RW]",
            "Starting Services: [SSHD] [HTTP] [TOR]",
            " Establishing Secure Connection...",
            "LOGIN: ROOT ACCESS"
        ];

        for (const line of bootText) {
            this.print(line, "dim");
            this.playKeySound(); // Subtle click for each line
            await new Promise(r => setTimeout(r, 150 + Math.random() * 300));
        }

        await new Promise(r => setTimeout(r, 800));
        this.clear();

        this.inputNode.style.display = 'inline-block';
        document.querySelector('.input-line .prompt').style.display = 'inline';
        this.inputNode.focus();

        this.print("INITIALIZING SYSTEM v9.4...", "system");
        setTimeout(() => this.print("WELCOME, USER. TYPE 'help' FOR COMMANDS.", "success"), 1000);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Focus input on click anywhere
        document.addEventListener('click', () => {
            this.inputNode.focus();
        });

        this.inputNode.addEventListener('keydown', async (e) => {
            this.playKeySound();
            if (e.key === 'Enter') {
                const cmd = this.inputNode.value.trim();
                if (cmd) {
                    this.execute(cmd);
                    this.history.push(cmd);
                    localStorage.setItem('term_history', JSON.stringify(this.history));
                    this.historyIndex = this.history.length;
                    this.inputNode.value = '';
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputNode.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
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

    async execute(input) {
        this.print(`root@system:~# ${input}`, "dim");
        const [cmdName, ...args] = input.split(' ');

        const cmd = commands[cmdName.toLowerCase()];

        if (cmd) {
            this.inputNode.disabled = true; // Lock input during execution
            try {
                await cmd(this, args);
            } catch (err) {
                this.print(`RUNTIME ERROR: ${err.message}`, "error");
                this.playAlertSound();
            }
            this.inputNode.disabled = false;
            this.inputNode.focus();
            this.scrollToBottom();
        } else {
            this.print(`Command not found: ${cmdName}`, "error");
        }
    }

    print(text, className = "") {
        const div = document.createElement('div');
        div.className = className;
        div.dataset.text = text; // Keep raw text
        this.outputNode.appendChild(div);

        // Typewriter effect
        let i = 0;
        div.textContent = "";
        const interval = setInterval(() => {
            div.textContent += text.charAt(i);
            i++;
            this.scrollToBottom();
            if (i >= text.length) clearInterval(interval);
        }, 10);

        this.scrollToBottom();
        return div; // Return element for updates
    }

    printProgress(text) {
        // Instant print for progress bars that update frequently
        const div = document.createElement('div');
        div.textContent = text;
        this.outputNode.appendChild(div);
        this.scrollToBottom();
        return div;
    }

    updateLine(element, newText) {
        if (element) {
            element.textContent = newText;
        }
    }

    clear() {
        this.outputNode.innerHTML = "";
    }

    scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
        const container = document.querySelector('.terminal-container');
        container.scrollTop = container.scrollHeight;
    }

    playKeySound() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.05);
    }

    playAlertSound() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.terminal = new Terminal();

    // Add interaction listener for Chrome autoplay policy
    document.addEventListener('click', function initAudio() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume();
        document.removeEventListener('click', initAudio);
    }, { once: true });
});
