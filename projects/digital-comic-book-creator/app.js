// Digital Comic Book Creator
// Drag-and-drop panels, writing, publishing

const panelsEl = document.getElementById('panels');
const addPanelBtn = document.getElementById('add-panel-btn');
const publishBtn = document.getElementById('publish-btn');
const publishedComicEl = document.getElementById('published-comic');

let panels = [];
let dragSrcIdx = null;

addPanelBtn.onclick = () => {
    panels.push({ text: '' });
    renderPanels();
};

function renderPanels() {
    panelsEl.innerHTML = '';
    panels.forEach((panel, idx) => {
        const div = document.createElement('div');
        div.className = 'panel';
        div.draggable = true;
        div.ondragstart = e => {
            dragSrcIdx = idx;
            div.classList.add('dragging');
        };
        div.ondragend = e => {
            div.classList.remove('dragging');
        };
        div.ondragover = e => {
            e.preventDefault();
        };
        div.ondrop = e => {
            e.preventDefault();
            if (dragSrcIdx !== null && dragSrcIdx !== idx) {
                const temp = panels[dragSrcIdx];
                panels[dragSrcIdx] = panels[idx];
                panels[idx] = temp;
                renderPanels();
            }
        };
        // Panel writing
        const textarea = document.createElement('textarea');
        textarea.value = panel.text;
        textarea.placeholder = 'Write your story...';
        textarea.oninput = e => {
            panels[idx].text = textarea.value;
        };
        div.appendChild(textarea);
        // Panel toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'panel-toolbar';
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            panels.splice(idx, 1);
            renderPanels();
        };
        toolbar.appendChild(deleteBtn);
        div.appendChild(toolbar);
        panelsEl.appendChild(div);
    });
}

publishBtn.onclick = () => {
    publishedComicEl.innerHTML = '';
    panels.forEach(panel => {
        const div = document.createElement('div');
        div.className = 'published-panel';
        const text = document.createElement('div');
        text.className = 'panel-text';
        text.textContent = panel.text;
        div.appendChild(text);
        publishedComicEl.appendChild(div);
    });
};

renderPanels();
