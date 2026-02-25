// Quantum Memory Map Logic
// Visualize memories as quantum states, entangle and collapse them

const svg = d3.select('#quantum-map');
const width = +svg.attr('width');
const height = +svg.attr('height');

let memories = [];
let links = [];
let selected = [];

function render() {
    svg.selectAll('*').remove();
    // Draw links
    svg.selectAll('.entangled-link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'entangled-link')
        .attr('x1', d => memories[d.source].x)
        .attr('y1', d => memories[d.source].y)
        .attr('x2', d => memories[d.target].x)
        .attr('y2', d => memories[d.target].y);
    // Draw nodes
    svg.selectAll('.memory-node')
        .data(memories)
        .enter()
        .append('circle')
        .attr('class', d => selected.includes(d.id) ? 'memory-node selected' : 'memory-node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 28)
        .on('click', (event, d) => {
            if (selected.includes(d.id)) {
                selected = selected.filter(id => id !== d.id);
            } else {
                selected.push(d.id);
            }
            render();
        });
    // Draw labels
    svg.selectAll('.memory-label')
        .data(memories)
        .enter()
        .append('text')
        .attr('class', 'memory-label')
        .attr('x', d => d.x)
        .attr('y', d => d.y + 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '15px')
        .text(d => d.text);
}

function addMemory(text) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = 180 + Math.random() * 120;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius;
    const id = memories.length;
    memories.push({ id, text, x, y });
    render();
}

document.getElementById('add-memory').onclick = () => {
    const val = document.getElementById('memory-input').value.trim();
    if (val) {
        addMemory(val);
        document.getElementById('memory-input').value = '';
    }
};

document.getElementById('entangle').onclick = () => {
    if (selected.length < 2) return;
    for (let i = 0; i < selected.length - 1; i++) {
        links.push({ source: selected[i], target: selected[i + 1] });
    }
    selected = [];
    render();
};

document.getElementById('collapse').onclick = () => {
    if (selected.length === 0) return;
    memories = memories.filter(m => !selected.includes(m.id));
    links = links.filter(l => !selected.includes(l.source) && !selected.includes(l.target));
    selected = [];
    render();
};

render();
