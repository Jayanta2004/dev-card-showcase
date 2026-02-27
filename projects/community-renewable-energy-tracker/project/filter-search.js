// Filter & Search Projects
const projects = JSON.parse(localStorage.getItem('communityProjects') || '[]');
const filteredProjectsList = document.getElementById('filtered-projects-list');
const searchKeyword = document.getElementById('search-keyword');
const filterLocation = document.getElementById('filter-location');
const filterProgress = document.getElementById('filter-progress');

function filterProjects() {
    let keyword = searchKeyword.value.trim().toLowerCase();
    let location = filterLocation.value.trim().toLowerCase();
    let progressRange = filterProgress.value;
    let filtered = projects.filter(project => {
        let matchesKeyword = !keyword || project.name.toLowerCase().includes(keyword) || project.description.toLowerCase().includes(keyword);
        let matchesLocation = !location || project.location.toLowerCase().includes(location);
        let matchesProgress = true;
        if (progressRange) {
            let [min, max] = progressRange.split('-').map(Number);
            matchesProgress = project.progress >= min && project.progress <= max;
        }
        return matchesKeyword && matchesLocation && matchesProgress;
    });
    renderFilteredProjects(filtered);
}

function renderFilteredProjects(projects) {
    filteredProjectsList.innerHTML = '';
    if (projects.length === 0) {
        filteredProjectsList.innerHTML = '<p>No projects match your criteria.</p>';
        return;
    }
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <h3>${project.name}</h3>
            <p><strong>Location:</strong> ${project.location}</p>
            <p>${project.description}</p>
            <div class="progress-bar">
                <div class="progress-bar-inner" style="width: ${project.progress}%">${project.progress}%</div>
            </div>
        `;
        filteredProjectsList.appendChild(card);
    });
}

searchKeyword.addEventListener('input', filterProjects);
filterLocation.addEventListener('input', filterProjects);
filterProgress.addEventListener('change', filterProjects);

// Initial render
filterProjects();
