// Follow-up checklist logic
const checklistForm = document.getElementById('checklistForm');
const checklist = document.getElementById('checklist');

checklistForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const mentor = checklistForm.mentor.value;
    const item = checklistForm.item.value;
    const entry = { mentor, item, done: false };
    let items = JSON.parse(localStorage.getItem('microMentorChecklist') || '[]');
    items.push(entry);
    localStorage.setItem('microMentorChecklist', JSON.stringify(items));
    showChecklist(items);
    checklistForm.reset();
});

function showChecklist(items) {
    if (items.length === 0) {
        checklist.innerHTML = '<p>No checklist items yet.</p>';
        return;
    }
    checklist.innerHTML = '<ul>' + items.map((i, idx) => `<li><strong>${i.mentor}</strong>: ${i.item} <input type="checkbox" ${i.done ? 'checked' : ''} onchange="toggleDone(${idx})"></li>`).join('') + '</ul>';
}

window.toggleDone = function(idx) {
    let items = JSON.parse(localStorage.getItem('microMentorChecklist') || '[]');
    items[idx].done = !items[idx].done;
    localStorage.setItem('microMentorChecklist', JSON.stringify(items));
    showChecklist(items);
};

window.onload = function() {
    const items = JSON.parse(localStorage.getItem('microMentorChecklist') || '[]');
    showChecklist(items);
};