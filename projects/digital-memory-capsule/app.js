// Digital Memory Capsule Logic
// Store and visualize digital memories

const memoryForm = document.getElementById('memory-form');
const memoryInput = document.getElementById('memory-input');
const memoryLogDiv = document.getElementById('memory-log');
const encryptionKeyInput = document.getElementById('encryption-key');
const scheduleDateInput = document.getElementById('schedule-date');

let memoryLog = JSON.parse(localStorage.getItem('digitalCapsule')) || [];

function decryptMemory(encrypted, key) {
    if (!key) return encrypted;
    try {
        return atob(encrypted.split('').reverse().join('')).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
    } catch {
        return '[Encrypted]';
    }
}

function renderMemoryLog() {
    memoryLogDiv.innerHTML = '';
    const now = new Date();
    memoryLog.forEach(entry => {
        const scheduled = entry.schedule ? new Date(entry.schedule) : null;
        if (!scheduled || scheduled <= now) {
            const div = document.createElement('div');
            div.className = 'memory-entry';
            let decrypted = decryptMemory(entry.memory, entry.key);
            div.innerHTML = `<strong>Memory:</strong> ${decrypted}<br><em>Scheduled:</em> ${entry.schedule ? entry.schedule : 'Immediate'}`;
            memoryLogDiv.appendChild(div);
        }
    });
}

memoryForm.addEventListener('submit', e => {
    e.preventDefault();
    const memory = memoryInput.value.trim();
    const key = encryptionKeyInput.value.trim();
    const schedule = scheduleDateInput.value;
    if (!memory) return;
    let encrypted = memory;
    if (key) {
        encrypted = btoa(memory.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('')).split('').reverse().join('');
    }
    memoryLog.push({ memory: encrypted, key: key || '', schedule });
    localStorage.setItem('digitalCapsule', JSON.stringify(memoryLog));
    renderMemoryLog();
    memoryInput.value = '';
    encryptionKeyInput.value = '';
    scheduleDateInput.value = '';
});

renderMemoryLog();
