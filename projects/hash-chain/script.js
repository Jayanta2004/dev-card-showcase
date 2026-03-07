
class SHA256 {
    static hash(ascii) {
        const K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];

        let H = [ 0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ];

        const rotr = (n, x) => (x >>> n) | (x << (32 - n));
        const ch = (x, y, z) => (x & y) ^ (~x & z);
        const maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);
        const sig0 = (x) => rotr(2, x) ^ rotr(13, x) ^ rotr(22, x);
        const sig1 = (x) => rotr(6, x) ^ rotr(11, x) ^ rotr(25, x);
        const gamma0 = (x) => rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
        const gamma1 = (x) => rotr(17, x) ^ rotr(19, x) ^ (x >>> 10);

        let msg = [];
        for (let i = 0; i < ascii.length; i++) msg.push(ascii.charCodeAt(i));
        
        let msgLen = msg.length * 8;
        msg.push(0x80); 
        while ((msg.length * 8) % 512 !== 448) msg.push(0); 
        
        
        msg.push(0, 0, 0, 0); 
        msg.push((msgLen >>> 24) & 0xff, (msgLen >>> 16) & 0xff, (msgLen >>> 8) & 0xff, msgLen & 0xff);

        for (let i = 0; i < msg.length; i += 64) {
            let W = [];
            for (let j = 0; j < 16; j++) {
                W[j] = (msg[i + j*4] << 24) | (msg[i + j*4 + 1] << 16) | (msg[i + j*4 + 2] << 8) | (msg[i + j*4 + 3]);
            }
            for (let j = 16; j < 64; j++) {
                W[j] = (gamma1(W[j - 2]) + W[j - 7] + gamma0(W[j - 15]) + W[j - 16]) >>> 0;
            }

            let [a, b, c, d, e, f, g, h] = H;

            // Compression loop
            for (let j = 0; j < 64; j++) {
                let T1 = (h + sig1(e) + ch(e, f, g) + K[j] + W[j]) >>> 0;
                let T2 = (sig0(a) + maj(a, b, c)) >>> 0;
                h = g; g = f; f = e; e = (d + T1) >>> 0; d = c; c = b; b = a; a = (T1 + T2) >>> 0;
            }

            H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
            H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
        }

        // Convert integer array to hex string
        return H.map(x => ('00000000' + x.toString(16)).slice(-8)).join('');
    }
}


class Transaction {
    constructor(sender, receiver, amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.timestamp = Date.now();
    }
    toString() {
        return `${this.sender} -> ${this.receiver} : $${this.amount}`;
    }
}

class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        // We hash all the block's data together
        const dataStr = this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce;
        return SHA256.hash(dataStr);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3; 
        this.pendingTransactions = [];
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), [], "0000000000000000000000000000000000000000000000000000000000000000");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        if (!transaction.sender || !transaction.receiver || !transaction.amount) {
            throw new Error('Transaction must include sender, receiver, and amount');
        }
        this.pendingTransactions.push(transaction);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Has the data been tampered with?
            if (currentBlock.hash !== currentBlock.calculateHash()) return false;
            // Is the link broken?
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }
}


class AppController {
    constructor() {
        this.coin = new Blockchain();
        this.isMining = false;
        this.updateUI();
    }

    toggleGuide() {
        document.getElementById('guide-modal').classList.toggle('hidden');
    }

    addTransaction() {
        if(this.isMining) return alert("Cannot add transactions while mining is in progress.");

        const sender = document.getElementById('tx-sender').value;
        const receiver = document.getElementById('tx-receiver').value;
        const amount = document.getElementById('tx-amount').value;

        if (!sender || !receiver || !amount) return alert('Please fill in all fields.');

        const tx = new Transaction(sender, receiver, parseFloat(amount));
        this.coin.addTransaction(tx);
        
        // Clear inputs
        document.getElementById('tx-sender').value = '';
        document.getElementById('tx-receiver').value = '';
        document.getElementById('tx-amount').value = '';

        this.updateUI();
    }

    async minePendingTransactions() {
        if (this.isMining) return;
        if (this.coin.pendingTransactions.length === 0) return alert("No transactions to mine!");

        this.isMining = true;
        document.getElementById('mine-btn').disabled = true;
        document.getElementById('mining-visualizer').classList.remove('hidden');
        
        const newBlock = new Block(
            this.coin.chain.length, 
            Date.now(), 
            this.coin.pendingTransactions, 
            this.coin.getLatestBlock().hash
        );

        // Visual Mining Loop
        const target = Array(this.coin.difficulty + 1).join("0");
        const nonceEl = document.getElementById('live-nonce');
        const hashEl = document.getElementById('live-hash');
        hashEl.className = 'hash-text testing';

        const mineChunk = () => {
            return new Promise(resolve => {
                let chunkLimit = 500; // Check 500 hashes per visual frame
                while (chunkLimit > 0) {
                    newBlock.hash = newBlock.calculateHash();
                    if (newBlock.hash.substring(0, this.coin.difficulty) === target) {
                        return resolve(true); // Mined!
                    }
                    newBlock.nonce++;
                    chunkLimit--;
                }
                
                // Update UI with latest attempt
                nonceEl.innerText = newBlock.nonce;
                hashEl.innerText = newBlock.hash;
                
                requestAnimationFrame(() => resolve(false));
            });
        };

        let found = false;
        while (!found) {
            found = await mineChunk();
        }

        // Mining Complete!
        hashEl.innerText = newBlock.hash;
        hashEl.className = 'hash-text found';
        
        setTimeout(() => {
            this.coin.chain.push(newBlock);
            this.coin.pendingTransactions = []; // Clear pool
            this.isMining = false;
            
            document.getElementById('mine-btn').disabled = false;
            document.getElementById('mining-visualizer').classList.add('hidden');
            this.updateUI();
        }, 1500); 
    }

    updateUI() {
        // 1. Update Transaction Pool
        const poolEl = document.getElementById('tx-pool');
        poolEl.innerHTML = '';
        if (this.coin.pendingTransactions.length === 0) {
            poolEl.innerHTML = '<p class="empty-msg">No pending transactions.</p>';
        } else {
            this.coin.pendingTransactions.forEach(tx => {
                const div = document.createElement('div');
                div.className = 'tx-item';
                div.innerText = tx.toString();
                poolEl.appendChild(div);
            });
        }

        // 2. Update Chain Validity
        const isValid = this.coin.isChainValid();
        const validityEl = document.getElementById('validity-display');
        validityEl.innerText = isValid ? "Status: Chain Valid" : "Status: CHAIN BROKEN";
        validityEl.className = isValid ? "valid" : "invalid";

        // 3. Render Blockchain
        const chainEl = document.getElementById('blockchain-display');
        chainEl.innerHTML = '';
        
        this.coin.chain.forEach(block => {
            let txHtml = block.transactions.length === 0 
                ? '<em>Genesis Block (No TX)</em>' 
                : block.transactions.map(t => `<div>${t.sender} ➡️ ${t.receiver}: $${t.amount}</div>`).join('');

            const blockHtml = `
                <div class="block">
                    <div class="block-header">
                        <span>Block #${block.index}</span>
                        <span>Nonce: ${block.nonce}</span>
                    </div>
                    <div class="block-body">
                        <div class="data-row">
                            <span class="data-label">Timestamp</span>
                            <span class="data-value">${new Date(block.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Hash</span>
                            <div class="data-value" style="color: var(--success);">${block.hash}</div>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Previous Hash</span>
                            <div class="data-value" style="color: var(--danger);">${block.previousHash}</div>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Data</span>
                            <div class="block-txs">${txHtml}</div>
                        </div>
                    </div>
                </div>
            `;
            chainEl.innerHTML += blockHtml;
        });
    }
}

const app = new AppController();