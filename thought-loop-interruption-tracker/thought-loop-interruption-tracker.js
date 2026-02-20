const thoughtForm = document.getElementById('thought-form');
const thoughtListDiv = document.getElementById('thought-list');
const frequencyHeatmapDiv = document.getElementById('frequency-heatmap');
const cbtPromptsDiv = document.getElementById('cbt-prompts');

let thoughts = [];

const cbtPrompts = [
    {
        title: "Challenge the Thought",
        prompt: "Is this thought based on facts or assumptions? What evidence supports or contradicts it?"
    },
    {
        title: "Reframe the Perspective",
        prompt: "How would you view this situation if it happened to a friend? What alternative explanations exist?"
    },
    {
        title: "Focus on the Present",
        prompt: "What can you observe right now with your senses? How does this thought serve you in this moment?"
    },
    {
        title: "Practice Self-Compassion",
        prompt: "Would you speak to a loved one this way? What would you say to comfort yourself instead?"
    }
];

function renderThoughts() {
    thoughtListDiv.innerHTML = '';
    thoughts.forEach((thought, idx) => {
        const entry = document.createElement('div');
        entry.className = 'thought-entry';
        const tagsHtml = thought.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        entry.innerHTML = `
            <div class="description">${thought.description}</div>
            <div class="meta">
                <div class="tags">${tagsHtml}</div>
                <div>Intensity: <span class="intensity">${thought.intensity}/10</span> | ${new Date(thought.timestamp).toLocaleDateString()}</div>
            </div>
        `;
        thoughtListDiv.appendChild(entry);
    });
}

function renderHeatmap() {
    const tagCounts = {};
    thoughts.forEach(thought => {
        thought.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 7); // Top 7 tags

    frequencyHeatmapDiv.innerHTML = '<h3>Tag Frequency Heatmap</h3>';
    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    sortedTags.forEach(([tag, count]) => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell active';
        cell.style.opacity = Math.min(count / 10, 1); // Scale opacity
        cell.textContent = `${tag}: ${count}`;
        grid.appendChild(cell);
    });

    frequencyHeatmapDiv.appendChild(grid);
}

function renderCBTPrompts() {
    cbtPromptsDiv.innerHTML = '<h3>CBT-Style Interruption Prompts</h3>';
    cbtPrompts.forEach(prompt => {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'cbt-prompt';
        promptDiv.innerHTML = `
            <h3>${prompt.title}</h3>
            <p>${prompt.prompt}</p>
        `;
        cbtPromptsDiv.appendChild(promptDiv);
    });
}

function saveThoughts() {
    localStorage.setItem('tlt_thoughts', JSON.stringify(thoughts));
}

function loadThoughts() {
    const t = localStorage.getItem('tlt_thoughts');
    if (t) thoughts = JSON.parse(t);
}

thoughtForm.addEventListener('submit', e => {
    e.preventDefault();
    const description = document.getElementById('thought-description').value.trim();
    const tagsInput = document.getElementById('tags').value.trim();
    const intensity = parseInt(document.getElementById('intensity').value) || 5;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    if (description) {
        thoughts.push({
            description,
            tags,
            intensity,
            timestamp: new Date().toISOString()
        });
        renderThoughts();
        renderHeatmap();
        saveThoughts();
        thoughtForm.reset();
    }
});

// Initial load
loadThoughts();
renderThoughts();
renderHeatmap();
renderCBTPrompts();