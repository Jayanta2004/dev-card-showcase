// Interactive Resume Builder - app.js

const resumeForm = document.getElementById('resumeForm');
const resumePreview = document.getElementById('resumePreview');
const exportPDF = document.getElementById('exportPDF');
const exportHTML = document.getElementById('exportHTML');

function renderResume(data) {
    resumePreview.innerHTML = `
        <div class="resume-name">${data.name}</div>
        <div class="resume-title">${data.title}</div>
        <div class="resume-summary">${data.summary}</div>
        <div class="resume-section">
            <h3>Contact</h3>
            <div>${data.contact}</div>
        </div>
        <div class="resume-section">
            <h3>Skills</h3>
            <ul class="resume-list">${data.skills.split(',').map(skill => `<li>${skill.trim()}</li>`).join('')}</ul>
        </div>
        <div class="resume-section">
            <h3>Experience</h3>
            <ul class="resume-list">${data.experience.split('\n').map(exp => `<li>${exp.trim()}</li>`).join('')}</ul>
        </div>
        <div class="resume-section">
            <h3>Education</h3>
            <ul class="resume-list">${data.education.split('\n').map(edu => `<li>${edu.trim()}</li>`).join('')}</ul>
        </div>
    `;
}

resumeForm.onsubmit = function(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value.trim(),
        title: document.getElementById('title').value.trim(),
        summary: document.getElementById('summary').value.trim(),
        contact: document.getElementById('contact').value.trim(),
        skills: document.getElementById('skills').value.trim(),
        experience: document.getElementById('experience').value.trim(),
        education: document.getElementById('education').value.trim(),
    };
    renderResume(data);
};

exportPDF.onclick = function() {
    html2pdf().from(resumePreview).set({
        margin: 0.5,
        filename: 'resume.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).save();
};

exportHTML.onclick = function() {
    const blob = new Blob([resumePreview.innerHTML], {type: 'text/html'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'resume.html';
    link.click();
};

// Demo data for better UI preview
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('name').value = 'Jane Doe';
    document.getElementById('title').value = 'Frontend Developer';
    document.getElementById('summary').value = 'Creative developer with 4+ years of experience building modern web applications.';
    document.getElementById('contact').value = 'jane.doe@email.com | +1 234 567 8901';
    document.getElementById('skills').value = 'JavaScript, React, CSS, HTML, UI/UX, Git';
    document.getElementById('experience').value = 'Frontend Developer at Webify (2022-2026)\nIntern at CodeLab (2021-2022)';
    document.getElementById('education').value = 'B.Sc. Computer Science, Tech University (2018-2022)';
    resumeForm.dispatchEvent(new Event('submit'));
});
