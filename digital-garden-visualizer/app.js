// Digital Garden Visualizer
const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');
const notes = [];
const themes = {
    spring: { bg: '#e0f7fa', plant: '#81c784', flower: '#ffb6b9' },
    summer: { bg: '#fffde4', plant: '#ffd600', flower: '#ff8a65' },
    autumn: { bg: '#ffe0b2', plant: '#ff7043', flower: '#a1887f' },
    winter: { bg: '#e0eafc', plant: '#90caf9', flower: '#bdbdbd' }
};
let currentTheme = 'spring';

function drawGarden() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = themes[currentTheme].bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw notes as plants
    notes.forEach((note, idx) => {
        // Plant position
        const x = 100 + (idx % 6) * 120;
        const y = 400 - Math.min(note.growth, 300);
        // Stem
        ctx.beginPath();
        ctx.moveTo(x, 500);
        ctx.lineTo(x, y);
        ctx.strokeStyle = themes[currentTheme].plant;
        ctx.lineWidth = 8;
        ctx.stroke();
        // Flower
        ctx.beginPath();
        ctx.arc(x, y - 20, 24, 0, 2 * Math.PI);
        ctx.fillStyle = themes[currentTheme].flower;
        ctx.fill();
        // Title
        ctx.font = 'bold 16px Segoe UI';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(note.title, x, y - 50);
        // Tags
        ctx.font = '12px Segoe UI';
        ctx.fillStyle = '#666';
        ctx.fillText(note.tags.join(', '), x, y - 30);
    });
    // Draw links
    notes.forEach((note, idx) => {
        note.links.forEach(linkTitle => {
            const targetIdx = notes.findIndex(n => n.title === linkTitle);
            if (targetIdx !== -1) {
                const x1 = 100 + (idx % 6) * 120;
                const y1 = 400 - Math.min(note.growth, 300);
                const x2 = 100 + (targetIdx % 6) * 120;
                const y2 = 400 - Math.min(notes[targetIdx].growth, 300);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = '#b2ebf2';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 6]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });
    });
}

function animateGrowth(note) {
    let start = note.growth;
    let end = 300;
    let duration = 1000;
    let startTime = null;
    function animate(time) {
        if (!startTime) startTime = time;
        let progress = Math.min((time - startTime) / duration, 1);
        note.growth = start + (end - start) * progress;
        drawGarden();
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

const addNoteBtn = document.getElementById('add-note-btn');
addNoteBtn.onclick = function() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const tags = document.getElementById('note-tags').value.split(',').map(t => t.trim()).filter(t => t);
    const links = document.getElementById('note-links').value.split(',').map(l => l.trim()).filter(l => l);
    if (!title || !content) {
        alert('Please enter a title and content for your note.');
        return;
    }
    const note = { title, content, tags, links, growth: 0 };
    notes.push(note);
    animateGrowth(note);
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('note-tags').value = '';
    document.getElementById('note-links').value = '';
};

document.getElementById('theme-select').onchange = function() {
    currentTheme = this.value;
    drawGarden();
};

document.getElementById('export-md-btn').onclick = function() {
    let md = '';
    notes.forEach(note => {
        md += `## ${note.title}\n`;
        md += `${note.content}\n`;
        if (note.tags.length) md += `**Tags:** ${note.tags.join(', ')}\n`;
        if (note.links.length) md += `**Links:** ${note.links.join(', ')}\n`;
        md += '\n';
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'digital-garden.md';
    link.click();
};

document.getElementById('export-json-btn').onclick = function() {
    const json = JSON.stringify(notes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'digital-garden.json';
    link.click();
};

drawGarden();