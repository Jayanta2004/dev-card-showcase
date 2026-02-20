document.getElementById('summaryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value.trim();
    const notes = document.getElementById('bookNotes').value.trim();
    if (!title && !notes) return;

    // Simple summary generation logic (placeholder)
    const summaryData = generateSummary(title, notes);
    renderSummary(summaryData);
});

function generateSummary(title, notes) {
    // For demo: split notes into sentences, use as mind map/timeline/infographic
    let sentences = notes ? notes.split(/[.!?]\s+/).filter(Boolean) : [];
    if (sentences.length === 0 && title) sentences = [title];
    return {
        title,
        mindmap: sentences.slice(0, 5),
        timeline: sentences.slice(0, 5).map((s, i) => ({ event: s, time: `Step ${i+1}` })),
        infographic: sentences.slice(0, 5).map((s, i) => ({ label: `Point ${i+1}`, value: s }))
    };
}

function renderSummary(data) {
    const output = document.getElementById('summaryOutput');
    output.innerHTML = '';
    if (!data) return;

    // Mind Map
    const mindmapDiv = document.createElement('div');
    mindmapDiv.className = 'mindmap';
    mindmapDiv.innerHTML = `<h2>Mind Map</h2>` +
        data.mindmap.map(node => `<div class="mindmap-node">${node}</div>`).join('');
    output.appendChild(mindmapDiv);

    // Timeline
    const timelineDiv = document.createElement('div');
    timelineDiv.className = 'timeline';
    timelineDiv.innerHTML = `<h2>Timeline</h2>` +
        data.timeline.map(ev => `<div class="timeline-event"><strong>${ev.time}:</strong> ${ev.event}</div>`).join('');
    output.appendChild(timelineDiv);

    // Infographic
    const infographicDiv = document.createElement('div');
    infographicDiv.className = 'infographic';
    infographicDiv.innerHTML = `<h2>Infographic</h2>` +
        data.infographic.map(item => `<div class="infographic-item"><strong>${item.label}</strong><br>${item.value}</div>`).join('');
    output.appendChild(infographicDiv);
}
