/**
 * JS-Chain Engine
 * Demonstrates Blockchain mechanics: Hashing, Linking, and Mining.
 */

// --- Constants ---
const DIFFICULTY = 2; // Number of leading zeros required
const DIFFICULTY_STRING = Array(DIFFICULTY + 1).join("0");

// --- State ---
let blockchain = [];

// --- DOM Elements ---
const container = document.getElementById('blockchain-container');
const btnAdd = document.getElementById('btn-add-block');

// --- Initialization ---
async function init() {
    // Create Genesis Block
    const genesisBlock = {
        index: 1,
        timestamp: new Date().toISOString(),
        data: "Genesis Block",
        nonce: 0,
        prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: ""
    };
    
    // Mine Genesis explicitly to start valid
    await mineBlockData(genesisBlock);
    blockchain.push(genesisBlock);
    
    renderChain();
    btnAdd.addEventListener('click', addNewBlock);
}

// --- Core Logic ---

async function calculateHash(index, prevHash, timestamp, data, nonce) {
    const str = index + prevHash + timestamp + data + nonce;
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function mineBlockData(block) {
    block.nonce = 0;
    while (true) {
        const hash = await calculateHash(
            block.index, 
            block.prevHash, 
            block.timestamp, 
            block.data, 
            block.nonce
        );
        if (hash.substring(0, DIFFICULTY) === DIFFICULTY_STRING) {
            block.hash = hash;
            break;
        }
        block.nonce++;
        // Safety break for demo to prevent freeze if difficulty is too high
        if(block.nonce > 1000000) break; 
    }
}

async function addNewBlock() {
    const prevBlock = blockchain[blockchain.length - 1];
    
    const newBlock = {
        index: blockchain.length + 1,
        timestamp: new Date().toISOString(),
        data: "",
        nonce: 0,
        prevHash: prevBlock.hash,
        hash: ""
    };

    // Calculate initial hash (likely invalid until mined)
    newBlock.hash = await calculateHash(
        newBlock.index, 
        newBlock.prevHash, 
        newBlock.timestamp, 
        newBlock.data, 
        newBlock.nonce
    );

    blockchain.push(newBlock);
    renderChain();
}

async function updateChainFrom(startIndex) {
    // If a block changes, we must re-calculate its hash based on current input
    // And then update the NEXT block's prevHash to match this new hash
    // This propagates the "Invalid" state down the chain
    
    for (let i = startIndex; i < blockchain.length; i++) {
        const block = blockchain[i];
        
        // Update prevHash if not genesis
        if (i > 0) {
            block.prevHash = blockchain[i-1].hash;
        }

        // Recalculate Hash based on current state (Data/Nonce/PrevHash)
        block.hash = await calculateHash(
            block.index,
            block.prevHash,
            block.timestamp,
            block.data,
            block.nonce
        );
    }
    renderChain(); // Re-render to show colors
}

// --- UI Rendering ---

function renderChain() {
    container.innerHTML = '';

    blockchain.forEach((block, idx) => {
        // Determine Validity
        const isValid = block.hash.substring(0, DIFFICULTY) === DIFFICULTY_STRING;
        
        const card = document.createElement('div');
        card.className = `block-card ${isValid ? 'valid' : 'invalid'}`;
        
        card.innerHTML = `
            <div class="status-badge">${isValid ? 'Signed' : 'Invalid'}</div>
            
            <div class="block-header">
                <span>Block #${block.index}</span>
                <span>${new Date(block.timestamp).toLocaleTimeString()}</span>
            </div>

            <div class="data-section">
                <label>Data</label>
                <textarea id="data-${idx}">${block.data}</textarea>
            </div>

            <div class="nonce-control">
                <div>
                    <label>Nonce</label>
                    <input type="number" id="nonce-${idx}" class="nonce-input" value="${block.nonce}">
                </div>
                <button class="btn btn-mine" id="mine-${idx}">
                    <i class="fas fa-hammer"></i> Mine
                </button>
            </div>

            <div class="hash-group">
                <label>Previous Hash</label>
                <div class="hash-val">${block.prevHash}</div>
            </div>

            <div class="hash-group">
                <label>Hash</label>
                <div class="hash-val">${block.hash}</div>
            </div>
        `;

        container.appendChild(card);

        // Event Listeners for this block
        const dataInput = document.getElementById(`data-${idx}`);
        const nonceInput = document.getElementById(`nonce-${idx}`);
        const mineBtn = document.getElementById(`mine-${idx}`);

        // Live Typing Updates
        dataInput.addEventListener('input', (e) => {
            block.data = e.target.value;
            updateChainFrom(idx);
        });

        nonceInput.addEventListener('input', (e) => {
            block.nonce = parseInt(e.target.value) || 0;
            updateChainFrom(idx);
        });

        // Mining
        mineBtn.addEventListener('click', async () => {
            mineBtn.classList.add('loading');
            mineBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Mining...';
            
            // Allow UI to render loading state
            setTimeout(async () => {
                await mineBlockData(block);
                updateChainFrom(idx); // Propagate valid hash
            }, 10);
        });
    });
}

// Start
init();