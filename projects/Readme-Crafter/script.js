const draggables = document.querySelectorAll('.component-block');
const dropZone = document.getElementById('dropZone');
const emptyState = document.getElementById('emptyState');
const markdownOutput = document.getElementById('markdownOutput');
const btnClear = document.getElementById('btnClear');
const btnCopy = document.getElementById('btnCopy');

let blocks = []; // State array

// --- Drag and Drop Events ---
draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', draggable.getAttribute('data-type'));
    });
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    const type = e.dataTransfer.getData('text/plain');
    if (type) addBlock(type);
});

// --- Workspace Logic ---
function addBlock(type) {
    emptyState.style.display = 'none';
    
    const id = Date.now().toString();
    const blockEl = document.createElement('div');
    blockEl.className = 'active-block';
    blockEl.id = `block-${id}`;

    // Generate specific inputs based on type
    let title = '';
    let contentHTML = '';

    if (type === 'header') {
        title = 'Header';
        contentHTML = `
            <input type="text" class="input-title" placeholder="Greeting (e.g. Hi there 👋, I'm Alex)">
            <input type="text" class="input-subtitle" placeholder="Subtitle (e.g. Fullstack Developer from NY)">
        `;
    } else if (type === 'about') {
        title = 'About Me';
        contentHTML = `<textarea class="input-text" placeholder="- 🔭 I’m currently working on...\n- 🌱 I’m currently learning..."></textarea>`;
    } else if (type === 'skills') {
        title = 'Tech Stack';
        contentHTML = `<input type="text" class="input-skills" placeholder="Comma separated (e.g. javascript, react, nodejs, python)">`;
    } else if (type === 'stats') {
        title = 'GitHub Stats';
        contentHTML = `<input type="text" class="input-username" placeholder="Your GitHub Username">`;
    } else if (type === 'social') {
        title = 'Social Links';
        contentHTML = `
            <input type="text" class="input-twitter" placeholder="Twitter Username">
            <input type="text" class="input-linkedin" placeholder="LinkedIn Username">
        `;
    }

    blockEl.innerHTML = `
        <div class="block-header">
            <span class="block-title">${title}</span>
            <button class="btn-remove" title="Remove Block">&times;</button>
        </div>
        <div class="block-content">
            ${contentHTML}
        </div>
    `;

    // Add to state
    blocks.push({ id, type, element: blockEl });

    // Listeners for auto-update
    const inputs = blockEl.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updateMarkdown);
    });

    // Remove logic
    blockEl.querySelector('.btn-remove').addEventListener('click', () => {
        blocks = blocks.filter(b => b.id !== id);
        blockEl.remove();
        if (blocks.length === 0) emptyState.style.display = 'block';
        updateMarkdown();
    });

    dropZone.appendChild(blockEl);
    updateMarkdown();
}

// --- Markdown Generation ---
function updateMarkdown() {
    if (blocks.length === 0) {
        markdownOutput.innerText = '';
        return;
    }

    let md = '';

    blocks.forEach(block => {
        const el = block.element;
        
        if (block.type === 'header') {
            const t = el.querySelector('.input-title').value;
            const sub = el.querySelector('.input-subtitle').value;
            if (t) md += `<h1 align="center">${t}</h1>\n`;
            if (sub) md += `<h3 align="center">${sub}</h3>\n`;
            if (t || sub) md += `\n`;
        } 
        
        else if (block.type === 'about') {
            const txt = el.querySelector('.input-text').value;
            if (txt) md += `### 🙋‍♂️ About Me\n${txt}\n\n`;
        } 
        
        else if (block.type === 'skills') {
            const skillsStr = el.querySelector('.input-skills').value;
            if (skillsStr) {
                const skills = skillsStr.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
                md += `### 🛠 Tech Stack\n<p align="left">\n`;
                skills.forEach(skill => {
                    md += `  <img src="https://skillicons.dev/icons?i=${skill}" height="40" alt="${skill}" />\n`;
                });
                md += `</p>\n\n`;
            }
        } 
        
        else if (block.type === 'stats') {
            const user = el.querySelector('.input-username').value;
            if (user) {
                md += `### 📊 GitHub Stats\n`;
                md += `<div align="center">\n`;
                md += `  <img src="https://github-readme-stats.vercel.app/api?username=${user}&show_icons=true&theme=radical" />\n`;
                md += `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${user}&theme=radical" />\n`;
                md += `</div>\n\n`;
            }
        } 
        
        else if (block.type === 'social') {
            const twit = el.querySelector('.input-twitter').value;
            const link = el.querySelector('.input-linkedin').value;
            if (twit || link) {
                md += `### 🌐 Connect with me\n<p align="left">\n`;
                if (twit) md += `  <a href="https://twitter.com/${twit}"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" /></a>\n`;
                if (link) md += `  <a href="https://linkedin.com/in/${link}"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>\n`;
                md += `</p>\n\n`;
            }
        }
    });

    markdownOutput.innerText = md || '';
}

// --- UI Actions ---
btnClear.addEventListener('click', () => {
    blocks = [];
    dropZone.innerHTML = '';
    dropZone.appendChild(emptyState);
    emptyState.style.display = 'block';
    updateMarkdown();
});

btnCopy.addEventListener('click', () => {
    if (blocks.length === 0) return;
    navigator.clipboard.writeText(markdownOutput.innerText).then(() => {
        const ogText = btnCopy.innerText;
        btnCopy.innerText = 'Copied!';
        setTimeout(() => btnCopy.innerText = ogText, 2000);
    });
});