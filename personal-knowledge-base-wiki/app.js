// Personal Knowledge Base & Wiki
// Hierarchical pages, search, backlinks, markdown support, export
let pages = JSON.parse(localStorage.getItem('wiki-pages') || '[]');
let currentPageId = null;

function renderPageTree() {
    const treeDiv = document.getElementById('page-tree');
    treeDiv.innerHTML = '';
    function renderNode(node, depth=0) {
        const div = document.createElement('div');
        div.style.marginLeft = depth*16 + 'px';
        div.className = 'page-node';
        div.textContent = node.title;
        div.onclick = () => openPage(node.id);
        treeDiv.appendChild(div);
        if (node.children) node.children.forEach(child => renderNode(child, depth+1));
    }
    pages.forEach(p => renderNode(p));
}

function openPage(id) {
    currentPageId = id;
    const page = findPageById(id);
    document.getElementById('page-view').innerHTML = renderMarkdown(page.content);
    document.getElementById('modal-page-title').value = page.title;
    document.getElementById('modal-page-content').value = page.content;
    renderBacklinks(id);
}

function findPageById(id, nodes=pages) {
    for (let node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findPageById(id, node.children);
            if (found) return found;
        }
    }
    return null;
}

function renderBacklinks(id) {
    let backlinks = [];
    function searchLinks(nodes) {
        for (let node of nodes) {
            if (node.content && node.content.includes(`[${findPageById(id).title}]`)) {
                backlinks.push(node.title);
            }
            if (node.children) searchLinks(node.children);
        }
    }
    searchLinks(pages);
    document.getElementById('backlinks').innerHTML = backlinks.length ?
        `<b>Backlinks:</b> ${backlinks.join(', ')}` : '';
}

function renderMarkdown(md) {
    // Simple markdown renderer: bold, italics, links, lists
    if (!md) return '';
    let html = md
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.+?)\*/g, '<i>$1</i>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\[(.+?)\]/g, '<span class="wikilink">$1</span>');
    return html;
}

document.getElementById('add-page-btn').onclick = function() {
    showModal('', '', null);
};

document.getElementById('edit-page-btn').onclick = function() {
    if (!currentPageId) return;
    const page = findPageById(currentPageId);
    showModal(page.title, page.content, currentPageId);
};

document.getElementById('save-page-btn').onclick = function() {
    const title = document.getElementById('modal-page-title').value.trim();
    const content = document.getElementById('modal-page-content').value;
    if (!title) {
        alert('Title required');
        return;
    }
    if (currentPageId) {
        // Edit existing
        const page = findPageById(currentPageId);
        page.title = title;
        page.content = content;
    } else {
        // Add new
        const newPage = {
            id: 'page-' + Date.now(),
            title,
            content,
            children: []
        };
        pages.push(newPage);
        currentPageId = newPage.id;
    }
    localStorage.setItem('wiki-pages', JSON.stringify(pages));
    renderPageTree();
    openPage(currentPageId);
    closeModal();
};

document.getElementById('close-modal-btn').onclick = closeModal;

function showModal(title, content, id) {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal-page-title').value = title;
    document.getElementById('modal-page-content').value = content;
    currentPageId = id;
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

document.getElementById('search-input').oninput = function() {
    const q = this.value.toLowerCase();
    let results = [];
    function search(nodes) {
        for (let node of nodes) {
            if (node.title.toLowerCase().includes(q) || (node.content && node.content.toLowerCase().includes(q))) {
                results.push(node);
            }
            if (node.children) search(node.children);
        }
    }
    search(pages);
    const treeDiv = document.getElementById('page-tree');
    treeDiv.innerHTML = '';
    results.forEach(p => {
        const div = document.createElement('div');
        div.className = 'page-node';
        div.textContent = p.title;
        div.onclick = () => openPage(p.id);
        treeDiv.appendChild(div);
    });
};

document.getElementById('export-md-btn').onclick = function() {
    if (!currentPageId) return;
    const page = findPageById(currentPageId);
    const blob = new Blob([page.content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = page.title + '.md';
    link.click();
};

document.getElementById('export-json-btn').onclick = function() {
    const blob = new Blob([JSON.stringify(pages, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wiki-pages.json';
    link.click();
};

renderPageTree();