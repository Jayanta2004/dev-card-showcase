// Digital Garden for Notes & Ideas
// Simple graph visualization using HTML/CSS

const addNoteForm = document.getElementById('add-note-form');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesListDiv = document.getElementById('notes-list');
const gardenGraphDiv = document.getElementById('garden-graph');

let notes = JSON.parse(localStorage.getItem('gardenNotes') || '[]');
let links = JSON.parse(localStorage.getItem('gardenLinks') || '[]');

function saveData() {
    localStorage.setItem('gardenNotes', JSON.stringify(notes));
    localStorage.setItem('gardenLinks', JSON.stringify(links));
}

function renderNotes() {
    notesListDiv.innerHTML = '';
    notes.forEach((note, idx) => {
        const div = document.createElement('div');
        div.className = 'note-entry';
        div.innerHTML = `
            <span class="note-title">${note.title}</span>
            <span class="note-content">${note.content}</span>
            <div>
                <button class="link-btn" data-idx="${idx}">Link to...</button>
                <span class="linked-to">Linked to: ${getLinkedTitles(idx).join(', ')}</span>
            </div>
        `;
        notesListDiv.appendChild(div);
    });
    document.querySelectorAll('.link-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const fromIdx = parseInt(btn.getAttribute('data-idx'));
            showLinkDialog(fromIdx);
        });
    });
}

function getLinkedTitles(idx) {
    return links.filter(l => l.from === idx).map(l => notes[l.to]?.title || '').filter(Boolean);
}

function showLinkDialog(fromIdx) {
    const options = notes.map((n, i) => i !== fromIdx ? `<option value="${i}">${n.title}</option>` : '').join('');
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = '#fff';
    dialog.style.padding = '18px';
    dialog.style.borderRadius = '10px';
    dialog.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    dialog.innerHTML = `
        <label>Link to:</label>
        <select id="link-to">${options}</select>
        <button id="confirm-link">Link</button>
        <button id="cancel-link">Cancel</button>
    `;
    document.body.appendChild(dialog);
    dialog.querySelector('#confirm-link').onclick = () => {
        const toIdx = parseInt(dialog.querySelector('#link-to').value);
        if (!links.some(l => l.from === fromIdx && l.to === toIdx)) {
            links.push({ from: fromIdx, to: toIdx });
            saveData();
            renderNotes();
            renderGraph();
        }
        document.body.removeChild(dialog);
    };
    dialog.querySelector('#cancel-link').onclick = () => {
        document.body.removeChild(dialog);
    };
}

function renderGraph() {
    // Simple text-based graph
    gardenGraphDiv.innerHTML = '';
    notes.forEach((note, idx) => {
        const nodeDiv = document.createElement('div');
        nodeDiv.style.display = 'inline-block';
        nodeDiv.style.margin = '8px';
        nodeDiv.style.padding = '8px 14px';
        nodeDiv.style.background = '#ff4e50';
        nodeDiv.style.color = '#fff';
        nodeDiv.style.borderRadius = '8px';
        nodeDiv.textContent = note.title;
        gardenGraphDiv.appendChild(nodeDiv);
        // Draw links as arrows (text-based)
        links.filter(l => l.from === idx).forEach(l => {
            const arrow = document.createElement('span');
            arrow.style.margin = '0 8px';
            arrow.textContent = '→';
            gardenGraphDiv.appendChild(arrow);
            const toNode = document.createElement('span');
            toNode.style.display = 'inline-block';
            toNode.style.background = '#f9d423';
            toNode.style.color = '#fff';
            toNode.style.borderRadius = '8px';
            toNode.style.padding = '8px 14px';
            toNode.textContent = notes[l.to]?.title || '';
            gardenGraphDiv.appendChild(toNode);
        });
        gardenGraphDiv.appendChild(document.createElement('br'));
    });
}

addNoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    notes.push({ title, content });
    saveData();
    renderNotes();
    renderGraph();
    addNoteForm.reset();
});

// Initial render
renderNotes();
renderGraph();
