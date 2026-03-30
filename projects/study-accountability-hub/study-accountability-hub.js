// study-accountability-hub.js
// Study Accountability Hub logic

document.addEventListener('DOMContentLoaded', function() {
    // Goals
    const goalForm = document.getElementById('goal-form');
    const goalInput = document.getElementById('goal-input');
    const goalList = document.getElementById('goal-list');
    let goals = [];

    goalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const goal = goalInput.value.trim();
        if (goal) {
            goals.push({ text: goal, completed: false });
            goalInput.value = '';
            renderGoals();
        }
    });

    function renderGoals() {
        goalList.innerHTML = goals.map((g, idx) => `
            <li>
                <input type="checkbox" ${g.completed ? 'checked' : ''} data-idx="${idx}">
                <span style="${g.completed ? 'text-decoration:line-through;' : ''}">${g.text}</span>
            </li>
        `).join('');
        goalList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.onclick = function() {
                const idx = parseInt(cb.getAttribute('data-idx'));
                goals[idx].completed = cb.checked;
                renderGoals();
            };
        });
    }

    // Groups
    const groupForm = document.getElementById('group-form');
    const groupInput = document.getElementById('group-input');
    const groupList = document.getElementById('group-list');
    let groups = [];

    groupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const group = groupInput.value.trim();
        if (group && !groups.includes(group)) {
            groups.push(group);
            groupInput.value = '';
            renderGroups();
        }
    });

    function renderGroups() {
        groupList.innerHTML = groups.map(g => `<li>${g}</li>`).join('');
    }

    // Streak
    const streakOutput = document.getElementById('streak-output');
    const markCompleteBtn = document.getElementById('mark-complete');
    let streak = 0;
    let streakDates = [];

    markCompleteBtn.addEventListener('click', function() {
        const today = new Date().toISOString().slice(0,10);
        if (!streakDates.includes(today)) {
            streakDates.push(today);
            streak++;
            streakOutput.textContent = streak + ' days';
            renderSummary();
        }
    });

    // Weekly Progress Summary
    const summaryOutput = document.getElementById('summary-output');
    function renderSummary() {
        const weekDates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            weekDates.push(d.toISOString().slice(0,10));
        }
        const completedDays = weekDates.filter(d => streakDates.includes(d)).length;
        summaryOutput.innerHTML = `<strong>${completedDays}/7 days completed this week.</strong>`;
    }

    // Initial render
    renderGoals();
    renderGroups();
    renderSummary();
});
