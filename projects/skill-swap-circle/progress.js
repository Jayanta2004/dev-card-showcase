// Progress tracker logic
const progressForm = document.getElementById('progressForm');
const progressList = document.getElementById('progressList');

progressForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const skill = progressForm.skill.value;
    const milestone = progressForm.milestone.value;
    const progress = { skill, milestone };
    let progresses = JSON.parse(localStorage.getItem('skillSwapProgress') || '[]');
    progresses.push(progress);
    localStorage.setItem('skillSwapProgress', JSON.stringify(progresses));
    showProgress(progresses);
    progressForm.reset();
});

function showProgress(progresses) {
    if (progresses.length === 0) {
        progressList.innerHTML = '<p>No progress tracked yet.</p>';
        return;
    }
    progressList.innerHTML = '<ul>' + progresses.map(p => `<li>${p.skill}: ${p.milestone}</li>`).join('') + '</ul>';
}

window.onload = function() {
    const progresses = JSON.parse(localStorage.getItem('skillSwapProgress') || '[]');
    showProgress(progresses);
};