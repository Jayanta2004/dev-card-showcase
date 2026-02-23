// Community Renewable Energy Tracker
const projectForm = document.getElementById('project-form');
const projectsList = document.getElementById('projects-list');

let projects = JSON.parse(localStorage.getItem('communityProjects') || '[]');

function renderProjects() {
    projectsList.innerHTML = '';
    if (projects.length === 0) {
        projectsList.innerHTML = '<p>No projects submitted yet. Be the first to add one!</p>';
        return;
    }
    projects.forEach((project, idx) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <h3>${project.name}</h3>
            <p><strong>Location:</strong> ${project.location}</p>
            <p>${project.description}</p>
            <div class="progress-bar">
                <div class="progress-bar-inner" style="width: ${project.progress}%">${project.progress}%</div>
            </div>
            <button onclick="getInvolved(${idx})">Get Involved</button>
        `;
        projectsList.appendChild(card);
    });
}

projectForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('project-name').value.trim();
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();
    const progress = parseInt(document.getElementById('progress').value, 10);
    if (!name || !location || !description || isNaN(progress)) return;
    projects.push({ name, location, description, progress });
    localStorage.setItem('communityProjects', JSON.stringify(projects));
    renderProjects();
    projectForm.reset();
});

window.getInvolved = function(idx) {
    const project = projects[idx];
    alert(`To get involved with "${project.name}", contact your local community or visit the project site!`);
};

renderProjects();
