// Smart Resume Builder Platform - script.js
// Core logic: form handling, AI suggestions (mock), real-time preview, export

const form = document.getElementById('resume-form');
const preview = document.getElementById('preview');
const skillsList = document.getElementById('skills-list');
const achieveList = document.getElementById('achieve-list');

// Add skill
const skillInput = document.getElementById('skill-input');
document.getElementById('add-skill').onclick = () => {
    if (skillInput.value.trim()) {
        const li = document.createElement('li');
        li.textContent = skillInput.value.trim();
        li.tabIndex = 0;
        li.setAttribute('role', 'listitem');
        li.onclick = () => li.remove();
        li.onkeydown = e => { if (e.key === 'Delete' || e.key === 'Backspace') li.remove(); };
        skillsList.appendChild(li);
        skillInput.value = '';
        updatePreview();
    }
};

// Add achievement
const achieveInput = document.getElementById('achieve-input');
document.getElementById('add-achieve').onclick = () => {
    if (achieveInput.value.trim()) {
        const li = document.createElement('li');
        li.textContent = achieveInput.value.trim();
        li.tabIndex = 0;
        li.setAttribute('role', 'listitem');
        li.onclick = () => li.remove();
        li.onkeydown = e => { if (e.key === 'Delete' || e.key === 'Backspace') li.remove(); };
        achieveList.appendChild(li);
        achieveInput.value = '';
        updatePreview();
    }
};

// AI-powered suggestions (mock)
document.getElementById('ai-skill-btn').onclick = () => {
    const aiSkills = ['Teamwork', 'Problem Solving', 'Leadership', 'Time Management'];
    aiSkills.forEach(skill => {
        if (![...skillsList.children].some(li => li.textContent === skill)) {
            const li = document.createElement('li');
            li.textContent = skill;
            li.tabIndex = 0;
            li.setAttribute('role', 'listitem');
            li.onclick = () => li.remove();
            li.onkeydown = e => { if (e.key === 'Delete' || e.key === 'Backspace') li.remove(); };
            skillsList.appendChild(li);
        }
    });
    updatePreview();
};
document.getElementById('ai-achieve-btn').onclick = () => {
    const aiAchieves = ['Increased sales by 20%', 'Reduced costs by 15%', 'Awarded Employee of the Month'];
    aiAchieves.forEach(ach => {
        if (![...achieveList.children].some(li => li.textContent === ach)) {
            const li = document.createElement('li');
            li.textContent = ach;
            li.tabIndex = 0;
            li.setAttribute('role', 'listitem');
            li.onclick = () => li.remove();
            li.onkeydown = e => { if (e.key === 'Delete' || e.key === 'Backspace') li.remove(); };
            achieveList.appendChild(li);
        }
    });
    updatePreview();
};

// Real-time preview
form.oninput = updatePreview;
form.onchange = updatePreview;

function updatePreview() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const summary = document.getElementById('summary').value;
    const experience = document.getElementById('experience').value;
    const education = document.getElementById('education').value;
    const template = document.getElementById('template-select').value;
    const skills = [...skillsList.children].map(li => li.textContent);
    const achieves = [...achieveList.children].map(li => li.textContent);
    let html = `<div class="resume ${template}">`;
    html += `<h2>${name || 'Your Name'}</h2>`;
    html += `<div><b>Email:</b> ${email || '-'}</div>`;
    html += `<div><b>Phone:</b> ${phone || '-'}</div>`;
    html += `<h3>Professional Summary</h3><p>${summary || ''}</p>`;
    if (skills.length) html += `<h3>Skills</h3><ul>${skills.map(s=>`<li>${s}</li>`).join('')}</ul>`;
    if (achieves.length) html += `<h3>Achievements</h3><ul>${achieves.map(a=>`<li>${a}</li>`).join('')}</ul>`;
    html += `<h3>Experience</h3><p>${experience || ''}</p>`;
    html += `<h3>Education</h3><p>${education || ''}</p>`;
    html += `</div>`;
    preview.innerHTML = html;
}

// Export PDF (simple print for demo)
document.getElementById('export-btn').onclick = () => {
    window.print();
};

// Initial preview
updatePreview();
