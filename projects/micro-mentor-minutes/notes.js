// Quick note sharing logic
const notesForm = document.getElementById('notesForm');
const notesList = document.getElementById('notesList');

notesForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const mentor = notesForm.mentor.value;
    const notes = notesForm.notes.value;
    const entry = { mentor, notes };
    let notesArr = JSON.parse(localStorage.getItem('microMentorNotes') || '[]');
    notesArr.push(entry);
    localStorage.setItem('microMentorNotes', JSON.stringify(notesArr));
    showNotes(notesArr);
    notesForm.reset();
});

function showNotes(notesArr) {
    if (notesArr.length === 0) {
        notesList.innerHTML = '<p>No notes yet.</p>';
        return;
    }
    notesList.innerHTML = '<ul>' + notesArr.map(n => `<li><strong>${n.mentor}</strong>: ${n.notes}</li>`).join('') + '</ul>';
}

window.onload = function() {
    const notesArr = JSON.parse(localStorage.getItem('microMentorNotes') || '[]');
    showNotes(notesArr);
};