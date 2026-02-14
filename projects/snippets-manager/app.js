// Code Snippet Manager - app.js
// Handles UI, storage, and syntax highlighting

const snippetsKey = 'snippets';
let editingIndex = null;

const addSnippetBtn = document.getElementById('addSnippetBtn');
const snippetModal = document.getElementById('snippetModal');
const closeModal = document.querySelector('.close');
const snippetForm = document.getElementById('snippetForm');
const snippetsList = document.getElementById('snippetsList');
const searchInput = document.getElementById('searchInput');

function getSnippets() {
    return JSON.parse(localStorage.getItem(snippetsKey) || '[]');
}

function saveSnippets(snippets) {
    localStorage.setItem(snippetsKey, JSON.stringify(snippets));
}

function renderSnippets(filter = '') {
    const snippets = getSnippets();
    snippetsList.innerHTML = '';
    const filtered = snippets.filter(snippet =>
        snippet.title.toLowerCase().includes(filter.toLowerCase()) ||
        snippet.tags.toLowerCase().includes(filter.toLowerCase()) ||
        snippet.language.toLowerCase().includes(filter.toLowerCase()) ||
        snippet.code.toLowerCase().includes(filter.toLowerCase())
    );
    if (filtered.length === 0) {
        snippetsList.innerHTML = '<p style="color:#888">No snippets found.</p>';
        return;
    }
    filtered.forEach((snippet, idx) => {
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.innerHTML = `
            <div class="snippet-header">
                <span class="snippet-title">${snippet.title}</span>
                <div class="snippet-actions">
                    <button onclick="editSnippet(${idx})">Edit</button>
                    <button onclick="deleteSnippet(${idx})">Delete</button>
                    <button onclick="copySnippet(${idx})">Copy</button>
                </div>
            </div>
            <div class="snippet-tags">${snippet.tags}</div>
            <pre><code class="language-${snippet.language}">${escapeHtml(snippet.code)}</code></pre>
        `;
        snippetsList.appendChild(card);
    });
    document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c];
    });
}

addSnippetBtn.onclick = () => {
    editingIndex = null;
    snippetForm.reset();
    snippetModal.style.display = 'block';
};

closeModal.onclick = () => {
    snippetModal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target === snippetModal) {
        snippetModal.style.display = 'none';
    }
};

snippetForm.onsubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const tags = document.getElementById('tags').value.trim();
    const language = document.getElementById('language').value;
    const code = document.getElementById('code').value;
    if (!title || !language || !code) return;
    const snippets = getSnippets();
    const snippet = { title, tags, language, code };
    if (editingIndex !== null) {
        snippets[editingIndex] = snippet;
    } else {
        snippets.push(snippet);
    }
    saveSnippets(snippets);
    renderSnippets(searchInput.value);
    snippetModal.style.display = 'none';
};

searchInput.oninput = function() {
    renderSnippets(this.value);
};

window.editSnippet = function(idx) {
    const snippets = getSnippets();
    const s = snippets[idx];
    document.getElementById('title').value = s.title;
    document.getElementById('tags').value = s.tags;
    document.getElementById('language').value = s.language;
    document.getElementById('code').value = s.code;
    editingIndex = idx;
    snippetModal.style.display = 'block';
};

window.deleteSnippet = function(idx) {
    if (!confirm('Delete this snippet?')) return;
    const snippets = getSnippets();
    snippets.splice(idx, 1);
    saveSnippets(snippets);
    renderSnippets(searchInput.value);
};

window.copySnippet = function(idx) {
    const snippets = getSnippets();
    navigator.clipboard.writeText(snippets[idx].code).then(() => {
        alert('Code copied to clipboard!');
    });
};

// Add sample data if none exists
function addSampleDataIfNeeded() {
    if (getSnippets().length === 0) {
        const samples = [
            {
                title: 'Hello World in Python',
                tags: 'python, beginner',
                language: 'python',
                code: 'print("Hello, World!")'
            },
            {
                title: 'Center a div with CSS',
                tags: 'css, layout',
                language: 'css',
                code: '.centered {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  background: #222;\n}'
            },
            {
                title: 'Debounce Function in JS',
                tags: 'javascript, utility',
                language: 'javascript',
                code: 'function debounce(fn, delay) {\n  let timeout;\n  return (...args) => {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => fn(...args), delay);\n  };\n}'
            }
        ];
        saveSnippets(samples);
    }
}

addSampleDataIfNeeded();
// Initial render
renderSnippets();
