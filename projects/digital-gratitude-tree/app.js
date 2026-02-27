// Digital Gratitude Tree
// Features: Add daily gratitude notes as leaves, tree flourishes with consistency, modals, localStorage, modern UI

let notes = JSON.parse(localStorage.getItem('dgtNotes') || 'null') || [
    { date: '2026-02-14', text: 'Grateful for family', leaf: '🍃' },
    { date: '2026-02-15', text: 'Thankful for good health', leaf: '🍂' },
    { date: '2026-02-16', text: 'Appreciate my friends', leaf: '🍁' }
];
const treeStages = [
    { min: 0, emoji: '🌱', label: 'Sprout' },
    { min: 3, emoji: '🌿', label: 'Sapling' },
    { min: 7, emoji: '🌳', label: 'Tree' },
    { min: 14, emoji: '🌳', label: 'Flourishing Tree' }
];
const leafEmojis = ['🍃', '🍂', '🍁', '🍀', '🌿', '🍄'];

// --- DOM ELEMENTS ---
const addNoteBtn = document.getElementById('addNoteBtn');
const treeBtn = document.getElementById('treeBtn');
const aboutBtn = document.getElementById('aboutBtn');
const noteSection = document.getElementById('noteSection');
const treeSection = document.getElementById('treeSection');
const aboutSection = document.getElementById('aboutSection');
const noteList = document.getElementById('noteList');
const tree = document.getElementById('tree');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addNoteBtn.onclick = () => showAddNoteModal();
treeBtn.onclick = () => showSection('tree');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    noteSection.classList.add('hidden');
    treeSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'notes') noteSection.classList.remove('hidden');
    if (section === 'tree') treeSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'notes') renderNoteList();
    if (section === 'tree') renderTree();
}

// --- NOTE LIST ---
function renderNoteList() {
    noteList.innerHTML = '';
    if (notes.length === 0) {
        noteList.innerHTML = '<p>No gratitude notes yet. Add your first one!</p>';
        return;
    }
    notes.slice().reverse().forEach((note, idx) => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <span class="note-date">${note.date}</span>
            <span class="note-meta">${note.text}</span>
            <div class="note-actions">
                <button onclick="editNote(${notes.length - 1 - idx})">Edit</button>
                <button onclick="deleteNote(${notes.length - 1 - idx})">Delete</button>
            </div>
        `;
        noteList.appendChild(card);
    });
}
window.editNote = function(idx) {
    showAddNoteModal(notes[idx], idx);
};
window.deleteNote = function(idx) {
    if (confirm('Delete this note?')) {
        notes.splice(idx, 1);
        localStorage.setItem('dgtNotes', JSON.stringify(notes));
        renderNoteList();
        renderTree();
        hideModal();
    }
};

// --- ADD/EDIT NOTE MODAL ---
function showAddNoteModal(note = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${note ? 'Edit' : 'Add'} Gratitude Note</h2>
        <label>Date: <input id="noteDate" type="date" value="${note ? note.date : ''}" required></label><br><br>
        <label>Note:<br><textarea id="noteText" style="width:100%;height:60px;">${note ? note.text : ''}</textarea></label><br><br>
        <label>Leaf:
            <select id="noteLeaf">
                ${leafEmojis.map(e => `<option value="${e}" ${note && note.leaf === e ? 'selected' : ''}>${e}</option>`).join('')}
            </select>
        </label><br><br>
        <button onclick="submitNote(${idx !== null ? idx : ''})">${note ? 'Save' : 'Add'} Note</button>
    `;
    showModal();
}
window.submitNote = function(idx) {
    const date = document.getElementById('noteDate').value;
    const text = document.getElementById('noteText').value.trim();
    const leaf = document.getElementById('noteLeaf').value;
    if (!date || !text) {
        alert('Please fill all required fields.');
        return;
    }
    const note = { date, text, leaf };
    if (idx !== undefined && idx !== null && notes[idx]) {
        notes[idx] = note;
    } else {
        notes.push(note);
    }
    localStorage.setItem('dgtNotes', JSON.stringify(notes));
    renderNoteList();
    renderTree();
    hideModal();
};

// --- TREE ---
function renderTree() {
    tree.innerHTML = '';
    const count = notes.length;
    let stage = treeStages[0];
    for (let i = treeStages.length - 1; i >= 0; i--) {
        if (count >= treeStages[i].min) {
            stage = treeStages[i];
            break;
        }
    }
    const treeDiv = document.createElement('div');
    treeDiv.className = 'tree';
    treeDiv.innerHTML = `
        <div class="tree-emoji">${stage.emoji}</div>
        <div class="tree-label">${stage.label} (${count} notes)</div>
    `;
    tree.appendChild(treeDiv);
    // Leaves
    notes.forEach(note => {
        const leafDiv = document.createElement('div');
        leafDiv.className = 'leaf';
        leafDiv.innerHTML = `
            <div class="leaf-emoji">${note.leaf}</div>
            <div class="leaf-label">${note.date}<br><span style="font-size:0.9em;">${note.text}</span></div>
        `;
        tree.appendChild(leafDiv);
    });
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
    renderNoteList();
    renderTree();
    showSection('notes');
}
init();
