const fileSystem = {
    'home': ['user', 'documents', 'downloads'],
    'etc': ['passwd', 'hosts', 'shadow'],
    'bin': ['bash', 'ls', 'scan', 'trace']
};

const fakeIps = [
    '192.168.0.1', '10.0.0.5', '172.16.254.1', '45.33.22.11', '8.8.8.8'
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const commands = {
    help: async (term) => {
        term.print("AVAILABLE COMMANDS:", "system");
        term.print("  help      - Show this help menu");
        term.print("  clear     - Clear terminal screen");
        term.print("  scan      - Scan for network targets");
        term.print("  connect   - Connect to a target IP");
        term.print("  decrypt   - Decrypt protected file");
        term.print("  trace     - Initiate backtrace sequence");
        term.print("  exit      - Close session");
    },

    clear: async (term) => {
        term.clear();
    },

    scan: async (term) => {
        term.print("Initializing network scan...", "warning");
        await sleep(800);
        term.print("[+] Interface wlan0 switched to monitor mode");
        await sleep(600);

        for (let i = 0; i < 5; i++) {
            await sleep(400);
            const ip = fakeIps[Math.floor(Math.random() * fakeIps.length)];
            const port = Math.floor(Math.random() * 65535);
            term.print(`[+] Target found: ${ip}:${port} (OPEN)`, "success");
        }
        term.print("Scan complete.", "system");
    },

    connect: async (term, args) => {
        if (!args[0]) {
            term.print("Usage: connect <ip_address>", "error");
            return;
        }
        term.print(`Synthesizing handshaking with ${args[0]}...`, "warning");
        await sleep(1000);

        const keySteps = ["Key exchange...", "Verifying payload...", "Bypassing firewall rules...", "Elevating privileges..."];

        for (const step of keySteps) {
            term.print(`> ${step}`);
            await sleep(800);
        }

        if (Math.random() > 0.3) {
            term.print("ACCESS GRANTED", "success glitch");
        } else {
            term.print("CONNECTION REFUSED BY PEER", "error");
        }
    },

    decrypt: async (term) => {
        term.print("Initiating brute-force decryption...", "system");
        const id = term.printProgress("Decrypting: [                    ] 0%");

        for (let i = 0; i <= 100; i += 5) {
            await sleep(150);
            const bars = "=".repeat(i / 5) + " ".repeat(20 - (i / 5));
            term.updateLine(id, `Decrypting: [${bars}] ${i}%`);
        }
        term.print("Decryption successful. Payload extracted.", "success");
    },

    trace: async (term) => {
        term.print("WARNING: UNORGANIZED TRACE DETECTED", "error glitch");
        await sleep(1000);

        for (let i = 10; i > 0; i--) {
            term.print(`SYSTEM LOCKDOWN IN ${i}...`, "error");
            await sleep(800);
        }
        term.print("TRACE FAILED. IDENTITY OBFUSCATED.", "success");
    },

    exit: async (term) => {
        term.print("Terminating session...", "system");
        await sleep(1000);
        document.body.classList.add('turn-off');
        setTimeout(() => {
            document.body.innerHTML = ""; // Clear DOM after animation
            document.body.style.background = "#000";
        }, 600);
    }
};
