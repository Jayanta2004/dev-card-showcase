// Minimalist Note App
// Author: Ayaanshaikh12243
// Description: Quick notes with tags, search, and simple formatting

// --- State Management ---
const state = {
    notes: [], // {id, content, tags:[], date, updated}
    tags: [], // unique tag strings
    view: 'notes',
    settings: {
        theme: 'default',
    },
    search: {
        query: '',
        tag: '',
    },
    selectedNote: null,
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem('minimalistNoteState', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('minimalistNoteState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.notes = parsed.notes || [];
        state.tags = parsed.tags || [];
        state.view = parsed.view || 'notes';
        state.settings = parsed.settings || state.settings;
        state.search = parsed.search || { query: '', tag: '' };
        state.selectedNote = parsed.selectedNote || null;
    } else {
        // Add sample notes and tags if none exist
        state.notes = [
            {
                id: uuid(),
                content: 'Welcome to **Minimalist Note**!\n- Quick notes\n- Tags\n- Search\n- Simple formatting',
                tags: ['welcome', 'features'],
                date: today(),
                updated: today()
            },
            {
                id: uuid(),
                content: 'Buy groceries\n- Milk\n- Bread\n- Eggs',
                tags: ['personal', 'todo'],
                date: today(),
                updated: today()
            },
            {
                id: uuid(),
                content: 'Project ideas:\n- Habit Tracker\n- Flashcard App\n- Mood Journal',
                tags: ['projects', 'ideas'],
                date: today(),
                updated: today()
            },
            {
                id: uuid(),
                content: 'Meeting notes with __important__ points and `code` example.',
                tags: ['work', 'meeting'],
                date: today(),
                updated: today()
            }
        ];
        state.tags = ['welcome', 'features', 'personal', 'todo', 'projects', 'ideas', 'work', 'meeting'];
        state.selectedNote = null;
    }
}
function uuid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}
function today() {
    return new Date().toISOString().slice(0, 10);
}
function formatContent(content) {
    // Simple formatting: bold **, italic __, code ``, lists -
    let html = content
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/__(.*?)__/g, '<i>$1</i>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^- (.*)$/gm, '<li>$1</li>');
    if (/<li>/.test(html)) html = '<ul>' + html + '</ul>';
    return html;
}

// --- Navigation ---
function setView(view) {
    state.view = view;
    saveState();
    render();
}
document.getElementById('notesBtn').onclick = () => setView('notes');
document.getElementById('tagsBtn').onclick = () => setView('tags');
document.getElementById('searchBtn').onclick = () => setView('search');
document.getElementById('settingsBtn').onclick = () => setView('settings');

// --- Render Functions ---
function render() {
    const main = document.getElementById('mainContent');
    switch (state.view) {
        case 'notes':
            main.innerHTML = renderNotes();
            break;
        case 'tags':
            main.innerHTML = renderTags();
            break;
        case 'search':
            main.innerHTML = renderSearch();
            break;
        case 'settings':
            main.innerHTML = renderSettings();
            break;
    }
    attachEventListeners();
}
// --- Notes View ---
function renderNotes() {
    return `<h2>Notes</h2>
        <form id="noteForm">
            <textarea id="noteContent" placeholder="Write a note..." rows="4" required></textarea>
            <input type="text" id="noteTags" placeholder="Tags (comma separated)" />
            <button type="submit">Add Note</button>
        </form>
        <div class="note-list">
            ${state.notes.map(note => renderNoteCard(note)).join('')}
        </div>`;
}

// --- Render Note Card ---
function renderNoteCard(note) {
    return `<div class="note-card" data-id="${note.id}">
        <div class="content">${formatContent(note.content)}</div>
        <div class="tags">${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
        <div class="date">${note.date}</div>
        <div class="actions">
            <button class="edit-note">Edit</button>
            <button class="delete-note">Delete</button>
        </div>
    </div>`;
}

// --- Tags View ---
function renderTags() {
    return `<h2>Tags</h2>
        <div class="tag-list">
            ${state.tags.map(tag => `<span class="tag-item" data-tag="${tag}">${tag}</span>`).join('')}
        </div>`;
}

// --- Search View ---
function renderSearch() {
    return `<h2>Search Notes</h2>
        <form id="searchForm" class="search-form">
            <input type="text" id="searchQuery" placeholder="Search..." value="${state.search.query}" />
            <input type="text" id="searchTag" placeholder="Tag (optional)" value="${state.search.tag}" />
            <button type="submit">Search</button>
        </form>
        <div class="search-results">
            ${searchNotes().map(note => renderNoteCard(note)).join('')}
        </div>`;
}

// --- Settings View ---
function renderSettings() {
    return `<h2>Settings</h2>
        <div class="settings">
            <label>Theme:
                <select id="theme">
                    <option value="default"${state.settings.theme==='default'?' selected':''}>Default</option>
                    <option value="dark"${state.settings.theme==='dark'?' selected':''}>Dark</option>
                </select>
            </label>
        </div>`;
}

// --- Search Logic ---
function searchNotes() {
    const q = state.search.query.toLowerCase();
    const tag = state.search.tag.toLowerCase();
    return state.notes.filter(note => {
        const matchContent = !q || note.content.toLowerCase().includes(q);
        const matchTag = !tag || note.tags.some(t => t.toLowerCase() === tag);
        return matchContent && matchTag;
    });
}

// --- Event Listeners ---
function attachEventListeners() {
    // Note Form
    const noteForm = document.getElementById('noteForm');
    if (noteForm) {
        noteForm.onsubmit = function(e) {
            e.preventDefault();
            const content = document.getElementById('noteContent').value.trim();
            const tags = document.getElementById('noteTags').value.split(',').map(t => t.trim()).filter(Boolean);
            if (content) {
                const note = { id: uuid(), content, tags, date: today(), updated: today() };
                state.notes.unshift(note);
                tags.forEach(tag => { if (!state.tags.includes(tag)) state.tags.push(tag); });
                saveState();
                render();
            }
        };
        document.querySelectorAll('.edit-note').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.note-card').getAttribute('data-id');
                editNote(id);
            };
        });
        document.querySelectorAll('.delete-note').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.note-card').getAttribute('data-id');
                state.notes = state.notes.filter(n => n.id !== id);
                saveState();
                render();
            };
        });
    }
    // Tag Click
    document.querySelectorAll('.tag-item').forEach(tagEl => {
        tagEl.onclick = function() {
            const tag = this.getAttribute('data-tag');
            state.search.tag = tag;
            setView('search');
        };
    });
    // Search Form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.onsubmit = function(e) {
            e.preventDefault();
            state.search.query = document.getElementById('searchQuery').value;
            state.search.tag = document.getElementById('searchTag').value;
            saveState();
            render();
        };
    }
    // Settings
    const theme = document.getElementById('theme');
    if (theme) {
        theme.onchange = function() {
            state.settings.theme = this.value;
            document.body.className = this.value;
            saveState();
        };
    }
}

// --- Edit Note Modal (Simple Prompt) ---
function editNote(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
    const content = prompt('Edit note content:', note.content);
    const tags = prompt('Edit tags (comma separated):', note.tags.join(', '));
    if (content !== null && content.trim() !== '') {
        note.content = content.trim();
        note.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
        note.updated = today();
        note.tags.forEach(tag => { if (!state.tags.includes(tag)) state.tags.push(tag); });
        saveState();
        render();
    }
}

// --- Initialization ---
loadState();
render();
