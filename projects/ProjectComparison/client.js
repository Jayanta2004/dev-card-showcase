// Project Comparison Tool client logic
const projects = [
    { name: 'Project A', stars: 1200, forks: 300, contributors: 15, tech: ['React', 'Node.js'], difficulty: 3, features: ['Auth', 'API', 'Docs'], performance: 8, community: 7, learning: 2, time: 40 },
    { name: 'Project B', stars: 800, forks: 150, contributors: 10, tech: ['Vue', 'Firebase'], difficulty: 2, features: ['Auth', 'Docs'], performance: 7, community: 8, learning: 3, time: 30 },
    { name: 'Project C', stars: 1500, forks: 500, contributors: 25, tech: ['Angular', 'Express'], difficulty: 4, features: ['Auth', 'API', 'Docs', 'Chat'], performance: 9, community: 9, learning: 4, time: 60 }
];
const metrics = ['Stars', 'Forks', 'Contributors', 'Tech Stack', 'Difficulty', 'Performance', 'Community', 'Learning Difficulty', 'Time Investment'];
const featureList = ['Auth', 'API', 'Docs', 'Chat'];

// Populate selects
function populateSelects() {
    ['projectSelect1','projectSelect2','projectSelect3'].forEach((id,i) => {
        const select = document.getElementById(id);
        select.innerHTML = '';
        projects.forEach((p, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = p.name;
            select.appendChild(opt);
        });
        select.selectedIndex = i;
    });
}
window.onload = populateSelects;

// Compare
const compareBtn = document.getElementById('compareBtn');
compareBtn.addEventListener('click', () => {
    const idx1 = +document.getElementById('projectSelect1').value;
    const idx2 = +document.getElementById('projectSelect2').value;
    const idx3 = +document.getElementById('projectSelect3').value;
    renderComparison([projects[idx1], projects[idx2], projects[idx3]]);
});

function renderComparison(selected) {
    // Matrix
    const tbody = document.getElementById('comparisonTable').querySelector('tbody');
    tbody.innerHTML = '';
    metrics.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${m}</td>` + selected.map(p => {
            if (m === 'Tech Stack') return `<td>${p.tech.join(', ')}</td>`;
            if (m === 'Difficulty') return `<td>${'★'.repeat(p.difficulty)}</td>`;
            if (m === 'Performance') return `<td>${p.performance}/10</td>`;
            if (m === 'Community') return `<td>${p.community}/10</td>`;
            if (m === 'Learning Difficulty') return `<td>${'★'.repeat(p.learning)}</td>`;
            if (m === 'Time Investment') return `<td>${p.time} hrs</td>`;
            return `<td>${p[m.toLowerCase()]}</td>`;
        }).join('');
        tbody.appendChild(tr);
    });
    // Charts
    renderCharts(selected);
    // Features
    renderFeatures(selected);
    // Winner badges
    renderWinnerBadges(selected);
}

function renderCharts(selected) {
    // Radar
    const radarCtx = document.getElementById('radarChart').getContext('2d');
    new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Performance','Community','Difficulty','Learning Difficulty'],
            datasets: selected.map((p,i) => ({
                label: p.name,
                data: [p.performance,p.community,p.difficulty,p.learning],
                backgroundColor: `rgba(${100+i*50},${200-i*50},255,0.2)`
            }))
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
    // Bar
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Stars','Forks','Contributors'],
            datasets: selected.map((p,i) => ({
                label: p.name,
                data: [p.stars,p.forks,p.contributors],
                backgroundColor: `rgba(${100+i*50},${200-i*50},255,0.6)`
            }))
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

function renderFeatures(selected) {
    const div = document.getElementById('featureChecklist');
    div.innerHTML = '';
    featureList.forEach(f => {
        const row = document.createElement('div');
        row.innerHTML = `<b>${f}:</b> ` + selected.map(p => p.features.includes(f) ? '✔️' : '❌').join(' | ');
        div.appendChild(row);
    });
}

function renderWinnerBadges(selected) {
    const div = document.getElementById('winnerBadges');
    div.innerHTML = '';
    // Example: most stars, best performance
    const mostStars = selected.reduce((a,b) => a.stars > b.stars ? a : b);
    const bestPerf = selected.reduce((a,b) => a.performance > b.performance ? a : b);
    div.innerHTML += `<span class="badge">Most Stars: ${mostStars.name}</span>`;
    div.innerHTML += `<span class="badge">Best Performance: ${bestPerf.name}</span>`;
}

// Export, Share, Save (stubs)
document.getElementById('exportBtn').addEventListener('click', () => {
    alert('Exported as PDF/Image!');
});
document.getElementById('shareBtn').addEventListener('click', () => {
    alert('Shareable link copied!');
});
document.getElementById('saveBtn').addEventListener('click', () => {
    alert('Comparison saved!');
});
