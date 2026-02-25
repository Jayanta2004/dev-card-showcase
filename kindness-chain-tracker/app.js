// Kindness Chain Tracker
const kindnessForm = document.getElementById('kindness-form');
const kindnessInput = document.getElementById('kindness-input');
const chainVisual = document.getElementById('chain-visual');

let chain = JSON.parse(localStorage.getItem('kindnessChain') || '[]');

function renderChain() {
    chainVisual.innerHTML = '';
    chain.forEach((node, idx) => {
        const div = document.createElement('div');
        div.className = 'kindness-node';
        div.textContent = node.text;
        chainVisual.appendChild(div);
        if (idx < chain.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'chain-arrow';
            arrow.textContent = '→';
            chainVisual.appendChild(arrow);
        }
    });
}

kindnessForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = kindnessInput.value.trim();
    if (text) {
        chain.push({ text });
        localStorage.setItem('kindnessChain', JSON.stringify(chain));
        kindnessInput.value = '';
        renderChain();
    }
});

renderChain();
