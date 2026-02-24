// app.js - Interactive Story Builder
// Story data structure: { nodes: { [id]: { id, title, text, image, audio, choices: [{ text, targetId }] } }, startId }
let story = { nodes: {}, startId: null };
let editingNodeId = null;

const nodeForm = document.getElementById('node-form');
const nodeTitle = document.getElementById('node-title');
const nodeText = document.getElementById('node-text');
const nodeImage = document.getElementById('node-image');
const nodeAudio = document.getElementById('node-audio');
const choicesList = document.getElementById('choices-list');
const addChoiceBtn = document.getElementById('add-choice');
const nodesList = document.getElementById('nodes-list');
const exportBtn = document.getElementById('export-story');
const importInput = document.getElementById('import-story');
const storyView = document.getElementById('story-view');

function resetForm() {
    nodeForm.reset();
    choicesList.innerHTML = '';
    editingNodeId = null;
}

function renderNodesList() {
    nodesList.innerHTML = '';
    Object.values(story.nodes).forEach(node => {
        const div = document.createElement('div');
        div.textContent = node.title + ' (ID: ' + node.id + ')';
        div.style.cursor = 'pointer';
        div.onclick = () => loadNodeForEdit(node.id);
        nodesList.appendChild(div);
    });
}

function loadNodeForEdit(id) {
    const node = story.nodes[id];
    if (!node) return;
    editingNodeId = id;
    nodeTitle.value = node.title;
    nodeText.value = node.text;
    choicesList.innerHTML = '';
    node.choices.forEach(choice => addChoice(choice.text, choice.targetId));
}

function addChoice(text = '', targetId = '') {
    const div = document.createElement('div');
    div.className = 'choice-item';
    const inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.placeholder = 'Choice text';
    inputText.value = text;
    const inputTarget = document.createElement('input');
    inputTarget.type = 'text';
    inputTarget.placeholder = 'Target node ID';
    inputTarget.value = targetId;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => div.remove();
    div.appendChild(inputText);
    div.appendChild(inputTarget);
    div.appendChild(removeBtn);
    choicesList.appendChild(div);
}

addChoiceBtn.onclick = () => addChoice();

nodeForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = editingNodeId || 'node-' + Date.now();
    const title = nodeTitle.value.trim();
    const text = nodeText.value.trim();
    let image = '';
    let audio = '';
    if (nodeImage.files[0]) image = await fileToDataURL(nodeImage.files[0]);
    if (nodeAudio.files[0]) audio = await fileToDataURL(nodeAudio.files[0]);
    const choices = Array.from(choicesList.children).map(div => {
        const [inputText, inputTarget] = div.querySelectorAll('input');
        return { text: inputText.value, targetId: inputTarget.value };
    });
    story.nodes[id] = { id, title, text, image, audio, choices };
    if (!story.startId) story.startId = id;
    resetForm();
    renderNodesList();
};

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

exportBtn.onclick = () => {
    const data = JSON.stringify(story, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'story.json';
    link.click();
};

importInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
        story = JSON.parse(text);
        renderNodesList();
        alert('Story imported!');
    } catch {
        alert('Invalid story file.');
    }
};

// Reader Section
function renderStoryNode(id) {
    const node = story.nodes[id];
    if (!node) {
        storyView.innerHTML = '<p>End of story or node not found.</p>';
        return;
    }
    let html = `<div class="story-node-title">${node.title}</div>`;
    html += `<div class="story-node-text">${node.text}</div>`;
    if (node.image) html += `<img class="story-node-image" src="${node.image}" alt="Story image">`;
    if (node.audio) html += `<audio class="story-node-audio" controls src="${node.audio}"></audio>`;
    node.choices.forEach(choice => {
        html += `<button class="story-choice-btn" onclick="window.goToNode('${choice.targetId}')">${choice.text}</button>`;
    });
    storyView.innerHTML = html;
}

window.goToNode = function(id) {
    renderStoryNode(id);
};

// Start reading from startId
function startReading() {
    if (story.startId) renderStoryNode(story.startId);
    else storyView.innerHTML = '<p>No story to read yet.</p>';
}

renderNodesList();
startReading();
