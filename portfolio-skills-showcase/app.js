// Portfolio & Skills Showcase
let profile = JSON.parse(localStorage.getItem('profile') || '{}');
let projects = JSON.parse(localStorage.getItem('projects') || '[]');
let skills = JSON.parse(localStorage.getItem('skills') || '[]');
let certs = JSON.parse(localStorage.getItem('certs') || '[]');
let achievements = JSON.parse(localStorage.getItem('achievements') || '[]');

function renderProfile() {
    document.getElementById('name-input').value = profile.name || '';
    document.getElementById('title-input').value = profile.title || '';
    document.getElementById('bio-input').value = profile.bio || '';
    document.getElementById('social-links-input').value = (profile.socialLinks || []).join(', ');
}

document.getElementById('save-profile-btn').onclick = function() {
    profile = {
        name: document.getElementById('name-input').value.trim(),
        title: document.getElementById('title-input').value.trim(),
        bio: document.getElementById('bio-input').value.trim(),
        socialLinks: document.getElementById('social-links-input').value.split(',').map(l => l.trim()).filter(l => l)
    };
    localStorage.setItem('profile', JSON.stringify(profile));
};

function renderProjects() {
    const projDiv = document.getElementById('projects');
    projDiv.innerHTML = '';
    projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';
        if (p.img) card.innerHTML += `<img src="${p.img}" alt="Project">`;
        card.innerHTML += `<b>${p.title}</b><br><small>${p.desc}</small><br>`;
        if (p.link) card.innerHTML += `<a href="${p.link}" target="_blank">View Project</a>`;
        projDiv.appendChild(card);
    });
}

document.getElementById('add-project-btn').onclick = function() {
    const title = document.getElementById('project-title-input').value.trim();
    const desc = document.getElementById('project-desc-input').value.trim();
    const link = document.getElementById('project-link-input').value.trim();
    const imgInput = document.getElementById('project-img-input');
    if (!title || !desc) {
        alert('Please fill all required fields.');
        return;
    }
    let img = '';
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img = e.target.result;
            addProject({ title, desc, link, img });
        };
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        addProject({ title, desc, link, img: '' });
    }
};

function addProject(project) {
    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));
    renderProjects();
}

function renderSkills() {
    const skillsDiv = document.getElementById('skills');
    skillsDiv.innerHTML = '';
    skills.forEach(s => {
        const bar = document.createElement('div');
        bar.innerHTML = `<b>${s.name}</b><div class="skill-bar"><div class="skill-progress" style="width:${s.level}%"></div></div><small>${s.level}%</small>`;
        skillsDiv.appendChild(bar);
    });
}

document.getElementById('add-skill-btn').onclick = function() {
    const name = document.getElementById('skill-input').value.trim();
    const level = parseInt(document.getElementById('skill-level-input').value);
    if (!name || isNaN(level)) {
        alert('Please fill all required fields.');
        return;
    }
    skills.push({ name, level });
    localStorage.setItem('skills', JSON.stringify(skills));
    renderSkills();
};

function renderCerts() {
    const certsDiv = document.getElementById('certs');
    certsDiv.innerHTML = '';
    certs.forEach(c => {
        const card = document.createElement('div');
        card.className = 'cert-card';
        card.innerHTML = `<b>${c.title}</b><br><small>${c.org}</small><br><small>${c.date}</small>`;
        certsDiv.appendChild(card);
    });
}

document.getElementById('add-cert-btn').onclick = function() {
    const title = document.getElementById('cert-title-input').value.trim();
    const org = document.getElementById('cert-org-input').value.trim();
    const date = document.getElementById('cert-date-input').value;
    if (!title || !org || !date) {
        alert('Please fill all required fields.');
        return;
    }
    certs.push({ title, org, date });
    localStorage.setItem('certs', JSON.stringify(certs));
    renderCerts();
};

function renderAchievements() {
    const achDiv = document.getElementById('achievements-list');
    achDiv.innerHTML = '';
    achievements.forEach(a => {
        const card = document.createElement('div');
        card.className = 'achievement-card';
        card.innerHTML = `<b>${a}</b>`;
        achDiv.appendChild(card);
    });
}

document.getElementById('add-achievement-btn').onclick = function() {
    const ach = document.getElementById('achievement-input').value.trim();
    if (!ach) {
        alert('Please enter an achievement.');
        return;
    }
    achievements.push(ach);
    localStorage.setItem('achievements', JSON.stringify(achievements));
    renderAchievements();
};

document.getElementById('download-resume-btn').onclick = function() {
    alert('PDF download is a placeholder. Use browser print to PDF for now.');
};

renderProfile();
renderProjects();
renderSkills();
renderCerts();
renderAchievements();