// Skill Growth Tree
// Author: EWOC Contributors
// Description: Visualizes users’ skill development as a growing tree, with branches for each new skill.

const form = document.getElementById('skillForm');
const confirmation = document.getElementById('confirmation');
const treeDiv = document.getElementById('tree');
const parentSelect = document.getElementById('parent');

const STORAGE_KEY = 'skillGrowthTree';

function getSkills() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveSkills(skills) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
}

function renderParentOptions() {
    const skills = getSkills();
    parentSelect.innerHTML = '<option value="">None (root skill)</option>' +
        skills.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');
}

function buildTree(skills) {
    const map = {};
    skills.forEach(s => map[s.name] = { ...s, children: [] });
    const roots = [];
    skills.forEach(s => {
        if (s.parent) {
            if (map[s.parent]) map[s.parent].children.push(map[s.name]);
        } else {
            roots.push(map[s.name]);
        }
    });
    return roots;
}

function renderTree() {
    const skills = getSkills();
    if (!skills.length) {
        treeDiv.innerHTML = '<em>No skills added yet.</em>';
        return;
    }
    const roots = buildTree(skills);
    treeDiv.innerHTML = roots.map(renderNode).join('');
}

function renderNode(node) {
    return `<div class="skill-node">${escapeHtml(node.name)}</div>` +
        (node.children.length ? `<div class="skill-children">${node.children.map(renderNode).join('')}</div>` : '');
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = form.skill.value.trim();
    const parent = form.parent.value;
    if (!name) return;
    const skills = getSkills();
    if (skills.some(s => s.name === name)) {
        confirmation.textContent = 'Skill already exists!';
        confirmation.classList.remove('hidden');
        setTimeout(() => confirmation.classList.add('hidden'), 2000);
        return;
    }
    skills.push({ name, parent: parent || null });
    saveSkills(skills);
    confirmation.textContent = 'Skill added!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderParentOptions();
    renderTree();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderParentOptions();
renderTree();
