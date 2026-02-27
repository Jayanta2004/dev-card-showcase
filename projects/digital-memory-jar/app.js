// Digital Memory Jar
// Features: Add memories (text, image, audio), revisit randomly or by date, modals, localStorage, modern UI

let memories = JSON.parse(localStorage.getItem('memJarMemories') || 'null') || [
    {
        type: 'text',
        content: 'Graduation day! So proud of myself and my friends.',
        date: '2023-05-20',
        special: true
    },
    {
        type: 'image',
        content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        date: '2024-01-01',
        special: false
    },
    {
        type: 'audio',
        content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        date: '2025-12-25',
        special: true
    }
];

// --- DOM ELEMENTS ---
const addMemoryBtn = document.getElementById('addMemoryBtn');
const randomMemoryBtn = document.getElementById('randomMemoryBtn');
const specialDateBtn = document.getElementById('specialDateBtn');
const aboutBtn = document.getElementById('aboutBtn');
const memoryListSection = document.getElementById('memoryListSection');
const aboutSection = document.getElementById('aboutSection');
const memoryList = document.getElementById('memoryList');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addMemoryBtn.onclick = () => showAddMemoryModal();
randomMemoryBtn.onclick = () => showRandomMemory();
specialDateBtn.onclick = () => showSpecialDateMemory();
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    memoryListSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'memories') memoryListSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
}

// --- RENDER MEMORIES ---
function renderMemoryList() {
    memoryList.innerHTML = '';
    if (memories.length === 0) {
        memoryList.innerHTML = '<p>No memories yet. Add your first one!</p>';
        return;
    }
    memories.forEach((mem, idx) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.innerHTML = `
            <span class="memory-date">${mem.date}${mem.special ? ' 🎉' : ''}</span>
            ${renderMemoryMedia(mem)}
            <div class="memory-actions">
                <button onclick="showMemoryDetails(${idx})">View</button>
                <button onclick="editMemory(${idx})">Edit</button>
                <button onclick="deleteMemory(${idx})">Delete</button>
            </div>
        `;
        memoryList.appendChild(card);
    });
}
function renderMemoryMedia(mem) {
    if (mem.type === 'text') {
        return `<div>${mem.content}</div>`;
    } else if (mem.type === 'image') {
        return `<img src="${mem.content}" class="memory-media" alt="Memory Image">`;
    } else if (mem.type === 'audio') {
        return `<audio controls class="memory-media"><source src="${mem.content}"></audio>`;
    }
    return '';
}
window.showMemoryDetails = function(idx) {
    const mem = memories[idx];
    modalBody.innerHTML = `
        <h2>Memory (${mem.date}${mem.special ? ' 🎉' : ''})</h2>
        ${renderMemoryMedia(mem)}
        <div style="margin-top:1rem;"><button onclick="editMemory(${idx})">Edit</button> <button onclick="deleteMemory(${idx})">Delete</button></div>
    `;
    showModal();
};
window.editMemory = function(idx) {
    showAddMemoryModal(memories[idx], idx);
};
window.deleteMemory = function(idx) {
    if (confirm('Delete this memory?')) {
        memories.splice(idx, 1);
        localStorage.setItem('memJarMemories', JSON.stringify(memories));
        renderMemoryList();
        hideModal();
    }
};

// --- ADD/EDIT MEMORY MODAL ---
function showAddMemoryModal(mem = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${mem ? 'Edit' : 'Add'} Memory</h2>
        <label>Type:
            <select id="memoryType">
                <option value="text" ${mem && mem.type === 'text' ? 'selected' : ''}>Text</option>
                <option value="image" ${mem && mem.type === 'image' ? 'selected' : ''}>Image</option>
                <option value="audio" ${mem && mem.type === 'audio' ? 'selected' : ''}>Audio</option>
            </select>
        </label><br><br>
        <label>Content:<br>
            <textarea id="memoryContent" style="width:100%;height:60px;display:${!mem || mem.type === 'text' ? 'block' : 'none'};">${mem && mem.type === 'text' ? mem.content : ''}</textarea>
            <input id="memoryImage" type="url" placeholder="Image URL" style="width:100%;display:${mem && mem.type === 'image' ? 'block' : 'none'};" value="${mem && mem.type === 'image' ? mem.content : ''}">
            <input id="memoryAudio" type="url" placeholder="Audio URL" style="width:100%;display:${mem && mem.type === 'audio' ? 'block' : 'none'};" value="${mem && mem.type === 'audio' ? mem.content : ''}">
        </label><br>
        <label>Date: <input id="memoryDate" type="date" value="${mem ? mem.date : ''}" required></label><br><br>
        <label><input type="checkbox" id="memorySpecial" ${mem && mem.special ? 'checked' : ''}> Mark as special date</label><br><br>
        <button onclick="submitMemory(${idx !== null ? idx : ''})">${mem ? 'Save' : 'Add'} Memory</button>
        <script>
            document.getElementById('memoryType').onchange = function() {
                document.getElementById('memoryContent').style.display = this.value === 'text' ? 'block' : 'none';
                document.getElementById('memoryImage').style.display = this.value === 'image' ? 'block' : 'none';
                document.getElementById('memoryAudio').style.display = this.value === 'audio' ? 'block' : 'none';
            };
        <\/script>
    `;
    showModal();
}
window.submitMemory = function(idx) {
    const type = document.getElementById('memoryType').value;
    let content = '';
    if (type === 'text') content = document.getElementById('memoryContent').value.trim();
    if (type === 'image') content = document.getElementById('memoryImage').value.trim();
    if (type === 'audio') content = document.getElementById('memoryAudio').value.trim();
    const date = document.getElementById('memoryDate').value;
    const special = document.getElementById('memorySpecial').checked;
    if (!content || !date) {
        alert('Please fill all required fields.');
        return;
    }
    const mem = { type, content, date, special };
    if (idx !== undefined && idx !== null && memories[idx]) {
        memories[idx] = mem;
    } else {
        memories.push(mem);
    }
    localStorage.setItem('memJarMemories', JSON.stringify(memories));
    renderMemoryList();
    hideModal();
};

// --- RANDOM MEMORY ---
function showRandomMemory() {
    if (memories.length === 0) {
        alert('No memories yet!');
        return;
    }
    const idx = Math.floor(Math.random() * memories.length);
    window.showMemoryDetails(idx);
}

// --- SPECIAL DATE MEMORY ---
function showSpecialDateMemory() {
    const today = new Date().toISOString().slice(5, 10); // MM-DD
    const specialMemories = memories.filter(m => m.special && m.date.slice(5, 10) === today);
    if (specialMemories.length === 0) {
        alert('No special memories for today!');
        return;
    }
    const idx = memories.indexOf(specialMemories[Math.floor(Math.random() * specialMemories.length)]);
    window.showMemoryDetails(idx);
}

// --- MODAL LOGIC ---
function showModal() {
    modal.classList.remove('hidden');
}
function hideModal() {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
}

// --- INIT ---
function init() {
    renderMemoryList();
    showSection('memories');
}
init();
