// Session scheduling logic
const scheduleForm = document.getElementById('scheduleForm');
const scheduledSessions = document.getElementById('scheduledSessions');

scheduleForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const skill = scheduleForm.skill.value;
    const partner = scheduleForm.partner.value;
    const date = scheduleForm.date.value;
    const time = scheduleForm.time.value;
    const session = { skill, partner, date, time };
    let sessions = JSON.parse(localStorage.getItem('skillSwapSessions') || '[]');
    sessions.push(session);
    localStorage.setItem('skillSwapSessions', JSON.stringify(sessions));
    showSessions(sessions);
    scheduleForm.reset();
});

function showSessions(sessions) {
    if (sessions.length === 0) {
        scheduledSessions.innerHTML = '<p>No sessions scheduled yet.</p>';
        return;
    }
    scheduledSessions.innerHTML = '<ul>' + sessions.map(s => `<li>${s.skill} with ${s.partner} on ${s.date} at ${s.time}</li>`).join('') + '</ul>';
}

window.onload = function() {
    const sessions = JSON.parse(localStorage.getItem('skillSwapSessions') || '[]');
    showSessions(sessions);
};