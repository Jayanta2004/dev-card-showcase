/**
 * Merkle Tree Integrity Visualizer
 * Logic Engine
 */

// --- Crypto Utils ---
async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Merkle Tree Logic ---

class MerkleNode {
    constructor(hash, left = null, right = null, data = null) {
        this.hash = hash;
        this.left = left;
        this.right = right;
        this.parent = null; // Back-pointer for proof
        this.data = data; // Only for leaves

        if (left) left.parent = this;
        if (right) right.parent = this;
    }
}

class MerkleTree {
    constructor(dataBlocks) {
        this.dataBlocks = dataBlocks;
        this.leaves = [];
        this.root = null;
        this.layers = [];
    }

    async build() {
        // 1. Create Leaves
        this.leaves = [];
        for (let data of this.dataBlocks) {
            const hash = await sha256(data);
            this.leaves.push(new MerkleNode(hash, null, null, data));
        }

        if (this.leaves.length === 0) return;

        // 2. Build Tree Upwards
        let currentLayer = [...this.leaves];
        this.layers = [currentLayer];

        while (currentLayer.length > 1) {
            const nextLayer = [];

            for (let i = 0; i < currentLayer.length; i += 2) {
                const left = currentLayer[i];
                const right = currentLayer[i + 1] || left; // Duplicate last if odd

                // Parent Hash = Hash(Left + Right)
                const combined = left.hash + right.hash;
                const parentHash = await sha256(combined);

                nextLayer.push(new MerkleNode(parentHash, left, right));
            }

            currentLayer = nextLayer;
            this.layers.push(currentLayer);
        }

        this.root = currentLayer[0];
    }

    // Get Proof: [ { hash, direction } ]
    // Direction: 'left' or 'right' relative to the path node
    getProof(targetIndex) {
        const proof = [];
        let node = this.leaves[targetIndex];

        while (node.parent) {
            const parent = node.parent;
            const isLeft = parent.left === node;
            const sibling = isLeft ? parent.right : parent.left;

            // If sibling is self (duplicate case), we still need it mathematically?
            // Usually we proof against the sibling.

            if (sibling) {
                proof.push({
                    hash: sibling.hash,
                    position: isLeft ? 'right' : 'left', // The sibling is on the...
                    nodeRef: sibling // For visualization
                });
            }

            node = parent;
        }
        return proof;
    }
}

// --- UI Controller ---

const state = {
    blocks: ["Tx: 100 BTC", "Tx: 50 ETH", "Tx: 10 SOL", "Tx: Verify Me"],
    snapshotRoot: null, // The "Golden" Root Hash
    tree: null,
    proofMode: null // { index, proof }
};

// DOM Elements
const inputsContainer = document.getElementById('inputs-container');
const treeContainer = document.getElementById('tree-container');
const inspectorContent = document.getElementById('inspector-content');
const rootStatus = document.getElementById('root-status');
const proofSteps = document.getElementById('proof-steps');
const viewport = document.querySelector('.viewport');

// --- Zoom / Pan State ---
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX, startY;

// Init
async function init() {
    setupTabs();
    setupZoomPan();
    renderInputs();
    await updateTree();

    // Set initial state as valid
    state.snapshotRoot = state.tree.root.hash;
    updateStatusUI();
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            e.target.classList.add('active');
            document.getElementById(`panel-${e.target.dataset.tab}`).classList.add('active');
        });
    });
}

function setupZoomPan() {
    // Zoom Buttons
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        zoomLevel = Math.min(zoomLevel + 0.1, 2);
        updateTransform();
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        zoomLevel = Math.max(zoomLevel - 0.1, 0.2);
        updateTransform();
    });
    document.getElementById('btn-fit').addEventListener('click', () => {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        updateTransform();
    });

    // Pan Events
    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = 'grab';
    });

    viewport.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateTransform();
    });
}

function updateTransform() {
    document.getElementById('zoom-level').innerText = Math.round(zoomLevel * 100) + '%';
    treeContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

function renderInputs() {
    inputsContainer.innerHTML = '';
    const template = document.getElementById('block-input-template');

    state.blocks.forEach((blockData, index) => {
        const clone = template.content.cloneNode(true);
        // The clone is a DocumentFragment, we can query inside it

        // Setup ID
        clone.querySelector('.block-id').innerText = `L${index}`;

        // Setup Input
        const input = clone.querySelector('.block-data');
        input.value = blockData;

        input.addEventListener('input', (e) => {
            state.blocks[index] = e.target.value;
            updateTree().then(() => {
                updateStatusUI();
                input.classList.add('changed');
                if (state.proofMode) clearProof();
            });
        });

        // Setup Verify Button
        const verifyBtn = clone.querySelector('.verify-btn');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', () => {
                activateVerifyMode(index);
            });
        }

        // Setup Remove Button
        const removeBtn = clone.querySelector('.remove-block');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (state.blocks.length <= 1) return;
                state.blocks.splice(index, 1);
                renderInputs();
                updateTree().then(() => {
                    state.snapshotRoot = state.tree.root.hash;
                    updateStatusUI();
                    clearProof();
                });
            });
        }

        inputsContainer.appendChild(clone);
    });
}

document.getElementById('btn-add-block').addEventListener('click', () => {
    state.blocks.push(`Tx: New Block ${Date.now().toString().slice(-4)}`);
    renderInputs();
    updateTree().then(() => {
        state.snapshotRoot = state.tree.root.hash;
        updateStatusUI();
        clearProof();
    });
});

document.getElementById('btn-reset').addEventListener('click', () => {
    state.blocks = ["Tx: 100 BTC", "Tx: 50 ETH", "Tx: 10 SOL", "Tx: Verify Me"];
    renderInputs();
    init(); // Re-init to set snapshot
    clearProof();
});

document.getElementById('btn-clear-proof').addEventListener('click', clearProof);

function clearProof() {
    state.proofMode = null;
    document.querySelectorAll('.node').forEach(n => {
        n.classList.remove('proof-node');
        n.classList.remove('proof-target');
    });
    proofSteps.innerHTML = '<p class="placeholder-text">Select a "Verify" button on a block to generate a Merkle Proof.</p>';
    document.getElementById('proof-status-badge').innerText = 'Ready';
    document.getElementById('proof-status-badge').className = 'badge';

    // Switch back to inputs tab
    // document.querySelector('[data-tab="inputs"]').click();
}

function activateVerifyMode(index) {
    if (!state.tree) return;
    state.proofMode = { index };

    // Switch Tab
    document.querySelector('[data-tab="proof"]').click();

    const proof = state.tree.getProof(index);
    const targetNode = state.tree.leaves[index];

    // 1. Highlight Visuals
    // Clear old
    document.querySelectorAll('.node').forEach(n => {
        n.classList.remove('proof-node');
        n.classList.remove('proof-target');
    });

    // Highlight Target Leaf
    // We need to find the DOM element. We stored hash in dataset, but duplicates exist.
    // Better way: Re-render tree OR traverse and match. 
    // Since we re-render often, let's just re-render with "Proof State".
    // Or we traverse the DOM using the structure since it matches tree structure.
    // Actually, referencing DOM nodes from Model is complex if rebuilding.
    // Let's rely on Hash matching for now (uniques) or rebuild tree DOM with "Active Proof" markers.

    // Let's redraw tree with proof flags. simpler.
    renderTreeViz();

    // 2. Generate Steps UI
    proofSteps.innerHTML = '';

    // Step 0: Leaf
    addProofStep('Start', `Leaf Hash: ${targetNode.hash.substring(0, 8)}...`, 'neutral');

    let currentHash = targetNode.hash;

    proof.forEach((step, i) => {
        const siblingShort = step.hash.substring(0, 8) + '...';
        const position = step.position; // Left or Right

        let calculation;
        if (position === 'left') {
            calculation = `Hash( <strong>${siblingShort}</strong> + ${currentHash.substring(0, 8)}... )`;
        } else {
            calculation = `Hash( ${currentHash.substring(0, 8)}... + <strong>${siblingShort}</strong> )`;
        }

        addProofStep(`Step ${i + 1}`, `Combine with sibling on ${position}:<br>${calculation}`, 'proof');

        // TODO: ideally simulate the hashing here to show it matches parent
        // For visual, just showing path is enough.
    });

    const rootMatch = state.tree.root.hash === state.snapshotRoot;
    addProofStep('Result', `Root Hash: ${state.tree.root.hash.substring(0, 8)}... <br> ${rootMatch ? 'MATCHES Golden Root' : 'MISMATCH'}`, rootMatch ? 'valid' : 'invalid');

    document.getElementById('proof-status-badge').innerText = rootMatch ? 'Verified' : 'Failed';
    document.getElementById('proof-status-badge').className = rootMatch ? 'badge valid' : 'badge changed';
}

function addProofStep(label, desc, type) {
    const div = document.createElement('div');
    div.className = `proof-step ${type}`;
    div.innerHTML = `<strong style="color:var(--color-text)">${label}</strong><br><span class="hash">${desc}</span>`;
    proofSteps.appendChild(div);
}

async function updateTree() {
    state.tree = new MerkleTree(state.blocks);
    await state.tree.build();
    renderTreeViz();
}

function updateStatusUI() {
    if (!state.tree || !state.tree.root) return;

    const currentRoot = state.tree.root.hash;
    const isValid = currentRoot === state.snapshotRoot;

    if (isValid) {
        rootStatus.className = 'status-badge';
        rootStatus.innerHTML = '<i class="ri-shield-check-line"></i> Root Verified';
    } else {
        rootStatus.className = 'status-badge tampered';
        rootStatus.innerHTML = '<i class="ri-alarm-warning-line"></i> TAMPERED';
    }

    // Traverse and highlight changed path
    // We need to compare specific nodes against original? 
    // Actually, simply highlighting the path from Changed Leaf to Root is enough.
    // But logically, if Root Changed, everything is Red?
    // Let's rely on the visual "Changed" style if state is invalid.

    const nodes = document.querySelectorAll('.node');
    nodes.forEach(n => {
        if (!isValid) n.classList.add('changed'); // Simple visual cue
        else n.classList.remove('changed');
    });
}

// Recursive Tree Renderer
function renderTreeViz() {
    treeContainer.innerHTML = '';
    if (!state.tree.root) return;

    const treeDOM = buildNodeDOM(state.tree.root);
    treeContainer.appendChild(treeDOM);
}

function buildNodeDOM(node) {
    // Container
    const wrapper = document.createElement('div');
    wrapper.className = 'tf-child-wrapper';

    // Node Itself
    const content = document.createElement('div');
    content.className = 'tf-node-content';

    const nodeEl = document.createElement('div');
    nodeEl.className = 'node';
    if (node.data) nodeEl.classList.add('leaf');

    // Check Proof State for Styling
    if (state.proofMode) {
        // Is this the target?
        if (state.tree.leaves[state.proofMode.index] === node) {
            nodeEl.classList.add('proof-target');
        }
        // Is this a proof sibling?
        const proof = state.tree.getProof(state.proofMode.index);
        // This is inefficient O(N^2) but tree is small.
        if (proof.find(p => p.nodeRef === node)) {
            nodeEl.classList.add('proof-node');
        }
    }

    // Display shortened hash
    nodeEl.innerText = node.data ? node.data.substring(0, 12) + (node.data.length > 12 ? '...' : '') : `${node.hash.substring(0, 4)}...`;
    nodeEl.dataset.hash = node.hash;
    nodeEl.dataset.fullData = node.data || "Intermediate Hash";

    // Inspector Events
    nodeEl.addEventListener('mouseenter', () => showInspector(node));

    content.appendChild(nodeEl);
    wrapper.appendChild(content);

    // Children
    if (node.left) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tf-children';

        childrenContainer.appendChild(buildNodeDOM(node.left));
        if (node.right && node.right !== node.left) { // Don't render duplicate ref if odd
            childrenContainer.appendChild(buildNodeDOM(node.right));
        } else if (node.right === node.left) {
            // It's a duplicate for odd-numbered balancing
            // Maybe render it faintly or just show edge case?
            // Standard Merkle duplicates the last hash.
            // Let's render it to show the math.
            const dupNode = buildNodeDOM(node.right);
            dupNode.querySelector('.node').style.opacity = '0.5';
            dupNode.querySelector('.node').title = "Duplicated for balancing";
            childrenContainer.appendChild(dupNode);
        }

        wrapper.appendChild(childrenContainer);
    }

    return wrapper;
}

function showInspector(node) {
    const isLeaf = !!node.data;
    inspectorContent.innerHTML = `
        <span class="hash-label">Type: ${isLeaf ? 'Leaf Node (Data Block)' : 'Internal Node (Hash)'}</span>
        ${isLeaf ? `<div style="color:#fff; margin-bottom:8px">Data: "${node.data}"</div>` : ''}
        <span class="hash-label">SHA-256 Hash:</span>
        <div style="font-size:0.8rem; color:var(--color-primary)">${node.hash}</div>
        
        ${!isLeaf ? `
        <div style="margin-top:10px; font-size:0.7rem; color:var(--color-text-muted)">
            Combined Left + Right Child Hashes and re-hashed.
        </div>` : ''}
    `;
}

// Start
init();
